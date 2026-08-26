import { stripNikkud } from './transcription';

export interface SentenceToken {
  type: 'word' | 'punct';
  text: string;
  slotIndex?: number;
}

export interface ParsedSentence {
  tokens: SentenceToken[];
  cleanWords: string[];
  fullSentence: string;
}

/**
 * Очищает слово от внешних знаков препинания, сохраняя внутренние кавычки/апострофы (например: ארה"ב, צ'יפס).
 */
export function stripPunctuation(word: string): string {
  if (!word) return '';
  // Удаляем начальные и конечные знаки препинания: .,?!:;-—–«»()[]"
  return word
    .replace(/^[.,?!:;\-—–«»()[\]"״׳…\s]+/, '')
    .replace(/[.,?!:;\-—–«»()[\]"…\s]+$/, '')
    .trim();
}

/**
 * Проверяет, является ли токен чисто знаком препинания
 */
export function isPunctuationToken(token: string): boolean {
  const trimmed = token.trim();
  if (!trimmed) return false;
  return /^[.,?!:;\-—–«»()[\]"…]+$/.test(trimmed);
}

/**
 * Разбивает предложение на иврите на структурированные токены (слова со слотами и нередактируемые знаки препинания).
 */
export function parseHebrewSentence(sentenceStr: string): ParsedSentence {
  const raw = (sentenceStr || '').trim();
  if (!raw) {
    return { tokens: [], cleanWords: [], fullSentence: '' };
  }

  // Регулярное выражение для токенизации:
  // 1. Время/числа со двоеточием (например, בְּ-7:00 или 08:30): (?:[^\s.,?!;—–«»()]+\d+:\d+|\d+:\d+)
  // 2. Многоточие: \.\.\.|…
  // 3. Одиночные знаки препинания: [?!.,;:—–()[\]«»]
  // 4. Отдельно стоящее тире: (?:\s|^)[-־](?:\s|$)
  // 5. Слова (иврит с огласовками, латиница, цифры, внутренние кавычки/апострофы/дефисы)
  const tokenRegex = /((?:[^\s.,?!;—–«»()]*\d+:\d+))|(\.\.\.|…|[?!.,;:—–()[\]«»]|(?<=\s|^)[-־](?=\s|$))|([^\s.,?!;:—–()[\]«»…]+)/g;

  const tokens: SentenceToken[] = [];
  const cleanWords: string[] = [];
  let match: RegExpExecArray | null;
  let wordSlot = 0;

  while ((match = tokenRegex.exec(raw)) !== null) {
    const timeMatch = match[1];
    const punct = match[2];
    const word = match[3];

    if (timeMatch) {
      const clean = stripPunctuation(timeMatch);
      if (clean.length > 0) {
        tokens.push({
          type: 'word',
          text: clean,
          slotIndex: wordSlot,
        });
        cleanWords.push(clean);
        wordSlot++;
      }
    } else if (punct) {
      const cleanPunct = punct.trim();
      if (cleanPunct) {
        tokens.push({
          type: 'punct',
          text: cleanPunct,
        });
      }
    } else if (word) {
      const clean = stripPunctuation(word);
      if (clean.length > 0 && !isPunctuationToken(clean)) {
        tokens.push({
          type: 'word',
          text: clean,
          slotIndex: wordSlot,
        });
        cleanWords.push(clean);
        wordSlot++;
      } else if (clean.length > 0) {
        tokens.push({
          type: 'punct',
          text: clean,
        });
      }
    }
  }

  return {
    tokens,
    cleanWords,
    fullSentence: raw,
  };
}

/**
 * Сравнивает два слова на иврите с учетом или без учета огласовок
 */
export function areWordsEqual(wordA: string, wordB: string, strictNikkud = false): boolean {
  if (strictNikkud) {
    return wordA.trim() === wordB.trim();
  }
  return stripNikkud(wordA).trim() === stripNikkud(wordB).trim();
}
