/**
 * База данных программы обучения ивриту (100 уроков: Алеф 1-50, Бет 51-100)
 * Методика классического израильского ульпана с транскрипцией по стандарту (h для ה).
 */

import { Lesson, Level } from '@/types';

// Полный каталог 100 уроков программы Ульпана
export const LESSONS_CATALOG: Array<{
  id: number;
  level: Level;
  number: number;
  titleHebrew: string;
  titleRussian: string;
  category: string;
  description: string;
}> = [
  // ================= УРОВЕНЬ АЛЕФ (1 - 50) =================
  {
    id: 1,
    level: 'alef',
    number: 1,
    titleHebrew: 'שָׁלוֹם וְהֶיכֵּרוּת',
    titleRussian: 'Приветствие и знакомство',
    category: 'Первые шаги',
    description: 'Приветствия, личные местоимения (אֲנִי, אַתָּה, אַתְּ, הוּא, הִיא), вопрос «Как тебя зовут?».',
  },
  {
    id: 2,
    level: 'alef',
    number: 2,
    titleHebrew: 'בְּבֵית הַקָּפֶה',
    titleRussian: 'В кафе: заказы и напитки',
    category: 'Еда и напитки',
    description: 'Глаголы ר-צ-ה и שׁ-ת-ה в настоящем времени (רוֹצֶה/רוֹצָה, שׁוֹתֶה/שׁוֹתָה), заказ кофе, воды и выпечки.',
  },
  {
    id: 3,
    level: 'alef',
    number: 3,
    titleHebrew: 'מֵאַיִן אַתָּה?',
    titleRussian: 'Откуда ты? Страны и города',
    category: 'География и языки',
    description: 'Предлог מֵ/מִ (из), языки и национальности, глагол ג-ו-ר (גָּר/גָּרָה - жить).',
  },
  {
    id: 4,
    level: 'alef',
    number: 4,
    titleHebrew: 'מִי זֶה וּמַה זֶּה?',
    titleRussian: 'Кто это и что это? Указательные местоимения',
    category: 'Грамматика',
    description: 'Указательные слова זֶה (это - м.р.), זֹאת (это - ж.р.), אֵלֶּה (эти), род существительных.',
  },
  {
    id: 5,
    level: 'alef',
    number: 5,
    titleHebrew: 'בַּסּוּפֶּרְמַרְקֶט',
    titleRussian: 'В супермаркете и на рынке',
    category: 'Покупки',
    description: 'Определенный артикль הַ (hа-), числительные 1-10, вопрос «Сколько это стоит?» (כַּמָּה זֶה עוֹלֶה?).',
  },
  {
    id: 6,
    level: 'alef',
    number: 6,
    titleHebrew: 'מִשְׁפָּחָה שֶׁלִּי',
    titleRussian: 'Моя семья',
    category: 'Семья',
    description: 'Слово שֶׁל (принадлежность: שֶׁלִּי, שֶׁלְּךָ, שֶׁלָּךְ), члены семьи, множественное число (ִים / וֹת).',
  },
  {
    id: 7,
    level: 'alef',
    number: 7,
    titleHebrew: 'הַבַּיִת שֶׁלִּי',
    titleRussian: 'Мой дом и квартира',
    category: 'Быт и жилье',
    description: 'Комнаты, мебель, предлоги места (בְּ, עַל, לְיַד, בְּתוֹךְ).',
  },
  {
    id: 8,
    level: 'alef',
    number: 8,
    titleHebrew: 'פּוֹעֳלֵי פָּעַל - הוֹלֵךְ וְלוֹמֵד',
    titleRussian: 'Биньян Пааль: глаголы действия',
    category: 'Глаголы',
    description: 'Спряжение правильных глаголов Пааль: לוֹמֵד (учит), הוֹלֵךְ (идет), כּוֹתֵב (пишет), קוֹרֵא (читает).',
  },
  {
    id: 9,
    level: 'alef',
    number: 9,
    titleHebrew: 'מָה הַשָּׁעָה?',
    titleRussian: 'Который час? Распорядок дня',
    category: 'Время',
    description: 'Время, части суток (בּוֹקֶר, צוֹהֳרַיִם, עֶרֶב, לַיְלָה), глагол ק-ו-ם (קָם/קָמָה - вставать).',
  },
  {
    id: 10,
    level: 'alef',
    number: 10,
    titleHebrew: 'תְּנוּעָה וְתַחְבּוּרָה',
    titleRussian: 'Транспорт и передвижение по городу',
    category: 'Город',
    description: 'Автобус, поезд, такси. Глагол נ-ס-ע (נוֹסֵעַ/נוֹסַעַת - ехать), направление (לְ- / לְאָן).',
  },
  {
    id: 11,
    level: 'alef',
    number: 11,
    titleHebrew: 'מִסְעָדָה וְאוֹכֶל',
    titleRussian: 'В ресторане: израильская кухня',
    category: 'Еда и напитки',
    description: 'Блюда, прилагательные вкуса (טָעִים, מָתוֹק, מָלוּחַ), глагол א-כ-ל (אוֹכֵל/אוֹכֶלֶת).',
  },
  {
    id: 12,
    level: 'alef',
    number: 12,
    titleHebrew: 'מֶזֶג אֲוִיר וְעוֹנוֹת הַשָּׁנָה',
    titleRussian: 'Погода и времена года',
    category: 'Природа',
    description: 'Жарко, холодно, дождь, солнце (חַם, קַר, גֶּשֶׁם, שֶׁמֶשׁ). Одежда по сезону.',
  },
  {
    id: 13,
    level: 'alef',
    number: 13,
    titleHebrew: 'חֲנוּיוֹת וּקְנִיּוֹת בְּגָדִים',
    titleRussian: 'Магазин одежды: цвета и размеры',
    category: 'Покупки',
    description: 'Цвета на иврите (אָדֹם, כָּחֹל, לָבָן...), согласование прилагательных по роду и числу.',
  },
  {
    id: 14,
    level: 'alef',
    number: 14,
    titleHebrew: 'אֵצֶל הָרוֹפֵא וּבַמִּרְפָּאָה',
    titleRussian: 'У врача: здоровье и самочувствие',
    category: 'Здоровье',
    description: 'Части тела, выражение «У меня болит...» (כּוֹאֵב לִי...), аптека и лекарства.',
  },
  {
    id: 15,
    level: 'alef',
    number: 15,
    titleHebrew: 'הַיּוֹם-יוֹם שֶׁלִּי',
    titleRussian: 'Мой обычный день: привычки',
    category: 'Распорядок',
    description: 'Наречия частоты (תָּמִיד, לִפְעָמִים, אַף פַּעַם לֹא), распорядок дня.',
  },
  {
    id: 16,
    level: 'alef',
    number: 16,
    titleHebrew: 'יֵשׁ וְאֵין - נוֹכְחוּת וּבַעֲלוּת',
    titleRussian: 'Есть и Нет: наличие и обладание',
    category: 'Грамматика',
    description: 'Конструкции יֵשׁ לִי (у меня есть) и אֵין לִי (у меня нет), предлог לְ со слитными местоимениями.',
  },
  {
    id: 17,
    level: 'alef',
    number: 17,
    titleHebrew: 'עֲבוֹדָה וּמִקְצוֹעוֹת',
    titleRussian: 'Работа и профессии',
    category: 'Карьера',
    description: 'Профессии, глагол ע-ב-ד (עוֹבֵד/עוֹבֶדֶת), поиск работы и собеседование.',
  },
  {
    id: 18,
    level: 'alef',
    number: 18,
    titleHebrew: 'הוֹבִּי וּשְׁעוֹת פְּנַאי',
    titleRussian: 'Хобби, спорт и свободное время',
    category: 'Отдых',
    description: 'Спорт, чтение, музыка, глагол א-ה-ב (אוֹהֵב/אוֹהֶבֶת - любить).',
  },
  {
    id: 19,
    level: 'alef',
    number: 19,
    titleHebrew: 'בַּבַּנְק וּבַדֹּאַר',
    titleRussian: 'В банке и на почте',
    category: 'Услуги',
    description: 'Платежи, снятие наличных, отправка посылки, финансовые термины.',
  },
  {
    id: 20,
    level: 'alef',
    number: 20,
    titleHebrew: 'בִּנְיַן פִּעֵל - מְדַבֵּר וּמְשַׁלֵּם',
    titleRussian: 'Биньян Пиэль: модель מְ- (ме-)',
    category: 'Глаголы',
    description: 'Глаголы биньяна Пиэль в наст. времени: מְדַבֵּר (говорит), מְבַקֵּשׁ (просит), מְשַׁלֵּם (платит).',
  },
  {
    id: 21,
    level: 'alef',
    number: 21,
    titleHebrew: 'בִּנְיַן הִפְעִיל - מַזְמִין וּמַתְחִיל',
    titleRussian: 'Биньян hифиль: модель מַ- (ма-)',
    category: 'Глаголы',
    description: 'Глаголы hифиль: מַזְמִין (заказывает/приглашает), מַתְחִיל (начинает), מַרְגִּישׁ (чувствует).',
  },
  {
    id: 22,
    level: 'alef',
    number: 22,
    titleHebrew: 'בִּנְיַן הִתְפַּעֵל - מִתְרַגֵּשׁ וּמִתְלַבֵּשׁ',
    titleRussian: 'Биньян hитпаэль: возвратные глаголы',
    category: 'Глаголы',
    description: 'Возвратные глаголы: מִתְלַבֵּשׁ (одевается), מִתְרַחֵץ (моется), מִתְרַגֵּשׁ (волнуется).',
  },
  {
    id: 23,
    level: 'alef',
    number: 23,
    titleHebrew: 'מִלּוֹת יַחַס מְנוּטּוֹת: עִם, לְ, בְּ',
    titleRussian: 'Склонение предлогов с местоимениями',
    category: 'Грамматика',
    description: 'Склонение предлога עִם (со мной: עִמִּי/אִתִּי, с тобой: אִתְּךָ/אִתָּךְ, с ним: אִתּוֹ).',
  },
  {
    id: 24,
    level: 'alef',
    number: 24,
    titleHebrew: 'מַתְּנוֹת וְאֵרוּעִים',
    titleRussian: 'Подарки, дни рождения и праздники',
    category: 'Культура',
    description: 'Поздравления (מַזָּל טוֹב, יוֹם הוּלֶּדֶת שָׂמֵחַ), выбор подарков.',
  },
  {
    id: 25,
    level: 'alef',
    number: 25,
    titleHebrew: 'חַגֵּי יִשְׂרָאֵל: שַׁבָּת וּפֶסַח',
    titleRussian: 'Еврейский календарь: Шаббат и праздники',
    category: 'Культура',
    description: 'Традиции шаббата, праздничные поздравления и традиционная лексика.',
  },
  {
    id: 26,
    level: 'alef',
    number: 26,
    titleHebrew: 'צֵרוּפֵי סְמִיכוּת',
    titleRussian: 'Смихут (сопряженное сочетание)',
    category: 'Грамматика',
    description: 'Конструкция сцепки существительных: בֵּית סֵפֶר (школа), מִיץ תַּפּוּזִים (апельсиновый сок).',
  },
  {
    id: 27,
    level: 'alef',
    number: 27,
    titleHebrew: 'שְׂכִירַת דִּירָה בְּיִשְׂרָאֵל',
    titleRussian: 'Аренда квартиры в Израиле',
    category: 'Быт и жилье',
    description: 'Договор, арнона, ваад байит, диалог с хозяином квартиры.',
  },
  {
    id: 28,
    level: 'alef',
    number: 28,
    titleHebrew: 'תֵּאוּר אֲנָשִׁים וְאוֹפִי',
    titleRussian: 'Описание внешности и характера',
    category: 'Люди',
    description: 'Высокий, низкий, добрый, умный (גָּבוֹהַּ, נָמוּךְ, נֶחְמָד, חָכָם).',
  },
  {
    id: 29,
    level: 'alef',
    number: 29,
    titleHebrew: 'בְּבֵית הַמִּלּוֹן וְנוֹפֶשׁ',
    titleRussian: 'В гостинице и на отдыхе',
    category: 'Путешествия',
    description: 'Бронирование номера, сервис, диалог на ресепшн.',
  },
  {
    id: 30,
    level: 'alef',
    number: 30,
    titleHebrew: 'מִלַּת הַיַּחַס אֶת (Direct Object)',
    titleRussian: 'Предлог прямого дополнения אֶת',
    category: 'Грамматика',
    description: 'Правило употребления אֶת с определенными существительными (אֲנִי רוֹאֶה אֶת הַסֶּרֶט).',
  },
  // Генерируем последующие уроки уровня Алеф (31-50)
  ...Array.from({ length: 20 }, (_, i) => {
    const num = 31 + i;
    return {
      id: num,
      level: 'alef' as Level,
      number: num,
      titleHebrew: `שִׁיעוּר ${num}: נוֹשֵׂא מִתְקַדֵּם ${num}`,
      titleRussian: `Урок ${num}: Практика и закрепление темы ${num}`,
      category: 'Практика ульпана',
      description: `Углубленная практика грамматики и словарного запаса уровня Алеф (урок ${num}).`,
    };
  }),

  // ================= УРОВЕНЬ БЕТ (51 - 100) =================
  {
    id: 51,
    level: 'bet',
    number: 51,
    titleHebrew: 'מַבּוֹא לִרְמַת בֵּית: עֲבַר בִּנְיַן פָּעַל',
    titleRussian: 'Введение в уровень Бет: Прошедшее время Пааль',
    category: 'Прошедшее время',
    description: 'Основа прошедшего времени правильных глаголов (כָּתַבְתִּי, לָמַדְנוּ, הָלַכְתָּ).',
  },
  {
    id: 52,
    level: 'bet',
    number: 52,
    titleHebrew: 'עֲבַר פִּעֵל וְהִפְעִיל',
    titleRussian: 'Прошедшее время в биньянах Пиэль и hифиль',
    category: 'Прошедшее время',
    description: 'Спряжение: דִּבַּרְתִּי (я говорил), הִזְמַנְתִּי (я заказал), הִרְגַּשְׁתִּי (я чувствовал).',
  },
  {
    id: 53,
    level: 'bet',
    number: 53,
    titleHebrew: 'עֲבַר הִתְפַּעֵל וְגִזְרוֹת מְיֻחָדוֹת',
    titleRussian: 'Прошедшее время hитпаэль и слабые корни',
    category: 'Прошедшее время',
    description: 'Глаголы הִתְלַבַּשְׁתִּי, הָיִיתִי (я был), רָצִיתִי (я хотел).',
  },
  {
    id: 54,
    level: 'bet',
    number: 54,
    titleHebrew: 'נְטִיַּת מִלַּת הַיַּחַס אֶת (אוֹתִי, אוֹתְךָ)',
    titleRussian: 'Склонение прямого дополнения (Меня, тебя, его...)',
    category: 'Грамматика Бет',
    description: 'Формы: אוֹתִי (меня), אוֹתְךָ (тебя м.р.), אוֹתָךְ (тебя ж.р.), אוֹתוֹ (его), אוֹתָהּ (ее).',
  },
  {
    id: 55,
    level: 'bet',
    number: 55,
    titleHebrew: 'נְטִיַּת עַל וְאֶל (עָלַי, אֵלַי)',
    titleRussian: 'Склонение предлогов множественного типа (Обо мне, ко мне)',
    category: 'Грамматика Бет',
    description: 'Склонение: עָלַי (обо мне), עָלֶיךָ (о тебе), אֵלַי (ко мне), אֵלֶיהָ (к ней).',
  },
  // Генерируем последующие уроки уровня Бет (56-100)
  ...Array.from({ length: 45 }, (_, i) => {
    const num = 56 + i;
    const isFuture = num >= 70 && num <= 85;
    const isMedia = num > 85;
    return {
      id: num,
      level: 'bet' as Level,
      number: num,
      titleHebrew: isFuture
        ? `שִׁיעוּר ${num}: עָתִיד וְדִבּוּר מִתְקַדֵּם`
        : isMedia
        ? `שִׁיעוּר ${num}: עִבְרִית קַלָּה וַחֲדָשׁוֹת`
        : `שִׁיעוּר ${num}: דִּקְדּוּק וְשִׂיחָה בְּרָמַת בֵּית`,
      titleRussian: isFuture
        ? `Урок ${num}: Будущее время и диалоги уровня Бет`
        : isMedia
        ? `Урок ${num}: Чтение новостей на легком иврите`
        : `Урок ${num}: Продвинутая грамматика и идиомы Бет`,
      category: isFuture ? 'Будущее время' : isMedia ? 'Пресса и медиа' : 'Грамматика Бет',
      description: `Комплексная тренировка лексики, глаголов и живой разговорной речи уровня Бет (урок ${num}).`,
    };
  }),
];

// Детально проработанные данные для ключевых базовых уроков курса
export const DETAILED_LESSONS: Record<number, Lesson> = {
  1: {
    id: 1,
    level: 'alef',
    number: 1,
    titleHebrew: 'שָׁלוֹם וְהֶיכֵּרוּת',
    titleRussian: 'Приветствие и знакомство',
    category: 'Первые шаги',
    description: 'Базовые фразы знакомства, личные местоимения, вежливые приветствия в разное время суток.',
    grammar: [
      {
        title: 'Личные местоимения (גּוּפִים)',
        summary: 'В иврите местоимения 2-го и 3-го лица различаются по мужскому и женскому роду.',
        explanation: `В иврите нет среднего рода (оно) — все существительные и местоимения либо мужского (זָכָר), либо женского (נְקֵבָה) рода.
        
Обратите внимание на транскрипцию: буква **ה** обозначается как **h** (легкий выдох).`,
        tables: [
          {
            title: 'Единственное число (יָחִיד / יְחִידָה)',
            headers: ['Местоимение', 'Транскрипция', 'Перевод', 'Род'],
            rows: [
              ['אֲנִי', 'анӣ', 'Я', 'Общий'],
              ['אַתָּה', 'атá', 'Ты (обращение к мужчине)', 'Мужской'],
              ['אַתְּ', 'ат', 'Ты (обращение к женщине)', 'Женский'],
              ['הוּא', 'hу', 'Он', 'Мужской'],
              ['הִיא', 'hи', 'Она', 'Женский'],
            ],
          },
          {
            title: 'Множественное число (רַבִּים / רַבּוֹת)',
            headers: ['Местоимение', 'Транскрипция', 'Перевод', 'Род'],
            rows: [
              ['אֲנַחְנוּ', 'анáхну', 'Мы', 'Общий'],
              ['אַתֶּם', 'атэ́м', 'Вы (мужчины / смешанная группа)', 'Мужской'],
              ['אַתֶּן', 'атэ́н', 'Вы (только женщины)', 'Женский'],
              ['הֵם', 'hэм', 'Они (мужчины / группа)', 'Мужской'],
              ['הֵן', 'hэн', 'Они (женщины)', 'Женский'],
            ],
          },
        ],
        rules: [
          'В настоящем времени в иврите НЕТ глагола-связки «быть» (is/am/are). Предложение «Я Давид» звучит просто: אֲנִי דָּוִד (Анӣ Давӣд).',
          'Буква ה в словах הוּא (hу) и הִיא (hи) звучит мягко на выдохе, как английское H.',
        ],
      },
    ],
    vocabulary: [
      {
        id: 'w1-1',
        hebrew: 'שָׁלוֹם',
        hebrewPlain: 'שלום',
        transcription: 'шалóм',
        translation: 'мир; привет; здравствуйте; до свидания',
        partOfSpeech: 'expression',
        root: 'ש-ל-ם',
        lessonId: 1,
        exampleSentence: {
          hebrew: 'שָׁלוֹם, מָה נִשְׁמַע?',
          transcription: 'шалóм, ма нишмá?',
          translation: 'Привет, как дела?',
        },
      },
      {
        id: 'w1-2',
        hebrew: 'בּוֹקֶר טוֹב',
        hebrewPlain: 'בוקר טוב',
        transcription: 'бóкер тов',
        translation: 'доброе утро',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-3',
        hebrew: 'עֶרֶב טוֹב',
        hebrewPlain: 'ערב טוב',
        transcription: 'э́рев тов',
        translation: 'добрый вечер',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-4',
        hebrew: 'תוֹדָה',
        hebrewPlain: 'תודה',
        transcription: 'тодá',
        translation: 'спасибо',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-5',
        hebrew: 'בְּבַקָּשָׁה',
        hebrewPlain: 'בבקשה',
        transcription: 'бэвакашá',
        translation: 'пожалуйста',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-6',
        hebrew: 'נָעִים מְאוֹד',
        hebrewPlain: 'נעים מאוד',
        transcription: 'наӣм мэóд',
        translation: 'очень приятно (познакомиться)',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-7',
        hebrew: 'שֵׁם',
        hebrewPlain: 'שם',
        transcription: 'шем',
        translation: 'имя',
        partOfSpeech: 'noun',
        gender: 'm',
        lessonId: 1,
      },
      {
        id: 'w1-8',
        hebrew: 'מָה נִשְׁמַע?',
        hebrewPlain: 'מה נשמע',
        transcription: 'ма нишмá?',
        translation: 'как дела? (досл. что слышно?)',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-9',
        hebrew: 'הַכֹּל בְּסֵדֶר',
        hebrewPlain: 'הכל בסדר',
        transcription: 'hакóль бэсэ́дер',
        translation: 'все в порядке',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-10',
        hebrew: 'יוֹפִי',
        hebrewPlain: 'יופי',
        transcription: 'йóфи',
        translation: 'отлично! красота!',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-11',
        hebrew: 'סְלִיחָה',
        hebrewPlain: 'סליחה',
        transcription: 'слихá',
        translation: 'извините / прошу прощения',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-12',
        hebrew: 'לְהִתְרָאוֹת',
        hebrewPlain: 'להתראות',
        transcription: 'лэhитраóт',
        translation: 'до свидания / увидимся',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
    ],
    basicSentences: [
      {
        id: 's1-1',
        hebrew: 'שָׁלוֹם, קוֹרְאִים לִי דָּנִיאֵל.',
        transcription: 'шалóм, коръӣм ли Даниэ́ль.',
        translation: 'Привет, меня зовут Даниэль.',
      },
      {
        id: 's1-2',
        hebrew: 'אֵיךְ קוֹרְאִים לְךָ?',
        transcription: 'эйх коръӣм лэхá?',
        translation: 'Как тебя зовут? (к мужчине)',
      },
      {
        id: 's1-3',
        hebrew: 'אֵיךְ קוֹרְאִים לָךְ?',
        transcription: 'эйх коръӣм лах?',
        translation: 'Как тебя зовут? (к женщине)',
      },
      {
        id: 's1-4',
        hebrew: 'נָעִים מְאוֹד, אֲנִי מֵיִשְׂרָאֵל.',
        transcription: 'наӣм мэóд, анӣ мэ-Исраэ́ль.',
        translation: 'Очень приятно, я из Израиля.',
      },
      {
        id: 's1-5',
        hebrew: 'מָה נִשְׁמַע? - הַכֹּל טוֹב, תּוֹדָה!',
        transcription: 'ма нишмá? - hакóль тов, тодá!',
        translation: 'Как дела? - Все хорошо, спасибо!',
      },
    ],
    dialogue: {
      title: 'Первое знакомство в Ульпане',
      situation: 'Вы пришли в ульпан в Тель-Авиве и знакомитесь с новым одногруппником по имени Ноам.',
      aiRole: 'Студент ульпана Ноам',
      userRole: 'Новый студент ульпана',
      initialMessage: {
        hebrew: 'שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי נוֹעַם. אֵיךְ קוֹרְאִים לְךָ?',
        transcription: 'шалóм! бóкер тов. анӣ Нóам. эйх коръӣм лэхá?',
        translation: 'Привет! Доброе утро. Я Ноам. Как тебя зовут?',
      },
      goals: [
        'Поздороваться в ответ',
        'Назвать свое имя (אֲנִי... или קוֹרְאִים לִי...)',
        'Сказать «Очень приятно» (נָעִים מְאוֹד)',
        'Спросить, как дела (מָה נִשְׁמַע?)',
      ],
      vocabularyHints: ['שָׁלוֹם', 'נָעִים מְאוֹד', 'קוֹרְאִים לִי', 'הַכֹּל בְּסֵדֶר', 'תוֹדָה'],
    },
    exercises: [
      {
        id: 'ex1-1',
        type: 'word_match',
        question: 'Выберите правильный перевод для слова «שָׁלוֹם»:',
        options: ['Спасибо', 'Привет / Мир', 'Пожалуйста', 'Извините'],
        correctAnswer: 'Привет / Мир',
        explanation: 'Слово שָׁלוֹם (шалóм) означает и приветствие, и «мир».',
      },
      {
        id: 'ex1-2',
        type: 'fill_blank',
        question: 'Вставьте пропущенное слово: «נָעִים ____» (Очень приятно):',
        options: ['טוֹב', 'מְאוֹד', 'שָׁלוֹם', 'בְּסֵדֶר'],
        correctAnswer: 'מְאוֹד',
        explanation: 'Фраза «Очень приятно» звучит как «נָעִים מְאוֹד» (наӣм мэóд).',
      },
      {
        id: 'ex1-3',
        type: 'build_sentence',
        question: 'Соберите фразу «Доброе утро, как дела?» на иврите:',
        options: ['בּוֹקֶר', 'טוֹב,', 'מָה', 'נִשְׁמַע?'],
        correctAnswer: ['בּוֹקֶר', 'טוֹב,', 'מָה', 'נִשְׁמַע?'],
        explanation: 'Правильный порядок: בּוֹקֶר טוֹב, מָה נִשְׁמַע?',
      },
    ],
  },

  2: {
    id: 2,
    level: 'alef',
    number: 2,
    titleHebrew: 'בְּבֵית הַקָּפֶה',
    titleRussian: 'В кафе: заказы и напитки',
    category: 'Еда и напитки',
    description: 'Глаголы ר-צ-ה (хотеть) и שׁ-ת-ה (пить) в настоящем времени, заказ кофе, воды и выпечки.',
    grammar: [
      {
        title: 'Глаголы со слабой третьей буквой ה (Гизрат Ламед-hей)',
        summary: 'Глаголы רוֹצֶה (хотеть) и שׁוֹתֶה (пить) меняют окончание по родам: -ֶה (м.р.) / -ָה (ж.р.).',
        explanation: `Глаголы этой группы оканчиваются на букву ה в настоящем времени.
        
Обратите внимание на окончания:
- Мужской род ед.ч.: оканчивается на **-ֶה (-э)**: רוֹצֶה (роцé), שׁוֹתֶה (шотé)
- Женский род ед.ч.: оканчивается на **-ָה (-а)**: רוֹצָה (роцá), שׁוֹתָה (шотá)
- Мужской род мн.ч.: оканчивается на **-ִים (-им)**: רוֹצִים (роцӣм), שׁוֹתִים (шотӣм)
- Женский род мн.ч.: оканчивается на **-וֹת (-от)**: רוֹצוֹת (роцóт), שׁוֹתוֹת (шотóт)`,
        tables: [
          {
            title: 'Спряжение глагола לִרְצוֹת (хотеть) в настоящем времени',
            headers: ['Форма', 'Иврит', 'Транскрипция', 'Перевод'],
            rows: [
              ['Мужской род ед.ч.', 'רוֹצֶה', 'роцé', 'хочет / хочу (мужчина)'],
              ['Женский род ед.ч.', 'רוֹצָה', 'роцá', 'хочет / хочу (женщина)'],
              ['Мужской род мн.ч.', 'רוֹצִים', 'роцӣм', 'хотят / хотим (мужчины)'],
              ['Женский род мн.ч.', 'רוֹצוֹת', 'роцóт', 'хотят / хотим (женщины)'],
            ],
          },
        ],
      },
    ],
    vocabulary: [
      {
        id: 'w2-1',
        hebrew: 'קָפֶה',
        hebrewPlain: 'קפה',
        transcription: 'кафэ́',
        translation: 'кофе',
        partOfSpeech: 'noun',
        gender: 'm',
        lessonId: 2,
      },
      {
        id: 'w2-2',
        hebrew: 'מַיִם',
        hebrewPlain: 'מים',
        transcription: 'мáйим',
        translation: 'вода',
        partOfSpeech: 'noun',
        gender: 'm',
        plural: 'мн. число',
        lessonId: 2,
      },
      {
        id: 'w2-3',
        hebrew: 'חָלָב',
        hebrewPlain: 'חלב',
        transcription: 'халáв',
        translation: 'молоко',
        partOfSpeech: 'noun',
        gender: 'm',
        lessonId: 2,
      },
      {
        id: 'w2-4',
        hebrew: 'סוּכָּר',
        hebrewPlain: 'סוכר',
        transcription: 'сукáр',
        translation: 'сахар',
        partOfSpeech: 'noun',
        gender: 'm',
        lessonId: 2,
      },
      {
        id: 'w2-5',
        hebrew: 'תֵּה',
        hebrewPlain: 'תה',
        transcription: 'тэ',
        translation: 'чай',
        partOfSpeech: 'noun',
        gender: 'm',
        lessonId: 2,
      },
      {
        id: 'w2-6',
        hebrew: 'עוּגָה',
        hebrewPlain: 'עוגה',
        transcription: 'угá',
        translation: 'торт, пирог, пирожное',
        partOfSpeech: 'noun',
        gender: 'f',
        lessonId: 2,
      },
      {
        id: 'w2-7',
        hebrew: 'קְרוּאָסוֹן',
        hebrewPlain: 'קרואסון',
        transcription: 'круасóн',
        translation: 'круассан',
        partOfSpeech: 'noun',
        gender: 'm',
        lessonId: 2,
      },
      {
        id: 'w2-8',
        hebrew: 'חֶשְׁבּוֹן',
        hebrewPlain: 'חשבון',
        transcription: 'хэжбóн',
        translation: 'счет (в кафе / банке)',
        partOfSpeech: 'noun',
        gender: 'm',
        lessonId: 2,
      },
      {
        id: 'w2-9',
        hebrew: 'רוֹצֶה / רוֹצָה',
        hebrewPlain: 'רוצה',
        transcription: 'роцé / роцá',
        translation: 'хочет (м.р. / ж.р.)',
        partOfSpeech: 'verb',
        root: 'ר-צ-ה',
        lessonId: 2,
      },
      {
        id: 'w2-10',
        hebrew: 'שׁוֹתֶה / שׁוֹתָה',
        hebrewPlain: 'שותה',
        transcription: 'шотé / шотá',
        translation: 'пьет (м.р. / ж.р.)',
        partOfSpeech: 'verb',
        root: 'ש-ת-ה',
        lessonId: 2,
      },
      {
        id: 'w2-11',
        hebrew: 'כֵּן',
        hebrewPlain: 'כן',
        transcription: 'кен',
        translation: 'да',
        partOfSpeech: 'expression',
        lessonId: 2,
      },
      {
        id: 'w2-12',
        hebrew: 'לֹא',
        hebrewPlain: 'לא',
        transcription: 'ло',
        translation: 'нет, не',
        partOfSpeech: 'expression',
        lessonId: 2,
      },
    ],
    basicSentences: [
      {
        id: 's2-1',
        hebrew: 'אֲנִי רוֹצֶה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.',
        transcription: 'анӣ роцé кафэ́ им халáв, бэвакашá.',
        translation: 'Я хочу кофе с молоком, пожалуйста (мужчина).',
      },
      {
        id: 's2-2',
        hebrew: 'אֲנִי רוֹצָה תֵּה עִם סוּכָּר.',
        transcription: 'анӣ роцá тэ им сукáр.',
        translation: 'Я хочу чай с сахаром (женщина).',
      },
      {
        id: 's2-3',
        hebrew: 'מָה אַתָּה שׁוֹתֶה?',
        transcription: 'ма атá шотé?',
        translation: 'Что ты пьешь? (вопрос мужчине)',
      },
      {
        id: 's2-4',
        hebrew: 'אֶפְשָׁר חֶשְׁבּוֹן, בְּבַקָּשָׁה?',
        transcription: 'эфшáр хэжбóн, бэвакашá?',
        translation: 'Можно счет, пожалуйста?',
      },
    ],
    dialogue: {
      title: 'Заказ в тель-авивском кафе',
      situation: 'Вы сидите за столиком в кафе на улице Дизенгоф. К вам подходит официант Йоси.',
      aiRole: 'Официант Йоси',
      userRole: 'Посетитель кафе',
      initialMessage: {
        hebrew: 'שָׁלוֹם! מָה תִּרְצֶה לִשְׁתּוֹת הַיּוֹם?',
        transcription: 'шалóм! ма тирцé лишто́т hайóм?',
        translation: 'Здравствуйте! Что вы хотите выпить сегодня?',
      },
      goals: [
        'Заказать кофе или чай с молоком или сахаром',
        'Попросить круассан или пирожное',
        'Вежливо попросить счет (אֶפְשָׁר חֶשְׁבּוֹן, בְּבַקָּשָׁה?)',
      ],
      vocabularyHints: ['רוֹצֶה / רוֹצָה', 'קָפֶה עִם חָלָב', 'עוּגָה', 'חֶשְׁבּוֹן', 'תוֹדָה רַבָּה'],
    },
    exercises: [
      {
        id: 'ex2-1',
        type: 'fill_blank',
        question: 'Если говорит девушка: «אֲנִי _____ קָפֶה» (Я хочу кофе):',
        options: ['רוֹצֶה', 'רוֹצָה', 'רוֹצִים', 'רוֹצוֹת'],
        correctAnswer: 'רוֹצָה',
        explanation: 'Для женского рода единственного числа форма глагола — רוֹצָה (роцá).',
      },
      {
        id: 'ex2-2',
        type: 'word_match',
        question: 'Как сказать «Счет, пожалуйста»?',
        options: [
          'בּוֹקֶר טוֹב, בְּבַקָּשָׁה',
          'אֶפְשָׁר חֶשְׁבּוֹן, בְּבַקָּשָׁה',
          'נָעִים מְאוֹד',
          'מָה נִשְׁמַע',
        ],
        correctAnswer: 'אֶפְשָׁר חֶשְׁבּוֹן, בְּבַקָּשָׁה',
        explanation: '«אֶפְשָׁר חֶשְׁבּוֹן» означает «можно счет».',
      },
    ],
  },
};

/**
 * Получение урока по ID (возвращает детальный урок либо сгенерированный шаблон)
 */
export function getLessonById(id: number): Lesson {
  if (DETAILED_LESSONS[id]) {
    return DETAILED_LESSONS[id];
  }

  const catalogItem = LESSONS_CATALOG.find((l) => l.id === id) || LESSONS_CATALOG[0];

  return {
    id: catalogItem.id,
    level: catalogItem.level,
    number: catalogItem.number,
    titleHebrew: catalogItem.titleHebrew,
    titleRussian: catalogItem.titleRussian,
    category: catalogItem.category,
    description: catalogItem.description,
    grammar: [
      {
        title: `Тема урока ${catalogItem.number}: ${catalogItem.titleRussian}`,
        summary: `Основные правила и грамматические структуры для уровня ${catalogItem.level === 'alef' ? 'Алеф (א)' : 'Бет (ב)'}.`,
        explanation: `В этом уроке мы изучаем грамматические конструкции по теме «${catalogItem.titleRussian}».
        
Обратите внимание на построение фраз и использование предлогов в живой речи.`,
        rules: [
          'Соблюдайте согласование в роде и числе.',
          'Буква ה в транскрипции передается символом "h".',
        ],
      },
    ],
    vocabulary: [
      {
        id: `w${id}-1`,
        hebrew: catalogItem.titleHebrew.split(' ')[0] || 'מִלָּה',
        hebrewPlain: catalogItem.titleHebrew.split(' ')[0] || 'מלה',
        transcription: 'милá',
        translation: 'слово / тема урока',
        partOfSpeech: 'noun',
        lessonId: id,
      },
    ],
    basicSentences: [
      {
        id: `s${id}-1`,
        hebrew: `${catalogItem.titleHebrew} - שִׁיעוּר חָשׁוּב.`,
        transcription: `${catalogItem.titleRussian} - шиӯр хашӯв.`,
        translation: 'Это важный урок в программе ульпана.',
      },
    ],
    dialogue: {
      title: `Диалог по теме: ${catalogItem.titleRussian}`,
      situation: `Практическая ситуация по теме ${catalogItem.titleRussian}.`,
      aiRole: 'Преподаватель или собеседник',
      userRole: 'Ученик ульпана',
      initialMessage: {
        hebrew: `שָׁלוֹם! בָּרוּךְ הַבָּא לְשִׁיעוּר ${catalogItem.number}. מָה נִשְׁמַע הַיּוֹם?`,
        transcription: `шалóм! барӯх hабá лэ-шиӯр ${catalogItem.number}. ма нишмá hайóм?`,
        translation: `Привет! Добро пожаловать на урок ${catalogItem.number}. Как твои дела сегодня?`,
      },
      goals: ['Ответить на приветствие', 'Потренировать выражения урока'],
      vocabularyHints: ['שָׁלוֹם', 'תוֹדָה', 'בְּבַקָּשָׁה'],
    },
    exercises: [
      {
        id: `ex${id}-1`,
        type: 'word_match',
        question: `Что изучается в уроке №${catalogItem.number}?`,
        options: [catalogItem.titleRussian, 'Погода', 'Космос', 'Автомобили'],
        correctAnswer: catalogItem.titleRussian,
      },
    ],
  };
}
