const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { NextRequest } = require('next/server');

// This suite is deliberately restricted to a disposable, loopback-only database.
const url = process.env.TEST_DATABASE_URL;
if (!url) throw new Error('Set TEST_DATABASE_URL for the isolated database suite');
const target = new URL(url);
if (target.hostname !== '127.0.0.1' || target.port !== '55433' || target.pathname !== '/ulpana_beta_test') {
  throw new Error('Refusing to run integration fixtures outside the isolated beta test database');
}
process.env.DATABASE_URL = url;
process.env.JWT_SECRET = crypto.randomBytes(48).toString('hex');
const { initDatabase, getDbPool } = require('../src/lib/db.ts');
const { createSessionToken } = require('../src/lib/auth.ts');
const sync = require('../src/app/api/user/sync/route.ts');
const idA = `test-a-${crypto.randomUUID()}`;
const idB = `test-b-${crypto.randomUUID()}`;
const idC = `test-c-${crypto.randomUUID()}`;
const telegramId = crypto.randomInt(900000000, 999999999);
process.env.TELEGRAM_BOT_TOKEN = 'test-only-telegram-bot-secret';
const signedTelegram = id => {
  const payload = { id, first_name: 'Synthetic Student', auth_date: Math.floor(Date.now() / 1000) };
  const text = Object.keys(payload).sort().map(key => `${key}=${payload[key]}`).join('\n');
  return { ...payload, hash: crypto.createHmac('sha256', crypto.createHash('sha256').update(process.env.TELEGRAM_BOT_TOKEN).digest()).update(text).digest('hex') };
};
const telegramRequest = (path, token, data) => new NextRequest(`http://localhost${path}`, {
  method: 'POST', headers: { cookie: `ulpana_session=${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(data),
});
let db, tokenA, tokenB;
const tokenHashes = [];
const snapshot = (id, revision, lessonProgress = {}, personalVocabulary = []) => ({
  expectedUserId: id, expectedRevision: revision, lessonProgress, personalVocabulary,
  flashcardStats: {}, gender: 'male', fontStyle: 'print',
});
const post = (token, body) => sync.POST(new NextRequest('http://localhost/api/user/sync', {
  method: 'POST', headers: { cookie: `ulpana_session=${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}));
const get = async token => (await sync.GET(new NextRequest('http://localhost/api/user/sync', {
  headers: { cookie: `ulpana_session=${token}` },
}))).json();

before(async () => {
  await initDatabase();
  db = getDbPool();
  await db.query('INSERT INTO ulpana_users(id, name) VALUES ($1, $2), ($3, $4)', [idA, 'Test A', idB, 'Test B']);
  await db.query('INSERT INTO ulpana_users(id, name) VALUES ($1, $2)', [idC, 'Test C']);
  tokenA = await createSessionToken({ id: idA, name: 'Test A', subscriptionTier: 'free' });
  tokenB = await createSessionToken({ id: idB, name: 'Test B', subscriptionTier: 'free' });
});
after(async () => {
  if (db) {
    await db.query('DELETE FROM ulpana_users WHERE id = ANY($1::text[])', [[idA, idB, idC]]);
    await db.query('DELETE FROM ulpana_audio_recordings WHERE user_id = ANY($1::text[])', [[idA, idB, idC]]);
    await db.query('DELETE FROM ulpana_call_logs WHERE user_id = ANY($1::text[])', [[idA, idB, idC]]);
    await db.query('DELETE FROM ulpana_essays WHERE user_id = ANY($1::text[])', [[idA, idB, idC]]);
    await db.query('DELETE FROM ulpana_auth_tokens WHERE token = ANY($1::text[])', [tokenHashes]);
    await db.query('DELETE FROM ulpana_ai_usage');
    await db.end();
  }
});

test('real database saves a profile atomically and keeps accounts isolated', async () => {
  const progress = { 1: { completedTabs: ['theory'], isCompleted: false, score: 0, lastVisited: Date.now() } };
  const word = { id: 'local-word', hebrew: 'שָׁלוֹם', hebrewPlain: 'שלום', translation: 'привет', transcription: 'шалом', partOfSpeech: 'expression', lessonId: 1 };
  assert.equal((await post(tokenA, snapshot(idA, 0, progress, [word]))).status, 200);
  const saved = await get(tokenA);
  assert.equal(saved.revision, 1);
  assert.equal(saved.userId, idA);
  assert.deepEqual(saved.lessonProgress[1].completedTabs, ['theory']);
  assert.equal(saved.personalVocabulary.length, 1);
  assert.deepEqual((await get(tokenB)).personalVocabulary, []);
  assert.equal((await post(tokenA, snapshot(idB, 0))).status, 409);
  assert.equal((await get(tokenB)).revision, 0);
});

test('simultaneous saves from one revision allow exactly one winner', async () => {
  const results = await Promise.all([
    post(tokenB, { ...snapshot(idB, 0), gender: 'male' }),
    post(tokenB, { ...snapshot(idB, 0), gender: 'female' }),
  ]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal((await get(tokenB)).revision, 1);
});

test('invalid lesson data rolls back settings and does not advance the revision', async () => {
  const beforeRow = (await db.query('SELECT gender, sync_revision FROM ulpana_users WHERE id = $1', [idA])).rows[0];
  const response = await post(tokenA, { ...snapshot(idA, 1, { 1000: { completedTabs: ['theory'] } }), gender: 'female' });
  assert.equal(response.status, 400);
  const afterRow = (await db.query('SELECT gender, sync_revision FROM ulpana_users WHERE id = $1', [idA])).rows[0];
  assert.deepEqual(afterRow, beforeRow);
  assert.deepEqual((await get(tokenA)).lessonProgress[1].completedTabs, ['theory']);
});

test('deletions propagate while stale snapshots cannot resurrect removed data', async () => {
  assert.equal((await post(tokenA, snapshot(idA, 1))).status, 200);
  const saved = await get(tokenA);
  assert.equal(saved.revision, 2);
  assert.deepEqual(saved.lessonProgress, {});
  assert.deepEqual(saved.personalVocabulary, []);
  assert.equal((await post(tokenA, snapshot(idA, 1, { 1: { completedTabs: ['theory'], isCompleted: false, lastVisited: Date.now() } }))).status, 409);
  assert.deepEqual((await get(tokenA)).lessonProgress, {});
  assert.equal((await get(tokenB)).revision, 1);
});

test('one-time login is atomic across concurrent consumers, enforces expiry and purpose', async () => {
  const login = require('../src/lib/loginTokens.ts');
  const remember = raw => { tokenHashes.push(login.hashLoginToken(raw)); return raw; };
  const data = { purpose: 'magic_link', id: idA, name: 'Test A' };
  const raw = remember(await login.createMagicLinkSession(db, data));
  const issued = (await db.query('SELECT token FROM ulpana_auth_tokens WHERE token = $1', [login.hashLoginToken(raw)])).rows[0];
  assert.notEqual(issued.token, raw);
  const attempts = await Promise.all(Array.from({ length: 12 }, () => login.consumeMagicLinkSession(db, raw)));
  assert.equal(attempts.filter(Boolean).length, 1);
  assert.equal(attempts.find(Boolean).id, idA);
  const poll = remember(await login.createPollingSession(db));
  assert.equal((await login.consumePollingSession(db, poll)).status, 'pending');
  assert.equal(await login.consumeMagicLinkSession(db, poll), null);
  assert.equal(await login.confirmPollingSession(db, poll, data), true);
  assert.equal(await login.confirmPollingSession(db, poll, { ...data, id: idB }), false);
  const polls = await Promise.all(Array.from({ length: 12 }, () => login.consumePollingSession(db, poll)));
  assert.equal(polls.filter(r => r.completed).length, 1);
  assert.equal(polls.find(r => r.completed).userData.id, idA);
  const expired = remember(await login.createMagicLinkSession(db, data));
  await db.query("UPDATE ulpana_auth_tokens SET expires_at = NOW() - INTERVAL '1 second' WHERE token = $1", [login.hashLoginToken(expired)]);
  assert.equal(await login.consumeMagicLinkSession(db, expired), null);
  const wrongPurpose = remember(await login.createPollingSession(db));
  await db.query("UPDATE ulpana_auth_tokens SET user_data = '{\"purpose\":\"magic_link\"}' WHERE token = $1", [login.hashLoginToken(wrongPurpose)]);
  assert.equal(await login.confirmPollingSession(db, wrongPurpose, data), false);
});

test('database AI budgets enforce a shared cap under concurrency and roll back failed reservations', async () => {
  const { consumeAiBudget, AiBudgetExceeded } = require('../src/lib/aiBudget.ts');
  await db.query('DELETE FROM ulpana_ai_usage');
  const keys = ['AI_DAILY_GLOBAL_LIMIT', 'AI_DAILY_USER_LIMIT', 'AI_DAILY_GUEST_LIMIT', 'AI_MINUTE_LIMIT'];
  const saved = keys.map(k => process.env[k]);
  try {
    process.env.AI_DAILY_GLOBAL_LIMIT = '8';
    process.env.AI_DAILY_USER_LIMIT = '20';
    process.env.AI_DAILY_GUEST_LIMIT = '2';
    process.env.AI_MINUTE_LIMIT = '20';
    const results = await Promise.allSettled(Array.from({ length: 20 }, () => consumeAiBudget(db, idA, true)));
    assert.equal(results.filter(r => r.status === 'fulfilled').length, 8);
    assert.ok(results.filter(r => r.status === 'rejected').every(r => r.reason instanceof AiBudgetExceeded));
    assert.equal((await db.query("SELECT request_count FROM ulpana_ai_usage WHERE scope = 'global:day'")).rows[0].request_count, 8);
    await db.query('DELETE FROM ulpana_ai_usage');
    await consumeAiBudget(db, idA, false);
    await consumeAiBudget(db, idA, false);
    await assert.rejects(consumeAiBudget(db, idA, false), AiBudgetExceeded);
    await consumeAiBudget(db, idB, false);
    assert.equal((await db.query("SELECT request_count FROM ulpana_ai_usage WHERE scope = 'global:day'")).rows[0].request_count, 3);
  } finally {
    keys.forEach((key, i) => { if (saved[i] === undefined) delete process.env[key]; else process.env[key] = saved[i]; });
  }
});

test('parallel recording uploads retain every turn in the same owned database record', async () => {
  const storage = require('../src/lib/cloudStorage.ts');
  const original = storage.uploadAudioFile;
  storage.uploadAudioFile = async ({ key }) => `/api/audio/file?key=${encodeURIComponent(key)}`;
  try {
    const upload = require('../src/app/api/audio/upload/route.ts');
    const responses = await Promise.all([0, 1, 2, 3, 4].map(turn => {
      const form = new FormData();
      form.set('file', new Blob(['synthetic audio storage fixture'], { type: 'audio/webm' }), 'test.webm');
      form.set('lessonId', '1'); form.set('stage', 'chat'); form.set('turnIndex', String(turn));
      return upload.POST(new NextRequest('http://localhost/api/audio/upload', { method: 'POST', headers: { cookie: `ulpana_session=${tokenA}` }, body: form }));
    }));
    assert.deepEqual(responses.map(r => r.status), [200, 200, 200, 200, 200]);
    const row = (await db.query('SELECT user_id, turns_audio FROM ulpana_audio_recordings WHERE user_id = $1', [idA])).rows[0];
    assert.equal(row.user_id, idA);
    assert.deepEqual(Object.keys(row.turns_audio).sort(), ['0', '1', '2', '3', '4']);
  } finally { storage.uploadAudioFile = original; }
});

test('a call ID cannot be overwritten by another student, and parallel essay saves keep one record', async () => {
  const calls = require('../src/app/api/calls/log/route.ts');
  const essays = require('../src/app/api/essays/log/route.ts');
  const callId = `call-${crypto.randomUUID()}`;
  const payload = { id: callId, lessonId: 1, durationSeconds: 10, transcript: [{ role: 'user', hebrew: 'שלום' }], userName: 'spoofed admin' };
  assert.equal((await calls.POST(telegramRequest('/api/calls/log', tokenA, payload))).status, 200);
  assert.equal((await calls.POST(telegramRequest('/api/calls/log', tokenB, { ...payload, transcript: [] }))).status, 403);
  const stored = (await db.query('SELECT user_id, user_name, messages_count FROM ulpana_call_logs WHERE id = $1', [callId])).rows[0];
  assert.equal(stored.user_id, idA); assert.equal(stored.user_name, 'Test A'); assert.equal(stored.messages_count, 1);
  const results = await Promise.all(Array.from({ length: 5 }, () => essays.POST(telegramRequest('/api/essays/log', tokenA, { lessonId: 1, essayText: 'שלום אני תלמיד', score: 75 }))));
  assert.deepEqual(results.map(r => r.status), [200, 200, 200, 200, 200]);
  assert.equal((await db.query('SELECT id FROM ulpana_essays WHERE user_id = $1', [idA])).rowCount, 1);
});

test('Telegram login keeps the canonical linked profile ID and linking cannot delete a second account', async () => {
  await db.query('UPDATE ulpana_users SET telegram_id = $1 WHERE id = $2', [telegramId, idB]);
  const login = require('../src/app/api/auth/telegram/route.ts');
  const response = await login.POST(telegramRequest('/api/auth/telegram', '', signedTelegram(telegramId)));
  assert.equal(response.status, 200);
  assert.equal((await response.json()).user.id, idB);
  const link = require('../src/app/api/user/link/telegram/route.ts');
  assert.equal((await link.POST(telegramRequest('/api/user/link/telegram', tokenA, signedTelegram(telegramId)))).status, 409);
  assert.equal((await db.query('SELECT id FROM ulpana_users WHERE id = ANY($1::text[])', [[idA, idB]])).rowCount, 2);
});

test('concurrent Telegram linking cannot assign one identity to two profiles', async () => {
  const link = require('../src/app/api/user/link/telegram/route.ts');
  const tokenC = await createSessionToken({ id: idC, name: 'Test C', subscriptionTier: 'free' });
  const newId = telegramId + 1;
  const results = await Promise.all([
    link.POST(telegramRequest('/api/user/link/telegram', tokenA, signedTelegram(newId))),
    link.POST(telegramRequest('/api/user/link/telegram', tokenC, signedTelegram(newId))),
  ]);
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409]);
  assert.equal((await db.query('SELECT id FROM ulpana_users WHERE telegram_id = $1', [newId])).rowCount, 1);
  assert.equal((await db.query('SELECT id FROM ulpana_users WHERE id = ANY($1::text[])', [[idA, idC]])).rowCount, 2);
});
