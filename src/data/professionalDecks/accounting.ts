/**
 * Профессиональные тематические словари
 *
 * БУХГАЛТЕР, НАЛОГИ И ФИНАНСЫ (רוֹאֵה חֶשְׁבּוֹן, הַנְהָלַת חֶשְׁבּוֹנוֹת וּמִסִּים)
 *
 * Колоды:
 *   1. accounting-verbs     — Глаголы расчёта, списания и отчётности (25 слов)
 *   2. accounting-taxes     — Налоги, вычеты и государственные службы (25 слов)
 *   3. accounting-docs      — Документы, отчёты и формы бизнеса (25 слов)
 *   4. accounting-dialogue  — Разговор с клиентом, банком и налоговой (25 фраз)
 */

import { ThematicDeck } from '@/types';

export const ACCOUNTING_DECKS: ThematicDeck[] = [
  // ==========================================
  // БУХГАЛТЕРИЯ — ГЛАГОЛЫ
  // ==========================================
  {
    id: 'accounting-verbs',
    title: 'Бухгалтерия — Глаголы финансов и налогов',
    titleHebrew: 'הַנְהָלַת חֶשְׁבּוֹנוֹת — פְּעָלִים שֶׁל כְּסָפִים וּמִסִּים',
    description: '25 ключевых глаголов учёта: рассчитывать, списывать, начислять, взаимозачитывать налоги, выписывать счета, балансировать и удерживать у источника. Спряжения и семья корня — по кнопке «Пеалим».',
    level: 'all',
    category: 'accounting',
    icon: 'Calculator',
    words: [
      { id: 'acc_v_1', hebrew: 'לְחַשֵּׁב', hebrewPlain: 'לחשב', transcription: 'лехашéв', translation: 'рассчитывать, вычислять', partOfSpeech: 'verb', root: 'ח-ש-ב', lessonId: 0 },
      { id: 'acc_v_2', hebrew: 'לְחַיֵּיב', hebrewPlain: 'לחייב', transcription: 'лехайéв', translation: 'дебетовать, списывать со счёта, начислять к оплате', partOfSpeech: 'verb', root: 'ח-י-ב', lessonId: 0 },
      { id: 'acc_v_3', hebrew: 'לְזַכּוֹת', hebrewPlain: 'לזכות', transcription: 'лезакóт', translation: 'кредитовать, возмещать средства, начислять льготу', partOfSpeech: 'verb', root: 'ז-כ-ה', lessonId: 0 },
      { id: 'acc_v_4', hebrew: 'לְהָפִיק', hebrewPlain: 'להפיק', transcription: 'леhафӣк', translation: 'выпускать, генерировать (счёт, отчёт)', partOfSpeech: 'verb', root: 'פ-ו-ק', lessonId: 0 },
      { id: 'acc_v_5', hebrew: 'לְקַזֵּז', hebrewPlain: 'לקזז', transcription: 'леказéз', translation: 'взаимозачитывать, сальдировать (налог)', partOfSpeech: 'verb', root: 'ק-ז-ז', lessonId: 0 },
      { id: 'acc_v_6', hebrew: 'לְנַכּוֹת', hebrewPlain: 'לנכות', transcription: 'ленакóт', translation: 'удерживать, вычитать (налог у источника)', partOfSpeech: 'verb', root: 'נ-כ-ה', lessonId: 0 },
      { id: 'acc_v_7', hebrew: 'לִגְבּוֹת', hebrewPlain: 'לגבות', transcription: 'лигбóт', translation: 'взимать, собирать оплату с клиентов', partOfSpeech: 'verb', root: 'ג-ב-ה', lessonId: 0 },
      { id: 'acc_v_8', hebrew: 'לְדַוֵּוחַ', hebrewPlain: 'לדווח', transcription: 'ледавéах', translation: 'подавать отчётность, декларировать', partOfSpeech: 'verb', root: 'ד-ו-ח', lessonId: 0 },
      { id: 'acc_v_9', hebrew: 'לְאַזֵּן', hebrewPlain: 'לאזן', transcription: 'леазéн', translation: 'сводить баланс, уравновешивать', partOfSpeech: 'verb', root: 'א-ז-ן', lessonId: 0 },
      { id: 'acc_v_10', hebrew: 'לְהַפְקִיד', hebrewPlain: 'להפקיד', transcription: 'леhафкӣд', translation: 'вносить на банковский счёт, депонировать', partOfSpeech: 'verb', root: 'פ-ק-ד', lessonId: 0 },
      { id: 'acc_v_11', hebrew: 'לִמְשׁוֹךְ כֶּסֶף', hebrewPlain: 'למשוך כסף', transcription: 'лимшóх кéсеф', translation: 'снимать деньги со счёта', partOfSpeech: 'verb', root: 'מ-ש-ך', lessonId: 0 },
      { id: 'acc_v_12', hebrew: 'לְהַעֲבִיר תַּשְׁלוּם', hebrewPlain: 'להעביר תשלום', transcription: 'леhаавӣр ташлу́м', translation: 'переводить платёж, делать перевод', partOfSpeech: 'verb', root: 'ע-ב-ר', lessonId: 0 },
      { id: 'acc_v_13', hebrew: 'לְשַׁלֵּם מִסִּים', hebrewPlain: 'לשלם מסים', transcription: 'лешалéм мисӣм', translation: 'платить налоги', partOfSpeech: 'verb', root: 'ש-ל-ם', lessonId: 0 },
      { id: 'acc_v_14', hebrew: 'לִפְתּוֹחַ תִּיק', hebrewPlain: 'לפתוח תיק', transcription: 'лифтóах тик', translation: 'открывать дело в налоговых органах', partOfSpeech: 'verb', root: 'פ-ת-ח', lessonId: 0 },
      { id: 'acc_v_15', hebrew: 'לִסְגּוֹר שָׁנָה', hebrewPlain: 'לסגור שנה', transcription: 'лисгóр шанá', translation: 'закрывать финансовый год', partOfSpeech: 'verb', root: 'ס-ג-ר', lessonId: 0 },
      { id: 'acc_v_16', hebrew: 'לְנַהֵל סְפָרִים', hebrewPlain: 'לנהל ספרים', transcription: 'ленаhéль сфарӣм', translation: 'вести бухгалтерские книги', partOfSpeech: 'verb', root: 'נ-ה-ל', lessonId: 0 },
      { id: 'acc_v_17', hebrew: 'לַעֲקוֹב אַחֲרֵי הוֹצָאוֹת', hebrewPlain: 'לעקוב אחרי הוצאות', transcription: 'лаакóв ахарéй hоцаóт', translation: 'отслеживать расходы', partOfSpeech: 'verb', root: 'ע-ק-ב', lessonId: 0 },
      { id: 'acc_v_18', hebrew: 'לִפְרוֹס תַּשְׁלוּמִים', hebrewPlain: 'לפרוס תשלומים', transcription: 'лифрóс ташлумӣм', translation: 'разбивать на платежи / рассрочку', partOfSpeech: 'verb', root: 'פ-ר-ס', lessonId: 0 },
      { id: 'acc_v_19', hebrew: 'לְבַטֵּל חֶשְׁבּוֹנִית', hebrewPlain: 'לבטל חשבונית', transcription: 'лебатéль хешбонӣт', translation: 'аннулировать счёт-фактуру', partOfSpeech: 'verb', root: 'ב-ט-ל', lessonId: 0 },
      { id: 'acc_v_20', hebrew: 'לְבַקֵּר דּוּחוֹת', hebrewPlain: 'לבקר דוחות', transcription: 'левакéр духот', translation: 'аудировать, проверять финансовые отчёты', partOfSpeech: 'verb', root: 'ב-ק-ר', lessonId: 0 },
      { id: 'acc_v_21', hebrew: 'לְהַשְׁקִיעַ', hebrewPlain: 'להשקיע', transcription: 'леhашкӣа', translation: 'инвестировать, вкладывать средства', partOfSpeech: 'verb', root: 'ש-ק-ע', lessonId: 0 },
      { id: 'acc_v_22', hebrew: 'לְהַפְרִישׁ לִפְנְסִיָּה', hebrewPlain: 'להפריש לפנסיה', transcription: 'леhафрӣш лепéнсия', translation: 'делать отчисления в пенсионный фонд', partOfSpeech: 'verb', root: 'פ-ר-ש', lessonId: 0 },
      { id: 'acc_v_23', hebrew: 'לְהַפְחִית פְּחָת', hebrewPlain: 'להפחית פחת', transcription: 'леhафхӣт пхат', translation: 'списывать амортизацию оборудования', partOfSpeech: 'verb', root: 'פ-ח-ת', lessonId: 0 },
      { id: 'acc_v_24', hebrew: 'לְהַגִּישׁ עַרְעוּר', hebrewPlain: 'להגיש ערעור', transcription: 'леhагӣш эр’ӯр', translation: 'подавать апелляцию / обжалование', partOfSpeech: 'verb', root: 'נ-ג-ש', lessonId: 0 },
      { id: 'acc_v_25', hebrew: 'לְהַסְדִּיר חוֹב', hebrewPlain: 'להסדיר חוב', transcription: 'леhасдӣр хов', translation: 'урегулировать задолженность', partOfSpeech: 'verb', root: 'ס-ד-ר', lessonId: 0 },
    ],
  },

  // ==========================================
  // БУХГАЛТЕРИЯ — НАЛОГИ И ВЕДОМСТВА
  // ==========================================
  {
    id: 'accounting-taxes',
    title: 'Бухгалтерия — Налоги и ведомства',
    titleHebrew: 'הַנְהָלַת חֶשְׁבּוֹנוֹת — מִסִּים וּמוֹסָדוֹת',
    description: '25 терминов налоговой системы Израиля: подоходный налог, НДС (מע״מ), Битуах Леуми, авансы, налоговые баллы, возврат налога и пенсия.',
    level: 'all',
    category: 'accounting',
    icon: 'Receipt',
    words: [
      { id: 'acc_t_1', hebrew: 'מַס הַכְנָסָה', hebrewPlain: 'מס הכנסה', transcription: 'мас hахнасá', translation: 'подоходный налог', partOfSpeech: 'noun', gender: 'm', root: 'כ-נ-ס', lessonId: 0 },
      { id: 'acc_t_2', hebrew: 'מַעַ״מ (מַס עֵרֶךְ מוּסָף)', hebrewPlain: 'מעמ', transcription: 'мáам (мас éрех мусáф)', translation: 'НДС (налог на добавленную стоимость)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'acc_t_3', hebrew: 'בִּיטּוּחַ לְאוּמִּי', hebrewPlain: 'ביטוח לאומי', transcription: 'битӯах леумӣ', translation: 'Служба национального страхования (Битуах Леуми)', partOfSpeech: 'noun', gender: 'm', root: 'ב-ט-ח', lessonId: 0 },
      { id: 'acc_t_4', hebrew: 'מַס בְּרִיאוּת', hebrewPlain: 'מס בריאות', transcription: 'мас бриӯт', translation: 'налог на здравоохранение', partOfSpeech: 'noun', gender: 'm', root: 'ב-ר-א', lessonId: 0 },
      { id: 'acc_t_5', hebrew: 'מִקְדָּמוֹת', hebrewPlain: 'מקדמות', transcription: 'микдамóт', translation: 'авансовые налоговые платежи', partOfSpeech: 'noun', gender: 'f', root: 'ק-ד-ם', lessonId: 0 },
      { id: 'acc_t_6', hebrew: 'נִיכּוּי בַּמָּקוֹר', hebrewPlain: 'ניכוי במקור', transcription: 'нику́й бамакóр', translation: 'удержание налога у источника выплаты', partOfSpeech: 'noun', gender: 'm', root: 'נ-כ-ה', lessonId: 0 },
      { id: 'acc_t_7', hebrew: 'נְקוּדּוֹת זִיכּוּי', hebrewPlain: 'נקודות זיכוי', transcription: 'некудóт зику́й', translation: 'льготные налоговые баллы (скидка с налога)', partOfSpeech: 'noun', gender: 'f', root: 'ז-כ-ה', lessonId: 0 },
      { id: 'acc_t_8', hebrew: 'הֶחְזֵר מַס', hebrewPlain: 'החזר מס', transcription: 'hехзéр мас', translation: 'возврат излишне уплаченного налога', partOfSpeech: 'noun', gender: 'm', root: 'ח-ז-ר', lessonId: 0 },
      { id: 'acc_t_9', hebrew: 'שְׁנַת מַס', hebrewPlain: 'שנת מס', transcription: 'шнат мас', translation: 'налоговый / финансовый год', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'acc_t_10', hebrew: 'הוֹצָאָה מוּכֶּרֶת', hebrewPlain: 'הוצאה מוכרת', transcription: 'hоцаá мукéрет', translation: 'признанный для вычета расход бизнеса', partOfSpeech: 'noun', gender: 'f', root: 'י-צ-א', lessonId: 0 },
      { id: 'acc_t_11', hebrew: 'הוֹצָאָה עִסְקִית', hebrewPlain: 'הוצאה עסקית', transcription: 'hоцаá искӣт', translation: 'коммерческий / деловой расход', partOfSpeech: 'noun', gender: 'f', root: 'ע-ס-ק', lessonId: 0 },
      { id: 'acc_t_12', hebrew: 'פְּחָת', hebrewPlain: 'פחת', transcription: 'пхат', translation: 'амортизация основных средств', partOfSpeech: 'noun', gender: 'm', root: 'פ-ח-ת', lessonId: 0 },
      { id: 'acc_t_13', hebrew: 'תֵּיאוּם מַס', hebrewPlain: 'תיאום מס', transcription: 'теу́м мас', translation: 'согласование налогов (при работе на 2+ ставках)', partOfSpeech: 'noun', gender: 'm', root: 'ת-א-ם', lessonId: 0 },
      { id: 'acc_t_14', hebrew: 'קְנָס / רִיבִּית פִּיגּוּרִים', hebrewPlain: 'קנס', transcription: 'кнас / рибӣт пигурӣм', translation: 'штраф / пени за просрочку платежа', partOfSpeech: 'noun', gender: 'm', root: 'ק-נ-ס', lessonId: 0 },
      { id: 'acc_t_15', hebrew: 'שׁוּמַּת מַס', hebrewPlain: 'שומת מס', transcription: 'шумáт мас', translation: 'налоговое начисление / оценка инспектора', partOfSpeech: 'noun', gender: 'f', root: 'ש-ו-ם', lessonId: 0 },
      { id: 'acc_t_16', hebrew: 'פְּקִיד שׁוּמָּה', hebrewPlain: 'פקיד שומה', transcription: 'пкӣд шумá', translation: 'налоговый инспектор / чиновник мас ахнаса', partOfSpeech: 'noun', gender: 'm', root: 'פ-ק-ד', lessonId: 0 },
      { id: 'acc_t_17', hebrew: 'הַצְהָרַת הוֹן', hebrewPlain: 'הצהרת הון', transcription: 'hацhарáт hон', translation: 'декларация об имуществе и капитале', partOfSpeech: 'noun', gender: 'f', root: 'צ-h-ר', lessonId: 0 },
      { id: 'acc_t_18', hebrew: 'פְּטוֹר מִמַּס', hebrewPlain: 'פטור ממס', transcription: 'птор мимáс', translation: 'освобождение от уплаты налога', partOfSpeech: 'noun', gender: 'm', root: 'פ-ט-ר', lessonId: 0 },
      { id: 'acc_t_19', hebrew: 'מַס שֶׁבַח', hebrewPlain: 'מס שבח', transcription: 'мас шéвах', translation: 'налог на прирост капитала при продаже недвижимости', partOfSpeech: 'noun', gender: 'm', root: 'ש-ב-ח', lessonId: 0 },
      { id: 'acc_t_20', hebrew: 'מַס רְכִישָׁה', hebrewPlain: 'מס רכישה', transcription: 'мас рехишá', translation: 'налог на покупку недвижимости', partOfSpeech: 'noun', gender: 'm', root: 'ר-כ-ש', lessonId: 0 },
      { id: 'acc_t_21', hebrew: 'מַס חֲבָרוֹת', hebrewPlain: 'מס חברות', transcription: 'мас хаварóт', translation: 'корпоративный налог на прибыль компаний', partOfSpeech: 'noun', gender: 'm', root: 'ח-ב-ר', lessonId: 0 },
      { id: 'acc_t_22', hebrew: 'קֶרֶן פֶּנְסִיָּה', hebrewPlain: 'קרן פנסיה', transcription: 'кéрен пéнсия', translation: 'пенсионный фонд', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'acc_t_23', hebrew: 'קֶרֶן הִשְׁתַּלְּמוּת', hebrewPlain: 'קרן השתלמות', transcription: 'кéрен hиштальмӯт', translation: 'фонд повышения квалификации (безналоговый)', partOfSpeech: 'noun', gender: 'f', root: 'ש-ל-ם', lessonId: 0 },
      { id: 'acc_t_24', hebrew: 'פִּיצּוּיֵי פִּיטּוּרִין', hebrewPlain: 'פיצויי פיטורין', transcription: 'пицуйéй питурӣн', translation: 'выходное пособие при увольнении', partOfSpeech: 'noun', gender: 'm', root: 'פ-צ-ה', lessonId: 0 },
      { id: 'acc_t_25', hebrew: 'תִּקְרַת הַכְנָסָה', hebrewPlain: 'תקרת הכנסה', transcription: 'тикрáт hахнасá', translation: 'потолок / лимит дохода', partOfSpeech: 'noun', gender: 'f', root: 'ק-ר-ה', lessonId: 0 },
    ],
  },

  // ==========================================
  // БУХГАЛТЕРИЯ — ДОКУМЕНТЫ И ФОРМЫ БИЗНЕСА
  // ==========================================
  {
    id: 'accounting-docs',
    title: 'Бухгалтерия — Документы и отчёты',
    titleHebrew: 'הַנְהָלַת חֶשְׁבּוֹנוֹת — מִסְמָכִים, דּוּחוֹת וְעֲסָקִים',
    description: '25 типов документов и статусов бизнеса: חשבונית מס, קבלה, תלוש שכר, עוסק מורשה, עוסק פטור, חברה בע״מ, מאזן и отчёт о прибылях и убытках.',
    level: 'all',
    category: 'accounting',
    icon: 'CreditCard',
    words: [
      { id: 'acc_d_1', hebrew: 'חֶשְׁבּוֹנִית מַס', hebrewPlain: 'חשבונית מס', transcription: 'хешбонӣт мас', translation: 'налоговый счёт-фактура (инвойс)', partOfSpeech: 'noun', gender: 'f', root: 'ח-ש-ב', lessonId: 0 },
      { id: 'acc_d_2', hebrew: 'קַבָּלָה', hebrewPlain: 'קבלה', transcription: 'кабалá', translation: 'квитанция, чек об оплате', partOfSpeech: 'noun', gender: 'f', root: 'ק-ב-ל', lessonId: 0 },
      { id: 'acc_d_3', hebrew: 'חֶשְׁבּוֹנִית מַס / קַבָּלָה', hebrewPlain: 'חשבונית מס קבלה', transcription: 'хешбонӣт мас кабалá', translation: 'счёт-квитанция (счёт совмещённый с чеком)', partOfSpeech: 'noun', gender: 'f', root: 'ח-ש-ב', lessonId: 0 },
      { id: 'acc_d_4', hebrew: 'חֶשְׁבּוֹנִית עִסְקָה', hebrewPlain: 'חשבונית עסקה', transcription: 'хешбонӣт искá', translation: 'требование платежа / проформа-инвойс', partOfSpeech: 'noun', gender: 'f', root: 'ח-ש-ב', lessonId: 0 },
      { id: 'acc_d_5', hebrew: 'הוֹדָעַת זִיכּוּי', hebrewPlain: 'הודעת זיכוי', transcription: 'hодаáт зику́й', translation: 'кредит-нота, счёт возврата', partOfSpeech: 'noun', gender: 'f', root: 'ז-כ-ה', lessonId: 0 },
      { id: 'acc_d_6', hebrew: 'תְּלוּשׁ שָׂכָר', hebrewPlain: 'תלוש שכר', transcription: 'тлуш сахáр', translation: 'зарплатный листок, расчетная ведомость', partOfSpeech: 'noun', gender: 'm', root: 'ש-כ-ר', lessonId: 0 },
      { id: 'acc_d_7', hebrew: 'טוֹפֶס 101', hebrewPlain: 'טופס 101', transcription: 'тóфес мéа веэхáд', translation: 'форма 101 (декларация работника при найме)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'acc_d_8', hebrew: 'טוֹפֶס 106', hebrewPlain: 'טופס 106', transcription: 'тóфес мéа вешéш', translation: 'форма 106 (годовая сводка зарплаты и налогов)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'acc_d_9', hebrew: 'עוֹסֵק פָּטוּר', hebrewPlain: 'עוסק פטור', transcription: 'осéк патӯр', translation: 'освобождённый предприниматель (до лимита)', partOfSpeech: 'noun', gender: 'm', root: 'ע-ס-ק', lessonId: 0 },
      { id: 'acc_d_10', hebrew: 'עוֹסֵק מוּרְשֶׁה', hebrewPlain: 'עוסק מורשה', transcription: 'осéк муршé', translation: 'лицензированный предприниматель (плательщик НДС)', partOfSpeech: 'noun', gender: 'm', root: 'ע-ס-ק', lessonId: 0 },
      { id: 'acc_d_11', hebrew: 'חֶבְרָה בָּעָ״מ', hebrewPlain: 'חברה בעמ', transcription: 'хеврá баáм', translation: 'компания с ограниченной ответственностью (ООО)', partOfSpeech: 'noun', gender: 'f', root: 'ח-ב-ר', lessonId: 0 },
      { id: 'acc_d_12', hebrew: 'עֲמוּתָּה', hebrewPlain: 'עמותה', transcription: 'амутá', translation: 'некоммерческая организация (НКО)', partOfSpeech: 'noun', gender: 'f', root: 'ע-מ-ת', lessonId: 0 },
      { id: 'acc_d_13', hebrew: 'מַאֲזָן', hebrewPlain: 'מאזן', transcription: 'маазáн', translation: 'бухгалтерский баланс', partOfSpeech: 'noun', gender: 'm', root: 'א-ז-ן', lessonId: 0 },
      { id: 'acc_d_14', hebrew: 'דּוּ״חַ רֶוַוח וְהֶפְסֵד', hebrewPlain: 'דוח רווח והפסד', transcription: 'дóах рéвах веhефсéд', translation: 'отчёт о прибылях и убытках (P&L)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'acc_d_15', hebrew: 'תַּזְרִים מְזוּמָּנִים', hebrewPlain: 'תזרים מזומנים', transcription: 'тазрӣм мезуманӣм', translation: 'отчёт о движении денежных средств (Cash Flow)', partOfSpeech: 'noun', gender: 'm', root: 'ז-ר-ם', lessonId: 0 },
      { id: 'acc_d_16', hebrew: 'נְכָסִים', hebrewPlain: 'נכסים', transcription: 'нехасӣм', translation: 'активы компании / имущество', partOfSpeech: 'noun', gender: 'm', root: 'נ-כ-ס', lessonId: 0 },
      { id: 'acc_d_17', hebrew: 'הִתְחַיְּיבוּיוֹת', hebrewPlain: 'התחייבויות', transcription: 'hитхайвею́т', translation: 'пассивы, финансовые обязательства', partOfSpeech: 'noun', gender: 'f', root: 'ח-י-ב', lessonId: 0 },
      { id: 'acc_d_18', hebrew: 'הוֹן עַצְמִי', hebrewPlain: 'הון עצמי', transcription: 'hон ацмӣ', translation: 'собственный капитал', partOfSpeech: 'noun', gender: 'm', root: 'ע-צ-ם', lessonId: 0 },
      { id: 'acc_d_19', hebrew: 'מְזוּמָּן', hebrewPlain: 'מזומן', transcription: 'мезумáн', translation: 'наличные деньги', partOfSpeech: 'noun', gender: 'm', root: 'ז-מ-ן', lessonId: 0 },
      { id: 'acc_d_20', hebrew: 'הַמְחָאָה / צֶ׳ק', hebrewPlain: 'המחאה', transcription: 'hамхаá / чек', translation: 'банковский чек', partOfSpeech: 'noun', gender: 'f', root: 'מ-ח-ה', lessonId: 0 },
      { id: 'acc_d_21', hebrew: 'הוֹרָאַת קֶבַע', hebrewPlain: 'הוראת קבע', transcription: 'hораáт кéва', translation: 'автоплатеж, постоянное поручение банку', partOfSpeech: 'noun', gender: 'f', root: 'ק-ב-ע', lessonId: 0 },
      { id: 'acc_d_22', hebrew: 'אֶשְׁרַאי', hebrewPlain: 'אשראי', transcription: 'ашрáй', translation: 'кредит, кредитная линия', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'acc_d_23', hebrew: 'רִיבִּית', hebrewPlain: 'ריבית', transcription: 'рибӣт', translation: 'процентная ставка, проценты по займу', partOfSpeech: 'noun', gender: 'f', root: 'ר-ב-ה', lessonId: 0 },
      { id: 'acc_d_24', hebrew: 'אוֹבֶרְדְרָאפְט / מְשִׁיכַת יֶתֶר', hebrewPlain: 'מינוס', transcription: 'óвердрафт / мисӣр', translation: 'овердрафт, «минус» на банковском счёте', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'acc_d_25', hebrew: 'יִתְרַת זְכוּת', hebrewPlain: 'יתרת זכות', transcription: 'йитрат зхут', translation: 'положительный остаток на счёте (плюс)', partOfSpeech: 'noun', gender: 'f', root: 'י-ת-ר', lessonId: 0 },
    ],
  },

  // ==========================================
  // БУХГАЛТЕРИЯ — ДИАЛОГ С КЛИЕНТОМ И НАЛОГОВОЙ
  // ==========================================
  {
    id: 'accounting-dialogue',
    title: 'Бухгалтерия — Диалоги и консультации',
    titleHebrew: 'הַנְהָלַת חֶשְׁבּוֹנוֹת — שִׂיחָה עִם לָקוֹחַ וְרָשׁוּיוֹת',
    description: '25 практических фраз: передача квитанций до 15 числа, возврат налогов, непризнанные расходы, сдача годового отчёта и оптимизация.',
    level: 'all',
    category: 'accounting',
    icon: 'Users',
    words: [
      { id: 'acc_l_1', hebrew: 'נָא לְהַעֲבִיר קַבָּלוֹת עַד הַ-15 בַּחוֹדֶשׁ', hebrewPlain: 'להעביר קבלות עד ה15', transcription: 'на леhаавӣр кабалóт ад hа-хамишá-асáр бахóдеш', translation: 'Пожалуйста, передайте квитанции до 15-го числа', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_2', hebrew: 'מַגִּיעַ לְךָ הֶחְזֵר מַס מַשְׁמָעוּתִי', hebrewPlain: 'מגיע לך החזר מס', transcription: 'магӣа лехá hехзéр мас машмаутӣ', translation: 'Вам полагается существенный возврат налога', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_3', hebrew: 'הַהוֹצָאָה הַזֹּאת אֵינָהּ מוּכֶּרֶת לְמַס', hebrewPlain: 'ההוצאה הזאת אינה מוכרת', transcription: 'hаhоцаá hазóт эйнá мукéрет лемáс', translation: 'Этот расход не признаётся налоговой инспекцией', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_4', hebrew: 'חֲסֵרָה לִי חֶשְׁבּוֹנִית עֲבוּר תַּשְׁלוּם זֶה', hebrewPlain: 'חסרה לי חשבונית', transcription: 'хасерá ли хешбонӣт авӯр ташлу́м зэ', translation: 'Мне не хватает квитанции/инвойса по этому платежу', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_5', hebrew: 'צָרִיךְ לַעֲשׂוֹת תֵּיאוּם מַס עֲבוּר שְׁתֵּי עֲבוֹדוֹת', hebrewPlain: 'תיאום מס לשתי עבודות', transcription: 'царӣх лаасóт теу́м мас авӯр штей аводóт', translation: 'Нужно сделать согласование налогов на две работы', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_6', hebrew: 'הַדּוּ״חַ הַשְּׁנָתִי הוּגַּשׁ בְּהַצְלָחָה', hebrewPlain: 'הדוח השנתי הוגש בהצלחה', transcription: 'hадóах hашнатӣ hугáш беhацлахá', translation: 'Годовой отчёт успешно отправлен в налоговую', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_7', hebrew: 'יֵשׁ לְשַׁלֵּם אֶת הַמַּעַ״מ עַד שָׁבוּעַ הַבָּא', hebrewPlain: 'לשלם את המעמ עד שבוע הבא', transcription: 'йеш лешалéм эт hамáам ад шавӯа hабá', translation: 'НДС нужно оплатить до следующей недели', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_8', hebrew: 'הַאִם עָדִיף לִהְיוֹת עוֹסֵק פָּטוּר אוֹ מוּרְשֶׁה?', hebrewPlain: 'עוסק פטור או מורשה?', transcription: 'hаим адӣф лиhйóт осéк патӯр о муршé?', translation: 'Что выгоднее: осек патур или осек мурше?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_9', hebrew: 'הַהַכְנָסוֹת עָבְרוּ אֶת הַתִּקְרָה שֶׁל עוֹסֵק פָּטוּר', hebrewPlain: 'ההכנסות עברו את התקרה', transcription: 'hаhахнасóт аврӯ эт hатикрá шель осéк патӯр', translation: 'Доходы превысили лимит для «осек патур»', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_10', hebrew: 'תַּפְקִיד אֶת הַכֶּסֶף לְקֶרֶן הִשְׁתַּלְּמוּת', hebrewPlain: 'להפקיד לקרן השתלמות', transcription: 'тафкӣд эт hакéсеф лекéрен hиштальмӯт', translation: 'Внесите деньги в керен иштальмут до конца года', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_11', hebrew: 'זֶה יַקְטִין אֶת תַּשְׁלוּם הַמַּס שֶׁלְּךָ', hebrewPlain: 'זה יקטין את תשלום המס', transcription: 'зэ йактӣн эт ташлу́м hамáс шельхá', translation: 'Это уменьшит сумму вашего налога к уплате', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_12', hebrew: 'צָרִיךְ לְעַדְכֵּן אֶת גּוֹבַהּ הַמִּקְדָּמוֹת', hebrewPlain: 'לעדכן את גובה המקדמות', transcription: 'царӣх леадкéн эт гóва hамикдамóт', translation: 'Нужно скорректировать размер налоговых авансов', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_13', hebrew: 'קִיבַּלְתָּ מִכְתָּב מִבִּיטּוּחַ לְאוּמִּי?', hebrewPlain: 'קיבלת מכתב מביטוח לאומי?', transcription: 'кибáльта михтáв мибитӯах леумӣ?', translation: 'Вы получали письмо из Битуах Леуми?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_14', hebrew: 'הַחֶשְׁבּוֹן שֶׁלְּךָ מְאוּזָּן לַחֲלוּטִין', hebrewPlain: 'החשבון שלך מאוזן לחלוטין', transcription: 'hахешбóн шельхá меузáн лахалутӣн', translation: 'Ваш баланс полностью сошёлся', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_15', hebrew: 'אֶפְשָׁר לִפְרוֹס אֶת הַחוֹב לְתַשְׁלוּמִים', hebrewPlain: 'לפרוס את החוב', transcription: 'эфшáр лифрóс эт hахóв леташлумӣм', translation: 'Можно разбить задолженность на платежи', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_16', hebrew: 'נָא לַחְתּוֹם עַל יִיפּוּי כּוֹחַ לָרוֹאֵה חֶשְׁבּוֹן', hebrewPlain: 'לחתום על ייפוי כוח', transcription: 'на лахтóм аль йипу́й кóах ларо’é хешбóн', translation: 'Пожалуйста, подпишите доверенность на бухгалтера', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_17', hebrew: 'הַשָּׂכָר נֶטּוֹ וְהַשָּׂכָר בְּרוּטוֹ', hebrewPlain: 'שכר נטו וברוטו', transcription: 'hасахáр нéто веhасахáр брӯто', translation: 'Зарплата «на руки» (нетто) и до вычетов (брутто)', partOfSpeech: 'noun', gender: 'm', root: 'ש-כ-ר', lessonId: 0 },
      { id: 'acc_l_18', hebrew: 'יֵשׁ לְךָ נְקוּדַּת זִיכּוּי נוֹסֶפֶת עַל יֶלֶד', hebrewPlain: 'נקודת זיכוי על ילד', transcription: 'йеш лехá некудáт зику́й носéфет аль йéлед', translation: 'Вам положен дополнительный налоговый балл за ребёнка', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_19', hebrew: 'מָה הָרֶוַוח הַנָּקִי הַשָּׁנָה?', hebrewPlain: 'מה הרווח הנקי?', transcription: 'ма hарéвах hанакӣ hашанá?', translation: 'Какова чистая прибыль в этом году?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_20', hebrew: 'שָׁמַרְתָּ אֶת הַקַּבָּלוֹת עַל הַדֶּלֶק?', hebrewPlain: 'שמרת קבלות על דלק?', transcription: 'шамáрта эт hакабалóт аль hадéлек?', translation: 'Вы сохранили чеки на бензин?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_21', hebrew: 'זֶה נִכְנָס תַּחַת הוֹצָאוֹת רֶכֶב', hebrewPlain: 'הוצאות רכב', transcription: 'зэ нихнáс тáхат hоцаóт рéхев', translation: 'Это идёт по статье авторасходов', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_22', hebrew: 'הַבַּנְק מְבַקֵּשׁ אֶת הַדּוּ״חַ הַמְּבוּקָּר', hebrewPlain: 'דוח מבוקר לבנק', transcription: 'hабáнк мевакéш эт hадóах hамевукáр', translation: 'Банк запрашивает аудированный годовой отчёт', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_23', hebrew: 'יֵשׁ לְהַגִּישׁ אֶת הַהַצְהָרָה עַד סוֹף הַחוֹדֶשׁ', hebrewPlain: 'להגיש את ההצהרה', transcription: 'йеш леhагӣш эт hаhацhарá ад соф hахóдеш', translation: 'Необходимо подать декларацию до конца месяца', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_24', hebrew: 'שְׁנַת עֲסָקִים מוּצְלַחַת וּפוֹרִיָּה!', hebrewPlain: 'שנת עסקים מוצלחת!', transcription: 'шнат асахӣм муцлáхат уфорйá!', translation: 'Успешного и прибыльного финансового года!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'acc_l_25', hebrew: 'אֲנַחְנוּ מְטַפְּלִים בְּכָל הַבֵּירוֹקְרַטְיָה', hebrewPlain: 'אנחנו מטפלים בבירוקרטיה', transcription: 'анáхну метаплӣм бехóль hабюрократия', translation: 'Мы берём всю бюрократию на себя', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },
];
