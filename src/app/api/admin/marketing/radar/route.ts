import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { getDbPool, initDatabase } from '@/lib/db';
import fs from 'fs';
import path from 'path';

export interface LeadItem {
  id: string;
  timestamp: string;
  sourceChannel: 'whatsapp' | 'telegram' | 'facebook';
  sourceChatName: string;
  authorName: string;
  authorContact?: string;
  postUrl?: string;
  rawText: string;
  aiAnalysis: {
    isTargetLead: boolean;
    painCategory: 'courier_call' | 'kindergarten' | 'clinic' | 'interview' | 'speaking_barrier' | 'other' | string;
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
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(FILE_PATH)) {
      fs.writeFileSync(FILE_PATH, JSON.stringify([], null, 2), 'utf-8');
      return [];
    }
    const raw = fs.readFileSync(FILE_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLeadsFile(items: LeadItem[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(FILE_PATH, JSON.stringify(items, null, 2), 'utf-8');
  } catch (e) {
    // На сервере без прав записи в диск (например, Vercel Serverless) операция игнорируется
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status');
    const channelFilter = searchParams.get('channel');

    // 1. Попытка запроса в PostgreSQL
    try {
      await initDatabase();
      const db = getDbPool();
      if (db) {
        let query = 'SELECT * FROM ulpana_marketing_leads WHERE 1=1';
        const params: any[] = [];
        let pIdx = 1;

        if (statusFilter && statusFilter !== 'all') {
          query += ` AND status = $${pIdx++}`;
          params.push(statusFilter);
        }
        if (channelFilter && channelFilter !== 'all') {
          query += ` AND source_channel = $${pIdx++}`;
          params.push(channelFilter);
        }

        query += ' ORDER BY timestamp DESC LIMIT 200';
        const res = await db.query(query, params);

        const leads: LeadItem[] = res.rows.map((r) => ({
          id: r.id,
          timestamp: r.timestamp?.toISOString ? r.timestamp.toISOString() : String(r.timestamp),
          sourceChannel: r.source_channel,
          sourceChatName: r.source_chat_name,
          authorName: r.author_name,
          authorContact: r.author_contact || undefined,
          postUrl: r.post_url || undefined,
          rawText: r.raw_text,
          aiAnalysis: r.ai_analysis,
          status: r.status,
          repliedAt: r.replied_at?.toISOString ? r.replied_at.toISOString() : r.replied_at || undefined,
          notes: r.notes || undefined,
        }));

        return NextResponse.json({ leads, source: 'postgres' });
      }
    } catch (dbErr) {
      console.warn('[API Admin Marketing Radar GET] DB fallback to file:', dbErr);
    }

    // 2. Фолбэк на локальный файл
    let leads = ensureLeadsFile();
    if (statusFilter && statusFilter !== 'all') {
      leads = leads.filter((l) => l.status === statusFilter);
    }
    if (channelFilter && channelFilter !== 'all') {
      leads = leads.filter((l) => l.sourceChannel === channelFilter);
    }

    return NextResponse.json({ leads, source: 'file' });
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

    // СЦЕНАРИЙ А: Приём новых лидов от локального парсера (action === 'ingest' или массив leads)
    if (body.action === 'ingest' || Array.isArray(body.leads) || body.lead) {
      const incomingList: LeadItem[] = Array.isArray(body.leads)
        ? body.leads
        : body.lead
        ? [body.lead]
        : [];

      if (incomingList.length === 0) {
        return NextResponse.json({ error: 'Список лидов пуст' }, { status: 400 });
      }

      let insertedCount = 0;

      // 1. Попытка вставки в PostgreSQL
      try {
        await initDatabase();
        const db = getDbPool();
        if (db) {
          for (const item of incomingList) {
            const query = `
              INSERT INTO ulpana_marketing_leads (
                id, timestamp, source_channel, source_chat_name, author_name,
                author_contact, post_url, raw_text, ai_analysis, status, notes
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
              ON CONFLICT (id) DO UPDATE SET
                post_url = COALESCE(EXCLUDED.post_url, ulpana_marketing_leads.post_url),
                ai_analysis = EXCLUDED.ai_analysis,
                updated_at = NOW()
            `;
            await db.query(query, [
              item.id || `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              item.timestamp || new Date().toISOString(),
              item.sourceChannel,
              item.sourceChatName,
              item.authorName,
              item.authorContact || null,
              item.postUrl || null,
              item.rawText,
              JSON.stringify(item.aiAnalysis),
              item.status || 'new',
              item.notes || null,
            ]);
            insertedCount++;
          }
        }
      } catch (dbErr) {
        console.warn('[API Admin Marketing Radar POST ingest] DB error, using file fallback:', dbErr);
      }

      // 2. Сохраняем также в локальный leads.json для локальной разработки
      const localLeads = ensureLeadsFile();
      for (const item of incomingList) {
        const idx = localLeads.findIndex((l) => l.id === item.id);
        if (idx >= 0) {
          localLeads[idx] = { ...localLeads[idx], ...item };
        } else {
          localLeads.unshift(item);
          if (insertedCount === 0) insertedCount++;
        }
      }
      saveLeadsFile(localLeads);

      return NextResponse.json({
        success: true,
        ingested: incomingList.length,
        message: `Успешно сохранено ${incomingList.length} лидов`,
      });
    }

    // СЦЕНАРИЙ Б: Обновление статуса лида (new -> replied -> archived)
    const { id, status, notes } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Поля id и status обязательны' }, { status: 400 });
    }

    let updatedLead: LeadItem | null = null;

    // 1. Обновление в PostgreSQL
    try {
      await initDatabase();
      const db = getDbPool();
      if (db) {
        const query = `
          UPDATE ulpana_marketing_leads
          SET
            status = $1,
            notes = COALESCE($2, notes),
            replied_at = CASE WHEN $1 = 'replied' AND replied_at IS NULL THEN NOW() ELSE replied_at END,
            updated_at = NOW()
          WHERE id = $3
          RETURNING *
        `;
        const res = await db.query(query, [status, notes !== undefined ? notes : null, id]);
        if (res.rows.length > 0) {
          const r = res.rows[0];
          updatedLead = {
            id: r.id,
            timestamp: r.timestamp?.toISOString ? r.timestamp.toISOString() : String(r.timestamp),
            sourceChannel: r.source_channel,
            sourceChatName: r.source_chat_name,
            authorName: r.author_name,
            authorContact: r.author_contact || undefined,
            postUrl: r.post_url || undefined,
            rawText: r.raw_text,
            aiAnalysis: r.ai_analysis,
            status: r.status,
            repliedAt: r.replied_at?.toISOString ? r.replied_at.toISOString() : r.replied_at || undefined,
            notes: r.notes || undefined,
          };
        }
      }
    } catch (dbErr) {
      console.warn('[API Admin Marketing Radar POST update] DB error, using file:', dbErr);
    }

    // 2. Обновление в локальном leads.json
    const leads = ensureLeadsFile();
    const idx = leads.findIndex((l) => l.id === id);

    if (idx !== -1) {
      leads[idx].status = status;
      if (notes !== undefined) {
        leads[idx].notes = notes;
      }
      if (status === 'replied' && !leads[idx].repliedAt) {
        leads[idx].repliedAt = new Date().toISOString();
      }
      saveLeadsFile(leads);
      if (!updatedLead) updatedLead = leads[idx];
    }

    if (!updatedLead && idx === -1) {
      return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });
    }

    return NextResponse.json({ success: true, lead: updatedLead });
  } catch (error: any) {
    console.error('[API Admin Marketing Radar POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
