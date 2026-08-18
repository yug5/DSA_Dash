import { ALGORITHM_CONFIG } from '@/lib/config/algorithmConfig';
import { QuestionDifficulty, AttemptResult } from '@/lib/types';

/**
 * Derives a base internal question Elo rating (0-2000) from LeetCode difficulty.
 */
export function getQuestionRating(difficulty: QuestionDifficulty): number {
  return (
    ALGORITHM_CONFIG.RATING.QUESTION_DIFFICULTY_RATINGS[difficulty] ??
    ALGORITHM_CONFIG.RATING.QUESTION_DIFFICULTY_RATINGS.MEDIUM
  );
}

/**
 * Calculates Elo expected success probability (0.0 to 1.0).
 * Expected success = 1 / (1 + 10^((question_rating - user_rating) / 400))
 */
export function calculateExpectedSuccess(userRating: number, questionRating: number): number {
  return 1 / (1 + Math.pow(10, (questionRating - userRating) / 400));
}

/**
 * Updates user per-topic Elo rating based on attempt outcome.
 * Result mapping:
 * - SOLVED_INDEPENDENTLY = 1.0
 * - SOLVED_WITH_HELP = 0.5
 * - DID_NOT_SOLVE = 0.0
 */
export function calculateNewRating(
  currentRating: number,
  questionDifficulty: QuestionDifficulty,
  result: AttemptResult
): number {
  const qRating = getQuestionRating(questionDifficulty);
  const expected = calculateExpectedSuccess(currentRating, qRating);

  let actualScore = 0.0;
  if (result === 'SOLVED_INDEPENDENTLY') {
    actualScore = 1.0;
  } else if (result === 'SOLVED_WITH_HELP') {
    actualScore = 0.5;
  } else {
    actualScore = 0.0;
  }

  const kFactor = ALGORITHM_CONFIG.RATING.K_FACTOR;
  const ratingDelta = kFactor * (actualScore - expected);
  const updated = currentRating + ratingDelta;

  return Math.min(
    ALGORITHM_CONFIG.RATING.MAX_RATING,
    Math.max(ALGORITHM_CONFIG.RATING.MIN_RATING, Math.round(updated * 100) / 100)
  );
}
