import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import { MARKETING_PUBLICATIONS } from '@/data/marketingPublicationsData';

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
  status: 'draft' | 'scheduled' | 'published' | 'archived' | 'ready_for_upload' | 'ready';
  notes?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Seed publications from the JSON file or compiled module into the database
async function seedFromFile(db: ReturnType<typeof getDbPool>) {
  if (!db) return;
  let items: PublicationItem[] = MARKETING_PUBLICATIONS;
  const filePath = path.join(process.cwd(), 'growth', 'data', 'publications.json');
  try {
    if (fs.existsSync(filePath)) {
      items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch {
    // Keep in-memory MARKETING_PUBLICATIONS
  }
  if (!items || !items.length) return;

  for (const item of items) {
    try {
      await db.query(
        `INSERT INTO ulpana_publications (
          id, date, channel, channel_account, format, title, campaign_title, version,
          video_path, image_path, caption, target_deep_link, promo_code,
          full_url_with_promo, live_post_url, status, notes, scheduled_at, created_at, updated_at
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          caption = EXCLUDED.caption,
          notes = EXCLUDED.notes,
          campaign_title = EXCLUDED.campaign_title,
          version = EXCLUDED.version,
          video_path = EXCLUDED.video_path,
          image_path = EXCLUDED.image_path,
          target_deep_link = EXCLUDED.target_deep_link,
          promo_code = EXCLUDED.promo_code,
          full_url_with_promo = EXCLUDED.full_url_with_promo,
          format = EXCLUDED.format,
          live_post_url = CASE WHEN EXCLUDED.live_post_url <> '' THEN EXCLUDED.live_post_url ELSE ulpana_publications.live_post_url END,
          status = CASE WHEN EXCLUDED.status = 'published' THEN 'published' ELSE ulpana_publications.status END,
          scheduled_at = CASE WHEN EXCLUDED.scheduled_at IS NOT NULL THEN EXCLUDED.scheduled_at ELSE ulpana_publications.scheduled_at END,
          updated_at = EXCLUDED.updated_at
        WHERE ulpana_publications.title IS DISTINCT FROM EXCLUDED.title
           OR ulpana_publications.caption IS DISTINCT FROM EXCLUDED.caption
           OR ulpana_publications.notes IS DISTINCT FROM EXCLUDED.notes
           OR ulpana_publications.campaign_title IS DISTINCT FROM EXCLUDED.campaign_title
           OR ulpana_publications.video_path IS DISTINCT FROM EXCLUDED.video_path
           OR ulpana_publications.full_url_with_promo IS DISTINCT FROM EXCLUDED.full_url_with_promo
           OR (EXCLUDED.status = 'published' AND ulpana_publications.status <> 'published')
           OR (EXCLUDED.live_post_url <> '' AND ulpana_publications.live_post_url IS DISTINCT FROM EXCLUDED.live_post_url)`,
        [
          item.id, item.date, item.channel, item.channelAccount || '',
          item.format, item.title, item.campaignTitle || null, item.version || null,
          item.videoPath || null, item.imagePath || null, item.caption || null,
          item.targetDeepLink || '/lessons/1/call', item.promoCode || '',
          item.fullUrlWithPromo || '', item.livePostUrl || '',
          item.status || 'draft', item.notes || '',
          item.scheduledAt || null,
          item.createdAt || new Date().toISOString(),
          item.updatedAt || new Date().toISOString(),
        ]
      );
    } catch (itemErr) {
      console.warn(`[seedFromFile] Non-fatal item seed error for ${item.id}:`, itemErr);
    }
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
    scheduledAt: row.scheduled_at || undefined,
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
      let fallbackItems: PublicationItem[] = MARKETING_PUBLICATIONS;
      const filePath = path.join(process.cwd(), 'growth', 'data', 'publications.json');
      try {
        if (fs.existsSync(filePath)) {
          fallbackItems = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
      } catch (e) {
        console.error('[API Admin Marketing Publications GET] Fallback read error:', e);
      }
      return NextResponse.json({ publications: fallbackItems });
    }

    // Sync any missing publications from JSON file into database (idempotent)
    try {
      await seedFromFile(db);
    } catch (seedErr) {
      console.warn('[API Admin Marketing Publications GET] seedFromFile non-fatal error:', seedErr);
    }

    try {
      const result = await db.query(
        'SELECT * FROM ulpana_publications ORDER BY created_at DESC'
      );
      const publications = result.rows.map(rowToPublication);
      return NextResponse.json({ publications });
    } catch (queryErr) {
      console.error('[API Admin Marketing Publications GET] DB query failed, falling back to static publications:', queryErr);
      return NextResponse.json({ publications: MARKETING_PUBLICATIONS });
    }
  } catch (error: any) {
    console.error('[API Admin Marketing Publications GET] Error:', error);
    return NextResponse.json({ publications: MARKETING_PUBLICATIONS, error: 'Fallback to static publications' });
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
      scheduledAt,
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
            scheduled_at = CASE WHEN $18::text IS NOT NULL THEN NULLIF($18, '') ELSE ulpana_publications.scheduled_at END,
            updated_at = $19
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
            status || null, notes ?? null,
            scheduledAt !== undefined ? (scheduledAt ? String(scheduledAt).trim() : '') : null,
            now,
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
        full_url_with_promo, live_post_url, status, notes, scheduled_at, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)
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
        status || 'draft', notes || '',
        scheduledAt ? String(scheduledAt).trim() : null,
        now, now,
      ]
    );

    return NextResponse.json({ success: true, publication: rowToPublication(result.rows[0]) });
  } catch (error: any) {
    console.error('[API Admin Marketing Publications POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const body = await req.json();
    const { id, scheduledAt, date, status } = body;
    if (!id) {
      return NextResponse.json({ error: 'Параметр id обязателен' }, { status: 400 });
    }

    await initDatabase();
    const db = getDbPool();
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 503 });
    }

    const now = new Date().toISOString();

    // Determine status if not explicitly given:
    let newStatus = status;
    if (newStatus === undefined) {
      if (scheduledAt) {
        newStatus = 'scheduled';
      } else if (scheduledAt === null || scheduledAt === '') {
        newStatus = 'draft';
      }
    }

    const cleanScheduledAt = scheduledAt !== undefined ? (scheduledAt ? String(scheduledAt).trim() : null) : undefined;
    const cleanDate = date ? String(date).trim() : null;

    const result = await db.query(
      `UPDATE ulpana_publications SET
        scheduled_at = CASE WHEN $2::boolean THEN $3 ELSE scheduled_at END,
        date = COALESCE($4, date),
        status = COALESCE($5, status),
        updated_at = $6
      WHERE id = $1
      RETURNING *`,
      [
        id,
        cleanScheduledAt !== undefined,
        cleanScheduledAt || null,
        cleanDate,
        newStatus || null,
        now,
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Публикация не найдена' }, { status: 404 });
    }

    const updatedPub = rowToPublication(result.rows[0]);

    // Sync to growth/data/publications.json if it exists
    try {
      const filePath = path.join(process.cwd(), 'growth', 'data', 'publications.json');
      if (fs.existsSync(filePath)) {
        const fileItems: any[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        const idx = fileItems.findIndex((i) => i.id === id);
        if (idx !== -1) {
          if (updatedPub.scheduledAt) {
            fileItems[idx].scheduledAt = updatedPub.scheduledAt;
          } else {
            delete fileItems[idx].scheduledAt;
          }
          if (updatedPub.date) fileItems[idx].date = updatedPub.date;
          if (updatedPub.status) fileItems[idx].status = updatedPub.status;
          fileItems[idx].updatedAt = now;
          fs.writeFileSync(filePath, JSON.stringify(fileItems, null, 2), 'utf-8');
        }
      }
    } catch (fsErr) {
      console.warn('[API Admin Marketing Publications PATCH] publications.json update warning:', fsErr);
    }

    return NextResponse.json({ success: true, publication: updatedPub });
  } catch (error: any) {
    console.error('[API Admin Marketing Publications PATCH] Error:', error);
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
