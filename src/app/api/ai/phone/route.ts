import { groqModels as configuredGroqModels, geminiModel, geminiModels, resolveAiKeys } from '@/lib/aiModels';
import { readAiJson, fetchAi, aiErrorResponse } from '@/lib/aiRequest';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { stripNikkud, ensureCyrillicHebrewTranscription } from '@/lib/transcription';
import { IS_EARLY_ACCESS_FREE, FREE_LESSONS_LIMIT, FREE_GUEST_LESSONS_LIMIT } from '@/lib/config';
import { sanitizeRussianTranslation } from '@/lib/russianTranslation';
import { cleanGrammarJargon, BESPOKE_PHONE_SCENARIOS, getLessonPhoneScenario } from '@/data/phoneScenarios';
import { DETAILED_LESSONS } from '@/data/lessonsData';
import { extractClosedSlots, formatSlotMemoryPrompt, filterRepeatedSlotQuestions } from '@/lib/slotMemory';

interface PhoneRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string; hebrew?: string }>;
  lessonNumber: number;
  level: 'alef' | 'bet';
  userGender: 'male' | 'female';
  userName?: string;
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
  return typeof text === 'string' ? text.trim() : '';
}

/**
 * Единая прогрессивная шкала грамматических рамок для всех 100 уроков ульпана
 */
function getGrammarBoundary(lessonNumber: number): string {
  if (lessonNumber <= 35) {
    return 'ТОЛЬКО настоящее время (הוֹוֶה) и простые фразы (יֵשׁ/אֵין, זֶה, שֶׁל). Прошедшее и будущее время СТРОГО ЗАПРЕЩЕНЫ (никаких נִתְרָאֶה, תִּצְטָרֵךְ, תִּהְיֶה, תִּמְסֹר, תִּרְצֶה)!';
  }
  if (lessonNumber <= 50) {
    return 'Настоящее (הוֹוֶה) и прошедшее время (זְמַן עָבָר). Будущее время ЗАПРЕЩЕНО (никаких נִתְרָאֶה, תִּהְיֶה)!';
  }
  return 'Живой разговорный иврит (настоящее, прошедшее и будущее время).';
}

export async function POST(req: NextRequest) {
  try {
    const body = await readAiJson<PhoneRequestBody>(req);
    const {
      messages = [],
      lessonNumber = 1,
      level = 'alef',
      userGender = 'male',
      userName,
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

    // 1. Проверка авторизации: уроки с 3-го требуют бесплатной регистрации
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!session && lessonNumber > FREE_GUEST_LESSONS_LIMIT) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется бесплатная регистрация для доступа к урокам с 3-го' },
        { status: 401 }
      );
    }
    if (!IS_EARLY_ACCESS_FREE && (!session || session.subscriptionTier !== 'pro') && lessonNumber > FREE_LESSONS_LIMIT) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется подписка PRO для уроков выше 30-го' },
        { status: 403 }
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
    const { groqKey, geminiKey } = resolveAiKeys(provider, apiKey);

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
      strippedLastUser.includes('שלום ולהתראות') ||
      (userTurnsCount >= 2 && strippedLastUser.includes('תודה') && (strippedLastUser.includes('טוב') || strippedLastUser.includes('רבה')));

    // Определение финального раунда
    const isTurnLimitReached = userTurnsCount >= finalTargetTurns;
    const shouldForceFinalTurn = isUserSayingGoodbye || isTurnLimitReached;

    const cleanSituation = cleanGrammarJargon(finalSituationSummary);
    const cleanCallerObjective = cleanGrammarJargon(finalCallerObj);
    const cleanStudentObjective = cleanGrammarJargon(finalStudentObj);
    const cleanCompletionCondition = cleanGrammarJargon(finalCondition);

    // Перспективное описание ситуации для самого персонажа ИИ (без путающих обращений «Вы звоните»)
    const aiSituationDescription = isIncoming
      ? `Ты (${finalCallerNameRu} — ${finalCallerRole}) сам звонишь ученику (${finalUserRole}). ${cleanSituation}`
      : `Ученик (${finalUserRole}) сам звонит тебе (${finalCallerNameRu} — ${finalCallerRole}). Ты принимаешь его звонок. ${cleanSituation.replace(/^Вы звоните\s*\([^)]*\)\.?\s*/i, '')}`;

    // Очищаем подсказки целей от готовых реплик на иврите от 1-го лица (например: (אֲנִי מְחַפֵּשׂ...)),
    // чтобы нейросеть не повторяла фразы ученика от своего имени!
    const cleanGoals = (finalGoals || []).map((g: string) =>
      g.replace(/\s*\([^)]*[\u0590-\u05FF]+[^)]*\)/g, '').trim()
    );

    // Грамматические рамки для урока (1-100)
    const grammarGuidance = getGrammarBoundary(lessonNumber);

    // Компактный опорный словарь (до 8 ключевых слов)
    const situationHints = (serverScenario?.vocabularyHints || body.vocabularyHints || (serverLesson?.vocabulary || []).slice(0, 6).map((w) => w.hebrew)).slice(0, 8);

    // Извлечение закрытых сущностей (инвариант P-03 — Slot Memory)
    const closedSlots = extractClosedSlots(sanitizedMessages, userName || (body.knownWords && body.knownWords[0]));
    const slotPromptSection = formatSlotMemoryPrompt(closedSlots);

    const isFinal = shouldForceFinalTurn;

    const systemPrompt = `ТЫ — ПЕРСОНАЖ ЖИВОГО ТЕЛЕФОННОГО ЗВОНКА В ИЗРАИЛЕ.
Ты: ${finalCallerName} (${finalCallerNameRu} — роль: ${finalCallerRole}).
Собеседник: Ученик (${finalUserRole}).
Пол собеседника: ${isFemale ? 'Женский (обращайся к ней на «אַתְּ», глаголы «-תְּ»)' : 'Мужской (обращайся к нему на «אַתָּה», глаголы «-תָּ»)'}.
Ситуация: ${aiSituationDescription}.
Цель персонажа: ${cleanCallerObjective || 'Провести диалог со своей роли и помочь собеседнику'}.
Задача ученика: ${cleanStudentObjective || 'Ответить на вопросы и поддержать диалог'}.
${finalSystemPromptAddition ? `\nЛЕГЕНДА И ИНСТРУКЦИИ СЦЕНАРИЯ:\n${finalSystemPromptAddition}` : ''}
${situationHints.length > 0 ? `\nКлючевые слова: ${situationHints.join(', ')}.` : ''}
${slotPromptSection ? `\n${slotPromptSection}` : ''}

ПРАВИЛА РОЛИ И ДИАЛОГА:
1. СТРОГО соблюдай свою роль («${finalCallerRole}»)! Никогда не приписывай себе статус или желания ученика («${finalUserRole}»):
   - Если ты сдаёшь жильё, а ученик ищет: спроси «כַּמָּה חֲדָרִים ${isFemale ? 'אַתְּ מְחַפֶּשֶׂת?' : 'אַתָּה מְחַפֵּשׂ?'}», не говори «אני מחפש דירה».
2. НИКОГДА НЕ ПОВТОРЯЙ ФРАЗЫ ОТ ПЕРВОГО ЛИЦА («אֲנִי...»), если это действие или желание ученика!
3. Если ученик задал встречный вопрос (цена, адрес, мебель, время) — СНАЧАЛА ответь на его вопрос от лица ${finalCallerRole}, затем спроси дальше.
4. Если ученик путает роли (например, говорит «אני משכיר דירה» вместо «שוכר»): доброжелательно поправь его в образе: «רגע, אני בעל הדירה, אני משכיר! ${isFemale ? 'אַתְּ מְחַפֶּשֶׂת' : 'אַתָּה מְחַפֵּשׂ'} לשכור דירה?».
5. Внимательно читай сообщения ученика: если он УЖЕ назвал деталь (сахар, размер, комнаты, имя, адрес), НЕ ПЕРЕСПРАШИВАЙ ЕЁ!
6. Реплика: 1-2 коротких живых предложения (~5-12 слов). ${level === 'alef' ? 'Уровень Алеф: простая разговорная лексика.' : 'Уровень Бет.'}
7. ${grammarGuidance}
8. БАЛАНС СЛОВАРЯ И ПРОСТОТА РЕЧИ:
   - Опирайся на пройденный словарный запас (уроки 1..${lessonNumber}).
   - Естественные разговорные связки и этикетные частицы разрешены: «כֵּן», «לֹא», «בְּסֵדֶר», «יוֹפִי», «טוֹב», «אָה», «תּוֹדָה», «בְּבַקָּשָׁה», «שָׁלוֹם», «לְהִתְרָאוֹת», «בַּיי», «שֶׁיִּהְיֶה יוֹם טוֹב».
   ${lessonNumber === 1 ? `- ДЛЯ УРОКА 1: Диалог первого урока — это строго знакомство и вежливость: приветствие, «נָעִים מְאוֹד», номер квартиры (если имя уже названо) и доброе пожелание. НИКОГДА не спрашивай имя («איך קוראים לך»), если собеседник уже представился!` : ''}
   ${lessonNumber <= 3 ? `- ДЛЯ НАЧАЛЬНЫХ УРОКОВ (1-3): КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО использовать сложные незнакомые слова и модальные конструкции (например: «צָרִיךְ», «עֶזְרָה», «בְּמַשֶּׁהוּ», «יָכוֹל», «בְּעָיָה»). Говори предельно просто, опираясь строго на тему урока!` : ''}
9. КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО: спрашивать «איך אומרים», проверять правила или учить языку. Ты обычный человек в роли ${finalCallerRole}!
10. АДАПТИВНОСТЬ И ЗАПРЕТ ДОСЛОВНОГО ЦИТИРОВАНИЯ:
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО копировать примеры из сценария символ в символ, если собеседник сказал иное!
   - Если ученик заказал чай («תֵּה») вместо кофе («קָפֶה») — говори ТОЛЬКО о чае!
   - Если ученик ответил «תּוֹדָה» или просто поблагодарил — вежливо ответь на благодарность («בְּבַקָּשָׁה!») и завершай разговор, не навязывай несуществующие пункты!

${isFinal ? `ЭТО ФИНАЛЬНЫЙ РАУНД ЗВОНКА (раунд ${userTurnsCount} из ${finalTargetTurns} или ученик попрощался):
- Коротко и тепло заверши разговор («בְּסֵדֶר גָּמוּר! תּוֹדָה רַבָּה וְיוֹם טוֹב!»).
- НЕ задавай вопросов!
- В JSON установи: "isCompleted": true, "shouldHangUp": true.` : `ДИАЛОГ ПРОДОЛЖАЕТСЯ (раунд ${userTurnsCount} из ${finalTargetTurns}):
- Отреагируй и задай следующий логичный вопрос по ситуации от лица ${finalCallerRole}.
- НЕ прощайся и НЕ говори «ביי / להתראות».
- В JSON установи: "isCompleted": false, "shouldHangUp": false.`}

ПРАВИЛА ОФОРМЛЕНИЯ JSON:
- "hebrew": Реплика на иврите с точными огласовками (никуд).
- "transcription": Русская транскрипция с ударением (´) и буквой 'h' для ה. Транскрипция союза ו строго соответствует его нормативной огласовке: וּ передаётся как «у-» (например, «וּגְבִינָה» → «у-гвинá»), וְ передаётся как «вэ-» (например, «וְסֵפֶר» → «вэ-сéфер»).
- "translation": Грамотный литературный русский перевод.

Ответь СТРОГО валидным JSON-объектом. Твой ответ обязан начинаться с { и заканчиваться на }.
НЕ используй разметку функций или инструментов! ТОЛЬКО этот JSON-объект:
{
  "hebrew": "реплика на иврите с точными полными огласовками (никуд)",
  "transcription": "русская транскрипция с ударением (´) и 'h' для ה",
  "translation": "грамотный литературный русский перевод",
  "isCompleted": ${isFinal},
  "shouldHangUp": ${isFinal},
  "suggestedReplies": []
}`;

    if (groqKey) {
      const groqModels = configuredGroqModels('phone');
      for (const groqModel of groqModels) {
        try {
          const reqPayload: Record<string, any> = {
            model: groqModel,
            messages: [
              { role: 'system', content: systemPrompt },
              ...sanitizedMessages.map((m) => ({ role: m.role, content: m.content })),
            ],
            response_format: { type: 'json_object' },
            temperature: 0.3,
            max_tokens: 450,
          };
          if (groqModel.includes('oss')) {
            reqPayload.reasoning_effort = 'low';
          }

          const groqResponse = await fetchAi('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify(reqPayload),
          });

          if (groqResponse.ok) {
            const data = await groqResponse.json();
            const contentStr = data.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(contentStr);

            const safeHebrew = (parsed.hebrew || '').trim();
            const rawTranscription = sanitizeTranscription(parsed.transcription || parsed.cyrillic_transcription || '');
            const safeTranscription = ensureCyrillicHebrewTranscription(rawTranscription, safeHebrew);

            const aiTextStripped = stripNikkud(safeHebrew).toLowerCase();
            const isAiFarewell =
              aiTextStripped.includes('להתראות') ||
              aiTextStripped.includes('ביי') ||
              aiTextStripped.includes('יום טוב') ||
              aiTextStripped.includes('יום נפלא') ||
              aiTextStripped.includes('יום מקסים') ||
              aiTextStripped.includes('לילה טוב');

            const isDone =
              shouldForceFinalTurn ||
              (userTurnsCount >= 2 && Boolean(parsed.shouldHangUp || parsed.isCompleted)) ||
              (userTurnsCount >= 2 && isAiFarewell);

            const parsedReplies = Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : [];
            const safeReplies = parsedReplies.length > 0
              ? parsedReplies.map((r: any) => {
                  const replyHeb = (r.hebrew || '').trim();
                  return {
                    hebrew: replyHeb,
                    transcription: ensureCyrillicHebrewTranscription(
                      sanitizeTranscription(r.transcription || r.cyrillic_transcription || ''),
                      replyHeb
                    ),
                    translation: sanitizeRussianTranslation(r.translation || r.russian_translation || ''),
                  };
                })
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

            const filtered = filterRepeatedSlotQuestions(
              {
                hebrew: safeHebrew,
                transcription: safeTranscription,
                translation: sanitizeRussianTranslation(parsed.translation || parsed.russian_translation || ''),
              },
              closedSlots
            );

            return NextResponse.json({
              hebrew: filtered.hebrew,
              transcription: filtered.transcription,
              translation: filtered.translation,
              isCompleted: isDone,
              shouldHangUp: isDone,
              suggestedReplies: isDone ? [] : safeReplies,
              engine: `Groq (${groqModel})`,
            });
          } else {
            const errText = await groqResponse.text();
            console.warn(`Groq error ${groqResponse.status} with model ${groqModel}:`, errText);

            // Резервное извлечение при ошибке валидации JSON или вызове инструмента
            try {
              const errObj = JSON.parse(errText);
              const raw = errObj?.error?.failed_generation;
              if (raw && typeof raw === 'string') {
                let recoveredHebrew = '';
                let recoveredTranscription = '';
                let recoveredTranslation = '';

                if (raw.trim().startsWith('{')) {
                  const p = JSON.parse(raw);
                  const target = p.arguments || p;
                  recoveredHebrew = target.hebrew || '';
                  recoveredTranscription = target.transcription || target.cyrillic_transcription || '';
                  recoveredTranslation = target.translation || target.russian_translation || '';
                } else if (/[\u0590-\u05FF]/.test(raw)) {
                  recoveredHebrew = raw.trim();
                }

                if (recoveredHebrew) {
                  const filtered = filterRepeatedSlotQuestions(
                    {
                      hebrew: recoveredHebrew,
                      transcription: sanitizeTranscription(recoveredTranscription),
                      translation: sanitizeRussianTranslation(recoveredTranslation),
                    },
                    closedSlots
                  );
                  const aiRecStripped = stripNikkud(recoveredHebrew).toLowerCase();
                  const isRecFarewell =
                    aiRecStripped.includes('להתראות') ||
                    aiRecStripped.includes('ביי') ||
                    aiRecStripped.includes('יום טוב') ||
                    aiRecStripped.includes('יום נפלא') ||
                    aiRecStripped.includes('יום מקסים') ||
                    aiRecStripped.includes('לילה טוב');
                  const isRecDone = shouldForceFinalTurn || (userTurnsCount >= 2 && isRecFarewell);
                  return NextResponse.json({
                    hebrew: filtered.hebrew,
                    transcription: filtered.transcription,
                    translation: filtered.translation,
                    isCompleted: isRecDone,
                    shouldHangUp: isRecDone,
                    suggestedReplies: [],
                    engine: `Groq (${groqModel}) [auto-recovered]`,
                  });
                }
              }
            } catch {}
          }
        } catch (groqErr) {
          console.warn(`Groq error with model ${groqModel}:`, groqErr);
        }
      }
    }

    // 2. Попытка запроса через Gemini API (карусель быстрых моделей)
    if (geminiKey) {
      const gModels = geminiModels('phone');
      for (const gModel of gModels) {
        try {
          const geminiRes = await fetchAi(
            `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${geminiKey}`,
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

            const safeHebrew = (parsed.hebrew || '').trim();
            const rawTranscription = sanitizeTranscription(parsed.transcription || parsed.cyrillic_transcription || '');
            const safeTranscription = ensureCyrillicHebrewTranscription(rawTranscription, safeHebrew);

            const aiTextStripped = stripNikkud(safeHebrew).toLowerCase();
            const isAiFarewell =
              aiTextStripped.includes('להתראות') ||
              aiTextStripped.includes('ביי') ||
              aiTextStripped.includes('יום טוב') ||
              aiTextStripped.includes('יום נפלא') ||
              aiTextStripped.includes('יום מקסים') ||
              aiTextStripped.includes('לילה טוב');

            const isDone =
              shouldForceFinalTurn ||
              (userTurnsCount >= 2 && Boolean(parsed.shouldHangUp || parsed.isCompleted)) ||
              (userTurnsCount >= 2 && isAiFarewell);

            const parsedReplies = Array.isArray(parsed.suggestedReplies) ? parsed.suggestedReplies : [];
            const safeReplies = parsedReplies.length > 0
              ? parsedReplies.map((r: any) => {
                  const replyHeb = (r.hebrew || '').trim();
                  return {
                    hebrew: replyHeb,
                    transcription: ensureCyrillicHebrewTranscription(
                      sanitizeTranscription(r.transcription || r.cyrillic_transcription || ''),
                      replyHeb
                    ),
                    translation: sanitizeRussianTranslation(r.translation || r.russian_translation || ''),
                  };
                })
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

            const filtered = filterRepeatedSlotQuestions(
              {
                hebrew: safeHebrew,
                transcription: safeTranscription,
                translation: sanitizeRussianTranslation(parsed.translation || parsed.russian_translation || ''),
              },
              closedSlots
            );

            return NextResponse.json({
              hebrew: filtered.hebrew,
              transcription: filtered.transcription,
              translation: filtered.translation,
              isCompleted: isDone,
              shouldHangUp: isDone,
              suggestedReplies: isDone ? [] : safeReplies,
              engine: `Gemini (${gModel})`,
            });
          }
        } catch (geminiErr) {
          console.warn(`Gemini phone call error with model ${gModel}:`, geminiErr);
        }
      }
    }

    // 3. Fallback ответ, если внешние AI недоступны
    const isDone = shouldForceFinalTurn;
    const fallbackHebrew = isDone
      ? (isIncoming ? 'מְעֻלֶּה, תּוֹדָה רַבָּה! לְהִתְרָאוֹת!' : 'בְּסֵדֶר גָּמוּר, תּוֹדָה רַבָּה וְיוֹם טוֹב!')
      : (isIncoming ? 'אֵיזֶה יֹפִי! וּמָה עוֹד?' : (isFemale ? 'בְּסֵדֶר גָּמוּר! וּמָה אַתְּ רוֹצָה עוֹד?' : 'בְּסֵדֶר גָּמוּר! וּמָה אַתָּה רוֹצֶה עוֹד?'));

    const filteredFallback = filterRepeatedSlotQuestions(
      {
        hebrew: fallbackHebrew,
        transcription: isDone
          ? (isIncoming ? 'мэцуйáн, тодá рабá! лэhитраóт!' : 'бэсэ́дер гамӯр, тодá рабá вэ-йом тов!')
          : (isIncoming ? 'э́йзе йóфи! у-ма од?' : (isFemale ? 'бэсэ́дер гамӯр! у-ма ат роцá од?' : 'бэсэ́дер гамӯр! у-ма атá роцé од?')),
        translation: isDone
          ? (isIncoming ? 'Отлично, большое спасибо! До свидания!' : 'Все в порядке, большое спасибо и хорошего дня!')
          : (isIncoming ? 'Как здорово! А что ещё?' : (isFemale ? 'Все в порядке! А что ты хочешь ещё?' : 'Все в порядке! А что ты хочешь ещё?')),
      },
      closedSlots
    );

    return NextResponse.json({
      hebrew: filteredFallback.hebrew,
      transcription: filteredFallback.transcription,
      translation: filteredFallback.translation,
      isCompleted: isDone,
      shouldHangUp: isDone,
      suggestedReplies: [],
      engine: 'Автоответчик (Звонок)',
    });
  } catch (error: any) { return aiErrorResponse(error); }
}
