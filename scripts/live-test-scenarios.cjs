const { NextRequest } = require('next/server');
const { createSessionToken } = require('../src/lib/auth.ts');
const { POST: phonePOST } = require('../src/app/api/ai/phone/route.ts');
const { getLessonPhoneScenario } = require('../src/data/phoneScenarios.ts');
const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');

async function callPhone(token, lessonNum, gender, messages, callType) {
  const req = new NextRequest('http://localhost/api/ai/phone', {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie: 'ulpana_session=' + token },
    body: JSON.stringify({
      lessonNumber: lessonNum,
      level: 'alef',
      userGender: gender,
      provider: 'groq',
      messages,
      callType
    })
  });
  const res = await phonePOST(req);
  return res.json();
}

async function runScenario(token, lessonNum, title, gender, studentTurns) {
  const lesson = DETAILED_LESSONS[lessonNum];
  const sc = getLessonPhoneScenario(lesson, gender);
  
  console.log('\n' + '='.repeat(70));
  console.log(`🎙️ УРОК ${lessonNum}: ${title} (${gender === 'female' ? 'Женщина' : 'Мужчина'})`);
  console.log(`   Собеседник: ${sc.callerName} (${sc.callerRole}) | Звонок: ${sc.callType === 'incoming' ? 'Входящий' : 'Исходящий'}`);
  console.log('='.repeat(70));

  console.log(`\n[Начало звонка] ${sc.callerName}: ${sc.initialGreeting.hebrew}`);
  console.log(`                [${sc.initialGreeting.transcription}]`);
  console.log(`                «${sc.initialGreeting.translation}»`);

  const messages = [{ role: 'assistant', content: sc.initialGreeting.hebrew }];

  for (let round = 0; round < studentTurns.length; round++) {
    const studentText = studentTurns[round];
    console.log(`\n🗣️ [Ученик, Раунд ${round + 1}]: ${studentText}`);
    messages.push({ role: 'user', content: studentText });

    const aiRes = await callPhone(token, lessonNum, gender, messages, sc.callType);
    console.log(`🤖 [${sc.callerName} (ИИ)]: ${aiRes.hebrew}`);
    console.log(`   Транскрипция: ${aiRes.transcription}`);
    console.log(`   Перевод: «${aiRes.translation}»`);
    console.log(`   Движок: ${aiRes.engine} | Завершён: ${aiRes.isCompleted} | Повесить трубку: ${aiRes.shouldHangUp}`);

    messages.push({ role: 'assistant', content: aiRes.hebrew });

    if (aiRes.shouldHangUp) {
      console.log('📴 [Звонок завершён собеседником]');
      break;
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
}

async function main() {
  const token = await createSessionToken({ id: 'live-tester-multi', name: 'Tester', subscriptionTier: 'free' });

  // 1. Урок 1: Входящий звонок от соседа Ноама (знакомство)
  await runScenario(token, 1, 'Знакомство с соседом Ноамом (Входящий звонок)', 'male', [
    'הַלּוֹ נוֹעַם, שָׁלוֹם! הַכֹּל טוֹב, תּוֹדָה.',
    'נָעִים מְאוֹד, קוֹרְאִים לִי דָּוִד, אֲנִי גָּר בְּדִירָה 5.',
    'תּוֹדָה רַבָּה נוֹעַם, שֶׁיִּהְיֶה יוֹם מְעֻלֶּה! לְהִתְרָאוֹת!'
  ]);

  await new Promise((r) => setTimeout(r, 3000));

  // 2. Урок 2: Исходящий звонок в Кафе Арома (заказ кофе, женщина)
  await runScenario(token, 2, 'Заказ кофе навынос в Ароме (Женщина)', 'female', [
    'שָׁלוֹם! אֲנִי רוֹצָה קָפֶה גָּדוֹל עִם חָלָב, בְּבַקָּשָׁה.',
    'בְּלִי סֻכָּר, תּוֹדָה. וְכַמָּה זֶה עוֹלֶה?',
    'מְעֻלֶּה, אֲנִי בָּאָה לָקַחַת עוֹד עֶשֶׂר דַּקּוֹת. תּוֹדָה וּבַיי!'
  ]);

  await new Promise((r) => setTimeout(r, 3000));

  // 3. Урок 7: Исходящий звонок хозяину квартиры Эли
  await runScenario(token, 7, 'Аренда квартиры у Эли (3 комнаты)', 'male', [
    'שָׁלוֹם אֵלִי! אֲנִי מְחַפֵּשׂ דִּירָה שֶׁל שְׁלוֹשָׁה חֲדָרִים בַּמֶּרְכָּז.',
    'כֵּן, כַּמָּה זֶה עוֹלֶה? וְיֵשׁ מְקָרֵר בַּדִּירָה?',
    'מְעֻלֶּה! נִתְרָאֶה הַיּוֹם בְּשֶׁבַע בָּעֶרֶב. תּוֹדָה וּלְהִתְרָאוֹת!'
  ]);
}

main().catch(console.error);