import { RootRelatedWord } from '@/types';

export type DrillWordType = 'verb' | 'noun' | 'adjective' | 'preposition' | 'adverb' | 'expression';

export interface BaseDrillSentence {
  id: string;
  type: DrillWordType;
  targetWordPlain: string;        // Базовая словарная форма без огласовок ('שולחן', 'גדול', 'לרצות')
  targetWordVocalized: string;    // Базовая огласованная форма ('שׁוּלְחָן', 'גָּדוֹל', 'לִרְצוֹת')
  targetWordTranscription: string;// Транскрипция слова ('шульхáн', 'гадóль')
  targetWordTranslation: string;  // Перевод слова ('стол', 'большой')
  sentenceHe: string;             // Предложение 3–4 слова на иврите с огласовками в כתיב מלא
  sentenceTranscription: string;  // Транскрипция всего предложения
  sentenceRu: string;             // Русский перевод всего предложения
  minLesson: number;              // Минимальный номер урока для пререквизитов (R-07)
  lessonTheme?: string;           // Название темы/урока
}

export interface VerbDrillItem extends BaseDrillSentence {
  type: 'verb';
  verbInfinitive: string;
  verbForm: string;
  tense: 'present' | 'past' | 'future';
  tenseRu: string;
  prepositionPlain: string;
  prepositionVocalized: string;
  root?: string;
  binyan?: string;
  rootFamily?: RootRelatedWord[];
}

export interface NounDrillItem extends BaseDrillSentence {
  type: 'noun';
  singularHe: string;             // שׁוּלְחָן
  singularTranscription: string;  // шульхáн
  pluralHe: string;               // שׁוּלְחָנוֹת
  pluralTranscription: string;    // шульханóт
  gender: 'm' | 'f';              // 'm' (זכר) или 'f' (נקבה)
  isPluralException?: boolean;    // true, если мужской род на -от или женский на -им
  pluralNote?: string;            // Пояснение («Мужской род, исключение: -от»)
  dualHe?: string;                // Двойственное число (если применимо, например עֵינַיִם, יוֹמַיִם)
  root?: string;
  rootFamily?: RootRelatedWord[];
}

export interface AdjectiveDrillItem extends BaseDrillSentence {
  type: 'adjective';
  forms: {
    ms: { hebrew: string; transcription: string; translation: string }; // גדול (гадоль)
    fs: { hebrew: string; transcription: string; translation: string }; // גדולה (гдола)
    mp: { hebrew: string; transcription: string; translation: string }; // גדולים (гдолим)
    fp: { hebrew: string; transcription: string; translation: string }; // גדולות (гдолот)
  };
  usedGenderNumber: 'ms' | 'fs' | 'mp' | 'fp'; // Какая конкретно форма использована в предложении
  root?: string;
  rootFamily?: RootRelatedWord[];
}

export interface PrepositionDrillItem extends BaseDrillSentence {
  type: 'preposition';
  basePrepositionHe: string;      // עִם / שֶׁל / אֶת / לְ
  basePrepositionRu: string;      // с / принадлежность / винительный / дательный
  inflectedFormHe: string;        // אִתִּי / שֶׁלִּי / אוֹתִי
  inflectedTranscription: string; // итӣ / шелӣ / отӣ
  personTitle: string;            // «Я (1-е лицо ед.ч.)», «Ты (мужской род)» и т.д.
  inflectionsTable?: Array<{
    person: string;
    hebrew: string;
    transcription: string;
    translation: string;
  }>;
}

export interface AdverbDrillItem extends BaseDrillSentence {
  type: 'adverb' | 'expression';
  antonym?: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
  usageTip?: string;
}

export type ComplexDrillItem =
  | VerbDrillItem
  | NounDrillItem
  | AdjectiveDrillItem
  | PrepositionDrillItem
  | AdverbDrillItem;
