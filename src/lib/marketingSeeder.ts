import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { MARKETING_PUBLICATIONS, PublicationItem } from '@/data/marketingPublicationsData';

/**
 * Синхронизирует реестр маркетинговых публикаций с таблицей PostgreSQL ulpana_publications.
 * Работает как на боевом сервере Vercel (через скомпилированный модуль MARKETING_PUBLICATIONS),
 * так и локально (с приоритетом свежего файла growth/data/publications.json при его наличии).
 */
export async function seedPublications(db: Pool | null): Promise<number> {
  if (!db) return 0;

  let items: PublicationItem[] = MARKETING_PUBLICATIONS;
  const filePath = path.join(process.cwd(), 'growth', 'data', 'publications.json');
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      items = JSON.parse(raw);
    }
  } catch {
    // В serverless-окружении Vercel опираемся на MARKETING_PUBLICATIONS
  }

  if (!items || !items.length) return 0;

  let seededCount = 0;
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
          status = CASE 
            WHEN ulpana_publications.status = 'published' THEN 'published' 
            ELSE EXCLUDED.status 
          END,
          scheduled_at = CASE 
            WHEN EXCLUDED.scheduled_at IS NOT NULL THEN EXCLUDED.scheduled_at 
            ELSE ulpana_publications.scheduled_at 
          END,
          updated_at = EXCLUDED.updated_at
        WHERE ulpana_publications.title IS DISTINCT FROM EXCLUDED.title
           OR ulpana_publications.caption IS DISTINCT FROM EXCLUDED.caption
           OR ulpana_publications.notes IS DISTINCT FROM EXCLUDED.notes
           OR ulpana_publications.campaign_title IS DISTINCT FROM EXCLUDED.campaign_title
           OR ulpana_publications.video_path IS DISTINCT FROM EXCLUDED.video_path
           OR ulpana_publications.full_url_with_promo IS DISTINCT FROM EXCLUDED.full_url_with_promo
           OR (EXCLUDED.status = 'published' AND ulpana_publications.status <> 'published')
           OR (EXCLUDED.live_post_url <> '' AND ulpana_publications.live_post_url IS DISTINCT FROM EXCLUDED.live_post_url)
           OR (EXCLUDED.scheduled_at IS NOT NULL AND ulpana_publications.scheduled_at IS DISTINCT FROM EXCLUDED.scheduled_at)`,
        [
          item.id,
          item.date,
          item.channel,
          item.channelAccount || '',
          item.format,
          item.title,
          item.campaignTitle || null,
          item.version || null,
          item.videoPath || null,
          item.imagePath || null,
          item.caption || null,
          item.targetDeepLink || '/lessons/1/call',
          item.promoCode || '',
          item.fullUrlWithPromo || '',
          item.livePostUrl || '',
          item.status || 'draft',
          item.notes || '',
          item.scheduledAt || null,
          item.createdAt || new Date().toISOString(),
          item.updatedAt || new Date().toISOString(),
        ]
      );
      seededCount++;
    } catch (itemErr: any) {
      console.warn(`[seedPublications] Non-fatal seed error for ${item.id}:`, itemErr.message);
    }
  }

  return seededCount;
}
