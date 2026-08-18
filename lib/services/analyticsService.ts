import {
  Attempt,
  DailyActivity,
  Goal,
  ProgressSummary,
  Streak,
  Topic,
  UserTopicMastery,
  WeeklySummary,
} from '@/lib/types';
import { calculateConsistencyScore } from './consistencyService';

export function computeProgressSummary(
  topics: Topic[],
  masteryList: UserTopicMastery[],
  attempts: Attempt[],
  activities: DailyActivity[],
  streak: Streak | null,
  totalXP: number
): ProgressSummary {
  const masteryMap = new Map<string, number>();
  masteryList.forEach((m) => masteryMap.set(m.topic_id, Number(m.score)));

  const topicMasteries = topics.map((topic) => ({
    topic,
    score: masteryMap.get(topic.id) ?? 0,
  }));

  const sortedByScore = [...topicMasteries].sort((a, b) => b.score - a.score);
  const strongestTopics = sortedByScore.slice(0, 3);
  const weakestTopics = [...sortedByScore].reverse().slice(0, 3);

  const overallMastery =
    topicMasteries.length > 0
      ? Math.round(
          (topicMasteries.reduce((sum, t) => sum + t.score, 0) / topicMasteries.length) * 10
        ) / 10
      : 0;

  const questionsAttempted = attempts.length;
  const solvedIndependently = attempts.filter((a) => a.result === 'SOLVED_INDEPENDENTLY').length;
  const solvedWithHelp = attempts.filter((a) => a.result === 'SOLVED_WITH_HELP').length;
  const questionsSolved = solvedIndependently + solvedWithHelp;
  const failed = attempts.filter((a) => a.result === 'DID_NOT_SOLVE').length;

  const independentSolveRate =
    questionsAttempted > 0 ? Math.round((solvedIndependently / questionsAttempted) * 100) : 0;
  const solvedWithHelpRate =
    questionsAttempted > 0 ? Math.round((solvedWithHelp / questionsAttempted) * 100) : 0;
  const failureRate =
    questionsAttempted > 0 ? Math.round((failed / questionsAttempted) * 100) : 0;

  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;
  const consistencyScore = calculateConsistencyScore(activities, currentStreak);

  return {
    overallMastery,
    topicMasteries,
    strongestTopics,
    weakestTopics,
    questionsAttempted,
    questionsSolved,
    independentSolveRate,
    solvedWithHelpRate,
    failureRate,
    currentStreak,
    longestStreak,
    consistencyScore,
    totalXP,
    recentActivity: activities.slice(-7),
  };
}

export function computeWeeklySummary(
  topics: Topic[],
  masteryList: UserTopicMastery[],
  attempts: Attempt[],
  activities: DailyActivity[],
  activeGoal: Goal | null
): WeeklySummary {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const weeklyAttempts = attempts.filter(
    (a) => new Date(a.created_at) >= oneWeekAgo
  );

  const questionsThisWeek = weeklyAttempts.filter(
    (a) => a.result !== 'DID_NOT_SOLVE'
  ).length;

  const dailyTarget = activeGoal?.daily_target ?? 5;
  const targetThisWeek = dailyTarget * 7;
  const goalCompletionPercentage = Math.min(
    100,
    Math.round((questionsThisWeek / targetThisWeek) * 100)
  );

  const masteryMap = new Map<string, number>();
  masteryList.forEach((m) => masteryMap.set(m.topic_id, Number(m.score)));

  const topicScores = topics.map((t) => ({
    topic: t,
    score: masteryMap.get(t.id) ?? 0,
  }));

  topicScores.sort((a, b) => b.score - a.score);

  const strongestTopic = topicScores[0]?.topic ?? null;
  const weakestTopic = topicScores[topicScores.length - 1]?.topic ?? null;

  const consistency = calculateConsistencyScore(activities, 1);

  // Improved topics (topics with positive mastery changes this week)
  const improvedTopicIds = new Set<string>();
  weeklyAttempts.forEach((a) => {
    if (a.mastery_change > 0) {
      improvedTopicIds.add(a.question_id); // Maps to attempted questions
    }
  });

  const topicsImproved = Array.from(improvedTopicIds);

  return {
    questionsThisWeek,
    targetThisWeek,
    goalCompletionPercentage,
    consistency,
    strongestTopic,
    weakestTopic,
    topicsImproved,
    recommendedNextTopic: weakestTopic,
  };
}
