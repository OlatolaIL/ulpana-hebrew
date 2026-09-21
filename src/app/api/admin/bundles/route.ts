import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';
import { DEFAULT_BUNDLES, PromoAccessBundle } from '@/lib/promoBundles';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ isDbConnected: false, bundles: DEFAULT_BUNDLES });
    }

    // Авто-сидинг системных бандлов по умолчанию при первом обращении
    for (const b of DEFAULT_BUNDLES) {
      await db.query(
        `INSERT INTO ulpana_promo_bundles (id, name, description, icon, unlocked_lessons, unlocked_decks, unlocked_categories)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO NOTHING`,
        [b.id, b.name, b.description, b.icon, b.unlockedLessons, b.unlockedDecks, b.unlockedCategories]
      );
    }

    const res = await db.query(`
      SELECT b.*, 
             COUNT(p.id)::int AS promo_count
      FROM ulpana_promo_bundles b
      LEFT JOIN ulpana_promo_codes p ON p.bundle_id = b.id
      GROUP BY b.id
      ORDER BY b.created_at ASC
    `);

    const bundles = res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description || '',
      icon: r.icon || '🎁',
      unlockedLessons: r.unlocked_lessons || [],
      unlockedDecks: r.unlocked_decks || [],
      unlockedCategories: r.unlocked_categories || [],
      promoCount: r.promo_count || 0,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      isDbConnected: true,
      bundles,
    });
  } catch (error) {
    console.error('[API Admin Bundles GET] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const body = await req.json();
    const { id, name, description, icon, unlockedLessons, unlockedDecks, unlockedCategories } = body;

    const cleanName = String(name || '').trim();
    if (!cleanName) {
      return NextResponse.json({ error: 'Название пакета обязательно' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'База данных не подключена' }, { status: 503 });
    }

    const bundleId = id ? String(id).trim() : `bundle_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const cleanDesc = description ? String(description).trim() : '';
    const cleanIcon = icon ? String(icon).trim() : '🎁';
    const lessons: number[] = Array.isArray(unlockedLessons) ? unlockedLessons.map(Number).filter((n) => !isNaN(n)) : [];
    const decks: string[] = Array.isArray(unlockedDecks) ? unlockedDecks.map(String) : [];
    const categories: string[] = Array.isArray(unlockedCategories) ? unlockedCategories.map(String) : [];

    await db.query(
      `INSERT INTO ulpana_promo_bundles (id, name, description, icon, unlocked_lessons, unlocked_decks, unlocked_categories, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         icon = EXCLUDED.icon,
         unlocked_lessons = EXCLUDED.unlocked_lessons,
         unlocked_decks = EXCLUDED.unlocked_decks,
         unlocked_categories = EXCLUDED.unlocked_categories,
         updated_at = NOW()`,
      [bundleId, cleanName, cleanDesc, cleanIcon, lessons, decks, categories]
    );

    return NextResponse.json({
      success: true,
      bundle: {
        id: bundleId,
        name: cleanName,
        description: cleanDesc,
        icon: cleanIcon,
        unlockedLessons: lessons,
        unlockedDecks: decks,
        unlockedCategories: categories,
      },
    });
  } catch (error) {
    console.error('[API Admin Bundles POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID пакета обязателен' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'База данных не подключена' }, { status: 503 });
    }

    // Отвязываем промокоды от этого пакета
    await db.query(`UPDATE ulpana_promo_codes SET bundle_id = NULL WHERE bundle_id = $1`, [id]);
    // Удаляем пакет
    await db.query(`DELETE FROM ulpana_promo_bundles WHERE id = $1`, [id]);

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('[API Admin Bundles DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
