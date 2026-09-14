/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const dictPath = path.join(repoRoot, 'src/data/pealimMasterDictionary.json');
const dbPath = path.join(repoRoot, 'src/lib/verbConjugations/database.ts');

test('pealimMasterDictionary.json has no artifact spaces in single words and root ש-א-ר', () => {
  assert.ok(fs.existsSync(dictPath), 'pealimMasterDictionary.json must exist');
  const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

  // Test root ש-א-ר specific words from user report
  const lehashir = dict['להשאיר'];
  assert.ok(lehashir, 'Word להשאיר must exist in master dictionary');
  assert.equal(lehashir.transcription, 'леhашъир');

  const rfHisharut = lehashir.rootFamily?.find((w) => w.hebrewPlain === 'הישארות');
  assert.ok(rfHisharut, 'הישארות must exist in root family of להשאיר');
  assert.equal(rfHisharut.transcription, 'hишаарут');

  const rfShear = lehashir.rootFamily?.find((w) => w.hebrewPlain === 'שאר');
  assert.ok(rfShear, 'שאר must exist in root family of להשאיר');
  assert.equal(rfShear.transcription, 'шеар');

  const rfSheerit = lehashir.rootFamily?.find((w) => w.hebrewPlain === 'שארית');
  assert.ok(rfSheerit, 'שארית must exist in root family of להשאיר');
  assert.equal(rfSheerit.transcription, 'шеэрит');

  const rfLehishaer = lehashir.rootFamily?.find((w) => w.hebrewPlain === 'להישאר');
  assert.ok(rfLehishaer, 'להישאר must exist in root family of להשאיר');
  assert.equal(rfLehishaer.transcription, 'леhишаэр');

  // Verify verb conjugations for להישאר
  const lehishaer = dict['להישאר'];
  assert.ok(lehishaer, 'Word להישאר must exist in master dictionary');
  assert.ok(lehishaer.conjugation?.present, 'Present tense forms must exist');
  const nishar = lehishaer.conjugation.present.find((p) => p.hebrew === 'נִשְׁאָר');
  assert.ok(nishar, 'Form נִשְׁאָר must exist');
  assert.equal(nishar.transcription, 'нишъар');

  const nisheret = lehishaer.conjugation.present.find((p) => p.hebrew === 'נִשְׁאֶרֶת');
  assert.ok(nisheret, 'Form נִשְׁאֶרֶת must exist');
  assert.equal(nisheret.transcription, 'нишъэрет');
});

test('verbConjugations/database.ts contains clean transcriptions without artifact spaces', () => {
  assert.ok(fs.existsSync(dbPath), 'database.ts must exist');
  const content = fs.readFileSync(dbPath, 'utf8');

  // Must not contain broken artifact fragments
  assert.ok(!content.includes('"hишаар у т"'), 'Must not contain "hишаар у т"');
  assert.ok(!content.includes('"ше а р"'), 'Must not contain "ше а р"');
  assert.ok(!content.includes('"леhашъ и р"'), 'Must not contain "леhашъ и р"');
  assert.ok(!content.includes('"шеэр и т"'), 'Must not contain "шеэр и т"');
  assert.ok(!content.includes('"нишъ а р"'), 'Must not contain "нишъ а р"');
  assert.ok(!content.includes('"нишъ э рет"'), 'Must not contain "нишъ э рет"');

  // Must contain normalized clean transcriptions
  assert.ok(content.includes('"hишаарут"'), 'Must contain "hишаарут"');
  assert.ok(content.includes('"шеар"'), 'Must contain "шеар"');
  assert.ok(content.includes('"леhашъир"'), 'Must contain "леhашъир"');
  assert.ok(content.includes('"шеэрит"'), 'Must contain "шеэрит"');
  assert.ok(content.includes('"нишъар"'), 'Must contain "нишъар"');
  assert.ok(content.includes('"нишъэрет"'), 'Must contain "нишъэрет"');
});

test('fetch_pealim_dictionary.cjs parses new Pealim HTML strings without inserting spaces', () => {
  const scriptContent = fs.readFileSync(path.join(repoRoot, 'scripts/fetch_pealim_dictionary.cjs'), 'utf8');
  const fnMatch = scriptContent.match(/function pealimTransToCyrillic[\s\S]*?\n\}/);
  assert.ok(fnMatch, 'pealimTransToCyrillic must be defined');
  const pealimTransToCyrillic = new Function('text', fnMatch[0] + '; return pealimTransToCyrillic(text);');

  const testCases = [
    { html: 'hишаар<b>у</b>т', expected: 'hишаарут' },
    { html: 'ше<b>а</b>р', expected: 'шеар' },
    { html: 'леhашъ<b>и</b>р', expected: 'леhашъир' },
    { html: 'шеэр<b>и</b>т', expected: 'шеэрит' },
    { html: 'нишъ<b>а</b>р', expected: 'нишъар' },
    { html: 'нишъ<b>э</b>рет', expected: 'нишъэрет' },
    { html: 'нишъар<b>и</b>м', expected: 'нишъарим' },
    { html: 'hамлац<b>а</b>', expected: 'hамлаца' },
    { html: 'б<b>е</b>йт с<b>е</b>фер', expected: 'бейт сефер' }
  ];

  for (const tc of testCases) {
    assert.equal(pealimTransToCyrillic(tc.html), tc.expected);
  }
});

