import { ALGORITHM_CONFIG } from '@/lib/config/algorithmConfig';
import {
  Attempt,
  Question,
  QuestionDifficulty,
  QuestionRecommendation,
  TopicPrerequisite,
  UnresolvedGap,
  UserTopicMastery,
} from '@/lib/types';
import { calculateExpectedSuccess, getQuestionRating } from './ratingService';
import { getHighestSeverityGap, getReinforcementTargetDifficulty } from './gapService';
export const RECOMMENDATION_WEIGHTS = ALGORITHM_CONFIG.SCORING;


/**
 * Deterministically ranks and recommends the optimal problem using the full Adaptive DSA Engine.
 */
export function rankAndRecommendQuestion(
  questions: Question[],
  masteryList: UserTopicMastery[],
  recentAttempts: Attempt[],
  prerequisites: TopicPrerequisite[],
  activeGaps: UnresolvedGap[] = []
): QuestionRecommendation {
  if (!questions || questions.length === 0) {
    throw new Error('No questions available in catalog');
  }

  const masteryMap = new Map<string, number>();
  const ratingMap = new Map<string, number>();
  masteryList.forEach((m) => {
    masteryMap.set(m.topic_id, Number(m.score));
    ratingMap.set(m.topic_id, Number(m.rating ?? ALGORITHM_CONFIG.RATING.INITIAL_USER_RATING));
  });

  const questionMap = new Map<string, Question>();
  questions.forEach((q) => questionMap.set(q.id, q));

  // STEP 1: REINFORCEMENT MODE (UNRESOLVED GAPS TAKE PRIORITY)
  const highestGap = getHighestSeverityGap(activeGaps);
  if (highestGap) {
    const targetDifficulty = getReinforcementTargetDifficulty(
      highestGap.origin_difficulty,
      highestGap.reinforcement_attempts
    );

    const recentCooldownIds = new Set(
      recentAttempts.slice(0, ALGORITHM_CONFIG.COOLDOWN_WINDOW_ATTEMPTS).map((a) => a.question_id)
    );

    const reinforcementCandidates = questions.filter((q) => {
      if (q.primary_topic_id !== highestGap.topic_id) return false;
      if (q.id === highestGap.origin_question_id) return false; // Never repeat exact origin question
      if (recentCooldownIds.has(q.id)) return false;

      // Check concept overlap
      const qTags = q.concept_tags ?? [];
      if (highestGap.concept_tags.length > 0 && qTags.length > 0) {
        return highestGap.concept_tags.some((tag: string) => qTags.includes(tag));
      }
      return true;
    });

    if (reinforcementCandidates.length > 0) {
      // Pick best matching difficulty
      const exactDiffMatch = reinforcementCandidates.find((q) => q.difficulty === targetDifficulty);
      const chosenReinforcement = exactDiffMatch || reinforcementCandidates[0];

      const userRating = ratingMap.get(chosenReinforcement.primary_topic_id) ?? ALGORITHM_CONFIG.RATING.INITIAL_USER_RATING;
      const qRating = getQuestionRating(chosenReinforcement.difficulty);
      const expectedSuccess = calculateExpectedSuccess(userRating, qRating);

      return {
        ...chosenReinforcement,
        reason: `Reinforcement Mode: You struggled with a similar concept (${highestGap.concept_tags.slice(0, 2).join(', ') || highestGap.topic_id}) — this problem reinforces the concept at an achievable level.`,
        expected_success: Math.round(expectedSuccess * 100) / 100,
        score_breakdown: {
          reinforcementBoost: 100,
          severity: highestGap.severity,
        },
        scoreExplanation: {
          totalScore: 100,
          weakTopicBoost: 50,
          similarityBoost: 50,
          prereqBoost: 0,
          difficultyBoost: 0,
          revisionBoost: 0,
          penalties: 0,
        },
      };
    }
  }

  // STEP 2: NORMAL ADAPTIVE RECOMMENDATION FLOW

  // Calculate Topic Priority for all topics
  const topicPriorityMap = new Map<string, number>();

  const recentAttemptsSlice = recentAttempts.slice(0, 10);
  const recentTopicCounts = new Map<string, number>();
  recentAttempts.slice(0, 3).forEach((a) => {
    const q = questionMap.get(a.question_id);
    if (q) {
      recentTopicCounts.set(q.primary_topic_id, (recentTopicCounts.get(q.primary_topic_id) || 0) + 1);
    }
  });

  const allTopics = Array.from(new Set(questions.map((q) => q.primary_topic_id)));
  for (const topicId of allTopics) {
    const masteryScore = masteryMap.get(topicId) ?? 20;

    // Weakness factor
    let priority = (100 - masteryScore) * ALGORITHM_CONFIG.TOPIC_PRIORITY.WEAKNESS_WEIGHT;

    // Weak recency bonus
    const recentTopicAttempts = recentAttemptsSlice.filter((a) => {
      const q = questionMap.get(a.question_id);
      return q?.primary_topic_id === topicId;
    });
    const hasRecentFailureOrHelp = recentTopicAttempts.some(
      (a) => a.result === 'DID_NOT_SOLVE' || a.result === 'SOLVED_WITH_HELP'
    );
    if (hasRecentFailureOrHelp) {
      priority += ALGORITHM_CONFIG.TOPIC_PRIORITY.WEAK_RECENCY_BONUS;
    }

    // Revision due bonus
    if (recentTopicAttempts.length === 0) {
      priority += ALGORITHM_CONFIG.TOPIC_PRIORITY.REVISION_DUE_BONUS;
    } else {
      const daysSince =
        (new Date().getTime() - new Date(recentTopicAttempts[0].created_at).getTime()) /
        (1000 * 3600 * 24);
      if (daysSince >= 5) {
        priority += ALGORITHM_CONFIG.TOPIC_PRIORITY.REVISION_DUE_BONUS;
      }
    }

    // Prerequisite penalty (reduces priority if prerequisites are weak without hard-blocking)
    const topicPrereqs = prerequisites.filter((p) => p.topic_id === topicId).map((p) => p.prerequisite_id);
    for (const prereqId of topicPrereqs) {
      const prereqMastery = masteryMap.get(prereqId) ?? 20;
      if (prereqMastery < ALGORITHM_CONFIG.MASTERY.PREREQUISITE_THRESHOLD) {
        priority -= ALGORITHM_CONFIG.TOPIC_PRIORITY.PREREQUISITE_PENALTY_WEIGHT;
      }
    }

    // Overexposure penalty
    if ((recentTopicCounts.get(topicId) || 0) >= ALGORITHM_CONFIG.DIVERSITY.RECENT_TOPIC_THRESHOLD) {
      priority -= ALGORITHM_CONFIG.TOPIC_PRIORITY.OVEREXPOSURE_PENALTY;
    }

    topicPriorityMap.set(topicId, priority);
  }

  // STEP 3: CANDIDATE QUESTION SCORING
  const cooldownIds = new Set(
    recentAttempts.slice(0, ALGORITHM_CONFIG.COOLDOWN_WINDOW_ATTEMPTS).map((a) => a.question_id)
  );

  const solvedQuestionIds = new Set(
    recentAttempts.filter((a) => a.result === 'SOLVED_INDEPENDENTLY').map((a) => a.question_id)
  );

  const failedAttempts = recentAttempts.filter((a) => a.result === 'DID_NOT_SOLVE').slice(0, 5);

  interface ScoredCandidate {
    question: Question;
    totalScore: number;
    scoreBreakdown: Record<string, number>;
    expectedSuccess: number;
    winningReason: string;
  }

  const scoredCandidates: ScoredCandidate[] = [];

  for (const question of questions) {
    // Hard Filters
    if (cooldownIds.has(question.id)) continue;
    if (solvedQuestionIds.has(question.id)) {
      // Allow only if revision due (no attempt in 7+ days)
      const lastAttempt = recentAttempts.find((a) => a.question_id === question.id);
      if (lastAttempt) {
        const daysSince =
          (new Date().getTime() - new Date(lastAttempt.created_at).getTime()) / (1000 * 3600 * 24);
        if (daysSince < 7) continue;
      }
    }

    const topicMastery = masteryMap.get(question.primary_topic_id) ?? 20;
    const userRating = ratingMap.get(question.primary_topic_id) ?? ALGORITHM_CONFIG.RATING.INITIAL_USER_RATING;
    const qRating = getQuestionRating(question.difficulty);
    const expectedSuccess = calculateExpectedSuccess(userRating, qRating);

    let weakTopicBoost = 0;
    let similarityBoost = 0;
    let prereqBoost = 0;
    let difficultyBoost = 0;
    let revisionBoost = 0;
    let penalties = 0;

    // 1. Weak Topic Boost
    if (topicMastery < 60) {
      weakTopicBoost = Math.round(((60 - topicMastery) / 60) * ALGORITHM_CONFIG.SCORING.WEAK_TOPIC_WEIGHT);
    }

    // 2. Similar Failed Concept Boost
    const matchesFailed = failedAttempts.some((failed) => {
      const failedQ = questionMap.get(failed.question_id);
      if (!failedQ) return false;
      if (failedQ.primary_topic_id === question.primary_topic_id) return true;
      const fqTags = failedQ.concept_tags ?? [];
      const qTagsB = question.concept_tags ?? [];
      if (fqTags.length > 0 && qTagsB.length > 0) {
        return fqTags.some((tag: string) => qTagsB.includes(tag));
      }
      return false;
    });
    if (matchesFailed) {
      similarityBoost = ALGORITHM_CONFIG.SCORING.SIMILAR_FAILED_CONCEPT_WEIGHT;
    }

    // 3. Prerequisite Readiness Boost
    const prereqTopics = prerequisites.filter((p) => p.topic_id === question.primary_topic_id).map((p) => p.prerequisite_id);
    const prereqsReady = prereqTopics.every((pId) => (masteryMap.get(pId) ?? 20) >= ALGORITHM_CONFIG.MASTERY.PREREQUISITE_THRESHOLD);
    if (prereqsReady) {
      prereqBoost = ALGORITHM_CONFIG.SCORING.PREREQUISITE_READY_WEIGHT;
    }

    // 4. Difficulty Fit Boost (Target expected success ~0.72)
    const distance = Math.abs(expectedSuccess - ALGORITHM_CONFIG.RATING.TARGET_EXPECTED_SUCCESS);
    const fitFactor = Math.max(0, 1.0 - distance / 0.4);
    difficultyBoost = Math.round(fitFactor * ALGORITHM_CONFIG.SCORING.DIFFICULTY_FIT_WEIGHT);

    // 5. Revision Boost
    const topicAttempts = recentAttempts.filter((a) => questionMap.get(a.question_id)?.primary_topic_id === question.primary_topic_id);
    if (topicAttempts.length === 0) {
      revisionBoost = ALGORITHM_CONFIG.SCORING.REVISION_WEIGHT;
    } else {
      const daysSince = (new Date().getTime() - new Date(topicAttempts[0].created_at).getTime()) / (1000 * 3600 * 24);
      if (daysSince >= 5) {
        revisionBoost = ALGORITHM_CONFIG.SCORING.REVISION_WEIGHT;
      }
    }

    // Penalties
    const topicPriority = topicPriorityMap.get(question.primary_topic_id) ?? 0;
    if (topicMastery > 85 && question.difficulty === 'EASY') {
      penalties += ALGORITHM_CONFIG.SCORING.RECENT_ATTEMPT_PENALTY;
    }

    const totalScore =
      topicPriority +
      weakTopicBoost +
      similarityBoost +
      prereqBoost +
      difficultyBoost +
      revisionBoost +
      penalties;

    // Rationale Generation based on winning score component
    let winningReason = `This problem matches your current level (${Math.round(expectedSuccess * 100)}% target fit) and advances your practice trajectory.`;
    if (similarityBoost >= weakTopicBoost && similarityBoost > 0) {
      winningReason = `You struggled with a similar concept recently — this problem reinforces the core pattern from a different angle.`;
    } else if (weakTopicBoost > 15) {
      winningReason = `Your mastery in this area (${Math.round(topicMastery)}/100) is lower than your average — this problem helps strengthen foundational skills.`;
    } else if (prereqBoost > 0 && prereqsReady && prereqTopics.length > 0) {
      winningReason = `Your prerequisite mastery is strong, making this problem an ideal next step in your trajectory.`;
    } else if (revisionBoost > 10) {
      winningReason = `You haven't practiced this topic in a while — this problem keeps your pattern retention sharp.`;
    }

    scoredCandidates.push({
      question,
      totalScore: Math.round(totalScore * 10) / 10,
      scoreBreakdown: {
        topicPriority: Math.round(topicPriority),
        weakTopicBoost,
        similarityBoost,
        prereqBoost,
        difficultyBoost,
        revisionBoost,
        penalties,
      },
      expectedSuccess: Math.round(expectedSuccess * 100) / 100,
      winningReason,
    });
  }

  // Sort candidates by total score descending
  scoredCandidates.sort((a, b) => b.totalScore - a.totalScore);

  if (scoredCandidates.length === 0) {
    // Fallback to first available question
    const fallback = questions[0];
    return {
      ...fallback,
      reason: 'Standard baseline recommendation.',
      expected_success: 0.72,
      score_breakdown: { fallback: 1 },
      scoreExplanation: {
        totalScore: 10,
        weakTopicBoost: 0,
        similarityBoost: 0,
        prereqBoost: 0,
        difficultyBoost: 10,
        revisionBoost: 0,
        penalties: 0,
      },
    };
  }

  // STEP 4: DIVERSITY GUARDRAILS (TIE-BREAKER)
  let chosenCandidate = scoredCandidates[0];

  const topCandidateTopic = chosenCandidate.question.primary_topic_id;
  const isTopOverexposed = (recentTopicCounts.get(topCandidateTopic) || 0) >= ALGORITHM_CONFIG.DIVERSITY.RECENT_TOPIC_THRESHOLD;

  if (isTopOverexposed && scoredCandidates.length > 1) {
    const margin = chosenCandidate.totalScore * ALGORITHM_CONFIG.DIVERSITY.MARGIN_PERCENTAGE;
    const alternative = scoredCandidates.find(
      (c) =>
        c.question.primary_topic_id !== topCandidateTopic &&
        c.totalScore >= chosenCandidate.totalScore - margin
    );
    if (alternative) {
      chosenCandidate = alternative;
    }
  }

  return {
    ...chosenCandidate.question,
    reason: chosenCandidate.winningReason,
    expected_success: chosenCandidate.expectedSuccess,
    score_breakdown: chosenCandidate.scoreBreakdown,
    scoreExplanation: {
      totalScore: chosenCandidate.totalScore,
      weakTopicBoost: chosenCandidate.scoreBreakdown.weakTopicBoost || 0,
      similarityBoost: chosenCandidate.scoreBreakdown.similarityBoost || 0,
      prereqBoost: chosenCandidate.scoreBreakdown.prereqBoost || 0,
      difficultyBoost: chosenCandidate.scoreBreakdown.difficultyBoost || 0,
      revisionBoost: chosenCandidate.scoreBreakdown.revisionBoost || 0,
      penalties: chosenCandidate.scoreBreakdown.penalties || 0,
    },
  };
}
