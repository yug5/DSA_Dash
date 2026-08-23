import { generateAIChatResponse } from '../lib/services/aiChatService';

function assert(condition: boolean, testName: string, detail: string = '') {
  if (!condition) {
    console.error(`❌ FAIL: ${testName} - ${detail}`);
    throw new Error(`Test failed: ${testName} (${detail})`);
  }
  console.log(`✅ PASS: ${testName}`);
}

console.log('=== RUNNING NEW FEATURES AUTOMATED VERIFICATION SUITE ===\n');

// --------------------------------------------------------------------------
// TEST 1: App Navigation Question ("Where do I change the topics I want to practice?")
// --------------------------------------------------------------------------
const topicNavResponse = generateAIChatResponse({
  message: 'Where do I change the topics I want to practice?',
});
assert(
  topicNavResponse.includes('Go to Goals → Edit Goal → Topics'),
  'Test 1: App Navigation exact path lookup for topic selection',
  `received: "${topicNavResponse}"`
);

// --------------------------------------------------------------------------
// TEST 2: Goals Navigation Question ("Where do I change my goals?")
// --------------------------------------------------------------------------
const goalNavResponse = generateAIChatResponse({
  message: 'Where do I change my goals?',
});
assert(
  goalNavResponse.includes('Go to Goals → Edit Goal'),
  'Test 2: App Navigation exact path lookup for goals',
  `received: "${goalNavResponse}"`
);

// --------------------------------------------------------------------------
// TEST 3: DSA Prerequisite Question ("What should I know before starting DP?")
// --------------------------------------------------------------------------
const dpPrereqResponse = generateAIChatResponse({
  message: 'What should I know before starting DP?',
});
assert(
  dpPrereqResponse.includes('Recursion') && dpPrereqResponse.includes('Dynamic Programming'),
  'Test 3: DSA Prerequisite answer for DP',
  `received: "${dpPrereqResponse}"`
);

// --------------------------------------------------------------------------
// TEST 4: DSA Prerequisite Question ("Should I learn recursion before trees?")
// --------------------------------------------------------------------------
const treePrereqResponse = generateAIChatResponse({
  message: 'Should I learn recursion before trees?',
});
assert(
  treePrereqResponse.includes('Trees') && treePrereqResponse.includes('Recursion'),
  'Test 4: DSA Prerequisite answer for Trees',
  `received: "${treePrereqResponse}"`
);

// --------------------------------------------------------------------------
// TEST 5: Non-Existent App Feature ("Where is multiplayer mode?")
// --------------------------------------------------------------------------
const unhandledResponse = generateAIChatResponse({
  message: 'Where is multiplayer mode?',
});
assert(
  unhandledResponse === "I don't see that option in the current version of DSA_Dash.",
  'Test 5: Handling of non-existent feature query',
  `received: "${unhandledResponse}"`
);

console.log('\n================================----------------------------');
console.log('🎉 ALL NEW FEATURE VERIFICATION TESTS PASSED CLEANLY!');
console.log('================================----------------------------\n');
