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

export interface SpokenHebrewPhrase {
  hebrew: string;
  transcription: string;
  translation: string;
  stressNote?: string;
  context?: string;
  category?: 'price' | 'question' | 'slang' | 'polite' | 'daily';
}

export interface SpokenHebrewGuide {
  lessonId?: number;
  topicTitle: string;
  stressRuleNote?: {
    word: string;
    academic: string;
    spoken: string;
    explanation: string;
  };
  phrases: SpokenHebrewPhrase[];
  slangAndShortcuts?: Array<{
    term: string;
    transcription: string;
    meaning: string;
    usageTip: string;
  }>;
}

export interface DialogueWord {
  hebrew: string;
  transcription: string;
  translation: string;
  isNew?: boolean; // Новое слово/выражение к этому диалогу
  explanation?: string; // Краткое пояснение грамматики или значения
}

export interface DialogueStep {
  stepIndex: number; // 1, 2, 3
  fact: string; // Заданный контекст/факт (напр. "На столе лежит книга и тетрадь")
  aiQuestionHebrew: string; // Что говорит/спрашивает учитель
  aiQuestionHebrewFemale?: string; // Вариант вопроса для ученицы
  aiQuestionRu: string; // Перевод вопроса учителя
  expectedConcept: string; // Что тренирует ученик (напр. "זֹאת מַחְבֶּרֶת")
  targetWords?: string[]; // Обязательные ключевые слова для проверки (напр. ["זאת", "מחברת"])
  sampleAnswers?: Array<{
    hebrew: string;
    transcription: string;
    translation: string;
  }>;
}

export interface DialogueScenario {
  title: string;
  situation: string; // Описание контекста (напр. "Вы в кафе в Тель-Авиве")
  aiRole: string; // Роль ИИ (напр. "Официант Дани")
  userRole: string; // Роль пользователя (напр. "Посетитель кафе")
  callType?: 'incoming' | 'outgoing'; // 'incoming' = ИИ звонит ученику; 'outgoing' = ученик звонит ИИ
  initialMessage: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
  goals: string[]; // Цели диалога для ученика
  vocabularyHints: string[]; // Ключевые слова урока для подсказок
  steps?: DialogueStep[]; // Пошаговый сценарий из 3 ходов (Fact First)
  usefulWords?: DialogueWord[]; // Слова и фразы к диалогу с карточками
}

export interface GenderVariant {
  hebrew: string;
  transcription: string;
  translation: string;
}

export interface ScriptedDialogueTurn {
  id: string;
  speaker: 'a' | 'b';
  intentRu: string; // Коммуникативная цель (напр. "Поздороваться и заказать капучино")
  acceptableKeywords?: string[]; // Ключевые слова для быстрой валидации
  sampleVariations?: string[]; // Допустимые синонимичные фразы
  variants: {
    mm: GenderVariant; // говорящий м.р., слушающий м.р.
    mf: GenderVariant; // говорящий м.р., слушающий ж.р.
    fm: GenderVariant; // говорящий ж.р., слушающий м.р.
    ff: GenderVariant; // говорящий ж.р., слушающий ж.р.
  };
}

export interface DialogueParticipant {
  nameRu: string;
  nameHe: string;
  roleRu: string;
  roleHe: string;
  avatarEmoji: string;
  gender: 'male' | 'female';
}

export interface ScriptedDialogue {
  id: string;
  lessonId: number;
  titleRu: string;
  titleHe: string;
  situationRu: string;
  speakerA: {
    male: DialogueParticipant;
    female: DialogueParticipant;
  };
  speakerB: {
    male: DialogueParticipant;
    female: DialogueParticipant;
  };
  turns: ScriptedDialogueTurn[];
  usefulWords?: Word[]; // Полезные слова и выражения к диалогу для боковой шторки
}

export interface DialogueEvaluationResult {
  isCorrect: boolean;
  score: number;
  assessment: 'perfect' | 'good' | 'incorrect';
  feedbackRu: string;
  betterAlternative?: string;
  userSpokenHebrew: string;
  pronunciationScore?: number; // Четкость произношения 0-100%
  pronunciationFeedbackRu?: string; // Рекомендации по ошибкам в произношении, концовкам букв и звукам
  userAudioUrl?: string; // Записанное аудио ученика для прослушивания
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

export type PhoneCallType = 'incoming' | 'outgoing';

export interface PhoneScenarioWord {
  hebrew: string;
  transcription: string;
  translation: string;
  isNew?: boolean; // Новое слово/фраза, нужное специально для этого звонка
  explanation?: string;
}

export interface PhoneDebriefGrammarError {
  type: string;
  wrongPhrase: string;
  correctPhrase: string;
  explanationRu: string;
}

export interface PhoneDebriefTurnReview {
  userHebrew: string;
  assessment: 'perfect' | 'good' | 'needs_improvement';
  commentRu: string;
  betterAlternative?: string;
  pronunciationScore?: number; // Чёткость произношения 0 - 100%
  pronunciationFeedbackRu?: string; // Замечания по произношению
  grammarErrors?: PhoneDebriefGrammarError[]; // Ошибки согласования родов или порядка слов
}

export interface PhoneDebriefReport {
  overallScore: number; // 0 - 100
  pronunciationScore?: number; // Средний балл произношения 0 - 100
  grammarScore?: number; // Балл грамматики и согласования родов 0 - 100
  summaryRu: string;
  isSuccess: boolean;
  turnReviews: PhoneDebriefTurnReview[];
  spokenTip?: string;
  recommendedWords?: PhoneScenarioWord[];
}

export interface PhoneScenario {
  callType?: PhoneCallType; // 'incoming' = собеседник звонит ученику; 'outgoing' = ученик звонит собеседнику
  callerName: string; // 'דני - שליח וולט'
  callerNameRu: string; // 'Дани (курьер Wolt)'
  callerRole: string; // 'Курьер доставки'
  userRole?: string; // 'Посетитель' / 'Арендатор' / 'Покупатель' / 'Ученик'
  avatarEmoji: string; // '🛵'
  situationSummary: string; // Краткое описание ситуации перед звонком
  callerObjective?: string; // Что нужно собеседнику (для incoming) или что он готов предложить/уточнить (для outgoing)
  studentObjective?: string; // Главная задача ученика в этом звонке
  completionCondition?: string; // Критерий логического завершения звонка
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
  targetTurns?: number; // Максимальное количество раундов звонка до логического финала (по умолчанию 2)
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
  teacherReactionRu?: string | null; // Реакция/похвала учителя на русском
  teacherReactionHebrew?: string | null; // Реакция учителя на иврите
  engine?: string;
  isCompleted?: boolean; // Флаг завершения диалога
  suggestedReplies?: Array<{
    hebrew: string;
    transcription: string;
    translation: string;
  }>;
  newWords?: DialogueWord[]; // Карточки новых/полезных слов реплики
  stepFact?: string; // Описание новой ситуации при смене шага
  stepIndex?: number; // Номер шага (напр. 2 из 3)
  timestamp: number;
  userAudioUrl?: string; // Локальный blob: или облачный https: URL записи голоса ученика
  userAudioBlob?: Blob; // Сырой аудио-блоб для отправки на сервер
}

export interface LessonAudioRecording {
  id: string;
  userId: string;
  lessonId: number;
  stage: 'chat' | 'phone';
  turnsAudio: Record<number, string>; // { [turnIndex]: "https://..." }
  fullAudioUrl?: string;
  durationSeconds?: number;
  createdAt: string;
  updatedAt: string;
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
  email?: string;
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
  | 'caregiver'   // מטפלת — профессиональный уход за пожилыми
  | 'autoRepair'  // מוסך / רכב — автомастерская и автомеханика
  | 'kindergarten' // גן ילדים — воспитатель и детский сад
  | 'doctor'      // רופא / מרפאה — медицина и приём врача
  | 'accounting'  // הנהלת חשבונות — бухгалтерия, налоги и финансы
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

export interface EssayWordChip {
  hebrew: string;
  translation: string;
  transcription?: string;
}

export interface LessonEssayPrompt {
  topicRu: string;
  topicHe: string;
  situationRu: string;
  grammarFocusRu: string;
  minWords: number;
  suggestedWords: EssayWordChip[];
  sampleEssay?: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
}

export interface WordOrderCheckItem {
  ruleNameRu: string;
  issueSnippet?: string;
  correctionSnippet?: string;
  explanationRu: string;
}

export interface GrammarCheckItem {
  type: string;
  wrongSnippet: string;
  correctionSnippet: string;
  explanationRu: string;
}

export interface EssayEvaluationResult {
  score: number; // 0 - 100
  rating: 'excellent' | 'good' | 'needs_work';
  summaryRu: string;
  wordOrderFeedback: {
    hasErrors: boolean;
    items: WordOrderCheckItem[];
    generalAdviceRu: string;
  };
  grammarFeedback: {
    items: GrammarCheckItem[];
    genderAgreementRu?: string;
  };
  vocabularyAnalysis: {
    usedLessonWords: string[];
    count: number;
    commentRu: string;
  };
  correctedVersion: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
  valuableTipsRu: string[];
}

