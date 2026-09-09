import { chromium } from 'playwright';
import fs from 'fs';

async function test() {
  console.log('Launching Chrome...');
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });
  console.log('Creating context with video...');
  if (!fs.existsSync('./public/demo')) {
    fs.mkdirSync('./public/demo', { recursive: true });
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: './public/demo',
      size: { width: 390, height: 844 },
    },
  });
  const page = await context.newPage();
  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);
  console.log('Closing page and context to save video...');
  await page.close();
  await context.close();
  await browser.close();
  console.log('Video saved successfully!');
}

test().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
