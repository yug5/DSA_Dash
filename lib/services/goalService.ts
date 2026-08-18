import { Goal } from '@/lib/types';

/**
 * Calculates total expected target questions based on daily target and duration in days.
 */
export function calculateTargetQuestions(dailyTarget: number, durationDays: number): number {
  return dailyTarget * durationDays;
}

/**
 * Calculates actual daily average and projects goal completion count.
 */
export function calculateGoalProjection(
  totalCompleted: number,
  startDateStr: string,
  endDateStr: string
): {
  daysElapsed: number;
  totalDays: number;
  currentDailyAverage: number;
  projectedTotal: number;
} {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const now = new Date();

  const totalTime = Math.max(1, end.getTime() - start.getTime());
  const totalDays = Math.ceil(totalTime / (1000 * 3600 * 24));

  const elapsedTime = Math.max(1, Math.min(now.getTime() - start.getTime(), totalTime));
  const daysElapsed = Math.ceil(elapsedTime / (1000 * 3600 * 24));

  const currentDailyAverage = Math.round((totalCompleted / daysElapsed) * 10) / 10;
  const projectedTotal = Math.round(currentDailyAverage * totalDays);

  return {
    daysElapsed,
    totalDays,
    currentDailyAverage,
    projectedTotal,
  };
}
