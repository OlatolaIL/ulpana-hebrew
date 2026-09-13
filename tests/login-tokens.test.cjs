const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const { NextRequest } = require('next/server');

const {
  hashLoginToken,
  isValidPollingToken,
  isValidMagicLinkToken,
  isLegacyOrInsecureToken,
  generatePollingToken,
  generateMagicLinkToken,
  checkAuthConfiguration,
  createPollingSession,
  confirmPollingSession,
  consumePollingSession,
  createMagicLinkSession,
  consumeMagicLinkSession,
  toUserSession,
} = require('../src/lib/loginTokens.ts');

test('token format validation distinguishes polling vs magic link vs legacy', () => {
  const pollToken = generatePollingToken();
  const mlToken = generateMagicLinkToken();

  assert.equal(isValidPollingToken(pollToken), true);
  assert.equal(isValidPollingToken(mlToken), false);
  assert.equal(isValidPollingToken('ulp_1234567890abcdef'), false);
  assert.equal(isValidPollingToken('eyJhbGciOi...'), false);
  assert.equal(isValidPollingToken(''), false);
  assert.equal(isValidPollingToken(null), false);

  assert.equal(isValidMagicLinkToken(mlToken), true);
  assert.equal(isValidMagicLinkToken(pollToken), false);
  assert.equal(isValidMagicLinkToken('ulp_1234567890abcdef'), false);
  assert.equal(isValidMagicLinkToken('eyJhbGciOi...'), false);

  assert.equal(isLegacyOrInsecureToken('eyJhbGciOiJIUzI1Ni...'), true);
  assert.equal(isLegacyOrInsecureToken('ulp_1234567890abcdef'), true);
  assert.equal(isLegacyOrInsecureToken(pollToken), false);
  assert.equal(isLegacyOrInsecureToken(mlToken), false);
});

test('hashLoginToken creates deterministic sha256 hex digest', () => {
  const raw = 'ulp_ml_0123456789abcdef0123456789abcdef';
  const expected = crypto.createHash('sha256').update(raw).digest('hex');
  assert.equal(hashLoginToken(raw), expected);
  assert.equal(hashLoginToken(raw).length, 64);
});

test('toUserSession preserves canonical user profile ID and does not clobber with tg_id', () => {
  const session1 = toUserSession({
    purpose: 'magic_link',
    id: 'google_user_999',
    telegramId: 123456,
    username: 'pupil_alex',
    name: 'Alex Pupil',
    subscriptionTier: 'pro',
  });
  assert.equal(session1.id, 'google_user_999');
  assert.equal(session1.telegramId, 123456);
  assert.equal(session1.subscriptionTier, 'pro');

  const session2 = toUserSession({
    purpose: 'polling',
    telegramId: 777888,
    name: 'Jane Doe',
  });
  assert.equal(session2.id, 'tg_777888');
  assert.equal(session2.telegramId, 777888);
});

test('checkAuthConfiguration enforces >= 32 byte JWT_SECRET', () => {
  const saved = process.env.JWT_SECRET;
  delete process.env.JWT_SECRET;
  assert.equal(checkAuthConfiguration().ok, false);

  process.env.JWT_SECRET = 'short';
  assert.equal(checkAuthConfiguration().ok, false);

  process.env.JWT_SECRET = 'a'.repeat(32);
  assert.equal(checkAuthConfiguration().ok, true);

  if (saved) process.env.JWT_SECRET = saved;
});

test('polling and magic link tokens are hashed and consumed single-use in DB mock', async () => {
  const table = new Map();

  const mockDb = {
    query: async (sql, params) => {
      const normalizedSql = sql.replace(/\s+/g, ' ').trim();

      if (normalizedSql.startsWith('INSERT INTO ulpana_auth_tokens')) {
        const [tokenHash, userData] = [params[0], params[1]];
        table.set(tokenHash, {
          token: tokenHash,
          status: normalizedSql.includes("'completed'") ? 'completed' : 'pending',
          user_data: userData,
          expires_at: Date.now() + 600000,
        });
        return { rowCount: 1, rows: [] };
      }

      if (normalizedSql.startsWith('UPDATE ulpana_auth_tokens')) {
        const [userData, tokenHash] = params;
        const row = table.get(tokenHash);
        if (row && row.status === 'pending' && row.expires_at > Date.now()) {
          row.status = 'completed';
          row.user_data = userData;
          return { rowCount: 1, rows: [{ token: tokenHash }] };
        }
        return { rowCount: 0, rows: [] };
      }

      if (normalizedSql.startsWith('DELETE FROM ulpana_auth_tokens')) {
        const tokenHash = params[0];
        const row = table.get(tokenHash);
        if (row && row.status === 'completed' && row.expires_at > Date.now()) {
          table.delete(tokenHash);
          return { rowCount: 1, rows: [{ user_data: row.user_data }] };
        }
        return { rowCount: 0, rows: [] };
      }

      if (normalizedSql.startsWith('SELECT status FROM ulpana_auth_tokens')) {
        const tokenHash = params[0];
        const row = table.get(tokenHash);
        if (row && row.status === 'pending' && row.expires_at > Date.now()) {
          return { rowCount: 1, rows: [{ status: 'pending' }] };
        }
        return { rowCount: 0, rows: [] };
      }

      throw new Error(`Unhandled query in test mock: ${normalizedSql}`);
    },
  };

  // 1. Polling session lifecycle
  const pollToken = await createPollingSession(mockDb);
  assert.equal(isValidPollingToken(pollToken), true);

  // Still pending
  const pollRes1 = await consumePollingSession(mockDb, pollToken);
  assert.equal(pollRes1.completed, false);
  assert.equal(pollRes1.status, 'pending');

  // Confirm via webhook
  const confirmSuccess = await confirmPollingSession(mockDb, pollToken, {
    purpose: 'polling',
    id: 'user_canonical_123',
    telegramId: 999,
  });
  assert.equal(confirmSuccess, true);

  // Re-confirming an already completed token must fail (rowCount 0)
  const reconfirmSuccess = await confirmPollingSession(mockDb, pollToken, {
    purpose: 'polling',
    id: 'user_canonical_123',
    telegramId: 999,
  });
  assert.equal(reconfirmSuccess, false);

  // First consumption succeeds
  const pollRes2 = await consumePollingSession(mockDb, pollToken);
  assert.equal(pollRes2.completed, true);
  assert.equal(pollRes2.userData.id, 'user_canonical_123');

  // Second consumption fails (atomic single-use!)
  const pollRes3 = await consumePollingSession(mockDb, pollToken);
  assert.equal(pollRes3.completed, false);

  // 2. Magic link lifecycle
  const mlToken = await createMagicLinkSession(mockDb, {
    purpose: 'magic_link',
    id: 'user_canonical_456',
    telegramId: 1000,
    name: 'Magic User',
  });
  assert.equal(isValidMagicLinkToken(mlToken), true);

  // First consumption succeeds
  const mlData1 = await consumeMagicLinkSession(mockDb, mlToken);
  assert.equal(mlData1.id, 'user_canonical_456');
  assert.equal(mlData1.name, 'Magic User');

  // Replaying the same magic link token fails (single use!)
  const mlData2 = await consumeMagicLinkSession(mockDb, mlToken);
  assert.equal(mlData2, null);

  // 3. Expired token rejection
  const expiredPoll = await createPollingSession(mockDb);
  table.get(hashLoginToken(expiredPoll)).expires_at = Date.now() - 1000;
  assert.equal(await confirmPollingSession(mockDb, expiredPoll, { purpose: 'polling' }), false);

  const expiredMl = await createMagicLinkSession(mockDb, { purpose: 'magic_link', id: 'expired' });
  table.get(hashLoginToken(expiredMl)).expires_at = Date.now() - 1000;
  assert.equal(await consumeMagicLinkSession(mockDb, expiredMl), null);
});

test('route handlers enforce 503 and rejection of legacy tokens', async () => {
  // Test token-login route
  const tokenLoginRoute = require('../src/app/api/auth/token-login/route.ts');
  const savedSecret = process.env.JWT_SECRET;

  // 503 when JWT_SECRET missing
  delete process.env.JWT_SECRET;
  const res1 = await tokenLoginRoute.POST(
    new NextRequest('http://localhost/api/auth/token-login', {
      method: 'POST',
      body: JSON.stringify({ token: 'ulp_ml_0123456789abcdef0123456789abcdef' }),
    })
  );
  assert.equal(res1.status, 503);

  process.env.JWT_SECRET = 'a'.repeat(32);

  // 400 on legacy token (JWT)
  const resLegacy = await tokenLoginRoute.POST(
    new NextRequest('http://localhost/api/auth/token-login', {
      method: 'POST',
      body: JSON.stringify({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M' }),
    })
  );
  assert.equal(resLegacy.status, 400);

  // 400 on old format ulp_123
  const resOld = await tokenLoginRoute.POST(
    new NextRequest('http://localhost/api/auth/token-login', {
      method: 'POST',
      body: JSON.stringify({ token: 'ulp_old_token_123' }),
    })
  );
  assert.equal(resOld.status, 400);

  // 400 on empty/missing token
  const resEmpty = await tokenLoginRoute.POST(
    new NextRequest('http://localhost/api/auth/token-login', {
      method: 'POST',
      body: JSON.stringify({}),
    })
  );
  assert.equal(resEmpty.status, 400);

  // Test telegram/token route
  const telegramTokenRoute = require('../src/app/api/auth/telegram/token/route.ts');

  // GET without token parameter returns 400
  const resNoTokenGet = await telegramTokenRoute.GET(
    new NextRequest('http://localhost/api/auth/telegram/token')
  );
  assert.equal(resNoTokenGet.status, 400);

  // GET with invalid token format returns 400
  const resBadFormatGet = await telegramTokenRoute.GET(
    new NextRequest('http://localhost/api/auth/telegram/token?token=ulp_bad_token')
  );
  assert.equal(resBadFormatGet.status, 400);

  // POST without DB returns 503 (no in-memory fallback)
  const resNoDbPost = await telegramTokenRoute.POST();
  assert.equal(resNoDbPost.status, 503);

  // Test webhook GET handler
  const webhookRoute = require('../src/app/api/auth/telegram/webhook/route.ts');
  delete process.env.TELEGRAM_WEBHOOK_SECRET;
  const resWebhookNoConfig = await webhookRoute.GET(
    new NextRequest('http://localhost/api/auth/telegram/webhook')
  );
  assert.equal(resWebhookNoConfig.status, 503);

  process.env.TELEGRAM_WEBHOOK_SECRET = 'test_webhook_secret_value';
  process.env.TELEGRAM_BOT_TOKEN = 'test_bot_token';

  // Reject secret in query string
  const resQuerySecret = await webhookRoute.GET(
    new NextRequest('http://localhost/api/auth/telegram/webhook?secret=test_webhook_secret_value')
  );
  assert.equal(resQuerySecret.status, 400);

  // Reject unauthorized header
  const resBadHeader = await webhookRoute.GET(
    new NextRequest('http://localhost/api/auth/telegram/webhook', {
      headers: { 'x-telegram-bot-api-secret-token': 'wrong_secret' },
    })
  );
  assert.equal(resBadHeader.status, 401);

  // Reject action === 'set'
  const resSet = await webhookRoute.GET(
    new NextRequest('http://localhost/api/auth/telegram/webhook?action=set', {
      headers: { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_value' },
    })
  );
  assert.equal(resSet.status, 400);

  // Test webhook POST handler
  // Unauthorized when header is wrong
  const resWebhookPostUnauthorized = await webhookRoute.POST(
    new NextRequest('http://localhost/api/auth/telegram/webhook', {
      method: 'POST',
      headers: { 'x-telegram-bot-api-secret-token': 'invalid_secret' },
      body: JSON.stringify({ message: { text: '/start' } }),
    })
  );
  assert.equal(resWebhookPostUnauthorized.status, 401);

  // Ignores group chats without confirming or creating sessions
  const resGroupChat = await webhookRoute.POST(
    new NextRequest('http://localhost/api/auth/telegram/webhook', {
      method: 'POST',
      headers: { 'x-telegram-bot-api-secret-token': 'test_webhook_secret_value' },
      body: JSON.stringify({
        message: {
          chat: { id: -100123456, type: 'supergroup' },
          from: { id: 12345, first_name: 'GroupUser' },
          text: '/start ulp_poll_0123456789abcdef0123456789abcdef',
        },
      }),
    })
  );
  assert.equal(resGroupChat.status, 200);
  const groupJson = await resGroupChat.json();
  assert.equal(groupJson.ok, true);

  if (savedSecret) process.env.JWT_SECRET = savedSecret;
});
