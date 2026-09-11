import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { stripNikkud } from '@/lib/transcription';
import { FREE_GUEST_LESSONS_LIMIT } from '@/lib/config';
import { EssayEvaluationResult, LessonEssayPrompt, WordOrderCheckItem, GrammarCheckItem } from '@/types';
import { detectHebrewGrammarErrors, detectHebrewWordOrderErrors } from '@/app/api/ai/dialogue/evaluate/route';

interface EssayEvaluateRequestBody {
  userEssay: string;
  lessonId: number;
  topic?: LessonEssayPrompt;
  userGender?: 'male' | 'female';
  provider?: 'groq' | 'gemini';
  apiKey?: string;
}

/**
 * Локальная эвристическая оценка сочинения на случай сбоя внешнего LLM
 */
function evaluateHeuristicEssay(
  userEssay: string,
  topic: LessonEssayPrompt | undefined,
  userGender: 'male' | 'female' = 'female'
): EssayEvaluationResult {
  const clean = stripNikkud(userEssay).trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const detectedWordOrder = detectHebrewWordOrderErrors(userEssay);
  const detectedGrammar = detectHebrewGrammarErrors(userEssay);

  const wordOrderItems: WordOrderCheckItem[] = detectedWordOrder.map((e) => ({
    ruleNameRu: 'Порядок слов в словосочетании',
    issueSnippet: e.wrongPhrase,
    correctionSnippet: e.correctPhrase,
    explanationRu: e.explanationRu,
  }));

  const grammarItems: GrammarCheckItem[] = detectedGrammar.map((e) => ({
    type: e.type,
    wrongSnippet: e.wrongPhrase,
    correctionSnippet: e.correctPhrase,
    explanationRu: e.explanationRu,
  }));

  // Анализ использованных слов урока
  const usedWords: string[] = [];
  if (topic?.suggestedWords) {
    for (const item of topic.suggestedWords) {
      const cleanTarget = stripNikkud(item.hebrew).toLowerCase().trim();
      if (cleanTarget && clean.toLowerCase().includes(cleanTarget)) {
        usedWords.push(item.hebrew);
      }
    }
  }

  const hasWordOrderErrors = wordOrderItems.length > 0;
  const hasGrammarErrors = grammarItems.length > 0;

  let score = 92;
  if (hasWordOrderErrors) score -= wordOrderItems.length * 12;
  if (hasGrammarErrors) score -= grammarItems.length * 8;
  if (topic && wordCount < topic.minWords) score -= 10;
  score = Math.max(50, Math.min(98, score));

  const rating: 'excellent' | 'good' | 'needs_work' =
    score >= 88 ? 'excellent' : score >= 70 ? 'good' : 'needs_work';

  return {
    score,
    rating,
    summaryRu:
      rating === 'excellent'
        ? 'Отличное сочинение! Вы прекрасно выразили свои мысли на иврите и соблюли структуру речи.'
        : rating === 'good'
        ? 'Хорошая работа! Текст понятен, но обратите внимание на замечания по порядку слов и согласованию.'
        : 'Неплохая попытка, но текст требует доработки порядка слов и грамматики.',
    wordOrderFeedback: {
      hasErrors: hasWordOrderErrors,
      items: wordOrderItems,
      generalAdviceRu: hasWordOrderErrors
        ? 'Главное правило порядка слов в иврите: признак (прилагательное) всегда следует ПОСЛЕ предмета (סֵפֶר טוֹב), а отрицание «לא» — строго ПЕРЕД глаголом.'
        : 'Порядок слов правильный! Прилагательные и отрицания расставлены естественно.',
    },
    grammarFeedback: {
      items: grammarItems,
      genderAgreementRu: hasGrammarErrors
        ? 'Обратите внимание на согласование рода: проверяйте род существительных и используйте соответствующие местоимения (זה для м.р., זאת для ж.р.).'
        : 'Согласование рода и числа соблюдено корректно.',
    },
    vocabularyAnalysis: {
      usedLessonWords: usedWords,
      count: usedWords.length,
      commentRu:
        usedWords.length > 0
          ? `Вы успешно применили слова из урока: ${usedWords.join(', ')}.`
          : 'Постарайтесь активнее использовать рекомендованную лексику текущего урока.',
    },
    correctedVersion: {
      hebrew: userEssay,
      transcription: '',
      translation: 'Ваш текст на иврите.',
    },
    valuableTipsRu: [
      'В иврите сначала называется предмет, а затем его качество (например: בית יפה, а не יפה בית).',
      'Отрицательная частица «לא» всегда предшествует отрицаемому слову (לא רוצה).',
      'Старайтесь соединять предложения союзами «וְ» (и), «כִּי» (потому что) или «אֲבָל» (но) для плавности речи.',
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: EssayEvaluateRequestBody = await req.json();
    const {
      userEssay = '',
      lessonId = 1,
      topic,
      userGender = 'female',
      provider = 'groq',
      apiKey,
    } = body;

    const trimmedEssay = userEssay.trim();
    if (!trimmedEssay) {
      return NextResponse.json(
        { error: 'Текст сочинения не может быть пустым' },
        { status: 400 }
      );
    }

    // Проверка авторизации: уроки с 3-го требуют бесплатной регистрации
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!session && lessonId > FREE_GUEST_LESSONS_LIMIT) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется бесплатная регистрация для доступа к урокам с 3-го' },
        { status: 401 }
      );
    }

    // 1. Локальная эвристическая детекция ошибок порядка слов и рода
    const detectedWordOrder = detectHebrewWordOrderErrors(trimmedEssay);
    const detectedGrammar = detectHebrewGrammarErrors(trimmedEssay);

    // 2. Поиск совпадений со словарём урока
    const usedWords: string[] = [];
    if (topic?.suggestedWords) {
      const cleanEssay = stripNikkud(trimmedEssay).toLowerCase();
      for (const item of topic.suggestedWords) {
        const cleanTarget = stripNikkud(item.hebrew).toLowerCase().trim();
        if (cleanTarget && cleanEssay.includes(cleanTarget)) {
          usedWords.push(item.hebrew);
        }
      }
    }

    // 3. Вызов нейросети (Groq / Gemini) с фокусом на порядок слов
    const groqKey = apiKey && provider === 'groq' ? apiKey : process.env.GROQ_API_KEY;
    const geminiKey = apiKey && provider === 'gemini' ? apiKey : process.env.GEMINI_API_KEY;

    const systemPrompt = `ТЫ — ВЫСОКОКВАЛИФИЦИРОВАННЫЙ ПРЕПОДАВАТЕЛЬ ИВРИТА ИЗРАИЛЬСКОГО УЛЬПАНА (מוֹרֶה בָּכִיר בָּאוּלְפָּן).
ТВОЯ ЗАДАЧА — ПРОВЕРИТЬ СОЧИНЕНИЕ (חִבּוּר) УЧЕНИКА, НАПИСАННОЕ НА ИВРИТЕ.

ОСОБЫЙ ФОКУС ПРОВЕРКИ:
1. ПОРЯДОК СЛОВ В ПРЕДЛОЖЕНИИ (סֵדֶר הַמִּילִּים) — КРИТИЧЕСКИ ВАЖНО:
   - Прилагательное ВСЕГДА ставится ПОСЛЕ существительного: «בַּיִת גָּדוֹל», «סֵפֶר טוֹב», «עִיר יָפָה». Ошибка: «גדול בית».
   - Частица отрицания «לֹא» ВСЕГДА ставится ПЕРЕД глаголом: «אֲנִי לֹא רוֹצֶה». Ошибка: «רוצה לא».
   - Вопросительные слова всегда в начале: «אֵיפֹה אַתָּה גָּר?». Ошибка: «אתה גר איפה?».
   - Естественный порядок обстоятельств времени и места (обычно в начале или в конце предложения).
2. СОГЛАСОВАНИЕ РОДА И ЧИСЛА:
   - «זֶה» ТОЛЬКО для мужского рода (זה אבא, זה בית).
   - «זֹאת» или «זוֹ» ТОЛЬКО для женского рода (זאת אמא, זאת דירה).
   - «אֵלֶּה» для множественного числа (אלה הורים, אלה ספרים).
   - Пол автора текста: ${userGender === 'female' ? 'ЖЕНСКИЙ (נקבה)' : 'МУЖСКОЙ (זכר)'}. Глаголы настоящего и прошедшего времени от первого лица должны соответствовать этому полу!
3. АКТИВНЫЙ СЛОВАРЬ УРОКА:
   - Оцени, использовал ли ученик изученную лексику темы.
4. ЦЕННЫЕ СОВЕТЫ И РЕКОМЕНДАЦИИ:
   - Дай 2–3 конкретных, вдохновляющих совета на русском языке для живой речи в Израиле.
5. ОБРАЗЦОВАЯ ВЕРСИЯ (с огласовками, русской транскрипцией по стандарту ульпана с 'h' для ה, и переводом).`;

    const userPrompt = `КОНТЕКСТ УРОКА:
- Урок №: ${lessonId}
- Тема сочинения: "${topic?.topicRu || 'Сочинение'}" (${topic?.topicHe || ''})
- Коммуникативная ситуация: "${topic?.situationRu || ''}"
- Целевые слова урока: ${JSON.stringify(topic?.suggestedWords?.map((w) => w.hebrew) || [])}
- Пол ученика: ${userGender === 'female' ? 'Женский (נקבה)' : 'Мужской (זכר)'}

ТЕКСТ СОЧИНЕНИЯ УЧЕНИКА:
"""
${trimmedEssay}
"""

${detectedWordOrder.length > 0 ? `ВНИМАНИЕ: Автоматический детектор обнаружил нарушения порядка слов: ${JSON.stringify(detectedWordOrder.map(e => e.wrongPhrase))}` : ''}
${detectedGrammar.length > 0 ? `ВНИМАНИЕ: Автоматический детектор обнаружил грамматические ошибки рода: ${JSON.stringify(detectedGrammar.map(e => e.wrongPhrase))}` : ''}

ОТВЕТЬ СТРОГО В ФОРМАТЕ JSON БЕЗ ЛИШНЕГО ТЕКСТА И РАЗМЕТКИ:
{
  "score": 88,
  "rating": "excellent", // "excellent" (88-100), "good" (70-87), "needs_work" (<70)
  "summaryRu": "Тёплый ободряющий отзыв учителя о сочинении.",
  "wordOrderFeedback": {
    "hasErrors": false,
    "items": [
      {
        "ruleNameRu": "Прилагательное после существительного",
        "issueSnippet": "было неверно",
        "correctionSnippet": "правильный вариант",
        "explanationRu": "Подробное объяснение правила порядка слов на русском"
      }
    ],
    "generalAdviceRu": "Общий ценный совет по структуре предложений на иврите"
  },
  "grammarFeedback": {
    "items": [
      {
        "type": "gender_agreement",
        "wrongSnippet": "ошибочный фрагмент",
        "correctionSnippet": "исправленный фрагмент",
        "explanationRu": "Пояснение правила рода/числа"
      }
    ],
    "genderAgreementRu": "Комментарий о согласовании рода автора и глаголов"
  },
  "vocabularyAnalysis": {
    "usedLessonWords": ["слова", "из урока"],
    "count": 2,
    "commentRu": "Похвала или совет по использованию слов урока"
  },
  "correctedVersion": {
    "hebrew": "Исправленный и улучшенный текст сочинения с полными огласовками (ניקוד)",
    "transcription": "Русская транскрипция с буквой h для ה и ударениями",
    "translation": "Литературный русский перевод"
  },
  "valuableTipsRu": [
    "Первый ценный совет по языку",
    "Второй ценный совет по языку",
    "Третий совет для естественной речи"
  ]
}`;

    if (groqKey) {
      const groqModels = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
      for (const groqModel of groqModels) {
        try {
          const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${groqKey}`,
            },
            body: JSON.stringify({
              model: groqModel,
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt },
              ],
              temperature: 0.3,
              response_format: { type: 'json_object' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed: EssayEvaluationResult = JSON.parse(rawContent);

              // Страховочная синхронизация детектора порядка слов
              if (detectedWordOrder.length > 0) {
                parsed.wordOrderFeedback.hasErrors = true;
                for (const d of detectedWordOrder) {
                  if (!parsed.wordOrderFeedback.items.some((it) => it.issueSnippet?.includes(d.wrongPhrase))) {
                    parsed.wordOrderFeedback.items.push({
                      ruleNameRu: 'Порядок слов в словосочетании',
                      issueSnippet: d.wrongPhrase,
                      correctionSnippet: d.correctPhrase,
                      explanationRu: d.explanationRu,
                    });
                  }
                }
                if (parsed.score > 75) parsed.score = 75;
                if (parsed.rating === 'excellent') parsed.rating = 'good';
              }

              // Синхронизация использованных слов урока
              if (usedWords.length > 0) {
                const combinedSet = new Set([...parsed.vocabularyAnalysis.usedLessonWords, ...usedWords]);
                parsed.vocabularyAnalysis.usedLessonWords = Array.from(combinedSet);
                parsed.vocabularyAnalysis.count = parsed.vocabularyAnalysis.usedLessonWords.length;
              }

              return NextResponse.json(parsed);
            }
          }
        } catch (err) {
          console.warn(`Groq evaluation error with model ${groqModel}:`, err);
        }
      }
    }

    if (geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
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
          const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const parsed: EssayEvaluationResult = JSON.parse(rawText);
            return NextResponse.json(parsed);
          }
        }
      } catch (err) {
        console.warn('Gemini evaluation error:', err);
      }
    }

    // Если LLM недоступен — возвращаем качественную эвристическую оценку
    const heuristic = evaluateHeuristicEssay(trimmedEssay, topic, userGender);
    return NextResponse.json(heuristic);
  } catch (error) {
    console.error('Error in essay evaluate route:', error);
    return NextResponse.json(
      { error: 'Не удалось проверить сочинение. Пожалуйста, попробуйте снова.' },
      { status: 500 }
    );
  }
}