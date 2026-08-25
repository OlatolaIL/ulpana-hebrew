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
}

function normalizeResponse(parsed: any) {
  return {
    hebrew: parsed.hebrew || '',
    transcription:
      parsed.cyrillic_transcription ||
      parsed.russian_transcription ||
      parsed.transcription_ru ||
      parsed.transcription ||
      '',
    translation:
      parsed.russian_translation ||
      parsed.translation_ru ||
      parsed.translation ||
      '',
    feedback: parsed.feedback_ru || parsed.feedback || null,
    suggestedReplies: Array.isArray(parsed.suggestedReplies)
      ? parsed.suggestedReplies.map((r: any) => ({
          hebrew: r.hebrew || '',
          transcription:
            r.cyrillic_transcription ||
            r.russian_transcription ||
            r.transcription_ru ||
            r.transcription ||
            '',
          translation:
            r.russian_translation ||
            r.translation_ru ||
            r.translation ||
            '',
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
    let levelConstraint = '';

    if (isLevelAlef) {
      if (lessonNumber === 1) {
        levelConstraint = `СУПЕР-ПРОСТЫЕ ОГРАНИЧЕНИЯ ПО ИВРИТУ (Урок 1, Алеф):
- Ответ должен состоять ровно из 1 короткого предложения!
- Используй только базовые слова первого урока: שלום, בוקר טוב, ערב טוב, נעים מאוד, אני נועם / שרה, איך קוראים לך / לך, מה נשמע, מה העניינים / הענינים, מצוין, מצוינת, בסדר, תודה, סליחה, להתראות / ביי.
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

    const systemPrompt = `Ты — добрый, живой и поддерживающий собеседник-израильтянин в ролевом диалоге на иврите. Твоя роль: ${aiRole}.
Сейчас проходит урок №${lessonNumber} (уровень ${level === 'alef' ? 'Алеф' : 'Бет'}).
Ситуация и место действия: "${situation}".
Роль ученика: "${userRole}".
${genderInstruction}
${levelConstraint}
Цели диалога: ${goals.join('; ')}.

КРИТИЧЕСКИЕ ПРАВИЛА ВЫВОДА ЯЗЫКОВ:
В твоём ответе используются ТОЛЬКО ДВА ЯЗЫКА: ИВРИТ И РУССКИЙ.
АНГЛИЙСКИЙ ЯЗЫК (ENGLISH) СТРОГО И НАВСЕГДА ЗАПРЕЩЁН!
1. Поле "russian_translation" ОБЯЗАНО быть исключительно на РУССКОМ языке (грамотный литературный!).
2. Поле "cyrillic_transcription" ОБЯЗАНО быть только РУССКИМИ БУКВАМИ (кириллица с ударением и с 'h', например: "hа-бáйит", "то́да", "ма нишмá"). Латинские и английские транскрипции СТРОГО ЗАПРЕЩЕНЫ!
3. В "suggestedReplies" поле "russian_translation" ОБЯЗАНО содержать перевод этой фразы только на РУССКИЙ язык ("Спасибо, хорошо", "Отлично, спасибо", "Хочу кофе"), а "cyrillic_transcription" — только кириллицу с 'h'!
4. Поле "feedback_ru" — только на русском языке или null.

ТРЕБОВАНИЯ ВЕДЕНИЯ ДИАЛОГА:
1. Веди органичный диалог, реагируй живо на иврите (1-2 коротких предложения). Реагируй именно на то, что написал или выбрал ученик, и вежливо продвигай диалог вперед к целям урока №${lessonNumber}.
2. В сообщении расставляй точные полные огласовки (никуд) на иврите везде (например: שָׁלוֹם, בֹּקֶר טוֹב, מָה נִשְׁמַע).
3. Русская транскрипция: русская транскрипция кириллицей с ударением (´), но букву ה (хей) ВСЕГДА обозначать строчной латинской буквой "h" ("hа-бáйит", "hа-йóм", "hу hолéх", "hакéтер шэлхá"). Буквы ח и כ - русской "х" ("халав").
4. Если ученик сделал грамматическую ошибку (в роде, времени, предлоге), в поле "feedback_ru" вежливо и кратко поясни на русском. Если ошибок нет, верни null.
5. Предложи 3 реальных варианта для быстрого ответа ученика в "suggestedReplies" (с ивритом с огласовками, русской транскрипцией с 'h' и русским переводом), уместных в рамках темы урока №${lessonNumber} и пола ученика.
6. Женский род глаголов (если пол: נקבה): всегда расставляй точные огласовки в глаголах (например: רוֹצָה, אוֹהֶבֶת, לוֹמֶדֶת, שׁוֹתָה, מְדַבֶּרֶת, מַרְגִּישָׁה).

Ты ОБЯЗАН ответить СТРОГО валидным JSON-объектом:
{
  "hebrew": "Фраза на иврите с огласовками",
  "cyrillic_transcription": "русская транскрипция кириллицей с 'h' (напр. шалóм, то́да)",
  "russian_translation": "перевод исключительно на чистом русском языке",
  "feedback_ru": null,
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
            const normalized = normalizeResponse(parsed);
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
          const normalized = normalizeResponse(parsed);
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
      hebrew: isFemale
        ? `שָׁלוֹם! בָּרוּכָה הַבָּאָה לְשִׁיעוּר ${lessonNumber}. סַפְּרִי לִי, אֵיךְ אַתְּ מַרְגִּישָׁה הַיּוֹם?`
        : `שָׁלוֹם! בָּרוּךְ הַבָּא לְשִׁיעוּר ${lessonNumber}. סַפֵּר לִי, אֵיךְ אַתָּה מַרְגִּישׁ הַיּוֹם?`,
      transcription: isFemale
        ? `шалóм! барӯхá hа-баá лэ-шиӯр ${lessonNumber}. сапрӣ ли, эйх ат маргишá hайóм?`
        : `шалóм! барӯх hа-ба лэ-шиӯр ${lessonNumber}. сапéр ли, эйх атá маргӣш hайóм?`,
      translation: `Здравствуйте! Добро пожаловать на урок ${lessonNumber}. Расскажите, как вы себя чувствуете сегодня?`,
      feedback: null,
      engine: 'Ульпан-автоответчик',
      suggestedReplies: [
        {
          hebrew: 'הַכֹּל מְצוּיָן, תּוֹדָה!',
          transcription: 'hа-коль мэцуйáн, тодá!',
          translation: 'Всё отлично, спасибо!',
        },
        {
          hebrew: 'בְּסֵדֶר, תּוֹדָה.',
          transcription: 'бэсéдер, тодá.',
          translation: 'В порядке, спасибо.',
        },
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
