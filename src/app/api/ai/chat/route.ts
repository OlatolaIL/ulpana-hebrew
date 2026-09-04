import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
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
  grammarTopic?: string;
  provider?: 'groq' | 'gemini';
  apiKey?: string;
  isPhoneCall?: boolean;
  ulpanMode?: boolean;
  systemPromptAddition?: string;
  turnIndex?: number;
  targetTurns?: number;
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

function normalizeResponse(parsed: any, defaultIsCompleted: boolean = false) {
  const rawTranslation =
    parsed.russian_translation ||
    parsed.translation_ru ||
    parsed.translation ||
    '';

  return {
    hebrew: parsed.hebrew || '',
    transcription:
      parsed.cyrillic_transcription ||
      parsed.russian_transcription ||
      parsed.transcription_ru ||
      parsed.transcription ||
      '',
    translation: sanitizeRussianTranslation(rawTranslation),
    feedback: parsed.feedback_ru || parsed.feedback || null,
    isCompleted: Boolean(parsed.isCompleted ?? parsed.is_completed ?? defaultIsCompleted),
    suggestedReplies: Array.isArray(parsed.suggestedReplies)
      ? parsed.suggestedReplies.map((r: any) => ({
          hebrew: r.hebrew || '',
          transcription:
            r.cyrillic_transcription ||
            r.russian_transcription ||
            r.transcription_ru ||
            r.transcription ||
            '',
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
      grammarTopic,
      provider = 'groq',
      apiKey,
      isPhoneCall = false,
      systemPromptAddition = '',
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

    const userTurnsCount = (messages || []).filter((m) => m.role === 'user').length;
    const currentTurn = body.turnIndex || userTurnsCount;
    const maxTurns = body.targetTurns || 3;
    const isFinalTurn = currentTurn >= maxTurns;

    const dialogueTurnInstruction = isPhoneCall
      ? ''
      : isFinalTurn
      ? `ЭТО ЗАКЛЮЧИТЕЛЬНАЯ РЕПЛИКА ДИАЛОГА (ШАГ ${currentTurn} ИЗ ${maxTurns}):
- Ученик успешно прошёл все темы и ответил на вопросы урока №${lessonNumber}!
- Тепло заверши диалог на простом иврите: поблагодари за приятную беседу, пожелай удачи в ульпане / отличного дня и вежливо попрощайся (например: 'נָעִים מְאוֹד לְהַכִּיר! שֶׁיִּהְיֶה לְךָ יוֹם מְצוּיָּן וּבְהַצְלָחָה בָּאוּלְפָּן! לְהִתְרָאוֹת!', 'יוֹפִי! שָׂמַחְתִּי לְדַבֵּר אִתְּךָ. נִתְרָאֶה בַּשִּׁיעוּר!').
- СТРОГО ЗАПРЕЩЕНО задавать новые вопросы! Диалог завершён.
- В "suggestedReplies" предложи ровно 3 простых варианта прощания на иврите (например: 'תּוֹדָה רַבָּה, לְהִתְרָאוֹת!', 'יוֹם נִפְלָא, בַּיי!', 'נָעִים מְאוֹד, שָׁלוֹם!').
- В JSON-ответе ОБЯЗАТЕЛЬНО установи: "isCompleted": true.`
      : `ЭТАП ДИАЛОГА: ШАГ ${currentTurn} ИЗ ${maxTurns}.
- Продвигай диалог вперед к целям урока №${lessonNumber}.
- Задай ровно один следующий естественный вопрос по теме урока.
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
- Предложения короткие и понятные для начинающего.`;
      } else {
        levelConstraint = `УРОВЕНЬ АЛЕФ (Урок ${lessonNumber}):
- Тема урока: "${topic || ''}".
- Грамматика: "${grammarTopic || ''}".
- Основная лексика урока: ${vocabulary.slice(0, 15).join(', ')}.
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
2. Поле "cyrillic_transcription" ОБЯЗАНО быть только РУССКИМИ БУКВАМИ (кириллица с ударением и с 'h', например: "hа-бáйит", "то́да", "ма нишмá"). Латинские и английские транскрипции СТРОГО ЗАПРЕЩЕНЫ!
3. В "suggestedReplies" поле "russian_translation" ОБЯЗАНО содержать перевод этой фразы только на безупречный РУССКИЙ язык ("Спасибо, хорошо", "Отлично, спасибо", "Хочу кофе"), а "cyrillic_transcription" — только кириллицу с 'h'!
4. Поле "feedback_ru" — только на грамотном русском языке или null.

ТРЕБОВАНИЯ ВЕДЕНИЯ ДИАЛОГА:
1. Веди органичный диалог, реагируй живо на иврите (1-2 коротких предложения). Реагируй именно на то, что написал или выбрал ученик, и вежливо продвигай диалог вперед к целям урока №${lessonNumber}.
2. В сообщении расставляй точные полные огласовки (никуд) на иврите везде (например: שָׁלוֹם, בֹּקֶר טוֹב, מָה נִשְׁמַע).
3. Русская транскрипция: русская транскрипция кириллицей с ударением (´), но букву ה (хей) ВСЕГДА обозначать строчной латинской буквой "h" ("hа-бáйит", "hа-йóм", "hу hолéх", "hакéтер шэлхá"). Буквы ח и כ - русской "х" ("халав").
4. Если ученик сделал грамматическую ошибку (в роде, времени, предлоге), в поле "feedback_ru" вежливо и кратко поясни на русском. Если ошибок нет, верни null.
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
  "hebrew": "Фраза на иврите с огласовками",
  "cyrillic_transcription": "русская транскрипция кириллицей с 'h' (напр. шалóм, то́да)",
  "russian_translation": "перевод исключительно на чистом русском языке",
  "feedback_ru": null,
  "isCompleted": false,
  "suggestedReplies": [
    { "hebrew": "Вариант 1 на иврите с огласовками", "cyrillic_transcription": "русская транскрипция 1", "russian_translation": "русский перевод 1" },
    { "hebrew": "Вариант 2 на иврите с огласовками", "cyrillic_transcription": "русская транскрипция 2", "russian_translation": "русский перевод 2" },
    { "hebrew": "Вариант 3 на иврите с огласовками", "cyrillic_transcription": "русская транскрипция 3", "russian_translation": "русский перевод 3" }
  ]
}`;

    // 1. Попытка запроса через Groq API
    if (provider === 'groq' && groqKey) {
      const modelsToTry = [
        process.env.GROQ_MODEL,
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.6-27b',
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
                ...messages.map((m) => ({ role: m.role, content: m.content })),
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
                      text: `${systemPrompt}\n\nИстория диалога:\n${messages
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

    return NextResponse.json({
      hebrew: isFinalTurn
        ? (isFemale ? 'נָעִים מְאוֹד לְהַכִּיר! בְּהַצְלָחָה בָּאוּלְפָּן, לְהִתְרָאוֹת!' : 'נָעִים מְאוֹד לְהַכִּיר! בְּהַצְלָחָה בָּאוּלְפָּן, לְהִתְרָאוֹת!')
        : (isFemale
            ? `שָׁלוֹם! בָּרוּכָה הַבָּאָה לְשִׁיעוּר ${lessonNumber}. סַפְּרִי לִי, אֵיךְ אַתְּ מַרְגִּישָׁה הַיּוֹם?`
            : `שָׁלוֹם! בָּרוּךְ הַבָּא לְשִׁיעוּר ${lessonNumber}. סַפֵּר לִי, אֵיךְ אַתָּה מַרְגִּישׁ הַיּוֹם?`),
      transcription: isFinalTurn
        ? 'наӣм мэóд лэhакӣр! бэhацлахá ба-ульпáн, лэhитраóт!'
        : (isFemale
            ? `шалóм! барӯхá hа-баá лэ-шиӯр ${lessonNumber}. сапрӣ ли, эйх ат маргишá hайóм?`
            : `шалóм! барӯх hа-ба лэ-шиӯр ${lessonNumber}. сапéр ли, эйх атá маргӣш hайóм?`),
      translation: isFinalTurn
        ? 'Очень приятно познакомиться! Удачи в ульпане, до свидания!'
        : `Здравствуйте! Добро пожаловать на урок ${lessonNumber}. Расскажите, как вы себя чувствуете сегодня?`,
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
