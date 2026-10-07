import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { executePublish, PublishRequestBody } from '@/lib/marketingPublisher';

export const maxDuration = 120;

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const body = (await req.json()) as PublishRequestBody;
    const result = await executePublish(body);
    return NextResponse.json(result, { status: result.status || (result.success ? 200 : 400) });
  } catch (error: any) {
    console.error('[API Marketing Publish POST] Fatal Error:', error);
    return NextResponse.json({ error: `Внутренняя ошибка сервера: ${error.message}` }, { status: 500 });
  }
}
