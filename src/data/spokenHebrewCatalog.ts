import { SpokenHebrewGuide, SpokenHebrewPhrase } from '@/types';

/**
 * База данных и справочник живой разговорной речи (שְׂפַת דִּבּוּר)
 * для всех 100 уроков программы израильского ульпана.
 * 
 * Освещает расхождения между строгой академической нормой (которую произносит синтезатор речи)
 * и реальным живым языком израильтян на улице, в магазине и на работе.
 */

export const SPECIFIC_SPOKEN_GUIDES: Record<number, SpokenHebrewGuide> = {
  // Урок 1: Приветствие и знакомство
  1: {
    lessonId: 1,
    topicTitle: 'Приветствия и живые обращения',
    stressRuleNote: {
      word: 'שָׁלוֹם / יוֹפִי',
      academic: 'шалóм (мильра), йофӣ (мильра)',
      spoken: 'шалóм, йóфи (мильэ́йль)',
      explanation: 'В слове יוֹפִי («отлично/здорово») израильтяне всегда ставят ударение на первый слог (йóфи), хотя книжная норма требует йофӣ.',
    },
    phrases: [
      {
        hebrew: 'מַה נִּשְׁמַע?',
        transcription: 'ма нишмá?',
        translation: 'Как дела? / Что слышно?',
        context: 'Самое популярное неформальное приветствие в Израиле',
        category: 'daily',
      },
      {
        hebrew: 'מַה קוֹרֶה?',
        transcription: 'ма корэ́?',
        translation: 'Что происходит? / Как оно?',
        context: 'Дружеское живое приветствие на улице и среди молодежи',
        category: 'daily',
      },
      {
        hebrew: 'מַה הָעִנְיָנִים?',
        transcription: 'ма hа-инйани́м?',
        translation: 'Как делишки?',
        context: 'Теплое неформальное обращение',
        category: 'daily',
      },
      {
        hebrew: 'הַכֹּל בְּסֵדֶר',
        transcription: 'hа-коль бэсэ́дэр',
        translation: 'Всё в порядке',
        context: 'Универсальный стандартный ответ',
        category: 'daily',
      },
      {
        hebrew: 'יַאלְלָה בַּיי!',
        transcription: 'йáлла бай!',
        translation: 'Давай, пока!',
        context: 'Самое частое прощание в разговорном иврите',
        category: 'slang',
      },
    ],
    slangAndShortcuts: [
      {
        term: 'יוֹפִי!',
        transcription: 'йóфи!',
        meaning: 'Отлично! Здорово!',
        usageTip: 'Ударение всегда на «о»: йóфи, а не йофӣ.',
      },
      {
        term: 'יַאלְלָה',
        transcription: 'йáлла',
        meaning: 'Давай! Погнали!',
        usageTip: 'Арабское заимствование, ставшее основой израильского сленга.',
      },
    ],
  },

  // Урок 2: В кафе: заказы и напитки
  2: {
    lessonId: 2,
    topicTitle: 'Заказы в кафе и разговорная вежливость',
    stressRuleNote: {
      word: 'בְּבַקָּשָׁה / סְלִיחָה',
      academic: 'бэвакашá, слихá',
      spoken: 'бэвакашá, слихá',
      explanation: 'В кафе израильтяне говорят очень коротко и по делу, вместо длинных книжных фраз используют краткую форму «אֶפְשָׁר...».',
    },
    phrases: [
      {
        hebrew: 'אֶפְשָׁר קָפֶה הָפוּךְ?',
        transcription: 'эфшáр кáфэ hафýх?',
        translation: 'Можно капучино?',
        context: 'В Израиле классический капучино называют «кофе наоборот» (кафе hафух)',
        category: 'daily',
      },
      {
        hebrew: 'קָפֶה קָצָר / אָרֹךְ',
        transcription: 'кáфэ кацáр / арóх',
        translation: 'Одинарный эспрессо / лунго',
        context: 'При заказе эспрессо',
        category: 'daily',
      },
      {
        hebrew: 'לָשֶׁבֶת אוֹ לָקַחַת?',
        transcription: 'лашэ́вэт о лакáхат?',
        translation: 'Здесь или с собой?',
        context: 'Главный вопрос бариста при заказе',
        category: 'daily',
      },
      {
        hebrew: 'חֶשְׁבּוֹן, בְּבַקָּשָׁה',
        transcription: 'хэжбóн, бэвакашá',
        translation: 'Счёт, пожалуйста',
        context: 'Кратко официанту',
        category: 'polite',
      },
    ],
    slangAndShortcuts: [
      {
        term: 'הָפוּךְ',
        transcription: 'hафýх',
        meaning: 'Капучино',
        usageTip: 'Дословно «перевернутый»: эспрессо взбивается с горячим молоком.',
      },
      {
        term: 'תַּעֲשֶׂה לִי...',
        transcription: 'таасэ́ ли...',
        meaning: 'Сделай мне... (эспрессо/чай)',
        usageTip: 'Обычная разговорная форма заказа без лишней напыщенности.',
      },
    ],
  },

  // Урок 3: Откуда ты? Страны и города
  3: {
    lessonId: 3,
    topicTitle: 'Вопрос «Где?» и предлоги происхождения',
    stressRuleNote: {
      word: 'אֵיפֹה?',
      academic: 'эйфО́ (мильра — на последний слог)',
      spoken: 'э́йфо (мильэ́йль — на первый слог!)',
      explanation: 'В живой речи 100% израильтян говорят «э́йфо» с ударением на первый слог. Синтезатор речи следует академической норме и говорит книжное «эйфО́». Говорите в жизни «э́йфо»!',
    },
    phrases: [
      {
        hebrew: 'אֵיפֹה אַתָּה גָּר?',
        transcription: 'э́йфо атá гар?',
        translation: 'Где ты живёшь? (к мужчине)',
        stressNote: 'э́йфо — ударение на первый слог',
        context: 'Разговорный вопрос новому знакомому',
        category: 'question',
      },
      {
        hebrew: 'מֵאֵיפֹה אַתְּ?',
        transcription: 'мэ-э́йфо ат?',
        translation: 'Откуда ты? (к женщине)',
        stressNote: 'мэ-э́йфо произносится слитно с ударением на «э»',
        context: 'Вместо книжного «מֵאַיִן» (мэ-áйин) в быту всегда говорят «מֵאֵיפֹה»',
        category: 'question',
      },
      {
        hebrew: 'אֲנִי מִכָּאן / מִפֹּה',
        transcription: 'анӣ ми-кáн / ми-пó',
        translation: 'Я отсюда / местный',
        context: 'Ответ о месте проживания',
        category: 'daily',
      },
    ],
  },

  // Урок 4: Кто это и что это?
  4: {
    lessonId: 4,
    topicTitle: 'Слитные вопросы «Что это?» и указатели',
    stressRuleNote: {
      word: 'מַה זֶּה? / מִי זֶה?',
      academic: 'ма зэ (раздельно), ми зэ (раздельно)',
      spoken: 'мáзэ? / мӣзэ? (слитно как одно слово)',
      explanation: 'В беглой речи «מה זה?» произносится как единое слово «мáзэ?».',
    },
    phrases: [
      {
        hebrew: 'מַה זֶּה?!',
        transcription: 'мáзэ?!',
        translation: 'Что это такое?! / В чём дело?!',
        context: 'Универсальное восклицание удивления или вопроса',
        category: 'slang',
      },
      {
        hebrew: 'זֶהוּ!',
        transcription: 'зэ́hу!',
        translation: 'Вот и всё! Готово!',
        context: 'Разговорное завершение дела или объяснения',
        category: 'slang',
      },
      {
        hebrew: 'מַה פִּתְאוֹם?!',
        transcription: 'ма пит’óм?!',
        translation: 'С какой стати?! Да ладно?! Да ничего подобного!',
        context: 'Один из самых популярных эмоциональных маркеров израильтян',
        category: 'slang',
      },
    ],
  },

  // Урок 5: В супермаркете и на рынке (КЛЮЧЕВОЙ УРОК!)
  5: {
    lessonId: 5,
    topicTitle: 'Вопрос о цене и покупки на шуке / в магазине',
    stressRuleNote: {
      word: 'כַּמָּה?',
      academic: 'камА́ (мильра — на последний слог)',
      spoken: 'кáма (мильэ́йль — на первый слог!)',
      explanation: 'В Академии языка иврит нормативным считается ударение «камА́», поэтому автоматический синтезатор произносит его так. Но на улице, в магазинах и на рынках абсолютно ВСЕ израильтяне говорят «кáма». В жизни говорите только «кáма»!',
    },
    phrases: [
      {
        hebrew: 'כַּמָּה זֶה?',
        transcription: 'кáма зэ?',
        translation: 'Сколько это стоит?',
        stressNote: 'кáма — ударение на 1-й слог',
        context: 'Самый частый живой вопрос у прилавка вместо длинного «כמה זה עולה?»',
        category: 'price',
      },
      {
        hebrew: 'כַּמָּה יוֹצֵא?',
        transcription: 'кáма йоцé?',
        translation: 'Сколько получается? / Каков итог?',
        context: 'На кассе или когда продавец взвесил товар',
        category: 'price',
      },
      {
        hebrew: 'כַּמָּה לְקִילוֹ?',
        transcription: 'кáма лэ-кӣло?',
        translation: 'Почём килограмм?',
        context: 'На рынке (шуке) или в овощной лавке',
        category: 'price',
      },
      {
        hebrew: 'כַּמָּה כָּל זֶה?',
        transcription: 'кáма коль зэ?',
        translation: 'Сколько всё это вместе?',
        context: 'Когда набрали несколько разных товаров',
        category: 'price',
      },
      {
        hebrew: 'שָׂם לִי שַׂקִּית?',
        transcription: 'сам ли саки́т?',
        translation: 'Положишь пакетик? / Дадите пакет?',
        context: 'Обычный вопрос на кассе супермаркета',
        category: 'daily',
      },
      {
        hebrew: 'אֶפְשָׁר חֶשְׁבּוֹן?',
        transcription: 'эфшáр хэжбóн?',
        translation: 'Можно счёт?',
        context: 'Кратко и естественно в любом заведении',
        category: 'polite',
      },
    ],
    slangAndShortcuts: [
      {
        term: 'שָׁלוֹשׁ שֶׁקֶל',
        transcription: 'шалóш шэ́кель',
        meaning: 'Три шекеля (уличное упрощение)',
        usageTip: 'По грамматике положено «שְׁלוֹשָׁה שְׁקָלִים», но на улице продавцы часто говорят в женском роде со словом шекель.',
      },
      {
        term: 'עוֹד מַשֶּׁהוּ?',
        transcription: 'од мáшэhу?',
        meaning: 'Что-то ещё?',
        usageTip: 'Дежурный вопрос продавца после каждого пункта заказа.',
      },
    ],
  },

  // Урок 10: Транспорт и передвижение по городу
  10: {
    lessonId: 10,
    topicTitle: 'Городской транспорт, автобусы и поезда',
    stressRuleNote: {
      word: 'אֵיזֶה? / אֵיפֹה?',
      academic: 'эйзЭ́, эйфО́ (мильра)',
      spoken: 'э́йзэ, э́йфо (мильэ́йль)',
      explanation: 'Оба вопросительных слова в живой речи имеют ударение на первом слоге: «э́йзэ кав?» (какой маршрут?), «э́йфо hа-тахана?» (где остановка?).',
    },
    phrases: [
      {
        hebrew: 'אֵיזֶה קַו מַגִּיעַ לַמֶּרְכָּז?',
        transcription: 'э́йзэ кав маги́а ла-меркáз?',
        translation: 'Какой автобус (маршрут) едет в центр?',
        category: 'question',
      },
      {
        hebrew: 'אַתָּה מַגִּיעַ לְ...?',
        transcription: 'атá маги́а лэ...?',
        translation: 'Вы доезжаете до...? (вопрос водителю)',
        category: 'daily',
      },
      {
        hebrew: 'אֵיפֹה לָרֶדֶת?',
        transcription: 'э́йфо лáрэдэт?',
        translation: 'Где выходить?',
        category: 'daily',
      },
      {
        hebrew: 'לִטְעוֹן רַב-קַו',
        transcription: 'лит’óн рав-кав',
        translation: 'Пополнить транспортную карту Рав-Кав',
        category: 'daily',
      },
    ],
  },

  // Урок 16: Есть и Нет: обладание и предлоги
  16: {
    lessonId: 16,
    topicTitle: 'Отрицания, согласие и живые обороты с «אין»',
    stressRuleNote: {
      word: 'אֵין בְּעָיָה',
      academic: 'эйн бэайя',
      spoken: 'эйн бэайя',
      explanation: '«Эйн бэайя» — главная национальная фраза согласия («нет проблем / без проблем»).',
    },
    phrases: [
      {
        hebrew: 'אֵין בְּעָיָה!',
        transcription: 'эйн бэайя́!',
        translation: 'Без проблем! Договорились!',
        category: 'slang',
      },
      {
        hebrew: 'אֵין לִי מֻשָּׂג',
        transcription: 'эйн ли мусáг',
        translation: 'Понятия не имею / Без понятия',
        category: 'daily',
      },
      {
        hebrew: 'אֵין מַצָּב!',
        transcription: 'эйн мацáв!',
        translation: 'Не может быть! Ни за что! Исключено!',
        category: 'slang',
      },
      {
        hebrew: 'יֵשׁ מַצָּב',
        transcription: 'йеш мацáв',
        translation: 'Возможно / Всё может быть',
        category: 'slang',
      },
    ],
  },

  // Урок 30: Полная система вопросов (СВОДНЫЙ ГИД)
  30: {
    lessonId: 30,
    topicTitle: 'Полная карта ударений в вопросительных словах',
    stressRuleNote: {
      word: 'Сводное правило вопросов',
      academic: 'כַּמָּה, אֵיפֹה, אֵיזֶה, אֵיזוֹ, אֵלּוּ — всё в מלרע (на последний слог)',
      spoken: 'כַּמָּה, אֵיפֹה, אֵיזֶה, אֵיזוֹ, אֵלּוּ, לָמָּה — ВСЕ в מלעיל (на первый слог!)',
      explanation: 'В классическом библейском иврите только «לָמָּה» имело ударение на 1-й слог. В современном разговорном иврите ВСЕ вопросительные слова притянулись к этой модели: кáма, э́йфо, э́йзэ, э́йзо, э́лу, лáма.',
    },
    phrases: [
      {
        hebrew: 'כַּמָּה?',
        transcription: 'кáма?',
        translation: 'Сколько? (ударение на 1-й слог!)',
        category: 'question',
      },
      {
        hebrew: 'אֵיפֹה?',
        transcription: 'э́йфо?',
        translation: 'Где? (ударение на 1-й слог!)',
        category: 'question',
      },
      {
        hebrew: 'אֵיזֶה?',
        transcription: 'э́йзэ?',
        translation: 'Какой? (ударение на 1-й слог!)',
        category: 'question',
      },
      {
        hebrew: 'אֵיזוֹ?',
        transcription: 'э́йзо?',
        translation: 'Какая? (ударение на 1-й слог!)',
        category: 'question',
      },
      {
        hebrew: 'לָמָּה?',
        transcription: 'лáма?',
        translation: 'Почему? (ударение на 1-й слог)',
        category: 'question',
      },
      {
        hebrew: 'מָתַי?',
        transcription: 'матáй?',
        translation: 'Когда? (ударение на последний слог: -тáй)',
        category: 'question',
      },
    ],
  },
};

/**
 * Тематические шаблоны для остальных уроков (гарантируют, что у всех 100 уроков есть полезная шторка)
 */
export function getSpokenGuideForLesson(
  lessonId: number,
  category?: string,
  lessonTitle?: string
): SpokenHebrewGuide {
  // 1. Если есть точечный проработанный гид — отдаем его
  if (SPECIFIC_SPOKEN_GUIDES[lessonId]) {
    return SPECIFIC_SPOKEN_GUIDES[lessonId];
  }

  // 2. Иначе генерируем тематический гид по контексту
  const cat = (category || '').toLowerCase();
  const title = (lessonTitle || '').toLowerCase();

  // Тема покупок / денег / счетов
  if (cat.includes('покупк') || title.includes('рынок') || title.includes('магазин') || title.includes('цена') || title.includes('счет')) {
    return {
      lessonId,
      topicTitle: 'Разговорные формулы покупок и расчёта',
      stressRuleNote: {
        word: 'כַּמָּה?',
        academic: 'камА́ (книжная норма)',
        spoken: 'кáма (живая речь)',
        explanation: 'В Израиле при покупках говорят «кáма зэ?» с ударением на первый слог.',
      },
      phrases: [
        { hebrew: 'כַּמָּה זֶה?', transcription: 'кáма зэ?', translation: 'Сколько это стоит?', category: 'price' },
        { hebrew: 'כַּמָּה יוֹצֵא?', transcription: 'кáма йоцé?', translation: 'Сколько получается в сумме?', category: 'price' },
        { hebrew: 'אֶפְשָׁר בְּאַשְׁרַאי?', transcription: 'эфшáр бэ-ашрáй?', translation: 'Можно картой (в кредит)?', category: 'daily' },
        { hebrew: 'בִּמְזֻמָּן', transcription: 'би-мзумáн', translation: 'Наличными', category: 'daily' },
        { hebrew: 'קַבָּלָה, בְּבַקָּשָׁה', transcription: 'кабалá, бэвакашá', translation: 'Чек, пожалуйста', category: 'polite' },
      ],
      slangAndShortcuts: [
        { term: 'הֲנָחָה', transcription: 'hанаха́', meaning: 'Скидка', usageTip: '«יֵשׁ הֲנָחָה?» (йеш hанаха?) — классический израильский вопрос.' },
      ],
    };
  }

  // Тема жилья / квартиры / аренды
  if (title.includes('квартир') || title.includes('дом') || title.includes('аренд') || title.includes('соседи')) {
    return {
      lessonId,
      topicTitle: 'Разговорный иврит при съеме жилья',
      stressRuleNote: {
        word: 'אֵיפֹה? / כַּמָּה?',
        academic: 'эйфО́, камА́',
        spoken: 'э́йфо, кáма (оба на 1-й слог)',
        explanation: 'При звонках маклеру или хозяину: «э́йфо hа-дира?» (где квартира?), «кáма арнóна?» (сколько муниципальный налог?).',
      },
      phrases: [
        { hebrew: 'כַּמָּה שְׂכַר דִּירָה?', transcription: 'кáма схар дирá?', translation: 'Сколько стоит аренда в месяц?', category: 'price' },
        { hebrew: 'יֵשׁ מַזְגָן?', transcription: 'йеш мазгáн?', translation: 'Есть кондиционер?', category: 'daily' },
        { hebrew: 'כַּמָּה וַעַד בַּיִת?', transcription: 'кáма вáад бáйит?', translation: 'Сколько домовой сбор (домоуправление)?', category: 'price' },
        { hebrew: 'כּוֹלֵל חֶשְׁבּוֹנוֹת?', transcription: 'колéль хэжбонóт?', translation: 'Включая коммунальные счета?', category: 'daily' },
      ],
    };
  }

  // Тема здоровья / врача / аптеки
  if (title.includes('врач') || title.includes('поликлиник') || title.includes('здоров') || title.includes('аптек')) {
    return {
      lessonId,
      topicTitle: 'Разговорные формулы у врача и в аптеке',
      phrases: [
        { hebrew: 'כּוֹאֵב לִי הָרֹאשׁ / הַגַּב', transcription: 'коэ́в ли hа-рош / hа-гав', translation: 'У меня болит голова / спина', category: 'daily' },
        { hebrew: 'יֵשׁ לִי תּוֹר לְ...', transcription: 'йеш ли тор лэ...', translation: 'У меня запись к...', category: 'daily' },
        { hebrew: 'מַרְגִּישׁ / מַרְגִּישָׁה לֹא טוֹב', transcription: 'марги́ш / маргишá ло тов', translation: 'Плохо себя чувствую', category: 'daily' },
        { hebrew: 'תַּרְגִּישׁ טוֹב! / הַחְלָמָה מְהִירָה!', transcription: 'тарги́ш тов! / hахламá мэhирá!', translation: 'Поправляйся! Скорейшего выздоровления!', category: 'polite' },
      ],
    };
  }

  // Уровень Бет: официальное общение, работа, бюрократия (Уроки 51-100)
  if (lessonId >= 51) {
    return {
      lessonId,
      topicTitle: 'Живая речь и деловая вежливость на работе и в инстанциях',
      stressRuleNote: {
        word: 'Стили речи',
        academic: 'Формальный высокий стиль письма',
        spoken: 'Прямой, уважительный, но лаконичный израильский тон',
        explanation: 'В Израиле в госучреждениях и на работе не любят цветистые канцеляризмы. Говорите прямо: «אֲנִי צָרִיךְ...», «תַּגִּיד לִי בְּבַקָּשָׁה».',
      },
      phrases: [
        { hebrew: 'בְּקֶשֶׁר לְ...', transcription: 'бэ-кэ́шэр лэ...', translation: 'По поводу... / Касательно...', category: 'daily' },
        { hebrew: 'תַּגִּיד לִי, בְּבַקָּשָׁה', transcription: 'тагӣд ли, бэвакашá', translation: 'Подскажи мне, пожалуйста (к мужчине)', category: 'polite' },
        { hebrew: 'תַּגִּידִי לִי, בְּבַקָּשָׁה', transcription: 'таги́ди ли, бэвакашá', translation: 'Подскажи мне, пожалуйста (к женщине)', category: 'polite' },
        { hebrew: 'אֲנִי תֵּכֶף חוֹזֵר אֵלֶיךָ', transcription: 'анӣ тéхэф хозéр элéха', translation: 'Я сейчас перезвоню тебе', category: 'daily' },
        { hebrew: 'יוֹם טוֹב וּבְהַצְלָחָה!', transcription: 'йом тов у-вэhацлахá!', translation: 'Хорошего дня и удачи!', category: 'polite' },
      ],
      slangAndShortcuts: [
        { term: 'סְגוּר', transcription: 'сгур', meaning: 'Договорились / Решено', usageTip: 'Короткое подтверждение договоренности вместо длинных фраз.' },
        { term: 'דַּבֵּר אִתִּי', transcription: 'дабéр ити́', meaning: 'Будь на связи / Напиши/позвони мне', usageTip: 'Стандартная фраза в конце деловой беседы.' },
      ],
    };
  }

  // Общий универсальный гид для базовых уроков
  return {
    lessonId,
    topicTitle: 'Секреты живой израильской речи',
    stressRuleNote: {
      word: 'Живое ударение (מִלְּעֵיל)',
      academic: 'Большинство слов — на последний слог',
      spoken: 'Вопросы и восклицания — часто на первый слог',
      explanation: 'Обращайте внимание на интонацию: в израильском иврите вопросы звучат более напевно и открыто, а ударение в вопросительных словах сдвигается вперед.',
    },
    phrases: [
      { hebrew: 'הַכֹּל בְּסֵדֶר?', transcription: 'hа-коль бэсэ́дэр?', translation: 'Всё в порядке?', category: 'daily' },
      { hebrew: 'אֵין בְּעָיָה', transcription: 'эйн бэайя́', translation: 'Без проблем!', category: 'daily' },
      { hebrew: 'תּוֹדָה רַבָּה!', transcription: 'тодá рабá!', translation: 'Большое спасибо!', category: 'polite' },
      { hebrew: 'בְּכֵיף!', transcription: 'бэ-кéйф!', translation: 'С удовольствием! Не за что!', category: 'slang' },
    ],
    slangAndShortcuts: [
      { term: 'בְּכֵיף', transcription: 'бэ-кéйф', meaning: 'С удовольствием! Пожалуйста!', usageTip: 'Самый частый неформальный ответ на «спасибо» вместо книжного «аль ло давар».' },
      { term: 'סַבָּבָה', transcription: 'сабáба', meaning: 'Круто / Отлично / Ладно', usageTip: 'Универсальное слово согласия.' },
    ],
  };
}
