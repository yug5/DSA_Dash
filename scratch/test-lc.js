async function testSortedCatalog() {
  const [lcRes, spRes] = await Promise.all([
    fetch('https://leetcode.com/api/problems/all/'),
    fetch('https://raw.githubusercontent.com/SeanPrashad/leetcode-patterns/main/src/data/questions.json').catch(() => null)
  ]);

  const lcData = await lcRes.json();
  const spData = spRes ? await spRes.json() : [];
  const spQuestions = Array.isArray(spData) ? spData : spData.data || [];

  // Map of slug -> SeanPrashad pattern topics
  const spTopicMap = new Map();
  spQuestions.forEach(q => {
    if (q.slug && q.pattern) {
      spTopicMap.set(q.slug, q.pattern);
    }
  });

  const pairs = lcData.stat_status_pairs || [];
  const freePairs = pairs.filter(p => !p.paid_only);

  // Sort by frontend_question_id ascending (LeetCode 1, 2, 3...)
  freePairs.sort((a, b) => (a.stat.frontend_question_id || 0) - (b.stat.frontend_question_id || 0));

  const targetPairs = freePairs.slice(0, 1000);

  const difficultyMap = { 1: 'EASY', 2: 'MEDIUM', 3: 'HARD' };
  const counts = { EASY: 0, MEDIUM: 0, HARD: 0 };
  const topicCounts = {};

  const TOPIC_RULES = [
    { topicId: 'two_pointers', keywords: ['two-pointers', 'two-pointer', '3sum', '4sum', 'container-with-most-water', 'trapping-rain-water', 'valid-palindrome', 'sort-colors', 'move-zeroes', 'remove-duplicates'] },
    { topicId: 'sliding_window', keywords: ['sliding-window', 'substring-without-repeating', 'character-replacement', 'minimum-window', 'fruit-into-baskets', 'permutation-in-string', 'max-consecutive-ones'] },
    { topicId: 'binary_search', keywords: ['binary-search', 'search-in-rotated', 'find-minimum-in-rotated', 'search-a-2d-matrix', 'koko-eating', 'first-bad-version', 'find-first-and-last-position', 'sqrt'] },
    { topicId: 'linked_lists', keywords: ['linked-list', 'linkedlist', 'reverse-linked', 'merge-two-sorted-lists', 'reorder-list', 'remove-nth-node', 'copy-list-with-random-pointer', 'add-two-numbers', 'lru-cache', 'swap-nodes'] },
    { topicId: 'stack', keywords: ['stack', 'valid-parentheses', 'min-stack', 'eval-rpn', 'generate-parentheses', 'daily-temperatures', 'car-fleet', 'largest-rectangle-in-histogram', 'monotonic', 'calculator', 'decode-string'] },
    { topicId: 'queue', keywords: ['queue', 'deque', 'recent-calls', 'sliding-window-maximum'] },
    { topicId: 'trees', keywords: ['tree', 'binary-tree', 'invert-binary-tree', 'maximum-depth', 'diameter-of-binary-tree', 'balanced-binary-tree', 'same-tree', 'subtree-of-another', 'lowest-common-ancestor', 'traversal', 'path-sum'] },
    { topicId: 'bst', keywords: ['bst', 'binary-search-tree', 'search-in-a-binary-search-tree', 'insert-into-a-binary-search-tree', 'validate-binary-search-tree', 'kth-smallest-element-in-a-bst'] },
    { topicId: 'graphs', keywords: ['graph', 'island', 'clone-graph', 'course-schedule', 'pacific-atlantic', 'surrounded-regions', 'rotting-oranges', 'walls-and-gates', 'cheapest-flights', 'network-delay', 'redundant-connection', 'bipartite'] },
    { topicId: 'bfs', keywords: ['bfs', 'level-order', 'shortest-path', 'word-ladder', 'open-the-lock'] },
    { topicId: 'dfs', keywords: ['dfs', 'depth-first', 'word-search', 'n-queens', 'all-paths'] },
    { topicId: 'backtracking', keywords: ['backtrack', 'backtracking', 'subsets', 'permutations', 'combination-sum', 'palindrome-partitioning', 'letter-combinations', 'sudoku'] },
    { topicId: 'heap', keywords: ['heap', 'priority-queue', 'kth-largest', 'top-k', 'find-median-from-data-stream', 'task-scheduler', 'k-closest', 'last-stone-weight'] },
    { topicId: 'dp', keywords: ['dp', 'dynamic-programming', 'climbing-stairs', 'house-robber', 'coin-change', 'longest-increasing-subsequence', 'word-break', 'partition-equal-subset-sum', 'target-sum', 'edit-distance', 'decode-ways', 'unique-paths', 'fibonacci', 'knapsack'] },
    { topicId: 'greedy', keywords: ['greedy', 'jump-game', 'gas-station', 'hand-of-straights', 'partition-labels', 'valid-parenthesis-string', 'assign-cookies', 'lemonade-change'] },
    { topicId: 'prefix_sum', keywords: ['prefix-sum', 'subarray-sum-equals-k', 'range-sum', 'pivot-index', 'product-of-array-except-self'] },
    { topicId: 'hashing', keywords: ['hash', 'map', 'set', 'two-sum', 'contains-duplicate', 'valid-anagram', 'group-anagrams', 'longest-consecutive-sequence', 'isomorphic', 'single-number'] },
    { topicId: 'arrays', keywords: ['array', 'matrix', 'rotate-image', 'spiral-matrix', 'set-matrix-zeroes', 'pascal', 'merge-intervals', 'insert-interval', 'non-overlapping', 'majority-element'] },
  ];

  function inferTopic(slug, title) {
    // 1. Check SeanPrashad curated topic tags
    const spTags = spTopicMap.get(slug);
    if (spTags && spTags.length > 0) {
      const tagStr = spTags.join(' ').toLowerCase();
      if (tagStr.includes('dynamic programming')) return 'dp';
      if (tagStr.includes('tree')) return 'trees';
      if (tagStr.includes('graph')) return 'graphs';
      if (tagStr.includes('linked list')) return 'linked_lists';
      if (tagStr.includes('binary search')) return 'binary_search';
      if (tagStr.includes('heap')) return 'heap';
      if (tagStr.includes('two pointers')) return 'two_pointers';
      if (tagStr.includes('sliding window')) return 'sliding_window';
      if (tagStr.includes('stack')) return 'stack';
      if (tagStr.includes('backtracking')) return 'backtracking';
      if (tagStr.includes('hash')) return 'hashing';
      if (tagStr.includes('array')) return 'arrays';
    }

    // 2. Keyword matching
    const text = (slug + ' ' + title).toLowerCase();
    for (const rule of TOPIC_RULES) {
      for (const kw of rule.keywords) {
        if (text.includes(kw)) {
          return rule.topicId;
        }
      }
    }
    return 'arrays';
  }

  const catalog = targetPairs.map((p) => {
    const stat = p.stat;
    const diff = difficultyMap[p.difficulty.level] || 'MEDIUM';
    counts[diff]++;

    const primaryTopic = inferTopic(stat.question__title_slug, stat.question__title);
    topicCounts[primaryTopic] = (topicCounts[primaryTopic] || 0) + 1;

    const slugWords = stat.question__title_slug.split('-').filter(w => w.length > 2);
    const conceptTags = Array.from(new Set([primaryTopic, ...slugWords.slice(0, 4)]));

    return {
      leetcode_id: stat.frontend_question_id || stat.question_id,
      id: `q_lc_${stat.frontend_question_id || stat.question_id}`,
      title: stat.question__title,
      slug: stat.question__title_slug,
      leetcode_url: `https://leetcode.com/problems/${stat.question__title_slug}/`,
      difficulty: diff,
      estimated_time: diff === 'EASY' ? 15 : diff === 'MEDIUM' ? 25 : 35,
      primary_topic_id: primaryTopic,
      secondary_topics: [],
      concept_tags: conceptTags,
      pattern: `${primaryTopic.replace('_', ' ').toUpperCase()} Pattern`,
    };
  });

  console.log(`Sorted catalog built: ${catalog.length} questions.`);
  console.log('Difficulty breakdown:', counts);
  console.log('Topic breakdown:', topicCounts);
  console.log('Sample question #1 (Two Sum):', catalog[0]);
  console.log('Sample question #500:', catalog[500]);
}

testSortedCatalog();
