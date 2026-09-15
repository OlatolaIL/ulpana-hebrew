const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = 'C:/Users/azrie/Documents/antigravity/goofy-maxwell-lesson5-practice';
const { chromium } = require(require.resolve('playwright', { paths: [root] }));
require(path.join(root, 'tests/register.cjs'));
const { createGuestProfile } = require(path.join(root, 'src/lib/storage.ts'));
const profile = {...createGuestProfile(), id:'synthetic-lesson5-review',name:'Проверка',gender:'female',isLoggedIn:true,subscriptionTier:'free'};
const result = {screens:[],pageErrors:[],method:'Actual Next application in Edge; synthetic account, intercepted auth/sync, all other API and external requests blocked'};
(async()=>{
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  try {
    const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});
    await context.addInitScript(p=>{localStorage.setItem('hebrew_app_profile_v1',JSON.stringify(p));localStorage.setItem('hebrew_app_profile_v1:'+p.id,JSON.stringify(p));localStorage.setItem('ulpana_show_floating_feedback','false');},profile);
    await context.route('**/*',route=>{
      const u=new URL(route.request().url());
      if(u.hostname!=='127.0.0.1')return route.abort();
      if(u.pathname==='/api/auth/me')return route.fulfill({json:{authenticated:true,user:{id:profile.id,name:profile.name,subscriptionTier:'free'},gender:'female'}});
      if(u.pathname==='/api/user/sync')return route.fulfill({json:{userId:profile.id,revision:1,lessonProgress:{},personalVocabulary:[],flashcardStats:{}}});
      if(u.pathname.startsWith('/api/'))return route.fulfill({status:503,json:{error:'offline UI review'}});
      return route.continue();
    });
    const page=await context.newPage();page.on('pageerror',e=>result.pageErrors.push(String(e)));
    await page.goto('http://127.0.0.1:3129/#lesson-5',{waitUntil:'domcontentloaded',timeout:30000});
    await page.getByText('Числительные 1–10 с существительными мужского рода (цена в шекелях)',{exact:true}).waitFor({timeout:30000});
    const table=page.locator('table').filter({hasText:'שְׁנֵי שְׁקָלִים'});
    const section=page.getByRole('heading',{name:'Числительные 1–10 с существительными мужского рода (цена в шекелях)',exact:true}).locator('..');
    assert.equal(await table.count(),1);
    for(const width of [390,320]){
      await page.setViewportSize({width,height:844});
      await section.scrollIntoViewIfNeeded();
      const layout=await section.evaluate(el=>({pageWidth:document.documentElement.scrollWidth,viewport:window.innerWidth,sectionWidth:el.getBoundingClientRect().width,cards:el.querySelector('.sm\\:hidden').children.length,cardText:el.querySelector('.sm\\:hidden').textContent}));
      const screenshot=path.join(__dirname,`lesson5-d413-table-${width}.png`);
      await page.screenshot({path:screenshot,fullPage:false});
      result.screens.push({width,layout,screenshot});
      assert.equal(layout.cards,10);
      assert.ok(layout.pageWidth<=width+1,'Page must not overflow horizontally');
    }
    result.buttons=await page.getByRole('button').allTextContents();
  } catch(e){result.error=String(e.stack||e);process.exitCode=1;}
  finally {await browser.close();fs.writeFileSync(path.join(__dirname,'lesson5-d413-browser.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result));}
})();
