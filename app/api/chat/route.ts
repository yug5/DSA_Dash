import { NextRequest, NextResponse } from 'next/server';
import { findAppKnowledgeMatch, generateAIChatResponse } from '@/lib/services/aiChatService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, currentRoute } = body || {};

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message payload is required.' }, { status: 400 });
    }

    // Step 1: Check local app-navigation knowledge first
    // If the question is an exact app route/feature navigation query, return instant local path!
    const localMatch = findAppKnowledgeMatch(message);
    if (localMatch) {
      return NextResponse.json({ reply: localMatch });
    }

    // Step 2: Check if MISTRAL_API_KEY is configured
    const apiKey = process.env.MISTRAL_API_KEY;

    if (apiKey && apiKey.trim().length > 0) {
      try {
        const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'mistral-small-latest',
            messages: [
              {
                role: 'system',
                content:
                  'You are an expert Data Structures & Algorithms (DSA) tutor for the DSA_Dash platform.\n\n' +
                  'Always format your response for MAXIMUM READABILITY using clean Markdown:\n' +
                  '1. Start with a title: ### **[Topic Name] (Short Guide)**\n' +
                  '2. Provide a 2-line overview with Time/Space complexity optimization (e.g., O(n²) → O(n)).\n' +
                  '3. Use section headers (### **Section Name**) and horizontal dividers (---).\n' +
                  '4. Include bullet points for **Types** and **When to Use**.\n' +
                  '5. Provide numbered steps for **Steps to Implement**.\n' +
                  '6. Provide code snippets with Time: O(...) | Space: O(...) for **Example Problems**.\n' +
                  '7. End with **Key Takeaways**.\n\n' +
                  'Keep the response structured, clear, and easy to read.',
              },
              {
                role: 'user',
                content: message,
              },
            ],
            temperature: 0.7,
            max_tokens: 600,
          }),
        });

        if (mistralRes.ok) {
          const mistralData = await mistralRes.json();
          const aiReply = mistralData.choices?.[0]?.message?.content;
          if (aiReply && aiReply.trim().length > 0) {
            return NextResponse.json({ reply: aiReply.trim() });
          }
        } else {
          const errText = await mistralRes.text();
          console.warn('[Mistral AI API Warning]:', errText);
        }
      } catch (mistralErr: unknown) {
        console.error('[Mistral AI API Error]:', mistralErr);
      }
    }

    // Step 3: Fallback to structured local response engine if key is absent or network fails
    const fallbackReply = generateAIChatResponse({
      message,
      currentRoute,
    });

    return NextResponse.json({ reply: fallbackReply });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal chat processing error.';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
