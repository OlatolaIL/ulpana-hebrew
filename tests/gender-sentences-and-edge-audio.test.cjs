/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const {
  getSentenceGenderInfo,
  adaptSentenceForGender,
  replaceCyrillicWord,
} = require(path.join(repoRoot, 'src/lib/drills/sentenceGenderAdapter.ts'));

test('sentenceGenderAdapter: replaceCyrillicWord correctly handles accented Cyrillic words', () => {
  const res1 = replaceCyrillicWord('анӣ роцэ́ мáйим карӣ́м.', 'роце', 'роца́');
  assert.equal(res1, 'анӣ роца́ мáйим карӣ́м.');

  const res2 = replaceCyrillicWord('атá йодéа эт hа-тшувá?', 'ата', 'ат');
  assert.equal(res2, 'ат йодéа эт hа-тшувá?');

  const res3 = replaceCyrillicWord('анӣ охéль лéхем.', 'охель', 'охéлет');
  assert.equal(res3, 'анӣ охéлет лéхем.');
});

test('sentenceGenderAdapter: 1st person sentences are adapted to feminine for female student', () => {
  const s1 = adaptSentenceForGender(
    'אֲנִי רוֹצֶה מַיִם קָרִים.',
    'анӣ роцэ́ мáйим карӣ́м.',
    'female'
  );
  assert.equal(s1.sentenceHe, 'אֲנִי רוֹצָה מַיִם קָרִים.');
  assert.equal(s1.sentenceTranscription, 'анӣ роца́ мáйим карӣ́м.');

  const s2 = adaptSentenceForGender(
    'אֲנִי אוֹכֵל לֶחֶם וּגְבִינָה.',
    'анӣ охéль лéхем у-гвинá.',
    'female'
  );
  assert.equal(s2.sentenceHe, 'אֲנִי אוֹכֶלֶת לֶחֶם וּגְבִינָה.');
  assert.ok(s2.sentenceTranscription.includes('охéлет') || s2.sentenceTranscription.includes('охе́лет'), `Expected accented transcription, got: ${s2.sentenceTranscription}`);
});

test('sentenceGenderAdapter: 2nd person masculine sentences adapt to feminine', () => {
  const s = adaptSentenceForGender(
    'אַתָּה יוֹדֵעַ אֶת הַתְּשׁוּבָה?',
    'атá йодéа эт hа-тшувá?',
    'female'
  );
  assert.equal(s.sentenceHe, 'אַתְּ יוֹדַעַת אֶת הַתְּשׁוּבָה?');
  assert.ok(s.sentenceTranscription.startsWith('ат '), `Expected 'ат ', got: ${s.sentenceTranscription}`);
  assert.ok(s.sentenceTranscription.includes('йода́ат') || s.sentenceTranscription.includes('йодаат'), `Expected feminine transcription, got: ${s.sentenceTranscription}`);
});

test('sentenceGenderAdapter: male student retains original sentence unmodified', () => {
  const s = adaptSentenceForGender(
    'אֲנִי רוֹצֶה מַיִם קָרִים.',
    'анӣ роцэ́ мáйим карӣ́м.',
    'male'
  );
  assert.equal(s.sentenceHe, 'אֲנִי רוֹצֶה מַיִם קָרִים.');
  assert.equal(s.sentenceTranscription, 'анӣ роцэ́ мáйим карӣ́м.');
});

test('sentenceGenderAdapter: 3rd person sentences and neutral sentences are not gender sensitive for student', () => {
  const s1 = getSentenceGenderInfo('הוּא אוֹכֵל לֶחֶם.');
  assert.equal(s1.category, 'third_person_m');
  assert.equal(s1.isGenderSensitive, false);

  const s2 = getSentenceGenderInfo('הִיא שׁוֹתָה מַיִם.');
  assert.equal(s2.category, 'third_person_f');
  assert.equal(s2.isGenderSensitive, false);

  const s3 = getSentenceGenderInfo('יֵשׁ פֹּה חֲנוּת גְּדוֹלָה.');
  assert.equal(s3.category, 'neutral');
  assert.equal(s3.isGenderSensitive, false);
});
