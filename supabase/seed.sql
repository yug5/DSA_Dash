-- Adaptive DSA Practice Platform Seed Data

-- TOPICS
INSERT INTO public.topics (id, name, description) VALUES
  ('arrays', 'Arrays', 'Contiguous memory blocks, indexing, and array manipulations'),
  ('hashing', 'Hashing', 'Hash maps and hash sets for O(1) lookups'),
  ('two_pointers', 'Two Pointers', 'Using two indices to iterate through a sorted array or linear structure'),
  ('sliding_window', 'Sliding Window', 'Dynamic window bounds over arrays/strings'),
  ('prefix_sum', 'Prefix Sum', 'Precomputing cumulative sums for dynamic subarray queries'),
  ('binary_search', 'Binary Search', 'Logarithmic search space reduction'),
  ('linked_lists', 'Linked Lists', 'Node based linear data structures and pointer shifts'),
  ('stack', 'Stack', 'LIFO operations for parenthesis matching and monotonic stacks'),
  ('queue', 'Queue', 'FIFO queues and double ended queue manipulations'),
  ('recursion', 'Recursion', 'Base cases and recursive tree branching'),
  ('backtracking', 'Backtracking', 'State space tree search with pruning'),
  ('trees', 'Trees', 'Binary tree traversals, node properties, and recursion'),
  ('bst', 'BST', 'Binary Search Tree properties, search, and insertion'),
  ('graphs', 'Graphs', 'Vertices and edges representation (Adjacency list/matrix)'),
  ('bfs', 'BFS', 'Breadth-First Search level order traversal and shortest paths'),
  ('dfs', 'DFS', 'Depth-First Search path exploration and connected components'),
  ('heap', 'Heap / Priority Queue', 'Min-heap and max-heap operations for k-way selection'),
  ('greedy', 'Greedy', 'Locally optimal choice heuristics for global optimization'),
  ('dp', 'Dynamic Programming', 'Memoization, tabulation, and optimal substructure')
ON CONFLICT (id) DO NOTHING;

-- TOPIC PREREQUISITES
INSERT INTO public.topic_prerequisites (topic_id, prerequisite_id) VALUES
  ('hashing', 'arrays'),
  ('two_pointers', 'hashing'),
  ('sliding_window', 'two_pointers'),
  ('backtracking', 'recursion'),
  ('bst', 'trees'),
  ('bfs', 'graphs'),
  ('dfs', 'graphs')
ON CONFLICT (topic_id, prerequisite_id) DO NOTHING;

-- QUESTIONS SEED DATA (Valid LeetCode URLs)
INSERT INTO public.questions (id, title, slug, leetcode_url, difficulty, estimated_time, primary_topic_id, secondary_topics, pattern) VALUES
  -- Arrays / Hashing
  ('q_two_sum', 'Two Sum', 'two-sum', 'https://leetcode.com/problems/two-sum/', 'EASY', 15, 'hashing', ARRAY['arrays'], 'Hash Map Lookup'),
  ('q_contains_duplicate', 'Contains Duplicate', 'contains-duplicate', 'https://leetcode.com/problems/contains-duplicate/', 'EASY', 10, 'arrays', ARRAY['hashing'], 'Hash Set Frequency'),
  ('q_valid_anagram', 'Valid Anagram', 'valid-anagram', 'https://leetcode.com/problems/valid-anagram/', 'EASY', 15, 'hashing', ARRAY['arrays'], 'Frequency Counter'),
  ('q_group_anagrams', 'Group Anagrams', 'group-anagrams', 'https://leetcode.com/problems/group-anagrams/', 'MEDIUM', 25, 'hashing', ARRAY['arrays'], 'Categorization Key Hash'),
  ('q_top_k_frequent', 'Top K Frequent Elements', 'top-k-frequent-elements', 'https://leetcode.com/problems/top-k-frequent-elements/', 'MEDIUM', 25, 'hashing', ARRAY['heap'], 'Bucket Sort / Priority Queue'),

  -- Two Pointers / Sliding Window
  ('q_valid_palindrome', 'Valid Palindrome', 'valid-palindrome', 'https://leetcode.com/problems/valid-palindrome/', 'EASY', 15, 'two_pointers', ARRAY['arrays'], 'Two Pointers Inward'),
  ('q_3sum', '3Sum', '3sum', 'https://leetcode.com/problems/3sum/', 'MEDIUM', 30, 'two_pointers', ARRAY['arrays'], 'Sorted Array Two Pointers'),
  ('q_container_water', 'Container With Most Water', 'container-with-most-water', 'https://leetcode.com/problems/container-with-most-water/', 'MEDIUM', 25, 'two_pointers', ARRAY['arrays'], 'Greedy Two Pointers Inward'),
  ('q_best_time_stock', 'Best Time to Buy and Sell Stock', 'best-time-to-buy-and-sell-stock', 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', 'EASY', 15, 'sliding_window', ARRAY['arrays'], 'Sliding Window Max Profit'),
  ('q_longest_substring_no_repeat', 'Longest Substring Without Repeating Characters', 'longest-substring-without-repeating-characters', 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', 'MEDIUM', 25, 'sliding_window', ARRAY['hashing'], 'Dynamic Window Hash Set'),

  -- Binary Search
  ('q_binary_search', 'Binary Search', 'binary-search', 'https://leetcode.com/problems/binary-search/', 'EASY', 15, 'binary_search', ARRAY['arrays'], 'Classic Binary Search'),
  ('q_search_2d_matrix', 'Search a 2D Matrix', 'search-a-2d-matrix', 'https://leetcode.com/problems/search-a-2d-matrix/', 'MEDIUM', 20, 'binary_search', ARRAY['arrays'], '2D Array Flat Binary Search'),
  ('q_koko_bananas', 'Koko Eating Bananas', 'koko-eating-bananas', 'https://leetcode.com/problems/koko-eating-bananas/', 'MEDIUM', 30, 'binary_search', ARRAY['greedy'], 'Binary Search on Answer Space'),

  -- Linked Lists / Stack
  ('q_reverse_linked_list', 'Reverse Linked List', 'reverse-linked-list', 'https://leetcode.com/problems/reverse-linked-list/', 'EASY', 15, 'linked_lists', ARRAY[]::TEXT[], 'Iterative Pointer Mutation'),
  ('q_merge_two_sorted_lists', 'Merge Two Sorted Lists', 'merge-two-sorted-lists', 'https://leetcode.com/problems/merge-two-sorted-lists/', 'EASY', 15, 'linked_lists', ARRAY[]::TEXT[], 'Two Pointer Merge'),
  ('q_valid_parentheses', 'Valid Parentheses', 'valid-parentheses', 'https://leetcode.com/problems/valid-parentheses/', 'EASY', 15, 'stack', ARRAY['hashing'], 'Bracket Stack Matching'),

  -- Trees / BST
  ('q_invert_binary_tree', 'Invert Binary Tree', 'invert-binary-tree', 'https://leetcode.com/problems/invert-binary-tree/', 'EASY', 15, 'trees', ARRAY['dfs'], 'Recursive Postorder Traversal'),
  ('q_max_depth_binary_tree', 'Maximum Depth of Binary Tree', 'maximum-depth-of-binary-tree', 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', 'EASY', 15, 'trees', ARRAY['dfs'], 'Recursive Tree Depth'),
  ('q_validate_bst', 'Validate Binary Search Tree', 'validate-binary-search-tree', 'https://leetcode.com/problems/validate-binary-search-tree/', 'MEDIUM', 25, 'bst', ARRAY['trees', 'dfs'], 'Inorder Bounds Check'),
  ('q_lowest_common_ancestor_bst', 'Lowest Common Ancestor of a BST', 'lowest-common-ancestor-of-a-binary-search-tree', 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', 'MEDIUM', 20, 'bst', ARRAY['trees'], 'BST Property Split'),

  -- Graphs / BFS / DFS
  ('q_number_of_islands', 'Number of Islands', 'number-of-islands', 'https://leetcode.com/problems/number-of-islands/', 'MEDIUM', 25, 'dfs', ARRAY['graphs', 'bfs'], 'Grid Connected Components'),
  ('q_clone_graph', 'Clone Graph', 'clone-graph', 'https://leetcode.com/problems/clone-graph/', 'MEDIUM', 25, 'bfs', ARRAY['graphs', 'hashing'], 'Graph Hashmap Deep Copy'),

  -- Dynamic Programming
  ('q_climbing_stairs', 'Climbing Stairs', 'climbing-stairs', 'https://leetcode.com/problems/climbing-stairs/', 'EASY', 15, 'dp', ARRAY['recursion'], 'Fibonacci DP Tabulation'),
  ('q_house_robber', 'House Robber', 'house-robber', 'https://leetcode.com/problems/house-robber/', 'MEDIUM', 25, 'dp', ARRAY['arrays'], 'State Machine Choice DP'),
  ('q_coin_change', 'Coin Change', 'coin-change', 'https://leetcode.com/problems/coin-change/', 'MEDIUM', 30, 'dp', ARRAY['bfs'], 'Unbounded Knapsack Tabulation'),
  ('q_word_break', 'Word Break', 'word-break', 'https://leetcode.com/problems/word-break/', 'MEDIUM', 30, 'dp', ARRAY['hashing'], 'Subproblem Boolean Array DP'),
  ('q_long_increasing_subsequence', 'Longest Increasing Subsequence', 'longest-increasing-subsequence', 'https://leetcode.com/problems/longest-increasing-subsequence/', 'HARD', 35, 'dp', ARRAY['binary_search'], 'DP / Binary Search Optimization')
ON CONFLICT (id) DO NOTHING;
