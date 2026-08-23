export interface RouteNavigationInfo {
  feature: string;
  exactPath: string;
  description: string;
  keywords: string[];
}

export interface DSAPrerequisiteInfo {
  topic: string;
  prerequisites: string[];
  recommendation: string;
  keywords: string[];
}

export interface AppFeatureInfo {
  name: string;
  explanation: string;
  keywords: string[];
}

export const APP_ROUTES_KNOWLEDGE: RouteNavigationInfo[] = [
  {
    feature: 'Selected Topics / Topic Filtering',
    exactPath: 'Go to Goals → Edit Goal → Topics. Your selected topics control which topics can appear in your practice recommendations.',
    description: 'Configure which DSA topics are included in your personalized problem recommendations.',
    keywords: ['topics', 'change topic', 'select topic', 'filter topic', 'topic preference', 'practice topics'],
  },
  {
    feature: 'Goals & Daily Target',
    exactPath: 'Go to Goals → Edit Goal. You can adjust your daily question target, end date, and topic filters there.',
    description: 'Manage daily question target count, goal timeframe, and active target status.',
    keywords: ['goals', 'change goal', 'daily target', 'edit goal', 'target date', 'question target'],
  },
  {
    feature: 'Onboarding & Experience Level',
    exactPath: 'Go to Settings → Experience Level, or click Re-run Onboarding from the sidebar.',
    description: 'Set your experience level (Beginner, Intermediate, Advanced) and initial practice goals.',
    keywords: ['onboarding', 'experience level', 'change experience', 're-run onboarding', 'rerun onboarding'],
  },
  {
    feature: 'Attempt History',
    exactPath: 'Go to History. You can search, filter by result or difficulty, and review notes from all past problem attempts.',
    description: 'View chronological log of past attempts, time spent, failure reasons, and notes.',
    keywords: ['history', 'past attempts', 'attempt log', 'see history', 'previous submissions'],
  },
  {
    feature: 'Telemetry & Progress Analysis',
    exactPath: 'Go to Progress. You can analyze overall mastery scores across 19 core DSA topics, consistency index, and independent solve rate.',
    description: 'Detailed telemetry dashboard with mastery distribution and consistency analysis.',
    keywords: ['progress', 'mastery', 'telemetry', 'consistency', 'see progress', 'topic mastery'],
  },
  {
    feature: 'Streak & Streak Freezers',
    exactPath: 'Go to Dashboard → Streak card. You can view your current active streak, longest streak, and available Streak Freezers (❄).',
    description: 'Track daily practice consistency and available Streak Freezers.',
    keywords: ['streak', 'streak freezer', 'freezer balance', 'missed day', 'streak count'],
  },
  {
    feature: 'Settings',
    exactPath: 'Go to Settings. You can update your practitioner profile name, email, and experience tier.',
    description: 'Account settings and user profile details.',
    keywords: ['settings', 'account settings', 'profile', 'change settings', 'user settings'],
  },
  {
    feature: 'Practice Problems & Recommendations',
    exactPath: 'Go to Practice or click START RECOMMENDED SESSION on the Dashboard.',
    description: 'Start adaptive practice sessions driven by recommendation engine scoring.',
    keywords: ['practice', 'start practice', 'solve question', 'recommendation', 'practice question'],
  },
];

export const DSA_PREREQUISITES_KNOWLEDGE: DSAPrerequisiteInfo[] = [
  {
    topic: 'Dynamic Programming (DP)',
    prerequisites: ['Recursion', 'Memoization', 'Arrays & 1D/2D Grids', 'Iterative Loops'],
    recommendation: 'You should master Recursion and Backtracking first before starting Dynamic Programming.',
    keywords: ['dp', 'dynamic programming', 'before dp', 'learn dp', 'dp prerequisites'],
  },
  {
    topic: 'Trees & Binary Search Trees (BST)',
    prerequisites: ['Recursion', 'Stacks & Queues', 'Pointers / References'],
    recommendation: 'Master Recursion and Stack/Queue structures before tackling Tree traversals (DFS/BFS).',
    keywords: ['trees', 'binary tree', 'bst', 'before trees', 'learn trees'],
  },
  {
    topic: 'Graphs',
    prerequisites: ['Trees', 'Recursion', 'Breadth-First Search (BFS)', 'Depth-First Search (DFS)', 'Queue & Stack'],
    recommendation: 'Ensure you understand Tree traversals and Queues/Stacks before diving into Graph algorithms like Dijkstra or Topological Sort.',
    keywords: ['graphs', 'graph', 'before graphs', 'learn graphs'],
  },
  {
    topic: 'Sliding Window',
    prerequisites: ['Two Pointers', 'Arrays & Strings', 'Hash Maps'],
    recommendation: 'Learn Two Pointers and Subarray bounds before learning Sliding Window techniques.',
    keywords: ['sliding window', 'window', 'before sliding window'],
  },
];

export const APP_FEATURES_KNOWLEDGE: AppFeatureInfo[] = [
  {
    name: 'Streak Freezer Mechanism',
    explanation: 'You earn 1 Streak Freezer automatically for every 5 consecutive days of practice. If you miss a day, 1 Streak Freezer is automatically consumed to protect your streak balance without resetting to zero.',
    keywords: ['how streak freezer works', 'earn freezer', 'protect streak'],
  },
  {
    name: 'Adaptive Recommendation Scoring',
    explanation: 'DSA_Dash ranks problems based on your mastery score gap, prerequisite readiness, difficulty match, and active topic filters.',
    keywords: ['how recommendation works', 'how dsadash works', 'recommendation algorithm', 'how progress works'],
  },
];
