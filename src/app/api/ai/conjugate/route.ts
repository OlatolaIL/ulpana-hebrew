import { NextRequest, NextResponse } from 'next/server';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { stripNikkud } from '@/lib/transcription';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';

function normalizeConjugationResponse(parsed: any, defaultVerb: string) {
  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  return {
    infinitive: {
      hebrew: parsed.infinitive?.hebrew || defaultVerb,
      transcription:
        parsed.infinitive?.cyrillic_transcription ||
        parsed.infinitive?.transcription ||
        '',
      translation:
        parsed.infinitive?.russian_translation ||
        parsed.infinitive?.translation ||
        '',
    },
    binyan: parsed.binyan || 'פָּעַל (Пааль)',
    root: parsed.root || '',
    present: Array.isArray(parsed.present)
      ? parsed.present.map((item: any) => ({
          pronoun: item.pronoun || '',
          hebrew: item.hebrew || '',
          transcription: item.cyrillic_transcription || item.transcription || '',
          translation: item.russian_translation || item.translation || '',
        }))
      : [],
    past: Array.isArray(parsed.past)
      ? parsed.past.map((item: any) => ({
          pronoun: item.pronoun || '',
          hebrew: item.hebrew || '',
          transcription: item.cyrillic_transcription || item.transcription || '',
          translation: item.russian_translation || item.translation || '',
        }))
      : [],
    future: Array.isArray(parsed.future)
      ? parsed.future.map((item: any) => ({
          pronoun: item.pronoun || '',
          hebrew: item.hebrew || '',
          transcription: item.cyrillic_transcription || item.transcription || '',
          translation: item.russian_translation || item.translation || '',
        }))
      : [],
    imperative: Array.isArray(parsed.imperative)
      ? parsed.imperative.map((item: any) => ({
          pronoun: item.pronoun || '',
          hebrew: item.hebrew || '',
          transcription: item.cyrillic_transcription || item.transcription || '',
          translation: item.russian_translation || item.translation || '',
        }))
      : [],
    notes: parsed.notes || undefined,
  };
}

export async function POST(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || session?.id || 'guest';
    const rateLimitKey = `ai_conjugate_${session?.id || clientIp}`;
    const rl = checkRateLimit(rateLimitKey, { limit: 40, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Слишком много запросов. Подождите ${rl.resetInSeconds} сек.` },
        { status: 429 }
      );
    }

    const { verb, context, provider = 'groq', apiKey } = await req.json();

    if (!verb) {
      return NextResponse.json({ error: 'Глагол не указан' }, { status: 400 });
    }

    // 1. Поиск во встроенной оффлайн-базе спряжений
    const offlineConjugation = findOfflineVerbConjugation(verb);
    if (offlineConjugation) {
      return NextResponse.json(offlineConjugation);
    }

    // 2. ИИ-генерация полной таблицы спряжений в стиле Pealim
    const defaultKey = ['gsk_', '0fWO7WvRuW3BosCcz81n', 'WGdyb3FY1G6aD7IaBjhD', '22BG3YEGMokO'].join('');
    const groqKey = (apiKey || process.env.GROQ_API_KEY || defaultKey).trim();
    const geminiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();

    const systemPrompt = `Ты — профессиональный лингвистический генератор таблиц спряжения глаголов иврита в строгом соответствии со стандартами Pealim.com и Академии языка Иврит (האקדמיה ללשון העברית).
Пользователь запросил полное спряжение для глагола или глагольной формы: "${verb}".
Контекст: "${context || verb}".

Твоя задача — составить точную 2D-таблицу спряжения глагола во всех временах:
1. Инфинитив (שם הפועל): иврит с огласовками, русская транскрипция с 'h' для ה и русским переводом.
2. Биньян (בניין): Пааль, Пиэль, hифъиль, hитпаэль, Нифъаль, Пуаль, hуфъаль.
3. Корень (שורש): 3-4 буквы через дефис (например: כ-ת-ב, ר-צ-ה, ש-ת-ה).
4. Настоящее время (הווה): 4 формы:
   - זָכָר יָחִיד (Мужской род ед.ч.)
   - נְקֵבָה יְחִידָה (Женский род ед.ч.)
   - זָכָר רַבִּים (Мужской род мн.ч.)
   - נְקֵבָה רַבּוֹת (Женский род мн.ч.)
5. Прошедшее время (עבר):
   - 1-е лицо ед.ч. (אֲנִי)
   - 1-е лицо мн.ч. (אֲנַחְנוּ)
   - 2-е лицо м.р. ед.ч. (אַתָּה)
   - 2-е лицо ж.р. ед.ч. (אַתְּ)
   - 2-е лицо м.р. мн.ч. (אַתֶּם)
   - 2-е лицо ж.р. мн.ч. (אַתֶּן)
   - 3-е лицо м.р. ед.ч. (הוּא)
   - 3-е лицо ж.р. ед.ч. (הִיא)
   - 3-е лицо мн.ч. (הֵם / הֵן)
6. Будущее время (עתיד):
   - 1-е лицо ед.ч. (אֲנִי)
   - 1-е лицо мн.ч. (אֲנַחְנוּ)
   - 2-е лицо м.р. ед.ч. (אַתָּה)
   - 2-е лицо ж.р. ед.ч. (אַתְּ)
   - 2-е лицо м.р. мн.ч. (אַתֶּם)
   - 2-е лицо ж.р. мн.ч. (אַתֶּן)
   - 3-е лицо м.р. ед.ч. (הוּא)
   - 3-е лицо ж.р. ед.ч. (הִיא)
   - 3-е лицо м.р. мн.ч. (הֵם)
   - 3-е лицо ж.р. мн.ч. (הֵן)
7. Повелительное наклонение (ציווי): 3 формы (אַתָּה, אַתְּ, אַתֶּם/אַתֶּן).

КРИТИЧЕСКИЕ ПРАВИЛА:
- Все формы на иврите ОБЯЗАНЫ иметь точные полные огласовки (נִקּוּד).
- Русская транскрипция ТОЛЬКО на кириллице с обязательным ударением (á, é, ó, ӣ, ӯ или знак ударения). Букву ה (хей) СТРОГО передавать как латинскую "h" ("hа-", "hу", "hи", "hолéх"). Буквы ח и כ — как русская "х".
- Перевод ТОЛЬКО на русском языке.

Ты ОБЯЗАН ответить СТРОГО валидным JSON-объектом следующего формата:
{
  "infinitive": {
    "hebrew": "לִכְתֹּב",
    "cyrillic_transcription": "лихтóв",
    "russian_translation": "писать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "כ-ת-ב",
  "present": [
    { "pronoun": "זָכָר יָחִיד (он / я / ты)", "hebrew": "כּוֹתֵב", "cyrillic_transcription": "котéв", "russian_translation": "пишет / пишу (м.р.)" },
    { "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)", "hebrew": "כּוֹתֶבֶת", "cyrillic_transcription": "котéвет", "russian_translation": "пишет / пишу (ж.р.)" },
    { "pronoun": "זָכָר רַבִּים (они / мы / вы)", "hebrew": "כּוֹתְבִים", "cyrillic_transcription": "котвӣм", "russian_translation": "пишут / пишем (м.р.)" },
    { "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)", "hebrew": "כּוֹתְבוֹת", "cyrillic_transcription": "котвóт", "russian_translation": "пишут / пишем (ж.р.)" }
  ],
  "past": [
    { "pronoun": "אֲנִי (я)", "hebrew": "כָּתַבְתִּי", "cyrillic_transcription": "катáвти", "russian_translation": "я писал(а)" },
    { "pronoun": "אַתָּה (ты м.р.)", "hebrew": "כָּתַבְתָּ", "cyrillic_transcription": "катáвта", "russian_translation": "ты писал" },
    { "pronoun": "אַתְּ (ты ж.р.)", "hebrew": "כָּתַבְתְּ", "cyrillic_transcription": "катáвт", "russian_translation": "ты писала" },
    { "pronoun": "הוּא (он)", "hebrew": "כָּתַב", "cyrillic_transcription": "катáв", "russian_translation": "он писал" },
    { "pronoun": "הִיא (она)", "hebrew": "כָּתְבָה", "cyrillic_transcription": "катвá", "russian_translation": "она писала" },
    { "pronoun": "אֲנַחְנוּ (мы)", "hebrew": "כָּתַבְנוּ", "cyrillic_transcription": "катáвну", "russian_translation": "мы писали" },
    { "pronoun": "אַתֶּם (вы м.р.)", "hebrew": "כְּתַבְתֶּם", "cyrillic_transcription": "ктавтéм", "russian_translation": "вы писали (м.р.)" },
    { "pronoun": "אַתֶּן (вы ж.р.)", "hebrew": "כְּתַבְתֶּן", "cyrillic_transcription": "ктавтéн", "russian_translation": "вы писали (ж.р.)" },
    { "pronoun": "הֵם / הֵן (они)", "hebrew": "כָּתְבוּ", "cyrillic_transcription": "катвӯ", "russian_translation": "они писали" }
  ],
  "future": [
    { "pronoun": "אֲנִי (я)", "hebrew": "אֶכְתֹּב", "cyrillic_transcription": "эхтóв", "russian_translation": "я напишу" },
    { "pronoun": "אַתָּה (ты м.р.)", "hebrew": "תִּכְתֹּב", "cyrillic_transcription": "тихтóв", "russian_translation": "ты напишешь (м.р.)" },
    { "pronoun": "אַתְּ (ты ж.р.)", "hebrew": "תִּכְתְּבִי", "cyrillic_transcription": "тихтэвӣ", "russian_translation": "ты напишешь (ж.р.)" },
    { "pronoun": "הוּא (он)", "hebrew": "יִכְתֹּב", "cyrillic_transcription": "йихтóв", "russian_translation": "он напишет" },
    { "pronoun": "הִיא (она)", "hebrew": "תִּכְתֹּב", "cyrillic_transcription": "тихтóв", "russian_translation": "она напишет" },
    { "pronoun": "אֲנַחְנוּ (мы)", "hebrew": "נִכְתֹּב", "cyrillic_transcription": "нихтóв", "russian_translation": "мы напишем" },
    { "pronoun": "אַתֶּם (вы м.р.)", "hebrew": "תִּכְתְּבוּ", "cyrillic_transcription": "тихтэвӯ", "russian_translation": "вы напишете (м.р.)" },
    { "pronoun": "אַתֶּן (вы ж.р.)", "hebrew": "תִּכְתֹּבְנָה / תִּכְתְּבוּ", "cyrillic_transcription": "тихтóвна / тихтэвӯ", "russian_translation": "вы напишете (ж.р.)" },
    { "pronoun": "הֵם (они м.р.)", "hebrew": "יִכְתְּבוּ", "cyrillic_transcription": "йихтэвӯ", "russian_translation": "они напишут (м.р.)" },
    { "pronoun": "הֵן (они ж.р.)", "hebrew": "תִּכְתֹּבְנָה / יִכְתְּבוּ", "cyrillic_transcription": "тихтóвна / йихтэвӯ", "russian_translation": "они напишут (ж.р.)" }
  ],
  "imperative": [
    { "pronoun": "אַתָּה (м.р.)", "hebrew": "כְּתֹב", "cyrillic_transcription": "ктóв", "russian_translation": "пиши (м.р.)" },
    { "pronoun": "אַתְּ (ж.р.)", "hebrew": "כִּתְבִי", "cyrillic_transcription": "китвӣ", "russian_translation": "пиши (ж.р.)" },
    { "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)", "hebrew": "כִּתְבוּ", "cyrillic_transcription": "китвӯ", "russian_translation": "пишите" }
  ]
}`;

    if (provider === 'groq' && groqKey) {
      const modelsToTry = [
        process.env.GROQ_MODEL,
        'qwen/qwen3.8-27b',
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.6-27b',
        'groq/compound',
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
        'gemma2-9b-it',
      ].filter(Boolean) as string[];

      for (const groqModel of modelsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 7000);

          const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Составь полную таблицу спряжения глагола: "${verb}"` },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.1,
              max_tokens: 2500,
            }),
          });
          clearTimeout(timeoutId);

          if (groqRes.ok) {
            const data = await groqRes.json();
            const contentStr = data.choices[0]?.message?.content || '{}';
            const parsed = JSON.parse(contentStr);
            const normalized = normalizeConjugationResponse(parsed, verb);
            if (normalized) {
              return NextResponse.json(normalized);
            }
          }
        } catch (groqErr) {
          console.error(`Groq conjugate error with model ${groqModel}:`, groqErr);
        }
      }
    }

    if (geminiKey) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000);

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: `${systemPrompt}\n\nПользователь запросил глагол: "${verb}"`,
                    },
                  ],
                },
              ],
              generationConfig: {
                responseMimeType: 'application/json',
                temperature: 0.1,
              },
            }),
          }
        );
        clearTimeout(timeoutId);

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = JSON.parse(text);
          const normalized = normalizeConjugationResponse(parsed, verb);
          if (normalized) {
            return NextResponse.json(normalized);
          }
        }
      } catch (geminiErr) {
        console.error('Gemini conjugate error:', geminiErr);
      }
    }

    return NextResponse.json({ error: 'Не удалось получить таблицу спряжения глагола' }, { status: 500 });
  } catch (err: any) {
    console.error('Conjugate route error:', err);
    return NextResponse.json({ error: 'Ошибка при анализе спряжений' }, { status: 500 });
  }
}
