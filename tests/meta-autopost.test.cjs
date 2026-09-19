/**
 * Test: Meta (Facebook) Autoposting and Health Check
 * Verifies:
 * 1. growth/scripts/post_to_meta.cjs exists and handles --preview, --send, and --register.
 * 2. Uses FB_PAGE_ID and META_ACCESS_TOKEN from .env.local without exposing secrets in code.
 * 3. Health check route performs live verification of Facebook Page status.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('1. Meta post script exists and supports required flags', () => {
  const scriptPath = path.join(__dirname, '..', 'growth', 'scripts', 'post_to_meta.cjs');
  assert.ok(fs.existsSync(scriptPath), 'growth/scripts/post_to_meta.cjs must exist');

  const content = fs.readFileSync(scriptPath, 'utf-8');
  assert.ok(content.includes('--preview'), 'Must support --preview flag');
  assert.ok(content.includes('--send'), 'Must support --send flag');
  assert.ok(content.includes('--register'), 'Must support --register flag');
  assert.ok(content.includes('FB_PAGE_ID'), 'Must read FB_PAGE_ID');
  assert.ok(content.includes('META_ACCESS_TOKEN'), 'Must read META_ACCESS_TOKEN');
  assert.ok(content.includes('graph.facebook.com'), 'Must call Meta Graph API');
});

test('2. Health check route includes live Meta verification', () => {
  const routePath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'marketing', 'health', 'route.ts');
  const content = fs.readFileSync(routePath, 'utf-8');

  assert.ok(content.includes('FB_PAGE_ID'), 'Health check must read FB_PAGE_ID');
  assert.ok(content.includes('META_ACCESS_TOKEN'), 'Health check must read META_ACCESS_TOKEN');
  assert.ok(content.includes('graph.facebook.com'), 'Health check must query Meta Graph API');
  assert.ok(content.includes('fields=name,id,link,tasks'), 'Health check must query page fields');
});
