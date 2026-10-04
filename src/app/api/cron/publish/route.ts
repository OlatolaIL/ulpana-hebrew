import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';
import { executePublish, PublishRequestBody } from '@/lib/marketingPublisher';

export async function GET(req: NextRequest) {
  return handleCronPublish(req);
}

export async function POST(req: NextRequest) {
  return handleCronPublish(req);
}

async function handleCronPublish(req: NextRequest) {
  try {
    // 1. Authorization: either valid CRON_SECRET or Admin Session
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET?.trim();
    let isAuthorized = false;

    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      isAuthorized = true;
    } else {
      const adminAuth = await verifyAdminRequest(req);
      if (adminAuth.authorized) {
        isAuthorized = true;
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется Bearer токен CRON_SECRET или авторизованная сессия администратора' },
        { status: 401 }
      );
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const nowIso = new Date().toISOString();

    // 2. Query for pending scheduled publications that are due
    // Supports both scheduled_at timestamp and legacy date (YYYY-MM-DD)
    const dueResult = await db.query(
      `SELECT * FROM ulpana_publications
       WHERE status = 'scheduled'
         AND (
           (scheduled_at IS NOT NULL AND scheduled_at <= $1)
           OR (scheduled_at IS NULL AND date <= CURRENT_DATE::text)
         )
       ORDER BY scheduled_at ASC NULLS LAST, created_at ASC
       LIMIT 10`,
      [nowIso]
    );

    const dueItems = dueResult.rows;
    if (dueItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Нет запланированных публикаций, созревших для выгрузки',
        checkedAt: nowIso,
        processedCount: 0,
        results: [],
      });
    }

    const results = [];

    // 3. Process each due item sequentially
    for (const row of dueItems) {
      const channel = row.channel as 'youtube' | 'telegram' | 'facebook' | 'tiktok';
      const publishParams: PublishRequestBody = {
        channel,
        publicationId: row.id,
        title: row.title,
        description: row.caption || row.title,
        campaignTitle: row.campaign_title || undefined,
        version: row.version || undefined,
        videoPath: row.video_path || undefined,
        privacy: 'public',
        register: true,
        link: row.full_url_with_promo || undefined,
      };

      try {
        const pubResult = await executePublish(publishParams);
        if (pubResult.success) {
          results.push({
            id: row.id,
            channel: row.channel,
            title: row.title,
            success: true,
            livePostUrl: pubResult.livePostUrl,
          });
        } else {
          // Log error to notes so admin sees why it failed
          const errNote = `[Крон ошибка ${nowIso.slice(0, 16)}]: ${pubResult.error || 'Неизвестная ошибка'}`;
          await db.query(
            `UPDATE ulpana_publications
             SET notes = CASE
               WHEN notes IS NULL OR notes = '' THEN $2
               ELSE notes || E'\n' || $2
             END,
             updated_at = NOW()
             WHERE id = $1`,
            [row.id, errNote]
          );

          results.push({
            id: row.id,
            channel: row.channel,
            title: row.title,
            success: false,
            error: pubResult.error,
          });
        }
      } catch (itemErr: any) {
        results.push({
          id: row.id,
          channel: row.channel,
          title: row.title,
          success: false,
          error: itemErr.message,
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Обработано: ${results.length}. Успешно: ${successCount}, Ошибок: ${failCount}`,
      checkedAt: nowIso,
      processedCount: results.length,
      successCount,
      failCount,
      results,
    });
  } catch (error: any) {
    console.error('[API Cron Publish] Fatal Error:', error);
    return NextResponse.json(
      { error: `Ошибка выполнения крон-выгрузки: ${error.message}` },
      { status: 500 }
    );
  }
}
