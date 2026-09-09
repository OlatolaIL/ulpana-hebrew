import { chromium } from 'playwright';

async function testHashNav() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  await page.addInitScript(() => {
    localStorage.setItem('ulpana_auto_show_guides', 'false');
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
    localStorage.setItem('ulpana_show_floating_feedback', 'false');
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  console.log('1. Page loaded, testing hash #alphabet...');
  await page.evaluate(() => {
    window.location.hash = '#alphabet';
    window.dispatchEvent(new Event('popstate'));
  });
  await page.waitForTimeout(1000);
  console.log('Headings in Propisi:', await page.locator('h1, h2').allInnerTexts());

  // Click on first letter Алеф
  const alef = page.locator('button:has(.font-cursive)').first();
  console.log('Letter button visible:', await alef.isVisible());
  if (await alef.isVisible()) {
    await alef.click();
    await page.waitForTimeout(1000);
    console.log('Letter modal:', await page.locator('.fixed:has-text("Алеф"), [role="dialog"]').count());
    // Close modal
    const closeBtn = page.locator('button:has(.lucide-x)').first();
    if (await closeBtn.isVisible()) await closeBtn.click();
  }

  console.log('2. Testing hash #lesson-1...');
  await page.evaluate(() => {
    window.location.hash = '#lesson-1';
    window.dispatchEvent(new Event('popstate'));
  });
  await page.waitForTimeout(1000);
  console.log('Tabs in Lesson 1:', await page.locator('[title*="Теория"], button:has-text("Теория")').count());

  await browser.close();
  console.log('SUCCESS!');
}

testHashNav().catch(console.error);
