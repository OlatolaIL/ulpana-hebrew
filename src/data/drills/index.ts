/**
 * Единый реестр и диспетчер слухового тренажёра «Комплекс» (ComplexDrills).
 *
 * Инварианты:
 * - R-01: pealimMasterDictionary.json — SSOT для лексики.
 * - R-18: Строгая матрица предложений для глаголов (из verbSentencesData).
 * - Полиморфная поддержка существительных, прилагательных, предлогов и глаголов.
 */

import { Word, RootRelatedWord } from '@/types';
import { stripNikkud } from '@/lib/transcription';
import {
  ComplexDrillItem,
  VerbDrillItem,
  NounDrillItem,
  AdjectiveDrillItem,
  PrepositionDrillItem,
} from '@/types/complexDrills';
import {
  getVerbDrillSentences,
  VerbDrillSentence,
} from '@/data/verbSentencesData';
import { findOfflineVerbConjugation } from '@/lib/verbConjugations';
import { NOUN_DRILLS_DATA, getNounDrill } from './nounDrillsData';
import { ADJECTIVE_DRILLS_DATA, getAdjectiveDrill } from './adjectiveDrillsData';
import { PREPOSITION_DRILLS_DATA, getPrepositionDrill } from './prepositionDrillsData';
import { MOM_DRILLS_DATA, getMomDrill } from './momDrillsData';

export {
  NOUN_DRILLS_DATA,
  getNounDrill,
  ADJECTIVE_DRILLS_DATA,
  getAdjectiveDrill,
  PREPOSITION_DRILLS_DATA,
  getPrepositionDrill,
  MOM_DRILLS_DATA,
  getMomDrill,
};

/**
 * Проверяет, есть ли готовые фразы для режима «Комплекс» у переданного слова.
 */
export function hasComplexDrill(word: Word | { hebrew: string; hebrewPlain?: string }): boolean {
  if (!word) return false;
  const raw = (word.hebrewPlain || word.hebrew || '').trim();
  const plain = stripNikkud(raw).trim();

  // 0. Проверяем тематический мамский комплекс
  if (getMomDrill(raw) || getMomDrill(plain)) return true;

  // 1. Проверяем глаголы
  const verbList = getVerbDrillSentences(raw);
  if (verbList.length > 0) return true;

  // 2. Проверяем существительные
  if (NOUN_DRILLS_DATA[plain] || NOUN_DRILLS_DATA[raw]) return true;

  // 3. Проверяем прилагательные
  if (ADJECTIVE_DRILLS_DATA[plain] || ADJECTIVE_DRILLS_DATA[raw]) return true;

  // 4. Проверяем предлоги
  if (PREPOSITION_DRILLS_DATA[plain] || PREPOSITION_DRILLS_DATA[raw]) return true;

  return false;
}

/**
 * Извлекает полный список обучающих объектов для режима «Комплекс».
 * Для глаголов может вернуть несколько предложений (в разных временах),
 * для существительных/прилагательных/предлогов возвращает массив из 1 элемента.
 */
export function getDrillDataForWord(currentWord: Word): ComplexDrillItem[] {
  if (!currentWord) return [];

  const raw = (currentWord.hebrewPlain || currentWord.hebrew || '').trim();
  const plain = stripNikkud(raw).trim();

  // 0. ТЕМАТИЧЕСКИЙ МАМСКИЙ КОМПЛЕКС (приоритет для лексики мам)
  const momItem = getMomDrill(raw) || getMomDrill(plain);
  if (momItem) {
    return [momItem];
  }

  // 1. СУЩЕСТВИТЕЛЬНЫЕ
  const nounItem = getNounDrill(raw) || getNounDrill(plain);
  if (nounItem) {
    return [nounItem];
  }

  // 2. ПРИЛАГАТЕЛЬНЫЕ
  const adjItem = getAdjectiveDrill(raw) || getAdjectiveDrill(plain);
  if (adjItem) {
    return [adjItem];
  }

  // 3. ПРЕДЛОГИ
  const prepItem = getPrepositionDrill(raw) || getPrepositionDrill(plain);
  if (prepItem) {
    return [prepItem];
  }

  // 4. ГЛАГОЛЫ
  const verbSentences = getVerbDrillSentences(raw);
  if (verbSentences.length > 0) {
    const conjugation = findOfflineVerbConjugation(raw);
    const rootFamily: RootRelatedWord[] = conjugation?.rootFamily || [];
    const root = conjugation?.root || currentWord.root;
    const binyan = conjugation?.binyan || (currentWord as any).binyan;

    return verbSentences.map((s): VerbDrillItem => ({
      id: s.id,
      type: 'verb',
      targetWordPlain: plain,
      targetWordVocalized: s.verbInfinitive || currentWord.hebrew,
      targetWordTranscription: currentWord.transcription || '',
      targetWordTranslation: currentWord.translation || '',
      sentenceHe: s.sentenceHe,
      sentenceTranscription: s.sentenceTranscription,
      sentenceRu: s.sentenceRu,
      minLesson: s.minLesson,
      lessonTheme: s.lessonTheme,
      verbInfinitive: s.verbInfinitive,
      verbForm: s.verbForm,
      tense: s.tense,
      tenseRu: s.tenseRu,
      prepositionPlain: s.prepositionPlain,
      prepositionVocalized: s.prepositionVocalized,
      root,
      binyan,
      rootFamily,
    }));
  }

  // 5. РЕЗЕРВНЫЙ ФОЛБЭК ДЛЯ ЛЮБОГО СЛОВА
  const fallback: ComplexDrillItem = {
    id: `fallback_${currentWord.id || plain}`,
    type: (currentWord.partOfSpeech as any) || 'noun',
    targetWordPlain: plain,
    targetWordVocalized: currentWord.hebrew,
    targetWordTranscription: currentWord.transcription || '',
    targetWordTranslation: currentWord.translation || '',
    sentenceHe: currentWord.hebrew,
    sentenceTranscription: currentWord.transcription || '',
    sentenceRu: currentWord.translation || '',
    minLesson: currentWord.lessonId || 1,
    lessonTheme: 'Словарь',
  };

  return [fallback];
}
