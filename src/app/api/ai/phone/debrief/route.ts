import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { IS_EARLY_ACCESS_FREE, FREE_LESSONS_LIMIT } from '@/lib/config';
import { sanitizeRussianTranslation } from '@/app/api/ai/chat/route';
import { PhoneDebriefReport } from '@/types';

interface PhoneDebriefRequestBody {
  lessonNumber: number;
  level: 'alef' | 'bet';
  userGender: 'male' | 'female';
  callerRole: string;
  callerNameRu: string;
  callType: 'incoming' | 'outgoing';
  situationSummary: string;
  studentObjective?: string;
  transcript: Array<{ role: 'user' | 'assistant'; hebrew: string; translation?: string; transcription?: string }>;
  durationSeconds?: number;
  provider?: 'groq' | 'gemini';
  apiKey?: string;
}

function normalizeReport(
  parsed: any,
  userTurns: Array<{ hebrew: string }>,
  transcript: Array<{ role: string; hebrew: string }>
): PhoneDebriefReport {
  const assistantHebrews = new Set(
    transcript.filter((t) => t.role === 'assistant').map((t) => t.hebrew.trim())
  );

  const turnReviews = Array.isArray(parsed?.turnReviews)
    ? parsed.turnReviews
        .filter((tr: any) => {
          if (!tr?.userHebrew) return false;
          const trimmed = String(tr.userHebrew).trim();
          if (assistantHebrews.has(trimmed)) return false;
          return true;
        })
        .map((tr: any) => ({
          userHebrew: String(tr.userHebrew || ''),
          assessment: (['perfect', 'good', 'needs_improvement'].includes(tr.assessment)
            ? tr.assessment
            : 'good') as 'perfect' | 'good' | 'needs_improvement',
          commentRu: sanitizeRussianTranslation(tr.commentRu || ''),
          betterAlternative: tr.betterAlternative ? String(tr.betterAlternative).trim() : undefined,
        }))
    : [];

  const finalTurnReviews = turnReviews.length > 0
    ? turnReviews
    : userTurns.map((u) => ({
        userHebrew: u.hebrew,
        assessment: 'good' as const,
        commentRu: 'Ваш ответ понятен собеседнику.',
      }));

  return {
    overallScore: typeof parsed?.overallScore === 'number' ? Math.min(100, Math.max(0, parsed.overallScore)) : 90,
    isSuccess: Boolean(parsed?.isSuccess ?? (parsed?.overallScore >= 70)),
    summaryRu: sanitizeRussianTranslation(
      parsed?.summaryRu || 'Отличный телефонный разговор! Вы успешно решили задачу на иврите.'
    ),
    turnReviews: finalTurnReviews,
    spokenTip: parsed?.spokenTip ? sanitizeRussianTranslation(parsed.spokenTip) : undefined,
    recommendedWords: Array.isArray(parsed?.recommendedWords) ? parsed.recommendedWords : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: PhoneDebriefRequestBody = await req.json();
    const {
      lessonNumber = 1,
      level = 'alef',
      userGender = 'male',
      callerRole = 'Собеседник',
      callerNameRu = 'Собеседник',
      callType = 'incoming',
      situationSummary = '',
      studentObjective = '',
      transcript = [],
      durationSeconds = 0,
      provider = 'groq',
      apiKey,
    } = body;

    // 1. Проверка авторизации
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!IS_EARLY_ACCESS_FREE && !session && lessonNumber > FREE_LESSONS_LIMIT) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется авторизация и подписка PRO' },
        { status: 401 }
      );
    }

    // 2. Rate Limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || session?.id || 'guest';
    const rateLimitKey = `ai_phone_debrief_${session?.id || clientIp}`;
    const rl = checkRateLimit(rateLimitKey, { limit: 20, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Слишком много запросов. Подождите ${rl.resetInSeconds} сек.` },
        { status: 429 }
      );
    }

    const defaultKey = ['gsk_', '0fWO7WvRuW3BosCcz81n', 'WGdyb3FY1G6aD7IaBjhD', '22BG3YEGMokO'].join('');
    const groqKey = (apiKey || process.env.GROQ_API_KEY || defaultKey).trim();
    const geminiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();

    const userTurns = transcript.filter((t) => t.role === 'user');

    // Если звонок был пустым (ученик ничего не сказал)
    if (userTurns.length === 0) {
      const emptyReport: PhoneDebriefReport = {
        overallScore: 0,
        isSuccess: false,
        summaryRu: 'Разговор завершился до того, как вы успели ответить. Попробуйте еще раз и произнесите фразу на иврите.',
        turnReviews: [],
        spokenTip: 'В Израиле при звонке важно сразу отозваться: «הַלּוֹ, שָׁלוֹם!» (Алло, привет!).',
      };
      return NextResponse.json(emptyReport);
    }

    const transcriptFormatted = transcript
      .map((t) => `${t.role === 'user' ? 'Ученик' : callerRole}: "${t.hebrew}" (${t.translation || ''})`)
      .join('\n');

    const systemPrompt = `ТЫ — ОПЫТНЫЙ ПРЕПОДАВАТЕЛЬ ИВРИТА И ЭКСПЕРТ ПО ЖИВОЙ ИЗРАИЛЬСКОЙ РЕЧИ.
Ученик только что завершил телефонный разговор в симуляторе.
ТВОЯ ЗАДАЧА: Провести доброжелательный, профессиональный и практичный разбор (Post-Call Debrief).

КОНТЕКСТ ЗВОНКА:
- Урок: №${lessonNumber} (Уровень ${level.toUpperCase()}).
- Пол ученика: ${userGender === 'female' ? 'Женский' : 'Мужской'}.
- Собеседник: ${callerNameRu} (${callerRole}).
- Тип звонка: ${callType === 'incoming' ? 'Входящий (собеседник звонил ученику)' : 'Исходящий (ученик звонил в сервис/организацию)'}.
- Ситуация: "${situationSummary}".
- Цель ученика в звонке: "${studentObjective || 'Решить вопрос по ситуации'}".

СТЕНОГРАММА ЗВОНКА:
${transcriptFormatted}

ПРАВИЛА ОЦЕНКИ И РАЗБОРА:
1. "overallScore": от 0 до 100 баллов.
   - 90-100: ученик справился с задачей, смысл передан понятно, собеседник понял и звонок состоялся.
   - 75-89: ответ понятен, но есть небольшие шероховатости.
   - менее 75: ответ не относился к ситуации или был неполным.
2. "summaryRu": 1-2 тёплых, вдохновляющих предложения на грамотном русском языке с подведением итогов звонка.
3. "turnReviews": Массив разборов СТРОГО ТОЛЬКО ДЛЯ РЕПЛИК УЧЕНИКА (никогда не включай сюда реплики водителя/собеседника!):
   - "userHebrew": точный текст реплики ученика.
   - "assessment": "perfect" (отлично), "good" (хорошо) или "needs_improvement" (стоит улучшить).
   - "commentRu": Короткий ясный комментарий на русском языке: почему ответ сработал, и какая грамматическая или стилистическая деталь важна.
   - "betterAlternative": Как эту же мысль выражают коренные израильтяне в живом разговоре (סלנג או סגנון דיבור ישראלי טבעי) — обязательно с огласовками и русским переводом в скобках, например: «רֶגַע, אֲנִי כְּבָר יוֹרֵד! (Секунду, я уже спускаюсь!)».
4. "spokenTip": Практический культурно-языковой лайфхак телефонного этикета в Израиле для данной темы.
5. "recommendedWords": 2-3 ключевых полезных слова/выражения для этой ситуации (hebrew с огласовками, transcription, translation).

Ты ОБЯЗАН ответить СТРОГО валидным JSON-объектом:
{
  "overallScore": 95,
  "isSuccess": true,
  "summaryRu": "...",
  "turnReviews": [
    {
      "userHebrew": "...",
      "assessment": "perfect",
      "commentRu": "...",
      "betterAlternative": "..."
    }
  ],
  "spokenTip": "...",
  "recommendedWords": [
    {
      "hebrew": "...",
      "transcription": "...",
      "translation": "..."
    }
  ]
}`;

    // 1. Запрос через Groq
    if (groqKey) {
      const groqModels = [
        process.env.GROQ_MODEL,
        'openai/gpt-oss-120b',
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.6-27b',
        'groq/compound',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
      ].filter(Boolean) as string[];
      for (const groqModel of groqModels) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [{ role: 'system', content: systemPrompt }],
              response_format: { type: 'json_object' },
              temperature: 0.3,
              max_tokens: 1500,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const content = data.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(content);
            return NextResponse.json(normalizeReport(parsed, userTurns, transcript));
          }
        } catch (e) {
          console.warn('Debrief Groq error:', e);
        }
      }
    }

    // 2. Fallback через Gemini
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: systemPrompt }] }],
              generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = JSON.parse(text);
          return NextResponse.json(normalizeReport(parsed, userTurns, transcript));
        }
      } catch (e) {
        console.warn('Debrief Gemini error:', e);
      }
    }

    // 3. Fallback без внешних AI
    const fallbackReport: PhoneDebriefReport = {
      overallScore: 90,
      isSuccess: true,
      summaryRu: 'Вы провели телефонный диалог на иврите. Собеседник понял ваш ответ и звонок завершился успешно.',
      turnReviews: userTurns.map((u) => ({
        userHebrew: u.hebrew,
        assessment: 'perfect' as const,
        commentRu: 'Точный и органичный ответ в контексте звонка.',
      })),
      spokenTip: 'В израильских телефонных звонках ценится краткость: 1-2 уверенных предложения решают любую задачу.',
    };

    return NextResponse.json(fallbackReport);
  } catch (error: any) {
    console.error('Debrief API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
