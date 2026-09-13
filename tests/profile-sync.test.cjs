const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { createGuestProfile, saveUserProfile, loadUserProfile, loadAccountProfile } = require('../src/lib/storage.ts');
const { hydrateAccount, syncProfile, resetSyncSession, applyCloudProfile } = require('../src/lib/profileSync.ts');
const originalFetch = global.fetch;
let values;
function setup() {
  values = new Map();
  global.window = {};
  global.localStorage = { getItem: key => values.get(key) ?? null, setItem: (key,value) => values.set(key,value), removeItem: key => values.delete(key) };
  resetSyncSession();
}
afterEach(() => { global.fetch = originalFetch; delete global.window; delete global.localStorage; resetSyncSession(); });
function remote(userId, revision = 0) { return { userId, revision, lessonProgress: {}, personalVocabulary: [], flashcardStats: {} }; }

test('guest profiles do not share mutable progress', () => {
  const a = createGuestProfile(); a.completedLessons.push(1);
  assert.deepEqual(createGuestProfile().completedLessons, []);
});

test('switching accounts keeps each profile isolated and accepts an empty cloud dictionary', async () => {
  setup();
  const a = { ...createGuestProfile(), id: 'a', isLoggedIn: true, personalVocabulary: [{ id: 'a-word', hebrew: 'שלום', translation: 'привет' }] };
  saveUserProfile(a);
  global.fetch = async () => Response.json(remote('b'));
  const b = await hydrateAccount({ id: 'b', name: 'B', subscriptionTier: 'free' });
  assert.deepEqual(b.personalVocabulary, []);
  assert.deepEqual(b.lessonProgress, {});
  assert.equal(loadAccountProfile('a').personalVocabulary.length, 1);
});

test('a cloud response for a different account is rejected', () => {
  assert.throws(() => applyCloudProfile({ ...createGuestProfile(), id: 'a' }, remote('b')), /identity/);
});

test('pending edits survive reopening even when the cloud is empty', async () => {
  setup();
  const a = { ...createGuestProfile(), id: 'a', isLoggedIn: true, cloudRevision: 2, cloudSyncPending: true,
    lessonProgress: { 1: { completedTabs: ['theory'], isCompleted: false, lastVisited: 1 } } };
  saveUserProfile(a);
  global.fetch = async () => Response.json(remote('a', 3));
  const loaded = await hydrateAccount({ id: 'a', name: 'A', subscriptionTier: 'free' });
  assert.deepEqual(loaded.lessonProgress, a.lessonProgress);
  assert.equal(loaded.cloudRevision, 2);
});

test('rapid edits are serialized and use the latest acknowledged server revision', async () => {
  setup();
  const a = { ...createGuestProfile(), id: 'a', isLoggedIn: true, cloudRevision: 4, cloudSyncPending: true };
  saveUserProfile(a);
  const calls = [];
  global.fetch = async (_url, options) => {
    const body = JSON.parse(options.body); calls.push(body);
    return Response.json({ success: true, userId: 'a', revision: body.expectedRevision + 1 });
  };
  await Promise.all([syncProfile(a), syncProfile({ ...a, gender: 'male' })]);
  assert.deepEqual(calls.map(c => c.expectedRevision), [4,5]);
  assert.ok(calls.every(c => c.expectedUserId === 'a'));
});

test('conflict does not overwrite local changes or pretend that they were saved', async () => {
  setup();
  const a = { ...createGuestProfile(), id: 'a', isLoggedIn: true, cloudRevision: 1, cloudSyncPending: true };
  saveUserProfile(a);
  global.fetch = async () => Response.json({ error: 'conflict' }, { status: 409 });
  await assert.rejects(syncProfile(a), /другом устройстве/);
  assert.equal(loadUserProfile().cloudSyncPending, true);
  assert.equal(loadUserProfile().cloudRevision, 1);
});
