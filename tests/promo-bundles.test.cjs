/* eslint-disable @typescript-eslint/no-require-imports */
require('./register.cjs');
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  DEFAULT_BUNDLES,
  MOM_DECK_IDS,
  resolvePromoBundle,
  isPromoUnlockingMomDecks,
  isDeckUnlockedByBundle,
  isLessonUnlockedByBundle,
} = require('../src/lib/promoBundles');

const {
  isDeckAlwaysFree,
  isLessonPromoFree,
  isMomPromo,
} = require('../src/lib/permissions');

test('Promo Bundles: DEFAULT_BUNDLES definition and content integrity', () => {
  assert.ok(Array.isArray(DEFAULT_BUNDLES), 'DEFAULT_BUNDLES must be an array');
  assert.ok(DEFAULT_BUNDLES.length >= 4, 'Must contain at least 4 default bundles');

  const bundleMoms = DEFAULT_BUNDLES.find((b) => b.id === 'bundle_moms');
  assert.ok(bundleMoms, 'bundle_moms must exist');
  assert.equal(bundleMoms.unlockedCategories.includes('mom'), true);
  assert.equal(bundleMoms.unlockedDecks.length, 7);
  for (const id of MOM_DECK_IDS) {
    assert.ok(bundleMoms.unlockedDecks.includes(id), `bundle_moms must include deck ${id}`);
  }

  const bundle1to30 = DEFAULT_BUNDLES.find((b) => b.id === 'bundle_lessons_1_30');
  assert.ok(bundle1to30, 'bundle_lessons_1_30 must exist');
  assert.equal(bundle1to30.unlockedLessons.length, 30);
  assert.equal(bundle1to30.unlockedLessons[0], 1);
  assert.equal(bundle1to30.unlockedLessons[29], 30);

  const bundlePro = DEFAULT_BUNDLES.find((b) => b.id === 'bundle_professional');
  assert.ok(bundlePro, 'bundle_professional must exist');
  assert.ok(bundlePro.unlockedCategories.includes('caregiver'));
  assert.ok(bundlePro.unlockedCategories.includes('autoRepair'));
  assert.ok(bundlePro.unlockedCategories.includes('doctor'));

  const bundleAll = DEFAULT_BUNDLES.find((b) => b.id === 'bundle_all_free');
  assert.ok(bundleAll, 'bundle_all_free must exist');
  assert.equal(bundleAll.unlockedLessons.length, 100);
});

test('Promo Bundles: resolvePromoBundle resolves standard promo mappings', () => {
  const latteMama = resolvePromoBundle('LATTE_MAMA');
  assert.ok(latteMama);
  assert.equal(latteMama.id, 'bundle_moms');

  const moms = resolvePromoBundle('moms');
  assert.ok(moms);
  assert.equal(moms.id, 'bundle_moms');

  const tgMama = resolvePromoBundle(' TG_MAMA ');
  assert.ok(tgMama);
  assert.equal(tgMama.id, 'bundle_moms');

  assert.equal(resolvePromoBundle('UNKNOWN_CODE'), null);
  assert.equal(resolvePromoBundle(null), null);
  assert.equal(resolvePromoBundle(undefined), null);
});

test('Promo Bundles: isPromoUnlockingMomDecks and isMomPromo wrapper', () => {
  assert.equal(isPromoUnlockingMomDecks('LATTE_MAMA'), true);
  assert.equal(isPromoUnlockingMomDecks('TG_MAMA'), true);
  assert.equal(isPromoUnlockingMomDecks('MOMS'), true);
  assert.equal(isPromoUnlockingMomDecks('random_promo'), false);
  assert.equal(isPromoUnlockingMomDecks(null), false);

  // isMomPromo in permissions.ts forwards to isPromoUnlockingMomDecks
  assert.equal(isMomPromo('LATTE_MAMA'), true);
  assert.equal(isMomPromo('MOMS'), true);
  assert.equal(isMomPromo('random'), false);
});

test('Promo Bundles: isDeckUnlockedByBundle & isLessonUnlockedByBundle logic', () => {
  const bundleMoms = DEFAULT_BUNDLES.find((b) => b.id === 'bundle_moms');
  assert.ok(isDeckUnlockedByBundle('mom-kindergarten', bundleMoms));
  assert.ok(isDeckUnlockedByBundle('mom-playground', bundleMoms, 'mom'));
  assert.equal(isDeckUnlockedByBundle('tech-it', bundleMoms, 'tech'), false);

  const bundle1to30 = DEFAULT_BUNDLES.find((b) => b.id === 'bundle_lessons_1_30');
  assert.ok(isLessonUnlockedByBundle(1, bundle1to30));
  assert.ok(isLessonUnlockedByBundle(30, bundle1to30));
  assert.equal(isLessonUnlockedByBundle(31, bundle1to30), false);
});

test('Permissions: dynamic userProfile entitlements unlock decks and lessons', () => {
  // 1. User with category entitlement
  const profileWithMomCat = {
    unlockedCategories: ['mom'],
  };
  assert.equal(isDeckAlwaysFree('mom-infant', null, profileWithMomCat), true);
  assert.equal(isDeckAlwaysFree('mom-school', null, profileWithMomCat), true);
  assert.equal(isDeckAlwaysFree('car-repair', null, profileWithMomCat), false);

  // 2. User with specific deck entitlement
  const profileWithDeck = {
    unlockedDecks: ['caregiver-basics'],
  };
  assert.equal(isDeckAlwaysFree('caregiver-basics', null, profileWithDeck), true);
  assert.equal(isDeckAlwaysFree('caregiver-advanced', null, profileWithDeck), false);

  // 3. User with activated promos in profile history
  const profileWithPromo = {
    activatedPromos: ['LATTE_MAMA'],
  };
  assert.equal(isDeckAlwaysFree('mom-pharmacy', null, profileWithPromo), true);

  // 4. User with unlocked lessons in profile
  const profileWithLessons = {
    unlockedLessons: [1, 2, 3, 15, 20],
  };
  assert.equal(isLessonPromoFree(1, null, profileWithLessons), true);
  assert.equal(isLessonPromoFree(15, null, profileWithLessons), true);
  assert.equal(isLessonPromoFree(16, null, profileWithLessons), false);
  assert.equal(isLessonPromoFree(25, null, profileWithLessons), false);
});

test('Architecture: NO hardcoded promo strings remain in src/lib/permissions.ts', () => {
  const permissionsCode = fs.readFileSync(
    path.join(__dirname, '../src/lib/permissions.ts'),
    'utf-8'
  );

  assert.equal(
    permissionsCode.includes('LATTE_MAMA'),
    false,
    'permissions.ts must NOT contain LATTE_MAMA'
  );
  assert.equal(
    permissionsCode.includes('TG_MAMA'),
    false,
    'permissions.ts must NOT contain TG_MAMA'
  );
  assert.equal(
    permissionsCode.includes("'MOMS'"),
    false,
    "permissions.ts must NOT contain 'MOMS'"
  );
});
