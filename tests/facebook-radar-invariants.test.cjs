/**
 * Test: Facebook Lead Radar and Admin Hub Invariants
 * 
 * Verifies:
 * 1. facebook_radar.cjs script exists in growth/scripts and satisfies R-23 isolation.
 * 2. ulpana_marketing_leads table exists in src/lib/db.ts schema.
 * 3. verifyAdminRequest in src/lib/adminAuth.ts supports M2M x-admin-key auth (R-16).
 * 4. API /api/admin/marketing/radar supports action: 'ingest' and postUrl.
 * 5. AdminMarketingHub.tsx renders Facebook badges and post links.
 * 6. Target communities include Facebook groups (Pumpkin Latte, Moms Israel).
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('1. Facebook radar script exists and complies with R-23', () => {
  const scriptPath = path.join(__dirname, '..', 'growth', 'scripts', 'facebook_radar.cjs');
  assert.ok(fs.existsSync(scriptPath), 'growth/scripts/facebook_radar.cjs must exist');

  const content = fs.readFileSync(scriptPath, 'utf-8');
  assert.ok(content.includes('--auth'), 'Script must support --auth mode');
  assert.ok(content.includes('--scan'), 'Script must support --scan mode');
  assert.ok(content.includes('--dry-run'), 'Script must support --dry-run mode');
  assert.ok(content.includes('--test-msg='), 'Script must support --test-msg mode');
  assert.ok(content.includes('x-admin-key'), 'Script must use x-admin-key header');
});

test('2. PostgreSQL schema includes ulpana_marketing_leads', () => {
  const dbPath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
  const dbContent = fs.readFileSync(dbPath, 'utf-8');

  assert.ok(dbContent.includes('CREATE TABLE IF NOT EXISTS ulpana_marketing_leads'), 'db.ts must create ulpana_marketing_leads');
  assert.ok(dbContent.includes('post_url TEXT'), 'ulpana_marketing_leads must have post_url column');
  assert.ok(dbContent.includes('source_channel TEXT'), 'ulpana_marketing_leads must have source_channel column');
  assert.ok(dbContent.includes('ai_analysis JSONB'), 'ulpana_marketing_leads must have ai_analysis JSONB column');
});

test('3. verifyAdminRequest supports M2M x-admin-key (R-16)', () => {
  const authPath = path.join(__dirname, '..', 'src', 'lib', 'adminAuth.ts');
  const authContent = fs.readFileSync(authPath, 'utf-8');

  assert.ok(authContent.includes('x-admin-key'), 'adminAuth.ts must check x-admin-key header');
  assert.ok(authContent.includes('ADMIN_SECRET_KEY'), 'adminAuth.ts must support ADMIN_SECRET_KEY');
  assert.ok(authContent.includes('timingSafeEqual'), 'adminAuth.ts must use constant-time comparison against timing attacks');
});

test('4. API /api/admin/marketing/radar supports action: ingest and postUrl', () => {
  const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'marketing', 'radar', 'route.ts');
  const routeContent = fs.readFileSync(routePath, 'utf-8');

  assert.ok(routeContent.includes("action === 'ingest'"), 'Route must handle action === ingest');
  assert.ok(routeContent.includes('postUrl'), 'Route must support postUrl field');
  assert.ok(routeContent.includes('ulpana_marketing_leads'), 'Route must query ulpana_marketing_leads from DB');
});

test('5. AdminMarketingHub.tsx displays Facebook badges and post links', () => {
  const hubPath = path.join(__dirname, '..', 'src', 'app', 'admin', 'components', 'AdminMarketingHub.tsx');
  const hubContent = fs.readFileSync(hubPath, 'utf-8');

  assert.ok(hubContent.includes('postUrl'), 'AdminMarketingHub.tsx must support postUrl');
  assert.ok(hubContent.includes('lead.postUrl'), 'AdminMarketingHub.tsx must render lead.postUrl button');
  assert.ok(hubContent.includes('📘 FB:'), 'AdminMarketingHub.tsx must render Facebook platform badge');
});

test('6. Target communities include Facebook groups', () => {
  const commPath = path.join(__dirname, '..', 'growth', 'data', 'target_communities.json');
  assert.ok(fs.existsSync(commPath), 'target_communities.json must exist');

  const comms = JSON.parse(fs.readFileSync(commPath, 'utf-8'));
  const fbComms = comms.filter((c) => c.platform === 'facebook');

  assert.ok(fbComms.length >= 2, 'Must contain at least 2 Facebook groups');
  assert.ok(fbComms.some((c) => c.id === 'fb_pumpkin_latte'), 'Must contain Pumpkin Latte');
  assert.ok(fbComms.some((c) => c.id === 'fb_moms_israel'), 'Must contain Moms Israel');
});

test('7. Facebook radar implements time window filtering and 2-tier deduplication', () => {
  const scriptPath = path.join(__dirname, '..', 'growth', 'scripts', 'facebook_radar.cjs');
  const scriptContent = fs.readFileSync(scriptPath, 'utf-8');

  assert.ok(scriptContent.includes('MAX_LOOKBACK_HOURS'), 'Script must define MAX_LOOKBACK_HOURS');
  assert.ok(scriptContent.includes('parsePostAgeHours'), 'Script must define parsePostAgeHours helper');
  assert.ok(scriptContent.includes('getLeadSignature'), 'Script must define getLeadSignature helper');
  assert.ok(scriptContent.includes('sorting_setting=CHRONOLOGICAL'), 'Script must enforce chronological sorting for FB feeds');
  assert.ok(scriptContent.includes('existingSignatures'), 'Script must maintain existingSignatures for deduplication');
});
