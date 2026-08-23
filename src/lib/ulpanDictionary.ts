import { stripNikkud } from './transcription';

export interface DictionaryEntry {
  hebrew: string;
  hebrewPlain: string;
  transcription: string;
  translation: string;
  root?: string;
  partOfSpeech: string;
  exampleSentence?: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
}

export const ULPAN_OFFLINE_DICTIONARY: DictionaryEntry[] = [
  {
    hebrew: 'תִּרְצֶה',
    hebrewPlain: 'תרצה',
    transcription: 'тирцé',
    translation: 'захочешь / будешь хотеть (ты, м.р. / она)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'מָה תִּרְצֶה לִשְׁתּוֹת?',
      transcription: 'ма тирцé лишто́т?',
      translation: 'Что ты хочешь выпить? (к мужчине)',
    },
  },
  {
    hebrew: 'תִּרְצִי',
    hebrewPlain: 'תרצי',
    transcription: 'тирцӣ',
    translation: 'захочешь / будешь хотеть (ты, ж.р.)',
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
    hebrew: 'שָׁלוֹם',
    hebrewPlain: 'שלום',
    transcription: 'шалóм',
    translation: 'привет, мир, здравствуйте',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'תוֹדָה',
    hebrewPlain: 'תודה',
    transcription: 'тодá',
    translation: 'спасибо',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'בְּבַקָּשָׁה',
    hebrewPlain: 'בבקשה',
    transcription: 'бэвакашá',
    translation: 'пожалуйста',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'סוּכָּר',
    hebrewPlain: 'סוכר',
    transcription: 'сукáр',
    translation: 'сахар',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'שִׁיעוּר',
    hebrewPlain: 'שיעור',
    transcription: 'шиӯр',
    translation: 'урок',
    partOfSpeech: 'noun',
  }
];

export function lookupOfflineWord(cleanQuery: string): DictionaryEntry | null {
  if (!cleanQuery) return null;
  const clean = stripNikkud(cleanQuery.trim().toLowerCase());
  return (
    ULPAN_OFFLINE_DICTIONARY.find(
      (entry) =>
        stripNikkud(entry.hebrewPlain.toLowerCase()) === clean ||
        stripNikkud(entry.hebrew.toLowerCase()) === clean
    ) || null
  );
}
