const test = require('node:test');
const assert = require('node:assert/strict');
const { validatePhoneGoalEvidence } = require('../src/lib/phoneGoalEvidence.ts');
const transcript = [
  { role: 'user', hebrew: 'אני רוצה קפה גדול בלי סוכר.' },
  { role: 'assistant', hebrew: 'הקפה מוכן.' },
  { role: 'user', hebrew: 'תודה, להתראות.' },
];
const evidence = (goalIndex, met, quote = 'אני רוצה קפה גדול', role = 'user') => ({
  goalIndex, met, evidence: quote ? [{ role, quote }] : [],
});

test('every goal needs an explicit assessment; missing data is not success', () => {
  for (const raw of [undefined, null, [], [evidence(0, true)]]) {
    assert.throws(() => validatePhoneGoalEvidence(raw, 2, transcript), /Missing/);
  }
  const unmet = validatePhoneGoalEvidence([evidence(0, false, null)], 1, transcript);
  assert.equal(unmet[0].met, false);
});

test('all met goals require traceable student quotes and preserve each assessment', () => {
  const raw = [evidence(0, true), evidence(1, true, 'בלי סוכר'), evidence(2, true, 'תודה, להתראות')];
  assert.deepEqual(validatePhoneGoalEvidence(raw, 3, transcript), raw);
  assert.doesNotThrow(() => validatePhoneGoalEvidence([evidence(0, true, 'אֲנִי רוֹצֶה קָפֶה גָּדוֹל')], 1, transcript));
});

test('fabricated quotes, absent speakers, and assistant statements attributed to the student fail', () => {
  for (const entry of [
    evidence(0, true, 'אני רוצה תה קטן'),
    evidence(0, true, 'הקפה מוכן', 'user'),
    evidence(0, true, 'אני רוצה קפה גדול', 'assistant'),
    { goalIndex: 0, met: true, evidence: [{ quote: 'אני רוצה קפה גדול' }] },
  ]) {
    assert.throws(() => validatePhoneGoalEvidence([entry], 1, transcript), /Unverifiable/);
  }
});

test('duplicate goal IDs and out-of-range IDs cannot substitute for missing goals', () => {
  assert.throws(() => validatePhoneGoalEvidence([evidence(0, true), evidence(0, true)], 2, transcript), /Invalid/);
  assert.throws(() => validatePhoneGoalEvidence([evidence(2, true)], 1, transcript), /Invalid/);
  assert.throws(() => validatePhoneGoalEvidence([{ ...evidence(0, true), met: 'true' }], 1, transcript), /Invalid/);
});

test('assistant-only or empty evidence cannot award the student a completed goal', () => {
  assert.throws(() => validatePhoneGoalEvidence([evidence(0, true, 'הקפה מוכן', 'assistant')], 1, transcript), /No student/);
  assert.throws(() => validatePhoneGoalEvidence([evidence(0, true, null)], 1, transcript), /No student/);
});
