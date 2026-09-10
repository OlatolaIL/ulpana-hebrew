/**
 * Профессиональные тематические словари
 *
 * Структура:
 *   caregiver.ts  — Метапелет (מְטַפֶּלֶת), уход за пожилыми
 *
 * Чтобы добавить новую профессию:
 *   1. Создай файл <profession>.ts рядом с этим файлом
 *   2. Экспортируй массив XXXX_DECKS: ThematicDeck[]
 *   3. Добавь его в PROFESSIONAL_DECKS ниже
 */

import { ThematicDeck } from '@/types';
import { CAREGIVER_DECKS } from './caregiver';
import { AUTO_REPAIR_DECKS } from './autoRepair';
import { KINDERGARTEN_DECKS } from './kindergarten';
import { DOCTOR_DECKS } from './doctor';
import { ACCOUNTING_DECKS } from './accounting';

// При добавлении новой профессии — просто добавь её массив сюда:
export const PROFESSIONAL_DECKS: ThematicDeck[] = [
  ...CAREGIVER_DECKS,
  ...AUTO_REPAIR_DECKS,
  ...KINDERGARTEN_DECKS,
  ...DOCTOR_DECKS,
  ...ACCOUNTING_DECKS,
];

/**
 * Получить все профессиональные колоды
 */
export function getAllProfessionalDecks(): ThematicDeck[] {
  return PROFESSIONAL_DECKS;
}

/**
 * Получить колоды по профессии (prefix id, например 'caregiver')
 */
export function getProfessionalDecksByProfession(prefix: string): ThematicDeck[] {
  return PROFESSIONAL_DECKS.filter((d) => d.id.startsWith(prefix));
}

/**
 * Получить колоду по ID
 */
export function getProfessionalDeckById(id: string): ThematicDeck | undefined {
  return PROFESSIONAL_DECKS.find((d) => d.id === id);
}
