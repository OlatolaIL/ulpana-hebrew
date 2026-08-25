/**
 * Локальное хранилище данных: профиль пользователя, прогресс по урокам, личный словарик и карточки.
 */

import { UserProfile, Word, FlashcardProgress, UserGender, AiProvider, WordMasteryInfo } from '@/types';
import { stripNikkud } from './transcription';

const STORAGE_KEY = 'hebrew_app_profile_v1';

const DEFAULT_PROFILE: UserProfile = {
  name: 'Ученик',
  gender: 'female',
  aiProvider: 'groq',
  groqApiKey: '',
  geminiApiKey: '',
  showNikkud: true,
  showTranscription: true,
  fontStyle: 'print',
  speechRate: 0.7,
  completedLessons: [],
  lessonProgress: {},
  personalVocabulary: [],
  flashcardStats: {},
};

export function loadUserProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return DEFAULT_PROFILE;
    const profile: UserProfile = { ...DEFAULT_PROFILE, ...JSON.parse(data) };

    // Автоматическая нормализация: урок считается завершенным ТОЛЬКО если пройдены ВСЕ 5 этапов (включая звонок 'phone')
    if (profile.lessonProgress) {
      const actualCompleted: number[] = [];
      for (const [idStr, prog] of Object.entries(profile.lessonProgress)) {
        const id = parseInt(idStr, 10);
        const tabs = prog.completedTabs || [];
        const isFullyDone =
          tabs.includes('theory') &&
          tabs.includes('vocab') &&
          tabs.includes('exercises') &&
          tabs.includes('chat') &&
          tabs.includes('phone');

        prog.isCompleted = isFullyDone;
        if (isFullyDone) {
          actualCompleted.push(id);
        }
      }
      profile.completedLessons = actualCompleted;
    }

    return profile;
  } catch (e) {
    console.error('Failed to load profile from localStorage', e);
    return DEFAULT_PROFILE;
  }
}

export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile to localStorage', e);
  }
}

/**
 * Проверка, находится ли слово в личном словаре (дедупликация по чистому тексту без огласовок)
 */
export function isWordInPersonalDict(hebrew: string, vocabularyList?: Word[]): boolean {
  const clean = stripNikkud(hebrew || '').trim().toLowerCase();
  if (!clean) return false;
  const list = vocabularyList || loadUserProfile().personalVocabulary || [];
  return list.some((w) => stripNikkud(w.hebrew || w.hebrewPlain || '').trim().toLowerCase() === clean);
}

/**
 * Добавление одного слова в личный словарик пользователя с проверкой дубликатов
 */
export function addWordToPersonalDict(word: Omit<Word, 'id' | 'dateAdded' | 'isUserAdded'>): Word {
  const profile = loadUserProfile();
  const cleanHeb = stripNikkud(word.hebrew || '').trim().toLowerCase();

  // Проверяем, нет ли уже такого слова
  const existing = profile.personalVocabulary.find(
    (w) => stripNikkud(w.hebrew || w.hebrewPlain || '').trim().toLowerCase() === cleanHeb
  );
  if (existing) {
    return existing;
  }

  const newWord: Word = {
    ...word,
    id: `user-word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    isUserAdded: true,
    dateAdded: Date.now(),
  };

  profile.personalVocabulary = [newWord, ...profile.personalVocabulary];
  saveUserProfile(profile);
  return newWord;
}

/**
 * Пакетное добавление слов в личный словарь (с дедупликацией)
 */
export function addBatchWordsToPersonalDict(words: Word[]): { addedCount: number; updatedProfile: UserProfile } {
  const profile = loadUserProfile();
  const existingSet = new Set(
    profile.personalVocabulary.map((w) => stripNikkud(w.hebrew || w.hebrewPlain || '').trim().toLowerCase())
  );

  let addedCount = 0;
  const newWordsToAdd: Word[] = [];

  for (const word of words) {
    const clean = stripNikkud(word.hebrew || word.hebrewPlain || '').trim().toLowerCase();
    if (!clean || existingSet.has(clean)) continue;

    existingSet.add(clean);
    newWordsToAdd.push({
      ...word,
      id: word.id || `user-word-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      isUserAdded: true,
      dateAdded: Date.now(),
    });
    addedCount++;
  }

  if (addedCount > 0) {
    profile.personalVocabulary = [...newWordsToAdd, ...profile.personalVocabulary];
    saveUserProfile(profile);
  }

  return { addedCount, updatedProfile: profile };
}

/**
 * Удаление слова из личного словарика
 */
export function removeWordFromPersonalDict(wordId: string): void {
  const profile = loadUserProfile();
  profile.personalVocabulary = profile.personalVocabulary.filter((w) => w.id !== wordId);
  saveUserProfile(profile);
}

import { DETAILED_LESSONS } from '@/data/lessonsData';

/**
 * Обновление прогресса по вкладке урока (theory, vocab, exercises, chat, phone)
 */
export function markLessonTabCompleted(lessonId: number, tab: string): UserProfile {
  const profile = loadUserProfile();
  const current = profile.lessonProgress[lessonId] || {
    completedTabs: [],
    isCompleted: false,
    lastVisited: Date.now(),
  };

  if (!current.completedTabs.includes(tab)) {
    current.completedTabs.push(tab);
  }
  current.lastVisited = Date.now();

  // Урок считается полностью завершенным ТОЛЬКО когда пройдены ВСЕ 5 этапов:
  // 1. theory, 2. vocab, 3. exercises, 4. chat, 5. phone
  const isAllFive =
    current.completedTabs.includes('theory') &&
    current.completedTabs.includes('vocab') &&
    current.completedTabs.includes('exercises') &&
    current.completedTabs.includes('chat') &&
    current.completedTabs.includes('phone');

  if (isAllFive) {
    current.isCompleted = true;
    if (!profile.completedLessons.includes(lessonId)) {
      profile.completedLessons.push(lessonId);
    }
  } else {
    current.isCompleted = false;
    profile.completedLessons = (profile.completedLessons || []).filter((id) => id !== lessonId);
  }

  // Автоматическое добавление всех слов урока в личный словарик без дубликатов
  if (tab === 'vocab' || current.isCompleted) {
    if (typeof DETAILED_LESSONS === 'object' && DETAILED_LESSONS !== null) {
      const lessonData = DETAILED_LESSONS[lessonId];
      if (lessonData?.vocabulary && lessonData.vocabulary.length > 0) {
        const newWords: Word[] = [];
        for (const w of lessonData.vocabulary) {
          if (!isWordInPersonalDict(w.hebrew, profile.personalVocabulary) && !newWords.some(nw => isWordInPersonalDict(nw.hebrew, [w]))) {
            newWords.push({
              ...w,
              isUserAdded: true,
              dateAdded: Date.now(),
            });
          }
        }
        if (newWords.length > 0) {
          profile.personalVocabulary = [...newWords, ...profile.personalVocabulary];
        }
      }
    }
  }

  profile.lessonProgress[lessonId] = current;
  saveUserProfile(profile);
  return profile;
}

/**
 * Сброс прогресса конкретного урока
 */
export function resetLessonProgress(lessonId: number): UserProfile {
  const profile = loadUserProfile();
  profile.completedLessons = (profile.completedLessons || []).filter((id) => id !== lessonId);
  if (profile.lessonProgress) {
    delete profile.lessonProgress[lessonId];
  }
  saveUserProfile(profile);
  return profile;
}

/**
 * Алгоритм SuperMemo 2 (SM-2) для интервального повторения карточек
 */
export function updateCardSRS(wordId: string, quality: number): FlashcardProgress {
  const profile = loadUserProfile();
  const prev: FlashcardProgress = profile.flashcardStats[wordId] || {
    wordId,
    interval: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: Date.now(),
    lastReviewDate: Date.now(),
    history: [],
  };

  let { interval, easeFactor, repetitions } = prev;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  // Обновление фактора легкости
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000;

  const updated: FlashcardProgress = {
    wordId,
    interval,
    easeFactor,
    repetitions,
    nextReviewDate,
    lastReviewDate: Date.now(),
    history: [...prev.history, quality],
  };

  profile.flashcardStats[wordId] = updated;
  saveUserProfile(profile);
  return updated;
}

/**
 * Расчет скоринга знания слова (0–100%) на основе SM-2
 */
export function calculateWordMastery(stats?: FlashcardProgress): WordMasteryInfo {
  if (!stats || stats.repetitions === 0) {
    return {
      score: 0,
      level: 'new',
      label: 'Новое',
      colorClass: 'text-zinc-400 dark:text-zinc-500',
      badgeBg: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700',
      isDue: false,
      repetitions: 0,
      intervalDays: 0,
    };
  }

  const isDue = Date.now() >= (stats.nextReviewDate || 0);
  const lastQuality = stats.history && stats.history.length > 0 ? stats.history[stats.history.length - 1] : 3;

  // Базовый скоринг по повторениям
  let rawScore = 0;
  if (stats.repetitions === 1) rawScore = 25;
  else if (stats.repetitions === 2) rawScore = 50;
  else if (stats.repetitions === 3) rawScore = 70;
  else if (stats.repetitions === 4) rawScore = 85;
  else rawScore = 100;

  // Коррекция на интервал и фактор легкости
  if (stats.interval >= 30) rawScore = Math.min(100, rawScore + 10);
  if (stats.easeFactor >= 2.6) rawScore = Math.min(100, rawScore + 5);

  // Если последняя оценка была ошибкой (quality < 3), снижаем текущий балл
  if (lastQuality < 3) {
    rawScore = Math.min(30, rawScore);
  }

  const score = Math.max(5, Math.min(100, Math.round(rawScore)));

  if (score >= 90) {
    return {
      score,
      level: 'mastered',
      label: isDue ? 'Повторить' : 'Выучено',
      colorClass: isDue ? 'text-amber-500' : 'text-emerald-500',
      badgeBg: isDue
        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
        : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
      isDue,
      repetitions: stats.repetitions,
      intervalDays: stats.interval,
    };
  }

  if (score >= 60) {
    return {
      score,
      level: 'reviewing',
      label: isDue ? 'Повторить' : 'Закреплено',
      colorClass: isDue ? 'text-amber-500' : 'text-blue-500',
      badgeBg: isDue
        ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900'
        : 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900',
      isDue,
      repetitions: stats.repetitions,
      intervalDays: stats.interval,
    };
  }

  return {
    score,
    level: 'learning',
    label: isDue ? 'Повторить' : 'В процессе',
    colorClass: 'text-amber-500',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
    isDue,
    repetitions: stats.repetitions,
    intervalDays: stats.interval,
  };
}

const CALLS_STORAGE_KEY = 'ulpana_call_history_v1';

export interface SavedCallLog {
  id: string;
  user_id: string;
  user_name: string;
  lesson_id: number;
  caller_name: string;
  caller_role: string;
  duration_seconds: number;
  messages_count: number;
  transcript: Array<{
    role: string;
    hebrew: string;
    translation?: string;
    transcription?: string;
  }>;
  feedback?: string;
  created_at: string;
}

export function saveLocalCallLog(call: SavedCallLog): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = loadLocalCallLogs();
    const updated = [call, ...existing.filter((c) => c.id !== call.id)].slice(0, 50);
    localStorage.setItem(CALLS_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save call log to localStorage', e);
  }
}

export function loadLocalCallLogs(): SavedCallLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CALLS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

