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
    titleHebrew: 'פָּעֳלֵי פָּעַל - הוֹלֵךְ וְלוֹמֵד',
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
    description: 'Время, части суток (בֹּקֶר, צָהֳרַיִם, עֶרֶב, לַיְלָה), глагол ק-ו-ם (קָם/קָמָה - вставать).',
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
  // Генерируем последующие уроки уровня Алеф (11-50)
  ...Array.from({ length: 40 }, (_, i) => {
    const num = 11 + i;
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
  // Генерируем последующие уроки уровня Бет (53-100)
  ...Array.from({ length: 48 }, (_, i) => {
    const num = 53 + i;
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
        explanation: 'В иврите нет среднего рода — все существительные и местоимения мужского или женского рода.',
        tables: [
          {
            title: 'Единственное число',
            headers: ['Местоимение', 'Транскрипция', 'Перевод', 'Род'],
            rows: [
              ['אֲנִי', 'анӣ', 'Я', 'Общий'],
              ['אַתָּה', 'атá', 'Ты (м.р.)', 'Мужской'],
              ['אַתְּ', 'ат', 'Ты (ж.р.)', 'Женский'],
              ['הוּא', 'hу', 'Он', 'Мужской'],
              ['הִיא', 'hи', 'Она', 'Женский'],
            ],
          },
        ],
      },
    ],
    vocabulary: [
      {
        id: 'w1-1',
        hebrew: 'שָׁלוֹם',
        hebrewPlain: 'שלום',
        transcription: 'шалóм',
        translation: 'мир; привет; здравствуйте',
        partOfSpeech: 'expression',
        root: 'ש-ל-ם',
        lessonId: 1,
      },
      {
        id: 'w1-2',
        hebrew: 'תוֹדָה',
        hebrewPlain: 'תודה',
        transcription: 'тодá',
        translation: 'спасибо',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-3',
        hebrew: 'בְּבַקָּשָׁה',
        hebrewPlain: 'בבקשה',
        transcription: 'бэвакашá',
        translation: 'пожалуйста',
        partOfSpeech: 'expression',
        lessonId: 1,
      },
      {
        id: 'w1-4',
        hebrew: 'נָעִים מְאוֹד',
        hebrewPlain: 'נעים מאוד',
        transcription: 'наӣм мэóд',
        translation: 'очень приятно',
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
    ],
    dialogue: {
      title: 'Первое знакомство в Ульпане',
      situation: 'Вы пришли в ульпан в Тель-Авиве и знакомитесь с новым одногруппником по имени Ноам.',
      aiRole: 'Студент ульпана Ноам',
      userRole: 'Новый студент ульпана',
      initialMessage: {
        hebrew: 'שָׁלוֹם! בֹּקֶר טוֹב. אֲנִי נֹעַם. אֵיךְ קוֹרְאִים לָךְ / לְךָ?',
        transcription: 'шалóм! бóкер тов. анӣ Нóам. эйх коръӣм лах / лэхá?',
        translation: 'Привет! Доброе утро. Я Ноам. Как тебя зовут?',
      },
      goals: ['Поздороваться в ответ', 'Назвать свое имя', 'Сказать «Очень приятно»'],
      vocabularyHints: ['שָׁלוֹם', 'נָעִים מְאוֹד', 'קוֹרְאִים לִי', 'תוֹדָה'],
    },
    exercises: [
      {
        id: 'ex1-1',
        type: 'word_match',
        question: 'Выберите правильный перевод для слова «שָׁלוֹם»:',
        options: ['Спасибо', 'Привет / Мир', 'Пожалуйста', 'Извините'],
        correctAnswer: 'Привет / Мир',
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
    description: 'Глаголы ר-צ-ה (хотеть) и שׁ-ת-ה (пить), заказ кофе, воды и выпечки.',
    grammar: [],
    vocabulary: [
      {
        id: 'w2-1',
        hebrew: 'קָפֶה',
        hebrewPlain: 'קפה',
        transcription: 'кафэ́',
        translation: 'кофе',
        partOfSpeech: 'noun',
        lessonId: 2,
      },
      {
        id: 'w2-2',
        hebrew: 'סוּכָּר',
        hebrewPlain: 'סוכר',
        transcription: 'сукáр',
        translation: 'сахар',
        partOfSpeech: 'noun',
        lessonId: 2,
      },
    ],
    basicSentences: [],
    dialogue: {
      title: 'Заказ в тель-авивском кафе',
      situation: 'Вы сидите за столиком в кафе. К вам подходит официант Йоси.',
      aiRole: 'Официант Йоси',
      userRole: 'Посетитель кафе',
      initialMessage: {
        hebrew: 'שָׁלוֹם! מָה תִּרְצֶה / תִּרְצִי לִשְׁתּוֹת הַיּוֹם?',
        transcription: 'шалóм! ма тирцé / тирцӣ лишто́т hайóм?',
        translation: 'Здравствуйте! Что вы хотите выпить сегодня?',
      },
      goals: ['Заказать напиток', 'Попросить счет'],
      vocabularyHints: ['רוֹצֶה / רוֹצָה', 'קָפֶה', 'חֶשְׁבּוֹן'],
    },
    exercises: [],
  },
};

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
        summary: `Основные правила для уровня ${catalogItem.level === 'alef' ? 'Алеф (א)' : 'Бет (ב)'}.`,
        explanation: `В этом уроке мы изучаем грамматические конструкции по теме «${catalogItem.titleRussian}».`,
        rules: ['Соблюдайте согласование в роде и числе.'],
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
      title: `Диалог: ${catalogItem.titleRussian}`,
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
    exercises: [],
  };
}
