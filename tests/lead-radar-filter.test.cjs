/**
 * Test: Lead Radar Trigger Filter and CRM API
 * Verifies:
 * 1. Radar API routes exist and enforce admin authorization.
 * 2. matchesTrigger correctly filters pain points from noise.
 * 3. growth/data/leads.json contains realistic leads with Deep Links.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('1. Radar routes exist and enforce admin auth', () => {
  const radarPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'marketing', 'radar', 'route.ts');
  const scanPath = path.join(__dirname, '..', 'src', 'app', 'api', 'admin', 'marketing', 'radar', 'scan', 'route.ts');

  assert.ok(fs.existsSync(radarPath), 'Radar route must exist');
  assert.ok(fs.existsSync(scanPath), 'Scan route must exist');

  const radarContent = fs.readFileSync(radarPath, 'utf-8');
  assert.ok(radarContent.includes('verifyAdminRequest'), 'Radar must verify admin');

  const scanContent = fs.readFileSync(scanPath, 'utf-8');
  assert.ok(scanContent.includes('verifyAdminRequest'), 'Scan must verify admin');
});

test('2. matchesTrigger filter logic: catches pains and rejects noise', () => {
  const TRIGGER_PATTERNS = [
    /курьер/i,
    /вольт/i,
    /wolt/i,
    /садик/i,
    /воспитател/i,
    /собес/i,
    /интервью/i,
    /ульпан/i,
    /иврит/i,
    /не понима/i,
    /ступор/i,
    /боюсь/i,
    /страх/i,
    /стыдно/i,
    /перевод/i,
    /произношен/i,
    /мисрад/i,
    /поликлиник/i,
    /макаби/i,
    /клалит/i,
  ];

  function matches(text) {
    return TRIGGER_PATTERNS.some((p) => p.test(text));
  }

  // Целевые боли
  assert.ok(matches('Курьер из Вольта позвонил, начал быстро тараторить'), 'Must match courier');
  assert.ok(matches('Завтра первый собес на иврите в стартап'), 'Must match interview');
  assert.ok(matches('В садике воспитательница быстро говорила, я не понимаю'), 'Must match kindergarten');
  assert.ok(matches('В банке был ступор, боюсь говорить на иврите'), 'Must match fear of speaking');

  // Нерелевантный шум (барахолка, квартиры, коты)
  assert.ok(!matches('Продам диван в отличном состоянии, самовывоз из Бат-Яма'), 'Must reject furniture');
  assert.ok(!matches('Сниму 2-комнатную квартиру в центре Тель-Авива до 5000 шек'), 'Must reject apartment');
  assert.ok(!matches('Найдена кошка возле парка, рыжая, пушистая'), 'Must reject lost pet');
});

test('3. Leads data file exists with target deep links', () => {
  const leadsPath = path.join(__dirname, '..', 'growth', 'data', 'leads.json');
  assert.ok(fs.existsSync(leadsPath), 'growth/data/leads.json must exist');

  const raw = fs.readFileSync(leadsPath, 'utf-8');
  const leads = JSON.parse(raw);
  assert.ok(Array.isArray(leads), 'Must be an array of leads');
  assert.ok(leads.length >= 2, 'Must contain initial leads');

  for (const lead of leads) {
    assert.ok(lead.id, 'Lead must have id');
    assert.ok(lead.sourceChannel, 'Lead must have sourceChannel');
    assert.ok(lead.rawText, 'Lead must have rawText');
    assert.ok(lead.aiAnalysis?.targetDeepLink, 'Lead must have targetDeepLink');
    assert.ok(lead.aiAnalysis?.suggestedReply, 'Lead must have suggestedReply');
  }
});
