const test = require('node:test');
const assert = require('node:assert/strict');
const { NOUN_DRILLS_DATA } = require('../src/data/drills/nounDrillsData.ts');
const { ADJECTIVE_DRILLS_DATA } = require('../src/data/drills/adjectiveDrillsData.ts');
const { PREPOSITION_DRILLS_DATA } = require('../src/data/drills/prepositionDrillsData.ts');
const { hasComplexDrill, getDrillDataForWord } = require('../src/data/drills/index.ts');

test('Noun drills data integrity', () => {
  const keys = Object.keys(NOUN_DRILLS_DATA);
  assert.ok(keys.length >= 750, `Expected at least 750 nouns, found ${keys.length}`);

  for (const key of keys) {
    const item = NOUN_DRILLS_DATA[key];
    assert.equal(item.type, 'noun', `Word ${key} must have type noun`);
    assert.ok(item.singularHe, `Word ${key} missing singularHe`);
    assert.ok(item.pluralHe, `Word ${key} missing pluralHe`);
    assert.ok(['m', 'f'].includes(item.gender), `Word ${key} gender must be m or f`);
    assert.ok(item.sentenceHe, `Word ${key} missing sentenceHe`);
    assert.ok(item.sentenceRu, `Word ${key} missing sentenceRu`);
    assert.ok(item.sentenceTranscription, `Word ${key} missing sentenceTranscription`);
    assert.ok(item.minLesson >= 1 && item.minLesson <= 100, `Word ${key} minLesson (${item.minLesson}) must be between 1 and 100`);

    // Check sentence length (V-02: 3-5 words)
    const wordsCount = item.sentenceHe.trim().split(/\s+/).length;
    assert.ok(wordsCount >= 2 && wordsCount <= 6, `Sentence "${item.sentenceHe}" word count (${wordsCount}) should be between 2 and 6`);

    // Check no naked kubuts (R-06)
    assert.ok(!/[^\u05D5]\u05BB/.test(item.sentenceHe), `Sentence "${item.sentenceHe}" contains archaic kubutz without vav`);
  }
});

test('Adjective drills data integrity', () => {
  const keys = Object.keys(ADJECTIVE_DRILLS_DATA);
  assert.ok(keys.length >= 45, `Expected at least 45 adjectives, found ${keys.length}`);

  for (const key of keys) {
    const item = ADJECTIVE_DRILLS_DATA[key];
    assert.equal(item.type, 'adjective', `Word ${key} must have type adjective`);
    assert.ok(item.forms.ms.hebrew, `Word ${key} missing ms form`);
    assert.ok(item.forms.fs.hebrew, `Word ${key} missing fs form`);
    assert.ok(item.forms.mp.hebrew, `Word ${key} missing mp form`);
    assert.ok(item.forms.fp.hebrew, `Word ${key} missing fp form`);
    assert.ok(item.sentenceHe, `Word ${key} missing sentenceHe`);
    assert.ok(item.sentenceRu, `Word ${key} missing sentenceRu`);
  }
});

test('Preposition drills data integrity', () => {
  const keys = Object.keys(PREPOSITION_DRILLS_DATA);
  assert.ok(keys.length >= 5, `Expected at least 5 prepositions, found ${keys.length}`);

  for (const key of keys) {
    const item = PREPOSITION_DRILLS_DATA[key];
    assert.equal(item.type, 'preposition', `Word ${key} must have type preposition`);
    assert.ok(item.basePrepositionHe, `Word ${key} missing basePrepositionHe`);
    assert.ok(item.inflectedFormHe, `Word ${key} missing inflectedFormHe`);
    assert.ok(item.sentenceHe, `Word ${key} missing sentenceHe`);
    assert.ok(item.sentenceRu, `Word ${key} missing sentenceRu`);
  }
});

test('Dispatcher getDrillDataForWord and hasComplexDrill', () => {
  // Test noun
  assert.ok(hasComplexDrill({ hebrew: 'שולחן' }));
  const nounResult = getDrillDataForWord({ hebrew: 'שׁוּלְחָן', hebrewPlain: 'שולחן', translation: 'стол' });
  assert.equal(nounResult[0].type, 'noun');
  assert.equal(nounResult[0].pluralHe, 'שׁוּלְחָנוֹת');
  assert.equal(nounResult[0].isPluralException, true);

  // Test adjective
  assert.ok(hasComplexDrill({ hebrew: 'גדול' }));
  const adjResult = getDrillDataForWord({ hebrew: 'גָּדוֹל', hebrewPlain: 'גדול', translation: 'большой' });
  assert.equal(adjResult[0].type, 'adjective');
  assert.equal(adjResult[0].forms.fs.hebrew, 'גְּדוֹלָה');

  // Test preposition
  assert.ok(hasComplexDrill({ hebrew: 'שלי' }));
  const prepResult = getDrillDataForWord({ hebrew: 'שֶׁלִּי', hebrewPlain: 'שלי', translation: 'мой' });
  assert.equal(prepResult[0].type, 'preposition');
  assert.equal(prepResult[0].basePrepositionHe, 'שֶׁל');

  // Test verb
  assert.ok(hasComplexDrill({ hebrew: 'לִרְצוֹת', hebrewPlain: 'לרצות' }));
  const verbResult = getDrillDataForWord({ hebrew: 'לִרְצוֹת', hebrewPlain: 'לרצות', translation: 'хотеть' });
  assert.equal(verbResult[0].type, 'verb');
  assert.equal(verbResult[0].verbInfinitive, 'לִרְצוֹת');
});
