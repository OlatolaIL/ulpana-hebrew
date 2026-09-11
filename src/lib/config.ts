/**
 * Конфигурация платформы и доступа к контенту
 */

// Режим раннего бесплатного доступа (Early Access / Beta)
// true: все 100 уроков и функции ИИ открыты для всех пользователей
// false: действует стандартная монетизация (только первые FREE_LESSONS_LIMIT уроков бесплатны)
export const IS_EARLY_ACCESS_FREE = true;

// Количество базовых бесплатных уроков Алеф при выключенном режиме раннего доступа
export const FREE_LESSONS_LIMIT = 30;

// Количество уроков, полностью доступных гостям без регистрации
export const FREE_GUEST_LESSONS_LIMIT = 2;

/**
 * Проверка, требуется ли бесплатная регистрация для доступа к уроку
 */
export function isLessonAuthRequired(lessonId: number, isLoggedIn: boolean): boolean {
  return lessonId > FREE_GUEST_LESSONS_LIMIT && !isLoggedIn;
}

/**
 * Проверка, заблокирован ли урок для пользователя (при выключенном раннем доступе)
 */
export function isLessonLockedForUser(lessonId: number, isPro: boolean): boolean {
  if (IS_EARLY_ACCESS_FREE) {
    return false;
  }
  return lessonId > FREE_LESSONS_LIMIT && !isPro;
}
