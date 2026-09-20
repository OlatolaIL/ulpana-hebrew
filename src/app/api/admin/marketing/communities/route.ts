import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

export interface TargetCommunity {
  id: string;
  title: string;
  username: string;
  inviteUrl: string;
  platform: 'telegram' | 'whatsapp' | 'facebook';
  category: 'repatriation' | 'moms' | 'city_haifa' | 'city_center' | 'it_jobs' | 'other';
  categoryLabel?: string;
  membersCount: string;
  status: 'active' | 'paused' | 'backlog';
  leadCount: number;
  notes?: string;
}

const DATA_DIR = path.join(process.cwd(), 'growth', 'data');
const COMMUNITIES_FILE = path.join(DATA_DIR, 'target_communities.json');
const LEADS_FILE = path.join(DATA_DIR, 'leads.json');

function ensureCommunitiesFile(): TargetCommunity[] {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(COMMUNITIES_FILE)) {
    fs.writeFileSync(COMMUNITIES_FILE, JSON.stringify([], null, 2), 'utf-8');
    return [];
  }
  try {
    const raw = fs.readFileSync(COMMUNITIES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveCommunitiesFile(items: TargetCommunity[]) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(COMMUNITIES_FILE, JSON.stringify(items, null, 2), 'utf-8');
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const communities = ensureCommunitiesFile();

    // Синхронизируем количество найденных лидов с leads.json
    try {
      if (fs.existsSync(LEADS_FILE)) {
        const leads = JSON.parse(fs.readFileSync(LEADS_FILE, 'utf-8'));
        communities.forEach((c) => {
          const uName = (c.username || '').replace(/^@/, '').toLowerCase();
          c.leadCount = leads.filter((l: any) => {
            const chatName = (l.sourceChatName || '').toLowerCase();
            return chatName.includes(uName) || chatName.includes(c.title.toLowerCase());
          }).length;
        });
      }
    } catch (e) {
      // Игнорируем ошибки подсчета лидов
    }

    return NextResponse.json({ communities });
  } catch (error: any) {
    console.error('[API Admin Marketing Communities GET] Error:', error);
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
    const { title, username, inviteUrl, category, notes, membersCount } = body;

    if (!title || !username) {
      return NextResponse.json({ error: 'Поля title и username обязательны' }, { status: 400 });
    }

    const cleanUsername = username.replace(/^@/, '').trim();
    const id = cleanUsername.toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const communities = ensureCommunitiesFile();
    if (communities.some((c) => c.id === id)) {
      return NextResponse.json({ error: 'Сообщество с таким юзернеймом уже есть в списке' }, { status: 409 });
    }

    const categoryLabels: Record<string, string> = {
      repatriation: 'Репатриация и адаптация',
      moms: 'Семья и дети',
      city_haifa: 'Хайфа и Север',
      city_center: 'Центр Израиля',
      it_jobs: 'Хайтек и работа',
      other: 'Общее',
    };

    const newCommunity: TargetCommunity = {
      id,
      title: title.trim(),
      username: cleanUsername,
      inviteUrl: inviteUrl?.trim() || `https://t.me/${cleanUsername}`,
      platform: 'telegram',
      category: category || 'repatriation',
      categoryLabel: categoryLabels[category] || 'Общее',
      membersCount: membersCount?.trim() || '—',
      status: 'active',
      leadCount: 0,
      notes: notes?.trim() || '',
    };

    communities.unshift(newCommunity);
    saveCommunitiesFile(communities);

    return NextResponse.json({ success: true, community: newCommunity });
  } catch (error: any) {
    console.error('[API Admin Marketing Communities POST] Error:', error);
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
    const { id, status, notes } = body;

    if (!id) {
      return NextResponse.json({ error: 'Поле id обязательно' }, { status: 400 });
    }

    const communities = ensureCommunitiesFile();
    const idx = communities.findIndex((c) => c.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Сообщество не найдено' }, { status: 404 });
    }

    if (status) communities[idx].status = status;
    if (notes !== undefined) communities[idx].notes = notes;

    saveCommunitiesFile(communities);

    return NextResponse.json({ success: true, community: communities[idx] });
  } catch (error: any) {
    console.error('[API Admin Marketing Communities PATCH] Error:', error);
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

    let communities = ensureCommunitiesFile();
    communities = communities.filter((c) => c.id !== id);
    saveCommunitiesFile(communities);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API Admin Marketing Communities DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
