const test = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
const { getPhoneLessonContract } = require('../src/data/phoneScenarios.ts');

const transcript = [
  { role: 'assistant', hebrew: 'שלום, זה נועם.' },
  { role: 'user', hebrew: 'שלום' },
  { role: 'assistant', hebrew: 'איך קוראים לך?' },
  { role: 'user', hebrew: 'קוראים לי דנה' },
  { role: 'assistant', hebrew: 'מה נשמע?' },
  { role: 'user', hebrew: 'הכל בסדר' },
];
function validReport() {
  const quotes = ['שלום', 'הכל בסדר', 'קוראים לי דנה'];
  return {
    overallScore: 95, grammarScore: 96, isSuccess: true, summaryRu: 'Вы познакомились с соседом.',
    goalChecks: getPhoneLessonContract(1).goals.map((_, goalIndex) => ({
      goalIndex, met: true, evidence: [{ role: 'user', quote: quotes[goalIndex] }],
    })),
    turnReviews: transcript.filter(t => t.role === 'user').map(t => ({
      userHebrew: t.hebrew, assessment: 'perfect', commentRu: 'Ответ понятен и соответствует вопросу.', grammarErrors: [],
    })),
    spokenTip: 'Сначала представьтесь.',
    recommendedWords: [{ hebrew: 'שָׁלוֹם', transcription: 'шалóм', translation: 'Здравствуйте' }],
  };
}

function isolatedDebrief(t) {
  const keys = ['NODE_ENV', 'JWT_SECRET', 'DATABASE_URL', 'POSTGRES_URL',
    'GEMINI_PRIMARY_API_KEY', 'GEMINI_AI_STUDIO_KEY', 'GEMINI_API_KEY', 'GEMINI_FALLBACK_API_KEY',
    'GROQ_API_KEY', 'GEMINI_MODEL', 'GEMINI_FALLBACK_MODEL', 'GROQ_MODEL', 'GROQ_FALLBACK_MODEL'];
  const savedEnv = new Map(keys.map(key => [key, Object.hasOwn(process.env, key) ? process.env[key] : undefined]));
  const fetchDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'fetch');
  const savedWarn = console.warn;
  const auth = require('../src/lib/auth.ts');
  const db = require('../src/lib/db.ts');
  const rates = require('../src/lib/rateLimit.ts');
  const saved = [[auth, 'verifySessionToken', auth.verifySessionToken], [db, 'getDbPool', db.getDbPool], [rates, 'checkRateLimit', rates.checkRateLimit]];
  t.after(() => {
    for (const [object, key, value] of saved) object[key] = value;
    console.warn = savedWarn;
    if (fetchDescriptor) Object.defineProperty(globalThis, 'fetch', fetchDescriptor);
    else delete globalThis.fetch;
    for (const [key, value] of savedEnv) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
  for (const key of keys) delete process.env[key];
  process.env.NODE_ENV = 'test';
  process.env.GEMINI_PRIMARY_API_KEY = 'synthetic-phone-debrief-key';
  process.env.GEMINI_MODEL = 'phone-debrief-test';
  auth.verifySessionToken = async () => ({ id: 'isolated-debrief-contract-test', subscriptionTier: 'pro' });
  db.getDbPool = () => null;
  rates.checkRateLimit = () => ({ allowed: true, remaining: 100, resetInSeconds: 0 });
  console.warn = () => {}; // Expected rejected mock reports; restored after every test.
  const calls = [];
  let result = validReport();
  globalThis.fetch = async (url, options) => {
    assert.equal(new URL(String(url)).hostname, 'generativelanguage.googleapis.com');
    calls.push(JSON.parse(options.body));
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: JSON.stringify(result) }] } }] }), { status: 200 });
  };
  const { POST } = require('../src/app/api/ai/phone/debrief/route.ts');
  return {
    calls,
    result(value) { result = value; },
    request(extra = {}) {
      return POST(new NextRequest('http://localhost/api/ai/phone/debrief', {
        method: 'POST', headers: { 'content-type': 'application/json', cookie: 'ulpana_session=synthetic-session' },
        body: JSON.stringify({ lessonNumber: 1, userGender: 'female', transcript, ...extra }),
      }));
    },
  };
}

test('debrief uses canonical server context and isolates transcript from native Gemini instructions', async (t) => {
  const env = isolatedDebrief(t);
  const tagged = transcript.map(turn => ({ ...turn }));
  tagged[0].hebrew += ' HISTORY_SENTINEL';
  const response = await env.request({
    callerRole: 'UNTRUSTED_ROLE', callerNameRu: 'UNTRUSTED_NAME', situationSummary: 'UNTRUSTED_SITUATION',
    studentObjective: 'UNTRUSTED_OBJECTIVE', goals: ['UNTRUSTED_GOAL'], completionCondition: 'UNTRUSTED_CRITERION',
    callType: 'outgoing', level: 'bet', transcript: tagged,
  });
  assert.equal(response.status, 200);
  assert.equal(env.calls.length, 1);
  const request = env.calls[0];
  const prompt = request.systemInstruction.parts[0].text;
  const contract = getPhoneLessonContract(1);
  for (const expected of [contract.callerRole, contract.studentObjective, contract.completionCondition, ...contract.goals]) assert.ok(prompt.includes(expected));
  assert.ok(prompt.includes('Входящий (собеседник звонил ученику)'));
  assert.equal(/UNTRUSTED_|HISTORY_SENTINEL/.test(prompt), false);
  assert.equal(request.contents[0].role, 'user');
  assert.ok(request.contents[0].parts[0].text.includes('HISTORY_SENTINEL'));
  for (const turn of tagged) assert.ok(request.contents[0].parts[0].text.includes(turn.hebrew));
});

test('missing per-goal assessment returns 503 rather than an invented successful report', async (t) => {
  const env = isolatedDebrief(t);
  const report = validReport();
  delete report.goalChecks;
  env.result(report);
  const response = await env.request();
  assert.equal(response.status, 503);
  assert.equal(Object.hasOwn(await response.json(), 'isSuccess'), false);
});

test('debrief normalizes content-style turns before prompting and checking evidence', async (t) => {
  const env = isolatedDebrief(t);
  const response = await env.request({ transcript: transcript.map(t => ({ role: t.role, content: t.hebrew })) });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).isSuccess, true);
  assert.ok(!env.calls[0].contents[0].parts[0].text.includes('undefined'));
});

test('a fabricated quote cannot substantiate a successful debrief', async (t) => {
  const env = isolatedDebrief(t);
  const report = validReport();
  report.goalChecks[0].evidence[0].quote = 'אני גר בירושלים';
  env.result(report);
  assert.equal((await env.request()).status, 503);
});

test('an unmet goal prevents success despite a 95-point model grade', async (t) => {
  const env = isolatedDebrief(t);
  const report = validReport();
  report.goalChecks[1] = { goalIndex: 1, met: false, evidence: [] };
  env.result(report);
  const response = await env.request();
  assert.equal(response.status, 200);
  const value = await response.json();
  assert.equal(value.overallScore, 95);
  assert.equal(value.isSuccess, false);
  assert.equal(value.goalChecks[1].met, false);
});

test('complete traceable evidence and complete turn reviews produce a valid positive report', async (t) => {
  const env = isolatedDebrief(t);
  const response = await env.request();
  assert.equal(response.status, 200);
  const value = await response.json();
  assert.equal(value.isSuccess, true);
  assert.equal(typeof value.overallScore, 'number');
  assert.equal(typeof value.grammarScore, 'number');
  assert.ok(value.summaryRu.length > 0);
  assert.equal(value.goalChecks.length, getPhoneLessonContract(1).goals.length);
  assert.deepEqual(value.turnReviews.map(r => r.userHebrew), transcript.filter(t => t.role === 'user').map(t => t.hebrew));
  for (const review of value.turnReviews) {
    assert.ok(['perfect', 'good', 'needs_improvement'].includes(review.assessment));
    assert.ok(review.commentRu.length > 0);
    assert.ok(Array.isArray(review.grammarErrors));
  }
  assert.equal(Object.hasOwn(value, 'pronunciationScore'), false);
  assert.equal(typeof value.recommendedWords[0].transcription, 'string');
});

test('a missing review for a distinct student turn is rejected, not fabricated', async (t) => {
  const env = isolatedDebrief(t);
  const report = validReport();
  report.turnReviews.pop();
  env.result(report);
  assert.equal((await env.request()).status, 503);
});

test('one review cannot be reused for multiple occurrences of the same student phrase', async (t) => {
  const env = isolatedDebrief(t);
  const repeated = [...transcript, { role: 'user', hebrew: 'שלום' }];
  assert.equal((await env.request({ transcript: repeated })).status, 503);
});

test('a missing assessment or explanatory comment is not replaced with a favorable invented review', async (t) => {
  const env = isolatedDebrief(t);
  for (const missing of ['assessment', 'commentRu']) {
    const report = validReport();
    delete report.turnReviews[0][missing];
    env.result(report);
    assert.equal((await env.request()).status, 503, missing);
  }
});
