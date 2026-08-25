import { UserProfile } from '@/types';

export const ADMIN_TELEGRAM_IDS: number[] = [
  8903218603, // Telegram ID of administrator (@Osa_IL)
  8215851, // Telegram ID backup
];

export const ADMIN_USERNAMES: string[] = [
  'osa_il',
  'olatola',
  'azrie',
];

export const VIP_EXPIRES_AT = 2088000000000; // 2036 year (~10 years)

/**
 * Строгая проверка прав администратора/VIP
 * Проверяется числовой Telegram ID либо точный username/имя
 */
export function isVipUser(
  username?: string | null,
  telegramId?: number | string | null,
  name?: string | null
): boolean {
  if (telegramId !== undefined && telegramId !== null) {
    const numericId = typeof telegramId === 'number' ? telegramId : parseInt(String(telegramId).trim(), 10);
    if (!isNaN(numericId) && ADMIN_TELEGRAM_IDS.includes(numericId)) {
      return true;
    }
  }

  if (username) {
    const clean = username.toLowerCase().replace(/^@/, '').trim();
    if (ADMIN_USERNAMES.includes(clean)) {
      return true;
    }
  }

  if (name) {
    const cleanName = name.toLowerCase().replace(/^@/, '').trim();
    if (ADMIN_USERNAMES.includes(cleanName)) {
      return true;
    }
  }

  return false;
}

/**
 * Применяет VIP-привилегии (PRO подписка) без подделки истории уроков.
 * Также автоматически очищает старый фиктивно засеянный демо-прогресс.
 */
export function applyVipProfileEnhancements(profile: UserProfile): UserProfile {
  const isVip = isVipUser(profile.username, profile.telegramId, profile.name);
  const updated: UserProfile = { ...profile };

  if (isVip) {
    updated.subscriptionTier = 'pro';
    updated.subscriptionExpiresAt = VIP_EXPIRES_AT;
  }

  // Однократная очистка ранее засеянного фиктивного прогресса (12 уроков)
  if (typeof window !== 'undefined') {
    const wasSeeded = localStorage.getItem('ulpana_vip_seeded');
    if (wasSeeded) {
      try {
        localStorage.removeItem('ulpana_vip_seeded');
      } catch {}
    }

    let modified = false;

    // Удаляем фиктивно засеянные уроки с устаревшими mock-вкладками
    if (updated.lessonProgress) {
      const cleanProgress = { ...updated.lessonProgress };
      for (const [idStr, prog] of Object.entries(cleanProgress)) {
        if (
          prog.completedTabs?.includes('grammar') ||
          prog.completedTabs?.includes('ai_practice') ||
          prog.completedTabs?.includes('dialogue')
        ) {
          delete cleanProgress[Number(idStr)];
          modified = true;
        }
      }
      if (modified) {
        updated.lessonProgress = cleanProgress;
        updated.completedLessons = (updated.completedLessons || []).filter(
          (id) => cleanProgress[id]?.isCompleted
        );
      }
    }

    // Удаляем фиктивно засеянные VIP-слова
    if (updated.personalVocabulary && updated.personalVocabulary.some((w) => w.id?.startsWith('vip-word-'))) {
      updated.personalVocabulary = updated.personalVocabulary.filter(
        (w) => !w.id?.startsWith('vip-word-')
      );
      modified = true;
    }
  }

  return updated;
}
