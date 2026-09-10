import { VerbConjugation, RootRelatedWord } from '@/types';
import { stripNikkud } from '@/lib/transcription';
import { findWordsByRoot } from '@/lib/ulpanDictionary';
import { COMPREHENSIVE_ROOT_FAMILIES } from '@/lib/rootFamiliesData';
import { VERB_CONJUGATIONS_DATABASE } from './database';
import { ROOT_FAMILIES_PRESETS } from './rootPresets';

export { VERB_CONJUGATIONS_DATABASE } from './database';
export { ROOT_FAMILIES_PRESETS } from './rootPresets';

/**
 * Получение всех однокоренных слов (Семья корня / Pealim Root Family)
 */
export function getRootFamilyWords(
  root?: string,
  explicitList?: RootRelatedWord[],
  currentVerb?: VerbConjugation
): RootRelatedWord[] {
  if (!root) return explicitList || [];
  const cleanRootKey = root.replace(/[^א-ת]/g, '');

  const results: RootRelatedWord[] = [];
  const seen = new Set<string>();

  // Формы текущего глагола (инфинитив, настоящее, прошедшее, будущее, повелительное),
  // чтобы исключить спряжения самого глагола из списка семьи корня!
  const currentVerbForms = new Set<string>();
  if (currentVerb) {
    if (currentVerb.infinitive?.hebrew) {
      currentVerbForms.add(stripNikkud(currentVerb.infinitive.hebrew));
    }
    const categories: Array<'present' | 'past' | 'future' | 'imperative'> = [
      'present',
      'past',
      'future',
      'imperative',
    ];
    for (const cat of categories) {
      const forms = currentVerb[cat];
      if (Array.isArray(forms)) {
        for (const f of forms) {
          if (f?.hebrew) {
            f.hebrew.split(' / ').forEach((sub: string) => {
              currentVerbForms.add(stripNikkud(sub).trim());
            });
          }
        }
      }
    }
  }

  const addWord = (w: RootRelatedWord) => {
    const plain = stripNikkud(w.hebrewPlain || w.hebrew);
    if (!plain || seen.has(plain)) return;
    // Исключаем формы спряжения самого глагола!
    if (currentVerbForms.has(plain)) return;
    // Если это глагол того же биньяна, исключаем его
    if (w.partOfSpeech === 'verb' && currentVerb && w.binyan && w.binyan === currentVerb.binyan)
      return;
    seen.add(plain);
    results.push(w);
  };

  // 1. Явный список из параметров
  if (explicitList) {
    explicitList.forEach(addWord);
  }

  // 2. Всеобъемлющая база семей корней (богатый набор существительных, прилагательных, выражений)
  if (COMPREHENSIVE_ROOT_FAMILIES[cleanRootKey]) {
    COMPREHENSIVE_ROOT_FAMILIES[cleanRootKey].forEach(addWord);
  }

  // 3. Старые пресеты
  if (ROOT_FAMILIES_PRESETS[cleanRootKey]) {
    ROOT_FAMILIES_PRESETS[cleanRootKey].forEach(addWord);
  }

  // 4. Поиск по словарю и урокам (в первую очередь существительные, прилагательные и выражения)
  const dictMatches = findWordsByRoot(root);
  for (const m of dictMatches) {
    const pos = m.partOfSpeech || 'other';
    if (pos !== 'verb') {
      addWord({
        hebrew: m.hebrew,
        hebrewPlain: m.hebrewPlain || stripNikkud(m.hebrew),
        transcription: m.transcription,
        translation: m.translation,
        partOfSpeech: pos as any,
        root: m.root || root,
      });
    }
  }

  // 5. В самом конце (если слов мало) можно добавить инфинитивы других биньянов
  for (const m of dictMatches) {
    const pos = m.partOfSpeech || 'other';
    if (pos === 'verb') {
      addWord({
        hebrew: m.hebrew,
        hebrewPlain: m.hebrewPlain || stripNikkud(m.hebrew),
        transcription: m.transcription,
        translation: m.translation,
        partOfSpeech: 'verb',
        binyan: (m as any).binyan,
        root: m.root || root,
      });
    }
  }

  return results;
}

/**
 * Быстрый поиск таблицы спряжения по любой форме глагола (инфинитив, настоящее, прошедшее, будущее)
 */
export function findOfflineVerbConjugation(query: string): VerbConjugation | null {
  if (!query) return null;
  const clean = stripNikkud(query.trim().toLowerCase()).replace(/["'״׳\-–—]/g, '');
  if (!clean) return null;

  let matchedVerb: VerbConjugation | null = null;

  // 1. Прямой поиск по ключу инфинитива
  if (VERB_CONJUGATIONS_DATABASE[clean]) {
    matchedVerb = VERB_CONJUGATIONS_DATABASE[clean];
  } else if (!clean.startsWith('ל') && VERB_CONJUGATIONS_DATABASE['ל' + clean]) {
    // 1b. Поиск без начальной 'ל' (например 'חפש' -> 'לחפש')
    matchedVerb = VERB_CONJUGATIONS_DATABASE['ל' + clean];
  } else {
    // 2. Поиск по всем глаголам в базе (инфинитив, корень, формы)
    for (const [, verb] of Object.entries(VERB_CONJUGATIONS_DATABASE)) {
      if (stripNikkud(verb.infinitive.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean) {
        matchedVerb = verb;
        break;
      }
      if (
        verb.root &&
        stripNikkud(verb.root.replace(/[^א-ת]/g, '')).toLowerCase() ===
          clean.replace(/[^א-ת]/g, '')
      ) {
        matchedVerb = verb;
        break;
      }
      if (
        verb.present &&
        verb.present.some(
          (f) => stripNikkud(f.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean
        )
      ) {
        matchedVerb = verb;
        break;
      }
      if (
        verb.past &&
        verb.past.some(
          (f) =>
            stripNikkud(f.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean ||
            f.hebrew
              .split(' / ')
              .some((sub) => stripNikkud(sub).toLowerCase().replace(/["'״׳]/g, '') === clean)
        )
      ) {
        matchedVerb = verb;
        break;
      }
      if (
        verb.future &&
        verb.future.some(
          (f) => stripNikkud(f.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean
        )
      ) {
        matchedVerb = verb;
        break;
      }
      if (
        verb.imperative &&
        verb.imperative.some(
          (f) => stripNikkud(f.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean
        )
      ) {
        matchedVerb = verb;
        break;
      }
    }
  }

  if (matchedVerb) {
    const rootFamily = getRootFamilyWords(matchedVerb.root, matchedVerb.rootFamily, matchedVerb);
    return {
      ...matchedVerb,
      rootFamily: rootFamily.length > 0 ? rootFamily : undefined,
    };
  }

  // 3. Поиск составных фраз и идиом (например, "לַחֲזֹר בְּטֶלֶפוֹן", "לַעֲשׂוֹת חַיִּים", "לִקְבֹּעַ תּוֹר")
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    for (const w of words) {
      if (w.startsWith('ל') || w.length >= 3) {
        const subMatch = findOfflineVerbConjugation(w);
        if (subMatch) return subMatch;
      }
    }
  }

  return null;
}
