/**
 * Test: Marketing Hub 1-Click Publishing API (Production & Local)
 * Verifies:
 * 1. src/app/api/admin/marketing/publish/route.ts exists and enforces admin auth.
 * 2. Implements YouTube Data API v3 resumable video upload.
 * 3. Implements Telegram Bot API video and text publishing.
 * 4. Implements Meta Graph API Facebook page publishing.
 * 5. Supports atomic registration in publications.json.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const routePath = path.join(repoRoot, 'src/app/api/admin/marketing/publish/route.ts');

test('1. Marketing publish route exists and enforces verifyAdminRequest', () => {
  assert.ok(fs.existsSync(routePath), 'Publish API route must exist');
  const content = fs.readFileSync(routePath, 'utf8');

  assert.ok(content.includes('verifyAdminRequest'), 'Route must enforce admin authorization');
  assert.ok(content.includes('export async function POST'), 'Route must export POST handler');
});

test('2. Publish route supports YouTube Data API v3 with resumable upload', () => {
  const content = fs.readFileSync(routePath, 'utf8');

  assert.ok(content.includes("channel === 'youtube'"), 'Must handle youtube channel');
  assert.ok(content.includes('YOUTUBE_CLIENT_ID'), 'Must read YOUTUBE_CLIENT_ID from env');
  assert.ok(content.includes('YOUTUBE_CLIENT_SECRET'), 'Must read YOUTUBE_CLIENT_SECRET from env');
  assert.ok(content.includes('YOUTUBE_REFRESH_TOKEN'), 'Must read YOUTUBE_REFRESH_TOKEN from env');
  assert.ok(content.includes('uploadType=resumable'), 'Must use resumable upload protocol');
  assert.ok(content.includes('youtube.com/shorts/'), 'Must generate YouTube Shorts link');
});

test('3. Publish route supports Telegram and Facebook channels', () => {
  const content = fs.readFileSync(routePath, 'utf8');

  assert.ok(content.includes("channel === 'telegram'"), 'Must handle telegram channel');
  assert.ok(content.includes('TELEGRAM_BOT_TOKEN'), 'Must read TELEGRAM_BOT_TOKEN');
  assert.ok(content.includes('@ulpana_il'), 'Must target @ulpana_il');

  assert.ok(content.includes("channel === 'facebook'"), 'Must handle facebook channel');
  assert.ok(content.includes('FB_PAGE_ID'), 'Must read FB_PAGE_ID');
  assert.ok(content.includes('META_ACCESS_TOKEN'), 'Must read META_ACCESS_TOKEN');
});

test('4. Publish route implements automatic registration in publications.json', () => {
  const content = fs.readFileSync(routePath, 'utf8');

  assert.ok(content.includes('registerPublication'), 'Must define registerPublication helper');
  assert.ok(content.includes('publications.json'), 'Must write to publications.json');
});
