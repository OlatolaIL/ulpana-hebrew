const { test } = require('node:test');
const assert = require('node:assert/strict');
const { NextRequest } = require('next/server');
test('feedback cannot acknowledge delivery when both storage and notification are unavailable', async () => {
  const saved = process.env.TELEGRAM_BOT_TOKEN;
  delete process.env.TELEGRAM_BOT_TOKEN;
  try {
    const { POST } = require('../src/app/api/feedback/route.ts');
    const result = await POST(new NextRequest('http://localhost/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: 'Synthetic test only' }) }));
    assert.equal(result.status, 503);
    assert.equal((await result.json()).success, undefined);
  } finally { if (saved !== undefined) process.env.TELEGRAM_BOT_TOKEN = saved; }
});
