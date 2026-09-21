/**
 * Модуль управления пакетами бессрочного доступа (Access Bundles)
 * для промокодов и партнерских кампаний.
 *
 * Устраняет хардкод названий промокодов (LATTE_MAMA, MOMS, TG_MAMA)
 * и предоставляет единый источник истины для наборов открываемого контента.
 */

export const MOM_DECK_IDS = [
  'mom-infant',
  'mom-pediatrician',
  'mom-pharmacy',
  'mom-kindergarten',
  'mom-school',
  'mom-whatsapp',
  'mom-playground',
] as const;

export interface PromoAccessBundle {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedLessons: number[];
  unlockedDecks: string[];
  unlockedCategories: string[];
  isSystem?: boolean;
}

/**
 * Стандартные системные пакеты доступа по умолчанию.
 * Служат надежным fallback'ом при отсутствии подключения к БД (офлайн/SSR/тесты).
 */
export const DEFAULT_BUNDLES: PromoAccessBundle[] = [
  {
    id: 'bundle_moms',
    name: 'Пакет для мам (7 тем)',
    description: 'Все 7 колод родительского направления: детский сад, школа, поликлиника, аптека, чаты, площадка, грудничок',
    icon: '👩‍👧',
    unlockedLessons: [],
    unlockedDecks: [...MOM_DECK_IDS],
    unlockedCategories: ['mom'],
    isSystem: true,
  },
  {
    id: 'bundle_lessons_1_30',
    name: 'Начальный Алеф (Уроки 1–30)',
    description: 'Все 30 базовых уроков курса открыты навсегда',
    icon: '📚',
    unlockedLessons: Array.from({ length: 30 }, (_, i) => i + 1),
    unlockedDecks: [],
    unlockedCategories: [],
    isSystem: true,
  },
  {
    id: 'bundle_professional',
    name: 'Профессиональные колоды (7 тем)',
    description: 'Все рабочие темы: уход (метапелет), автомеханик, воспитатель, врач, бухгалтерия, библиотекарь, автомойка',
    icon: '🚗',
    unlockedLessons: [],
    unlockedDecks: [],
    unlockedCategories: ['caregiver', 'autoRepair', 'kindergarten', 'doctor', 'accounting', 'librarian', 'carWash'],
    isSystem: true,
  },
  {
    id: 'bundle_all_free',
    name: 'Полный бессрочный доступ',
    description: 'Все 100 уроков курса и все тематические колоды открыты навсегда',
    icon: '🌟',
    unlockedLessons: Array.from({ length: 100 }, (_, i) => i + 1),
    unlockedDecks: [],
    unlockedCategories: ['all'],
    isSystem: true,
  },
];

/**
 * Начальная карта привязки промокодов к системным пакетам.
 * Ранее была захардкожена прямо в permissions.ts.
 */
export const DEFAULT_PROMO_BUNDLE_MAPPINGS: Record<string, string> = {
  LATTE_MAMA: 'bundle_moms',
  MOMS: 'bundle_moms',
  TG_MAMA: 'bundle_moms',
};

/**
 * Найти бандл по его ID среди переданных или дефолтных
 */
export function getBundleById(
  bundleId?: string | null,
  customBundles?: PromoAccessBundle[]
): PromoAccessBundle | null {
  if (!bundleId) return null;
  const pool = customBundles && customBundles.length > 0 ? customBundles : DEFAULT_BUNDLES;
  return pool.find((b) => b.id === bundleId) || DEFAULT_BUNDLES.find((b) => b.id === bundleId) || null;
}

/**
 * Определить пакет доступа для промокода
 */
export function resolvePromoBundle(
  promoCode?: string | null,
  customMappings?: Record<string, string>,
  customBundles?: PromoAccessBundle[]
): PromoAccessBundle | null {
  if (!promoCode) return null;
  const clean = promoCode.trim().toUpperCase();

  // 1. Поиск по кастомной или дефолтной карте
  const bundleId = customMappings?.[clean] || DEFAULT_PROMO_BUNDLE_MAPPINGS[clean];
  if (bundleId) {
    return getBundleById(bundleId, customBundles);
  }

  // 2. Умное эвристическое правило: если промокод содержит MAMA или MOM
  if (clean.includes('MAMA') || clean.includes('MOM')) {
    return getBundleById('bundle_moms', customBundles);
  }

  return null;
}

/**
 * Проверка, открывает ли данный промокод колоды для мам.
 * Заменяет устаревший хардкод: p === 'LATTE_MAMA' || p === 'MOMS' || p === 'TG_MAMA'
 */
export function isPromoUnlockingMomDecks(
  promoCode?: string | null,
  customMappings?: Record<string, string>,
  customBundles?: PromoAccessBundle[]
): boolean {
  if (!promoCode) return false;
  const bundle = resolvePromoBundle(promoCode, customMappings, customBundles);
  if (!bundle) return false;
  return bundle.unlockedCategories.includes('mom') || bundle.unlockedCategories.includes('all');
}

/**
 * Проверка, открывает ли бандл конкретную колоду.
 * Поддерживает как вызов с категорией (deckId, category, bundle),
 * так и прямой вызов без категории (deckId, bundle).
 */
export function isDeckUnlockedByBundle(
  deckId: string,
  bundleOrCategory?: PromoAccessBundle | string | null,
  maybeBundle?: PromoAccessBundle | null
): boolean {
  let bundle: PromoAccessBundle | null | undefined;
  let deckCategory: string | undefined;

  if (bundleOrCategory && typeof bundleOrCategory === 'object') {
    bundle = bundleOrCategory;
    deckCategory = undefined;
  } else {
    deckCategory = typeof bundleOrCategory === 'string' ? bundleOrCategory : undefined;
    bundle = maybeBundle;
  }

  if (!bundle) return false;
  if (bundle.unlockedCategories && bundle.unlockedCategories.includes('all')) return true;
  if (deckCategory && bundle.unlockedCategories && bundle.unlockedCategories.includes(deckCategory)) return true;
  if (bundle.unlockedDecks && bundle.unlockedDecks.includes(deckId)) return true;
  return false;
}

/**
 * Проверка, открывает ли бандл конкретный урок
 */
export function isLessonUnlockedByBundle(
  lessonId: number,
  bundle?: PromoAccessBundle | null
): boolean {
  if (!bundle) return false;
  if (bundle.unlockedLessons && bundle.unlockedLessons.includes(lessonId)) return true;
  return false;
}
