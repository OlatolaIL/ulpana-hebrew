import type { UserProfile } from '@/types';
import { RequestBodyError } from './requestBody';

type ProfileSnapshot = Pick<UserProfile, 'lessonProgress' | 'personalVocabulary' | 'flashcardStats' | 'gender' | 'fontStyle'> & {
  expectedUserId: string; expectedRevision: number;
};
const record = (v: unknown): v is Record<string, unknown> => Boolean(v) && typeof v === 'object' && !Array.isArray(v);
const number = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER) => typeof v === 'number' && Number.isFinite(v) && v >= min && v <= max;
const text = (v: unknown, max = 2000) => typeof v === 'string' && v.length <= max;
const tabs = ['theory', 'vocab', 'exercises', 'essay', 'chat', 'phone'];

export function parseProfileSnapshot(body: Record<string, unknown>): ProfileSnapshot {
  const fail = () => { throw new RequestBodyError('Некорректные данные прогресса. Сохранённый профиль не изменён.', 400); };
  const { lessonProgress, personalVocabulary, flashcardStats } = body;
  if (!text(body.expectedUserId, 256) || !Number.isSafeInteger(body.expectedRevision) || !number(body.expectedRevision) ||
      !['male', 'female'].includes(String(body.gender)) || !['print', 'cursive'].includes(String(body.fontStyle)) ||
      !record(lessonProgress) || Object.keys(lessonProgress).length > 100 ||
      !Array.isArray(personalVocabulary) || personalVocabulary.length > 10000 ||
      !record(flashcardStats) || Object.keys(flashcardStats).length > 20000) fail();

  const cleanLessonProgress: Record<string, any> = {};
  for (const [id, progress] of Object.entries(lessonProgress as Record<string, unknown>)) {
    if (!/^(?:[1-9][0-9]?|100)$/.test(id) || !record(progress)) fail();
    const p = progress as Record<string, unknown>;
    const completedTabsRaw = p.completedTabs;
    if (!Array.isArray(completedTabsRaw)) fail();
    const cleanTabs = Array.from(new Set((completedTabsRaw as unknown[]).filter((t: unknown): t is string => typeof t === 'string' && tabs.includes(t))));
    if (cleanTabs.length > 6) fail();

    if (p.score !== undefined && p.score !== null && !number(p.score, 0, 100)) fail();
    const score = p.score !== undefined && p.score !== null ? Number(p.score) : 0;
    const lastVisited = number(p.lastVisited) ? Number(p.lastVisited) : Date.now();
    const isCompleted = typeof p.isCompleted === 'boolean' ? p.isCompleted : cleanTabs.length === 6;

    if (p.essay !== undefined && p.essay !== null && (!record(p.essay) || !text(p.essay.text, 20000) || (p.essay.updatedAt !== undefined && !number(p.essay.updatedAt)) || !record(p.essay.evaluation))) fail();

    cleanLessonProgress[id] = {
      completedTabs: cleanTabs,
      isCompleted,
      score,
      lastVisited,
      ...(p.essay ? { essay: p.essay } : {}),
    };
  }

  const cleanVocabulary: any[] = [];
  for (const rawWord of personalVocabulary as unknown[]) {
    if (!record(rawWord) || !text(rawWord.hebrew) || !text(rawWord.translation)) fail();
    const w: Record<string, any> = { ...(rawWord as Record<string, unknown>) };
    if (w.root === null) delete w.root;
    if (w.lessonId === null || w.lessonId === undefined) w.lessonId = 0;
    if (w.transcription === null) w.transcription = '';
    if (w.partOfSpeech === null) w.partOfSpeech = 'other';
    if (w.hebrewPlain === null) delete w.hebrewPlain;

    if (['hebrewPlain', 'transcription', 'root', 'partOfSpeech'].some(key => w[key] !== undefined && !text(w[key])) ||
        (!Number.isInteger(w.lessonId) || !number(w.lessonId, 0, 100))) fail();
    cleanVocabulary.push(w);
  }

  const cleanFlashcards: Record<string, unknown> = {};
  for (const [id, stat] of Object.entries(flashcardStats as Record<string, unknown>)) {
    if (id.length > 256 || !record(stat)) continue;
    const s = stat as Record<string, unknown>;
    const wordId = text(s.wordId, 256) ? String(s.wordId) : id;
    const interval = number(s.interval) ? Number(s.interval) : 1;
    const easeFactor = number(s.easeFactor) ? Number(s.easeFactor) : 2.5;
    const repetitions = number(s.repetitions) ? Number(s.repetitions) : 0;
    const nextReviewDate = number(s.nextReviewDate) ? Number(s.nextReviewDate) : Date.now();
    const lastReviewDate = number(s.lastReviewDate) ? Number(s.lastReviewDate) : Date.now();
    const history = Array.isArray(s.history) ? s.history.filter(v => number(v, 0, 5)) : [];
    cleanFlashcards[id] = {
      wordId,
      interval,
      easeFactor,
      repetitions,
      nextReviewDate,
      lastReviewDate,
      history,
    };
  }

  return {
    expectedUserId: String(body.expectedUserId),
    expectedRevision: Number(body.expectedRevision),
    gender: body.gender as 'male' | 'female',
    fontStyle: body.fontStyle as 'print' | 'cursive',
    lessonProgress: cleanLessonProgress,
    personalVocabulary: cleanVocabulary,
    flashcardStats: cleanFlashcards,
  } as ProfileSnapshot;
}
