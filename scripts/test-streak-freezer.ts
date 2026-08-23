import { updateStreakOnPractice, evaluateStreakStatus } from '../lib/services/streakService';
import { Streak } from '../lib/types';

function assert(condition: boolean, testName: string, detail: string = '') {
  if (!condition) {
    console.error(`❌ FAIL: ${testName} - ${detail}`);
    throw new Error(`Test failed: ${testName} (${detail})`);
  }
  console.log(`✅ PASS: ${testName}`);
}

console.log('=== RUNNING STREAK FREEZER ENGINE AUTOMATED TEST SUITE ===\n');

// --------------------------------------------------------------------------
// TEST 1: User reaches 5 consecutive days -> Expected: +1 freezer
// --------------------------------------------------------------------------
let state: Streak = {
  user_id: 'usr_test_freezer',
  current_streak: 0,
  longest_streak: 0,
  last_practice_date: null,
  available_freezes: 0,
  last_freezer_milestone: 0,
  updated_at: new Date().toISOString(),
};

// Day 1 to Day 5 practice
const days = ['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05'];
for (const day of days) {
  const result = updateStreakOnPractice(state, day);
  state = {
    user_id: result.user_id,
    current_streak: result.current_streak,
    longest_streak: result.longest_streak,
    last_practice_date: result.last_practice_date,
    available_freezes: result.available_freezes,
    last_freezer_milestone: result.last_freezer_milestone,
    updated_at: result.updated_at,
  };
}

assert(
  state.current_streak === 5 && state.available_freezes === 1,
  'Test 1: User reaches 5 consecutive days',
  `streak=${state.current_streak}, freezers=${state.available_freezes} (expected streak=5, freezers=1)`
);

// --------------------------------------------------------------------------
// TEST 2: User refreshes 10 times -> Expected: No additional freezer
// --------------------------------------------------------------------------
const freezesBeforeRefresh = state.available_freezes;
for (let i = 0; i < 10; i++) {
  // Re-evaluating streak on day 5 (same day or passive load)
  const passive = evaluateStreakStatus(state, '2026-08-05');
  const repeatedPractice = updateStreakOnPractice(state, '2026-08-05');
  assert(
    passive.available_freezes === freezesBeforeRefresh && repeatedPractice.available_freezes === freezesBeforeRefresh,
    `Test 2: Idempotency check iteration ${i + 1}`,
    `freezers=${repeatedPractice.available_freezes}`
  );
}

// --------------------------------------------------------------------------
// TEST 3: User reaches 10 consecutive days -> Expected: +2 total freezers
// --------------------------------------------------------------------------
const nextDays = ['2026-08-06', '2026-08-07', '2026-08-08', '2026-08-09', '2026-08-10'];
for (const day of nextDays) {
  const result = updateStreakOnPractice(state, day);
  state = {
    user_id: result.user_id,
    current_streak: result.current_streak,
    longest_streak: result.longest_streak,
    last_practice_date: result.last_practice_date,
    available_freezes: result.available_freezes,
    last_freezer_milestone: result.last_freezer_milestone,
    updated_at: result.updated_at,
  };
}

assert(
  state.current_streak === 10 && state.available_freezes === 2,
  'Test 3: User reaches 10 consecutive days',
  `streak=${state.current_streak}, freezers=${state.available_freezes} (expected streak=10, freezers=2)`
);

// --------------------------------------------------------------------------
// TEST 4: User has freezers and misses 1 day -> Expected: Streak preserved, 1 freezer consumed
// --------------------------------------------------------------------------
// Set state to 1 freezer, 12 day streak (last practiced 2026-08-12)
let freezerTestState: Streak = {
  user_id: 'usr_test_freezer',
  current_streak: 12,
  longest_streak: 12,
  last_practice_date: '2026-08-12',
  available_freezes: 1,
  last_freezer_milestone: 10,
  updated_at: new Date().toISOString(),
};

// Missed 2026-08-13 (1 day missed). Practice on 2026-08-14.
const freezeRes = updateStreakOnPractice(freezerTestState, '2026-08-14');

assert(
  freezeRes.current_streak === 13 && freezeRes.available_freezes === 0,
  'Test 4: User has 1 freezer and misses 1 day',
  `streak=${freezeRes.current_streak}, freezers=${freezeRes.available_freezes} (expected streak=13, freezers=0)`
);

// --------------------------------------------------------------------------
// TEST 5: User has 0 freezers and misses a day -> Expected: Existing streak reset
// --------------------------------------------------------------------------
let noFreezerState: Streak = {
  user_id: 'usr_test_freezer',
  current_streak: 13,
  longest_streak: 13,
  last_practice_date: '2026-08-14',
  available_freezes: 0,
  last_freezer_milestone: 10,
  updated_at: new Date().toISOString(),
};

// Passive check on missed day (2026-08-16, missed 2026-08-15)
const passiveReset = evaluateStreakStatus(noFreezerState, '2026-08-16');
assert(
  passiveReset.current_streak === 0,
  'Test 5a: Passive evaluation resets streak to 0 when no freezers available',
  `streak=${passiveReset.current_streak}`
);

// Practice on 2026-08-16 after missing a day with 0 freezers
const resetRes = updateStreakOnPractice(noFreezerState, '2026-08-16');
assert(
  resetRes.current_streak === 1 && resetRes.available_freezes === 0,
  'Test 5b: Practice attempt resets streak to 1 when no freezers available',
  `streak=${resetRes.current_streak}, freezers=${resetRes.available_freezes}`
);

// --------------------------------------------------------------------------
// TEST 6: User logs out and logs back in -> Expected: Same streak + same freezer balance
// --------------------------------------------------------------------------
const stateBeforeLogout = { ...freezeRes };
// Simulating re-fetch / login session reload from database
const stateAfterLogin = evaluateStreakStatus(stateBeforeLogout, '2026-08-14');

assert(
  stateAfterLogin.current_streak === stateBeforeLogout.current_streak &&
    stateAfterLogin.available_freezes === stateBeforeLogout.available_freezes,
  'Test 6: User logs out and logs back in',
  `streak=${stateAfterLogin.current_streak}, freezers=${stateAfterLogin.available_freezes}`
);

// --------------------------------------------------------------------------
// TEST 7: User reaches 5-day milestone again after using freezer -> Expected: New freezer earned
// --------------------------------------------------------------------------
// Streak was 13 after using freezer on day 14 (milestone was 10).
let postFreezeState: Streak = {
  user_id: freezeRes.user_id,
  current_streak: freezeRes.current_streak, // 13
  longest_streak: freezeRes.longest_streak,
  last_practice_date: freezeRes.last_practice_date, // 2026-08-14
  available_freezes: freezeRes.available_freezes, // 0
  last_freezer_milestone: freezeRes.last_freezer_milestone, // 10
  updated_at: freezeRes.updated_at,
};

// Practice on day 15 (streak becomes 14, milestone 10)
postFreezeState = updateStreakOnPractice(postFreezeState, '2026-08-15');
assert(postFreezeState.current_streak === 14 && postFreezeState.available_freezes === 0, 'Test 7a: Day 15 practice', `streak=${postFreezeState.current_streak}`);

// Practice on day 16 (streak becomes 15, reaches milestone 15 -> +1 freezer earned!)
const milestoneRes = updateStreakOnPractice(postFreezeState, '2026-08-16');
assert(
  milestoneRes.current_streak === 15 && milestoneRes.available_freezes === 1 && milestoneRes.freezerEarned === true,
  'Test 7b: Reaches next 5-day milestone (15) after using freezer',
  `streak=${milestoneRes.current_streak}, freezers=${milestoneRes.available_freezes}, earned=${milestoneRes.freezerEarned}`
);

console.log('\n================================----------------------------');
console.log('🎉 ALL STREAK FREEZER ENGINE AUTOMATED TESTS PASSED CLEANLY!');
console.log('================================----------------------------\n');
