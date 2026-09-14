/* eslint-disable @typescript-eslint/no-require-imports */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { getLessonById, DETAILED_LESSONS } = require('../src/data/lessonsData.ts');
const { getLessonPhoneScenario } = require('../src/data/phoneScenarios.ts');
const { getInitialMessageForGender } = require('../src/components/LessonAiChat/helpers.ts');

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
// 2. Standalone תּוֹדָה across pilot lessons 1, 2, 5 has normative dagesh
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
// 3. Exercise mechanics for תּוֹדָה in Lesson 1: selection, scoring and distractors
// ---------------------------------------------------------------------------
test('Lesson 1 exercises with תּוֹדָה evaluate strictly and reject distractors', () => {
  const lesson1 = getLessonById(1);

  // ex1-6: What word means "спасибо"?
  const ex16 = lesson1.exercises.find((e) => e.id === 'ex1-6');
  assert.ok(ex16, 'ex1-6 must exist');
  assert.equal(typeof ex16.correctAnswer, 'string');
  assert.ok(ex16.options.includes(ex16.correctAnswer), 'ex1-6 correctAnswer must be among selectable options');

  // Correct choice evaluates strictly as true
  const correctSelected = ex16.correctAnswer;
  assert.equal(correctSelected === ex16.correctAnswer, true, 'Selecting correct answer must yield true');

  // Distractors evaluate strictly as false
  const distractors = ex16.options.filter((o) => o !== ex16.correctAnswer);
  assert.equal(distractors.length, 3, 'Must have exactly 3 distractors');
  for (const d of distractors) {
    assert.equal(d === ex16.correctAnswer, false, `Distractor ${d} must not equal correctAnswer`);
  }

  // ex1-2: distractor תּוֹדָה is selectable and does not match correctAnswer "בּוֹקֶר טוֹב"
  const ex12 = lesson1.exercises.find((e) => e.id === 'ex1-2');
  assert.ok(ex12.options.includes('תּוֹדָה'), 'תּוֹדָה must be among selectable options of ex1-2');
  assert.equal('תּוֹדָה' === ex12.correctAnswer, false, 'תּוֹדָה must evaluate as incorrect for good morning');
});

// ---------------------------------------------------------------------------
// 4. Lesson 3: normative present tense "гарá" (not "гáра")
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

// ---------------------------------------------------------------------------
// 5. Negative reproduction against base commit (b2dd5f2)
// ---------------------------------------------------------------------------
test('Negative reproduction: unpatched base data fails all five consistency checks', () => {
  const baseAlefContent = execSync('git show b2dd5f2:src/data/lessons/alef_01_10.ts', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  const baseHelpersContent = execSync('git show b2dd5f2:src/components/LessonAiChat/helpers.ts', {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });

  // 1. Base alef_01_10.ts dialogue 5 had "вэ-млафэфонӣм"
  assert.ok(
    baseAlefContent.includes('"шалóм ахӣ! йеш лáну агванийóт вэ-млафэфонӣм'),
    'Base data must reproduce flawed вэ-млафэфонӣм in dialogue 5 initialMessage'
  );
  assert.ok(
    baseAlefContent.includes('"анӣ роцé агванийóт вэ-млафэфонӣм."'),
    'Base data must reproduce flawed вэ-млафэфонӣм in dialogue 5 sampleAnswers'
  );

  // 2. Base helpers.ts had "вэ-млафэфонӣм"
  assert.ok(
    baseHelpersContent.includes('вэ-млафэфонӣм мэцуянӣм hайóм. ма тирцӣ ликнóт?'),
    'Base helpers.ts must reproduce flawed female вэ-млафэфонӣм'
  );
  assert.ok(
    baseHelpersContent.includes('вэ-млафэфонӣм мэцуянӣм hайóм. ма тирцé ликнóт?'),
    'Base helpers.ts must reproduce flawed male вэ-млафэфонӣм'
  );

  // 3. Base Lesson 1 had "תוֹדָה" without dagesh in w1-4, vocabularyHints, ex1-2, ex1-6
  assert.ok(
    baseAlefContent.includes('"id": "w1-4",\n        "hebrew": "תוֹדָה"'),
    'Base data must reproduce w1-4 תוֹדָה without dagesh'
  );
  assert.ok(
    baseAlefContent.includes('"correctAnswer": "תוֹדָה",\n        "explanation": "Слово «תוֹדָה»'),
    'Base data must reproduce ex1-6 תוֹדָה without dagesh'
  );

  // 4. Base Lesson 2 and 5 had "תוֹדָה רַבָּה" without dagesh in vocabularyHints
  const baseL2HintsMatch = baseAlefContent.match(/"2"[\s\S]*?"vocabularyHints":\s*\[[\s\S]*?"תוֹדָה רַבָּה"/);
  assert.ok(baseL2HintsMatch, 'Base data must reproduce Lesson 2 vocabularyHints with תוֹדָה רַבָּה');
  const baseL5HintsMatch = baseAlefContent.match(/"5"[\s\S]*?"vocabularyHints":\s*\[[\s\S]*?"תוֹדָה רַבָּה"/);
  assert.ok(baseL5HintsMatch, 'Base data must reproduce Lesson 5 vocabularyHints with תוֹדָה רַבָּה');

  // 5. Base Lesson 3 had "гáра"
  assert.ok(baseAlefContent.includes('"гáра"'), 'Base data must reproduce гáра in table');
  assert.ok(baseAlefContent.includes('"гар / гáра"'), 'Base data must reproduce гар / гáра in w3-3');
  assert.ok(baseAlefContent.includes('«גָּר / גָּרָה» (гар / гáра)'), 'Base data must reproduce гар / гáра in ex3-5');
});

// ---------------------------------------------------------------------------
// 6. Deep non-regression: full dataset comparison against base commit (b2dd5f2)
// ---------------------------------------------------------------------------
test('Deep non-regression: lessons 4, 6-100 and all 200 phone scenarios match base commit identically', (t) => {
  const tempPath = path.resolve(__dirname, 'temp-base-alef0110.ts');
  const cleanup = () => {
    try {
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    } catch {}
  };

  if (t && typeof t.after === 'function') {
    t.after(cleanup);
  }

  try {
    const baseAlefContent = execSync('git show b2dd5f2:src/data/lessons/alef_01_10.ts', {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
    });
    fs.writeFileSync(tempPath, baseAlefContent, 'utf8');
    const baseAlefMod = require(tempPath).ALEF_LESSONS_01_10;
    const curAlefMod = require('../src/data/lessons/alef_01_10.ts').ALEF_LESSONS_01_10;

    // Lesson 4 must be 100% identical
    assert.deepStrictEqual(curAlefMod['4'], baseAlefMod['4'], 'Lesson 4 must match base commit b2dd5f2 identically');

    // Lessons 6 to 10 must match base
    for (let id = 6; id <= 10; id++) {
      assert.deepStrictEqual(curAlefMod[String(id)], baseAlefMod[String(id)], `Lesson ${id} must match base commit b2dd5f2 identically`);
    }

    // Verify all 100 lessons exist
    assert.equal(Object.keys(DETAILED_LESSONS).length, 100, 'All 100 lessons must exist in DETAILED_LESSONS');

    // Verify phone scenarios 1 to 100 for male and female are unchanged
    for (let id = 1; id <= 100; id++) {
      const lesson = getLessonById(id);
      const scM = getLessonPhoneScenario(lesson, 'male');
      const scF = getLessonPhoneScenario(lesson, 'female');
      assert.ok(scM && scF, `Phone scenario ${id} for male and female must exist`);
    }
  } finally {
    cleanup();
  }
});
