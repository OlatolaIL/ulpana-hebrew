const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { textOnlyEvaluation } = require('../src/lib/aiRequest.ts');
const { isWhisperSilenceHallucination } = require('../src/lib/speechTranscription.ts');

const request = (path, body) => new NextRequest(`http://localhost${path}`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': 'test-evaluations' }, body: JSON.stringify(body) });

test('phone review rejects incomplete model reports and never boosts a low grammar score', async () => {
  const { POST } = require('../src/app/api/ai/phone/debrief/route.ts');
  const originalFetch = global.fetch;
  const oldGroq = process.env.GROQ_API_KEY;
  const oldGemini = process.env.GEMINI_API_KEY;
  process.env.GROQ_API_KEY = 'synthetic-provider-key'; delete process.env.GEMINI_API_KEY;
  const report = { overallScore: 30, grammarScore: 20, isSuccess: false, summaryRu: 'Требуется повторение', turnReviews: [{ userHebrew: 'שלום', assessment: 'needs_improvement', commentRu: 'Нужно продолжить ответ' }] };
  try {
    const payload = { lessonNumber: 1, level: 'alef', transcript: [{ role: 'assistant', hebrew: 'שלום' }, { role: 'user', hebrew: 'שלום' }] };
    for (const bad of [{}, { ...report, turnReviews: [] }, { ...report, overallScore: 110 }]) {
      global.fetch = async () => Response.json({ choices: [{ message: { content: JSON.stringify(bad) } }] });
      assert.equal((await POST(request('/api/ai/phone/debrief', payload))).status, 503);
    }
    global.fetch = async () => Response.json({ choices: [{ message: { content: JSON.stringify(report) } }] });
    const response = await POST(request('/api/ai/phone/debrief', payload));
    assert.equal(response.status, 200);
    const checked = await response.json();
    assert.equal(checked.grammarScore, 20);
    assert.equal(checked.overallScore, 30);
    assert.equal(checked.isSuccess, false);
    assert.equal(checked.turnReviews.length, 1);
    assert.equal(checked.pronunciationScore, undefined);
  } finally {
    global.fetch = originalFetch;
    if (oldGroq === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = oldGroq;
    if (oldGemini === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = oldGemini;
  }
});

test('AI access for lessons beyond the guest preview requires login on the server', async () => {
  const { POST } = require('../src/app/api/ai/dialogue/evaluate/route.ts');
  const response = await POST(request('/api/ai/dialogue/evaluate', { lessonNumber: 3, userSpokenHebrew: 'שלום', referenceHebrew: 'שלום' }));
  assert.equal(response.status, 401);
});

test('transcripts cannot receive pronunciation scores, including individual turns', () => {
  const original = { score: 80, pronunciationScore: 99, pronunciationFeedbackRu: 'Invented', turnReviews: [{ pronunciationScore: 96, userHebrew: 'שלום' }] };
  const result = textOnlyEvaluation(original);
  assert.equal(result.pronunciationScore, undefined);
  assert.equal(result.pronunciationFeedbackRu, undefined);
  assert.equal(result.turnReviews[0].pronunciationScore, undefined);
  assert.equal(original.pronunciationScore, 99);
});

test('common thanks phrases are legitimate spoken lesson answers', () => {
  for (const phrase of ['תודה', 'תודה רבה', 'תודה רבה לך', 'спасибо', 'thank you']) assert.equal(isWhisperSilenceHallucination(phrase), false);
});

test('dialogue outage and partial answers cannot earn a fabricated passing grade', async () => {
  delete process.env.GROQ_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const { POST } = require('../src/app/api/ai/dialogue/evaluate/route.ts');
  for (const referenceHebrew of ['אני רוצה ללמוד עברית', '']) {
    const response = await POST(request('/api/ai/dialogue/evaluate', { userSpokenHebrew: 'אני', referenceHebrew, lessonNumber: 1 }));
    assert.equal(response.status, 503);
    const data = await response.json();
    assert.equal(data.isCorrect, undefined);
    assert.equal(data.score, undefined);
  }
});

test('exact reference answers can be checked locally without inventing pronunciation', async () => {
  const { POST } = require('../src/app/api/ai/dialogue/evaluate/route.ts');
  const response = await POST(request('/api/ai/dialogue/evaluate', { userSpokenHebrew: 'שלום', referenceHebrew: 'שָׁלוֹם', lessonNumber: 1 }));
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.isCorrect, true);
  assert.equal(data.pronunciationScore, undefined);
});

test('malformed, oversized and invalid lesson requests fail before evaluation', async () => {
  const { POST } = require('../src/app/api/ai/dialogue/evaluate/route.ts');
  for (const body of [null, { lessonNumber: -1 }, { userSpokenHebrew: 42 }]) {
    assert.equal((await POST(request('/api/ai/dialogue/evaluate', body))).status, 400);
  }
  assert.equal((await POST(request('/api/ai/dialogue/evaluate', { userSpokenHebrew: 'a'.repeat(140000) }))).status, 413);
});

test('phone review outage returns an error without declaring the objective achieved', async () => {
  delete process.env.GROQ_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const { POST } = require('../src/app/api/ai/phone/debrief/route.ts');
  const response = await POST(request('/api/ai/phone/debrief', { lessonNumber: 1, transcript: [{ role: 'user', hebrew: 'שלום' }] }));
  assert.equal(response.status, 503);
  assert.equal((await response.json()).isSuccess, undefined);
});
