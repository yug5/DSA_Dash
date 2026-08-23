import { Streak } from '@/lib/types';

export interface StreakUpdateResult extends Streak {
  freezerEarned?: boolean;
}

/**
 * Calculates days between two date strings (YYYY-MM-DD).
 */
function calculateDaysBetween(fromDateStr: string, toDateStr: string): number {
  const fromDate = new Date(fromDateStr);
  const toDate = new Date(toDateStr);
  const differenceInTime = Math.abs(toDate.getTime() - fromDate.getTime());
  return Math.round(differenceInTime / (1000 * 3600 * 24));
}

/**
 * Evaluates passive streak state for display (e.g. on dashboard load).
 * If user missed a day and has no freezer available, current_streak is viewed as 0.
 */
export function evaluateStreakStatus(
  streakState: Streak,
  todayDateStr: string = new Date().toISOString().split('T')[0]
): Streak {
  const { current_streak, last_practice_date, available_freezes } = streakState;

  if (!last_practice_date || current_streak === 0) {
    return streakState;
  }

  const daysSinceLastPractice = calculateDaysBetween(last_practice_date, todayDateStr);

  // Active today or yesterday
  if (daysSinceLastPractice <= 1) {
    return streakState;
  }

  // Missed yesterday but has a freezer available to protect it
  if (daysSinceLastPractice === 2 && available_freezes > 0) {
    return streakState;
  }

  // Streak has lapsed
  return {
    ...streakState,
    current_streak: 0,
  };
}

/**
 * Calculates updated streak data and freezer balance when a practice attempt is completed.
 * Automatically handles 5-day milestone rewards (+1 Streak Freezer) and freezer usage for missed days.
 */
export function updateStreakOnPractice(
  currentStreakState: Streak,
  todayDateStr: string = new Date().toISOString().split('T')[0]
): StreakUpdateResult {
  const {
    user_id,
    current_streak,
    longest_streak,
    last_practice_date,
    available_freezes = 0,
    last_freezer_milestone,
  } = currentStreakState;

  // Already completed practice today -> maintain current state
  if (last_practice_date === todayDateStr) {
    return {
      ...currentStreakState,
      freezerEarned: false,
    };
  }

  // First practice session
  if (!last_practice_date) {
    return {
      user_id,
      current_streak: 1,
      longest_streak: Math.max(longest_streak, 1),
      last_practice_date: todayDateStr,
      available_freezes,
      last_freezer_milestone: 0,
      updated_at: new Date().toISOString(),
      freezerEarned: false,
    };
  }

  const daysSinceLastPractice = calculateDaysBetween(last_practice_date, todayDateStr);

  let newCurrentStreak = current_streak;
  let newFreezes = available_freezes;
  let currentMilestone = last_freezer_milestone ?? Math.floor(current_streak / 5) * 5;

  if (daysSinceLastPractice === 1) {
    // Consecutive day practice
    newCurrentStreak += 1;
  } else if (daysSinceLastPractice === 2 && available_freezes > 0) {
    // Missed 1 day -> consume 1 freezer and preserve/increment streak
    newFreezes -= 1;
    newCurrentStreak += 1;
  } else {
    // Missed multiple days or no freezer available -> reset streak
    newCurrentStreak = 1;
    currentMilestone = 0;
  }

  // Check 5-consecutive-day milestone reward
  let freezerEarned = false;
  if (newCurrentStreak >= currentMilestone + 5) {
    newFreezes += 1;
    currentMilestone = Math.floor(newCurrentStreak / 5) * 5;
    freezerEarned = true;
  }

  const newLongestStreak = Math.max(longest_streak, newCurrentStreak);

  return {
    user_id,
    current_streak: newCurrentStreak,
    longest_streak: newLongestStreak,
    last_practice_date: todayDateStr,
    available_freezes: newFreezes,
    last_freezer_milestone: currentMilestone,
    updated_at: new Date().toISOString(),
    freezerEarned,
  };
}
