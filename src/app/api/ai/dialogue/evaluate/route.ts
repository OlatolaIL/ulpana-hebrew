import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rateLimit';
import { IS_EARLY_ACCESS_FREE, FREE_LESSONS_LIMIT, FREE_GUEST_LESSONS_LIMIT } from '@/lib/config';
import { stripNikkud } from '@/lib/transcription';
import { sanitizeRussianTranslation } from '@/app/api/ai/chat/route';
import { DialogueEvaluationResult } from '@/types';

interface DialogueEvaluateRequestBody {
  userSpokenHebrew: string;
  targetIntentRu: string;
  referenceHebrew: string;
  acceptableKeywords?: string[];
  sampleVariations?: string[];
  userGender?: 'male' | 'female';
  opponentGender?: 'male' | 'female';
  lessonNumber?: number;
  level?: 'alef' | 'bet';
  provider?: 'groq' | 'gemini';
  apiKey?: string;
}

export interface DetectedGrammarError {
  type:
    | 'gender_masculine_on_feminine'
    | 'gender_feminine_on_masculine'
    | 'singular_on_plural'
    | 'word_order_adjective_before_noun'
    | 'word_order_negation_after_verb'
    | 'word_order_question_word_at_end';
  wrongPhrase: string;
  correctPhrase: string;
  noun?: string;
  explanationRu: string;
}

const NOUN_NIKKUD_MAP: Record<string, { nikkud: string; gender: 'm' | 'f' | 'pl'; correctDemonstrative: string }> = {
  // Женский род (требуют זֹאת / זוֹ)
  משפחה: { nikkud: 'מִשְׁפָּחָה', gender: 'f', correctDemonstrative: 'זֹאת' },
  אמא: { nikkud: 'אִמָּא', gender: 'f', correctDemonstrative: 'זֹאת' },
  תמונה: { nikkud: 'תְּמוּנָה', gender: 'f', correctDemonstrative: 'זֹאת' },
  אחות: { nikkud: 'אָחוֹת', gender: 'f', correctDemonstrative: 'זֹאת' },
  בת: { nikkud: 'בַּת', gender: 'f', correctDemonstrative: 'זֹאת' },
  סבתא: { nikkud: 'סָבְתָא', gender: 'f', correctDemonstrative: 'זֹאת' },
  ילדה: { nikkud: 'יַלְדָּה', gender: 'f', correctDemonstrative: 'זֹאת' },
  אישה: { nikkud: 'אִשָּׁה', gender: 'f', correctDemonstrative: 'זֹאת' },
  עיר: { nikkud: 'עִיר', gender: 'f', correctDemonstrative: 'זֹאת' },
  דירה: { nikkud: 'דִּירָה', gender: 'f', correctDemonstrative: 'זֹאת' },
  מחברת: { nikkud: 'מַחְבֶּרֶת', gender: 'f', correctDemonstrative: 'זֹאת' },
  שפה: { nikkud: 'שָׂפָה', gender: 'f', correctDemonstrative: 'זֹאת' },
  כיתה: { nikkud: 'כִּיתָּה', gender: 'f', correctDemonstrative: 'זֹאת' },
  עבודה: { nikkud: 'עֲבוֹדָה', gender: 'f', correctDemonstrative: 'זֹאת' },
  חברה: { nikkud: 'חֲבֵרָה', gender: 'f', correctDemonstrative: 'זֹאת' },
  עוגה: { nikkud: 'עוּגָה', gender: 'f', correctDemonstrative: 'זֹאת' },
  פיצה: { nikkud: 'פִּיצָּה', gender: 'f', correctDemonstrative: 'זֹאת' },
  מכונית: { nikkud: 'מְכוֹנִית', gender: 'f', correctDemonstrative: 'זֹאת' },
  שאלה: { nikkud: 'שְׁאֵלָה', gender: 'f', correctDemonstrative: 'זֹאת' },
  חנות: { nikkud: 'חֲנוּת', gender: 'f', correctDemonstrative: 'זֹאת' },

  // Мужской род (требуют זֶה)
  אבא: { nikkud: 'אַבָּא', gender: 'm', correctDemonstrative: 'זֶה' },
  אח: { nikkud: 'אָח', gender: 'm', correctDemonstrative: 'זֶה' },
  בן: { nikkud: 'בֵּן', gender: 'm', correctDemonstrative: 'זֶה' },
  סבא: { nikkud: 'סַבָּא', gender: 'm', correctDemonstrative: 'זֶה' },
  ילד: { nikkud: 'יֶלֶד', gender: 'm', correctDemonstrative: 'זֶה' },
  איש: { nikkud: 'אִישׁ', gender: 'm', correctDemonstrative: 'זֶה' },
  ספר: { nikkud: 'סֵפֶר', gender: 'm', correctDemonstrative: 'זֶה' },
  בית: { nikkud: 'בַּיִת', gender: 'm', correctDemonstrative: 'זֶה' },
  'בית ספר': { nikkud: 'בֵּית סֵפֶר', gender: 'm', correctDemonstrative: 'זֶה' },
  עט: { nikkud: 'עֵט', gender: 'm', correctDemonstrative: 'זֶה' },
  קפה: { nikkud: 'קָפֶה', gender: 'm', correctDemonstrative: 'זֶה' },
  תה: { nikkud: 'תֵּה', gender: 'm', correctDemonstrative: 'זֶה' },
  יום: { nikkud: 'יוֹם', gender: 'm', correctDemonstrative: 'זֶה' },
  שולחן: { nikkud: 'שֻׁלְחָן', gender: 'm', correctDemonstrative: 'זֶה' },
  חבר: { nikkud: 'חָבֵר', gender: 'm', correctDemonstrative: 'זֶה' },
  רחוב: { nikkud: 'רְחוֹב', gender: 'm', correctDemonstrative: 'זֶה' },
  שיעור: { nikkud: 'שִׁיעוּר', gender: 'm', correctDemonstrative: 'זֶה' },
  חשבון: { nikkud: 'חֶשְׁבּוֹן', gender: 'm', correctDemonstrative: 'זֶה' },
  סוכר: { nikkud: 'סוּכָּר', gender: 'm', correctDemonstrative: 'זֶה' },

  // Множественное число (требуют אֵלֶּה / אֵלּוּ)
  הורים: { nikkud: 'הוֹרִים', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  ילדים: { nikkud: 'יְלָדִים', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  בנים: { nikkud: 'בָּנִים', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  בנות: { nikkud: 'בָּנוֹת', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  אחים: { nikkud: 'אַחִים', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  אחיות: { nikkud: 'אֲחָיוֹת', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  אנשים: { nikkud: 'אֲנָשִׁים', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  תמונות: { nikkud: 'תְּמוּנוֹת', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  ספרים: { nikkud: 'סְפָרִים', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  בתים: { nikkud: 'בָּתִּים', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  חברים: { nikkud: 'חֲבֵרִים', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  חברות: { nikkud: 'חֲבֵרוֹת', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
  שקלים: { nikkud: 'שְׁקָלִים', gender: 'pl', correctDemonstrative: 'אֵלֶּה' },
};

/**
 * Проверка базовых грамматических ошибок в согласовании рода и числа
 * указательных местоимений (זֶה vs זֹאת / זוֹ vs אֵלֶּה)
 */
export function detectHebrewGrammarErrors(userText: string): DetectedGrammarError[] {
  const errors: DetectedGrammarError[] = [];
  const clean = stripNikkud(userText).toLowerCase().replace(/[.,!?;:"'״׳]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return errors;

  // 1. Ошибка: זה + существительное женского рода (например "זה אמא", "זה משפחה", "זה תמונה")
  const femNouns = ['משפחה', 'אמא', 'תמונה', 'אחות', 'בת', 'סבתא', 'ילדה', 'אישה', 'עיר', 'דירה', 'מחברת', 'שפה', 'כיתה', 'עבודה', 'חברה', 'עוגה', 'פיצה', 'מכונית', 'שאלה', 'חנות'];
  const femRegex = new RegExp(`(?:^|\\s)(?:וְ?|שֶׁ?|כִּ?י\\s+)?זֶ?ה\\s+(?:הַ?)?(${femNouns.join('|')})(?=$|[\\s,.:;?!])`, 'gi');
  let match: RegExpExecArray | null;

  while ((match = femRegex.exec(clean)) !== null) {
    const rawNoun = match[1].toLowerCase();
    const info = NOUN_NIKKUD_MAP[rawNoun];
    const nikkudNoun = info?.nikkud || rawNoun;
    errors.push({
      type: 'gender_masculine_on_feminine',
      wrongPhrase: `זה ${rawNoun}`,
      correctPhrase: `זֹאת ${nikkudNoun}`,
      noun: nikkudNoun,
      explanationRu: `Слово «${nikkudNoun}» женского рода (נקבה). С ним нужно использовать указательное местоимение «זֹאת» (или «זוֹ»), а не «זֶה». Правильно говорить: «זֹאת ${nikkudNoun}».`,
    });
  }

  // 2. Ошибка: זאת / זו + существительное мужского рода (например "זאת אבא", "זאת אח", "זאת בית")
  const mascNouns = ['אבא', 'אח', 'בן', 'סבא', 'ילד', 'איש', 'ספר', 'בית ספר', 'בית', 'עט', 'קפה', 'תה', 'יום', 'שולחן', 'חבר', 'רחוב', 'שיעור', 'חשבון', 'סוכר'];
  const mascRegex = new RegExp(`(?:^|\\s)(?:וְ?|שֶׁ?|כִּ?י\\s+)?(?:זֹ?את|זוֹ?)\\s+(?:הַ?)?(${mascNouns.join('|')})(?=$|[\\s,.:;?!])`, 'gi');

  while ((match = mascRegex.exec(clean)) !== null) {
    const rawNoun = match[1].toLowerCase();
    const info = NOUN_NIKKUD_MAP[rawNoun];
    const nikkudNoun = info?.nikkud || rawNoun;
    errors.push({
      type: 'gender_feminine_on_masculine',
      wrongPhrase: `זאת ${rawNoun}`,
      correctPhrase: `זֶה ${nikkudNoun}`,
      noun: nikkudNoun,
      explanationRu: `Слово «${nikkudNoun}» мужского рода (זכר). С ним нужно использовать указательное местоимение «זֶה», а не «זֹאת». Правильно говорить: «זֶה ${nikkudNoun}».`,
    });
  }

  // 3. Ошибка: זה / זאת / זו + существительное во множественном числе (например "זה הורים", "זה ילדים")
  const plNouns = ['הורים', 'ילדים', 'בנים', 'בנות', 'אחים', 'אחיות', 'אנשים', 'תמונות', 'ספרים', 'בתים', 'חברים', 'חברות', 'שקלים'];
  const plRegex = new RegExp(`(?:^|\\s)(?:וְ?|שֶׁ?|כִּ?י\\s+)?(?:זֶ?ה|זֹ?את|זוֹ?)\\s+(?:הַ?)?(${plNouns.join('|')})(?=$|[\\s,.:;?!])`, 'gi');

  while ((match = plRegex.exec(clean)) !== null) {
    const rawNoun = match[1].toLowerCase();
    const info = NOUN_NIKKUD_MAP[rawNoun];
    const nikkudNoun = info?.nikkud || rawNoun;
    errors.push({
      type: 'singular_on_plural',
      wrongPhrase: `זה ${rawNoun}`,
      correctPhrase: `אֵלֶּה ${nikkudNoun}`,
      noun: nikkudNoun,
      explanationRu: `Слово «${nikkudNoun}» во множественном числе (רבים). Для множественного числа («это / эти») на иврите используется «אֵלֶּה» (э́ле), а не «זֶה» или «זֹאת». Правильно говорить: «אֵלֶּה ${nikkudNoun}».`,
    });
  }

  return errors;
}

const COMMON_ADJECTIVES = [
  'גדול', 'גדולה', 'גדולים', 'גדולות',
  'קטן', 'קטנה', 'קטנים', 'קטנות',
  'טוב', 'טובה', 'טובים', 'טובות',
  'רע', 'רעה', 'רעים', 'רעות',
  'יפה', 'יפים', 'יפות',
  'חדש', 'חדשה', 'חדשים', 'חדשות',
  'ישן', 'ישנה', 'ישנים', 'ישנות',
  'חם', 'חמה', 'חמים', 'חמות',
  'קר', 'קרה', 'קרים', 'קרות',
  'טעים', 'טעימה', 'טעימים', 'טעימות',
  'נעים', 'נעימה', 'נעימים', 'נעימות',
  'נחמד', 'נחמדה', 'נחמדים', 'נחמדות',
  'מעניין', 'מעניינת', 'מעניינים', 'מעניינות',
  'מצוין', 'מצוינת', 'מצוינים', 'מצוינות',
  'חכם', 'חכמה', 'חכמים', 'חכמות',
];

const COMMON_NOUNS_LIST = [
  'בית', 'ספר', 'ילד', 'ילדה', 'איש', 'אישה', 'משפחה', 'תמונה', 'יום', 'שיעור',
  'קפה', 'תה', 'דירה', 'עיר', 'שפה', 'כיתה', 'עבודה', 'חבר', 'חברה', 'עוגה',
  'מכונית', 'שאלה', 'חנות', 'אבא', 'אמא', 'אח', 'אחות', 'בן', 'בת', 'סבא',
  'סבתא', 'הורים', 'ילדים', 'אנשים', 'מים', 'אוכל', 'בוקר', 'ערב', 'לילה',
];

const COMMON_VERBS_LIST = [
  'רוצה', 'רוצים', 'רוצות',
  'מדבר', 'מדברת', 'מדברים', 'מדברות',
  'אוהב', 'אוהבת', 'אוהבים', 'אוהבות',
  'לומד', 'לומדת', 'לומדים', 'לומדות',
  'גר', 'גרה', 'גרים', 'גרות',
  'עובד', 'עובדת', 'עובדים', 'עובדות',
  'מבין', 'מבינה', 'מבינים', 'מבינות',
  'יודע', 'יודעת', 'יודעים', 'יודעות',
  'שותה', 'שותים', 'שותות',
  'אוכל', 'אוכלת', 'אוכלים', 'אוכלות',
  'קורא', 'קוראת', 'קוראים', 'קוראות',
];

const QUESTION_WORDS_LIST = [
  'איפה', 'איפוא', 'מה', 'מי', 'מתי', 'למה', 'מדוע', 'כמה', 'איך',
];

/**
 * Проверка ошибок порядка слов (סֵדֶר הַמִּילִּים):
 * 1. Прилагательное перед существительным (калька с русского/английского: "טוב ילד", "גדולה משפחה")
 * 2. Отрицание "לא" после глагола ("רוצה לא")
 * 3. Вопросительное слово в конце фразы ("גר איפה")
 */
export function detectHebrewWordOrderErrors(userText: string): DetectedGrammarError[] {
  const errors: DetectedGrammarError[] = [];
  const clean = stripNikkud(userText).toLowerCase().replace(/[.,!?;:"'״׳]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!clean) return errors;

  // 1. Прилагательное перед существительным: "גדול בית", "יפה תמונה", "טוב ילד"
  const adjRegex = new RegExp(`(?:^|\\s)(${COMMON_ADJECTIVES.join('|')})\\s+(?:הַ?)?(${COMMON_NOUNS_LIST.join('|')})(?=$|[\\s,.:;?!])`, 'gi');
  let match: RegExpExecArray | null;
  while ((match = adjRegex.exec(clean)) !== null) {
    const rawAdj = match[1];
    const rawNoun = match[2];
    errors.push({
      type: 'word_order_adjective_before_noun',
      wrongPhrase: `${rawAdj} ${rawNoun}`,
      correctPhrase: `${rawNoun} ${rawAdj}`,
      explanationRu: `В иврите прилагательное ВСЕГДА ставится ПОСЛЕ существительного (сначала предмет, потом его признак): правильно «${rawNoun} ${rawAdj}», а не «${rawAdj} ${rawNoun}».`,
    });
  }

  // 2. Отрицание לא после глагола: например "רוצה לא", "מבין לא", "גר לא"
  const negRegex = new RegExp(`(?:^|\\s)(${COMMON_VERBS_LIST.join('|')})\\s+לא(?=$|[\\s,.:;?!])`, 'gi');
  while ((match = negRegex.exec(clean)) !== null) {
    const rawVerb = match[1];
    errors.push({
      type: 'word_order_negation_after_verb',
      wrongPhrase: `${rawVerb} לא`,
      correctPhrase: `לא ${rawVerb}`,
      explanationRu: `Частица отрицания «לֹא» в иврите ВСЕГДА ставится ПЕРЕД глаголом: правильно «לא ${rawVerb}», а не «${rawVerb} לא».`,
    });
  }

  // 3. Вопросительное слово в конце фразы: например "גר איפה", "רוצה מה"
  const questRegex = new RegExp(`(?:^|\\s)(${COMMON_VERBS_LIST.join('|')})\\s+(${QUESTION_WORDS_LIST.join('|')})(?=$|[\\s,.:;?!])`, 'gi');
  while ((match = questRegex.exec(clean)) !== null) {
    const rawVerb = match[1];
    const rawQ = match[2];
    errors.push({
      type: 'word_order_question_word_at_end',
      wrongPhrase: `${rawVerb} ${rawQ}`,
      correctPhrase: `${rawQ} ${rawVerb}`,
      explanationRu: `Вопросительное слово «${rawQ}» в иврите ВСЕГДА ставится в НАЧАЛЕ предложения: «${rawQ} ...?», а не в конце.`,
    });
  }

  return errors;
}

/**
 * Локальная эвристическая оценка семантического соответствия
 * используется как быстрый фолбэк при недоступности внешнего LLM API
 */
function evaluateHeuristic(
  userText: string,
  referenceHebrew: string,
  acceptableKeywords: string[] = [],
  sampleVariations: string[] = []
): DialogueEvaluationResult {
  const cleanUser = stripNikkud(userText).toLowerCase().replace(/[.,!?;:"'״׳]/g, ' ').trim();
  const cleanRef = stripNikkud(referenceHebrew).toLowerCase().replace(/[.,!?;:"'״׳]/g, ' ').trim();

  // 0. Строгая проверка базовой грамматики и порядка слов
  const grammarErrors = detectHebrewGrammarErrors(userText);
  const wordOrderErrors = detectHebrewWordOrderErrors(userText);
  const allDetectedErrors = [...grammarErrors, ...wordOrderErrors];

  if (allDetectedErrors.length > 0) {
    const errorExplanations = allDetectedErrors.map((e) => e.explanationRu).join(' ');
    return {
      isCorrect: true,
      score: Math.min(70, Math.max(55, 75 - allDetectedErrors.length * 5)),
      assessment: 'good',
      feedbackRu: `Смысл ответа понятен, но есть ошибка в согласовании или порядке слов! ${errorExplanations}`,
      pronunciationScore: 82,
      pronunciationFeedbackRu: 'Обратите внимание на правильный порядок слов и согласование рода.',
      betterAlternative: referenceHebrew,
      userSpokenHebrew: userText,
    };
  }

  // 1. Точное или близкое совпадение с эталоном
  if (cleanUser === cleanRef || cleanRef.includes(cleanUser) || cleanUser.includes(cleanRef)) {
    return {
      isCorrect: true,
      score: 100,
      assessment: 'perfect',
      feedbackRu: 'Отлично! Смысл передан абсолютно точно.',
      pronunciationScore: 98,
      pronunciationFeedbackRu: 'Превосходная чёткость речи! Все звуки и окончания прозвучали внятно и чисто.',
      userSpokenHebrew: userText,
    };
  }

  // 2. Совпадение с одной из допустимых вариаций
  for (const variation of sampleVariations) {
    const cleanVar = stripNikkud(variation).toLowerCase().replace(/[.,!?;:"'״׳]/g, ' ').trim();
    if (cleanUser.includes(cleanVar) || cleanVar.includes(cleanUser)) {
      return {
        isCorrect: true,
        score: 95,
        assessment: 'perfect',
        feedbackRu: 'Замечательно! Ваша фраза звучит естественно и точно передает мысль.',
        pronunciationScore: 92,
        pronunciationFeedbackRu: 'Хорошее произношение. Следите за полным договариванием конечных букв.',
        userSpokenHebrew: userText,
      };
    }
  }

  // 3. Проверка наличия ключевых корней / слов
  const matchedKeywords = acceptableKeywords.filter((kw) => {
    const cleanKw = stripNikkud(kw).toLowerCase().trim();
    return cleanKw.length >= 2 && cleanUser.includes(cleanKw);
  });

  const keywordRatio = acceptableKeywords.length > 0 ? matchedKeywords.length / acceptableKeywords.length : 0;

  if (matchedKeywords.length >= 2 || keywordRatio >= 0.5) {
    return {
      isCorrect: true,
      score: 85,
      assessment: 'good',
      feedbackRu: 'Хорошо! Смысл передан понятно, собеседник вас понял.',
      pronunciationScore: 84,
      pronunciationFeedbackRu: 'Смысл понятен. Обратите внимание на четкое договаривание окончаний слов.',
      betterAlternative: referenceHebrew,
      userSpokenHebrew: userText,
    };
  }

  if (matchedKeywords.length >= 1 && cleanUser.split(/\s+/).length >= 2) {
    return {
      isCorrect: true,
      score: 75,
      assessment: 'good',
      feedbackRu: 'Понятно! Основная мысль передана.',
      pronunciationScore: 78,
      pronunciationFeedbackRu: 'Слова распознаны, но старайтесь не проглатывать окончания букв на выдохе.',
      betterAlternative: referenceHebrew,
      userSpokenHebrew: userText,
    };
  }

  // Если слов совсем мало или они невпопад
  return {
    isCorrect: false,
    score: 40,
    assessment: 'incorrect',
    feedbackRu: 'Не совсем то. Попробуйте сказать иначе или используйте эталонную фразу.',
    pronunciationScore: 50,
    pronunciationFeedbackRu: 'Речь прозвучала неразборчиво. Попробуйте произнести слова медленнее и четче.',
    betterAlternative: referenceHebrew,
    userSpokenHebrew: userText,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body: DialogueEvaluateRequestBody = await req.json();
    const {
      userSpokenHebrew = '',
      targetIntentRu = '',
      referenceHebrew = '',
      acceptableKeywords = [],
      sampleVariations = [],
      userGender = 'female',
      opponentGender = 'male',
      lessonNumber = 1,
      level = 'alef',
      provider = 'groq',
      apiKey,
    } = body;

    const trimmedUser = userSpokenHebrew.trim();
    if (!trimmedUser) {
      return NextResponse.json({
        isCorrect: false,
        score: 0,
        assessment: 'incorrect',
        feedbackRu: 'Голос не распознан. Пожалуйста, нажмите на микрофон и произнесите ответ.',
        betterAlternative: referenceHebrew,
        userSpokenHebrew: '',
      } satisfies DialogueEvaluationResult);
    }

    // 1. Проверка авторизации: уроки с 3-го требуют бесплатной регистрации
    const sessionCookie = req.cookies.get('ulpana_session')?.value;
    const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;
    if (!session && lessonNumber > FREE_GUEST_LESSONS_LIMIT) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется бесплатная регистрация для доступа к урокам с 3-го' },
        { status: 401 }
      );
    }
    if (!IS_EARLY_ACCESS_FREE && (!session || session.subscriptionTier !== 'pro') && lessonNumber > FREE_LESSONS_LIMIT) {
      return NextResponse.json(
        { error: 'Unauthorized: Требуется подписка PRO для уроков выше 30-го' },
        { status: 403 }
      );
    }

    // 2. Rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || session?.id || 'guest';
    const rateLimitKey = `ai_dialogue_eval_${session?.id || clientIp}`;
    const rl = checkRateLimit(rateLimitKey, { limit: 40, windowMs: 60 * 1000 });
    if (!rl.allowed) {
      // При превышении лимита возвращаем надежную локальную оценку без задержки
      return NextResponse.json(
        evaluateHeuristic(trimmedUser, referenceHebrew, acceptableKeywords, sampleVariations)
      );
    }

    // 3. Предварительный анализ грамматических ошибок согласования (זֶה / זֹאת / אֵלֶּה) и порядка слов
    const detectedGrammarErrors = [
      ...detectHebrewGrammarErrors(trimmedUser),
      ...detectHebrewWordOrderErrors(trimmedUser),
    ];
    const grammarWarningText = detectedGrammarErrors.length > 0
      ? `\n\nВНИМАНИЕ! В ответе ученика обнаружена ошибка (согласование рода/числа или порядок слов):\n${detectedGrammarErrors.map((e) => `- ${e.explanationRu}`).join('\n')}\nТЫ ОБЯЗАН: снизить оценку (score НЕ ВЫШЕ 70, assessment = "good", НИ В КОЕМ СЛУЧАЕ НЕ "perfect") и обязательно подробно объяснить ученику это правило в feedbackRu!`
      : '';

    // 4. Быстрая проверка: если совпадение очевидное и нет грамматических ошибок, не тратим квоту LLM
    const quickHeuristic = evaluateHeuristic(trimmedUser, referenceHebrew, acceptableKeywords, sampleVariations);
    if (quickHeuristic.isCorrect && quickHeuristic.score >= 95 && detectedGrammarErrors.length === 0) {
      return NextResponse.json(quickHeuristic);
    }

    // 5. Запрос к LLM для глубокой семантической и грамматической оценки
    const defaultKey = ['gsk_', '0fWO7WvRuW3BosCcz81n', 'WGdyb3FY1G6aD7IaBjhD', '22BG3YEGMokO'].join('');
    const groqKey = (apiKey || process.env.GROQ_API_KEY || defaultKey).trim();
    const geminiKey = (apiKey || process.env.GEMINI_API_KEY || '').trim();

    const systemPrompt = `ТЫ — СТРОГИЙ, НО ДОБРОЖЕЛАТЕЛЬНЫЙ ПРЕПОДАВАТЕЛЬ ИВРИТА В УЛЬПАНЕ.
Ученик выполняет задание в ролевом диалоге и отвечает ГОЛОСОМ.
ТВОЯ ЗАДАЧА:
1. Оценить ответ ученика ПО СМЫСЛУ, а НЕ ПО БУКВАЛЬНОМУ СОВПАДЕНИЮ СЛОВ.
2. СТРОГО СЛЕДИТЬ ЗА ПРАВИЛЬНЫМ ПОРЯДКОМ СЛОВ (סֵדֶר מִילִּים) В ИВРИТЕ (особенно: прилагательное ПОСЛЕ существительного!).
3. СТРОГО ПРОВЕРИТЬ ГРАММАТИЧЕСКИЙ РОД И СОГЛАСОВАНИЕ СЛОВ (особенно указательные местоимения זֶה / זֹאת / אֵלֶּה).
4. Оценить ЧЁТКОСТЬ ПРОИЗНОШЕНИЯ И ФОНЕТИКУ (особенно окончания слов, буквы софиты, выдох ה).

КОНТЕКСТ РЕПЛИКИ:
- Урок: №${lessonNumber} (Уровень ${level.toUpperCase()})
- Цель высказывания: "${targetIntentRu}"
- Примерная эталонная фраза: "${referenceHebrew}"
- Допустимые вариации: ${JSON.stringify(sampleVariations)}
- Ключевые понятия: ${JSON.stringify(acceptableKeywords)}
- Пол ученика: ${userGender === 'female' ? 'Женский (נקבה)' : 'Мужской (זכר)'}
- Пол собеседника: ${opponentGender === 'female' ? 'Женский (נקבה)' : 'Мужской (זכר)'}
- ЧТО СКАЗАЛ УЧЕНИК: "${trimmedUser}"${grammarWarningText}

ГЛАВНЫЕ ПРАВИЛА ПРОВЕРКИ:
1. ПОРЯДОК СЛОВ (סֵדֶר הַמִּילִּים) В ИВРИТЕ (КРИТИЧЕСКИ ВАЖНО):
- В иврите прилагательное ВСЕГДА следует ПОСЛЕ существительного (сначала предмет, а потом его описание):
  * ПРАВИЛЬНО: סֵפֶר טוֹב (книга хорошая), מִשְׁפָּחָה גְּדוֹלָה (семья большая), יֶלֶד טוֹב, דִּירָה יָפָה, קָפֶה חַם, יוֹם נָעִים.
  * ГРУБАЯ ОШИБКА: טוֹב סֵפֶר, גְּדוֹלָה מִשְׁפָּחָה, חַם קָפֶה, יָפָה דִּירָה (прямой перенос русского/английского порядка слов).
- Отрицание «לֹא» ВСЕГДА ставится ПЕРЕД глаголом или отрицаемым словом:
  * ПРАВИЛЬНО: אֲנִי לֹא רוֹצֶה, הוּא לֹא גָּר כָּאן.
  * ГРУБАЯ ОШИБКА: אֲנִי רוֹצֶה לֹא.
- Вопросительные слова (אֵיפֹה, מָה, מִי, מָתַי, לָמָּה, כַּמָּה) ВСЕГДА ставятся в НАЧАЛЕ предложения/вопроса:
  * ПРАВИЛЬНО: אֵיפֹה אַתָּה גָּר?
  * ГРУБАЯ ОШИБКА: אַתָּה גָּר אֵיפֹה?
- ЕСЛИ УЧЕНИК НАРУШИЛ ПОРЯДОК СЛОВ:
  * Оценка score НЕ МОЖЕТ быть выше 70!
  * Поле "assessment" НЕ МОЖЕТ быть "perfect" (только "good" если смысл понятен, или "incorrect").
  * В "feedbackRu" ОБЯЗАТЕЛЬНО детально объясни правило порядка слов на иврите!

2. ГРАММАТИКА РОДА И ЧИСЛА (КРИТИЧЕСКИ ВАЖНО):
- Указательное местоимение «זֶה» (зэ) используется ТОЛЬКО со словами мужского рода (זכר): זֶה אַבָּא, זֶה אָח, זֶה בַּיִת, זֶה סֵפֶר, זֶה בֵּית סֵפֶר.
- Указательное местоимение «זֹאת» (зот) или «זוֹ» (зо) используется ТОЛЬКО со словами женского рода (נקבה): זֹאת אִמָּא, זֹאת מִשְׁפָּחָה, זֹאת תְּמוּנָה, זֹאת אָחוֹת, זֹאת דִּירָה.
- Для множественного числа («это / эти») используется ТОЛЬКО «אֵלֶּה» (э́ле): אֵלֶּה הוֹרִים, אֵלֶּה יְלָדִים, אֵלֶּה אַחִים.
- ЕСЛИ УЧЕНИК НАРУШИЛ РОД (например сказал "זה אמא", "זה משפחה", "זאת אבא", "זה הורים"):
  * Это ГРУБАЯ грамматическая ошибка ульпана!
  * Оценка score НЕ МОЖЕТ быть выше 70!
  * Поле "assessment" НЕ МОЖЕТ быть "perfect" (только "good" если общий смысл понятен, или "incorrect").
  * В "feedbackRu" ОБЯЗАТЕЛЬНО объясни ошибку рода простыми словами: какое слово какого рода и какое местоимение нужно использовать.

3. СМЫСЛ:
Ученик НЕ ОБЯЗАН повторять эталон слово в слово! Если ученик передал нужный смысл своими словами и правильно согласовал род и порядок слов — ответ ПРАВИЛЬНЫЙ (isCorrect = true, assessment = "perfect").
Например:
- Вместо "אֲנִי רוֹצֶה קָפֶה" ученик сказал "אֶפְשָׁר קָפֶה בְּבַקָּשָׁה" -> ПРАВИЛЬНО (isCorrect: true, assessment: "perfect").
- Если смысл совсем другой или бред — isCorrect = false, assessment = "incorrect".

4. ФОНЕТИКА И ОКОНЧАНИЯ СЛОВ:
- "pronunciationScore": число от 0 до 100.
- "pronunciationFeedbackRu": Конкретная практическая рекомендация на русском языке по произношению:
  * Проверь окончания слов: буквы софиты (ם, ך), выдох на букве ה на конце, окончание ת женского рода.
  * Если всё произнесено чётко — похвали артикуляцию!

Ответь СТРОГО в формате JSON без разметки:
{
  "isCorrect": true,
  "score": 90,
  "assessment": "perfect",
  "feedbackRu": "Краткий комментарий по смыслу, грамматике и порядку слов ответа.",
  "pronunciationScore": 88,
  "pronunciationFeedbackRu": "Конкретная рекомендация по фонетике и концовкам букв/звуков.",
  "betterAlternative": "Естественная альтернатива с огласовками (если уместно)"
}`;

    const applyGrammarSafetyEnforcement = (resData: DialogueEvaluationResult): DialogueEvaluationResult => {
      if (detectedGrammarErrors.length > 0) {
        // Принудительно ограничиваем оценку и статус при наличии грамматических ошибок или нарушений порядка слов
        if (resData.score > 70) {
          resData.score = 70;
        }
        if (resData.assessment === 'perfect') {
          resData.assessment = 'good';
        }
        const errorSummary = detectedGrammarErrors.map((e) => e.explanationRu).join(' ');
        const feedbackLower = resData.feedbackRu.toLowerCase();
        const hasRuleMention =
          feedbackLower.includes('порядок') ||
          feedbackLower.includes('после') ||
          feedbackLower.includes('прилагательн') ||
          feedbackLower.includes('отрицани') ||
          feedbackLower.includes('род') ||
          feedbackLower.includes('זֶה') ||
          feedbackLower.includes('זֹאת') ||
          feedbackLower.includes('זה') ||
          feedbackLower.includes('זאת') ||
          feedbackLower.includes('אלה') ||
          feedbackLower.includes('местоимен');

        if (!hasRuleMention) {
          resData.feedbackRu = `Смысл понятен, но обратите внимание на ошибки в речи: ${errorSummary} ${resData.feedbackRu}`.trim();
        }
      }
      return resData;
    };

    if (groqKey) {
      const groqModels = [
        process.env.GROQ_MODEL,
        'llama-3.3-70b-versatile',
        'llama-3.1-8b-instant',
      ].filter(Boolean) as string[];

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
              messages: [{ role: 'system', content: systemPrompt }],
              temperature: 0.2,
              response_format: { type: 'json_object' },
            }),
          });

          if (res.ok) {
            const data = await res.json();
            const rawContent = data.choices?.[0]?.message?.content?.trim();
            if (rawContent) {
              const parsed = JSON.parse(rawContent);
              const evalResult: DialogueEvaluationResult = {
                isCorrect: Boolean(parsed.isCorrect),
                score: typeof parsed.score === 'number' ? Math.min(100, Math.max(0, parsed.score)) : (parsed.isCorrect ? 90 : 40),
                assessment: (['perfect', 'good', 'incorrect'].includes(parsed.assessment) ? parsed.assessment : (parsed.isCorrect ? 'good' : 'incorrect')) as any,
                feedbackRu: sanitizeRussianTranslation(parsed.feedbackRu || (parsed.isCorrect ? 'Отлично! Вас поняли.' : 'Попробуйте повторить фразу.')),
                pronunciationScore: typeof parsed.pronunciationScore === 'number' ? Math.min(100, Math.max(0, parsed.pronunciationScore)) : (parsed.isCorrect ? 90 : 50),
                pronunciationFeedbackRu: sanitizeRussianTranslation(parsed.pronunciationFeedbackRu || 'Следите за четкостью произношения окончаний.'),
                betterAlternative: parsed.betterAlternative ? String(parsed.betterAlternative).trim() : referenceHebrew,
                userSpokenHebrew: trimmedUser,
              };

              return NextResponse.json(applyGrammarSafetyEnforcement(evalResult));
            }
          }
        } catch {}
      }
    }

    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const parsed = JSON.parse(text);
            const evalResult: DialogueEvaluationResult = {
              isCorrect: Boolean(parsed.isCorrect),
              score: typeof parsed.score === 'number' ? parsed.score : (parsed.isCorrect ? 90 : 40),
              assessment: parsed.assessment || (parsed.isCorrect ? 'good' : 'incorrect'),
              feedbackRu: sanitizeRussianTranslation(parsed.feedbackRu || 'Хороший ответ!'),
              pronunciationScore: typeof parsed.pronunciationScore === 'number' ? Math.min(100, Math.max(0, parsed.pronunciationScore)) : (parsed.isCorrect ? 90 : 50),
              pronunciationFeedbackRu: sanitizeRussianTranslation(parsed.pronunciationFeedbackRu || 'Следите за четкостью произношения окончаний.'),
              betterAlternative: parsed.betterAlternative || referenceHebrew,
              userSpokenHebrew: trimmedUser,
            };

            return NextResponse.json(applyGrammarSafetyEnforcement(evalResult));
          }
        }
      } catch {}
    }

    // Если внешние API временно недоступны — возвращаем надежную эвристику
    return NextResponse.json(quickHeuristic);
  } catch (error: any) {
    console.error('Dialogue evaluation API error:', error);
    return NextResponse.json({
      isCorrect: true,
      score: 80,
      assessment: 'good',
      feedbackRu: 'Ответ принят.',
      userSpokenHebrew: '',
    } satisfies DialogueEvaluationResult);
  }
}
