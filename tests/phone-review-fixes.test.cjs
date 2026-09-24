// Read-only verification of the actual application; transports and credentials are synthetic.
const fs = require('node:fs');
const Module = require('node:module');
const test = require('node:test');
const assert = require('node:assert/strict');
const root = require('node:path').resolve(__dirname, '..');
require(root + '/tests/register.cjs');
function harness(name, exports) {
  const filename = root + '/tests/' + name;
  const source = fs.readFileSync(filename, 'utf8').split('\ntest(')[0];
  const m = new Module(filename, module);
  m.filename = filename;
  m.paths = Module._nodeModulePaths(root + '/tests');
  m._compile(source + '\nmodule.exports={' + exports + '};', filename);
  return m.exports;
}
const { isolatedDebrief } = harness('phone-debrief-contracts.test.cjs', 'isolatedDebrief');
const { isolatedRoute, answer } = harness('phone-provider-contracts.test.cjs', 'isolatedRoute,answer');
const greeting = 'שָׁלוֹם, זוֹ רוּת. יֵשׁ לָנוּ פַּח כָּתוֹם וּפַח כָּחוֹל בֶּחָצֵר.';
const question = 'שלום רות, אני חדשה בבניין, יש לי עיתונים ישנים, לאיזה פח זורקים נייר?';
function report(transcript, evidence, summary = 'Вы узнали, куда отнести бумагу.') {
  return {
    overallScore: 95, grammarScore: 95, isSuccess: false, summaryRu: summary,
    goalChecks: [
      { goalIndex: 0, met: false, evidence: [] },
      { goalIndex: 1, met: true, evidence },
      { goalIndex: 2, met: false, evidence: [] },
    ],
    turnReviews: transcript.filter(t => t.role === 'user').map(t => ({
      userHebrew: t.hebrew, assessment: 'perfect', commentRu: summary, grammarErrors: [],
    })),
  };
}
const rows = [];

test('unanswered goal: ordinary learned-answer wording must not survive in summary/review', async t => {
  const env = isolatedDebrief(t);
  const transcript = [{ role: 'assistant', hebrew: greeting }, { role: 'user', hebrew: question }];
  env.result(report(transcript, [{ role: 'user', quote: question }]));
  const response = await env.request({ lessonNumber: 78, transcript });
  const body = await response.json();
  rows.push({ case: 'unanswered-paraphrase', status: response.status, body });
  assert.equal(response.status, 200);
  assert.equal(body.goalChecks[1].met, false);
  assert.doesNotMatch(body.summaryRu + body.turnReviews[0].commentRu, /узнали/iu);
});
test('irrelevant assistant greeting plus nonanswer must not prove paper destination', async t => {
  const env = isolatedDebrief(t);
  const transcript = [{ role: 'assistant', hebrew: greeting }, { role: 'user', hebrew: question }, { role: 'assistant', hebrew: 'רגע, בבקשה.' }];
  env.result(report(transcript, [{ role: 'user', quote: question }, { role: 'assistant', quote: greeting }]));
  const response = await env.request({ lessonNumber: 78, transcript });
  const body = await response.json();
  rows.push({ case: 'irrelevant-greeting', status: response.status, body });
  assert.equal(response.status, 200);
  assert.equal(body.goalChecks[1].met, false);
});
test('assistant reply before the relevant question must not count as answer to that question', async t => {
  const env = isolatedDebrief(t);
  const transcript = [{ role: 'assistant', hebrew: greeting }, { role: 'user', hebrew: 'שלום רות' }, { role: 'assistant', hebrew: 'שלום, מה שלומך?' }, { role: 'user', hebrew: question }];
  env.result(report(transcript, [{ role: 'user', quote: question }, { role: 'assistant', quote: 'שלום, מה שלומך?' }]));
  const response = await env.request({ lessonNumber: 78, transcript });
  const body = await response.json();
  rows.push({ case: 'wrong-turn-order', status: response.status, body });
  assert.equal(response.status, 200);
  assert.equal(body.goalChecks[1].met, false);
});
test('HTTP 504 provider_timeout must switch straight to Groq like timeout exception', async t => {
  const env = isolatedRoute(t);
  env.keys('gemini', 'groq');
  process.env.GEMINI_API_KEY = 'synthetic-backup';
  process.env.GEMINI_FALLBACK_MODEL = 'synthetic-second-model';
  const calls = [];
  env.overrideFetch(async url => {
    const provider = new URL(String(url)).hostname === 'api.groq.com' ? 'groq' : 'gemini';
    calls.push(provider);
    return provider === 'gemini' ? new Response('{}', { status: 504 }) : new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(answer()) } }] }), { status: 200 });
  });
  const response = await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] });
  rows.push({ case: 'http504-fast-fallback', status: response.status, calls });
  assert.equal(response.status, 200);
  assert.deepEqual(calls, ['gemini', 'groq']);
});
test('invalid JSON diagnostics must distinguish parser failure from provider unavailable', async t => {
  const env = isolatedRoute(t);
  env.keys('gemini', 'groq');
  env.overrideFetch(async () => new Response('invalid json', { status: 200 }));
  const response = await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] });
  const body = await response.json();
  rows.push({ case: 'invalid-json-diagnostics', status: response.status, body });
  assert.equal(response.status, 503);
  assert.ok(body.details.attempts.every(a => a.category === 'malformed_json' && a.status === 200));
});

const { validatePhoneGoalEvidence } = require('../src/lib/phoneGoalEvidence.ts');
const { getPhoneLessonContract } = require('../src/data/phoneScenarios.ts');
const rules = { 0: getPhoneLessonContract(78).informationEvidence[1] };
function paperGoal(transcript, evidence) {
  return validatePhoneGoalEvidence([{ goalIndex: 0, met: true, evidence }],
    ['Узнать, куда отнести бумагу'], transcript, rules)[0].met;
}
const q = { role: 'user', hebrew: 'לאיזה פח זורקים נייר?' };
const fact = 'נְיָיר זוֹרְקִים לַפַּח הַכָּחוֹל.';
for (const [name, transcript, quote, expected] of [
  ['full answer', [q, { role: 'assistant', hebrew: fact }], fact, true],
  ['fact in greeting', [{ role: 'assistant', hebrew: 'שלום. ' + fact }, q], fact, true],
  ['short answer to this question', [q, { role: 'assistant', hebrew: 'לפח הכחול.' }], 'לפח הכחול.', true],
  ['short answer before question', [{ role: 'assistant', hebrew: 'לפח הכחול.' }, q], 'לפח הכחול.', false],
  ['unrelated answer after question', [q, { role: 'assistant', hebrew: 'הפח הכתום לאריזות.' }], 'הפח הכתום לאריזות.', false],
  ['paper mentioned without destination', [q, { role: 'assistant', hebrew: 'יש נייר בחצר.' }], 'יש נייר בחצר.', false],
  ['wrong destination', [q, { role: 'assistant', hebrew: 'נייר לפח הכתום.' }], 'נייר לפח הכתום.', false],
  ['negation omitted from quote', [q, { role: 'assistant', hebrew: 'לא שמים נייר בפח הכחול.' }], 'שמים נייר בפח הכחול.', false],
  ['question omitted from quote', [q, { role: 'assistant', hebrew: 'נייר לפח הכחול?' }], 'נייר לפח הכחול', false],
  ['different intervening question', [q, { role: 'user', hebrew: 'ואיפה הפלסטיק?' }, { role: 'assistant', hebrew: 'לפח הכחול.' }], 'לפח הכחול.', false],
]) {
  test('paper evidence: ' + name, () => {
    assert.equal(paperGoal(transcript, [{ role: 'user', quote: q.hebrew }, { role: 'assistant', quote }]), expected);
  });
}
test('repeated questions require the quoted turn index; wrong index is rejected', () => {
  const transcript = [q, { role: 'assistant', hebrew: 'רגע.' }, q, { role: 'assistant', hebrew: 'לפח הכחול.' }];
  const assistant = { role: 'assistant', quote: 'לפח הכחול.' };
  assert.equal(paperGoal(transcript, [{ role: 'user', quote: q.hebrew }, assistant]), false);
  assert.equal(paperGoal(transcript, [{ role: 'user', quote: q.hebrew, turnIndex: 2 }, assistant]), true);
  assert.equal(paperGoal(transcript, [{ role: 'user', quote: q.hebrew, turnIndex: 0 }, assistant]), false);
  assert.throws(() => paperGoal(transcript, [{ role: 'user', quote: q.hebrew, turnIndex: 1 }, assistant]), /evidence turn/);
});
for (const status of [408, 504]) {
  test('HTTP timeout switches immediately with multiple keys/models: ' + status, async t => {
    const env = isolatedRoute(t); env.keys('gemini', 'groq');
    process.env.GEMINI_API_KEY = 'synthetic-backup';
    process.env.GEMINI_FALLBACK_MODEL = 'synthetic-second-model';
    const calls = [];
    env.overrideFetch(async url => {
      const provider = new URL(String(url)).hostname === 'api.groq.com' ? 'groq' : 'gemini'; calls.push(provider);
      return provider === 'gemini' ? new Response('{}', { status }) : new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify(answer()) } }] }));
    });
    assert.equal((await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] })).status, 200);
    assert.deepEqual(calls, ['gemini', 'groq']);
  });
}
for (const [name, transport, category, phase, status] of [
  ['transport', async () => { throw new Error('secret-transport-body'); }, 'provider_unavailable', 'transport', undefined],
  ['timeout', async () => { const e = new Error('secret'); e.name = 'TimeoutError'; throw e; }, 'provider_timeout', 'transport', undefined],
  ['http', async () => new Response('secret-http-body', { status: 502 }), 'provider_unavailable', 'http', 502],
  ['outer JSON', async () => new Response('secret-invalid-json'), 'malformed_json', 'parse', 200],
  ['missing content', async () => new Response('null'), 'validation_rejected', 'validation', 200],
  ['inner JSON', async url => new Response(JSON.stringify(String(url).includes('groq.com') ? { choices: [{ message: { content: 'secret-invalid-json' } }] } : { candidates: [{ content: { parts: [{ text: 'secret-invalid-json' }] } }] })), 'malformed_json', 'parse', 200],
  ['reply schema', async url => new Response(JSON.stringify(String(url).includes('groq.com') ? { choices: [{ message: { content: '{}' } }] } : { candidates: [{ content: { parts: [{ text: '{}' }] } }] })), 'validation_rejected', 'validation', 200],
]) {
  test('safe diagnostics: ' + name, async t => {
    const env = isolatedRoute(t); env.keys('gemini', 'groq'); env.overrideFetch(transport);
    const response = await env.request({ lessonNumber: 7, messages: [{ role: 'user', content: 'שלום' }] });
    const body = await response.json(); assert.equal(response.status, 503);
    assert.ok(body.details.attempts.length > 0);
    for (const attempt of body.details.attempts) {
      assert.equal(attempt.category, category); assert.equal(attempt.phase, phase); assert.equal(attempt.status, status);
    }
    assert.doesNotMatch(JSON.stringify(body), /secret/);
  });
}

for (const praise of ['Вы узнали, куда отнести бумагу.', 'Теперь вы точно знаете место для бумаги.', 'Все задачи блестяще решены.']) {
  test('unmet goals cannot regain free-form success prose: ' + praise, async t => {
    const env = isolatedDebrief(t);
    const transcript = [{ role: 'assistant', hebrew: greeting }, { role: 'user', hebrew: question }];
    const raw = report(transcript, [{ role: 'user', quote: question }], praise);
    raw.spokenTip = praise;
    env.result(raw);
    const response = await env.request({ lessonNumber: 78, transcript });
    const body = await response.json(); assert.equal(response.status, 200);
    assert.ok(body.summaryRu.includes('Не подтверждено'));
    assert.ok(!body.summaryRu.includes(praise)); assert.ok(!body.turnReviews[0].commentRu.includes(praise));
    assert.equal(body.spokenTip, undefined); assert.equal(body.isSuccess, false);
  });
}
test('mixed goals preserve the completed action and incomplete information separately', async t => {
  const env = isolatedDebrief(t);
  const transcript = [{ role: 'user', hebrew: question }];
  const raw = report(transcript, [{ role: 'user', quote: question }]);
  raw.goalChecks[0] = { goalIndex: 0, met: true, evidence: [{ role: 'user', quote: question }] };
  raw.turnReviews[0].commentRu = 'Прекрасный, вежливый и абсолютно естественный вопрос. Вы узнали всё.';
  env.result(raw);
  const response = await env.request({ lessonNumber: 78, transcript });
  const body = await response.json(); assert.equal(response.status, 200);
  assert.equal(body.goalChecks[0].met, true); assert.equal(body.goalChecks[1].met, false);
  assert.match(body.summaryRu, /Подтверждено: «Уточнить/); assert.match(body.summaryRu, /Не подтверждено: «Узнать/);
  assert.equal(body.turnReviews[0].commentRu, 'Прекрасный, вежливый и абсолютно естественный вопрос.');
});
