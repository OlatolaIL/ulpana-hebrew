import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ isDbConnected: false, promos: [] });
    }

    // Авто-сидинг стандартных канальных и целевых промокодов, если их ещё нет
    const standardPresets = [
      { code: 'TG_GENERAL', days: 14, uses: 500, type: 'general', channel: 'tg', desc: 'Ссылка в описании / закреп канала @ulpana_il' },
      { code: 'TG_MAMA', days: 30, uses: 1000, type: 'post', channel: 'tg', desc: 'Пост для мам в канале @ulpana_il' },
      { code: 'LATTE_MAMA', days: 30, uses: 1000, type: 'post', channel: 'fb', desc: 'Пост Сергея для мам в группе «Тыквенный латте»' },
      { code: 'MOMS', days: 30, uses: 500, type: 'general', channel: 'other', desc: 'Общий промокод для мам Израиля' },
    ];

    for (const p of standardPresets) {
      await db.query(
        `INSERT INTO ulpana_promo_codes (id, code, days_valid, max_uses, used_count, is_active, code_type, channel, description)
         VALUES ($1, $2, $3, $4, 0, true, $5, $6, $7)
         ON CONFLICT (code) DO NOTHING`,
        [`promo_${p.code.toLowerCase()}_system`, p.code, p.days, p.uses, p.type, p.channel, p.desc]
      );
    }

    const res = await db.query('SELECT * FROM ulpana_promo_codes ORDER BY created_at DESC');

    const promos = res.rows.map((r) => ({
      id: r.id,
      code: r.code,
      daysValid: r.days_valid,
      maxUses: r.max_uses,
      usedCount: r.used_count,
      isActive: r.is_active,
      codeType: r.code_type || 'general',
      channel: r.channel || 'tg',
      postLink: r.post_link || null,
      description: r.description || null,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      isDbConnected: true,
      promos,
    });
  } catch (error) {
    console.error('[API Admin Promos GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const { code, daysValid, maxUses, codeType, channel, postLink, description } = await req.json();
    const cleanCode = String(code || '').trim().toUpperCase();
    const days = parseInt(String(daysValid || '30'), 10);
    const uses = parseInt(String(maxUses || '100'), 10);
    const cleanCodeType = codeType === 'post' ? 'post' : 'general';
    const cleanChannel = String(channel || 'tg').trim().toLowerCase();
    const cleanPostLink = postLink ? String(postLink).trim() : null;
    const cleanDescription = description ? String(description).trim() : null;

    if (!cleanCode) {
      return NextResponse.json({ error: 'Код промокода обязателен' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'База данных не подключена' }, { status: 503 });
    }

    const id = `promo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    await db.query(
      `INSERT INTO ulpana_promo_codes (id, code, days_valid, max_uses, used_count, is_active, code_type, channel, post_link, description)
       VALUES ($1, $2, $3, $4, 0, true, $5, $6, $7, $8)`,
      [id, cleanCode, days, uses, cleanCodeType, cleanChannel, cleanPostLink, cleanDescription]
    );

    return NextResponse.json({
      success: true,
      promo: {
        id,
        code: cleanCode,
        daysValid: days,
        maxUses: uses,
        usedCount: 0,
        isActive: true,
        codeType: cleanCodeType,
        channel: cleanChannel,
        postLink: cleanPostLink,
        description: cleanDescription,
      },
    });
  } catch (error: any) {
    console.error('[API Admin Promos POST] Error:', error);
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'Промокод с таким названием уже существует' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const { id, isActive, postLink, description } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID промокода обязателен' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'База данных не подключена' }, { status: 503 });
    }

    if (typeof isActive === 'boolean') {
      await db.query(`UPDATE ulpana_promo_codes SET is_active = $1 WHERE id = $2`, [isActive, id]);
    }
    if (typeof postLink !== 'undefined' || typeof description !== 'undefined') {
      await db.query(
        `UPDATE ulpana_promo_codes
         SET post_link = COALESCE($1, post_link),
             description = COALESCE($2, description)
         WHERE id = $3`,
        [postLink ?? null, description ?? null, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Admin Promos PATCH] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID промокода обязателен' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'База данных не подключена' }, { status: 503 });
    }

    await db.query(`DELETE FROM ulpana_promo_codes WHERE id = $1`, [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API Admin Promos DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
