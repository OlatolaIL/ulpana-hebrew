/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');

// Import transpiled TypeScript modules via tests/register.cjs
const {
  checkContentAccess,
  getDefaultLessonRequirement,
  getEffectiveLessonRequirement,
  getAccessRequirementLabel,
} = require('../src/lib/accessPolicy');

test('Access Policy: always_free allows access for all user states', () => {
  // Guest
  assert.deepEqual(
    checkContentAccess('always_free', { isLoggedIn: false, isPro: false, isChannelSubscriber: false }),
    { allowed: true }
  );
  // Logged in normal
  assert.deepEqual(
    checkContentAccess('always_free', { isLoggedIn: true, isPro: false, isChannelSubscriber: false }),
    { allowed: true }
  );
  // Pro user
  assert.deepEqual(
    checkContentAccess('always_free', { isLoggedIn: true, isPro: true, isChannelSubscriber: false }),
    { allowed: true }
  );
  // Channel subscriber
  assert.deepEqual(
    checkContentAccess('always_free', { isLoggedIn: true, isPro: false, isChannelSubscriber: true }),
    { allowed: true }
  );
});

test('Access Policy: free_auth requires authentication', () => {
  // Guest blocked
  assert.deepEqual(
    checkContentAccess('free_auth', { isLoggedIn: false, isPro: false, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_auth' }
  );
  // Logged in allowed
  assert.deepEqual(
    checkContentAccess('free_auth', { isLoggedIn: true, isPro: false, isChannelSubscriber: false }),
    { allowed: true }
  );
  // Pro allowed
  assert.deepEqual(
    checkContentAccess('free_auth', { isLoggedIn: true, isPro: true, isChannelSubscriber: false }),
    { allowed: true }
  );
});

test('Access Policy: telegram_channel requires auth and channel subscription', () => {
  // Guest -> require_auth
  assert.deepEqual(
    checkContentAccess('telegram_channel', { isLoggedIn: false, isPro: false, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_auth' }
  );
  // Logged in but not subscriber -> require_channel
  assert.deepEqual(
    checkContentAccess('telegram_channel', { isLoggedIn: true, isPro: false, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_channel' }
  );
  // Logged in and channel subscriber -> allowed
  assert.deepEqual(
    checkContentAccess('telegram_channel', { isLoggedIn: true, isPro: false, isChannelSubscriber: true }),
    { allowed: true }
  );
  // Pro + channel subscriber -> allowed
  assert.deepEqual(
    checkContentAccess('telegram_channel', { isLoggedIn: true, isPro: true, isChannelSubscriber: true }),
    { allowed: true }
  );
});

test('Access Policy: pro_only requires PRO subscription', () => {
  // Guest -> require_auth
  assert.deepEqual(
    checkContentAccess('pro_only', { isLoggedIn: false, isPro: false, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_auth' }
  );
  // Logged in not pro -> require_pro
  assert.deepEqual(
    checkContentAccess('pro_only', { isLoggedIn: true, isPro: false, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_pro' }
  );
  // Logged in with telegram channel but not pro -> require_pro
  assert.deepEqual(
    checkContentAccess('pro_only', { isLoggedIn: true, isPro: false, isChannelSubscriber: true }),
    { allowed: false, reason: 'require_pro' }
  );
  // Logged in pro -> allowed
  assert.deepEqual(
    checkContentAccess('pro_only', { isLoggedIn: true, isPro: true, isChannelSubscriber: false }),
    { allowed: true }
  );
});

test('Access Policy: pro_or_channel unlocks with either PRO or Telegram channel', () => {
  // Guest -> require_auth
  assert.deepEqual(
    checkContentAccess('pro_or_channel', { isLoggedIn: false, isPro: false, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_auth' }
  );
  // Logged in, neither -> require_channel
  assert.deepEqual(
    checkContentAccess('pro_or_channel', { isLoggedIn: true, isPro: false, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_channel' }
  );
  // Unlocked by channel subscriber
  assert.deepEqual(
    checkContentAccess('pro_or_channel', { isLoggedIn: true, isPro: false, isChannelSubscriber: true }),
    { allowed: true }
  );
  // Unlocked by PRO
  assert.deepEqual(
    checkContentAccess('pro_or_channel', { isLoggedIn: true, isPro: true, isChannelSubscriber: false }),
    { allowed: true }
  );
  // Unlocked by both
  assert.deepEqual(
    checkContentAccess('pro_or_channel', { isLoggedIn: true, isPro: true, isChannelSubscriber: true }),
    { allowed: true }
  );
});

test('Access Policy: pro_and_channel requires both PRO and Telegram channel', () => {
  // Guest -> require_auth
  assert.deepEqual(
    checkContentAccess('pro_and_channel', { isLoggedIn: false, isPro: false, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_auth' }
  );
  // Logged in, neither -> require_both
  assert.deepEqual(
    checkContentAccess('pro_and_channel', { isLoggedIn: true, isPro: false, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_both' }
  );
  // Only channel subscriber -> require_pro
  assert.deepEqual(
    checkContentAccess('pro_and_channel', { isLoggedIn: true, isPro: false, isChannelSubscriber: true }),
    { allowed: false, reason: 'require_pro' }
  );
  // Only PRO -> require_channel
  assert.deepEqual(
    checkContentAccess('pro_and_channel', { isLoggedIn: true, isPro: true, isChannelSubscriber: false }),
    { allowed: false, reason: 'require_channel' }
  );
  // Both PRO and channel subscriber -> allowed
  assert.deepEqual(
    checkContentAccess('pro_and_channel', { isLoggedIn: true, isPro: true, isChannelSubscriber: true }),
    { allowed: true }
  );
});

test('Access Policy: getDefaultLessonRequirement fallbacks match config rules', () => {
  // Lessons 1-2: guest free
  assert.equal(getDefaultLessonRequirement(1), 'always_free');
  assert.equal(getDefaultLessonRequirement(2), 'always_free');

  // Lessons 3-30: free with auth
  assert.equal(getDefaultLessonRequirement(3), 'free_auth');
  assert.equal(getDefaultLessonRequirement(15), 'free_auth');
  assert.equal(getDefaultLessonRequirement(30), 'free_auth');

  // Lessons 31+: PRO
  assert.equal(getDefaultLessonRequirement(31), 'pro_only');
  assert.equal(getDefaultLessonRequirement(50), 'pro_only');
  assert.equal(getDefaultLessonRequirement(100), 'pro_only');
});

test('Access Policy: getEffectiveLessonRequirement respects beta mode and custom DB rules', () => {
  // Beta mode open -> always_free
  assert.equal(getEffectiveLessonRequirement(50, null, true), 'always_free');
  assert.equal(getEffectiveLessonRequirement(85, { 85: 'pro_only' }, true), 'always_free');

  // Production mode with custom rules
  const customRules = {
    5: 'always_free',
    15: 'telegram_channel',
    25: 'pro_or_channel',
  };
  assert.equal(getEffectiveLessonRequirement(5, customRules, false), 'always_free');
  assert.equal(getEffectiveLessonRequirement(15, customRules, false), 'telegram_channel');
  assert.equal(getEffectiveLessonRequirement(25, customRules, false), 'pro_or_channel');

  // Production mode without custom rule falls back to default
  assert.equal(getEffectiveLessonRequirement(1, customRules, false), 'always_free');
  assert.equal(getEffectiveLessonRequirement(35, customRules, false), 'pro_only');
});

test('Access Policy: labels are defined for all requirements', () => {
  const requirements = [
    'always_free',
    'free_auth',
    'telegram_channel',
    'pro_only',
    'pro_or_channel',
    'pro_and_channel',
  ];

  for (const req of requirements) {
    const label = getAccessRequirementLabel(req);
    assert.ok(typeof label === 'string' && label.length > 0);
  }
});

test('API /api/auth/telegram/check-channel: rejects unauthenticated requests', async () => {
  const { POST } = require('../src/app/api/auth/telegram/check-channel/route');
  const req = {
    cookies: { get: () => undefined },
    headers: { get: () => null },
  };
  const res = await POST(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.ok, false);
});

test('API /api/admin/access-rules: rejects unauthorized POST requests', async () => {
  const { POST } = require('../src/app/api/admin/access-rules/route');
  const req = {
    cookies: { get: () => undefined },
    headers: { get: () => null },
    json: async () => ({ isEarlyAccessFree: false, rules: {} }),
  };
  const res = await POST(req);
  assert.equal(res.status, 401);
  const data = await res.json();
  assert.equal(data.ok, false);
});

test('API /api/admin/access-rules: GET returns default rules structure', async () => {
  const { GET } = require('../src/app/api/admin/access-rules/route');
  const req = {
    cookies: { get: () => undefined },
    headers: { get: () => null },
  };
  const res = await GET(req);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.ok, true);
  assert.ok(typeof data.isEarlyAccessFree === 'boolean');
  assert.ok(data.lessonRules && typeof data.lessonRules === 'object');
  assert.equal(data.lessonRules[1], 'always_free');
  assert.equal(data.lessonRules[100], 'pro_only');
});

