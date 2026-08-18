import { AttemptResult, QuestionDifficulty, DSAExperience } from '@/lib/types';

export const DIFFICULTY_MULTIPLIERS: Record<QuestionDifficulty, number> = {
  EASY: 1.0,
  MEDIUM: 1.25,
  HARD: 1.5,
};

export const BASE_MASTERY_CHANGES: Record<AttemptResult, number> = {
  SOLVED_INDEPENDENTLY: 8,
  SOLVED_WITH_HELP: 3,
  DID_NOT_SOLVE: -5,
};

/**
 * Calculates the exact mastery change for a problem attempt based on difficulty and result.
 */
export function calculateMasteryChange(
  result: AttemptResult,
  difficulty: QuestionDifficulty
): number {
  const baseDelta = BASE_MASTERY_CHANGES[result];
  const multiplier = DIFFICULTY_MULTIPLIERS[difficulty];
  const rawChange = baseDelta * multiplier;
  return Math.round(rawChange * 10) / 10; // Round to 1 decimal place
}

/**
 * Clamps a mastery score strictly between 0 and 100.
 */
export function clampMastery(score: number): number {
  if (score < 0) return 0;
  if (score > 100) return 100;
  return Math.round(score * 10) / 10;
}

/**
 * Deterministic initial topic mastery scores based on user DSA experience level.
 */
export function getInitialMasteryForExperience(
  experience: DSAExperience,
  topicId: string
): number {
  const fundamentals = ['arrays', 'hashing', 'two_pointers', 'prefix_sum'];
  const intermediates = ['sliding_window', 'binary_search', 'linked_lists', 'stack', 'queue', 'recursion', 'trees', 'bst'];
  const advanced = ['backtracking', 'graphs', 'bfs', 'dfs', 'greedy', 'heap', 'dp'];

  if (experience === 'BEGINNER') {
    if (fundamentals.includes(topicId)) return 25;
    return 5;
  }

  if (experience === 'INTERMEDIATE') {
    if (fundamentals.includes(topicId)) return 55;
    if (intermediates.includes(topicId)) return 40;
    return 15;
  }

  // ADVANCED
  if (fundamentals.includes(topicId)) return 80;
  if (intermediates.includes(topicId)) return 65;
  return 45;
}
