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
process.env.JWT_SECRET = 'synthetic-local-runtime-review-secret-32-bytes';
require(path.join(root, 'tests/register.cjs'));
const { NextRequest } = require(path.join(root, 'node_modules/next/server'));
const { createSessionToken } = require(path.join(root, 'src/lib/auth.ts'));
const { cleanHebrewForSpeech } = require(path.join(root, 'src/lib/speech.ts'));
const source = { hebrew: 'וּגְבִינָה', transcription: 'у-гвинá', translation: 'и сыр' };
const calls = [];
let provider = '';
global.fetch = async (url, options) => {
  const endpoint = new URL(String(url));
  assert.ok(['api.groq.com', 'generativelanguage.googleapis.com'].includes(endpoint.hostname));
  const body = JSON.parse(options.body);
  calls.push({ provider, body });
  const content = { ...source, russian_translation: source.translation, cyrillic_transcription: source.transcription,
    suggestedReplies: [source, { hebrew: 'בְּבַקָּשָׁה', transcription: 'бэвакашá', translation: 'пожалуйста' }],
    isCompleted: false, shouldHangUp: false };
  return new Response(JSON.stringify(provider === 'groq'
    ? { choices: [{ message: { content: JSON.stringify(content) } }] }
    : { candidates: [{ content: { parts: [{ text: JSON.stringify(content) }] } }] }),
  { status: 200, headers: { 'content-type': 'application/json' } });
};
(async () => {
  const token = await createSessionToken({ id: 'synthetic-runtime-review', name: 'Test', subscriptionTier: 'free' });
  const result = { recordedAt: new Date().toISOString(),
    commit: cp.execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
    constraints: 'In-process actual routes; synthetic local JWT/provider data; global fetch intercepted; database env absent; no external network, paid AI or physical audio',
    source,
    speech: ['וּגְבִינָה', 'לֶחֶם וּגְבִינָה', 'וְסֵפֶר', 'וִילוֹן'].map(input => ({ input, output: cleanHebrewForSpeech(input) })),
    routes: [] };
  for (const route of ['phone', 'chat']) {
    const { POST } = require(path.join(root, `src/app/api/ai/${route}/route.ts`));
    for (provider of ['groq', 'gemini']) {
      const beforeCalls = calls.length;
      const res = await POST(new NextRequest(`http://localhost/api/ai/${route}`, {
        method: 'POST', headers: { 'content-type': 'application/json', cookie: `ulpana_session=${token}` },
        body: JSON.stringify({ lessonNumber: 5, level: 'alef', userGender: 'female', provider,
          apiKey: 'synthetic-provider-key', messages: [{ role: 'user', content: 'אֲנִי רוֹצָה לֶחֶם' }],
          scenarioTitle: 'Покупка продуктов', situation: 'В магазине', aiRole: 'Продавец', userRole: 'Покупательница',
          goals: ['Назвать продукты'], currentStepIndex: 0 }) }));
      const response = await res.json();
      assert.equal(res.status, 200, `${route}/${provider} status`);
      assert.equal(calls.length - beforeCalls, 1);
      const request = calls.at(-1).body;
      const prompt = provider === 'groq' ? request.messages.find(m => m.role === 'system').content : request.contents[0].parts[0].text;
      result.routes.push({ route, provider, status: res.status, response,
        forcedVeInstructions: prompt.split('\n').filter(line => /ВСЕГДА.*вэ-|ЗАПРЕЩЕНО.*у-|союзом "вэ-"/.test(line)),
        studentRoleLines: prompt.split('\n').filter(line => /СОБЕСЕДНИК \(УЧЕНИК\)|КТО ТВОЙ СОБЕСЕДНИК/.test(line)),
        prompt });
    }
  }
  fs.writeFileSync(output, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify({ commit: result.commit, speech: result.speech,
    routes: result.routes.map(r => ({ route: r.route, provider: r.provider, status: r.status,
      transcription: r.response.transcription, reply: r.response.suggestedReplies?.[0]?.transcription,
      forcedVeInstructions: r.forcedVeInstructions.length })), output }));
})().catch(e => { console.error(e); process.exitCode = 1; });
