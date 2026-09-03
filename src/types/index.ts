export type UserGender = 'male' | 'female';
export type AiProvider = 'groq' | 'gemini';
export type Level = 'alef' | 'bet';

export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'preposition'
  | 'conjunction'
  | 'expression'
  | 'pronoun'
  | 'adverb'
  | 'number'
  | 'other';

export interface StrokePoint {
  x: number;
  y: number;
}

export interface LetterStroke {
  id: number;
  label: string;
  startPoint: StrokePoint;
  path: string;
  arrow?: {
    from: StrokePoint;
    to: StrokePoint;
  };
  instruction: string;
}

export interface LetterWritingRule {
  letterId: string;
  strokesCount: number;
  description: string;
  penLifts: boolean;
  startingPointSummary: string;
  directionSummary: string;
  proportions: {
    ascender: boolean;
    baseline: boolean;
    descender: boolean;
  };
  strokes: LetterStroke[];
}

export interface HebrewLetter {
  id: string;
  letter: string; // печатная буква (דפוס)
  cursiveLetter: string; // рукописная буква (כתв יד)
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

export interface PhoneScenarioWord {
  hebrew: string;
  transcription: string;
  translation: string;
  isNew?: boolean; // Новое слово/фраза, нужное специально для этого звонка
  explanation?: string;
}

export interface PhoneScenario {
  callerName: string; // 'דני - שליח וולט'
  callerNameRu: string; // 'Дани (курьер Wolt)'
  callerRole: string; // 'Курьер доставки'
  avatarEmoji: string; // '🛵'
  situationSummary: string; // Краткое описание ситуации перед звонком
  initialGreeting: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
  goals: string[]; // Задачи звонка (напр. 'Сказать номер подъезда', 'Попросить оставить у двери')
  suggestedReplies?: Array<{
    hebrew: string;
    transcription: string;
    translation: string;
  }>;
  vocabularyHints?: string[];
  usefulWords?: PhoneScenarioWord[]; // Карточки полезных слов и выражений перед звонком
  systemPromptAddition?: string; // Дополнительные инструкции для LLM
}

export interface Lesson {
  id: number;
  level: Level;
  number: number; // 1 - 100
  titleHebrew: string;
  titleRussian: string;
  titleRu?: string; // alias для обратной совместимости
  category: string;
  description: string;
  grammar: GrammarTopic[];
  vocabulary: Word[];
  basicSentences: Sentence[];
  dialogue: DialogueScenario;
  phoneScenario?: PhoneScenario;
  exercises: Exercise[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  hebrew: string;
  transcription?: string;
  translation?: string;
  feedback?: string; // Поправки грамматики от ИИ
  engine?: string;
  isCompleted?: boolean; // Флаг завершения диалога
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

export type SubscriptionTier = 'free' | 'pro' | 'admin';

export interface UserSession {
  id: string;
  telegramId?: number;
  username?: string;
  name: string;
  avatarUrl?: string;
  email?: string;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: number | null;
}

export interface PromoCode {
  id: string;
  code: string;
  daysValid: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: number | null;
}

export interface LessonProgress {
  completedTabs: string[]; // 'theory', 'vocab', 'sentences', 'chat', 'exercises', 'phone'
  isCompleted: boolean;
  score?: number;
  lastVisited: number;
}

export interface UserProfile {
  id?: string;
  telegramId?: number;
  username?: string;
  avatarUrl?: string;
  isLoggedIn?: boolean;
  subscriptionTier?: SubscriptionTier;
  subscriptionExpiresAt?: number | null;
  name: string;
  gender: UserGender;
  aiProvider: AiProvider;
  groqApiKey: string;
  geminiApiKey: string;
  showNikkud: boolean;
  showTranscription: boolean;
  fontStyle: 'print' | 'cursive';
  speechRate?: number; // 0.5 - 1.0 (по умолчанию 0.7 для начинающих)
  ulpanMode?: boolean; // Режим полного погружения «Иврит на иврите» (עברית בעברית)
  completedLessons: number[];
  currentLesson?: number;
  lessonProgress: Record<number, LessonProgress>;
  personalVocabulary: Word[];
  flashcardStats: Record<string, FlashcardProgress>;
  flashcardProgress?: Record<string, FlashcardProgress>;
  flashcardDirection?: 'he-ru' | 'ru-he';
}

export interface ConjugationForm {
  pronoun: string; // e.g. "אֲנִי (я)" или "זָכָר יָחִיד (он)"
  hebrew: string; // "רוֹצֶה"
  transcription: string; // "роцé"
  translation: string; // "хочу / хочет (м.р.)"
}

export interface RootRelatedWord {
  hebrew: string; // עם ניקוד
  hebrewPlain: string; // ללא ניקוד
  transcription: string;
  translation: string;
  partOfSpeech: PartOfSpeech;
  binyan?: string;
  root?: string;
  example?: string;
}

export type ThematicDeckCategory =
  | 'verbs'
  | 'food'
  | 'body'
  | 'home'
  | 'city'
  | 'family'
  | 'time'
  | 'work'
  | 'housing'
  | 'health'
  | 'slang'
  | 'media'
  | 'other';

export interface ThematicDeck {
  id: string;
  title: string;
  titleHebrew: string;
  description: string;
  level: Level | 'all';
  category: ThematicDeckCategory;
  icon: string;
  words: Word[];
}

export interface WordMasteryInfo {
  score: number; // 0 - 100%
  level: 'new' | 'learning' | 'reviewing' | 'mastered';
  label: string; // "Новое" | "В процессе" | "Закреплено" | "Выучено"
  colorClass: string;
  badgeBg: string;
  badgeColor?: string;
  isDue: boolean;
  repetitions: number;
  intervalDays: number;
}

export interface VerbConjugation {
  infinitive: {
    hebrew: string; // "לִרְצוֹת"
    transcription: string; // "лирцóт"
    translation: string; // "хотеть"
  };
  binyan: string; // "פָּעַל (Пааль)"
  root: string; // "ר-צ-ה"
  present: ConjugationForm[];
  past: ConjugationForm[];
  future: ConjugationForm[];
  imperative?: ConjugationForm[];
  passiveInfinitive?: string;
  notes?: string;
  rootFamily?: RootRelatedWord[];
}
