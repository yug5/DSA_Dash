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
import { updateStreakOnPractice } from './streakService';
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (user) {
    await supabase.from('profiles').upsert(profile, { onConflict: 'id' });
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
    return data as Profile;
  }

  return await initializeUserProfile(user.email || 'solver@example.com', user.user_metadata?.name);
}

export async function completeOnboarding(
  experience: DSAExperience,
  dailyTarget: number,
  durationDays: number
): Promise<{ profile: Profile; goal: Goal; mastery: UserTopicMastery[] }> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'usr_demo_1';

  let profile = await getUserProfile();
  if (!profile) {
    profile = await initializeUserProfile(user?.email || 'demo@example.com');
  }

  const updatedProfile: Profile = {
    ...profile,
    dsa_experience: experience,
    updated_at: new Date().toISOString(),
  };

  if (user) {
    await supabase.from('profiles').upsert(updatedProfile, { onConflict: 'id' });
  }

  // Initialize Topic Mastery based on Experience
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
    await supabase.from('user_topic_mastery').upsert(masteryRows, { onConflict: 'user_id,topic_id' });
  }

  // Create Goal
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const totalTarget = dailyTarget * durationDays;

  const goalPayload = {
    user_id: userId,
    daily_target: dailyTarget,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    total_target: totalTarget,
    total_completed: 0,
    status: 'ACTIVE' as const,
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
      const { data: updatedG } = await supabase
        .from('goals')
        .update({
          daily_target: dailyTarget,
          start_date: goalPayload.start_date,
          end_date: goalPayload.end_date,
          total_target: totalTarget,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingGoal.id)
        .select()
        .single();
      goal = (updatedG || existingGoal) as Goal;
    } else {
      const { data: newG } = await supabase
        .from('goals')
        .insert([goalPayload])
        .select()
        .single();
      goal = newG as Goal;
    }
  } else {
    goal = {
      id: `g_${Date.now()}`,
      ...goalPayload,
      created_at: new Date().toISOString(),
    };
  }

  // Initialize Streak
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

export async function getUserMastery(): Promise<UserTopicMastery[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'usr_demo_1';
  const topics = await getTopics();

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

export async function updateGoalTarget(dailyTarget: number, durationDays: number): Promise<Goal> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const currentGoal = await getActiveGoal();

  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
  const totalTarget = dailyTarget * durationDays;

  if (user && currentGoal && currentGoal.id !== 'g_default') {
    const { data: updated } = await supabase
      .from('goals')
      .update({
        daily_target: dailyTarget,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_target: totalTarget,
        updated_at: new Date().toISOString(),
      })
      .eq('id', currentGoal.id)
      .select()
      .single();

    if (updated) return updated as Goal;
  }

  return {
    ...currentGoal!,
    daily_target: dailyTarget,
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    total_target: totalTarget,
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

    if (data) return data as Streak;

    const initialStreak: Streak = {
      user_id: userId,
      current_streak: 0,
      longest_streak: 0,
      last_practice_date: null,
      available_freezes: 2,
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
  const questions = await getQuestions();
  const mastery = await getUserMastery();
  const attempts = await getAttempts();
  const prereqs = await getPrerequisites();
  const gaps = await getUserUnresolvedGaps();

  return rankAndRecommendQuestion(questions, mastery, attempts, prereqs, gaps);
}

/**
 * ATOMIC ATTEMPT REPORTING LOOP WITH SUPABASE PERSISTENCE
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
  nextRecommendation: QuestionRecommendation;
}> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || 'usr_demo_1';

  const questions = await getQuestions();
  const question = questions.find((q) => q.id === params.questionId) || questions[0];

  // 1. Calculate Mastery & Elo Rating Change
  const masteryDelta = calculateMasteryChange(params.result, question.difficulty);
  const currentMasteryList = await getUserMastery();
  const primaryMasteryObj = currentMasteryList.find((m) => m.topic_id === question.primary_topic_id);

  const currentPrimaryScore = primaryMasteryObj?.score ?? 20;
  const currentPrimaryRating = primaryMasteryObj?.rating ?? 1000;

  const newPrimaryMastery = clampMastery(currentPrimaryScore + masteryDelta);
  const newPrimaryRating = calculateNewRating(currentPrimaryRating, question.difficulty, params.result);

  if (user) {
    await supabase.from('user_topic_mastery').upsert({
      user_id: userId,
      topic_id: question.primary_topic_id,
      score: newPrimaryMastery,
      rating: newPrimaryRating,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,topic_id' });

    for (const secId of question.secondary_topics) {
      const secObj = currentMasteryList.find((m) => m.topic_id === secId);
      const secScore = secObj?.score ?? 20;
      const secRating = secObj?.rating ?? 1000;

      const newSecScore = clampMastery(secScore + masteryDelta * 0.25);
      const newSecRating = calculateNewRating(secRating, question.difficulty, params.result);

      await supabase.from('user_topic_mastery').upsert({
        user_id: userId,
        topic_id: secId,
        score: newSecScore,
        rating: newSecRating,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id,topic_id' });
    }

    // 1b. Update Unresolved Gaps System
    await updateUnresolvedGapsOnAttempt({
      userId,
      question,
      result: params.result,
      failureReason: params.failureReason,
      usedHelp: params.usedHelp,
    });
  }

  // 2. Update Daily Activity
  const todayStr = new Date().toISOString().split('T')[0];
  const goal = await getActiveGoal();
  const dailyTarget = goal?.daily_target ?? 5;

  let activity: DailyActivity;
  let existingActData: DailyActivity | null = null;

  if (user) {
    const { data: actRow } = await supabase
      .from('daily_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('date', todayStr)
      .maybeSingle();
    if (actRow) existingActData = actRow as DailyActivity;
  }

  const isSolved = params.result !== 'DID_NOT_SOLVE';
  const prevAttempted = existingActData?.questions_attempted ?? 0;
  const prevCompleted = existingActData?.questions_completed ?? 0;
  const prevTargetCompleted = existingActData?.target_completed ?? false;
  const prevXPEarned = existingActData?.xp_earned ?? 0;

  const newAttempted = prevAttempted + 1;
  const newCompleted = isSolved ? prevCompleted + 1 : prevCompleted;
  const targetCompletedNow = !prevTargetCompleted && newCompleted >= dailyTarget;

  // 3. XP Calculation
  const { totalXP } = calculateAttemptXP(question.difficulty, params.result, targetCompletedNow);

  activity = {
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

  if (user) {
    const { data: savedAct } = await supabase.from('daily_activity').upsert({
      user_id: userId,
      date: todayStr,
      target: dailyTarget,
      questions_attempted: newAttempted,
      questions_completed: newCompleted,
      target_completed: activity.target_completed,
      xp_earned: activity.xp_earned,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,date' }).select().single();
    if (savedAct) activity = savedAct as DailyActivity;
  }

  if (totalXP > 0 && user) {
    await supabase.from('xp_transactions').insert([{
      user_id: userId,
      amount: totalXP,
      source: `Question Attempt: ${question.title}`,
      reference_id: question.id,
      created_at: new Date().toISOString(),
    }]);
  }

  // 4. Update Streak
  const currentStreakObj = await getStreak();
  const updatedStreak = updateStreakOnPractice(currentStreakObj, todayStr);
  if (user) {
    await supabase.from('streaks').upsert({
      user_id: userId,
      current_streak: updatedStreak.current_streak,
      longest_streak: updatedStreak.longest_streak,
      last_practice_date: updatedStreak.last_practice_date,
      available_freezes: updatedStreak.available_freezes,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }

  // 5. Update Goal Total Completed
  if (isSolved && goal && user && goal.id !== 'g_default') {
    await supabase.from('goals').update({
      total_completed: goal.total_completed + 1,
      updated_at: new Date().toISOString(),
    }).eq('id', goal.id);
  }

  // 6. Save Attempt
  let attempt: Attempt;
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

  if (user) {
    const { data: savedAttempt } = await supabase
      .from('attempts')
      .insert([attemptPayload])
      .select()
      .single();
    attempt = (savedAttempt || { id: `att_${Date.now()}`, ...attemptPayload }) as Attempt;
  } else {
    attempt = {
      id: `att_${Date.now()}`,
      ...attemptPayload,
    };
  }

  // 7. Generate Next Recommendation
  const nextRecommendation = await getNextRecommendation();

  return {
    attempt,
    masteryChange: masteryDelta,
    xpEarned: totalXP,
    streak: updatedStreak,
    dailyActivity: activity,
    nextRecommendation,
  };
}

