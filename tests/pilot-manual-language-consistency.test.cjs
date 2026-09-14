/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { getLessonById } = require('../src/data/lessonsData.ts');
const { getInitialMessageForGender } = require('../src/components/LessonAiChat/helpers.ts');
const { buildInitialMessage } = require('../src/components/LessonAiChat/useAiChat.ts');

// ---------------------------------------------------------------------------
// 1. Lesson 5: dialogue, sampleAnswers, helpers initialMessage use "у-млафэфонӣм"
// ---------------------------------------------------------------------------
test('Lesson 5 dialogue, sampleAnswers, and helpers initial message preserve normative "у-млафэфонӣм"', () => {
  const lesson5 = getLessonById(5);
  assert.ok(lesson5, 'Lesson 5 must exist');

  // Check dialogue initial message
  const initHebrew = lesson5.dialogue.initialMessage.hebrew;
  const initTrans = lesson5.dialogue.initialMessage.transcription;
  assert.ok(initHebrew.includes('וּמְלָפְפֹנִים'), 'Lesson 5 dialogue initialMessage must contain וּמְלָפְפֹנִים');
  assert.ok(initTrans.includes('у-млафэфонӣм'), 'Lesson 5 dialogue initialMessage transcription must contain у-млафэфонӣм');
  assert.ok(!initTrans.includes('вэ-млафэфонӣм'), 'Lesson 5 dialogue initialMessage must not contain forced вэ-млафэфонӣм');

  // Check sample answers in dialogue step 1
  const step1 = lesson5.dialogue.steps[0];
  assert.ok(step1, 'Step 1 of dialogue must exist');
  const sampleCucumber = step1.sampleAnswers.find((s) => s.hebrew.includes('וּמְלָפְפֹנִים'));
  assert.ok(sampleCucumber, 'Sample answer with cucumbers must exist');
  assert.ok(sampleCucumber.transcription.includes('у-млафэфонӣм'), 'Sample answer transcription must use у-млафэфонӣм');
  assert.ok(!sampleCucumber.transcription.includes('вэ-млафэфонӣм'), 'Sample answer must not use вэ-млафэфонӣм');

  // Check helpers.ts initial message for female student
  const femMsg = getInitialMessageForGender(lesson5, 'female');
  assert.ok(femMsg.hebrew.includes('וּמְלָפְפֹנִים'), 'Female initial message must contain וּמְלָפְפֹנִים');
  assert.ok(femMsg.transcription.includes('у-млафэфонӣм'), 'Female initial message transcription must contain у-млафэфонӣм');
  assert.ok(!femMsg.transcription.includes('вэ-млафэфонӣм'), 'Female initial message must not contain вэ-млафэфонӣм');

  // Check helpers.ts initial message for male student
  const mascMsg = getInitialMessageForGender(lesson5, 'male');
  assert.ok(mascMsg.hebrew.includes('וּמְלָפְפֹנִים'), 'Male initial message must contain וּמְלָפְפֹנִים');
  assert.ok(mascMsg.transcription.includes('у-млафэфонӣм'), 'Male initial message transcription must contain у-млафэфонӣм');
  assert.ok(!mascMsg.transcription.includes('вэ-млафэфонӣм'), 'Male initial message must not contain вэ-млафэфонӣм');

  // Verify previously aligned fields remain intact
  const s53 = lesson5.basicSentences.find((s) => s.id === 's5-3');
  assert.ok(s53 && s53.hebrew.includes('וּגְבִינָה') && s53.transcription.includes('у-гвинá'), 's5-3 must preserve וּגְבִינָה / у-гвинá');
  const ex511 = lesson5.exercises.find((e) => e.id === 'ex5-11');
  assert.ok(ex511 && ex511.explanation.includes('у-гвинá'), 'ex5-11 explanation must preserve у-гвинá');
  const ex512 = lesson5.exercises.find((e) => e.id === 'ex5-12');
  assert.ok(ex512 && ex512.correctAnswer.includes('וּגְבִינָה') && ex512.explanation.includes('у-гвинá'), 'ex5-12 must preserve וּגְבִינָה / у-гвинá');
});

// ---------------------------------------------------------------------------
// 2. Actual buildInitialMessage preserves u- in greetings and suggested replies
// ---------------------------------------------------------------------------
test('Actual buildInitialMessage preserves u- in greetings and suggested replies for both genders', () => {
  const lesson5 = getLessonById(5);
  for (const gender of ['male', 'female']) {
    const message = buildInitialMessage(lesson5, gender);
    assert.ok(message.hebrew.includes('וּמְלָפְפֹנִים'), `${gender} initial Hebrew must contain וּמְלָפְפֹנִים`);
    assert.ok(message.transcription.includes('у-млафэфонӣм'), `${gender} initial transcription must contain у-млафэфонӣм`);
    assert.ok(message.suggestedReplies[1].transcription.includes('у-млафэфонӣм'), `${gender} suggested reply must contain у-млафэфонӣм`);
    assert.ok(!JSON.stringify(message).includes('вэ-млафэфонӣм'), `${gender} message object must not contain вэ-млафэфонӣм`);
  }
});

// ---------------------------------------------------------------------------
// 3. Standalone תּוֹדָה across pilot lessons 1, 2, 5 has normative dagesh
// ---------------------------------------------------------------------------
test('Standalone תּוֹדָה in pilot lessons 1, 2, 5 has dagesh and preserves unpointed user-facing keys', () => {
  // Lesson 1
  const lesson1 = getLessonById(1);
  const todaWord = lesson1.vocabulary.find((w) => w.id === 'w1-4');
  assert.ok(todaWord, 'w1-4 vocabulary item must exist');
  assert.equal(todaWord.hebrew, 'תּוֹדָה', 'Lesson 1 w1-4 hebrew must have dagesh in Tav');
  assert.equal(todaWord.hebrewPlain, 'תודה', 'Lesson 1 w1-4 hebrewPlain must remain unpointed');

  assert.ok(lesson1.dialogue.vocabularyHints.includes('תּוֹדָה'), 'Lesson 1 vocabularyHints must include תּוֹדָה with dagesh');
  assert.ok(!lesson1.dialogue.vocabularyHints.includes('תוֹדָה'), 'Lesson 1 vocabularyHints must not have תוֹדָה without dagesh');

  const ex12 = lesson1.exercises.find((e) => e.id === 'ex1-2');
  assert.ok(ex12.options.includes('תּוֹדָה'), 'ex1-2 options must include תּוֹדָה with dagesh');
  assert.ok(!ex12.options.includes('תוֹדָה'), 'ex1-2 options must not include תוֹדָה without dagesh');

  const ex16 = lesson1.exercises.find((e) => e.id === 'ex1-6');
  assert.ok(ex16.options.includes('תּוֹדָה'), 'ex1-6 options must include תּוֹדָה with dagesh');
  assert.equal(ex16.correctAnswer, 'תּוֹדָה', 'ex1-6 correctAnswer must be תּוֹדָה with dagesh');
  assert.ok(ex16.explanation.includes('«תּוֹדָה»'), 'ex1-6 explanation must cite «תּוֹדָה» with dagesh');

  // Lesson 2
  const lesson2 = getLessonById(2);
  assert.ok(lesson2.dialogue.vocabularyHints.includes('תּוֹדָה רַבָּה'), 'Lesson 2 vocabularyHints must include תּוֹדָה רַבָּה with dagesh');
  assert.ok(!lesson2.dialogue.vocabularyHints.includes('תוֹדָה רַבָּה'), 'Lesson 2 vocabularyHints must not include תוֹדָה רַבָּה without dagesh');

  // Lesson 5
  const lesson5 = getLessonById(5);
  assert.ok(lesson5.dialogue.vocabularyHints.includes('תּוֹדָה רַבָּה'), 'Lesson 5 vocabularyHints must include תּוֹדָה רַבָּה with dagesh');
  assert.ok(!lesson5.dialogue.vocabularyHints.includes('תוֹדָה רַבָּה'), 'Lesson 5 vocabularyHints must not include תוֹדָה רַבָּה without dagesh');

  const todaUseful = lesson5.dialogue.usefulWords.find((w) => w.translation.includes('спасибо'));
  assert.ok(todaUseful && todaUseful.hebrew === 'תּוֹדָה רַבָּה', 'Lesson 5 usefulWords must have תּוֹדָה רַבָּה');

  // Unpointed targetWords in dialogue must be preserved without artificial nikkud
  assert.ok(lesson5.dialogue.steps[2].targetWords.includes('תודה'), 'Dialogue targetWords must remain unpointed תודה');
});

// ---------------------------------------------------------------------------
// 4. LessonExercises DOM ex1-2 and ex1-6: pointed Toda, wrong feedback, retry, correct feedback
// ---------------------------------------------------------------------------
test('LessonExercises DOM ex1-2 and ex1-6: pointed Toda, wrong feedback, retry, correct feedback', async () => {
  const keys = [
    'window',
    'document',
    'navigator',
    'HTMLElement',
    'Element',
    'Node',
    'HTMLTextAreaElement',
    'IS_REACT_ACT_ENVIRONMENT',
    'addEventListener',
    'removeEventListener',
    'requestAnimationFrame',
    'cancelAnimationFrame',
  ];
  const globals = new Map(keys.map((k) => [k, Object.getOwnPropertyDescriptor(globalThis, k)]));
  const root = path.resolve(__dirname, '..');
  const confettiPath = require.resolve('canvas-confetti', { paths: [root] });
  const componentPath = require.resolve('../src/components/LessonExercises.tsx');
  const cached = new Map([confettiPath, componentPath].map((k) => [k, require.cache[k]]));
  const speech = require('../src/lib/speech.ts');
  const savedSpeak = Object.getOwnPropertyDescriptor(speech, 'speakHebrew');
  const React = require('react');
  const { act } = React;
  let dom;
  let reactRoot;
  try {
    const stub = () => Promise.resolve();
    stub.default = stub;
    stub.reset = () => {};
    stub.create = () => stub;
    require.cache[confettiPath] = {
      id: confettiPath,
      filename: confettiPath,
      loaded: true,
      exports: stub,
    };
    delete require.cache[componentPath];
    const { JSDOM } = require('jsdom');
    dom = new JSDOM('<!doctype html><div id="root"></div>', {
      url: 'http://localhost',
      pretendToBeVisual: true,
    });
    const values = {
      window: dom.window,
      document: dom.window.document,
      navigator: dom.window.navigator,
      IS_REACT_ACT_ENVIRONMENT: true,
    };
    for (const k of ['HTMLElement', 'Element', 'Node', 'HTMLTextAreaElement']) {
      values[k] = dom.window[k];
    }
    for (const k of ['addEventListener', 'removeEventListener', 'requestAnimationFrame', 'cancelAnimationFrame']) {
      values[k] = dom.window[k].bind(dom.window);
    }
    for (const [key, value] of Object.entries(values)) {
      Object.defineProperty(globalThis, key, { value, writable: true, configurable: true, enumerable: true });
    }
    dom.window.Element.prototype.scrollIntoView = () => {};
    dom.window.scrollTo = () => {};
    speech.speakHebrew = () => {};

    const { createRoot } = require('react-dom/client');
    const { LessonExercises } = require(componentPath);
    const { createGuestProfile } = require('../src/lib/storage.ts');
    const container = dom.window.document.getElementById('root');
    reactRoot = createRoot(container);
    const lesson1 = getLessonById(1);
    const exercises = ['ex1-2', 'ex1-6'].map((id) => lesson1.exercises.find((e) => e.id === id));
    await act(async () => {
      reactRoot.render(
        React.createElement(LessonExercises, {
          lesson: { ...lesson1, exercises },
          userProfile: createGuestProfile(),
        })
      );
    });

    const buttons = () => [...container.querySelectorAll('button')];
    const clickExact = async (label) => {
      const b = buttons().find((btn) => btn.textContent.trim() === label);
      assert.ok(b, 'Visible button ' + label);
      await act(async () => b.click());
    };
    const clickContaining = async (label) => {
      const b = buttons().find((btn) => btn.textContent.includes(label));
      assert.ok(b, 'Visible control ' + label);
      await act(async () => b.click());
    };

    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      assert.ok(buttons().some((b) => b.textContent.trim() === 'תּוֹדָה'), ex.id + ' pointed Toda in DOM');
      const wrong = i === 0 ? 'תּוֹדָה' : ex.options.find((o) => o !== ex.correctAnswer);
      await clickExact(wrong);
      assert.ok(container.textContent.includes('Почти получилось! Обратите внимание:'), ex.id + ' actual error feedback');
      assert.ok(!container.textContent.includes('Верно! Отличный ответ.'));
      await clickContaining('Попробовать ещё раз');
      assert.ok(!container.textContent.includes('Почти получилось!'));
      await clickExact(ex.correctAnswer);
      assert.ok(container.textContent.includes('Верно! Отличный ответ.'), ex.id + ' actual success feedback');
      assert.ok(!container.textContent.includes('Почти получилось!'));
      if (i < exercises.length - 1) {
        await clickContaining('Следующий вопрос');
      }
    }
  } finally {
    try {
      if (reactRoot) await act(async () => reactRoot.unmount());
    } finally {
      dom?.window.close();
      for (const [key, desc] of globals) {
        if (desc) Object.defineProperty(globalThis, key, desc);
        else delete globalThis[key];
      }
      if (savedSpeak) {
        Object.defineProperty(speech, 'speakHebrew', savedSpeak);
      } else {
        delete speech.speakHebrew;
      }
      for (const [key, entry] of cached) {
        if (entry) require.cache[key] = entry;
        else delete require.cache[key];
      }
    }
  }
  for (const [key, desc] of globals) {
    assert.deepEqual(Object.getOwnPropertyDescriptor(globalThis, key), desc, 'restore ' + key);
  }
  for (const [key, entry] of cached) {
    assert.equal(require.cache[key], entry, 'restore cache ' + key);
  }
  assert.deepEqual(Object.getOwnPropertyDescriptor(speech, 'speakHebrew'), savedSpeak);
});

// ---------------------------------------------------------------------------
// 5. Lesson 3: normative present tense "гарá" (not "гáра")
// ---------------------------------------------------------------------------
test('Lesson 3 uses normative present tense transcription "гарá" across table, vocabulary, and explanation', () => {
  const lesson3 = getLessonById(3);
  assert.ok(lesson3, 'Lesson 3 must exist');

  // Conjugation table
  const table = lesson3.grammar[0].tables[0];
  assert.ok(table.title.includes('לָגוּר'), 'Conjugation table for לָגוּר must exist');
  const femRow = table.rows.find((r) => r[0].includes('Женский род') || r[1] === 'גָּרָה');
  assert.ok(femRow, 'Feminine singular row must exist');
  assert.equal(femRow[1], 'גָּרָה');
  assert.equal(femRow[2], 'гарá', 'Feminine singular transcription must be гарá with end stress');

  // Vocabulary w3-3
  const w33 = lesson3.vocabulary.find((w) => w.id === 'w3-3');
  assert.ok(w33, 'w3-3 must exist');
  assert.equal(w33.transcription, 'гар / гарá', 'w3-3 transcription must be "гар / гарá"');

  // Exercise 3-5 explanation
  const ex35 = lesson3.exercises.find((e) => e.id === 'ex3-5');
  assert.ok(ex35, 'ex3-5 must exist');
  assert.ok(ex35.explanation.includes('«גָּר / גָּרָה» (гар / гарá)'), 'ex3-5 explanation must use "гар / гарá"');

  // Confirm no occurrence of colloquial/deviant "гáра" anywhere in Lesson 3
  const l3Str = JSON.stringify(lesson3);
  assert.ok(!l3Str.includes('гáра'), 'Lesson 3 must contain 0 occurrences of гáра');
});
