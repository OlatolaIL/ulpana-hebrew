const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');

const ENV = [
  'NODE_ENV', 'JWT_SECRET', 'DATABASE_URL', 'POSTGRES_URL',
  'GEMINI_PRIMARY_API_KEY', 'GEMINI_AI_STUDIO_KEY', 'GEMINI_API_KEY', 'GEMINI_FALLBACK_API_KEY',
  'GROQ_API_KEY', 'GEMINI_MODEL', 'GEMINI_FALLBACK_MODEL', 'GROQ_MODEL', 'GROQ_FALLBACK_MODEL',
];
const answer = (hebrew = 'בסדר.', extra = {}) => ({
  hebrew, transcription: 'бэсэ́дэр.', translation: 'Хорошо.', questionForStudent: null,
  isCompleted: false, shouldHangUp: false, suggestedReplies: [], ...extra,
});

function isolatedRoute(t) {
  const savedEnv = new Map(ENV.map(key => [key, Object.hasOwn(process.env, key) ? process.env[key] : undefined]));
  const fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
  const auth = require('../src/lib/auth.ts');
  const db = require('../src/lib/db.ts');
  const rates = require('../src/lib/rateLimit.ts');
  const saved = [
    [auth, 'verifySessionToken', auth.verifySessionToken],
    [db, 'getDbPool', db.getDbPool],
    [rates, 'checkRateLimit', rates.checkRateLimit],
  ];
  t.after(() => {
    for (const [object, key, value] of saved) object[key] = value;
    if (fetchDescriptor) Object.defineProperty(globalThis, 'fetch', fetchDescriptor);
    else delete globalThis.fetch;
    for (const [key, value] of savedEnv) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  for (const key of ENV) delete process.env[key];
  process.env.NODE_ENV = 'test';
  process.env.GEMINI_MODEL = 'phone-contract-test';
  process.env.GROQ_MODEL = 'phone-contract-test';
  auth.verifySessionToken = async () => ({ id: 'isolated-phone-contract-test', subscriptionTier: 'pro' });
  db.getDbPool = () => null;
  rates.checkRateLimit = () => ({ allowed: true, remaining: 1000, resetInSeconds: 0 });
  const calls = [];
  let responder = () => answer();
  let fetchOverride = null;
  // Never forward to the original fetch: these tests cannot reach a real provider.
  globalThis.fetch = async (url, options) => {
    if (fetchOverride) return fetchOverride(url, options);
    const host = new URL(String(url)).hostname;
    assert.ok(['generativelanguage.googleapis.com', 'api.groq.com'].includes(host), 'Unexpected outbound host');
    const provider = host === 'api.groq.com' ? 'groq' : 'gemini';
    const body = JSON.parse(options.body);
    calls.push({ provider, body });
    const payload = JSON.stringify(responder(provider, body));
    return new Response(JSON.stringify(provider === 'gemini'
      ? { candidates: [{ content: { parts: [{ text: payload }] } }] }
      : { choices: [{ message: { content: payload } }] }), { status: 200 });
  };
  const { POST } = require('../src/app/api/ai/phone/route.ts');
  return {
    calls,
    respond(handler) { responder = handler; },
    overrideFetch(handler) { fetchOverride = handler; },
    keys(...providers) {
      delete process.env.GEMINI_PRIMARY_API_KEY;
      delete process.env.GROQ_API_KEY;
      if (providers.includes('gemini')) process.env.GEMINI_PRIMARY_API_KEY = 'synthetic-gemini-phone-contract-key';
      if (providers.includes('groq')) process.env.GROQ_API_KEY = 'synthetic-groq-phone-contract-key';
    },
    async request(body) {
      return POST(new NextRequest('http://localhost/api/ai/phone', {
        method: 'POST', headers: { 'content-type': 'application/json', cookie: 'ulpana_session=synthetic-session' },
        body: JSON.stringify(body),
      }));
    },
  };
}

test('400 mocked route requests use canonical contracts and cumulative vocabulary for every lesson, gender and provider', async (t) => {
  const env = isolatedRoute(t);
  const { getPhoneLessonContract, getLessonPhoneScenario } = require('../src/data/phoneScenarios.ts');
  const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');
  for (let lessonNumber = 1; lessonNumber <= 100; lessonNumber++) {
    const contract = getPhoneLessonContract(lessonNumber);
    for (const userGender of ['male', 'female']) {
      const scenario = getLessonPhoneScenario(DETAILED_LESSONS[lessonNumber], userGender);
      const messages = [
        { role: 'assistant', content: scenario.initialGreeting.hebrew },
        { role: 'user', content: 'שלום USER_HISTORY_SENTINEL' },
      ];
      for (const provider of ['gemini', 'groq']) {
        env.keys(provider);
        const before = env.calls.length;
        const response = await env.request({
          lessonNumber, userGender, provider, messages,
          callerRole: 'UNTRUSTED_ROLE_SENTINEL', userRole: 'UNTRUSTED_ROLE_SENTINEL',
          systemPromptAddition: 'UNTRUSTED_PROMPT_SENTINEL', vocabularyHints: ['UNTRUSTED_HINT_SENTINEL'],
          completionCondition: 'UNTRUSTED_CRITERION_SENTINEL', targetTurns: 1,
        });
        assert.equal(response.status, 200, `${lessonNumber}/${userGender}/${provider}`);
        assert.equal(env.calls.length, before + 1);
        assert.equal((await response.json()).shouldHangUp, false, 'Client turn limit must be ignored');
        const call = env.calls.at(-1);
        assert.equal(call.provider, provider);
        const prompt = provider === 'gemini' ? call.body.systemInstruction.parts[0].text : call.body.messages[0].content;
        assert.ok(prompt.includes(`роль: ${contract.callerRole};`));
        assert.ok(prompt.includes(`Ученик: ${contract.userRole};`));
        assert.ok(prompt.includes(contract.completionCondition));
        assert.ok(prompt.includes(`пол ученика: ${userGender === 'female' ? 'женский' : 'мужской'}`));
        for (const word of DETAILED_LESSONS[1].vocabulary) assert.ok(prompt.includes(word.hebrew), `Early vocabulary ${lessonNumber}`);
        for (const word of DETAILED_LESSONS[lessonNumber].vocabulary) assert.ok(prompt.includes(word.hebrew), `Current vocabulary ${lessonNumber}`);
        assert.equal(/UNTRUSTED_|USER_HISTORY_SENTINEL/.test(prompt), false);
        if (provider === 'gemini') {
          assert.deepEqual(call.body.contents, messages.map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })));
        } else {
          assert.equal(call.body.messages[0].role, 'system');
          assert.deepEqual(call.body.messages.slice(1), messages);
        }
      }
    }
  }
  assert.equal(env.calls.length, 400);
});

test('invalid landlord output is rejected before trying the other configured provider', async (t) => {
  const env = isolatedRoute(t);
  env.keys('gemini', 'groq');
  env.respond(provider => provider === 'gemini'
    ? answer('יש לך מקרר ומיטה?', { questionForStudent: 0 }) : answer('יש בדירה מקרר.'));
  const response = await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] });
  assert.equal(response.status, 200);
  assert.deepEqual(env.calls.map(c => c.provider), ['gemini', 'groq']);
  assert.equal((await response.json()).hebrew, 'יש בדירה מקרר.');
});

test('both providers rejecting the landlord contract returns an error, never a successful fallback fiction', async (t) => {
  const env = isolatedRoute(t);
  env.keys('gemini', 'groq');
  env.respond(() => answer('אני מחפש דירה.'));
  const response = await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] });
  assert.equal(response.status, 503);
  const value = await response.json();
  assert.equal(Object.hasOwn(value, 'isCompleted'), false);
  assert.equal(Object.hasOwn(value, 'hebrew'), false);
});

test('no configured keys returns 503 without any provider request', async (t) => {
  const env = isolatedRoute(t);
  env.keys();
  const response = await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] });
  assert.equal(response.status, 503);
  assert.equal(env.calls.length, 0);
});

test('both provider paths reject questions at the final turn and accept a question-free closing', async (t) => {
  const env = isolatedRoute(t);
  const { getPhoneLessonContract } = require('../src/data/phoneScenarios.ts');
  const messages = Array.from({ length: getPhoneLessonContract(7).targetTurns }, () => ({ role: 'user', content: 'שלום' }));
  for (const provider of ['gemini', 'groq']) {
    env.keys(provider);
    env.respond(() => answer('כמה חדרים אתה צריך', { questionForStudent: 0, isCompleted: true, shouldHangUp: true }));
    assert.equal((await env.request({ lessonNumber: 7, provider, messages })).status, 503);
    env.respond(() => answer('תודה, להתראות.', { isCompleted: true, shouldHangUp: true }));
    const response = await env.request({ lessonNumber: 7, provider, messages });
    assert.equal(response.status, 200);
    const value = await response.json();
    assert.equal(value.shouldHangUp, true);
    assert.equal(value.endReason, 'turn_limit');
    assert.equal(Object.hasOwn(value, 'taskAchieved'), false);
  }
});

test('Gemini timeout immediately triggers Groq fallback and delivers response within budget', async (t) => {
  const env = isolatedRoute(t);
  env.keys('gemini', 'groq');
  env.overrideFetch(async (url) => {
    const host = new URL(String(url)).hostname;
    if (host === 'generativelanguage.googleapis.com') {
      const err = new Error('The operation was aborted');
      err.name = 'AbortError';
      throw err;
    }
    if (host === 'api.groq.com') {
      const payload = JSON.stringify(answer('בסדר גמור, אני מבין.'));
      return new Response(JSON.stringify({ choices: [{ message: { content: payload } }] }), { status: 200 });
    }
    throw new Error('Unexpected host');
  });

  const response = await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.hebrew, 'בסדר גמור, אני מבין.');
  assert.ok(data.engine.includes('Groq'));
});

test('both providers failing returns 503 with safe sanitized diagnostic attempts and zero leaked secrets', async (t) => {
  const env = isolatedRoute(t);
  env.keys('gemini', 'groq');
  env.overrideFetch(async (url) => {
    const host = new URL(String(url)).hostname;
    if (host === 'generativelanguage.googleapis.com') {
      return new Response(JSON.stringify({ error: 'Service Unavailable' }), { status: 503 });
    }
    if (host === 'api.groq.com') {
      return new Response(JSON.stringify({ error: 'Upstream Rate Limit' }), { status: 429 });
    }
    throw new Error('Unexpected host');
  });

  const response = await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] });
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.equal(data.code, 'provider_rate_limit');
  assert.equal(data.retryable, true);
  assert.ok(data.details && Array.isArray(data.details.attempts));
  assert.equal(data.details.attempts.length, 3);

  const [geminiAttempt, groqPrimaryAttempt, groqFallbackAttempt] = data.details.attempts;
  assert.equal(geminiAttempt.provider, 'gemini');
  assert.equal(geminiAttempt.status, 503);
  assert.equal(geminiAttempt.category, 'provider_unavailable');
  assert.equal(typeof geminiAttempt.durationMs, 'number');

  assert.equal(groqPrimaryAttempt.provider, 'groq');
  assert.equal(groqPrimaryAttempt.status, 429);
  assert.equal(groqPrimaryAttempt.category, 'provider_rate_limit');
  assert.equal(typeof groqPrimaryAttempt.durationMs, 'number');

  assert.equal(groqFallbackAttempt.provider, 'groq');
  assert.equal(groqFallbackAttempt.model, 'openai/gpt-oss-20b');
  assert.equal(groqFallbackAttempt.status, 429);
  assert.equal(groqFallbackAttempt.category, 'provider_rate_limit');
  assert.equal(typeof groqFallbackAttempt.durationMs, 'number');

  // Verify zero secrets leaked in error response body
  const bodyText = JSON.stringify(data);
  assert.ok(!bodyText.includes('key'));
  assert.ok(!bodyText.includes('synthetic'));
  assert.ok(!bodyText.includes('Bearer'));
  assert.ok(!bodyText.includes('authorization'));
});

test('no configured keys returns 503 with auth_config diagnostics in attempts', async (t) => {
  const env = isolatedRoute(t);
  env.keys();
  const response = await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] });
  assert.equal(response.status, 503);
  const data = await response.json();
  assert.ok(data.details && Array.isArray(data.details.attempts));
  assert.deepEqual(data.details.attempts.map(a => ({ provider: a.provider, category: a.category })), [
    { provider: 'gemini', category: 'auth_config' },
    { provider: 'groq', category: 'auth_config' },
  ]);
});

