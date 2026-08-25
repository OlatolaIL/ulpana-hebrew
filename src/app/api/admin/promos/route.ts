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

    const res = await db.query('SELECT * FROM ulpana_promo_codes ORDER BY created_at DESC');

    const promos = res.rows.map((r) => ({
      id: r.id,
      code: r.code,
      daysValid: r.days_valid,
      maxUses: r.max_uses,
      usedCount: r.used_count,
      isActive: r.is_active,
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

    const { code, daysValid, maxUses } = await req.json();
    const cleanCode = String(code || '').trim().toUpperCase();
    const days = parseInt(String(daysValid || '30'), 10);
    const uses = parseInt(String(maxUses || '100'), 10);

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
      `INSERT INTO ulpana_promo_codes (id, code, days_valid, max_uses, used_count, is_active)
       VALUES ($1, $2, $3, $4, 0, true)`,
      [id, cleanCode, days, uses]
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

    const { id, isActive } = await req.json();
    if (!id) {
      return NextResponse.json({ error: 'ID промокода обязателен' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'База данных не подключена' }, { status: 503 });
    }

    await db.query(`UPDATE ulpana_promo_codes SET is_active = $1 WHERE id = $2`, [!!isActive, id]);

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
