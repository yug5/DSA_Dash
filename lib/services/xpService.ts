import { QuestionDifficulty, AttemptResult } from '@/lib/types';

export const BASE_XP: Record<QuestionDifficulty, number> = {
  EASY: 10,
  MEDIUM: 25,
  HARD: 50,
};

export const BONUS_XP = {
  INDEPENDENT_SOLVE: 5,
  DAILY_TARGET_COMPLETED: 10,
};

/**
 * Calculates XP earned for an individual question attempt.
 */
export function calculateAttemptXP(
  difficulty: QuestionDifficulty,
  result: AttemptResult,
  isTargetCompletedNow: boolean = false
): { baseXP: number; bonusXP: number; totalXP: number } {
  if (result === 'DID_NOT_SOLVE') {
    return { baseXP: 0, bonusXP: 0, totalXP: 0 };
  }

  const base = BASE_XP[difficulty];
  let bonus = 0;

  if (result === 'SOLVED_INDEPENDENTLY') {
    bonus += BONUS_XP.INDEPENDENT_SOLVE;
  }

  if (isTargetCompletedNow) {
    bonus += BONUS_XP.DAILY_TARGET_COMPLETED;
  }

  return {
    baseXP: base,
    bonusXP: bonus,
    totalXP: base + bonus,
  };
}
