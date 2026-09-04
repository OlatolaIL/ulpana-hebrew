import { Lesson, Word } from '@/types';
import { stripNikkud } from './transcription';

export interface DialogueWordHint {
  hebrew: string;
  transcription?: string;
  translation: string;
  category?: 'verb' | 'noun' | 'connector' | 'pronoun' | 'phrase';
}

export interface DialogueLessonHelp {
  sentencePatterns: string[];
  usefulWords: DialogueWordHint[];
  goalSummary?: string;
}

/**
 * Специальные речевые образцы и слова-подсказки для первых уроков Ульпана
 */
const HANDCRAFTED_HINTS: Record<number, {
  sentencePatternsMale: string[];
  sentencePatternsFemale: string[];
  usefulWordsMale: DialogueWordHint[];
  usefulWordsFemale: DialogueWordHint[];
  goalSummary: string;
}> = {
  1: {
    sentencePatternsMale: [
      'שָׁלוֹם, קוֹרְאִים לִי ___',
      'נָעִים מְאוֹד, אֲנִי ___',
      'מָה נִשְׁמַע? הַכֹּל טוֹב!',
    ],
    sentencePatternsFemale: [
      'שָׁלוֹם, קוֹרְאִים לִי ___',
      'נָעִים מְאוֹד, אֲנִי ___',
      'מָה נִשְׁמַע? הַכֹּל טוֹב!',
    ],
    usefulWordsMale: [
      { hebrew: 'שָׁלוֹם', transcription: 'шалóм', translation: 'Привет / Мир' },
      { hebrew: 'בֹּקֶר טוֹב', transcription: 'бóкер тов', translation: 'Доброе утро' },
      { hebrew: 'קוֹרְאִים לִי', transcription: 'коръӣм ли', translation: 'Меня зовут' },
      { hebrew: 'אֲנִי', transcription: 'анӣ', translation: 'Я' },
      { hebrew: 'נָעִים מְאוֹד', transcription: 'наӣм мэóд', translation: 'Очень приятно' },
      { hebrew: 'מָה נִשְׁמַע?', transcription: 'ма нишмá?', translation: 'Как дела?' },
      { hebrew: 'הַכֹּל בְּסֵדֶר', transcription: 'hакóль бэсéдер', translation: 'Всё в порядке' },
      { hebrew: 'תּוֹדָה', transcription: 'тодá', translation: 'Спасибо' },
    ],
    usefulWordsFemale: [
      { hebrew: 'שָׁלוֹם', transcription: 'шалóм', translation: 'Привет / Мир' },
      { hebrew: 'בֹּקֶר טוֹב', transcription: 'бóкер тов', translation: 'Доброе утро' },
      { hebrew: 'קוֹרְאִים לִי', transcription: 'коръӣм ли', translation: 'Меня зовут' },
      { hebrew: 'אֲנִי', transcription: 'анӣ', translation: 'Я' },
      { hebrew: 'נָעִים מְאוֹד', transcription: 'наӣм мэóд', translation: 'Очень приятно' },
      { hebrew: 'מָה נִשְׁמַע?', transcription: 'ма нишмá?', translation: 'Как дела?' },
      { hebrew: 'הַכֹּל בְּסֵדֶר', transcription: 'hакóль бэсéдер', translation: 'Всё в порядке' },
      { hebrew: 'תּוֹדָה', transcription: 'тодá', translation: 'Спасибо' },
    ],
    goalSummary: 'Поздоровайтесь, назовите своё имя и скажите «Очень приятно».',
  },
  2: {
    sentencePatternsMale: [
      'אֲנִי רוֹצֶה ___ עִם ___, בְּבַקָּשָׁה.',
      'אֶפְשָׁר ___ עִם סוּכָּר?',
      'כַּמָּה זֶה עוֹלֶה? אֶפְשָׁר חֶשְׁבּוֹן?',
    ],
    sentencePatternsFemale: [
      'אֲנִי רוֹצָה ___ עִם ___, בְּבַקָּשָׁה.',
      'אֶפְשָׁר ___ עִם סוּכָּר?',
      'כַּמָּה זֶה עוֹלֶה? אֶפְשָׁר חֶשְׁבּוֹן?',
    ],
    usefulWordsMale: [
      { hebrew: 'רוֹצֶה', transcription: 'роцé', translation: 'хочу (м.р.)' },
      { hebrew: 'קָפֶה', transcription: 'кафэ́', translation: 'кофе' },
      { hebrew: 'תֵּה', transcription: 'тэ', translation: 'чай' },
      { hebrew: 'עִם חָלָב', transcription: 'им халáв', translation: 'с молоком' },
      { hebrew: 'סוּכָּר', transcription: 'сукáр', translation: 'сахар' },
      { hebrew: 'מַיִם קָרִים', transcription: 'мáйим карӣм', translation: 'холодная вода' },
      { hebrew: 'עוּגָה', transcription: 'угá', translation: 'пирожное' },
      { hebrew: 'בְּבַקָּשָׁה', transcription: 'бэвакашá', translation: 'пожалуйста' },
      { hebrew: 'חֶשְׁבּוֹן', transcription: 'хежбóн', translation: 'счёт' },
    ],
    usefulWordsFemale: [
      { hebrew: 'רוֹצָה', transcription: 'роцá', translation: 'хочу (ж.р.)' },
      { hebrew: 'קָפֶה', transcription: 'кафэ́', translation: 'кофе' },
      { hebrew: 'תֵּה', transcription: 'тэ', translation: 'чай' },
      { hebrew: 'עִם חָלָב', transcription: 'им халáв', translation: 'с молоком' },
      { hebrew: 'סוּכָּר', transcription: 'сукáр', translation: 'сахар' },
      { hebrew: 'מַיִם קָרִים', transcription: 'мáйим карӣм', translation: 'холодная вода' },
      { hebrew: 'עוּגָה', transcription: 'угá', translation: 'пирожное' },
      { hebrew: 'בְּבַקָּשָׁה', transcription: 'бэвакашá', translation: 'пожалуйста' },
      { hebrew: 'חֶשְׁבּוֹן', transcription: 'хежбóн', translation: 'счёт' },
    ],
    goalSummary: 'Закажите напиток с молоком или сахаром и попросите счёт.',
  },
  3: {
    sentencePatternsMale: [
      'אֲנִי מִ___, וַאֲנִי גָּר בְּ___',
      'אֲנִי מְדַבֵּר רוּסִית וּקְצָת עִבְרִית.',
      'מֵאֵיפֹה אַתְּ? אֵיפֹה אַתְּ גָּרָה?',
    ],
    sentencePatternsFemale: [
      'אֲנִי מִ___, וַאֲנִי גָּרָה בְּ___',
      'אֲנִי מְדַבֶּרֶת רוּסִית וּקְצָת עִבְרִית.',
      'מֵאֵיפֹה אַתְּ? אֵיפֹה אַתְּ גָּרָה?',
    ],
    usefulWordsMale: [
      { hebrew: 'אֲנִי מִ...', transcription: 'анӣ ми...', translation: 'Я из...' },
      { hebrew: 'גָּר בְּ...', transcription: 'гар бэ...', translation: 'живу в (м.р.)' },
      { hebrew: 'מְדַבֵּר', transcription: 'мэдабэ́р', translation: 'говорю (м.р.)' },
      { hebrew: 'עִבְרִית', transcription: 'иврӣт', translation: 'иврит' },
      { hebrew: 'רוּסִית', transcription: 'русӣт', translation: 'русский' },
      { hebrew: 'קְצָת', transcription: 'кцат', translation: 'немного' },
      { hebrew: 'תֵּל אָבִיב', transcription: 'Тэль Авӣв', translation: 'Тель-Авив' },
      { hebrew: 'יְרוּשָׁלַיִם', transcription: 'Йэрушалáйим', translation: 'Иерусалим' },
    ],
    usefulWordsFemale: [
      { hebrew: 'אֲנִי מִ...', transcription: 'анӣ ми...', translation: 'Я из...' },
      { hebrew: 'גָּרָה בְּ...', transcription: 'гáра бэ...', translation: 'живу в (ж.р.)' },
      { hebrew: 'מְדַבֶּרֶת', transcription: 'мэдабэ́рет', translation: 'говорю (ж.р.)' },
      { hebrew: 'עִבְרִית', transcription: 'иврӣт', translation: 'иврит' },
      { hebrew: 'רוּסִית', transcription: 'русӣт', translation: 'русский' },
      { hebrew: 'קְצָת', transcription: 'кцат', translation: 'немного' },
      { hebrew: 'תֵּל אָבִיב', transcription: 'Тэль Авӣв', translation: 'Тель-Авив' },
      { hebrew: 'יְרוּשָׁלַיִם', transcription: 'Йэрушалáйим', translation: 'Иерусалим' },
    ],
    goalSummary: 'Расскажите, из какой вы страны, где живёте и на каких языках говорите.',
  },
  4: {
    sentencePatternsMale: [
      'זֶה ___ וְזֹאת ___.',
      'עַל הַשֻּׁלְחָן יֵשׁ ___ וְ___.',
      'זֶה שֻׁלְחָן, וְאֵלֶּה ___.',
    ],
    sentencePatternsFemale: [
      'זֶה ___ וְזֹאת ___.',
      'עַל הַשֻּׁלְחָן יֵשׁ ___ וְ___.',
      'זֶה שֻׁלְחָן, וְאֵלֶּה ___.',
    ],
    usefulWordsMale: [
      { hebrew: 'זֶה', transcription: 'зэ', translation: 'это, этот (м.р.)' },
      { hebrew: 'זֹאת', transcription: 'зот', translation: 'это, эта (ж.р.)' },
      { hebrew: 'סֵפֶר', transcription: 'сэ́фер', translation: 'книга (м.р.)' },
      { hebrew: 'מַחְבֶּרֶת', transcription: 'махбэ́рэт', translation: 'тетрадь (ж.р.)' },
      { hebrew: 'עֵט', transcription: 'эт', translation: 'ручка (м.р.)' },
      { hebrew: 'שֻׁלְחָן', transcription: 'шульхáн', translation: 'стол (м.р.)' },
      { hebrew: 'כִּסֵּא', transcription: 'кисэ́', translation: 'стул (м.р.)' },
      { hebrew: 'עַל הַשֻּׁלְחָן', transcription: 'аль hа-шульхáн', translation: 'на столе' },
      { hebrew: 'יֵשׁ', transcription: 'йеш', translation: 'есть / имеется' },
      { hebrew: 'אֵלֶּה', transcription: 'э́ле', translation: 'эти (мн.ч.)' },
      { hebrew: 'תַּלְמִידִים', transcription: 'тальмидӣм', translation: 'ученики' },
    ],
    usefulWordsFemale: [
      { hebrew: 'זֶה', transcription: 'зэ', translation: 'это, этот (м.р.)' },
      { hebrew: 'זֹאת', transcription: 'зот', translation: 'это, эта (ж.р.)' },
      { hebrew: 'סֵפֶר', transcription: 'сэ́фер', translation: 'книга (м.р.)' },
      { hebrew: 'מַחְבֶּרֶת', transcription: 'махбэ́рэт', translation: 'тетрадь (ж.р.)' },
      { hebrew: 'עֵט', transcription: 'эт', translation: 'ручка (м.р.)' },
      { hebrew: 'שֻׁלְחָן', transcription: 'шульхáн', translation: 'стол (м.р.)' },
      { hebrew: 'כִּסֵּא', transcription: 'кисэ́', translation: 'стул (м.р.)' },
      { hebrew: 'עַל הַשֻּׁלְחָן', transcription: 'аль hа-шульхáн', translation: 'на столе' },
      { hebrew: 'יֵשׁ', transcription: 'йеш', translation: 'есть / имеется' },
      { hebrew: 'אֵלֶּה', transcription: 'э́ле', translation: 'эти (мн.ч.)' },
      { hebrew: 'תַּלְמִידִים', transcription: 'тальмидӣм', translation: 'ученики' },
    ],
    goalSummary: 'Назовите предмет мужского рода (זֶה) и женского рода (זֹאת), лежащие на столе.',
  },
  5: {
    sentencePatternsMale: [
      'אֲנִי רוֹצֶה שְׁנֵי קִילוֹ ___, בְּבַקָּשָׁה.',
      'כַּמָּה עוֹלֶה קִילוֹ ___?',
      'אֶפְשָׁר שַׂקִּית, בְּבַקָּשָׁה? תּוֹדָה רַבָּה!',
    ],
    sentencePatternsFemale: [
      'אֲנִי רוֹצָה שְׁנֵי קִילוֹ ___, בְּבַקָּשָׁה.',
      'כַּמָּה עוֹלֶה קִילוֹ ___?',
      'אֶפְשָׁר שַׂקִּית, בְּבַקָּשָׁה? תּוֹדָה רַבָּה!',
    ],
    usefulWordsMale: [
      { hebrew: 'רוֹצֶה', transcription: 'роцé', translation: 'хочу (м.р.)' },
      { hebrew: 'כַּמָּה עוֹלֶה?', transcription: 'кáма олé?', translation: 'сколько стоит?' },
      { hebrew: 'קִילוֹ אֶחָד', transcription: 'кӣло эхáд', translation: '1 килограмм' },
      { hebrew: 'שְׁנֵי קִילוֹ', transcription: 'шнэй кӣло', translation: '2 килограмма' },
      { hebrew: 'עַגְבָנִיּוֹת', transcription: 'агванийóт', translation: 'помидоры' },
      { hebrew: 'מְלָפְפְוֹנִים', transcription: 'млафэфонӣм', translation: 'огурцы' },
      { hebrew: 'תַּפּוּזִים', transcription: 'тапузӣм', translation: 'апельсины' },
      { hebrew: 'שַׂקִּית', transcription: 'сакӣт', translation: 'пакет' },
      { hebrew: 'תּוֹדָה רַבָּה', transcription: 'тодá рабá', translation: 'большое спасибо' },
    ],
    usefulWordsFemale: [
      { hebrew: 'רוֹצָה', transcription: 'роцá', translation: 'хочу (ж.р.)' },
      { hebrew: 'כַּמָּה עוֹלֶה?', transcription: 'кáма олé?', translation: 'сколько стоит?' },
      { hebrew: 'קִילוֹ אֶחָד', transcription: 'кӣло эхáд', translation: '1 килограмм' },
      { hebrew: 'שְׁנֵי קִילוֹ', transcription: 'шнэй кӣло', translation: '2 килограмма' },
      { hebrew: 'עַגְבָנִיּוֹת', transcription: 'агванийóт', translation: 'помидоры' },
      { hebrew: 'מְלָפְפְוֹנִים', transcription: 'млафэфонӣм', translation: 'огурцы' },
      { hebrew: 'תַּפּוּזִים', transcription: 'тапузӣм', translation: 'апельсины' },
      { hebrew: 'שַׂקִּית', transcription: 'сакӣт', translation: 'пакет' },
      { hebrew: 'תּוֹדָה רַבָּה', transcription: 'тодá рабá', translation: 'большое спасибо' },
    ],
    goalSummary: 'Спросите цену, попросите 1 или 2 кг овощей и попросите пакет.',
  },
  6: {
    sentencePatternsMale: [
      'כֵּן, זֹאת הַמִּשְׁפָּחָה שֶׁלִּי.',
      'זֶה אַבָּא שֶׁלִּי, וְזֹאת אִמָּא שֶׁלִּי.',
      'יֵשׁ לִי אָח וְאָחוֹת, הֵם גָּרִים בְּ___.',
    ],
    sentencePatternsFemale: [
      'כֵּן, זֹאת הַמִּשְׁפָּחָה שֶׁלִּי.',
      'זֶה אַבָּא שֶׁלִּי, וְזֹאת אִמָּא שֶׁלִּי.',
      'יֵשׁ לִי אָח וְאָחוֹת, הֵם גָּרִים בְּ___.',
    ],
    usefulWordsMale: [
      { hebrew: 'מִשְׁפָּחָה', transcription: 'мишпахá', translation: 'семья' },
      { hebrew: 'שֶׁלִּי', transcription: 'шелӣ', translation: 'мой / моя' },
      { hebrew: 'אַבָּא', transcription: 'áба', translation: 'папа' },
      { hebrew: 'אִמָּא', transcription: 'ӣма', translation: 'мама' },
      { hebrew: 'אָח', transcription: 'ах', translation: 'брат' },
      { hebrew: 'אָחוֹת', transcription: 'ахóт', translation: 'сестра' },
      { hebrew: 'יֵשׁ לִי', transcription: 'йеш ли', translation: 'у меня есть' },
      { hebrew: 'אֵין לִי', transcription: 'эйн ли', translation: 'у меня нет' },
      { hebrew: 'גָּרִים בְּ...', transcription: 'гарӣм бэ...', translation: 'живут в...' },
    ],
    usefulWordsFemale: [
      { hebrew: 'מִשְׁפָּחָה', transcription: 'мишпахá', translation: 'семья' },
      { hebrew: 'שֶׁלִּי', transcription: 'шелӣ', translation: 'мой / моя' },
      { hebrew: 'אַבָּא', transcription: 'áба', translation: 'папа' },
      { hebrew: 'אִמָּא', transcription: 'ӣма', translation: 'мама' },
      { hebrew: 'אָח', transcription: 'ах', translation: 'брат' },
      { hebrew: 'אָחוֹת', transcription: 'ахóт', translation: 'сестра' },
      { hebrew: 'יֵשׁ לִי', transcription: 'йеш ли', translation: 'у меня есть' },
      { hebrew: 'אֵין לִי', transcription: 'эйн ли', translation: 'у меня нет' },
      { hebrew: 'גָּרִים בְּ...', transcription: 'гарӣм бэ...', translation: 'живут в...' },
    ],
    goalSummary: 'Расскажите о своей семье на фото: кто родители, есть ли братья и сестры.',
  },
  7: {
    sentencePatternsMale: [
      'אֲנִי מְחַפֵּשׂ דִּירָה שֶׁל שְׁנֵי חֲדָרִים.',
      'יֵשׁ בַּדִּירָה מְקָרֵר וּמִטָּה?',
      'אֵיפֹה הַדִּירָה נִמְצֵאת? כַּמָּה זֶה עוֹלֶה?',
    ],
    sentencePatternsFemale: [
      'אֲנִי מְחַפֶּשֶׂת דִּירָה שֶׁל שְׁנֵי חֲדָרִים.',
      'יֵשׁ בַּדִּירָה מְקָרֵר וּמִטָּה?',
      'אֵיפֹה הַדִּירָה נִמְצֵאת? כַּמָּה זֶה עוֹלֶה?',
    ],
    usefulWordsMale: [
      { hebrew: 'מְחַפֵּשׂ', transcription: 'мэхапэ́с', translation: 'ищу (м.р.)' },
      { hebrew: 'דִּירָה', transcription: 'дирá', translation: 'квартира' },
      { hebrew: 'שְׁנֵי חֲדָרִים', transcription: 'шнэй хадарӣм', translation: '2 комнаты' },
      { hebrew: 'שְׁלוֹשָׁה חֲדָרִים', transcription: 'шлошá хадарӣм', translation: '3 комнаты' },
      { hebrew: 'סָלוֹן', transcription: 'салóн', translation: 'гостиная' },
      { hebrew: 'מִטְבָּח', transcription: 'митбáх', translation: 'кухня' },
      { hebrew: 'יֵשׁ מְקָרֵר?', transcription: 'йеш мэкарэ́р?', translation: 'есть холодильник?' },
      { hebrew: 'מִטָּה', transcription: 'митá', translation: 'кровать' },
      { hebrew: 'אֵיפֹה', transcription: 'э́йфо', translation: 'где' },
    ],
    usefulWordsFemale: [
      { hebrew: 'מְחַפֶּשֶׂת', transcription: 'мэхапэ́сет', translation: 'ищу (ж.р.)' },
      { hebrew: 'דִּירָה', transcription: 'дирá', translation: 'квартира' },
      { hebrew: 'שְׁנֵי חֲדָרִים', transcription: 'шнэй хадарӣм', translation: '2 комнаты' },
      { hebrew: 'שְׁלוֹשָׁה חֲדָרִים', transcription: 'шлошá хадарӣм', translation: '3 комнаты' },
      { hebrew: 'סָלוֹן', transcription: 'салóн', translation: 'гостиная' },
      { hebrew: 'מִטְבָּח', transcription: 'митбáх', translation: 'кухня' },
      { hebrew: 'יֵשׁ מְקָרֵר?', transcription: 'йеш мэкарэ́р?', translation: 'есть холодильник?' },
      { hebrew: 'מִטָּה', transcription: 'митá', translation: 'кровать' },
      { hebrew: 'אֵיפֹה', transcription: 'э́йфо', translation: 'где' },
    ],
    goalSummary: 'Скажите риелтору, сколько комнат нужно и какая мебель требуется.',
  },
};

/**
 * Извлекает или формирует полезные слова и шаблоны фраз для ответа в любом уроке (1-100)
 */
export function getDialogueHelpForLesson(lesson: Lesson, gender: 'male' | 'female'): DialogueLessonHelp {
  const isFemale = gender === 'female';
  const handcrafted = HANDCRAFTED_HINTS[lesson.number];

  if (handcrafted) {
    return {
      sentencePatterns: isFemale ? handcrafted.sentencePatternsFemale : handcrafted.sentencePatternsMale,
      usefulWords: isFemale ? handcrafted.usefulWordsFemale : handcrafted.usefulWordsMale,
      goalSummary: handcrafted.goalSummary,
    };
  }

  // Автоматическая генерация для остальных уроков из dialogue.vocabularyHints и lesson.vocabulary
  const resultWords: DialogueWordHint[] = [];
  const seenHebrew = new Set<string>();

  const vocabMap = new Map<string, Word>();
  (lesson.vocabulary || []).forEach((w) => {
    vocabMap.set(stripNikkud(w.hebrew).trim(), w);
    if (w.hebrewPlain) {
      vocabMap.set(w.hebrewPlain.trim(), w);
    }
  });

  // 1. Сначала берём готовые подсказки vocabularyHints
  const rawHints = lesson.dialogue?.vocabularyHints || [];
  for (const hint of rawHints) {
    const cleanHint = hint.trim();
    if (!cleanHint) continue;

    const plain = stripNikkud(cleanHint);
    let matchedWord = vocabMap.get(plain);

    if (!matchedWord) {
      for (const [key, word] of vocabMap.entries()) {
        if (plain.includes(key) || key.includes(plain)) {
          matchedWord = word;
          break;
        }
      }
    }

    if (!seenHebrew.has(cleanHint)) {
      seenHebrew.add(cleanHint);
      resultWords.push({
        hebrew: cleanHint,
        transcription: matchedWord?.transcription,
        translation: matchedWord?.translation || cleanHint,
        category: 'phrase',
      });
    }
  }

  // 2. Дополняем ключевыми словами из словаря текущего урока
  for (const w of lesson.vocabulary || []) {
    if (resultWords.length >= 10) break;
    const cleanH = w.hebrew.trim();
    if (!seenHebrew.has(cleanH) && !seenHebrew.has(stripNikkud(cleanH))) {
      seenHebrew.add(cleanH);
      resultWords.push({
        hebrew: w.hebrew,
        transcription: w.transcription,
        translation: w.translation,
        category: (w.partOfSpeech as any) || 'noun',
      });
    }
  }

  // 3. Формируем шаблоны фраз на основе целей (goals)
  const goals = lesson.dialogue?.goals || [];
  const sentencePatterns: string[] = [];

  if (goals.length > 0) {
    for (const g of goals.slice(0, 3)) {
      const match = g.match(/\(([^)]+)\)/);
      if (match && /[\u0590-\u05FF]/.test(match[1])) {
        sentencePatterns.push(match[1].trim());
      }
    }
  }

  if (sentencePatterns.length === 0 && rawHints.length > 0) {
    sentencePatterns.push(...rawHints.slice(0, 2).map((h) => `${h}...`));
  }

  return {
    sentencePatterns,
    usefulWords: resultWords,
    goalSummary: goals[0] || lesson.dialogue?.situation || 'Ответьте на вопрос собеседника устно.',
  };
}
