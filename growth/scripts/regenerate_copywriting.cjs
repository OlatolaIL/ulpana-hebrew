const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../');
const scenarios = JSON.parse(fs.readFileSync(path.resolve(ROOT, 'growth/data/factory_scenarios_20.json'), 'utf8'));

for (const sc of scenarios) {
  const dir = path.resolve(ROOT, 'growth/output/campaigns', sc.id);
  if (!fs.existsSync(dir)) continue;

  const p1 = sc.phrases[0];
  const p2 = sc.phrases[1];
  const p3 = sc.phrases[2];
  const p4 = sc.phrases[3];

  // 1. Facebook
  const fb = `${sc.badge}: 4 готовые фразы на иврите

${sc.subtitle}

Включайте видео со звуком 🔊 — внутри правильное нативное произношение:

${p1.badge}:
${p1.he}
${p1.trans}

${p2.badge}:
${p2.he}
${p2.trans}

${p3.badge}:
${p3.he}
${p3.trans}

${p4.badge}:
${p4.he}
${p4.trans}

Сохраняйте себе в закладки, чтобы нужные слова всегда были под рукой!
(Ссылка на интерактивный тренажёр живых диалогов — в первом комментарии к этому видео 👇)
`;
  fs.writeFileSync(path.resolve(dir, 'post_facebook.txt'), fb, 'utf8');

  // 2. Telegram HTML
  const tg = `<b>${sc.badge}: 4 готовые фразы на иврите</b>

<i>${sc.subtitle}</i>

🔊 <b>Слушайте произношение на карточках:</b>

<b>${p1.badge}</b>
<code>${p1.he}</code>
<i>${p1.trans}</i>

<b>${p2.badge}</b>
<code>${p2.he}</code>
<i>${p2.trans}</i>

<b>${p3.badge}</b>
<code>${p3.he}</code>
<i>${p3.trans}</i>

<b>${p4.badge}</b>
<code>${p4.he}</code>
<i>${p4.trans}</i>

💡 <b>Хотите говорить на иврите свободно и без страха звонить?</b>
Отрабатывайте живые диалоги в интерактивном тренажёре «Ульпан Алеф».

👉 <a href="https://ulpana-hebrew.vercel.app/#lesson-${sc.lessonRef}?promo=TG&utm_source=telegram&utm_medium=channel&utm_campaign=${sc.id}">Начать практику (30 дней бесплатно с промокодом TG)</a>
`;
  fs.writeFileSync(path.resolve(dir, 'post_telegram.html'), tg, 'utf8');

  // 3. Instagram
  const ig = `${sc.badge}: 4 фразы на иврите

${sc.subtitle}

Листайте карусель 👉 внутри 4 готовые фразы с правильным ударением:

${p1.badge}
${p1.he}
${p1.trans}

${p2.badge}
${p2.he}
${p2.trans}

${p3.badge}
${p3.he}
${p3.trans}

${p4.badge}
${p4.he}
${p4.trans}

💾 Обязательно сохраняйте в закладки, чтобы нужные слова всегда были под рукой!

🎁 Хотите потренироваться отвечать и говорить на иврите без ступора и переводчика?
Переходите по ссылке в шапке профиля @ulpana_alef — там открыт интерактивный тренажёр живых диалогов и звонков.
Промокод на 30 дней бесплатного доступа: INSTA ✨

💬 Напишите «ИВРИТ» в комментариях 👇 — и мы пришлём прямую ссылку в Директ!

#иврит #урокииврита #ивритдляначинающих #ивритизраиль #ульпан #ульпаналеф #репатриация #жизньвизраиле #олимхадашим #разговорныйиврит
`;
  fs.writeFileSync(path.resolve(dir, 'post_instagram.txt'), ig, 'utf8');

  // 4. YouTube Shorts
  const yt = `${sc.titleLine1} ${sc.titleLine2} | Иврит без паники

${sc.subtitle}

0:00 - Обзор темы
0:03 - ${p1.badge}
0:08 - ${p2.badge}
0:13 - ${p3.badge}
0:18 - ${p4.badge}

🔥 Интерактивный тренажёр живой речи «Ульпан Алеф» (30 дней бесплатно по промокоду YOUTUBE):
👉 https://ulpana-hebrew.vercel.app/#lesson-${sc.lessonRef}?promo=YOUTUBE&utm_source=youtube&utm_medium=shorts&utm_campaign=${sc.id}

#иврит #ульпан #израиль #репатриация #shorts
`;
  fs.writeFileSync(path.resolve(dir, 'post_youtube_shorts.txt'), yt, 'utf8');
}

console.log('✅ Тексты сопровождения для всех 20 кампаний обновлены и согласованы!');
