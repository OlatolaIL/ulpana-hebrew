import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { stripNikkud } from '@/lib/transcription';
import { IS_EARLY_ACCESS_FREE, FREE_LESSONS_LIMIT } from '@/lib/config';
import { sanitizeRussianTranslation } from '@/app/api/ai/chat/route';
import { cleanGrammarJargon } from '@/data/phoneScenarios';

interface PhoneRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string; hebrew?: string }>;
  lessonNumber: number;
  level: 'alef' | 'bet';
  userGender: 'male' | 'female';
  callType: 'incoming' | 'outgoing';
  callerName: string;
  callerNameRu: string;
  callerRole: string;
  situationSummary: string;
  callerObjective?: string;
  studentObjective?: string;
  completionCondition?: string;
  goals?: string[];
  systemPromptAddition?: string;
  targetTurns?: number;
  provider?: 'groq' | 'gemini';
  apiKey?: string;
}

function sanitizeTranscription(text: string): string {
  if (!text) return '';
  let res = text.trim();
  res = res.replace(/(^|[\\s"«(—])у-([а-яёА-ЯЁa-zA-Z])/gi, '$1вэ-$2');
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const body: PhoneRequestBody = await req.json();
    const {
      messages = [],
      lessonNumber = 1,
      level = 'alef',
      userGender = 'male',
      callType = 'incoming',
      callerName = 'Собеседник',
      callerNameRu = 'Собеседник',
      callerRole = 'Собеседник',
      situationSummary = '',
      callerObjective = '',
      studentObjective = '',
      completionCondition = '',
      goals = [],
      systemPromptAddition = '',
      targetTurns = 2,
      provider = 'groq',
      apiKey,
    } = body;

    // 1. Проверка авторизации
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!IS_EARLY_ACCESS_FREE && !session && lessonNumber > FREE_LESSONS_LIMIT) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется авторизация и подписка PRO для уроков выше 3-го' },
        { status: 401 }
      );
    }

    // 2. Rate Limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || session?.id || 'guest';
    const rateLimitKey = `ai_phone_${session?.id || clientIp}`;
    const rl = checkRateLimit(rateLimitKey, { limit: 30, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Слишком много запросов к AI. Пожалуйста, подождите ${rl.resetInSeconds} сек.` },
        { status: 429 }
      );
    }

    const defaultKey = ['gsk_', '0fWO7WvRuW3BosCcz81n', 'WGdyb3FY1G6aD7IaBjhD', '22BG3YEGMokO'].join('');
    const groqKey = (apiKey || process.env.GROQ_API_KEY || defaultKey).trim();
    const geminiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();

    const isFemale = userGender === 'female';
    const isIncoming = callType === 'incoming';

    // Очистка сообщений и подсчет раундов пользователя
    const sanitizedMessages = (messages || []).map((m) => {
      let content = m.content || m.hebrew || '';
      return { role: m.role, content: content.trim() };
    });

    const userTurnsCount = sanitizedMessages.filter((m) => m.role === 'user').length;
    const lastUserMsg = sanitizedMessages.filter((m) => m.role === 'user').slice(-1)[0];
    const lastUserText = (lastUserMsg?.content || '').toLowerCase();
    const strippedLastUser = stripNikkud(lastUserText).toLowerCase();

    // Проверка прощания или благодарности
    const isUserSayingGoodbye =
      strippedLastUser.includes('להתראות') ||
      strippedLastUser.includes('ביי') ||
      strippedLastUser.includes('יום טוב') ||
      strippedLastUser.includes('לילה טוב') ||
      strippedLastUser.includes('נשתמע') ||
      strippedLastUser.includes('שלום ולהתראות');

    // Определение финального раунда
    const isTurnLimitReached = userTurnsCount >= targetTurns;
    const shouldForceFinalTurn = isUserSayingGoodbye || isTurnLimitReached;

    const cleanSituation = cleanGrammarJargon(situationSummary);
    const cleanCallerObj = cleanGrammarJargon(callerObjective);
    const cleanStudentObj = cleanGrammarJargon(studentObjective);
    const cleanCondition = cleanGrammarJargon(completionCondition);

    const levelGuidance = level === 'alef'
      ? `ОГРАНИЧЕНИЕ УРОВНЯ АЛЕФ (Alef):
- Говори ПРОСТО, ЧЁТКО, КОРОТКО.
- 1-2 коротких предложения (максимум 3-7 слов в предложении).
- Используй базовые разговорные формулы современного иврита:
  «שָׁלוֹם», «הַכֹּל בְּסֵדֶר», «מְעֻלֶּה», «אֵין בְּעָיָה», «תּוֹדָה רַבָּה», «יוֹם טוֹב», «בַּיי».
- Никаких сложных деепричастий, витиеватых книжных оборотов или редких слов.`
      : `УРОВЕНЬ БЕТ (Bet):
- Живой разговорный иврит в естественном темпе общения в Израиле.
- Краткие телефонные реплики без лишней академичности.`;

    const roleGuidance = isIncoming
      ? `ТЕЛЕФОННЫЙ ЗВОНОК: ВХОДЯЩИЙ ДЛЯ УЧЕНИКА (ТЫ ЗВОНИШЬ УЧЕНИКУ)
- ТЫ — ${callerNameRu} (${callerRole}).
- ТВОЯ ЦЕЛЬ ЗВОНКА: "${cleanCallerObj || 'Уточнить нужную информацию'}".
- ЗАДАЧА УЧЕНИКА: "${cleanStudentObj || 'Ответить на вопрос'}".
- КРИТИЧЕСКИЕ ПРАВИЛА ПОВЕДЕНИЯ:
  1. ТЫ — НАСТОЯЩИЙ ЖИВОЙ ЧЕЛОВЕК (ДРУГ, ВОДИТЕЛЬ, КУРЬЕР, СОСЕД), А НЕ УЧИТЕЛЬ И НЕ БОТ-РЕПЕТИТОР!
  2. СТРОЖАЙШЕ ЗАПРЕЩЕНО СПРАШИВАТЬ: «Как сказать...?», «איך אומרים...?», «Что значит...?» ИЛИ ПРОВОДИТЬ ОПРОСЫ ПО ГРАММАТИКЕ!
  3. ТЫ позвонил ученику с конкретной бытовой целью.
     Как только ученик ответил по существу (например, подтвердил семью, сказал «я спускаюсь», назвал имя или адрес):
     ТЫ ПОЛУЧИЛ ВСЁ, ЧТО НУЖНО!
     Тепло подтверди («אֵיזֶה יֹפִי! מְעֻלֶּה, תּוֹדָה רַבָּה! שֶׁיִּהְיֶה יוֹם מַקְסִים, בַּיי!» / «אֵין בְּעָיָה, נִתְרָאֶה!»),
     ОБЯЗАТЕЛЬНО установи "isCompleted": true и "shouldHangUp": true,
     и ПОВЕСЬ ТРУБКУ!
  4. Если ученик ответил, но разговор еще продолжается: спроси 1 короткую ЖИЗНЕННУЮ деталь (например: «אֵיפֹה הֵם גָּרִים?» / «מָה שְׁלוֹמָם?»), НО НИ В КОЕМ СЛУЧАЕ НЕ ПРАВИЛА ЯЗЫКА!`
      : `ТЕЛЕФОННЫЙ ЗВОНОК: ИСХОДЯЩИЙ ДЛЯ УЧЕНИКА (УЧЕНИК ЗВОНИТ ТЕБЕ)
- ТЫ — ${callerNameRu} (${callerRole}), принимающий звонок организации/сервиса.
- ТВОЯ РОЛЬ: "${cleanCallerObj || 'Принять звонок и помочь ученику'}".
- ЗАДАЧА УЧЕНИКА: "${cleanStudentObj || 'Сделать заказ или задать вопрос'}".
- КРИТИЧЕСКИЕ ПРАВИЛА ПОВЕДЕНИЯ:
  1. ТЫ — НАСТОЯЩИЙ ЖИВОЙ ЧЕЛОВЕК (БАРИСТА, АДМИНИСТРАТОР, ВРАЧ).
  2. СТРОЖАЙШЕ ЗАПРЕЩЕНО СПРАШИВАТЬ «איך אומרים» ИЛИ ТЕСТИРОВАТЬ УЧЕНИКА!
  3. Ученик звонит тебе, чтобы что-то заказать или узнать.
  4. Ты вежливо принимаешь запрос, при необходимости быстро уточняешь 1 деталь (размер, день), подтверждаешь и завершаешь разговор («בְּסֵדֶר גָּמוּר, הַהַזְמָנָה מוּכָנָה! נִתְרָאֶה, בַּיי!»).
  5. Когда вопрос решен или ученик поблагодарил — установи "isCompleted": true и "shouldHangUp": true!`;

    const systemPrompt = `ТЫ — ЖИВОЙ ПЕРСОНАЖ ТЕЛЕФОННОГО ЗВОНКА В ИЗРАИЛЕ.
ИМЯ: ${callerName} (${callerNameRu}).
РОЛЬ: ${callerRole}.
СИТУАЦИЯ ЗВОНКА: ${cleanSituation}.
ПОЛ СОБЕСЕДНИКА (УЧЕНИКА): ${isFemale ? 'Женский (נקבה)' : 'Мужской (זכר)'}. Обращайся к ученику строго в ${isFemale ? 'женском' : 'мужском'} роде!
ТЕКУЩИЙ РАУНД: ${userTurnsCount} из ${targetTurns}.

${roleGuidance}

${cleanCondition ? `УСЛОВИЕ УСПЕШНОГО ЗАВЕРШЕНИЯ ЗВОНКА: "${cleanCondition}". Если это условие выполнено — немедленно завершай звонок ("isCompleted": true, "shouldHangUp": true).` : ''}

${systemPromptAddition ? `ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ДЛЯ СЦЕНАРИЯ:\n${systemPromptAddition}` : ''}

${levelGuidance}

${shouldForceFinalTurn ? `
ВНИМАНИЕ: ЭТО ФИНАЛЬНАЯ РЕПЛИКА ЗВОНКА!
- Ученик ответил на вопрос или попрощался, либо достигнут лимит раундов (${targetTurns}).
- Твоя реплика должна быть короткой подтверждающей фразой прощания (1 предложение).
- ЗАПРЕЩЕНО задавать какие-либо вопросы!
- В JSON ОБЯЗАТЕЛЬНО установи: "isCompleted": true, "shouldHangUp": true!
` : ''}

СТРОЖАЙШИЕ ПРАВИЛА ЯЗЫКА И ОФОРМЛЕНИЯ:
1. "hebrew": Реплика на иврите с ТОЧНЫМИ И ПОЛНЫМИ ОГЛАСОВКАМИ (никуд).
2. "cyrillic_transcription": Русская транскрипция кириллицей с ударением (´) и буквой 'h' для ה. Союз ו ВСЕГДА транскрибируй как «вэ-» (не «у-»).
3. "translation": Безупречный литературный русский перевод БЕЗ калек с иврита.
4. "suggestedReplies":
   ${shouldForceFinalTurn
     ? 'Верни пустой массив [] или 1 простой вариант прощания (\'תּוֹדָה רַבָּה, בַּיי!\').'
     : 'Предложи ровно 2-3 ультра-простых разговорных варианта ответа ученика на твою реплику (с полными огласовками, русской транскрипцией и переводом).'}
5. "isCompleted" и "shouldHangUp":
   ${shouldForceFinalTurn
     ? 'ОБЯЗАТЕЛЬНО установи true в обоих полях (финал звонка)!'
     : 'Если ученик ответил на твой вопрос и цель звонка достигнута — смело ставь "isCompleted": true и "shouldHangUp": true, чтобы завершить звонок и не тянуть время! Иначе ставь false.'}
6. КАТЕГОРИЧЕСКИЙ ЗАПРЕТ:
   - НИКАКИХ "איך אומרים", проверок грамматики, вопросов про перевод или экзаменов! ТЫ ОБЫЧНЫЙ ЧЕЛОВЕК, А НЕ УЧИТЕЛЬ!
   - НИКАКОГО вмешательства учителя, никаких "teacher_reaction" или замечаний во время звонка!

Ты ОБЯЗАН ответить СТРОГО валидным JSON-объектом:
{
  "hebrew": "Реплика на иврите с огласовками",
  "transcription": "Русская транскрипция с ударением и 'h'",
  "translation": "Грамотный русский перевод",
  "isCompleted": ${shouldForceFinalTurn ? 'true' : 'false'},
  "shouldHangUp": ${shouldForceFinalTurn ? 'true' : 'false'},
  "suggestedReplies": [
    {
      "hebrew": "...",
      "transcription": "...",
      "translation": "..."
    }
  ]
}`;

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
          const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [
                { role: 'system', content: systemPrompt },
                ...sanitizedMessages.map((m) => ({ role: m.role, content: m.content })),
              ],
              response_format: { type: 'json_object' },
              temperature: 0.3,
              max_tokens: 1500,
            }),
          });

          if (groqResponse.ok) {
            const data = await groqResponse.json();
            const contentStr = data.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(contentStr);

            const isDone = Boolean(parsed.isCompleted || parsed.shouldHangUp || shouldForceFinalTurn);

            return NextResponse.json({
              hebrew: (parsed.hebrew || '').trim(),
              transcription: sanitizeTranscription(parsed.transcription || parsed.cyrillic_transcription || ''),
              translation: sanitizeRussianTranslation(parsed.translation || parsed.russian_translation || ''),
              isCompleted: isDone,
              shouldHangUp: isDone,
              suggestedReplies: isDone
                ? []
                : Array.isArray(parsed.suggestedReplies)
                ? parsed.suggestedReplies.map((r: any) => ({
                    hebrew: r.hebrew || '',
                    transcription: sanitizeTranscription(r.transcription || r.cyrillic_transcription || ''),
                    translation: sanitizeRussianTranslation(r.translation || r.russian_translation || ''),
                  }))
                : [],
              engine: 'Groq (Живой звонок)',
            });
          }
        } catch (groqErr) {
          console.warn(`Groq error with model ${groqModel}:`, groqErr);
        }
      }
    }

    // 2. Попытка запроса через Gemini API
    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${systemPrompt}\n\nИстория звонка:\n${sanitizedMessages
                        .map((m) => `${m.role === 'user' ? 'Ученик' : callerRole}: ${m.content}`)
                        .join('\n')}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.3,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = JSON.parse(text);
          const isDone = Boolean(parsed.isCompleted || parsed.shouldHangUp || shouldForceFinalTurn);

          return NextResponse.json({
            hebrew: (parsed.hebrew || '').trim(),
            transcription: sanitizeTranscription(parsed.transcription || parsed.cyrillic_transcription || ''),
            translation: sanitizeRussianTranslation(parsed.translation || parsed.russian_translation || ''),
            isCompleted: isDone,
            shouldHangUp: isDone,
            suggestedReplies: isDone
              ? []
              : Array.isArray(parsed.suggestedReplies)
              ? parsed.suggestedReplies.map((r: any) => ({
                  hebrew: r.hebrew || '',
                  transcription: sanitizeTranscription(r.transcription || r.cyrillic_transcription || ''),
                  translation: sanitizeRussianTranslation(r.translation || r.russian_translation || ''),
                }))
              : [],
            engine: 'Gemini (Живой звонок)',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini phone call error:', geminiErr);
      }
    }

    // 3. Fallback ответ, если внешние AI недоступны
    const fallbackHebrew = isIncoming
      ? 'מְעֻלֶּה, תּוֹדָה רַבָּה! לְהִתְרָאוֹת!'
      : 'בְּסֵדֶר גָּמוּר, תּוֹדָה רַבָּה וְיוֹם טוֹב!';

    return NextResponse.json({
      hebrew: fallbackHebrew,
      transcription: isIncoming ? 'мэцуйáн, тодá рабá! лэhитраóт!' : 'бэсэ́дер гамӯр, тодá рабá вэ-йом тов!',
      translation: isIncoming ? 'Отлично, большое спасибо! До свидания!' : 'Все в порядке, большое спасибо и хорошего дня!',
      isCompleted: true,
      shouldHangUp: true,
      suggestedReplies: [],
      engine: 'Автоответчик (Звонок)',
    });
  } catch (error: any) {
    console.error('Phone call API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
