import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const PUBS_PATH = path.resolve(ROOT, 'growth/data/publications.json');
const REGISTRY_PATH = path.resolve(ROOT, 'growth/lessons_video_registry.json');

const REPO = 'OlatolaIL/ulpana-hebrew';
const RELEASE_TAG = 'v-media-lessons-02-05';

const LESSON_METAS = {
  2: {
    clean: {
      topic: 'В кафе: заказы и напитки',
      scenario: 'Aroma в Тель-Авиве • Перевёрнутый кофе',
      titles: {
        youtube: 'Как заказать капучино в Тель-Авиве и не опозориться ☕️ #shorts #иврит',
        telegram: '☕️ Почему израильский кофе «перевёрнутый» и как правильно его заказать',
        instagram: 'Заказал кофе с перевернутым молоком? 😂 Вот как надо на иврите 👇',
        tiktok: 'Когда впервые заказываешь кофе в Ароме в Израиле 😳 #иврит #израиль',
        facebook: 'Израильский кофейный этикет: почему капучино здесь называют «кафэ афух»',
      },
      ruleSummary: 'В Израиле капучино — это קָפֶה הָפוּךְ (кафэ́ афу́х, буквально «перевёрнутый кофе»). Мужчина говорит רוֹצֶה (роцэ́), женщина — רוֹצָה (роца́).',
    },
    spicy: {
      topic: 'В баре: желания и флирт',
      scenario: 'Бар в Тель-Авиве • Случайное признание официантке',
      titles: {
        youtube: 'Случайно признался в любви официантке на иврите 🤦‍♂️ #shorts #иврит',
        telegram: '🔥 Главный конфуз на свидании: роцэ́ vs роца́',
        instagram: 'Хотел стакан воды, а предложил себя официантке 😅 Разбор ошибки 👇',
        tiktok: 'Когда перепутал мужской и женский род глагола «хотеть» 💀 #иврит',
        facebook: 'Курьёз на свидании в Тель-Авиве: как род глагола решает всё',
      },
      ruleSummary: 'Мужчина говорит רוֹצֶה (роцэ́), а רוֹצָה (роца́) — говорит женщина! Для заказа воды говори «אֲנִי רוֹצֶה מַיִם», чтобы не устраивать каминг-аут перед всей верандой.',
    },
  },
  3: {
    clean: {
      topic: 'Страны и языки: в такси',
      scenario: 'Такси в Тель-Авиве • Скороговорка водителя',
      titles: {
        youtube: 'Сказал израильскому таксисту, что знаешь иврит 😱 #shorts #иврит #израиль',
        telegram: '🚕 Спасительная фраза в израильском такси, когда водитель заговорил со скоростью пулемёта',
        instagram: 'Никогда не говори таксисту в Израиле, что говоришь на иврите, без этой фразы 👇',
        tiktok: 'Мой уровень иврита vs израильский таксист на Аялоне 💀 #иврит',
        facebook: 'Как выжить в диалоге с израильским таксистом: фраза первой необходимости',
      },
      ruleSummary: 'Золотое правило выживания: фраза «רַק כַּמָּה מִלִּים, לְאַט בְּבַקָּשָׁה!» (Рак ка́ма мили́м, ле-а́т бе-вакаша́ — Только пару слов, помедленнее, пожалуйста!).',
    },
    spicy: {
      topic: 'Языки vs Анатомия',
      scenario: 'Вечеринка во Флорентине • Губы vs Язык',
      titles: {
        youtube: 'Хотел сказать «говорю на двух языках», а сказал про губы... 🤦‍♂️ #shorts #иврит',
        telegram: '⚠️ Сафа́ vs Сфата́им: как не превратить разговор о языках в ночной кошмар',
        instagram: 'Анатомия vs лингвистика: одна буква меняет весь смысл 😅👇',
        tiktok: 'Когда хотел похвастаться полиглотством, но иврит подставил 😭 #иврит',
        facebook: 'Языковые ловушки иврита: как не перепутать язык общения и части тела',
      },
      ruleSummary: 'Язык как речь — это שָׂפָה (сафа́)! Губы — שְׂפָתַיִם (сфата́им). А орган во рту — לָשׁוֹן (лашóн). Не путай анатомию с лингвистикой!',
    },
  },
  4: {
    clean: {
      topic: 'Кто это и что это: за столом',
      scenario: 'В гостях у марокканской бабушки • Таинственный хамин',
      titles: {
        youtube: 'Спросил «КТО ЭТО?» про суп у марокканской бабушки 😱 #shorts #иврит',
        telegram: '🍲 Ми зэ vs Ма зэ: как не обидеть хозяйку за шаббатним столом',
        instagram: 'Оно живое?! Разница между «кто это» и «что это» в иврите 👇',
        tiktok: 'Когда пробуешь странную израильскую еду и путаешь слова 💀 #иврит #израиль',
        facebook: 'Этикет израильского застолья: почему нельзя спрашивать «ми зэ» про еду',
      },
      ruleSummary: 'Про людей спрашиваем מִי זֶה? (ми зэ — кто это?), а про еду и неодушевленные предметы — מַה זֶּה? (ма зэ — что это?).',
    },
    spicy: {
      topic: 'Знакомство: одушевленность',
      scenario: 'Бар • Знакомство с пассией друга',
      titles: {
        youtube: 'Назвал девушку друга «ЧТО ЭТО» вместо «КТО ЭТО» 🤦‍♂️ #shorts #иврит',
        telegram: '⚡️ Как не уехать в травмпункт после знакомства: Ми зот vs Ма зэ',
        instagram: 'Сказал «что это» живому человеку? Вот почему так делать нельзя 👇',
        tiktok: 'Худший способ познакомиться с девушкой друга в Тель-Авиве 💀 #иврит',
        facebook: 'Опасности грамматики: почему нельзя называть человека неодушевленным местоимением',
      },
      ruleSummary: 'Живой человек — это מִי זֹאת? (ми зот — кто это, ж.р.) или מִי זֶה? (ми зэ — кто это, м.р.). Сказать человеку «ма зэ» — оскорбление!',
    },
  },
  5: {
    clean: {
      topic: 'Супермаркет и рынок: яблоки',
      scenario: 'Киоск соков на Дизенгоф • Картофельный сок',
      titles: {
        youtube: 'Заказал сок из картошки вместо апельсинов в Тель-Авиве 🤦‍♂️ #shorts #иврит',
        telegram: '🍊 Семейство яблок в иврите: как случайно не выпить картофельный сок',
        instagram: 'Тапу́з vs Тапу́ах адамá: как не опозориться у киоска с соками 👇',
        tiktok: 'Продавец фреша посмотрел на меня как на безумца 😳 #иврит #израиль',
        facebook: 'Лексика израильского рынка: почему все фрукты и овощи вертятся вокруг яблок',
      },
      ruleSummary: 'תַּפּוּחַ (тапу́ах) — яблоко, תַּפּוּז (тапу́з) — апельсин («золотое яблоко»), а תַּפּוּחַ אֲדָמָה (тапу́ах адамá) — картошка!',
    },
    spicy: {
      topic: 'Рынок Кармель: фонетика и сленг',
      scenario: 'Рынок Кармель • Оливки vs Буква номер 7',
      titles: {
        youtube: 'Главная ошибка на рынке Кармель, от которой ржёт весь базар 🤦‍♂️ #shorts #иврит',
        telegram: '🫒 За́ит vs За́ин: как не купить на рынке то, за что банят во всех соцсетях',
        instagram: 'Одна буква на рынке — и ты звезда стендапа 😅 Учим правильное слово 👇',
        tiktok: 'Никогда не путай последнюю букву в слове «маслина» на иврите 💀 #иврит #шук',
        facebook: 'Базарный иврит: почему внимательность к букве тав спасает от красных ушей',
      },
      ruleSummary: 'Маслина/оливка — это строго זַיִת (за́ит), мн.ч. זֵיתִים (зейти́м)! Не путайте конечную букву ת с ן.',
    },
  },
};

const PLATFORMS_MAP = [
  {
    channel: 'youtube',
    code: 'YT',
    account: 'Ульпан Алеф',
    format: 'short_video',
    medium: 'shorts',
    ctaNote: 'в описании 👇',
  },
  {
    channel: 'telegram',
    code: 'TG',
    account: '@ulpana_il',
    format: 'short_video',
    medium: 'channel',
    ctaNote: 'в посте 👇',
  },
  {
    channel: 'instagram',
    code: 'INSTA',
    account: 'Instagram @ulpana_il',
    format: 'short_video',
    medium: 'reels',
    ctaNote: 'в шапке профиля 👆',
  },
  {
    channel: 'tiktok',
    code: 'TIKTOK',
    account: 'TikTok @ulpana_il',
    format: 'short_video',
    medium: 'profile',
    ctaNote: 'в профиле 🔗',
  },
  {
    channel: 'facebook',
    code: 'FB',
    account: 'Facebook Ульпан Алеф',
    format: 'short_video',
    medium: 'reels',
    ctaNote: 'под видео 👇',
  },
];

export function buildCampaigns() {
  const existingPubs = fs.existsSync(PUBS_PATH) ? JSON.parse(fs.readFileSync(PUBS_PATH, 'utf8')) : [];
  const existingIds = new Set(existingPubs.map((p) => p.id));

  const newPubs = [];

  for (let l = 2; l <= 5; l++) {
    const pad = String(l).padStart(2, '0');
    for (const variant of ['clean', 'spicy']) {
      const meta = LESSON_METAS[l][variant];
      for (const p of PLATFORMS_MAP) {
        const id = `pub-${p.code.toLowerCase()}-l${pad}-${variant}`;
        const filename = `lesson_${pad}_${variant}_${p.channel === 'youtube' ? 'youtube_shorts' : p.channel === 'facebook' ? 'facebook_reels' : p.channel === 'instagram' ? 'instagram_reels' : p.channel}.mp4`;
        const videoCdnUrl = `https://github.com/${REPO}/releases/download/${RELEASE_TAG}/${filename}`;
        const promo = p.code;
        const fullUrl = `https://ulpana-hebrew.vercel.app/#lesson-${l}?promo=${promo}&utm_source=${p.channel}&utm_medium=${p.medium}&utm_campaign=lesson_${pad}_${variant}`;

        const caption = `${meta.titles[p.channel]}\n\n${meta.ruleSummary}\n\nВ интерактивном тренажёре «Ульпан Алеф» ты отрабатываешь живую речь с ИИ и говоришь свободно без паники!\n\n🎁 Промокод на 30 дней бесплатного премиума: ${promo}\n👉 Начни Урок ${l} прямо сейчас: ${fullUrl}`;

        const pubItem = {
          id,
          date: '2026-09-27',
          channel: p.channel,
          channelAccount: p.account,
          format: p.format,
          title: meta.titles[p.channel],
          campaignTitle: `Урок ${l}: ${p.channel.toUpperCase()} (${variant === 'clean' ? 'Clean' : 'Spicy'})`,
          version: 'v1.0',
          videoPath: videoCdnUrl,
          caption,
          targetDeepLink: `/lesson/${l}`,
          promoCode: promo,
          fullUrlWithPromo: fullUrl,
          livePostUrl: '',
          status: 'draft',
          notes: `${p.channel.toUpperCase()} (${variant.toUpperCase()}): Урок ${l} • ${meta.scenario} • промокод ${promo}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (existingIds.has(id)) {
          const idx = existingPubs.findIndex((x) => x.id === id);
          existingPubs[idx] = { ...existingPubs[idx], ...pubItem, updatedAt: new Date().toISOString() };
        } else {
          newPubs.push(pubItem);
        }
      }
    }
  }

  const merged = [...existingPubs, ...newPubs];
  fs.writeFileSync(PUBS_PATH, JSON.stringify(merged, null, 2), 'utf8');
  console.log(`✅ Реестр публикаций обновлен! Всего кампаний: ${merged.length} (новых добавлено: ${newPubs.length})`);
}

buildCampaigns();
