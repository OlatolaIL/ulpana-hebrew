const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const fs = require('node:fs');
const path = require('node:path');

const { FlashcardTrainer } = require('../src/components/FlashcardTrainer/FlashcardTrainer.tsx');
const { createGuestProfile } = require('../src/lib/storage.ts');

test('1. FlashcardTrainer accepts initialCardIndex, deckId and onCardChange props', () => {
  const words = [
    { id: 'fixture-1', hebrew: 'שָׁלוֹם', hebrewPlain: 'שלום', translation: 'Привет', partOfSpeech: 'other' },
    { id: 'fixture-2', hebrew: 'סֵפֶר', hebrewPlain: 'ספר', translation: 'Книга', partOfSpeech: 'noun' },
    { id: 'fixture-3', hebrew: 'בַּיִת', hebrewPlain: 'בית', translation: 'Дом', partOfSpeech: 'noun' },
  ];

  let cardChangeEvent = null;
  const html = renderToStaticMarkup(
    React.createElement(FlashcardTrainer, {
      initialWords: words,
      userProfile: createGuestProfile(),
      lessonId: 1,
      deckId: 'caregiver',
      initialCardIndex: 1,
      initialMode: 'flip',
      onCardChange: (index, mode, word) => {
        cardChangeEvent = { index, mode, word };
      },
    })
  );

  assert.ok(html.includes('סֵפֶר') || html.includes('ספר'), 'Should render the card corresponding to initialCardIndex=1 (סֵפֶר)');
  assert.ok(!html.includes('שָׁלוֹם') && !html.includes('בית'), 'Should not render card 0 or card 2');
});

test('2. All trainer modes gracefully handle undefined or empty word without throwing', () => {
  const { ComplexDrillMode } = require('../src/components/FlashcardTrainer/modes/ComplexDrillMode.tsx');
  const { FlipCardMode } = require('../src/components/FlashcardTrainer/modes/FlipCardMode.tsx');
  const { ConjugationMode } = require('../src/components/FlashcardTrainer/modes/ConjugationMode.tsx');
  const { BuilderMode } = require('../src/components/FlashcardTrainer/modes/BuilderMode.tsx');
  const { ListeningMode } = require('../src/components/FlashcardTrainer/modes/ListeningMode.tsx');
  const { AutoAudioMode } = require('../src/components/FlashcardTrainer/modes/AutoAudioMode.tsx');

  const guestProfile = createGuestProfile();

  assert.doesNotThrow(() => {
    const res = renderToStaticMarkup(
      React.createElement(ComplexDrillMode, {
        currentWord: undefined,
        userProfile: guestProfile,
        currentIndex: 0,
        wordsLength: 0,
        onPrevWord: () => {},
        onAdvanceNext: () => {},
        onSpeakHebrew: () => {},
      })
    );
    assert.equal(res, '', 'ComplexDrillMode should return null for undefined currentWord');
  });

  assert.doesNotThrow(() => {
    const res = renderToStaticMarkup(
      React.createElement(FlipCardMode, {
        currentWord: undefined,
        currentIndex: 0,
        totalCount: 0,
        direction: 'he-ru',
        onNext: () => {},
        onPrev: () => {},
        onFlip: () => {},
        isFlipped: false,
        onSpeakHebrew: () => {},
        onSpeakRussian: () => {},
        userProfile: guestProfile,
      })
    );
    assert.equal(res, '', 'FlipCardMode should return null for undefined currentWord');
  });

  assert.doesNotThrow(() => {
    const res = renderToStaticMarkup(
      React.createElement(ConjugationMode, {
        currentWord: undefined,
        currentIndex: 0,
        totalCount: 0,
        onNext: () => {},
        onPrev: () => {},
        onSpeakHebrew: () => {},
        userProfile: guestProfile,
      })
    );
    assert.equal(res, '', 'ConjugationMode should return null for undefined currentWord');
  });

  assert.doesNotThrow(() => {
    const res = renderToStaticMarkup(
      React.createElement(BuilderMode, {
        currentWord: undefined,
        currentIndex: 0,
        totalCount: 0,
        onNext: () => {},
        onPrev: () => {},
        onSpeakHebrew: () => {},
        userProfile: guestProfile,
      })
    );
    assert.equal(res, '', 'BuilderMode should return null for undefined currentWord');
  });

  assert.doesNotThrow(() => {
    const res = renderToStaticMarkup(
      React.createElement(ListeningMode, {
        currentWord: undefined,
        allWords: [],
        currentIndex: 0,
        totalCount: 0,
        onNext: () => {},
        onPrev: () => {},
        onSpeakHebrew: () => {},
        userProfile: guestProfile,
      })
    );
    assert.equal(res, '', 'ListeningMode should return null for undefined currentWord');
  });

  assert.doesNotThrow(() => {
    const res = renderToStaticMarkup(
      React.createElement(AutoAudioMode, {
        currentWord: undefined,
        currentIndex: 0,
        totalCount: 0,
        direction: 'he-ru',
        onNext: () => {},
        onPrev: () => {},
        onSpeakHebrew: () => {},
        userProfile: guestProfile,
      })
    );
    assert.equal(res, '', 'AutoAudioMode should return null for undefined currentWord');
  });
});

test('3. page.tsx contains deep URL parsing and history management for flashcards', () => {
  const pagePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
  const content = fs.readFileSync(pagePath, 'utf-8');

  assert.ok(content.includes('#flashcards'), 'Must support #flashcards route');
  assert.ok(content.includes('flashcardDeckId'), 'Must maintain flashcardDeckId state');
  assert.ok(content.includes('flashcardInitialCardIndex'), 'Must maintain flashcardInitialCardIndex state');
  assert.ok(content.includes('handleFlashcardCardChange'), 'Must provide handleFlashcardCardChange handler');
  assert.ok(content.includes('ALL_DECKS'), 'Must reference ALL_DECKS for deterministic word recovery');
  assert.ok(content.includes('DETAILED_LESSONS'), 'Must reference DETAILED_LESSONS for deterministic word recovery');
});
