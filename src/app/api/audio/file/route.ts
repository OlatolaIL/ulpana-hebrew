import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { verifySessionToken } from '@/lib/auth';
import { isVipUser } from '@/lib/vipUsers';
import { readAudioFile, validateAudioKey } from '@/lib/cloudStorage';

export async function GET(req: NextRequest) {
  const token = req.cookies.get('ulpana_session')?.value;
  const session = token ? await verifySessionToken(token) : null;
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const key = req.nextUrl.searchParams.get('key') || '';
  try { validateAudioKey(key); } catch {
    return NextResponse.json({ error: 'Invalid recording key' }, { status: 400 });
  }
  const owner = createHash('sha256').update(session.id).digest('hex');
  if (!key.startsWith(`audio/${owner}/`) && !isVipUser(null, session.telegramId)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const recording = await readAudioFile(key);
    return new NextResponse(Buffer.from(recording.data), { headers: {
      'Content-Type': recording.contentType,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    return NextResponse.json({ error: 'Recording unavailable' }, { status: 404 });
  }
}
