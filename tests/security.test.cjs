const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { NextRequest } = require('next/server');
const { isVipUser } = require('../src/lib/vipUsers.ts');
const { createSessionToken, verifySessionToken, verifyGoogleIdToken, fetchGoogleUserInfo } = require('../src/lib/auth.ts');
const { validateAudioKey } = require('../src/lib/cloudStorage.ts');

test('editable profile names and malformed IDs never grant admin privileges', () => {
  for (const name of ['osa_il', '@olatola', 'Azrie']) assert.equal(isVipUser(name, null, name), false);
  assert.equal(isVipUser(null, '8215851suffix'), false);
  assert.equal(isVipUser('any name', 8215851), true);
});

test('session signing fails closed and signatures are checked', async () => {
  delete process.env.JWT_SECRET;
  await assert.rejects(createSessionToken({ id: 'test-user' }), /JWT_SECRET/);
  process.env.JWT_SECRET = 'test-only-session-secret-not-for-deployment-123456';
  const token = await createSessionToken({ id: 'test-user', subscriptionTier: 'free' });
  assert.equal((await verifySessionToken(token)).id, 'test-user');
  const parts = token.split('.');
  parts[1] = Buffer.from(JSON.stringify({ id: 'another-user' })).toString('base64url');
  assert.equal(await verifySessionToken(parts.join('.')), null);
});

test('Google login fails before a network request when audience is not configured', async () => {
  delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_ID;
  assert.equal(await verifyGoogleIdToken('invalid-token'), null);
});

test('recording endpoints reject an anonymous caller before reading a body or database', async () => {
  const upload = require('../src/app/api/audio/upload/route.ts');
  const metadata = require('../src/app/api/audio/recording/route.ts');
  const file = require('../src/app/api/audio/file/route.ts');
  assert.equal((await upload.POST(new NextRequest('http://localhost/api/audio/upload', { method: 'POST' }))).status, 401);
  assert.equal((await metadata.GET(new NextRequest('http://localhost/api/audio/recording?userId=victim'))).status, 401);
  assert.equal((await file.GET(new NextRequest('http://localhost/api/audio/file?key=anything'))).status, 401);
});

test('authenticated students cannot read another student recording or profile metadata', async () => {
  process.env.JWT_SECRET = 'test-only-session-secret-not-for-deployment-123456';
  const token = await createSessionToken({ id: 'student-a', name: 'osa_il', subscriptionTier: 'free' });
  const headers = { cookie: `ulpana_session=${token}` };
  const owner = crypto.createHash('sha256').update('student-b').digest('hex');
  const key = `audio/${owner}/${crypto.randomUUID()}.webm`;
  const file = require('../src/app/api/audio/file/route.ts');
  const metadata = require('../src/app/api/audio/recording/route.ts');
  assert.equal((await file.GET(new NextRequest(`http://localhost/api/audio/file?key=${encodeURIComponent(key)}`, { headers }))).status, 403);
  assert.equal((await metadata.GET(new NextRequest('http://localhost/api/audio/recording?userId=student-b', { headers }))).status, 403);
});

test('recording storage refuses traversal and legacy public paths', () => {
  for (const key of ['../../.env', '/uploads/secret.webm', 'audio/user/../file.webm']) {
    assert.throws(() => validateAudioKey(key));
  }
});

test('Google access tokens must belong to this app and the returned user', async () => {
  const original = global.fetch;
  const previous = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = 'test-oauth-client';
  try {
    const valid = { issued_to: 'test-oauth-client', audience: 'test-oauth-client', expires_in: 3600, user_id: 'user-1', verified_email: true };
    for (const invalid of [{ ...valid, issued_to: 'other-app' }, { ...valid, expires_in: 0 }, { ...valid, verified_email: false }]) {
      global.fetch = async () => new Response(JSON.stringify(invalid));
      assert.equal(await fetchGoogleUserInfo('test-access-token'), null);
    }
    global.fetch = async url => new Response(JSON.stringify(String(url).includes('tokeninfo') ? valid : {
      sub: 'different-user', email: 'example@example.test', email_verified: true,
    }));
    assert.equal(await fetchGoogleUserInfo('test-access-token'), null);
    global.fetch = async url => new Response(JSON.stringify(String(url).includes('tokeninfo') ? valid : {
      sub: 'user-1', email: 'example@example.test', email_verified: true,
    }));
    assert.equal((await fetchGoogleUserInfo('test-access-token')).sub, 'user-1');
  } finally {
    global.fetch = original;
    if (previous === undefined) delete process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    else process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID = previous;
  }
});
