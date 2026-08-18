import { NextResponse } from 'next/server';
import { syncQuestionCatalog } from '@/lib/services/questionSyncService';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const secretKey = process.env.CRON_SYNC_SECRET;

  // Optional endpoint protection via CRON_SYNC_SECRET if set
  if (secretKey && authHeader !== `Bearer ${secretKey}`) {
    return NextResponse.json({ error: 'Unauthorized sync request' }, { status: 401 });
  }

  const result = await syncQuestionCatalog();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(request: Request) {
  return GET(request);
}
