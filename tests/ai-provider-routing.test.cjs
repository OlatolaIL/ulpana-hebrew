const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { resolveAiKeys } = require('../src/lib/aiModels.ts');

test('a custom provider key is never routed to a different provider', () => {
  const saved = { groq: process.env.GROQ_API_KEY, gemini: process.env.GEMINI_API_KEY };
  process.env.GROQ_API_KEY = 'server-groq-fixture';
  process.env.GEMINI_API_KEY = 'server-gemini-fixture';
  try {
    assert.deepEqual(resolveAiKeys('groq', 'custom-groq-fixture'), { groqKey: 'custom-groq-fixture', geminiKey: 'server-gemini-fixture' });
    assert.deepEqual(resolveAiKeys('gemini', 'custom-gemini-fixture'), { groqKey: 'server-groq-fixture', geminiKey: 'custom-gemini-fixture' });
    assert.deepEqual(resolveAiKeys('unknown', 'custom-fixture'), { groqKey: 'server-groq-fixture', geminiKey: 'server-gemini-fixture' });
  } finally {
    for (const [key, value] of [['GROQ_API_KEY', saved.groq], ['GEMINI_API_KEY', saved.gemini]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('free chat provider failure and malformed replies never become scripted praise or completion', async () => {
  const { POST } = require('../src/app/api/ai/chat/route.ts');
  const savedFetch = global.fetch;
  const savedGroq = process.env.GROQ_API_KEY;
  const savedGemini = process.env.GEMINI_API_KEY;
  process.env.GROQ_API_KEY = 'fake-chat-test-key';
  delete process.env.GEMINI_API_KEY;
  const body = {
    lessonNumber: 1, level: 'alef', userGender: 'male', scenarioTitle: 'Fixture', situation: 'Fixture',
    aiRole: 'Fixture', userRole: 'Fixture', goals: [], vocabulary: [],
    messages: [{ role: 'user', content: 'שלום' }, { role: 'user', content: 'תודה' }, { role: 'user', content: 'ביי' }],
    turnIndex: 3, targetTurns: 3,
  };
  try {
    for (const providerResponse of [new Response('', { status: 503 }), Response.json({ choices: [{ message: { content: '{}' } }] })]) {
      global.fetch = async () => providerResponse.clone();
      const response = await POST(new NextRequest('http://localhost/api/ai/chat', { method: 'POST', headers: { 'content-type': 'application/json', 'x-forwarded-for': 'test-chat-failures' }, body: JSON.stringify(body) }));
      assert.equal(response.status, 503);
      const result = await response.json();
      assert.equal(result.isCompleted, undefined);
      assert.equal(result.teacherReactionRu, undefined);
      assert.ok(result.error);
    }
  } finally {
    global.fetch = savedFetch;
    if (savedGroq === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = savedGroq;
    if (savedGemini === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = savedGemini;
  }
});
