import {
  Attempt,
  AttemptResult,
  DailyActivity,
  FailureReason,
  Goal,
  Profile,
  Question,
  QuestionRecommendation,
  Streak,
  Topic,
  TopicPrerequisite,
  UserTopicMastery,
  XPTransaction,
  DSAExperience,
} from '@/lib/types';
import {
  INITIAL_PREREQUISITES,
  INITIAL_QUESTIONS,
  INITIAL_TOPICS,
} from './mockDb';
import { calculateMasteryChange, clampMastery, getInitialMasteryForExperience } from './masteryService';
import { rankAndRecommendQuestion } from './recommendationService';
import { updateStreakOnPractice, evaluateStreakStatus } from './streakService';
import { calculateAttemptXP } from './xpService';
import { calculateNewRating } from './ratingService';
import { getUserUnresolvedGaps, updateUnresolvedGapsOnAttempt } from './gapService';
import { createClient } from '@/lib/supabase/client';

export async function getTopics(): Promise<Topic[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('topics').select('*');
  if (error || !data || data.length === 0) {
    return INITIAL_TOPICS;
  }
  return data as Topic[];
}

export async function getPrerequisites(): Promise<TopicPrerequisite[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('topic_prerequisites').select('*');
  if (error || !data || data.length === 0) {
    return INITIAL_PREREQUISITES;
  }
  return data as TopicPrerequisite[];
}

export async function getQuestions(): Promise<Question[]> {
  const supabase = createClient();
  const { data, error } = await supabase.from('questions').select('*');
  if (error || !data || data.length === 0) {
    return INITIAL_QUESTIONS;
  }
  return data.map((q) => ({
    ...q,
    concept_tags: q.concept_tags || [],
    secondary_topics: q.secondary_topics || [],
  })) as Question[];
}

export async function initializeUserProfile(email: string, name?: string): Promise<Profile> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'usr_demo_1';
  const userName = name || user?.user_metadata?.name || email.split('@')[0];

  const profile: Profile = {
    id: userId,
    name: userName,
    email,
    avatar_url: null,
    dsa_experience: null,
    available_freezes: 2,
    onboarding_completed: false,
    daily_question_target: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (user) {
    const { error } = await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
    if (error) console.error('[initializeUserProfile] upsert error:', error.message);
  }
  return profile;
}

export async function getUserProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (data) {
    // Normalise missing columns that may not exist on older rows
    return {
      onboarding_completed: false,
      daily_question_target: 5,
      ...data,
    } as Profile;
  }

  return await initializeUserProfile(user.email || 'solver@example.com', user.user_metadata?.name);
}

/**
 * Returns true if the authenticated user has completed onboarding.
 * Derives the answer from either the explicit flag or from dsa_experience
 * being set (handles pre-migration existing users gracefully).
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('profiles')
    .select('onboarding_completed, dsa_experience')
    .eq('id', user.id)
    .maybeSingle();

  if (!data) return false;

  // Explicit flag takes priority; fall back to checking dsa_experience for
  // pre-migration users who never had the column written.
  return data.onboarding_completed === true || data.dsa_experience != null;
}

/**
 * Resets the onboarding_completed flag so the user is redirected back to
 * /onboarding on next navigation. Used by the "Re-run Onboarding" button.
 */
export async function resetOnboarding(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({ onboarding_completed: false, updated_at: new Date().toISOString() })
    .eq('id', user.id);

  if (error) throw new Error(`Failed to reset onboarding: ${error.message}`);
}

export async function completeOnboarding(
  experience: DSAExperience,
  dailyTarget: number,
  durationDays: number,
  selectedTopics?: string[]
): Promise<{ profile: Profile; goal: Goal; mastery: UserTopicMastery[] }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'usr_demo_1';

  // Ensure profile exists before we try to create a goal (FK dependency)
  let profile = await getUserProfile();
  if (!profile) {
    profile = await initializeUserProfile(user?.email || 'demo@example.com');
  }

  const updatedProfile: Profile = {
    ...profile,
    dsa_experience: experience,
    // ── CRITICAL: mark onboarding complete and persist the chosen target ──
    onboarding_completed: true,
    daily_question_target: dailyTarget,
    updated_at: new Date().toISOString(),
  };

  if (user) {
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(updatedProfile, { onConflict: 'id' });
    if (profileError) {
      throw new Error(`Failed to save profile: ${profileError.message}`);
    }
  }

  // Initialize Topic Mastery based on Experience
  // (these scores determine what difficulty the engine recommends)
  const topics = await getTopics();
  const masteryListPayload: UserTopicMastery[] = topics.map((topic) => {
    const initialScore = getInitialMasteryForExperience(experience, topic.id);
    return {
      id: `m_${topic.id}_${userId.slice(0, 8)}`,
      user_id: userId,
      topic_id: topic.id,
      score: initialScore,
      rating: 1000,
      updated_at: new Date().toISOString(),
    };
  });

  if (user) {
    const masteryRows = masteryListPayload.map((m) => ({
      user_id: userId,
      topic_id: m.topic_id,
      score: m.score,
      rating: 1000,
      updated_at: new Date().toISOString(),
    }));
    const { error: masteryError } = await supabase
      .from('user_topic_mastery')
      .upsert(masteryRows, { onConflict: 'user_id,topic_id' });
    if (masteryError) {
      throw new Error(`Failed to initialize mastery: ${masteryError.message}`);
    }
  }

  // Create or update goal using the user-selected daily target & topics
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const totalTarget = dailyTarget * durationDays;
  const topicsPayload = selectedTopics && selectedTopics.length > 0 ? selectedTopics : null;

  const goalPayload = {
    user_id: userId,
    daily_target: dailyTarget,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    total_target: totalTarget,
    total_completed: 0,
    status: 'ACTIVE' as const,
    selected_topics: topicsPayload,
    updated_at: new Date().toISOString(),
  };

  let goal: Goal;
  if (user) {
    const { data: existingGoal } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .maybeSingle();

    if (existingGoal) {
      const { data: updatedG, error: goalUpdateError } = await supabase
        .from('goals')
        .update({
          daily_target: dailyTarget,
          start_date: goalPayload.start_date,
          end_date: goalPayload.end_date,
          total_target: totalTarget,
          selected_topics: topicsPayload,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingGoal.id)
        .select()
        .single();
      if (goalUpdateError) throw new Error(`Failed to update goal: ${goalUpdateError.message}`);
      goal = (updatedG || existingGoal) as Goal;
    } else {
      const { data: newG, error: goalInsertError } = await supabase
        .from('goals')
        .insert([goalPayload])
        .select()
        .single();
      if (goalInsertError) throw new Error(`Failed to create goal: ${goalInsertError.message}`);
      goal = newG as Goal;
    }
  } else {
    goal = {
      id: `g_${Date.now()}`,
      ...goalPayload,
      created_at: new Date().toISOString(),
    };
  }

  // Initialize Streak if it doesn't already exist
  if (user) {
    await supabase.from('streaks').upsert({
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_practice_date: null,
      available_freezes: 2,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }

  return { profile: updatedProfile, goal, mastery: masteryListPayload };
}

export async function getUserMastery(prefetchedTopics?: Topic[]): Promise<UserTopicMastery[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'usr_demo_1';
  // Accept pre-fetched topics to avoid a redundant round-trip when the caller already has them
  const topics = prefetchedTopics ?? await getTopics();

  if (user) {
    const { data, error } = await supabase
      .from('user_topic_mastery')
      .select('*')
      .eq('user_id', userId);

    if (!error && data && data.length > 0) {
      const existingMap = new Map(data.map((m: UserTopicMastery) => [m.topic_id, { score: Number(m.score), rating: Number(m.rating || 1000) }]));
      return topics.map((t) => {
        const info = existingMap.get(t.id);
        return {
          id: `m_${t.id}`,
          user_id: userId,
          topic_id: t.id,
          score: info?.score ?? 20,
          rating: info?.rating ?? 1000,
          updated_at: new Date().toISOString(),
        };
      });
    }
  }

  return topics.map((t) => ({
    id: `m_${t.id}`,
    user_id: userId,
    topic_id: t.id,
    score: 20,
    rating: 1000,
    updated_at: new Date().toISOString(),
  }));
}

export async function getActiveGoal(): Promise<Goal | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'usr_demo_1';

  if (user) {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'ACTIVE')
      .order('created_at', { ascending: false })
      .maybeSingle();

    if (data) return data as Goal;

    // No goal row found — read the user's saved target from their profile
    // so we never silently override their configured preference with 5.
    const { data: profileRow } = await supabase
      .from('profiles')
      .select('daily_question_target')
      .eq('id', userId)
      .maybeSingle();
    const savedDailyTarget = profileRow?.daily_question_target ?? 5;

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      id: 'g_default',
      user_id: userId,
      daily_target: savedDailyTarget,
      start_date: startDate,
      end_date: endDate,
      total_target: savedDailyTarget * 30,
      total_completed: 0,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return {
    id: 'g_default',
    user_id: userId,
    daily_target: 5,
    start_date: startDate,
    end_date: endDate,
    total_target: 150,
    total_completed: 0,
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function updateGoalTarget(
  dailyTarget: number,
  durationDays: number,
  selectedTopics?: string[]
): Promise<Goal> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentGoal = await getActiveGoal();

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const totalTarget = dailyTarget * durationDays;
  const topicsPayload = selectedTopics && selectedTopics.length > 0 ? selectedTopics : null;

  if (user && currentGoal && currentGoal.id !== 'g_default') {
    const { data: updated, error } = await supabase
      .from('goals')
      .update({
        daily_target: dailyTarget,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_target: totalTarget,
        selected_topics: topicsPayload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentGoal.id)
      .select()
      .single();

    if (error) throw new Error(`Failed to update goal: ${error.message}`);
    if (updated) return updated as Goal;
  }

  if (user) {
    const newGoalPayload = {
      user_id: user.id,
      daily_target: dailyTarget,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      total_target: totalTarget,
      total_completed: 0,
      status: 'ACTIVE' as const,
      selected_topics: topicsPayload,
      updated_at: new Date().toISOString(),
    };
    const { data: inserted, error } = await supabase
      .from('goals')
      .insert([newGoalPayload])
      .select()
      .single();
    if (error) throw new Error(`Failed to create goal: ${error.message}`);
    if (inserted) return inserted as Goal;
  }

  return {
    ...currentGoal!,
    daily_target: dailyTarget,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    total_target: totalTarget,
    selected_topics: topicsPayload,
    updated_at: new Date().toISOString(),
  };
}

export async function getAttempts(): Promise<Attempt[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('attempts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(att => ({
    ...att,
    mastery_change: Number(att.mastery_change)
  })) as Attempt[];
}

export async function getStreak(): Promise<Streak> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'usr_demo_1';

  if (user) {
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      return evaluateStreakStatus(data as Streak);
    }

    const initialStreak: Streak = {
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_practice_date: null,
      available_freezes: 2,
      last_freezer_milestone: 0,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('streaks').upsert(initialStreak, { onConflict: 'user_id' });
    return initialStreak;
  }

  return {
    user_id: userId,
    current_streak: 0,
    longest_streak: 0,
    last_practice_date: null,
    available_freezes: 2,
    last_freezer_milestone: 0,
    updated_at: new Date().toISOString(),
  };
}

export async function getDailyActivities(): Promise<DailyActivity[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('daily_activity')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  if (error || !data) return [];
  return data as DailyActivity[];
}

export async function getTotalXP(): Promise<number> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase
    .from('xp_transactions')
    .select('amount')
    .eq('user_id', user.id);

  if (error || !data) return 0;
  return data.reduce((sum, tx) => sum + (tx.amount || 0), 0);
}

export async function getNextRecommendation(): Promise<QuestionRecommendation> {
  // Parallelize all independent reads for the recommendation engine
  const [questions, mastery, attempts, prereqs, gaps, activeGoal] = await Promise.all([
    getQuestions(),
    getUserMastery(),
    getAttempts(),
    getPrerequisites(),
    getUserUnresolvedGaps(),
    getActiveGoal(),
  ]);

  let eligibleQuestions = questions;
  if (activeGoal?.selected_topics && Array.isArray(activeGoal.selected_topics) && activeGoal.selected_topics.length > 0) {
    const selectedSet = new Set(activeGoal.selected_topics);
    const filtered = questions.filter((q) => selectedSet.has(q.primary_topic_id));
    if (filtered.length > 0) {
      eligibleQuestions = filtered;
    }
  }

  return rankAndRecommendQuestion(eligibleQuestions, mastery, attempts, prereqs, gaps);
}

/**
 * ATOMIC ATTEMPT REPORTING LOOP WITH SUPABASE PERSISTENCE
 *
 * Performance: parallelizes independent reads and writes with Promise.all().
 * The expensive getNextRecommendation() is NOT awaited here — callers should
 * fetch it independently after displaying the success state to the user.
 */
export async function recordQuestionAttempt(params: {
  questionId: string;
  result: AttemptResult;
  failureReason?: FailureReason | null;
  usedHelp: boolean;
  timeSpent: number;
  notes?: string;
}): Promise<{
  attempt: Attempt;
  masteryChange: number;
  xpEarned: number;
  streak: Streak;
  dailyActivity: DailyActivity;
}> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'usr_demo_1';
  const todayStr = new Date().toISOString().split('T')[0];

  // ── BATCH 1: Parallel reads (nothing depends on each other here) ──
  const [questions, currentMasteryList, goal, currentStreakObj, existingActRow] = await Promise.all([
    getQuestions(),
    getUserMastery(),
    getActiveGoal(),
    getStreak(),
    user
      ? supabase
          .from('daily_activity')
          .select('*')
          .eq('user_id', userId)
          .eq('date', todayStr)
          .maybeSingle()
          .then((res) => res.data as DailyActivity | null)
      : Promise.resolve(null),
  ]);

  const question = questions.find((q) => q.id === params.questionId) || questions[0];

  // ── CALCULATIONS (pure, no I/O) ──
  const masteryDelta = calculateMasteryChange(params.result, question.difficulty);
  const primaryMasteryObj = currentMasteryList.find((m) => m.topic_id === question.primary_topic_id);
  const currentPrimaryScore = primaryMasteryObj?.score ?? 20;
  const currentPrimaryRating = primaryMasteryObj?.rating ?? 1000;
  const newPrimaryMastery = clampMastery(currentPrimaryScore + masteryDelta);
  const newPrimaryRating = calculateNewRating(currentPrimaryRating, question.difficulty, params.result);

  const dailyTarget = goal?.daily_target ?? 5;
  const existingActData = existingActRow ?? null;
  const isSolved = params.result !== 'DID_NOT_SOLVE';
  const prevAttempted = existingActData?.questions_attempted ?? 0;
  const prevCompleted = existingActData?.questions_completed ?? 0;
  const prevTargetCompleted = existingActData?.target_completed ?? false;
  const prevXPEarned = existingActData?.xp_earned ?? 0;
  const newAttempted = prevAttempted + 1;
  const newCompleted = isSolved ? prevCompleted + 1 : prevCompleted;
  const targetCompletedNow = !prevTargetCompleted && newCompleted >= dailyTarget;
  const { totalXP } = calculateAttemptXP(question.difficulty, params.result, targetCompletedNow);
  const updatedStreak = updateStreakOnPractice(currentStreakObj, todayStr);

  // Optimistic activity object (used if user is not authenticated)
  let activity: DailyActivity = {
    id: existingActData?.id || `act_${Date.now()}`,
    user_id: userId,
    date: todayStr,
    target: dailyTarget,
    questions_attempted: newAttempted,
    questions_completed: newCompleted,
    target_completed: newCompleted >= dailyTarget,
    xp_earned: prevXPEarned + totalXP,
    created_at: existingActData?.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Optimistic attempt object
  const attemptPayload = {
    user_id: userId,
    question_id: question.id,
    result: params.result,
    failure_reason: params.failureReason || null,
    used_help: params.usedHelp,
    time_spent: params.timeSpent,
    notes: params.notes || null,
    mastery_change: masteryDelta,
    xp_earned: totalXP,
    created_at: new Date().toISOString(),
  };

  let attempt: Attempt = { id: `att_${Date.now()}`, ...attemptPayload };

  if (user) {
    // ── BATCH 2: Parallel writes (all independent of each other) ──
    const secondaryTopicUpserts = question.secondary_topics.map((secId) => {
      const secObj = currentMasteryList.find((m) => m.topic_id === secId);
      const secScore = secObj?.score ?? 20;
      const secRating = secObj?.rating ?? 1000;
      return supabase.from('user_topic_mastery').upsert({
        user_id: userId,
        topic_id: secId,
        score: clampMastery(secScore + masteryDelta * 0.25),
        rating: calculateNewRating(secRating, question.difficulty, params.result),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,topic_id' });
    });

    const dailyActivityUpsert = supabase.from('daily_activity').upsert({
      user_id: userId,
      date: todayStr,
      target: dailyTarget,
      questions_attempted: newAttempted,
      questions_completed: newCompleted,
      target_completed: activity.target_completed,
      xp_earned: activity.xp_earned,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,date' }).select().single();

    const streakUpsert = supabase.from('streaks').upsert({
      user_id: userId,
      current_streak: updatedStreak.current_streak,
      longest_streak: updatedStreak.longest_streak,
      last_practice_date: updatedStreak.last_practice_date,
      available_freezes: updatedStreak.available_freezes,
      last_freezer_milestone: updatedStreak.last_freezer_milestone ?? 0,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

    const primaryMasteryUpsert = supabase.from('user_topic_mastery').upsert({
      user_id: userId,
      topic_id: question.primary_topic_id,
      score: newPrimaryMastery,
      rating: newPrimaryRating,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,topic_id' });

    const attemptInsert = supabase
      .from('attempts')
      .insert([attemptPayload])
      .select()
      .single();

    const goalUpdate =
      isSolved && goal && goal.id !== 'g_default'
        ? supabase.from('goals').update({
            total_completed: goal.total_completed + 1,
            updated_at: new Date().toISOString(),
          }).eq('id', goal.id)
        : Promise.resolve(null);

    const xpInsert =
      totalXP > 0
        ? supabase.from('xp_transactions').insert([{
            user_id: userId,
            amount: totalXP,
            source: `Question Attempt: ${question.title}`,
            reference_id: question.id,
            created_at: new Date().toISOString(),
          }])
        : Promise.resolve(null);

    // Fire all writes in parallel — none depends on any other
    const [savedActResult, savedAttemptResult] = await Promise.all([
      dailyActivityUpsert,
      attemptInsert,
      primaryMasteryUpsert,
      streakUpsert,
      goalUpdate,
      xpInsert,
      ...secondaryTopicUpserts,
      // Gap tracking is non-critical; fire and forget (don't await its result)
      updateUnresolvedGapsOnAttempt({
        userId,
        question,
        result: params.result,
        failureReason: params.failureReason,
        usedHelp: params.usedHelp,
      }).catch(() => null), // Never let gap errors block the user
    ]);

    if (savedActResult && 'data' in savedActResult && savedActResult.data) {
      activity = savedActResult.data as DailyActivity;
    }
    if (savedAttemptResult && 'data' in savedAttemptResult && savedAttemptResult.data) {
      attempt = savedAttemptResult.data as Attempt;
    }
  }

  return {
    attempt,
    masteryChange: masteryDelta,
    xpEarned: totalXP,
    streak: updatedStreak,
    dailyActivity: activity,
  };
}

