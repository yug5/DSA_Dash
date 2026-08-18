import { ALGORITHM_CONFIG } from '@/lib/config/algorithmConfig';
import {
  AttemptResult,
  FailureReason,
  Question,
  QuestionDifficulty,
  UnresolvedGap,
} from '@/lib/types';
import { createClient } from '@/lib/supabase/client';

/**
 * Calculates failure severity based on result, failure blocker reason, and open gap frequency.
 */
export function calculateGapSeverity(
  result: AttemptResult,
  failureReason?: FailureReason | null,
  existingOpenGapCount: number = 0
): number {
  let severity = ALGORITHM_CONFIG.SEVERITY.RESULT_BASE[result] ?? 1;

  if (failureReason) {
    severity += ALGORITHM_CONFIG.SEVERITY.BLOCKER_WEIGHTS[failureReason] ?? 0;
  }

  // Increase severity if multiple open gaps already exist in this topic
  severity += Math.min(3, existingOpenGapCount);

  return Math.max(1, severity);
}

/**
 * Fetches all unresolved gaps (OPEN or IN_PROGRESS) for a user.
 */
export function getActiveGapsFromLocal(allGaps: UnresolvedGap[]): UnresolvedGap[] {
  return allGaps.filter((g) => g.status === 'OPEN' || g.status === 'IN_PROGRESS');
}

/**
 * Retrieves highest-severity active gap for reinforcement mode.
 */
export function getHighestSeverityGap(gaps: UnresolvedGap[]): UnresolvedGap | null {
  const activeGaps = getActiveGapsFromLocal(gaps);
  if (activeGaps.length === 0) return null;

  return [...activeGaps].sort((a, b) => {
    if (b.severity !== a.severity) {
      return b.severity - a.severity;
    }
    return new Date(b.last_touched_at).getTime() - new Date(a.last_touched_at).getTime();
  })[0];
}

/**
 * Determines target reinforcement difficulty stepping down after failures:
 * Easy -> Easy
 * Medium -> Easy (first failure) -> Easy
 * Hard -> Medium (first failure) -> Easy (repeated failure)
 */
export function getReinforcementTargetDifficulty(
  originDifficulty: QuestionDifficulty,
  reinforcementAttempts: number
): QuestionDifficulty {
  if (originDifficulty === 'HARD') {
    return reinforcementAttempts > 1 ? 'EASY' : 'MEDIUM';
  }
  if (originDifficulty === 'MEDIUM') {
    return 'EASY';
  }
  return 'EASY';
}

/**
 * Async helper to fetch user gaps from Supabase or memory.
 */
export async function getUserUnresolvedGaps(userId?: string): Promise<UnresolvedGap[]> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const uid = userId || user?.id;

  if (!uid) return [];

  const { data, error } = await supabase
    .from('unresolved_gaps')
    .select('*')
    .eq('user_id', uid)
    .neq('status', 'RESOLVED')
    .order('severity', { ascending: false });

  if (error || !data) return [];
  return data as UnresolvedGap[];
}

/**
 * Creates or updates an UnresolvedGap on attempt.
 */
export async function updateUnresolvedGapsOnAttempt(params: {
  userId: string;
  question: Question;
  result: AttemptResult;
  failureReason?: FailureReason | null;
  usedHelp: boolean;
}): Promise<UnresolvedGap | null> {
  const supabase = createClient();
  const { userId, question, result, failureReason, usedHelp } = params;

  // Independent solve resolves any matching open gap in this topic/concept
  if (result === 'SOLVED_INDEPENDENTLY') {
    const activeGaps = await getUserUnresolvedGaps(userId);
    const matchingGap = activeGaps.find((g) => {
      if (g.topic_id !== question.primary_topic_id) return false;
      if (g.concept_tags.length === 0 || (question.concept_tags ?? []).length === 0) return true;
      return g.concept_tags.some((tag) => (question.concept_tags ?? []).includes(tag));
    });

    if (matchingGap) {
      await supabase
        .from('unresolved_gaps')
        .update({
          status: 'RESOLVED',
          resolved_at: new Date().toISOString(),
          last_touched_at: new Date().toISOString(),
        })
        .eq('id', matchingGap.id);
    }
    return null;
  }

  // Result is DID_NOT_SOLVE or SOLVED_WITH_HELP -> Create or update gap
  const activeGaps = await getUserUnresolvedGaps(userId);
  const openGapCountInTopic = activeGaps.filter((g) => g.topic_id === question.primary_topic_id).length;
  const newSeverity = calculateGapSeverity(result, failureReason, openGapCountInTopic);

  const existingGap = activeGaps.find((g) => {
    if (g.topic_id !== question.primary_topic_id) return false;
    if (g.concept_tags.length === 0 || (question.concept_tags ?? []).length === 0) return true;
    return g.concept_tags.some((tag) => (question.concept_tags ?? []).includes(tag));
  });

  if (existingGap) {
    const updatedGapPayload = {
      severity: Math.max(existingGap.severity, newSeverity),
      reinforcement_attempts: existingGap.reinforcement_attempts + 1,
      status: 'IN_PROGRESS' as const,
      last_touched_at: new Date().toISOString(),
    };

    await supabase
      .from('unresolved_gaps')
      .update(updatedGapPayload)
      .eq('id', existingGap.id);

    return {
      ...existingGap,
      ...updatedGapPayload,
    };
  }

  const newGapPayload = {
    user_id: userId,
    topic_id: question.primary_topic_id,
    concept_tags: question.concept_tags || [],
    origin_question_id: question.id,
    origin_difficulty: question.difficulty,
    failure_reason: failureReason || null,
    used_help: usedHelp,
    status: 'OPEN' as const,
    severity: newSeverity,
    reinforcement_attempts: 0,
    created_at: new Date().toISOString(),
    last_touched_at: new Date().toISOString(),
  };

  const { data } = await supabase
    .from('unresolved_gaps')
    .insert([newGapPayload])
    .select()
    .single();

  return data as UnresolvedGap;
}
