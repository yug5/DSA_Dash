import {
  APP_ROUTES_KNOWLEDGE,
  DSA_PREREQUISITES_KNOWLEDGE,
  APP_FEATURES_KNOWLEDGE,
} from '@/lib/config/appKnowledge';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatContextPayload {
  message: string;
  currentRoute?: string;
  currentStreak?: number;
  activeGoalTarget?: number;
}

/**
 * Searches app knowledge base and returns precise, human-written responses for
 * app navigation, DSA prerequisites, and platform feature questions.
 */
export function generateAIChatResponse(payload: ChatContextPayload): string {
  const query = payload.message.toLowerCase().trim();

  // 1. App Navigation Route Lookup
  for (const item of APP_ROUTES_KNOWLEDGE) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return item.exactPath;
    }
  }

  // 2. DSA Prerequisites Lookup
  for (const item of DSA_PREREQUISITES_KNOWLEDGE) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return `${item.recommendation}\n\nKey prerequisites for ${item.topic}:\n` +
        item.prerequisites.map((p) => `• ${p}`).join('\n');
    }
  }

  // 3. App Feature Explanation Lookup
  for (const item of APP_FEATURES_KNOWLEDGE) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return `${item.name}:\n${item.explanation}`;
    }
  }

  // 4. Non-Existent Feature Check
  const unhandledKeywords = [
    'multiplayer',
    'download app',
    'mobile app',
    'offline mode',
    'export csv',
    'dark mode toggle',
    'social feed',
    'friends',
  ];
  if (unhandledKeywords.some((kw) => query.includes(kw))) {
    return "I don't see that option in the current version of DSA_Dash.";
  }

  // 5. Generic DSA / Platform Fallback Response
  if (query.includes('how does dsa_dash work') || query.includes('how dsa_dash works')) {
    return (
      'DSA_Dash is an adaptive practice platform that analyzes your attempt history to score topic mastery (0-100), ' +
      'recommend optimal practice questions, and maintain your practice streak with Streak Freezers.\n\n' +
      'Key Navigation:\n' +
      '• Overview & Recommended Session: Dashboard\n' +
      '• Topic Filters & Goals: Goals → Edit Goal → Topics\n' +
      '• Telemetry & Mastery: Progress\n' +
      '• Attempt History & Notes: History'
    );
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return (
      'Hello! I am your DSA_Dash AI Assistant. I can help with DSA learning paths ' +
      'and step-by-step navigation in the app.\n\nTry asking:\n' +
      '• "Where do I change my goals?"\n' +
      '• "What should I know before DP?"\n' +
      '• "How does the streak freezer work?"'
    );
  }

  return (
    `For DSA practice, focus on pattern recognition and writing pseudocode before coding. ` +
    `If you are looking for a specific feature, try asking about goals, topic selection, progress, or attempt history!`
  );
}

/**
 * Server/Client API call entry point.
 */
export async function sendChatMessage(
  message: string,
  currentRoute?: string
): Promise<string> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, currentRoute }),
    });

    if (!res.ok) {
      throw new Error('API server unavailable');
    }

    const data = await res.json();
    return data.reply || generateAIChatResponse({ message, currentRoute });
  } catch {
    // Graceful fallback: return answer directly from appKnowledge engine
    return generateAIChatResponse({ message, currentRoute });
  }
}
