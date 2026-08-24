export type UserGender = 'male' | 'female';
export type AiProvider = 'groq' | 'gemini';
export type Level = 'alef' | 'bet';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'preposition'
  | 'expression'
  | 'pronoun'
  | 'adverb'
  | 'number'
  | 'other';

export interface HebrewLetter {
  id: string;
  letter: string; // печатная буква (דפוס)
  cursiveLetter: string; // рукописная буква (כתב יד)
  nameHebrew: string; // אָלֶף
  nameRussian: string; // Алеф
  transcription: string; // [’] / звук
  sound: string; // описание звука
  gematria: number; // числовое значение
  strokeHint: string; // подсказка по направлению штрихов
  exampleWord: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
  isSofit?: boolean; // конечная форма
}

export interface Word {
  id: string;
  hebrew: string; // עם ניקוד
  hebrewPlain: string; // ללא ניקוד для поиска и сравнения
  transcription: string; // русская транскрипция с 'h' для ה и знаком ударения
  translation: string; // русский перевод
  partOfSpeech: PartOfSpeech;
  root?: string; // שורש (например: כ-ת-ב)
  gender?: 'm' | 'f' | 'both';
  plural?: string; // форма мн. числа
  exampleSentence?: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
  lessonId: number;
  isUserAdded?: boolean;
  dateAdded?: number;
}

export interface Sentence {
  id: string;
  hebrew: string;
  transcription: string;
  translation: string;
  audioUrl?: string;
  note?: string;
}

export interface GrammarTopic {
  title: string;
  summary: string;
  explanation: string; // Markdown / структурированный текст
  rules?: string[];
  tables?: Array<{
    title: string;
    headers: string[];
    rows: string[][];
  }>;
  examples?: Array<{
    hebrew: string;
    transcription: string;
    translation: string;
    note?: string;
  }>;
}

export interface DialogueScenario {
  title: string;
  situation: string; // Описание контекста (напр. "Вы в кафе в Тель-Авиве")
  aiRole: string; // Роль ИИ (напр. "Официант Дани")
  userRole: string; // Роль пользователя (напр. "Посетитель кафе")
  initialMessage: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
  goals: string[]; // Цели диалога для ученика
  vocabularyHints: string[]; // Ключевые слова урока для подсказок
}

export interface Exercise {
  id: string;
  type: 'word_match' | 'build_sentence' | 'fill_blank' | 'listening';
  question: string;
  hebrewSnippet?: string;
  transcriptionSnippet?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
}

export interface Lesson {
  id: number;
  level: Level;
  number: number; // 1 - 100
  titleHebrew: string;
  titleRussian: string;
  category: string;
  description: string;
  grammar: GrammarTopic[];
  vocabulary: Word[];
  basicSentences: Sentence[];
  dialogue: DialogueScenario;
  exercises: Exercise[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  hebrew: string;
  transcription?: string;
  translation?: string;
  feedback?: string; // Поправки грамматики от ИИ
  suggestedReplies?: Array<{
    hebrew: string;
    transcription: string;
    translation: string;
  }>;
  timestamp: number;
}

export interface FlashcardProgress {
  wordId: string;
  interval: number; // дни до повторения
  easeFactor: number; // SM-2 коэффициент
  repetitions: number;
  nextReviewDate: number;
  lastReviewDate: number;
  history: number[]; // оценки качества 0-5
}

export interface UserProfile {
  name: string;
  gender: UserGender;
  aiProvider: AiProvider;
  groqApiKey: string;
  geminiApiKey: string;
  showNikkud: boolean;
  showTranscription: boolean;
  fontStyle: 'print' | 'cursive';
  speechRate?: number; // 0.5 - 1.0 (по умолчанию 0.7 для начинающих)
  completedLessons: number[];
  lessonProgress: Record<
    number,
    {
      completedTabs: string[]; // 'theory', 'vocab', 'sentences', 'chat', 'exercises'
      isCompleted: boolean;
      score?: number;
      lastVisited: number;
    }
  >;
  personalVocabulary: Word[];
  flashcardStats: Record<string, FlashcardProgress>;
}
