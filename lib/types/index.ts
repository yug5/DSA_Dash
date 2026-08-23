export type DSAExperience = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type QuestionDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export type AttemptResult = 'SOLVED_INDEPENDENTLY' | 'SOLVED_WITH_HELP' | 'DID_NOT_SOLVE';

export type FailureReason =
  | 'TOO_DIFFICULT'
  | 'DID_NOT_UNDERSTAND'
  | 'DID_NOT_KNOW_CONCEPT'
  | 'DID_NOT_KNOW_APPROACH'
  | 'RAN_OUT_OF_TIME'
  | 'OTHER';

export interface Profile {
  id: string;
  name: string | null;
  email: string;
  avatar_url?: string | null;
  dsa_experience: DSAExperience | null;
  available_freezes: number;
  onboarding_completed: boolean;
  daily_question_target: number;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface TopicPrerequisite {
  topic_id: string;
  prerequisite_id: string;
}

export interface Question {
  id: string;
  leetcode_id?: number | null;
  title: string;
  slug: string;
  leetcode_url: string;
  difficulty: QuestionDifficulty;
  estimated_time: number;
  primary_topic_id: string;
  secondary_topics: string[];
  concept_tags?: string[];
  pattern: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserTopicMastery {
  id: string;
  user_id: string;
  topic_id: string;
  score: number;
  rating?: number; // Internal Elo-style rating 0-2000
  updated_at: string;
}

export type GapStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface UnresolvedGap {
  id: string;
  user_id: string;
  topic_id: string;
  concept_tags: string[];
  origin_question_id: string;
  origin_difficulty: QuestionDifficulty;
  failure_reason: FailureReason | null;
  used_help: boolean;
  status: GapStatus;
  severity: number;
  reinforcement_attempts: number;
  created_at: string;
  last_touched_at: string;
  resolved_at?: string | null;
}

export interface Goal {
  id: string;
  user_id: string;
  daily_target: number;
  start_date: string;
  end_date: string;
  total_target: number;
  total_completed: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  selected_topics?: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface Attempt {
  id: string;
  user_id: string;
  question_id: string;
  result: AttemptResult;
  failure_reason?: FailureReason | null;
  used_help: boolean;
  time_spent: number; // in minutes
  notes?: string | null;
  mastery_change: number;
  xp_earned: number;
  created_at: string;
}

export interface DailyActivity {
  id: string;
  user_id: string;
  date: string; // YYYY-MM-DD
  target: number;
  questions_attempted: number;
  questions_completed: number;
  target_completed: boolean;
  xp_earned: number;
  created_at: string;
  updated_at: string;
}

export interface Streak {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_practice_date: string | null; // YYYY-MM-DD
  available_freezes: number;
  last_freezer_milestone?: number;
  freezerEarned?: boolean;
  updated_at: string;
}

export interface StreakUpdateResult {
  streak: Streak;
  freezerEarned: boolean;
}

export interface XPTransaction {
  id: string;
  user_id: string;
  amount: number;
  source: string;
  reference_id?: string | null;
  created_at: string;
}

export interface QuestionRecommendation extends Question {
  reason?: string;
  expected_success?: number;
  score_breakdown?: Record<string, number>;
  scoreExplanation?: {
    totalScore: number;
    weakTopicBoost: number;
    similarityBoost: number;
    prereqBoost: number;
    difficultyBoost: number;
    revisionBoost: number;
    penalties: number;
  };
}

export interface ProgressSummary {
  overallMastery: number;
  topicMasteries: { topic: Topic; score: number; rating?: number }[];
  strongestTopics: { topic: Topic; score: number }[];
  weakestTopics: { topic: Topic; score: number }[];
  questionsAttempted: number;
  questionsSolved: number;
  independentSolveRate: number;
  solvedWithHelpRate: number;
  failureRate: number;
  currentStreak: number;
  longestStreak: number;
  consistencyScore: number;
  totalXP: number;
  recentActivity: DailyActivity[];
}

export interface WeeklySummary {
  questionsThisWeek: number;
  targetThisWeek: number;
  goalCompletionPercentage: number;
  consistency: number;
  strongestTopic: Topic | null;
  weakestTopic: Topic | null;
  topicsImproved: string[];
  recommendedNextTopic: Topic | null;
}
