import { NextRequest, NextResponse } from 'next/server';
import { generateAIChatResponse } from '@/lib/services/aiChatService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, currentRoute } = body || {};

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message payload is required.' }, { status: 400 });
    }

    const reply = generateAIChatResponse({
      message,
      currentRoute,
    });

    return NextResponse.json({ reply });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal chat processing error.';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
