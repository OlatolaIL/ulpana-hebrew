/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { execSync } = require('child_process');

const { stripNikkud, tokenizeText } = require('../src/lib/transcription.ts');
const { lookupOfflineWord } = require('../src/lib/ulpanDictionary.ts');

test('R-04 & R-05: stripNikkud preserves Modern Hebrew כתיב מלא and converts archaic kubutz to vav', () => {
  // Critical test cases: words historically pointed with kubutz without vav
  const cases = [
    { pointed: 'מְעֻלֶּה', expected: 'מעולה', desc: 'meule (must NOT become מעלה)' },
    { pointed: 'סֻכָּר', expected: 'סוכר', desc: 'sukar (must NOT become סכר)' },
    { pointed: 'חֻלְצָה', expected: 'חולצה', desc: 'chultza (must NOT become חלצה)' },
    { pointed: 'כֻּלָּם', expected: 'כולם', desc: 'kulam (must NOT become כלם)' },
    { pointed: 'מְצֻיָּן', expected: 'מצוין', desc: 'metzuyan (must NOT become מצין)' },
    { pointed: 'שֻׁתָּף', expected: 'שותף', desc: 'shutaf (must NOT become שתף)' },
    { pointed: 'מְיֻחָד', expected: 'מיוחד', desc: 'meyuchad (must NOT become מיחד)' },
    { pointed: 'שׁוּלְחָן', expected: 'שולחן', desc: 'shulchan with shuruk preserves single vav' },
    { pointed: 'שֻׁלְחָן', expected: 'שולחן', desc: 'shulchan with kubutz produces שולחן' },
    { pointed: 'קֻפְסָה', expected: 'קופסה', desc: 'kufsa produces קופסה' },
  ];

  for (const c of cases) {
    const actual = stripNikkud(c.pointed);
    assert.equal(actual, c.expected, `stripNikkud('${c.pointed}') must equal '${c.expected}' for ${c.desc}`);
  }
});

test('R-08: Dialogue 2 tokenization and lookup: "הַקָּפֶה מְעוּלֶּה" maps to meule (not mala / upward)', () => {
  const sentence = 'תּוֹדָה רַבָּה! הַקָּפֶה מְעוּלֶּה.';
  const tokens = tokenizeText(sentence);
  const meuleToken = tokens.find((t) => t.text.includes('מְעוּלֶּה') || t.cleanText === 'מעולה');
  assert.ok(meuleToken, 'Must tokenize מְעוּלֶּה');
  assert.equal(meuleToken.cleanText, 'מעולה', 'Token cleanText must be modern כתיב מלא מעולה');

  const lookupResult = lookupOfflineWord(meuleToken.cleanText);
  assert.ok(lookupResult, 'Lookup must find article for מעולה');
  assert.ok(
    lookupResult.translation.includes('отличный') || lookupResult.translation.includes('замечательный'),
    `Translation must be "отличный", got: "${lookupResult.translation}"`
  );
  assert.notEqual(lookupResult.translation, 'вверх', 'Must never return "вверх" for meule');
});

test('R-04, R-05, R-06: Static audit: no archaic kubutz without vav in curriculum data', () => {
  // Execute audit_modern_hebrew_orthography.cjs
  const scriptPath = path.resolve(__dirname, '../scripts/audit_modern_hebrew_orthography.cjs');
  let output = '';
  try {
    output = execSync(`node "${scriptPath}"`, { encoding: 'utf8' });
  } catch (err) {
    assert.fail(`Static audit found archaic kubutz violations:\n${err.stdout || err.stderr}`);
  }
  assert.ok(output.includes('нарушений не найдено'), 'Audit must report 0 violations');
});
