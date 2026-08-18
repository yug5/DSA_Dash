import { DailyActivity } from '@/lib/types';

/**
 * Calculates consistency score (0 - 100) based on days practiced, target completion, and streak.
 */
export function calculateConsistencyScore(
  activities: DailyActivity[],
  currentStreak: number
): number {
  if (activities.length === 0) return 0;

  const totalDays = Math.min(activities.length, 30);
  const activeDays = activities.filter((a) => a.questions_completed > 0).length;
  const activeRatio = activeDays / totalDays;

  const targetCompletedCount = activities.filter((a) => a.target_completed).length;
  const targetRatio = activeDays > 0 ? targetCompletedCount / activeDays : 0;

  const streakFactor = Math.min(currentStreak / 14, 1.0); // max out at 14 days streak

  const score = Math.round(
    activeRatio * 40 + targetRatio * 30 + streakFactor * 30
  );

  return Math.min(100, Math.max(0, score));
}
