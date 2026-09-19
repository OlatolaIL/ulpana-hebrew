import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import fs from 'fs';
import path from 'path';

export interface LeadItem {
  id: string;
  timestamp: string;
  sourceChannel: 'whatsapp' | 'telegram' | 'facebook';
  sourceChatName: string;
  authorName: string;
  authorContact?: string;
  rawText: string;
  aiAnalysis: {
    isTargetLead: boolean;
    painCategory: 'courier_call' | 'kindergarten' | 'clinic' | 'interview' | 'speaking_barrier' | 'other';
    confidence: number;
    painSummary: string;
    targetDeepLink: string;
    suggestedReply: string;
  };
  status: 'new' | 'replied' | 'archived';
  repliedAt?: string;
  notes?: string;
}

const DATA_DIR = path.join(process.cwd(), 'growth', 'data');
const FILE_PATH = path.join(DATA_DIR, 'leads.json');

function ensureLeadsFile(): LeadItem[] {
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

function saveLeadsFile(items: LeadItem[]) {
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

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');

    let leads = ensureLeadsFile();
    if (statusFilter && statusFilter !== 'all') {
      leads = leads.filter((l) => l.status === statusFilter);
    }

    return NextResponse.json({ leads });
  } catch (error: any) {
    console.error('[API Admin Marketing Radar GET] Error:', error);
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
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Поля id и status обязательны' }, { status: 400 });
    }

    const leads = ensureLeadsFile();
    const idx = leads.findIndex((l) => l.id === id);

    if (idx === -1) {
      return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
    }

    leads[idx].status = status;
    if (notes !== undefined) {
      leads[idx].notes = notes;
    }
    if (status === 'replied' && !leads[idx].repliedAt) {
      leads[idx].repliedAt = new Date().toISOString();
    }

    saveLeadsFile(leads);

    return NextResponse.json({ success: true, lead: leads[idx] });
  } catch (error: any) {
    console.error('[API Admin Marketing Radar POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
