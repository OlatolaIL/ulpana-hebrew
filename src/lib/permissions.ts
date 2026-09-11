/**
 * Управление доступом, уровнями подписки и маркировкой контента
 *
 * Модель монетизации (Бета-тестирование -> Релиз с триалом):
 * 1. Уроки 1 и 2: Полностью открыты всем (все 5 этапов), даже гостям.
 * 2. Уроки 3–30 (Алеф): Этапы 1–3 (Теория, Словарь, Упражнения) ВСЕГДА бесплатны для зарегистрированных.
 * 3. Этапы 4–5 (Диалог и Звонок-симулятор) для уроков 3–100 — входят в PRO (в период беты открыты как PRO BETA).
 * 4. Уроки 31–100 (конец Алеф и уровень Бет) — входят в PRO (в период беты открыты как PRO BETA).
 * 5. Алфавит и прописи — ВСЕГДА бесплатны.
 * 6. Личный словарик — ВСЕГДА бесплатен для зарегистрированных.
 * 7. 3 базовые тематические колоды — ВСЕГДА бесплатны для зарегистрированных:
 *    - 'verbs-alef-1' (Глаголы Алеф — Часть 1, Пааль: Базовые действия)
 *    - 'shuk-food-alef' (Шук, Овощи, Фрукты и Еда)
 *    - 'cafe-restaurant-alef' (Кафе, Ресторан и Заказ еды)
 * 8. Остальные колоды — входят в PRO (в период беты открыты как PRO BETA).
 */

import { IS_EARLY_ACCESS_FREE } from './config';

export const FREE_LESSONS_ALEF_MAX = 30;

export const FREE_DECK_IDS = [
  'verbs-alef-1',
  'shuk-food-alef',
  'cafe-restaurant-alef',
] as const;

export type ContentAccessTier = 'always_free' | 'pro_beta' | 'pro_locked';

/**
 * Проверка, является ли урок всегда бесплатным по базовой части (этапы 1-3)
 */
export function isLessonAlwaysFree(lessonId: number): boolean {
  return lessonId <= FREE_LESSONS_ALEF_MAX;
}

/**
 * Проверка, является ли конкретный этап урока всегда бесплатным
 */
export function isStageAlwaysFree(lessonId: number, tabId: string): boolean {
  // В уроках 1 и 2 все 6 этапов всегда бесплатны
  if (lessonId <= 2) return true;

  // В уроках 3-30 этапы theory, vocab, exercises всегда бесплатны
  if (lessonId <= FREE_LESSONS_ALEF_MAX) {
    return ['theory', 'vocab', 'exercises'].includes(tabId);
  }

  // Уроки 31-100 — все этапы входят в PRO
  return false;
}

/**
 * Проверка, является ли тематическая колода всегда бесплатной
 */
export function isDeckAlwaysFree(deckId: string): boolean {
  return (FREE_DECK_IDS as readonly string[]).includes(deckId);
}

/**
 * Проверка, требуется ли бесплатная регистрация для доступа к колоде
 * (3 базовые колоды открыты гостям, остальные требуют регистрации)
 */
export function isDeckAuthRequired(deckId: string, isLoggedIn: boolean): boolean {
  if (isDeckAlwaysFree(deckId)) {
    return false;
  }
  return !isLoggedIn;
}

/**
 * Получить категорию доступа к уроку
 */
export function getLessonAccessTier(lessonId: number, isPro: boolean): ContentAccessTier {
  if (isPro) return 'always_free';
  if (isLessonAlwaysFree(lessonId)) return 'always_free';
  if (IS_EARLY_ACCESS_FREE) return 'pro_beta';
  return 'pro_locked';
}

/**
 * Получить категорию доступа к этапу урока
 */
export function getStageAccessTier(lessonId: number, tabId: string, isPro: boolean): ContentAccessTier {
  if (isPro) return 'always_free';
  if (isStageAlwaysFree(lessonId, tabId)) return 'always_free';
  if (IS_EARLY_ACCESS_FREE) return 'pro_beta';
  return 'pro_locked';
}

/**
 * Получить категорию доступа к тематической колоде
 */
export function getDeckAccessTier(deckId: string, isPro: boolean): ContentAccessTier {
  if (isPro) return 'always_free';
  if (isDeckAlwaysFree(deckId)) return 'always_free';
  if (IS_EARLY_ACCESS_FREE) return 'pro_beta';
  return 'pro_locked';
}
