/**
 * Профессиональные тематические словари
 * Каждая профессия — свой набор колод. Слова могут пересекаться между колодами разных профессий.
 *
 * МЕТАПЕЛЕТ (מְטַפֶּלֶת) — уход за пожилыми / лечение на дому
 * Колоды:
 *   1. caregiver-verbs        — Глаголы ухода (Пиэль, Хифиль)
 *   2. caregiver-body-medical — Тело, симптомы, медицина
 *   3. caregiver-daily        — Предметы быта и ухода
 *   4. caregiver-meds         — Лекарства и процедуры
 *   5. caregiver-talk         — Общение с подопечным и семьёй
 */

import { ThematicDeck } from '@/types';

export const PROFESSIONAL_DECKS: ThematicDeck[] = [

  // ==========================================
  // МЕТАПЕЛЕТ — ГЛАГОЛЫ УХОДА
  // ==========================================
  {
    id: 'caregiver-verbs',
    title: 'Метапелет — Глаголы ухода',
    titleHebrew: 'מְטַפֶּלֶת — פְּעָלִים שֶׁל טִיפּוּל',
    description: '25 ключевых глаголов ухода: купать, одевать, кормить, укладывать, измерять давление и температуру, помогать передвигаться. Полные спряжения по кнопке «Пеалим».',
    level: 'all',
    category: 'caregiver',
    icon: 'Stethoscope',
    words: [
      // --- ГЛАГОЛЫ ЛИЧНОГО УХОДА ---
      { id: 'cg_v_1', hebrew: 'לְטַפֵּל', hebrewPlain: 'לטפל', transcription: 'летапéль', translation: 'ухаживать, лечить', partOfSpeech: 'verb', root: 'ט-פ-ל', lessonId: 0 },
      { id: 'cg_v_2', hebrew: 'לְרַחֵץ', hebrewPlain: 'לרחץ', transcription: 'лерахéц', translation: 'мыть, купать (кого-то)', partOfSpeech: 'verb', root: 'ר-ח-ץ', lessonId: 0 },
      { id: 'cg_v_3', hebrew: 'לִשְׁטֹף', hebrewPlain: 'לשטוף', transcription: 'лиштóф', translation: 'мыть, полоскать', partOfSpeech: 'verb', root: 'ש-ט-ף', lessonId: 0 },
      { id: 'cg_v_4', hebrew: 'לְהַלְבִּישׁ', hebrewPlain: 'להלביש', transcription: 'лехальбíш', translation: 'одевать (кого-то)', partOfSpeech: 'verb', root: 'ל-ב-ש', lessonId: 0 },
      { id: 'cg_v_5', hebrew: 'לְהַפְשִׁיט', hebrewPlain: 'להפשיט', transcription: 'лехафшíт', translation: 'раздевать (кого-то)', partOfSpeech: 'verb', root: 'פ-ש-ט', lessonId: 0 },
      { id: 'cg_v_6', hebrew: 'לְהַאֲכִיל', hebrewPlain: 'להאכיל', transcription: 'лехаахиль', translation: 'кормить (кого-то)', partOfSpeech: 'verb', root: 'א-כ-ל', lessonId: 0 },
      { id: 'cg_v_7', hebrew: 'לְהַשְׁקוֹת', hebrewPlain: 'להשקות', transcription: 'лехашкóт', translation: 'поить (кого-то)', partOfSpeech: 'verb', root: 'ש-ק-ה', lessonId: 0 },
      { id: 'cg_v_8', hebrew: 'לְהַשְׁכִּיב', hebrewPlain: 'להשכיב', transcription: 'лехашкíв', translation: 'укладывать (спать)', partOfSpeech: 'verb', root: 'ש-כ-ב', lessonId: 0 },
      { id: 'cg_v_9', hebrew: 'לְהַעֲמִיד', hebrewPlain: 'להעמיד', transcription: 'лехаамíд', translation: 'поднимать на ноги, ставить', partOfSpeech: 'verb', root: 'ע-מ-ד', lessonId: 0 },
      { id: 'cg_v_10', hebrew: 'לְסַיֵּעַ', hebrewPlain: 'לסייע', transcription: 'лесайéа', translation: 'помогать, оказывать содействие', partOfSpeech: 'verb', root: 'ס-י-ע', lessonId: 0 },
      { id: 'cg_v_11', hebrew: 'לְתַמֵּךְ', hebrewPlain: 'לתמוך', transcription: 'летамéх', translation: 'поддерживать (физически)', partOfSpeech: 'verb', root: 'ת-מ-ך', lessonId: 0 },
      { id: 'cg_v_12', hebrew: 'לְסַדֵּר', hebrewPlain: 'לסדר', transcription: 'лесадéр', translation: 'приводить в порядок, убирать', partOfSpeech: 'verb', root: 'ס-ד-ר', lessonId: 0 },
      { id: 'cg_v_13', hebrew: 'לְחַמֵּם', hebrewPlain: 'לחמם', transcription: 'лехамéм', translation: 'разогревать, согревать', partOfSpeech: 'verb', root: 'ח-מ-מ', lessonId: 0 },
      // --- МЕДИЦИНСКИЕ ГЛАГОЛЫ ---
      { id: 'cg_v_14', hebrew: 'לִמְדֹּד', hebrewPlain: 'למדוד', transcription: 'лимдóд', translation: 'измерять', partOfSpeech: 'verb', root: 'מ-ד-ד', lessonId: 0 },
      { id: 'cg_v_15', hebrew: 'לְבַדֵּק', hebrewPlain: 'לבדוק', transcription: 'ливдóк', translation: 'проверять, осматривать', partOfSpeech: 'verb', root: 'ב-ד-ק', lessonId: 0 },
      { id: 'cg_v_16', hebrew: 'לְטַפֵּל בְּ', hebrewPlain: 'לטפל ב', transcription: 'летапéль бе', translation: 'ухаживать за (кем-то)', partOfSpeech: 'verb', root: 'ט-פ-ל', lessonId: 0 },
      { id: 'cg_v_17', hebrew: 'לִתֵּן תְּרוּפָה', hebrewPlain: 'לתת תרופה', transcription: 'латéт трýфа', translation: 'дать лекарство', partOfSpeech: 'verb', root: 'נ-ת-ן', lessonId: 0 },
      { id: 'cg_v_18', hebrew: 'לְשַׁכֵּךְ', hebrewPlain: 'לשכך', transcription: 'лешакéх', translation: 'облегчать (боль)', partOfSpeech: 'verb', root: 'ש-כ-ך', lessonId: 0 },
      { id: 'cg_v_19', hebrew: 'לְהַרְגִּיעַ', hebrewPlain: 'להרגיע', transcription: 'лехаргíа', translation: 'успокаивать', partOfSpeech: 'verb', root: 'ר-ג-ע', lessonId: 0 },
      { id: 'cg_v_20', hebrew: 'לְהַחְזִיר', hebrewPlain: 'להחזיר', transcription: 'лехахзíр', translation: 'вернуть, положить обратно', partOfSpeech: 'verb', root: 'ח-ז-ר', lessonId: 0 },
      { id: 'cg_v_21', hebrew: 'לְהַזְמִין', hebrewPlain: 'להזמין', transcription: 'лехазмíн', translation: 'заказать, пригласить (врача)', partOfSpeech: 'verb', root: 'ז-מ-ן', lessonId: 0 },
      { id: 'cg_v_22', hebrew: 'לְדַוֵּחַ', hebrewPlain: 'לדווח', transcription: 'ледавéах', translation: 'сообщать, докладывать', partOfSpeech: 'verb', root: 'ד-ו-ח', lessonId: 0 },
      { id: 'cg_v_23', hebrew: 'לְהַחְלִיף', hebrewPlain: 'להחליף', transcription: 'лехахлíф', translation: 'менять (памперс, постель)', partOfSpeech: 'verb', root: 'ח-ל-ף', lessonId: 0 },
      { id: 'cg_v_24', hebrew: 'לְעוֹדֵד', hebrewPlain: 'לעודד', transcription: 'леодéд', translation: 'ободрять, поддерживать', partOfSpeech: 'verb', root: 'ע-ד-ד', lessonId: 0 },
      { id: 'cg_v_25', hebrew: 'לְלַווֹת', hebrewPlain: 'ללוות', transcription: 'лелавóт', translation: 'сопровождать', partOfSpeech: 'verb', root: 'ל-ו-ה', lessonId: 0 },
    ],
  },

  // ==========================================
  // МЕТАПЕЛЕТ — ТЕЛО И МЕДИЦИНА
  // ==========================================
  {
    id: 'caregiver-body-medical',
    title: 'Метапелет — Тело и симптомы',
    titleHebrew: 'מְטַפֶּלֶת — גּוּף וְסִימְפְּטוֹמִים',
    description: 'Части тела, симптомы и состояния пожилого человека. Необходимый словарь для понимания жалоб и описания состояния подопечного.',
    level: 'all',
    category: 'caregiver',
    icon: 'Stethoscope',
    words: [
      // --- ЧАСТИ ТЕЛА ---
      { id: 'cg_b_1', hebrew: 'גּוּף', hebrewPlain: 'גוף', transcription: 'гýф', translation: 'тело', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_2', hebrew: 'יָד', hebrewPlain: 'יד', transcription: 'яд', translation: 'рука', partOfSpeech: 'noun', gender: 'f', plural: 'יָדַיִם', lessonId: 0 },
      { id: 'cg_b_3', hebrew: 'רֶגֶל', hebrewPlain: 'רגל', transcription: 'рéгель', translation: 'нога', partOfSpeech: 'noun', gender: 'f', plural: 'רַגְלַיִם', lessonId: 0 },
      { id: 'cg_b_4', hebrew: 'גַּב', hebrewPlain: 'גב', transcription: 'гав', translation: 'спина', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_5', hebrew: 'בֶּטֶן', hebrewPlain: 'בטן', transcription: 'бéтен', translation: 'живот', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_b_6', hebrew: 'רֹאשׁ', hebrewPlain: 'ראש', transcription: 'рош', translation: 'голова', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_7', hebrew: 'פֶּה', hebrewPlain: 'פה', transcription: 'пэ', translation: 'рот', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_8', hebrew: 'אֹזֶן', hebrewPlain: 'אוזן', transcription: 'óзен', translation: 'ухо', partOfSpeech: 'noun', gender: 'f', plural: 'אוזניים', lessonId: 0 },
      { id: 'cg_b_9', hebrew: 'עַיִן', hebrewPlain: 'עין', transcription: 'áин', translation: 'глаз', partOfSpeech: 'noun', gender: 'f', plural: 'עיניים', lessonId: 0 },
      { id: 'cg_b_10', hebrew: 'לֵב', hebrewPlain: 'לב', transcription: 'лев', translation: 'сердце', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_11', hebrew: 'ריאות', hebrewPlain: 'ריאות', transcription: 'реóт', translation: 'лёгкие', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_b_12', hebrew: 'עֶצֶם', hebrewPlain: 'עצם', transcription: 'éцем', translation: 'кость', partOfSpeech: 'noun', gender: 'm', plural: 'עצמות', lessonId: 0 },
      { id: 'cg_b_13', hebrew: 'עוֹר', hebrewPlain: 'עור', transcription: 'ор', translation: 'кожа', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      // --- СИМПТОМЫ И СОСТОЯНИЯ ---
      { id: 'cg_b_14', hebrew: 'כְּאֵב', hebrewPlain: 'כאב', transcription: 'кеэв', translation: 'боль', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_15', hebrew: 'חֹם', hebrewPlain: 'חום', transcription: 'хом', translation: 'температура, жар', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_16', hebrew: 'לַחַץ דָּם', hebrewPlain: 'לחץ דם', transcription: 'лáхац дам', translation: 'давление крови', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_17', hebrew: 'סְחַרְחֹרֶת', hebrewPlain: 'סחרחורת', transcription: 'схархóрет', translation: 'головокружение', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_b_18', hebrew: 'חוּלְשָׁה', hebrewPlain: 'חולשה', transcription: 'хýлша', translation: 'слабость', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_b_19', hebrew: 'בְּחִילָה', hebrewPlain: 'בחילה', transcription: 'бехилá', translation: 'тошнота', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_b_20', hebrew: 'נְפִילָה', hebrewPlain: 'נפילה', transcription: 'нефилá', translation: 'падение', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_b_21', hebrew: 'פְּצָעִים', hebrewPlain: 'פצעים', transcription: 'пцаим', translation: 'раны, ссадины', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_22', hebrew: 'נְשִׁימָה', hebrewPlain: 'נשימה', transcription: 'нешимá', translation: 'дыхание', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_b_23', hebrew: 'בִּלְבּוּל', hebrewPlain: 'בלבול', transcription: 'билбýль', translation: 'спутанность (сознания)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_b_24', hebrew: 'כּוֹאֵב לִי', hebrewPlain: 'כואב לי', transcription: 'коэв лī', translation: 'мне больно', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_b_25', hebrew: 'אֲנִי לֹא מַרְגִּישׁ טוֹב', hebrewPlain: 'אני לא מרגיש טוב', transcription: 'ани ло маргíш тов', translation: 'я нехорошо себя чувствую', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },

  // ==========================================
  // МЕТАПЕЛЕТ — ПРЕДМЕТЫ БЫТА И УХОДА
  // ==========================================
  {
    id: 'caregiver-daily',
    title: 'Метапелет — Быт и предметы ухода',
    titleHebrew: 'מְטַפֶּלֶת — חֶפְצֵי יוֹמְיוֹם וּטִיפּוּל',
    description: 'Предметы для ежедневного ухода: гигиена, постель, еда, медицинское оборудование. Слова, которые метапелет использует каждый день.',
    level: 'all',
    category: 'caregiver',
    icon: 'Home',
    words: [
      // --- ГИГИЕНА ---
      { id: 'cg_d_1', hebrew: 'מַגֶּבֶת', hebrewPlain: 'מגבת', transcription: 'магéвет', translation: 'полотенце', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_2', hebrew: 'סַבּוֹן', hebrewPlain: 'סבון', transcription: 'сабóн', translation: 'мыло', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_3', hebrew: 'שַׁמְפּוּ', hebrewPlain: 'שמפו', transcription: 'шампу́', translation: 'шампунь', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_4', hebrew: 'מִשְׁחַת שִׁינַּיִם', hebrewPlain: 'משחת שיניים', transcription: 'мишхат шинайím', translation: 'зубная паста', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_5', hebrew: 'מִטוּשׁ', hebrewPlain: 'מיטוש', transcription: 'митýш', translation: 'подгузник, памперс', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_6', hebrew: 'מַסְרֵק', hebrewPlain: 'מסרק', transcription: 'масрéк', translation: 'расчёска', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_7', hebrew: 'מַגֵּן שֶׁמֶשׁ', hebrewPlain: 'מגן שמש', transcription: 'магéн шéмеш', translation: 'солнцезащитный крем', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      // --- ПОСТЕЛЬ И ПЕРЕДВИЖЕНИЕ ---
      { id: 'cg_d_8', hebrew: 'מִיטָה', hebrewPlain: 'מיטה', transcription: 'митá', translation: 'кровать', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_9', hebrew: 'כַּרִית', hebrewPlain: 'כרית', transcription: 'карит', translation: 'подушка', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_10', hebrew: 'שְׂמִיכָה', hebrewPlain: 'שמיכה', transcription: 'смихá', translation: 'одеяло', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_11', hebrew: 'כִּיסֵּא גַּלְגַּלִּים', hebrewPlain: 'כיסא גלגלים', transcription: 'кисэ галгалим', translation: 'инвалидная коляска', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_12', hebrew: 'הֲלִיכוֹן', hebrewPlain: 'הליכון', transcription: 'халихóн', translation: 'ходунки', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_13', hebrew: 'מָקֵל', hebrewPlain: 'מקל', transcription: 'макéль', translation: 'трость, палка', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      // --- МЕДОБОРУДОВАНИЕ ---
      { id: 'cg_d_14', hebrew: 'מַד-חוֹם', hebrewPlain: 'מד-חום', transcription: 'мад-хóм', translation: 'термометр', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_15', hebrew: 'מַד-לָחַץ', hebrewPlain: 'מד-לחץ', transcription: 'мад-лáхац', translation: 'тонометр (давление)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_16', hebrew: 'גְּלוּקוֹמֶטֶר', hebrewPlain: 'גלוקומטר', transcription: 'глюкóметер', translation: 'глюкометр (сахар)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_17', hebrew: 'סְטֶטוֹסְקוֹפּ', hebrewPlain: 'סטטוסקופ', transcription: 'стетоскóп', translation: 'стетоскоп', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_18', hebrew: 'מִיקְרוֹגַל', hebrewPlain: 'מיקרוגל', transcription: 'микрогáль', translation: 'микроволновка', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      // --- ЕДА И ПОСУДА ---
      { id: 'cg_d_19', hebrew: 'קְעָרָה', hebrewPlain: 'קערה', transcription: 'кеарá', translation: 'тарелка, миска', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_20', hebrew: 'כַּף', hebrewPlain: 'כף', transcription: 'каф', translation: 'ложка', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_21', hebrew: 'כּוֹס', hebrewPlain: 'כוס', transcription: 'кос', translation: 'стакан, чашка', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_22', hebrew: 'קַשִׁית', hebrewPlain: 'קשית', transcription: 'кашит', translation: 'соломинка для питья', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_23', hebrew: 'מַפִּית', hebrewPlain: 'מפית', transcription: 'мапит', translation: 'салфетка', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_d_24', hebrew: 'סִינֵר', hebrewPlain: 'סינר', transcription: 'синéр', translation: 'нагрудник, фартук', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_d_25', hebrew: 'מַיִם', hebrewPlain: 'מים', transcription: 'máим', translation: 'вода', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
    ],
  },

  // ==========================================
  // МЕТАПЕЛЕТ — ЛЕКАРСТВА И ПРОЦЕДУРЫ
  // ==========================================
  {
    id: 'caregiver-meds',
    title: 'Метапелет — Лекарства и процедуры',
    titleHebrew: 'מְטַפֶּלֶת — תְּרוּפוֹת וּנְהָלִים',
    description: 'Названия лекарств, дозировок, процедур и медицинских понятий. Обязательный словарь для контроля приёма препаратов.',
    level: 'all',
    category: 'caregiver',
    icon: 'Heart',
    words: [
      // --- ЛЕКАРСТВА ---
      { id: 'cg_m_1', hebrew: 'תְּרוּפָה', hebrewPlain: 'תרופה', transcription: 'трýфа', translation: 'лекарство', partOfSpeech: 'noun', gender: 'f', plural: 'תרופות', lessonId: 0 },
      { id: 'cg_m_2', hebrew: 'טַבְלֵט', hebrewPlain: 'טבלט', transcription: 'таблéт', translation: 'таблетка', partOfSpeech: 'noun', gender: 'm', plural: 'טבלטים', lessonId: 0 },
      { id: 'cg_m_3', hebrew: 'כַּמּוּסָה', hebrewPlain: 'כמוסה', transcription: 'камусá', translation: 'капсула', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_m_4', hebrew: 'טִפּוֹת', hebrewPlain: 'טיפות', transcription: 'типóт', translation: 'капли', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_m_5', hebrew: 'מִשְׁחָה', hebrewPlain: 'משחה', transcription: 'мишхá', translation: 'мазь, крем', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_m_6', hebrew: 'מִרְשָׁם', hebrewPlain: 'מרשם', transcription: 'миршам', translation: 'рецепт', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_m_7', hebrew: 'מִנּוּן', hebrewPlain: 'מינון', transcription: 'минун', translation: 'дозировка, доза', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_m_8', hebrew: 'פַּרָצֵטָמוֹל', hebrewPlain: 'פרצטמול', transcription: 'парацетамóл', translation: 'парацетамол', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_m_9', hebrew: 'מְשַׁכֵּךְ כְּאֵב', hebrewPlain: 'משכך כאב', transcription: 'мешакéх кеэв', translation: 'обезболивающее', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_m_10', hebrew: 'אַנְטִיבְּיוֹטִיקָה', hebrewPlain: 'אנטיביוטיקה', transcription: 'антибйотика', translation: 'антибиотик', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      // --- ПРОЦЕДУРЫ ---
      { id: 'cg_m_11', hebrew: 'זְרִיקָה', hebrewPlain: 'זריקה', transcription: 'зрикá', translation: 'укол, инъекция', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_m_12', hebrew: 'עֲנִיבַת תַּחְבּוֹשֶׁת', hebrewPlain: 'עניבת תחבושת', transcription: 'аниват тахбóшет', translation: 'перевязка', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_m_13', hebrew: 'תַּחְבּוֹשֶׁת', hebrewPlain: 'תחבושת', transcription: 'тахбóшет', translation: 'повязка, бинт', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_m_14', hebrew: 'פִיזְיוֹתֶרָפְּיָה', hebrewPlain: 'פיזיותרפיה', transcription: 'физйотерапья', translation: 'физиотерапия', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_m_15', hebrew: 'בְּדִיקַת דָּם', hebrewPlain: 'בדיקת דם', transcription: 'бдикат дам', translation: 'анализ крови', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_m_16', hebrew: 'אֶקְג', hebrewPlain: 'אקג', transcription: 'экг', translation: 'ЭКГ', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      // --- РАСПИСАНИЕ ---
      { id: 'cg_m_17', hebrew: 'בַּבֹּקֶר', hebrewPlain: 'בבוקר', transcription: 'бабóкер', translation: 'утром', partOfSpeech: 'adverb', lessonId: 0 },
      { id: 'cg_m_18', hebrew: 'בַּצָּהֳרַיִם', hebrewPlain: 'בצהריים', transcription: 'бацахорáим', translation: 'в обед, днём', partOfSpeech: 'adverb', lessonId: 0 },
      { id: 'cg_m_19', hebrew: 'בָּעֶרֶב', hebrewPlain: 'בערב', transcription: 'баéрев', translation: 'вечером', partOfSpeech: 'adverb', lessonId: 0 },
      { id: 'cg_m_20', hebrew: 'בַּלַּיְלָה', hebrewPlain: 'בלילה', transcription: 'балáйла', translation: 'ночью', partOfSpeech: 'adverb', lessonId: 0 },
      { id: 'cg_m_21', hebrew: 'לִפְנֵי אֲכִילָה', hebrewPlain: 'לפני אכילה', transcription: 'лифнéй ахилá', translation: 'до еды', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_m_22', hebrew: 'אַחֲרֵי אֲכִילָה', hebrewPlain: 'אחרי אכילה', transcription: 'ахарéй ахилá', translation: 'после еды', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_m_23', hebrew: 'פַּעַם בְּיוֹם', hebrewPlain: 'פעם ביום', transcription: 'паám бейóм', translation: 'один раз в день', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_m_24', hebrew: 'שְׁתֵּי פְּעָמִים בְּיוֹם', hebrewPlain: 'שתי פעמים ביום', transcription: 'штей пеамим бейóм', translation: 'два раза в день', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_m_25', hebrew: 'כָּל שָׁמוֹנֶה שָׁעוֹת', hebrewPlain: 'כל שמונה שעות', transcription: 'коль шмонэ шаóт', translation: 'каждые 8 часов', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },

  // ==========================================
  // МЕТАПЕЛЕТ — ОБЩЕНИЕ С ПОДОПЕЧНЫМ И СЕМЬЁЙ
  // ==========================================
  {
    id: 'caregiver-talk',
    title: 'Метапелет — Общение и фразы',
    titleHebrew: 'מְטַפֶּלֶת — שִׂיחָה וּבִּטּוּיִים',
    description: 'Фразы для общения с пожилым подопечным и его семьёй: просьбы, утешение, объяснение действий, вопросы о самочувствии.',
    level: 'all',
    category: 'caregiver',
    icon: 'Users',
    words: [
      // --- ВОПРОСЫ О САМОЧУВСТВИИ ---
      { id: 'cg_t_1', hebrew: 'אֵיךְ אַתָּה מַרְגִּישׁ?', hebrewPlain: 'איך אתה מרגיש?', transcription: 'эйх атá маргíш?', translation: 'Как ты себя чувствуешь? (м.р.)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_2', hebrew: 'אֵיךְ אַתְּ מַרְגִּישָׁה?', hebrewPlain: 'איך את מרגישה?', transcription: 'эйх ат маргишá?', translation: 'Как ты себя чувствуешь? (ж.р.)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_3', hebrew: 'הַאִם כּוֹאֵב לְךָ?', hebrewPlain: 'האם כואב לך?', transcription: 'хаим коэв лехá?', translation: 'Тебе больно? (м.р.)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_4', hebrew: 'אֵיפֹה כּוֹאֵב לְךָ?', hebrewPlain: 'איפה כואב לך?', transcription: 'эйфо коэв лехá?', translation: 'Где болит? (м.р.)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_5', hebrew: 'אַתָּה יָכוֹל לָקוּם?', hebrewPlain: 'אתה יכול לקום?', transcription: 'атá яхóль лакýм?', translation: 'Ты можешь встать? (м.р.)', partOfSpeech: 'expression', lessonId: 0 },
      // --- ИНСТРУКЦИИ И ПРОСЬБЫ ---
      { id: 'cg_t_6', hebrew: 'בּוֹא נִרְחַץ', hebrewPlain: 'בוא נרחץ', transcription: 'бо нирхáц', translation: 'Пойдём купаться', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_7', hebrew: 'עַכְשָׁו נֶאֱכַל', hebrewPlain: 'עכשיו נאכל', transcription: 'ахшáв неехáль', translation: 'Сейчас поедим', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_8', hebrew: 'אֲנִי אֶסַּיֵּעַ לְךָ', hebrewPlain: 'אני אסייע לך', transcription: 'ани асайéа лехá', translation: 'Я тебе помогу', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_9', hebrew: 'אַל תִּירָא', hebrewPlain: 'אל תירא', transcription: 'аль тирá', translation: 'Не бойся (м.р.)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_10', hebrew: 'הַכֹּל בְּסֵדֶר', hebrewPlain: 'הכל בסדר', transcription: 'хаколь бесéдер', translation: 'Всё в порядке', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_11', hebrew: 'תִּירָגַע', hebrewPlain: 'תירגע', transcription: 'тирагéа', translation: 'Расслабься, успокойся (м.р.)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_12', hebrew: 'אֲנִי כָּאן', hebrewPlain: 'אני כאן', transcription: 'ани кан', translation: 'Я здесь, я рядом', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_13', hebrew: 'עוֹד רֶגַע', hebrewPlain: 'עוד רגע', transcription: 'од рéгаа', translation: 'Ещё секунду, сейчас', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_14', hebrew: 'קָטָן קָטָן', hebrewPlain: 'קטן קטן', transcription: 'катан катан', translation: 'Потихоньку, не торопись', partOfSpeech: 'expression', lessonId: 0 },
      // --- ОБЩЕНИЕ С СЕМЬЁЙ ---
      { id: 'cg_t_15', hebrew: 'הוּא מַרְגִּישׁ טוֹב הַיּוֹם', hebrewPlain: 'הוא מרגיש טוב היום', transcription: 'ху маргíш тов hayóм', translation: 'Он хорошо себя чувствует сегодня', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_16', hebrew: 'יֵשׁ בְּעָיָה', hebrewPlain: 'יש בעיה', transcription: 'йеш беайá', translation: 'Есть проблема', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_17', hebrew: 'צָרִיךְ רוֹפֵא', hebrewPlain: 'צריך רופא', transcription: 'царих рофé', translation: 'Нужен врач', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_18', hebrew: 'הוּא לֹא אָכַל', hebrewPlain: 'הוא לא אכל', transcription: 'ху ло ахáль', translation: 'Он не ел', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_19', hebrew: 'הוּא יָשַׁן טוֹב', hebrewPlain: 'הוא ישן טוב', transcription: 'ху йашáн тов', translation: 'Он хорошо спал', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'cg_t_20', hebrew: 'לָקַחְתִּי אֶת הַתְּרוּפָה', hebrewPlain: 'לקחתי את התרופה', transcription: 'лакáхти эт хатрýфа', translation: 'Я дала лекарство', partOfSpeech: 'expression', lessonId: 0 },
      // --- КЛЮЧЕВЫЕ СЛОВА ---
      { id: 'cg_t_21', hebrew: 'רוֹפֵא', hebrewPlain: 'רופא', transcription: 'рофé', translation: 'врач (м.р.)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_t_22', hebrew: 'אָחוֹת', hebrewPlain: 'אחות', transcription: 'ахóт', translation: 'медсестра', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'cg_t_23', hebrew: 'בֵּית חוֹלִים', hebrewPlain: 'בית חולים', transcription: 'бейт холим', translation: 'больница', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_t_24', hebrew: 'אַמְבּוּלַנְס', hebrewPlain: 'אמבולנס', transcription: 'амбуланс', translation: 'скорая помощь', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'cg_t_25', hebrew: 'מָגֵן דָּוִד אָדֹם', hebrewPlain: 'מגן דוד אדום', transcription: 'магéн давид адóм', translation: 'скорая помощь (Маген Давид)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
    ],
  },
];

/**
 * Получить все профессиональные колоды
 */
export function getAllProfessionalDecks(): ThematicDeck[] {
  return PROFESSIONAL_DECKS;
}

/**
 * Получить колоды по профессии (prefix)
 */
export function getProfessionalDecksByProfession(prefix: string): ThematicDeck[] {
  return PROFESSIONAL_DECKS.filter((d) => d.id.startsWith(prefix));
}

/**
 * Получить колоду по ID
 */
export function getProfessionalDeckById(id: string): ThematicDeck | undefined {
  return PROFESSIONAL_DECKS.find((d) => d.id === id);
}
