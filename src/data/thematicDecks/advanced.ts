/**
 * Продвинутые тематические колоды (Бет): Работа, банк/жилье, сленг, новости и общество
 */

import { ThematicDeck } from '@/types';

export const ADVANCED_DECKS: ThematicDeck[] = [
  // ==========================================
  // РАБОТА И HIGH-TECH
  // ==========================================
  {
    id: 'work-hitech-bet',
    title: 'Работа, Резюме, Офис и High-Tech',
    titleHebrew: 'עֲבוֹדָה, קוֹרוֹת חַיִּים וְהַי-טֶק',
    description: '35 слов для устройства на работу, резюме, собеседований и офисных будней.',
    level: 'bet',
    category: 'work',
    icon: 'Briefcase',
    words: [
      { id: 'w_bet_1', hebrew: 'קוֹרוֹת חַיִּים (ק״ח)', hebrewPlain: 'קורות חיים', transcription: 'корóт хайӣм (ку-хэт)', translation: 'резюме (CV)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_2', hebrew: 'רֵאָיוֹן עֲבוֹדָה', hebrewPlain: 'ראיון עבודה', transcription: 'реайóн аводá', translation: 'собеседование на работу', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_3', hebrew: 'מְנַהֵל', hebrewPlain: 'מנהל', transcription: 'менаhéль', translation: 'менеджер, руководитель (м.р.)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_4', hebrew: 'מְנַהֶלֶת', hebrewPlain: 'מנהלת', transcription: 'менаhéлет', translation: 'руководитель (ж.р.)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_5', hebrew: 'מְפַתֵּחַ תּוֹכְנָה', hebrewPlain: 'מפתח תוכנה', transcription: 'мефатéах тохнá', translation: 'разработчик ПО (software developer)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_6', hebrew: 'מַשְׂכּוֹרֶת', hebrewPlain: 'משכורת', transcription: 'маскóрет', translation: 'зарплата', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_7', hebrew: 'בְּרוּטוֹ', hebrewPlain: 'ברוטו', transcription: 'брӯто', translation: 'брутто (до налогов)', partOfSpeech: 'adverb', lessonId: 0 },
      { id: 'w_bet_8', hebrew: 'נֶטוֹ', hebrewPlain: 'נטו', transcription: 'нéто', translation: 'нетто (чистыми на руки)', partOfSpeech: 'adverb', lessonId: 0 },
      { id: 'w_bet_9', hebrew: 'תְּלוּשׁ מַשְׂכּוֹרֶת', hebrewPlain: 'תלוש משכורת', transcription: 'тлуш маскóрет', translation: 'расчетный листок по зарплате', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_10', hebrew: 'חוֹזֶה עֲבוֹדָה', hebrewPlain: 'חוזה עבודה', transcription: 'хозé аводá', translation: 'трудовой договор', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_11', hebrew: 'יְשִׁיבָה', hebrewPlain: 'ישיבה', transcription: 'йешивá', translation: 'совещание, митинг', partOfSpeech: 'noun', plural: 'יְשִׁיבוֹת', lessonId: 0 },
      { id: 'w_bet_12', hebrew: 'צֶוֶות', hebrewPlain: 'צוות', transcription: 'цéвет', translation: 'команда, коллектив', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_13', hebrew: 'עֲמִית', hebrewPlain: 'עמית', transcription: 'амӣт', translation: 'коллега', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_14', hebrew: 'נִיסָּיוֹן', hebrewPlain: 'ניסיון', transcription: 'нисайóн', translation: 'опыт работы / попытка', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_15', hebrew: 'מִשְׂרָה מְלֵאָה', hebrewPlain: 'משרה מלאה', transcription: 'мисрá меле’á', translation: 'полная занятость (full-time)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_16', hebrew: 'מִשְׂרָה חֶלְקִית', hebrewPlain: 'משרה חלקית', transcription: 'мисрá хелькӣт', translation: 'частичная занятость (part-time)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_17', hebrew: 'עֲבוֹדָה מֵהַבַּיִת', hebrewPlain: 'עבודה מהבית', transcription: 'аводá ме-hа-бáйит', translation: 'удаленная работа (WFH)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_18', hebrew: 'חֶבְרַת הַי-טֶק', hebrewPlain: 'חברת הי-טק', transcription: 'хеврáт hай-тек', translation: 'хай-тек компания', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_19', hebrew: 'סְטַרְטְ-אַפּ', hebrewPlain: 'סטארט-אפ', transcription: 'стáрт-ап', translation: 'стартап', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'w_bet_20', hebrew: 'פְּרוֹיֶקְט', hebrewPlain: 'פרויקט', transcription: 'проéкт', translation: 'проект', partOfSpeech: 'noun', lessonId: 0 },
    ],
  },

  // ==========================================
  // АРЕНДА ЖИЛЬЯ И БАНК
  // ==========================================
  {
    id: 'housing-bank-bet',
    title: 'Аренда жилья, Банк и Бюрократия',
    titleHebrew: 'שְׂכִירוּת, בַּנְק וּבִירוֹקְרַטְיָה',
    description: '35 слов: договор аренды, коммунальные платежи (арнона, ваад байит), банк и чеки.',
    level: 'bet',
    category: 'housing',
    icon: 'Landmark',
    words: [
      { id: 'b_bet_1', hebrew: 'שְׂכִירוּת', hebrewPlain: 'שכירות', transcription: 'схирӯт', translation: 'аренда', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_2', hebrew: 'שְׂכַר דִּירָה (שכ״ד)', hebrewPlain: 'שכר דירה', transcription: 'схар дирá (сахáд)', translation: 'арендная плата за квартиру', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_3', hebrew: 'בַּעַל הַבַּיִת', hebrewPlain: 'בעל הבית', transcription: 'бáаль hа-бáйит', translation: 'хозяин квартиры (арендодатель)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_4', hebrew: 'אַרְנוֹנָה', hebrewPlain: 'ארנונה', transcription: 'арнóна', translation: 'муниципальный налог на жилье', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_5', hebrew: 'וַעַד בַּיִת', hebrewPlain: 'ועד בית', transcription: 'вáад бáйит', translation: 'домоуправление (плата за подъезд/лифт)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_6', hebrew: 'חֶשְׁבּוֹן חַשְׁמַל', hebrewPlain: 'חשבון חשמל', transcription: 'хешбóн хашмáль', translation: 'счет за электричество', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_7', hebrew: 'חֶשְׁבּוֹן מַיִם', hebrewPlain: 'חשבון מים', transcription: 'хешбóн мáйим', translation: 'счет за воду', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_8', hebrew: 'חֶשְׁבּוֹן בַּנְק', hebrewPlain: 'חשבון בנק', transcription: 'хешбóн банк', translation: 'банковский счет', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_9', hebrew: 'עוֹבֵר וָשָׁב (עו״ש)', hebrewPlain: 'עובר ושב', transcription: 'овéр ва-шав (о́раш)', translation: 'текущий счет (Checking account)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_10', hebrew: 'הַעֲבָרָה בַּנְקָאִית', hebrewPlain: 'העברה בנקאית', transcription: 'hа’аварá банка’ӣт', translation: 'банковский перевод', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_11', hebrew: 'כַּרְטִיס אַשְׁרַאי', hebrewPlain: 'כרטיס אשראי', transcription: 'картӣс ашрáй', translation: 'кредитная карта', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_12', hebrew: 'צֵ׳ק', hebrewPlain: 'צ׳ק', transcription: 'чек', translation: 'банковский чек', partOfSpeech: 'noun', plural: 'צֵ׳קִים', lessonId: 0 },
      { id: 'b_bet_13', hebrew: 'פִּיקָּדוֹן', hebrewPlain: 'פיקדון', transcription: 'пикадóн', translation: 'денежный залог / депозит', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_14', hebrew: 'חוֹזֶה', hebrewPlain: 'חוזה', transcription: 'хозé', translation: 'договор, контракт', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_15', hebrew: 'לַחְתּוֹם', hebrewPlain: 'לחתום', transcription: 'лахтóм', translation: 'подписывать', partOfSpeech: 'verb', root: 'ח-ת-ם', lessonId: 0 },
      { id: 'b_bet_16', hebrew: 'חֲתִימָה', hebrewPlain: 'חתימה', transcription: 'хатимá', translation: 'подпись', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_17', hebrew: 'הוֹרָאַת קֶבַע', hebrewPlain: 'הוראת קבע', transcription: 'hора’áт кéва', translation: 'автоматическое списание со счета', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_18', hebrew: 'תְּעוּדַת זֶהוּת (ת״ז)', hebrewPlain: 'תעודת זהות', transcription: 'те’удáт зэhӯт (тэ-зáин)', translation: 'удостоверение личности (Теудат Зеут)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_19', hebrew: 'תְּעוּדַת עוֹלֶה', hebrewPlain: 'תעודת עולה', transcription: 'те’удáт олé', translation: 'удостоверение репатрианта', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_bet_20', hebrew: 'מִשְׂרַד הַפְּנִים', hebrewPlain: 'משרד הפנים', transcription: 'мисрáд hа-пнӣм', translation: 'Министерство внутренних дел (МВД / Мисрад а-Пним)', partOfSpeech: 'noun', lessonId: 0 },
    ],
  },

  // ==========================================
  // СЛЕНГ И РАЗГОВОРНЫЕ ИДИОМЫ
  // ==========================================
  {
    id: 'slang-idioms-bet',
    title: 'Израильский сленг и Разговорные идиомы',
    titleHebrew: 'סְלֶנְג יִשְׂרְאֵלִי וּבִטּוּיִים',
    description: '40 самых сочных выражений живого уличного и дружеского иврита.',
    level: 'bet',
    category: 'slang',
    icon: 'Sparkles',
    words: [
      { id: 's_bet_1', hebrew: 'סַבָּבָּה', hebrewPlain: 'סבבה', transcription: 'сабáба', translation: 'отлично, супер, без проблем', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_2', hebrew: 'תַּכְלֶ׳ס', hebrewPlain: 'תכלס', transcription: 'тáхлес', translation: 'по сути, на самом деле, если честно', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_3', hebrew: 'חוּצְפָּה', hebrewPlain: 'חוצפה', transcription: 'хуцпá', translation: 'дерзость, наглость, сверх-смелость', partOfSpeech: 'noun', lessonId: 0 },
      { id: 's_bet_4', hebrew: 'עַל הַפָּנִים', hebrewPlain: 'על הפנים', transcription: 'аль hа-панӣм', translation: 'ужасно, ниже плинтуса, отвратительно', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_5', hebrew: 'חֲבָל עַל הַזְּמַן', hebrewPlain: 'חבל על הזמן', transcription: 'хавáль аль hа-змáн (хавла́з)', translation: 'невероятно круто! / пустая трата времени', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_6', hebrew: 'אֵשׁ!', hebrewPlain: 'אש!', transcription: 'эш!', translation: 'Огонь! Пушка!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_7', hebrew: 'פְּצָצָה', hebrewPlain: 'פצצה', transcription: 'пцацá', translation: 'бомба! потрясающе!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_8', hebrew: 'בָּאסָה', hebrewPlain: 'באסה', transcription: 'бáса', translation: 'облом, досада, печалька', partOfSpeech: 'noun', lessonId: 0 },
      { id: 's_bet_9', hebrew: 'חוֹפֵר', hebrewPlain: 'חופר', transcription: 'хофéр', translation: '«буровит», занудничает, грузит разговорами', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_10', hebrew: 'סְתָם', hebrewPlain: 'סתם', transcription: 'стам', translation: 'просто так, ни о чем, шучу', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_11', hebrew: 'יָאלְלָה', hebrewPlain: 'יאללה', transcription: 'я́лла', translation: 'давай! погнали! ну всё, пока', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_12', hebrew: 'בְּכֵיף', hebrewPlain: 'בכיף', transcription: 'бе-кéйф', translation: 'с удовольствием, на здоровье', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_13', hebrew: 'כַּפָּרָה עָלֶיךָ', hebrewPlain: 'כפרה עליך', transcription: 'капарá алéха', translation: 'душа моя, золотой ты мой (теплое обращение)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_14', hebrew: 'מָה נִשְׁמַע?', hebrewPlain: 'מה נשמע?', transcription: 'ма нишмá?', translation: 'Что слышно? Как дела?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_15', hebrew: 'מָה הוֹלֵךְ?', hebrewPlain: 'מה הולך?', transcription: 'ма hолéх?', translation: 'Как оно? Что происходит?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_16', hebrew: 'אֵין מַצָּב', hebrewPlain: 'אין מצב', transcription: 'эйн мацáв', translation: 'Без шансов! Ни в коем случае!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_17', hebrew: 'בֶּטַח', hebrewPlain: 'בטח', transcription: 'бéтах', translation: 'конечно, сто процентов!', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_18', hebrew: 'לַעֲשׂוֹת חַיִּים', hebrewPlain: 'לעשות חיים', transcription: 'лаасóт хайӣм', translation: 'кайфовать, наслаждаться жизнью', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_19', hebrew: 'לָרֶדֶת עַל...', hebrewPlain: 'לרדת על...', transcription: 'ларéдет аль...', translation: 'подкалывать, наезжать на кого-то', partOfSpeech: 'expression', lessonId: 0 },
      { id: 's_bet_20', hebrew: 'הַכּוֹל טוֹב', hebrewPlain: 'הכל טוב', transcription: 'hакóль тов', translation: 'Всё хорошо, без обид', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },

  // ==========================================
  // НОВОСТИ И ОБЩЕСТВО
  // ==========================================
  {
    id: 'news-society-bet',
    title: 'Новости, Общество, Армия и Медиа',
    titleHebrew: 'חֲדָשׁוֹת, חֶבְרָה וּתְקְשֹׁרֶת',
    description: '30 слов для понимания израильских новостей, политики и жизни страны.',
    level: 'bet',
    category: 'media',
    icon: 'Radio',
    words: [
      { id: 'n_bet_1', hebrew: 'חֲדָשׁוֹת', hebrewPlain: 'חדשות', transcription: 'хадашóт', translation: 'новости', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_2', hebrew: 'מֶמְשָׁלָה', hebrewPlain: 'ממשלה', transcription: 'мемшалá', translation: 'правительство', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_3', hebrew: 'רֹאשׁ הַמֶּמְשָׁלָה', hebrewPlain: 'ראש הממשלה', transcription: 'рош hа-мемшалá', translation: 'премьер-министр', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_4', hebrew: 'כְּנֶסֶת', hebrewPlain: 'כנסת', transcription: 'кнéсет', translation: 'Кнессет (парламент Израиля)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_5', hebrew: 'בְּחִירוֹת', hebrewPlain: 'בחירות', transcription: 'бхирóт', translation: 'выборы', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_6', hebrew: 'צְבָא הַהֲגָנָה לְיִשְׂרָאֵל (צה״ל)', hebrewPlain: 'צה״ל', transcription: 'цáhаль', translation: 'ЦАХАЛ (Армия обороны Израиля)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_7', hebrew: 'חַיָּיל', hebrewPlain: 'חייל', transcription: 'хайáль', translation: 'солдат (м.р.)', partOfSpeech: 'noun', plural: 'חַיָּילִים', lessonId: 0 },
      { id: 'n_bet_8', hebrew: 'חַיֶּילֶת', hebrewPlain: 'חיילת', transcription: 'хайéлет', translation: 'солдат (ж.р.)', partOfSpeech: 'noun', plural: 'חַיָּילוֹת', lessonId: 0 },
      { id: 'n_bet_9', hebrew: 'בִּיטָּחוֹן', hebrewPlain: 'ביטחון', transcription: 'битахóн', translation: 'безопасность', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_10', hebrew: 'כַּלְכָּלָה', hebrewPlain: 'כלכלה', transcription: 'калкалá', translation: 'экономика', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_11', hebrew: 'מִשְׁטָרָה', hebrewPlain: 'משטרה', transcription: 'миштарá', translation: 'полиция', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_12', hebrew: 'חוֹק / חוּקִּים', hebrewPlain: 'חוק', transcription: 'хок', translation: 'закон', partOfSpeech: 'noun', plural: 'חוּקִּים', lessonId: 0 },
      { id: 'n_bet_13', hebrew: 'מִלְחָמָה', hebrewPlain: 'מלחמה', transcription: 'милхамá', translation: 'война', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_14', hebrew: 'שָׁלוֹם', hebrewPlain: 'שלום', transcription: 'шалóм', translation: 'мир / здравствуйте', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'n_bet_15', hebrew: 'הֶסְכֵּם', hebrewPlain: 'הסכם', transcription: 'hескéм', translation: 'соглашение, мирный договор', partOfSpeech: 'noun', lessonId: 0 },
    ],
  },
];
