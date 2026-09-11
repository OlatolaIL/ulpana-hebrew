/**
 * Профессиональные тематические словари
 *
 * ДЕТСКИЙ САД: ВОСПИТАТЕЛЬ И ПОМОЩНИЦА (גַּן יְלָדִים: גַּנֶּנֶת וְסַיַּעַת)
 *
 * Колоды:
 *   1. kindergarten-verbs   — Глаголы воспитания, заботы и занятий (25 слов)
 *   2. kindergarten-daily   — Предметы, игры и распорядок дня в саду (25 слов)
 *   3. kindergarten-phrases — Фразы общения с детьми и родителями (25 фраз)
 */

import { ThematicDeck } from '@/types';

export const KINDERGARTEN_DECKS: ThematicDeck[] = [
  // ==========================================
  // ДЕТСКИЙ САД — ГЛАГОЛЫ ВОСПИТАНИЯ И ЗАБОТЫ
  // ==========================================
  {
    id: 'kindergarten-verbs',
    title: 'Детский сад — Глаголы воспитания и заботы',
    titleHebrew: 'גַּן יְלָדִים — פְּעָלִים שֶׁל חִינּוּךְ וְטִיפּוּל',
    description: '25 глаголов работы с малышами: присматривать, обнимать, успокаивать, клеить, рисовать, делиться игрушками, умывать и читать сказку. Полные спряжения и корни — по кнопке «Пеалим».',
    level: 'all',
    category: 'kindergarten',
    icon: 'Baby',
    words: [
      { id: 'kg_v_1', hebrew: 'לְהַשְׁגִּיחַ', hebrewPlain: 'להשגיח', transcription: 'леhашгӣах', translation: 'присматривать, следить за детьми', partOfSpeech: 'verb', root: 'ש-ג-ח', lessonId: 0 },
      { id: 'kg_v_2', hebrew: 'לְחַבֵּק', hebrewPlain: 'לחבק', transcription: 'лехабéк', translation: 'обнимать', partOfSpeech: 'verb', root: 'ח-ב-ק', lessonId: 0 },
      { id: 'kg_v_3', hebrew: 'לְהַרְגִּיעַ', hebrewPlain: 'להרגיע', transcription: 'леhаргӣа', translation: 'успокаивать', partOfSpeech: 'verb', root: 'ר-ג-ע', lessonId: 0 },
      { id: 'kg_v_4', hebrew: 'לְנַחֵם', hebrewPlain: 'לנחם', transcription: 'ленахéм', translation: 'утешать', partOfSpeech: 'verb', root: 'נ-ח-ם', lessonId: 0 },
      { id: 'kg_v_5', hebrew: 'לְשַׁתֵּף', hebrewPlain: 'לשתף', transcription: 'лешатéф', translation: 'делиться, вовлекать в игру', partOfSpeech: 'verb', root: 'ש-ת-ף', lessonId: 0 },
      { id: 'kg_v_6', hebrew: 'לְצַיֵּיר', hebrewPlain: 'לצייר', transcription: 'лецайéр', translation: 'рисовать', partOfSpeech: 'verb', root: 'צ-י-ר', lessonId: 0 },
      { id: 'kg_v_7', hebrew: 'לִגְזוֹר', hebrewPlain: 'לגזור', transcription: 'лигзóр', translation: 'вырезать (ножницами)', partOfSpeech: 'verb', root: 'ג-ז-ר', lessonId: 0 },
      { id: 'kg_v_8', hebrew: 'לְהַדְבִּיק', hebrewPlain: 'להדביק', transcription: 'леhадбӣк', translation: 'наклеивать, клеить', partOfSpeech: 'verb', root: 'ד-ב-ק', lessonId: 0 },
      { id: 'kg_v_9', hebrew: 'לְהַרְכִּיב', hebrewPlain: 'להרכיב', transcription: 'леhаркӣв', translation: 'собирать (пазл, конструктор)', partOfSpeech: 'verb', root: 'ר-כ-ב', lessonId: 0 },
      { id: 'kg_v_10', hebrew: 'לְהַקְרִיא', hebrewPlain: 'להקריא', transcription: 'леhакрӣ', translation: 'читать вслух (сказку, книжку)', partOfSpeech: 'verb', root: 'ק-ר-א', lessonId: 0 },
      { id: 'kg_v_11', hebrew: 'לִשְׁכַּב', hebrewPlain: 'לשכב', transcription: 'лишкáв', translation: 'ложиться (на тихий час)', partOfSpeech: 'verb', root: 'ש-כ-ב', lessonId: 0 },
      { id: 'kg_v_12', hebrew: 'לְהֵירָדֵם', hebrewPlain: 'להירדם', transcription: 'леhерадéм', translation: 'засыпать', partOfSpeech: 'verb', root: 'ר-ד-ם', lessonId: 0 },
      { id: 'kg_v_13', hebrew: 'לְהַלְבִּישׁ', hebrewPlain: 'להלביש', transcription: 'леhальбӣш', translation: 'одевать ребёнка', partOfSpeech: 'verb', root: 'ל-ב-ש', lessonId: 0 },
      { id: 'kg_v_14', hebrew: 'לִנְעוֹל', hebrewPlain: 'לנעול', transcription: 'линъóль', translation: 'обувать (ботинки, сандалии)', partOfSpeech: 'verb', root: 'נ-ע-ל', lessonId: 0 },
      { id: 'kg_v_15', hebrew: 'לְהַחְלִיף חִיתּוּל', hebrewPlain: 'להחליף חיתול', transcription: 'леhахлӣф хитӯль', translation: 'менять подгузник', partOfSpeech: 'verb', root: 'ח-ל-ף', lessonId: 0 },
      { id: 'kg_v_16', hebrew: 'לִרְחוֹץ יָדַיִּים', hebrewPlain: 'לרחוץ ידיים', transcription: 'лирхóц ядáим', translation: 'мыть руки', partOfSpeech: 'verb', root: 'ר-ח-ץ', lessonId: 0 },
      { id: 'kg_v_17', hebrew: 'לְסַדֵּר מִשְׂחָקִים', hebrewPlain: 'לסדר משחקים', transcription: 'лесадéр мисхакӣм', translation: 'убирать игрушки', partOfSpeech: 'verb', root: 'ס-ד-ר', lessonId: 0 },
      { id: 'kg_v_18', hebrew: 'לְוַותֵּר', hebrewPlain: 'לוותר', transcription: 'леватéр', translation: 'уступать (очередь, игрушку)', partOfSpeech: 'verb', root: 'ו-ת-ר', lessonId: 0 },
      { id: 'kg_v_19', hebrew: 'לְבַקֵּשׁ סְלִיחָה', hebrewPlain: 'לבקש סליחה', transcription: 'левакéш слихá', translation: 'просить прощения, извиняться', partOfSpeech: 'verb', root: 'ב-ק-ש', lessonId: 0 },
      { id: 'kg_v_20', hebrew: 'לְחַלֵּק', hebrewPlain: 'לחלק', transcription: 'лехалéк', translation: 'раздавать (еду, листы, карандаши)', partOfSpeech: 'verb', root: 'ח-ל-ק', lessonId: 0 },
      { id: 'kg_v_21', hebrew: 'לְהִתְנַהֵג', hebrewPlain: 'להתנהג', transcription: 'леhитнаhéг', translation: 'вести себя', partOfSpeech: 'verb', root: 'נ-ה-ג', lessonId: 0 },
      { id: 'kg_v_22', hebrew: 'לִשְׁמוֹר עַל כְּלָלִים', hebrewPlain: 'לשמור על כללים', transcription: 'лишмóр аль клалӣм', translation: 'соблюдать правила', partOfSpeech: 'verb', root: 'ש-מ-ר', lessonId: 0 },
      { id: 'kg_v_23', hebrew: 'לָשִׁיר', hebrewPlain: 'לשיר', transcription: 'лашӣр', translation: 'петь (песенки)', partOfSpeech: 'verb', root: 'ש-י-ר', lessonId: 0 },
      { id: 'kg_v_24', hebrew: 'לִרְקוֹד', hebrewPlain: 'לרקוד', transcription: 'лиркóд', translation: 'танцевать', partOfSpeech: 'verb', root: 'ר-ק-ד', lessonId: 0 },
      { id: 'kg_v_25', hebrew: 'לִגְמוֹל', hebrewPlain: 'לגמול', transcription: 'лигмóль', translation: 'приучать к горшку / отучать от соски', partOfSpeech: 'verb', root: 'ג-מ-ל', lessonId: 0 },
    ],
  },

  // ==========================================
  // ДЕТСКИЙ САД — ПРЕДМЕТЫ, ИГРЫ И БЫТ
  // ==========================================
  {
    id: 'kindergarten-daily',
    title: 'Детский сад — Предметы и распорядок',
    titleHebrew: 'גַּן יְלָדִים — חֲפָצִים וְסֵדֶר יוֹם',
    description: '25 понятий детского сада: утренний круг, двор, песочница, горка, пластилин, подгузник, бутылочка, матрас для сна и второй завтрак.',
    level: 'all',
    category: 'kindergarten',
    icon: 'Sparkles',
    words: [
      { id: 'kg_d_1', hebrew: 'מִפְגָּשׁ', hebrewPlain: 'מפגש', transcription: 'мифгáш', translation: 'утренний сбор, круг (ритуал начала дня)', partOfSpeech: 'noun', gender: 'm', root: 'פ-ג-ש', lessonId: 0 },
      { id: 'kg_d_2', hebrew: 'חָצֵר', hebrewPlain: 'חצר', transcription: 'хацéр', translation: 'двор, уличная площадка сада', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'kg_d_3', hebrew: 'אַרְגַּז חוֹל', hebrewPlain: 'ארגז חול', transcription: 'аргáз холь', translation: 'песочница', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'kg_d_4', hebrew: 'מַגְלֵשָׁה', hebrewPlain: 'מגלשה', transcription: 'маглешá', translation: 'детская горка', partOfSpeech: 'noun', gender: 'f', root: 'ג-ל-ש', lessonId: 0 },
      { id: 'kg_d_5', hebrew: 'נַדְנֵדָה', hebrewPlain: 'נדנדה', transcription: 'наднедá', translation: 'качели', partOfSpeech: 'noun', gender: 'f', root: 'נ-ד-ד', lessonId: 0 },
      { id: 'kg_d_6', hebrew: 'מִשְׂחָק', hebrewPlain: 'משחק', transcription: 'мисхáк', translation: 'игра, игрушка', partOfSpeech: 'noun', gender: 'm', root: 'ש-ח-ק', lessonId: 0 },
      { id: 'kg_d_7', hebrew: 'בּוּבָּה', hebrewPlain: 'בובה', transcription: 'бубá', translation: 'кукла', partOfSpeech: 'noun', gender: 'f', plural: 'בּוּבּוֹת', lessonId: 0 },
      { id: 'kg_d_8', hebrew: 'קוּבִּיּוֹת', hebrewPlain: 'קוביות', transcription: 'кубийóт', translation: 'строительные кубики, конструктор', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'kg_d_9', hebrew: 'פְּלַסְטֶלִינָה / בָּצֵק', hebrewPlain: 'פלסטלינה / בצק', transcription: 'пластелӣна / бацéк', translation: 'пластилин / тесто для лепки', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'kg_d_10', hebrew: 'צְבָעִים', hebrewPlain: 'צבעים', transcription: 'цваӣм', translation: 'краски, цветные карандаши', partOfSpeech: 'noun', gender: 'm', root: 'צ-ב-ע', lessonId: 0 },
      { id: 'kg_d_11', hebrew: 'טוּשִׁים', hebrewPlain: 'טושים', transcription: 'тушӣм', translation: 'фломастеры', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'kg_d_12', hebrew: 'דֶּבֶק', hebrewPlain: 'דבק', transcription: 'дéвек', translation: 'клей', partOfSpeech: 'noun', gender: 'm', root: 'ד-ב-ק', lessonId: 0 },
      { id: 'kg_d_13', hebrew: 'מִסְפָּרַיִּים', hebrewPlain: 'מספריים', transcription: 'миспарáим', translation: 'детские ножницы', partOfSpeech: 'noun', gender: 'f', root: 'ס-פ-ר', lessonId: 0 },
      { id: 'kg_d_14', hebrew: 'בְּרִיסְטוֹל', hebrewPlain: 'בריסטול', transcription: 'бристóль', translation: 'ватман, плотный цветной картон', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'kg_d_15', hebrew: 'חִיתּוּל', hebrewPlain: 'חיתול', transcription: 'хитӯль', translation: 'подгузник, памперс', partOfSpeech: 'noun', gender: 'm', root: 'ח-ת-ל', lessonId: 0 },
      { id: 'kg_d_16', hebrew: 'מַגְבוֹנִים לַחִים', hebrewPlain: 'מגבונים לחים', transcription: 'магвонӣм лахӣм', translation: 'влажные салфетки', partOfSpeech: 'noun', gender: 'm', root: 'נ-ג-ב', lessonId: 0 },
      { id: 'kg_d_17', hebrew: 'מוֹצֵץ', hebrewPlain: 'מוצץ', transcription: 'моцéц', translation: 'соска-пустышка', partOfSpeech: 'noun', gender: 'm', root: 'מ-צ-ץ', lessonId: 0 },
      { id: 'kg_d_18', hebrew: 'בַּקְבּוּק', hebrewPlain: 'בקבוק', transcription: 'бакбӯк', translation: 'детская бутылочка / поильник', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'kg_d_19', hebrew: 'סִינָר', hebrewPlain: 'סינר', transcription: 'синáр', translation: 'слюнявчик, детский фартук', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'kg_d_20', hebrew: 'מִזְרָן', hebrewPlain: 'מזרן', transcription: 'мизрáн', translation: 'матрасик для дневного сна', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'kg_d_21', hebrew: 'שְׂמִיכִי', hebrewPlain: 'שמיכי', transcription: 'смӣхи', translation: 'любимое одеяльце-комфортер', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'kg_d_22', hebrew: 'אֲרוּחַת עֶשֶׂר', hebrewPlain: 'ארוחת עשר', transcription: 'арухáт éсер', translation: 'второй завтрак (в 10:00)', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'kg_d_23', hebrew: 'קַבָּלַת שַׁבָּת', hebrewPlain: 'קבלת שבת', transcription: 'кабалáт шабáт', translation: 'пятничная церемония встречи Шаббата', partOfSpeech: 'noun', gender: 'f', root: 'ק-ב-ל', lessonId: 0 },
      { id: 'kg_d_24', hebrew: 'בְּגָדִים לְהַחְלָפָה', hebrewPlain: 'בגדים להחלפה', transcription: 'бгадӣм леhахлафá', translation: 'сменная одежда', partOfSpeech: 'noun', gender: 'm', root: 'ח-ל-ף', lessonId: 0 },
      { id: 'kg_d_25', hebrew: 'סַלְסִילָּה', hebrewPlain: 'סלסילה', transcription: 'сальсилá', translation: 'именная корзинка для вещей ребёнка', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
    ],
  },

  // ==========================================
  // ДЕТСКИЙ САД — ОБЩЕНИЕ С ДЕТЬМИ И РОДИТЕЛЯМИ
  // ==========================================
  {
    id: 'kindergarten-phrases',
    title: 'Детский сад — Фразы и диалоги',
    titleHebrew: 'גַּן יְלָדִים — מִשְׁפָּטִים עִם יְלָדִים וְהוֹרִים',
    description: '25 живых фраз общения: собрать детей в круг, утешить при расставании с мамой, правила поведения, отчёт родителям в конце дня.',
    level: 'all',
    category: 'kindergarten',
    icon: 'Users',
    words: [
      { id: 'kg_p_1', hebrew: 'בּוֹקֶר טוֹב לְכוּלָּם!', hebrewPlain: 'בוקר טוב לכולם!', transcription: 'бóкер тов лехулáм!', translation: 'Доброе утро всем!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_2', hebrew: 'בּוֹאוּ נֵשֵׁב בַּמַּעְגָּל', hebrewPlain: 'בואו נשב במעגל', transcription: 'бóу нешéв бамаагáль', translation: 'Давайте сядем в круг', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_3', hebrew: 'תּוֹרְךָ עַכְשָׁיו', hebrewPlain: 'תורך עכשיו', transcription: 'торхá ахшáв', translation: 'Сейчас твоя очередь (к мальчику)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_4', hebrew: 'תּוֹרֵךְ עַכְשָׁיו', hebrewPlain: 'תורך עכשיו', transcription: 'торéх ахшáв', translation: 'Сейчас твоя очередь (к девочке)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_5', hebrew: 'לֹא לְהַרְבִּיץ, מְדַבְּרִים בְּמִילִּים', hebrewPlain: 'לא להרביץ', transcription: 'ло леhарбӣц, медабрӣм бемйлӣм', translation: 'Не драться! Мы говорим словами', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_6', hebrew: 'אֶפְשָׁר לְשַׁתֵּף בַּמִּשְׂחָק?', hebrewPlain: 'אפשר לשתף במשחק?', transcription: 'эфшáр лешатéф бамисхáк?', translation: 'Можно поделиться игрушкой?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_7', hebrew: 'אַל תִּדְאַג, אִמָּא תָּבוֹא בְּאַרְבַּע', hebrewPlain: 'אל תדאג', transcription: 'аль тид’áг, ӣма тавó беáрба', translation: 'Не волнуйся, мама придёт в четыре', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_8', hebrew: 'לְמִי יֵשׁ פִּיפִּי?', hebrewPlain: 'למי יש פיפי?', transcription: 'лемӣ йеш пӣпи?', translation: 'Кто хочет в туалет / на горшок?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_9', hebrew: 'עַכְשָׁיו אוֹסְפִים אֶת הַמִּשְׂחָקִים', hebrewPlain: 'עכשיו אוספים משחקים', transcription: 'ахшáв осфӣм эт hамисхакӣм', translation: 'А сейчас собираем игрушки!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_10', hebrew: 'שָׁטַפְתָּ יָדַיִּים עִם סַבּוֹן?', hebrewPlain: 'שטפת ידיים עם סבון?', transcription: 'шатáфта ядáим им сабóн?', translation: 'Ты помыл руки с мылом?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_11', hebrew: 'כָּל הַכָּבוֹד, אֵיזֶה יוֹפִי!', hebrewPlain: 'כל הכבוד', transcription: 'коль hакавóд, éйзе йóфи!', translation: 'Молодец, какая красота!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_12', hebrew: 'בּוֹא נְנַגֵּב אֶת הַדְּמָעוֹת', hebrewPlain: 'בוא ננגב דמעות', transcription: 'бо ненагéв эт hадмаóт', translation: 'Давай вытрем слёзки', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_13', hebrew: 'חִיבּוּק גָּדוֹל וְהַכּוֹל עוֹבֵר', hebrewPlain: 'חיבוק גדול', transcription: 'хибӯк гадóль веhакóль овéр', translation: 'Крепко обнимемся — и всё пройдёт', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_14', hebrew: 'עַכְשָׁיו זְמַן מְנוּחָה', hebrewPlain: 'עכשיו זמן מנוחה', transcription: 'ахшáв зман менухá', translation: 'Сейчас время тихого часа (отдыха)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_15', hebrew: 'שִׂימוּ נַעֲלַיִּים, יוֹצְאִים לֶחָצֵר', hebrewPlain: 'שימו נעליים', transcription: 'сӣму наалáим, йоц’ӣм лехацéр', translation: 'Надевайте обувь, выходим во двор!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_16', hebrew: 'זְהִירוּת עַל הַמַּגְלֵשָׁה', hebrewPlain: 'זהירות על המגלשה', transcription: 'зеhирӯт аль hамаглешá', translation: 'Осторожно на горке!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_17', hebrew: 'מָה אָמַרְנוּ עַל זְרִיקַת חוֹל?', hebrewPlain: 'מה אמרנו על זריקת חול?', transcription: 'ма амáрну аль зрикáт холь?', translation: 'Что мы договаривались насчёт бросания песком?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_18', hebrew: 'הוּא אָכַל יָפֶה מְאוֹד הַיּוֹם', hebrewPlain: 'הוא אכל יפה מאוד', transcription: 'hу ахáль яфé меóд hайóм', translation: 'Он сегодня очень хорошо кушал', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_19', hebrew: 'הִיא יָשְׁנָה שָׁעָה וָחֵצִי', hebrewPlain: 'היא ישנה שעה וחצי', transcription: 'hи яшнá шаá вахéци', translation: 'Она поспала полтора часа', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_20', hebrew: 'הָיְיתָה לוֹ מַכָּה קְטַנָּה, שַׂמְנוּ קֶרַח', hebrewPlain: 'הייתה לו מכה קטנה', transcription: 'hайтá ло макá ктанá, сáмну кéрах', translation: 'Он слегка ударился, мы приложили лёд', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_21', hebrew: 'צָרִיךְ לְהָבִיא חִיתּוּלִים לַגַּן', hebrewPlain: 'צריך להביא חיתולים', transcription: 'царӣх леhавӣ хитӯлӣм лагáн', translation: 'Нужно принести подгузники в сад', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_22', hebrew: 'נָא לְהָבִיא בְּגָדִים חַמִּים לְהַחְלָפָה', hebrewPlain: 'נא להביא בגדים להחלפה', transcription: 'на леhавӣ бгадӣм хамӣм леhахлафá', translation: 'Пожалуйста, принесите тёплые вещи на смену', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_23', hebrew: 'הוּא הָיָה אַבָּא שֶׁל שַׁבָּת הַשָּׁבוּעַ', hebrewPlain: 'הוא היה אבא של שבת', transcription: 'hу hайá áба шель шабáт hашавӯа', translation: 'Он был «папой Шаббата» на этой неделе', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_24', hebrew: 'שַׁבָּת שָׁלוֹם לְכָל הַמִּשְׁפָּחָה!', hebrewPlain: 'שבת שלום לכל המשפחה!', transcription: 'шабáт шалóм лехóль hамишпахá!', translation: 'Шаббат шалом всей семье!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'kg_p_25', hebrew: 'נִתְרָאֶה מָחָר בַּבּוֹקֶר!', hebrewPlain: 'נתראה מחר בבוקר!', transcription: 'нитраé махáр бабóкер!', translation: 'Увидимся завтра утром!', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },
];
