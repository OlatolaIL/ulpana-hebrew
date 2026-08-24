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
      provider = 'groq',
      apiKey,
    } = body;

    const groqKey = (apiKey || process.env.GROQ_API_KEY || '').trim();
    const geminiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();
    const isFemale = userGender === 'female';

    // 1. Попытка запроса через живой Groq API (GPT-OSS 120B / 20B)
    if (provider === 'groq' && groqKey) {
      const genderInstruction = isFemale
        ? 'Ученик — ЖЕНЩИНА (נקבה). Обращайся исключительно в женском роде (את רוצה, את שותה, לך, אותך). Ожидай от нее форм женского рода.'
        : 'Ученик — МУЖЧИНА (זכר). Обращайся исключительно в мужском роде (אתה רוצה, אתה שותה, לך, אותך).';

      const systemPrompt = `Ты — опытный, живой и дружелюбный израильский собеседник и учитель ульпана по имени ${aiRole}.
Сейчас проходит Урок №${lessonNumber} (Уровень ${level === 'alef' ? 'Алеф' : 'Бет'}).
Контекст и место действия: "${situation}".
Роль ученика: "${userRole}".
${genderInstruction}
Цели диалога: ${goals.join('; ')}.

КРИТИЧЕСКИ ВАЖНЫЕ ПРАВИЛА:
1. Веди настоящий ЖИВОЙ, естественный диалог на иврите (1-2 коротких предложения). Реагируй именно на то, что написал или сказал ученик, и задавай логичный встречный вопрос.
2. В ивритском тексте ОБЯЗАТЕЛЬНО ставь полные точные огласовки (נִקּוּד) на каждое слово (например: שָׁלוֹם, סַפְּרִי לִי, מָה אַתְּ רוֹצָה, שִׁיעוּר).
3. ПРАВИЛО ТРАНСКРИПЦИИ: Русская транскрипция с ударением (´), НО буква ה (хей) ВСЕГДА обозначается латинской буквой "h" ("hа-бáйит", "hа-йóм", "hу hолéх", "hакóль бэсэ́дер"). Буквы ח и כ - русской "х" ("хавéр").
4. Если ученик сделал грамматическую ошибку (в роде, времени, предлоге), в поле "feedback" вежливо и кратко поясни на русском. Если ошибок нет, верни null.
5. Предоставь 3 варианта подсказок для быстрого ответа ученика в "suggestedReplies" (с ивритом с огласовками, транскрипцией с 'h' и русским переводом).
6. ПРАВИЛО КТИВ МАЛЕ (כתיב מלא): Всегда используй полное написание с буквами "ו" и "י" (например: בּוֹקֶר, שִׁיעוּר, סוּכָּר, חוֹדֶשׁ, תּוֹכְנִית, הֶיכֵּרוּת, צוֹהֳרַיִם, שׁוּלְחָן, נוֹעַם). Никогда не пропускай буквы ו и י!

ФОРМАТ СТРОГО JSON:
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
              max_tokens: 800,
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
