/**
 * Локальное хранилище данных: профиль пользователя, прогресс по урокам, личный словарик и карточки.
 */

import { UserProfile, Word, FlashcardProgress, UserGender, AiProvider } from '@/types';
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
    return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
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

export function addWordToPersonalDict(word: Omit<Word, 'id' | 'dateAdded' | 'isUserAdded'>): Word {
  const profile = loadUserProfile();
  const cleanHeb = stripNikkud(word.hebrew);

  const existing = profile.personalVocabulary.find(
    (w) => stripNikkud(w.hebrew) === cleanHeb
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

  profile.personalVocabulary.unshift(newWord);
  saveUserProfile(profile);
  return newWord;
}

export function removeWordFromPersonalDict(wordId: string): void {
  const profile = loadUserProfile();
  profile.personalVocabulary = profile.personalVocabulary.filter((w) => w.id !== wordId);
  saveUserProfile(profile);
}

export function isWordInPersonalDict(hebrew: string): boolean {
  const profile = loadUserProfile();
  const clean = stripNikkud(hebrew);
  return profile.personalVocabulary.some((w) => stripNikkud(w.hebrew) === clean);
}

export function markLessonTabCompleted(lessonId: number, tab: string): void {
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

  if (
    current.completedTabs.includes('theory') &&
    current.completedTabs.includes('vocab') &&
    current.completedTabs.includes('chat')
  ) {
    current.isCompleted = true;
    if (!profile.completedLessons.includes(lessonId)) {
      profile.completedLessons.push(lessonId);
    }
  }

  profile.lessonProgress[lessonId] = current;
  saveUserProfile(profile);
}

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
