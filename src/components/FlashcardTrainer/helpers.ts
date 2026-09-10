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
