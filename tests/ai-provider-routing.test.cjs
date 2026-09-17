const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { resolveAiKeys } = require('../src/lib/aiModels.ts');

test('a custom provider key is never routed to a different provider', () => {
  const saved = {
    groq: process.env.GROQ_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
    primaryGemini: process.env.GEMINI_PRIMARY_API_KEY,
  };
  delete process.env.GEMINI_PRIMARY_API_KEY;
  process.env.GROQ_API_KEY = 'server-groq-fixture';
  process.env.GEMINI_API_KEY = 'server-gemini-fixture';
  try {
    assert.deepEqual(resolveAiKeys('groq', 'custom-groq-fixture'), {
      groqKey: 'custom-groq-fixture',
      geminiKey: 'server-gemini-fixture',
      geminiFallbackKey: '',
      geminiKeys: ['server-gemini-fixture'],
    });
    assert.deepEqual(resolveAiKeys('gemini', 'custom-gemini-fixture'), {
      groqKey: 'server-groq-fixture',
      geminiKey: 'custom-gemini-fixture',
      geminiFallbackKey: '',
      geminiKeys: ['custom-gemini-fixture'],
    });
    assert.deepEqual(resolveAiKeys('unknown', 'custom-fixture'), {
      groqKey: 'server-groq-fixture',
      geminiKey: 'server-gemini-fixture',
      geminiFallbackKey: '',
      geminiKeys: ['server-gemini-fixture'],
    });
  } finally {
    for (const [key, value] of [['GROQ_API_KEY', saved.groq], ['GEMINI_API_KEY', saved.gemini], ['GEMINI_PRIMARY_API_KEY', saved.primaryGemini]]) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('GEMINI_PRIMARY_API_KEY takes precedence over GEMINI_API_KEY with dual-key fallback list', () => {
  const saved = {
    primary: process.env.GEMINI_PRIMARY_API_KEY,
    backup: process.env.GEMINI_API_KEY,
  };
  process.env.GEMINI_PRIMARY_API_KEY = 'primary-ai-studio-key';
  process.env.GEMINI_API_KEY = 'backup-google-cloud-key';
  try {
    const resolved = resolveAiKeys('gemini');
    assert.equal(resolved.geminiKey, 'primary-ai-studio-key');
    assert.equal(resolved.geminiFallbackKey, 'backup-google-cloud-key');
    assert.deepEqual(resolved.geminiKeys, ['primary-ai-studio-key', 'backup-google-cloud-key']);
  } finally {
    if (saved.primary === undefined) delete process.env.GEMINI_PRIMARY_API_KEY; else process.env.GEMINI_PRIMARY_API_KEY = saved.primary;
    if (saved.backup === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = saved.backup;
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

test('R-21: Gemini (GEMINI_PRIMARY_API_KEY) is called first; Groq acts as fallback insurance on Gemini failure', async () => {
  const { POST } = require('../src/app/api/ai/dialogue/evaluate/route.ts');
  const savedFetch = global.fetch;
  const savedPrimary = process.env.GEMINI_PRIMARY_API_KEY;
  const savedGroq = process.env.GROQ_API_KEY;
  const savedBackup = process.env.GEMINI_API_KEY;

  process.env.GEMINI_PRIMARY_API_KEY = 'test-gemini-primary-key';
  process.env.GROQ_API_KEY = 'test-groq-insurance-key';
  delete process.env.GEMINI_API_KEY;

  const sampleBody = {
    userSpokenHebrew: 'אני רוצה בבקשה תה חם',
    targetIntentRu: 'Можно кофе, пожалуйста?',
    referenceHebrew: 'אֶפְשָׁר קָפֶה בְּבַקָּשָׁה?',
    acceptableKeywords: ['קפה'],
    sampleVariations: ['קפה בבקשה'],
    lessonNumber: 1,
    level: 'alef',
  };

  try {
    // 1. Успешный ответ Gemini: Groq не должен вызываться вообще
    const callsSuccess = [];
    global.fetch = async (url, opts) => {
      callsSuccess.push({ url: String(url), opts });
      if (String(url).includes('googleapis.com')) {
        return new Response(JSON.stringify({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  isCorrect: true,
                  score: 95,
                  assessment: 'perfect',
                  feedbackRu: 'Отлично сказано!',
                  betterAlternative: 'שָׁלוֹם, מָה נִשְׁמַע?',
                }),
              }],
            },
          }],
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response('{}', { status: 200 });
    };

    const res1 = await POST(new NextRequest('http://localhost/api/ai/dialogue/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': 'test-gemini-first' },
      body: JSON.stringify(sampleBody),
    }));

    assert.equal(res1.status, 200);
    const data1 = await res1.json();
    assert.equal(data1.isCorrect, true);
    assert.equal(callsSuccess.length, 1);
    assert.ok(callsSuccess[0].url.includes('googleapis.com'), 'Первый вызов обязан идти в Google Gemini API');
    const headerKey = callsSuccess[0].opts?.headers?.get?.('x-goog-api-key') || callsSuccess[0].opts?.headers?.['x-goog-api-key'];
    assert.ok(headerKey === 'test-gemini-primary-key' || callsSuccess[0].url.includes('test-gemini-primary-key'), 'Используется GEMINI_PRIMARY_API_KEY');

    // 2. Сбой Gemini (500/таймаут): Groq должен вызваться как страховка (fallback insurance)
    const callsFallback = [];
    global.fetch = async (url, opts) => {
      callsFallback.push({ url: String(url), opts });
      if (String(url).includes('googleapis.com')) {
        return new Response('Internal Server Error', { status: 500 });
      }
      if (String(url).includes('api.groq.com')) {
        return new Response(JSON.stringify({
          choices: [{
            message: {
              content: JSON.stringify({
                isCorrect: true,
                score: 90,
                assessment: 'good',
                feedbackRu: 'Хороший ответ (Groq страховка)!',
                betterAlternative: 'שָׁלוֹם, מָה נִשְׁמַע?',
              }),
            },
          }],
        }), { status: 200, headers: { 'content-type': 'application/json' } });
      }
      return new Response('Not found', { status: 404 });
    };

    const res2 = await POST(new NextRequest('http://localhost/api/ai/dialogue/evaluate', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-forwarded-for': 'test-gemini-fallback' },
      body: JSON.stringify(sampleBody),
    }));

    assert.equal(res2.status, 200);
    const data2 = await res2.json();
    assert.equal(data2.isCorrect, true);
    assert.equal(callsFallback.length, 2);
    assert.ok(callsFallback[0].url.includes('googleapis.com'), 'Первый вызов шел в Gemini');
    assert.ok(callsFallback[1].url.includes('api.groq.com'), 'Второй вызов пошел в Groq как страховка');
  } finally {
    global.fetch = savedFetch;
    if (savedPrimary === undefined) delete process.env.GEMINI_PRIMARY_API_KEY; else process.env.GEMINI_PRIMARY_API_KEY = savedPrimary;
    if (savedGroq === undefined) delete process.env.GROQ_API_KEY; else process.env.GROQ_API_KEY = savedGroq;
    if (savedBackup === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = savedBackup;
  }
});

