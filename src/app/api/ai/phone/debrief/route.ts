import { groqModels as configuredGroqModels, geminiModel, resolveAiKeys } from '@/lib/aiModels';
import { readAiJson, fetchAi, aiErrorResponse, textOnlyEvaluation } from '@/lib/aiRequest';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { IS_EARLY_ACCESS_FREE, FREE_LESSONS_LIMIT, FREE_GUEST_LESSONS_LIMIT } from '@/lib/config';
import { sanitizeRussianTranslation } from '@/lib/russianTranslation';
import { PhoneDebriefReport, PhoneDebriefGrammarError, PhoneDebriefTurnReview } from '@/types';
import { detectHebrewGrammarErrors, detectHebrewWordOrderErrors } from '@/lib/hebrewFeedback';

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
  parsed: PhoneDebriefReport,
  userTurns: Array<{ hebrew: string }>,
): PhoneDebriefReport {
  const validScore = (score: unknown): score is number => typeof score === 'number' && Number.isFinite(score) && score >= 0 && score <= 100;
  if (!parsed || typeof parsed.isSuccess !== 'boolean' || !validScore(parsed.overallScore) || !validScore(parsed.grammarScore) ||
      typeof parsed.summaryRu !== 'string' || !parsed.summaryRu.trim() ||
      !Array.isArray(parsed.turnReviews) || (userTurns.length > 0 && parsed.turnReviews.length === 0)) throw new Error('Incomplete debrief');
  let totalDetectedErrors = 0;
  const key = (value: string) => (value || '').replace(/[\u0591-\u05C7.,!?;:"]/g, '').replace(/\s+/g, ' ').trim();
  const rawReviews = Array.isArray(parsed.turnReviews) ? parsed.turnReviews : [];

  const turnReviews: PhoneDebriefTurnReview[] = userTurns.map((turn, index) => {
    let review = rawReviews.find((r) => r && typeof r.userHebrew === 'string' && key(r.userHebrew) === key(turn.hebrew));
    if (!review && rawReviews[index]) {
      review = rawReviews[index];
    }
    if (!review || typeof review !== 'object') {
      review = { userHebrew: turn.hebrew, assessment: 'good', commentRu: 'Ответ понятен собеседнику.' };
    }
    const assessment = ['perfect', 'good', 'needs_improvement'].includes(review.assessment)
      ? review.assessment
      : 'good';
    const commentRu = typeof review.commentRu === 'string' && review.commentRu.trim()
      ? review.commentRu.trim()
      : 'Ответ понятен собеседнику.';

    const errors = [...detectHebrewGrammarErrors(turn.hebrew), ...detectHebrewWordOrderErrors(turn.hebrew)];
    const errorMap = new Map<string, PhoneDebriefGrammarError>();
    for (const error of errors) errorMap.set(error.wrongPhrase, error);
    if (Array.isArray(review.grammarErrors)) for (const error of review.grammarErrors) {
      if (error && typeof error.wrongPhrase === 'string' && typeof error.correctPhrase === 'string' && typeof error.explanationRu === 'string') {
        const expl = error.explanationRu.toLowerCase();
        // В голосовом звонке категорически игнорируем любые придирки к опечаткам или буквам:
        if (expl.includes('опечатк') || expl.includes('пишется через букв') || expl.includes('написани') || expl.includes('букву хэт') || expl.includes('букву ')) {
          continue;
        }
        errorMap.set(error.wrongPhrase, { type: typeof error.type === 'string' ? error.type : 'grammar', wrongPhrase: error.wrongPhrase, correctPhrase: error.correctPhrase, explanationRu: sanitizeRussianTranslation(error.explanationRu) });
      }
    }
    const grammarErrors = [...errorMap.values()];
    totalDetectedErrors += grammarErrors.length;
    return {
      userHebrew: turn.hebrew,
      assessment: grammarErrors.length && assessment === 'perfect' ? 'good' : assessment,
      commentRu: sanitizeRussianTranslation(commentRu),
      grammarErrors,
      betterAlternative: typeof review.betterAlternative === 'string' && review.betterAlternative.trim() ? review.betterAlternative.trim() : undefined,
    };
  });
  // Local checks can lower a supported grade, but cannot invent or inflate one.
  const grammarScore = Math.round(Math.min(parsed.grammarScore, Math.max(0, 100 - totalDetectedErrors * 12)));
  const overallScore = Math.round(totalDetectedErrors ? Math.min(parsed.overallScore, (parsed.overallScore * 2 + grammarScore) / 3) : parsed.overallScore);
  return {
    overallScore,
    grammarScore,
    isSuccess: parsed.isSuccess && overallScore >= 70,
    summaryRu: sanitizeRussianTranslation(parsed.summaryRu),
    turnReviews,
    spokenTip: typeof parsed.spokenTip === 'string' ? sanitizeRussianTranslation(parsed.spokenTip) : undefined,
    recommendedWords: Array.isArray(parsed.recommendedWords) ? parsed.recommendedWords.filter(w => w && typeof w.hebrew === 'string' && typeof w.translation === 'string' && typeof w.transcription === 'string').slice(0, 5) : undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await readAiJson<PhoneDebriefRequestBody>(req);
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

    // 1. Проверка авторизации: уроки с 3-го требуют бесплатной регистрации
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!session && lessonNumber > FREE_GUEST_LESSONS_LIMIT) {
      return NextResponse.json(
        textOnlyEvaluation({ error: 'Unauthorized: Требуется бесплатная регистрация для доступа к урокам с 3-го' }),
        { status: 401 }
      );
    }
    if (!IS_EARLY_ACCESS_FREE && (!session || session.subscriptionTier !== 'pro') && lessonNumber > FREE_LESSONS_LIMIT) {
      return NextResponse.json(
        textOnlyEvaluation({ error: 'Unauthorized: Требуется подписка PRO для уроков выше 30-го' }),
        { status: 403 }
      );
    }

    // 2. Rate Limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || session?.id || 'guest';
    const rateLimitKey = `ai_phone_debrief_${session?.id || clientIp}`;
    const rl = checkRateLimit(rateLimitKey, { limit: 20, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        textOnlyEvaluation({ error: `Слишком много запросов. Подождите ${rl.resetInSeconds} сек.` }),
        { status: 429 }
      );
    }
    const { groqKey, geminiKey, geminiKeys } = resolveAiKeys(provider, apiKey);

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
      return NextResponse.json(textOnlyEvaluation(emptyReport));
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
1. "overallScore": от 0 до 100 баллов (общий балл телефонного разговора и решения коммуникативной задачи).
2. ЭТО БЫЛ УСТНЫЙ ТЕЛЕФОННЫЙ РАЗГОВОР (ГОЛОС ЧЕРЕЗ МИКРОФОН):
   - Ученик говорил устно, а текст получен через автоматическое распознавание речи (ASR).
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО упрекать ученика за «опечатки», написание слов, пропущенные буквы или орфографию (ученик ничего не печатал руками!).
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО придираться к омофонам или схожим звукам (буквы ע/א/ה, כ/ק, ט/ת, ס/שׂ, например «עכל» вместо «הכל» — это погрешность распознавания микрофона, а не ошибка ученика).
   - Не оценивай произношение, звуки или ударения (так как доступен только распознанный текст).
3. "grammarScore": от 0 до 100 баллов. Оценивай ТОЛЬКО реальные грамматические ошибки:
   - Согласование рода (זכר/נקבה, например «זה משפחה» вместо «זאת משפחה», «דירה גדול» вместо «דירה גדולה»).
   - Порядок слов (прилагательное строго ПОСЛЕ существительного: «בית גדול», а не «גדול בית»).
   - Согласование множественного числа («אלה» вместо «זה»).
   - Если смысл передан понятно и грамматика согласована — ставь высокую оценку (90-100), даже если распознанный текст неидеален!
4. "summaryRu": 1-2 тёплых, вдохновляющих предложения на грамотном русском языке с подведением итогов звонка.
5. "turnReviews": Полный массив разборов для каждой реплики ученика в исходном порядке. Массив разборов СТРОГО ТОЛЬКО ДЛЯ РЕПЛИК УЧЕНИКА (никогда не включай сюда реплики водителя/собеседника!):
   - "userHebrew": точный текст реплики ученика.
   - "assessment": "perfect" (отлично), "good" (хорошо) или "needs_improvement" (стоит улучшить).
   - "commentRu": Короткий ясный комментарий на русском языке: почему ответ сработал, и какая деталь важна. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО упоминать опечатки, буквы или правописание в комментарии!
   - "grammarErrors": массив ТОЛЬКО реальных ошибок согласования родов или порядка слов (если замечены ошибки вроде «זה משפחה» вместо «זאת משפחה», или «גדול בית» вместо «בית גדול»):
     [{ "type": "gender_or_word_order", "wrongPhrase": "זה משפחה", "correctPhrase": "זאת משפחה", "explanationRu": "..." }].
     Если ошибок согласования рода или порядка слов нет — СТРОГО пустой массив []. Любые различия букв из-за распознавания речи (ASR) ошибками НЕ являются!
   - "betterAlternative": Как эту же мысль выражают коренные израильтяне в живом разговоре (סלנג או סגנון דיבור ישראלי טבעי) — обязательно с огласовками и русским переводом в скобках, например: «רֶגַע, אֲנִי כְּבָר יוֹרֵד! (Секунду, я уже спускаюсь!)».
6. "spokenTip": Практический культурно-языковой лайфхак телефонного этикета в Израиле для данной темы.
7. "recommendedWords": 2-3 ключевых полезных слова/выражения для этой ситуации (hebrew с огласовками, transcription, translation).

Ты ОБЯЗАН ответить СТРОГО валидным JSON-объектом:
{
  "overallScore": 95,

  "grammarScore": 96,
  "isSuccess": true,
  "summaryRu": "...",
  "turnReviews": [
    {
      "userHebrew": "...",
      "assessment": "perfect",
      "commentRu": "...",

      "grammarErrors": [],
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

    // 1. Запрос через Gemini (основной движок)
    const activeGeminiKeys = geminiKeys?.length ? geminiKeys : (geminiKey ? [geminiKey] : []);
    for (const currentGeminiKey of activeGeminiKeys) {
      try {
        const geminiRes = await fetchAi(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel('debrief')}:generateContent?key=${currentGeminiKey}`,
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
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          if (text.includes('```')) {
            text = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
          }
          const parsed = JSON.parse(text);
          if (typeof parsed.isSuccess !== 'boolean' || !Number.isFinite(parsed.overallScore) || typeof parsed.summaryRu !== 'string') throw new Error('Invalid debrief');
          return NextResponse.json(textOnlyEvaluation(normalizeReport(parsed, userTurns)));
        }
      } catch (e) {
        console.warn('Debrief Gemini error:', e);
      }
    }

    // 2. Страховочный запрос через Groq (fallback insurance)
    if (groqKey) {
      const groqModels = configuredGroqModels('debrief');
      for (const groqModel of groqModels) {
        try {
          const res = await fetchAi('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: 'Пожалуйста, проведи подробный педагогический разбор телефонного разговора ученика. Ответь строго валидным JSON-объектом.' },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3,
              max_tokens: 2000,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const content = data.choices?.[0]?.message?.content || '{}';
            const parsed = JSON.parse(content);
            if (typeof parsed.isSuccess !== 'boolean' || !Number.isFinite(parsed.overallScore) || typeof parsed.summaryRu !== 'string') throw new Error('Invalid debrief');
            return NextResponse.json(textOnlyEvaluation(normalizeReport(parsed, userTurns)));
          }
        } catch (e) {
          console.warn('Debrief Groq error:', e);
        }
      }
    }

    return aiErrorResponse(new Error('Debrief unavailable'));
  } catch (error: any) { return aiErrorResponse(error); }
}
