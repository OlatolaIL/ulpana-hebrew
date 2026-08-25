import { stripNikkud } from './transcription';
import { DETAILED_LESSONS } from '@/data/lessonsData';

export interface DictionaryEntry {
  hebrew: string;
  hebrewPlain: string;
  transcription: string;
  translation: string;
  root?: string | null;
  partOfSpeech: string;
  exampleSentence?: {
    hebrew: string;
    transcription: string;
    translation: string;
  } | null;
}

export const ULPAN_OFFLINE_DICTIONARY: DictionaryEntry[] = [
  {
    hebrew: 'שָׁלוֹם',
    hebrewPlain: 'שלום',
    transcription: 'шалóм',
    translation: 'привет, здравствуйте, мир',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'שָׁלוֹם, מָה נִשְׁמַע?',
      transcription: 'шалóм, ма нишмá?',
      translation: 'Привет, как дела?',
    },
  },
  {
    hebrew: 'תּוֹדָה',
    hebrewPlain: 'תודה',
    transcription: 'тодá',
    translation: 'спасибо',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'תּוֹדָה רַבָּה!',
      transcription: 'тодá рабá!',
      translation: 'Большое спасибо!',
    },
  },
  {
    hebrew: 'בְּבַקָּשָׁה',
    hebrewPlain: 'בבקשה',
    transcription: 'бэвакашá',
    translation: 'пожалуйста',
    root: 'ב-ק-ש',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'בְּבַקָּשָׁה, הִנֵּה הַקָּפֶה.',
      transcription: 'бэвакашá, hинэ́ hа-кафэ́.',
      translation: 'Пожалуйста, вот кофе.',
    },
  },
  {
    hebrew: 'כַּמּוּבָן',
    hebrewPlain: 'כמובן',
    transcription: 'камувáн',
    translation: 'конечно, разумеется',
    root: 'ב-ו-ן',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'כַּמּוּבָן, בְּבַקָּשָׁה!',
      transcription: 'камувáн, бэвакашá!',
      translation: 'Конечно, пожалуйста!',
    },
  },
  {
    hebrew: 'בֶּטַח',
    hebrewPlain: 'בטח',
    transcription: 'бéтах',
    translation: 'конечно, наверняка',
    root: 'ב-ט-ח',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'בֶּטַח, אֵין בְּעָיָה.',
      transcription: 'бéтах, эн бэайá.',
      translation: 'Конечно, без проблем.',
    },
  },
  {
    hebrew: 'בְּסֵדֶר',
    hebrewPlain: 'בסדר',
    transcription: 'бэсéдер',
    translation: 'в порядке, хорошо, ладно',
    root: 'ס-ד-ר',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'הַכֹּל בְּסֵדֶר.',
      transcription: 'hакóль бэсéдер.',
      translation: 'Всё в порядке.',
    },
  },
  {
    hebrew: 'מְצוּיָּן',
    hebrewPlain: 'מצוין',
    transcription: 'мэцуйáн',
    translation: 'отлично, превосходно',
    root: 'צ-י-ן',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'סַבָּבָה',
    hebrewPlain: 'סבבה',
    transcription: 'сабáба',
    translation: 'круто, отлично, лады',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'בְּכֵיף',
    hebrewPlain: 'בכיף',
    transcription: 'бэкéйф',
    translation: 'с удовольствием, с кайфом',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'יוֹפִי',
    hebrewPlain: 'יופי',
    transcription: 'йóфи',
    translation: 'красота, отлично, здорово',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'אוּלַי',
    hebrewPlain: 'אולי',
    transcription: 'улáй',
    translation: 'может быть, возможно',
    partOfSpeech: 'adverb',
  },
  {
    hebrew: 'נָכוֹן',
    hebrewPlain: 'נכון',
    transcription: 'нахóн',
    translation: 'правильно, верно',
    root: 'כ-ו-ן',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'בָּרוּר',
    hebrewPlain: 'ברור',
    transcription: 'барӯр',
    translation: 'понятно, ясно',
    root: 'ב-ר-ר',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'הִנֵּה',
    hebrewPlain: 'הנה',
    transcription: 'hинэ́',
    translation: 'вот / здесь находится',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'הִנֵּה הַסֵּפֶר שֶׁלְּךָ.',
      transcription: 'hинэ́ hа-сéфер шэлха́.',
      translation: 'Вот твоя книга.',
    },
  },
  {
    hebrew: 'מַיִם',
    hebrewPlain: 'מים',
    transcription: 'мáйим',
    translation: 'вода',
    partOfSpeech: 'noun',
    exampleSentence: {
      hebrew: 'אֶפְשָׁר כּוֹס מַיִם?',
      transcription: 'эфшáр кос мáйим?',
      translation: 'Можно стакан воды?',
    },
  },
  {
    hebrew: 'קָרִים',
    hebrewPlain: 'קרים',
    transcription: 'карӣм',
    translation: 'холодные (м.р., мн.ч.)',
    root: 'ק-ר-ר',
    partOfSpeech: 'adjective',
    exampleSentence: {
      hebrew: 'מַיִם קָרִים, בְּבַקָּשָׁה.',
      transcription: 'мáйим карӣм, бэвакашá.',
      translation: 'Холодную воду, пожалуйста.',
    },
  },
  {
    hebrew: 'קָר',
    hebrewPlain: 'קר',
    transcription: 'кар',
    translation: 'холодный / холодно',
    root: 'ק-ר-ר',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'חַם',
    hebrewPlain: 'חם',
    transcription: 'хам',
    translation: 'горячий / тёплый / жарко',
    root: 'ח-מ-ם',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'חַמִּים',
    hebrewPlain: 'חמים',
    transcription: 'хамӣм',
    translation: 'тёплые / горячие (мн.ч.)',
    root: 'ח-מ-ם',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'קָפֶה',
    hebrewPlain: 'קפה',
    transcription: 'кафэ́',
    translation: 'кофе',
    partOfSpeech: 'noun',
    exampleSentence: {
      hebrew: 'אֲנִי רוֹצֶה קָפֶה עִם חָלָב.',
      transcription: 'анӣ роцé кафэ́ им халáв.',
      translation: 'Я хочу кофе с молоком.',
    },
  },
  {
    hebrew: 'תֵּה',
    hebrewPlain: 'תה',
    transcription: 'тэ',
    translation: 'чай',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'חָלָב',
    hebrewPlain: 'חלב',
    transcription: 'халáв',
    translation: 'молоко',
    root: 'ח-ל-ב',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'סוּכָּר',
    hebrewPlain: 'סוכר',
    transcription: 'сукáр',
    translation: 'сахар',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'עוּגָה',
    hebrewPlain: 'עוגה',
    transcription: 'угá',
    translation: 'пирожное, торт, пирог',
    root: 'ע-ו-ג',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'קְרוּאָסוֹן',
    hebrewPlain: 'קרואסון',
    transcription: 'круасóн',
    translation: 'круассан',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'חֶשְׁבּוֹן',
    hebrewPlain: 'חשבון',
    transcription: 'хэшбóн',
    translation: 'счёт (в кафе, банке)',
    root: 'ח-ש-ב',
    partOfSpeech: 'noun',
    exampleSentence: {
      hebrew: 'אֶפְשָׁר לְקַבֵּל חֶשְׁבּוֹן?',
      transcription: 'эфшáр лэкабéль хэшбóн?',
      translation: 'Можно получить счёт?',
    },
  },
  {
    hebrew: 'אֶפְשָׁר',
    hebrewPlain: 'אפשר',
    transcription: 'эфшáр',
    translation: 'можно / возможно',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'לְקַבֵּל',
    hebrewPlain: 'לקבל',
    transcription: 'лэкабéль',
    translation: 'получить / принимать',
    root: 'ק-ב-ל',
    partOfSpeech: 'verb',
  },
  {
    hebrew: 'הַאִם',
    hebrewPlain: 'האם',
    transcription: 'hа-ӣм',
    translation: 'ли (вопросительная частица)',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'אוֹ',
    hebrewPlain: 'או',
    transcription: 'о',
    translation: 'или',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'תִּרְצֶה',
    hebrewPlain: 'תרצה',
    transcription: 'тирцé',
    translation: 'ты захочешь / хочешь (к мужчине)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'מָה תִּרְצֶה לִשְׁתּוֹת?',
      transcription: 'ма тирцé лишто́т?',
      translation: 'Что ты хочешь выпить? (к мужчине)',
    },
  },
  {
    hebrew: 'תִּרְצוּ',
    hebrewPlain: 'תרצו',
    transcription: 'тирцӯ',
    translation: 'вы захотите / хотите (мн.ч.)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'הַאִם תִּרְצוּ קָפֶה אוֹ תֵּה?',
      transcription: 'hа-ӣм тирцӯ кафэ́ о тэ?',
      translation: 'Хотите кофе или чай?',
    },
  },
  {
    hebrew: 'תִּרְצִי',
    hebrewPlain: 'תרצי',
    transcription: 'тирцӣ',
    translation: 'ты захочешь / хочешь (к женщине)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'מָה תִּרְצִי לִשְׁתּוֹת?',
      transcription: 'ма тирцӣ лишто́т?',
      translation: 'Что ты хочешь выпить? (к женщине)',
    },
  },
  {
    hebrew: 'רוֹצֶה',
    hebrewPlain: 'רוצה',
    transcription: 'роцé',
    translation: 'хочет / хочу (м.р.)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'אֲנִי רוֹצֶה קָפֶה.',
      transcription: 'анӣ роцé кафэ́.',
      translation: 'Я хочу кофе (мужчина).',
    },
  },
  {
    hebrew: 'רוֹצָה',
    hebrewPlain: 'רוצה',
    transcription: 'роцá',
    translation: 'хочет / хочу (ж.р.)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'אֲנִי רוֹצָה מַיִם.',
      transcription: 'анӣ роцá мáйим.',
      translation: 'Я хочу воду (женщина).',
    },
  },
  {
    hebrew: 'לִשְׁתּוֹת',
    hebrewPlain: 'לשתות',
    transcription: 'лишто́т',
    translation: 'пить',
    root: 'ש-ת-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'אֲנִי רוֹצֶה לִשְׁתּוֹת מַיִם.',
      transcription: 'анӣ роцé лишто́т мáйим.',
      translation: 'Я хочу пить воду.',
    },
  },
  {
    hebrew: 'לֶאֱכֹל',
    hebrewPlain: 'לאכול',
    transcription: 'лээхóль',
    translation: 'есть, кушать',
    root: 'א-כ-ל',
    partOfSpeech: 'verb',
  },
  {
    hebrew: 'בֹּקֶר',
    hebrewPlain: 'בוקר',
    transcription: 'бóкер',
    translation: 'утро',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'בֹּקֶר טוֹב',
    hebrewPlain: 'בוקר טוב',
    transcription: 'бóкер тов',
    translation: 'доброе утро',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'עֶרֶב טוֹב',
    hebrewPlain: 'ערב טוב',
    transcription: 'э́рев тов',
    translation: 'добрый вечер',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'לַיְלָה טוֹב',
    hebrewPlain: 'לילה טוב',
    transcription: 'лáйла тов',
    translation: 'спокойной ночи',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'יוֹם',
    hebrewPlain: 'יום',
    transcription: 'йом',
    translation: 'день',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'הַיּוֹם',
    hebrewPlain: 'היום',
    transcription: 'hайóм',
    translation: 'сегодня',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'שִׁיעוּר',
    hebrewPlain: 'שיעור',
    transcription: 'шиӯр',
    translation: 'урок',
    partOfSpeech: 'noun',
  },
];

/**
 * Быстрый поиск слова в оффлайн-базе Ульпана (словарь + 100 уроков + эвристика приставок)
 */
export function lookupOfflineWord(rawQuery: string): DictionaryEntry | null {
  if (!rawQuery) return null;
  const clean = stripNikkud(rawQuery.trim().toLowerCase());
  if (!clean) return null;

  // 1. Поиск в базовом оффлайн-словаре
  const directOffline = ULPAN_OFFLINE_DICTIONARY.find(
    (entry) =>
      stripNikkud(entry.hebrewPlain.toLowerCase()) === clean ||
      stripNikkud(entry.hebrew.toLowerCase()) === clean
  );
  if (directOffline) return directOffline;

  // 2. Поиск по всем 100 урокам курса Ульпана
  if (typeof DETAILED_LESSONS === 'object' && DETAILED_LESSONS !== null) {
    for (const lesson of Object.values(DETAILED_LESSONS)) {
      if (!lesson?.vocabulary) continue;
      const lessonWord = lesson.vocabulary.find(
        (w) =>
          stripNikkud((w.hebrewPlain || '').toLowerCase()) === clean ||
          stripNikkud((w.hebrew || '').toLowerCase()) === clean
      );
      if (lessonWord) {
        return {
          hebrew: lessonWord.hebrew,
          hebrewPlain: lessonWord.hebrewPlain,
          transcription: lessonWord.transcription,
          translation: lessonWord.translation,
          root: lessonWord.root || null,
          partOfSpeech: lessonWord.partOfSpeech || 'other',
          exampleSentence: lessonWord.exampleSentence || null,
        };
      }
    }
  }

  // 3. Эвристика приставок (הַ-, בְּ-, לְ-, וְ-, מִ-, כְּ-, שֶׁ-)
  // Если слово начинается с типичного предлога/артикля и длина основы >= 2 букв
  const prefixes = ['ה', 'ב', 'ל', 'ו', 'מ', 'כ', 'ש'];
  for (const prefix of prefixes) {
    if (clean.startsWith(prefix) && clean.length > 2) {
      const subClean = clean.slice(1);

      // Проверяем в оффлайн словаре
      const subOffline = ULPAN_OFFLINE_DICTIONARY.find(
        (entry) =>
          stripNikkud(entry.hebrewPlain.toLowerCase()) === subClean ||
          stripNikkud(entry.hebrew.toLowerCase()) === subClean
      );
      if (subOffline) {
        return subOffline;
      }

      // Проверяем в уроках
      if (typeof DETAILED_LESSONS === 'object' && DETAILED_LESSONS !== null) {
        for (const lesson of Object.values(DETAILED_LESSONS)) {
          if (!lesson?.vocabulary) continue;
          const lessonWord = lesson.vocabulary.find(
            (w) =>
              stripNikkud((w.hebrewPlain || '').toLowerCase()) === subClean ||
              stripNikkud((w.hebrew || '').toLowerCase()) === subClean
          );
          if (lessonWord) {
            return {
              hebrew: lessonWord.hebrew,
              hebrewPlain: lessonWord.hebrewPlain,
              transcription: lessonWord.transcription,
              translation: lessonWord.translation,
              root: lessonWord.root || null,
              partOfSpeech: lessonWord.partOfSpeech || 'other',
              exampleSentence: lessonWord.exampleSentence || null,
            };
          }
        }
      }
    }
  }

  return null;
}

/**
 * Поиск всех слов с заданным корнем (משפחת השורש в стиле Pealim)
 */
export function findWordsByRoot(root: string): DictionaryEntry[] {
  if (!root) return [];
  const cleanRoot = root.replace(/[^א-ת]/g, '');
  if (!cleanRoot) return [];

  const results: DictionaryEntry[] = [];
  const seenHebrews = new Set<string>();

  const addIfNew = (entry: DictionaryEntry) => {
    const plain = stripNikkud(entry.hebrewPlain || entry.hebrew || '');
    if (!plain || seenHebrews.has(plain)) return;
    seenHebrews.add(plain);
    results.push(entry);
  };

  // 1. Поиск в оффлайн словаре
  for (const entry of ULPAN_OFFLINE_DICTIONARY) {
    if (!entry.root) continue;
    const entryCleanRoot = entry.root.replace(/[^א-ת]/g, '');
    if (entryCleanRoot === cleanRoot) {
      addIfNew(entry);
    }
  }

  // 2. Поиск в каталоге уроков
  if (typeof DETAILED_LESSONS === 'object' && DETAILED_LESSONS !== null) {
    for (const lesson of Object.values(DETAILED_LESSONS)) {
      if (!lesson?.vocabulary) continue;
      for (const word of lesson.vocabulary) {
        if (!word.root) continue;
        const wordCleanRoot = word.root.replace(/[^א-ת]/g, '');
        if (wordCleanRoot === cleanRoot) {
          addIfNew({
            hebrew: word.hebrew,
            hebrewPlain: word.hebrewPlain || word.hebrew,
            transcription: word.transcription,
            translation: word.translation,
            root: word.root,
            partOfSpeech: word.partOfSpeech || 'other',
            exampleSentence: word.exampleSentence || null,
          });
        }
      }
    }
  }

  return results;
}

