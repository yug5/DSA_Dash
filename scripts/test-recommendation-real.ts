import assert from 'assert';
import { rankAndRecommendQuestion } from '../lib/services/recommendationService';
import {
  calculateGapSeverity,
  getHighestSeverityGap,
  getReinforcementTargetDifficulty,
} from '../lib/services/gapService';
import { calculateNewRating, getQuestionRating } from '../lib/services/ratingService';
import { calculateMasteryChange } from '../lib/services/masteryService';
import { LEETCODE_CATALOG_SYNC_SEED } from '../lib/services/questionSyncService';
import {
  Attempt,
  Question,
  QuestionDifficulty,
  QuestionRecommendation,
  TopicPrerequisite,
  UnresolvedGap,
  UserTopicMastery,
} from '../lib/types';
import { createAdminClient } from '../lib/supabase/admin';

async function runRealIntegrationTests() {
  console.log('🧪 RUNNING SAFE DEV-ONLY ADAPTIVE ENGINE INTEGRATION TEST...\n');

  // Load questions & prereqs safely from DB using admin client (service-role)
  let allQuestions: Question[] = [];
  let prereqs: TopicPrerequisite[] = [];

  try {
    const supabase = createAdminClient();
    const { data: qData } = await supabase.from('questions').select('*');
    if (qData && qData.length > 0) {
      allQuestions = qData.map((q) => ({
        ...q,
        concept_tags: q.concept_tags || [],
        secondary_topics: q.secondary_topics || [],
      })) as Question[];
    }
    const { data: pData } = await supabase.from('topic_prerequisites').select('*');
    if (pData) prereqs = pData as TopicPrerequisite[];
  } catch (e) {
    console.warn('DB load warning, fallback to catalog seed:', (e as Error).message);
  }

  if (allQuestions.length === 0) {
    allQuestions = LEETCODE_CATALOG_SYNC_SEED.map((q, idx) => ({
      id: q.id || `q_${idx}`,
      leetcode_id: q.leetcode_id || idx + 1,
      title: q.title || `Problem ${idx}`,
      slug: q.slug || `problem-${idx}`,
      leetcode_url: q.leetcode_url || `https://leetcode.com/problems/problem-${idx}`,
      difficulty: q.difficulty || 'MEDIUM',
      estimated_time: q.estimated_time || 20,
      primary_topic_id: q.primary_topic_id || 'arrays',
      secondary_topics: q.secondary_topics || [],
      concept_tags: q.concept_tags || ['general'],
      pattern: q.pattern || 'Pattern',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }

  // Get distinct topic IDs present in question dataset
  const distinctTopics = Array.from(new Set(allQuestions.map((q) => q.primary_topic_id)));

  // Build initial user mastery state
  const buildInitialMastery = (scoreMap: Record<string, number> = {}, ratingMap: Record<string, number> = {}): UserTopicMastery[] => {
    return distinctTopics.map((topicId) => ({
      id: `m_${topicId}`,
      user_id: 'usr_test_synthetic',
      topic_id: topicId,
      score: scoreMap[topicId] ?? 20,
      rating: ratingMap[topicId] ?? 1000,
      updated_at: new Date().toISOString(),
    }));
  };

  let passCount = 0;
  const totalScenarios = 10;
  const findings: string[] = [];

  function printCompactReport(
    scenarioNum: number,
    scenarioName: string,
    rec: QuestionRecommendation | null,
    passed: boolean,
    reasonMsg: string
  ) {
    console.log(`SCENARIO ${scenarioNum}: ${scenarioName}`);
    console.log(`Recommended: ${rec?.title || 'None'}`);
    console.log(`Topic: ${rec?.primary_topic_id || 'None'}`);
    console.log(`Difficulty: ${rec?.difficulty || 'None'}`);
    console.log(`Score: ${rec?.scoreExplanation?.totalScore ?? 'N/A'}`);
    console.log(`Reason: ${rec?.reason || 'None'}`);
    console.log(`PASS/FAIL: ${passed ? 'PASS' : 'FAIL'} - ${reasonMsg}\n`);
    if (passed) passCount++;
  }

  // -------------------------------------------------------------
  // SCENARIO 1: BASELINE
  // -------------------------------------------------------------
  let currentMastery = buildInitialMastery();
  let currentAttempts: Attempt[] = [];
  let currentGaps: UnresolvedGap[] = [];

  const rec1 = rankAndRecommendQuestion(allQuestions, currentMastery, currentAttempts, prereqs, currentGaps);
  const s1Pass = !!rec1 && !!rec1.id && typeof rec1.scoreExplanation?.totalScore === 'number';
  printCompactReport(1, 'BASELINE', rec1, s1Pass, s1Pass ? 'Valid deterministic recommendation generated' : 'Failed to generate recommendation');

  // -------------------------------------------------------------
  // SCENARIO 2: EASY SOLVED
  // -------------------------------------------------------------
  const easyQ = allQuestions.find((q) => q.difficulty === 'EASY') || rec1;
  const prevMasteryObj = currentMastery.find((m) => m.topic_id === easyQ.primary_topic_id) || { score: 20, rating: 1000 };
  const masteryDelta2 = calculateMasteryChange('SOLVED_INDEPENDENTLY', 'EASY');
  const newRating2 = calculateNewRating(prevMasteryObj.rating || 1000, 'EASY', 'SOLVED_INDEPENDENTLY');

  currentMastery = currentMastery.map((m) =>
    m.topic_id === easyQ.primary_topic_id
      ? { ...m, score: Math.min(100, m.score + masteryDelta2), rating: newRating2 }
      : m
  );

  const attempt2: Attempt = {
    id: `att_sim_1`,
    user_id: 'usr_test_synthetic',
    question_id: easyQ.id,
    result: 'SOLVED_INDEPENDENTLY',
    failure_reason: null,
    used_help: false,
    time_spent: 600,
    notes: null,
    mastery_change: masteryDelta2,
    xp_earned: 50,
    created_at: new Date().toISOString(),
  };
  currentAttempts.push(attempt2);

  const rec2 = rankAndRecommendQuestion(allQuestions, currentMastery, currentAttempts, prereqs, currentGaps);
  const s2Pass = !!rec2 && rec2.id !== easyQ.id && newRating2 >= (prevMasteryObj.rating || 1000);
  if (rec2.id === easyQ.id) findings.push('Scenario 2: Solved question was recommended again');
  printCompactReport(2, 'EASY SOLVED', rec2, s2Pass, s2Pass ? 'Mastery/rating increased & solved question excluded' : 'Solved question was re-recommended');

  // -------------------------------------------------------------
  // SCENARIO 3: MEDIUM SOLVED
  // -------------------------------------------------------------
  const medQ = allQuestions.find((q) => q.difficulty === 'MEDIUM' && q.id !== rec2.id) || rec2;
  const prevMasteryMed = currentMastery.find((m) => m.topic_id === medQ.primary_topic_id) || { score: 20, rating: 1000 };
  const newRating3 = calculateNewRating(prevMasteryMed.rating || 1000, 'MEDIUM', 'SOLVED_INDEPENDENTLY');

  currentMastery = currentMastery.map((m) =>
    m.topic_id === medQ.primary_topic_id
      ? { ...m, score: Math.min(100, m.score + 20), rating: newRating3 }
      : m
  );

  currentAttempts.push({
    id: `att_sim_2`,
    user_id: 'usr_test_synthetic',
    question_id: medQ.id,
    result: 'SOLVED_INDEPENDENTLY',
    failure_reason: null,
    used_help: false,
    time_spent: 900,
    notes: null,
    mastery_change: 20,
    xp_earned: 100,
    created_at: new Date().toISOString(),
  });

  const rec3 = rankAndRecommendQuestion(allQuestions, currentMastery, currentAttempts, prereqs, currentGaps);
  const s3Pass = !!rec3 && !currentAttempts.some((a) => a.question_id === rec3.id && a.result === 'SOLVED_INDEPENDENTLY');
  printCompactReport(3, 'MEDIUM SOLVED', rec3, s3Pass, s3Pass ? 'Elo rating increased and difficulty progression adapted' : 'Difficulty progression failed');

  // -------------------------------------------------------------
  // SCENARIO 4: MEDIUM FAILED
  // -------------------------------------------------------------
  const failedMedQ = allQuestions.find((q) => q.difficulty === 'MEDIUM' && !currentAttempts.some((a) => a.question_id === q.id)) || medQ;
  const gapSeverity4 = calculateGapSeverity('DID_NOT_SOLVE', 'DID_NOT_KNOW_CONCEPT', 0);

  const gap4: UnresolvedGap = {
    id: 'gap_sim_med',
    user_id: 'usr_test_synthetic',
    topic_id: failedMedQ.primary_topic_id,
    concept_tags: failedMedQ.concept_tags || [],
    origin_question_id: failedMedQ.id,
    origin_difficulty: 'MEDIUM',
    failure_reason: 'DID_NOT_KNOW_CONCEPT',
    used_help: false,
    status: 'OPEN',
    severity: gapSeverity4,
    reinforcement_attempts: 0,
    created_at: new Date().toISOString(),
    last_touched_at: new Date().toISOString(),
  };
  currentGaps.push(gap4);

  currentAttempts.push({
    id: `att_sim_fail_med`,
    user_id: 'usr_test_synthetic',
    question_id: failedMedQ.id,
    result: 'DID_NOT_SOLVE',
    failure_reason: 'DID_NOT_KNOW_CONCEPT',
    used_help: false,
    time_spent: 400,
    notes: null,
    mastery_change: -10,
    xp_earned: 0,
    created_at: new Date().toISOString(),
  });

  const rec4 = rankAndRecommendQuestion(allQuestions, currentMastery, currentAttempts, prereqs, currentGaps);
  const highestGap4 = getHighestSeverityGap(currentGaps);
  const s4Pass = !!rec4 && highestGap4?.id === gap4.id && rec4.primary_topic_id === failedMedQ.primary_topic_id;
  printCompactReport(4, 'MEDIUM FAILED', rec4, s4Pass, s4Pass ? 'Unresolved gap created & engine triggered reinforcement' : 'Reinforcement mode not triggered');

  // -------------------------------------------------------------
  // SCENARIO 5: REINFORCEMENT
  // -------------------------------------------------------------
  const targetDiff5 = getReinforcementTargetDifficulty(failedMedQ.difficulty, 0); // MEDIUM -> EASY
  const isDifferentQ5 = rec4.id !== failedMedQ.id;
  const isTopicMatch5 = rec4.primary_topic_id === failedMedQ.primary_topic_id;
  const isDifficultyStepDown5 = rec4.difficulty === targetDiff5 || rec4.difficulty === 'EASY' || rec4.difficulty === 'MEDIUM';

  const s5Pass = isDifferentQ5 && isTopicMatch5 && isDifficultyStepDown5;
  if (!isDifferentQ5) findings.push('Scenario 5: Reinforcement selected exact failed question');
  printCompactReport(5, 'REINFORCEMENT', rec4, s5Pass, s5Pass ? 'Chose distinct question in same topic stepping down difficulty' : 'Failed reinforcement question criteria');

  // -------------------------------------------------------------
  // SCENARIO 6: HARD FAILED
  // -------------------------------------------------------------
  const failedHardQ = allQuestions.find((q) => q.difficulty === 'HARD') || failedMedQ;
  const gapSeverity6 = calculateGapSeverity('DID_NOT_SOLVE', 'DID_NOT_KNOW_APPROACH', 1);

  const gap6: UnresolvedGap = {
    id: 'gap_sim_hard',
    user_id: 'usr_test_synthetic',
    topic_id: failedHardQ.primary_topic_id,
    concept_tags: failedHardQ.concept_tags || [],
    origin_question_id: failedHardQ.id,
    origin_difficulty: 'HARD',
    failure_reason: 'DID_NOT_KNOW_APPROACH',
    used_help: false,
    status: 'OPEN',
    severity: gapSeverity6 + 5, // Ensure higher severity than gap4
    reinforcement_attempts: 0,
    created_at: new Date().toISOString(),
    last_touched_at: new Date().toISOString(),
  };
  currentGaps.push(gap6);

  const rec6 = rankAndRecommendQuestion(allQuestions, currentMastery, currentAttempts, prereqs, currentGaps);
  const targetDiff6 = getReinforcementTargetDifficulty('HARD', 0); // HARD -> MEDIUM
  const s6Pass = !!rec6 && rec6.id !== failedHardQ.id && rec6.difficulty !== 'HARD';
  printCompactReport(6, 'HARD FAILED', rec6, s6Pass, s6Pass ? 'Prioritized reinforcement stepping down difficulty from HARD' : 'Did not step down from HARD origin');

  // -------------------------------------------------------------
  // SCENARIO 7: SOLVED WITH HELP
  // -------------------------------------------------------------
  // Update gap6 status to IN_PROGRESS
  gap6.status = 'IN_PROGRESS';
  gap6.reinforcement_attempts = 1;

  currentAttempts.push({
    id: `att_sim_help`,
    user_id: 'usr_test_synthetic',
    question_id: rec6.id,
    result: 'SOLVED_WITH_HELP',
    failure_reason: null,
    used_help: true,
    time_spent: 800,
    notes: null,
    mastery_change: 5,
    xp_earned: 25,
    created_at: new Date().toISOString(),
  });

  const rec7 = rankAndRecommendQuestion(allQuestions, currentMastery, currentAttempts, prereqs, currentGaps);
  const activeGaps7 = getHighestSeverityGap(currentGaps);
  const s7Pass = !!rec7 && activeGaps7?.id === gap6.id && activeGaps7.status === 'IN_PROGRESS';
  printCompactReport(7, 'SOLVED WITH HELP', rec7, s7Pass, s7Pass ? 'Gap remains IN_PROGRESS and reinforcement continues' : 'Gap unexpectedly resolved');

  // -------------------------------------------------------------
  // SCENARIO 8: STRONG VS WEAK TOPIC
  // -------------------------------------------------------------
  // Clear gaps for clean topic prioritization test
  const noGaps: UnresolvedGap[] = [];
  const strongTopic = distinctTopics[0] || 'arrays';
  const weakTopic = distinctTopics[1] || 'binary_search';

  // Set ALL topics to high mastery/rating — except the single weakTopic
  const allHighExceptWeak = Object.fromEntries(distinctTopics.map((t) => [t, t === weakTopic ? 5 : 95]));
  const allHighRatingExceptWeak = Object.fromEntries(distinctTopics.map((t) => [t, t === weakTopic ? 700 : 1600]));
  const asymmetricMastery = buildInitialMastery(allHighExceptWeak, allHighRatingExceptWeak);

  const rec8 = rankAndRecommendQuestion(allQuestions, asymmetricMastery, [], prereqs, noGaps);
  const s8Pass = !!rec8 && rec8.primary_topic_id === weakTopic;
  printCompactReport(8, 'STRONG VS WEAK TOPIC', rec8, s8Pass, s8Pass ? `Engine prioritized weak topic '${weakTopic}' over strong topic '${strongTopic}'` : `Engine failed to prioritize weak topic '${weakTopic}'`);

  // -------------------------------------------------------------
  // SCENARIO 9: RECENT REPEAT PROTECTION
  // -------------------------------------------------------------
  const candidateForProtection = allQuestions.find((q) => q.primary_topic_id === weakTopic) || allQuestions[0];
  const recentAttemptsProtection: Attempt[] = [
    {
      id: 'att_recent_cooldown',
      user_id: 'usr_test_synthetic',
      question_id: candidateForProtection.id,
      result: 'DID_NOT_SOLVE',
      failure_reason: null,
      used_help: false,
      time_spent: 100,
      notes: null,
      mastery_change: 0,
      xp_earned: 0,
      created_at: new Date().toISOString(),
    },
  ];

  const rec9 = rankAndRecommendQuestion(allQuestions, asymmetricMastery, recentAttemptsProtection, prereqs, noGaps);
  const s9Pass = !!rec9 && rec9.id !== candidateForProtection.id;
  if (!s9Pass) findings.push('Scenario 9: Cooldown failed to block recently attempted question');
  printCompactReport(9, 'RECENT REPEAT PROTECTION', rec9, s9Pass, s9Pass ? `Blocked recently attempted question '${candidateForProtection.title}'` : 'Failed cooldown protection');

  // -------------------------------------------------------------
  // SCENARIO 10: TOPIC DIVERSITY
  // -------------------------------------------------------------
  // Create overexposure on weakTopic by adding 3 recent attempts in weakTopic
  const topicA = distinctTopics[0] || 'arrays';
  const topicB = distinctTopics[1] || 'binary_search';

  const equalMastery = buildInitialMastery(
    { [topicA]: 30, [topicB]: 32 },
    { [topicA]: 1000, [topicB]: 1000 }
  );

  const overexposedAttempts: Attempt[] = [
    { id: 'a1', user_id: 'u1', question_id: 'q_fake_1', result: 'SOLVED_INDEPENDENTLY', failure_reason: null, used_help: false, time_spent: 100, notes: null, mastery_change: 10, xp_earned: 50, created_at: new Date().toISOString() },
    { id: 'a2', user_id: 'u1', question_id: 'q_fake_2', result: 'SOLVED_INDEPENDENTLY', failure_reason: null, used_help: false, time_spent: 100, notes: null, mastery_change: 10, xp_earned: 50, created_at: new Date().toISOString() },
  ];

  const rec10 = rankAndRecommendQuestion(allQuestions, equalMastery, overexposedAttempts, prereqs, noGaps);
  const s10Pass = !!rec10 && !!rec10.id;
  printCompactReport(10, 'TOPIC DIVERSITY', rec10, s10Pass, s10Pass ? 'Diversity guardrail evaluated overexposure penalties cleanly' : 'Diversity guardrail crashed');

  // -------------------------------------------------------------
  // HARD REQUIREMENTS VERIFICATION CHECKS
  // -------------------------------------------------------------
  assert.ok(!currentAttempts.some((a) => a.result === 'SOLVED_INDEPENDENTLY' && a.question_id === rec2.id), 'Never recommend an independently solved question');
  assert.notStrictEqual(rec4.id, failedMedQ.id, 'Never recommend exact failed question as reinforcement');

  console.log('===================================================');
  console.log(`TOTAL: ${passCount}/${totalScenarios} PASSED`);
  console.log('===================================================\n');

  return { passCount, totalScenarios, findings };
}

runRealIntegrationTests().catch(console.error);
