import { Streak } from '@/lib/types';

/**
 * Calculates updated streak data when a user completes a practice attempt today.
 */
export function updateStreakOnPractice(
  currentStreakState: Streak,
  todayDateStr: string = new Date().toISOString().split('T')[0]
): Streak {
  const { current_streak, longest_streak, last_practice_date, available_freezes } = currentStreakState;

  // Case 1: Already practiced today -> do not double increment
  if (last_practice_date === todayDateStr) {
    return currentStreakState;
  }

  if (!last_practice_date) {
    // First practice ever
    return {
      user_id: currentStreakState.user_id,
      current_streak: 1,
      longest_streak: Math.max(longest_streak, 1),
      last_practice_date: todayDateStr,
      available_freezes,
      updated_at: new Date().toISOString(),
    };
  }

  const today = new Date(todayDateStr);
  const lastDate = new Date(last_practice_date);

  const diffTime = Math.abs(today.getTime() - lastDate.getTime());
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

  let newCurrentStreak = current_streak;
  let newFreezes = available_freezes;

  if (diffDays === 1) {
    // Consecutive day practice
    newCurrentStreak += 1;
  } else if (diffDays === 2 && available_freezes > 0) {
    // Missed exactly 1 day, use 1 streak freeze!
    newFreezes -= 1;
    newCurrentStreak += 1;
  } else {
    // Missed multiple days or no freeze available -> reset streak
    newCurrentStreak = 1;
  }

  const newLongestStreak = Math.max(longest_streak, newCurrentStreak);

  return {
    user_id: currentStreakState.user_id,
    current_streak: newCurrentStreak,
    longest_streak: newLongestStreak,
    last_practice_date: todayDateStr,
    available_freezes: newFreezes,
    updated_at: new Date().toISOString(),
  };
}
