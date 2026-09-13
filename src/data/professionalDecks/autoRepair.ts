/**
 * Профессиональные тематические словари
 *
 * АВТОМАСТЕРСКАЯ И ЗАПЧАСТИ (מוּסָךְ וְחֶלְקֵי חִלּוּף)
 *
 * Колоды:
 *   1. garage-verbs   — Глаголы ремонта и техобслуживания (25 слов)
 *   2. garage-parts   — Узлы, детали и расходники автомобиля (25 слов)
 *   3. garage-tools   — Инструменты и оборудование автосервиса (25 слов)
 *   4. garage-phrases — Разговор в сервисе: приёмка, диагностика, страховка (25 фраз)
 */

import { ThematicDeck } from '@/types';

export const AUTO_REPAIR_DECKS: ThematicDeck[] = [
  // ==========================================
  // АВТОМАСТЕРСКАЯ — ГЛАГОЛЫ РЕМОНТА
  // ==========================================
  {
    id: 'garage-verbs',
    title: 'Автомастерская — Глаголы ремонта',
    titleHebrew: 'מוּסָךְ — פְּעָלִים שֶׁל תִּיקּוּן וְטִיפּוּל',
    description: '25 глаголов техобслуживания и починки: разбирать, собирать, менять детали, регулировать, тормозить, прокачивать жидкости и заводить мотор. Спряжения и семья корня — по кнопке «Пеалим».',
    level: 'all',
    category: 'autoRepair',
    icon: 'Wrench',
    words: [
      { id: 'ar_v_1', hebrew: 'לְתַקֵּן', hebrewPlain: 'לתקן', transcription: 'летакéн', translation: 'чинить, ремонтировать', partOfSpeech: 'verb', root: 'ת-ק-ן', lessonId: 0 },
      { id: 'ar_v_2', hebrew: 'לְפָרֵק', hebrewPlain: 'לפרק', transcription: 'лефарéк', translation: 'разбирать, демонтировать, снимать', partOfSpeech: 'verb', root: 'פ-ר-ק', lessonId: 0 },
      { id: 'ar_v_3', hebrew: 'לְהַרְכִּיב', hebrewPlain: 'להרכיב', transcription: 'леhаркӣв', translation: 'собирать, устанавливать, монтировать', partOfSpeech: 'verb', root: 'ר-כ-ב', lessonId: 0 },
      { id: 'ar_v_4', hebrew: 'לְהַחְלִיף', hebrewPlain: 'להחליף', transcription: 'леhахлӣф', translation: 'менять, заменять', partOfSpeech: 'verb', root: 'ח-ל-ף', lessonId: 0 },
      { id: 'ar_v_5', hebrew: 'לִבְדּוֹק', hebrewPlain: 'לבדוק', transcription: 'ливдóк', translation: 'проверять, диагностировать', partOfSpeech: 'verb', root: 'ב-ד-ק', lessonId: 0 },
      { id: 'ar_v_6', hebrew: 'לִבְלוֹם', hebrewPlain: 'לבלום', transcription: 'ливлóм', translation: 'тормозить', partOfSpeech: 'verb', root: 'ב-ל-ם', lessonId: 0 },
      { id: 'ar_v_7', hebrew: 'לְהָנִיעַ', hebrewPlain: 'להניע', transcription: 'леhанӣа', translation: 'заводить (двигатель), трогаться', partOfSpeech: 'verb', root: 'נ-ו-ע', lessonId: 0 },
      { id: 'ar_v_8', hebrew: 'לִגְרוֹר', hebrewPlain: 'לגרור', transcription: 'лигрóр', translation: 'буксировать, эвакуировать', partOfSpeech: 'verb', root: 'ג-р-ר', lessonId: 0 },
      { id: 'ar_v_9', hebrew: 'לְשַׁמֵּן', hebrewPlain: 'לשמן', transcription: 'лешамéн', translation: 'смазывать маслом', partOfSpeech: 'verb', root: 'ש-מ-ן', lessonId: 0 },
      { id: 'ar_v_10', hebrew: 'לְכַוֵּון', hebrewPlain: 'לכוון', transcription: 'лехавéн', translation: 'регулировать, настраивать', partOfSpeech: 'verb', root: 'כ-ו-ן', lessonId: 0 },
      { id: 'ar_v_11', hebrew: 'לְנַקֵּז', hebrewPlain: 'לנקז', transcription: 'ленакéз', translation: 'сливать, дренировать (жидкость)', partOfSpeech: 'verb', root: 'נ-ק-ז', lessonId: 0 },
      { id: 'ar_v_12', hebrew: 'לְמַלֵּא', hebrewPlain: 'למלא', transcription: 'лемалé', translation: 'заливать, наполнять, заправлять', partOfSpeech: 'verb', root: 'מ-ל-א', lessonId: 0 },
      { id: 'ar_v_13', hebrew: 'לְהַחְלִיק', hebrewPlain: 'להחליק', transcription: 'леhахлӣк', translation: 'скользить, буксовать', partOfSpeech: 'verb', root: 'ח-ל-ק', lessonId: 0 },
      { id: 'ar_v_14', hebrew: 'לְהַטְעִין', hebrewPlain: 'להטעין', transcription: 'леhатъӣн', translation: 'заряжать (аккумулятор)', partOfSpeech: 'verb', root: 'ט-ע-ן', lessonId: 0 },
      { id: 'ar_v_15', hebrew: 'לְנַקּוֹת', hebrewPlain: 'לנקות', transcription: 'ленакóт', translation: 'очищать, промывать', partOfSpeech: 'verb', root: 'נ-ק-ה', lessonId: 0 },
      { id: 'ar_v_16', hebrew: 'לְחַבֵּר', hebrewPlain: 'לחבר', transcription: 'лехабéр', translation: 'соединять, подключать', partOfSpeech: 'verb', root: 'ח-ב-ר', lessonId: 0 },
      { id: 'ar_v_17', hebrew: 'לְנַתֵּק', hebrewPlain: 'לנתק', transcription: 'ленатéк', translation: 'отключать, отсоединять клеммы', partOfSpeech: 'verb', root: 'נ-ת-ק', lessonId: 0 },
      { id: 'ar_v_18', hebrew: 'לְהַדֵּק', hebrewPlain: 'להדק', transcription: 'леhадéк', translation: 'затягивать (гайки, болты)', partOfSpeech: 'verb', root: 'ה-ד-ק', lessonId: 0 },
      { id: 'ar_v_19', hebrew: 'לִפְתּוֹחַ בּוֹרֶג', hebrewPlain: 'לפתוח בורג', transcription: 'лифтóах бóрег', translation: 'откручивать болт', partOfSpeech: 'verb', root: 'פ-ת-ח', lessonId: 0 },
      { id: 'ar_v_20', hebrew: 'לְהַחְלִיף שֶׁמֶן', hebrewPlain: 'להחליף שמן', transcription: 'леhахлӣф шéмен', translation: 'менять масло', partOfSpeech: 'verb', root: 'ח-ל-ף', lessonId: 0 },
      { id: 'ar_v_21', hebrew: 'לְהִתְחַמֵּם', hebrewPlain: 'להתחמם', transcription: 'леhитхамéм', translation: 'перегреваться (о моторе)', partOfSpeech: 'verb', root: 'ח-מ-מ', lessonId: 0 },
      { id: 'ar_v_22', hebrew: 'לִדְלוֹף', hebrewPlain: 'לדלוף', transcription: 'лидлóф', translation: 'протекать, подтекать', partOfSpeech: 'verb', root: 'ד-ל-ף', lessonId: 0 },
      { id: 'ar_v_23', hebrew: 'לִפְנוֹת', hebrewPlain: 'לפנות', transcription: 'лифнóт', translation: 'поворачивать', partOfSpeech: 'verb', root: 'פ-נ-ה', lessonId: 0 },
      { id: 'ar_v_24', hebrew: 'לַעֲשׂוֹת טֶסְט', hebrewPlain: 'לעשות טסט', transcription: 'лаасóт тест', translation: 'проходить техосмотр', partOfSpeech: 'verb', root: 'ע-ש-ה', lessonId: 0 },
      { id: 'ar_v_25', hebrew: 'לֶאֱטוֹם', hebrewPlain: 'לאטום', transcription: 'леэтóм', translation: 'герметизировать, уплотнять', partOfSpeech: 'verb', root: 'א-ט-ם', lessonId: 0 },
    ],
  },

  // ==========================================
  // АВТОМАСТЕРСКАЯ — УЗЛЫ И ЗАПЧАСТИ
  // ==========================================
  {
    id: 'garage-parts',
    title: 'Автомастерская — Детали и узлы',
    titleHebrew: 'מוּסָךְ — חֶלְקֵי רֶכֶב וּמַעֲרָכוֹת',
    description: '25 названий ключевых узлов, запчастей и жидкостей: двигатель, тормоза, свечи, аккумулятор, коробка передач, фильтры и радиатор.',
    level: 'all',
    category: 'autoRepair',
    icon: 'Car',
    words: [
      { id: 'ar_p_1', hebrew: 'מָנוֹעַ', hebrewPlain: 'מנוע', transcription: 'манóа', translation: 'двигатель, мотор', partOfSpeech: 'noun', gender: 'm', root: 'נ-ו-ע', lessonId: 0 },
      { id: 'ar_p_2', hebrew: 'בְּלָמִים', hebrewPlain: 'בלמים', transcription: 'бламӣм', translation: 'тормоза', partOfSpeech: 'noun', gender: 'm', root: 'ב-ל-ם', lessonId: 0 },
      { id: 'ar_p_3', hebrew: 'רְפִידוֹת בֶּלֶם', hebrewPlain: 'רפידות בלם', transcription: 'рефидóт бéлем', translation: 'тормозные колодки', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'ar_p_4', hebrew: 'מַצְבֵּר', hebrewPlain: 'מצבר', transcription: 'мацбéр', translation: 'автомобильный аккумулятор', partOfSpeech: 'noun', gender: 'm', root: 'צ-ב-ר', lessonId: 0 },
      { id: 'ar_p_5', hebrew: 'צְמִיג', hebrewPlain: 'צמיג', transcription: 'цмӣг', translation: 'шина, покрышка', partOfSpeech: 'noun', gender: 'm', plural: 'צמיגים', lessonId: 0 },
      { id: 'ar_p_6', hebrew: 'גַּלְגַּל', hebrewPlain: 'גלגל', transcription: 'гальгáль', translation: 'колесо', partOfSpeech: 'noun', gender: 'm', plural: 'גלגלים', lessonId: 0 },
      { id: 'ar_p_7', hebrew: 'תֵּיבַת הִילּוּכִים', hebrewPlain: 'תיבת הילוכים', transcription: 'тейвáт hилухӣм', translation: 'коробка передач', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'ar_p_8', hebrew: 'מַצְמֵד / קְלָאץ׳', hebrewPlain: 'מצמד', transcription: 'мацмéд / клач', translation: 'сцепление', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_9', hebrew: 'רַדְיָטוֹר', hebrewPlain: 'רדיאטור', transcription: 'радйáтор', translation: 'радиатор охлаждения', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_10', hebrew: 'שֶׁמֶן מָנוֹעַ', hebrewPlain: 'שמן מנוע', transcription: 'шéмен манóа', translation: 'моторное масло', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_11', hebrew: 'מְסַנֵּן / פִילְטֶר', hebrewPlain: 'מסנן / פילטר', transcription: 'месанéн / фӣльтер', translation: 'фильтр (масляный / воздушный)', partOfSpeech: 'noun', gender: 'm', root: 'ס-נ-ן', lessonId: 0 },
      { id: 'ar_p_12', hebrew: 'מַצַּת / פְּלָג', hebrewPlain: 'מצת / פלג', transcription: 'мацáт / плаг', translation: 'свеча зажигания', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_13', hebrew: 'רְצוּעַת טַיְימִינְג', hebrewPlain: 'רצועת טיימינג', transcription: 'рецуáт тáйминг', translation: 'ремень ГРМ', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'ar_p_14', hebrew: 'אַלְטֶרְנָטוֹר', hebrewPlain: 'אלטרנטור', transcription: 'альтернáтор', translation: 'генератор', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_15', hebrew: 'סְטַרְטֶר / מַתְנֵעַ', hebrewPlain: 'סטרטר / מתנע', transcription: 'стáртер / матнéа', translation: 'стартер', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_16', hebrew: 'הֶגֶה', hebrewPlain: 'הגה', transcription: 'héге', translation: 'руль, рулевое управление', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_17', hebrew: 'בּוֹלְמֵי זַעֲזוּעִים', hebrewPlain: 'בולמי זעזועים', transcription: 'болмéй заазуӣм', translation: 'амортизаторы', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_18', hebrew: 'נוֹזֵל בְּלָמִים', hebrewPlain: 'נוזל בלמים', transcription: 'нозéль бламӣм', translation: 'тормозная жидкость', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_19', hebrew: 'נוֹזֵל קֵירוּר', hebrewPlain: 'נוזל קירור', transcription: 'нозéль кирӯр', translation: 'охлаждающая жидкость, антифриз', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_20', hebrew: 'פָּנָס', hebrewPlain: 'פנס', transcription: 'панáс', translation: 'фара, фонарь', partOfSpeech: 'noun', gender: 'm', plural: 'פנסים', lessonId: 0 },
      { id: 'ar_p_21', hebrew: 'שִׁמְשָׁה', hebrewPlain: 'שמשה', transcription: 'шимшá', translation: 'лобовое стекло', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'ar_p_22', hebrew: 'מַגָּבִים', hebrewPlain: 'מגבים', transcription: 'магавӣм', translation: 'дворники, стеклоочистители', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_23', hebrew: 'אַגְזוֹז / מַפְלֵט', hebrewPlain: 'אגזוז / מפלט', transcription: 'эгзóз / мафлéт', translation: 'выхлопная труба, глушитель', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_p_24', hebrew: 'נֵזֶק', hebrewPlain: 'נזק', transcription: 'нéзек', translation: 'повреждение, ущерб', partOfSpeech: 'noun', gender: 'm', root: 'נ-ז-ק', lessonId: 0 },
      { id: 'ar_p_25', hebrew: 'חֶלְקֵי חִילּוּף', hebrewPlain: 'חלקי חילוף', transcription: 'хелькéй хилу́ф', translation: 'запасные части, запчасти', partOfSpeech: 'noun', gender: 'm', root: 'ח-ל-ף', lessonId: 0 },
    ],
  },

  // ==========================================
  // АВТОМАСТЕРСКАЯ — ИНСТРУМЕНТЫ И ОБОРУДОВАНИЕ
  // ==========================================
  {
    id: 'garage-tools',
    title: 'Автомастерская — Инструменты',
    titleHebrew: 'מוּסָךְ — כְּלֵי עֲבוֹדָה וְצִיּוּד',
    description: '25 инструментов автомеханика: гаечные ключи, домкрат, подъёмник, манометр, отвёртки, компрессор и диагностический сканер.',
    level: 'all',
    category: 'autoRepair',
    icon: 'Wrench',
    words: [
      { id: 'ar_t_1', hebrew: 'מַפְתֵּחַ בְּרָגִים', hebrewPlain: 'מפתח ברגים', transcription: 'мафтéах брагӣм', translation: 'гаечный ключ', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_2', hebrew: 'מַפְתֵּחַ שְׁוֶדִי', hebrewPlain: 'מפתח שבדי', transcription: 'мафтéах швéди', translation: 'разводной ключ', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_3', hebrew: 'מַבְרֵג', hebrewPlain: 'מברג', transcription: 'маврéг', translation: 'отвёртка', partOfSpeech: 'noun', gender: 'm', root: 'ב-ר-ג', lessonId: 0 },
      { id: 'ar_t_4', hebrew: 'בּוֹרֶג', hebrewPlain: 'בורג', transcription: 'бóрег', translation: 'болт, винт', partOfSpeech: 'noun', gender: 'm', plural: 'ברגים', lessonId: 0 },
      { id: 'ar_t_5', hebrew: 'פְּלָיֶיר', hebrewPlain: 'פלייר', transcription: 'плáйер', translation: 'плоскогубцы, пассатижи', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_6', hebrew: 'מַגְבֵּהַּ / גַּ׳ק', hebrewPlain: 'מגבה / ג\'ק', transcription: 'магбéах / джек', translation: 'домкрат', partOfSpeech: 'noun', gender: 'm', root: 'ג-ב-ה', lessonId: 0 },
      { id: 'ar_t_7', hebrew: 'לִיפְט / מַעֲלִית רֶכֶב', hebrewPlain: 'ליפט', transcription: 'лифт', translation: 'подъёмник для автомобилей', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_8', hebrew: 'פַּטִּישׁ', hebrewPlain: 'פטיש', transcription: 'патӣш', translation: 'молоток', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_9', hebrew: 'מַד לַחַץ אֲוִויר', hebrewPlain: 'מד לחץ אוויר', transcription: 'мад лáхац авӣр', translation: 'манометр (давление в шинах)', partOfSpeech: 'noun', gender: 'm', root: 'מ-ד-ד', lessonId: 0 },
      { id: 'ar_t_10', hebrew: 'קוֹמְפְּרֶסוֹר / מַדְחֵס', hebrewPlain: 'קומפרסור / מדחס', transcription: 'компрéсор / мадхéс', translation: 'компрессор, насос', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_11', hebrew: 'מַכְשִׁיר דִּיאַגְנוֹסְטִיקָה', hebrewPlain: 'מכשיר דיאגנוסטיקה', transcription: 'махшӣр диагнóстика', translation: 'диагностический сканер', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_12', hebrew: 'מַבְרֵגָה', hebrewPlain: 'מברגה', transcription: 'маврегá', translation: 'шуруповёрт, гайковёрт', partOfSpeech: 'noun', gender: 'f', root: 'ב-ר-ג', lessonId: 0 },
      { id: 'ar_t_13', hebrew: 'כַּבְלֵי הַתְנָעָה', hebrewPlain: 'כבלי התנעה', transcription: 'кавлéй hатнаá', translation: 'провода для прикуривания', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_14', hebrew: 'מִשְׁפֵּךְ', hebrewPlain: 'משפך', transcription: 'машпéх', translation: 'воронка (для заливки масла)', partOfSpeech: 'noun', gender: 'm', root: 'ש-פ-ך', lessonId: 0 },
      { id: 'ar_t_15', hebrew: 'מְכָל שֶׁמֶן', hebrewPlain: 'מכל שמן', transcription: 'мехáль шéмен', translation: 'канистра / ёмкость для масла', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_16', hebrew: 'כְּפָפוֹת עֲבוֹדָה', hebrewPlain: 'כפפות עבודה', transcription: 'кфафóт аводá', translation: 'рабочие перчатки', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'ar_t_17', hebrew: 'סְמַרְטוּטִים', hebrewPlain: 'סמרטוטים', transcription: 'смартутӣм', translation: 'ветошь, тряпки для масла', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_18', hebrew: 'פָּנָס רֹאשׁ', hebrewPlain: 'פנס ראש', transcription: 'панáс рош', translation: 'налобный фонарь', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_19', hebrew: 'מֶלְקָחַיִּים / מַלְחֵץ', hebrewPlain: 'מלחציים', transcription: 'мелхацáим', translation: 'тиски', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'ar_t_20', hebrew: 'מְסוֹר מַתֶּכֶת', hebrewPlain: 'מסור מתכת', transcription: 'масóр матéхет', translation: 'ножовка по металлу', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_21', hebrew: 'מַד עוֹמֶק חֲרִיצִים', hebrewPlain: 'מד עומק', transcription: 'мад óмек', translation: 'глубиномер протектора шин', partOfSpeech: 'noun', gender: 'm', root: 'מ-ד-ד', lessonId: 0 },
      { id: 'ar_t_22', hebrew: 'חוֹמֶר שִׁימּוּן', hebrewPlain: 'חומר שימון', transcription: 'хóмер шиму́н', translation: 'смазочный спрей (WD-40)', partOfSpeech: 'noun', gender: 'm', root: 'ש-מ-ן', lessonId: 0 },
      { id: 'ar_t_23', hebrew: 'שַׁוְאַב שֶׁמֶן', hebrewPlain: 'שואב שמן', transcription: 'шоэв шéмен', translation: 'маслоотсос, вакуумный насос', partOfSpeech: 'noun', gender: 'm', root: 'ש-א-ב', lessonId: 0 },
      { id: 'ar_t_24', hebrew: 'מַעֲמָד לְרֶכֶב', hebrewPlain: 'מעמד לרכב', transcription: 'маамáд лерéхев', translation: 'страховочная стойка под авто', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_t_25', hebrew: 'אַרְגַּז כֵּלִים', hebrewPlain: 'ארגז כלים', transcription: 'аргáз келӣм', translation: 'ящик для инструментов', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
    ],
  },

  // ==========================================
  // АВТОМАСТЕРСКАЯ — ДИАЛОГ С КЛИЕНТОМ И СТРАХОВКА
  // ==========================================
  {
    id: 'garage-phrases',
    title: 'Автомастерская — Диалоги и приёмка',
    titleHebrew: 'מוּסָךְ — קַבָּלַת רֶכֶב וְשִׂיחָה עִם לָקוֹחַ',
    description: '25 практических выражений: приёмка машины, жалобы на стуки и скрип, согласование сметы ремонта, техосмотр и гарантия.',
    level: 'all',
    category: 'autoRepair',
    icon: 'Briefcase',
    words: [
      { id: 'ar_d_1', hebrew: 'מָה הַבְּעָיָה בָּרֶכֶב?', hebrewPlain: 'מה הבעיה ברכב?', transcription: 'ма hабеайá барéхев?', translation: 'В чём проблема с автомобилем?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_2', hebrew: 'הָרֶכֶב לֹא מֵנִיעַ', hebrewPlain: 'הרכב לא מניע', transcription: 'hарéхев ло менӣа', translation: 'Машина не заводится', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_3', hebrew: 'יֵשׁ רַעַשׁ מוּזָר מֵהַמָּנוֹעַ', hebrewPlain: 'יש רעש מוזר מהמנוע', transcription: 'йеш рáаш музáр меhаманóа', translation: 'Странный шум из двигателя', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_4', hebrew: 'הַבְּלָמִים חוֹרְקִים', hebrewPlain: 'הבלמים חורקים', transcription: 'hабламӣм хоркӣм', translation: 'Тормоза скрипят / скрежещут', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_5', hebrew: 'נִדְלְקָה נוּרַת מָנוֹעַ', hebrewPlain: 'נדלקה נורת מנוע', transcription: 'нидлекá нӯрат манóа', translation: 'Загорелась лампочка Check Engine', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_6', hebrew: 'הַמַּצְבֵּר הִתְרוֹקֵן', hebrewPlain: 'המצבר התרוקן', transcription: 'hамацбéр hитрокéн', translation: 'Аккумулятор сел (разрядился)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_7', hebrew: 'יֵשׁ דְּלִיפַת שֶׁמֶן', hebrewPlain: 'יש דליפת שמן', transcription: 'йеш делифáт шéмен', translation: 'Идёт утечка масла', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_8', hebrew: 'הַמָּנוֹעַ מִתְחַמֵּם מַהֵר', hebrewPlain: 'המנוע מתחמם מהר', transcription: 'hаманóа митхамéм маhéр', translation: 'Двигатель быстро перегревается', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_9', hebrew: 'הַרְגָּשַׁת רְעִידָה בַּהֶגֶה', hebrewPlain: 'הרגשת רעידה בהגה', transcription: 'hаргашáт реидá баhéге', translation: 'Ощущается вибрация в руле', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_10', hebrew: 'כַּמָּה זֶה יַעֲלֶה בְּעֵרֶךְ?', hebrewPlain: 'כמה זה יעלה בערך?', transcription: 'кáма зэ йаалé беéрех?', translation: 'Сколько примерно это будет стоить?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_11', hebrew: 'הַצָּעַת מְחִיר לְתִיקּוּן', hebrewPlain: 'הצעת מחיר לתיקון', transcription: 'hацаáт мехӣр летикӯн', translation: 'Ценовое предложение (смета) на ремонт', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'ar_d_12', hebrew: 'חֵלֶק מְקוֹרִי אוֹ חֲלִיפִי?', hebrewPlain: 'חלק מקורי או חליפי?', transcription: 'хéлек мекорӣ о халифӣ?', translation: 'Оригинальная деталь или аналог?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_13', hebrew: 'כַּמָּה זְמַן יִקַּח הַתִּיקּוּן?', hebrewPlain: 'כמה זמן יקח התיקון?', transcription: 'кáма зман йикáх hатикӯн?', translation: 'Сколько времени займёт ремонт?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_14', hebrew: 'הָרֶכֶב יִהְיֶה מוּכָן הַיּוֹם', hebrewPlain: 'הרכב יהיה מוכן היום', transcription: 'hарéхев йиhйé мухáн hайóм', translation: 'Автомобиль будет готов сегодня', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_15', hebrew: 'נִתְקַשֵּׁר אֵלֶיךָ כְּשֶׁזֶּה יִהְיֶה מוּכָן', hebrewPlain: 'נתקשר אליך כשזה יהיה מוכן', transcription: 'ниткашéр элéйха кшезэ йиhйé мухáн', translation: 'Мы позвоним вам, когда всё будет готово', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_16', hebrew: 'טִיפּוּל עֲשָׂרָה אֲלָפִים', hebrewPlain: 'טיפול עשרת אלפים', transcription: 'типӯль асарá алафӣм', translation: 'ТО на 10,000 км (базовое техобслуживание)', partOfSpeech: 'noun', gender: 'm', root: 'ט-פ-ל', lessonId: 0 },
      { id: 'ar_d_17', hebrew: 'הֲכָנָה לְטֶסְט שְׁנָתִי', hebrewPlain: 'הכנה לטסט שנתי', transcription: 'hаханá летéст шнатӣ', translation: 'Подготовка к ежегодному техосмотру', partOfSpeech: 'noun', gender: 'f', root: 'כ-ו-ן', lessonId: 0 },
      { id: 'ar_d_18', hebrew: 'הָרֶכֶב עָבַר טֶסְט', hebrewPlain: 'הרכב עבר טסט', transcription: 'hарéхев авáр тест', translation: 'Машина прошла техосмотр', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_19', hebrew: 'יֵשׁ אַחֲרָיוּת עַל הַתִּיקּוּן?', hebrewPlain: 'יש אחריות על התיקון?', transcription: 'йеш ахрайӯт аль hатикӯн?', translation: 'Есть гарантия на ремонт?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_20', hebrew: 'חֶבְרַת בִּיטּוּחַ', hebrewPlain: 'חברת ביטוח', transcription: 'хеврáт битӯах', translation: 'Страховая компания', partOfSpeech: 'noun', gender: 'f', root: 'ב-ט-ח', lessonId: 0 },
      { id: 'ar_d_21', hebrew: 'שַׁמַּאי רֶכֶב', hebrewPlain: 'שמאי רכב', transcription: 'шамáй рéхев', translation: 'Страховой автоэксперт / оценщик', partOfSpeech: 'noun', gender: 'm', root: 'ש-ו-ם', lessonId: 0 },
      { id: 'ar_d_22', hebrew: 'דּוּ״חַ תְּאוּנָה', hebrewPlain: 'דוח תאונה', transcription: 'дóах теунá', translation: 'Отчёт об аварии / ДТП', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'ar_d_23', hebrew: 'טוֹטָל-לוֹס', hebrewPlain: 'טוטל לוס', transcription: 'тóтал лосс', translation: 'Машина не подлежит восстановлению (total loss)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'ar_d_24', hebrew: 'חֶשְׁבּוֹנִית וְקַבָּלָה', hebrewPlain: 'חשבונית וקבלה', transcription: 'хешбонӣт векабалá', translation: 'Счёт-фактура и квитанция об оплате', partOfSpeech: 'noun', gender: 'f', root: 'ח-ש-ב', lessonId: 0 },
      { id: 'ar_d_25', hebrew: 'נְסִיעָה טוֹבָה וּבְטוּחָה!', hebrewPlain: 'נסיעה טובה ובטוחה', transcription: 'несиá товá уветухá!', translation: 'Счастливого и безопасного пути!', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },
];
