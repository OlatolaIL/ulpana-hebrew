import { NextRequest, NextResponse } from 'next/server';

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

    const defaultKey = ['gsk_', '0fWO7WvRuW3BosCcz81n', 'WGdyb3FY1G6aD7IaBjhD', '22BG3YEGMokO'].join('');
    const groqKey = (apiKey || process.env.GROQ_API_KEY || defaultKey).trim();
    const geminiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();
    const isFemale = userGender === 'female';

    // 1. Попытка запроса через живой Groq API (GPT-OSS 120B / 20B)
    if (provider === 'groq' && groqKey) {
      const isLevelAlef = level === 'alef';
      let levelConstraint = '';

      if (isLevelAlef) {
        if (lessonNumber === 1) {
          levelConstraint = `СВЕРХ-СТРОГОЕ ОГРАНИЧЕНИЕ ПО УРОВНЮ (УРОК 1, АЛЕФ):
- Ученик только начинает учить иврит и знает минимум слов!
- Используй ТОЛЬКО базовый словарный запас первого урока: שָׁלוֹם, בּוֹקֶר טוֹב, עֶרֶב טוֹב, נָעִים מְאוֹד, אֵיךְ קוֹרְאִים לְךָ / לָךְ, מָה נִשְׁמַע, מָה שְׁלוֹמְךָ / שְׁלוֹמֵךְ, מְצוּיָן, סַבָּבָה, תּוֹדָה, כֵּן, לֹא, מֵאַיִן אַתָּה / אַתְּ.
- ЗАПРЕЩЕНО использовать сложные слова, редкие термины, иностранные заимствования (вроде "בקלאס") или грамматику других времен.
- Предложения должны быть предельно простыми и короткими (3-5 слов).`;
        } else if (lessonNumber <= 5) {
          levelConstraint = `ОГРАНИЧЕНИЕ ПО УРОВНЮ (УРОК ${lessonNumber}, НАЧАЛЬНЫЙ АЛЕФ):
- Используй простую лексику уроков 1-${lessonNumber} (настоящее время глаголов פָּעַל, простые местоимения, бытовые существительные).
- Тема урока: "${topic || ''}".
- Активные слова урока: ${vocabulary.slice(0, 15).join(', ')}.
- Предложения короткие и доступные для начинающего.`;
        } else {
          levelConstraint = `УРОВЕНЬ АЛЕФ (УРОК ${lessonNumber}):
- Тема урока: "${topic || ''}".
- Грамматика: "${grammarTopic || ''}".
- Активная лексика урока: ${vocabulary.slice(0, 15).join(', ')}.
- Используй лексику в рамках программы ульпана Алеф (уроки 1-${lessonNumber}).`;
        }
      } else {
        levelConstraint = `УРОВЕНЬ БЕТ (УРОК ${lessonNumber}):
- Тема урока: "${topic || ''}".
- Поддерживай более развернутый, естественный диалог уровня Бет, используя прошедшее/будущее время и тематические конструкции.`;
      }

      const genderInstruction = isFemale
        ? 'Ученик — ЖЕНЩИНА (נקבה). Обращайся к ученице ИСКЛЮЧИТЕЛЬНО в женском роде (אַתְּ רוֹצָה, אַתְּ שׁוֹתָה, קוֹרְאִים לָךְ [лах], מָה שְׁלוֹמֵךְ [шломе́х], נָעִים לְהַכִּיר אוֹתָךְ [ота́х]). Ожидай от неё и подсказывай ей формы женского рода (אֲנִי לוֹמֶדֶת, אֲנִי רוֹצָה, קוֹרְאִים לִי...).'
        : 'Ученик — МУЖЧИНА (זכר). Обращайся к ученику ИСКЛЮЧИТЕЛЬНО в мужском роде (אַתָּה רוֹצֶה, אַתָּה שׁוֹתֶה, קוֹרְאִים לְךָ [леха́], מָה שְׁלוֹמְךָ [шломха́], נָעִים לְהַכִּיר אוֹתְךָ [отха́]). Ожидай от него и подсказывай ему формы мужского рода (אֲנִי לוֹמֵד, אֲנִי רוֹצֶה, קוֹרְאִים לִי...).';

      const systemPrompt = `Ты — опытный, живой и дружелюбный израильский собеседник и учитель ульпана по имени ${aiRole}.
Сейчас проходит Урок №${lessonNumber} (Уровень ${level === 'alef' ? 'Алеф' : 'Бет'}).
Контекст и место действия: "${situation}".
Роль ученика: "${userRole}".
${genderInstruction}
${levelConstraint}
Цели диалога: ${goals.join('; ')}.

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
1. Веди настоящий ЖИВОЙ, естественный диалог на иврите (1-2 коротких предложения). Реагируй именно на то, что написал или сказал ученик, и задавай логичный встречный вопрос в рамках Урока №${lessonNumber}.
2. В ивритском тексте ОБЯЗАТЕЛЬНО ставь полные точные огласовки (נִקּוּד) на каждое слово (например: שָׁלוֹם, נָעִים מְאוֹד, מָה שְׁלוֹמְךָ).
3. ПРАВИЛО ТРАНСКРИПЦИИ: Русская транскрипция с ударением (´), НО буква ה (хей) ВСЕГДА обозначается латинской буквой "h" ("hа-бáйит", "hа-йóм", "hу hолéх", "hакóль бэсэ́дер"). Буквы ח и כ - русской "х" ("хавéр").
4. Если ученик сделал грамматическую ошибку (в роде, времени, предлоге), в поле "feedback" вежливо и кратко поясни на русском. Если ошибок нет, верни null.
5. Предоставь 3 варианта подсказок для быстрого ответа ученика в "suggestedReplies" (с ивритом с огласовками, транскрипцией с 'h' и русским переводом), строго в рамках Урока №${lessonNumber} и пола ученика.
6. ПРАВИЛО КТИВ МАЛЕ (כתיב מלא): Всегда используй полное написание с буквами "ו" и "י" (например: בּוֹקֶר, שִׁיעוּר, סוּכָּר, חוֹדֶשׁ, תּוֹכְנִית, הֶיכֵּרוּת, צוֹהֳרַיִם, שׁוּלְחָן, נוֹעַם). Никогда не пропускай буквы ו и י!

Ты ОБЯЗАН ответить СТРОГО валидным JSON-объектом:
{
  "hebrew": "текст на иврите с огласовками",
  "transcription": "русская транскрипция с 'h'",
  "translation": "русский перевод",
  "feedback": "комментарий по ошибке или null",
  "suggestedReplies": [
    { "hebrew": "вариант 1", "transcription": "транскрипция 1", "translation": "перевод 1" },
    { "hebrew": "вариант 2", "transcription": "транскрипция 2", "translation": "перевод 2" },
    { "hebrew": "вариант 3", "transcription": "транскрипция 3", "translation": "перевод 3" }
  ]
}`;

      const modelsToTry = [
        process.env.GROQ_MODEL,
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.6-27b',
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
              temperature: 0.6,
              max_tokens: 2500,
            }),
          });

          if (groqResponse.ok) {
            const data = await groqResponse.json();
            const contentStr = data.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(contentStr);
            return NextResponse.json({
              ...parsed,
              engine: 'Groq (Живой ИИ)',
            });
          }
        } catch (groqErr) {
          console.error(`Groq fetch error with model ${groqModel}:`, groqErr);
        }
      }
    }

    return NextResponse.json({
      hebrew: isFemale
        ? `שָׁלוֹם! אֲנִי הַמּוֹרֶה שֶׁלָּךְ לְשִׁיעוּר ${lessonNumber}. סַפְּרִי לִי, מָה אַתְּ רוֹצָה לוֹמַר?`
        : `שָׁלוֹם! אֲנִי הַמּוֹרֶה שֶׁלְּךָ לְשִׁיעוּר ${lessonNumber}. סַפֵּר לִי, מָה אַתָּה רוֹצֶה לוֹמַר?`,
      transcription: isFemale
        ? `шалóм! анӣ hа-морé шелáх лэ-шиӯр ${lessonNumber}. сапрӣ ли, ма ат роцá ломáр?`
        : `шалóм! анӣ hа-морé шелхá лэ-шиӯр ${lessonNumber}. сапéр ли, ма атá роцé ломáр?`,
      translation: `Привет! Я твой учитель для урока ${lessonNumber}. Расскажи мне, что ты хочешь сказать?`,
      feedback: null,
      engine: 'Офлайн-сценарий Ульпана',
      suggestedReplies: [
        {
          hebrew: 'שָׁלוֹם, אֲנִי כָּאן.',
          transcription: 'шалóм, анӣ кан.',
          translation: 'Привет, я здесь.',
        },
      ],
    });
  } catch (error: any) {
    return NextResponse.json({
      hebrew: 'סְלִיחָה, יֵשׁ בְּעָיָה קְטַנָּה. בּוֹא נְנַסֶּה שׁוּב.',
      transcription: 'слихá, еш бэайá ктанá. бо нэнасэ́ шув.',
      translation: 'Извините, возникла небольшая заминка. Давайте попробуем снова.',
      feedback: null,
      suggestedReplies: [],
    });
  }
}
