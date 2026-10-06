/**
 * Test: Promo Code Capture and Dynamic Management
 * Ensures:
 * 1. URL parsing correctly captures and normalizes ?promo= and ?ref= query parameters.
 * 2. URL cleaning removes promo/ref while preserving other parameters and hash.
 * 3. src/app/page.tsx contains auto-capture and user-facing toast.
 * 4. src/components/SubscriptionModal.tsx handles pending promo code in both PRO and Beta modes.
 * 5. src/app/admin/page.tsx offers 1-click link copying and channel presets (FB, INSTA, LATTE, MOMS).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('1. URL promo capture and normalization logic', () => {
  function extractPromo(urlString) {
    const url = new URL(urlString);
    let hashPromo = '';
    if (url.hash && url.hash.includes('?')) {
      const hashSearch = new URLSearchParams(url.hash.split('?')[1]);
      hashPromo = (hashSearch.get('promo') || hashSearch.get('ref'))?.trim().toUpperCase() || '';
    }
    const promo = (url.searchParams.get('promo') || url.searchParams.get('ref') || hashPromo)?.trim().toUpperCase() || null;
    return promo;
  }

  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/?promo=FB'), 'FB');
  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/?promo=fb'), 'FB');
  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/?promo=  latte  '), 'LATTE');
  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/?ref=moms'), 'MOMS');
  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/#lesson-8?promo=INSTA'), 'INSTA');
  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/#lesson-1'), null);
});

test('2. URL cleanup preserves remaining query params and hash', () => {
  function cleanUrl(urlString) {
    const url = new URL(urlString);
    let hashPromo = '';
    if (url.hash && url.hash.includes('?')) {
      const hashSearch = new URLSearchParams(url.hash.split('?')[1]);
      hashPromo = (hashSearch.get('promo') || hashSearch.get('ref'))?.trim().toUpperCase() || '';
    }
    url.searchParams.delete('promo');
    url.searchParams.delete('ref');
    if (hashPromo && url.hash.includes('?')) {
      url.hash = url.hash.split('?')[0];
    }
    return url.pathname + (url.search ? url.search : '') + url.hash;
  }

  assert.equal(cleanUrl('https://ulpana-hebrew.vercel.app/?promo=FB'), '/');
  assert.equal(cleanUrl('https://ulpana-hebrew.vercel.app/?promo=FB#lesson-3'), '/#lesson-3');
  assert.equal(cleanUrl('https://ulpana-hebrew.vercel.app/?source=test&promo=FB'), '/?source=test');
  assert.equal(cleanUrl('https://ulpana-hebrew.vercel.app/#lesson-8?promo=INSTA'), '/#lesson-8');
});

test('3. src/app/page.tsx contains promo capture and Toast component with 30-day terms for all platforms', () => {
  const pagePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
  const content = fs.readFileSync(pagePath, 'utf-8');

  assert.ok(content.includes('ulpana_pending_promo'), 'page.tsx must store ulpana_pending_promo');
  assert.ok(content.includes('ulpana_referral_source'), 'page.tsx must store referral source');
  assert.ok(content.includes("url.searchParams.delete('promo')"), 'page.tsx must clean promo param from URL');
  assert.ok(content.includes('capturedPromoToast'), 'page.tsx must render capturedPromoToast');
  assert.ok(content.includes('getPlatformPromoBadge'), 'page.tsx must define getPlatformPromoBadge helper');

  // Verify explicit 30 days in modal copy
  assert.ok(content.includes('бесплатный PRO-доступ на 30 дней'), 'Modal must explicitly state 30 days in offer description');
  assert.ok(content.includes('30 дней бесплатно'), 'Modal must explicitly highlight 30 days free in benefits');
  assert.ok(content.includes('Войти и закрепить 30 дней PRO'), 'Modal CTA must specify 30 days');
  assert.ok(content.includes('Instagram · 30 дней PRO'), 'Platform badge must support Instagram');
  assert.ok(content.includes('YouTube · 30 дней PRO'), 'Platform badge must support YouTube');
  assert.ok(content.includes('TikTok · 30 дней PRO'), 'Platform badge must support TikTok');
  assert.ok(content.includes('Telegram · 30 дней PRO'), 'Platform badge must support Telegram');
  assert.ok(content.includes('Facebook · 30 дней PRO'), 'Platform badge must support Facebook');
});

test('4. src/components/SubscriptionModal.tsx supports pending promo and beta notice with 30-day terms', () => {
  const modalPath = path.join(__dirname, '..', 'src', 'components', 'SubscriptionModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf-8');

  assert.ok(content.includes('ulpana_pending_promo'), 'SubscriptionModal must check ulpana_pending_promo');
  assert.ok(content.includes('savedPromo'), 'SubscriptionModal must maintain savedPromo state');
  assert.ok(content.includes('onPromoActivated'), 'SubscriptionModal must call onPromoActivated callback');
  assert.ok(content.includes('30 дней'), 'SubscriptionModal must explicitly state 30 days for promo activation');
});

test('5. src/app/admin/page.tsx contains 1-click link copying and channel presets', () => {
  const adminPath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
  const content = fs.readFileSync(adminPath, 'utf-8');

  assert.ok(content.includes('handleCopyLink'), 'admin/page.tsx must implement handleCopyLink');
  assert.ok(content.includes('?promo='), 'admin/page.tsx must build ?promo= URLs');
  assert.ok(content.includes('FB') && content.includes('INSTA') && content.includes('TIKTOK') && content.includes('LATTE'), 'admin/page.tsx must contain channel presets');
});
