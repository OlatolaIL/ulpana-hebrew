/**
 * Движок политик доступа к контенту (Access Policy Engine)
 * Управляет правилами доступа к урокам и тренажерам платформы.
 */

import { FREE_GUEST_LESSONS_LIMIT, FREE_LESSONS_LIMIT, IS_EARLY_ACCESS_FREE } from '@/lib/config';
import { AccessRequirement } from '@/types';

export type { AccessRequirement };

export interface AccessCheckUser {
  isLoggedIn: boolean;
  isPro: boolean;
  isChannelSubscriber: boolean;
}

export type AccessDenialReason =
  | 'require_auth'
  | 'require_channel'
  | 'require_pro'
  | 'require_both';

export interface AccessCheckResult {
  allowed: boolean;
  reason?: AccessDenialReason;
}

/**
 * Проверка прав доступа пользователя к конкретному материалу
 */
export function checkContentAccess(
  requirement: AccessRequirement,
  user: AccessCheckUser
): AccessCheckResult {
  switch (requirement) {
    case 'always_free':
      return { allowed: true };

    case 'free_auth':
      if (!user.isLoggedIn) {
        return { allowed: false, reason: 'require_auth' };
      }
      return { allowed: true };

    case 'telegram_channel':
      if (!user.isLoggedIn) {
        return { allowed: false, reason: 'require_auth' };
      }
      if (!user.isChannelSubscriber) {
        return { allowed: false, reason: 'require_channel' };
      }
      return { allowed: true };

    case 'pro_only':
      if (!user.isLoggedIn) {
        return { allowed: false, reason: 'require_auth' };
      }
      if (!user.isPro) {
        return { allowed: false, reason: 'require_pro' };
      }
      return { allowed: true };

    case 'pro_or_channel':
      if (user.isPro || user.isChannelSubscriber) {
        return { allowed: true };
      }
      if (!user.isLoggedIn) {
        return { allowed: false, reason: 'require_auth' };
      }
      return { allowed: false, reason: 'require_channel' };

    case 'pro_and_channel':
      if (!user.isLoggedIn) {
        return { allowed: false, reason: 'require_auth' };
      }
      if (!user.isPro && !user.isChannelSubscriber) {
        return { allowed: false, reason: 'require_both' };
      }
      if (!user.isPro) {
        return { allowed: false, reason: 'require_pro' };
      }
      if (!user.isChannelSubscriber) {
        return { allowed: false, reason: 'require_channel' };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}

/**
 * Дефолтное правило доступа для урока (безопасный фолбэк из config.ts)
 */
export function getDefaultLessonRequirement(lessonId: number): AccessRequirement {
  if (lessonId <= FREE_GUEST_LESSONS_LIMIT) {
    return 'always_free';
  }
  if (lessonId <= FREE_LESSONS_LIMIT) {
    return 'free_auth';
  }
  return 'pro_only';
}

/**
 * Получение эффективного правила доступа к уроку с учетом базы данных и режима беты
 */
export function getEffectiveLessonRequirement(
  lessonId: number,
  rules?: Record<number | string, AccessRequirement> | null,
  isEarlyAccessFree?: boolean
): AccessRequirement {
  const isBeta = isEarlyAccessFree !== undefined ? isEarlyAccessFree : IS_EARLY_ACCESS_FREE;
  if (isBeta) {
    return 'always_free';
  }

  if (rules && rules[lessonId]) {
    return rules[lessonId];
  }

  return getDefaultLessonRequirement(lessonId);
}

/**
 * Человекопонятное название требования доступа
 */
export function getAccessRequirementLabel(req: AccessRequirement): string {
  switch (req) {
    case 'always_free':
      return 'Бесплатно для всех';
    case 'free_auth':
      return 'Нужна регистрация';
    case 'telegram_channel':
      return 'Канал @ulpana_il';
    case 'pro_only':
      return 'Только PRO';
    case 'pro_or_channel':
      return 'PRO или Канал';
    case 'pro_and_channel':
      return 'PRO + Канал';
    default:
      return req;
  }
}
