/**
 * Test: Deep Linking Routes and URL Promo Capture
 * Verifies:
 * 1. /lessons/[id]/call/page.tsx exists and redirects to #lesson-${id}/phone with promo capture.
 * 2. /lessons/[id]/stage/[stageId]/page.tsx exists and redirects to #lesson-${id}/${stageId}.
 * 3. /decks/[id]/page.tsx exists and redirects to #decks/${id}.
 * 4. src/app/page.tsx recognizes #decks/ and #deck- in initializeNavigation.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('1. Lesson Call Deep Link page exists and handles promo and redirection', () => {
  const pagePath = path.join(__dirname, '..', 'src', 'app', 'lessons', '[id]', 'call', 'page.tsx');
  assert.ok(fs.existsSync(pagePath), 'Route /lessons/[id]/call must exist');

  const content = fs.readFileSync(pagePath, 'utf-8');
  assert.ok(content.includes('ulpana_pending_promo'), 'Must store promo in localStorage');
  assert.ok(content.includes('#lesson-'), 'Must target #lesson-');
  assert.ok(content.includes('/phone'), 'Must target /phone tab for call simulator');
});

test('2. Lesson Stage Deep Link page exists and handles arbitrary stages', () => {
  const pagePath = path.join(__dirname, '..', 'src', 'app', 'lessons', '[id]', 'stage', '[stageId]', 'page.tsx');
  assert.ok(fs.existsSync(pagePath), 'Route /lessons/[id]/stage/[stageId] must exist');

  const content = fs.readFileSync(pagePath, 'utf-8');
  assert.ok(content.includes('ulpana_pending_promo'), 'Must store promo in localStorage');
  assert.ok(content.includes('#lesson-'), 'Must target #lesson-');
});

test('3. Deck Deep Link page exists and handles deck id', () => {
  const pagePath = path.join(__dirname, '..', 'src', 'app', 'decks', '[id]', 'page.tsx');
  assert.ok(fs.existsSync(pagePath), 'Route /decks/[id] must exist');

  const content = fs.readFileSync(pagePath, 'utf-8');
  assert.ok(content.includes('ulpana_pending_promo'), 'Must store promo in localStorage');
  assert.ok(content.includes('#decks/'), 'Must target #decks/');
});

test('4. src/app/page.tsx supports #decks/ in navigation initializer', () => {
  const homePath = path.join(__dirname, '..', 'src', 'app', 'page.tsx');
  const content = fs.readFileSync(homePath, 'utf-8');

  assert.ok(content.includes("#decks/"), 'page.tsx must parse #decks/');
  assert.ok(content.includes("setActiveDeckId"), 'page.tsx must set active deck id on navigation');
});
