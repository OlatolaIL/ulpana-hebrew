const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { FlashcardTrainer } = require('../src/components/FlashcardTrainer/FlashcardTrainer.tsx');
const { createGuestProfile } = require('../src/lib/storage.ts');
const words = [
  { id: 'fixture-1', hebrew: 'שלום', hebrewPlain: 'שלום', translation: 'Приветствие', partOfSpeech: 'other' },
  { id: 'fixture-2', hebrew: 'ספר', translation: 'Книга', partOfSpeech: 'noun' },
  { id: 'fixture-3', hebrew: 'בית', translation: 'Дом', partOfSpeech: 'noun' },
  { id: 'fixture-4', hebrew: 'עט', translation: 'Ручка', partOfSpeech: 'noun' },
];
function render(initialMode) {
  return renderToStaticMarkup(React.createElement(FlashcardTrainer, {
    initialWords: words, userProfile: createGuestProfile(), lessonId: 1, initialMode,
  }));
}
test('opening directly in listening mode renders the first answer and distractors', () => {
  const html = render('listening');
  for (const word of words) assert.ok(html.includes(word.translation), `missing answer: ${word.translation}`);
});
test('opening directly in builder mode renders every selectable letter immediately', () => {
  const html = render('builder');
  for (const letter of words[0].hebrew) assert.ok(html.includes(`>${letter}</button>`), `missing tile: ${letter}`);
});

const { VerbTriadBlock } = require('../src/components/FlashcardTrainer/VerbTriadBlock.tsx');

test('VerbTriadBlock renders vocalized Hebrew with showNikkud=true and unpointed ktiv male with showNikkud=false', () => {
  const triad = {
    infinitive: { hebrew: 'לְהַמְלִיץ', transcription: 'леhамлиц', translation: 'рекомендовать', labelRu: 'Инфинитив', labelHe: 'שם הפועל' },
    presentMasc: { hebrew: 'מַמְלִיץ', transcription: 'мамлиц', translation: 'рекомендует', labelRu: 'Настоящее', labelHe: 'הווה' },
    pastHe: { hebrew: 'הִמְלִיץ', transcription: 'hимлиц', translation: 'порекомендовал', labelRu: 'Прошедшее', labelHe: 'עבר' },
    binyan: 'הִפְעִיל',
    binyanClean: 'hифъиль',
    root: 'מ-ל-ץ',
    prepositionInfo: { preposition: 'עַל...', prepositionPlain: 'על', ruleRu: 'рекомендовать что-то', exampleHe: 'מַמְלִיץ עַל הַמִּסְעָדָה הַזֹּאת', exampleRu: 'рекомендует этот ресторан' },
    conjugation: {},
    relatedWords: [
      { hebrew: 'מוּמְלָץ', hebrewPlain: 'מומלץ', transcription: 'мумлáц', translation: 'рекомендуемый', partOfSpeech: 'adjective', root: 'מ-ל-ץ' },
    ],
  };

  const htmlPointed = renderToStaticMarkup(React.createElement(VerbTriadBlock, { triad, showNikkud: true, onSpeakHebrew: () => {} }));
  assert.ok(htmlPointed.includes('מוּמְלָץ'), 'Should contain pointed form');

  const htmlUnpointed = renderToStaticMarkup(React.createElement(VerbTriadBlock, { triad, showNikkud: false, onSpeakHebrew: () => {} }));
  assert.ok(htmlUnpointed.includes('מומלץ'), 'Should contain unpointed ktiv male form');
  assert.ok(!htmlUnpointed.includes('מוּמְלָץ'), 'Should not contain nikkud when showNikkud is false');
});

