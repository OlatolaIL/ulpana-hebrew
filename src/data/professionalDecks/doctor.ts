/**
 * Профессиональные тематические словари
 *
 * ВРАЧ И ПОЛИКЛИНИКА (רוֹפֵא וּמִרְפָּאָה / קֻפַּת חוֹלִים)
 *
 * Колоды:
 *   1. doctor-verbs      — Глаголы приёма, осмотра и лечения (25 слов)
 *   2. doctor-diagnoses  — Диагнозы, симптомы и жалобы (25 слов)
 *   3. doctor-procedures — Процедуры, анализы и направления (25 слов)
 *   4. doctor-dialogue   — Фразы общения врача с пациентом (25 фраз)
 */

import { ThematicDeck } from '@/types';

export const DOCTOR_DECKS: ThematicDeck[] = [
  // ==========================================
  // ВРАЧ — ГЛАГОЛЫ ПРИЁМА, ОСМОТРА И ЛЕЧЕНИЯ
  // ==========================================
  {
    id: 'doctor-verbs',
    title: 'Врач — Глаголы осмотра и лечения',
    titleHebrew: 'רוֹפֵא — פְּעָלִים שֶׁל בְּדִיקָה וְטִיפּוּל',
    description: '25 ключевых глаголов медицинского приёма: диагностировать, выписывать рецепт, направлять к специалисту, бинтовать, дезинфицировать, оперировать и обезболивать. Спряжения и семья корня — по кнопке «Пеалим».',
    level: 'all',
    category: 'doctor',
    icon: 'Stethoscope',
    words: [
      { id: 'doc_v_1', hebrew: 'לִבְדּוֹק', hebrewPlain: 'לבדוק', transcription: 'ливдóк', translation: 'осматривать, проверять', partOfSpeech: 'verb', root: 'ב-ד-ק', lessonId: 0 },
      { id: 'doc_v_2', hebrew: 'לְאַבְחֵן', hebrewPlain: 'לאבחן', transcription: 'леавхéн', translation: 'диагностировать, ставить диагноз', partOfSpeech: 'verb', root: 'א-ב-ח-ן', lessonId: 0 },
      { id: 'doc_v_3', hebrew: 'לִרְשׁוֹם', hebrewPlain: 'לרשום', transcription: 'лиршóм', translation: 'выписывать (рецепт), записывать', partOfSpeech: 'verb', root: 'ר-ש-ם', lessonId: 0 },
      { id: 'doc_v_4', hebrew: 'לְהַפְנוֹת', hebrewPlain: 'להפנות', transcription: 'леhафнóт', translation: 'направлять (на анализы / к специалисту)', partOfSpeech: 'verb', root: 'פ-נ-ה', lessonId: 0 },
      { id: 'doc_v_5', hebrew: 'לְחַטֵּא', hebrewPlain: 'לחטא', transcription: 'лехатé', translation: 'дезинфицировать, обеззараживать', partOfSpeech: 'verb', root: 'ח-ט-א', lessonId: 0 },
      { id: 'doc_v_6', hebrew: 'לַחְבּוֹשׁ', hebrewPlain: 'לחבוש', transcription: 'лахбóш', translation: 'бинтовать, накладывать повязку', partOfSpeech: 'verb', root: 'ח-ב-ש', lessonId: 0 },
      { id: 'doc_v_7', hebrew: 'לְנַתֵּחַ', hebrewPlain: 'לנתח', transcription: 'ленатéах', translation: 'оперировать (хирургически)', partOfSpeech: 'verb', root: 'נ-ת-ח', lessonId: 0 },
      { id: 'doc_v_8', hebrew: 'לִמְדוֹד', hebrewPlain: 'למדוד', transcription: 'лимдóд', translation: 'измерять (давление, температуру)', partOfSpeech: 'verb', root: 'מ-ד-ד', lessonId: 0 },
      { id: 'doc_v_9', hebrew: 'לְהַקְשִׁיב', hebrewPlain: 'להקשיב', transcription: 'леhакшӣв', translation: 'слушать (стетоскопом лёгкие / сердце)', partOfSpeech: 'verb', root: 'ק-ש-ב', lessonId: 0 },
      { id: 'doc_v_10', hebrew: 'לְהַזְרִיק', hebrewPlain: 'להזריק', transcription: 'леhазрӣк', translation: 'делать укол, вводить инъекцию', partOfSpeech: 'verb', root: 'ז-ר-ק', lessonId: 0 },
      { id: 'doc_v_11', hebrew: 'לְהַרְדִּים', hebrewPlain: 'להרדים', transcription: 'леhардӣм', translation: 'вводить наркоз, усыплять, анестезировать', partOfSpeech: 'verb', root: 'ר-ד-ם', lessonId: 0 },
      { id: 'doc_v_12', hebrew: 'לְהַחְלִים', hebrewPlain: 'להחלים', transcription: 'леhахлӣм', translation: 'выздоравливать, поправляться', partOfSpeech: 'verb', root: 'ח-ל-ם', lessonId: 0 },
      { id: 'doc_v_13', hebrew: 'לְהִתְאוֹשֵׁשׁ', hebrewPlain: 'להתאושש', transcription: 'леhит’ошéш', translation: 'приходить в себя, восстанавливаться', partOfSpeech: 'verb', root: 'א-ו-ש', lessonId: 0 },
      { id: 'doc_v_14', hebrew: 'לְהָקֵל', hebrewPlain: 'להקל', transcription: 'леhакéль', translation: 'облегчать (боль, симптомы)', partOfSpeech: 'verb', root: 'ק-ל-ל', lessonId: 0 },
      { id: 'doc_v_15', hebrew: 'לְהַחְמִיר', hebrewPlain: 'להחמיר', transcription: 'леhахмӣр', translation: 'ухудшаться, обостряться', partOfSpeech: 'verb', root: 'ח-מ-ר', lessonId: 0 },
      { id: 'doc_v_16', hebrew: 'לְהִשְׁתַּעֵל', hebrewPlain: 'להשתעל', transcription: 'леhишта’éль', translation: 'кашлять', partOfSpeech: 'verb', root: 'ש-ע-ל', lessonId: 0 },
      { id: 'doc_v_17', hebrew: 'לְהַקִּיא', hebrewPlain: 'להקיא', transcription: 'леhакӣ', translation: 'рвать, иметь рвоту', partOfSpeech: 'verb', root: 'ק-ו-א', lessonId: 0 },
      { id: 'doc_v_18', hebrew: 'לְהִתְעַלֵּף', hebrewPlain: 'להתעלף', transcription: 'леhит’алéф', translation: 'падать в обморок, терять сознание', partOfSpeech: 'verb', root: 'ע-ל-ף', lessonId: 0 },
      { id: 'doc_v_19', hebrew: 'לִנְשׁוֹם', hebrewPlain: 'לנשום', transcription: 'линшóм', translation: 'дышать', partOfSpeech: 'verb', root: 'נ-ש-ם', lessonId: 0 },
      { id: 'doc_v_20', hebrew: 'לִבְלוֹעַ', hebrewPlain: 'לבלוע', transcription: 'ливлóа', translation: 'глотать (таблетку, капсулу)', partOfSpeech: 'verb', root: 'ב-ל-ע', lessonId: 0 },
      { id: 'doc_v_21', hebrew: 'לְאַשְׁפֵּז', hebrewPlain: 'לאשפז', transcription: 'леашпéз', translation: 'госпитализировать, класть в стационар', partOfSpeech: 'verb', root: 'א-ש-פ-ז', lessonId: 0 },
      { id: 'doc_v_22', hebrew: 'לְשַׁחְרֵר', hebrewPlain: 'לשחרר', transcription: 'лешахрéр', translation: 'выписывать из больницы, отпускать', partOfSpeech: 'verb', root: 'ש-ח-ר-ר', lessonId: 0 },
      { id: 'doc_v_23', hebrew: 'לְמַשֵּׁשׁ', hebrewPlain: 'למשש', transcription: 'лемашéш', translation: 'пальпировать, прощупывать', partOfSpeech: 'verb', root: 'מ-ש-ש', lessonId: 0 },
      { id: 'doc_v_24', hebrew: 'לִסְבּוֹל', hebrewPlain: 'לסבול', transcription: 'лисбóль', translation: 'страдать (от болезни, боли)', partOfSpeech: 'verb', root: 'ס-ב-ל', lessonId: 0 },
      { id: 'doc_v_25', hebrew: 'לְהַדְבִּיק', hebrewPlain: 'להדביק', transcription: 'леhадбӣк', translation: 'заражать (инфекцией)', partOfSpeech: 'verb', root: 'ד-ב-ק', lessonId: 0 },
    ],
  },

  // ==========================================
  // ВРАЧ — ДИАГНОЗЫ, СИМПТОМЫ И БОЛЕЗНИ
  // ==========================================
  {
    id: 'doctor-diagnoses',
    title: 'Врач — Диагнозы и симптомы',
    titleHebrew: 'רוֹפֵא — מַחֲלוֹת, סִימְפְּטוֹמִים וְאִבְחוּן',
    description: '25 медицинских диагнозов и жалоб: воспаление, пневмония, грипп, перелом, диабет, гипертония, сыпь, одышка и аллергия.',
    level: 'all',
    category: 'doctor',
    icon: 'Activity',
    words: [
      { id: 'doc_d_1', hebrew: 'דַּלֶּקֶת', hebrewPlain: 'דלקת', transcription: 'далéкет', translation: 'воспаление', partOfSpeech: 'noun', gender: 'f', root: 'ד-ל-ק', lessonId: 0 },
      { id: 'doc_d_2', hebrew: 'דַּלֶּקֶת רֵיאוֹת', hebrewPlain: 'דלקת ריאות', transcription: 'далéкет реóт', translation: 'пневмония, воспаление лёгких', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'doc_d_3', hebrew: 'דַּלֶּקֶת גָּרוֹן', hebrewPlain: 'דלקת גרון', transcription: 'далéкет гарóн', translation: 'ангина, фарингит', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'doc_d_4', hebrew: 'שַׁפַּעַת', hebrewPlain: 'שפעת', transcription: 'шапáат', translation: 'грипп', partOfSpeech: 'noun', gender: 'f', root: 'ש-פ-ע', lessonId: 0 },
      { id: 'doc_d_5', hebrew: 'הִצְטַנְּנוּת', hebrewPlain: 'הצטננות', transcription: 'hицтаненӯт', translation: 'простуда, насморк', partOfSpeech: 'noun', gender: 'f', root: 'צ-נ-ן', lessonId: 0 },
      { id: 'doc_d_6', hebrew: 'זִיהוּם', hebrewPlain: 'זיהום', transcription: 'зиhӯм', translation: 'инфекция, заражение', partOfSpeech: 'noun', gender: 'm', root: 'ז-ה-ם', lessonId: 0 },
      { id: 'doc_d_7', hebrew: 'חוֹם גָּבוֹהַּ', hebrewPlain: 'חום גבוה', transcription: 'хом гавóа', translation: 'высокая температура, жар', partOfSpeech: 'noun', gender: 'm', root: 'ח-מ-מ', lessonId: 0 },
      { id: 'doc_d_8', hebrew: 'שֶׁבֶר', hebrewPlain: 'שבר', transcription: 'шéвер', translation: 'перелом (кости)', partOfSpeech: 'noun', gender: 'm', root: 'ש-ב-ר', lessonId: 0 },
      { id: 'doc_d_9', hebrew: 'נֶקַע', hebrewPlain: 'נקע', transcription: 'нéка', translation: 'вывих, растяжение связок', partOfSpeech: 'noun', gender: 'm', root: 'נ-ק-ע', lessonId: 0 },
      { id: 'doc_d_10', hebrew: 'אַלֶּרְגְּיָה', hebrewPlain: 'אלרגיה', transcription: 'алéргйя', translation: 'аллергия', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'doc_d_11', hebrew: 'סוּכֶּרֶת', hebrewPlain: 'סוכרת', transcription: 'сукéрет', translation: 'сахарный диабет', partOfSpeech: 'noun', gender: 'f', root: 'ס-כ-ר', lessonId: 0 },
      { id: 'doc_d_12', hebrew: 'לַחַץ דָּם גָּבוֹהַּ', hebrewPlain: 'לחץ דם גבוה', transcription: 'лáхац дам гавóа', translation: 'гипертония, высокое давление', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'doc_d_13', hebrew: 'מִיגְרֶנָה / כְּאֵב רֹאשׁ', hebrewPlain: 'מיגרנה', transcription: 'мигрéна / кеэв рош', translation: 'мигрень, сильная головная боль', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'doc_d_14', hebrew: 'פְּרִיחָה', hebrewPlain: 'פריחה', transcription: 'прихá', translation: 'кожная сыпь', partOfSpeech: 'noun', gender: 'f', root: 'פ-ר-ח', lessonId: 0 },
      { id: 'doc_d_15', hebrew: 'קוֹצֶר נְשִׁימָה', hebrewPlain: 'קוצר נשימה', transcription: 'кóцер нешимá', translation: 'одышка, затруднённое дыхание', partOfSpeech: 'noun', gender: 'm', root: 'ק-צ-ר', lessonId: 0 },
      { id: 'doc_d_16', hebrew: 'סְחַרְחוֹרֶת', hebrewPlain: 'סחרחורת', transcription: 'схархóрет', translation: 'головокружение', partOfSpeech: 'noun', gender: 'f', root: 'ס-ח-ר', lessonId: 0 },
      { id: 'doc_d_17', hebrew: 'צַרֶבֶת', hebrewPlain: 'צרבת', transcription: 'царéвет', translation: 'изжога', partOfSpeech: 'noun', gender: 'f', root: 'צ-ר-ב', lessonId: 0 },
      { id: 'doc_d_18', hebrew: 'עֲצִירוּת', hebrewPlain: 'עצירות', transcription: 'ацирӯт', translation: 'запор', partOfSpeech: 'noun', gender: 'f', root: 'ע-צ-ר', lessonId: 0 },
      { id: 'doc_d_19', hebrew: 'שִׁלְשׁוּל', hebrewPlain: 'שלשול', transcription: 'шильшу́ль', translation: 'диарея, расстройство желудка', partOfSpeech: 'noun', gender: 'm', root: 'ש-ל-ש-ל', lessonId: 0 },
      { id: 'doc_d_20', hebrew: 'כְּוִויָּה', hebrewPlain: 'כוויה', transcription: 'квия', translation: 'ожог', partOfSpeech: 'noun', gender: 'f', root: 'כ-ו-ה', lessonId: 0 },
      { id: 'doc_d_21', hebrew: 'פֶּצַע', hebrewPlain: 'פצע', transcription: 'пéца', translation: 'рана, язва', partOfSpeech: 'noun', gender: 'm', root: 'פ-צ-ע', lessonId: 0 },
      { id: 'doc_d_22', hebrew: 'שָׁבָץ מוֹחִי', hebrewPlain: 'שבץ מוחי', transcription: 'шавáц мохӣ', translation: 'инсульт', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'doc_d_23', hebrew: 'הֶתְקֵף לֵב', hebrewPlain: 'התקף לב', transcription: 'hеткéф лев', translation: 'инфаркт, сердечный приступ', partOfSpeech: 'noun', gender: 'm', root: 'ת-ק-ף', lessonId: 0 },
      { id: 'doc_d_24', hebrew: 'הַרְעָלַת קֵיבָה', hebrewPlain: 'הרעלת קיבה', transcription: 'hаргалáт кейвá', translation: 'пищевое отравление', partOfSpeech: 'noun', gender: 'f', root: 'ר-ע-ל', lessonId: 0 },
      { id: 'doc_d_25', hebrew: 'חֲרָדָה / פָּנִיקָה', hebrewPlain: 'חרדה', transcription: 'харадá', translation: 'паническая атака, тревожность', partOfSpeech: 'noun', gender: 'f', root: 'ח-ר-ד', lessonId: 0 },
    ],
  },

  // ==========================================
  // ВРАЧ — ПРОЦЕДУРЫ, АНАЛИЗЫ И ОТДЕЛЕНИЯ
  // ==========================================
  {
    id: 'doctor-procedures',
    title: 'Врач — Процедуры и анализы',
    titleHebrew: 'רוֹפֵא — בְּדִיקוֹת, פְּרוֹצֵדוּרוֹת וּמִרְפָּאָה',
    description: '25 терминов больничной кассы: анализ крови, рентген, УЗИ, ЭКГ, рецепт, направление к специалисту, приёмный покой и гипс.',
    level: 'all',
    category: 'doctor',
    icon: 'Stethoscope',
    words: [
      { id: 'doc_p_1', hebrew: 'בְּדִיקַת דָּם', hebrewPlain: 'בדיקת דם', transcription: 'бдикат дам', translation: 'анализ крови', partOfSpeech: 'noun', gender: 'f', root: 'ב-ד-ק', lessonId: 0 },
      { id: 'doc_p_2', hebrew: 'בְּדִיקַת שֶׁתֶן', hebrewPlain: 'בדיקת שתן', transcription: 'бдикат шéтен', translation: 'анализ мочи', partOfSpeech: 'noun', gender: 'f', root: 'ב-ד-ק', lessonId: 0 },
      { id: 'doc_p_3', hebrew: 'צִילוּם רֶנְטְגֶּן', hebrewPlain: 'צילום רנטגן', transcription: 'цилу́м рéнтген', translation: 'рентгеновский снимок', partOfSpeech: 'noun', gender: 'm', root: 'צ-ל-ם', lessonId: 0 },
      { id: 'doc_p_4', hebrew: 'אוּלְטְרָסָאוּנְד', hebrewPlain: 'אולטרסאונד', transcription: 'ултрасáунд', translation: 'УЗИ обследование', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'doc_p_5', hebrew: 'סִי-טִי (CT)', hebrewPlain: 'סי טי', transcription: 'си-ти', translation: 'компьютерная томография (КТ)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'doc_p_6', hebrew: 'אֶקְג (ECG)', hebrewPlain: 'אקג', transcription: 'экэгэ', translation: 'электрокардиограмма (ЭКГ)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'doc_p_7', hebrew: 'מִרְשָׁם לִתְרוּפָה', hebrewPlain: 'מרשם', transcription: 'миршáм литруфá', translation: 'рецепт на лекарство', partOfSpeech: 'noun', gender: 'm', root: 'ר-ש-ם', lessonId: 0 },
      { id: 'doc_p_8', hebrew: 'הַפְנָיָה לְמוּמְחֶה', hebrewPlain: 'הפניה למומחה', transcription: 'hафная лемумхé', translation: 'направление к узкому специалисту', partOfSpeech: 'noun', gender: 'f', root: 'פ-נ-ה', lessonId: 0 },
      { id: 'doc_p_9', hebrew: 'חֲדַר מִיּוּן', hebrewPlain: 'חדר מיון', transcription: 'хадáр мию́н', translation: 'приёмный покой неотложной помощи (ER)', partOfSpeech: 'noun', gender: 'm', root: 'מ-י-ן', lessonId: 0 },
      { id: 'doc_p_10', hebrew: 'אִשְׁפּוּז', hebrewPlain: 'אשפוז', transcription: 'ишпӯз', translation: 'госпитализация, нахождение в стационаре', partOfSpeech: 'noun', gender: 'm', root: 'א-ש-פ-ז', lessonId: 0 },
      { id: 'doc_p_11', hebrew: 'קוּפַּת חוֹלִים', hebrewPlain: 'קופת חולים', transcription: 'купáт холӣм', translation: 'больничная касса (Клалит, Маккаби...)', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'doc_p_12', hebrew: 'מַעְבָּדָה', hebrewPlain: 'מעבדה', transcription: 'маабадá', translation: 'медицинская лаборатория', partOfSpeech: 'noun', gender: 'f', root: 'ע-ב-ד', lessonId: 0 },
      { id: 'doc_p_13', hebrew: 'בֵּית מִרְקַחַת', hebrewPlain: 'בית מרקחת', transcription: 'бейт миркáхат', translation: 'аптека', partOfSpeech: 'noun', gender: 'm', root: 'ר-ק-ח', lessonId: 0 },
      { id: 'doc_p_14', hebrew: 'רוֹקֵחַ', hebrewPlain: 'רוקח', transcription: 'рокéах', translation: 'провизор, фармацевт', partOfSpeech: 'noun', gender: 'm', root: 'ר-ק-ח', lessonId: 0 },
      { id: 'doc_p_15', hebrew: 'גֶּבֶס', hebrewPlain: 'גבס', transcription: 'гéвес', translation: 'гипс (при переломе)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'doc_p_16', hebrew: 'תְּפָרִים', hebrewPlain: 'תפרים', transcription: 'тфарӣм', translation: 'медицинские швы', partOfSpeech: 'noun', gender: 'm', root: 'ת-פ-ר', lessonId: 0 },
      { id: 'doc_p_17', hebrew: 'עֵירוּי / אִינְפוּזְיָה', hebrewPlain: 'עירוי', transcription: 'ирӯй / инфӯзия', translation: 'капельница, внутривенное вливание', partOfSpeech: 'noun', gender: 'm', root: 'ע-ר-ה', lessonId: 0 },
      { id: 'doc_p_18', hebrew: 'חִיסּוּן', hebrewPlain: 'חיסון', transcription: 'хису́н', translation: 'вакцина, прививка', partOfSpeech: 'noun', gender: 'm', root: 'ח-ס-ן', lessonId: 0 },
      { id: 'doc_p_19', hebrew: 'חֲבִישָׁה / תַּחְבּוֹשֶׁת', hebrewPlain: 'תחבושת', transcription: 'хавишá / тахбóшет', translation: 'перевязка, повязка', partOfSpeech: 'noun', gender: 'f', root: 'ח-ב-ש', lessonId: 0 },
      { id: 'doc_p_20', hebrew: 'רוֹפֵא מִשְׁפָּחָה', hebrewPlain: 'רופא משפחה', transcription: 'рофé мишпахá', translation: 'семейный врач, терапевт', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'doc_p_21', hebrew: 'רוֹפֵא יְלָדִים', hebrewPlain: 'רופא ילדים', transcription: 'рофé йеладӣм', translation: 'педиатр, детский врач', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'doc_p_22', hebrew: 'תְּעוּדַת מַחֲלָה', hebrewPlain: 'תעודת מחלה', transcription: 'теудáт махалá', translation: 'больничный лист', partOfSpeech: 'noun', gender: 'f', root: 'ח-ל-ה', lessonId: 0 },
      { id: 'doc_p_23', hebrew: 'חֲדַר נִיתּוּחַ', hebrewPlain: 'חדר ניתוח', transcription: 'хадáр нитӯах', translation: 'операционная', partOfSpeech: 'noun', gender: 'm', root: 'נ-ת-ח', lessonId: 0 },
      { id: 'doc_p_24', hebrew: 'בְּדִיקָה מַקְדִּימָה', hebrewPlain: 'בדיקה מקדימה', transcription: 'бдикá макдимá', translation: 'предварительное обследование', partOfSpeech: 'noun', gender: 'f', root: 'ק-ד-ם', lessonId: 0 },
      { id: 'doc_p_25', hebrew: 'תּוֹר לָרוֹפֵא', hebrewPlain: 'תור לרופא', transcription: 'тор ларофé', translation: 'запись на приём к врачу', partOfSpeech: 'noun', gender: 'm', root: 'ת-ו-ר', lessonId: 0 },
    ],
  },

  // ==========================================
  // ВРАЧ — ДИАЛОГ ВРАЧА С ПАЦИЕНТОМ
  // ==========================================
  {
    id: 'doctor-dialogue',
    title: 'Врач — Фразы приёма и осмотра',
    titleHebrew: 'רוֹפֵא — שִׂיחַת רוֹפֵא וְחוֹלֶה',
    description: '25 практических выражений: вопросы о симптомах, инструкции врача («вдохните глубже», «откройте рот»), режим приёма антибиотиков и рекомендации.',
    level: 'all',
    category: 'doctor',
    icon: 'Users',
    words: [
      { id: 'doc_t_1', hebrew: 'בַּמֶּה אוּכַל לַעֲזוֹר לְךָ?', hebrewPlain: 'במה אוכל לעזור לך?', transcription: 'бамé ухáль лаазóр лехá?', translation: 'Чем я могу вам помочь?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_2', hebrew: 'אֵיפֹה בְּדִיּוּק כּוֹאֵב לְךָ?', hebrewPlain: 'איפה בדיוק כואב לך?', transcription: 'эйфо бедйӯк коэв лехá?', translation: 'Где именно у вас болит?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_3', hebrew: 'כַּמָּה זְמַן אַתָּה מַרְגִּישׁ כָּכָה?', hebrewPlain: 'כמה זמן אתה מרגיש ככה?', transcription: 'кáма зман атá маргӣш кáха?', translation: 'Как давно вы себя так чувствуете?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_4', hebrew: 'תִּנְשׁוֹם עָמוֹק וְתַחֲזִיק', hebrewPlain: 'תנשום עמוק ותחזיק', transcription: 'тиншóм амóк ветахзӣк', translation: 'Вдохните глубоко и задержите дыхание', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_5', hebrew: 'תִּפְתַּח אֶת הַפֶּה וְתוֹצִיא לָשׁוֹן', hebrewPlain: 'תפתח את הפה ותוציא לשון', transcription: 'тифтáх эт hапé ветоцӣ лашóн', translation: 'Откройте рот и покажите язык', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_6', hebrew: 'תִּשְׁכַּב עַל מִיטַּת הַבְּדִיקָה', hebrewPlain: 'תשכב על מיטת הבדיקה', transcription: 'тишкáв аль митáт hабдикá', translation: 'Ложитесь на смотровую кушетку', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_7', hebrew: 'הַאִם יֵשׁ לְךָ רְגִישׁוּת לִתְרוּפוֹת?', hebrewPlain: 'האם יש לך רגישות לתרופות?', transcription: 'hаим йеш лехá регишӯт литруфóт?', translation: 'У вас есть аллергия на лекарства?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_8', hebrew: 'לָקַחְתָּ כְּבָר מַשֶּׁהוּ נֶגֶד כְּאֵבִים?', hebrewPlain: 'לקחת כבר משהו נגד כאבים?', transcription: 'лакáхта квар мáшеhу нéгед кеэвӣм?', translation: 'Вы уже принимали что-то от боли?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_9', hebrew: 'זֶה נִרְאֶה כְּמוֹ דַּלֶּקֶת קַלָּה', hebrewPlain: 'זה נראה כמו דלקת קלה', transcription: 'зэ ниръé кмо далéкет калá', translation: 'Это похоже на лёгкое воспаление', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_10', hebrew: 'אֲנִי רוֹשֵׁם לְךָ אַנְטִיבְּיוֹטִיקָה', hebrewPlain: 'אני רושם לך אנטיביוטיקה', transcription: 'анӣ рошéм лехá антибйотика', translation: 'Я выписываю вам антибиотики', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_11', hebrew: 'לָקַחַת כַּדּוּר אֶחָד פַּעֲמַיִּים בְּיוֹם', hebrewPlain: 'לקחת כדור אחד פעמיים ביום', transcription: 'лакáхат кадӯр эхáд паамáим бейóм', translation: 'Принимать одну таблетку два раза в день', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_12', hebrew: 'חָשׁוּב לִשְׁתּוֹת הַרְבֵּה מַיִם', hebrewPlain: 'חשוב לשתות הרבה מים', transcription: 'хашу́в лиштот hарбé мáим', translation: 'Важно пить много воды', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_13', hebrew: 'תִּישָׁאֵר בַּמִּיטָּה שְׁלוֹשָׁה יָמִים', hebrewPlain: 'תישאר במיטה שלושה ימים', transcription: 'тиша’éр бамитá шлошá ямӣм', translation: 'Оставайтесь в постели три дня', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_14', hebrew: 'הִנֵּה הַפְנָיָה לִבְדִיקַת דָּם', hebrewPlain: 'הנה הפניה לבדיקת דם', transcription: 'hинé hафная ливдикат дам', translation: 'Вот направление на анализ крови', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_15', hebrew: 'תַּחֲזוֹר אֵלַי עִם הַתּוֹצָאוֹת', hebrewPlain: 'תחזור אלי עם התוצאות', transcription: 'тахзóр элáй им hатоцаóт', translation: 'Вернитесь ко мне с результатами', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_16', hebrew: 'אִם הַחוֹם לֹא יוֹרֵד, תִּגַּשׁ לַמִּיּוּן', hebrewPlain: 'אם החום לא יורד, תגש למיון', transcription: 'им hахом ло йорéд, тигáш ламиюн', translation: 'Если температура не падает, обратитесь в приёмный покой', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_17', hebrew: 'הַמַּצָּב שֶׁלְּךָ מִשְׁתַּפֵּר יָפֶה', hebrewPlain: 'המצב שלך משתפר יפה', transcription: 'hамацáв шельхá миштапéр яфé', translation: 'Ваше состояние хорошо улучшается', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_18', hebrew: 'לֹא לַעֲשׂוֹת מַאֲמָץ גּוּפָנִי', hebrewPlain: 'לא לעשות מאמץ גופני', transcription: 'ло лаасóт маамáц гуфанӣ', translation: 'Избегайте физических нагрузок', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_19', hebrew: 'הַכּוֹל יִהְיֶה בְּסֵדֶר, אַל תִּדְאַג', hebrewPlain: 'הכול יהיה בסדר, אל תדאג', transcription: 'hакóль йиhйé бесéдер, аль тид’áг', translation: 'Всё будет хорошо, не переживайте', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_20', hebrew: 'רְפוּאָה שְׁלֵמָה וְתַרְגִּישׁ טוֹב!', hebrewPlain: 'רפואה שלמה ותרגיש טוב!', transcription: 'рефуá шлемá ветаргӣш тов!', translation: 'Скорейшего выздоровления и поправляйтесь!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_21', hebrew: 'אֲנִי צָרִיךְ תְּעוּדַת מַחֲלָה לָעֲבוֹדָה', hebrewPlain: 'אני צריך תעודת מחלה לעבודה', transcription: 'анӣ царӣх теудáт махалá лааводá', translation: 'Мне нужна справка о болезни для работы', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_22', hebrew: 'הַתְּרוּפָה עִם אוֹכֶל אוֹ עַל קֵיבָה רֵיקָה?', hebrewPlain: 'התרופה עם אוכל או על קיבה ריקה?', transcription: 'hатруфá им óхель о аль кейвá рейкá?', translation: 'Лекарство принимать с едой или натощак?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_23', hebrew: 'יֵשׁ לַתְּרוּפָה הַזֹּאת תּוֹפְעוֹת לְוַאי?', hebrewPlain: 'יש לתרופה הזאת תופעות לוואי?', transcription: 'йеш латруфá hазóт тофеóт левáй?', translation: 'У этого лекарства есть побочные эффекты?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_24', hebrew: 'לַחְבּוֹשׁ אֶת הַפֶּצַע כָּל יוֹם', hebrewPlain: 'לחבוש את הפצע כל יום', transcription: 'лахбóш эт hапéца коль йом', translation: 'Делать перевязку раны каждый день', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'doc_t_25', hebrew: 'לְהַרְבּוֹת בִּמְנוּחָה', hebrewPlain: 'להרבות במנוחה', transcription: 'леhарбóт бимнухá', translation: 'Побольше отдыхать', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },
];
