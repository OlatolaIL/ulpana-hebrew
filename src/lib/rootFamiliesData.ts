import { RootRelatedWord } from '@/types';

/**
 * Всеобъемлющая база семей корней (משפחת מילים / Pealim Root Family)
 * Содержит преимущественно имена существительные (noun), прилагательные (adjective)
 * и устойчивые выражения (expression) для каждого корня.
 */
export const COMPREHENSIVE_ROOT_FAMILIES: Record<string, RootRelatedWord[]> = {
  // ח-ז-ר (возвращаться, повторять)
  'חזר': [
    { hebrew: 'חֲזָרָה', hebrewPlain: 'חזרה', transcription: 'хазарá', translation: 'повторение, репетиция, возвращение (ж.р.)', partOfSpeech: 'noun', root: 'ח-ז-ר' },
    { hebrew: 'מַחְזוֹר', hebrewPlain: 'מחזור', transcription: 'махзóр', translation: 'цикл, оборот, праздничный молитвенник (м.р.)', partOfSpeech: 'noun', root: 'ח-ז-ר' },
    { hebrew: 'חַזְרָנִי', hebrewPlain: 'חזרני', transcription: 'хазранӣ', translation: 'повторяющийся, рецидивирующий', partOfSpeech: 'adjective', root: 'ח-ז-ר' },
    { hebrew: 'בְּחֲזָרָה', hebrewPlain: 'בחזרה', transcription: 'бехазарá', translation: 'обратно, назад (наречие)', partOfSpeech: 'expression', root: 'ח-ז-ר' },
    { hebrew: 'מַחְזוֹרִי', hebrewPlain: 'מחזורי', transcription: 'махзорӣ', translation: 'периодический, циклический', partOfSpeech: 'adjective', root: 'ח-ז-ר' },
    { hebrew: 'חַזְרָנוּת', hebrewPlain: 'חזרנות', transcription: 'хазранӯт', translation: 'навязчивая повторяемость (ж.р.)', partOfSpeech: 'noun', root: 'ח-ז-ר' },
    { hebrew: 'לְהַחְזִיר', hebrewPlain: 'להחזיר', transcription: 'леhахзӣр', translation: 'возвращать (что-то) (Ифъиль)', partOfSpeech: 'verb', binyan: 'הִפְעִיל (Ифъиль)', root: 'ח-ז-ר' },
  ],

  // כ-ת-ב (писать)
  'כתב': [
    { hebrew: 'מִכְתָּב', hebrewPlain: 'מכתב', transcription: 'михтáв', translation: 'письмо (почтовое) (м.р.)', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'כְּתֹבֶת', hebrewPlain: 'כתובת', transcription: 'ктóвет', translation: 'адрес, надпись (ж.р.)', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'כְּתָב', hebrewPlain: 'כתב', transcription: 'ктав', translation: 'почерк, шрифт, документ (м.р.)', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'כַּתָּב', hebrewPlain: 'כתב', transcription: 'катáв', translation: 'корреспондент, журналист (м.р.)', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'הַכְתָּבָה', hebrewPlain: 'הכתבה', transcription: 'hахтавá', translation: 'диктант (ж.р.)', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'כְּתָבָה', hebrewPlain: 'כתבה', transcription: 'ктавá', translation: 'статья, репортаж (ж.р.)', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'כָּתוּב', hebrewPlain: 'כתוב', transcription: 'катӯв', translation: 'написанный', partOfSpeech: 'adjective', root: 'כ-ת-ב' },
  ],

  // ל-מ-ד (учить, учиться)
  'למד': [
    { hebrew: 'תַּלְמִיד', hebrewPlain: 'תלמיד', transcription: 'тальмӣд', translation: 'ученик, школьник (м.р.)', partOfSpeech: 'noun', root: 'ל-מ-ד' },
    { hebrew: 'תַּלְמִידָה', hebrewPlain: 'תלמידה', transcription: 'тальмидá', translation: 'ученица, школьница (ж.р.)', partOfSpeech: 'noun', root: 'ל-מ-ד' },
    { hebrew: 'לִמּוּדִים', hebrewPlain: 'לימודים', transcription: 'лимудӣм', translation: 'учёба, занятия (мн.ч., м.р.)', partOfSpeech: 'noun', root: 'ל-מ-ד' },
    { hebrew: 'לַמְדָן', hebrewPlain: 'למדן', transcription: 'ламдáн', translation: 'эрудит, прилежный ученик (м.р.)', partOfSpeech: 'noun', root: 'ל-מ-ד' },
    { hebrew: 'מְלֻמָּד', hebrewPlain: 'מלומד', transcription: 'мелумáд', translation: 'учёный, образованный', partOfSpeech: 'adjective', root: 'ל-מ-ד' },
    { hebrew: 'תַּלְמוּד', hebrewPlain: 'תלמוד', transcription: 'тальмӯд', translation: 'Талмуд, учение (м.р.)', partOfSpeech: 'noun', root: 'ל-מ-ד' },
  ],

  // ש-ל-ם (платить, завершать, мир)
  'שלם': [
    { hebrew: 'שָׁלוֹם', hebrewPlain: 'שלום', transcription: 'шалóм', translation: 'мир, приветствие, благополучие (м.р.)', partOfSpeech: 'noun', root: 'ש-ל-ם' },
    { hebrew: 'תַּשְׁלוּם', hebrewPlain: 'תשלום', transcription: 'ташлӯм', translation: 'платёж, оплата, взнос (м.р.)', partOfSpeech: 'noun', root: 'ש-ל-ם' },
    { hebrew: 'שָׁלֵם', hebrewPlain: 'שלם', transcription: 'шалéм', translation: 'целый, полный, законченный', partOfSpeech: 'adjective', root: 'ש-ל-ם' },
    { hebrew: 'מֻשְׁלָם', hebrewPlain: 'מושלם', transcription: 'мушлáм', translation: 'идеальный, безупречный, совершенный', partOfSpeech: 'adjective', root: 'ש-ל-ם' },
    { hebrew: 'הַשְׁלָמָה', hebrewPlain: 'השלמה', transcription: 'hашламá', translation: 'примирение, завершение, восполнение (ж.р.)', partOfSpeech: 'noun', root: 'ש-ל-ם' },
    { hebrew: 'שְׁלֵמוּת', hebrewPlain: 'שלמות', transcription: 'шлемӯт', translation: 'совершенство, полнота (ж.р.)', partOfSpeech: 'noun', root: 'ש-ל-ם' },
  ],

  // פ-ת-ח (открывать)
  'פתח': [
    { hebrew: 'פֶּתַח', hebrewPlain: 'פתח', transcription: 'пéтах', translation: 'вход, проём, отверстие (м.р.)', partOfSpeech: 'noun', root: 'פ-ת-ח' },
    { hebrew: 'מַפְתֵּחַ', hebrewPlain: 'מפתח', transcription: 'мафтéах', translation: 'ключ (м.р.)', partOfSpeech: 'noun', root: 'פ-ת-ח' },
    { hebrew: 'פְּתִיחָה', hebrewPlain: 'פתיחה', transcription: 'птихá', translation: 'открытие, вступление, начало (ж.р.)', partOfSpeech: 'noun', root: 'פ-ת-ח' },
    { hebrew: 'פָּתוּחַ', hebrewPlain: 'פתוח', transcription: 'патӯах', translation: 'открытый, доступный', partOfSpeech: 'adjective', root: 'פ-ת-ח' },
    { hebrew: 'פְּתִיחוּת', hebrewPlain: 'פתיחות', transcription: 'птихӯт', translation: 'открытость, искренность (ж.р.)', partOfSpeech: 'noun', root: 'פ-ת-ח' },
  ],

  // ס-ג-ר (закрывать)
  'סגר': [
    { hebrew: 'סְגִירָה', hebrewPlain: 'סגירה', transcription: 'сгирá', translation: 'закрытие, блокировка (ж.р.)', partOfSpeech: 'noun', root: 'ס-ג-ר' },
    { hebrew: 'סָגוּר', hebrewPlain: 'סגור', transcription: 'сагӯр', translation: 'закрытый, замкнутый', partOfSpeech: 'adjective', root: 'ס-ג-ר' },
    { hebrew: 'מִסְגֶּרֶת', hebrewPlain: 'מסגרת', transcription: 'мисгéрет', translation: 'рамка, структура, формат (ж.р.)', partOfSpeech: 'noun', root: 'ס-ג-ר' },
    { hebrew: 'הֶסְגֵּר', hebrewPlain: 'הסגר', transcription: 'hесгéр', translation: 'карантин, изоляция (м.р.)', partOfSpeech: 'noun', root: 'ס-ג-ר' },
    { hebrew: 'סוֹגְרַיִם', hebrewPlain: 'סוגריים', transcription: 'согра́йим', translation: 'скобки (мн.ч., м.р.)', partOfSpeech: 'noun', root: 'ס-ג-ר' },
  ],

  // ש-מ-ר (хранить, беречь, охранять)
  'שמר': [
    { hebrew: 'שְׁמִירָה', hebrewPlain: 'שמירה', transcription: 'шмирá', translation: 'охрана, сохранение, присмотр (ж.р.)', partOfSpeech: 'noun', root: 'ש-מ-ר' },
    { hebrew: 'שׁוֹמֵר', hebrewPlain: 'שומר', transcription: 'шомéр', translation: 'сторож, охранник (м.р.)', partOfSpeech: 'noun', root: 'ש-מ-ר' },
    { hebrew: 'מִשְׁמֶרֶת', hebrewPlain: 'משמרת', transcription: 'мишмéрет', translation: 'смена, дежурство, вахта (ж.р.)', partOfSpeech: 'noun', root: 'ש-מ-ר' },
    { hebrew: 'שְׁמוּרָה', hebrewPlain: 'שמורה', transcription: 'шмурá', translation: 'заповедник (ж.р.)', partOfSpeech: 'noun', root: 'ש-מ-ר' },
    { hebrew: 'שַׁמְרָן', hebrewPlain: 'שמרן', transcription: 'шамрáн', translation: 'консерватор (м.р.)', partOfSpeech: 'noun', root: 'ש-מ-ר' },
    { hebrew: 'שַׁמְרָנִי', hebrewPlain: 'שמרני', transcription: 'шамранӣ', translation: 'консервативный', partOfSpeech: 'adjective', root: 'ש-מ-ר' },
  ],

  // ב-ד-ק (проверять)
  'בדק': [
    { hebrew: 'בְּדִיקָה', hebrewPlain: 'בדיקה', transcription: 'бдикá', translation: 'проверка, анализ, медосмотр (ж.р.)', partOfSpeech: 'noun', root: 'ב-ד-ק' },
    { hebrew: 'מִבְדָּק', hebrewPlain: 'מבדק', transcription: 'мивдáк', translation: 'контрольный тест, испытание (м.р.)', partOfSpeech: 'noun', root: 'ב-ד-ק' },
    { hebrew: 'בָּדוּק', hebrewPlain: 'בדוק', transcription: 'бадӯк', translation: 'проверенный, достоверный, точный', partOfSpeech: 'adjective', root: 'ב-ד-ק' },
    { hebrew: 'בּוֹדֵק', hebrewPlain: 'בודק', transcription: 'бодéк', translation: 'проверяющий, контролёр (м.р.)', partOfSpeech: 'noun', root: 'ב-ד-ק' },
  ],

  // ב-ח-ר (выбирать)
  'בחר': [
    { hebrew: 'בְּחִירָה', hebrewPlain: 'בחירה', transcription: 'бхирá', translation: 'выбор, предпочтение (ж.р.)', partOfSpeech: 'noun', root: 'ב-ח-ר' },
    { hebrew: 'בְּחִירוֹת', hebrewPlain: 'בחירות', transcription: 'бхирóт', translation: 'выборы (мн.ч., ж.р.)', partOfSpeech: 'noun', root: 'ב-ח-ר' },
    { hebrew: 'מִבְחָר', hebrewPlain: 'מבחר', transcription: 'мивхáр', translation: 'ассортимент, выборка, разнообразие (м.р.)', partOfSpeech: 'noun', root: 'ב-ח-ר' },
    { hebrew: 'נִבְחָר', hebrewPlain: 'נבחר', transcription: 'нивхáр', translation: 'избранный, отборный', partOfSpeech: 'adjective', root: 'ב-ח-ר' },
    { hebrew: 'נִבְחֶרֶת', hebrewPlain: 'נבחרת', transcription: 'нивхéрет', translation: 'сборная команда (ж.р.)', partOfSpeech: 'noun', root: 'ב-ח-ר' },
  ],

  // מ-כ-ר (продавать)
  'מכר': [
    { hebrew: 'מְכִירָה', hebrewPlain: 'מכירה', transcription: 'мехирá', translation: 'продажа, сбыт (ж.р.)', partOfSpeech: 'noun', root: 'מ-כ-ר' },
    { hebrew: 'מוֹכֵר', hebrewPlain: 'מוכר', transcription: 'мохéр', translation: 'продавец (м.р.)', partOfSpeech: 'noun', root: 'מ-כ-ר' },
    { hebrew: 'מוֹכֶרֶת', hebrewPlain: 'מוכרת', transcription: 'мохéрет', translation: 'продавщица (ж.р.)', partOfSpeech: 'noun', root: 'מ-כ-ר' },
    { hebrew: 'מִכְרָז', hebrewPlain: 'מכרז', transcription: 'михрáз', translation: 'тендер, аукцион, конкурс (м.р.)', partOfSpeech: 'noun', root: 'מ-כ-ר' },
    { hebrew: 'מֶכֶר', hebrewPlain: 'מכר', transcription: 'мéхер', translation: 'продажа, торговля (м.р.)', partOfSpeech: 'noun', root: 'מ-כ-ר' },
  ],

  // ז-כ-ר (помнить)
  'זכר': [
    { hebrew: 'זִכָּרוֹן', hebrewPlain: 'זיכרון', transcription: 'зикарóн', translation: 'память, воспоминание (м.р.)', partOfSpeech: 'noun', root: 'ז-כ-ר' },
    { hebrew: 'מַזְכֶּרֶת', hebrewPlain: 'מזכרת', transcription: 'мазкéрет', translation: 'сувенир, память (ж.р.)', partOfSpeech: 'noun', root: 'ז-כ-ר' },
    { hebrew: 'אַזְכָּרָה', hebrewPlain: 'אזכרה', transcription: 'азкарá', translation: 'поминки, годовщина памяти (ж.р.)', partOfSpeech: 'noun', root: 'ז-כ-ר' },
    { hebrew: 'זָכוּר', hebrewPlain: 'זכור', transcription: 'захӯр', translation: 'памятный, запомнившийся', partOfSpeech: 'adjective', root: 'ז-כ-ר' },
    { hebrew: 'תִּזְכּוֹרֶת', hebrewPlain: 'תזכורת', transcription: 'тизкóрет', translation: 'напоминание (ж.р.)', partOfSpeech: 'noun', root: 'ז-כ-ר' },
    { hebrew: 'לְהַזְכִּיר', hebrewPlain: 'להזכיר', transcription: 'леhазкӣр', translation: 'напоминать (Ифъиль)', partOfSpeech: 'verb', binyan: 'הִפְעִיל (Ифъиль)', root: 'ז-כ-ר' },
  ],

  // ש-כ-ח (забывать)
  'שכח': [
    { hebrew: 'שִׁכְחָה', hebrewPlain: 'שכחה', transcription: 'шиххá', translation: 'забвение, забывчивость (ж.р.)', partOfSpeech: 'noun', root: 'ש-כ-ח' },
    { hebrew: 'שַׁכְחָן', hebrewPlain: 'שכחן', transcription: 'шаххáн', translation: 'забывчивый человек (м.р.)', partOfSpeech: 'noun', root: 'ש-כ-ח' },
    { hebrew: 'שַׁכְחָנִי', hebrewPlain: 'שכחני', transcription: 'шахханӣ', translation: 'рассеянный, забывчивый', partOfSpeech: 'adjective', root: 'ש-כ-ח' },
    { hebrew: 'נִשְׁכָּח', hebrewPlain: 'נשכח', transcription: 'нишкáх', translation: 'забытый', partOfSpeech: 'adjective', root: 'ש-כ-ח' },
  ],

  // ר-ג-ש (чувствовать, волновать)
  'רגש': [
    { hebrew: 'רֶגֶשׁ', hebrewPlain: 'רגש', transcription: 'рéгеш', translation: 'чувство, эмоция (м.р.)', partOfSpeech: 'noun', root: 'ר-ג-ש' },
    { hebrew: 'הַרְגָּשָׁה', hebrewPlain: 'הרגשה', transcription: 'hаргашá', translation: 'самочувствие, ощущение (ж.р.)', partOfSpeech: 'noun', root: 'ר-ג-ש' },
    { hebrew: 'רָגִישׁ', hebrewPlain: 'רגיש', transcription: 'рагӣш', translation: 'чувствительный, ранимый, деликатный', partOfSpeech: 'adjective', root: 'ר-ג-ש' },
    { hebrew: 'הִתְרַגְּשׁוּת', hebrewPlain: 'התרגשות', transcription: 'hитрагшӯт', translation: 'волнение, трепет, восторг (ж.р.)', partOfSpeech: 'noun', root: 'ר-ג-ש' },
    { hebrew: 'רְגִישׁוּת', hebrewPlain: 'רגישות', transcription: 'регишӯт', translation: 'чувствительность, аллергия (ж.р.)', partOfSpeech: 'noun', root: 'ר-ג-ש' },
  ],

  // ל-ב-ש (одевать, носить)
  'לבש': [
    { hebrew: 'לְבוּשׁ', hebrewPlain: 'לבוש', transcription: 'левӯш', translation: 'одежда, наряд, стиль одежды (м.р.)', partOfSpeech: 'noun', root: 'ל-ב-ש' },
    { hebrew: 'תִּלְבֹּשֶׁת', hebrewPlain: 'תלבושת', transcription: 'тильбóшет', translation: 'форма (школьная, рабочая) (ж.р.)', partOfSpeech: 'noun', root: 'ל-ב-ש' },
    { hebrew: 'הַלְבָּשָׁה', hebrewPlain: 'הלבשה', transcription: 'hальбашá', translation: 'одевание, ассортимент одежды (ж.р.)', partOfSpeech: 'noun', root: 'ל-ב-ש' },
    { hebrew: 'לָבוּשׁ', hebrewPlain: 'לבוש', transcription: 'лавӯш', translation: 'одетый', partOfSpeech: 'adjective', root: 'ל-ב-ש' },
    { hebrew: 'מַלְבּוּשׁ', hebrewPlain: 'מלבוש', transcription: 'мальбӯш', translation: 'одеяние, наряд (книжн.) (м.р.)', partOfSpeech: 'noun', root: 'ל-ב-ש' },
  ],

  // ח-פ-ש (искать, маскировать)
  'חפש': [
    { hebrew: 'חִפּוּשׂ', hebrewPlain: 'חיפוש', transcription: 'хипӯс', translation: 'поиск, розыск, обыск (м.р.)', partOfSpeech: 'noun', root: 'ח-פ-שׂ' },
    { hebrew: 'תַּחְפֹּשֶׂת', hebrewPlain: 'תחפושת', transcription: 'тахпóсет', translation: 'карнавальный костюм, маскировка (ж.р.)', partOfSpeech: 'noun', root: 'ח-פ-שׂ' },
    { hebrew: 'חֹפֶשׁ', hebrewPlain: 'חופש', transcription: 'хóфеш', translation: 'свобода, каникулы, отпуск (м.р.)', partOfSpeech: 'noun', root: 'ח-פ-שׂ' },
    { hebrew: 'חֻפְשָׁה', hebrewPlain: 'חופשה', transcription: 'хуфшá', translation: 'отпуск, выходные дни (ж.р.)', partOfSpeech: 'noun', root: 'ח-פ-שׂ' },
    { hebrew: 'חָפְשִׁי', hebrewPlain: 'חופשי', transcription: 'хофшӣ', translation: 'свободный, бесплатный', partOfSpeech: 'adjective', root: 'ח-פ-שׂ' },
    { hebrew: 'מְחֻפָּשׂ', hebrewPlain: 'מחופש', transcription: 'мехупáс', translation: 'переодетый в костюм, замаскированный', partOfSpeech: 'adjective', root: 'ח-פ-שׂ' },
  ],

  // ב-ק-ש (просить)
  'בקש': [
    { hebrew: 'בַּקָּשָׁה', hebrewPlain: 'בקשה', transcription: 'бакашá', translation: 'просьба, прошение, заявка (ж.р.)', partOfSpeech: 'noun', root: 'ב-ק-ש' },
    { hebrew: 'בְּבַקָּשָׁה', hebrewPlain: 'בבקשה', transcription: 'бевакашá', translation: 'пожалуйста, прошу вас', partOfSpeech: 'expression', root: 'ב-ק-ש' },
    { hebrew: 'מְבֻקָּשׁ', hebrewPlain: 'מבוקש', transcription: 'мевукáш', translation: 'востребованный, популярный, разыскиваемый', partOfSpeech: 'adjective', root: 'ב-ק-ש' },
    { hebrew: 'בִּקּוּשׁ', hebrewPlain: 'ביקוש', transcription: 'бикӯш', translation: 'спрос (в экономике) (м.р.)', partOfSpeech: 'noun', root: 'ב-ק-ש' },
  ],

  // ע-ב-ר (переходить, проходить, прошлое)
  'עבר': [
    { hebrew: 'עָבָר', hebrewPlain: 'עבר', transcription: 'авáр', translation: 'прошлое (м.р.)', partOfSpeech: 'noun', root: 'ע-ב-ר' },
    { hebrew: 'עֲבֵרָה', hebrewPlain: 'עבירה', transcription: 'аверá', translation: 'нарушение, правонарушение, грех (ж.р.)', partOfSpeech: 'noun', root: 'ע-ב-ר' },
    { hebrew: 'מַעֲבָר', hebrewPlain: 'מעבר', transcription: 'маавáр', translation: 'переход, проход, переезд (м.р.)', partOfSpeech: 'noun', root: 'ע-ב-ר' },
    { hebrew: 'הַעֲבָרָה', hebrewPlain: 'העברה', transcription: 'hааварá', translation: 'перевод (денег), перемещение (ж.р.)', partOfSpeech: 'noun', root: 'ע-ב-ר' },
    { hebrew: 'עוֹבֵר אוֹרַח', hebrewPlain: 'עובר אורח', transcription: 'овéр óрах', translation: 'прохожий, путник (м.р.)', partOfSpeech: 'noun', root: 'ע-ב-ר' },
  ],

  // ע-צ-ר (останавливать, задерживать)
  'עצר': [
    { hebrew: 'עֲצִירָה', hebrewPlain: 'עצירה', transcription: 'ацирá', translation: 'остановка, пауза (ж.р.)', partOfSpeech: 'noun', root: 'ע-צ-ר' },
    { hebrew: 'מַעֲצָר', hebrewPlain: 'מעצר', transcription: 'маацáр', translation: 'арест, задержание (м.р.)', partOfSpeech: 'noun', root: 'ע-צ-ר' },
    { hebrew: 'עוֹצֶר', hebrewPlain: 'עוצר', transcription: 'óцер', translation: 'комендантский час (м.р.)', partOfSpeech: 'noun', root: 'ע-צ-ר' },
    { hebrew: 'עָצוּר', hebrewPlain: 'עצור', transcription: 'ацӯр', translation: 'арестованный, сдержанный', partOfSpeech: 'adjective', root: 'ע-צ-ר' },
  ],

  // ע-מ-ד (стоять)
  'עמד': [
    { hebrew: 'עֶמְדָּה', hebrewPlain: 'עמדה', transcription: 'эмдá', translation: 'позиция, точка зрения, пост (ж.р.)', partOfSpeech: 'noun', root: 'ע-מ-ד' },
    { hebrew: 'מַעֲמָד', hebrewPlain: 'מעמד', transcription: 'маамáд', translation: 'статус, общественное положение (м.р.)', partOfSpeech: 'noun', root: 'ע-מ-ד' },
    { hebrew: 'עַמּוּד', hebrewPlain: 'עמוד', transcription: 'амӯд', translation: 'столб, колонка, страница (м.р.)', partOfSpeech: 'noun', root: 'ע-מ-ד' },
    { hebrew: 'עֲמִידָה', hebrewPlain: 'עמידה', transcription: 'амидá', translation: 'стояние, стойка (ж.р.)', partOfSpeech: 'noun', root: 'ע-מ-ד' },
    { hebrew: 'עָמִיד', hebrewPlain: 'עמיד', transcription: 'амӣд', translation: 'стойкий, прочный, устойчивый', partOfSpeech: 'adjective', root: 'ע-מ-ד' },
  ],

  // נ-ס-ע (ехать)
  'נסע': [
    { hebrew: 'נְסִיעָה', hebrewPlain: 'נסיעה', transcription: 'неси’á', translation: 'поездка, езда (ж.р.)', partOfSpeech: 'noun', root: 'נ-ס-ע' },
    { hebrew: 'נוֹסֵעַ', hebrewPlain: 'נוסע', transcription: 'носéа', translation: 'пассажир (м.р.)', partOfSpeech: 'noun', root: 'נ-ס-ע' },
    { hebrew: 'נוֹסַעַת', hebrewPlain: 'נוסעת', transcription: 'носáат', translation: 'пассажирка (ж.р.)', partOfSpeech: 'noun', root: 'נ-ס-ע' },
    { hebrew: 'מַסָּע', hebrewPlain: 'מסע', transcription: 'масá', translation: 'поход, путешествие, экспедиция (м.р.)', partOfSpeech: 'noun', root: 'נ-ס-ע' },
    { hebrew: 'מַסָּעִית', hebrewPlain: 'משאית', transcription: 'масаӣт', translation: 'грузовик (ж.р.)', partOfSpeech: 'noun', root: 'נ-ס-ע' },
  ],

  // ר-ו-ץ (бежать)
  'רוץ': [
    { hebrew: 'רִיצָה', hebrewPlain: 'ריצה', transcription: 'рицá', translation: 'бег, пробежка (ж.р.)', partOfSpeech: 'noun', root: 'ר-ו-ץ' },
    { hebrew: 'מֵרוֹץ', hebrewPlain: 'מירוץ', transcription: 'мерóц', translation: 'гонка, забег, марафон (м.р.)', partOfSpeech: 'noun', root: 'ר-ו-ץ' },
    { hebrew: 'רָץ', hebrewPlain: 'רץ', transcription: 'рац', translation: 'бегун, гонец (м.р.)', partOfSpeech: 'noun', root: 'ר-ו-ץ' },
  ],

  // ט-ו-ס (летать)
  'טוס': [
    { hebrew: 'טִיסָה', hebrewPlain: 'טיסה', transcription: 'тисá', translation: 'полёт, рейс (ж.р.)', partOfSpeech: 'noun', root: 'ט-ו-ס' },
    { hebrew: 'טַיָּס', hebrewPlain: 'טייס', transcription: 'тайáс', translation: 'пилот, лётчик (м.р.)', partOfSpeech: 'noun', root: 'ט-ו-ס' },
    { hebrew: 'מָטוֹס', hebrewPlain: 'מטוס', transcription: 'матóс', translation: 'самолёт (м.р.)', partOfSpeech: 'noun', root: 'ט-ו-ס' },
    { hebrew: 'טַיֶּסֶת', hebrewPlain: 'טייסת', transcription: 'тайéсет', translation: 'женщина-пилот, эскадрилья (ж.р.)', partOfSpeech: 'noun', root: 'ט-ו-ס' },
  ],

  // ר-א-ה (видеть)
  'ראה': [
    { hebrew: 'רְאִיָּה', hebrewPlain: 'ראייה', transcription: 'реийá', translation: 'зрение, видение (ж.р.)', partOfSpeech: 'noun', root: 'ר-א-ה' },
    { hebrew: 'מַרְאֶה', hebrewPlain: 'מראה', transcription: 'мар’é', translation: 'вид, облик, внешность (м.р.)', partOfSpeech: 'noun', root: 'ר-א-ה' },
    { hebrew: 'מַרְאָה', hebrewPlain: 'מראה', transcription: 'мар’á', translation: 'зеркало (ж.р.)', partOfSpeech: 'noun', root: 'ר-א-ה' },
    { hebrew: 'לְהִתְרָאוֹת', hebrewPlain: 'להתראות', transcription: 'леhитра’óт', translation: 'до свидания!', partOfSpeech: 'expression', root: 'ר-א-ה' },
    { hebrew: 'נִרְאֶה', hebrewPlain: 'נראה', transcription: 'нир’é', translation: 'видимый, кажущийся', partOfSpeech: 'adjective', root: 'ר-א-ה' },
  ],

  // ש-ת-ה (пить)
  'שתה': [
    { hebrew: 'שְׁתִיָּה', hebrewPlain: 'שתיה', transcription: 'штийá', translation: 'питьё, напитки (ж.р.)', partOfSpeech: 'noun', root: 'ש-ת-ה' },
    { hebrew: 'מַשְׁקֶה', hebrewPlain: 'משקה', transcription: 'машкé', translation: 'напиток (м.р.)', partOfSpeech: 'noun', root: 'ש-ת-ה' },
    { hebrew: 'שָׁתוּי', hebrewPlain: 'שתוי', transcription: 'шатӯй', translation: 'пьяный, выпивший', partOfSpeech: 'adjective', root: 'ש-ת-ה' },
    { hebrew: 'שְׁתִיָּה קַלָּה', hebrewPlain: 'שתיה קלה', transcription: 'штийá калá', translation: 'прохладительные напитки', partOfSpeech: 'expression', root: 'ש-ת-ה' },
  ],

  // ר-צ-ה (хотеть, угождать)
  'רצה': [
    { hebrew: 'רָצוֹן', hebrewPlain: 'רצון', transcription: 'рацóн', translation: 'желание, воля (м.р.)', partOfSpeech: 'noun', root: 'ר-צ-ה' },
    { hebrew: 'בְּרָצוֹן', hebrewPlain: 'ברצון', transcription: 'берацóн', translation: 'с удовольствием, охотно', partOfSpeech: 'expression', root: 'ר-צ-ה' },
    { hebrew: 'מְרֻצֶּה', hebrewPlain: 'מרוצה', transcription: 'меруцé', translation: 'довольный, удовлетворённый', partOfSpeech: 'adjective', root: 'ר-צ-ה' },
    { hebrew: 'רְצוֹנִי', hebrewPlain: 'רצוני', transcription: 'реционӣ', translation: 'добровольный, произвольный', partOfSpeech: 'adjective', root: 'ר-צ-ה' },
  ],

  // ס-ד-ר (упорядочивать, организовывать)
  'סדר': [
    { hebrew: 'סֵדֶר', hebrewPlain: 'סדר', transcription: 'сéдер', translation: 'порядок, распорядок, пасхальный седер (м.р.)', partOfSpeech: 'noun', root: 'ס-ד-ר' },
    { hebrew: 'סִדּוּר', hebrewPlain: 'סידור', transcription: 'сидӯр', translation: 'молитвенник, урегулирование, дело (м.р.)', partOfSpeech: 'noun', root: 'ס-ד-ר' },
    { hebrew: 'סִדְרָה', hebrewPlain: 'סדרה', transcription: 'сидрá', translation: 'серия, сериал, ряд (ж.р.)', partOfSpeech: 'noun', root: 'ס-ד-ר' },
    { hebrew: 'מְסֻדָּר', hebrewPlain: 'מסודר', transcription: 'месудáр', translation: 'аккуратный, упорядоченный', partOfSpeech: 'adjective', root: 'ס-ד-ר' },
    { hebrew: 'בְּסֵדֶר', hebrewPlain: 'בסדר', transcription: 'бесéдер', translation: 'в порядке, хорошо, ладно', partOfSpeech: 'expression', root: 'ס-ד-ר' },
  ],

  // ש-ח-ק (играть)
  'שחק': [
    { hebrew: 'מִשְׂחָק', hebrewPlain: 'משחק', transcription: 'мисхáк', translation: 'игра, матч (м.р.)', partOfSpeech: 'noun', root: 'ש-ח-ק' },
    { hebrew: 'שַׂחְקָן', hebrewPlain: 'שחקן', transcription: 'сахкáн', translation: 'актёр, игрок, спортсмен (м.р.)', partOfSpeech: 'noun', root: 'ש-ח-ק' },
    { hebrew: 'שַׂחְקָנִית', hebrewPlain: 'שחקנית', transcription: 'сахканӣт', translation: 'актриса, спортсменка (ж.р.)', partOfSpeech: 'noun', root: 'ש-ח-ק' },
    { hebrew: 'מִשְׂחָקִי', hebrewPlain: 'משחקי', transcription: 'мисхакӣ', translation: 'игровой', partOfSpeech: 'adjective', root: 'ש-ח-ק' },
  ],

  // ש-ב-ר (ломать)
  'שבר': [
    { hebrew: 'שֶׁבֶר', hebrewPlain: 'שבר', transcription: 'шéвер', translation: 'перелом, осколок, дробь (мат.) (м.р.)', partOfSpeech: 'noun', root: 'ש-ב-ר' },
    { hebrew: 'שְׁבִירָה', hebrewPlain: 'שבירה', transcription: 'швирá', translation: 'ломка, преломление (ж.р.)', partOfSpeech: 'noun', root: 'ש-ב-ר' },
    { hebrew: 'מַשְׁבֵּר', hebrewPlain: 'משבר', transcription: 'машбéр', translation: 'кризис (м.р.)', partOfSpeech: 'noun', root: 'ש-ב-ר' },
    { hebrew: 'שָׁבִיר', hebrewPlain: 'שביר', transcription: 'шавӣр', translation: 'хрупкий, ломкий', partOfSpeech: 'adjective', root: 'ש-ב-ר' },
    { hebrew: 'שָׁבוּר', hebrewPlain: 'שבור', transcription: 'шавӯр', translation: 'разбитый, сломанный', partOfSpeech: 'adjective', root: 'ש-ב-ר' },
  ],

  // ח-ת-ך (резать)
  'חתך': [
    { hebrew: 'חֲתִיכָה', hebrewPlain: 'חתיכה', transcription: 'хатихá', translation: 'кусок, кусочек, красотка (сл.) (ж.р.)', partOfSpeech: 'noun', root: 'ח-ת-ך' },
    { hebrew: 'חִתּוּךְ', hebrewPlain: 'חיתוך', transcription: 'хитӯх', translation: 'нарезка, разрез, пересечение (м.р.)', partOfSpeech: 'noun', root: 'ח-ת-ך' },
    { hebrew: 'חָתוּךְ', hebrewPlain: 'חתוך', transcription: 'хатӯх', translation: 'нарезанный, отрезанный', partOfSpeech: 'adjective', root: 'ח-ת-ך' },
    { hebrew: 'חַתְכָנִי', hebrewPlain: 'חתכני', transcription: 'хатханӣ', translation: 'категоричный, решительный', partOfSpeech: 'adjective', root: 'ח-ת-ך' },
  ],

  // ב-ש-ל (варить, готовить)
  'בשל': [
    { hebrew: 'בִּשּׁוּל', hebrewPlain: 'בישול', transcription: 'бишӯль', translation: 'варка, готовка, кулинария (м.р.)', partOfSpeech: 'noun', root: 'ב-ש-ל' },
    { hebrew: 'תַּבְשִׁיל', hebrewPlain: 'תבשיל', transcription: 'тавшӣль', translation: 'горячее блюдо, кушанье (м.р.)', partOfSpeech: 'noun', root: 'ב-ש-ל' },
    { hebrew: 'בָּשֵׁל', hebrewPlain: 'בשל', transcription: 'башéль', translation: 'спелый, зрелый', partOfSpeech: 'adjective', root: 'ב-ש-ל' },
    { hebrew: 'מְבֻשָּׁל', hebrewPlain: 'מבושל', transcription: 'мевушáль', translation: 'варёный, приготовленный', partOfSpeech: 'adjective', root: 'ב-ש-ל' },
    { hebrew: 'מִטְבָּח', hebrewPlain: 'מטבח', transcription: 'митбáх', translation: 'кухня (м.р.)', partOfSpeech: 'noun', root: 'ב-ש-ל' },
  ],

  // ס-פ-ר (считать, рассказывать, стричь)
  'ספר': [
    { hebrew: 'סֵפֶר', hebrewPlain: 'ספר', transcription: 'сéфер', translation: 'книга (м.р.)', partOfSpeech: 'noun', root: 'ס-פ-ר' },
    { hebrew: 'סִפּוּר', hebrewPlain: 'סיפור', transcription: 'сипӯр', translation: 'рассказ, история (м.р.)', partOfSpeech: 'noun', root: 'ס-פ-ר' },
    { hebrew: 'מִסְפָּר', hebrewPlain: 'מספר', transcription: 'миспáр', translation: 'число, номер (м.р.)', partOfSpeech: 'noun', root: 'ס-פ-ר' },
    { hebrew: 'סַפָּר', hebrewPlain: 'ספר', transcription: 'сапáр', translation: 'парикмахер (м.р.)', partOfSpeech: 'noun', root: 'ס-פ-ר' },
    { hebrew: 'מִסְפָּרָה', hebrewPlain: 'מספרה', transcription: 'миспарá', translation: 'парикмахерская (ж.р.)', partOfSpeech: 'noun', root: 'ס-פ-ר' },
    { hebrew: 'סִפְרִיָּה', hebrewPlain: 'ספריה', transcription: 'сифрийá', translation: 'библиотека (ж.р.)', partOfSpeech: 'noun', root: 'ס-פ-ר' },
    { hebrew: 'סְפִירָה', hebrewPlain: 'ספירה', transcription: 'сфирá', translation: 'счёт, исчисление (ж.р.)', partOfSpeech: 'noun', root: 'ס-פ-ר' },
  ],

  // ד-ב-ר (говорить, вещь)
  'דבר': [
    { hebrew: 'דָּבָר', hebrewPlain: 'דבר', transcription: 'давáр', translation: 'вещь, слово, дело (м.р.)', partOfSpeech: 'noun', root: 'ד-ב-ר' },
    { hebrew: 'דִּבּוּר', hebrewPlain: 'דיבור', transcription: 'дибӯр', translation: 'речь, разговор (м.р.)', partOfSpeech: 'noun', root: 'ד-ב-ר' },
    { hebrew: 'דַּבְּרָן', hebrewPlain: 'דברן', transcription: 'дабрáн', translation: 'болтун, оратор (м.р.)', partOfSpeech: 'noun', root: 'ד-ב-ר' },
    { hebrew: 'הַדְבָּרָה', hebrewPlain: 'הדברה', transcription: 'hадбарá', translation: 'дезинсекция, уничтожение вредителей (ж.р.)', partOfSpeech: 'noun', root: 'ד-ב-ר' },
  ],

  // ע-ז-ר (помогать)
  'עזר': [
    { hebrew: 'עֶזְרָה', hebrewPlain: 'עזרה', transcription: 'эзрá', translation: 'помощь, поддержка (ж.р.)', partOfSpeech: 'noun', root: 'ע-ז-ר' },
    { hebrew: 'עוֹזֵר', hebrewPlain: 'עוזר', transcription: 'озéр', translation: 'помощник, ассистент (м.р.)', partOfSpeech: 'noun', root: 'ע-ז-ר' },
    { hebrew: 'עוֹזֶרֶת', hebrewPlain: 'עוזרת', transcription: 'озéрет', translation: 'помощница, домработница (ж.р.)', partOfSpeech: 'noun', root: 'ע-ז-ר' },
    { hebrew: 'עֵזֶר', hebrewPlain: 'עזר', transcription: 'э́зер', translation: 'пособие, вспомогательное средство (м.р.)', partOfSpeech: 'noun', root: 'ע-ז-ר' },
    { hebrew: 'עֶזְרָה רִאשׁוֹנָה', hebrewPlain: 'עזרה ראשונה', transcription: 'эзрá ришонá', translation: 'первая помощь (ж.р.)', partOfSpeech: 'expression', root: 'ע-ז-ר' },
  ],

  // ק-ו-ם (вставать, учреждать)
  'קום': [
    { hebrew: 'מָקוֹם', hebrewPlain: 'מקום', transcription: 'макóм', translation: 'место, пространство (м.р.)', partOfSpeech: 'noun', root: 'ק-ו-ם' },
    { hebrew: 'קוֹמָה', hebrewPlain: 'קומה', transcription: 'комá', translation: 'этаж, рост (ж.р.)', partOfSpeech: 'noun', root: 'ק-ו-ם' },
    { hebrew: 'הֲקָמָה', hebrewPlain: 'הקמה', transcription: 'hакамá', translation: 'основание, учреждение, возведение (ж.р.)', partOfSpeech: 'noun', root: 'ק-ו-ם' },
    { hebrew: 'תְּקוּמָה', hebrewPlain: 'תקומה', transcription: 'ткумá', translation: 'возрождение, восстановление (ж.р.)', partOfSpeech: 'noun', root: 'ק-ו-ם' },
    { hebrew: 'קַיָּם', hebrewPlain: 'קיים', transcription: 'кайáм', translation: 'существующий, имеющийся', partOfSpeech: 'adjective', root: 'ק-ו-ם' },
  ],

  // ש-י-ם (класть, ставить)
  'שים': [
    { hebrew: 'תְּשׂוּמַת לֵב', hebrewPlain: 'תשומת לב', transcription: 'тсумáт лев', translation: 'внимание (ж.р.)', partOfSpeech: 'noun', root: 'ש-י-ם' },
    { hebrew: 'יִשׂוּם', hebrewPlain: 'יישום', transcription: 'йисӯм', translation: 'применение, реализация, внедрение (м.р.)', partOfSpeech: 'noun', root: 'ש-י-ם' },
    { hebrew: 'יִשׂוּמוֹן', hebrewPlain: 'יישומון', transcription: 'йисумóн', translation: 'приложение (app на смартфоне) (м.р.)', partOfSpeech: 'noun', root: 'ש-י-ם' },
  ],

  // נ-ו-ח (отдыхать, удобный)
  'נוח': [
    { hebrew: 'מְנוּחָה', hebrewPlain: 'מנוחה', transcription: 'менухá', translation: 'отдых, покой (ж.р.)', partOfSpeech: 'noun', root: 'נ-ו-ח' },
    { hebrew: 'נוֹחַ', hebrewPlain: 'נוח', transcription: 'нóах', translation: 'удобный, комфортный, покладистый', partOfSpeech: 'adjective', root: 'נ-ו-ח' },
    { hebrew: 'הֲנָחָה', hebrewPlain: 'הנחה', transcription: 'hанаха́', translation: 'скидка, уступка, предположение (ж.р.)', partOfSpeech: 'noun', root: 'נ-ו-ח' },
    { hebrew: 'נִינוֹחַ', hebrewPlain: 'נינוח', transcription: 'нинóах', translation: 'спокойный, расслабленный', partOfSpeech: 'adjective', root: 'נ-ו-ח' },
    { hebrew: 'נַחַת', hebrewPlain: 'נחת', transcription: 'нáхат', translation: 'удовлетворение, отрада (ж.р.)', partOfSpeech: 'noun', root: 'נ-ו-ח' },
  ],

  // י-ש-ן (спать, старый)
  'ישן': [
    { hebrew: 'שֵׁנָה', hebrewPlain: 'שינה', transcription: 'шенá', translation: 'сон, спячка (ж.р.)', partOfSpeech: 'noun', root: 'י-ש-ן' },
    { hebrew: 'יָשָׁן', hebrewPlain: 'ישן', transcription: 'яшáн', translation: 'старый (о предметах)', partOfSpeech: 'adjective', root: 'י-ש-ן' },
    { hebrew: 'יָשֵׁן', hebrewPlain: 'ישן', transcription: 'яшéн', translation: 'спящий (настоящее время)', partOfSpeech: 'adjective', root: 'י-ש-ן' },
    { hebrew: 'יַשְׁנָן', hebrewPlain: 'ישנן', transcription: 'яшнáн', translation: 'соня, любитель поспать (м.р.)', partOfSpeech: 'noun', root: 'י-ש-ן' },
  ],

  // ע-ל-ה (подниматься, стоить)
  'עלה': [
    { hebrew: 'עֲלִיָּה', hebrewPlain: 'עלייה', transcription: 'алийá', translation: 'подъём, репатриация в Израиль (ж.р.)', partOfSpeech: 'noun', root: 'ע-ל-ה' },
    { hebrew: 'מַעֲלִית', hebrewPlain: 'מעלית', transcription: 'маалӣт', translation: 'лифт (ж.р.)', partOfSpeech: 'noun', root: 'ע-ל-ה' },
    { hebrew: 'עוֹלֶה', hebrewPlain: 'עולה', transcription: 'олé', translation: 'репатриант, поднимающийся (м.р.)', partOfSpeech: 'noun', root: 'ע-ל-ה' },
    { hebrew: 'עֶלְיוֹן', hebrewPlain: 'עליון', transcription: 'эльйóн', translation: 'верхний, высший', partOfSpeech: 'adjective', root: 'ע-ל-ה' },
    { hebrew: 'עֲלוּת', hebrewPlain: 'עלות', transcription: 'алӯт', translation: 'стоимость, себестоимость (ж.р.)', partOfSpeech: 'noun', root: 'ע-ל-ה' },
  ],

  // י-ר-ד (спускаться)
  'ירד': [
    { hebrew: 'יְרִידָה', hebrewPlain: 'ירידה', transcription: 'еридá', translation: 'спуск, снижение, эмиграция (ж.р.)', partOfSpeech: 'noun', root: 'י-ר-ד' },
    { hebrew: 'מוֹרָד', hebrewPlain: 'מורד', transcription: 'морáд', translation: 'склон, спуск (м.р.)', partOfSpeech: 'noun', root: 'י-ר-ד' },
    { hebrew: 'יָרוּד', hebrewPlain: 'ירוד', transcription: 'ярӯд', translation: 'низкий, плохой, отсталый', partOfSpeech: 'adjective', root: 'י-ר-ד' },
    { hebrew: 'יוֹרֵד', hebrewPlain: 'יורד', transcription: 'йорéд', translation: 'эмигрант из Израиля (м.р.)', partOfSpeech: 'noun', root: 'י-ר-ד' },
  ],

  // י-צ-א (выходить)
  'יצא': [
    { hebrew: 'יְצִיאָה', hebrewPlain: 'יציאה', transcription: 'еци’á', translation: 'выход, отправление (ж.р.)', partOfSpeech: 'noun', root: 'י-צ-א' },
    { hebrew: 'מוֹצָא', hebrewPlain: 'מוצא', transcription: 'моцá', translation: 'происхождение, исход (м.р.)', partOfSpeech: 'noun', root: 'י-צ-א' },
    { hebrew: 'תּוֹצָאָה', hebrewPlain: 'תוצאה', transcription: 'тоца’á', translation: 'результат, последствие (ж.р.)', partOfSpeech: 'noun', root: 'י-צ-א' },
    { hebrew: 'יְצוּא', hebrewPlain: 'ייצוא', transcription: 'йицӯ', translation: 'экспорт (м.р.)', partOfSpeech: 'noun', root: 'י-צ-א' },
  ],

  // י-ש-ב (сидеть, селиться)
  'ישב': [
    { hebrew: 'יְשִׁיבָה', hebrewPlain: 'ישיבה', transcription: 'ешивá', translation: 'заседание, собрание, ешива (ж.р.)', partOfSpeech: 'noun', root: 'י-ש-ב' },
    { hebrew: 'מוֹשָׁב', hebrewPlain: 'מושב', transcription: 'мошáв', translation: 'сиденье, посёлок, мошав (м.р.)', partOfSpeech: 'noun', root: 'י-ש-ב' },
    { hebrew: 'יִשּׁוּב', hebrewPlain: 'יישוב', transcription: 'йишӯв', translation: 'населённый пункт, поселение (м.р.)', partOfSpeech: 'noun', root: 'י-ש-ב' },
    { hebrew: 'תּוֹשָׁב', hebrewPlain: 'תושב', transcription: 'тошáв', translation: 'житель, резидент (м.р.)', partOfSpeech: 'noun', root: 'י-ש-ב' },
    { hebrew: 'יוֹשֵׁב רֹאשׁ', hebrewPlain: 'יושב ראש', transcription: 'йошéв рош', translation: 'председатель (יו״ר) (м.р.)', partOfSpeech: 'noun', root: 'י-ש-ב' },
  ],

  // ל-ק-ח (брать)
  'לקח': [
    { hebrew: 'לָקוֹחַ', hebrewPlain: 'לקוח', transcription: 'лакóах', translation: 'клиент, покупатель (м.р.)', partOfSpeech: 'noun', root: 'ל-ק-ח' },
    { hebrew: 'לֶקַח', hebrewPlain: 'לקח', transcription: 'лéках', translation: 'урок, назидание, вывод (м.р.)', partOfSpeech: 'noun', root: 'ל-ק-ח' },
    { hebrew: 'מֶלְקָחַיִם', hebrewPlain: 'מלקחיים', transcription: 'мелькаха́йим', translation: 'пинцет, щипцы (мн.ч., м.р.)', partOfSpeech: 'noun', root: 'ל-ק-ח' },
  ],

  // נ-ה-ג (водить транспорт, вести себя)
  'נהג': [
    { hebrew: 'נַהָג', hebrewPlain: 'נהג', transcription: 'наháг', translation: 'водитель, шофёр (м.р.)', partOfSpeech: 'noun', root: 'נ-ה-ג' },
    { hebrew: 'מִנְהָג', hebrewPlain: 'מנהג', transcription: 'минháг', translation: 'обычай, традиция (м.р.)', partOfSpeech: 'noun', root: 'נ-ה-ג' },
    { hebrew: 'הַנְהָגָה', hebrewPlain: 'הנהגה', transcription: 'hанhагá', translation: 'руководство, управление, лидерство (ж.р.)', partOfSpeech: 'noun', root: 'נ-ה-ג' },
    { hebrew: 'נוֹהַג', hebrewPlain: 'נוהג', transcription: 'нóhаг', translation: 'порядок, процедура, обыкновение (м.р.)', partOfSpeech: 'noun', root: 'נ-ה-ג' },
    { hebrew: 'רִשָׁיוֹן נְהִיגָה', hebrewPlain: 'רישיון נהיגה', transcription: 'ришйóн неhигá', translation: 'водительские права (м.р.)', partOfSpeech: 'noun', root: 'נ-ה-ג' },
  ],

  // ר-כ-ב (ездить верхом, собирать)
  'רכב': [
    { hebrew: 'רֶכֶב', hebrewPlain: 'רכב', transcription: 'рéхев', translation: 'автомобиль, транспортное средство (м.р.)', partOfSpeech: 'noun', root: 'ר-כ-ב' },
    { hebrew: 'רַכֶּבֶת', hebrewPlain: 'רכבת', transcription: 'ракéвет', translation: 'поезд (ж.р.)', partOfSpeech: 'noun', root: 'ר-כ-ב' },
    { hebrew: 'רְכִיבָה', hebrewPlain: 'רכיבה', transcription: 'рхивá', translation: 'езда верхом / на велосипеде (ж.р.)', partOfSpeech: 'noun', root: 'ר-כ-ב' },
    { hebrew: 'הַרְכָּבָה', hebrewPlain: 'הרכבה', transcription: 'hаркавá', translation: 'сборка, монтаж, прививка (ж.р.)', partOfSpeech: 'noun', root: 'ר-כ-ב' },
    { hebrew: 'מֻרְכָּב', hebrewPlain: 'מורכב', transcription: 'муркáв', translation: 'сложный, составной', partOfSpeech: 'adjective', root: 'ר-כ-ב' },
    { hebrew: 'מַרְכִּיב', hebrewPlain: 'מרכיב', transcription: 'маркӣв', translation: 'компонент, составная часть (м.р.)', partOfSpeech: 'noun', root: 'ר-כ-ב' },
  ],

  // ת-פ-ס (ловить, понимать, занимать место)
  'תפס': [
    { hebrew: 'תְּפִיסָה', hebrewPlain: 'תפיסה', transcription: 'тфисá', translation: 'восприятие, концепция, хватка (ж.р.)', partOfSpeech: 'noun', root: 'ת-פ-ס' },
    { hebrew: 'תָּפוּס', hebrewPlain: 'תפוס', transcription: 'тафӯс', translation: 'занятый (о месте, телефоне)', partOfSpeech: 'adjective', root: 'ת-פ-ס' },
    { hebrew: 'תַּפְסָן', hebrewPlain: 'תפסן', transcription: 'тафсáн', translation: 'зажим, скрепка, держатель (м.р.)', partOfSpeech: 'noun', root: 'ת-פ-ס' },
  ],

  // נ-פ-ל (падать)
  'נפל': [
    { hebrew: 'נְפִילָה', hebrewPlain: 'נפילה', transcription: 'нефилá', translation: 'падение, сбой (ж.р.)', partOfSpeech: 'noun', root: 'נ-פ-ל' },
    { hebrew: 'מַפּוֹלֶת', hebrewPlain: 'מפולת', transcription: 'мапóлет', translation: 'обвал, лавина, оползень (ж.р.)', partOfSpeech: 'noun', root: 'נ-פ-ל' },
    { hebrew: 'נֵפֶל', hebrewPlain: 'נפל', transcription: 'нéфель', translation: 'неразорвавшийся снаряд, выкидыш (м.р.)', partOfSpeech: 'noun', root: 'נ-פ-ל' },
  ],

  // צ-ע-ק (кричать)
  'צעק': [
    { hebrew: 'צְעָקָה', hebrewPlain: 'צעקה', transcription: 'цеакá', translation: 'крик, вопль (ж.р.)', partOfSpeech: 'noun', root: 'צ-ע-ק' },
    { hebrew: 'צַעֲקָנִי', hebrewPlain: 'צעקני', transcription: 'цеаканӣ', translation: 'кричащий, крикливый, вульгарный', partOfSpeech: 'adjective', root: 'צ-ע-ק' },
  ],

  // כ-ע-ס (сердиться, злиться)
  'כעס': [
    { hebrew: 'כַּעַס', hebrewPlain: 'כעס', transcription: 'кáас', translation: 'гнев, злость (м.р.)', partOfSpeech: 'noun', root: 'כ-ע-ס' },
    { hebrew: 'כּוֹעֵס', hebrewPlain: 'כועס', transcription: 'коéс', translation: 'сердитый, злой', partOfSpeech: 'adjective', root: 'כ-ע-ס' },
    { hebrew: 'כַּעֲסָן', hebrewPlain: 'כעסן', transcription: 'каасáн', translation: 'вспыльчивый человек (м.р.)', partOfSpeech: 'noun', root: 'כ-ע-ס' },
  ],

  // פ-ח-ד (бояться)
  'פחד': [
    { hebrew: 'פַּחַד', hebrewPlain: 'פחד', transcription: 'пáхад', translation: 'страх, испуг (м.р.)', partOfSpeech: 'noun', root: 'פ-ח-ד' },
    { hebrew: 'פַּחְדָן', hebrewPlain: 'פחדן', transcription: 'пахдáн', translation: 'трус (м.р.)', partOfSpeech: 'noun', root: 'פ-ח-ד' },
    { hebrew: 'פַּחְדָנִי', hebrewPlain: 'פחדני', transcription: 'пахданӣ', translation: 'трусливый, боязливый', partOfSpeech: 'adjective', root: 'פ-ח-ד' },
    { hebrew: 'מְפֻחָד', hebrewPlain: 'מפוחד', transcription: 'мефухáд', translation: 'напуганный', partOfSpeech: 'adjective', root: 'פ-ח-ד' },
  ],

  // נ-ק-ה (чистить, убирать)
  'נקה': [
    { hebrew: 'נִקָּיוֹן', hebrewPlain: 'ניקיון', transcription: 'никайóн', translation: 'чистота, уборка (м.р.)', partOfSpeech: 'noun', root: 'נ-ק-ה' },
    { hebrew: 'נָקִי', hebrewPlain: 'נקי', transcription: 'накӣ', translation: 'чистый, опрятный, невиновный', partOfSpeech: 'adjective', root: 'נ-ק-ה' },
    { hebrew: 'מְנַקֶּה', hebrewPlain: 'מנקה', transcription: 'менакé', translation: 'уборщик (м.р.)', partOfSpeech: 'noun', root: 'נ-ק-ה' },
    { hebrew: 'מְנַקָּה', hebrewPlain: 'מנקה', transcription: 'менакá', translation: 'уборщица (ж.р.)', partOfSpeech: 'noun', root: 'נ-ק-ה' },
    { hebrew: 'נִקּוּי יָבֵשׁ', hebrewPlain: 'ניקוי יבש', transcription: 'никӯй явéш', translation: 'химчистка (м.р.)', partOfSpeech: 'noun', root: 'נ-ק-ה' },
  ],

  // צ-י-ר (рисовать)
  'ציר': [
    { hebrew: 'צִיּוּר', hebrewPlain: 'ציור', transcription: 'цийӯр', translation: 'рисунок, картина (м.р.)', partOfSpeech: 'noun', root: 'צ-י-ר' },
    { hebrew: 'צַיָּר', hebrewPlain: 'צייר', transcription: 'цайáр', translation: 'художник (м.р.)', partOfSpeech: 'noun', root: 'צ-י-ר' },
    { hebrew: 'צַיֶּרֶת', hebrewPlain: 'ציירת', transcription: 'цайéрет', translation: 'художница (ж.р.)', partOfSpeech: 'noun', root: 'צ-י-ר' },
    { hebrew: 'צִיּוּרִי', hebrewPlain: 'ציורי', transcription: 'цийурӣ', translation: 'живописный, образный', partOfSpeech: 'adjective', root: 'צ-י-ר' },
  ],

  // צ-ל-ם (фотографировать)
  'צלם': [
    { hebrew: 'צִלּוּם', hebrewPlain: 'צילום', transcription: 'цилӯм', translation: 'фотография, съёмка (м.р.)', partOfSpeech: 'noun', root: 'צ-ל-ם' },
    { hebrew: 'צַלָּם', hebrewPlain: 'צלם', transcription: 'цалáм', translation: 'фотограф, кинооператор (м.р.)', partOfSpeech: 'noun', root: 'צ-ל-ם' },
    { hebrew: 'מַצְלֵמָה', hebrewPlain: 'מצלמה', transcription: 'мацлемá', translation: 'фотоаппарат, камера (ж.р.)', partOfSpeech: 'noun', root: 'צ-ל-ם' },
    { hebrew: 'תַּצְלוּם', hebrewPlain: 'תצלום', transcription: 'тацлӯм', translation: 'фотоснимок, рентген (м.р.)', partOfSpeech: 'noun', root: 'צ-ל-ם' },
  ],

  // ב-ק-ר (навещать, критиковать)
  'בקר': [
    { hebrew: 'בִּקּוּר', hebrewPlain: 'ביקור', transcription: 'бикӯр', translation: 'визит, посещение (м.р.)', partOfSpeech: 'noun', root: 'ב-ק-ר' },
    { hebrew: 'בִּקֹּרֶת', hebrewPlain: 'ביקורת', transcription: 'бикóрет', translation: 'критика, проверка, контроль (ж.р.)', partOfSpeech: 'noun', root: 'ב-ק-ר' },
    { hebrew: 'מְבַקֵּר', hebrewPlain: 'מבקר', transcription: 'мевакéр', translation: 'критик, ревизор, посетитель (м.р.)', partOfSpeech: 'noun', root: 'ב-ק-ר' },
    { hebrew: 'בֹּקֶר', hebrewPlain: 'בוקר', transcription: 'бóкер', translation: 'утро (м.р.)', partOfSpeech: 'noun', root: 'ב-ק-ר' },
    { hebrew: 'בַּקָּרָה', hebrewPlain: 'בקרה', transcription: 'бакарá', translation: 'контроль, мониторинг (ж.р.)', partOfSpeech: 'noun', root: 'ב-ק-ר' },
  ],

  // ת-ק-ן (исправлять, чинить)
  'תקן': [
    { hebrew: 'תִּקּוּן', hebrewPlain: 'תיקון', transcription: 'тикӯн', translation: 'ремонт, исправление, починка (м.р.)', partOfSpeech: 'noun', root: 'ת-ק-ן' },
    { hebrew: 'תַּקָּנָה', hebrewPlain: 'תקנה', transcription: 'таканá', translation: 'постановление, правило, норматив (ж.р.)', partOfSpeech: 'noun', root: 'ת-ק-ן' },
    { hebrew: 'תַּקִּין', hebrewPlain: 'תקין', transcription: 'такӣн', translation: 'исправный, правильный, в норме', partOfSpeech: 'adjective', root: 'ת-ק-ן' },
    { hebrew: 'תֶּקֶן', hebrewPlain: 'תקן', transcription: 'тéкен', translation: 'стандарт, гост, штатное расписание (м.р.)', partOfSpeech: 'noun', root: 'ת-ק-ן' },
    { hebrew: 'מִתְקָן', hebrewPlain: 'מתקן', transcription: 'миткáн', translation: 'устройство, установка, сооружение (м.р.)', partOfSpeech: 'noun', root: 'ת-ק-ן' },
  ],

  // ק-ו-ה (надеяться)
  'קוה': [
    { hebrew: 'תִּקְוָה', hebrewPlain: 'תקווה', transcription: 'тиквá', translation: 'надежда (гимн Израиля «Атиква») (ж.р.)', partOfSpeech: 'noun', root: 'ק-ו-ה' },
    { hebrew: 'מִקְוֶה', hebrewPlain: 'מקווה', transcription: 'миквé', translation: 'миква (бассейн ритуального омовения) (м.р.)', partOfSpeech: 'noun', root: 'ק-ו-ה' },
    { hebrew: 'קַו', hebrewPlain: 'קו', transcription: 'кав', translation: 'линия, черта, маршрут (м.р.)', partOfSpeech: 'noun', root: 'ק-ו-ה' },
  ],

  // ש-נ-ה (менять, повторять, год)
  'שנה': [
    { hebrew: 'שָׁנָה', hebrewPlain: 'שנה', transcription: 'шанá', translation: 'год (ж.р.)', partOfSpeech: 'noun', root: 'ש-נ-ה' },
    { hebrew: 'שִׁנּוּי', hebrewPlain: 'שינוי', transcription: 'шинӯй', translation: 'изменение, перемена (м.р.)', partOfSpeech: 'noun', root: 'ש-נ-ה' },
    { hebrew: 'שׁוֹנֶה', hebrewPlain: 'שונה', transcription: 'шонé', translation: 'другой, различный, иной', partOfSpeech: 'adjective', root: 'ש-נ-ה' },
    { hebrew: 'מִשְׁנָה', hebrewPlain: 'משנה', transcription: 'мишнá', translation: 'Мишна, свод законов, учение (ж.р.)', partOfSpeech: 'noun', root: 'ש-נ-ה' },
  ],

  // נ-ס-ה (пробовать, испытывать)
  'נסה': [
    { hebrew: 'נִסָּיוֹן', hebrewPlain: 'ניסיון', transcription: 'нисайóн', translation: 'опыт, попытка, испытание (м.р.)', partOfSpeech: 'noun', root: 'נ-ס-ה' },
    { hebrew: 'מְנֻסֶּה', hebrewPlain: 'מנוסה', transcription: 'менуссé', translation: 'опытный, бывалый', partOfSpeech: 'adjective', root: 'נ-ס-ה' },
    { hebrew: 'הִתְנַסּוּת', hebrewPlain: 'התנסות', transcription: 'hитнассӯт', translation: 'приобретение опыта, эксперимент (ж.р.)', partOfSpeech: 'noun', root: 'נ-ס-ה' },
  ],

  // ס-י-ם (заканчивать)
  'סים': [
    { hebrew: 'סִיּוּם', hebrewPlain: 'סיום', transcription: 'сийӯм', translation: 'окончание, завершение, финал (м.р.)', partOfSpeech: 'noun', root: 'ס-י-ם' },
    { hebrew: 'סוֹף', hebrewPlain: 'סוף', transcription: 'соф', translation: 'конец, окончание (м.р.)', partOfSpeech: 'noun', root: 'ס-י-ם' },
    { hebrew: 'סוֹפִי', hebrewPlain: 'סופי', transcription: 'софӣ', translation: 'окончательный, финальный', partOfSpeech: 'adjective', root: 'ס-י-ם' },
    { hebrew: 'סוֹף שָׁבוּעַ', hebrewPlain: 'סוף שבוע', transcription: 'соф шавӯа', translation: 'выходные (уикенд) (м.р.)', partOfSpeech: 'noun', root: 'ס-י-ם' },
  ],

  // ק-ש-ב (слушать, внимать)
  'קשב': [
    { hebrew: 'קֶשֶׁב', hebrewPlain: 'קשב', transcription: 'кéшев', translation: 'внимание, способность сосредотачиваться (м.р.)', partOfSpeech: 'noun', root: 'ק-ש-ב' },
    { hebrew: 'הַקְשָׁבָה', hebrewPlain: 'הקשבה', transcription: 'hакшавá', translation: 'слушание, прислушивание (ж.р.)', partOfSpeech: 'noun', root: 'ק-ש-ב' },
    { hebrew: 'קַשּׁוּב', hebrewPlain: 'קשוב', transcription: 'кашӯв', translation: 'внимательный, чуткий', partOfSpeech: 'adjective', root: 'ק-ש-ב' },
  ],

  // ח-ל-ט (решать)
  'חלט': [
    { hebrew: 'הַחְלָטָה', hebrewPlain: 'החלטה', transcription: 'hахлатá', translation: 'решение, резолюция (ж.р.)', partOfSpeech: 'noun', root: 'ח-ל-ט' },
    { hebrew: 'הֶחְלֵטִי', hebrewPlain: 'החלטי', transcription: 'hехлетӣ', translation: 'решительный, безапелляционный', partOfSpeech: 'adjective', root: 'ח-ל-ט' },
    { hebrew: 'מֻחְלָט', hebrewPlain: 'מוחלט', transcription: 'мухлáт', translation: 'абсолютный, безусловный', partOfSpeech: 'adjective', root: 'ח-ל-ט' },
    { hebrew: 'בְּהֶחְלֵט', hebrewPlain: 'בהחלט', transcription: 'беhехлéт', translation: 'определенно, безусловно, точно', partOfSpeech: 'expression', root: 'ח-ל-ט' },
  ],

  // ב-ו-א (приходить)
  'בוא': [
    { hebrew: 'מָבוֹא', hebrewPlain: 'מבוא', transcription: 'мавó', translation: 'введение, прихожая, вестибюль (м.р.)', partOfSpeech: 'noun', root: 'ב-ו-א' },
    { hebrew: 'בִּיאָה', hebrewPlain: 'ביאה', transcription: 'би’á', translation: 'пришествие, прибытие (ж.р.)', partOfSpeech: 'noun', root: 'ב-ו-א' },
    { hebrew: 'תְּבוּאָה', hebrewPlain: 'תבואה', transcription: 'тву’á', translation: 'урожай, зерновые культуры (ж.р.)', partOfSpeech: 'noun', root: 'ב-ו-א' },
    { hebrew: 'בָּרוּךְ הַבָּא', hebrewPlain: 'ברוך הבא', transcription: 'барӯх hа-бá', translation: 'добро пожаловать! (м.р.)', partOfSpeech: 'expression', root: 'ב-ו-א' },
  ],

  // צ-ל-ח (иметь успех, переправляться)
  'צלח': [
    { hebrew: 'הַצְלָחָה', hebrewPlain: 'הצלחה', transcription: 'hацлахá', translation: 'успех, удача (ж.р.)', partOfSpeech: 'noun', root: 'צ-ל-ח' },
    { hebrew: 'מֻצְלָח', hebrewPlain: 'מוצלח', transcription: 'муцлáх', translation: 'удачный, успешный', partOfSpeech: 'adjective', root: 'צ-ל-ח' },
    { hebrew: 'בְּהַצְלָחָה', hebrewPlain: 'בהצלחה', transcription: 'беhацлахá', translation: 'удачи! с успехом!', partOfSpeech: 'expression', root: 'צ-ל-ח' },
    { hebrew: 'צַלַּחַת', hebrewPlain: 'צלחת', transcription: 'цалáхат', translation: 'тарелка (ж.р.)', partOfSpeech: 'noun', root: 'צ-ל-ח' },
  ],

  // ס-כ-ם (подытоживать, соглашаться)
  'סכם': [
    { hebrew: 'סְכוּם', hebrewPlain: 'סכום', transcription: 'схӯм', translation: 'сумма, количество денег (м.р.)', partOfSpeech: 'noun', root: 'ס-כ-ם' },
    { hebrew: 'סִכּוּם', hebrewPlain: 'סיכום', transcription: 'сикӯм', translation: 'итог, резюме, краткий конспект (м.р.)', partOfSpeech: 'noun', root: 'ס-כ-ם' },
    { hebrew: 'הֶסְכֵּם', hebrewPlain: 'הסכם', transcription: 'hескéм', translation: 'договор, соглашение (м.р.)', partOfSpeech: 'noun', root: 'ס-כ-ם' },
    { hebrew: 'מֻסְכָּם', hebrewPlain: 'מוסכם', transcription: 'мускáм', translation: 'согласованный, общепринятый', partOfSpeech: 'adjective', root: 'ס-כ-ם' },
  ],

  // ר-ח-ץ (мыть, купаться)
  'רחץ': [
    { hebrew: 'רְחִיצָה', hebrewPlain: 'רחיצה', transcription: 'рхицá', translation: 'мытьё, купание (ж.р.)', partOfSpeech: 'noun', root: 'ר-ח-ץ' },
    { hebrew: 'מֶרְחָץ', hebrewPlain: 'מרחץ', transcription: 'мерхáц', translation: 'баня, купальня (בית מרחץ) (м.р.)', partOfSpeech: 'noun', root: 'ר-ח-ץ' },
    { hebrew: 'חֲדַר רַחְצָה', hebrewPlain: 'חדר רחצה', transcription: 'хадáр рахцá', translation: 'ванная комната (м.р.)', partOfSpeech: 'noun', root: 'ר-ח-ץ' },
  ],

  // ח-ת-ן (жениться)
  'חתן': [
    { hebrew: 'חָתָן', hebrewPlain: 'חתן', transcription: 'хатáн', translation: 'жених, виновник торжества (м.р.)', partOfSpeech: 'noun', root: 'ח-ת-ן' },
    { hebrew: 'חֲתֻנָּה', hebrewPlain: 'חתונה', transcription: 'хатунá', translation: 'свадьба (ж.р.)', partOfSpeech: 'noun', root: 'ח-ת-ן' },
    { hebrew: 'חוֹתֵן', hebrewPlain: 'חותן', transcription: 'хотéн', translation: 'тесть (отец жены) (м.р.)', partOfSpeech: 'noun', root: 'ח-ת-ן' },
    { hebrew: 'חוֹתֶנֶת', hebrewPlain: 'חותנת', transcription: 'хотéнет', translation: 'тёща (мать жены) (ж.р.)', partOfSpeech: 'noun', root: 'ח-ת-ן' },
  ],

  // ק-ד-ם (продвигаться, вперёд)
  'קדם': [
    { hebrew: 'קָדִימָה', hebrewPlain: 'קדימה', transcription: 'кадӣма', translation: 'вперёд!', partOfSpeech: 'expression', root: 'ק-ד-ם' },
    { hebrew: 'קִדּוּם', hebrewPlain: 'קידום', transcription: 'кидӯм', translation: 'продвижение, повышение по службе (м.р.)', partOfSpeech: 'noun', root: 'ק-ד-ם' },
    { hebrew: 'קֹדֶם', hebrewPlain: 'קודם', transcription: 'кóдем', translation: 'раньше, прежде, до этого', partOfSpeech: 'adverb', root: 'ק-ד-ם' },
    { hebrew: 'מִתְקַדֵּם', hebrewPlain: 'מתקדם', transcription: 'миткадéм', translation: 'прогрессивный, передовой', partOfSpeech: 'adjective', root: 'ק-ד-ם' },
  ],

  // ר-ג-ל (привыкать, нога)
  'רגל': [
    { hebrew: 'רֶגֶל', hebrewPlain: 'רגל', transcription: 'рéгель', translation: 'нога, стопа (ж.р.)', partOfSpeech: 'noun', root: 'ר-ג-ל' },
    { hebrew: 'הֶרְגֵּל', hebrewPlain: 'הרגיל', transcription: 'hергéль', translation: 'привычка (м.р.)', partOfSpeech: 'noun', root: 'ר-ג-ל' },
    { hebrew: 'רָגִיל', hebrewPlain: 'רגיל', transcription: 'рагӣль', translation: 'обычный, привычный, стандартный', partOfSpeech: 'adjective', root: 'ר-ג-ל' },
    { hebrew: 'מְרַגֵּל', hebrewPlain: 'מרגל', transcription: 'мерагéль', translation: 'шпион, разведчик (м.р.)', partOfSpeech: 'noun', root: 'ר-ג-ל' },
  ],

  // ז-ה-ר (остерегаться, светить)
  'זהר': [
    { hebrew: 'זְהִירוּת', hebrewPlain: 'זהירות', transcription: 'зеhирӯт', translation: 'осторожность (זהירות! - Осторожно!) (ж.р.)', partOfSpeech: 'noun', root: 'ז-ה-ר' },
    { hebrew: 'זָהִיר', hebrewPlain: 'זהיר', transcription: 'заhӣр', translation: 'осторожный, предусмотрительный', partOfSpeech: 'adjective', root: 'ז-ה-ר' },
    { hebrew: 'זֹהַר', hebrewPlain: 'זוהר', transcription: 'зóhар', translation: 'сияние, блеск, книга Зогар (м.р.)', partOfSpeech: 'noun', root: 'ז-ה-ר' },
    { hebrew: 'אַזְהָרָה', hebrewPlain: 'אזהרה', transcription: 'авhарá', translation: 'предупреждение, предостережение (ж.р.)', partOfSpeech: 'noun', root: 'ז-ה-ר' },
  ],

  // פ-ר-ד (расставаться, разделять)
  'פרד': [
    { hebrew: 'פְּרֵדָה', hebrewPlain: 'פרידה', transcription: 'предá', translation: 'расставание, прощание (ж.р.)', partOfSpeech: 'noun', root: 'פ-ר-ד' },
    { hebrew: 'נִפְרָד', hebrewPlain: 'נפרד', transcription: 'нифрáд', translation: 'отдельный, обособленный', partOfSpeech: 'adjective', root: 'פ-ר-ד' },
    { hebrew: 'פֵּרוּד', hebrewPlain: 'פירוד', transcription: 'перӯд', translation: 'разделение, разобщение (м.р.)', partOfSpeech: 'noun', root: 'פ-ר-ד' },
    { hebrew: 'הַפְרָדָה', hebrewPlain: 'הפרדה', transcription: 'hафрадá', translation: 'сепарация, разделение (ж.р.)', partOfSpeech: 'noun', root: 'פ-ר-ד' },
  ],

  // פ-ג-ש (встречать)
  'פגש': [
    { hebrew: 'פְּגִישָׁה', hebrewPlain: 'פגישה', transcription: 'пгишá', translation: 'встреча, свидание, приём (ж.р.)', partOfSpeech: 'noun', root: 'פ-ג-ש' },
    { hebrew: 'מִפְגָּשׁ', hebrewPlain: 'מפגש', transcription: 'мифгáш', translation: 'встреча, слёт, стык (м.р.)', partOfSpeech: 'noun', root: 'פ-ג-ש' },
    { hebrew: 'פָּגוֹשׁ', hebrewPlain: 'פגוש', transcription: 'пагóш', translation: 'бампер автомобиля (м.р.)', partOfSpeech: 'noun', root: 'פ-ג-ש' },
  ],

  // ב-ר-ך (благословлять, поздравлять)
  'ברך': [
    { hebrew: 'בְּרָכָה', hebrewPlain: 'ברכה', transcription: 'брахá', translation: 'благословение, поздравление (ж.р.)', partOfSpeech: 'noun', root: 'ב-ר-ך' },
    { hebrew: 'מְבֹרָךְ', hebrewPlain: 'מבורך', transcription: 'меворáх', translation: 'благословенный, желанный', partOfSpeech: 'adjective', root: 'ב-ר-ך' },
    { hebrew: 'בָּרוּךְ', hebrewPlain: 'ברוך', transcription: 'барӯх', translation: 'благословенный', partOfSpeech: 'adjective', root: 'ב-ר-ך' },
    { hebrew: 'בִּרְכּוֹן', hebrewPlain: 'ברכון', transcription: 'биркóн', translation: 'буклет с молитвами и благословениями (м.р.)', partOfSpeech: 'noun', root: 'ב-ר-ך' },
  ],

  // מ-ל-ץ (рекомендовать)
  'מלץ': [
    { hebrew: 'הַמְלָצָה', hebrewPlain: 'המלצה', transcription: 'hамлацá', translation: 'рекомендация, совет (ж.р.)', partOfSpeech: 'noun', root: 'מ-ל-ץ' },
    { hebrew: 'מֻמְלָץ', hebrewPlain: 'מומלץ', transcription: 'мумлáц', translation: 'рекомендуемый, советуемый', partOfSpeech: 'adjective', root: 'מ-ל-ץ' },
    { hebrew: 'מֶלְצַר', hebrewPlain: 'מלצר', transcription: 'мельцáр', translation: 'официант (м.р.)', partOfSpeech: 'noun', root: 'מ-ל-ץ' },
  ],

  // כ-נ-ס (входить, собирать)
  'כנס': [
    { hebrew: 'כְּנִיסָה', hebrewPlain: 'כניסה', transcription: 'книсá', translation: 'вход, въезд (ж.р.)', partOfSpeech: 'noun', root: 'כ-נ-ס' },
    { hebrew: 'כֶּנֶס', hebrewPlain: 'כנס', transcription: 'кéнес', translation: 'съезд, конференция, конгресс (м.р.)', partOfSpeech: 'noun', root: 'כ-נ-ס' },
    { hebrew: 'כְּנֶסֶת', hebrewPlain: 'כנסת', transcription: 'кнéсет', translation: 'Кнессет (парламент Израиля) (ж.р.)', partOfSpeech: 'noun', root: 'כ-נ-ס' },
    { hebrew: 'בֵּית כְּנֶסֶת', hebrewPlain: 'בית כנסת', transcription: 'бэйт кнéсет', translation: 'синагога (м.р.)', partOfSpeech: 'noun', root: 'כ-נ-ס' },
    { hebrew: 'הַכְנָסָה', hebrewPlain: 'הכנסה', transcription: 'hахнасá', translation: 'доход, выручка (ж.р.)', partOfSpeech: 'noun', root: 'כ-נ-ס' },
  ],

  // ב-ט-ח (доверять, быть уверенным)
  'בטח': [
    { hebrew: 'בִּטָּחוֹן', hebrewPlain: 'ביטחון', transcription: 'битахóн', translation: 'безопасность, уверенность (м.р.)', partOfSpeech: 'noun', root: 'ב-ט-ח' },
    { hebrew: 'בָּטוּחַ', hebrewPlain: 'בטוח', transcription: 'батӯах', translation: 'уверенный, безопасный, надёжный', partOfSpeech: 'adjective', root: 'ב-ט-ח' },
    { hebrew: 'הַבְטָחָה', hebrewPlain: 'הבטחה', transcription: 'hавтахá', translation: 'обещание, гарантия (ж.р.)', partOfSpeech: 'noun', root: 'ב-ט-ח' },
    { hebrew: 'בִּטּוּחַ', hebrewPlain: 'ביטוח', transcription: 'битӯах', translation: 'страховка, страхование (м.р.)', partOfSpeech: 'noun', root: 'ב-ט-ח' },
    { hebrew: 'בֶּטַח', hebrewPlain: 'בטח', transcription: 'бéтах', translation: 'конечно, наверняка, естественно', partOfSpeech: 'expression', root: 'ב-ט-ח' },
  ],

  // י-ל-ד (рожать, дети)
  'ילד': [
    { hebrew: 'יֶלֶד', hebrewPlain: 'ילד', transcription: 'йéлед', translation: 'мальчик, ребёнок (м.р.)', partOfSpeech: 'noun', root: 'י-ל-ד' },
    { hebrew: 'יַלְדָּה', hebrewPlain: 'ילדה', transcription: 'яльдá', translation: 'девочка (ж.р.)', partOfSpeech: 'noun', root: 'י-ל-ד' },
    { hebrew: 'לֵדָה', hebrewPlain: 'לידה', transcription: 'ледá', translation: 'роды, рождение (ж.р.)', partOfSpeech: 'noun', root: 'י-ל-ד' },
    { hebrew: 'מוֹלֶדֶת', hebrewPlain: 'מולדת', transcription: 'молéдет', translation: 'родина, отчизна (ж.р.)', partOfSpeech: 'noun', root: 'י-ל-ד' },
    { hebrew: 'יַלְדוּת', hebrewPlain: 'ילדות', transcription: 'яльдӯт', translation: 'детство (ж.р.)', partOfSpeech: 'noun', root: 'י-ל-ד' },
    { hebrew: 'יוֹם הֻלֶּדֶת', hebrewPlain: 'יום הולדת', transcription: 'йом hулéдет', translation: 'день рождения (м.р.)', partOfSpeech: 'noun', root: 'י-ל-ד' },
  ],

  // כ-ש-ל (падать, терпеть неудачу)
  'כשל': [
    { hebrew: 'כִּשָּׁלוֹן', hebrewPlain: 'כישלון', transcription: 'кишалóн', translation: 'неудача, провал (м.р.)', partOfSpeech: 'noun', root: 'כ-ש-ל' },
    { hebrew: 'מִכְשׁוֹל', hebrewPlain: 'מכשול', transcription: 'михшóль', translation: 'препятствие, преграда (м.р.)', partOfSpeech: 'noun', root: 'כ-ש-ל' },
    { hebrew: 'כּוֹשֵׁל', hebrewPlain: 'כושל', transcription: 'кошéль', translation: 'неудачливый, провальный', partOfSpeech: 'adjective', root: 'כ-ש-ל' },
  ],

  // א-מ-ר (говорить, сказать)
  'אמר': [
    { hebrew: 'אֲמִירָה', hebrewPlain: 'אמירה', transcription: 'амирá', translation: 'высказывание, утверждение (ж.р.)', partOfSpeech: 'noun', root: 'א-מ-ר' },
    { hebrew: 'מַאֲמָר', hebrewPlain: 'מאמר', transcription: 'маамáр', translation: 'статья, эссе, трактат (м.р.)', partOfSpeech: 'noun', root: 'א-מ-ר' },
    { hebrew: 'פִּתְגָּם', hebrewPlain: 'פתגם', transcription: 'питгáм', translation: 'пословица, афоризм, поговорка (м.р.)', partOfSpeech: 'noun', root: 'א-מ-ר' },
  ],

  // ח-ת-ם (подписывать, запечатывать)
  'חתם': [
    { hebrew: 'חֲתִימָה', hebrewPlain: 'חתימה', transcription: 'хатимá', translation: 'подпись, роспись (ж.р.)', partOfSpeech: 'noun', root: 'ח-ת-ם' },
    { hebrew: 'חוֹתֶמֶת', hebrewPlain: 'חותמת', transcription: 'хотéмет', translation: 'печать, штамп (ж.р.)', partOfSpeech: 'noun', root: 'ח-ת-ם' },
    { hebrew: 'חָתוּם', hebrewPlain: 'חתום', transcription: 'хатӯм', translation: 'подписанный, запечатанный', partOfSpeech: 'adjective', root: 'ח-ת-ם' },
    { hebrew: 'מִכְתָּם', hebrewPlain: 'מכתם', transcription: 'михтáм', translation: 'эпиграмма, афоризм (м.р.)', partOfSpeech: 'noun', root: 'ח-ת-ם' },
  ],

  // ק-ש-ר (связывать, соединять)
  'קשר': [
    { hebrew: 'קֶשֶׁר', hebrewPlain: 'קשר', transcription: 'кéшер', translation: 'связь, контакт, узел, заговор (м.р.)', partOfSpeech: 'noun', root: 'ק-ש-ר' },
    { hebrew: 'תִּקְשֹׁרֶת', hebrewPlain: 'תקשורת', transcription: 'тикшóрет', translation: 'коммуникация, СМИ, пресса (ж.р.)', partOfSpeech: 'noun', root: 'ק-ש-ר' },
    { hebrew: 'קָשׁוּר', hebrewPlain: 'קשור', transcription: 'кашӯр', translation: 'связанный, относящийся к делу', partOfSpeech: 'adjective', root: 'ק-ש-ר' },
    { hebrew: 'מְקֻשָּׁר', hebrewPlain: 'מקושר', transcription: 'мекушáр', translation: 'со связями, подключённый', partOfSpeech: 'adjective', root: 'ק-ש-ר' },
  ],

  // ש-מ-ש (служить, солнце)
  'שמש': [
    { hebrew: 'שֶׁמֶשׁ', hebrewPlain: 'שמש', transcription: 'шéмеш', translation: 'солнце (ж./м.р.)', partOfSpeech: 'noun', root: 'ש-מ-ש' },
    { hebrew: 'שִׁמּוּשׁ', hebrewPlain: 'שימוש', transcription: 'шимӯш', translation: 'использование, применение (м.р.)', partOfSpeech: 'noun', root: 'ש-מ-ש' },
    { hebrew: 'שִׁמּוּשִׁי', hebrewPlain: 'שימושי', transcription: 'шимушӣ', translation: 'полезный, практичный, применимый', partOfSpeech: 'adjective', root: 'ש-מ-ש' },
    { hebrew: 'שַׁמָּשׁ', hebrewPlain: 'שמש', transcription: 'шамáш', translation: 'служитель (в синагоге), свеча-шамаш (м.р.)', partOfSpeech: 'noun', root: 'ש-מ-ש' },
    { hebrew: 'שִׁמְשִׁיָּה', hebrewPlain: 'שמשיה', transcription: 'шимшийá', translation: 'зонтик от солнца (ж.р.)', partOfSpeech: 'noun', root: 'ש-מ-ש' },
  ],

  // מ-ש-ך (тянуть, привлекать, продолжать)
  'משך': [
    { hebrew: 'מְשִׁיכָה', hebrewPlain: 'משיכה', transcription: 'мешихá', translation: 'притяжение, влечение, снятие денег (ж.р.)', partOfSpeech: 'noun', root: 'מ-ש-ך' },
    { hebrew: 'הֶמְשֵׁךְ', hebrewPlain: 'המשך', transcription: 'hемшéх', translation: 'продолжение (м.р.)', partOfSpeech: 'noun', root: 'מ-ש-ך' },
    { hebrew: 'הֶמְשֵׁכִיּוּת', hebrewPlain: 'המשכיות', transcription: 'hемшехийӯт', translation: 'преемственность, непрерывность (ж.р.)', partOfSpeech: 'noun', root: 'מ-ש-ך' },
    { hebrew: 'מְמֻשָּׁךְ', hebrewPlain: 'ממושך', transcription: 'мемушáх', translation: 'продолжительный, затяжной', partOfSpeech: 'adjective', root: 'מ-ש-ך' },
  ],

  // ט-י-ל (гулять)
  'טיל': [
    { hebrew: 'טִיּוּל', hebrewPlain: 'טיול', transcription: 'тийӯль', translation: 'прогулка, экскурсия, поход (м.р.)', partOfSpeech: 'noun', root: 'ט-י-ל' },
    { hebrew: 'מְטַיֵּל', hebrewPlain: 'מטייל', transcription: 'метайéль', translation: 'турист, гуляющий (м.р.)', partOfSpeech: 'noun', root: 'ט-י-ל' },
    { hebrew: 'טַיֶּלֶת', hebrewPlain: 'טיילת', transcription: 'тайéлет', translation: 'набережная, прогулочный бульвар (ж.р.)', partOfSpeech: 'noun', root: 'ט-י-ל' },
  ],

  // ת-ח-ל (начинать)
  'תחל': [
    { hebrew: 'תְּחִלָּה', hebrewPlain: 'תחילה', transcription: 'тхилá', translation: 'начало, сперва (ж.р.)', partOfSpeech: 'noun', root: 'ת-ח-ל' },
    { hebrew: 'הַתְחָלָה', hebrewPlain: 'התחלה', transcription: 'hатхалá', translation: 'старт, начало, починок (ж.р.)', partOfSpeech: 'noun', root: 'ת-ח-ל' },
    { hebrew: 'לְכַתְּחִלָּה', hebrewPlain: 'לכתחילה', transcription: 'лехатхилá', translation: 'изначально, заранее, с самого начала', partOfSpeech: 'expression', root: 'ת-ח-ל' },
    { hebrew: 'הַתְחָלָתִי', hebrewPlain: 'התחלתי', transcription: 'hатхалатӣ', translation: 'начальный, стартовый', partOfSpeech: 'adjective', root: 'ת-ח-ל' },
  ],

  // ש-פ-ע (изобилие, влиять)
  'שפע': [
    { hebrew: 'שֶׁפַע', hebrewPlain: 'שפע', transcription: 'шéфа', translation: 'изобилие, достаток, богатство (м.р.)', partOfSpeech: 'noun', root: 'ש-פ-ע' },
    { hebrew: 'הַשְׁפָּעָה', hebrewPlain: 'השפעה', transcription: 'hашпа’á', translation: 'влияние, воздействие (ж.р.)', partOfSpeech: 'noun', root: 'ש-פ-ע' },
    { hebrew: 'מַשְׁפִּיעַ', hebrewPlain: 'משפיע', transcription: 'машпӣа', translation: 'влиятельный, воздействующий', partOfSpeech: 'adjective', root: 'ש-פ-ע' },
    { hebrew: 'שִׁפְעָה', hebrewPlain: 'שפעה', transcription: 'шиф’á', translation: 'обилие, благодать (книжн.) (ж.р.)', partOfSpeech: 'noun', root: 'ש-פ-ע' },
  ],

  // ש-ק-ע (погружаться, инвестировать)
  'שקע': [
    { hebrew: 'שְׁקִיעָה', hebrewPlain: 'שקיעה', transcription: 'шки’á', translation: 'закат солнца, оседание, погружение (ж.р.)', partOfSpeech: 'noun', root: 'ש-ק-ע' },
    { hebrew: 'הַשְׁקָעָה', hebrewPlain: 'השקעה', transcription: 'hашка’á', translation: 'инвестиция, вложение средств/усилий (ж.р.)', partOfSpeech: 'noun', root: 'ש-ק-ע' },
    { hebrew: 'מַשְׁקִיעַ', hebrewPlain: 'משקיע', transcription: 'машкӣа', translation: 'инвестор, вкладчик (м.р.)', partOfSpeech: 'noun', root: 'ש-ק-ע' },
    { hebrew: 'שֶׁקַע', hebrewPlain: 'שקע', transcription: 'шéка', translation: 'электрическая розетка, впадина (м.р.)', partOfSpeech: 'noun', root: 'ש-ק-ע' },
  ],

  // פ-ר-ק (разбирать, демонтировать, сустав)
  'פרק': [
    { hebrew: 'פֵּרוּק', hebrewPlain: 'פירוק', transcription: 'перӯк', translation: 'разборка, демонтаж (м.р.)', partOfSpeech: 'noun', root: 'פ-ר-ק' },
    { hebrew: 'פֶּרֶק', hebrewPlain: 'פרק', transcription: 'пéрек', translation: 'часть, глава, сустав (м.р.)', partOfSpeech: 'noun', root: 'פ-ר-ק' },
    { hebrew: 'מְפֹרָק', hebrewPlain: 'מפורק', transcription: 'мефорáк', translation: 'разобранный', partOfSpeech: 'adjective', root: 'פ-ר-ק' },
    { hebrew: 'פְּרָקִים', hebrewPlain: 'פרקים', transcription: 'пракӣм', translation: 'сочленения, шарниры, суставы (мн.ч.)', partOfSpeech: 'noun', root: 'פ-ר-ק' },
  ],

  // ח-ל-ף (менять, заменять, развязка)
  'חלף': [
    { hebrew: 'הַחְלָפָה', hebrewPlain: 'החלפה', transcription: 'hахлафá', translation: 'замена, обмен (ж.р.)', partOfSpeech: 'noun', root: 'ח-ל-ף' },
    { hebrew: 'חֶלְקֵי חִלּוּף', hebrewPlain: 'חלקי חילוף', transcription: 'хелькéй хилу́ф', translation: 'запасные части, запчасти (мн.ч.)', partOfSpeech: 'noun', root: 'ח-ל-ף' },
    { hebrew: 'חֲלִיפִי', hebrewPlain: 'חליפי', transcription: 'халифӣ', translation: 'альтернативный, запасной', partOfSpeech: 'adjective', root: 'ח-ל-ף' },
    { hebrew: 'מַחְלֵף', hebrewPlain: 'מחלף', transcription: 'махлéф', translation: 'транспортная развязка (м.р.)', partOfSpeech: 'noun', root: 'ח-ל-ף' },
    { hebrew: 'חֲלִיפָה', hebrewPlain: 'חליפה', transcription: 'халифá', translation: 'костюм (деловой) (ж.р.)', partOfSpeech: 'noun', root: 'ח-ל-ף' },
  ],

  // ב-ל-ם (тормозить)
  'בלם': [
    { hebrew: 'בְּלָמִים', hebrewPlain: 'בלמים', transcription: 'бламӣм', translation: 'тормоза (мн.ч.)', partOfSpeech: 'noun', root: 'ב-ל-ם' },
    { hebrew: 'בְּלִימָה', hebrewPlain: 'בלימה', transcription: 'блимá', translation: 'торможение (ж.р.)', partOfSpeech: 'noun', root: 'ב-ל-ם' },
    { hebrew: 'בֶּלֶם', hebrewPlain: 'בלם', transcription: 'бéлем', translation: 'тормоз (м.р.)', partOfSpeech: 'noun', root: 'ב-ל-ם' },
    { hebrew: 'בּוֹלֵם זַעֲזוּעִים', hebrewPlain: 'בולמי זעזועים', transcription: 'болéм заазуӣм', translation: 'амортизатор (м.р.)', partOfSpeech: 'noun', root: 'ב-ל-ם' },
  ],

  // נ-ו-ע (двигать, мотор)
  'נוע': [
    { hebrew: 'מָנוֹעַ', hebrewPlain: 'מנוע', transcription: 'манóа', translation: 'двигатель, мотор (м.р.)', partOfSpeech: 'noun', root: 'נ-ו-ע' },
    { hebrew: 'תְּנוּעָה', hebrewPlain: 'תנועה', transcription: 'тенуá', translation: 'движение, дорожный трафик (ж.р.)', partOfSpeech: 'noun', root: 'נ-ו-ע' },
    { hebrew: 'הַתְנָעָה', hebrewPlain: 'התנעה', transcription: 'hатнаá', translation: 'пуск мотора, зажигание (ж.р.)', partOfSpeech: 'noun', root: 'נ-ו-ע' },
    { hebrew: 'נָע', hebrewPlain: 'נע', transcription: 'на', translation: 'движущийся, подвижный', partOfSpeech: 'adjective', root: 'נ-ו-ע' },
  ],

  // ג-ר-ר (тащить, буксировать)
  'גרר': [
    { hebrew: 'גְּרָר', hebrewPlain: 'גרר', transcription: 'грар', translation: 'эвакуатор, буксир (м.р.)', partOfSpeech: 'noun', root: 'ג-ר-ר' },
    { hebrew: 'גְּרִירָה', hebrewPlain: 'גרירה', transcription: 'грирá', translation: 'буксировка, эвакуация (ж.р.)', partOfSpeech: 'noun', root: 'ג-ר-ר' },
    { hebrew: 'נִגְרָר', hebrewPlain: 'נגרר', transcription: 'нигрáр', translation: 'прицеп (м.р.)', partOfSpeech: 'noun', root: 'ג-ר-ר' },
  ],

  // ש-מ-ן (масло, жир)
  'שמן': [
    { hebrew: 'שֶׁמֶן', hebrewPlain: 'שמן', transcription: 'шéмен', translation: 'масло (м.р.)', partOfSpeech: 'noun', root: 'ש-מ-ן' },
    { hebrew: 'שִׁמּוּן', hebrewPlain: 'שימון', transcription: 'шиму́н', translation: 'смазка (м.р.)', partOfSpeech: 'noun', root: 'ש-מ-ן' },
    { hebrew: 'מְשֻׁמָּן', hebrewPlain: 'משומן', transcription: 'мешумáн', translation: 'смазанный', partOfSpeech: 'adjective', root: 'ש-מ-ן' },
    { hebrew: 'שָׁמֵן', hebrewPlain: 'שמן', transcription: 'шамéн', translation: 'толстый, жирный', partOfSpeech: 'adjective', root: 'ש-מ-ן' },
  ],

  // כ-ו-ן (направлять, регулировать)
  'כון': [
    { hebrew: 'כִּוּוּן', hebrewPlain: 'כיוון', transcription: 'киву́н', translation: 'направление, регулировка, настройка (м.р.)', partOfSpeech: 'noun', root: 'כ-ו-ן' },
    { hebrew: 'כַּוָּנָה', hebrewPlain: 'כוונה', transcription: 'каванá', translation: 'намерение, цель (ж.р.)', partOfSpeech: 'noun', root: 'כ-ו-ן' },
    { hebrew: 'מְכֻוָּן', hebrewPlain: 'מכוון', transcription: 'мехувáн', translation: 'направленный, настроенный', partOfSpeech: 'adjective', root: 'כ-ו-ן' },
    { hebrew: 'נָכוֹן', hebrewPlain: 'נכון', transcription: 'нахóн', translation: 'правильный, верный', partOfSpeech: 'adjective', root: 'כ-ו-ן' },
    { hebrew: 'הֲכָנָה', hebrewPlain: 'הכנה', transcription: 'hаханá', translation: 'подготовка (ж.р.)', partOfSpeech: 'noun', root: 'כ-ו-ן' },
  ],

  // ש-ג-ח (присматривать)
  'שגח': [
    { hebrew: 'הַשְׁגָּחָה', hebrewPlain: 'השגחה', transcription: 'hашгаха', translation: 'присмотр, надзор, опека (ж.р.)', partOfSpeech: 'noun', root: 'ש-ג-ח' },
    { hebrew: 'מַשְׁגִּיחַ', hebrewPlain: 'משגיח', transcription: 'машгӣах', translation: 'контролёр, надзиратель (м.р.)', partOfSpeech: 'noun', root: 'ש-ג-ח' },
  ],

  // ח-ב-ק (обнимать)
  'חבק': [
    { hebrew: 'חִבּוּק', hebrewPlain: 'חיבוק', transcription: 'хибӯк', translation: 'объятие (м.р.)', partOfSpeech: 'noun', root: 'ח-ב-ק' },
    { hebrew: 'מְחֻבָּק', hebrewPlain: 'מחובק', transcription: 'мехубáк', translation: 'обнятый', partOfSpeech: 'adjective', root: 'ח-ב-ק' },
  ],

  // ד-ב-ק (клеить, наклейка)
  'דבק': [
    { hebrew: 'דֶּבֶק', hebrewPlain: 'דבק', transcription: 'дéвек', translation: 'клей (м.р.)', partOfSpeech: 'noun', root: 'ד-ב-ק' },
    { hebrew: 'מַדְבֵּקָה', hebrewPlain: 'מדבקה', transcription: 'мадбекá', translation: 'наклейка, стикер (ж.р.)', partOfSpeech: 'noun', root: 'ד-ב-ק' },
    { hebrew: 'הַדְבָּקָה', hebrewPlain: 'הדבקה', transcription: 'hадбака', translation: 'наклеивание, аппликация (ж.р.)', partOfSpeech: 'noun', root: 'ד-ב-ק' },
    { hebrew: 'דָּבִיק', hebrewPlain: 'דביק', transcription: 'давӣк', translation: 'липкий, клейкий', partOfSpeech: 'adjective', root: 'ד-ב-ק' },
  ],

  // ג-ז-ר (вырезать, ножницы)
  'גזר': [
    { hebrew: 'גְּזִירָה', hebrewPlain: 'גזירה', transcription: 'гзирá', translation: 'вырезание, раскройка (ж.р.)', partOfSpeech: 'noun', root: 'ג-ז-ר' },
    { hebrew: 'מִגְזֶרֶת', hebrewPlain: 'מגזרת', transcription: 'мигзéрет', translation: 'бумажный силуэт, аппликация (ж.р.)', partOfSpeech: 'noun', root: 'ג-ז-ר' },
    { hebrew: 'גִּזְרָה', hebrewPlain: 'גזרה', transcription: 'гизрá', translation: 'выкройка, фасон, сектор (ж.р.)', partOfSpeech: 'noun', root: 'ג-ז-р' },
  ],

  // ש-ת-ף (делиться, общий)
  'שתף': [
    { hebrew: 'שִׁתּוּף', hebrewPlain: 'שיתוף', transcription: 'шитӯф', translation: 'сотрудничество, совместное участие (м.р.)', partOfSpeech: 'noun', root: 'ש-ת-ף' },
    { hebrew: 'שֻׁתָּף', hebrewPlain: 'שותף', transcription: 'шутáф', translation: 'товарищ, партнер (м.р.)', partOfSpeech: 'noun', root: 'ש-ת-ף' },
    { hebrew: 'מְשֻׁתָּף', hebrewPlain: 'משותף', transcription: 'мешутáф', translation: 'общий, совместный', partOfSpeech: 'adjective', root: 'ש-ת-ף' },
    { hebrew: 'שֻׁתָּפוּת', hebrewPlain: 'שותפות', transcription: 'шутафӯт', translation: 'партнерство (ж.р.)', partOfSpeech: 'noun', root: 'ש-ת-ף' },
  ],

  // נ-ח-ם (утешать)
  'נחם': [
    { hebrew: 'נֶחָמָה', hebrewPlain: 'נחמה', transcription: 'нехамá', translation: 'утешение (ж.р.)', partOfSpeech: 'noun', root: 'נ-ח-ם' },
    { hebrew: 'תַּנְחוּמִים', hebrewPlain: 'תנחומים', transcription: 'танхумӣм', translation: 'соболезнования, утешения (мн.ч.)', partOfSpeech: 'noun', root: 'נ-ח-ם' },
  ],

  // ג-מ-ל (отучать, вознаграждать)
  'גמל': [
    { hebrew: 'גְּמִילָה', hebrewPlain: 'גמילה', transcription: 'гмилá', translation: 'отучение (от соски/памперса) (ж.р.)', partOfSpeech: 'noun', root: 'ג-מ-ל' },
    { hebrew: 'גָּמוּל', hebrewPlain: 'גמול', transcription: 'гамӯль', translation: 'отученный, самостоятельный', partOfSpeech: 'adjective', root: 'ג-מ-ל' },
    { hebrew: 'גְּמוּל', hebrewPlain: 'גמול', transcription: 'гмуль', translation: 'вознаграждение, отдача (м.р.)', partOfSpeech: 'noun', root: 'ג-מ-ל' },
  ],

  // נ-ק-ז (сливать, дренаж)
  'נקז': [
    { hebrew: 'נִקּוּז', hebrewPlain: 'ניקוז', transcription: 'нику́з', translation: 'слив, дренаж, водоотвод (м.р.)', partOfSpeech: 'noun', root: 'נ-ק-ז' },
    { hebrew: 'מְנֻקָּז', hebrewPlain: 'מנוקז', transcription: 'менукáз', translation: 'осушенный, дренированный', partOfSpeech: 'adjective', root: 'נ-ק-ז' },
  ],
};
