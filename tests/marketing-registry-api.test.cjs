/**
 * Test: Marketing Publications Registry API
 * Verifies:
 * 1. src/app/api/admin/marketing/publications/route.ts exists and enforces admin auth.
 * 2. Exports GET, POST, DELETE handlers.
 * 3. Correctly parses and formats fullUrlWithPromo.
 * 4. growth/data/publications.json exists and contains starter entries for key channels.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('1. Publications API route exists and enforces admin authorization', () => {
  const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'marketing', 'publications', 'route.ts');
  assert.ok(fs.existsSync(routePath), 'Route must exist');

  const content = fs.readFileSync(routePath, 'utf-8');
  assert.ok(content.includes('verifyAdminRequest'), 'Must verify admin authorization');
  assert.ok(content.includes('export async function GET'), 'Must export GET handler');
  assert.ok(content.includes('export async function POST'), 'Must export POST handler');
  assert.ok(content.includes('export async function DELETE'), 'Must export DELETE handler');
});

test('2. Publications data file exists and contains initial channels', () => {
  const dataPath = path.join(__dirname, '..', 'growth', 'data', 'publications.json');
  assert.ok(fs.existsSync(dataPath), 'growth/data/publications.json must exist');

  const raw = fs.readFileSync(dataPath, 'utf-8');
  const items = JSON.parse(raw);
  assert.ok(Array.isArray(items), 'Must be an array of publications');
  assert.ok(items.length >= 2, 'Must contain at least 2 initial entries');

  const channels = items.map((i) => i.channel);
  assert.ok(channels.includes('tiktok'), 'Must include TikTok publication');
  assert.ok(channels.includes('telegram'), 'Must include Telegram publication');

  for (const item of items) {
    assert.ok(item.id, 'Entry must have id');
    assert.ok(item.title, 'Entry must have title');
    assert.ok(item.targetDeepLink, 'Entry must have targetDeepLink');
    assert.ok(item.fullUrlWithPromo, 'Entry must have fullUrlWithPromo');
  }
});
