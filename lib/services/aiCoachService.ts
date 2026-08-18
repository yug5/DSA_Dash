import { ProgressSummary, Topic, UserTopicMastery } from '@/lib/types';

export interface AICoachAdvice {
  headline: string;
  advice: string;
  focusPattern: string;
  encouragement: string;
}

/**
 * Generates personalized, telemetry-driven AI Coach guidance.
 * Operates deterministically as a fallback when an external LLM API key is absent.
 */
export async function getAICoachAdvice(
  summary: ProgressSummary | null,
  weakestTopics: { topic: Topic; score: number }[]
): Promise<AICoachAdvice> {
  // If external OPENAI_API_KEY / GEMINI_API_KEY is configured on server, it could be called here.
  // Otherwise, use deterministic telemetry interpretation engine.

  const masteryScore = summary?.overallMastery ?? 30;
  const solveRate = summary?.independentSolveRate ?? 50;
  const weakestTopicName = weakestTopics[0]?.topic.name || 'Dynamic Programming';
  const weakestScore = weakestTopics[0]?.score ?? 20;

  let headline = 'Maintain Consistent Problem-Solving Pace';
  let advice = `Focus on strengthening foundational patterns in ${weakestTopicName}. Work through Easy and Medium problems to build intuitive pattern recognition before tackling complex variations.`;
  let focusPattern = `${weakestTopicName} — Target 3 problems this week`;
  let encouragement = 'Consistency builds algorithmic intuition. Keep pushing forward!';

  if (solveRate < 40) {
    headline = 'Emphasize Concept Decomposition Over Speed';
    advice = `Your independent solve rate is currently ${solveRate}%. Take 10 minutes to write pseudocode on paper before writing code. Focus on ${weakestTopicName} (${weakestScore}/100 mastery).`;
    focusPattern = 'Pseudocode & Edge Case Pre-check';
    encouragement = 'Analyzing why a problem failed is 2x more valuable than getting an easy AC!';
  } else if (masteryScore > 70) {
    headline = 'Advanced Pattern Synthesis & Time Complexity Tuning';
    advice = `Solid performance! Your overall mastery is ${masteryScore}/100. Challenge yourself with Medium-Hard problems in ${weakestTopicName} to refine optimal space-time trade-offs.`;
    focusPattern = 'Optimal O(N) Space Reduction';
    encouragement = 'Excellent mastery trajectory! You are ready for interview-level problem constraints.';
  } else if (summary && summary.currentStreak >= 3) {
    headline = `${summary.currentStreak}-Day Streak Momentum!`;
    advice = `Great consistency. Keep up daily practice on ${weakestTopicName}. Short daily sessions yield 3x higher retention than weekend cramming.`;
    focusPattern = 'Daily Micro-Sessions (20-30 mins)';
    encouragement = 'Daily consistency is the secret weapon for mastering DSA!';
  }

  return {
    headline,
    advice,
    focusPattern,
    encouragement,
  };
}
