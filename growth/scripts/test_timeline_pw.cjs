const { chromium } = require('playwright');
const path = require('path');

async function test() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  const fileUrl = 'file://' + path.resolve('growth/scenes/rent_contract_vs_chest/index.html').replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'networkidle' });

  console.log('Initial active classes:');
  console.log(await page.evaluate(() => {
    return {
      intro: document.getElementById('scene-intro').className,
      fail: document.getElementById('scene-fail').className,
      solution: document.getElementById('scene-solution').className,
      outro: document.getElementById('scene-outro').className,
    };
  }));

  await page.evaluate(() => {
    window.startReelsTimeline({
      tIntro: 0,
      tFail: 2000,
      tSolution: 6000,
      tOutro: 10000,
      totalDurationMs: 14000
    });
  });

  // Wait 3 seconds (so tFail has fired)
  await new Promise(r => setTimeout(r, 3000));

  console.log('Classes after 3s (tFail):');
  const classesAt3s = await page.evaluate(() => {
    return {
      intro: document.getElementById('scene-intro').className,
      fail: document.getElementById('scene-fail').className,
      solution: document.getElementById('scene-solution').className,
      outro: document.getElementById('scene-outro').className,
      subText: document.getElementById('sub-text').innerHTML,
      failComputedStyle: {
        visibility: window.getComputedStyle(document.getElementById('scene-fail')).visibility,
        opacity: window.getComputedStyle(document.getElementById('scene-fail')).opacity,
        display: window.getComputedStyle(document.getElementById('scene-fail')).display,
      },
      introComputedStyle: {
        visibility: window.getComputedStyle(document.getElementById('scene-intro')).visibility,
        opacity: window.getComputedStyle(document.getElementById('scene-intro')).opacity,
        display: window.getComputedStyle(document.getElementById('scene-intro')).display,
      }
    };
  });
  console.log(JSON.stringify(classesAt3s, null, 2));

  await page.screenshot({ path: 'public/demo/test_fail_3s.png' });
  await browser.close();
}

test().catch(console.error);
