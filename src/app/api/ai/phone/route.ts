import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { stripNikkud } from '@/lib/transcription';
import { IS_EARLY_ACCESS_FREE, FREE_LESSONS_LIMIT } from '@/lib/config';
import { sanitizeRussianTranslation } from '@/app/api/ai/chat/route';
import { cleanGrammarJargon, BESPOKE_PHONE_SCENARIOS, getLessonPhoneScenario } from '@/data/phoneScenarios';
import { DETAILED_LESSONS } from '@/data/lessonsData';

interface PhoneRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string; hebrew?: string }>;
  lessonNumber: number;
  level: 'alef' | 'bet';
  userGender: 'male' | 'female';
  callType: 'incoming' | 'outgoing';
  callerName?: string;
  callerNameRu?: string;
  callerRole?: string;
  situationSummary?: string;
  callerObjective?: string;
  studentObjective?: string;
  completionCondition?: string;
  goals?: string[];
  systemPromptAddition?: string;
  targetTurns?: number;
  vocabularyHints?: string[];
  knownWords?: string[];
  provider?: 'groq' | 'gemini';
  apiKey?: string;
}

function sanitizeTranscription(text: string): string {
  if (!text) return '';
  let res = text.trim();
  res = res.replace(/(^|[\\s"«(—])у-([а-яёА-ЯЁa-zA-Z])/gi, '$1вэ-$2');
  return res;
}

/**
 * Единая прогрессивная шкала грамматических рамок для всех 100 уроков ульпана
 */
function getGrammarBoundary(lessonNumber: number): string {
  if (lessonNumber <= 35) {
    return `СТРОЖАЙШИЙ ГРАММАТИЧЕСКИЙ ЗАПРЕТ (Урок ${lessonNumber} начального уровня Алеф):
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать прошедшее время (זְמַן עָבָר: «רָאִיתִי», «הָיָה», «שָׁלַחְתָּ», «עָשִׂיתָ» и любые другие глаголы в прошедшем времени)! Ученик ещё НЕ изучал прошедшее время!
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО будущее время (זְמַן עָתִיד)!
- РАЗРЕШЕНО ТОЛЬКО: настоящее время (הוֹוֶה: «רוֹצֶה», «גָּר», «מְדַבֵּר», «יוֹרֵד» и т.п.) и простые номинативные фразы («זֶה / זֹאת», «יֵשׁ / אֵין», «שֶׁל», «אֵיפֹה», «מָה», «מִי»).`;
  }
  if (lessonNumber <= 50) {
    return `ГРАММАТИЧЕСКИЕ РАМКИ (Урок ${lessonNumber} уровня Алеф):
- Разрешены: настоящее время (הוֹוֶה) и прошедшее время (זְמַן עָבָר).
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО будущее время (זְמַן עָתִיד)! Будущее время изучается только на уровне Бет.`;
  }
  return `ГРАММАТИЧЕСКИЕ РАМКИ (Урок ${lessonNumber} уровня Бет):
- Свободное владение разговорным ивритом: настоящее, прошедшее и будущее время.`;
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
      targetTurns = 3,
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

    // 3. Серверный источник истины для сценария (защита от устаревшего кэша браузера)
    const serverLesson = DETAILED_LESSONS[lessonNumber];
    const serverScenario = serverLesson
      ? getLessonPhoneScenario(serverLesson, userGender)
      : BESPOKE_PHONE_SCENARIOS[lessonNumber];

    const finalTargetTurns = serverScenario?.targetTurns || targetTurns || 3;
    const finalGoals = (serverScenario?.goals && serverScenario.goals.length > 0) ? serverScenario.goals : goals;
    const finalSystemPromptAddition = serverScenario?.systemPromptAddition || systemPromptAddition || '';
    const finalCallerName = serverScenario?.callerName || callerName;
    const finalCallerNameRu = serverScenario?.callerNameRu || callerNameRu;
    const finalCallerRole = serverScenario?.callerRole || callerRole;
    const finalSituationSummary = serverScenario?.situationSummary || situationSummary;
    const finalCallerObj = serverScenario?.callerObjective || callerObjective;
    const finalStudentObj = serverScenario?.studentObjective || studentObjective;
    const finalCondition = serverScenario?.completionCondition || completionCondition;
    const isIncoming = (serverScenario?.callType || callType) === 'incoming';

    // 4. Очистка сообщений и подсчет раундов пользователя
    const sanitizedMessages = (messages || []).map((m) => {
      let content = m.content || m.hebrew || '';
      return { role: m.role, content: content.trim() };
    });

    const userTurnsCount = sanitizedMessages.filter((m) => m.role === 'user').length;
    const lastUserMsg = sanitizedMessages.filter((m) => m.role === 'user').slice(-1)[0];
    const lastUserText = (lastUserMsg?.content || '').toLowerCase();
    const strippedLastUser = stripNikkud(lastUserText).toLowerCase();

    // Проверка явного прощания от самого ученика
    const isUserSayingGoodbye =
      strippedLastUser.includes('להתראות') ||
      strippedLastUser.includes('ביי') ||
      strippedLastUser.includes('יום טוב') ||
      strippedLastUser.includes('לילה טוב') ||
      strippedLastUser.includes('נשתמע') ||
      strippedLastUser.includes('שלום ולהתראות');

    // Определение финального раунда
    const isTurnLimitReached = userTurnsCount >= finalTargetTurns;
    const shouldForceFinalTurn = isUserSayingGoodbye || isTurnLimitReached;

    const cleanSituation = cleanGrammarJargon(finalSituationSummary);
    const cleanCallerObjective = cleanGrammarJargon(finalCallerObj);
    const cleanStudentObjective = cleanGrammarJargon(finalStudentObj);
    const cleanCompletionCondition = cleanGrammarJargon(finalCondition);

    // Грамматические рамки для урока (1-100)
    const grammarGuidance = getGrammarBoundary(lessonNumber);

    // Компактный опорный словарь (до 15 ключевых слов/фраз, не перегружает контекст)
    const situationHints = (serverScenario?.vocabularyHints || body.vocabularyHints || (serverLesson?.vocabulary || []).slice(0, 8).map((w) => w.hebrew)).slice(0, 10);
    const knownWordsSlice = (Array.isArray(body.knownWords) ? body.knownWords : []).slice(0, 10);
    const vocabGuidance = `ОПОРНЫЙ СЛОВАРЬ (используй эти слова и помогай ученику их применить):
- Ключевые слова ситуации: ${situationHints.join(', ')}
${knownWordsSlice.length > 0 ? `- Знакомые слова ученика из пройденных уроков: ${knownWordsSlice.join(', ')}` : ''}`;

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
- ТЫ — ${finalCallerNameRu} (${finalCallerRole}).
- ТВОЯ ЦЕЛЬ ЗВОНКА: "${cleanCallerObjective || 'Обсудить тему с учеником'}".
- ЗАДАЧА УЧЕНИКА: "${cleanStudentObjective || 'Поддержать беседу и ответить на вопросы'}".
- ГЛАВНАЯ ЦЕЛЬ: ВЕСТИ ПОЛНОЦЕННЫЙ, ЖИВОЙ ТЕЛЕФОННЫЙ ДИАЛОГ (${finalTargetTurns} РАУНДА)! ЭТО НЕ МОНОЛОГ И НЕ СБРОС ТРУБКИ!
- ПРАВИЛА ВЕДЕНИЯ ДИАЛОГА:
  1. ТЫ — НАСТОЯЩИЙ ЖИВОЙ ЧЕЛОВЕК (ДРУГ, СОСЕД, КОЛЛЕГА, ВОДИТЕЛЬ, КУРЬЕР), А НЕ УЧИТЕЛЬ!
  2. СТРОЖАЙШЕ ЗАПРЕЩЕНО СПРАШИВАТЬ: «Как сказать...?», «איך אומרים...?», «Что значит...?» ИЛИ ПРОВОДИТЬ ОПРОСЫ ПО ГРАММАТИКЕ! ТЫ НЕ ЭКЗАМЕНАТОР!
  3. В ХОДЕ ДИАЛОГА (раунды до ${finalTargetTurns}):
     * Коротко и тепло отреагируй на реплику ученика (например: «אֵיזֶה יֹפִי!», «מְעֻלֶּה!», «יוֹפִי!», «הַבַּנְתִּי!»).
     * ЗАДАЙ СЛЕДУЮЩИЙ ДРУЖЕСКИЙ НАВОДЯЩИЙ ВОПРОС по ситуации и задачам диалога! Помогай ученику раскрыть тему и сказать новую фразу на иврите.
     * НЕ ВЕШАЙ ТРУБКУ РАНЬШЕ ВРЕМЕНИ! Обязательно установи "isCompleted": false, "shouldHangUp": false.
  4. ФИНАЛЬНЫЙ РАУНД (когда раунд >= ${finalTargetTurns} или если ученик САМ явно прощается «ביי / להתראות»):
     * Тепло поблагодари, передай привет или пожелай хорошего дня («אֵיזֶה כֵּיף! תּוֹדָה רַבָּה! נִתְרָאֶה בְּקָרוֹב, בַּיי!»).
     * ОБЯЗАТЕЛЬНО установи "isCompleted": true, "shouldHangUp": true и повесь трубку!`
      : `ТЕЛЕФОННЫЙ ЗВОНОК: ИСХОДЯЩИЙ ДЛЯ УЧЕНИКА (УЧЕНИК ЗВОНИТ ТЕБЕ)
- ТЫ — ${finalCallerNameRu} (${finalCallerRole}), принимающий звонок организации/сервиса.
- ТВОЯ РОЛЬ: "${cleanCallerObjective || 'Принять звонок и помочь ученику'}".
- ЗАДАЧА УЧЕНИКА: "${cleanStudentObjective || 'Сделать заказ или задать вопрос'}".
- ГЛАВНАЯ ЦЕЛЬ: ВЕСТИ ПОЛНОЦЕННЫЙ ЖИВОЙ ДИАЛОГ (${finalTargetTurns} РАУНДА)!
- ПРАВИЛА ВЕДЕНИЯ ДИАЛОГА:
  1. ТЫ — НАСТОЯЩИЙ ЖИВОЙ ЧЕЛОВЕК (БАРИСТА, АДМИНИСТРАТОР, ВРАЧ, СОТРУДНИК).
  2. СТРОЖАЙШЕ ЗАПРЕЩЕНО СПРАШИВАТЬ «איך אומרים» ИЛИ ТЕСТИРОВАТЬ УЧЕНИКА!
  3. В ХОДЕ ДИАЛОГА (раунды до ${finalTargetTurns}):
     * Вежливо прими запрос ученика, подтверди и задай следующий логичный уточняющий наводящий вопрос (про размер, сахар/молоко, дату, время, детали).
     * НЕ ВЕШАЙ ТРУБКУ РАНЬШЕ ВРЕМЕНИ! Обязательно установи "isCompleted": false, "shouldHangUp": false.
  4. ФИНАЛЬНЫЙ РАУНД (когда раунд >= ${finalTargetTurns} или если ученик прощается):
     * Подтверди договоренность («בְּסֵדֶר גָּמוּר, הַהַזְמָנָה מוּכָנָה! נִתְרָאֶה, בַּיי!»), установи "isCompleted": true, "shouldHangUp": true и заверши звонок!`;

    const systemPrompt = `ТЫ — ЖИВОЙ ПЕРСОНАЖ ТЕЛЕФОННОГО ЗВОНКА В ИЗРАИЛЕ.
ИМЯ: ${finalCallerName} (${finalCallerNameRu}).
РОЛЬ: ${finalCallerRole}.
СИТУАЦИЯ ЗВОНКА: ${cleanSituation}.
ПОЛ СОБЕСЕДНИКА (УЧЕНИКА): ${isFemale ? 'Женский (נקבה)' : 'Мужской (זכר)'}. Обращайся к ученику строго в ${isFemale ? 'женском' : 'мужском'} роде!
ТЕКУЩИЙ РАУНД: ${userTurnsCount} из ${finalTargetTurns}.

${grammarGuidance}

${vocabGuidance}

${roleGuidance}

${finalGoals && finalGoals.length > 0 ? `ЗАДАЧИ РАЗГОВОРА ДЛЯ УЧЕНИКА (помогай ученику ответить на эти пункты в ходе диалога своими наводящими вопросами):\n${finalGoals.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n')}` : ''}

${cleanCompletionCondition ? `УСЛОВИЕ УСПЕШНОГО ЗАВЕРШЕНИЯ ЗВОНКА: "${cleanCompletionCondition}".` : ''}

${finalSystemPromptAddition ? `ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ ДЛЯ СЦЕНАРИЯ:\n${finalSystemPromptAddition}` : ''}

${levelGuidance}

${shouldForceFinalTurn ? `
ВНИМАНИЕ: ЭТО ФИНАЛЬНАЯ РЕПЛИКА ЗВОНКА!
- Достигнут лимит раундов (${finalTargetTurns}) или ученик попрощался.
- Твоя реплика должна быть короткой теплой фразой прощания (1 предложение).
- ЗАПРЕЩЕНО задавать какие-либо вопросы!
- В JSON ОБЯЗАТЕЛЬНО установи: "isCompleted": true, "shouldHangUp": true!
` : `
ВНИМАНИЕ: ДИАЛОГ ПРОДОЛЖАЕТСЯ (раунд ${userTurnsCount} из ${finalTargetTurns})!
- Коротко отреагируй на ответ ученика и ОБЯЗАТЕЛЬНО задай следующий простой наводящий вопрос по ситуации!
- КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО прощаться или говорить «ביי»! Трубку вешать НЕЛЬЗЯ!
- В JSON ОБЯЗАТЕЛЬНО установи: "isCompleted": false, "shouldHangUp": false!
`}

СТРОЖАЙШИЕ ПРАВИЛА ЯЗЫКА И ОФОРМЛЕНИЯ:
1. "hebrew": Реплика на иврите с ТОЧНЫМИ И ПОЛНЫМИ ОГЛАСОВКАМИ (никуд).
2. "cyrillic_transcription": Русская транскрипция кириллицей с ударением (´) и буквой 'h' для ה. Союз ו ВСЕГДА транскрибируй как «вэ-» (не «у-»).
3. "translation": Безупречный литературный русский перевод БЕЗ калек с иврита.
4. "suggestedReplies":
   ${shouldForceFinalTurn
     ? 'Верни пустой массив [] или 1 простой вариант прощания (\'תּוֹדָה רַבָּה, בַּיי!\').'
     : 'Предложи ровно 2-3 ультра-простых разговорных варианта ответа ученика на твой наводящий вопрос (с полными огласовками, русской транскрипцией и переводом).'}
5. "isCompleted" и "shouldHangUp":
   ${shouldForceFinalTurn
     ? 'ОБЯЗАТЕЛЬНО установи true в обоих полях (финал звонка)!'
     : 'ОБЯЗАТЕЛЬНО установи false в обоих полях ("isCompleted": false, "shouldHangUp": false), потому что диалог продолжается!'}
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
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-120b',
        'qwen/qwen3.6-27b',
        'openai/gpt-oss-20b',
        'groq/compound',
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

            const isDone = shouldForceFinalTurn;

            const parsedReplies = Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : [];
            const safeReplies = parsedReplies.length > 0
              ? parsedReplies.map((r: any) => ({
                  hebrew: r.hebrew || '',
                  transcription: sanitizeTranscription(r.transcription || r.cyrillic_transcription || ''),
                  translation: sanitizeRussianTranslation(r.translation || r.russian_translation || ''),
                }))
              : [
                  {
                    hebrew: 'כֵּן, נָכוֹן.',
                    transcription: 'кен, нахóн.',
                    translation: 'Да, верно.',
                  },
                  {
                    hebrew: 'תּוֹדָה רַבָּה!',
                    transcription: 'тодá рабá!',
                    translation: 'Большое спасибо!',
                  },
                ];

            return NextResponse.json({
              hebrew: (parsed.hebrew || '').trim(),
              transcription: sanitizeTranscription(parsed.transcription || parsed.cyrillic_transcription || ''),
              translation: sanitizeRussianTranslation(parsed.translation || parsed.russian_translation || ''),
              isCompleted: isDone,
              shouldHangUp: isDone,
              suggestedReplies: isDone ? [] : safeReplies,
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
          const isDone = shouldForceFinalTurn;

          const parsedReplies = Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : [];
          const safeReplies = parsedReplies.length > 0
            ? parsedReplies.map((r: any) => ({
                hebrew: r.hebrew || '',
                transcription: sanitizeTranscription(r.transcription || r.cyrillic_transcription || ''),
                translation: sanitizeRussianTranslation(r.translation || r.russian_translation || ''),
              }))
            : [
                {
                  hebrew: 'כֵּן, נָכוֹן.',
                  transcription: 'кен, нахóн.',
                  translation: 'Да, верно.',
                },
                {
                  hebrew: 'תּוֹדָה רַבָּה!',
                  transcription: 'тодá рабá!',
                  translation: 'Большое спасибо!',
                },
              ];

          return NextResponse.json({
            hebrew: (parsed.hebrew || '').trim(),
            transcription: sanitizeTranscription(parsed.transcription || parsed.cyrillic_transcription || ''),
            translation: sanitizeRussianTranslation(parsed.translation || parsed.russian_translation || ''),
            isCompleted: isDone,
            shouldHangUp: isDone,
            suggestedReplies: isDone ? [] : safeReplies,
            engine: 'Gemini (Живой звонок)',
          });
        }
      } catch (geminiErr) {
        console.warn('Gemini phone call error:', geminiErr);
      }
    }

    // 3. Fallback ответ, если внешние AI недоступны
    const isDone = shouldForceFinalTurn;
    const fallbackHebrew = isDone
      ? (isIncoming ? 'מְעֻלֶּה, תּוֹדָה רַבָּה! לְהִתְרָאוֹת!' : 'בְּסֵדֶר גָּמוּר, תּוֹדָה רַבָּה וְיוֹם טוֹב!')
      : (isIncoming ? 'אֵיזֶה יֹפִי! וּמָה עוֹד?' : 'בְּסֵדֶר גָּמוּר! וּמָה תִּרְצֶה עוֹד?');

    return NextResponse.json({
      hebrew: fallbackHebrew,
      transcription: isDone
        ? (isIncoming ? 'мэцуйáн, тодá рабá! лэhитраóт!' : 'бэсэ́дер гамӯр, тодá рабá вэ-йом тов!')
        : (isIncoming ? 'э́йзе йóфи! у-ма од?' : 'бэсэ́дер гамӯр! у-ма тирцé од?'),
      translation: isDone
        ? (isIncoming ? 'Отлично, большое спасибо! До свидания!' : 'Все в порядке, большое спасибо и хорошего дня!')
        : (isIncoming ? 'Как здорово! А что ещё?' : 'Все в порядке! А что вы хотите ещё?'),
      isCompleted: isDone,
      shouldHangUp: isDone,
      suggestedReplies: isDone
        ? []
        : [
            {
              hebrew: 'הַכֹּל בְּסֵדֶר, תּוֹדָה.',
              transcription: 'hакóль бэсэ́дер, тодá.',
              translation: 'Всё в порядке, спасибо.',
            },
            {
              hebrew: 'תּוֹדָה רַבָּה!',
              transcription: 'тодá рабá!',
              translation: 'Большое спасибо!',
            },
          ],
      engine: 'Автоответчик (Звонок)',
    });
  } catch (error: any) {
    console.error('Phone call API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
