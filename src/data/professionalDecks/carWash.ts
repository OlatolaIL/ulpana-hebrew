/**
 * Профессиональные тематические словари
 *
 * АВТОМОЙКА И ДЕТЕЙЛИНГ (רְחִיצַת רֶכֶב, שְׁטִיפָה וְדִיטֵיְילִינְג)
 *
 * Колоды:
 *   1. carwash-verbs     — Глаголы мойки, чистки и полировки (25 слов)
 *   2. carwash-tools     — Оборудование, автохимия и материалы (25 слов)
 *   3. carwash-areas     — Зоны автомобиля, виды мойки и детейлинг (25 слов)
 *   4. carwash-dialogue  — Разговор с клиентом и водителем (25 фраз)
 */

import { ThematicDeck } from '@/types';

export const CAR_WASH_DECKS: ThematicDeck[] = [
  // ==========================================
  // АВТОМОЙКА — ГЛАГОЛЫ
  // ==========================================
  {
    id: 'carwash-verbs',
    title: 'Автомойка — Глаголы мойки и полировки',
    titleHebrew: 'שְׁטִיפַת רֶכֶב — פְּעָלִים שֶׁל רְחִיצָה וְטִיפּוּחַ',
    description: '25 ключевых глаголов: мыть, наносить пену, протирать насухо, пылесосить салон, наносить воск, полировать, удалять пятна и чернить резину.',
    level: 'all',
    category: 'carWash',
    icon: 'Droplets',
    words: [
      { id: 'cw_v_1', hebrew: 'לִשְׁטוֹף', hebrewPlain: 'לשטוף', transcription: 'лиштóф', translation: 'мыть, смывать струёй воды', partOfSpeech: 'verb', root: 'ש-ט-ף', lessonId: 0 },
      { id: 'cw_v_2', hebrew: 'לִרְחוֹץ', hebrewPlain: 'לרחוץ', transcription: 'лирхóц', translation: 'мыть (автомобиль)', partOfSpeech: 'verb', root: 'ר-ח-ץ', lessonId: 0 },
      { id: 'cw_v_3', hebrew: 'לְהַקְצִיף', hebrewPlain: 'להקציף', transcription: 'леhакцӣф', translation: 'наносить пену, покрывать активной пеной', partOfSpeech: 'verb', root: 'ק-צ-ף', lessonId: 0 },
      { id: 'cw_v_4', hebrew: 'לְנַגֵּב', hebrewPlain: 'לנגב', transcription: 'ленагéв', translation: 'вытирать насухо, протирать микрофиброй', partOfSpeech: 'verb', root: 'נ-ג-ב', lessonId: 0 },
      { id: 'cw_v_5', hebrew: 'לִשְׁאוֹב אָבָק', hebrewPlain: 'לשאוב אבק', transcription: 'лиш’óв авáк', translation: 'пылесосить салон и багажник', partOfSpeech: 'verb', root: 'ש-א-ב', lessonId: 0 },
      { id: 'cw_v_6', hebrew: 'לְהַבְרִיק', hebrewPlain: 'להבריק', transcription: 'леhаврӣк', translation: 'наводить глянец, заставлять блестеть', partOfSpeech: 'verb', root: 'ב-ר-ק', lessonId: 0 },
      { id: 'cw_v_7', hebrew: 'לַעֲשׂוֹת פּוֹלִישׁ', hebrewPlain: 'לעשות פוליש', transcription: 'лаасóт пóлиш', translation: 'полировать кузов полировочной пастой', partOfSpeech: 'verb', lessonId: 0 },
      { id: 'cw_v_8', hebrew: 'לִמְרוֹחַ וַקְס', hebrewPlain: 'למרוח וקס', transcription: 'лимрóах вакс', translation: 'наносить воск, натирать воском', partOfSpeech: 'verb', root: 'מ-ר-ח', lessonId: 0 },
      { id: 'cw_v_9', hebrew: 'לְיַבֵּשׁ', hebrewPlain: 'לייבש', transcription: 'лейабéш', translation: 'сушить (воздухом или салфетками)', partOfSpeech: 'verb', root: 'י-ב-ש', lessonId: 0 },
      { id: 'cw_v_10', hebrew: 'לְרַסֵּס', hebrewPlain: 'לרסס', transcription: 'лерасéс', translation: 'распылять спрей, брызгать химию', partOfSpeech: 'verb', root: 'ר-ס-ס', lessonId: 0 },
      { id: 'cw_v_11', hebrew: 'לְקַרְצֵף', hebrewPlain: 'לקרצף', transcription: 'лекарцéф', translation: 'оттирать щёткой, драить въевшуюся грязь', partOfSpeech: 'verb', root: 'ק-ר-צ-ף', lessonId: 0 },
      { id: 'cw_v_12', hebrew: 'לְהַתִּיז', hebrewPlain: 'להתיז', transcription: 'леhатӣз', translation: 'подавать струю под напором, обрызгивать', partOfSpeech: 'verb', root: 'נ-ת-ז', lessonId: 0 },
      { id: 'cw_v_13', hebrew: 'לְהָסִיר כְּתָמִים', hebrewPlain: 'להסיר כתמים', transcription: 'леhасӣр ктамӣм', translation: 'выводить пятна (с обивки / смолу с кузова)', partOfSpeech: 'verb', root: 'ס-ו-ר', lessonId: 0 },
      { id: 'cw_v_14', hebrew: 'לְהַשְׁחִיר צְמִיגִים', hebrewPlain: 'להשחיר צמיגים', transcription: 'леhашхӣр цмигӣм', translation: 'чернить покрышки, натирать резину блеском', partOfSpeech: 'verb', root: 'ש-ח-ר', lessonId: 0 },
      { id: 'cw_v_15', hebrew: 'לְחַטֵּא', hebrewPlain: 'לחטא', transcription: 'лехатé', translation: 'дезинфицировать салон, озонировать', partOfSpeech: 'verb', root: 'ח-ט-א', lessonId: 0 },
      { id: 'cw_v_16', hebrew: 'לְבַשֵּׂם', hebrewPlain: 'לבשם', transcription: 'левасéм', translation: 'ароматизировать салон, брызгать отдушку', partOfSpeech: 'verb', root: 'ב-ש-ם', lessonId: 0 },
      { id: 'cw_v_17', hebrew: 'לְרוֹקֵן מַאֲפֵרָה', hebrewPlain: 'לרוקן מאפרה', transcription: 'лерокéн мааферá', translation: 'вытряхивать пепельницу', partOfSpeech: 'verb', root: 'ר-י-ק', lessonId: 0 },
      { id: 'cw_v_18', hebrew: 'לְנַעֵר שְׁטִיחִים', hebrewPlain: 'לנער שטיחים', transcription: 'ленаéр штихӣм', translation: 'выбивать и встряхивать коврики', partOfSpeech: 'verb', root: 'נ-ע-ר', lessonId: 0 },
      { id: 'cw_v_19', hebrew: 'לִשְׁטוֹף בְּלַחַץ', hebrewPlain: 'לשטוף בלחץ', transcription: 'лиштóф белáхац', translation: 'обмывать под высоким давлением (гарником)', partOfSpeech: 'verb', root: 'ש-ט-ף', lessonId: 0 },
      { id: 'cw_v_20', hebrew: 'לְהַכְנִיס לַמִּנְהָרָה', hebrewPlain: 'להכניס למנהרה', transcription: 'леhахнӣс ламинhарá', translation: 'заводить автомобиль в автоматический туннель', partOfSpeech: 'verb', root: 'כ-נ-ס', lessonId: 0 },
      { id: 'cw_v_21', hebrew: 'לְהַעֲבִיר לְנֵיטְרָל', hebrewPlain: 'להעביר לניטרל', transcription: 'леhаавӣр ленейтрáль', translation: 'переключать коробку передач на нейтраль', partOfSpeech: 'verb', root: 'ע-ב-ר', lessonId: 0 },
      { id: 'cw_v_22', hebrew: 'לְשַׁחְרֵר בֶּלֶם יָד', hebrewPlain: 'לשחרר בלם יד', transcription: 'лешахрéр бéлем йад', translation: 'отпускать ручной тормоз', partOfSpeech: 'verb', root: 'ש-ח-ר-ר', lessonId: 0 },
      { id: 'cw_v_23', hebrew: 'לִסְגּוֹר חַלּוֹנוֹת', hebrewPlain: 'לסגור חלונות', transcription: 'лисгóр халонóт', translation: 'плотно закрывать все стёкла', partOfSpeech: 'verb', root: 'ס-ג-ר', lessonId: 0 },
      { id: 'cw_v_24', hebrew: 'לְקַפֵּל מַרְאוֹת', hebrewPlain: 'לקפל מראות', transcription: 'лекапéль мар’óт', translation: 'складывать боковые зеркала перед мойкой', partOfSpeech: 'verb', root: 'ק-פ-ל', lessonId: 0 },
      { id: 'cw_v_25', hebrew: 'לִמְסוֹר אֶת הָרֶכֶב', hebrewPlain: 'למסור את הרכב', transcription: 'лимсóр эт hарéхев', translation: 'сдавать вымытый чистый автомобиль водителю', partOfSpeech: 'verb', root: 'מ-ס-ר', lessonId: 0 },
    ],
  },

  // ==========================================
  // АВТОМОЙКА — ОБОРУДОВАНИЕ И АВТОХИМИЯ
  // ==========================================
  {
    id: 'carwash-tools',
    title: 'Автомойка — Оборудование и химия',
    titleHebrew: 'שְׁטִיפַת רֶכֶב — צִיּוּד, חוֹמָרִים וְכֵלִים',
    description: '25 инструментов и средств: гарник (аппарат высокого давления), пена, микрофибра, водосгон, шампунь, воск, полироль, чернитель резины и автопылесос.',
    level: 'all',
    category: 'carWash',
    icon: 'Wrench',
    words: [
      { id: 'cw_t_1', hebrew: 'גַּרְנִיק / מְכוֹנַת לַחַץ', hebrewPlain: 'גרניק', transcription: 'гáрник / мехонáт лáхац', translation: 'аппарат высокого давления (керхер/гарник)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_t_2', hebrew: 'קֶצֶף פָּעִיל', hebrewPlain: 'קצף פעיל', transcription: 'кéцеф паӣль', translation: 'активная пена для бесконтактной мойки', partOfSpeech: 'noun', gender: 'm', root: 'ק-צ-ף', lessonId: 0 },
      { id: 'cw_t_3', hebrew: 'שַׁמְפּוּ לְרֶכֶב', hebrewPlain: 'שמפו לרכב', transcription: 'шампӯ лерéхев', translation: 'автомобильный шампунь', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_t_4', hebrew: 'מַטְלִית מִיקְרוֹפַיְבֶּר', hebrewPlain: 'מטלית מיקרופייבר', transcription: 'матлӣт микрофáйбер', translation: 'салфетка из микрофибры для протирки', partOfSpeech: 'noun', gender: 'f', root: 'ט-ל-ל', lessonId: 0 },
      { id: 'cw_t_5', hebrew: 'מַגֵּב גּוּמִי', hebrewPlain: 'מגב גומי', transcription: 'магéв гӯми', translation: 'резиновый водосгон для сушки кузова и стёкол', partOfSpeech: 'noun', gender: 'm', root: 'נ-ג-ב', lessonId: 0 },
      { id: 'cw_t_6', hebrew: 'סְפוֹג רְחִיצָה', hebrewPlain: 'ספוג רחיצה', transcription: 'сфог рехицá', translation: 'пористая губка для ручной мойки', partOfSpeech: 'noun', gender: 'm', root: 'ר-ח-ץ', lessonId: 0 },
      { id: 'cw_t_7', hebrew: 'שׁוֹאֵב אָבָק תַּעֲשִׂיָּתִי', hebrewPlain: 'שואב אבק', transcription: 'шоéв авáк таасиятӣ', translation: 'мощный промышленный автопылесос', partOfSpeech: 'noun', gender: 'm', root: 'ש-א-ב', lessonId: 0 },
      { id: 'cw_t_8', hebrew: 'מַדְחֵס אֲוִויר', hebrewPlain: 'מדחס אוויר', transcription: 'мадхéс авӣр', translation: 'воздушный компрессор для продувки стыков и щелей', partOfSpeech: 'noun', gender: 'm', root: 'ד-ח-ס', lessonId: 0 },
      { id: 'cw_t_9', hebrew: 'וַקְס חַם / קַר', hebrewPlain: 'וקס', transcription: 'вакс хам / кар', translation: 'горячий / холодный защитный автомобильный воск', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_t_10', hebrew: 'פּוֹלִישׁ', hebrewPlain: 'פוליש', transcription: 'пóлиш', translation: 'полироль, паста для полировки ЛКП', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_t_11', hebrew: 'מַבְרִיק צְמִיגִים', hebrewPlain: 'מבריק צמיגים', transcription: 'маврӣк цмигӣм', translation: 'чернитель / силиконовый блеск для шин', partOfSpeech: 'noun', gender: 'm', root: 'ב-ר-ק', lessonId: 0 },
      { id: 'cw_t_12', hebrew: 'נוֹזֵל שְׁמָשׁוֹת', hebrewPlain: 'נוזל שמשות', transcription: 'нозéль шмашóт', translation: 'очиститель автомобильных стёкол', partOfSpeech: 'noun', gender: 'm', root: 'נ-ז-ל', lessonId: 0 },
      { id: 'cw_t_13', hebrew: 'מַסִּיר שֻׁמָּנִים', hebrewPlain: 'מסיר שומנים', transcription: 'масӣр шуманӣм', translation: 'обезжириватель (дегризер для битума и масла)', partOfSpeech: 'noun', gender: 'm', root: 'ס-ו-ר', lessonId: 0 },
      { id: 'cw_t_14', hebrew: 'מַסִּיר חֲרָקִים', hebrewPlain: 'מסיר חרקים', transcription: 'масӣр харакӣм', translation: 'очиститель следов насекомых с бампера', partOfSpeech: 'noun', gender: 'm', root: 'ס-ו-ר', lessonId: 0 },
      { id: 'cw_t_15', hebrew: 'מְנַקֶּה רִפּוּדִים', hebrewPlain: 'מנקה ריפודים', transcription: 'менакé рипудӣм', translation: 'пеноочиститель текстильной обивки сидений', partOfSpeech: 'noun', gender: 'm', root: 'נ-ק-ה', lessonId: 0 },
      { id: 'cw_t_16', hebrew: 'תַּרְסִיס לַדֶּשְׁבּוֹרְד', hebrewPlain: 'תרסיס לדשבורד', transcription: 'тарсӣс ладéшборд', translation: 'полироль-спрей для пластика и торпедо', partOfSpeech: 'noun', gender: 'm', root: 'ר-ס-ס', lessonId: 0 },
      { id: 'cw_t_17', hebrew: 'עֵץ רֵיחַ / רֵיחָן', hebrewPlain: 'עץ ריח', transcription: 'эц рéйах / рейхáн', translation: 'ароматизатор салона («ёлочка» / пахучка)', partOfSpeech: 'noun', gender: 'm', root: 'ר-י-ח', lessonId: 0 },
      { id: 'cw_t_18', hebrew: 'כְּפָפוֹת גּוּמִי עֲמִידוֹת', hebrewPlain: 'כפפות גומי', transcription: 'кфафóт гӯми амидóт', translation: 'прочные непромокаемые резиновые перчатки', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cw_t_19', hebrew: 'מַגָּפֵי גּוּמִי', hebrewPlain: 'מגפי גומי', transcription: 'магафéй гӯми', translation: 'резиновые рабочие сапоги', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_t_20', hebrew: 'סִינָר מָגֵן חָסִין מַיִם', hebrewPlain: 'סינר מגן', transcription: 'синáр магéн хасӣн мáйим', translation: 'водонепроницаемый фартук мойщика', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_t_21', hebrew: 'מִבְרֶשֶׁת גַּ׳נְטִים', hebrewPlain: 'מברשת גנטים', transcription: 'миврéшет жáнтим', translation: 'жёсткая щётка для колёсных дисков', partOfSpeech: 'noun', gender: 'f', root: 'ב-ר-ש', lessonId: 0 },
      { id: 'cw_t_22', hebrew: 'צִנּוֹר מַיִם', hebrewPlain: 'צינור מים', transcription: 'цинóр мáйим', translation: 'поливочный водяной шланг', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_t_23', hebrew: 'אֶקְדַּח לַחַץ', hebrewPlain: 'אקדח לחץ', transcription: 'экдáх лáхац', translation: 'ручной пистолет распылителя высокого давления', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_t_24', hebrew: 'מִנְהֶרֶת שְׁטִיפָה', hebrewPlain: 'מנהרת שטיפה', transcription: 'минhарáт штифá', translation: 'автоматический моечный туннель с валиками', partOfSpeech: 'noun', gender: 'f', root: 'נ-ה-ר', lessonId: 0 },
      { id: 'cw_t_25', hebrew: 'מַיַּבֵּשׁ / פֶן חַם', hebrewPlain: 'מייבש פן', transcription: 'мейабéш / фен хам', translation: 'турбосушка / воздушная пушка для сушки авто', partOfSpeech: 'noun', gender: 'm', root: 'י-ב-ש', lessonId: 0 },
    ],
  },

  // ==========================================
  // АВТОМОЙКА — ЗОНЫ АВТОМОБИЛЯ И ДЕТЕЙЛИНГ
  // ==========================================
  {
    id: 'carwash-areas',
    title: 'Автомойка — Зоны авто и детейлинг',
    titleHebrew: 'שְׁטִיפַת רֶכֶב — חֶלְקֵי הָרֶכֶב וְדִיטֵיְילִינְג',
    description: '25 зон кузова и салона: кузов, лобовое стекло, коврики, обивка, кожаные кресла, диски, багажник, торпедо, пороги и керамическое покрытие.',
    level: 'all',
    category: 'carWash',
    icon: 'Car',
    words: [
      { id: 'cw_a_1', hebrew: 'שְׁטִיפָה חִיצוֹנִית', hebrewPlain: 'שטיפה חיצונית', transcription: 'штифá хицонӣт', translation: 'наружная мойка кузова', partOfSpeech: 'noun', gender: 'f', root: 'ח-ו-ץ', lessonId: 0 },
      { id: 'cw_a_2', hebrew: 'נִיקּוּי פְּנִימִי', hebrewPlain: 'ניקוי פנימי', transcription: 'никӯй пнимӣ', translation: 'внутренняя уборка и чистка салона', partOfSpeech: 'noun', gender: 'm', root: 'פ-נ-ם', lessonId: 0 },
      { id: 'cw_a_3', hebrew: 'שְׁטִיפָה מַקִּיפָה / קוֹמְפְּלֶקְט', hebrewPlain: 'שטיפה מקיפה', transcription: 'штифá макифá / комплéкт', translation: 'комплексная мойка (кузов + салон)', partOfSpeech: 'noun', gender: 'f', root: 'נ-ק-ף', lessonId: 0 },
      { id: 'cw_a_4', hebrew: 'שִׁמְשָׁה קִדְמִית', hebrewPlain: 'שמשה קדמית', transcription: 'шимшá кидмӣт', translation: 'лобовое (ветровое) стекло', partOfSpeech: 'noun', gender: 'f', root: 'ש-מ-ש', lessonId: 0 },
      { id: 'cw_a_5', hebrew: 'שִׁמְשָׁה אֲחוֹרִית', hebrewPlain: 'שמשה אחורית', transcription: 'шимшá ахорӣт', translation: 'заднее стекло автомобиля', partOfSpeech: 'noun', gender: 'f', root: 'ש-מ-ש', lessonId: 0 },
      { id: 'cw_a_6', hebrew: 'חַלּוֹן צַד', hebrewPlain: 'חלון צד', transcription: 'халóн цад', translation: 'боковое стекло двери', partOfSpeech: 'noun', gender: 'm', root: 'ח-ל-ל', lessonId: 0 },
      { id: 'cw_a_7', hebrew: 'מַרְאָה צְדָדִית', hebrewPlain: 'מראה צדדית', transcription: 'мар’á цдадӣт', translation: 'боковое зеркало заднего вида', partOfSpeech: 'noun', gender: 'f', root: 'ר-א-ה', lessonId: 0 },
      { id: 'cw_a_8', hebrew: 'שְׁטִיחֵי רֶכֶב', hebrewPlain: 'שטיחי רכב', transcription: 'штейхéй рéхев', translation: 'автомобильные коврики в салон', partOfSpeech: 'noun', gender: 'm', root: 'ש-ט-ח', lessonId: 0 },
      { id: 'cw_a_9', hebrew: 'שְׁטִיחֵי גּוּמִי', hebrewPlain: 'שטיחי גומי', transcription: 'штейхéй гӯми', translation: 'резиновые коврики (моющиеся водой)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_a_10', hebrew: 'שְׁטִיחֵי בַּד', hebrewPlain: 'שטיחי בד', transcription: 'штейхéй бад', translation: 'текстильные / ворсовые коврики', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_a_11', hebrew: 'רִפּוּדִים', hebrewPlain: 'ריפודים', transcription: 'рипудӣм', translation: 'тканевая обивка сидений, чехлы', partOfSpeech: 'noun', gender: 'm', root: 'ר-פ-ד', lessonId: 0 },
      { id: 'cw_a_12', hebrew: 'מוֹשְׁבֵי עוֹר', hebrewPlain: 'מושבי עור', transcription: 'мошвéй ор', translation: 'кожаные автомобильные кресла', partOfSpeech: 'noun', gender: 'm', root: 'י-ש-ב', lessonId: 0 },
      { id: 'cw_a_13', hebrew: 'דֶּשְׁבּוֹרְד / לוּחַ מַחְוָונִים', hebrewPlain: 'דשבורד', transcription: 'дéшборд / лӯах махванӣм', translation: 'торпедо, приборная панель', partOfSpeech: 'noun', gender: 'm', root: 'כ-ו-ן', lessonId: 0 },
      { id: 'cw_a_14', hebrew: 'תָּא מִטְעָן / בָּגָאז׳', hebrewPlain: 'תא מטען', transcription: 'та мит’áн / багáж', translation: 'багажник автомобиля', partOfSpeech: 'noun', gender: 'm', root: 'ט-ע-ן', lessonId: 0 },
      { id: 'cw_a_15', hebrew: 'גַּ׳נְטִים / חִשּׁוּקִים', hebrewPlain: 'גנטים', transcription: 'жáнтим / хишукӣм', translation: 'колёсные легкосплавные диски', partOfSpeech: 'noun', gender: 'm', root: 'ח-ש-ק', lessonId: 0 },
      { id: 'cw_a_16', hebrew: 'צְמִיגִים', hebrewPlain: 'צמיגים', transcription: 'цмигӣм', translation: 'автомобильные шины / резина', partOfSpeech: 'noun', gender: 'm', root: 'צ-מ-ג', lessonId: 0 },
      { id: 'cw_a_17', hebrew: 'טֶמְבּוֹר / פָּגּוֹשׁ', hebrewPlain: 'טמבור', transcription: 'тéмбор / пагóш', translation: 'передний или задний бампер', partOfSpeech: 'noun', gender: 'm', root: 'פ-ג-ש', lessonId: 0 },
      { id: 'cw_a_18', hebrew: 'מִכְסֵה מָנוֹעַ', hebrewPlain: 'מכסה מנוע', transcription: 'михсé манóа', translation: 'капот автомобиля', partOfSpeech: 'noun', gender: 'm', root: 'כ-ס-ה', lessonId: 0 },
      { id: 'cw_a_19', hebrew: 'גַּג הָרֶכֶב', hebrewPlain: 'גג הרכב', transcription: 'гаг hарéхев', translation: 'крыша автомобиля', partOfSpeech: 'noun', gender: 'm', root: 'ג-ג', lessonId: 0 },
      { id: 'cw_a_20', hebrew: 'סַף דֶּלֶת', hebrewPlain: 'סף דלת', transcription: 'саф дéлет', translation: 'порог дверного проёма машины', partOfSpeech: 'noun', gender: 'm', root: 'ס-פ-ף', lessonId: 0 },
      { id: 'cw_a_21', hebrew: 'פָּנָסִים', hebrewPlain: 'פנסים', transcription: 'панасӣм', translation: 'передние фары и задние фонари', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_a_22', hebrew: 'פִּיחַ וְאָבָק דְּרָכִים', hebrewPlain: 'פיח ואבק', transcription: 'пӣах веавáк драхим', translation: 'дорожная копоть, масляный налёт и пыль', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cw_a_23', hebrew: 'לִכְלוּךְ קָשֶׁה', hebrewPlain: 'לכלוך קשה', transcription: 'лихлӯх кашé', translation: 'застарелая въевшаяся грязь', partOfSpeech: 'noun', gender: 'm', root: 'ל-כ-ך', lessonId: 0 },
      { id: 'cw_a_24', hebrew: 'צִפּוּי קֵרָמִי', hebrewPlain: 'ציפוי קרמי', transcription: 'ципӯй керáми', translation: 'керамическое защитное покрытие кузова', partOfSpeech: 'noun', gender: 'm', root: 'צ-פ-ה', lessonId: 0 },
      { id: 'cw_a_25', hebrew: 'דִיטֵיְילִינְג מִקְצוֹעִי', hebrewPlain: 'דיטיילינג', transcription: 'дитейлинг микцоӣ', translation: 'профессиональный детейлинг и глубокий уход', partOfSpeech: 'noun', gender: 'm', root: 'ק-צ-ע', lessonId: 0 },
    ],
  },

  // ==========================================
  // АВТОМОЙКА — ДИАЛОГ С КЛИЕНТОМ
  // ==========================================
  {
    id: 'carwash-dialogue',
    title: 'Автомойка — Диалог с клиентом и водителем',
    titleHebrew: 'שִׂיחָה עִם לָקוֹחַ בִּשְׁטִיפַת רֶכֶב',
    description: '25 практических фраз: выбор типа мойки, инструкции перед туннелем (нейтраль, ручник), чистка ковриков, багажника и сдача авто.',
    level: 'all',
    category: 'carWash',
    icon: 'Sparkles',
    words: [
      { id: 'cw_d_1', hebrew: 'שָׁלוֹם, רַק שְׁטִיפָה חִיצוֹנִית אוֹ גַּם פְּנִים?', hebrewPlain: 'שלום, רק שטיפה חיצונית או גם פנים?', transcription: 'шалóм, рак штифá хицонӣт о гам пним?', translation: 'Здравствуйте! Только снаружи или салон тоже?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_2', hebrew: 'לְהַכְנִיס אֶת הָרֶכֶב לְנֵיטְרָל וְלֹא לִלְחוֹץ עַל הַבֶּלֶם', hebrewPlain: 'להכניס את הרכב לנייטרל ולא ללחוץ על הבלם', transcription: 'леhахнӣс эт hарéхев ленейтрáль велó лильхóц аль hабéлем', translation: 'Поставьте машину на нейтралку и не жмите тормоз', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_3', hebrew: 'נָא לְהוֹרִיד אֶת בֶּלֶם הַיָּד וּלְקַפֵּל מַרְאוֹת', hebrewPlain: 'נא להוריד את בלם היד ולקפל מראות', transcription: 'на леhорӣд эт бéлем hайáд улекапéль мар’óт', translation: 'Пожалуйста, опустите ручник и сложите боковые зеркала', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_4', hebrew: 'תִּסְגּוֹר אֶת כָּל הַחַלּוֹנוֹת עַד הַסּוֹף', hebrewPlain: 'תסגור את כל החלונות עד הסוף', transcription: 'тисгóр эт коль hахалонóт ад hасóф', translation: 'Закройте все окна плотно до упора', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_5', hebrew: 'לְרוֹקֵן אֶת הַבָּגָאז׳ אוֹ שֶׁאֵין צֹרֶךְ לִשְׁאוֹב שָׁם?', hebrewPlain: 'לרוקן את הבגאז׳ או שאין צורך לשאוב שם?', transcription: 'лерокéн эт hабагáж о шеэйн цóрех лиш’óв шам?', translation: 'Освободить багажник или там пылесосить не нужно?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_6', hebrew: 'לִשְׁטוֹף אֶת שְׁטִיחֵי הַגּוּמִי בְּמַיִם?', hebrewPlain: 'לשטוף את שטיחי הגומי במים?', transcription: 'лиштóф эт штихéй hагӯми бемáйим?', translation: 'Помыть резиновые коврики струёй воды?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_7', hebrew: 'יֵשׁ לָכֶם דְּבָרִים יְקָרֵי עֵרֶךְ בְּתוֹךְ הָרֶכֶב?', hebrewPlain: 'יש לכם דברים יקרי ערך בתוך הרכב?', transcription: 'йеш лахéм дварӣм йкрéй э́рех бетóх hарéхев?', translation: 'В салоне остались какие-то ценные вещи?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_8', hebrew: 'לָשִׂים לְךָ עֵץ רֵיחַ? אֵיזֶה רֵיחַ אַתָּה מַעֲדִיף?', hebrewPlain: 'לשים לך עץ ריח? איזה ריח אתה מעדיף?', transcription: 'ласӣм лехá эц рéйах? э́йзеh рéйах атá маадӣф?', translation: 'Повесить пахучку? Какой аромат предпочитаете?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_9', hebrew: 'רוֹצֶה גַּם הַבְרָקַת צְמִיגִים וְוַקְס חַם?', hebrewPlain: 'רוצה גם הברקת צמיגים ווקס חם?', transcription: 'роцé гам hавракáт цмигӣм вевáкс хам?', translation: 'Хотите также чернение шин и горячий воск?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_10', hebrew: 'יֵשׁ כֶּתֶם קָשֶׁה עַל הָרִפּוּד שֶׁדּוֹרֵשׁ חוֹמֶר מְיוּחָד', hebrewPlain: 'יש כתם קשה על הריפוד שדורש חומר מיוחד', transcription: 'йеш кéтем кашé аль hарипӯд шедорéш хóмер мейухáд', translation: 'На обивке сиденья стойкое пятно, нужна спецхимия', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_11', hebrew: 'נָא לְהַמְתִּין בַּחֲדַר הַהַמְתָּנָה הַמְּמוּזָג', hebrewPlain: 'נא להמתין בחדר ההמתנה הממוזג', transcription: 'на леhамтӣн бахадáр hаhамтанá hамемузáг', translation: 'Пожалуйста, подождите в зале ожидания с кондиционером', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_12', hebrew: 'תִּפְתַּח לִי אֶת תָּא הַמִּטְעָן בְּבַקָּשָׁה', hebrewPlain: 'תפתח לי את תא המטען בבקשה', transcription: 'тифтáх ли эт та hамит’áн бевакашá', translation: 'Откройте мне, пожалуйста, багажник', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_13', hebrew: 'נִשְׁאַר כֶּתֶם עַל הַשִּׁמְשָׁה, אֲנִי מְנַגֵּב שׁוּב', hebrewPlain: 'נשאר כתם על השמשה, אני מנגב שוב', transcription: 'ниш’áр кéтем аль hашимшá, анӣ менагéв шув', translation: 'Остался след на стекле, я протру его ещё раз', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_14', hebrew: 'הַמְּכוֹנִית שֶׁלְּךָ מוּכָנָה וּנְקִיָּה לַחֲלוּטִין!', hebrewPlain: 'המכונית שלך מוכנה ונקייה לחלוטין!', transcription: 'hамехонӣт шельхá муханá унекийá лахалутӣн!', translation: 'Ваша машина готова и сияет чистотой!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_15', hebrew: 'הַשְּׁטִיפָה לוֹקַחַת בְּעֵרֶךְ עֶשְׂרִים דַּקּוֹת', hebrewPlain: 'השטיפה לוקחת בערך עשרים דקות', transcription: 'hаштифá локáхат беэ́рех эсрӣм дакóт', translation: 'Мойка займёт около двадцати минут', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_16', hebrew: 'לְהַבְרִיק אֶת הַדֶּשְׁבּוֹרְד עִם תַּרְסִיס מַבְרִיק אוֹ מָאט?', hebrewPlain: 'להבריק את הדשבורד עם תרסיס מבריק או מאט?', transcription: 'леhаврӣк эт hадéшборд им тарсӣс маврӣк о мат?', translation: 'Натереть торпедо глянцевым или матовым средством?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_17', hebrew: 'תִּזָּהֵר כְּשֶׁאַתָּה יוֹצֵא, הָרִצְפָּה כָּאן רְטוּבָה וּמַחֲלִיקָה', hebrewPlain: 'תיזהר כשאתה יוצא, הרצפה כאן רטובה ומחליקה', transcription: 'тизаhéр кшеатá йоцé, hарицпá кан ретувá умахликá', translation: 'Осторожно при выходе, пол здесь мокрый и скользкий', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_18', hebrew: 'אֶפְשָׁר לְקַבֵּל כַּרְטִיס מָנוּי — כָּל שְׁטִיפָה עֲשִׂירִית חִנָּם', hebrewPlain: 'אפשר לקבל כרטיס מנוי — כל שטיפה עשירית חינם', transcription: 'эфшáр лекабéль картӣс манӯй — коль штифá асирӣт хинáм', translation: 'Можно оформить абонемент: каждая десятая мойка бесплатно', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_19', hebrew: 'הַאִם לִשְׁאוֹב אֶת כִּסְאוֹת הַבְּטִיחוּת שֶׁל הַיְּלָדִים?', hebrewPlain: 'האם לשאוב את כיסאות הבטיחות של הילדים?', transcription: 'hаӣм лиш’óв эт кис’óт hавтихӯт шель hайладӣм?', translation: 'Пропылесосить детские автомобильные кресла?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_20', hebrew: 'שְׁפֹךְ קְצָת מַסִּיר שֻׁמָּנִים עַל הַגַּ׳נְטִים', hebrewPlain: 'שפוך קצת מסיר שומנים על הג׳נטים', transcription: 'шфох кцат масӣр шуманӣм аль hажáнтим', translation: 'Побрызгай немного обезжиривателя на диски', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_21', hebrew: 'סַע קָדִימָה לְאַט עַד הַסִּימוּן הַיָּרֹק', hebrewPlain: 'סע קדימה לאט עד הסימון הירוק', transcription: 'са кадӣма леáт ад hасимӯн hайарóк', translation: 'Двигайтесь вперёд медленно до зелёного индикатора', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_22', hebrew: 'נִקִּינוּ גַּם אֶת סִפֵּי הַדְּלָתוֹת וּפְנִים מִכְסֵה הַדֶּלֶק', hebrewPlain: 'ניקינו גם את ספי הדלתות ופנים מכסה הדלק', transcription: 'никӣну гам эт сипéй hадлатóт уфнӣм михсé hадéлек', translation: 'Мы протёрли также дверные пороги и лючок бензобака', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_23', hebrew: 'תִּבְדּוֹק שֶׁשּׁוּם דָּבָר לֹא נִשְׁכַּח בַּתָּאִים הַצְּדָדִיִּים', hebrewPlain: 'תבדוק ששום דבר לא נשכח בתאים הצדדיים', transcription: 'тивдóк шешӯм давáр ло нишкáх батаӣм hацдадийӣм', translation: 'Проверьте, не забыто ли что-то в боковых карманах дверей', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_24', hebrew: 'הַתַּשְׁלוּם מִתְבַּצֵּעַ בַּקֻּפָּה בַּיְּצִיאָה', hebrewPlain: 'התשלום מתבצע בקופה ביציאה', transcription: 'hаташлу́м митбацéа бакупá байециá', translation: 'Оплата производится в кассе на выезде', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cw_d_25', hebrew: 'נְסִיעָה טוֹבָה וּבְטוּחָה בָּרֶכֶב הַמַּבְרִיק שֶׁלְּךָ!', hebrewPlain: 'נסיעה טובה ובטוחה ברכב המבריק שלך!', transcription: 'несиá товá увтухá барéхев hамаврӣк шельхá!', translation: 'Счастливого и безопасного пути на вашем чистом автомобиле!', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },
];
