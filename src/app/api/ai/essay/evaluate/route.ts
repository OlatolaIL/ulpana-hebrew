import { groqModels as configuredGroqModels, geminiModels, resolveAiKeys } from '@/lib/aiModels';
import { readAiJson, fetchAi, aiErrorResponse } from '@/lib/aiRequest';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { stripNikkud, ensureCyrillicHebrewTranscription } from '@/lib/transcription';
import { FREE_GUEST_LESSONS_LIMIT } from '@/lib/config';
import {
  EssayEvaluationResult,
  LessonEssayPrompt,
  WordOrderCheckItem,
  GrammarCheckItem,
  SpellingCheckItem,
  TaskComplianceFeedback,
} from '@/types';
import { detectHebrewGrammarErrors, detectHebrewWordOrderErrors } from '@/lib/hebrewFeedback';
import { getLessonById } from '@/data/lessonsData';
import { getLessonEssayPrompt } from '@/data/essayTopics';
import { lookupOfflineWord } from '@/lib/ulpanDictionary';

interface EssayEvaluateRequestBody {
  userEssay: string;
  lessonId: number;
  topic?: LessonEssayPrompt;
  userGender?: 'male' | 'female';
  provider?: 'groq' | 'gemini';
  apiKey?: string;
  lessonLevel?: 'alef' | 'bet';
  lessonTitle?: string;
}

/**
 * Простая функция расстояния Левенштейна для сравнения слов на иврите
 */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

const VALID_PROPER_NAMES_AND_PARTICLES = new Set([
  'דניאל', 'דוד', 'שרה', 'יוסי', 'מיכל', 'רוני', 'תמר', 'נועה', 'איתי', 'אורי', 'יוסף',
  'תל', 'אביב', 'ירושלים', 'חיפה', 'ישראל',
  'את', 'לא', 'כן', 'של', 'שלי', 'שלך', 'שלו', 'שלה', 'שלנו', 'שלכם', 'שלהם',
  'על', 'עם', 'זה', 'זאת', 'זו', 'אלה', 'אלו',
  'מי', 'מה', 'איפה', 'למה', 'מדוע', 'מתי', 'איך', 'כמה',
  'כי', 'אם', 'אבל', 'אך', 'או', 'גם', 'רק', 'כל', 'פה', 'שם', 'כאן',
  'יש', 'אין', 'הנה', 'עכשיו', 'היום', 'אתמול', 'מחר',
  'שלום', 'להתראות', 'בבקשה', 'תודה'
]);

/**
 * Локальный детектор орфографических ошибок на иврите (проверяет ВСЕ слова сочинения)
 */
function detectHebrewSpellingErrors(
  userEssay: string,
  suggestedWords: { hebrew: string; translation?: string }[] = [],
  lessonId: number = 1
): SpellingCheckItem[] {
  const clean = stripNikkud(userEssay);
  const rawWords = clean.split(/[\s,.;:!?«»"()־-]+/).filter(Boolean);
  const items: SpellingCheckItem[] = [];
  const reportedWords = new Set<string>();

  const finalLetterMap: Record<string, string> = {
    'כ': 'ך',
    'מ': 'ם',
    'נ': 'ן',
    'פ': 'ף',
    'צ': 'ץ',
  };

  const middleLetterMap: Record<string, string> = {
    'ך': 'כ',
    'ם': 'מ',
    'ן': 'נ',
    'ף': 'פ',
    'ץ': 'צ',
  };

  // 1. Проверка правил софитов (конечных букв) — ДЛЯ ВСЕХ СЛОВ ТЕКСТА
  for (const w of rawWords) {
    if (w.length < 2) continue;
    const lastChar = w[w.length - 1];

    // Обычная буква в самом конце слова вместо софита
    if (finalLetterMap[lastChar] && !reportedWords.has(w)) {
      const corrected = w.slice(0, -1) + finalLetterMap[lastChar];
      items.push({
        wrongWord: w,
        correctWord: corrected,
        explanationRu: `В конце слова буква «${lastChar}» всегда пишется как конечная софит «${finalLetterMap[lastChar]}» (например: ${corrected}).`,
      });
      reportedWords.add(w);
    }

    // Софит в середине или начале слова
    for (let i = 0; i < w.length - 1; i++) {
      const ch = w[i];
      if (middleLetterMap[ch] && !reportedWords.has(w)) {
        const chars = w.split('');
        chars[i] = middleLetterMap[ch];
        const corrected = chars.join('');
        items.push({
          wrongWord: w,
          correctWord: corrected,
          explanationRu: `Конечная буква «${ch}» пишется ТОЛЬКО в самом конце слова. В начале и середине используется «${middleLetterMap[ch]}».`,
        });
        reportedWords.add(w);
        break;
      }
    }
  }

  // 2. Целевые слова текущего урока + накопительный словарь курса (R-07)
  const cleanTargets: { original: string; clean: string; translation: string }[] = suggestedWords
    .map((sw) => ({
      original: sw.hebrew,
      clean: stripNikkud(sw.hebrew).trim(),
      translation: sw.translation || '',
    }))
    .filter((sw) => sw.clean.length >= 2);

  const maxLesson = Math.max(10, lessonId);
  for (let id = 1; id <= maxLesson; id++) {
    const l = getLessonById(id);
    if (l?.vocabulary) {
      for (const v of l.vocabulary) {
        const cleanV = stripNikkud(v.hebrew).trim();
        if (cleanV.length >= 2 && !cleanTargets.some((t) => t.clean === cleanV)) {
          cleanTargets.push({
            original: v.hebrew,
            clean: cleanV,
            translation: v.translation || '',
          });
        }
      }
    }
  }

  for (const userWord of rawWords) {
    if (reportedWords.has(userWord)) continue;
    if (userWord.length < 2) continue;

    // Пропуск известных имен собственных, служебных частиц и точных слов урока
    if (VALID_PROPER_NAMES_AND_PARTICLES.has(userWord)) continue;
    if (cleanTargets.some((target) => target.clean === userWord)) continue;

    // Пропуск имен с предлогами (бирушалаим, леданиэль и т.д.)
    if (userWord.length >= 4 && ['ב', 'ל', 'מ', 'ו', 'כ', 'ש'].includes(userWord[0])) {
      const base = userWord.slice(1);
      if (VALID_PROPER_NAMES_AND_PARTICLES.has(base)) continue;
    }

    // Проверка в оффлайн-словаре Ульпана: если слово существует в языке, ошибки нет
    const offlineExact = lookupOfflineWord(userWord);
    if (offlineExact) continue;

    // 2.1 Сравнение с целевыми словами урока (опечатки и путаница букв)
    let matchedInLesson = false;
    for (const target of cleanTargets) {
      if (userWord === target.clean) continue;

      const substituteT = userWord.replace(/ת/g, 'ט');
      const substituteTet = userWord.replace(/ט/g, 'ת');
      const substituteS = userWord.replace(/ס/g, 'ש');

      const dist = levenshteinDistance(userWord, target.clean);
      const isPhoneticConfusion =
        substituteT === target.clean ||
        substituteTet === target.clean ||
        substituteS === target.clean ||
        (dist === 1 && Math.abs(userWord.length - target.clean.length) <= 1);

      if (isPhoneticConfusion && dist > 0 && dist <= 2) {
        let reason = `Похоже на опечатку в слове «${target.original}» (${target.translation}).`;
        if (userWord.includes('ת') && target.clean.includes('ט')) {
          reason = `В слове «${target.original}» пишется буква «ט», а не «ת».`;
        } else if (userWord.includes('ט') && target.clean.includes('ת')) {
          reason = `В слове «${target.original}» пишется буква «ת», а не «ט».`;
        } else if (userWord.includes('ס') && target.clean.includes('ש')) {
          reason = `В слове «${target.original}» пишется буква «ש» (син/шин), а не «ס».`;
        } else if (userWord.includes('כ') && target.clean.includes('ק')) {
          reason = `В слове «${target.original}» пишется буква «ק», а не «כ».`;
        } else if (userWord.endsWith('א') && target.clean.endsWith('ה')) {
          reason = `В слове «${target.original}» на конце пишется буква «ה», а не «א».`;
        }

        items.push({
          wrongWord: userWord,
          correctWord: target.original,
          explanationRu: reason,
        });
        reportedWords.add(userWord);
        matchedInLesson = true;
        break;
      }
    }
    if (matchedInLesson) continue;

    // 2.2 Проверка опечаток и созвучных букв по всей лексике Ульпана (словарь всех уроков)
    const subCandidates: { cand: string; letterRule: string }[] = [];
    if (userWord.includes('ט')) subCandidates.push({ cand: userWord.replace(/ט/g, 'ת'), letterRule: '«ת», а не «ט»' });
    if (userWord.includes('ת')) subCandidates.push({ cand: userWord.replace(/ת/g, 'ט'), letterRule: '«ט», а не «ת»' });
    if (userWord.includes('ס')) subCandidates.push({ cand: userWord.replace(/ס/g, 'ש'), letterRule: '«ש» (син/шин), а не «ס»' });
    if (userWord.includes('ש')) subCandidates.push({ cand: userWord.replace(/ש/g, 'ס'), letterRule: '«ס», а не «ש»' });
    if (userWord.includes('כ')) subCandidates.push({ cand: userWord.replace(/כ/g, 'ק'), letterRule: '«ק», а не «כ»' });
    if (userWord.includes('ק')) subCandidates.push({ cand: userWord.replace(/ק/g, 'כ'), letterRule: '«כ», а не «ק»' });
    if (userWord.includes('א')) subCandidates.push({ cand: userWord.replace(/א/g, 'ע'), letterRule: '«ע» (аин), а не «א» (алеф)' });
    if (userWord.includes('ע')) subCandidates.push({ cand: userWord.replace(/ע/g, 'א'), letterRule: '«א» (алеф), а не «ע» (аин)' });
    if (userWord.endsWith('א')) subCandidates.push({ cand: userWord.slice(0, -1) + 'ה', letterRule: '«ה» на конце слова, а не «א»' });
    if (userWord.endsWith('ה')) subCandidates.push({ cand: userWord.slice(0, -1) + 'א', letterRule: '«א» на конце слова, а не «ה»' });
    if (userWord.includes('ח')) subCandidates.push({ cand: userWord.replace(/ח/g, 'כ'), letterRule: '«כ» / «ך», а не «ח»' });
    if (userWord.includes('ב')) subCandidates.push({ cand: userWord.replace(/ב/g, 'ו'), letterRule: '«ו», а не «ב»' });
    if (userWord.includes('ו')) subCandidates.push({ cand: userWord.replace(/ו/g, 'ב'), letterRule: '«ב», а не «ו»' });

    for (const { cand, letterRule } of subCandidates) {
      const match = lookupOfflineWord(cand);
      if (match) {
        items.push({
          wrongWord: userWord,
          correctWord: match.hebrew,
          explanationRu: `В слове «${match.hebrew}» (${match.translation}) пишется буква ${letterRule}.`,
        });
        reportedWords.add(userWord);
        break;
      }
    }
  }

  return items;
}

/**
 * Обогащение текста огласовками (ניקוד) по словарю урока и оффлайн-словарю ульпана
 */
function vocalizeTextFromDictionary(
  text: string,
  suggestedWords?: { hebrew: string }[]
): string {
  if (!text) return '';
  const tokens = text.split(/([\s,.;:!?«»"()־-]+)/);
  return tokens
    .map((token) => {
      const clean = stripNikkud(token).trim();
      if (!clean || !/[\u0590-\u05FF]/.test(clean)) return token;

      // 1. Поиск в рекомендованных словах текущего урока
      if (suggestedWords) {
        const match = suggestedWords.find((w) => stripNikkud(w.hebrew).trim() === clean);
        if (match && /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/.test(match.hebrew)) {
          return match.hebrew;
        }
      }

      // 2. Поиск в оффлайн-словаре Ульпана
      const dictMatch = lookupOfflineWord(clean);
      if (dictMatch?.hebrew && /[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/.test(dictMatch.hebrew)) {
        return dictMatch.hebrew;
      }

      return token;
    })
    .join('');
}

/**
 * Локальная эвристическая оценка сочинения на случай сбоя внешнего LLM
 */
function evaluateHeuristicEssay(
  userEssay: string,
  topic: LessonEssayPrompt | undefined,
  userGender: 'male' | 'female' = 'female',
  lessonId: number = 1
): EssayEvaluationResult {
  const clean = stripNikkud(userEssay).trim();
  const words = clean.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const lesson = getLessonById(lessonId);
  const prompt = topic || getLessonEssayPrompt(lessonId);

  const detectedWordOrder = detectHebrewWordOrderErrors(userEssay);
  const detectedGrammar = detectHebrewGrammarErrors(userEssay);
  const detectedSpelling = detectHebrewSpellingErrors(userEssay, prompt.suggestedWords, lessonId);

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
  if (prompt?.suggestedWords) {
    for (const item of prompt.suggestedWords) {
      const cleanTarget = stripNikkud(item.hebrew).toLowerCase().trim();
      if (cleanTarget && clean.toLowerCase().includes(cleanTarget)) {
        usedWords.push(item.hebrew);
      }
    }
  }

  const hasWordOrderErrors = wordOrderItems.length > 0;
  const hasGrammarErrors = grammarItems.length > 0;
  const hasSpellingErrors = detectedSpelling.length > 0;

  let score = 94;
  if (hasSpellingErrors) score -= detectedSpelling.length * 8;
  if (hasWordOrderErrors) score -= wordOrderItems.length * 12;
  if (hasGrammarErrors) score -= grammarItems.length * 8;
  if (wordCount < prompt.minWords) score -= 12;
  score = Math.max(45, Math.min(98, score));

  const rating: 'excellent' | 'good' | 'needs_work' =
    score >= 88 ? 'excellent' : score >= 70 ? 'good' : 'needs_work';

  const isAlef = lesson.level === 'alef';
  const levelStageRu = isAlef
    ? lessonId <= 10
      ? 'Начальный Алеф (Алеф-1)'
      : 'Уровень Алеф'
    : 'Уровень Бет';

  const taskCompliance: TaskComplianceFeedback = {
    isRelevant: wordCount >= Math.min(4, prompt.minWords),
    score: Math.min(100, Math.round((wordCount / prompt.minWords) * 100)),
    topicCommentRu:
      wordCount >= prompt.minWords
        ? `Тема «${prompt.topicRu}» раскрыта в соответствии с коммуникативной задачей урока.`
        : `Текст коротковат: написано ${wordCount} из рекомендуемых ${prompt.minWords} слов. Попробуйте раскрыть тему полнее.`,
    levelCommentRu: `Сочинение оценено с учётом стандартов ступени ${levelStageRu}. Внимание уделено базовому синтаксису и орфографии.`,
  };

  return {
    score,
    rating,
    summaryRu:
      rating === 'excellent'
        ? 'Отличное сочинение! Вы прекрасно выразили мысли на иврите, соблюдая грамматику, орфографию и структуру.'
        : rating === 'good'
        ? 'Хорошая работа! Мысль понятна, но обратите внимание на замечания по написанию слов и порядку фраз.'
        : 'Неплохая попытка, но текст требует исправления орфографических или грамматических ошибок.',
    taskCompliance,
    spellingFeedback: {
      hasErrors: hasSpellingErrors,
      items: detectedSpelling,
      generalAdviceRu: hasSpellingErrors
        ? 'Обратите внимание на созвучные буквы (ט/ת, כ/ק, א/ע) и правила написания конечных букв софит (ם, ן, ץ, ף, ך).'
        : 'Все слова написаны без орфографических ошибок!',
    },
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
        ? 'Обратите внимание на согласование рода: проверяйте род существительных и глаголов от первого лица.'
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
      hebrew: prompt.sampleEssay?.hebrew || userEssay,
      transcription: ensureCyrillicHebrewTranscription(
        prompt.sampleEssay?.transcription || '',
        prompt.sampleEssay?.hebrew || userEssay
      ),
      translation: prompt.sampleEssay?.translation || 'Эталонный вариант на иврите.',
    },
    valuableTipsRu: [
      'В иврите сначала называется предмет, а затем его качество (например: בית יפה, а не יפה בית).',
      'Отрицательная частица «לא» всегда предшествует отрицаемому слову (לא רוצה).',
      'Буквы-софиты (ם, ן, ץ, ף, ך) пишутся исключительно на самом конце слов.',
    ],
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await readAiJson<EssayEvaluateRequestBody>(req);
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

    // 1. Получение контекста урока и задания
    const lesson = getLessonById(lessonId);
    const essayPrompt = topic || getLessonEssayPrompt(lessonId);
    const isAlef = lesson.level === 'alef';
    const levelLabelRu = isAlef
      ? lessonId <= 10
        ? 'Уровень Алеф-1 (Начальный)'
        : lessonId <= 30
        ? 'Уровень Алеф-2 (Базовый)'
        : 'Уровень Алеф-Плюс'
      : 'Уровень Бет';

    // 2. Локальная эвристическая предварительная детекция (safety net)
    const detectedWordOrder = detectHebrewWordOrderErrors(trimmedEssay);
    const detectedGrammar = detectHebrewGrammarErrors(trimmedEssay);
    const detectedSpelling = detectHebrewSpellingErrors(trimmedEssay, essayPrompt.suggestedWords, lessonId);

    // 3. Вызов нейросети (Groq / Gemini) с полным резервным ключом
    const { groqKey, geminiKey, geminiKeys } = resolveAiKeys(provider, apiKey);

    const systemPrompt = `ТЫ — ВЫСОКОКВАЛИФИЦИРОВАННЫЙ, МУДРЫЙ И ВНИМАТЕЛЬНЫЙ ПРЕПОДАВАТЕЛЬ ИВРИТА ИЗРАИЛЬСКОГО УЛЬПАНА (מוֹרֶה בָּכִיר בָּאוּלְפָּן).
ТВОЯ ЗАДАЧА — ПРОВЕРИТЬ СОЧИНЕНИЕ (חִבּוּר) УЧЕНИКА, НАПИСАННОЕ НА ИВРИТЕ, ДАТЬ ЧЕСТНУЮ, ПЕДАГОГИЧЕСКИ ВЫВЕРЕННУЮ РЕЦЕНЗИЮ И УКАЗАТЬ НА ВСЕ ОШИБКИ.

СТРОГИЙ ЧЕК-ЛИСТ ПРОВЕРКИ:
1. ОРФОГРАФИЯ И ПРАВОПИСАНИЕ (כְּתִיב) — ОБЯЗАТЕЛЬНО ДЛЯ ВСЕХ СЛОВ ТЕКСТА:
   - Внимательно прочитай КАЖДОЕ отдельное слово текста ученика.
   - ПРОВЕРЯЙ ВСЕ СЛОВА СОЧИНЕНИЯ, А НЕ ТОЛЬКО СЛОВА ТЕКУЩЕГО УРОКА! Если ученик допустил ошибку в любом общеупотребительном слове (например: «טודה» вместо «תודה», «סלום» вместо «שלום», «תוב» вместо «טוב», «טה» вместо «תה», «אוגה» вместо «עוגה»), ОБЯЗАТЕЛЬНО зафиксируй это в блоке "spellingFeedback.items"!
   - Не считай ошибками распространенные имена собственные и топонимы (דניאל, דוד, שרה, תל אביב, ירושלים).
   - КРИТИЧЕСКИ ВАЖНО (СТРОГАЯ АНТИ-ГАЛЛЮЦИНАЦИЯ):
     * Твои комментарии и правила должны на 100% соответствовать РЕАЛЬНЫМ БУКВАМ проверяемого слова!
     * СТРОЖАЙШЕ ЗАПРЕЩЕНО придумывать несуществующие буквы или применять правила о других буквах (например, КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО утверждать, что в слове «להתראות» есть «ם» или мем-софит — слово «להתראות» оканчивается на букву «ת»!).
     * Указывай ТОЛЬКО те буквы, которые реально присутствуют в слове или были ошибочно добавлены/пропущены/заменены.
   - Особое внимание к типичным ошибкам:
     * Путаница созвучных букв: «ט» и «ת» (например: ошибка «תוב» вместо «טוב», «בטוח» / «בתוח», «תודה» / «טודה»).
     * Путаница «כ» и «ק» (например: «קפה» / «כפה», «כיתה» / «קיתה»).
     * Путаница «ח» и «כ» / «ך».
     * Путаница «א» и «ע» (например: «אוגה» вместо «עוגה»).
     * Путаница «ב» (звук в) и «ו» (например: «בבבקשה» или пропуски букв).
     * Путаница «שׂ» (син) и «ס» (самех) (например: «סלום» вместо «שלום», «ספה» вместо «שפה»).
     * БУКВЫ-СОФИТЫ (אותיות סופיות): буквы «ך, ם, ן, ף, ץ» ДОЛЖНЫ писаться ИСКЛЮЧИТЕЛЬНО в самом конце слова (например «שלוּם» -> «שלום» с конечной ם). Применяй правило о софитах ТОЛЬКО к тем словам, которые действительно оканчиваются на эти 5 букв!
     * Опечатки в корнях, суффиксах и слитных предлогах/союзах (например, союз «ו» пишется слитно: «וּלְהִתְרָאוֹת»).
   - Для КАЖДОЙ ошибки орфографии укажи:
     * "wrongWord": ошибочное слово в точности как у ученика.
     * "correctWord": правильное написание на иврите (с огласовками, если нужно пояснить звук).
     * "explanationRu": доходчивое и лингвистически точное объяснение на русском языке БЕЗ упоминания букв, которых нет в слове.

2. ПОРЯДОК СЛОВ В ПРЕДЛОЖЕНИИ (סֵדֶר הַמִּילִּים) — КРИТИЧЕСКИ ВАЖНО ДЛЯ ИВРИТА:
   - Прилагательное ВСЕГДА следует ПОСЛЕ существительного: «בַּיִת גָּדוֹל», «סֵפֶר טוֹב», «עִיר יָפָה». Ошибка: «גדול בית».
   - Отрицание «לֹא» ВСЕГДА ставится строго ПЕРЕД глаголом: «אֲנִי לֹא רוֹצֶה». Ошибка: «רוצה לא».
   - Вопросительные слова всегда в начале предложения: «אֵיפֹה אַתָּה גָּר?».
   - Неправильный порядок слов помещай в "wordOrderFeedback.items".

3. ГРАММАТИКА, РОД И ЧИСЛО (דִּקְדּוּק):
   - «זֶה» ТОЛЬКО для мужского рода (זה אבא, זה בית).
   - «זֹאת» или «זוֹ» ТОЛЬКО для женского рода (זאת אמא, זאת דירה, זאת עיר).
   - «אֵלֶּה» для множественного числа (אלה הורים, אלה ספרים).
    - Пол автора текста: ${userGender === 'female' ? 'ЖЕНСКИЙ (נקבה)' : 'МУЖСКОЙ (זכר)'}.
      * Настоящее время: глаголы от первого лица (אני) ОБЯЗАТЕЛЬНО согласуются по роду автора текста — ${userGender === 'female' ? 'в женском роде (רוֹצָה, שׁוֹתָה, גָּרָה, לוֹמֶדֶת); форма мужского рода (רוֹצֶה, גָּר) у автора-женщины является ошибкой согласования рода' : 'в мужском роде (רוֹצֶה, שׁוֹתֶה, גָּר, לוֹמֵד); форма женского рода (רוֹצָה, גָּרָה) у автора-мужчины является ошибкой согласования рода'}.
      * Прошедшее время: форма 1-го лица единственного числа (אני) грамматически едина для обоих родов и НЕ различается по полу автора (למשל: «גרתי», «שתיתי», «רציתי», «למדתי» одинаково верны и для мужчины, и для женщины; общая форма и у 1-го лица множественного числа «גרנו»). КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО считать форму 1-го лица прошедшего времени ошибкой согласования рода! В прошедшем времени род различается во 2-м лице (גרת / גרת) и в 3-м лице единственного числа (גר / גרה), а в 3-м лице множественного числа форма общая (גרו для обоих родов).
   - Согласование прилагательных: прилагательное всегда согласуется с существительным в роде и числе (ספר טוב, דירה טובה, ספרים טובים).
   - Управление глаголов и предлоги (אוהב את..., גר ב..., נוסע ל...).
   - Ошибки помещай в "grammarFeedback.items" с типом 'gender_agreement', 'verb_conjugation', 'preposition', 'plural_agreement' или 'syntax'.

4. СООТВЕТСТВИЕ ЗАДАНИЮ И УРОВНЮ УРОКА:
   - Текущий урок: №${lessonId} (${levelLabelRu}).
   - Тема: "${essayPrompt.topicRu}" (${essayPrompt.topicHe}).
   - Коммуникативная ситуация: "${essayPrompt.situationRu}".
   - КАЛИБРОВКА ПО УРОВНЮ:
     * Для уроков 1–10: ожидаются простые и ясные предложения в настоящем времени. Не требуй сложной литературы, хвали за правильное базовое выражение мыслей. Строго проверяй базовую орфографию и порядок слов.
     * Для уроков 11–30: ожидаются предлоги, множественное число, отрицания и связки (כי, אבל).
     * Для уроков 31+: связный рассказ, прошедшее время, разнообразие биньянов.
   - Оцени, ответил ли ученик на заданную коммуникативную ситуацию или написал несвязный набор слов / ушел от темы.
   - В блоке "taskCompliance":
     * "isRelevant": true (соответствует теме) / false (не относится к теме).
     * "score": оценка раскрытия темы от 0 до 100.
     * "topicCommentRu": рецензия на то, как раскрыта ситуация урока.
     * "levelCommentRu": комментарий о соответствии языка уровню текущего урока.

5. АКТИВНЫЙ СЛОВАРЬ УРОКА:
   - Оцени, какие слова из изученного списка темы применил ученик и насколько уместно в контексте.
   - "usedLessonWords": массив изученных слов.
   - "count": их количество.
   - "commentRu": комментарий учителя по лексике.

6. ОБРАЗЦОВАЯ ВЕРСИЯ (כְּתִיבָה מוֹפְתִית — correctedVersion):
   - В поле "hebrew" ОБЯЗАТЕЛЬНО напиши ПОЛНОСТЬЮ ИСПРАВЛЕННЫЙ эталонный вариант текста на живом иврите с ПОЛНЫМИ ОГЛАСОВКАМИ (ניקוד).
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО копировать ошибки и опечатки ученика в "correctedVersion"! Все ошибочные слова (например: «תוב», «קאורים», «להיתגאת») должны быть исправлены на грамотный литературный иврит носителя («בּוֹקֶר טוֹב», «קוֹרְאִים», «לְהִתְרָאוֹת»).
   - Поле "transcription" должно содержать полную фонетическую транскрипцию исправленного текста СТРОГО русскими буквами (кириллицей! напр. «бо́кер тов...», никакой латиницы!) по стандарту ульпана (буква 'h' для ה, ударения знаками акцента).
   - КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО писать транскрипцию на английском/латинице!
   - Литературный русский перевод ("translation") исправленного варианта.

7. БАЛЛ И СТАТУС (score, rating):
   - Оценка 0-100:
     * Если есть орфографические ошибки: снимай по 5-8 баллов за каждую.
     * Если есть ошибки порядка слов: снимай по 10-12 баллов за каждую.
     * Если есть грамматические ошибки: снимай по 8-10 баллов за каждую.
     * Если текст не по теме: балл не более 50.
     * Если объем слишком мал: штраф 10-15 баллов.
   - "rating": "excellent" (88-100), "good" (70-87), "needs_work" (<70).`;

    const userPrompt = `ДАННЫЕ УРОКА И ЗАДАНИЯ:
- Номер урока: ${lessonId}
- Ступень обучения: ${levelLabelRu}
- Тема сочинения: "${essayPrompt.topicRu}" (${essayPrompt.topicHe})
- Коммуникативная ситуация: "${essayPrompt.situationRu}"
- Фокус грамматики урока: "${essayPrompt.grammarFocusRu}"
- Рекомендуемые слова урока: ${JSON.stringify(essayPrompt.suggestedWords?.map((w) => `${w.hebrew} (${w.translation})`) || [])}
- Рекомендуемый объём: от ${essayPrompt.minWords} слов
- Пол ученика: ${userGender === 'female' ? 'Женский (נקבה)' : 'Мужской (זכר)'}
- ВАЖНО ПО ОРФОГРАФИИ: Проверяй правописание ВСЕХ слов сочинения ученика без исключения (включая общеупотребительные слова, приветствия, продукты и слова прошлых уроков), а не только рекомендованных слов текущей темы!

СОЧИНЕНИЕ УЧЕНИКА ДЛЯ ПРОВЕРКИ:
"""
${trimmedEssay}
"""

${detectedSpelling.length > 0 ? `ПРЕДВАРИТЕЛЬНЫЙ ДЕТЕКТОР ОБНАРУЖИЛ ОРФОГРАФИЧЕСКИЕ ОШИБКИ: ${JSON.stringify(detectedSpelling.map(s => `${s.wrongWord} -> ${s.correctWord}`))}` : ''}
${detectedWordOrder.length > 0 ? `ПРЕДВАРИТЕЛЬНЫЙ ДЕТЕКТОР ОБНАРУЖИЛ НАРУШЕНИЯ ПОРЯДКА СЛОВ: ${JSON.stringify(detectedWordOrder.map(e => e.wrongPhrase))}` : ''}
${detectedGrammar.length > 0 ? `ПРЕДВАРИТЕЛЬНЫЙ ДЕТЕКТОР ОБНАРУЖИЛ ГРАММАТИЧЕСКИЕ ОШИБКИ: ${JSON.stringify(detectedGrammar.map(e => e.wrongPhrase))}` : ''}

ОТВЕТЬ СТРОГО В ФОРМАТЕ JSON БЕЗ ЛИШНЕГО ТЕКСТА И РАЗМЕТКИ СЛЕДУЮЩЕЙ СТРУКТУРОЙ:
{
  "score": 85,
  "rating": "good",
  "summaryRu": "Тёплый ободряющий, но объективный отзыв преподавателя о сочинении.",
  "taskCompliance": {
    "isRelevant": true,
    "score": 90,
    "topicCommentRu": "Комментарий о том, насколько полно раскрыта коммуникативная ситуация темы.",
    "levelCommentRu": "Оценка соответствия сложности текста уровню урока."
  },
  "spellingFeedback": {
    "hasErrors": false,
    "items": [
      {
        "wrongWord": "слово_с_ошибкой",
        "correctWord": "правильное_слово",
        "explanationRu": "Методическое объяснение правила правописания на русском языке"
      }
    ],
    "generalAdviceRu": "Общий совет по орфографии и запоминанию корней"
  },
  "wordOrderFeedback": {
    "hasErrors": false,
    "items": [
      {
        "ruleNameRu": "Прилагательное после существительного",
        "issueSnippet": "фрагмент_с_ошибкой",
        "correctionSnippet": "исправленный_фрагмент",
        "explanationRu": "Объяснение правила порядка слов в иврите"
      }
    ],
    "generalAdviceRu": "Совет по естественной структуре предложения"
  },
  "grammarFeedback": {
    "items": [
      {
        "type": "gender_agreement",
        "wrongSnippet": "фрагмент_с_ошибкой",
        "correctionSnippet": "исправленный_фрагмент",
        "explanationRu": "Объяснение правила рода, числа или предлога"
      }
    ],
    "genderAgreementRu": "Комментарий о согласовании рода автора (${userGender === 'female' ? 'женский' : 'мужской'})"
  },
  "vocabularyAnalysis": {
    "usedLessonWords": ["слова", "из", "урока"],
    "count": 3,
    "commentRu": "Оценка использования словарного запаса урока"
  },
  "correctedVersion": {
    "hebrew": "Полностью исправленный связный текст БЕЗ ошибок ученика с полными огласовками (ניקוד)",
    "transcription": "Фонетическая транскрипция исправленного текста СТРОГО русскими буквами (кириллицей! напр. бóкер тов... Никакой латиницы!)",
    "translation": "Литературный перевод исправленного варианта на русский язык"
  },
  "valuableTipsRu": [
    "Первый полезный совет для живой речи в Израиле",
    "Второй полезный совет",
    "Третий совет"
  ]
}`;

    // Санитизатор орфографических замечаний для предотвращения галлюцинаций LLM.
    // Если модель приписала слову несуществующую букву (например, «мем-софит» в слове להתראות),
    // мы программно исправляем объяснение на выверенное и корректное.
    const sanitizeSpellingItem = (item: SpellingCheckItem): SpellingCheckItem => {
      const wrongWord = (item.wrongWord || '').trim();
      const correctWord = (item.correctWord || '').trim();
      let explanationRu = (item.explanationRu || '').trim();

      const sofitChecks = [
        { letters: ['מ', 'ם'], terms: ['мем-софит', 'мем софит', 'букв ם', 'буквой ם', 'букву ם', 'буква ם', 'буквой מ', 'буква מ'] },
        { letters: ['נ', 'ן'], terms: ['нун-софит', 'нун софит', 'букв ן', 'буквой ן', 'букву ן', 'буква ן', 'буквой נ', 'буква נ'] },
        { letters: ['צ', 'ץ'], terms: ['цади-софит', 'цади софит', 'букв ץ', 'буквой ץ', 'букву ץ', 'буква ץ', 'буквой צ', 'буква צ'] },
        { letters: ['פ', 'ף'], terms: ['пей-софит', 'пей софит', 'букв ף', 'буквой ף', 'букву ף', 'буква ף', 'буквой פ', 'буква פ'] },
        { letters: ['כ', 'ך'], terms: ['хаф-софит', 'хаф софит', 'букв ך', 'буквой ך', 'букву ך', 'буква ך', 'буквой כ', 'буква כ'] },
      ];

      const cleanFull = stripNikkud(wrongWord + ' ' + correctWord);
      for (const check of sofitChecks) {
        const hasLetter = check.letters.some((l) => cleanFull.includes(l));
        if (!hasLetter) {
          const lowerExp = explanationRu.toLowerCase();
          const hasHallucinatedTerm = check.terms.some((term) => lowerExp.includes(term.toLowerCase()));
          if (hasHallucinatedTerm) {
            explanationRu = `Слово пишется как «${correctWord}». Обратите внимание на правильный состав букв.`;
            break;
          }
        }
      }

      return { wrongWord, correctWord, explanationRu };
    };

    // Функция нормализации и объединения данных LLM с детекторами безопасности
    const normalizeAndEnforceSafety = (parsed: any): EssayEvaluationResult => {
      if (!parsed || typeof parsed.score !== 'number' || !Number.isFinite(parsed.score) ||
          parsed.score < 0 || parsed.score > 100 || typeof parsed.summaryRu !== 'string' ||
          !parsed.summaryRu.trim() || typeof parsed.taskCompliance?.isRelevant !== 'boolean') {
        throw new Error('Invalid essay assessment');
      }

      // 1. Извлечение rawSpellingItems с поддержкой camelCase, snake_case и массивов
      const rawSpelling: any =
        parsed.spellingFeedback ||
        parsed.spelling_feedback ||
        parsed.spellingErrors ||
        parsed.spelling_errors;

      const rawSpellingArray: any[] = Array.isArray(rawSpelling)
        ? rawSpelling
        : Array.isArray(rawSpelling?.items)
        ? rawSpelling.items
        : Array.isArray(rawSpelling?.errors)
        ? rawSpelling.errors
        : [];

      const rawSpellingItems: SpellingCheckItem[] = [];
      for (const item of rawSpellingArray) {
        if (!item || typeof item !== 'object') continue;
        const wrongWord = String(
          item.wrongWord || item.wrong_word || item.wrong || item.errorWord || item.error_word || item.error || item.word || item.original || item.originalWord || ''
        ).trim();
        const correctWord = String(
          item.correctWord || item.correct_word || item.correct || item.correction || item.fixedWord || item.fixed_word || item.fixed || ''
        ).trim();
        const explanationRu = String(
          item.explanationRu || item.explanation_ru || item.explanation || item.rule || item.comment || item.reason || ''
        ).trim();

        if (wrongWord && correctWord) {
          // Если различие только в огласовках (никуде) - это не орфографическая ошибка
          if (stripNikkud(wrongWord) === stripNikkud(correctWord)) {
            continue;
          }
          rawSpellingItems.push({ wrongWord, correctWord, explanationRu });
        }
      }

      // 2. Извлечение wordOrderItems (camelCase + snake_case)
      const rawWordOrder: any =
        parsed.wordOrderFeedback ||
        parsed.word_order_feedback ||
        parsed.wordOrderErrors ||
        parsed.word_order_errors;

      const rawWordOrderArray: any[] = Array.isArray(rawWordOrder)
        ? rawWordOrder
        : Array.isArray(rawWordOrder?.items)
        ? rawWordOrder.items
        : Array.isArray(rawWordOrder?.errors)
        ? rawWordOrder.errors
        : [];

      const wordOrderItems: WordOrderCheckItem[] = [];
      for (const item of rawWordOrderArray) {
        if (!item || typeof item !== 'object') continue;
        const ruleNameRu = String(item.ruleNameRu || item.rule_name_ru || item.rule || item.name || 'Порядок слов в словосочетании').trim();
        const issueSnippet = String(item.issueSnippet || item.issue_snippet || item.wrong || item.wrongSnippet || item.wrong_snippet || '').trim();
        const correctionSnippet = String(item.correctionSnippet || item.correction_snippet || item.correct || item.correctSnippet || item.correct_snippet || '').trim();
        const explanationRu = String(item.explanationRu || item.explanation_ru || item.explanation || item.reason || '').trim();
        if (issueSnippet || correctionSnippet) {
          wordOrderItems.push({ ruleNameRu, issueSnippet, correctionSnippet, explanationRu });
        }
      }

      // 3. Извлечение grammarItems (camelCase + snake_case)
      const rawGrammar: any =
        parsed.grammarFeedback ||
        parsed.grammar_feedback ||
        parsed.grammarErrors ||
        parsed.grammar_errors;

      const rawGrammarArray: any[] = Array.isArray(rawGrammar)
        ? rawGrammar
        : Array.isArray(rawGrammar?.items)
        ? rawGrammar.items
        : Array.isArray(rawGrammar?.errors)
        ? rawGrammar.errors
        : [];

      const grammarItems: GrammarCheckItem[] = [];
      for (const item of rawGrammarArray) {
        if (!item || typeof item !== 'object') continue;
        const type = (item.type || 'syntax') as any;
        const wrongSnippet = String(item.wrongSnippet || item.wrong_snippet || item.wrong || item.issueSnippet || item.issue_snippet || '').trim();
        const correctionSnippet = String(item.correctionSnippet || item.correction_snippet || item.correct || item.correctSnippet || item.correct_snippet || '').trim();
        const explanationRu = String(item.explanationRu || item.explanation_ru || item.explanation || item.reason || '').trim();
        if (wrongSnippet || correctionSnippet) {
          grammarItems.push({ type, wrongSnippet, correctionSnippet, explanationRu });
        }
      }

      // 4. Разбор эталонной версии от LLM и дифф-сверка
      const rawCorrected = parsed.correctedVersion || parsed.corrected_version || parsed.correctVersion;
      let initialCorrectedHebrew = (typeof rawCorrected?.hebrew === 'string' ? rawCorrected.hebrew : '').trim();

      // Дифф-сверка между словами ученика и исправленным вариантом
      if (initialCorrectedHebrew) {
        const userWords = trimmedEssay.split(/[\s,.;:!?«»"()־-]+/).map(w => stripNikkud(w).trim()).filter(w => w.length >= 2);
        const correctedWords = stripNikkud(initialCorrectedHebrew).split(/[\s,.;:!?«»"()־-]+/).map(w => w.trim()).filter(w => w.length >= 2);

        for (const uWord of userWords) {
          if (VALID_PROPER_NAMES_AND_PARTICLES.has(uWord)) continue;
          if (lookupOfflineWord(uWord)) continue;
          if (rawSpellingItems.some(it => stripNikkud(it.wrongWord) === uWord)) continue;

          for (const cWord of correctedWords) {
            if (cWord === uWord) continue;
            const dist = levenshteinDistance(uWord, cWord);
            if (dist >= 1 && dist <= 2) {
              rawSpellingItems.push({
                wrongWord: uWord,
                correctWord: cWord,
                explanationRu: `Слово пишется как «${cWord}». Обратите внимание на правильный состав букв.`,
              });
              break;
            }
          }
        }
      }

      // 5. Синхронизация предварительно найденных орфографических ошибок
      for (const sp of detectedSpelling) {
        if (!rawSpellingItems.some((it) => stripNikkud(it.wrongWord) === stripNikkud(sp.wrongWord))) {
          rawSpellingItems.push(sp);
        }
      }

      // Санитизация каждого элемента от галлюцинаций LLM
      const spellingItems = rawSpellingItems.map(sanitizeSpellingItem);

      // Синхронизация ошибок порядка слов
      for (const wo of detectedWordOrder) {
        if (!wordOrderItems.some((it) => it.issueSnippet?.includes(wo.wrongPhrase))) {
          wordOrderItems.push({
            ruleNameRu: 'Порядок слов в словосочетании',
            issueSnippet: wo.wrongPhrase,
            correctionSnippet: wo.correctPhrase,
            explanationRu: wo.explanationRu,
          });
        }
      }

      // Синхронизация грамматических ошибок
      for (const gr of detectedGrammar) {
        if (!grammarItems.some((it) => it.wrongSnippet?.includes(gr.wrongPhrase))) {
          grammarItems.push({
            type: gr.type,
            wrongSnippet: gr.wrongPhrase,
            correctionSnippet: gr.correctPhrase,
            explanationRu: gr.explanationRu,
          });
        }
      }

      const hasSpelling = spellingItems.length > 0;
      const hasWordOrder = wordOrderItems.length > 0;
      const hasGrammar = grammarItems.length > 0;

      let finalScore = typeof parsed.score === 'number' ? parsed.score : 85;

      // Если найдены ошибки, оценка не должна быть идеальной
      if (hasSpelling || hasWordOrder || hasGrammar) {
        const errorCount = spellingItems.length + wordOrderItems.length + grammarItems.length;
        const maxAllowedScore = Math.max(50, 92 - errorCount * 7);
        if (finalScore > maxAllowedScore) {
          finalScore = maxAllowedScore;
        }
      }

      finalScore = Math.max(0, Math.min(100, Math.round(finalScore)));
      const finalRating: 'excellent' | 'good' | 'needs_work' =
        finalScore >= 88 ? 'excellent' : finalScore >= 70 ? 'good' : 'needs_work';

      const taskCompliance: TaskComplianceFeedback = {
        isRelevant: typeof parsed.taskCompliance?.isRelevant === 'boolean' ? parsed.taskCompliance.isRelevant : true,
        score: typeof parsed.taskCompliance?.score === 'number' ? parsed.taskCompliance.score : finalScore,
        topicCommentRu: parsed.taskCompliance?.topicCommentRu || `Сочинение на тему «${essayPrompt.topicRu}».`,
        levelCommentRu: parsed.taskCompliance?.levelCommentRu || `Текст оценён для ступени ${levelLabelRu}.`,
      };

      const usedWordsList = Array.isArray(parsed.vocabularyAnalysis?.usedLessonWords)
        ? parsed.vocabularyAnalysis.usedLessonWords
        : [];

      // Устранение противоречий в рецензии (summaryRu):
      let summaryRu = parsed.summaryRu || 'Ваше сочинение проверено преподавателем ульпана.';
      if (!hasSpelling && !hasWordOrder && !hasGrammar) {
        if (/ошибк|исправлен|неточност|замечан/i.test(summaryRu)) {
          summaryRu = 'Отличное сочинение! Текст написан грамотно, все слова и грамматические формы использованы верно.';
        }
      } else if (hasSpelling && !/ошибк|орфограф|написан|букв|замечан/i.test(summaryRu)) {
        summaryRu = `${summaryRu} Обратите внимание на замечания по написанию слов.`;
      }

      let finalCorrectedHebrew = initialCorrectedHebrew;
      const cleanFinalCorrected = stripNikkud(finalCorrectedHebrew);
      const cleanEssay = stripNikkud(trimmedEssay);

      // 1. Если исправленный иврит отсутствует или полностью повторяет текст ученика с ошибками:
      if (!finalCorrectedHebrew || (cleanFinalCorrected === cleanEssay && spellingItems.length > 0)) {
        let fixed = trimmedEssay;
        for (const sp of spellingItems) {
          if (sp.wrongWord && sp.correctWord) {
            const escaped = sp.wrongWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            fixed = fixed.replace(new RegExp(escaped, 'g'), stripNikkud(sp.correctWord));
          }
        }
        finalCorrectedHebrew = fixed;
      }

      // 2. Гарантированно заменяем в finalCorrectedHebrew любые остаточные опечатки ученика
      for (const sp of spellingItems) {
        if (sp.wrongWord && sp.correctWord) {
          const escaped = sp.wrongWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          finalCorrectedHebrew = finalCorrectedHebrew.replace(new RegExp(escaped, 'g'), sp.correctWord);
        }
      }

      // 3. Обогащаем огласовками из словаря, если текст остался без никуда
      if (finalCorrectedHebrew && !/[\u0591-\u05BD\u05BF\u05C1-\u05C2\u05C4-\u05C5\u05C7]/.test(finalCorrectedHebrew)) {
        finalCorrectedHebrew = vocalizeTextFromDictionary(finalCorrectedHebrew, essayPrompt.suggestedWords);
      }

      // 4. Если исправленный текст все еще пуст, берем эталонное сочинение темы урока
      if (!finalCorrectedHebrew && essayPrompt.sampleEssay?.hebrew) {
        finalCorrectedHebrew = essayPrompt.sampleEssay.hebrew;
      } else if (!finalCorrectedHebrew) {
        finalCorrectedHebrew = trimmedEssay;
      }

      const correctedTranslation =
        (typeof rawCorrected?.translation === 'string' && rawCorrected.translation.trim()) ||
        essayPrompt.sampleEssay?.translation ||
        'Эталонный вариант на иврите.';

      let correctedTranscription =
        (typeof rawCorrected?.transcription === 'string' && rawCorrected.transcription.trim()) ||
        (essayPrompt.sampleEssay?.hebrew && stripNikkud(essayPrompt.sampleEssay.hebrew) === stripNikkud(finalCorrectedHebrew)
          ? essayPrompt.sampleEssay.transcription
          : '') ||
        '';

      correctedTranscription = ensureCyrillicHebrewTranscription(
        correctedTranscription,
        finalCorrectedHebrew
      );

      return {
        score: finalScore,
        rating: finalRating,
        summaryRu,
        taskCompliance,
        spellingFeedback: {
          hasErrors: hasSpelling,
          items: spellingItems,
          generalAdviceRu: hasSpelling
            ? (parsed.spellingFeedback?.generalAdviceRu || parsed.spelling_feedback?.general_advice_ru || 'Обратите внимание на правильное написание слов и созвучные буквы.')
            : 'Орфографических ошибок не обнаружено!',
        },
        wordOrderFeedback: {
          hasErrors: hasWordOrder,
          items: wordOrderItems,
          generalAdviceRu: hasWordOrder
            ? (parsed.wordOrderFeedback?.generalAdviceRu || parsed.word_order_feedback?.general_advice_ru || 'В иврите признак следует после предмета, а отрицание «לא» перед глаголом.')
            : 'Порядок слов верный!',
        },
        grammarFeedback: {
          items: grammarItems,
          genderAgreementRu: parsed.grammarFeedback?.genderAgreementRu || parsed.grammar_feedback?.gender_agreement_ru,
        },
        vocabularyAnalysis: {
          usedLessonWords: usedWordsList,
          count: typeof parsed.vocabularyAnalysis?.count === 'number' ? parsed.vocabularyAnalysis.count : usedWordsList.length,
          commentRu: parsed.vocabularyAnalysis?.commentRu || parsed.vocabulary_analysis?.comment_ru || 'Используйте больше изученной лексики.',
        },
        correctedVersion: {
          hebrew: finalCorrectedHebrew,
          transcription: correctedTranscription,
          translation: correctedTranslation,
        },
        valuableTipsRu: Array.isArray(parsed.valuableTipsRu) && parsed.valuableTipsRu.length > 0
          ? parsed.valuableTipsRu
          : (Array.isArray(parsed.valuable_tips_ru) && parsed.valuable_tips_ru.length > 0
              ? parsed.valuable_tips_ru
              : [
                  'В иврите прилагательное всегда ставится после существительного (ספר טוב).',
                  'Отрицание «לא» всегда ставится строго перед глаголом (לא רוצה).',
                  'Конечные буквы-софиты (ם, ן, ץ, ף, ך) пишутся только на конце слов.',
                ]),
      };
    };

    // Попытка 1: Gemini LLM (основной движок, карусель моделей Google)
    const activeGeminiKeys = geminiKeys?.length ? geminiKeys : (geminiKey ? [geminiKey] : []);
    for (const currentGeminiKey of activeGeminiKeys) {
      const geminiList = geminiModels('essay');
      for (const gModel of geminiList) {
        try {
          const geminiRes = await fetchAi(
            `https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${currentGeminiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] },
                ],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const data = await geminiRes.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              const parsed = JSON.parse(rawText);
              return NextResponse.json(normalizeAndEnforceSafety(parsed));
            }
          }
        } catch (err) {
          console.warn(`Gemini evaluation error with model ${gModel}:`, err);
        }
      }
    }

    // Попытка 2: Groq LLM (страховочная карусель моделей)
    if (groqKey) {
      const groqModels = configuredGroqModels('essay');
      for (const groqModel of groqModels) {
        try {
          const res = await fetchAi('https://api.groq.com/openai/v1/chat/completions', {
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
              temperature: 0.2,
              response_format: { type: 'json_object' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content;
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              return NextResponse.json(normalizeAndEnforceSafety(parsed));
            }
          }
        } catch (err) {
          console.warn(`Groq evaluation error with model ${groqModel}:`, err);
        }
      }
    }

    // Попытка 3: Продвинутая локальная эвристическая оценка (offline fallback)
    return aiErrorResponse(new Error('Essay evaluation unavailable'));
  } catch (error) { return aiErrorResponse(error); }
}
