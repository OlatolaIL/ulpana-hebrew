import { LetterWritingRule } from '@/types';

/**
 * База данных правил начертания и пошаговых траекторий букв иврита (כתב יד - Ктав Яд).
 * Координатная сетка: 360 x 360 px
 * - Ascender (верхний надстрочный уровень для Ламед): y ≈ 45
 * - Top Line (верхняя граница обычной буквы): y ≈ 115
 * - Middle Line (середина строки): y ≈ 180
 * - Baseline (базовая линия строки): y ≈ 248
 * - Descender (подстрочная зона для софитов и букв ק, ע): y ≈ 320
 */
export const HEBREW_STROKE_RULES: Record<string, LetterWritingRule> = {
  alef: {
    letterId: 'alef',
    strokesCount: 2,
    penLifts: true,
    description: 'Рукописный Алеф пишется в два раздельных штриха: сначала левая петля (полукруг), затем правая наклонная линия сверху вниз.',
    startingPointSummary: 'Штрих 1: сверху справа; Штрих 2: в верхнем правом углу строки.',
    directionSummary: 'Штрих 1: против часовой стрелки влево и вниз; Штрих 2: строго сверху вниз.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: '1-й штрих: левая дуга-петля',
        startPoint: { x: 180, y: 115 },
        path: 'M 180 115 C 135 115 130 180 145 230 C 155 248 165 248 170 245',
        arrow: {
          from: { x: 175, y: 115 },
          to: { x: 140, y: 140 },
        },
        instruction: 'Начните в точке 1 (сверху), ведите плавную дугу влево и вниз до базовой линии строки.',
      },
      {
        id: 2,
        label: '2-й штрих: правая прямая',
        startPoint: { x: 230, y: 110 },
        path: 'M 230 110 L 225 248',
        arrow: {
          from: { x: 230, y: 125 },
          to: { x: 226, y: 220 },
        },
        instruction: 'Оторвите руку. Поставьте в точку 2 (вверху справа) и проведите прямую линию вниз до базовой строки.',
      },
    ],
  },

  bet: {
    letterId: 'bet',
    strokesCount: 1,
    penLifts: false,
    description: 'Буква Бет пишется одним непрерывным плавным движением (похожа на латинскую букву «c» или чашу, открытую вправо).',
    startingPointSummary: 'Вверху справа на верхней линии строки.',
    directionSummary: 'Влево по верху, вниз по левой стороне и вправо по базовой строке.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый контур: плавная дуга-чаша',
        startPoint: { x: 230, y: 115 },
        path: 'M 230 115 C 150 115 140 140 140 190 C 140 245 160 248 235 248',
        arrow: {
          from: { x: 220, y: 115 },
          to: { x: 160, y: 115 },
        },
        instruction: 'Начните вверху справа, ведите округлую линию влево, плавно опуститесь вниз и проведите нижнюю черту вправо по базовой линии.',
      },
    ],
  },

  gimel: {
    letterId: 'gimel',
    strokesCount: 1,
    penLifts: false,
    description: 'Рукописный Гимель — это вертикальная линия сверху вниз с плавным хвостиком вправо внизу («ножка шагающего человека»).',
    startingPointSummary: 'Вверху по центру строки.',
    directionSummary: 'Сверху вниз, затем мягкий изгиб вправо.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: ножка с загибом',
        startPoint: { x: 190, y: 110 },
        path: 'M 190 110 L 190 220 C 190 248 215 250 240 248',
        arrow: {
          from: { x: 190, y: 130 },
          to: { x: 190, y: 205 },
        },
        instruction: 'Начните сверху, ведите прямую линию вертикально вниз, а у самой базовой строки плавно загните вправо.',
      },
    ],
  },

  dalet: {
    letterId: 'dalet',
    strokesCount: 1,
    penLifts: false,
    description: 'Рукописный Далет похож на плавный крючок или русскую рукописную «г» с наклоном и легким загибом влево внизу.',
    startingPointSummary: 'Вверху справа строки.',
    directionSummary: 'Сверху справа с плавным округлением влево и вниз к базовой линии.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: крючок Далет',
        startPoint: { x: 225, y: 115 },
        path: 'M 225 115 C 185 115 170 170 155 220 C 150 238 145 248 140 248',
        arrow: {
          from: { x: 215, y: 115 },
          to: { x: 175, y: 140 },
        },
        instruction: 'Начните сверху справа, проведите плавную дугу влево и мягко опустите хвост вниз к базовой строке.',
      },
    ],
  },

  hei: {
    letterId: 'hei',
    strokesCount: 2,
    penLifts: true,
    description: 'Буква Хей состоит из правой изогнутой арки и отдельной левой вертикальной черты (левая ножка не касается крыши!).',
    startingPointSummary: 'Штрих 1: вверху справа; Штрих 2: в верхне-левой внутренней части.',
    directionSummary: 'Штрих 1: влево и вниз; Штрих 2: строго вниз.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: '1-й штрих: правая арка-крыша',
        startPoint: { x: 225, y: 115 },
        path: 'M 225 115 C 170 115 165 170 168 248',
        arrow: {
          from: { x: 215, y: 115 },
          to: { x: 175, y: 145 },
        },
        instruction: 'Начните в точке 1 (вверху справа), проведите верхнюю дугу влево и опустите вниз до базовой линии.',
      },
      {
        id: 2,
        label: '2-й штрих: левая свободная ножка',
        startPoint: { x: 130, y: 155 },
        path: 'M 130 155 L 130 248',
        arrow: {
          from: { x: 130, y: 165 },
          to: { x: 130, y: 230 },
        },
        instruction: 'Оторвите руку. Поставьте в точку 2 слева внутри и проведите вертикальную черточку вниз (не соединяя с верхом!).',
      },
    ],
  },

  vav: {
    letterId: 'vav',
    strokesCount: 1,
    penLifts: false,
    description: 'Самая лаконичная буква — простая вертикальная черточка строго сверху вниз в пределах рабочей строки.',
    startingPointSummary: 'На верхней линии строки.',
    directionSummary: 'Сверху вниз.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: вертикальная черта',
        startPoint: { x: 180, y: 110 },
        path: 'M 180 110 L 180 248',
        arrow: {
          from: { x: 180, y: 125 },
          to: { x: 180, y: 220 },
        },
        instruction: 'Поставьте руку на верхнюю линию и проведите прямую линию строго вниз до базовой строки.',
      },
    ],
  },

  zayin: {
    letterId: 'zayin',
    strokesCount: 1,
    penLifts: false,
    description: 'Буква Заин пишется как короткая горизонтальная шапочка вправо с последующим диагональным спуском вниз влево.',
    startingPointSummary: 'Вверху слева.',
    directionSummary: 'Вправо по верху, затем под наклоном вниз-влево.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: козырек и наклонная ножка',
        startPoint: { x: 150, y: 115 },
        path: 'M 150 115 L 215 115 L 165 248',
        arrow: {
          from: { x: 160, y: 115 },
          to: { x: 200, y: 115 },
        },
        instruction: 'Проведите короткую верхнюю черточку слева направо, и не отрывая руки, спуститесь по диагонали влево-вниз.',
      },
    ],
  },

  chet: {
    letterId: 'chet',
    strokesCount: 1,
    penLifts: false,
    description: 'Рукописный Хет пишется одним непрерывным движением в виде перевернутой подковы (арочки): снизу вверх, через верх и вниз.',
    startingPointSummary: 'Снизу слева на базовой линии.',
    directionSummary: 'Снизу вверх, направо по дуге и вниз направо.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: перевернутая подкова (арочка)',
        startPoint: { x: 140, y: 248 },
        path: 'M 140 248 L 140 135 C 140 115 220 115 220 135 L 220 248',
        arrow: {
          from: { x: 140, y: 230 },
          to: { x: 140, y: 150 },
        },
        instruction: 'Начните внизу слева, поднимитесь вертикально вверх, закруглите вправо через верх и опуститесь вниз справа.',
      },
    ],
  },

  tet: {
    letterId: 'tet',
    strokesCount: 1,
    penLifts: false,
    description: 'Буква Тет напоминает спиральную чашу: спуск слева, плавное дно, подъем справа и закругление внутрь.',
    startingPointSummary: 'Вверху слева на верхней линии строки.',
    directionSummary: 'Вниз, направо по дну, вверх и завиток внутрь.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: спиральная чаша',
        startPoint: { x: 150, y: 120 },
        path: 'M 150 120 C 145 190 145 245 180 248 C 215 248 225 210 225 155 C 225 140 200 155 185 175',
        arrow: {
          from: { x: 150, y: 135 },
          to: { x: 150, y: 200 },
        },
        instruction: 'Начните вверху слева, опуститесь вниз, проведите круглое донышко вправо, поднимитесь и загните хвостик внутрь чаши.',
      },
    ],
  },

  yod: {
    letterId: 'yod',
    strokesCount: 1,
    penLifts: false,
    description: 'Самая маленькая буква алфавита. Пишется как короткая запятая или штрих строго в верхней половине строки.',
    startingPointSummary: 'Вверху строки.',
    directionSummary: 'Сверху вниз с легким изгибом влево.',
    proportions: {
      ascender: false,
      baseline: false,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: верхняя запятая',
        startPoint: { x: 185, y: 110 },
        path: 'M 185 110 C 185 130 178 145 172 160',
        arrow: {
          from: { x: 185, y: 115 },
          to: { x: 178, y: 145 },
        },
        instruction: 'Поставьте точку вверху и проведите короткий штрих-крючок вниз, не опускаясь ниже середины строки.',
      },
    ],
  },

  kaf: {
    letterId: 'kaf',
    strokesCount: 1,
    penLifts: false,
    description: 'Рукописный Каф пишется как плавная округлая открытая дуга (как полукруг или открытая скобка «)»).',
    startingPointSummary: 'Вверху справа.',
    directionSummary: 'Влево по дуге, вниз и возврат вправо по базовой линии.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: круглая скобка Каф',
        startPoint: { x: 225, y: 115 },
        path: 'M 225 115 C 145 125 140 170 140 200 C 140 245 175 248 225 248',
        arrow: {
          from: { x: 215, y: 118 },
          to: { x: 160, y: 135 },
        },
        instruction: 'Начните вверху справа, очертите плавную полукруглую дугу влево и вниз, завершив на базовой линии справа.',
      },
    ],
  },

  kaf_sofit: {
    letterId: 'kaf_sofit',
    strokesCount: 1,
    penLifts: false,
    description: 'Конечный Хаф (Софит): верхняя прямая перекладина с длинным вертикальным хвостом, уходящим глубоко ПОД базовую строку.',
    startingPointSummary: 'Вверху слева на верхней линии.',
    directionSummary: 'Слева направо, затем под прямым углом вертикально вниз глубоко под строку.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: true,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: перекладина и глубокий хвост',
        startPoint: { x: 155, y: 115 },
        path: 'M 155 115 L 215 115 L 215 320',
        arrow: {
          from: { x: 165, y: 115 },
          to: { x: 205, y: 115 },
        },
        instruction: 'Проведите горизонтальную черту слева направо, поверните под прямым углом и проведите длинную линию вниз под строку.',
      },
    ],
  },

  lamed: {
    letterId: 'lamed',
    strokesCount: 1,
    penLifts: false,
    description: 'Единственная буква, флажок которой взлетает высоко НАД строкой! Начинается с нижней петли и взмывает вверх.',
    startingPointSummary: 'В середине строки (чуть выше базовой линии).',
    directionSummary: 'Вниз к базовой линии, петля вправо и мощный подъем высоко вверх над строкой с крючком влево.',
    proportions: {
      ascender: true,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: нижняя петля и высокий флажок',
        startPoint: { x: 170, y: 205 },
        path: 'M 170 205 C 145 220 145 248 175 248 C 210 248 205 210 200 130 L 195 45 C 190 45 175 50 165 55',
        arrow: {
          from: { x: 170, y: 215 },
          to: { x: 150, y: 240 },
        },
        instruction: 'Начните в центре строки, сделайте круглую нижнюю петельку на базовой строке, а затем выведите высокий прямой штрих вверх над строкой.',
      },
    ],
  },

  mem: {
    letterId: 'mem',
    strokesCount: 2,
    penLifts: true,
    description: 'Рукописный Мем пишется как плавная правая арка-купол с отдельной левой наклонной ножкой.',
    startingPointSummary: 'Штрих 1: вверху слева; Штрих 2: слева наклонная ножка.',
    directionSummary: 'Штрих 1: через верхний купол вниз вправо; Штрих 2: сверху вниз.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: '1-й штрих: правый купол и вертикаль',
        startPoint: { x: 150, y: 145 },
        path: 'M 150 145 C 155 115 205 115 215 145 L 215 248',
        arrow: {
          from: { x: 160, y: 125 },
          to: { x: 205, y: 135 },
        },
        instruction: 'Начните в точке 1, выведите купол вправо и опустите прямую правую ножку на базовую линию.',
      },
      {
        id: 2,
        label: '2-й штрих: левая ножка',
        startPoint: { x: 140, y: 155 },
        path: 'M 140 155 L 140 248',
        arrow: {
          from: { x: 140, y: 165 },
          to: { x: 140, y: 230 },
        },
        instruction: 'Оторвите руку. Поставьте в точку 2 и проведите левую ножку вниз до базовой строки.',
      },
    ],
  },

  mem_sofit: {
    letterId: 'mem_sofit',
    strokesCount: 1,
    penLifts: false,
    description: 'Конечный Мем (Софит) в рукописном виде — это аккуратный замкнутый кружок или овал (похож на латинскую букву «O»).',
    startingPointSummary: 'Вверху в позиции 12 часов.',
    directionSummary: 'Против часовой стрелки: влево, вниз, вправо и замыкание наверху.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: замкнутый кружок-овал',
        startPoint: { x: 180, y: 115 },
        path: 'M 180 115 C 140 115 135 170 135 190 C 135 245 170 248 185 248 C 225 248 225 180 225 160 C 225 115 195 115 180 115 Z',
        arrow: {
          from: { x: 170, y: 115 },
          to: { x: 140, y: 145 },
        },
        instruction: 'Начните вверху по центру, проведите полный круг против часовой стрелки и замкните в начальной точке.',
      },
    ],
  },

  nun: {
    letterId: 'nun',
    strokesCount: 1,
    penLifts: false,
    description: 'Обычный Нун пишется в один штрих: вертикальный спуск вниз и четкий поворот вправо по базовой строке (зеркальная «L»).',
    startingPointSummary: 'Вверху на верхней линии строки.',
    directionSummary: 'Сверху вниз, затем вправо по базовой линии.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: ножка с прямым углом вправо',
        startPoint: { x: 165, y: 115 },
        path: 'M 165 115 L 165 245 C 165 248 185 248 220 248',
        arrow: {
          from: { x: 165, y: 130 },
          to: { x: 165, y: 210 },
        },
        instruction: 'Начните вверху, опуститесь вертикально вниз до базовой строки и сделайте четкий поворот вправо.',
      },
    ],
  },

  nun_sofit: {
    letterId: 'nun_sofit',
    strokesCount: 1,
    penLifts: false,
    description: 'Конечный Нун (Софит): длинная, строгая вертикальная прямая, уходящая далеко ПОД базовую строку (в 2 раза длиннее Вав).',
    startingPointSummary: 'На верхней линии строки.',
    directionSummary: 'Строго сверху вниз сквозь базовую строку глубоко в подстрочную зону.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: true,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: длинная прямая под строку',
        startPoint: { x: 180, y: 110 },
        path: 'M 180 110 L 180 320',
        arrow: {
          from: { x: 180, y: 130 },
          to: { x: 180, y: 260 },
        },
        instruction: 'Поставьте руку на верхнюю линию и проведите одну длинную непрерывную прямую линию глубоко под строку.',
      },
    ],
  },

  samech: {
    letterId: 'samech',
    strokesCount: 1,
    penLifts: false,
    description: 'Буква Самех — это замкнутый круг с характерным маленьким начальным хвостиком-узелком в верхнем левом углу.',
    startingPointSummary: 'Вверху слева (хвостик).',
    directionSummary: 'Круговое движение против часовой стрелки с нахлестом в начальной точке.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: овал с узелком',
        startPoint: { x: 160, y: 115 },
        path: 'M 160 115 C 135 140 135 220 165 248 C 205 248 225 210 225 170 C 225 125 190 115 160 115',
        arrow: {
          from: { x: 155, y: 120 },
          to: { x: 138, y: 160 },
        },
        instruction: 'Начните вверху слева, опишите красивый круг через низ направо и замкните наверху у начального узелка.',
      },
    ],
  },

  ayin: {
    letterId: 'ayin',
    strokesCount: 1,
    penLifts: false,
    description: 'Рукописный Аин пишется непрерывным росчерком: чаша как у русской «у» или латинской «y», с хвостом, уходящим ПОД строку.',
    startingPointSummary: 'Вверху слева.',
    directionSummary: 'Вниз по дуге, подъем вправо и спуск длинного хвоста под строку.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: true,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: чаша с подстрочным хвостом',
        startPoint: { x: 140, y: 115 },
        path: 'M 140 115 C 140 170 155 215 175 210 C 195 205 210 165 215 125 L 215 210 C 215 260 195 315 180 320',
        arrow: {
          from: { x: 140, y: 130 },
          to: { x: 150, y: 180 },
        },
        instruction: 'Начните вверху слева, сделайте закругление внизу, поднимитесь к правому верхнему краю и резко уведите хвост вниз под строку с загибом влево.',
      },
    ],
  },

  pei: {
    letterId: 'pei',
    strokesCount: 1,
    penLifts: false,
    description: 'Буква Пей пишется одним красивым движением: внешний круглый контур с внутренним завитком-улиткой в центре.',
    startingPointSummary: 'Вверху справа.',
    directionSummary: 'Влево по дуге, вниз, вправо по базовой линии и завиток внутрь.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: внешний контур с завитком внутрь',
        startPoint: { x: 220, y: 115 },
        path: 'M 220 115 C 145 115 140 165 140 200 C 140 248 180 248 215 248 C 225 248 225 195 210 175 C 195 160 175 165 175 180',
        arrow: {
          from: { x: 210, y: 115 },
          to: { x: 160, y: 125 },
        },
        instruction: 'Начните вверху справа, очертите внешнюю дугу влево и вниз, пройдите по низу и закрутите хвостик внутрь буквы.',
      },
    ],
  },

  pei_sofit: {
    letterId: 'pei_sofit',
    strokesCount: 1,
    penLifts: false,
    description: 'Конечный Фей (Софит): верхняя круглая петля с длинным прямым вертикальным спуском глубоко ПОД строку.',
    startingPointSummary: 'Вверху по центру.',
    directionSummary: 'Петля влево через верх и прямой длинный спуск вниз под строку.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: true,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: верхняя петелька и хвост под строку',
        startPoint: { x: 175, y: 115 },
        path: 'M 175 115 C 140 115 135 150 165 155 C 195 155 215 145 215 130 L 215 320',
        arrow: {
          from: { x: 165, y: 115 },
          to: { x: 142, y: 135 },
        },
        instruction: 'Начните вверху, закруглите петлю влево и вниз, выйдите вправо и проведите длинный прямой хвост глубоко вниз под строку.',
      },
    ],
  },

  tsadi: {
    letterId: 'tsadi',
    strokesCount: 1,
    penLifts: false,
    description: 'Буква Цади напоминает рукописную цифру «3» или русскую букву «з» с острым выходом на базовую линию.',
    startingPointSummary: 'Вверху слева.',
    directionSummary: 'Верхняя полудуга к центру, затем нижняя дуга к базовой строке.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: двойная дуга (как тройка)',
        startPoint: { x: 155, y: 115 },
        path: 'M 155 115 C 185 115 210 135 195 175 C 215 200 215 245 180 248 C 160 248 150 245 150 240',
        arrow: {
          from: { x: 165, y: 115 },
          to: { x: 195, y: 140 },
        },
        instruction: 'Начните вверху слева, сделайте верхнюю полудугу к центру строки, затем нижнюю полудугу на базовую линию.',
      },
    ],
  },

  tsadi_sofit: {
    letterId: 'tsadi_sofit',
    strokesCount: 1,
    penLifts: false,
    description: 'Конечный Цади (Софит): верхняя дуга-завиток, переходящая в длинный прямой хвост, уходящий ПОД базовую строку.',
    startingPointSummary: 'Вверху слева.',
    directionSummary: 'Верхняя дуга к центру и прямой спуск глубоко под строку.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: true,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: верхняя дуга и хвост под строку',
        startPoint: { x: 155, y: 115 },
        path: 'M 155 115 C 185 115 210 135 195 170 L 195 320',
        arrow: {
          from: { x: 165, y: 115 },
          to: { x: 195, y: 140 },
        },
        instruction: 'Начните вверху слева, выведите верхнюю дугу к середине строки и проведите прямую линию глубоко вниз под строку.',
      },
    ],
  },

  kof: {
    letterId: 'kof',
    strokesCount: 2,
    penLifts: true,
    description: 'Буква Коф (Куф) пишется в два штриха: правая полукруглая арка и отдельная левая ножка, уходящая ПОД строку.',
    startingPointSummary: 'Штрих 1: вверху справа; Штрих 2: вверху слева.',
    directionSummary: 'Штрих 1: дуга влево и вниз; Штрих 2: длинная прямая вниз под строку.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: true,
    },
    strokes: [
      {
        id: 1,
        label: '1-й штрих: правая округлая арка',
        startPoint: { x: 225, y: 135 },
        path: 'M 225 135 C 220 115 185 115 180 145 C 175 190 185 248 220 248',
        arrow: {
          from: { x: 220, y: 125 },
          to: { x: 185, y: 135 },
        },
        instruction: 'Начните в точке 1 (справа), выведите дугу через верх налево и опустите к базовой линии.',
      },
      {
        id: 2,
        label: '2-й штрих: левая ножка под строку',
        startPoint: { x: 145, y: 110 },
        path: 'M 145 110 L 145 310',
        arrow: {
          from: { x: 145, y: 130 },
          to: { x: 145, y: 250 },
        },
        instruction: 'Оторвите руку. Поставьте в точку 2 слева и проведите прямую ножку вниз, выходящую глубоко под базовую строку.',
      },
    ],
  },

  resh: {
    letterId: 'resh',
    strokesCount: 1,
    penLifts: false,
    description: 'Рукописный Реш — один из самых простых знаков: плавный закругленный козырек слева направо и спуск к базовой строке.',
    startingPointSummary: 'Вверху слева на верхней линии.',
    directionSummary: 'Слева направо по верху с плавным поворотом вниз.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: округлый козырек Реш',
        startPoint: { x: 150, y: 115 },
        path: 'M 150 115 C 190 115 220 115 220 145 L 220 248',
        arrow: {
          from: { x: 160, y: 115 },
          to: { x: 210, y: 115 },
        },
        instruction: 'Начните вверху слева, проведите плавную горизонтальную черту вправо, мягко закруглите и опуститесь на базовую линию.',
      },
    ],
  },

  shin: {
    letterId: 'shin',
    strokesCount: 1,
    penLifts: false,
    description: 'Рукописный Шин пишется одним непрерывным волнообразным движением: тройная волна (как рукописная английская «w»).',
    startingPointSummary: 'Вверху справа.',
    directionSummary: 'Вниз к первой впадине, вверх к среднему пику, вниз ко второй впадине и вверх влево.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: 'Единый штрих: трехволновой росчерк',
        startPoint: { x: 235, y: 120 },
        path: 'M 235 120 C 230 180 215 245 200 245 C 185 245 180 185 175 155 C 170 185 160 245 145 245 C 130 245 125 180 120 120',
        arrow: {
          from: { x: 235, y: 135 },
          to: { x: 210, y: 210 },
        },
        instruction: 'Начните вверху справа, опуститесь к первой нижней точке, поднимитесь к середине, опуститесь ко второй нижней точке и завершите вверху слева.',
      },
    ],
  },

  tav: {
    letterId: 'tav',
    strokesCount: 2,
    penLifts: true,
    description: 'Буква Тав состоит из основной арки-купола и отдельного левого нижнего крючка/хвостика.',
    startingPointSummary: 'Штрих 1: снизу слева; Штрих 2: в левой нижней части буквы.',
    directionSummary: 'Штрих 1: снизу вверх, через правый купол вниз; Штрих 2: крючок-петелька влево.',
    proportions: {
      ascender: false,
      baseline: true,
      descender: false,
    },
    strokes: [
      {
        id: 1,
        label: '1-й штрих: главная арка Тав',
        startPoint: { x: 140, y: 248 },
        path: 'M 140 248 L 140 135 C 140 115 220 115 220 135 L 220 248',
        arrow: {
          from: { x: 140, y: 230 },
          to: { x: 140, y: 150 },
        },
        instruction: 'Начните снизу слева в точке 1, поднимитесь вверх, очертите правый купол и опуститесь на базовую линию.',
      },
      {
        id: 2,
        label: '2-й штрих: левый нижний крючок',
        startPoint: { x: 140, y: 210 },
        path: 'M 140 210 C 130 210 115 230 115 248',
        arrow: {
          from: { x: 138, y: 215 },
          to: { x: 120, y: 240 },
        },
        instruction: 'Оторвите руку. Поставьте в точку 2 у основания левой ножки и выведите короткий полукруглый крючок влево.',
      },
    ],
  },
};
