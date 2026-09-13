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
