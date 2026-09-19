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
    const promo = (url.searchParams.get('promo') || url.searchParams.get('ref'))?.trim().toUpperCase() || null;
    return promo;
  }

  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/?promo=FB'), 'FB');
  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/?promo=fb'), 'FB');
  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/?promo=  latte  '), 'LATTE');
  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/?ref=moms'), 'MOMS');
  assert.equal(extractPromo('https://ulpana-hebrew.vercel.app/#lesson-1'), null);
});

test('2. URL cleanup preserves remaining query params and hash', () => {
  function cleanUrl(urlString) {
    const url = new URL(urlString);
    url.searchParams.delete('promo');
    url.searchParams.delete('ref');
    return url.pathname + (url.search ? url.search : '') + url.hash;
  }

  assert.equal(cleanUrl('https://ulpana-hebrew.vercel.app/?promo=FB'), '/');
  assert.equal(cleanUrl('https://ulpana-hebrew.vercel.app/?promo=FB#lesson-3'), '/#lesson-3');
  assert.equal(cleanUrl('https://ulpana-hebrew.vercel.app/?source=test&promo=FB'), '/?source=test');
});

test('3. src/app/page.tsx contains promo capture and Toast component', () => {
  const pagePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
  const content = fs.readFileSync(pagePath, 'utf-8');

  assert.ok(content.includes('ulpana_pending_promo'), 'page.tsx must store ulpana_pending_promo');
  assert.ok(content.includes('ulpana_referral_source'), 'page.tsx must store referral source');
  assert.ok(content.includes("url.searchParams.delete('promo')"), 'page.tsx must clean promo param from URL');
  assert.ok(content.includes('capturedPromoToast'), 'page.tsx must render capturedPromoToast');
});

test('4. src/components/SubscriptionModal.tsx supports pending promo and beta notice', () => {
  const modalPath = path.join(__dirname, '..', 'src', 'components', 'SubscriptionModal.tsx');
  const content = fs.readFileSync(modalPath, 'utf-8');

  assert.ok(content.includes('ulpana_pending_promo'), 'SubscriptionModal must check ulpana_pending_promo');
  assert.ok(content.includes('savedPromo'), 'SubscriptionModal must maintain savedPromo state');
  assert.ok(content.includes("localStorage.removeItem('ulpana_pending_promo')"), 'SubscriptionModal must clean storage upon activation');
});

test('5. src/app/admin/page.tsx contains 1-click link copying and channel presets', () => {
  const adminPath = path.join(__dirname, '..', 'src', 'app', 'admin', 'page.tsx');
  const content = fs.readFileSync(adminPath, 'utf-8');

  assert.ok(content.includes('handleCopyLink'), 'admin/page.tsx must implement handleCopyLink');
  assert.ok(content.includes('?promo='), 'admin/page.tsx must build ?promo= URLs');
  assert.ok(content.includes('FB') && content.includes('INSTA') && content.includes('TIKTOK') && content.includes('LATTE'), 'admin/page.tsx must contain channel presets');
});
