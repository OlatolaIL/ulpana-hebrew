import { HebrewLetter } from '@/types';

export const HEBREW_ALPHABET: HebrewLetter[] = [
  {
    "id": "alef",
    "letter": "א",
    "cursiveLetter": "א",
    "nameHebrew": "אָלֶף",
    "nameRussian": "А́леф",
    "transcription": "а / э (немая)",
    "sound": "Гортанный звук, сам по себе звука не имеет, читается по огласовке.",
    "gematria": 1,
    "strokeHint": "Рукописный алеф пишется как дуга слева направо сверху вниз (как кружок-петелька), затем прямая черта справа.",
    "exampleWord": {
      "hebrew": "אַבָּא",
      "transcription": "áбба",
      "translation": "папа"
    }
  },
  {
    "id": "bet",
    "letter": "ב",
    "cursiveLetter": "ב",
    "nameHebrew": "בֵּית / בֵית",
    "nameRussian": "Бет / Вет",
    "transcription": "б / в",
    "sound": "С точкой внутри (дагеш) — [Б], без точки — [В].",
    "gematria": 2,
    "strokeHint": "Рукописный бет пишется как плавная открытая снизу петля (похожа на латинскую c или полукруг с хвостиком).",
    "exampleWord": {
      "hebrew": "בַּיִת",
      "transcription": "бáйит",
      "translation": "дом"
    }
  },
  {
    "id": "gimel",
    "letter": "ג",
    "cursiveLetter": "ג",
    "nameHebrew": "גִּימֶל",
    "nameRussian": "Ги́мель",
    "transcription": "г",
    "sound": "Звонкий согласный звук [Г].",
    "gematria": 3,
    "strokeHint": "Рукописный гимель пишется одним движением: вертикальная палочка сверху вниз с изгибом вправо внизу.",
    "exampleWord": {
      "hebrew": "גֶּשֶׁם",
      "transcription": "гэ́шем",
      "translation": "дождь"
    }
  },
  {
    "id": "dalet",
    "letter": "ד",
    "cursiveLetter": "ד",
    "nameHebrew": "דָּלֶת",
    "nameRussian": "Да́лет",
    "transcription": "д",
    "sound": "Звонкий согласный звук [Д].",
    "gematria": 4,
    "strokeHint": "Рукописный далет пишется сверху вниз с плавным округлением влево, похож на крючок или знак интеграла.",
    "exampleWord": {
      "hebrew": "דֶּלֶת",
      "transcription": "дэ́лет",
      "translation": "дверь"
    }
  },
  {
    "id": "hei",
    "letter": "ה",
    "cursiveLetter": "ה",
    "nameHebrew": "הֵא",
    "nameRussian": "Хей (hей)",
    "transcription": "h (легкий выдох)",
    "sound": "Мягкий придыхательный звук [h], как в украинском «г» или английском «h». В русской традиции пишется как Хей.",
    "gematria": 5,
    "strokeHint": "Рукописный hей пишется как полукруг сверху вниз и отдельная вертикальная черточка слева.",
    "exampleWord": {
      "hebrew": "הַר",
      "transcription": "hар",
      "translation": "гора"
    }
  },
  {
    "id": "vav",
    "letter": "ו",
    "cursiveLetter": "ו",
    "nameHebrew": "וָו",
    "nameRussian": "Вав",
    "transcription": "в / о / у",
    "sound": "Согласный [В] или гласные [О] (с точкой сверху) и [У] (с точкой внутри).",
    "gematria": 6,
    "strokeHint": "Простая прямая вертикальная черточка сверху вниз.",
    "exampleWord": {
      "hebrew": "וֶרֶד",
      "transcription": "вэ́ред",
      "translation": "роза"
    }
  },
  {
    "id": "zayin",
    "letter": "ז",
    "cursiveLetter": "ז",
    "nameHebrew": "זַיִן",
    "nameRussian": "За́ин",
    "transcription": "з",
    "sound": "Звонкий согласный звук [З].",
    "gematria": 7,
    "strokeHint": "Верхняя горизонтальная черточка с плавным спуском вниз под наклоном.",
    "exampleWord": {
      "hebrew": "זְמַן",
      "transcription": "зман",
      "translation": "время"
    }
  },
  {
    "id": "chet",
    "letter": "ח",
    "cursiveLetter": "ח",
    "nameHebrew": "חֵית",
    "nameRussian": "Хет",
    "transcription": "х (гортанный)",
    "sound": "Глухой гортанный звук [Х], образующийся глубоко в горле.",
    "gematria": 8,
    "strokeHint": "Пишется как перевернутая подкова (арочка) одним непрерывным движением снизу вверх и вниз.",
    "exampleWord": {
      "hebrew": "חָבֵר",
      "transcription": "хавэ́р",
      "translation": "друг"
    }
  },
  {
    "id": "tet",
    "letter": "ט",
    "cursiveLetter": "ט",
    "nameHebrew": "טֵית",
    "nameRussian": "Тет",
    "transcription": "т",
    "sound": "Глухой твердый согласный звук [Т].",
    "gematria": 9,
    "strokeHint": "Начинается сверху слева, идет вниз по дуге вправо и закручивается внутрь (спираль).",
    "exampleWord": {
      "hebrew": "טוֹב",
      "transcription": "тов",
      "translation": "хороший / хорошо"
    }
  },
  {
    "id": "yod",
    "letter": "י",
    "cursiveLetter": "י",
    "nameHebrew": "יוֹד",
    "nameRussian": "Йод (Юд)",
    "transcription": "й / и",
    "sound": "Краткий согласный звук [Й] или долгий гласный [И].",
    "gematria": 10,
    "strokeHint": "Маленькая верхняя запятая или короткий штрих в верхней части строки.",
    "exampleWord": {
      "hebrew": "יָם",
      "transcription": "йам",
      "translation": "море"
    }
  },
  {
    "id": "kaf",
    "letter": "כ",
    "cursiveLetter": "כ",
    "nameHebrew": "כַּף / כַף",
    "nameRussian": "Каф / Хаф",
    "transcription": "к / х",
    "sound": "С точкой (дагеш) — [К], без точки — [Х].",
    "gematria": 20,
    "strokeHint": "Рукописный каф пишется как плавная круглая скобка, похожая на латинскую букву «ɔ».",
    "exampleWord": {
      "hebrew": "כֶּלֶב",
      "transcription": "кэ́лев",
      "translation": "собака"
    }
  },
  {
    "id": "kaf_sofit",
    "letter": "ך",
    "cursiveLetter": "ך",
    "nameHebrew": "כַּף סוֹפִית",
    "nameRussian": "Хаф софи́т",
    "transcription": "х",
    "sound": "Звук [Х] на конце слова.",
    "gematria": 20,
    "isSofit": true,
    "strokeHint": "Верхняя горизонтальная черточка с длинным прямым хвостом, уходящим глубоко под строку.",
    "exampleWord": {
      "hebrew": "דֶּרֶךְ",
      "transcription": "дэ́рех",
      "translation": "дорога / путь"
    }
  },
  {
    "id": "lamed",
    "letter": "ל",
    "cursiveLetter": "ל",
    "nameHebrew": "לָמֶד",
    "nameRussian": "Ла́мед",
    "transcription": "л",
    "sound": "Мягкий согласный звук [Л]. Единственная буква, поднимающаяся выше строки.",
    "gematria": 30,
    "strokeHint": "Пишется как круглая петелька снизу с высоким флажком, уходящим вверх над строкой.",
    "exampleWord": {
      "hebrew": "לֶחֶם",
      "transcription": "лэ́хем",
      "translation": "хлеб"
    }
  },
  {
    "id": "mem",
    "letter": "מ",
    "cursiveLetter": "מ",
    "nameHebrew": "מֵם",
    "nameRussian": "Мем",
    "transcription": "м",
    "sound": "Согласный звук [М] в начале и середине слова.",
    "gematria": 40,
    "strokeHint": "Пишется как плавная волна слева направо с вертикальной ножкой вниз.",
    "exampleWord": {
      "hebrew": "מַיִם",
      "transcription": "мáйим",
      "translation": "вода"
    }
  },
  {
    "id": "mem_sofit",
    "letter": "ם",
    "cursiveLetter": "ם",
    "nameHebrew": "מֵם סוֹפִית",
    "nameRussian": "Мем софи́т",
    "transcription": "м",
    "sound": "Звук [М] в конце слова.",
    "gematria": 40,
    "isSofit": true,
    "strokeHint": "Рукописный мем софит пишется как замкнутый круг или овал (как буква O).",
    "exampleWord": {
      "hebrew": "שָׁלוֹם",
      "transcription": "шалóм",
      "translation": "мир / привет"
    }
  },
  {
    "id": "nun",
    "letter": "נ",
    "cursiveLetter": "נ",
    "nameHebrew": "נוּן",
    "nameRussian": "Нун",
    "transcription": "н",
    "sound": "Согласный звук [Н] в начале и середине слова.",
    "gematria": 50,
    "strokeHint": "Короткий вертикальный штрих с закруглением вправо по нижней линии строки.",
    "exampleWord": {
      "hebrew": "נֵר",
      "transcription": "нэр",
      "translation": "свеча"
    }
  },
  {
    "id": "nun_sofit",
    "letter": "ן",
    "cursiveLetter": "ן",
    "nameHebrew": "נוּן סוֹפִית",
    "nameRussian": "Нун софи́т",
    "transcription": "н",
    "sound": "Звук [Н] в конце слова.",
    "gematria": 50,
    "isSofit": true,
    "strokeHint": "Длинная прямая вертикальная черта, опускающаяся ниже уровня строки.",
    "exampleWord": {
      "hebrew": "עִתּוֹן",
      "transcription": "итóн",
      "translation": "газета"
    }
  },
  {
    "id": "samech",
    "letter": "ס",
    "cursiveLetter": "ס",
    "nameHebrew": "סָמֶךְ",
    "nameRussian": "Са́мех",
    "transcription": "с",
    "sound": "Глухой согласный звук [С].",
    "gematria": 60,
    "strokeHint": "Замкнутый круг или овал с небольшим хвостиком сверху слева.",
    "exampleWord": {
      "hebrew": "סֵפֶר",
      "transcription": "сэ́фер",
      "translation": "книга"
    }
  },
  {
    "id": "ayin",
    "letter": "ע",
    "cursiveLetter": "ע",
    "nameHebrew": "עַיִן",
    "nameRussian": "А́ин",
    "transcription": "а / э (гортанный)",
    "sound": "Глубокий гортанный звук, читается согласно огласовке.",
    "gematria": 70,
    "strokeHint": "Похожа на рукописную русскую букву «у» или латинскую «y» с петлей под строкой.",
    "exampleWord": {
      "hebrew": "עִבְרִית",
      "transcription": "иврӣт",
      "translation": "иврит"
    }
  },
  {
    "id": "pei",
    "letter": "פ",
    "cursiveLetter": "פ",
    "nameHebrew": "פֵּא / פֵא",
    "nameRussian": "Пей / Фей",
    "transcription": "п / ф",
    "sound": "С точкой (дагеш) — [П], без точки — [Ф]. В Израиле произносится Пе / Фе.",
    "gematria": 80,
    "strokeHint": "Внешняя плавная дуга с завитком внутрь в верхней части.",
    "exampleWord": {
      "hebrew": "פֹּה",
      "transcription": "по",
      "translation": "здесь"
    }
  },
  {
    "id": "pei_sofit",
    "letter": "ף",
    "cursiveLetter": "ף",
    "nameHebrew": "פֵּא סוֹפִית",
    "nameRussian": "Фей софи́т",
    "transcription": "ф",
    "sound": "Звук [Ф] в конце слова.",
    "gematria": 80,
    "isSofit": true,
    "strokeHint": "Верхняя закругленная петелька с длинным вертикальным хвостом под строку.",
    "exampleWord": {
      "hebrew": "כֶּסֶף",
      "transcription": "кэ́сеф",
      "translation": "деньги / серебро"
    }
  },
  {
    "id": "tsadi",
    "letter": "צ",
    "cursiveLetter": "צ",
    "nameHebrew": "צָדִי",
    "nameRussian": "Ца́дик (Ца́ди)",
    "transcription": "ц",
    "sound": "Глухой согласный звук [Ц]. В Израиле официально называется Цади.",
    "gematria": 90,
    "strokeHint": "Пишется как цифра «3» или буква «з» с острым углом вправо.",
    "exampleWord": {
      "hebrew": "צָהֳרַיִם",
      "transcription": "цоhорáйим",
      "translation": "полдень"
    }
  },
  {
    "id": "tsadi_sofit",
    "letter": "ץ",
    "cursiveLetter": "ץ",
    "nameHebrew": "צָדִי סוֹפִית",
    "nameRussian": "Ца́дик софи́т",
    "transcription": "ц",
    "sound": "Звук [Ц] в конце слова.",
    "gematria": 90,
    "isSofit": true,
    "strokeHint": "Пишется как цифра «3» с длинным прямым хвостом, уходящим под строку.",
    "exampleWord": {
      "hebrew": "אֶרֶץ",
      "transcription": "э́рец",
      "translation": "страна / земля"
    }
  },
  {
    "id": "kof",
    "letter": "ק",
    "cursiveLetter": "ק",
    "nameHebrew": "קוֹף",
    "nameRussian": "Куф (Коф)",
    "transcription": "к",
    "sound": "Твердый согласный звук [К]. Традиционно в русских учебниках — Куф (в Израиле — Коф).",
    "gematria": 100,
    "strokeHint": "Правая закругленная дуга и левая вертикальная ножка, опускающаяся под строку.",
    "exampleWord": {
      "hebrew": "קָפֶה",
      "transcription": "кафэ́",
      "translation": "кофе"
    }
  },
  {
    "id": "resh",
    "letter": "ר",
    "cursiveLetter": "ר",
    "nameHebrew": "רֵישׁ",
    "nameRussian": "Реш",
    "transcription": "р",
    "sound": "Горловой или переднеязычный согласный звук [Р].",
    "gematria": 200,
    "strokeHint": "Одиночная плавная дуга сверху вниз слева направо (похожа на крючок или козырек).",
    "exampleWord": {
      "hebrew": "רְחוֹב",
      "transcription": "рэхóв",
      "translation": "улица"
    }
  },
  {
    "id": "shin",
    "letter": "ש",
    "cursiveLetter": "ש",
    "nameHebrew": "שִׁין / שִׂין",
    "nameRussian": "Шин / Син",
    "transcription": "ш / с",
    "sound": "С точкой справа — [Ш], с точкой слева — [С].",
    "gematria": 300,
    "strokeHint": "Рукописный шин пишется одним движением как волна или тройная дуга (похожа на рукописную английскую w или русскую ш).",
    "exampleWord": {
      "hebrew": "שָׁמַיִם",
      "transcription": "шамáйим",
      "translation": "небеса / небо"
    }
  },
  {
    "id": "tav",
    "letter": "ת",
    "cursiveLetter": "ת",
    "nameHebrew": "תָּו",
    "nameRussian": "Тав",
    "transcription": "т",
    "sound": "Глухой согласный звук [Т].",
    "gematria": 400,
    "strokeHint": "П-образная дуга с маленькой петелькой или крючком у левой ножки.",
    "exampleWord": {
      "hebrew": "תּוֹדָה",
      "transcription": "тодá",
      "translation": "спасибо"
    }
  }
];
