/**
 * Тематические словари и колоды для уровней Алеф (א) и Бет (ב)
 *
 * Модульная структура:
 *   - verbs.ts          — Глаголы Пааль, Пиэль, Ифъиль, Итпаэль, Нифъаль (Алеф и Бет)
 *   - foodAndHome.ts    — Шук, продукты, кафе, дом, быт
 *   - cityAndPeople.ts  — Город, транспорт, семья, числа, время
 *   - health.ts         — Тело, симптомы, поликлиника (Купат Холим)
 *   - advanced.ts       — Работа/хай-тек, банк/жилье, сленг, новости/общество
 */

import { ThematicDeck, Word } from '@/types';
import { VERB_DECKS } from './verbs';
import { FOOD_AND_HOME_DECKS } from './foodAndHome';
import { CITY_AND_PEOPLE_DECKS } from './cityAndPeople';
import { HEALTH_DECKS } from './health';
import { ADVANCED_DECKS } from './advanced';

export { VERB_DECKS } from './verbs';
export { FOOD_AND_HOME_DECKS } from './foodAndHome';
export { CITY_AND_PEOPLE_DECKS } from './cityAndPeople';
export { HEALTH_DECKS } from './health';
export { ADVANCED_DECKS } from './advanced';

export const THEMATIC_DECKS: ThematicDeck[] = [
  ...VERB_DECKS,
  ...FOOD_AND_HOME_DECKS,
  ...CITY_AND_PEOPLE_DECKS,
  ...HEALTH_DECKS,
  ...ADVANCED_DECKS,
];

/**
 * Получить слова колоды по ID
 */
export function getDeckWords(deckId: string): Word[] {
  const deck = getThematicDeckById(deckId);
  return deck ? deck.words : [];
}

/**
 * Получить колоду по ID
 */
export function getThematicDeckById(id: string): ThematicDeck | undefined {
  if (id === 'top-100-verbs-alef') {
    return THEMATIC_DECKS.find((deck) => deck.id === 'verbs-alef-1');
  }
  return THEMATIC_DECKS.find((deck) => deck.id === id);
}

/**
 * Получить колоды по уровню ('alef' | 'bet' | 'all')
 */
export function getThematicDecksByLevel(level?: 'alef' | 'bet' | 'all'): ThematicDeck[] {
  if (!level || level === 'all') return THEMATIC_DECKS;
  return THEMATIC_DECKS.filter((deck) => deck.level === level || deck.level === 'all');
}

/**
 * Выгрузить слова колоды в текстовый список (для печати, копирования в буфер или заметок)
 */
export function getDeckWordsAsText(
  deckId: string,
  options: { withNikkud?: boolean; withTranscription?: boolean; withRoot?: boolean } = {
    withNikkud: true,
    withTranscription: true,
    withRoot: true,
  }
): string {
  const deck = getThematicDeckById(deckId);
  if (!deck) return '';

  const lines: string[] = [
    `📚 ${deck.title} (${deck.titleHebrew}) — ${deck.words.length} слов`,
    `Уровень: ${deck.level.toUpperCase()} | Категория: ${deck.category}`,
    '='.repeat(40),
  ];

  deck.words.forEach((w, index) => {
    const hebrewText = options.withNikkud ? w.hebrew : w.hebrewPlain || w.hebrew;
    const trans = options.withTranscription && w.transcription ? ` [${w.transcription}]` : '';
    const rootInfo = options.withRoot && w.root ? ` (корень: ${w.root})` : '';
    lines.push(`${index + 1}. ${hebrewText}${trans} — ${w.translation}${rootInfo}`);
  });

  return lines.join('\n');
}

/**
 * Экспорт колоды в формат TSV (для Anki, Excel, Google Таблиц)
 */
export function exportDeckToTsv(deckId: string): string {
  const deck = getThematicDeckById(deckId);
  if (!deck) return '';

  const header = ['Иврит', 'Иврит без огласовок', 'Транскрипция', 'Перевод', 'Часть речи', 'Корень', 'Множ. число'];
  const rows = deck.words.map((w) => [
    w.hebrew,
    w.hebrewPlain || '',
    w.transcription,
    w.translation,
    w.partOfSpeech || '',
    w.root || '',
    w.plural || '',
  ]);

  return [header.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
}
