/**
 * Профессиональные тематические словари
 *
 * ПРОФЕССИЯ: МАМА В ИЗРАИЛЕ (מִקְצוֹעַ: אִמָּא בְּיִשְׂרָאֵל)
 *
 * Колоды:
 *   1. mom-infant       — Типат Халав и малыш (25 слов)
 *   2. mom-pediatrician — Ребёнок заболел: У педиатра (25 слов)
 *   3. mom-pharmacy     — Детская аптека и лекарства (25 слов)
 *   4. mom-kindergarten — Ясли и детский сад (25 слов)
 *   5. mom-school       — Школа и продлёнка (25 слов)
 *   6. mom-whatsapp     — Родительский чат WhatsApp: фразы и шаблоны (25 выражений)
 *   7. mom-playground   — Детская площадка, кружки и споры (25 слов/фраз)
 */

import { ThematicDeck } from '@/types';

export const MOM_DECKS: ThematicDeck[] = [
  // ==========================================
  // 1. ТИПАТ ХАЛАВ И МАЛЫШ
  // ==========================================
  {
    id: 'mom-infant',
    title: 'Типат Халав и малыш',
    titleHebrew: 'טִיפַּת חָלָב וְתִינוֹקוֹת',
    description: '25 главных понятий первого года: патронаж, развитие, прививки, колики, грудное вскармливание, смеси, процентили веса и зубки.',
    level: 'all',
    category: 'mom',
    icon: 'Baby',
    words: [
      { id: 'mom_inf_1', hebrew: 'טִיפַּת חָלָב', hebrewPlain: 'טיפת חלב', transcription: 'типáт халáв', translation: 'детская консультация, патронаж', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_inf_2', hebrew: 'תִּינוֹק', hebrewPlain: 'תינוק', transcription: 'тинóк', translation: 'младенец, малыш', partOfSpeech: 'noun', gender: 'm', plural: 'תִּינוֹקוֹת', lessonId: 0 },
      { id: 'mom_inf_3', hebrew: 'חִיסּוּן', hebrewPlain: 'חיסון', transcription: 'хисӯн', translation: 'прививка, вакцина', partOfSpeech: 'noun', gender: 'm', root: 'ח-ס-ן', plural: 'חִיסּוּנִים', lessonId: 0 },
      { id: 'mom_inf_4', hebrew: 'מִשְׁקָל', hebrewPlain: 'משקל', transcription: 'мишкáль', translation: 'вес', partOfSpeech: 'noun', gender: 'm', root: 'ש-ק-ל', lessonId: 0 },
      { id: 'mom_inf_5', hebrew: 'גּוֹבַהּ', hebrewPlain: 'גובה', transcription: 'гóва', translation: 'рост, высота', partOfSpeech: 'noun', gender: 'm', root: 'ג-ב-הּ', lessonId: 0 },
      { id: 'mom_inf_6', hebrew: 'חִיתּוּל', hebrewPlain: 'חיתול', transcription: 'хитӯль', translation: 'подгузник, памперс', partOfSpeech: 'noun', gender: 'm', root: 'ח-ת-ל', plural: 'חִיתּוּלִים', lessonId: 0 },
      { id: 'mom_inf_7', hebrew: 'מוֹצֵץ', hebrewPlain: 'מוצץ', transcription: 'моцéц', translation: 'соска-пустышка', partOfSpeech: 'noun', gender: 'm', root: 'מ-צ-ץ', plural: 'מוֹצְצִים', lessonId: 0 },
      { id: 'mom_inf_8', hebrew: 'בַּקְבּוּק', hebrewPlain: 'בקבוק', transcription: 'бакбӯк', translation: 'детская бутылочка', partOfSpeech: 'noun', gender: 'm', plural: 'בַּקְבּוּקִים', lessonId: 0 },
      { id: 'mom_inf_9', hebrew: 'הַנְקָה', hebrewPlain: 'הנקה', transcription: 'hанкá', translation: 'грудное вскармливание', partOfSpeech: 'noun', gender: 'f', root: 'י-נ-ק', lessonId: 0 },
      { id: 'mom_inf_10', hebrew: 'לְהָנִיק', hebrewPlain: 'להניק', transcription: 'леhанӣк', translation: 'кормить грудью', partOfSpeech: 'verb', root: 'י-נ-ק', lessonId: 0 },
      { id: 'mom_inf_11', hebrew: 'מָטֶרְנָה', hebrewPlain: 'מטרנה', transcription: 'матéрна', translation: 'детская молочная смесь', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_inf_12', hebrew: 'גָּזִים', hebrewPlain: 'גזים', transcription: 'газӣм', translation: 'колики, газики у младенца', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_inf_13', hebrew: 'פְּלִיטָה', hebrewPlain: 'פליטה', transcription: 'плитá', translation: 'срыгивание', partOfSpeech: 'noun', gender: 'f', root: 'פ-ל-ט', lessonId: 0 },
      { id: 'mom_inf_14', hebrew: 'לִפְלוֹט', hebrewPlain: 'לפלוט', transcription: 'лифлóт', translation: 'срыгивать', partOfSpeech: 'verb', root: 'פ-ל-ט', lessonId: 0 },
      { id: 'mom_inf_15', hebrew: 'בְּקִיעַת שִׁינַּיִים', hebrewPlain: 'בקיעת שיניים', transcription: 'бкиáт шинáим', translation: 'прорезывание зубов', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_inf_16', hebrew: 'עֲגָלָה', hebrewPlain: 'עגלה', transcription: 'агалá', translation: 'детская коляска', partOfSpeech: 'noun', gender: 'f', plural: 'עֲגָלוֹת', lessonId: 0 },
      { id: 'mom_inf_17', hebrew: 'מִנְשָׂא', hebrewPlain: 'מנשא', transcription: 'минсá', translation: 'слинг, эрго-рюкзак', partOfSpeech: 'noun', gender: 'm', root: 'נ-ש-א', lessonId: 0 },
      { id: 'mom_inf_18', hebrew: 'מִטַּת תִּינוֹק', hebrewPlain: 'מיטת תינוק', transcription: 'митáт тинóк', translation: 'детская кроватка', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_inf_19', hebrew: 'סִינָר', hebrewPlain: 'סינר', transcription: 'синáр', translation: 'слюнявчик', partOfSpeech: 'noun', gender: 'm', plural: 'סִינָרִים', lessonId: 0 },
      { id: 'mom_inf_20', hebrew: 'לְהַחְלִיף חִיתּוּל', hebrewPlain: 'להחליף חיתול', transcription: 'леhахлӣф хитӯль', translation: 'менять подгузник', partOfSpeech: 'verb', root: 'ח-ל-ף', lessonId: 0 },
      { id: 'mom_inf_21', hebrew: 'לִבְכּוֹת', hebrewPlain: 'לבכות', transcription: 'ливкóт', translation: 'плакать', partOfSpeech: 'verb', root: 'ב-כ-י', lessonId: 0 },
      { id: 'mom_inf_22', hebrew: 'לְהַרְגִּיעַ', hebrewPlain: 'להרגיע', transcription: 'леhаргӣа', translation: 'успокаивать малыша', partOfSpeech: 'verb', root: 'ר-ג-ע', lessonId: 0 },
      { id: 'mom_inf_23', hebrew: 'לִשְׁקוֹל', hebrewPlain: 'לשקול', transcription: 'лишкóль', translation: 'взвешивать', partOfSpeech: 'verb', root: 'ש-ק-ל', lessonId: 0 },
      { id: 'mom_inf_24', hebrew: 'אֲחוּזוֹן', hebrewPlain: 'אחוזון', transcription: 'ахузóн', translation: 'процентиль (на графике роста/веса)', partOfSpeech: 'noun', gender: 'm', root: 'א-ח-ז', lessonId: 0 },
      { id: 'mom_inf_25', hebrew: 'בְּדִיקַת הִתְפַּתְּחוּת', hebrewPlain: 'בדיקת התפתחות', transcription: 'бдикáт hитпатхӯт', translation: 'проверка развития', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
    ],
  },

  // ==========================================
  // 2. РЕБЁНОК ЗАБОЛЕЛ: У ПЕДИАТРА
  // ==========================================
  {
    id: 'mom-pediatrician',
    title: 'Ребёнок заболел: У педиатра',
    titleHebrew: 'רוֹפֵא יְלָדִים וּמַחֲלוֹת',
    description: '25 понятий приёма у детского врача: жар, отит, кашель, сыпь, рвота, срочная очередь и справка о болезни.',
    level: 'all',
    category: 'mom',
    icon: 'Stethoscope',
    words: [
      { id: 'mom_ped_1', hebrew: 'רוֹפֵא יְלָדִים', hebrewPlain: 'רופא ילדים', transcription: 'рофé йеладӣм', translation: 'детский врач, педиатр', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_ped_2', hebrew: 'חוֹם', hebrewPlain: 'חום', transcription: 'хом', translation: 'температура, жар', partOfSpeech: 'noun', gender: 'm', root: 'ח-מ-ם', lessonId: 0 },
      { id: 'mom_ped_3', hebrew: 'מַדְחוֹם', hebrewPlain: 'מדחום', transcription: 'мадхóм', translation: 'градусник', partOfSpeech: 'noun', gender: 'm', root: 'ח-מ-ם', plural: 'מַדְחוֹמִים', lessonId: 0 },
      { id: 'mom_ped_4', hebrew: 'שִׁיעוּל', hebrewPlain: 'שיעול', transcription: 'шиӯль', translation: 'кашель', partOfSpeech: 'noun', gender: 'm', root: 'ש-ע-ל', lessonId: 0 },
      { id: 'mom_ped_5', hebrew: 'לְהִשְׁתַּעֵל', hebrewPlain: 'להשתעל', transcription: 'леhиштаэ́ль', translation: 'кашлять', partOfSpeech: 'verb', root: 'ש-ע-ל', lessonId: 0 },
      { id: 'mom_ped_6', hebrew: 'נַזֶּלֶת', hebrewPlain: 'נזלת', transcription: 'назéлет', translation: 'насморк', partOfSpeech: 'noun', gender: 'f', root: 'נ-ז-ל', lessonId: 0 },
      { id: 'mom_ped_7', hebrew: 'דַּלֶּקֶת אָזְנַיִם', hebrewPlain: 'דלקת אוזניים', transcription: 'далéкет ознáим', translation: 'отит, воспаление уха', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_ped_8', hebrew: 'דַּלֶּקֶת גָּרוֹן', hebrewPlain: 'דלקת גרון', transcription: 'далéкет гарóн', translation: 'ангина, воспаление горла', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_ped_9', hebrew: 'שִׁלְשׁוּל', hebrewPlain: 'שלשול', transcription: 'шильшӯль', translation: 'диарея, понос', partOfSpeech: 'noun', gender: 'm', root: 'ש-ל-ש-ל', lessonId: 0 },
      { id: 'mom_ped_10', hebrew: 'הֲקָאָה', hebrewPlain: 'הקאה', transcription: 'hакаá', translation: 'рвота', partOfSpeech: 'noun', gender: 'f', root: 'ק-י-א', plural: 'הֲקָאוֹת', lessonId: 0 },
      { id: 'mom_ped_11', hebrew: 'לְהָקִיא', hebrewPlain: 'להקיא', transcription: 'леhакӣ', translation: 'тошнить, рвать', partOfSpeech: 'verb', root: 'ק-י-א', lessonId: 0 },
      { id: 'mom_ped_12', hebrew: 'וִירוּס בֶּטֶן', hebrewPlain: 'וירוס בטן', transcription: 'вӣрус бéтен', translation: 'желудочный вирус, ротавирус', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_ped_13', hebrew: 'פְּרִיחָה', hebrewPlain: 'פריחה', transcription: 'прихá', translation: 'сыпь', partOfSpeech: 'noun', gender: 'f', root: 'פ-ר-ח', lessonId: 0 },
      { id: 'mom_ped_14', hebrew: 'כְּאֵב בֶּטֶן', hebrewPlain: 'כאב בטן', transcription: 'кеэ́в бéтен', translation: 'боль в животе', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_ped_15', hebrew: 'כְּאֵב רֹאשׁ', hebrewPlain: 'כאב ראש', transcription: 'кеэ́в рош', translation: 'головная боль', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_ped_16', hebrew: 'מִשְׁטַח גָּרוֹן', hebrewPlain: 'משטח גרון', transcription: 'миштáх гарóн', translation: 'мазок из горла', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_ped_17', hebrew: 'אִישׁוּר מַחֲלָה', hebrewPlain: 'אישור מחלה', transcription: 'ишӯр махалá', translation: 'справка о болезни (для сада/школы)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_ped_18', hebrew: 'תּוֹר דָּחוּף', hebrewPlain: 'תור דחוף', transcription: 'тор дахӯф', translation: 'срочная очередь к врачу', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_ped_19', hebrew: 'מוֹקֵד לַיְלָה', hebrewPlain: 'מוקד לילה', transcription: 'мокéд лáйла', translation: 'вечерний пункт неотложки (Терем)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_ped_20', hebrew: 'חֲדַר מִיּוּן', hebrewPlain: 'חדר מיון', transcription: 'хадáр мийӯн', translation: 'приёмный покой больницы', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_ped_21', hebrew: 'לִבְדּוֹק', hebrewPlain: 'לבדוק', transcription: 'ливдóк', translation: 'осматривать, проверять', partOfSpeech: 'verb', root: 'ב-ד-ק', lessonId: 0 },
      { id: 'mom_ped_22', hebrew: 'לִבְלוֹעַ', hebrewPlain: 'לבלוע', transcription: 'ливлóа', translation: 'глотать', partOfSpeech: 'verb', root: 'ב-ל-ע', lessonId: 0 },
      { id: 'mom_ped_23', hebrew: 'לִמְדּוֹד חוֹם', hebrewPlain: 'למדוד חום', transcription: 'лимдóд хом', translation: 'измерять температуру', partOfSpeech: 'verb', root: 'מ-ד-ד', lessonId: 0 },
      { id: 'mom_ped_24', hebrew: 'לְהַדְבִּיק', hebrewPlain: 'להדביק', transcription: 'леhадбӣк', translation: 'заражать', partOfSpeech: 'verb', root: 'ד-ב-ק', lessonId: 0 },
      { id: 'mom_ped_25', hebrew: 'אַפָּתִי', hebrewPlain: 'אפתי', transcription: 'апа́ти', translation: 'вялый, апатичный (о ребёнке)', partOfSpeech: 'adjective', gender: 'm', lessonId: 0 },
    ],
  },

  // ==========================================
  // 3. ДЕТСКАЯ АПТЕКА И ЛЕКАРСТВА
  // ==========================================
  {
    id: 'mom-pharmacy',
    title: 'Детская аптека и лекарства',
    titleHebrew: 'בֵּית מִרְקַחַת וּתְרוּפוֹת לִילָדִים',
    description: '25 терминов аптеки: сиропы, свечи, дозировка по весу, пластыри, ингаляции, физраствор и рецепты.',
    level: 'all',
    category: 'mom',
    icon: 'Pill',
    words: [
      { id: 'mom_phm_1', hebrew: 'בֵּית מִרְקַחַת', hebrewPlain: 'בית מרקחת', transcription: 'бейт миркáхат', translation: 'аптека', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_phm_2', hebrew: 'רוֹקֵחַ', hebrewPlain: 'רוקח', transcription: 'рокéах', translation: 'фармацевт, провизор', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_phm_3', hebrew: 'תְּרוּפָה', hebrewPlain: 'תרופה', transcription: 'труфá', translation: 'лекарство', partOfSpeech: 'noun', gender: 'f', plural: 'תְּרוּפוֹת', lessonId: 0 },
      { id: 'mom_phm_4', hebrew: 'מִרְשָׁם', hebrewPlain: 'מרשם', transcription: 'миршáм', translation: 'рецепт врача', partOfSpeech: 'noun', gender: 'm', root: 'ר-ש-ם', plural: 'מִרְשָׁמִים', lessonId: 0 },
      { id: 'mom_phm_5', hebrew: 'סִירוֹפּ', hebrewPlain: 'סירופ', transcription: 'сирóп', translation: 'лечебный сироп', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_phm_6', hebrew: 'נֵרוֹת לְהוֹרָדַת חוֹם', hebrewPlain: 'נרות להורדת חום', transcription: 'нерóт ле-hорадáт хом', translation: 'жаропонижающие свечи', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_phm_7', hebrew: 'אֲקָמוֹלִי', hebrewPlain: 'אקמולי', transcription: 'акамóли', translation: 'Акамоли (детский парацетамол)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_phm_8', hebrew: 'נוּרוֹפֶן לִילָדִים', hebrewPlain: 'נורופן לילדים', transcription: 'нурóфен ле-йеладӣм', translation: 'детский Нурофен (ибупрофен)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_phm_9', hebrew: 'מַזְרֵק מִינּוּן', hebrewPlain: 'מזרק מינון', transcription: 'мазрéк минӯн', translation: 'шприц-дозатор (для детского сиропа)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_phm_10', hebrew: 'מִינּוּן', hebrewPlain: 'מינון', transcription: 'минӯн', translation: 'дозировка', partOfSpeech: 'noun', gender: 'm', root: 'מ-נ-ה', lessonId: 0 },
      { id: 'mom_phm_11', hebrew: 'לְפִי מִשְׁקָל', hebrewPlain: 'לפי משקל', transcription: 'лефӣ мишкáль', translation: 'по весу (ребёнка)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_phm_12', hebrew: 'טִיפּוֹת אָזְנַיִם', hebrewPlain: 'טיפות אוזניים', transcription: 'типóт ознáим', translation: 'ушные капли', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_phm_13', hebrew: 'טִיפּוֹת עֵינַיִם', hebrewPlain: 'טיפות עיניים', transcription: 'типóт эйнáим', translation: 'глазные капли', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_phm_14', hebrew: 'מֵי מֶלַח', hebrewPlain: 'מי מלח', transcription: 'мей мéлах', translation: 'физраствор (для носа и ингаляций)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_phm_15', hebrew: 'מַשְׁאֵף / אִינְהַלַצְיָה', hebrewPlain: 'משאף / אינהלציה', transcription: 'маш’éф / инhалáция', translation: 'ингалятор / ингаляция', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_phm_16', hebrew: 'פְּלַסְטֶר', hebrewPlain: 'פלסטר', transcription: 'плáстер', translation: 'лейкопластырь', partOfSpeech: 'noun', gender: 'm', plural: 'פְּלַסְטֶרִים', lessonId: 0 },
      { id: 'mom_phm_17', hebrew: 'תַּחְבּוֹשֶׁת', hebrewPlain: 'תחבושת', transcription: 'тахбóшет', translation: 'бинт, повязка', partOfSpeech: 'noun', gender: 'f', root: 'ח-ב-ש', lessonId: 0 },
      { id: 'mom_phm_18', hebrew: 'מִשְׁחָה', hebrewPlain: 'משחה', transcription: 'мишхá', translation: 'лечебная мазь, крем', partOfSpeech: 'noun', gender: 'f', root: 'מ-ש-ח', lessonId: 0 },
      { id: 'mom_phm_19', hebrew: 'כַּדּוּר', hebrewPlain: 'כדור', transcription: 'кадӯр', translation: 'таблетка, пилюля', partOfSpeech: 'noun', gender: 'm', plural: 'כַּדּוּרִים', lessonId: 0 },
      { id: 'mom_phm_20', hebrew: 'אַנְטִיבִּיאוֹטִיקָה', hebrewPlain: 'אנטיביוטיקה', transcription: 'антибиóтика', translation: 'антибиотики', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_phm_21', hebrew: 'תוֹקֶף', hebrewPlain: 'תוקף', transcription: 'тóкеф', translation: 'срок годности (лекарства)', partOfSpeech: 'noun', gender: 'm', root: 'ת-ק-ף', lessonId: 0 },
      { id: 'mom_phm_22', hebrew: 'תּוֹפְעוֹת לְוַואי', hebrewPlain: 'תופעות לוואי', transcription: 'тофаóт левáй', translation: 'побочные эффекты', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_phm_23', hebrew: 'לִבְלוֹעַ כַּדּוּר', hebrewPlain: 'לבלוע כדור', transcription: 'ливлóа кадӯр', translation: 'проглотить таблетку', partOfSpeech: 'verb', lessonId: 0 },
      { id: 'mom_phm_24', hebrew: 'לִמְרוֹחַ מִשְׁחָה', hebrewPlain: 'למרוח משחה', transcription: 'лимрóах мишхá', translation: 'намазать мазь', partOfSpeech: 'verb', root: 'מ-ר-ח', lessonId: 0 },
      { id: 'mom_phm_25', hebrew: 'לְטַפְטֵף', hebrewPlain: 'לטפטף', transcription: 'летафтéф', translation: 'капать (капли в нос/уши)', partOfSpeech: 'verb', root: 'ט-פ-ט-ף', lessonId: 0 },
    ],
  },

  // ==========================================
  // 4. ЯСЛИ И ДЕТСКИЙ САД (МАОН И ГАН)
  // ==========================================
  {
    id: 'mom-kindergarten',
    title: 'Ясли и детский сад',
    titleHebrew: 'מָעוֹן וְגַן יְלָדִים',
    description: '25 понятий детского сада глазами мамы: продлёнка, сменка, ланчбокс, адаптация, горшок, пятничная церемония и тихий час.',
    level: 'all',
    category: 'mom',
    icon: 'Sparkles',
    words: [
      { id: 'mom_kg_1', hebrew: 'מָעוֹן', hebrewPlain: 'מעון', transcription: 'маóн', translation: 'ясли (до 3 лет)', partOfSpeech: 'noun', gender: 'm', root: 'ע-ו-ן', lessonId: 0 },
      { id: 'mom_kg_2', hebrew: 'גַּנֶּנֶת', hebrewPlain: 'גננת', transcription: 'ганéнет', translation: 'воспитательница детского сада', partOfSpeech: 'noun', gender: 'f', root: 'ג-נ-ן', lessonId: 0 },
      { id: 'mom_kg_3', hebrew: 'סַיַּעַת', hebrewPlain: 'סייעת', transcription: 'сайáат', translation: 'помощница воспитательницы, нянечка', partOfSpeech: 'noun', gender: 'f', root: 'ס-י-ע', lessonId: 0 },
      { id: 'mom_kg_4', hebrew: 'צַהֲרוֹן', hebrewPlain: 'צהרון', transcription: 'цаhарóн', translation: 'продлёнка после сада (до 16:30/17:00)', partOfSpeech: 'noun', gender: 'm', root: 'צ-ה-ר', lessonId: 0 },
      { id: 'mom_kg_5', hebrew: 'אֲרוּחַת עֶשֶׂר', hebrewPlain: 'ארוחת עשר', transcription: 'арухáт éсер', translation: 'ланчбокс в 10:00 (второй завтрак в саду)', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_kg_6', hebrew: 'קוּפְסַת אוֹכֶל', hebrewPlain: 'קופסת אוכל', transcription: 'куфсáт óхель', translation: 'коробочка для еды, ланчбокс', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_kg_7', hebrew: 'בְּגָדִים לְהַחְלָפָה', hebrewPlain: 'בגדים להחלפה', transcription: 'бгадӣм ле-hахлафá', translation: 'сменная одежда', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_kg_8', hebrew: 'מִפְגָּשׁ', hebrewPlain: 'מפגש', transcription: 'мифгáш', translation: 'утренний круг / ритуал приветствия', partOfSpeech: 'noun', gender: 'm', root: 'פ-ג-ש', lessonId: 0 },
      { id: 'mom_kg_9', hebrew: 'אַרְגַּז חוֹל', hebrewPlain: 'ארגז חול', transcription: 'аргáз холь', translation: 'песочница', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_kg_10', hebrew: 'מַגְלֵשָׁה', hebrewPlain: 'מגלשה', transcription: 'маглешá', translation: 'детская горка', partOfSpeech: 'noun', gender: 'f', root: 'ג-ל-ש', lessonId: 0 },
      { id: 'mom_kg_11', hebrew: 'נַדְנֵדָה', hebrewPlain: 'נדנדה', transcription: 'наднедá', translation: 'качели', partOfSpeech: 'noun', gender: 'f', root: 'נ-ד-ד', lessonId: 0 },
      { id: 'mom_kg_12', hebrew: 'גְּמִילָה', hebrewPlain: 'גמילה', transcription: 'гмилá', translation: 'приучение к горшку / отучение от соски', partOfSpeech: 'noun', gender: 'f', root: 'ג-מ-ל', lessonId: 0 },
      { id: 'mom_kg_13', hebrew: 'סִיר לִילָדִים', hebrewPlain: 'סיר לילדים', transcription: 'сир ле-йеладӣм', translation: 'детский горшок', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_kg_14', hebrew: 'אַבָּא / אִמָּא שֶׁל שַׁבָּת', hebrewPlain: 'אבא / אמא של שבת', transcription: 'áба / ӣма шель шабáт', translation: 'дежурный ребёнок Шаббата', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_kg_15', hebrew: 'קַבָּלַת שַׁבָּת', hebrewPlain: 'קבלת שבת', transcription: 'кабалáт шабáт', translation: 'пятничная церемония встречи Шаббата', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_kg_16', hebrew: 'שְׂמִיכִי', hebrewPlain: 'שמיכי', transcription: 'смӣхи', translation: 'любимое одеяльце-комфортер', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_kg_17', hebrew: 'לֶאֱסוֹף מֵהַגַּן', hebrewPlain: 'לאסוף מהגן', transcription: 'леэсóф ме-hагáн', translation: 'забирать ребёнка из сада', partOfSpeech: 'verb', root: 'א-ס-ף', lessonId: 0 },
      { id: 'mom_kg_18', hebrew: 'לְהִסְתַּגֵּל', hebrewPlain: 'להסתגל', transcription: 'леhистагéль', translation: 'привыкать, адаптироваться в саду', partOfSpeech: 'verb', root: 'ס-ג-ל', lessonId: 0 },
      { id: 'mom_kg_19', hebrew: 'לְהִיפָּרֵד', hebrewPlain: 'להיפרד', transcription: 'леhипарéд', translation: 'прощаться, расставаться утром', partOfSpeech: 'verb', root: 'פ-ר-ד', lessonId: 0 },
      { id: 'mom_kg_20', hebrew: 'לְהִתְגַּעְגֵּעַ', hebrewPlain: 'להתגעגע', transcription: 'леhитгаагéа', translation: 'скучать по маме', partOfSpeech: 'verb', root: 'ג-ע-ג-ע', lessonId: 0 },
      { id: 'mom_kg_21', hebrew: 'לִנְשׁוֹךְ', hebrewPlain: 'לנשוך', transcription: 'линшóх', translation: 'кусаться (в яслях)', partOfSpeech: 'verb', root: 'נ-ש-ך', lessonId: 0 },
      { id: 'mom_kg_22', hebrew: 'לַחֲלוֹק צַעֲצוּעִים', hebrewPlain: 'לחלוק צעצועים', transcription: 'лахлóк цаацуӣм', translation: 'делиться игрушками', partOfSpeech: 'verb', root: 'ח-ל-ק', lessonId: 0 },
      { id: 'mom_kg_23', hebrew: 'לִפְרוֹק אֶנֶרְגְּיָה', hebrewPlain: 'לפרוק אנרגיה', transcription: 'лифрóк энéргия', translation: 'выплеснуть энергию во дворе', partOfSpeech: 'verb', root: 'פ-ר-ק', lessonId: 0 },
      { id: 'mom_kg_24', hebrew: 'יוֹם קָצָר', hebrewPlain: 'יום קצר', transcription: 'йом кацáр', translation: 'короткий день (пятница или канун праздника)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_kg_25', hebrew: 'שְׁנַ"צ', hebrewPlain: 'שנ"צ', transcription: 'шнац', translation: 'дневной сон (тихий час)', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
    ],
  },

  // ==========================================
  // 5. ШКОЛА И ПРОДЛЁНКА (БЕЙТ СЕФЕР)
  // ==========================================
  {
    id: 'mom-school',
    title: 'Школа и продлёнка',
    titleHebrew: 'בֵּית סֵפֶר וְצַהֲרוֹן',
    description: '25 понятий школы: первый класс, ранец, пенал, тетради, классная руководительница, домашка, поход и родительское собрание.',
    level: 'all',
    category: 'mom',
    icon: 'School',
    words: [
      { id: 'mom_sch_1', hebrew: 'בֵּית סֵפֶר', hebrewPlain: 'בית ספר', transcription: 'бейт сéфер', translation: 'школа', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_sch_2', hebrew: 'כִּיתָּה א\'', hebrewPlain: 'כיתה א\'', transcription: 'китá áлеф', translation: 'первый класс', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_sch_3', hebrew: 'מוֹרָה', hebrewPlain: 'מורה', transcription: 'морá', translation: 'учительница', partOfSpeech: 'noun', gender: 'f', root: 'י-ר-ה', lessonId: 0 },
      { id: 'mom_sch_4', hebrew: 'מְחַנֶּכֶת כִּיתָּה', hebrewPlain: 'מחנכת כיתה', transcription: 'механéхет китá', translation: 'классная руководительница', partOfSpeech: 'noun', gender: 'f', root: 'ח-נ-ך', lessonId: 0 },
      { id: 'mom_sch_5', hebrew: 'יַלְקוּט', hebrewPlain: 'ילקוט', transcription: 'яльку́т', translation: 'школьный ранец, рюкзак', partOfSpeech: 'noun', gender: 'm', plural: 'יַלְקוּטִים', lessonId: 0 },
      { id: 'mom_sch_6', hebrew: 'קַלְמָר', hebrewPlain: 'קלמר', transcription: 'кальмáр', translation: 'пенал', partOfSpeech: 'noun', gender: 'm', plural: 'קַלְמָרִים', lessonId: 0 },
      { id: 'mom_sch_7', hebrew: 'מַחְבֶּרֶת שׁוּרוֹת', hebrewPlain: 'מחברת שורות', transcription: 'махбéрет шурóт', translation: 'тетрадь в линейку', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_sch_8', hebrew: 'מַחְבֶּרֶת מִשְׁבָּצוֹת', hebrewPlain: 'מחברת משבצות', transcription: 'махбéрет мишбацóт', translation: 'тетрадь в клетку', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_sch_9', hebrew: 'חוֹבֶרֶת עֲבוֹדָה', hebrewPlain: 'חוברת עבודה', transcription: 'ховéрет аводá', translation: 'рабочая тетрадь, пропись', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_sch_10', hebrew: 'סֵפֶר לִימּוּד', hebrewPlain: 'ספר לימוד', transcription: 'сéфер лимӯд', translation: 'учебник', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_sch_11', hebrew: 'שִׁיעוּרֵי בַּיִת', hebrewPlain: 'שיעורי בית', transcription: 'шиурéй бáйит', translation: 'домашнее задание', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_sch_12', hebrew: 'הַפְסָקָה גְּדוֹלָה', hebrewPlain: 'הפסקה גדולה', transcription: 'hафсакá гдолá', translation: 'большая перемена', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_sch_13', hebrew: 'טִיּוּל שְׁנָתִי', hebrewPlain: 'טיול שנתי', transcription: 'тийӯль шнатӣ', translation: 'школьный годовой поход / экскурсия', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_sch_14', hebrew: 'אֲסֵפַת הוֹרִים', hebrewPlain: 'אספת הורים', transcription: 'асефáт hорӣм', translation: 'родительское собрание', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_sch_15', hebrew: 'תְּעוּדָה', hebrewPlain: 'תעודה', transcription: 'теудá', translation: 'табель успеваемости', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_sch_16', hebrew: 'הַסָּעוֹת', hebrewPlain: 'הסעות', transcription: 'hасаóт', translation: 'школьная развозка, автобус', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_sch_17', hebrew: 'חֵרֶם', hebrewPlain: 'חרם', transcription: 'хéрем', translation: 'бойкот, буллинг', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_sch_18', hebrew: 'צִיוּן', hebrewPlain: 'ציון', transcription: 'цийӯн', translation: 'оценка, отметка', partOfSpeech: 'noun', gender: 'm', root: 'צ-י-ן', plural: 'צִיּוּנִים', lessonId: 0 },
      { id: 'mom_sch_19', hebrew: 'מִבְחָן', hebrewPlain: 'מבחן', transcription: 'мивхáн', translation: 'контрольная работа, экзамен', partOfSpeech: 'noun', gender: 'm', root: 'ב-ח-ן', plural: 'מִבְחָנִים', lessonId: 0 },
      { id: 'mom_sch_20', hebrew: 'חַבְרוּתָא', hebrewPlain: 'חברותא', transcription: 'хаврӯта', translation: 'компания друзей, круг сверстников', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_sch_21', hebrew: 'לְהָכִין שִׁיעוּרִים', hebrewPlain: 'להכין שיעורים', transcription: 'леhахӣн шиурӣм', translation: 'делать уроки', partOfSpeech: 'verb', lessonId: 0 },
      { id: 'mom_sch_22', hebrew: 'לְהִשְׁתַּלֵּב', hebrewPlain: 'להשתלב', transcription: 'леhишталéв', translation: 'вливаться в коллектив, интегрироваться', partOfSpeech: 'verb', root: 'ש-ל-ב', lessonId: 0 },
      { id: 'mom_sch_23', hebrew: 'לְהַקְשִׁיב', hebrewPlain: 'להקשיב', transcription: 'леhакшӣв', translation: 'слушать учительницу', partOfSpeech: 'verb', root: 'ק-ש-ב', lessonId: 0 },
      { id: 'mom_sch_24', hebrew: 'לְהַצְלִיחַ', hebrewPlain: 'להצליח', transcription: 'леhацлӣах', translation: 'преуспевать, справляться с учёбой', partOfSpeech: 'verb', root: 'צ-ל-ח', lessonId: 0 },
      { id: 'mom_sch_25', hebrew: 'צִלְצוּל', hebrewPlain: 'צלצול', transcription: 'цильцӯль', translation: 'школьный звонок', partOfSpeech: 'noun', gender: 'm', root: 'צ-ל-ל', lessonId: 0 },
    ],
  },

  // ==========================================
  // 6. РОДИТЕЛЬСКИЙ ЧАТ WHATSAPP
  // ==========================================
  {
    id: 'mom-whatsapp',
    title: 'Родительский чат WhatsApp',
    titleHebrew: 'קְבוּצַת וָואטְסְאַפּ שֶׁל הַהוֹרִים',
    description: '25 выражений и шаблонов для молниеносного общения в чате: родительский комитет, сбор денег, потерянные вещи, болезни и поздравления.',
    level: 'all',
    category: 'mom',
    icon: 'MessageCircle',
    words: [
      { id: 'mom_wa_1', hebrew: 'וַעַד הוֹרִים', hebrewPlain: 'ועד הורים', transcription: 'вáад hорӣм', translation: 'родительский комитет', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_wa_2', hebrew: 'תִּזְכּוֹרֶת', hebrewPlain: 'תזכורת', transcription: 'тизкóрет', translation: 'напоминание', partOfSpeech: 'noun', gender: 'f', root: 'ז-כ-ר', lessonId: 0 },
      { id: 'mom_wa_3', hebrew: 'אִיסּוּף כְּסָפִים', hebrewPlain: 'איסוף כספים', transcription: 'исӯф ксафӣм', translation: 'сбор денег', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_wa_4', hebrew: 'מַתָּנָה לַצֶּוֶות', hebrewPlain: 'מתנה לצוות', transcription: 'матанá ла-цéвет', translation: 'подарок воспитателям / учителям', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_wa_5', hebrew: 'יוֹם הוּלֶּדֶת כִּיתָּתִי', hebrewPlain: 'יום הולדת כיתתי', transcription: 'йом hулéдет китатӣ', translation: 'день рождения всего класса/группы', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_wa_6', hebrew: 'אִישּׁוּר הַגָּעָה', hebrewPlain: 'אישור הגעה', transcription: 'ишӯр hагаá', translation: 'подтверждение присутствия (RSVP)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_wa_7', hebrew: 'טְרֶמְפּ', hebrewPlain: 'טרמפ', transcription: 'тремп', translation: 'попутка, подвезти чужого ребёнка', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_wa_8', hebrew: 'אֲבֵידָה וּמְצִיאָה', hebrewPlain: 'אבידה ומציאה', transcription: 'авейдá у-мециá', translation: 'потерянные и найденные вещи', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_wa_9', hebrew: 'חוּלְצָה לְבָנָה', hebrewPlain: 'חולצה לבנה', transcription: 'хульцá леванá', translation: 'белая футболка (на праздник / церемонию)', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_wa_10', hebrew: 'הַיֶּלֶד חוֹלֶה וְלֹא יַגִּיעַ הַיּוֹם', hebrewPlain: 'הילד חולה ולא יגיע היום', transcription: 'hайéлед холé ве-ло ягӣа hайóм', translation: 'Ребёнок заболел и сегодня не придёт', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_11', hebrew: 'הוּא יַגִּיעַ בְּאִיחוּר שֶׁל חֲצִי שָׁעָה', hebrewPlain: 'הוא יגיע באיחור של חצי שעה', transcription: 'hу ягӣа бе-ихӯр шель хацӣ шаá', translation: 'Он припозднится на полчаса', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_12', hebrew: 'סַבְתָּא תֶּאֱסוֹף אוֹתוֹ הַיּוֹם', hebrewPlain: 'סבתא תאסוף אותו היום', transcription: 'сáвта теэсóф отó hайóм', translation: 'Бабушка заберёт его сегодня', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_13', hebrew: 'מִישֶׁהוּ מָצָא קַלְמָר כָּחוֹל?', hebrewPlain: 'מישהו מצא קלמר כחול?', transcription: 'мӣшеhу мацá кальмáр кахóль?', translation: 'Кто-нибудь нашёл синий пенал?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_14', hebrew: 'הַיְלָדִים צְרִיכִים לָבוֹא בְּחוּלְצָה לְבָנָה?', hebrewPlain: 'הילדים צריכים לבוא בחולצה לבנה?', transcription: 'hайеладӣм црихӣм лавó бе-хульцá леванá?', translation: 'Детям нужно прийти в белой футболке?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_15', hebrew: 'מָה צָרִיךְ לְהָבִיא לִפְעִילוּת מָחָר?', hebrewPlain: 'מה צריך להביא לפעילות מחר?', transcription: 'ма царӣх леhавӣ ли-феилӯт махáр?', translation: 'Что нужно принести на завтрашнее мероприятие?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_16', hebrew: 'יֵשׁ לְמִישֶׁהוּ מָקוֹם בָּרֶכֶב לַטְרֶמְפּ?', hebrewPlain: 'יש למישהו מקום ברכב לטרמפ?', transcription: 'йеш ле-мӣшеhу макóм ба-рéхев ла-тремп?', translation: 'Есть у кого-то место в машине подвезти?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_17', hebrew: 'אֶפְשָׁר לִשְׁלוֹחַ אֶת הַקִּישׁוּר לַפֵּייבּוֹקְס?', hebrewPlain: 'אפשר לשלוח את הקישור לפייבוקס?', transcription: 'эфшáр лишлóах эт hа-кишӯр ла-Paybox?', translation: 'Можно отправить ссылку на PayBox?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_18', hebrew: 'רְפוּאָה שְׁלֵמָה וְהַחְלָמָה מְהִירָה!', hebrewPlain: 'רפואה שלמה והחלמה מהירה!', transcription: 'рефуá шлемá ве-hахламá меhирá!', translation: 'Скорейшего выздоровления и поправки!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_19', hebrew: 'מַזָּל טוֹב עַד 120!', hebrewPlain: 'מזל טוב עד 120!', transcription: 'мазáль тов ад мéа ве-эсрӣм!', translation: 'С днём рождения, до 120 лет!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_20', hebrew: 'תּוֹדָה רַבָּה לְכָל הַצֶּוֶות הַנִּפְלָא!', hebrewPlain: 'תודה רבה לכל הצוות הנפלא!', transcription: 'тодá рабá ле-холь hа-цéвет hа-нифлá!', translation: 'Огромное спасибо всему замечательному коллективу!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_21', hebrew: 'שַׁבָּת שָׁלוֹם וּמְבוֹרֶכֶת לְכָל הַמִּשְׁפָּחוֹת!', hebrewPlain: 'שבת שלום ומבורכת לכל המשפחות!', transcription: 'шабáт шалóм у-меворéхет ле-холь hа-мишпахóт!', translation: 'Мирного и благословенного Шаббата всем семьям!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_22', hebrew: 'נָא לְאַשֵׁר הַגָּעָה עַד יוֹם חֲמִישִׁי', hebrewPlain: 'נא לאשר הגעה עד יום חמישי', transcription: 'на ле-ашéр hагаá ад йом хамӣшӣ', translation: 'Пожалуйста, подтвердите присутствие до четверга', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_23', hebrew: 'נִשְׁאַר מְעִיל כָּחוֹל בַּכִּיתָּה', hebrewPlain: 'נשאר מעיל כחול בכיתה', transcription: 'нишъáр меӣль кахóль ба-китá', translation: 'Синяя куртка осталась в классе', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_24', hebrew: 'מִי מֵבִיא פֵּירוֹת לְיוֹם שִׁישִׁי?', hebrewPlain: 'מי מביא פירות ליום שישי?', transcription: 'ми мевӣ пейрóт ле-йом шишӣ?', translation: 'Кто приносит фрукты на пятницу?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_wa_25', hebrew: 'שָׁבוּעַ טוֹב וּמוּצְלָח לְכוּלָּם!', hebrewPlain: 'שבוע טוב ומוצלח לכולם!', transcription: 'шавӯа тов у-муцлáх ле-хулáм!', translation: 'Хорошей и успешной недели всем!', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },

  // ==========================================
  // 7. ДЕТСКАЯ ПЛОЩАДКА И КРУЖКИ
  // ==========================================
  {
    id: 'mom-playground',
    title: 'Детская площадка и кружки',
    titleHebrew: 'גִּינַת שַׁעֲשׁוּעִים וְחוּגִים',
    description: '25 понятий детской площадки и досуга: горки, качели, очередь, кружки (плавание, дзюдо, танцы), самокат, шлем и детские споры.',
    level: 'all',
    category: 'mom',
    icon: 'Smile',
    words: [
      { id: 'mom_pg_1', hebrew: 'גִּינַת שַׁעֲשׁוּעִים', hebrewPlain: 'גינת שעשועים', transcription: 'гинáт шаашуӣм', translation: 'детская площадка, сквер', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_pg_2', hebrew: 'מַתְנָ"ס', hebrewPlain: 'מתנ"ס', transcription: 'матнáс', translation: 'районный дом культуры, досуговый центр', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_pg_3', hebrew: 'חוּג', hebrewPlain: 'חוג', transcription: 'хуг', translation: 'кружок, секция', partOfSpeech: 'noun', gender: 'm', root: 'ח-ו-ג', plural: 'חוּגִים', lessonId: 0 },
      { id: 'mom_pg_4', hebrew: 'חוּג שְׂחִיָּיה', hebrewPlain: 'חוג שחייה', transcription: 'хуг схийá', translation: 'кружок плавания', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_pg_5', hebrew: 'חוּג ג\'וּדוֹ', hebrewPlain: 'חוג ג\'ודו', transcription: 'хуг джӯдо', translation: 'секция дзюдо / единоборств', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_pg_6', hebrew: 'חוּג בַּלֶט', hebrewPlain: 'חוג בלט', transcription: 'хуг балéт', translation: 'кружок балета / танцев', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_pg_7', hebrew: 'קוּרְקִינֶט', hebrewPlain: 'קורקינט', transcription: 'куркинéт', translation: 'детский самокат', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_pg_8', hebrew: 'אוֹפַנַּיִם', hebrewPlain: 'אופניים', transcription: 'офнáим', translation: 'велосипед', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_pg_9', hebrew: 'קַסְדָּה', hebrewPlain: 'קסדה', transcription: 'касдá', translation: 'защитный шлем', partOfSpeech: 'noun', gender: 'f', plural: 'קַסְדוֹת', lessonId: 0 },
      { id: 'mom_pg_10', hebrew: 'מָגֵנֵי בִּרְכַּיִם', hebrewPlain: 'מגיני ברכיים', transcription: 'магенéй биркáим', translation: 'наколенники', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_pg_11', hebrew: 'תּוֹר', hebrewPlain: 'תור', transcription: 'тор', translation: 'очередь', partOfSpeech: 'noun', gender: 'm', plural: 'תּוֹרוֹת', lessonId: 0 },
      { id: 'mom_pg_12', hebrew: 'מַגְלֵשָׁה עֲנָקִית', hebrewPlain: 'מגלשה ענקית', transcription: 'маглешá анакӣт', translation: 'большая горка', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_pg_13', hebrew: 'נַדְנֵדַת קֵן', hebrewPlain: 'נדנדת קן', transcription: 'наднедáт кен', translation: 'качели-гнездо', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_pg_14', hebrew: 'בַּמְבָּה', hebrewPlain: 'במבה', transcription: 'бáмба', translation: 'Бамба (израильские арахисовые снеки)', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'mom_pg_15', hebrew: 'מַיִם בַּבַּקְבּוּק', hebrewPlain: 'מים בבקבוק', transcription: 'мáим ба-бакбӯк', translation: 'вода в бутылочке', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'mom_pg_16', hebrew: 'לַחֲטוֹף', hebrewPlain: 'לחטוף', transcription: 'лахтóф', translation: 'вырывать из рук, отбирать игрушку', partOfSpeech: 'verb', root: 'ח-ט-ף', lessonId: 0 },
      { id: 'mom_pg_17', hebrew: 'לִדְחוֹף', hebrewPlain: 'לדחוף', transcription: 'лидхóф', translation: 'толкаться', partOfSpeech: 'verb', root: 'ד-ח-ף', lessonId: 0 },
      { id: 'mom_pg_18', hebrew: 'לַעֲשׂוֹת תּוֹרוֹת', hebrewPlain: 'לעשות תורות', transcription: 'лаасóт торóт', translation: 'кататься по очереди', partOfSpeech: 'verb', lessonId: 0 },
      { id: 'mom_pg_19', hebrew: 'לְהַשְׁגִּיחַ', hebrewPlain: 'להשגיח', transcription: 'леhашгӣах', translation: 'присматривать за ребёнком на площадке', partOfSpeech: 'verb', root: 'ש-ג-ח', lessonId: 0 },
      { id: 'mom_pg_20', hebrew: 'לְהֵירָשֵׁם לְחוּג', hebrewPlain: 'להירשם לחוג', transcription: 'леhерашéм ле-хуг', translation: 'записаться на кружок / секцию', partOfSpeech: 'verb', root: 'ר-ש-ם', lessonId: 0 },
      { id: 'mom_pg_21', hebrew: 'לִפְגּוֹשׁ חֲבֵרִים', hebrewPlain: 'לפגוש חברים', transcription: 'лифгóш хаверӣм', translation: 'встретить друзей во дворе', partOfSpeech: 'verb', root: 'פ-ג-ש', lessonId: 0 },
      { id: 'mom_pg_22', hebrew: 'עַכְשָׁיו תּוֹרוֹ, הוּא חִכָּה רִאשׁוֹן', hebrewPlain: 'עכשיו תורו, הוא חיכה ראשון', transcription: 'ахшáв торó, hу хикá ришóн', translation: 'Сейчас его очередь, он ждал первым', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_pg_23', hebrew: 'לֹא לִדְחוֹף, יֵשׁ מָקוֹם לְכוּלָּם', hebrewPlain: 'לא לדחוף, יש מקום לכולם', transcription: 'ло лидхóф, йеш макóм ле-хулáм', translation: 'Не толкаться, места хватит всем', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_pg_24', hebrew: 'זֶה הַקּוּרְקִינֶט שֶׁלְּךָ אוֹ שֶׁלּוֹ?', hebrewPlain: 'זה הקורקינט שלך או שלו?', transcription: 'зе hа-куркинéт шельхá о шелó?', translation: 'Это твой самокат или его?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'mom_pg_25', hebrew: 'עוֹד חָמֵשׁ דַּקּוֹת הוֹלְכִים הַבַּיְתָה', hebrewPlain: 'עוד חמש דקות הולכים הביתה', transcription: 'од хамéш дакóт hольхӣм hабáйта', translation: 'Ещё пять минут и идём домой', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },
];
