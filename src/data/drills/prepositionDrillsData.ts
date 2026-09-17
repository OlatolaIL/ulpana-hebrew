/**
 * База данных проверенных микро-предложений для предлогов со склонениями (נטיות מילות היחס).
 *
 * Инварианты:
 * - Строгое כתיב מלא с огласовками (R-04, R-05, R-06).
 * - Транскрипция с 'h' для ה и знаком ударения (R-09).
 * - Таблица местоименных окончаний (я, ты, он, мы...).
 */

import { PrepositionDrillItem } from '@/types/complexDrills';
import { stripNikkud } from '@/lib/transcription';

export const PREPOSITION_DRILLS_DATA: Record<string, PrepositionDrillItem> = {
  'שלי': {
    id: 'prep_sheli',
    type: 'preposition',
    targetWordPlain: 'שלי',
    targetWordVocalized: 'שֶׁלִּי',
    targetWordTranscription: 'шелӣ́',
    targetWordTranslation: 'мой / моя / моё / мои',
    basePrepositionHe: 'שֶׁל',
    basePrepositionRu: 'принадлежность (кого / чего)',
    inflectedFormHe: 'שֶׁלִּי',
    inflectedTranscription: 'шелӣ́',
    personTitle: 'Я (1-е лицо ед.ч.)',
    inflectionsTable: [
      { person: 'Я', hebrew: 'שֶׁלִּי', transcription: 'шелӣ́', translation: 'мой, моя' },
      { person: 'Ты (м)', hebrew: 'שֶׁלְּךָ', transcription: 'шельхá', translation: 'твой' },
      { person: 'Ты (ж)', hebrew: 'שֶׁלָּךְ', transcription: 'шелáх', translation: 'твоя' },
      { person: 'Он', hebrew: 'שֶׁלּוֹ', transcription: 'шелó', translation: 'его' },
      { person: 'Она', hebrew: 'שֶׁלָּהּ', transcription: 'шелá', translation: 'её' },
      { person: 'Мы', hebrew: 'שֶׁלָּנוּ', transcription: 'шелáну', translation: 'наш' },
      { person: 'Вы (м)', hebrew: 'שֶׁלָּכֶם', transcription: 'шельхéм', translation: 'ваш' },
      { person: 'Они', hebrew: 'שֶׁלָּהֶם', transcription: 'шлаhéм', translation: 'их' },
    ],
    sentenceHe: 'הַסֵּפֶר הַזֶּה שֶׁלִּי.',
    sentenceTranscription: 'hа-сéфер hа-зэ шелӣ́.',
    sentenceRu: 'Эта книга — моя.',
    minLesson: 1,
    lessonTheme: 'Приветствие и принадлежность',
  },
  'איתי': {
    id: 'prep_iti',
    type: 'preposition',
    targetWordPlain: 'איתי',
    targetWordVocalized: 'אִתִּי',
    targetWordTranscription: 'итӣ́',
    targetWordTranslation: 'со мной',
    basePrepositionHe: 'עִם',
    basePrepositionRu: 'предлог «с / вместе с»',
    inflectedFormHe: 'אִתִּי',
    inflectedTranscription: 'итӣ́',
    personTitle: 'Я (1-е лицо ед.ч.)',
    inflectionsTable: [
      { person: 'Я', hebrew: 'אִתִּי', transcription: 'итӣ́', translation: 'со мной' },
      { person: 'Ты (м)', hebrew: 'אִתְּךָ', transcription: 'итхá', translation: 'с тобой' },
      { person: 'Ты (ж)', hebrew: 'אִתָּךְ', transcription: 'итáх', translation: 'с тобой' },
      { person: 'Он', hebrew: 'אִתּוֹ', transcription: 'итó', translation: 'с ним' },
      { person: 'Она', hebrew: 'אִתָּהּ', transcription: 'итá', translation: 'с ней' },
      { person: 'Мы', hebrew: 'אִתָּנוּ', transcription: 'итáну', translation: 'с нами' },
      { person: 'Вы (м)', hebrew: 'אִתְּכֶם', transcription: 'итхéм', translation: 'с вами' },
      { person: 'Они', hebrew: 'אִתָּם', transcription: 'итáм', translation: 'с ними' },
    ],
    sentenceHe: 'אַתָּה רוֹצֶה לָלֶכֶת אִתִּי?',
    sentenceTranscription: 'атá роцэ́ лалéхет итӣ́?',
    sentenceRu: 'Ты хочешь пойти со мной?',
    minLesson: 2,
    lessonTheme: 'В кафе: заказы и напитки',
  },
  'לי': {
    id: 'prep_li',
    type: 'preposition',
    targetWordPlain: 'לי',
    targetWordVocalized: 'לִי',
    targetWordTranscription: 'ли',
    targetWordTranslation: 'мне / у меня',
    basePrepositionHe: 'לְ',
    basePrepositionRu: 'дательный предлог «к / для / у»',
    inflectedFormHe: 'לִי',
    inflectedTranscription: 'ли',
    personTitle: 'Я (1-е лицо ед.ч.)',
    inflectionsTable: [
      { person: 'Я', hebrew: 'לִי', transcription: 'ли', translation: 'мне / у меня' },
      { person: 'Ты (м)', hebrew: 'לְךָ', transcription: 'лехá', translation: 'тебе / у тебя' },
      { person: 'Ты (ж)', hebrew: 'לָךְ', transcription: 'лах', translation: 'тебе / у тебя' },
      { person: 'Он', hebrew: 'לוֹ', transcription: 'ло', translation: 'ему / у него' },
      { person: 'Она', hebrew: 'לָהּ', transcription: 'ла', translation: 'ей / у неё' },
      { person: 'Мы', hebrew: 'לָנוּ', transcription: 'лáну', translation: 'нам / у нас' },
      { person: 'Вы (м)', hebrew: 'לָכֶם', transcription: 'лахéм', translation: 'вам / у вас' },
      { person: 'Они', hebrew: 'לָהֶם', transcription: 'лаhéм', translation: 'им / у них' },
    ],
    sentenceHe: 'יֵשׁ לִי שְׁאֵלָה אַחַת.',
    sentenceTranscription: 'йеш ли шеэлá ахáт.',
    sentenceRu: 'У меня есть один вопрос.',
    minLesson: 4,
    lessonTheme: 'Учёба и предметы',
  },
  'אותי': {
    id: 'prep_oti',
    type: 'preposition',
    targetWordPlain: 'אותי',
    targetWordVocalized: 'אוֹתִי',
    targetWordTranscription: 'отӣ́',
    targetWordTranslation: 'меня',
    basePrepositionHe: 'אֶת',
    basePrepositionRu: 'винительный предлог прямого дополнения',
    inflectedFormHe: 'אוֹתִי',
    inflectedTranscription: 'отӣ́',
    personTitle: 'Я (1-е лицо ед.ч.)',
    inflectionsTable: [
      { person: 'Я', hebrew: 'אוֹתִי', transcription: 'отӣ́', translation: 'меня' },
      { person: 'Ты (м)', hebrew: 'אוֹתְךָ', transcription: 'отхá', translation: 'тебя' },
      { person: 'Ты (ж)', hebrew: 'אוֹתָךְ', transcription: 'отáх', translation: 'тебя' },
      { person: 'Он', hebrew: 'אוֹתוֹ', transcription: 'отó', translation: 'его' },
      { person: 'Она', hebrew: 'אוֹתָהּ', transcription: 'отá', translation: 'её' },
      { person: 'Мы', hebrew: 'אוֹתָנוּ', transcription: 'отáну', translation: 'нас' },
      { person: 'Вы (м)', hebrew: 'אֶתְכֶם', transcription: 'этхéм', translation: 'вас' },
      { person: 'Они', hebrew: 'אוֹתָם', transcription: 'отáм', translation: 'их' },
    ],
    sentenceHe: 'אַתָּה שׁוֹמֵעַ אוֹתִי טוֹב?',
    sentenceTranscription: 'атá шомéа отӣ́ тов?',
    sentenceRu: 'Ты хорошо меня слышишь?',
    minLesson: 8,
    lessonTheme: 'Работа и общение',
  },
  'ליד': {
    id: 'prep_leyad',
    type: 'preposition',
    targetWordPlain: 'ליד',
    targetWordVocalized: 'לְיַד',
    targetWordTranscription: 'лейáд',
    targetWordTranslation: 'около, возле, рядом с',
    basePrepositionHe: 'לְיַד',
    basePrepositionRu: 'около, рядом с',
    inflectedFormHe: 'לְיָדִי',
    inflectedTranscription: 'ле-ядӣ́',
    personTitle: 'Я (около меня)',
    sentenceHe: 'דָּוִד יוֹשֵׁב לְיָדִי בָּאוּלְפָּן.',
    sentenceTranscription: 'Давӣд йошéв ле-ядӣ́ ба-ульпáн.',
    sentenceRu: 'Давид сидит рядом со мной в ульпане.',
    minLesson: 7,
    lessonTheme: 'Дом и пространство',
  },
};

export function getPrepositionDrill(rawWord: string): PrepositionDrillItem | null {
  if (!rawWord) return null;
  const plain = stripNikkud(rawWord).trim();
  if (PREPOSITION_DRILLS_DATA[plain]) {
    return PREPOSITION_DRILLS_DATA[plain];
  }
  if (PREPOSITION_DRILLS_DATA[rawWord]) {
    return PREPOSITION_DRILLS_DATA[rawWord];
  }
  return null;
}
