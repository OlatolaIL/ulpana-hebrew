import type { UserProfile, UserSession } from '@/types';
import { createGuestProfile, loadAccountProfile, loadUserProfile, saveUserProfile } from './storage';

export interface CloudProfile {
  userId: string;
  revision: number;
  lessonProgress: UserProfile['lessonProgress'];
  personalVocabulary: UserProfile['personalVocabulary'];
  flashcardStats: UserProfile['flashcardStats'];
}

let queue: Promise<void> = Promise.resolve();
const revisions = new Map<string, number>();
let generation = 0;

export function resetSyncSession() { generation++; revisions.clear(); }
export async function finishPendingSync() { await queue; }

export async function readCloudProfile(userId: string): Promise<CloudProfile> {
  const response = await fetch('/api/user/sync', { cache: 'no-store' });
  if (!response.ok) throw new Error('Облачное сохранение недоступно. Изменения остаются в этом браузере.');
  const data = await response.json();
  if (data.userId !== userId || !Number.isSafeInteger(data.revision)) throw new Error('Аккаунт изменился. Войдите снова.');
  return data;
}

export function applyCloudProfile(base: UserProfile, cloud: CloudProfile): UserProfile {
  if (base.id !== cloud.userId) throw new Error('Profile identity mismatch');
  return {
    ...base,
    lessonProgress: cloud.lessonProgress,
    personalVocabulary: cloud.personalVocabulary,
    flashcardStats: cloud.flashcardStats,
    flashcardProgress: cloud.flashcardStats,
    completedLessons: Object.entries(cloud.lessonProgress).filter(([, p]) => p.isCompleted).map(([id]) => Number(id)),
    cloudRevision: cloud.revision,
    cloudSyncPending: false,
  };
}

export async function hydrateAccount(session: UserSession): Promise<UserProfile> {
  const current = loadUserProfile();
  const account = current.id === session.id ? current : loadAccountProfile(session.id);
  const base: UserProfile = { ...createGuestProfile(), ...account, ...session, isLoggedIn: true };
  const cloud = await readCloudProfile(session.id);
  if (!current.id && !account.id && Object.keys(cloud.lessonProgress).length === 0 && cloud.personalVocabulary.length === 0) {
    revisions.set(session.id, cloud.revision);
    return { ...current, ...session, isLoggedIn: true, cloudRevision: cloud.revision, cloudSyncPending: true };
  }
  // Never silently discard unsaved changes when the page is reopened.
  if (account.id === session.id && account.cloudSyncPending) {
    if (account.cloudRevision !== undefined) revisions.set(session.id, account.cloudRevision);
    return base;
  }
  revisions.set(session.id, cloud.revision);
  return applyCloudProfile(base, cloud);
}

export function syncProfile(profile: UserProfile): Promise<void> {
  if (!profile.isLoggedIn || !profile.id) return Promise.resolve();
  const snapshot = structuredClone(profile);
  const userId = profile.id;
  const startedGeneration = generation;
  const operation = queue.then(async () => {
    if (generation !== startedGeneration || loadUserProfile().id !== userId) return;
    const expectedRevision = revisions.get(userId) ?? snapshot.cloudRevision;
    if (expectedRevision === undefined) throw new Error('Сначала загрузите облачный профиль. Локальные изменения сохранены.');
    const response = await fetch('/api/user/sync', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        expectedUserId: userId, expectedRevision,
        lessonProgress: snapshot.lessonProgress, personalVocabulary: snapshot.personalVocabulary,
        flashcardStats: snapshot.flashcardStats, gender: snapshot.gender, fontStyle: snapshot.fontStyle,
      }),
    });
    if (response.status === 409) throw new Error('Профиль изменён на другом устройстве. Выберите, какую версию сохранить.');
    if (!response.ok) throw new Error('Не удалось сохранить в облаке. Изменения остаются в этом браузере.');
    const result = await response.json();
    if (result.userId !== userId || !Number.isSafeInteger(result.revision)) throw new Error('Не удалось подтвердить сохранение.');
    revisions.set(userId, result.revision);
    const current = loadUserProfile();
    if (current.id === userId && generation === startedGeneration) {
      // Keep newer edits if another update was queued while this request ran.
      const unchanged = ['lessonProgress', 'personalVocabulary', 'flashcardStats', 'gender', 'fontStyle']
        .every(key => JSON.stringify(current[key as keyof UserProfile]) === JSON.stringify(snapshot[key as keyof UserProfile]));
      saveUserProfile({ ...current, cloudRevision: result.revision, cloudSyncPending: !unchanged });
    }
  });
  queue = operation.catch(() => {});
  return operation;
}

export async function resolveSyncConflict(choice: 'local' | 'cloud'): Promise<UserProfile> {
  await finishPendingSync();
  const current = loadUserProfile();
  if (!current.id || !current.isLoggedIn) throw new Error('Войдите в аккаунт.');
  const cloud = await readCloudProfile(current.id);
  localStorage.setItem(`ulpana_sync_backup:${current.id}`, JSON.stringify({ local: current, cloud }));
  revisions.set(current.id, cloud.revision);
  if (choice === 'cloud') {
    const updated = applyCloudProfile(current, cloud);
    saveUserProfile(updated);
    return updated;
  }
  const updated = { ...current, cloudRevision: cloud.revision, cloudSyncPending: true };
  saveUserProfile(updated);
  await syncProfile(updated);
  return loadUserProfile();
}
