import { UserProfile } from '@/types';

export const VIP_IDENTIFIERS = [
  'osa_il',
  'osa-il',
  'osail',
  'olatola',
  'azrie',
  '8215851',
];

export const VIP_EXPIRES_AT = 2088000000000; // 2036 year (~10 years)

export function isVipUser(
  username?: string | null,
  telegramId?: number | string | null,
  name?: string | null
): boolean {
  if (telegramId) {
    const idStr = String(telegramId).trim();
    if (idStr.includes('8215851') || VIP_IDENTIFIERS.includes(idStr)) {
      return true;
    }
  }

  const fields = [username, name].filter(Boolean) as string[];
  for (const field of fields) {
    const clean = field.toLowerCase().replace(/[@\s_-]/g, '').trim();
    for (const vip of VIP_IDENTIFIERS) {
      const cleanVip = vip.toLowerCase().replace(/[@\s_-]/g, '').trim();
      if (clean.includes(cleanVip) || cleanVip.includes(clean)) {
        return true;
      }
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
