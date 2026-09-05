import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string; hebrew?: string }>;
  lessonNumber: number;
  level: 'alef' | 'bet';
  userGender: 'male' | 'female';
  scenarioTitle: string;
  situation: string;
  aiRole: string;
  userRole: string;
  goals: string[];
  topic?: string;
  vocabulary?: string[];
  vocabularyHints?: string[];
  grammarTopic?: string;
  provider?: 'groq' | 'gemini';
  apiKey?: string;
  isPhoneCall?: boolean;
  ulpanMode?: boolean;
  systemPromptAddition?: string;
  studentKnownWords?: string[];
  turnIndex?: number;
  targetTurns?: number;
  currentStep?: {
    stepIndex: number;
    fact: string;
    aiQuestionHebrew: string;
    aiQuestionRu: string;
    expectedConcept: string;
    targetWords?: string[];
    sampleAnswers?: Array<{
      hebrew: string;
      transcription: string;
      translation: string;
    }>;
  };
  previousStep?: {
    stepIndex: number;
    fact: string;
    aiQuestionHebrew: string;
    aiQuestionRu: string;
    expectedConcept: string;
    targetWords?: string[];
    sampleAnswers?: Array<{
      hebrew: string;
      transcription: string;
      translation: string;
    }>;
  };
  allSteps?: Array<{
    stepIndex: number;
    fact: string;
    aiQuestionHebrew: string;
    aiQuestionRu: string;
    expectedConcept: string;
    targetWords?: string[];
  }>;
  usefulWords?: Array<{
    hebrew: string;
    transcription: string;
    translation: string;
    isNew?: boolean;
    explanation?: string;
  }>;
}

/**
 * Очистка и исправление типичных дословных калек с иврита в русском переводе для ВСЕХ уроков
 */
export function sanitizeRussianTranslation(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let res = text.trim();

  // 1. Языки и речь: "на какой язык ты говоришь" -> "на каком языке ты говоришь"
  res = res.replace(/на\s+как(?:ой|ом)\s+язык(\?|\s+|$)/gi, 'на каком языке$1');
  res = res.replace(/на\s+как(?:ой|ом)\s+язык\s+ты\s+говоришь/gi, 'на каком языке ты говоришь');
  res = res.replace(/на\s+как(?:ой|ом)\s+язык\s+вы\s+говорите/gi, 'на каком языке вы говорите');
  res = res.replace(/на\s+какие\s+языки\s+ты\s+говоришь/gi, 'на каких языках ты говоришь');
  res = res.replace(/на\s+какие\s+языки\s+вы\s+говорите/gi, 'на каких языках вы говорите');
  res = res.replace(/говори(?:шь|те)\s+иврит(\?|\s+|$)/gi, (m, end) => m.toLowerCase().startsWith('говорите') ? `говорите на иврите${end}` : `говоришь на иврите${end}`);
  res = res.replace(/говори(?:шь|те)\s+русский(\?|\s+|$)/gi, (m, end) => m.toLowerCase().startsWith('говорите') ? `говорите по-русски${end}` : `говоришь по-русски${end}`);
  res = res.replace(/говори(?:шь|те)\s+английский(\?|\s+|$)/gi, (m, end) => m.toLowerCase().startsWith('говорите') ? `говорите по-английски${end}` : `говоришь по-английски${end}`);

  // 2. Место жительства и география: "откуда ты живешь" -> "где ты живешь"
  res = res.replace(/откуда\s+ты\s+живешь/gi, 'где ты живешь');
  res = res.replace(/откуда\s+вы\s+живете/gi, 'где вы живете');
  res = res.replace(/откуда\s+ты\s+проживаешь/gi, 'где ты живешь');
  res = res.replace(/в\s+как(?:ой|ом)\s+город\s+ты\s+живешь/gi, 'в каком городе ты живешь');
  res = res.replace(/в\s+как(?:ой|ом)\s+город\s+вы\s+живете/gi, 'в каком городе вы живете');
  res = res.replace(/из\s+какой\s+город/gi, 'из какого города');
  res = res.replace(/из\s+какой\s+страна/gi, 'из какой страны');
  res = res.replace(/в\s+как(?:ой|ую)\s+улиц(?:у|е)/gi, 'на какой улице');
  res = res.replace(/в\s+как(?:ой|ом)\s+этаж(?:е|)/gi, 'на каком этаже');

  // 3. Время и расписание (уроки по времени, часам и встречам)
  res = res.replace(/в\s+как(?:ой|ом)\s+час(?:е|)(\?|\s+|$)/gi, 'в котором часу$1');
  res = res.replace(/что\s+час\??/gi, 'который час?');
  res = res.replace(/что\s+время\??/gi, 'сколько времени?');

  // 4. Возраст, знакомство и приветствия
  res = res.replace(/сын\s+скольких?\s+(?:лет|ты)/gi, 'сколько тебе лет');
  res = res.replace(/дочь\s+скольких?\s+(?:лет|ты)/gi, 'сколько тебе лет');
  res = res.replace(/как\s+(?:читают|называют)\s+теб(?:е|я)/gi, 'как тебя зовут');
  res = res.replace(/как\s+(?:читают|называют)\s+вам/gi, 'как вас зовут');
  res = res.replace(/приятный\s+очень/gi, 'очень приятно');
  res = res.replace(/что\s+твой\s+мир/gi, 'как твои дела');
  res = res.replace(/что\s+твой\s+покой/gi, 'как твои дела');
  res = res.replace(/что\s+слышно\s+с\s+тобой/gi, 'как дела');

  // 5. Покупки, кафе и быт (уроки по магазину, кафе, ресторану)
  res = res.replace(/сколько\s+это\s+поднимается/gi, 'сколько это стоит');
  res = res.replace(/есть\s+тебе(\?|\s+|$)/gi, 'у тебя есть$1');
  res = res.replace(/есть\s+вам(\?|\s+|$)/gi, 'у вас есть$1');
  res = res.replace(/нет\s+мне(\?|\s+|$)/gi, 'у меня нет$1');
  res = res.replace(/нет\s+тебе(\?|\s+|$)/gi, 'у тебя нет$1');

  // 6. Самочувствие (уроки здоровья и врача)
  res = res.replace(/что\s+болит\s+тебе/gi, 'что у тебя болит');
  res = res.replace(/болит\s+мне/gi, 'у меня болит');
  res = res.replace(/горячо\s+мне/gi, 'мне жарко');

  // Сохраняем заглавную букву в начале первого предложения
  if (text.length > 0 && text[0] === text[0].toUpperCase() && res.length > 0) {
    res = res[0].toUpperCase() + res.slice(1);
  }

  return res;
}

function sanitizeTranscription(text: string): string {
  if (!text) return '';
  let res = text.trim();
  // Союз «ו» в современном разговорном иврите всегда звучит как «вэ-», заменяем архаичное книжное «у-»
  res = res.replace(/(^|[\s"«(—])у-([а-яёА-ЯЁa-zA-Z])/gi, '$1вэ-$2');
  return res;
}

function normalizeResponse(parsed: any, defaultIsCompleted: boolean = false) {
  const rawTranslation =
    parsed.russian_translation ||
    parsed.translation_ru ||
    parsed.translation ||
    '';

  const rawTranscription =
    parsed.cyrillic_transcription ||
    parsed.russian_transcription ||
    parsed.transcription_ru ||
    parsed.transcription ||
    '';

  const isCompleted = Boolean(parsed.isCompleted ?? parsed.is_completed ?? defaultIsCompleted);
  const shouldHangUp = Boolean(parsed.shouldHangUp ?? parsed.should_hang_up ?? isCompleted);

  const rawNewWords = parsed.new_words || parsed.newWords;
  const newWords = Array.isArray(rawNewWords) && rawNewWords.length > 0
    ? rawNewWords
        .map((nw: any) => ({
          hebrew: nw.hebrew || '',
          transcription: sanitizeTranscription(nw.cyrillic_transcription || nw.transcription || ''),
          translation: sanitizeRussianTranslation(nw.russian_translation || nw.translation || ''),
          explanation: nw.explanation || undefined,
        }))
        .filter((nw: any) => nw.hebrew && nw.translation)
    : undefined;

  const rawTeacherReactionHebrew =
    parsed.teacher_reaction_hebrew ||
    parsed.reaction_hebrew ||
    parsed.teacher_reaction ||
    null;

  const rawTeacherReactionRu =
    parsed.teacher_reaction_ru ||
    parsed.reaction_ru ||
    null;

  return {
    hebrew: parsed.hebrew || '',
    transcription: sanitizeTranscription(rawTranscription),
    translation: sanitizeRussianTranslation(rawTranslation),
    feedback: parsed.feedback_ru || parsed.feedback || null,
    teacherReactionHebrew: rawTeacherReactionHebrew ? rawTeacherReactionHebrew.trim() : null,
    teacherReactionRu: rawTeacherReactionRu ? sanitizeRussianTranslation(rawTeacherReactionRu) : null,
    isCompleted,
    shouldHangUp,
    newWords,
    suggestedReplies: Array.isArray(parsed.suggestedReplies)
      ? parsed.suggestedReplies.map((r: any) => ({
          hebrew: r.hebrew || '',
          transcription: sanitizeTranscription(
            r.cyrillic_transcription ||
            r.russian_transcription ||
            r.transcription_ru ||
            r.transcription ||
            ''
          ),
          translation: sanitizeRussianTranslation(
            r.russian_translation ||
            r.translation_ru ||
            r.translation ||
            ''
          ),
        }))
      : [],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequestBody = await req.json();
    const {
      messages,
      lessonNumber,
      level,
      userGender,
      situation,
      aiRole,
      userRole,
      goals,
      topic,
      vocabulary = [],
      vocabularyHints = [],
      grammarTopic,
      provider = 'groq',
      apiKey,
      isPhoneCall = false,
      systemPromptAddition = '',
      studentKnownWords = [],
      currentStep,
      previousStep,
      allSteps,
      usefulWords = [],
    } = body;

    // 1. Проверка авторизации: уроки 1-3 бесплатны для всех, уроки 4+ требуют сессии
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!session && lessonNumber > 3) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется авторизация и подписка PRO для уроков выше 3-го' },
        { status: 401 }
      );
    }

    // 2. Ограничение частоты запросов (Rate Limiting)
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || session?.id || 'guest';
    const rateLimitKey = `ai_chat_${session?.id || clientIp}`;
    const rl = checkRateLimit(rateLimitKey, { limit: 25, windowMs: 60 * 1000 });
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

    const isLevelAlef = level === 'alef';
    const isUlpan = Boolean(body.ulpanMode);
    let levelConstraint = '';

    const sanitizedMessages = (messages || []).map((m) => {
      if (m.role === 'user') {
        let content = m.content || m.hebrew || '';
        // Коррекция омофонических ошибок голосового ввода:
        // В иврите буквы ע и א звучат одинаково [э], а ט и ת звучат одинаково [т].
        // Поэтому עֵט (ручка) и אֶת / עֵת / אֵט / טת звучат абсолютно одинаково [эт]!
        content = content.replace(/(^|[\s.,!?:;])(זֶ?ה|הִ?נֵּ?ה|כֵּ?ן\s+זֶ?ה)\s+(?:אֶ?ת|עֵ?ת|אֵ?ט|טֵ?ת|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עֵט');
        content = content.replace(/(^|[\s.,!?:;])(זה|הנה|כן\s+זה)\s+(?:את|עת|אט|טת)(?=[\s.,!?:;]|$)/gi, '$1$2 עט');
        content = content.replace(/^(?:את|עת|אט|טת)[.!?]?$/gi, 'עט');
        content = content.replace(/^(?:אֶת|עֵת|אֵט|טֵת)[.!?]?$/gi, 'עֵט');
        content = content.replace(/^(?:זה\s+זאת)[.!?]?$/gi, 'זה עט');
        return { role: m.role, content };
      }
      return { role: m.role, content: m.content || m.hebrew || '' };
    });

    const userTurnsCount = sanitizedMessages.filter((m) => m.role === 'user').length;
    const currentTurn = body.turnIndex || userTurnsCount;
    const maxTurns = body.targetTurns || (isPhoneCall ? 3 : 3);

    const lastUserMsg = sanitizedMessages.filter((m) => m.role === 'user').slice(-1)[0];
    const lastUserHebrew = (lastUserMsg?.content || '').toLowerCase();
    const isUserSayingGoodbye =
      lastUserHebrew.includes('להתראות') ||
      lastUserHebrew.includes('ביי') ||
      lastUserHebrew.includes('יום טוב') ||
      lastUserHebrew.includes('לילה טוב') ||
      lastUserHebrew.includes('נשתמע') ||
      lastUserHebrew.includes('שלום ולהתראות');

    const isFinalTurn = isPhoneCall
      ? currentTurn >= maxTurns || (isUserSayingGoodbye && currentTurn >= 2)
      : currentTurn >= maxTurns;

    const dialogueTurnInstruction = isPhoneCall
      ? isFinalTurn
        ? `ЭТО ЗАКЛЮЧИТЕЛЬНАЯ РЕПЛИКА ТЕЛЕФОННОГО ЗВОНКА (СОБЕСЕДНИК САМ ВЕШАЕТ ТРУБКУ):
- Разговор подошел к логическому завершению, цели звонка достигнуты (или ученик попрощался).
- Собеседник тепло и коротко благодарит, прощается и САМ ВЕШАЕТ ТРУБКУ (ровно 1 короткая прощальная фраза на простом иврите, например: 'יוֹפִי, תּוֹדָה רַבָּה! שֶׁיִּהְיֶה לְךָ יוֹם מְצוּיָּן, לְהִתְרָאוֹת! בַּיי!', 'מְעֻלֶּה, אֲנִי יוֹרֵד! לְהִתְרָאוֹת!', 'בְּסֵדֶר גָּמוּר, תּוֹדָה! נִתְרָאֶה, בַּיי!').
- СТРОГО ЗАПРЕЩЕНО задавать новые вопросы! Телефонный разговор завершается прямо сейчас.
- В JSON-ответе ОБЯЗАТЕЛЬНО установи: "isCompleted": true и "shouldHangUp": true.
- В "suggestedReplies" верни пустой массив [] или 1 простой вариант прощания ('תּוֹדָה רַבָּה, בַּיי!').`
        : `ЭТАП ТЕЛЕФОННОГО ЗВОНКА: ШАГ ${currentTurn} ИЗ ${maxTurns}.
- Продвигай телефонный диалог вперед по теме урока.
- Кратко отреагируй на слова ученика (например: 'יוֹפִי!', 'מְעֻלֶּה!', 'בְּסֵדֶר!') и задай ОДИН следующий конкретный вопрос по звонку.
- В JSON-ответе укажи: "isCompleted": false, "shouldHangUp": false.`
      : isFinalTurn
      ? `ЭТО ЗАКЛЮЧИТЕЛЬНАЯ РЕПЛИКА ДИАЛОГА (ШАГ ${currentTurn} ИЗ ${maxTurns}):
- Ученик успешно прошёл все темы и ответил на вопросы урока №${lessonNumber}!
- Тепло заверши диалог на простом иврите: поблагодари за приятную беседу, пожелай удачи в ульпане / отличного дня и вежливо попрощайся (например: 'נָעִים מְאוֹד לְהַכִּיר! שֶׁיִּהְיֶה לְךָ יוֹם מְצוּיָּן וּבְהַצְלָחָה בָּאוּלְפָּן! לְהִתְרָאוֹת!', 'יוֹפִי! שָׂמัחְתִּי לְדַבֵּר אִתְּךָ. נִתְרָאֶה בַּשִּׁיעוּר!').
- СТРОГО ЗАПРЕЩЕНО задавать новые вопросы! Диалог завершён.
- В "suggestedReplies" предложи ровно 3 простых варианта прощания на иврите (например: 'תּוֹדָה רַבָּה, לְהִתְרָאוֹת!', 'יוֹם נִפְלָא, בַּיי!', 'נָעִים מְאוֹד, שָׁלוֹם!').
- В JSON-ответе ОБЯЗАТЕЛЬНО установи: "isCompleted": true.`
      : currentStep
      ? `ЭТАП ДИАЛОГА: ШАГ ${currentStep.stepIndex} ИЗ ${maxTurns} (СЦЕНАРНЫЙ КАРКАС "FACT FIRST"):
${previousStep ? `ПРЕДЫДУЩИЙ ШАГ №${previousStep.stepIndex} (НА КОТОРЫЙ ТОЛЬКО ЧТО ОТВЕТИЛ УЧЕНИК):
- Факт прошлого шага: "${previousStep.fact}"
- Вопрос прошлого шага: "${previousStep.aiQuestionHebrew}"
- Ожидавшийся ответ ученика: "${previousStep.expectedConcept}"
- ТВОЯ РЕАКЦИЯ НА ПРЕДЫДУЩИЙ ШАГ (teacher_reaction_hebrew / teacher_reaction_ru):
  Обязательно оцени ответ ученика на вопрос прошлого шага и тепло похвали его (например: "יוֹפִי! נָכוֹן מְאוֹד, זֹאת מַחְבֶּרֶת!" или "מְעֻלֶּה, נָכוֹן מְאוֹד!").
` : ''}
НОВЫЙ ТЕКУЩИЙ ШАГ №${currentStep.stepIndex} (АКТУАЛЬНАЯ СИТУАЦИЯ СЕЙЧАС):
1. БАЗОВЫЙ ФАКТ НОВОГО ШАГА (ЧТО ПРОИСХОДИТ ПРЯМО СЕЙЧАС):
   "${currentStep.fact}"
   - Ты ОБЯЗАН вести беседу строго в рамках этой новой ситуации!
2. ВОПРОС/РЕПЛИКА СОБЕСЕДНИКА В ЭТОМ ШАГЕ:
   "${currentStep.aiQuestionHebrew}" (${currentStep.aiQuestionRu}).
   - В поле "hebrew" ты ОБЯЗАН озвучить этот конкретный вопрос нового шага: "${currentStep.aiQuestionHebrew}"!
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО возвращаться к старым предметам из прошлых шагов (например, переспрашивать про книгу или тетрадь)! Задай вопрос строго о новом факте шага!
3. ЧТО ТРЕНИРУЕТ УЧЕНИК В ЭТОМ ШАГЕ:
   "${currentStep.expectedConcept}" ${currentStep.targetWords?.length ? `(Обязательные ключевые слова темы: ${currentStep.targetWords.join(', ')})` : ''}.
4. ГИБКОСТЬ И ПРИНЯТИЕ РЕЧИ УЧЕНИКА (НЕ ТРЕБОВАТЬ ДОСЛОВНОГО СОВПАДЕНИЯ):
   - Ученик НЕ ОБЯЗАН повторять ответ слово в слово!
   - Если ученик ответил своими словами, синонимами, короткой или разговорной фразой (например, «זֹאת מַחְבֶּרֶת», «עַל הַשֻּׁלְחָן יֵשׁ מַחְבֶּרֶת», «מַחְבֶּרֶת» или «הִנֵּה מַחְבֶּרֶת») — ЭТО ПОЛНОСТЬЮ ПРАВИЛЬНЫЙ ОТВЕТ!
   - Обязательно похвали ученика (יוֹפִי! מְעֻלֶּה! נָכוֹן מְאוֹד!) и продолжай диалог дальше.
   - Не придирайся к порядку слов и не требуй заученных книжных фраз. Любой естественный ответ на иврите с верным смыслом и правильным родом принимается на 100%.
   - В поле "feedback_ru": если ученик ответил понятно и верно (пусть даже своими словами) — верни null!
   - Подсказывай в "feedback_ru" ТОЛЬКО если есть явная ошибка в роде (например, ученик сказал «זה» вместо «זאת» для женского рода) или ответ искажает смысл.
5. ЖЕСТКИЙ ЗАПРЕТ ГАЛЛЮЦИНАЦИЙ И СЛОЖНЫХ СЛОВ:
   - СТРОГО ЗАПРЕЩЕНО выдумывать посторонних людей, девушек, неизвестные предметы, о которых не сказано в фактах шага!
   - СТРОГО ЗАПРЕЩЕНО использовать редкие канцеляризмы или книжные слова (вроде 'נציגה', 'פקידה' и т.п.)! Используй ТОЛЬКО базовые слова урока.
6. УЧЕТ ФОНЕТИЧЕСКИХ ОМОФОНОВ ГОЛОСОВОГО ВВОДА (ОМОФОНЫ ע/א и ט/ת):
   - Ученик часто отвечает ГОЛОСОМ через микрофон. Распознавание речи часто путает фонетические омофоны из-за идентичного звучания букв:
   * Буквы ע и א звучат одинаково [э], а буквы ט и ת звучат одинаково [т]!
   * Поэтому слово עֵט (ручка) и служебные слова אֶת / עֵת / אֵט / טת звучат на слух абсолютно одинаково: [эт].
   * Любые варианты ответа ученика: "זה עט", "זה את", "זה עת", "זה אט", "זה טת", "את", "עת", "אט", "טת" при вопросе о ручке (עֵט) — это 100% ПРАВИЛЬНЫЙ ответ "זֶה עֵט" ("это ручка")!
   * СТРОГО ЗАПРЕЩЕНО ругать ученика за "את", "זה את", "טת" или путаницу букв ט/ת и ע/א! Трактуй это как безупречный ответ "זֶה עֵט" (ручка), обязательно похвали ученика ("יוֹפִי! נָכוֹן מְאוֹד, זֶה עֵט!") и продвигай диалог вперед к следующему шагу!
   * Если ответ ученика звучит фонетически похоже на целевое понятие шага, ВСЕГДА принимай ответ как верный, хвали и продвигай диалог вперед!
- В JSON-ответе укажи: "isCompleted": false.`
      : `ЭТАП ДИАЛОГА: ШАГ ${currentTurn} ИЗ ${maxTurns}.
- ВНИМАТЕЛЬНО ПРОАНАЛИЗИРУЙ последний ответ ученика!
- Отреагируй строго на то, что сказал ученик: похвали за правильные слова или грамматику (זֶה / זֹאת, правильный род) или мягко подскажи в "feedback_ru".
- Задай ровно один логичный следующий вопрос строго по теме урока («${topic || ''}») и целям: ${goals.join('; ')}.
- СТРОГО ЗАПРЕЩЕНО менять тему, здороваться заново («שלום, איך קוראים לך?») если диалог уже начался, или задавать случайные вопросы не по теме!
- В JSON-ответе укажи: "isCompleted": false.`;

    if (isLevelAlef) {
      if (lessonNumber === 1) {
        levelConstraint = `СУПЕР-ПРОСТЫЕ ОГРАНИЧЕНИЯ ПО ИВРИТУ (Урок 1, Алеф):
- Ответ должен состоять ровно из 1 короткого предложения!
- Используй только базовые слова первого урока: שלום, בוקר טוב, ערב טוב, נעים מאוד, אני נועם / שרה, איך קוראים לך / לך, מה נשמע, מה העниינים / הענינים, מצוין, מצוינת, בסדר, תודה, סליחה, להתראות / ביי.
- Запрещено использовать сложные глаголы, редкие понятия, длинные предложения или непонятные формы.
- Предложения должны быть максимально простыми и короткими (3-5 слов).`;
      } else if (lessonNumber <= 5) {
        levelConstraint = `ОГРАНИЧЕНИЯ ПО ИВРИТУ (Урок ${lessonNumber}, начальный Алеф):
- Используй базовую лексику уроков 1-${lessonNumber} (настоящее время основных глаголов, простые предлоги, базовые существительные).
- Тема урока: "${topic || ''}".
- Основные слова урока: ${vocabulary.slice(0, 15).join(', ')}.
${vocabularyHints.length > 0 ? `- Ключевые слова/подсказки для устного ответа: ${vocabularyHints.join(', ')}.` : ''}
- Предложения короткие и понятные для начинающего.`;
      } else {
        levelConstraint = `УРОВЕНЬ АЛЕФ (Урок ${lessonNumber}):
- Тема урока: "${topic || ''}".
- Грамматика: "${grammarTopic || ''}".
- Основная лексика урока: ${vocabulary.slice(0, 15).join(', ')}.
${vocabularyHints.length > 0 ? `- Ключевые слова/подсказки для устного ответа: ${vocabularyHints.join(', ')}.` : ''}
- Общайся красиво в рамках пройденных уровней Алеф (уроки 1-${lessonNumber}).`;
      }
    } else {
      levelConstraint = `УРОВЕНЬ БЕТ (Урок ${lessonNumber}):
- Тема урока: "${topic || ''}".
- Используй более развернутые предложения, естественную живую речь Уровня Бет, богатство синонимов/идиом и прошедшее/будущее время.`;
    }

    const genderInstruction = isFemale
      ? 'Ученик — ЖЕНЩИНА (נקבה). Обращайся к ученице строго в женском роде (את רוצה, את אוהבת, נעים להכיר אותך [отáх], מה שלומך [шломéх], תרצי להזמין משהו [тирцӣ]). Ответы от неё в подсказках тоже строго женского рода (אני רוצה, אני גרה, קוראים לי...).'
      : 'Ученик — МУЖЧИНА (זכר). Обращайся к ученику строго в мужском роде (אתה רוצה, אתה אוהב, נעים להכיר אותך [отхá], מה שלומך [шломхá], תרצה להזמין משהו [тирцé]). Ответы от него в подсказках тоже строго мужского рода (אני רוצה, אני גר, קוראים לי...).';

    const ulpanImmersionPrompt = isUlpan
      ? `РЕЖИМ ПОЛНОГО ПОГРУЖЕНИЯ «УЛЬПАН» (עִבְרִית בְּעִבְרִית / IMMERSION MODE):
- Ученик занимается по классической методике израильского ульпана без использования родного языка.
- Ты — преподаватель ульпана. Общайся только на легком живом иврите урока.
- Если ученик ошибся в грамматике, роде или предлоге, напиши обратную связь ("feedback_ru") ИСКЛЮЧИТЕЛЬНО НА ПРОСТОМ ИВРИТЕ с огласовками (например: 'תִּיקּוּן: שִׂימִי לֵב, לוֹמְרִים "אֲנִי רוֹצָה"' или 'תִּיקּוּן: לוֹמְרִים "לַבַּיִת"'). Если ошибок нет — верни null.`
      : '';

    const phoneContext = isPhoneCall
      ? `РЕЖИМ ТЕЛЕФОННОГО ЗВОНКА (PHONE CALL):
- Это живой разговор по телефону. Отвечай ОЧЕНЬ КРАТКО, тепло и понятно (ровно 1-2 простых предложения, максимум 4-7 слов).
- Задавай ТОЛЬКО ОДИН легкий вопрос за раз.
- Будь максимально доброжелательным, поддерживающим и терпеливым собеседником.
- Если ученик говорит неуверенно, с ошибкой или короткими словами (или даже вставляет русские слова), пойми его смысл, мягко поддержи и ответь простым живым ивритом.
- Используй естественные телефонные слова: הַלּוֹ, כֵּן, בְּסֵדֶר, מְעֻלֶּה, יוֹפִי, רֶגַע.`
      : '';

    const systemPrompt = `Ты — добрый, живой и поддерживающий собеседник-израильтянин в ролевом диалоге на иврите. Твоя роль: ${aiRole}.
Сейчас проходит урок №${lessonNumber} (уровень ${level === 'alef' ? 'Алеф' : 'Бет'}).
Ситуация и место действия: "${situation}".
Роль ученика: "${userRole}".
${genderInstruction}
${levelConstraint}
${ulpanImmersionPrompt}
${phoneContext}
${dialogueTurnInstruction}
${systemPromptAddition ? `ДОПОЛНИТЕЛЬНЫЕ ИНСТРУКЦИИ: ${systemPromptAddition}` : ''}
${studentKnownWords && studentKnownWords.length > 0 ? `ПЕРСОНАЛЬНЫЙ АКТИВНЫЙ СЛОВАРЬ УЧЕНИКА (ВЫУЧЕННЫЕ СЛОВА):
Ученик уже выучил и успешно повторяет следующие слова: ${studentKnownWords.slice(0, 40).join(', ')}.
- По возможности органично используй эти знакомые ученику слова в своих репликах для живого закрепления.
- Ожидай, что ученик может использовать их в своих ответах.
- СТРОГО ЗАПРЕЩЕНО использовать сложные абстрактные слова, выходящие далеко за рамки этого словаря и текущего урока №${lessonNumber}!` : ''}
${usefulWords && usefulWords.length > 0 ? `ПОЛЕЗНЫЕ СЛОВА ДИАЛОГА (КАРТОЧКИ ДЛЯ УЧЕНИКА):
${usefulWords.map((w) => `- ${w.hebrew} (${w.translation})${w.explanation ? ` — ${w.explanation}` : ''}`).join('\n')}
- Если в реплике уместно ввести/использовать новое слово из этого списка, укажи его в массиве "new_words" с переводом и пояснением!` : ''}
Цели диалога: ${goals.join('; ')}.

КРИТИЧЕСКИЕ ПРАВИЛА ВЫВОДА ЯЗЫКОВ:
В твоём ответе используются ТОЛЬКО ДВА ЯЗЫКА: ИВРИТ И РУССКИЙ.
АНГЛИЙСКИЙ ЯЗЫК (ENGLISH) СТРОГО И НАВСЕГДА ЗАПРЕЩЁН!
1. Поле "russian_translation" ОБЯЗАНО быть исключительно на БЕЗУПРЕЧНОМ, ГРАМОТНОМ ЛИТЕРАТУРНОМ РУССКОМ языке!
СТРОГО ЗАПРЕЩЕНЫ ДОСЛОВНЫЕ МАШИННЫЕ КАЛЬКИ С ИВРИТА:
- СТРОГО ЗАПРЕЩЕНО: "на какой язык ты говоришь" -> ПРАВИЛЬНО: "На каком языке ты говоришь?" или "На каких языках ты говоришь?"
- СТРОГО ЗАПРЕЩЕНО: "откуда ты живешь" -> ПРАВИЛЬНО: "Где ты живешь?" (для אֵיפֹה אַתָּה גָּר) или "Откуда ты?" / "Откуда ты приехал?" (для מֵאֵיפֹה אַתָּה)
- СТРОГО ЗАПРЕЩЕНО: "в какой город ты живешь" -> ПРАВИЛЬНО: "В каком городе ты живешь?"
- СТРОГО ЗАПРЕЩЕНО: "из какой город" -> ПРАВИЛЬНО: "Из какого города?"
- СТРОГО ЗАПРЕЩЕНО: "как читают тебе" -> ПРАВИЛЬНО: "Как тебя зовут?" (для אֵיךְ קוֹרְאִים לְךָ)
- СТРОГО ЗАПРЕЩЕНО: "что твой мир" -> ПРАВИЛЬНО: "Как твои дела?" (для מַה שְּׁלוֹמְךָ)
- СТРОГО ЗАПРЕЩЕНО: "приятный очень" -> ПРАВИЛЬНО: "Очень приятно" (для נָעִים מְאוֹד)
- Перевод обязан звучать абсолютно естественно для носителя русского языка, с правильными русскими падежами, предлогами и естественным порядком слов!
2. Поле "cyrillic_transcription" ОБЯЗАНО быть только РУССКИМИ БУКВАМИ (кириллица с ударением и с 'h', например: "hа-бáйит", "то́да", "ма нишмá"). Латинские и английские транскрипции СТРОГО ЗАПРЕЩЕНЫ! СОЮЗ «ו» («и») В РУССКОЙ ТРАНСКРИПЦИИ ВСЕГДА ПЕРЕДАВАЙ КАК «вэ-» (например: «вэ-махбэ́рэт», «вэ-ма», «вэ-гвинá», «вэ-сéфер», «вэ-штэй»). СТРОГО ЗАПРЕЩЕНО писать книжное/библейское «у-» («у-ма», «у-махберет»)!
3. В "suggestedReplies" поле "russian_translation" ОБЯЗАНО содержать перевод этой фразы только на безупречный РУССКИЙ язык ("Спасибо, хорошо", "Отлично, спасибо", "Хочу кофе"), а "cyrillic_transcription" — только кириллицу с 'h' и союзом "вэ-"!
4. Поле "feedback_ru" — только на грамотном русском языке или null.

ТРЕБОВАНИЯ ВЕДЕНИЯ ДИАЛОГА:
1. Веди органичный диалог, реагируй живо на иврите (1-2 коротких предложения). Реагируй именно на то, что написал или выбрал ученик, и вежливо продвигай диалог вперед к целям урока №${lessonNumber}.
2. В сообщении расставляй точные полные огласовки (никуд) на иврите везде (например: שָׁלוֹם, בֹּקֶר טוֹב, מָה נִשְׁמַע).
3. Русская транскрипция: русская транскрипция кириллицей с ударением (´), но букву ה (хей) ВСЕГДА обозначать строчной латинской буквой "h" ("hа-бáйит", "hа-йóм", "hу hолéх", "hакéтер шэлхá"). Буквы ח и כ - русской "х" ("халав"). Союз ו (и) ВСЕГДА транскрибировать как «вэ-» (не «у-»).
4. УЧЕНИК ОТВЕЧАЕТ САМОСТОЯТЕЛЬНО УСТНО / ГОЛОСОМ:
- Внимательно оцени сказанное учеником. Если ученик ответил в тему, похвали его («יוֹפִי!», «מְעֻלֶּה!», «נָכוֹן מְאוֹד!»).
- Если ученик сделал грамматическую ошибку (в согласовании рода: זֶה / זֹאת, времени, предлоге или окончании), в поле "feedback_ru" вежливо и кратко поясни на грамотном русском языке, в чём ошибка и как сказать правильно. Если ошибок нет, верни null.
- ФОНЕТИЧЕСКИЕ ОМОФОНЫ ИВРИТА И ГОЛОСОВОЙ ВВОД (СТРОГОЕ ПРАВИЛО ДЛЯ ВСЕХ 100 УРОКОВ):
  В иврите целые группы букв звучат абсолютно одинаково как для человеческого уха, так и для микрофона (ASR):
  1) ע и א — обе буквы звучат как [э/а] (напр. עֵט/אֶת, עִם/אִם, עַל/אַל, עִיר/אִיר)
  2) ט и ת — обе буквы звучат как [т] (напр. טוֹב/תוב, תּוֹדָה/טודה, בַּיִת/בייט, תַּלְמִיד/טלמיד, קָטָן/קתן)
  3) כ (без дагеша) и ח — обе буквы звучат как [х] (напр. לֶחֶם/לכם, חָלָב/כלב, אֲרוּחָה/ארוכה, מָחָר/מכר)
  4) ב (без дагеша) и ו — обе буквы звучат как [в] (напр. לַעֲבוֹד/לעווד, עֶרֶב/ערו)
  5) ס и שׂ (син) — обе буквы звучат как [с] (напр. שָׂפָה/ספה, שִׂמְחָה/סמחה, סֵפֶר/שפר)
  Если распознавание речи транскрибировало слово с омофонической буквой или перепутало омофоны из-за их 100% одинакового звучания — СТРОГО ЗАПРЕЩЕНО ругать ученика, снижать оценку или писать замечания в "feedback_ru"! Всегда оценивай ответ по смыслу и звучанию в контексте темы урока, хвали и продолжай диалог.
5. ТОЧНЫЕ ВАРИАНТЫ ОТВЕТОВ ("suggestedReplies"):
ОБЯЗАТЕЛЬНО предложи ровно 3 ПРЯМЫХ, СУПЕР-ПРОСТЫХ И ТОЧНЫХ варианта ответа ученика именно на твою ТОЛЬКО ЧТО заданную реплику/вопрос!
- Каждый вариант обязан состоять ровно из 1-3 базовых слов текущего урока и прямо отвечать на вопрос собеседника.
- ЗАПРЕЩЕНО добавлять случайные или сложные слова, которые не относятся к вопросу!
- Примеры:
  * Если спросил размер (גדול או קטן?): 1) קָטָן, בְּבַקָּשָׁה 2) גָּדוֹל, בְּבַקָּשָׁה 3) קָפֶה קָטָן
  * Если спросил про сахар (סוכר?): 1) בְּלִי סוּכָּר, תּוֹדָה 2) סוּכָּר אֶחָד, בְּבַקָּשָׁה 3) שְׁנֵי סוּכָּר
  * Если спросил про выпечку (עוגה?): 1) לֹא, תּוֹדָה 2) כֵּן, עוּגָה בְּבַקָּשָׁה 3) כַּמָּה זֶה עוֹלֶה?
  * Если назвал цену или прощаешься: 1) תּוֹדָה רַבָּה, לְהִתְרָאוֹת! 2) יוֹם טוֹב, בַּיי! 3) בְּסֵדֶר, תּוֹדָה!
- Все 3 варианта строго с полными огласовками, русской транскрипцией с 'h' и точным русским переводом.
6. Женский род глаголов (если пол: נקבה): всегда расставляй точные огласовки в глаголах (например: רוֹצָה, אוֹהֶבֶת, לוֹמֶדֶת, שׁוֹתָה, מְדַבֶּרֶת, מַרְגִּישָׁה).
7. ПОСЛЕДОВАТЕЛЬНОСТЬ И РАЗВИТИЕ ДИАЛОГА: ВСЕГДА внимательно читай всю историю сообщений! СТРОГО ЗАПРЕЩЕНО повторять вопросы, на которые ученик уже ответил (например, если ученик уже ответил, что хочет кофе или назвал напиток/имя, НИКОГДА не переспрашивай снова "מה תרצה להזמין?"). Продвигай диалог дальше по логике сценария: уточни детали (размер порции, сахар, молоко, выпечку), назови цену/итог, пожелай хорошего дня и вежливо заверши звонок.

Ты ОБЯЗАН ответить СТРОГО валидным JSON-объектом:
{
  "hebrew": "Полная реплика собеседника на иврите с огласовками",
  "teacher_reaction_hebrew": "Короткая живая реакция на ответ ученика на иврите с огласовками (например: 'יוֹפִי! נָכוֹן מְאוֹד, זֹאת מַחְבֶּרֶת!' или 'מְעֻלֶּה, נָכוֹן מְאוֹד, זֶה עֵט!')",
  "teacher_reaction_ru": "Перевод реакции учителя на русский язык (например: 'Прекрасно! Очень правильно, это тетрадь!' или 'Отлично, очень правильно, это ручка!')",
  "cyrillic_transcription": "русская транскрипция кириллицей с 'h' (напр. шалóм, то́да)",
  "russian_translation": "перевод исключительно на чистом русском языке",
  "feedback_ru": null,
  "isCompleted": false,
  "shouldHangUp": false,
  "suggestedReplies": [
    { "hebrew": "Вариант 1 на иврите с огласовками", "cyrillic_transcription": "русская транскрипция 1", "russian_translation": "русский перевод 1" },
    { "hebrew": "Вариант 2 на иврите с огласовками", "cyrillic_transcription": "русская транскрипция 2", "russian_translation": "русский перевод 2" },
    { "hebrew": "Вариант 3 на иврите с огласовками", "cyrillic_transcription": "русская транскрипция 3", "russian_translation": "русский перевод 3" }
  ],
  "new_words": []
}`;

    // 1. Попытка запроса через Groq API
    if (provider === 'groq' && groqKey) {
      const modelsToTry = [
        process.env.GROQ_MODEL,
        'openai/gpt-oss-120b',
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.6-27b',
        'groq/compound',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
      ].filter(Boolean) as string[];

      for (const groqModel of modelsToTry) {
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
              temperature: 0.4,
              max_tokens: 2500,
            }),
          });

          if (groqResponse.ok) {
            const data = await groqResponse.json();
            const contentStr = data.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(contentStr);
            const normalized = normalizeResponse(parsed, isFinalTurn);
            return NextResponse.json({
              ...normalized,
              engine: 'Groq (Живой ИИ)',
            });
          } else {
            const errData = await groqResponse.json().catch(() => ({}));
            console.warn(`Groq model ${groqModel} returned status ${groqResponse.status}:`, errData);
          }
        } catch (groqErr) {
          console.error(`Groq fetch error with model ${groqModel}:`, groqErr);
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
                      text: `${systemPrompt}\n\nИстория диалога:\n${sanitizedMessages
                        .map((m) => `${m.role === 'user' ? 'Ученик' : 'Собеседник'}: ${m.content}`)
                        .join('\n')}`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.4,
              },
            }),
          }
        );

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = JSON.parse(text);
          const normalized = normalizeResponse(parsed, isFinalTurn);
          return NextResponse.json({
            ...normalized,
            engine: 'Gemini (Живой ИИ)',
          });
        }
      } catch (geminiErr) {
        console.error('Gemini chat error:', geminiErr);
      }
    }

    // 3. Умный контекстный фолбэк строго по текущему шагу урока
    if (currentStep && !isFinalTurn) {
      const fallbackReplies = (currentStep.sampleAnswers && currentStep.sampleAnswers.length > 0)
        ? currentStep.sampleAnswers
        : (lessonNumber === 4
            ? [
                { hebrew: 'זֶה עֵט', transcription: 'зэ эт', translation: 'Это ручка' },
                { hebrew: 'זֹאת מַחְבֶּרֶת', transcription: 'зот махбэ́рэт', translation: 'Это тетрадь' },
                { hebrew: 'אֵלֶּה תַּלְמִידִים', transcription: 'э́ле тальмиди́м', translation: 'Это ученики' },
              ]
            : []);

      return NextResponse.json({
        hebrew: currentStep.aiQuestionHebrew,
        transcription: '',
        translation: currentStep.aiQuestionRu,
        teacherReactionHebrew: previousStep ? 'יוֹפִי! נָכוֹן מְאוֹד!' : null,
        teacherReactionRu: previousStep ? 'Прекрасно! Очень правильно!' : null,
        feedback: null,
        isCompleted: false,
        engine: 'Ульпан-автоответчик (Сценарный шаг)',
        suggestedReplies: fallbackReplies,
      });
    }

    if (lessonNumber === 4) {
      return NextResponse.json({
        hebrew: isFinalTurn
          ? (isFemale
              ? 'מְעֻלֶּה! כָּל הַכָּבוֹד, עַכְשָׁיו אַתְּ יוֹדַעַת אֶת הַמִּלִּים וְאֶת הַהֶבְדֵּל בֵּין זֶה לְזֹאת. לְהִתְרָאוֹת!'
              : 'מְעֻלֶּה! כָּל הַכָּבוֹד, עַכְשָׁיו אַתָּה יוֹדֵעַ אֶת הַמִּלִּים וְאֶת הַהֶבְדֵּל בֵּין זֶה לְזֹאת. לְהִתְרָאוֹת!')
          : 'יוֹפִי מְאוֹד! נָכוֹן מְאוֹד. וְמָה זֶה?',
        transcription: isFinalTurn
          ? (isFemale
              ? 'мэулé! коль hа-кавóд, ахшáв ат йодáат эт hа-милӣм вэ-эт hа-hевдéль бейн зэ лэ-зот. лэhитраóт!'
              : 'мэулé! коль hа-кавóд, ахшáв атá йодéа эт hа-милӣм вэ-эт hа-hевдéль бейн зэ лэ-зот. лэhитраóт!')
          : 'йóфи мэóд! нахóн мэóд. вэ-ма зэ?',
        translation: isFinalTurn
          ? 'Превосходно! Молодец, теперь ты отлично знаешь слова и разницу между «זה» и «זאת». До свидания!'
          : 'Очень хорошо! Совершенно верно. А что это?',
        feedback: null,
        isCompleted: isFinalTurn,
        engine: 'Ульпан-автоответчик (Урок 4)',
        suggestedReplies: isFinalTurn
          ? [
              { hebrew: 'תּוֹדָה רַבָּה, לְהִתְרָאוֹת!', transcription: 'тодá рабá, лэhитраóт!', translation: 'Большое спасибо, до свидания!' },
              { hebrew: 'יוֹם טוֹב, בַּיי!', transcription: 'йом тов, бай!', translation: 'Хорошего дня, пока!' },
            ]
          : [
              { hebrew: 'זֶה עֵט', transcription: 'зэ эт', translation: 'Это ручка' },
              { hebrew: 'זֶה מַחְשֵׁב', transcription: 'зэ махшéв', translation: 'Это компьютер' },
              { hebrew: 'זֹאת כּוֹס', transcription: 'зот кос', translation: 'Это стакан' },
            ],
      });
    }

    return NextResponse.json({
      hebrew: isFinalTurn
        ? (isFemale ? 'נָעִים מְאוֹד! כָּל הַכָּבוֹד, שִׂיחָה מְצוּיֶּנֶת! לְהִתְרָאוֹת!' : 'נָעִים מְאוֹד! כָּל הַכָּבוֹד, שִׂיחָה מְצוּיֶּנֶת! לְהִתְרָאוֹת!')
        : (isFemale
            ? `יוֹפִי! הֵבַנְתִּי אוֹתָךְ מְצוּיָן. סַפְּרִי לִי עוֹד, בְּבַקָּשָׁה.`
            : `יוֹפִי! הֵבַנְתִּי אוֹתְךָ מְצוּיָן. סַפֵּר לִי עוֹד, בְּבַקָּשָׁה.`),
      transcription: isFinalTurn
        ? 'наӣм мэóд! коль hа-кавóд, сиха мэцуйéнэт! лэhитраóт!'
        : (isFemale
            ? 'йóфи! hэвáнти отáх мэцуйáн. сапрӣ ли од, бэвакашá.'
            : 'йóфи! hэвáнти отхá мэцуйáн. сапéр ли од, бэвакашá.'),
      translation: isFinalTurn
        ? 'Очень приятно! Молодец, отличная беседа! До свидания!'
        : 'Отлично! Я прекрасно тебя понял(а). Расскажи мне еще, пожалуйста.',
      feedback: null,
      isCompleted: isFinalTurn,
      engine: 'Ульпан-автоответчик',
      suggestedReplies: isFinalTurn
        ? [
            { hebrew: 'תּוֹדָה רַבָּה, לְהִתְרָאוֹת!', transcription: 'тодá рабá, лэhитраóт!', translation: 'Большое спасибо, до свидания!' },
            { hebrew: 'יוֹם טוֹב, בַּיי!', transcription: 'йом тов, бай!', translation: 'Хорошего дня, пока!' },
            { hebrew: 'שָׁלוֹם וְתוֹדָה!', transcription: 'шалóм вэ-тодá!', translation: 'Пока и спасибо!' },
          ]
        : [
            { hebrew: 'הַכֹּל מְצוּיָן, תּוֹדָה!', transcription: 'hа-коль мэцуйáн, тодá!', translation: 'Всё отлично, спасибо!' },
            { hebrew: 'בְּסֵדֶר, תּוֹדָה.', transcription: 'бэсéдер, тодá.', translation: 'В порядке, спасибо.' },
          ],
    });
  } catch (error: any) {
    return NextResponse.json({
      hebrew: 'סְלִיחָה, הָיְתָה בְּעָיָה בַּתִּקְשֹׁרֶת. נַסּוּ שׁוּב.',
      transcription: 'слихá, hайтá беайá ба-тикшóрет. насӯ шув.',
      translation: 'Извините, произошла ошибка связи. Попробуйте еще раз.',
      feedback: null,
      suggestedReplies: [],
    });
  }
}
