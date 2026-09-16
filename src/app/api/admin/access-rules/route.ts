import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';
import { IS_EARLY_ACCESS_FREE } from '@/lib/config';
import { AccessRequirement, getDefaultLessonRequirement } from '@/lib/accessPolicy';

const VALID_REQUIREMENTS: AccessRequirement[] = [
  'always_free',
  'free_auth',
  'telegram_channel',
  'pro_only',
  'pro_or_channel',
  'pro_and_channel',
];

export async function GET(_req: NextRequest) {
  try {
    await initDatabase();
    const db = getDbPool();

    if (db) {
      const res = await db.query(
        'SELECT rules_json, updated_at FROM ulpana_access_rules WHERE id = $1',
        ['content_access']
      );

      if (res.rows.length > 0) {
        const row = res.rows[0];
        const json = row.rules_json || {};
        return NextResponse.json({
          ok: true,
          isEarlyAccessFree: Boolean(json.isEarlyAccessFree),
          lessonRules: json.lessonRules || {},
          updatedAt: row.updated_at,
          isDefault: false,
        });
      }
    }

    // Безопасный дефолтный fallback из config.ts
    const defaultLessonRules: Record<number, AccessRequirement> = {};
    for (let i = 1; i <= 100; i++) {
      defaultLessonRules[i] = getDefaultLessonRequirement(i);
    }

    return NextResponse.json({
      ok: true,
      isEarlyAccessFree: IS_EARLY_ACCESS_FREE,
      lessonRules: defaultLessonRules,
      updatedAt: null,
      isDefault: true,
    });
  } catch (err) {
    console.error('[Admin Access Rules GET] Error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ ok: false, error: 'Не удалось загрузить правила доступа' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status || 403 });
    }

    const body = await req.json();
    const isEarlyAccessFree = Boolean(body.isEarlyAccessFree);
    const rawRules = body.lessonRules || body.rules || {};

    // Валидация и санитизация правил
    const sanitizedRules: Record<number, AccessRequirement> = {};
    for (let i = 1; i <= 100; i++) {
      const reqVal = rawRules[i] || rawRules[String(i)];
      if (reqVal && VALID_REQUIREMENTS.includes(reqVal)) {
        sanitizedRules[i] = reqVal;
      } else {
        sanitizedRules[i] = getDefaultLessonRequirement(i);
      }
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json(
        { ok: false, error: 'База данных недоступна. Не удалось сохранить правила.' },
        { status: 503 }
      );
    }

    const payload = {
      isEarlyAccessFree,
      lessonRules: sanitizedRules,
    };

    const res = await db.query(
      `INSERT INTO ulpana_access_rules (id, rules_json, updated_at)
       VALUES ('content_access', $1, NOW())
       ON CONFLICT (id) DO UPDATE
       SET rules_json = EXCLUDED.rules_json, updated_at = NOW()
       RETURNING updated_at`,
      [JSON.stringify(payload)]
    );

    const updatedAt = res.rows[0]?.updated_at;

    return NextResponse.json({
      ok: true,
      message: 'Правила доступа успешно сохранены',
      isEarlyAccessFree,
      lessonRules: sanitizedRules,
      updatedAt,
    });
  } catch (err) {
    console.error('[Admin Access Rules POST] Error:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ ok: false, error: 'Не удалось сохранить правила' }, { status: 500 });
  }
}
