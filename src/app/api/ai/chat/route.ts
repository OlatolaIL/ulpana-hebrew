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

    // 1. Попытка запроса через живой Groq API (Llama 3.3 70B)
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
2. В ивритском тексте ОБЯЗАТЕЛЬНО ставь огласовки (נִקּוּד).
3. ПРАВИЛО ТРАНСКРИПЦИИ: Русская транскрипция с ударением (´), НО буква ה (хей) ВСЕГДА обозначается латинской буквой "h" ("hа-бáйит", "hа-йóм", "hу hолéх", "hакóль бэсэ́дер"). Буквы ח и כ - русской "х" ("хавéр").
4. Если ученик сделал грамматическую ошибку (в роде, времени, предлоге), в поле "feedback" вежливо и кратко поясни на русском. Если ошибок нет, верни null.
5. Предоставь 3 варианта подсказок для быстрого ответа ученика в "suggestedReplies" (с ивритом с огласовками, транскрипцией с 'h' и русским переводом).

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

      try {
        const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
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
            engine: 'Groq Llama 3.3 70B (Живой ИИ)',
          });
        }
      } catch (groqErr) {
        console.error('Groq fetch error:', groqErr);
      }
    }

    // 2. Попытка запроса через Gemini API
    if (geminiKey) {
      try {
        const geminiPrompt = `Ты — израильский учитель Ульпана. Урок ${lessonNumber}. Роль: ${aiRole}. Пол ученика: ${
          isFemale ? 'женский' : 'мужской'
        }. Контекст: ${situation}. Ответь строго JSON {hebrew, transcription (h для ה), translation, feedback, suggestedReplies}. Сообщения: ${JSON.stringify(
          messages
        )}`;

        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: geminiPrompt }] }],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.6,
              },
            }),
          }
        );

        if (geminiResponse.ok) {
          const data = await geminiResponse.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = JSON.parse(text);
          return NextResponse.json({
            ...parsed,
            engine: 'Gemini 2.0 Flash (Живой ИИ)',
          });
        }
      } catch (geminiErr) {
        console.error('Gemini error:', geminiErr);
      }
    }

    // 3. Автономный сценарий (Fallback при отсутствии или ошибке ключа)
    const lastUserMsg = (messages[messages.length - 1]?.content || '').toLowerCase();

    // ==================== УРОК 1 ====================
    if (lessonNumber === 1) {
      if (
        lastUserMsg.includes('רוסיה') ||
        lastUserMsg.includes('ישראל') ||
        lastUserMsg.includes('אוקראינה') ||
        lastUserMsg.includes('צרפת') ||
        lastUserMsg.includes('ארצות')
      ) {
        return NextResponse.json({
          hebrew: isFemale
            ? 'יוֹפִי! כַּמָּה זְמַן אַתְּ כְּבָר לוֹמֶדֶת עִבְרִית?'
            : 'יוֹפִי! כַּמָּה זְמַן אַתָּה כְּבָר לוֹמֵד עִבְרִית?',
          transcription: isFemale
            ? 'йóфи! кáма зман ат квар ломéдет иврӣт?'
            : 'йóфи! кáма зман атá квар ломéд иврӣт?',
          translation: 'Отлично! Сколько времени ты уже учишь иврит?',
          feedback: null,
          engine: 'Офлайн-сценарий Ульпана',
          suggestedReplies: [
            {
              hebrew: isFemale ? 'אֲנִי לוֹמֶדֶת רַק שָׁבוּעַ.' : 'אֲנִי לוֹמֵד רַק שָׁבוּעַ.',
              transcription: isFemale ? 'анӣ ломéдет рак шавӯа.' : 'анӣ ломéд рак шавӯа.',
              translation: 'Я учу только неделю.',
            },
            {
              hebrew: isFemale ? 'אֲנִי מַתְחִילָה עַכְשָׁו.' : 'אֲנִי מַתְחִיל עַכְשָׁו.',
              transcription: isFemale ? 'анӣ матхилá ахшáв.' : 'анӣ матхӣль ахшáв.',
              translation: 'Я начинаю прямо сейчас.',
            },
          ],
        });
      }

      if (
        lastUserMsg.includes('שבוע') ||
        lastUserMsg.includes('מתחיל') ||
        lastUserMsg.includes('חודש')
      ) {
        return NextResponse.json({
          hebrew: isFemale
            ? 'כָּל הַכָּבוֹד! אַתְּ מְדַבֶּרֶת יָפֶה מְאוֹד. שִׁיעוּר רִאשׁוֹן מֻצְלָח!'
            : 'כָּל הַכָּבוֹד! אַתָּה מְדַבֵּר יָפֶה מְאוֹד. שִׁיעוּר רִאשׁוֹן מֻצְלָח!',
          transcription: isFemale
            ? 'коль hа-кавóд! ат мэдабéрет йафэ́ мэóд. шиӯр ришóн муцлáх!'
            : 'коль hа-кавóд! атá мэдабéр йафэ́ мэóд. шиӯр ришóн муцлáх!',
          translation: 'Молодец! Ты очень красиво говоришь. Успешного первого урока!',
          feedback: null,
          engine: 'Офлайн-сценарий Ульпана',
          suggestedReplies: [
            {
              hebrew: 'תוֹדָה רַבָּה, נֹעַם!',
              transcription: 'тодá рабá, Нóам!',
              translation: 'Большое спасибо, Ноам!',
            },
            {
              hebrew: 'לְהִתְרָאוֹת בַּשִּׁעוּר הַבָּא!',
              transcription: 'лэhитраóт ба-шиӯр hабá!',
              translation: 'До встречи на следующем уроке!',
            },
          ],
        });
      }

      if (lastUserMsg.includes('קוראים לי') || lastUserMsg.includes('אני ')) {
        return NextResponse.json({
          hebrew: isFemale
            ? 'נָעִים מְאוֹד! מֵאַיִן אַתְּ בָּעוֹלָם?'
            : 'נָעִים מְאוֹד! מֵאַיִן אַתָּה בָּעוֹלָם?',
          transcription: isFemale
            ? 'наӣм мэóд! мэáйин ат ба-олáм?'
            : 'наӣм мэóд! мэáйин атá ба-олáм?',
          translation: 'Очень приятно! Откуда ты?',
          feedback: null,
          engine: 'Офлайн-сценарий Ульпана',
          suggestedReplies: [
            {
              hebrew: 'אֲנִי מֵרוּסְיָה.',
              transcription: 'анӣ мэ-Рӯсья.',
              translation: 'Я из России.',
            },
            {
              hebrew: 'אֲנִי מִיִּשְׂרָאֵל.',
              transcription: 'анӣ мэ-Исраэ́ль.',
              translation: 'Я из Израиля.',
            },
            {
              hebrew: 'אֲנִי מֵאוּקְרָאִינָה.',
              transcription: 'анӣ мэ-Украӣна.',
              translation: 'Я из Украины.',
            },
          ],
        });
      }
    }

    // ==================== УРОК 2 ====================
    if (lessonNumber === 2) {
      if (lastUserMsg.includes('קפה') || lastUserMsg.includes('תה') || lastUserMsg.includes('מים')) {
        return NextResponse.json({
          hebrew: isFemale
            ? 'מְצוּיָן! אַתְּ רוֹצָה אֶת הַקָּפֶה עִם חָלָב אוֹ עִם סוּכָּר? וְרוֹצָה גַּם עוּגָה?'
            : 'מְצוּיָן! אַתָּה רוֹצֶה אֶת הַקָּפֶה עִם חָלָב אוֹ עִם סוּכָּר? וְרוֹצֶה גַּם עוּגָה?',
          transcription: isFemale
            ? 'мэцуйáн! ат роцá эт hа-кáфэ им халáв о им сукáр? вэ-роцá гам угá?'
            : 'мэцуйáн! атá роцé эт hа-кáфэ им халáв о им сукáр? вэ-роцé гам угá?',
          translation: 'Отлично! Вы хотите кофе с молоком или с сахаром? И хотите также пирожное?',
          feedback: null,
          engine: 'Офлайн-сценарий Ульпана',
          suggestedReplies: [
            {
              hebrew: 'עִם חָלָב, בְּבַקָּשָׁה. וְגַם עוּגָה.',
              transcription: 'им халáв, бэвакашá. вэ-гам угá.',
              translation: 'С молоком, пожалуйста. И также пирожное.',
            },
            {
              hebrew: 'אֶפְשָׁר חֶשְׁבּוֹן, בְּבַקָּשָׁה?',
              transcription: 'эфшáр хэжбóн, бэвакашá?',
              translation: 'Можно счет, пожалуйста?',
            },
          ],
        });
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
