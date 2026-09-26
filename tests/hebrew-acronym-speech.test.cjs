const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanHebrewForSpeech } = require('../src/lib/speech.ts');

test('cleanHebrewForSpeech: preserves internal gershayim in acronyms and geresh in loanwords', () => {
  assert.equal(cleanHebrewForSpeech('מֵאַרְהַ"בּ'), 'מֵאַרְהַ"בּ', 'Acronym with preposition מֵאַרְהַ"בּ must not be split');
  assert.equal(cleanHebrewForSpeech('ארה"ב'), 'ארה"ב', 'Acronym ארה"ב must not be split with space');
  assert.equal(cleanHebrewForSpeech('צה"ל'), 'צה"ל', 'Acronym צה"ל must preserve gershayim');
  assert.equal(cleanHebrewForSpeech("צ'יפס"), "צ'יפס", 'Loanword צ\'יפס must preserve geresh');
  assert.equal(cleanHebrewForSpeech('"שלום"'), 'שָׁלוֹם', 'Outer quotes must be removed (phonetic nikkud applied)');
  assert.equal(cleanHebrewForSpeech('«עברית»'), 'עברית', 'Guillemets must be removed');
});

test('LessonTheory grammar parser: Hebrew acronyms with quotes are not split into separate cards', () => {
  const examplesRaw = 'מֵרוּסְיָה (мэ-Русья), מֵאַרְהַ"בּ (мэ-Арhав - из США), מֵחֵיפָה (мэ-Хэйфа).';
  const exampleItems = [];
  const itemRegex = /([\u0590-\u05FF"״'׳\-־]+(?:\s+[\u0590-\u05FF"״'׳\-־]+)*)\s*(?:\(([^)]+)\))?/g;
  let match;
  while ((match = itemRegex.exec(examplesRaw)) !== null) {
    const rawHebrew = match[1].replace(/^[,\s]+|[,\s]+$/g, '').trim();
    if (rawHebrew) {
      exampleItems.push({
        hebrew: rawHebrew,
        translation: match[2] ? match[2].trim() : '',
      });
    }
  }

  assert.equal(exampleItems.length, 3, 'Must have exactly 3 examples, not 4');
  assert.equal(exampleItems[0].hebrew, 'מֵרוּסְיָה');
  assert.equal(exampleItems[0].translation, 'мэ-Русья');
  assert.equal(exampleItems[1].hebrew, 'מֵאַרְהַ"בּ');
  assert.equal(exampleItems[1].translation, 'мэ-Арhав - из США');
  assert.equal(exampleItems[2].hebrew, 'מֵחֵיפָה');
  assert.equal(exampleItems[2].translation, 'мэ-Хэйфа');
});
