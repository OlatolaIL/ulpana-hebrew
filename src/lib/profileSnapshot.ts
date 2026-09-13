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
  for (const [id, progress] of Object.entries(lessonProgress as Record<string, unknown>)) {
    if (!/^(?:[1-9][0-9]?|100)$/.test(id) || !record(progress)) fail();
    const p = progress as Record<string, unknown>;
    if (!Array.isArray(p.completedTabs) || p.completedTabs.length > 6 || new Set(p.completedTabs).size !== p.completedTabs.length ||
        p.completedTabs.some(t => !tabs.includes(t)) || typeof p.isCompleted !== 'boolean' ||
        (p.score !== undefined && !number(p.score, 0, 100)) || !number(p.lastVisited)) fail();
    if (p.essay !== undefined && p.essay !== null && (!record(p.essay) || !text(p.essay.text, 20000) || !number(p.essay.updatedAt) || !record(p.essay.evaluation))) fail();
  }
  for (const word of personalVocabulary as unknown[]) {
    if (!record(word) || !text(word.hebrew) || !text(word.translation) ||
        ['hebrewPlain', 'transcription', 'root', 'partOfSpeech'].some(key => word[key] !== undefined && !text(word[key])) ||
        (word.lessonId !== undefined && (!Number.isInteger(word.lessonId) || !number(word.lessonId, 0, 100)))) fail();
  }
  for (const [id, stat] of Object.entries(flashcardStats as Record<string, unknown>)) {
    if (id.length > 256 || !record(stat)) fail();
    const s = stat as Record<string, unknown>;
    if (!text(s.wordId, 256) || ['interval', 'easeFactor', 'repetitions', 'nextReviewDate', 'lastReviewDate'].some(key => !number(s[key])) ||
        !Array.isArray(s.history) || s.history.some(v => !number(v, 0, 5))) fail();
  }
  return body as ProfileSnapshot;
}
