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
 * Checks local app knowledge base for exact app navigation & feature paths.
 * Returns null if the query is a general DSA question suitable for Mistral AI.
 */
export function findAppKnowledgeMatch(queryText: string): string | null {
  const query = queryText.toLowerCase().trim();

  // 1. App Navigation Route Lookup
  for (const item of APP_ROUTES_KNOWLEDGE) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return item.exactPath;
    }
  }

  // 2. App Feature Explanation Lookup
  for (const item of APP_FEATURES_KNOWLEDGE) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return `${item.name}:\n${item.explanation}`;
    }
  }

  // 3. Unhandled App Feature Check
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

  return null;
}

/**
 * Fallback local response generator when Mistral API key is absent or offline.
 */
export function generateAIChatResponse(payload: ChatContextPayload): string {
  const exactMatch = findAppKnowledgeMatch(payload.message);
  if (exactMatch) {
    return exactMatch;
  }

  const query = payload.message.toLowerCase().trim();

  // DSA Prerequisites Lookup
  for (const item of DSA_PREREQUISITES_KNOWLEDGE) {
    if (item.keywords.some((kw) => query.includes(kw))) {
      return (
        `### **${item.topic} (Short Guide)**\n\n` +
        `${item.recommendation}\n\n` +
        `---\n\n` +
        `### **Key Prerequisites**\n` +
        item.prerequisites.map((p) => `- **${p}**`).join('\n') +
        `\n\n---\n\n` +
        `### **Key Takeaways**\n` +
        `- Focus on understanding core pattern concepts before implementation.\n` +
        `- Practice solving Easy and Medium problems to build intuitive recognition.`
      );
    }
  }

  // Platform Explanation
  if (query.includes('how does dsa_dash work') || query.includes('how dsa_dash works')) {
    return (
      `### **DSA_Dash Platform Overview**\n\n` +
      `**DSA_Dash** is an adaptive practice platform that analyzes your attempt telemetry to calculate **topic mastery (0-100)**, recommend optimal practice questions, and maintain your practice consistency.\n\n` +
      `---\n\n` +
      `### **Key Navigation Paths**\n` +
      `- **Dashboard:** View daily target, active streak, and recommended practice session.\n` +
      `- **Goals → Edit Goal → Topics:** Filter which topics appear in your recommendations.\n` +
      `- **Progress:** View overall mastery distribution across 19 core DSA topics.\n` +
      `- **History:** Review past attempt logs, code notes, and failure reasons.\n\n` +
      `---\n\n` +
      `### **Streak Freezers**\n` +
      `- Earn **1 Streak Freezer** after 5 consecutive practice days.\n` +
      `- Uses **1 freezer** automatically to protect your streak when you miss a day.`
    );
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return (
      `### **DSA_Dash AI Assistant**\n\n` +
      `Hello! I am your **DSA_Dash AI Assistant**. I provide concise, structured guides for **DSA topics** and **app navigation**.\n\n` +
      `---\n\n` +
      `### **Try Asking:**\n` +
      `- *"Where do I change my goals?"*\n` +
      `- *"What should I know before DP?"*\n` +
      `- *"How does the streak freezer work?"*`
    );
  }

  return (
    `### **DSA Practice Advice**\n\n` +
    `Focus on **pattern recognition** and writing pseudocode on paper before writing code.\n\n` +
    `---\n\n` +
    `### **App Features**\n` +
    `Ask about **goals**, **topic selection**, **progress telemetry**, or **attempt history** for exact navigation paths!`
  );
}

/**
 * Sends chat message to API route (which queries Mistral AI or local engine).
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
    return generateAIChatResponse({ message, currentRoute });
  }
}
