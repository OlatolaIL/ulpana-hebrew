const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { FlipCardMode } = require('../src/components/FlashcardTrainer/modes/FlipCardMode.tsx');
const { ComplexVerbHintBlock } = require('../src/components/FlashcardTrainer/ComplexVerbHintBlock.tsx');
const { createGuestProfile } = require('../src/lib/storage.ts');

const verbWord = {
  id: 'fixture-verb-1',
  hebrew: 'לִרְצוֹת',
  hebrewPlain: 'לרצות',
  translation: 'хотеть',
  partOfSpeech: 'verb',
  root: 'ר-צ-ה',
};

const nounWord = {
  id: 'fixture-noun-1',
  hebrew: 'סֵפֶר',
  hebrewPlain: 'ספר',
  translation: 'книга',
  partOfSpeech: 'noun',
};

test('1. ComplexVerbHintBlock renders tense switchers and play button for verbs with complex sentences', () => {
  const profile = createGuestProfile();
  const html = renderToStaticMarkup(
    React.createElement(ComplexVerbHintBlock, {
      currentWord: verbWord,
      userProfile: profile,
      isFlipped: false,
      selectedTense: 'present',
      onSelectTense: () => {},
      onPlayHint: () => {},
      isPlaying: false,
    })
  );

  assert.ok(html.includes('Подсказка:'), 'Should render hint label');
  assert.ok(html.includes('Наст.'), 'Should render present tense button');
  assert.ok(html.includes('Прош.'), 'Should render past tense button');
  assert.ok(html.includes('Воспроизвести фразу'), 'Should render play phrase button');
  // In front mode (isFlipped=false), Hebrew sentence text should NOT be spoiled
  assert.ok(!html.includes('אֲנִי רוֹצֶה מַיִם קָרִים'), 'Should not reveal Hebrew sentence text before flip');
});

test('2. ComplexVerbHintBlock does not render for nouns without complex verb sentences', () => {
  const profile = createGuestProfile();
  const html = renderToStaticMarkup(
    React.createElement(ComplexVerbHintBlock, {
      currentWord: nounWord,
      userProfile: profile,
      isFlipped: false,
      selectedTense: 'present',
      onSelectTense: () => {},
      onPlayHint: () => {},
      isPlaying: false,
    })
  );

  assert.equal(html, '', 'Should render nothing for non-verbs');
});

test('3. ComplexVerbHintBlock shows sentence text when flipped (isFlipped=true) with gender adaptation', () => {
  const femaleProfile = { ...createGuestProfile(), gender: 'female', showNikkud: true };
  const femaleHtml = renderToStaticMarkup(
    React.createElement(ComplexVerbHintBlock, {
      currentWord: verbWord,
      userProfile: femaleProfile,
      isFlipped: true,
      selectedTense: 'present',
      onSelectTense: () => {},
      onPlayHint: () => {},
      isPlaying: false,
    })
  );

  // Female profile adapts רוֹצֶה to רוֹצָה (R-17)
  assert.ok(femaleHtml.includes('אֲנִי רוֹצָה מַיִם קָרִים'), 'Should adapt present tense to female form');
  assert.ok(femaleHtml.includes('Я хочу холодную воду'), 'Should show Russian translation');

  const maleProfile = { ...createGuestProfile(), gender: 'male', showNikkud: true };
  const maleHtml = renderToStaticMarkup(
    React.createElement(ComplexVerbHintBlock, {
      currentWord: verbWord,
      userProfile: maleProfile,
      isFlipped: true,
      selectedTense: 'present',
      onSelectTense: () => {},
      onPlayHint: () => {},
      isPlaying: false,
    })
  );

  assert.ok(maleHtml.includes('אֲנִי רוֹצֶה מַיִם קָרִים'), 'Should keep masculine form for male profile');
});

test('4. FlipCardMode renders ComplexVerbHintBlock and preserves the infinitive on the card', () => {
  const profile = createGuestProfile();
  const html = renderToStaticMarkup(
    React.createElement(FlipCardMode, {
      currentWord: verbWord,
      userProfile: profile,
      isFlipped: false,
      isCurrentCardFrontRussian: true,
      cardDirection: 'ru-he',
      currentIndex: 0,
      onFlipCard: () => {},
      onPrevWord: () => {},
      onNextWord: () => {},
      onOpenPealim: () => {},
      onSpeakHebrew: () => {},
    })
  );

  // In Russian->Hebrew front, Russian translation is displayed
  assert.ok(html.includes('хотеть'), 'Should render translation');
  // Hint controls are present
  assert.ok(html.includes('Подсказка:'), 'Should render hint button');
  assert.ok(html.includes('Наст.'), 'Should render present button');
  assert.ok(html.includes('Прош.'), 'Should render past button');
  assert.ok(html.includes('Воспроизвести фразу'), 'Should render play phrase button');
});

test('5. FlipCardMode in Hebrew->Russian front displays infinitive and hint controls', () => {
  const profile = createGuestProfile();
  const html = renderToStaticMarkup(
    React.createElement(FlipCardMode, {
      currentWord: verbWord,
      userProfile: profile,
      isFlipped: false,
      isCurrentCardFrontRussian: false,
      cardDirection: 'he-ru',
      currentIndex: 0,
      onFlipCard: () => {},
      onPrevWord: () => {},
      onNextWord: () => {},
      onOpenPealim: () => {},
      onSpeakHebrew: () => {},
    })
  );

  // Hebrew infinitive MUST be preserved (R-04, user requirement: глагол всегда оставляем инфинитив)
  assert.ok(html.includes('לִרְצוֹת'), 'Should render infinitive on card');
  assert.ok(html.includes('Подсказка:'), 'Should render hint button');
  assert.ok(html.includes('Наст.'), 'Should render present button');
  assert.ok(html.includes('Прош.'), 'Should render past button');
});
