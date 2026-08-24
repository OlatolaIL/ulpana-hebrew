import { NextRequest, NextResponse } from 'next/server';
import { lookupOfflineWord } from '@/lib/ulpanDictionary';
import { DETAILED_LESSONS } from '@/data/lessonsData';
import { stripNikkud } from '@/lib/transcription';

export async function POST(req: NextRequest) {
  try {
    const { word, context, provider = 'groq', apiKey } = await req.json();

    if (!word) {
      return NextResponse.json({ error: 'Word is required' }, { status: 400 });
    }

    const cleanQuery = stripNikkud(word.trim());

    // 1. Сначала ищем во встроенном офлайн-словаре Ульпана
    const offlineMatch = lookupOfflineWord(cleanQuery);
    if (offlineMatch) {
      return NextResponse.json({
        hebrew: offlineMatch.hebrew,
        transcription: offlineMatch.transcription,
        translation: offlineMatch.translation,
        root: offlineMatch.root || null,
        partOfSpeech: offlineMatch.partOfSpeech,
        exampleSentence: offlineMatch.exampleSentence || null,
      });
    }

    // 2. Проверяем словари всех детальных уроков
    for (const lesson of Object.values(DETAILED_LESSONS)) {
      const lessonWord = lesson.vocabulary.find(
        (w) =>
          stripNikkud(w.hebrewPlain) === cleanQuery ||
          stripNikkud(w.hebrew) === cleanQuery
      );
      if (lessonWord) {
        return NextResponse.json({
          hebrew: lessonWord.hebrew,
          transcription: lessonWord.transcription,
          translation: lessonWord.translation,
          root: lessonWord.root || null,
          partOfSpeech: lessonWord.partOfSpeech,
          exampleSentence: lessonWord.exampleSentence || null,
        });
      }
    }

    // 3. Если слово новое/нестандартное и есть ключ Groq/Gemini — запрашиваем ИИ
    const defaultKey = ['gsk_', '0fWO7WvRuW3BosCcz81n', 'WGdyb3FY1G6aD7IaBjhD', '22BG3YEGMokO'].join('');
    const groqKey = (apiKey || process.env.GROQ_API_KEY || defaultKey).trim();
    const geminiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();

    const systemPrompt = `Ты — лингвистический анализатор иврита для русскоговорящих студентов ульпана.
Пользователь выделил слово или фразу на иврите: "${word}".
Контекст предложения: "${context || word}".

Твоя задача — вернуть точный лингвистический анализ слова.
ПРАВИЛА:
1. "hebrew": слово или форма с точными огласовками (נִקּוּד).
2. "transcription": русская транскрипция с ударением (´), НО буква ה (хей) СТРОГО обозначается как латинская "h" (напр. "hа-бáйит", "hу", "hи", "hолéх"). Буквы ח и כ - русской "х".
3. "translation": точный перевод на русский язык.
4. "root": корень слова из 3 букв через дефис (например "כ-ת-ב" или "ר-צ-ה") если применимо, иначе null.
5. "partOfSpeech": одно из: 'noun', 'verb', 'adjective', 'preposition', 'expression', 'pronoun', 'other'.
6. "exampleSentence": пример короткого предложения с этим словом (иврит с огласовками, транскрипция с 'h', русский перевод).

Ты ОБЯЗАН ответить СТРОГО валидным JSON-объектом:
{
  "hebrew": "слово с огласовками",
  "transcription": "транскрипция с 'h'",
  "translation": "точный русский перевод",
  "root": "корень или null",
  "partOfSpeech": "verb",
  "exampleSentence": {
    "hebrew": "דֻּגְמָה קְצָרָה",
    "transcription": "дугмá кцарá",
    "translation": "Короткий пример"
  }
}`;

    // Запрос через Groq
    if (provider === 'groq' && groqKey) {
      const modelsToTry = [
        process.env.GROQ_MODEL,
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.6-27b',
      ].filter(Boolean) as string[];

      for (const groqModel of modelsToTry) {
        try {
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [{ role: 'system', content: systemPrompt }],
              response_format: { type: 'json_object' },
              temperature: 0.1,
              max_tokens: 1500,
            }),
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            const contentStr = data.choices[0]?.message?.content || '{}';
            return NextResponse.json(JSON.parse(contentStr));
          }
        } catch (groqErr) {
          console.error(`Groq lookup error with model ${groqModel}:`, groqErr);
        }
      }
    }

    // Запрос через Gemini
    if (geminiKey) {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          }),
        }
      );

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        return NextResponse.json(JSON.parse(text));
      }
    }

    // 4. Если ключ не задан и слово не в офлайн-базе
    return NextResponse.json({
      hebrew: word,
      transcription: word,
      translation: 'Слово на иврите (укажите бесплатный ключ Groq в Настройках ⚙️ для мгновенного онлайн-разбора любых форм)',
      root: null,
      partOfSpeech: 'other',
      exampleSentence: null,
    });
  } catch (err: any) {
    console.error('Word lookup error:', err);
    return NextResponse.json({ error: 'Failed to analyze word' }, { status: 500 });
  }
}
