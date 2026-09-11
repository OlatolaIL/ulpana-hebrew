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

/**
 * Единый источник истины для этапов каждого урока
 */
export type LessonStageId = 'theory' | 'vocab' | 'exercises' | 'essay' | 'chat' | 'phone';

export interface LessonStageConfig {
  id: LessonStageId;
  num: number;
  labelRu: string;
  labelHe: string;
  descriptionRu: string;
}

export const LESSON_STAGES: LessonStageConfig[] = [
  { id: 'theory', num: 1, labelRu: 'Теория', labelHe: 'תֵּאוֹרְיָה', descriptionRu: 'Теория и правила' },
  { id: 'vocab', num: 2, labelRu: 'Слова', labelHe: 'מִילִּים', descriptionRu: 'Словарь урока' },
  { id: 'exercises', num: 3, labelRu: 'Тесты', labelHe: 'תַּרְגִּילִים', descriptionRu: 'Упражнения и тесты' },
  { id: 'essay', num: 4, labelRu: 'Сочинение', labelHe: 'חִבּוּר', descriptionRu: 'Написание сочинения' },
  { id: 'chat', num: 5, labelRu: 'Диалог', labelHe: 'שִׂיחָה', descriptionRu: 'Диалог и ИИ-чат' },
  { id: 'phone', num: 6, labelRu: 'Звонок', labelHe: 'טֶלֶפוֹן', descriptionRu: 'Телефонный звонок с ИИ' },
];

export function getStageNumber(id: LessonStageId): number {
  const stage = LESSON_STAGES.find((s) => s.id === id);
  return stage ? stage.num : 1;
}

export function getStageTitle(id: LessonStageId): string {
  const stage = LESSON_STAGES.find((s) => s.id === id);
  return stage ? stage.labelRu : '';
}

