import { stripNikkud } from './transcription';

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

