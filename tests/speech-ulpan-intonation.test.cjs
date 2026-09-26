/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');

// Helper to check for missing dagesh in ulpan: \u05dc\u05b0\u05e4\u05b8(?!\u05bc)\u05df
const missingDageshPattern = /\u05dc\u05b0\u05e4\u05b8(?!\u05bc)\u05df/g;

test('Ulpan Dagesh Integrity: All lesson files must have dagesh in letter pe for ulpan (אוּלְפָּן)', () => {
  const lessonFiles = [
    'src/data/lessons/alef_01_10.ts',
    'src/data/lessons/alef_11_25.ts',
    'src/data/lessons/alef_26_35.ts',
    'src/data/lessons/alef_36_50.ts',
    'src/data/lessons/bet_51_65.ts',
    'src/data/lessons/bet_66_80.ts',
    'src/data/lessons/bet_81_90.ts',
    'src/data/lessons/bet_91_100.ts',
    'src/data/dialogues/dialogues_01_10.ts',
    'src/data/dialogues/dialogues_11_25.ts'
  ];

  for (const relPath of lessonFiles) {
    const fullPath = path.join(repoRoot, relPath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');
    const matches = content.match(missingDageshPattern) || [];
    assert.equal(
      matches.length,
      0,
      `Found ${matches.length} occurrence(s) of 'ulpan' without dagesh in ${relPath}. Pe must have dagesh (פּ)!`
    );
  }
});

test('Ulpan Lesson 8 Canary: Card s8-1 and Word w8-11 contain dagesh in letter pe', () => {
  const alefPath = path.join(repoRoot, 'src/data/lessons/alef_01_10.ts');
  const content = fs.readFileSync(alefPath, 'utf8');

  // Verify w8-11
  const w8Match = content.match(/\"id\":\s*\"w8-11\"[\s\S]*?\"hebrew\":\s*\"([^\"]+)\"/);
  assert.ok(w8Match, 'w8-11 must exist in alef_01_10.ts');
  assert.ok(
    w8Match[1].includes('\u05bc'),
    `w8-11 hebrew "${w8Match[1]}" must contain dagesh (\\u05bc) inside pe!`
  );

  // Verify s8-1
  const s8Match = content.match(/\"id\":\s*\"s8-1\"[\s\S]*?\"hebrew\":\s*\"([^\"]+)\"/);
  assert.ok(s8Match, 's8-1 must exist in alef_01_10.ts');
  assert.ok(
    s8Match[1].includes('בָּאוּלְפָּן') || s8Match[1].includes('\u05dc\u05b0\u05e4\u05bc'),
    `s8-1 hebrew "${s8Match[1]}" must contain dagesh (\\u05bc) inside pe in באולפן!`
  );
});

test('Phonetic Safeguard: cleanHebrewForSpeech ensures dagesh in pe for ulpan forms and normalizes question marks', () => {
  const speechPath = path.join(repoRoot, 'src/lib/speech.ts');
  const speechSource = fs.readFileSync(speechPath, 'utf8');

  // Verify phonetic rule exists in source
  assert.ok(
    speechSource.includes('אוּלְפָּן'),
    'speech.ts must include canonical pointed form אוּלְפָּן in phonetic rules'
  );
  assert.ok(
    speechSource.includes('\\u05dc\\u05b0)\\u05e4(?!\\u05bc)'),
    'speech.ts must include runtime safeguard regex ensuring dagesh in pe after shva'
  );

  // Verify question mark normalization
  assert.ok(
    speechSource.includes('[؟？]'),
    'cleanHebrewForSpeech must normalize Arabic and fullwidth question marks to standard ?'
  );
  assert.ok(
    speechSource.includes('isQuestion'),
    'speakHebrew must detect isQuestion to modulate pitch and rate'
  );
  assert.ok(
    speechSource.includes('questionPitchBonus'),
    'speakHebrew must apply questionPitchBonus for interrogative prosody'
  );
  assert.ok(
    speechSource.includes('splitHebrewSpeechSegments'),
    'speech.ts must export splitHebrewSpeechSegments to contrast declarative and interrogative segments'
  );
});

test('Dialogue Prosody: splitHebrewSpeechSegments correctly segments multi-sentence turns and isolates questions', () => {
  const { splitHebrewSpeechSegments, cleanHebrewForSpeech } = require(path.join(repoRoot, 'src/lib/speech.ts'));

  const turnText = 'שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי נוֹעַם. אֵיךְ קוֹרְאִים לְךָ?';
  const cleaned = cleanHebrewForSpeech(turnText);
  const segments = splitHebrewSpeechSegments(cleaned);

  assert.equal(segments.length, 4, 'Multi-sentence turn should be split into 4 segments');
  assert.equal(segments[0].isQuestion, false, 'Greeting segment should not be a question');
  assert.equal(segments[1].isQuestion, false, 'Statement segment should not be a question');
  assert.equal(segments[2].isQuestion, false, 'Self-intro segment should not be a question');
  assert.equal(segments[3].isQuestion, true, 'Interrogative clause should be marked as question');
  assert.ok(segments[3].text.includes('?'), 'Interrogative clause must contain question mark');

  // Single question turn
  const singleQ = 'מָה נִשְׁמַע?';
  const singleSegs = splitHebrewSpeechSegments(cleanHebrewForSpeech(singleQ));
  assert.equal(singleSegs.length, 1);
  assert.equal(singleSegs[0].isQuestion, true);

  // Question followed by question
  const doubleQ = 'שָׁלוֹם, מָה נִשְׁמַע? הַכֹּל בְּסֵדֶר?';
  const doubleSegs = splitHebrewSpeechSegments(cleanHebrewForSpeech(doubleQ));
  assert.equal(doubleSegs.length, 2);
  assert.equal(doubleSegs[0].isQuestion, true);
  assert.equal(doubleSegs[1].isQuestion, true);
});

