/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const lexiconPath = path.join(repoRoot, 'src/data/pealimMasterLexicon.json');
const rootsPath = path.join(repoRoot, 'src/data/pealimRootsIndex.json');

test('pealimMasterLexicon.json and pealimRootsIndex.json integrity', () => {
  assert.ok(fs.existsSync(lexiconPath), 'pealimMasterLexicon.json must exist');
  assert.ok(fs.existsSync(rootsPath), 'pealimRootsIndex.json must exist');

  const lexicon = JSON.parse(fs.readFileSync(lexiconPath, 'utf8'));
  const roots = JSON.parse(fs.readFileSync(rootsPath, 'utf8'));

  assert.ok(Object.keys(lexicon).length > 10000, 'Lexicon must contain over 10,000 keys');
  assert.ok(Object.keys(roots).length > 1500, 'Roots index must contain over 1,500 roots');

  // Check the exact word from user report: סיכום (sikum)
  const sikum = lexicon['סיכום'];
  assert.ok(sikum, 'Word סיכום must exist in lexicon');
  assert.equal(sikum.hebrew, 'סִיכּוּם');
  assert.equal(sikum.hebrewPlain, 'סיכום');
  assert.equal(sikum.transcription, 'сику́м');
  assert.equal(sikum.partOfSpeech, 'noun');
  assert.equal(sikum.root, 'ס-כ-ם');
  assert.ok(sikum.audio, 'Audio must exist for סיכום');
  assert.ok(sikum.audio.includes('audio.pealim.com'), 'Audio must be valid Pealim audio URL');

  // Check roots index for root ס-כ-ם
  const rootSkm = roots['סכם'];
  assert.ok(Array.isArray(rootSkm), 'Root סכם must exist in roots index');
  assert.ok(rootSkm.includes('סיכום'), 'Root סכם must include סיכום');
  assert.ok(rootSkm.includes('להסכים'), 'Root סכם must include להסכים');
  assert.ok(rootSkm.includes('הסכם'), 'Root סכם must include הסכם');

  // Check nouns, adjectives, verbs
  const shulchan = lexicon['שולחן'];
  assert.ok(shulchan, 'Word שולחן must exist in lexicon');
  assert.equal(shulchan.transcription, 'шульхан');
  assert.equal(shulchan.partOfSpeech, 'noun');

  const gadol = lexicon['גדול'];
  assert.ok(gadol, 'Word גדול must exist in lexicon');
  assert.equal(gadol.partOfSpeech, 'adjective');

  const lehamlitz = lexicon['להמליץ'];
  assert.ok(lehamlitz, 'Word להמליץ must exist in lexicon');
  assert.equal(lehamlitz.partOfSpeech, 'verb');
  assert.equal(lehamlitz.transcription, 'леhамлиц');
});
