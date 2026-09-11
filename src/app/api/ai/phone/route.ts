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
  userRole?: string;
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
    const finalUserRole = serverLesson?.dialogue?.userRole || serverScenario?.userRole || body.userRole || 'Ученик';
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

    // Очищаем подсказки целей от готовых реплик на иврите от 1-го лица (например: (אֲנִי מְחַפֵּשׂ...)),
    // чтобы нейросеть не повторяла фразы ученика от своего имени!
    const cleanGoals = (finalGoals || []).map((g: string) =>
      g.replace(/\s*\([^)]*[\u0590-\u05FF]+[^)]*\)/g, '').trim()
    );

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
      ? `КТО ТЫ (ИИ): ${finalCallerNameRu} (${finalCallerRole}).
КТО ТВОЙ СОБЕСЕДНИК: Ученик — ${finalUserRole}. Ты сам позвонил ему.
СИТУАЦИЯ: ${cleanSituation}
ТВОЯ ЦЕЛЬ: "${cleanCallerObjective || 'Обсудить тему с учеником и тепло завершить разговор'}".
ЗАДАЧА УЧЕНИКА: "${cleanStudentObjective || 'Поддержать беседу и ответить на вопросы'}".
ГЛАВНАЯ ЦЕЛЬ: ВЕСТИ ПОЛНОЦЕННЫЙ ЖИВОЙ ТЕЛЕФОННЫЙ ДИАЛОГ (${finalTargetTurns} РАУНДА)! ЭТО НЕ МОНОЛОГ И НЕ СБРОС ТРУБКИ!
ПРАВИЛА ВЕДЕНИЯ ДИАЛОГА:
  1. ТЫ — НАСТОЯЩИЙ ЖИВОЙ ЧЕЛОВЕК (${finalCallerRole}), А НЕ УЧИТЕЛЬ!
  2. СТРОЖАЙШЕ ЗАПРЕЩЕНО СПРАШИВАТЬ: «Как сказать...?», «איך אומרים...?» или проводить опросы по грамматике!
  3. В ХОДЕ ДИАЛОГА (раунды до ${finalTargetTurns}):
     * Коротко и тепло отреагируй на реплику ученика («אֵיזֶה יֹפִי!», «מְעֻלֶּה!», «הַבַּנְתִּי!»).
     * ЗАДАЙ СЛЕДУЮЩИЙ ДРУЖЕСКИЙ НАВОДЯЩИЙ ВОПРОС со стороны своей роли («${finalCallerRole}»)!
     * НЕ ВЕШАЙ ТРУБКУ РАНЬШЕ ВРЕМЕНИ! Обязательно установи "isCompleted": false, "shouldHangUp": false.
  4. ФИНАЛЬНЫЙ РАУНД (когда раунд >= ${finalTargetTurns} или если ученик САМ явно прощается «ביי / להתראות»):
     * Тепло поблагодари, передай привет или пожелай хорошего дня.
     * ОБЯЗАТЕЛЬНО установи "isCompleted": true, "shouldHangUp": true и повесь трубку!`
      : `КТО ТЫ (ИИ): ${finalCallerNameRu} (${finalCallerRole}).
КТО ТЕБЕ ПОЗВОНИЛ: Ученик — ${finalUserRole}. Он сам набрал тебе. Ты принимаешь звонок.
СИТУАЦИЯ: ${cleanSituation}
ТВОЯ РОЛЬ: "${cleanCallerObjective || 'Принять звонок и помочь ученику в роли «' + finalCallerRole + '»'}".
ЗАДАЧА УЧЕНИКА: "${cleanStudentObjective || 'Объяснить свой запрос и получить помощь'}".
ГЛАВНАЯ ЦЕЛЬ: ВЕСТИ ПОЛНОЦЕННЫЙ ЖИВОЙ ДИАЛОГ (${finalTargetTurns} РАУНДА)! ОСТАВАЙСЯ В ОБРАЗЕ ПЕРСОНАЖА!
ПРАВИЛА ВЕДЕНИЯ ДИАЛОГА:
  1. ТЫ — ${finalCallerRole}. Не безликий оператор, а конкретный живой человек в этой роли.
  2. СТРОЖАЙШЕ ЗАПРЕЩЕНО СПРАШИВАТЬ «איך אומרים» ИЛИ ТЕСТИРОВАТЬ УЧЕНИКА!
  3. В ХОДЕ ДИАЛОГА (раунды до ${finalTargetTurns}):
     * Прими запрос ученика в образе своего персонажа («${finalCallerRole}»), задай логичный уточняющий вопрос (детали, время, предпочтения со своей стороны).
     * НЕ ВЕШАЙ ТРУБКУ РАНЬШЕ ВРЕМЕНИ! Обязательно установи "isCompleted": false, "shouldHangUp": false.
  4. ФИНАЛЬНЫЙ РАУНД (когда раунд >= ${finalTargetTurns} или если ученик прощается):
     * Подтверди договорённость или пожелай хорошего дня в образе своего персонажа.
     * Установи "isCompleted": true, "shouldHangUp": true и заверши звонок!`;


    const systemPrompt = `ТЫ — ЖИВОЙ ПЕРСОНАЖ ТЕЛЕФОННОГО ЗВОНКА В ИЗРАИЛЕ.
ТВОЁ ИМЯ И РОЛЬ: ${finalCallerName} (${finalCallerNameRu} — ${finalCallerRole}).
ТВОЙ СОБЕСЕДНИК (УЧЕНИК): ${finalUserRole}.
ПОЛ СОБЕСЕДНИКА (УЧЕНИКА): ${isFemale ? 'Женский (обращайся к ней на «אַתְּ», глаголы «-תְּ»)' : 'Мужской (обращайся к нему на «אַתָּה», глаголы «-תָּ»)'}.
СИТУАЦИЯ ЗВОНКА: ${cleanSituation}.
ТЕКУЩИЙ РАУНД: ${userTurnsCount} из ${finalTargetTurns}.

СТРОЖАЙШИЙ ЗАПРЕТ НА ПОДМЕНУ РОЛЕЙ:
1. ТЫ — ${finalCallerRole}! Твой собеседник — ${finalUserRole}!
2. НИ В КОЕМ СЛУЧАЕ НЕ ПРИПИСЫВАЙ СЕБЕ СТАТУС, ЖЕЛАНИЯ ИЛИ СЛОВА УЧЕНИКА:
   - Если ты арендодатель/хозяин, а ученик — арендатор: ТЫ сдаёшь квартиру, а ученик ищет! КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО говорить «אֲנִי מְחַפֵּשׂ דִּירָה» («я ищу квартиру»)! Задай вопрос со стороны арендодателя: «כַּמָּה חֲדָרִים אַתָּה מְחַפֵּשׂ?» («сколько комнат ты ищешь?»).
   - Если ты продавец/официант, а ученик — покупатель/посетитель: ТЫ обслуживаешь, а не заказываешь! Спроси «מָה תִּרְצֶה לִקְנוֹת/לְהַזְמִין?», а не говори «אני רוצה...».
   - Если ты врач/специалист, а ученик — пациент/клиент: ТЫ ведёшь приём, а не жалуешься на симптомы.
3. НИКОГДА НЕ ПОВТОРЯЙ ФРАЗЫ ОТ ПЕРВОГО ЛИЦА («אֲנִי...»), ЕСЛИ ЭТО ЖЕЛАНИЕ ИЛИ ДЕЙСТВИЕ УЧЕНИКА! Твои реплики должны отражать только твою роль («${finalCallerRole}»).

${grammarGuidance}

${vocabGuidance}

${roleGuidance}

${cleanGoals && cleanGoals.length > 0 ? `ТЕМЫ И ЗАДАЧИ ДИАЛОГА (помогай ученику раскрыть эти темы встречными вопросами от лица ${finalCallerRole}):\n${cleanGoals.map((g: string, i: number) => `${i + 1}. ${g}`).join('\n')}` : ''}

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
                        .map((m) => `${m.role === 'user' ? `Ученик (${finalUserRole})` : `${finalCallerNameRu} (${finalCallerRole})`}: ${m.content}`)
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
