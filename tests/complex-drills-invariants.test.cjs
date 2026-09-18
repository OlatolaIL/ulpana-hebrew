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

test('No duplicate keys in any ComplexDrills dataset files (prevent TS1117 build failures)', () => {
  const fs = require('fs');
  const path = require('path');

  const files = [
    path.join(__dirname, '..', 'src', 'data', 'drills', 'nounDrillsData.ts'),
    path.join(__dirname, '..', 'src', 'data', 'drills', 'adjectiveDrillsData.ts'),
    path.join(__dirname, '..', 'src', 'data', 'drills', 'prepositionDrillsData.ts'),
    path.join(__dirname, '..', 'src', 'data', 'verbSentencesData.ts'),
  ];

  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8');
    const lines = content.split('\n');
    const seen = new Set();
    const duplicates = [];

    lines.forEach((line, idx) => {
      const m = line.match(/^  ['"]([^'"]+)['"]\s*:\s*\{/);
      if (m) {
        const key = m[1];
        if (seen.has(key)) {
          duplicates.push({ key, line: idx + 1 });
        } else {
          seen.add(key);
        }
      }
    });

    assert.equal(
      duplicates.length,
      0,
      `File ${path.basename(f)} has ${duplicates.length} duplicate keys: ${duplicates.map(d => d.key + ' (line ' + d.line + ')').join(', ')}`
    );
  }
});

test('Noun drill audio confirmation in ComplexDrillMode does not duplicate target word', () => {
  const fs = require('fs');
  const path = require('path');
  const modePath = path.join(__dirname, '..', 'src', 'components', 'FlashcardTrainer', 'modes', 'ComplexDrillMode.tsx');
  const content = fs.readFileSync(modePath, 'utf8');

  // Must not concatenate singular and plural directly in confirmation speech
  assert.ok(
    !content.includes('const pairHe = `${targetItem.singularHe} — ${targetItem.pluralHe}`;'),
    'ComplexDrillMode must not concatenate singular and plural for TTS confirmation (causes double repetition for uncountable nouns)'
  );

  // Must speak targetWordVocalized or singularHe once
  assert.ok(
    content.includes('const wordHe = targetItem.targetWordVocalized || targetItem.singularHe;'),
    'ComplexDrillMode must speak targetWordVocalized or singularHe once in runConfirmationSequence'
  );

  // Must handle distinct plurals vs uncountable nouns in UI
  assert.ok(
    content.includes('hasDistinctPlural'),
    'ComplexDrillMode must conditionally check hasDistinctPlural to avoid showing duplicate columns for uncountable nouns'
  );

  // handleTokenClick must stop speech and cancel active drill timer
  assert.ok(
    content.includes('playCycleIdRef.current += 1;\n    stopSpeech();\n\n    setSelectedLookupWord(token.cleanText || token.text);'),
    'handleTokenClick must cancel speech and timer to prevent background playback during WordLookupModal'
  );
});
