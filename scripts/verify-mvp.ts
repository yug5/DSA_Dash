import { calculateMasteryChange, clampMastery, getInitialMasteryForExperience } from '../lib/services/masteryService';
import { rankAndRecommendQuestion, RECOMMENDATION_WEIGHTS } from '../lib/services/recommendationService';
import { updateStreakOnPractice } from '../lib/services/streakService';
import { calculateAttemptXP } from '../lib/services/xpService';
import { getDailyMotivationMessage } from '../lib/services/motivationService';
import { INITIAL_QUESTIONS, INITIAL_TOPICS, INITIAL_PREREQUISITES } from '../lib/services/mockDb';
import { completeOnboarding, recordQuestionAttempt, getNextRecommendation, updateGoalTarget } from '../lib/services/dataService';

console.log('=== RUNNING ADAPTIVE DSA PRACTICE PLATFORM SERVICE TESTS ===\n');

// 1. Mastery Engine Tests
console.log('1. Testing Mastery Calculations...');
const mediumIndependent = calculateMasteryChange('SOLVED_INDEPENDENTLY', 'MEDIUM');
console.log(`Medium Independent Change: ${mediumIndependent} (Expected: +10.0)`);
if (mediumIndependent !== 10.0) throw new Error('Mastery calculation failed for Medium Independent');

const mediumFailed = calculateMasteryChange('DID_NOT_SOLVE', 'MEDIUM');
console.log(`Medium Failed Change: ${mediumFailed} (Expected: -6.2)`);
if (mediumFailed !== -6.2) throw new Error('Mastery calculation failed for Medium Failed');

const clampedMax = clampMastery(105);
console.log(`Clamped Max: ${clampedMax} (Expected: 100)`);
if (clampedMax !== 100) throw new Error('Clamp max failed');

// 2. XP Engine Tests
console.log('\n2. Testing XP Calculations...');
const xpRes = calculateAttemptXP('HARD', 'SOLVED_INDEPENDENTLY', true);
console.log(`Hard Independent + Target Completed XP: ${xpRes.totalXP} (Expected: 65)`);
if (xpRes.totalXP !== 65) throw new Error('XP calculation failed');

// 3. Streak & Freeze Tests
console.log('\n3. Testing Streak & Streak Freeze Engine...');
const initialStreak = {
  user_id: 'usr_test',
  current_streak: 3,
  longest_streak: 5,
  last_practice_date: '2026-08-12', // 2 days ago relative to 2026-08-14
  available_freezes: 2,
  updated_at: new Date().toISOString(),
};

const freezeStreak = updateStreakOnPractice(initialStreak, '2026-08-14');
console.log(`Streak after 1 day missed with freeze: current=${freezeStreak.current_streak}, freezes=${freezeStreak.available_freezes}`);
if (freezeStreak.current_streak !== 4 || freezeStreak.available_freezes !== 1) {
  throw new Error('Streak freeze logic failed');
}

// 4. Motivation Messages Tests
console.log('\n4. Testing Motivation Messages...');
const targetCompMsg = getDailyMotivationMessage(5, 5);
console.log(`Target Completed Msg: "${targetCompMsg}"`);
const partialMsg = getDailyMotivationMessage(5, 1);
console.log(`Partial Msg: "${partialMsg}"`);
if (targetCompMsg.includes('FAILED') || partialMsg.includes('FAILED')) {
  throw new Error('Punitive messaging detected');
}

// 5. End-to-End Atomic Attempt Flow
async function runE2ETest() {
  console.log('\n5. Testing End-to-End Onboarding & Recommendation Flow...');
  await completeOnboarding('INTERMEDIATE', 5, 30);
  const firstRec = await getNextRecommendation();
  console.log(`First Recommendation: ${firstRec.title} (${firstRec.difficulty}) - Topic: ${firstRec.primary_topic_id}`);

  const attemptRes = await recordQuestionAttempt({
    questionId: firstRec.id,
    result: 'SOLVED_INDEPENDENTLY',
    usedHelp: false,
    timeSpent: 20,
  });

  console.log(`Attempt Recorded! Mastery Δ: ${attemptRes.masteryChange}, XP: +${attemptRes.xpEarned}, New Streak: ${attemptRes.streak.current_streak}`);
  const nextRec = await getNextRecommendation();
  console.log(`Next Recommended Question: ${nextRec.title}`);

  console.log('\n6. Testing Topic Filtering in Goal & Recommendation Engine...');
  await updateGoalTarget(5, 30, ['arrays', 'two_pointers']);
  const topicFilteredRec = await getNextRecommendation();
  console.log(`Filtered Recommendation: ${topicFilteredRec.title} - Topic: ${topicFilteredRec.primary_topic_id}`);
  if (!['arrays', 'two_pointers'].includes(topicFilteredRec.primary_topic_id)) {
    throw new Error(`Topic filter failed: recommendation topic ${topicFilteredRec.primary_topic_id} not in ['arrays', 'two_pointers']`);
  }
  console.log('Topic filtering test PASSED!');

  console.log('\n=== ALL MVP SERVICE VERIFICATION TESTS PASSED SUCCESSFULLY! ===');
}
runE2ETest();

