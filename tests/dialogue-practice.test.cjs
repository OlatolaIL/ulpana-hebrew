const { test } = require('node:test');
const assert = require('node:assert/strict');
const { requestDialogueEvaluation, isDialoguePracticeComplete } = require('../src/lib/dialoguePractice.ts');

test('dialogue client rejects service outages and malformed assessments without awarding a grade', async () => {
  const original = global.fetch;
  try {
    for (const response of [
      new Response('{}', { status: 503 }),
      new Response('{}', { status: 429 }),
      new Response(JSON.stringify({ isCorrect: true, score: 85 })),
    ]) {
      global.fetch = async () => response;
      await assert.rejects(requestDialogueEvaluation({ userSpokenHebrew: 'שלום' }));
    }
    global.fetch = async () => { throw new TypeError('offline'); };
    await assert.rejects(requestDialogueEvaluation({ userSpokenHebrew: 'שלום' }));
  } finally { global.fetch = original; }
});

test('a successful text assessment retains its meaning without inventing pronunciation evidence', async () => {
  const original = global.fetch;
  try {
    global.fetch = async () => new Response(JSON.stringify({
      isCorrect: true, score: 100, assessment: 'perfect', feedbackRu: 'Верно',
      pronunciationScore: 99, pronunciationFeedbackRu: 'Perfect accent',
    }));
    const answer = await requestDialogueEvaluation({ userSpokenHebrew: 'שלום' });
    assert.equal(answer.isCorrect, true);
    assert.equal(answer.userSpokenHebrew, 'שלום');
    assert.equal(answer.pronunciationScore, undefined);
    assert.equal(answer.pronunciationFeedbackRu, undefined);
  } finally { global.fetch = original; }
});

test('dialogue completion requires every student turn and cannot come from recordings or opponent turns', () => {
  const turns = [{ speaker: 'a' }, { speaker: 'b' }, { speaker: 'a' }, { speaker: 'b' }];
  assert.equal(isDialoguePracticeComplete(turns, 'b', {}), false);
  assert.equal(isDialoguePracticeComplete(turns, 'b', { 1: { userAudioUrl: '/recording' }, 3: { userAudioUrl: '/recording' } }), false);
  assert.equal(isDialoguePracticeComplete(turns, 'b', { 0: { isCorrect: true }, 2: { isCorrect: true } }), false);
  assert.equal(isDialoguePracticeComplete(turns, 'b', { 1: { isCorrect: true }, 3: { isCorrect: false } }), false);
  assert.equal(isDialoguePracticeComplete(turns, 'b', { 1: { isCorrect: true }, 3: { isCorrect: true } }), true);
  assert.equal(isDialoguePracticeComplete([], 'b', {}), false);
});
