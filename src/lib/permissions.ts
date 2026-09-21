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
 * 7. Базовые и специальные тематические колоды — ВСЕГДА бесплатны для всех:
 *    - 'verbs-alef-1' (Глаголы Алеф — Часть 1, Пааль: Базовые действия)
 *    - 'shuk-food-alef' (Шук, Овощи, Фрукты и Еда)
 *    - 'cafe-restaurant-alef' (Кафе, Ресторан и Заказ еды)
 *    - Специальные колоды для мам (всегда бесплатные):
 *      'mom-infant', 'mom-pediatrician', 'mom-pharmacy', 'mom-kindergarten',
 *      'mom-school', 'mom-whatsapp', 'mom-playground'
 * 8. Остальные колоды — входят в PRO (в период беты открыты как PRO BETA).
 */

import { IS_EARLY_ACCESS_FREE } from './config';
import {
  MOM_DECK_IDS,
  isPromoUnlockingMomDecks,
  resolvePromoBundle,
  isLessonUnlockedByBundle,
} from './promoBundles';

export { MOM_DECK_IDS };

export const FREE_LESSONS_ALEF_MAX = 30;

export const BASE_FREE_DECK_IDS = [
  'verbs-alef-1',
  'shuk-food-alef',
  'cafe-restaurant-alef',
] as const;

// Базовые бесплатные колоды для обратной совместимости
export const FREE_DECK_IDS = BASE_FREE_DECK_IDS;

export type ContentAccessTier = 'always_free' | 'pro_beta' | 'pro_locked';

/**
 * Проверка, является ли колода специальной колодой для мам
 */
export function isMomDeck(deckId: string): boolean {
  return (MOM_DECK_IDS as readonly string[]).includes(deckId);
}

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
 * Проверка, является ли промокод промокодом для мам.
 * Динамически проверяется через promoBundles.ts (устраняя хардкод)
 */
export function isMomPromo(promo?: string | null): boolean {
  return isPromoUnlockingMomDecks(promo);
}

/**
 * Проверка, является ли тематическая колода всегда бесплатной:
 * - 3 базовые колоды (verbs-alef-1, shuk-food-alef, cafe-restaurant-alef) — всегда бесплатны для всех.
 * - 7 колод для мам — бесплатны при наличии промокода или открытой категории/колоды в профиле.
 */
export function isDeckAlwaysFree(
  deckId: string,
  userPromo?: string | null,
  userProfile?: {
    unlockedDecks?: string[];
    unlockedCategories?: string[];
    activatedPromos?: string[];
  } | null
): boolean {
  if ((BASE_FREE_DECK_IDS as readonly string[]).includes(deckId)) {
    return true;
  }
  // 1. Проверка индивидуально открытых колод в профиле
  if (userProfile?.unlockedDecks && userProfile.unlockedDecks.includes(deckId)) {
    return true;
  }
  // 2. Проверка открытых категорий в профиле (например 'mom')
  if (isMomDeck(deckId) && userProfile?.unlockedCategories?.includes('mom')) {
    return true;
  }
  // 3. Проверка по промокодам профиля или переданному коду
  if (isMomDeck(deckId)) {
    if (isMomPromo(userPromo)) return true;
    if (userProfile?.activatedPromos?.some((p) => isMomPromo(p))) return true;
  }
  return false;
}

/**
 * Проверка, открывает ли промокод или профиль конкретный урок навсегда
 */
export function isLessonPromoFree(
  lessonId: number,
  userPromo?: string | null,
  userProfile?: {
    unlockedLessons?: number[];
    activatedPromos?: string[];
  } | null
): boolean {
  if (userProfile?.unlockedLessons && userProfile.unlockedLessons.includes(lessonId)) {
    return true;
  }
  if (userPromo) {
    const bundle = resolvePromoBundle(userPromo);
    if (bundle && isLessonUnlockedByBundle(lessonId, bundle)) {
      return true;
    }
  }
  if (userProfile?.activatedPromos) {
    for (const promo of userProfile.activatedPromos) {
      const bundle = resolvePromoBundle(promo);
      if (bundle && isLessonUnlockedByBundle(lessonId, bundle)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Проверка, требуется ли бесплатная регистрация для доступа к колоде
 * (3 базовые колоды открыты гостям, колоды для мам открываются по коду после регистрации)
 */
export function isDeckAuthRequired(
  deckId: string,
  isLoggedIn: boolean,
  userPromo?: string | null,
  userProfile?: {
    unlockedDecks?: string[];
    unlockedCategories?: string[];
    activatedPromos?: string[];
  } | null
): boolean {
  if (isDeckAlwaysFree(deckId, userPromo, userProfile)) {
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
export function getDeckAccessTier(deckId: string, isPro: boolean, userPromo?: string | null): ContentAccessTier {
  if (isPro) return 'always_free';
  if (isDeckAlwaysFree(deckId, userPromo)) return 'always_free';
  if (IS_EARLY_ACCESS_FREE) return 'pro_beta';
  return 'pro_locked';
}
