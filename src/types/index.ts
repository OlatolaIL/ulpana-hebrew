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

export interface Word {
  id: string;
  hebrew: string;
  hebrewPlain: string;
  transcription: string;
  translation: string;
  partOfSpeech: PartOfSpeech;
  root?: string;
  gender?: 'm' | 'f' | 'both';
  plural?: string;
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
  explanation: string;
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
  situation: string;
  aiRole: string;
  userRole: string;
  initialMessage: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
  goals: string[];
  vocabularyHints: string[];
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
  number: number;
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
  feedback?: string;
  suggestedReplies?: Array<{
    hebrew: string;
    transcription: string;
    translation: string;
  }>;
  timestamp: number;
}

export interface FlashcardProgress {
  wordId: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewDate: number;
  lastReviewDate: number;
  history: number[];
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
  completedLessons: number[];
  lessonProgress: Record<
    number,
    {
      completedTabs: string[];
      isCompleted: boolean;
      score?: number;
      lastVisited: number;
    }
  >;
  personalVocabulary: Word[];
  flashcardStats: Record<string, FlashcardProgress>;
}
