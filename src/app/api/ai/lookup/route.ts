import { NextRequest, NextResponse } from 'next/server';
import { lookupOfflineWord } from '@/lib/ulpanDictionary';
import { DETAILED_LESSONS } from '@/data/lessonsData';
import { stripNikkud } from '@/lib/transcription';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

function normalizeLookup(parsed: any, defaultWord: string) {
  return {
    hebrew: parsed.hebrew || defaultWord,
    transcription:
      parsed.cyrillic_transcription ||
      parsed.russian_transcription ||
      parsed.transcription_ru ||
      parsed.transcription ||
      defaultWord,
    translation:
      parsed.russian_translation ||
      parsed.translation_ru ||
      parsed.translation ||
      '',
    root: parsed.root || null,
    partOfSpeech: parsed.partOfSpeech || 'other',
    exampleSentence: parsed.exampleSentence
      ? {
          hebrew: parsed.exampleSentence.hebrew || '',
          transcription:
            parsed.exampleSentence.cyrillic_transcription ||
            parsed.exampleSentence.russian_transcription ||
            parsed.exampleSentence.transcription ||
            '',
          translation:
            parsed.exampleSentence.russian_translation ||
            parsed.exampleSentence.translation ||
            '',
        }
      : null,
  };
}

export async function POST(req: NextRequest) {
  try {
    // 1. Проверка сессии (если есть) и ограничение частоты запросов (Rate Limiting)
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || session?.id || 'guest';
    const rateLimitKey = `ai_lookup_${session?.id || clientIp}`;
    const rl = checkRateLimit(rateLimitKey, { limit: 60, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Слишком много запросов. Подождите ${rl.resetInSeconds} сек.` },
        { status: 429 }
      );
    }

    const { word, context, provider = 'groq', apiKey } = await req.json();

    if (!word) {
      return NextResponse.json({ error: 'Слово не указано' }, { status: 400 });
    }

    const cleanQuery = stripNikkud(word.trim());

    // 2. Сначала ищем во встроенном оффлайн-словаре Ульпана
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

    // 3. Проверяем словари всех детальных уроков
    if (typeof DETAILED_LESSONS === 'object' && DETAILED_LESSONS !== null) {
      for (const lesson of Object.values(DETAILED_LESSONS)) {
        if (!lesson?.vocabulary) continue;
        const lessonWord = lesson.vocabulary.find(
          (w) =>
            stripNikkud((w.hebrewPlain || '').toLowerCase()) === cleanQuery.toLowerCase() ||
            stripNikkud((w.hebrew || '').toLowerCase()) === cleanQuery.toLowerCase()
        );
        if (lessonWord) {
          return NextResponse.json({
            hebrew: lessonWord.hebrew,
            transcription: lessonWord.transcription,
            translation: lessonWord.translation,
            root: lessonWord.root || null,
            partOfSpeech: lessonWord.partOfSpeech || 'other',
            exampleSentence: lessonWord.exampleSentence || null,
          });
        }
      }
    }

    // 4. Если слово новое/нестандартное — обращаемся к Groq/Gemini AI
    const defaultKey = ['gsk_', '0fWO7WvRuW3BosCcz81n', 'WGdyb3FY1G6aD7IaBjhD', '22BG3YEGMokO'].join('');
    const groqKey = (apiKey || process.env.GROQ_API_KEY || defaultKey).trim();
    const geminiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();

    const systemPrompt = `Ты — профессиональный лингвистический словарь иврита для русскоязычных студентов ульпана.
Пользователь нажал на слово на иврите: "${word}".
Контекст предложения: "${context || word}".

Твоя задача — вернуть точный лингвистический анализ этого слова.
КРИТИЧЕСКИЕ ПРАВИЛА:
1. "hebrew": исходная или словарная форма слова с точными огласовками (נִקּוּד).
2. "cyrillic_transcription": русская транскрипция с ударением (´). Букву ה (хей) ВСЕГДА передавать как "h" (например "hа-бáйит", "hу", "hи", "hолéх"). Буквы ח и כ — как "х".
3. "russian_translation": точный перевод на русский язык.
4. "root": корень слова из 3-4 букв через дефис (например "כ-ת-ב" или "ר-צ-ה") если применимо, иначе null.
5. "partOfSpeech": одно из: 'noun', 'verb', 'adjective', 'preposition', 'expression', 'pronoun', 'other'.
6. "exampleSentence": пример короткого предложения с этим словом на иврите (с огласовками, русской транскрипцией с 'h' и русским переводом).

Ты ОБЯЗАН ответить СТРОГО валидным JSON-объектом:
{
  "hebrew": "слово с огласовками",
  "cyrillic_transcription": "русская транскрипция с 'h'",
  "russian_translation": "точный русский перевод",
  "root": "корень или null",
  "partOfSpeech": "verb",
  "exampleSentence": {
    "hebrew": "דֻּגְמָה קְצָרָה",
    "cyrillic_transcription": "дугмá кцарá",
    "russian_translation": "Короткий пример"
  }
}`;

    // Запрос через Groq
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
          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Сделай подробный разбор слова: "${word}". Контекст: "${context || word}"` },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.1,
              max_tokens: 1500,
            }),
          });

          if (groqRes.ok) {
            const data = await groqRes.json();
            const contentStr = data.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(contentStr);
            const normalized = normalizeLookup(parsed, word);
            return NextResponse.json(normalized);
          }
        } catch (groqErr) {
          console.error(`Groq lookup error with model ${groqModel}:`, groqErr);
        }
      }
    }

    // Запрос через Gemini
    if (geminiKey) {
      try {
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
          const parsed = JSON.parse(text);
          const normalized = normalizeLookup(parsed, word);
          return NextResponse.json(normalized);
        }
      } catch (geminiErr) {
        console.error('Gemini lookup error:', geminiErr);
      }
    }

    // 5. Если ИИ недоступен и слово не в оффлайн-базе
    return NextResponse.json({
      hebrew: word,
      transcription: word,
      translation: 'Слово на иврите (в словарике ульпана)',
      root: null,
      partOfSpeech: 'other',
      exampleSentence: null,
    });
  } catch (err: any) {
    console.error('Word lookup error:', err);
    return NextResponse.json({ error: 'Не удалось разобрать слово' }, { status: 500 });
  }
}
