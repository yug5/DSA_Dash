import { Question } from '@/lib/types';
// NOTE: This service is server-only. It uses the admin client to bypass RLS
// for the trusted catalog sync operation. Never import this from client components.

/**
 * High-quality catalog seed dataset with fine-grained concept tags and LeetCode problem metadata.
 * Ensures the platform is populated with real LeetCode problems out-of-the-box.
 */
export const LEETCODE_CATALOG_SYNC_SEED: Partial<Question>[] = [
  {
    leetcode_id: 1,
    id: 'q_two_sum',
    title: 'Two Sum',
    slug: 'two-sum',
    leetcode_url: 'https://leetcode.com/problems/two-sum/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'arrays',
    secondary_topics: ['hashing'],
    concept_tags: ['hash-map', 'complement-lookup', 'single-pass'],
    pattern: 'Hash Map Lookup',
  },
  {
    leetcode_id: 217,
    id: 'q_contains_duplicate',
    title: 'Contains Duplicate',
    slug: 'contains-duplicate',
    leetcode_url: 'https://leetcode.com/problems/contains-duplicate/',
    difficulty: 'EASY',
    estimated_time: 10,
    primary_topic_id: 'arrays',
    secondary_topics: ['hashing'],
    concept_tags: ['hash-set', 'frequency-check'],
    pattern: 'Hash Set Lookup',
  },
  {
    leetcode_id: 242,
    id: 'q_valid_anagram',
    title: 'Valid Anagram',
    slug: 'valid-anagram',
    leetcode_url: 'https://leetcode.com/problems/valid-anagram/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'arrays',
    secondary_topics: ['hashing'],
    concept_tags: ['frequency-map', 'character-counting'],
    pattern: 'Frequency Map',
  },
  {
    leetcode_id: 49,
    id: 'q_group_anagrams',
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    leetcode_url: 'https://leetcode.com/problems/group-anagrams/',
    difficulty: 'MEDIUM',
    estimated_time: 25,
    primary_topic_id: 'arrays',
    secondary_topics: ['hashing'],
    concept_tags: ['hash-key-canonicalization', 'frequency-map'],
    pattern: 'Categorization Hash Map',
  },
  {
    leetcode_id: 125,
    id: 'q_valid_palindrome',
    title: 'Valid Palindrome',
    slug: 'valid-palindrome',
    leetcode_url: 'https://leetcode.com/problems/valid-palindrome/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'two_pointers',
    secondary_topics: ['arrays'],
    concept_tags: ['two-pointers-opposite', 'string-filtering'],
    pattern: 'Opposite Ends Two Pointers',
  },
  {
    leetcode_id: 167,
    id: 'q_two_sum_ii',
    title: 'Two Sum II - Input Array Is Sorted',
    slug: 'two-sum-ii-input-array-is-sorted',
    leetcode_url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/',
    difficulty: 'MEDIUM',
    estimated_time: 20,
    primary_topic_id: 'two_pointers',
    secondary_topics: ['arrays'],
    concept_tags: ['two-pointers-opposite', 'sorted-array-shrink'],
    pattern: 'Sorted Array Two Pointers',
  },
  {
    leetcode_id: 15,
    id: 'q_3sum',
    title: '3Sum',
    slug: '3sum',
    leetcode_url: 'https://leetcode.com/problems/3sum/',
    difficulty: 'MEDIUM',
    estimated_time: 30,
    primary_topic_id: 'two_pointers',
    secondary_topics: ['arrays'],
    concept_tags: ['two-pointers-opposite', 'sorting-first', 'duplicate-skipping'],
    pattern: 'Multi-Pointer Target Reduction',
  },
  {
    leetcode_id: 11,
    id: 'q_container_with_most_water',
    title: 'Container With Most Water',
    slug: 'container-with-most-water',
    leetcode_url: 'https://leetcode.com/problems/container-with-most-water/',
    difficulty: 'MEDIUM',
    estimated_time: 25,
    primary_topic_id: 'two_pointers',
    secondary_topics: ['arrays'],
    concept_tags: ['two-pointers-greedy-shrink', 'area-maximization'],
    pattern: 'Greedy Two Pointers',
  },
  {
    leetcode_id: 121,
    id: 'q_best_time_stock',
    title: 'Best Time to Buy and Sell Stock',
    slug: 'best-time-to-buy-and-sell-stock',
    leetcode_url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'sliding_window',
    secondary_topics: ['arrays'],
    concept_tags: ['variable-size-window', 'min-tracking', 'single-pass'],
    pattern: 'Sliding Window / Min Tracking',
  },
  {
    leetcode_id: 3,
    id: 'q_longest_substring_without_repeating',
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    leetcode_url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    difficulty: 'MEDIUM',
    estimated_time: 25,
    primary_topic_id: 'sliding_window',
    secondary_topics: ['hashing'],
    concept_tags: ['variable-size-window', 'frequency-map', 'last-seen-index'],
    pattern: 'Dynamic Sliding Window',
  },
  {
    leetcode_id: 424,
    id: 'q_character_replacement',
    title: 'Longest Repeating Character Replacement',
    slug: 'longest-repeating-character-replacement',
    leetcode_url: 'https://leetcode.com/problems/longest-repeating-character-replacement/',
    difficulty: 'MEDIUM',
    estimated_time: 30,
    primary_topic_id: 'sliding_window',
    secondary_topics: ['hashing'],
    concept_tags: ['variable-size-window', 'max-frequency-tracking'],
    pattern: 'Dynamic Sliding Window',
  },
  {
    leetcode_id: 20,
    id: 'q_valid_parentheses',
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    leetcode_url: 'https://leetcode.com/problems/valid-parentheses/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'stack',
    secondary_topics: ['arrays'],
    concept_tags: ['stack-matching', 'bracket-balance'],
    pattern: 'LIFO Stack Matching',
  },
  {
    leetcode_id: 155,
    id: 'q_min_stack',
    title: 'Min Stack',
    slug: 'min-stack',
    leetcode_url: 'https://leetcode.com/problems/min-stack/',
    difficulty: 'MEDIUM',
    estimated_time: 20,
    primary_topic_id: 'stack',
    secondary_topics: ['hashing'],
    concept_tags: ['auxiliary-stack', 'constant-time-min'],
    pattern: 'Auxiliary Stack Design',
  },
  {
    leetcode_id: 704,
    id: 'q_binary_search',
    title: 'Binary Search',
    slug: 'binary-search',
    leetcode_url: 'https://leetcode.com/problems/binary-search/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'binary_search',
    secondary_topics: ['arrays'],
    concept_tags: ['binary-search-bounds', 'half-interval-reduction'],
    pattern: 'Standard Binary Search',
  },
  {
    leetcode_id: 74,
    id: 'q_search_2d_matrix',
    title: 'Search a 2D Matrix',
    slug: 'search-a-2d-matrix',
    leetcode_url: 'https://leetcode.com/problems/search-a-2d-matrix/',
    difficulty: 'MEDIUM',
    estimated_time: 20,
    primary_topic_id: 'binary_search',
    secondary_topics: ['arrays'],
    concept_tags: ['matrix-flatten-binary-search', 'row-col-index-mapping'],
    pattern: 'Virtual 1D Binary Search',
  },
  {
    leetcode_id: 206,
    id: 'q_reverse_linked_list',
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    leetcode_url: 'https://leetcode.com/problems/reverse-linked-list/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'linked_lists',
    secondary_topics: [],
    concept_tags: ['pointer-reversal', 'iterative-traversal'],
    pattern: 'Pointer Reversal',
  },
  {
    leetcode_id: 21,
    id: 'q_merge_two_sorted_lists',
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    leetcode_url: 'https://leetcode.com/problems/merge-two-sorted-lists/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'linked_lists',
    secondary_topics: [],
    concept_tags: ['dummy-head-node', 'two-pointer-merge'],
    pattern: 'Dummy Head Merge',
  },
  {
    leetcode_id: 226,
    id: 'q_invert_binary_tree',
    title: 'Invert Binary Tree',
    slug: 'invert-binary-tree',
    leetcode_url: 'https://leetcode.com/problems/invert-binary-tree/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'trees',
    secondary_topics: [],
    concept_tags: ['tree-dfs-recursion', 'swap-children'],
    pattern: 'Tree Recursion',
  },
  {
    leetcode_id: 104,
    id: 'q_max_depth_tree',
    title: 'Maximum Depth of Binary Tree',
    slug: 'maximum-depth-of-binary-tree',
    leetcode_url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'trees',
    secondary_topics: [],
    concept_tags: ['tree-dfs-recursion', 'depth-bottom-up'],
    pattern: 'Tree Height Recursion',
  },
  {
    leetcode_id: 70,
    id: 'q_climbing_stairs',
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    leetcode_url: 'https://leetcode.com/problems/climbing-stairs/',
    difficulty: 'EASY',
    estimated_time: 15,
    primary_topic_id: 'dp',
    secondary_topics: ['arrays'],
    concept_tags: ['fibonacci-dp', 'state-space-reduction'],
    pattern: '1D Dynamic Programming',
  },
  {
    leetcode_id: 198,
    id: 'q_house_robber',
    title: 'House Robber',
    slug: 'house-robber',
    leetcode_url: 'https://leetcode.com/problems/house-robber/',
    difficulty: 'MEDIUM',
    estimated_time: 25,
    primary_topic_id: 'dp',
    secondary_topics: [],
    concept_tags: ['non-adjacent-dp', 'include-exclude-choice'],
    pattern: 'State Choice DP',
  },
  {
    leetcode_id: 200,
    id: 'q_number_of_islands',
    title: 'Number of Islands',
    slug: 'number-of-islands',
    leetcode_url: 'https://leetcode.com/problems/number-of-islands/',
    difficulty: 'MEDIUM',
    estimated_time: 30,
    primary_topic_id: 'graphs',
    secondary_topics: ['arrays'],
    concept_tags: ['grid-dfs', 'grid-bfs', 'connected-components'],
    pattern: 'Grid Graph Traversal',
  },
];

export interface SkippedQuestionReport {
  id: string;
  title?: string;
  reason: string;
}

export interface SyncCatalogResult {
  success: boolean;
  syncedCount: number;
  skippedCount: number;
  skippedQuestions: SkippedQuestionReport[];
  unmappedTopics: string[];
  message: string;
}

/**
 * Dynamically fetches 1,000+ real LeetCode problems from official feed + pattern repository.
 */
export async function fetchExpandedLeetCodeCatalog(): Promise<Partial<Question>[]> {
  try {
    const [lcRes, spRes] = await Promise.all([
      fetch('https://leetcode.com/api/problems/all/'),
      fetch('https://raw.githubusercontent.com/SeanPrashad/leetcode-patterns/main/src/data/questions.json').catch(() => null),
    ]);

    if (!lcRes.ok) throw new Error(`LeetCode API status: ${lcRes.status}`);

    const lcData = await lcRes.json();
    const spData = spRes && spRes.ok ? await spRes.json() : [];
    const spQuestions = Array.isArray(spData) ? spData : spData?.data || [];

    const spTopicMap = new Map<string, string[]>();
    spQuestions.forEach((q: any) => {
      if (q.slug && q.pattern) {
        spTopicMap.set(q.slug, q.pattern);
      }
    });

    const pairs = lcData.stat_status_pairs || [];
    const freePairs = pairs.filter((p: any) => !p.paid_only);

    // Sort by frontend_question_id ascending (LeetCode #1, #2, #3...)
    freePairs.sort((a: any, b: any) => (a.stat.frontend_question_id || 0) - (b.stat.frontend_question_id || 0));

    // Target 1,000 questions
    const targetPairs = freePairs.slice(0, 1000);

    const difficultyMap: Record<number, 'EASY' | 'MEDIUM' | 'HARD'> = { 1: 'EASY', 2: 'MEDIUM', 3: 'HARD' };

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

    const inferTopicId = (slug: string, title: string): string => {
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

      const text = (slug + ' ' + title).toLowerCase();
      for (const rule of TOPIC_RULES) {
        for (const kw of rule.keywords) {
          if (text.includes(kw)) return rule.topicId;
        }
      }
      return 'arrays';
    }

    return targetPairs.map((p: any) => {
      const stat = p.stat;
      const lcId = stat.frontend_question_id || stat.question_id;
      const diff = difficultyMap[p.difficulty?.level] || 'MEDIUM';
      const slug = stat.question__title_slug;
      const title = stat.question__title;
      const primaryTopic = inferTopicId(slug, title);

      const slugWords = slug.split('-').filter((w: string) => w.length > 2);
      const conceptTags = Array.from(new Set([primaryTopic, ...slugWords.slice(0, 4)]));

      return {
        leetcode_id: lcId,
        id: `q_lc_${lcId}`,
        title,
        slug,
        leetcode_url: `https://leetcode.com/problems/${slug}/`,
        difficulty: diff,
        estimated_time: diff === 'EASY' ? 15 : diff === 'MEDIUM' ? 25 : 35,
        primary_topic_id: primaryTopic,
        secondary_topics: [],
        concept_tags: conceptTags,
        pattern: `${primaryTopic.replace('_', ' ').toUpperCase()} Pattern`,
      };
    });
  } catch (err: any) {
    console.warn('Expanded LeetCode catalog fetch fallback to seed:', err.message);
    return LEETCODE_CATALOG_SYNC_SEED;
  }
}

/**
 * Idempotently synchronizes LeetCode question catalog into Supabase.
 */
export async function syncQuestionCatalog(): Promise<SyncCatalogResult> {
  // Use the admin client (service role) — bypasses RLS for trusted server-side upsert.
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const supabase = createAdminClient();

    // Fetch expanded LeetCode dataset (1,000 questions) or fallback to seed
    const rawCatalog = await fetchExpandedLeetCodeCatalog();

    // 1. Fetch valid topic IDs from database to ensure foreign key integrity
    const { data: dbTopics, error: topicsError } = await supabase
      .from('topics')
      .select('id, name');

    if (topicsError) {
      throw new Error(`Failed to fetch topics table: ${topicsError.message}`);
    }

    const fallbackTopicIds = [
      'arrays', 'hashing', 'two_pointers', 'sliding_window', 'prefix_sum',
      'binary_search', 'linked_lists', 'stack', 'queue', 'recursion',
      'backtracking', 'trees', 'bst', 'graphs', 'bfs', 'dfs', 'heap', 'greedy', 'dp'
    ];

    const validTopicIds = new Set<string>(
      dbTopics && dbTopics.length > 0 ? dbTopics.map((t) => t.id) : fallbackTopicIds
    );

    // Topic normalization lookup map (normalized form -> valid topics.id)
    const normalizeStr = (s: string) => s.toLowerCase().trim().replace(/^t[_-]/, '').replace(/[\s\-_]+/g, '');
    const topicMap = new Map<string, string>();

    if (dbTopics) {
      for (const t of dbTopics) {
        topicMap.set(normalizeStr(t.id), t.id);
        topicMap.set(normalizeStr(t.name), t.id);
      }
    }
    for (const id of fallbackTopicIds) {
      if (!topicMap.has(normalizeStr(id))) {
        topicMap.set(normalizeStr(id), id);
      }
    }

    // Common synonyms & aliases
    const aliases: Array<[string, string]> = [
      ['arrays', 'arrays'], ['array', 'arrays'],
      ['hashing', 'hashing'], ['hash', 'hashing'], ['hashmap', 'hashing'], ['hashtable', 'hashing'], ['hashset', 'hashing'],
      ['twopointers', 'two_pointers'], ['twopointer', 'two_pointers'], ['two_pointers', 'two_pointers'],
      ['slidingwindow', 'sliding_window'], ['sliding_window', 'sliding_window'],
      ['prefixsum', 'prefix_sum'], ['prefix_sum', 'prefix_sum'],
      ['binarysearch', 'binary_search'], ['binary_search', 'binary_search'],
      ['linkedlist', 'linked_lists'], ['linkedlists', 'linked_lists'], ['linked_list', 'linked_lists'], ['linked_lists', 'linked_lists'],
      ['stack', 'stack'], ['stacks', 'stack'],
      ['queue', 'queue'], ['queues', 'queue'], ['deque', 'queue'],
      ['recursion', 'recursion'], ['recursive', 'recursion'],
      ['backtracking', 'backtracking'], ['backtrack', 'backtracking'],
      ['trees', 'trees'], ['tree', 'trees'], ['binarytree', 'trees'],
      ['bst', 'bst'], ['binarysearchtree', 'bst'],
      ['graphs', 'graphs'], ['graph', 'graphs'],
      ['bfs', 'bfs'], ['breadthfirstsearch', 'bfs'],
      ['dfs', 'dfs'], ['depthfirstsearch', 'dfs'],
      ['heap', 'heap'], ['priorityqueue', 'heap'], ['minheap', 'heap'], ['maxheap', 'heap'],
      ['greedy', 'greedy'],
      ['dp', 'dp'], ['dynamicprogramming', 'dp'],
      ['strings', 'arrays'], ['string', 'arrays'],
      ['matrix', 'graphs'], ['2darray', 'graphs'],
      ['design', 'hashing'],
      ['math', 'dp'],
    ];

    for (const [alias, targetId] of aliases) {
      if (validTopicIds.has(targetId) && !topicMap.has(normalizeStr(alias))) {
        topicMap.set(normalizeStr(alias), targetId);
      }
    }

    const resolveTopic = (raw: string): string | null => {
      if (!raw) return null;
      const norm = normalizeStr(raw);
      if (topicMap.has(norm)) {
        return topicMap.get(norm)!;
      }
      if (validTopicIds.has(raw)) return raw;
      return null;
    };

    // 2. Fetch existing questions from database to resolve canonical identity & avoid slug collisions
    const { data: existingQuestions, error: fetchError } = await supabase
      .from('questions')
      .select('id, leetcode_id, slug');

    if (fetchError) {
      throw new Error(`Failed to fetch existing questions: ${fetchError.message}`);
    }

    const dbQuestions = existingQuestions || [];

    // Lookup maps for existing DB rows
    const byLeetcodeIdMap = new Map<number, { id: string; slug: string }>();
    const byIdMap = new Map<string, { id: string; leetcode_id: number | null; slug: string }>();
    const bySlugMap = new Map<string, { id: string; leetcode_id: number | null }>();

    for (const row of dbQuestions) {
      if (row.leetcode_id != null) {
        byLeetcodeIdMap.set(row.leetcode_id, { id: row.id, slug: row.slug });
      }
      if (row.id) {
        byIdMap.set(row.id, { id: row.id, leetcode_id: row.leetcode_id ?? null, slug: row.slug });
      }
      if (row.slug) {
        bySlugMap.set(row.slug, { id: row.id, leetcode_id: row.leetcode_id ?? null });
      }
    }

    const nowStr = new Date().toISOString();
    const batchAssignedSlugs = new Map<string, string>(); // slug -> targetId
    const skippedQuestions: SkippedQuestionReport[] = [];
    const unmappedTopicsSet = new Set<string>();
    const upsertRows: Array<Record<string, any>> = [];

    for (const q of rawCatalog) {
      const leetcodeId = q.leetcode_id!;

      // Map primary & secondary topics to valid topics.id
      const rawPrimary = q.primary_topic_id || '';
      const mappedPrimary = resolveTopic(rawPrimary);

      const secondaryMapped: string[] = [];
      if (q.secondary_topics && Array.isArray(q.secondary_topics)) {
        for (const sec of q.secondary_topics) {
          const mappedSec = resolveTopic(sec);
          if (mappedSec) {
            if (mappedSec !== mappedPrimary && !secondaryMapped.includes(mappedSec)) {
              secondaryMapped.push(mappedSec);
            }
          } else if (sec) {
            unmappedTopicsSet.add(sec);
          }
        }
      }

      let finalPrimaryTopicId = mappedPrimary;
      if (!finalPrimaryTopicId && secondaryMapped.length > 0) {
        finalPrimaryTopicId = secondaryMapped.shift()!;
      }

      if (!finalPrimaryTopicId) {
        if (rawPrimary) unmappedTopicsSet.add(rawPrimary);
        skippedQuestions.push({
          id: q.id || `q_lc_${leetcodeId}`,
          title: q.title,
          reason: `Primary topic '${rawPrimary}' could not be mapped to any existing topic in the database.`,
        });
        continue;
      }

      // Determine target ID
      const existingByLeetcode = byLeetcodeIdMap.get(leetcodeId);
      const existingById = q.id ? byIdMap.get(q.id) : undefined;
      const targetId = existingByLeetcode?.id || existingById?.id || q.id || `q_lc_${leetcodeId}`;

      // Determine target slug
      const baseSlug = q.slug || `problem-${leetcodeId}`;
      let targetSlug = baseSlug;

      const isTakenByOther = (slug: string, myId: string) => {
        const dbOwner = bySlugMap.get(slug);
        if (dbOwner && dbOwner.id !== myId) return true;
        const batchOwnerId = batchAssignedSlugs.get(slug);
        if (batchOwnerId && batchOwnerId !== myId) return true;
        return false;
      };

      if (isTakenByOther(targetSlug, targetId)) {
        targetSlug = `${baseSlug}-${leetcodeId}`;
        let suffix = 1;
        while (isTakenByOther(targetSlug, targetId)) {
          targetSlug = `${baseSlug}-${leetcodeId}-${suffix}`;
          suffix++;
        }
      }

      batchAssignedSlugs.set(targetSlug, targetId);

      upsertRows.push({
        id: targetId,
        leetcode_id: leetcodeId,
        title: q.title,
        slug: targetSlug,
        leetcode_url: q.leetcode_url,
        difficulty: q.difficulty,
        estimated_time: q.estimated_time || 20,
        primary_topic_id: finalPrimaryTopicId,
        secondary_topics: secondaryMapped,
        concept_tags: q.concept_tags || [],
        pattern: q.pattern || null,
        sync_updated_at: nowStr,
        updated_at: nowStr,
      });
    }

    const unmappedTopics = Array.from(unmappedTopicsSet);

    // Upsert in batches of 200 to avoid payload size issues
    if (upsertRows.length > 0) {
      const batchSize = 200;
      for (let i = 0; i < upsertRows.length; i += batchSize) {
        const chunk = upsertRows.slice(i, i + batchSize);
        const { error } = await supabase
          .from('questions')
          .upsert(chunk, { onConflict: 'id' });

        if (error) {
          await supabase.from('sync_log').insert([{
            sync_type: 'DAILY_CATALOG',
            status: 'FAILURE',
            questions_synced: 0,
            error_message: error.message,
          }]);
          return {
            success: false,
            syncedCount: i,
            skippedCount: rawCatalog.length - i,
            skippedQuestions,
            unmappedTopics,
            message: `Batch upsert error at row ${i}: ${error.message}`,
          };
        }
      }
    }

    await supabase.from('sync_log').insert([{
      sync_type: 'DAILY_CATALOG',
      status: 'SUCCESS',
      questions_synced: upsertRows.length,
      error_message: null,
    }]);

    return {
      success: true,
      syncedCount: upsertRows.length,
      skippedCount: skippedQuestions.length,
      skippedQuestions,
      unmappedTopics,
      message: `Successfully synchronized ${upsertRows.length} LeetCode questions (${skippedQuestions.length} skipped).`,
    };
  } catch (err: any) {
    return {
      success: false,
      syncedCount: 0,
      skippedCount: 0,
      skippedQuestions: [],
      unmappedTopics: [],
      message: err?.message || 'Unknown catalog sync failure',
    };
  }
}
