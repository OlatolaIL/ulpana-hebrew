import { Word } from '@/types';
import { stripNikkud } from '@/lib/transcription';

/**
 * Равномерно разбивает массив слов на части оптимального размера (7–10 слов).
 * Если слов <= 12, деление не требуется и возвращается исходный массив одной частью.
 */
export function splitWordsIntoParts(wordsList: Word[]): Word[][] {
  const total = wordsList.length;
  if (total <= 12) {
    return [wordsList];
  }
  const numParts = Math.max(2, Math.ceil(total / 10));
  const partsList: Word[][] = [];
  const baseSize = Math.floor(total / numParts);
  const remainder = total % numParts;
  let offset = 0;
  for (let i = 0; i < numParts; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    partsList.push(wordsList.slice(offset, offset + size));
    offset += size;
  }
  return partsList;
}

export function getCleanHebrewTarget(word: Word): string {
  const raw = word.hebrewPlain || word.hebrew || '';
  return stripNikkud(raw)
    .replace(/[.,!?;:"'״׳()[\]{}—\-]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

/**
 * Генерирует массив направлений для режима "Карусель (микс)".
 * true = Русский -> Иврит
 * false = Иврит -> Русский
 * Обеспечивает сбалансированное и полностью перемешанное распределение (вперемешку),
 * чтобы порядок перевода был непредсказуемым на каждом новом круге.
 */
export function generateCarouselDirections(count: number): boolean[] {
  if (count <= 0) return [];
  if (count === 1) return [Math.random() < 0.5];

  const half = Math.floor(count / 2);
  const arr: boolean[] = [];
  for (let i = 0; i < count; i++) {
    arr.push(i < half);
  }
  if (count % 2 !== 0) {
    arr[count - 1] = Math.random() < 0.5;
  }

  // Fisher-Yates shuffle
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  return arr;
}
