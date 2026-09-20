import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
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

const DATA_DIR = path.join(process.cwd(), 'growth', 'data');
const FILE_PATH = path.join(DATA_DIR, 'publications.json');

function ensureDataFile(): PublicationItem[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveDataFile(items: PublicationItem[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const items = ensureDataFile();
    return NextResponse.json({ publications: items });
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

    const cleanPromo = String(promoCode || '').trim().toUpperCase();
    const cleanLink = String(targetDeepLink || '/lessons/1/call').trim();
    const origin = 'https://ulpana-alef.com';
    const fullUrl = cleanPromo
      ? `${origin}${cleanLink}${cleanLink.includes('?') ? '&' : '?'}promo=${cleanPromo}`
      : `${origin}${cleanLink}`;

    const items = ensureDataFile();
    const now = new Date().toISOString();

    if (id) {
      const idx = items.findIndex((p) => p.id === id);
      if (idx !== -1) {
        items[idx] = {
          ...items[idx],
          date: date || items[idx].date,
          channel: channel || items[idx].channel,
          channelAccount: channelAccount ?? items[idx].channelAccount,
          format: format || items[idx].format,
          title: title || items[idx].title,
          campaignTitle: campaignTitle !== undefined ? campaignTitle : items[idx].campaignTitle,
          version: version !== undefined ? version : items[idx].version,
          videoPath: videoPath !== undefined ? videoPath : items[idx].videoPath,
          caption: caption !== undefined ? caption : items[idx].caption,
          targetDeepLink: cleanLink,
          promoCode: cleanPromo,
          fullUrlWithPromo: fullUrl,
          livePostUrl: livePostUrl ?? items[idx].livePostUrl,
          status: status || items[idx].status,
          notes: notes ?? items[idx].notes,
          updatedAt: now,
        };
        saveDataFile(items);
        return NextResponse.json({ success: true, publication: items[idx] });
      }
    }

    const newItem: PublicationItem = {
      id: `pub-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: date || now.split('T')[0],
      channel: channel || 'telegram',
      channelAccount: channelAccount || '',
      format: format || 'post',
      title: title.trim(),
      campaignTitle: campaignTitle ? String(campaignTitle).trim() : undefined,
      version: version ? String(version).trim() : undefined,
      videoPath: videoPath ? String(videoPath).trim() : undefined,
      caption: caption ? String(caption).trim() : undefined,
      targetDeepLink: cleanLink,
      promoCode: cleanPromo,
      fullUrlWithPromo: fullUrl,
      livePostUrl: String(livePostUrl || '').trim(),
      status: status || 'draft',
      notes: notes || '',
      createdAt: now,
      updatedAt: now,
    };

    items.unshift(newItem);
    saveDataFile(items);

    return NextResponse.json({ success: true, publication: newItem });
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

    const items = ensureDataFile();
    const filtered = items.filter((p) => p.id !== id);

    if (filtered.length === items.length) {
      return NextResponse.json({ error: 'Публикация не найдена' }, { status: 404 });
    }

    saveDataFile(filtered);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('[API Admin Marketing Publications DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
