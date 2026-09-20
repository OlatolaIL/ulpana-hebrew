/**
 * Test: Marketing Hub Health Check API
 * Verifies:
 * 1. src/app/api/admin/marketing/health/route.ts exists.
 * 2. Enforces strict admin authorization via verifyAdminRequest.
 * 3. Inspects and returns status for 5 critical services: telegram, groq, gemini, whatsapp, meta.
 * 4. Uses timeout safeguards (AbortSignal.timeout) to avoid blocking the admin UI.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('1. Marketing health check route exists and imports verifyAdminRequest', () => {
  const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'marketing', 'health', 'route.ts');
  assert.ok(fs.existsSync(routePath), 'Route file must exist');

  const content = fs.readFileSync(routePath, 'utf-8');
  assert.ok(content.includes('verifyAdminRequest'), 'Route must enforce admin authorization');
  assert.ok(content.includes('export async function GET'), 'Route must export GET handler');
});

test('2. Health check route inspects all 6 required services', () => {
  const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'marketing', 'health', 'route.ts');
  const content = fs.readFileSync(routePath, 'utf-8');

  assert.ok(content.includes('telegram:'), 'Must check telegram service');
  assert.ok(content.includes('groq:'), 'Must check groq service');
  assert.ok(content.includes('gemini:'), 'Must check gemini service');
  assert.ok(content.includes('whatsapp:'), 'Must check whatsapp service');
  assert.ok(content.includes('meta:'), 'Must check meta service');
  assert.ok(content.includes('youtube:'), 'Must check youtube service');
});

test('3. Health check route implements timeouts and channel admin check', () => {
  const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'marketing', 'health', 'route.ts');
  const content = fs.readFileSync(routePath, 'utf-8');

  assert.ok(content.includes('AbortSignal.timeout'), 'Must use timeouts for external API checks');
  assert.ok(content.includes('getChatMember'), 'Must verify bot admin rights in channel');
  assert.ok(content.includes('@ulpana_il'), 'Must target official channel @ulpana_il');
});
