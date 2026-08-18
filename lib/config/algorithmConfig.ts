/**
 * ADAPTIVE DSA ENGINE - CENTRAL CONFIGURATION
 * All algorithm weights, Elo constants, severity parameters, and guardrails are centralized here.
 */

export const ALGORITHM_CONFIG = {
  // Elo Rating Configuration
  RATING: {
    INITIAL_USER_RATING: 1000, // Range 0-2000
    K_FACTOR: 32,
    MIN_RATING: 0,
    MAX_RATING: 2000,
    QUESTION_DIFFICULTY_RATINGS: {
      EASY: 900,
      MEDIUM: 1300,
      HARD: 1700,
    },
    TARGET_EXPECTED_SUCCESS: 0.72, // Ideal 70-75% challenge target
  },

  // Mastery System (0-100)
  MASTERY: {
    INDEPENDENT_SOLVE_BASE: 8,
    SOLVED_WITH_HELP_BASE: 3,
    DID_NOT_SOLVE_BASE: -5,
    DIFFICULTY_MULTIPLIER: {
      EASY: 1.0,
      MEDIUM: 1.25,
      HARD: 1.5,
    },
    MIN_MASTERY: 0,
    MAX_MASTERY: 100,
    PREREQUISITE_THRESHOLD: 35.0, // Prerequisite considered "ready"
  },

  // Topic Priority Weights
  TOPIC_PRIORITY: {
    WEAKNESS_WEIGHT: 0.4, // (100 - mastery) * weight
    WEAK_RECENCY_BONUS: 25, // Recent failures/help boost topic priority
    PREREQUISITE_PENALTY_WEIGHT: 30, // Reduces priority if prerequisites are weak
    REVISION_DUE_BONUS: 20, // Boost if not practiced for 5+ days
    OVEREXPOSURE_PENALTY: 25, // Reduces priority if 2+ recent attempts in same topic
  },

  // Question Scoring Weights
  SCORING: {
    WEAK_TOPIC_WEIGHT: 30,
    SIMILAR_FAILED_CONCEPT_WEIGHT: 25,
    PREREQUISITE_READY_WEIGHT: 15,
    DIFFICULTY_FIT_WEIGHT: 20,
    REVISION_WEIGHT: 15,
    RECENT_ATTEMPT_PENALTY: -40,
    REPETITION_PENALTY: -50,
  },

  // Failure Severity Calculation
  SEVERITY: {
    RESULT_BASE: {
      DID_NOT_SOLVE: 2,
      SOLVED_WITH_HELP: 1,
      SOLVED_INDEPENDENTLY: 0,
    },
    BLOCKER_WEIGHTS: {
      DID_NOT_KNOW_CONCEPT: 2,
      DID_NOT_KNOW_APPROACH: 2,
      DID_NOT_UNDERSTAND: 1,
      TOO_DIFFICULT: 1,
      RAN_OUT_OF_TIME: 0,
      OTHER: 0,
    },
  },

  // Diversity Guardrail
  DIVERSITY: {
    MARGIN_PERCENTAGE: 0.1, // 10% score margin for tie-breaking
    RECENT_TOPIC_THRESHOLD: 2, // 2+ of last 3 recommendations
  },

  // Cooldown & Filters
  COOLDOWN_WINDOW_ATTEMPTS: 4, // Exclude questions attempted in last 4 tries
};
