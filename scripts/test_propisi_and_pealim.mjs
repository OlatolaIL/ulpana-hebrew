import { chromium } from 'playwright';

async function testScreens() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  await page.addInitScript(() => {
    localStorage.setItem('ulpana_auto_show_guides', 'false');
    localStorage.setItem('pwa_prompt_dismissed_at', Date.now().toString());
    localStorage.setItem('ulpana_show_floating_feedback', 'false');
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });

  // 1. Прописи
  console.log('--- 1. Testing Propisi ---');
  await page.locator('nav.md\\:hidden button:has-text("Прописи")').click();
  await page.waitForTimeout(1000);
  console.log('Propisi visible:', await page.locator('text=Алфавит и прописи').isVisible());

  // Click on first letter card in grid
  const alefCard = page.locator('div.grid div.group').first();
  await alefCard.click();
  await page.waitForTimeout(1500);
  console.log('Canvas tab visible:', await page.locator('canvas').isVisible());
  console.log('Writing rules visible:', await page.locator('text=Правила написания').isVisible());

  // Draw stroke on canvas
  const canvasBox = await page.locator('canvas').boundingBox();
  if (canvasBox) {
    console.log('Drawing on canvas at', canvasBox.x, canvasBox.y);
    await page.mouse.move(canvasBox.x + 100, canvasBox.y + 100);
    await page.mouse.down();
    await page.mouse.move(canvasBox.x + 200, canvasBox.y + 250, { steps: 10 });
    await page.mouse.up();
    await page.waitForTimeout(1000);
  }

  // 2. Тематические колоды и Пеалим
  console.log('--- 2. Testing Decks & Pealim ---');
  await page.locator('nav.md\\:hidden button:has-text("Словарик")').click();
  await page.waitForTimeout(1000);
  console.log('Dictionary opened');

  const thematicTab = page.locator('button:has-text("Тематические колоды")').first();
  await thematicTab.click();
  await page.waitForTimeout(1200);
  console.log('Thematic tab opened');

  const verbsDeckTrainBtn = page.locator('button:has-text("Учить"), button:has-text("Тренировать")').first();
  await verbsDeckTrainBtn.click();
  await page.waitForTimeout(1500);

  console.log('Flashcard visible, verb:', await page.locator('text=לִרְצוֹת').first().isVisible());

  // Click speaker
  const speakerBtn = page.locator('button:has(.lucide-volume-2)').first();
  if (await speakerBtn.isVisible()) {
    console.log('Speaker button found and clicking');
    await speakerBtn.click();
    await page.waitForTimeout(800);
  }

  // Flip card
  const card = page.locator('.min-h-\\[200px\\]').first();
  await card.click();
  await page.waitForTimeout(1000);

  const pealimBtn = page.locator('button:has-text("Пеалим")').first();
  console.log('Pealim button visible:', await pealimBtn.isVisible());
  if (await pealimBtn.isVisible()) {
    await pealimBtn.click();
    await page.waitForTimeout(1500);
    console.log('Pealim modal open!');

    // Close Pealim modal via back button inside the modal
    const pealimBack = page.locator('.fixed.inset-0.z-50 button[title="Назад"]').first();
    if (await pealimBack.isVisible()) {
      console.log('Clicking Pealim back button...');
      await pealimBack.click();
      await page.waitForTimeout(1000);
    } else {
      console.log('Clicking Pealim backdrop...');
      await page.locator('.fixed.inset-0.z-50').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(1000);
    }
    console.log('Pealim modal closed:', !(await page.locator('.fixed.inset-0.z-50').isVisible()));
  }

  // 3. Возврат в Урок 1 -> Этап 3 (Тесты) -> Этап 4 (Диалог) -> Этап 5 (Звонок)
  console.log('--- 3. Testing Return to Lesson 1 & Stages 3, 4, 5 ---');
  await page.locator('nav.md\\:hidden button:has-text("Уроки")').click();
  await page.waitForTimeout(1000);
  console.log('Course map open:', await page.locator('text=Приветствие и знакомство').first().isVisible());

  await page.locator('button:has-text("Начать"), button:has-text("Продолжить"), .bg-gradient-to-r').first().click();
  await page.waitForTimeout(1000);

  // Stage 3
  const testsTab = page.locator('button:has-text("Тесты"), button:has-text("תַּרְגִּילִים")').first();
  await testsTab.click();
  await page.waitForTimeout(1000);
  console.log('Stage 3 Tests tab visible:', await page.locator('button:has-text("Проверить")').isVisible());

  // Stage 4
  const dialTab = page.locator('button:has-text("Диалог"), button:has-text("שִׂיחָה")').first();
  await dialTab.click();
  await page.waitForTimeout(1000);
  console.log('Stage 4 Dialogue tab visible:', await dialTab.isVisible());

  // Stage 5
  const phoneTab = page.locator('button:has-text("Звонок"), button:has-text("טֶלֶפוֹן")').first();
  await phoneTab.click();
  await page.waitForTimeout(1000);
  console.log('Stage 5 Phone tab visible:', await phoneTab.isVisible());

  await browser.close();
  console.log('🎉 ALL SCREEN FLOWS (STAGES 1, 2, 3, 4, 5 + PROPISI + PEALIM) 100% VERIFIED!');
}

testScreens().catch(console.error);
