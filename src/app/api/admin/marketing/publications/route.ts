import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export interface PublicationItem {
  id: string;
  date: string;
  channel: 'tiktok' | 'youtube' | 'telegram' | 'facebook' | 'instagram';
  channelAccount: string;
  format: 'short_video' | 'post' | 'story' | 'storytelling' | 'poll';
  title: string;
  campaignTitle?: string;
  version?: string;
  videoPath?: string;
  imagePath?: string;
  caption?: string;
  targetDeepLink: string;
  promoCode: string;
  fullUrlWithPromo: string;
  livePostUrl: string;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Seed publications from the JSON file into the database (runs once)
async function seedFromFile(db: ReturnType<typeof getDbPool>) {
  if (!db) return;
  const filePath = path.join(process.cwd(), 'growth', 'data', 'publications.json');
  let items: PublicationItem[] = [];
  try {
    if (fs.existsSync(filePath)) {
      items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {
    return; // No seed file available
  }
  if (!items.length) return;

  for (const item of items) {
    await db.query(
      `INSERT INTO ulpana_publications (
        id, date, channel, channel_account, format, title, campaign_title, version,
        video_path, image_path, caption, target_deep_link, promo_code,
        full_url_with_promo, live_post_url, status, notes, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      ON CONFLICT (id) DO NOTHING`,
      [
        item.id, item.date, item.channel, item.channelAccount || '',
        item.format, item.title, item.campaignTitle || null, item.version || null,
        item.videoPath || null, item.imagePath || null, item.caption || null,
        item.targetDeepLink || '/lessons/1/call', item.promoCode || '',
        item.fullUrlWithPromo || '', item.livePostUrl || '',
        item.status || 'draft', item.notes || '',
        item.createdAt || new Date().toISOString(),
        item.updatedAt || new Date().toISOString(),
      ]
    );
  }
}

function rowToPublication(row: any): PublicationItem {
  return {
    id: row.id,
    date: row.date,
    channel: row.channel,
    channelAccount: row.channel_account || '',
    format: row.format,
    title: row.title,
    campaignTitle: row.campaign_title || undefined,
    version: row.version || undefined,
    videoPath: row.video_path || undefined,
    imagePath: row.image_path || undefined,
    caption: row.caption || undefined,
    targetDeepLink: row.target_deep_link || '/lessons/1/call',
    promoCode: row.promo_code || '',
    fullUrlWithPromo: row.full_url_with_promo || '',
    livePostUrl: row.live_post_url || '',
    status: row.status || 'draft',
    notes: row.notes || undefined,
    createdAt: row.created_at?.toISOString?.() || row.created_at || '',
    updatedAt: row.updated_at?.toISOString?.() || row.updated_at || '',
  };
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ publications: [] });
    }

    // Seed from JSON file on first access
    const countRes = await db.query('SELECT COUNT(*) AS cnt FROM ulpana_publications');
    if (parseInt(countRes.rows[0].cnt) === 0) {
      await seedFromFile(db);
    }

    const result = await db.query(
      'SELECT * FROM ulpana_publications ORDER BY created_at DESC'
    );
    const publications = result.rows.map(rowToPublication);
    return NextResponse.json({ publications });
  } catch (error: any) {
    console.error('[API Admin Marketing Publications GET] Error:', error);
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
    const {
      id,
      date,
      channel,
      channelAccount,
      format,
      title,
      campaignTitle,
      version,
      videoPath,
      imagePath,
      caption,
      targetDeepLink,
      promoCode,
      livePostUrl,
      status,
      notes,
    } = body;

    if (!title || !channel || !format) {
      return NextResponse.json(
        { error: 'Поля title, channel и format обязательны' },
        { status: 400 }
      );
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const cleanPromo = String(promoCode || '').trim().toUpperCase();
    const cleanLink = String(targetDeepLink || '/lessons/1/call').trim();
    const origin = 'https://ulpana-alef.com';
    const fullUrl = cleanPromo
      ? `${origin}${cleanLink}${cleanLink.includes('?') ? '&' : '?'}promo=${cleanPromo}`
      : `${origin}${cleanLink}`;

    const now = new Date().toISOString();

    if (id) {
      // Update existing publication
      const existing = await db.query('SELECT id FROM ulpana_publications WHERE id = $1', [id]);
      if (existing.rows.length > 0) {
        const result = await db.query(
          `UPDATE ulpana_publications SET
            date = COALESCE($2, date),
            channel = COALESCE($3, channel),
            channel_account = COALESCE($4, channel_account),
            format = COALESCE($5, format),
            title = COALESCE($6, title),
            campaign_title = $7,
            version = $8,
            video_path = $9,
            image_path = $10,
            caption = $11,
            target_deep_link = $12,
            promo_code = $13,
            full_url_with_promo = $14,
            live_post_url = COALESCE($15, live_post_url),
            status = COALESCE($16, status),
            notes = $17,
            updated_at = $18
          WHERE id = $1
          RETURNING *`,
          [
            id,
            date || null, channel || null, channelAccount ?? null,
            format || null, title || null,
            campaignTitle !== undefined ? campaignTitle : null,
            version !== undefined ? version : null,
            videoPath !== undefined ? videoPath : null,
            imagePath !== undefined ? imagePath : null,
            caption !== undefined ? caption : null,
            cleanLink, cleanPromo, fullUrl,
            livePostUrl ?? null,
            status || null, notes ?? null, now,
          ]
        );
        return NextResponse.json({ success: true, publication: rowToPublication(result.rows[0]) });
      }
    }

    // Create new publication
    const newId = id || `pub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const result = await db.query(
      `INSERT INTO ulpana_publications (
        id, date, channel, channel_account, format, title, campaign_title, version,
        video_path, image_path, caption, target_deep_link, promo_code,
        full_url_with_promo, live_post_url, status, notes, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
      RETURNING *`,
      [
        newId, date || now.split('T')[0], channel || 'telegram',
        channelAccount || '', format || 'post', title.trim(),
        campaignTitle ? String(campaignTitle).trim() : null,
        version ? String(version).trim() : null,
        videoPath ? String(videoPath).trim() : null,
        imagePath ? String(imagePath).trim() : null,
        caption ? String(caption).trim() : null,
        cleanLink, cleanPromo, fullUrl,
        String(livePostUrl || '').trim(),
        status || 'draft', notes || '', now, now,
      ]
    );

    return NextResponse.json({ success: true, publication: rowToPublication(result.rows[0]) });
  } catch (error: any) {
    console.error('[API Admin Marketing Publications POST] Error:', error);
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
      return NextResponse.json({ error: 'Параметр id обязателен' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const result = await db.query(
      'DELETE FROM ulpana_publications WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Публикация не найдена' }, { status: 404 });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('[API Admin Marketing Publications DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
