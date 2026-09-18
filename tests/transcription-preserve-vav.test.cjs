/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');


const {
  normalizeTranscription,
  generateHebrewTranscription,
  convertLatinHebrewTranscriptionToCyrillic,
  ensureCyrillicHebrewTranscription,
  getWordTranscription,
} = require('../src/lib/transcription.ts');

test('normalizeTranscription preserves manual canonical /u/ prefix and does not force "вэ-"', () => {
  // Manual transcription with conjunction /u/ (as in dictionary / lessons)
  assert.equal(normalizeTranscription('у-гвинá'), 'у-гвинá');
  assert.equal(normalizeTranscription('у-меá'), 'у-меá');
  assert.equal(normalizeTranscription('«у-гвинá»'), '«у-гвинá»');
  assert.equal(normalizeTranscription('у-шнаим'), 'у-шнаим');

  // Existing explicit "вэ-" is preserved and not converted in reverse without context
  assert.equal(normalizeTranscription('вэ-гвинá'), 'вэ-гвинá');

  // Empty string handling
  assert.equal(normalizeTranscription(''), '');

  // Other dictionary normalizations in normalizeTranscription remain intact
  assert.equal(normalizeTranscription('бэвокер'), 'бабóкер');
  assert.equal(normalizeTranscription('бэвакаша'), 'бэвакашá');
  assert.equal(normalizeTranscription('тодá рáба'), 'тодá рабá');
});

test('convertLatinHebrewTranscriptionToCyrillic preserves initial /u/ for Latin input', () => {
  // u-gvina should yield Cyrillic у-гвина, NOT вэ-гвина
  assert.equal(convertLatinHebrewTranscriptionToCyrillic('u-gvina'), 'у-гвина');

  // Explicit ve- remains вэ-
  assert.equal(convertLatinHebrewTranscriptionToCyrillic('ve-gvina'), 'вэ-гвина');

  // Empty input
  assert.equal(convertLatinHebrewTranscriptionToCyrillic(''), '');
});

test('generateHebrewTranscription renders initial shuruk vav (וּ) as /u/ and does not emit initial "вэ"', () => {
  // Conjunction וּ before BUMAF and sheva
  const mea = generateHebrewTranscription('וּמֵאָה');
  assert.ok(!mea.startsWith('вэ'), `"וּמֵאָה" generated unexpected initial "вэ": ${mea}`);
  assert.ok(mea.startsWith('у-'), `"וּמֵאָה" should start with "у-": ${mea}`);
  assert.equal(mea, 'у-меа');

  const shnayim = generateHebrewTranscription('וּשְׁנַיִם');
  assert.ok(!shnayim.startsWith('вэ'), `"וּשְׁנַיִם" generated unexpected initial "вэ": ${shnayim}`);
  assert.ok(shnayim.startsWith('у-'), `"וּשְׁנַיִם" should start with "у-": ${shnayim}`);
  assert.equal(shnayim, 'у-шнайим');

  const gvina = generateHebrewTranscription('וּגְבִינָה');
  assert.ok(!gvina.startsWith('вэ'), `"וּגְבִינָה" generated unexpected initial "вэ": ${gvina}`);
  assert.ok(gvina.startsWith('у-'), `"וּגְבִינָה" should start with "у-": ${gvina}`);
  assert.equal(gvina, 'у-гвина');

  // Empty input
  assert.equal(generateHebrewTranscription(''), '');

  // Conjunction with regular shva (וְ) is unaffected and keeps /ve/
  assert.equal(generateHebrewTranscription('וְשָׁלוֹם'), 'вешалом');
  assert.equal(generateHebrewTranscription('וְגַם'), 'вегам');
});

test('ensureCyrillicHebrewTranscription preserves manual /u/ and generates /u/ for missing transcription', () => {
  // Preserves existing Cyrillic transcription with /u/
  assert.equal(
    ensureCyrillicHebrewTranscription('у-гвинá', 'וּגְבִינָה'),
    'у-гвинá'
  );

  // Preserves existing Cyrillic transcription with /ve/
  assert.equal(
    ensureCyrillicHebrewTranscription('вэ-гвинá', 'וּגְבִינָה'),
    'вэ-гвинá'
  );

  // When transcription is missing, generates from vocalized Hebrew with /u/
  const genFromHeb = ensureCyrillicHebrewTranscription('', 'וּמֵאָה');
  assert.ok(!genFromHeb.startsWith('вэ'), `Generated transcription must not start with "вэ": ${genFromHeb}`);
  assert.equal(genFromHeb, 'у-меа');

  // Latin transcription with u- converted to Cyrillic у-
  assert.equal(
    ensureCyrillicHebrewTranscription('u-gvina'),
    'у-гвина'
  );
});

test('getWordTranscription returns manual /u/ when present and generates /u/ when absent', () => {
  // With manual transcription: preserves exact manual string
  const manualWord = {
    hebrew: 'וּגְבִינָה',
    transcription: 'у-гвинá',
  };
  assert.equal(getWordTranscription(manualWord), 'у-гвинá');

  // Without manual transcription: generates dynamically with /u/
  const autoWord = {
    hebrew: 'וּגְבִינָה',
  };
  const autoResult = getWordTranscription(autoWord);
  assert.ok(!autoResult.startsWith('вэ'), `Generated transcription must not start with "вэ": ${autoResult}`);
  assert.equal(autoResult, 'у-гвина');

  const autoMea = {
    hebrew: 'וּמֵאָה',
  };
  assert.equal(getWordTranscription(autoMea), 'у-меа');

  // Null/undefined/empty handling
  assert.equal(getWordTranscription(null), '');
  assert.equal(getWordTranscription(undefined), '');
  assert.equal(getWordTranscription({}), '');
});

test('ensureCyrillicHebrewTranscription cleans up Latin letters and keeps stress marks', () => {
  const result = convertLatinHebrewTranscriptionToCyrillic('hacéфер');
  assert.equal(result, 'hасéфер');
  assert.ok(!result.includes('c'), 'must not contain Latin c');
});

test('generateHebrewTranscription correctly renders dual and diphthong endings with /y/ (майим, бамайим, байит, ядайим)', () => {
  assert.equal(generateHebrewTranscription('מַיִם'), 'майим');
  assert.equal(generateHebrewTranscription('בַּמַּיִם'), 'бамайим');
  assert.equal(generateHebrewTranscription('בַּיִת'), 'байит');
  assert.equal(generateHebrewTranscription('שָׁמַיִם'), 'шамайим');
  assert.equal(generateHebrewTranscription('יָדַיִם'), 'ядайим');
  assert.equal(generateHebrewTranscription('פַּעֲמַיִם'), 'паамайим');
});

test('cleanHebrewForSpeech prepares sababa with penultimate stress phonetic form (סַבָּ-בָּה)', () => {
  const { cleanHebrewForSpeech } = require('../src/lib/speech.ts');
  assert.equal(cleanHebrewForSpeech('סבבה'), 'סַבָּ-בָּה');
  assert.equal(cleanHebrewForSpeech('סַבָּבָה'), 'סַבָּ-בָּה');
  assert.equal(cleanHebrewForSpeech('סַבָּבָּה'), 'סַבָּ-בָּה');
});

