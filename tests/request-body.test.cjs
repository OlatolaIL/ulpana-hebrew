const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readBoundedBody, readBoundedJson, readBoundedForm } = require('../src/lib/requestBody.ts');
const { parseProfileSnapshot } = require('../src/lib/profileSnapshot.ts');
test('chunked bodies are rejected by actual bytes even without content-length', async () => {
  const stream = new ReadableStream({ start(c) { c.enqueue(new Uint8Array(6)); c.enqueue(new Uint8Array(6)); c.close(); } });
  const request = new Request('http://localhost', { method: 'POST', body: stream, duplex: 'half' });
  await assert.rejects(readBoundedBody(request, 10), e => e.status === 413);
});
test('malformed JSON and multipart receive input errors, valid audio form is preserved', async () => {
  await assert.rejects(readBoundedJson(new Request('http://localhost', { method: 'POST', body: '{broken' }), 100), e => e.status === 400);
  await assert.rejects(readBoundedForm(new Request('http://localhost', { method: 'POST', body: 'bad form' }), 100), e => e.status === 400);
  const data = new FormData(); data.set('file', new Blob(['abc'], { type: 'audio/webm' }), 'test.webm');
  const form = await readBoundedForm(new Request('http://localhost', { method: 'POST', body: data }), 4096);
  assert.equal(await form.get('file').text(), 'abc');
});
test('profile validation rejects ambiguous lesson IDs, impossible scores and malformed dictionary entries', () => {
  const base = { expectedUserId: 'student', expectedRevision: 1, gender: 'female', fontStyle: 'print', lessonProgress: {}, personalVocabulary: [], flashcardStats: {} };
  const progress = { completedTabs: ['theory'], isCompleted: false, score: 10, lastVisited: Date.now() };
  assert.ok(parseProfileSnapshot({ ...base, lessonProgress: { 1: progress } }));
  for (const bad of [{ lessonProgress: { '1bad': progress } }, { lessonProgress: { 1: { ...progress, score: 999 } } }, { personalVocabulary: [{ hebrew: 42, translation: 'hello' }] }]) {
    assert.throws(() => parseProfileSnapshot({ ...base, ...bad }), e => e.status === 400);
  }
});

test('parseProfileSnapshot gracefully auto-heals legacy profiles and missing fields', () => {
  const legacyPayload = {
    expectedUserId: 'tg_368679851',
    expectedRevision: 0,
    gender: 'male',
    fontStyle: 'print',
    lessonProgress: {
      '1': { completedTabs: ['theory', 'vocab', 'grammar_old'], isCompleted: false, score: null }, // missing lastVisited, null score, legacy tab
      '3': { completedTabs: ['theory'], isCompleted: true }, // missing lastVisited, missing score
    },
    personalVocabulary: [
      { id: 'w1', hebrew: 'שלום', translation: 'мир', root: null, lessonId: null, transcription: null, partOfSpeech: null },
    ],
    flashcardStats: {
      'w1': { wordId: 'w1', history: [5] }, // missing interval, easeFactor, etc.
    },
  };

  const clean = parseProfileSnapshot(legacyPayload);
  assert.equal(clean.expectedUserId, 'tg_368679851');
  assert.equal(clean.expectedRevision, 0);
  assert.deepEqual(clean.lessonProgress['1'].completedTabs, ['theory', 'vocab']);
  assert.ok(typeof clean.lessonProgress['1'].lastVisited === 'number' && clean.lessonProgress['1'].lastVisited > 0);
  assert.ok(typeof clean.lessonProgress['3'].lastVisited === 'number' && clean.lessonProgress['3'].lastVisited > 0);
  assert.equal(clean.lessonProgress['1'].score, 0);

  // Vocabulary fields sanitized
  assert.equal(clean.personalVocabulary[0].lessonId, 0);
  assert.equal(clean.personalVocabulary[0].transcription, '');
  assert.equal(clean.personalVocabulary[0].partOfSpeech, 'other');
  assert.equal(clean.personalVocabulary[0].root, undefined);

  // Flashcards auto-healed
  assert.equal(clean.flashcardStats['w1'].interval, 1);
  assert.equal(clean.flashcardStats['w1'].easeFactor, 2.5);
  assert.deepEqual(clean.flashcardStats['w1'].history, [5]);
});

