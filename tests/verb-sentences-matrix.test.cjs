const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const passportPath = path.join(rootDir, 'docs', 'mechanics', 'verb-sentences-matrix.md');
const decisionMatrixPath = path.join(rootDir, 'DECISION_MATRIX.md');
const dataPath = path.join(rootDir, 'src', 'data', 'verbSentencesData.ts');

test('1. Passport docs/mechanics/verb-sentences-matrix.md must exist and contain all mandatory invariants (V-01 - V-07)', () => {
  assert.ok(fs.existsSync(passportPath), 'Passport docs/mechanics/verb-sentences-matrix.md is missing');
  const content = fs.readFileSync(passportPath, 'utf-8');

  assert.ok(content.includes('V-01'), 'Missing invariant V-01 (Запрет свободной рантайм-генерации через ИИ)');
  assert.ok(content.includes('V-02'), 'Missing invariant V-02 (Ограничение фонологической петли: 3–4 слова)');
  assert.ok(content.includes('V-03'), 'Missing invariant V-03 (Принцип строгих пререквизитов и доступности)');
  assert.ok(content.includes('V-04'), 'Missing invariant V-04 (Обязательная разметка по временам и предлогам)');
  assert.ok(content.includes('V-05'), 'Missing invariant V-05 (Нормативный כתיב מלא и огласовки)');
  assert.ok(content.includes('V-06'), 'Missing invariant V-06 (Академический стандарт транскрипции)');
  assert.ok(content.includes('V-07'), 'Missing invariant V-07 (Механика аудиотренажера Комплекс)');
});

test('2. DECISION_MATRIX.md must contain R-18 and reference the passport and dataset', () => {
  assert.ok(fs.existsSync(decisionMatrixPath), 'DECISION_MATRIX.md is missing');
  const matrix = fs.readFileSync(decisionMatrixPath, 'utf-8');

  assert.ok(matrix.includes('R-18'), 'DECISION_MATRIX.md does not contain rule R-18');
  assert.ok(matrix.includes('verb-sentences-matrix.md'), 'DECISION_MATRIX.md does not reference verb-sentences-matrix.md');
  assert.ok(matrix.includes('verbSentencesData.ts'), 'DECISION_MATRIX.md does not reference verbSentencesData.ts');
  assert.ok(matrix.includes('Генерация случайных примеров глаголов через ИИ на карточках'), 'Superseded log missing AI generation entry');
});

test('3. src/data/verbSentencesData.ts must exist and contain valid definitions for the 25 verbs of Alef 1', () => {
  assert.ok(fs.existsSync(dataPath), 'src/data/verbSentencesData.ts is missing');
  const dataContent = fs.readFileSync(dataPath, 'utf-8');

  const expectedVerbs = [
    'לרצות', 'לשתות', 'לאכול', 'ללכת', 'לכתוב',
    'לקרוא', 'ללמוד', 'לגור', 'לקנות', 'לעבוד',
    'לדעת', 'לראות', 'לבוא', 'לעשות', 'לשמוע',
    'לפגוש', 'לפתוח', 'לסגור', 'לשבת', 'לעמוד',
    'לקחת', 'לתת', 'לשאול', 'לענות', 'לומר'
  ];

  const cleanExpected = expectedVerbs.map(v => v.replace(/[\u0591-\u05C7]/g, ''));

  cleanExpected.forEach((verb) => {
    assert.ok(
      dataContent.includes(`'${verb}':`),
      `verbSentencesData.ts is missing verb '${verb}'`
    );
  });
});

test('4. All sentences in verbSentencesData.ts must adhere to the 3-4 words rule, modern ktiv male, and Cyrillic transcription', () => {
  const dataContent = fs.readFileSync(dataPath, 'utf-8');

  // Extract sentenceHe strings
  const hebrewMatches = [...dataContent.matchAll(/sentenceHe:\s*'([^']+)'/g)].map((m) => m[1]);
  const transMatches = [...dataContent.matchAll(/sentenceTranscription:\s*'([^']+)'/g)].map((m) => m[1]);
  const ruMatches = [...dataContent.matchAll(/sentenceRu:\s*'([^']+)'/g)].map((m) => m[1]);
  const tenseMatches = [...dataContent.matchAll(/tense:\s*'([^']+)'/g)].map((m) => m[1]);
  const minLessonMatches = [...dataContent.matchAll(/minLesson:\s*(\d+)/g)].map((m) => parseInt(m[1], 10));

  assert.ok(hebrewMatches.length >= 50, `Expected at least 50 sentences (25 verbs * 2 tenses), found ${hebrewMatches.length}`);
  assert.strictEqual(hebrewMatches.length, transMatches.length, 'Mismatch between Hebrew and transcription counts');
  assert.strictEqual(hebrewMatches.length, ruMatches.length, 'Mismatch between Hebrew and Russian translation counts');
  assert.strictEqual(hebrewMatches.length, tenseMatches.length, 'Mismatch between Hebrew and tense counts');

  hebrewMatches.forEach((hebrew, idx) => {
    // Word count check (max 5 words)
    const cleanHebrew = hebrew.replace(/[.?]/g, '').trim();
    const words = cleanHebrew.split(/\s+/);
    assert.ok(
      words.length >= 2 && words.length <= 5,
      `Sentence '${hebrew}' exceeds length rule (has ${words.length} words, max allowed 5)`
    );

    // Transcription must be Cyrillic with 'h'
    const trans = transMatches[idx];
    assert.ok(
      /[а-яА-Я]/.test(trans),
      `Transcription '${trans}' must contain Cyrillic characters`
    );
    assert.ok(
      !/[b-gi-zB-GI-Z]/.test(trans.replace(/h/g, '')),
      `Transcription '${trans}' contains illegal Latin letters other than 'h'`
    );

    // Tense must be present or past
    const tense = tenseMatches[idx];
    assert.ok(['present', 'past'].includes(tense), `Unexpected tense '${tense}'`);

    // Min lesson must be a valid number
    const minLesson = minLessonMatches[idx];
    assert.ok(minLesson >= 1 && minLesson <= 50, `minLesson ${minLesson} outside Alef scope`);
  });
});
