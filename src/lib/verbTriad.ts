import { Word, VerbConjugation, ConjugationForm } from '@/types';
import { findOfflineVerbConjugation } from './verbConjugations';
import { stripNikkud } from './transcription';
import { getVerbPrepositionInfo, VerbPrepositionInfo } from './verbPrepositions';

export interface VerbTriadForm {
  hebrew: string;
  transcription: string;
  translation: string;
  labelRu: string;
  labelHe: string;
}

export interface VerbTriadInfo {
  infinitive: VerbTriadForm;
  presentMasc: VerbTriadForm;
  pastHe: VerbTriadForm;
  binyan: string;
  binyanClean: string;
  root: string;
  prepositionInfo: VerbPrepositionInfo | null;
  conjugation: VerbConjugation;
}

function cleanBinyanName(rawBinyan: string): string {
  if (!rawBinyan) return '';
  // Извлекаем русское название в скобках, если есть, например "פָּעַל (Пааль)" -> "Пааль"
  const match = rawBinyan.match(/\(([^)]+)\)/);
  if (match && match[1]) {
    return match[1].trim();
  }
  return rawBinyan.trim();
}

/**
 * Извлечение ключевой триады («Ядра глагола») для слова или инфинитива
 */
export function extractVerbTriad(wordOrText: Word | string): VerbTriadInfo | null {
  if (!wordOrText) return null;

  const rawHebrew = typeof wordOrText === 'string' ? wordOrText : wordOrText.hebrew;
  const rawTranslation = typeof wordOrText === 'string' ? '' : wordOrText.translation;

  // Ищем спряжения в базе
  const conjugation = findOfflineVerbConjugation(rawHebrew);
  if (!conjugation) return null;

  // 1. Инфинитив
  const infHebrew = conjugation.infinitive?.hebrew || rawHebrew;
  const infTranscription = conjugation.infinitive?.transcription || '';
  const infTranslation = conjugation.infinitive?.translation || rawTranslation || '';

  // 2. Настоящее время (Он / זכר יחיד)
  let presentForm: ConjugationForm | undefined;
  if (conjugation.present && conjugation.present.length > 0) {
    presentForm =
      conjugation.present.find(
        (f) =>
          f.pronoun.includes('זָכָר יָחִיד') ||
          f.pronoun.includes('он') ||
          f.pronoun.includes('הוא')
      ) || conjugation.present[0];
  }

  // 3. Прошедшее время (Он вчера / הוא)
  let pastForm: ConjugationForm | undefined;
  if (conjugation.past && conjugation.past.length > 0) {
    pastForm =
      conjugation.past.find(
        (f) =>
          f.pronoun.includes('הוּא') ||
          f.pronoun.includes('он') ||
          f.pronoun.startsWith('הוא')
      ) || conjugation.past[3] || conjugation.past[0];
  }

  if (!presentForm || !pastForm) return null;

  const prepInfo = getVerbPrepositionInfo(infHebrew);

  return {
    infinitive: {
      hebrew: infHebrew,
      transcription: infTranscription,
      translation: infTranslation,
      labelRu: 'Инфинитив',
      labelHe: 'שם הפועל',
    },
    presentMasc: {
      hebrew: presentForm.hebrew,
      transcription: presentForm.transcription,
      translation: presentForm.translation,
      labelRu: 'Настоящее (он)',
      labelHe: 'הווה (הוא)',
    },
    pastHe: {
      hebrew: pastForm.hebrew,
      transcription: pastForm.transcription,
      translation: pastForm.translation,
      labelRu: 'Прошедшее (он)',
      labelHe: 'עבר (הוא)',
    },
    binyan: conjugation.binyan,
    binyanClean: cleanBinyanName(conjugation.binyan),
    root: conjugation.root,
    prepositionInfo: prepInfo,
    conjugation,
  };
}
