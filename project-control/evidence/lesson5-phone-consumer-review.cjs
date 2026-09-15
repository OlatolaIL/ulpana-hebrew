const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const assert = require('node:assert/strict');
const root = path.resolve(process.argv[2]);
const output = path.resolve(process.argv[3]);
process.env.NODE_ENV = 'test';
delete process.env.DATABASE_URL;
delete process.env.POSTGRES_URL;
delete process.env.GROQ_API_KEY;
delete process.env.GEMINI_API_KEY;
delete process.env.GROQ_FALLBACK_MODEL;
process.env.JWT_SECRET = 'synthetic-phone-review-secret-with-at-least-32-bytes';
require(path.join(root, 'tests/register.cjs'));
const { NextRequest } = require(path.join(root, 'node_modules/next/server'));
const { createSessionToken } = require(path.join(root, 'src/lib/auth.ts'));
const { DETAILED_LESSONS } = require(path.join(root, 'src/data/lessonsData.ts'));
const { getLessonPhoneScenario } = require(path.join(root, 'src/data/phoneScenarios.ts'));
const { POST } = require(path.join(root, 'src/app/api/ai/phone/route.ts'));
let activeProvider;
const requests = [];
global.fetch = async (url, options) => {
  assert.ok(['api.groq.com', 'generativelanguage.googleapis.com'].includes(new URL(String(url)).hostname));
  const body = JSON.parse(options.body);
  requests.push(body);
  const text = JSON.stringify({ hebrew: 'בְּבַקָּשָׁה', transcription: 'бэвакашá', translation: 'Пожалуйста',
    suggestedReplies: [{ hebrew: 'תּוֹדָה', transcription: 'тодá', translation: 'Спасибо' }] });
  return new Response(JSON.stringify(activeProvider === 'groq'
    ? { choices: [{ message: { content: text } }] }
    : { candidates: [{ content: { parts: [{ text }] } }] }), { status: 200, headers: { 'content-type': 'application/json' } });
};
(async () => {
  const token = await createSessionToken({ id: 'synthetic-phone-consumer', name: 'Test', subscriptionTier: 'free' });
  const checks = [];
  for (const gender of ['male', 'female']) for (activeProvider of ['groq', 'gemini']) for (const turns of [1, 2]) {
    const scenario = getLessonPhoneScenario(DETAILED_LESSONS[5], gender);
    const res = await POST(new NextRequest('http://localhost/api/ai/phone', {
      method: 'POST', headers: { 'content-type': 'application/json', cookie: `ulpana_session=${token}` },
      body: JSON.stringify({ lessonNumber: 5, level: 'alef', userGender: gender, provider: activeProvider, apiKey: 'synthetic-key',
        messages: Array.from({ length: turns }, () => ({ role: 'user', content: 'אֲנִי רוֹצֶה לֶחֶם' })),
        callerRole: 'STALE_TAXI_ROLE', situationSummary: 'STALE_TAXI_SITUATION', systemPromptAddition: 'STALE_TAXI_PROMPT', targetTurns: 99 }) }));
    assert.equal(res.status, 200);
    const response = await res.json();
    const request = requests.at(-1);
    const prompt = activeProvider === 'groq' ? request.messages[0].content : request.contents[0].parts[0].text;
    assert.ok(prompt.includes(scenario.callerRole));
    assert.ok(prompt.includes(scenario.studentObjective));
    assert.ok(prompt.includes(scenario.systemPromptAddition));
    assert.ok(prompt.includes(`ТЕКУЩИЙ РАУНД: ${turns} из 2`));
    assert.ok(!prompt.includes('STALE_TAXI'));
    assert.ok(prompt.includes(gender === 'female' ? 'Женский (обращайся' : 'Мужской (обращайся'));
    assert.equal(response.isCompleted, turns === 2);
    assert.equal(response.shouldHangUp, turns === 2);
    assert.equal(response.suggestedReplies.length, turns === 2 ? 0 : 1);
    checks.push({ gender, provider: activeProvider, turns, status: res.status, canonicalScenarioUsed: true,
      staleClientIgnored: true, completed: response.isCompleted,
      scenarioUserRole: scenario.userRole,
      runtimeRoleLines: prompt.split('\n').filter(line => /СОБЕСЕДНИК \(УЧЕНИК\)|КТО ТВОЙ СОБЕСЕДНИК/.test(line)) });
  }
  const result = { recordedAt: new Date().toISOString(), commit: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    method: 'Actual phone POST, real server scenario; local synthetic JWT and provider data, all fetch intercepted, no database or network',
    limitations: 'No live conversation or audio assessment. Completion remains existing two-user-turn behavior, not proof of all learning objectives. User-role label is sourced from ordinary dialogue before phone scenario.', checks };
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result));
})().catch(error => { console.error(error); process.exitCode = 1; });
