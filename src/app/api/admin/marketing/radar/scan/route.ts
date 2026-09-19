import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/lib/adminAuth';
import { groqModels, geminiApiKeys } from '@/lib/aiModels';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'growth', 'data');
const FILE_PATH = path.join(DATA_DIR, 'leads.json');

// Контур 1: Быстрое «Ситечко» (RegExp маркеров боли)
const TRIGGER_PATTERNS = [
  /курьер/i,
  /вольт/i,
  /wolt/i,
  /садик/i,
  /воспитател/i,
  /собес/i,
  /интервью/i,
  /ульпан/i,
  /иврит/i,
  /не понима/i,
  /ступор/i,
  /боюсь/i,
  /страх/i,
  /стыдно/i,
  /перевод/i,
  /произношен/i,
  /мисрад/i,
  /поликлиник/i,
  /макаби/i,
  /клалит/i,
];

function matchesTrigger(text: string): boolean {
  return TRIGGER_PATTERNS.some((p) => p.test(text));
}

export async function POST(req: NextRequest) {
  try {
    const auth = await verifyAdminRequest(req);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
    }

    const body = await req.json().catch(() => ({}));
    const rawText = body.text?.trim() || '';
    const sourceChat = body.chat || 'WhatsApp: Репатрианты';
    const author = body.author || 'Участник чата';
    const contact = body.contact || '';

    if (!rawText) {
      return NextResponse.json(
        { message: 'Сканирование завершено. Новых входящих сообщений нет.' },
        { status: 200 }
      );
    }

    // Этап 1: Проверка триггерным фильтром
    if (!matchesTrigger(rawText)) {
      return NextResponse.json({
        isTargetLead: false,
        message: 'Сообщение отфильтровано: маркеров языковой боли не обнаружено.',
      });
    }

    // Этап 2: Семантический анализ через Groq (или Gemini fallback)
    const groqKey = process.env.GROQ_API_KEY?.trim();
    let analysisResult: any = null;

    const systemPrompt = `Ты — эксперт по языковой адаптации репатриантов в Израиле и аналитик приложения «Ульпан Алеф».
Твоя задача — проанализировать эмоциональное сообщение из израильского чата.
Определи:
1. isTargetLead: жалуется ли человек на проблему с ивритом / языковой барьер / непонимание? (true/false)
2. painCategory: 'courier_call' | 'kindergarten' | 'clinic' | 'interview' | 'speaking_barrier' | 'other'
3. confidence: число от 1 до 10
4. painSummary: краткая формулировка боли (на русском, до 10 слов)
5. targetDeepLink: целевой экран приложения:
   - при проблеме с курьерами/звонками -> '/lessons/1/call'
   - при собеседованиях/работе -> '/decks/it-interview'
   - при садике/детях -> '/decks/kindergarten'
   - при сленге/быте -> '/decks/slang-whatsapp'
   - при общем страхе говорить -> '/lessons/1/call'
6. suggestedReply: тёплый, эмпатичный, ненавязчивый ответ от лица доброжелательного участника чата (1-2 предложения) с органичной ссылкой на тренажер с промокодом ?promo=RADAR.

Верни СТРОГО JSON без markdown-кавычек:
{
  "isTargetLead": boolean,
  "painCategory": string,
  "confidence": number,
  "painSummary": string,
  "targetDeepLink": string,
  "suggestedReply": string
}`;

    if (groqKey) {
      try {
        const groqModel = groqModels('chat')[0] || 'qwen/qwen3.8-27b';
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: `Сообщение пользователя: "${rawText}"` },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.2,
          }),
          signal: AbortSignal.timeout(6000),
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            analysisResult = JSON.parse(content);
          }
        }
      } catch (e: any) {
        console.warn('[Radar Scan] Groq error, falling back to heuristic:', e.message);
      }
    }

    // Если LLM недоступна или дала сбой — эвристический fallback
    if (!analysisResult) {
      const isCourier = /курьер|вольт|wolt/i.test(rawText);
      const isInterview = /собес|интервью|работ/i.test(rawText);
      const isKinder = /садик|воспитател|школ/i.test(rawText);

      analysisResult = {
        isTargetLead: true,
        painCategory: isCourier ? 'courier_call' : isInterview ? 'interview' : isKinder ? 'kindergarten' : 'speaking_barrier',
        confidence: 8,
        painSummary: isCourier
          ? 'Сложности в общении с курьером по телефону'
          : isInterview
            ? 'Подготовка к собеседованию на иврите'
            : isKinder
              ? 'Общение в детском саду'
              : 'Языковой барьер в живой речи',
        targetDeepLink: isCourier ? '/lessons/1/call' : isInterview ? '/decks/it-interview' : isKinder ? '/decks/kindergarten' : '/lessons/1/call',
        suggestedReply: `Очень вас понимаю! В Ульпане Алеф есть классный интерактивный тренажер для этой ситуации: https://ulpana-alef.com${isCourier ? '/lessons/1/call' : '/decks/it-interview'}?promo=RADAR`,
      };
    }

    if (analysisResult.isTargetLead) {
      // Сохраняем в leads.json
      if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
      let leads = [];
      if (fs.existsSync(FILE_PATH)) {
        try { leads = JSON.parse(fs.readFileSync(FILE_PATH, 'utf-8')); } catch {}
      }

      const newLead = {
        id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
        sourceChannel: 'whatsapp',
        sourceChatName: sourceChat,
        authorName: author,
        authorContact: contact,
        rawText,
        aiAnalysis: analysisResult,
        status: 'new',
      };

      leads.unshift(newLead);
      fs.writeFileSync(FILE_PATH, JSON.stringify(leads, null, 2), 'utf-8');

      return NextResponse.json({ success: true, lead: newLead });
    }

    return NextResponse.json({ isTargetLead: false, analysis: analysisResult });
  } catch (error: any) {
    console.error('[API Admin Marketing Radar Scan POST] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
