/**
 * Профессиональные тематические словари
 *
 * БИБЛИОТЕКАРЬ И АРХИВАРИУС (סַפְרָן וְאַרְכִיבַאי / מֵידְעָנוּת וְתִּיעוּד)
 *
 * Колоды:
 *   1. librarian-verbs     — Глаголы каталогизации, поиска и учёта (25 слов)
 *   2. librarian-library   — Библиотека, фонды и читательский сервис (25 слов)
 *   3. librarian-archive   — Архив, хранение документов и оцифровка (25 слов)
 *   4. librarian-dialogue  — Разговор с читателями и исследователями (25 фраз)
 */

import { ThematicDeck } from '@/types';

export const LIBRARIAN_DECKS: ThematicDeck[] = [
  // ==========================================
  // БИБЛИОТЕКАРЬ И АРХИВАРИУС — ГЛАГОЛЫ
  // ==========================================
  {
    id: 'librarian-verbs',
    title: 'Библиотекарь и архив — Глаголы поиска и учёта',
    titleHebrew: 'סַפְרָנוּת וְאַרְכִיבָאוּת — פְּעָלִים שֶׁל מִקְצוֹעַ',
    description: '25 ключевых глаголов: каталогизировать, индексировать, выдавать, возвращать, продлевать, оцифровывать, реставрировать, архивировать и переплетать книги.',
    level: 'all',
    category: 'librarian',
    icon: 'BookMarked',
    words: [
      { id: 'lib_v_1', hebrew: 'לְקַטְלֵג', hebrewPlain: 'לקטלג', transcription: 'лекатлéг', translation: 'каталогизировать, вносить в каталог', partOfSpeech: 'verb', root: 'ק-ט-ל-ג', lessonId: 0 },
      { id: 'lib_v_2', hebrew: 'לְמַפְתֵּחַ', hebrewPlain: 'לפתח', transcription: 'лемафтéах', translation: 'индексировать, составлять предметный указатель', partOfSpeech: 'verb', root: 'מ-פ-ת-ח', lessonId: 0 },
      { id: 'lib_v_3', hebrew: 'לְמַיֵּין', hebrewPlain: 'למיין', transcription: 'лемайéн', translation: 'сортировать, классифицировать фонды', partOfSpeech: 'verb', root: 'מ-י-ן', lessonId: 0 },
      { id: 'lib_v_4', hebrew: 'לְהַשְׁאִיל', hebrewPlain: 'להשאיל', transcription: 'леhаш’ӣль', translation: 'выдавать на дом, ссужать (книгу)', partOfSpeech: 'verb', root: 'ש-א-ל', lessonId: 0 },
      { id: 'lib_v_5', hebrew: 'לְהַחְזִיר', hebrewPlain: 'להחזיר', transcription: 'леhахзӣр', translation: 'возвращать (книгу в библиотеку)', partOfSpeech: 'verb', root: 'ח-ז-р', lessonId: 0 },
      { id: 'lib_v_6', hebrew: 'לְהַזְמִין', hebrewPlain: 'להזמין', transcription: 'леhазмӣн', translation: 'заказывать (из хранилища или по МБА)', partOfSpeech: 'verb', root: 'ז-מ-ן', lessonId: 0 },
      { id: 'lib_v_7', hebrew: 'לְהַאֲרִיךְ', hebrewPlain: 'להאריך', transcription: 'леhаарӣх', translation: 'продлевать (срок пользования книгой)', partOfSpeech: 'verb', root: 'א-ר-ך', lessonId: 0 },
      { id: 'lib_v_8', hebrew: 'לְעַיֵּין', hebrewPlain: 'לעיין', transcription: 'леайéн', translation: 'просматривать, изучать в читальном зале', partOfSpeech: 'verb', root: 'ע-י-ן', lessonId: 0 },
      { id: 'lib_v_9', hebrew: 'לְאַתֵּר', hebrewPlain: 'לאתר', transcription: 'леатéр', translation: 'отыскивать, находить по шифру в фонде', partOfSpeech: 'verb', root: 'א-ת-ר', lessonId: 0 },
      { id: 'lib_v_10', hebrew: 'לְשַׁמֵּר', hebrewPlain: 'לשמר', transcription: 'лешамéр', translation: 'сохранять, консервировать редкие книги', partOfSpeech: 'verb', root: 'ש-מ-ר', lessonId: 0 },
      { id: 'lib_v_11', hebrew: 'לְשַׁקֵּם', hebrewPlain: 'לשקם', transcription: 'лешакéм', translation: 'реставрировать повреждённый документ/том', partOfSpeech: 'verb', root: 'ש-ק-ם', lessonId: 0 },
      { id: 'lib_v_12', hebrew: 'לִסְרוֹק', hebrewPlain: 'לסרוק', transcription: 'лисрóк', translation: 'сканировать', partOfSpeech: 'verb', root: 'ס-ר-ק', lessonId: 0 },
      { id: 'lib_v_13', hebrew: 'לְדַגְטֵל', hebrewPlain: 'לדגטל', transcription: 'ледагтéль', translation: 'оцифровывать (тексты, фото, плёнки)', partOfSpeech: 'verb', root: 'ד-ג-ט-ל', lessonId: 0 },
      { id: 'lib_v_14', hebrew: 'לִגְנוֹז', hebrewPlain: 'לגנוז', transcription: 'лигнóз', translation: 'помещать в архив/спецхран, архивировать', partOfSpeech: 'verb', root: 'ג-נ-ז', lessonId: 0 },
      { id: 'lib_v_15', hebrew: 'לִכְרוֹךְ', hebrewPlain: 'לכרוך', transcription: 'лихрóх', translation: 'переплетать книгу или периодику', partOfSpeech: 'verb', root: 'כ-ר-ך', lessonId: 0 },
      { id: 'lib_v_16', hebrew: 'לְתַעֵד', hebrewPlain: 'לתעד', transcription: 'летаéд', translation: 'документировать, протоколировать', partOfSpeech: 'verb', root: 'ת-ע-ד', lessonId: 0 },
      { id: 'lib_v_17', hebrew: 'לִרְשׁוֹם', hebrewPlain: 'לרשום', transcription: 'лиршóм', translation: 'регистрировать, вносить запись в реестр', partOfSpeech: 'verb', root: 'ר-ש-ם', lessonId: 0 },
      { id: 'lib_v_18', hebrew: 'לִשְׁלוֹף', hebrewPlain: 'לשלוף', transcription: 'лишлóф', translation: 'извлекать (дело из фонда / запись из БД)', partOfSpeech: 'verb', root: 'ש-ל-ף', lessonId: 0 },
      { id: 'lib_v_19', hebrew: 'לְסַוֵּוג', hebrewPlain: 'לסווג', transcription: 'лесавéг', translation: 'классифицировать (по системе / по доступу)', partOfSpeech: 'verb', root: 'ס-ו-ג', lessonId: 0 },
      { id: 'lib_v_20', hebrew: 'לְהַנְפִיק', hebrewPlain: 'להנפיק', transcription: 'леhанфӣк', translation: 'оформлять / выпускать (читательский билет)', partOfSpeech: 'verb', root: 'נ-פ-ק', lessonId: 0 },
      { id: 'lib_v_21', hebrew: 'לִגְרוֹעַ', hebrewPlain: 'לגרוע', transcription: 'лигрóа', translation: 'списывать ветхие книги из инвентаря', partOfSpeech: 'verb', root: 'ג-ר-ע', lessonId: 0 },
      { id: 'lib_v_22', hebrew: 'לְבַעֵר', hebrewPlain: 'לבער', transcription: 'леваéр', translation: 'утилизировать документы по акту списания', partOfSpeech: 'verb', root: 'ב-ע-ר', lessonId: 0 },
      { id: 'lib_v_23', hebrew: 'לְסַדֵּר', hebrewPlain: 'לסדר', transcription: 'лесадéр', translation: 'расставлять книги по полкам', partOfSpeech: 'verb', root: 'ס-ד-ר', lessonId: 0 },
      { id: 'lib_v_24', hebrew: 'לְהַדְפִּיס', hebrewPlain: 'להדפיס', transcription: 'леhадпӣс', translation: 'распечатывать материалы, формуляры', partOfSpeech: 'verb', root: 'ד-פ-ס', lessonId: 0 },
      { id: 'lib_v_25', hebrew: 'לִגְבּוֹת קְנָס', hebrewPlain: 'לגבות קנס', transcription: 'лигбóт кнас', translation: 'взимать штраф за задержку сдачи книги', partOfSpeech: 'verb', root: 'ג-ב-ה', lessonId: 0 },
    ],
  },

  // ==========================================
  // БИБЛИОТЕКА — ФОНДЫ И АБОНЕМЕНТ
  // ==========================================
  {
    id: 'librarian-library',
    title: 'Библиотека — Фонды и абонемент',
    titleHebrew: 'סִפְרִיָּה — כּוֹנָנִיּוֹת, סְפָרִים וְהַשְׁאָלָה',
    description: '25 библиотечных терминов: абонемент, читательский билет, шифр книги, ISBN, периодика, читальный зал, книгохранилище, штраф за просрочку и МБА.',
    level: 'all',
    category: 'librarian',
    icon: 'Library',
    words: [
      { id: 'lib_b_1', hebrew: 'סִפְרִיָּה', hebrewPlain: 'ספריה', transcription: 'сифрийá', translation: 'библиотека', partOfSpeech: 'noun', gender: 'f', root: 'ס-פ-ר', lessonId: 0 },
      { id: 'lib_b_2', hebrew: 'סַפְרָן / סַפְרָנִית', hebrewPlain: 'ספרן', transcription: 'сафрáн / сафранӣт', translation: 'библиотекарь', partOfSpeech: 'noun', gender: 'm', root: 'ס-פ-ר', lessonId: 0 },
      { id: 'lib_b_3', hebrew: 'קוֹרֵא / מָנוּי', hebrewPlain: 'קורא', transcription: 'корé / манӯй', translation: 'читатель / постоянный подписчик абонемента', partOfSpeech: 'noun', gender: 'm', root: 'ק-ר-א', lessonId: 0 },
      { id: 'lib_b_4', hebrew: 'כַּרְטִיס קוֹרֵא', hebrewPlain: 'כרטיס קורא', transcription: 'картӣс корé', translation: 'читательский билет', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_b_5', hebrew: 'דֶּלְפַק הַשְׁאָלָה', hebrewPlain: 'דלפק השאלה', transcription: 'дельфáк hаш’алá', translation: 'стойка выдачи и возврата книг', partOfSpeech: 'noun', gender: 'm', root: 'ש-א-ל', lessonId: 0 },
      { id: 'lib_b_6', hebrew: 'חֲדַר עִיּוּן', hebrewPlain: 'חדר עיון', transcription: 'хадáр ийӯн', translation: 'читальный зал', partOfSpeech: 'noun', gender: 'm', root: 'ע-י-ן', lessonId: 0 },
      { id: 'lib_b_7', hebrew: 'מַחְסַן סְפָרִים', hebrewPlain: 'מחסן ספרים', transcription: 'махсáн сфарӣм', translation: 'книгохранилище (закрытый фонд)', partOfSpeech: 'noun', gender: 'm', root: 'ח-ס-ן', lessonId: 0 },
      { id: 'lib_b_8', hebrew: 'כּוֹנָנִית / מַדָּף', hebrewPlain: 'כוננית', transcription: 'конанӣт / мадáф', translation: 'книжный стеллаж / полка', partOfSpeech: 'noun', gender: 'f', root: 'כ-ו-ן', lessonId: 0 },
      { id: 'lib_b_9', hebrew: 'קָטָלוֹג מְמוּחְשָׁב', hebrewPlain: 'קטלוג ממוחשב', transcription: 'каталóг мемухшáв', translation: 'электронный библиотечный каталог (OPAC)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_b_10', hebrew: 'סִימָן מַדָּף / שִׁיפְר', hebrewPlain: 'סימן מדף', transcription: 'симáн мадáф / шифр', translation: 'шифр книги / полочный классификационный индекс', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_b_11', hebrew: 'מִסְתַּ״ב (ISBN)', hebrewPlain: 'מסתב', transcription: 'мистáв (ISBN)', translation: 'международный стандартный книжный номер', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_b_12', hebrew: 'בַּרְקוֹד', hebrewPlain: 'ברקוד', transcription: 'баркóд', translation: 'штрихкод (инвентарный стикер)', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_b_13', hebrew: 'מַהֲדוּרָה', hebrewPlain: 'מהדורה', transcription: 'маhадурá', translation: 'издание, тираж, версия издания', partOfSpeech: 'noun', gender: 'f', root: 'ה-ד-ר', lessonId: 0 },
      { id: 'lib_b_14', hebrew: 'כֶּרֶךְ', hebrewPlain: 'כרך', transcription: 'кéрех', translation: 'том издания, отдельная книга в серии', partOfSpeech: 'noun', gender: 'm', root: 'כ-ר-ך', lessonId: 0 },
      { id: 'lib_b_15', hebrew: 'סֵפֶר עִיּוּן', hebrewPlain: 'ספר עיון', transcription: 'сéфер ийӯн', translation: 'справочное / научное издание (без выноса)', partOfSpeech: 'noun', gender: 'm', root: 'ס-פ-ר', lessonId: 0 },
      { id: 'lib_b_16', hebrew: 'סִפְרוּת יָפָה', hebrewPlain: 'ספרות יפה', transcription: 'сифрӯт йафá', translation: 'художественная литература, беллетристика', partOfSpeech: 'noun', gender: 'f', root: 'ס-פ-ר', lessonId: 0 },
      { id: 'lib_b_17', hebrew: 'כְּתַב עֵת', hebrewPlain: 'כתב עת', transcription: 'ктав эт', translation: 'периодическое издание, научный журнал', partOfSpeech: 'noun', gender: 'm', root: 'כ-ת-ב', lessonId: 0 },
      { id: 'lib_b_18', hebrew: 'שְׁנָתוֹן', hebrewPlain: 'שנתון', transcription: 'шнатóн', translation: 'ежегодник, ежегодный сборник', partOfSpeech: 'noun', gender: 'm', root: 'ש-נ-ה', lessonId: 0 },
      { id: 'lib_b_19', hebrew: 'עִתּוֹן', hebrewPlain: 'עיתון', transcription: 'итóн', translation: 'газета, свежая пресса', partOfSpeech: 'noun', gender: 'm', root: 'ע-ת', lessonId: 0 },
      { id: 'lib_b_20', hebrew: 'אֶנְצִיקְלוֹפֶּדְיָה', hebrewPlain: 'אנציקלופדיה', transcription: 'энциклопéдия', translation: 'энциклопедия', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'lib_b_21', hebrew: 'מִילּוֹן', hebrewPlain: 'מילון', transcription: 'милóн', translation: 'словарь', partOfSpeech: 'noun', gender: 'm', root: 'מ-ל-ל', lessonId: 0 },
      { id: 'lib_b_22', hebrew: 'כְּרִיכָה', hebrewPlain: 'כריכה', transcription: 'крихá', translation: 'переплёт, твердая или мягкая обложка', partOfSpeech: 'noun', gender: 'f', root: 'כ-ר-ך', lessonId: 0 },
      { id: 'lib_b_23', hebrew: 'אָבְדָן סֵפֶר', hebrewPlain: 'אובדן ספר', transcription: 'овдáн сéфер', translation: 'утеря книги читателем', partOfSpeech: 'noun', gender: 'm', root: 'א-ב-ד', lessonId: 0 },
      { id: 'lib_b_24', hebrew: 'קְנָס אִחוּר', hebrewPlain: 'קנס איחור', transcription: 'кнас ихӯр', translation: 'пеня / штраф за задержку сдачи книги', partOfSpeech: 'noun', gender: 'm', root: 'ק-נ-ס', lessonId: 0 },
      { id: 'lib_b_25', hebrew: 'הַשְׁאָלָה בֵּין-סִפְרִיָּתִית', hebrewPlain: 'השאלה בין-ספרייתית', transcription: 'hаш’алá бейн-сифрийатӣт', translation: 'межбиблиотечный абонемент (МБА)', partOfSpeech: 'noun', gender: 'f', root: 'ש-א-ל', lessonId: 0 },
    ],
  },

  // ==========================================
  // АРХИВ И ДОКУМЕНТООБОРОТ
  // ==========================================
  {
    id: 'librarian-archive',
    title: 'Архив — Фонды, документы и хранение',
    titleHebrew: 'אַרְכִיּוֹן וְתִּיעוּד — גְּנִיזָה, מִסְמָכִים וְשִׁמּוּר',
    description: '25 архивных понятий: фонды, дела, протоколы, манускрипты, гениза, бескислотные коробки, оцифровка, гриф секретности и закон об архивах.',
    level: 'all',
    category: 'librarian',
    icon: 'Archive',
    words: [
      { id: 'lib_a_1', hebrew: 'אַרְכִיּוֹן / אַרְכִיב', hebrewPlain: 'ארכיון', transcription: 'архийóн / архӣв', translation: 'архив', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_a_2', hebrew: 'אַרְכִיבַאי / אַרְכִיּוֹנַאי', hebrewPlain: 'ארכיבאי', transcription: 'архивáй / архийонáй', translation: 'архивариус, архивист', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_a_3', hebrew: 'מֵידְעָן / מֵידְעָנִית', hebrewPlain: 'מידען', transcription: 'мейдаáн / мейдаанӣт', translation: 'специалист по информации / информолог', partOfSpeech: 'noun', gender: 'm', root: 'י-ד-ע', lessonId: 0 },
      { id: 'lib_a_4', hebrew: 'חֲטִיבָה / אוֹסֶף', hebrewPlain: 'חטיבה', transcription: 'хативá / óсеф', translation: 'архивный фонд / коллекция документов', partOfSpeech: 'noun', gender: 'f', root: 'ח-ט-ב', lessonId: 0 },
      { id: 'lib_a_5', hebrew: 'תִּיק', hebrewPlain: 'תיק', transcription: 'тик', translation: 'архивное дело, папка', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_a_6', hebrew: 'מִסְמָךְ', hebrewPlain: 'מסמך', transcription: 'мисмáх', translation: 'документ', partOfSpeech: 'noun', gender: 'm', root: 'ס-מ-ך', lessonId: 0 },
      { id: 'lib_a_7', hebrew: 'תְּעוּדָה', hebrewPlain: 'תעודה', transcription: 'теудá', translation: 'свидетельство, официальный сертификат', partOfSpeech: 'noun', gender: 'f', root: 'ת-ע-ד', lessonId: 0 },
      { id: 'lib_a_8', hebrew: 'כְּתַב יָד', hebrewPlain: 'כתב יד', transcription: 'ктав йад', translation: 'рукопись, манускрипт', partOfSpeech: 'noun', gender: 'm', root: 'כ-ת-ב', lessonId: 0 },
      { id: 'lib_a_9', hebrew: 'פְּרוֹטוֹקוֹל', hebrewPlain: 'פרוטוקול', transcription: 'протокóл', translation: 'протокол заседания, стенограмма', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_a_10', hebrew: 'תִּכְתֹּבֶת / מִכְתָּב', hebrewPlain: 'תכתובת', transcription: 'тихтóвет / михтáв', translation: 'служебная переписка, письмо', partOfSpeech: 'noun', gender: 'f', root: 'כ-ת-ב', lessonId: 0 },
      { id: 'lib_a_11', hebrew: 'תַּצְלוּם / תְּמוּנָה', hebrewPlain: 'תצלום', transcription: 'тацлӯм / тмунá', translation: 'фотоснимок / историческая фотография', partOfSpeech: 'noun', gender: 'm', root: 'צ-ל-ם', lessonId: 0 },
      { id: 'lib_a_12', hebrew: 'מִיקְרוֹפִילְם', hebrewPlain: 'מיקרופילם', transcription: 'микрофӣльм', translation: 'микрофильм, микрофиша', partOfSpeech: 'noun', gender: 'm', lessonId: 0 },
      { id: 'lib_a_13', hebrew: 'מַאֲגַר מֵידָע', hebrewPlain: 'מאגר מידע', transcription: 'маагáр мейдá', translation: 'база данных, цифровой репозиторий', partOfSpeech: 'noun', gender: 'm', root: 'א-ג-ר', lessonId: 0 },
      { id: 'lib_a_14', hebrew: 'גְּנִיזָה', hebrewPlain: 'גניזה', transcription: 'гниза', translation: 'гениза, архивное спецхранилище / депонирование', partOfSpeech: 'noun', gender: 'f', root: 'ג-נ-ז', lessonId: 0 },
      { id: 'lib_a_15', hebrew: 'תְּקוּפַת שְׁמִירָה', hebrewPlain: 'תקופת שמירה', transcription: 'ткуфáт шмирá', translation: 'нормативный срок хранения документов', partOfSpeech: 'noun', gender: 'f', root: 'ש-מ-ר', lessonId: 0 },
      { id: 'lib_a_16', hebrew: 'בִּעוּר מִסְמָכִים', hebrewPlain: 'ביעור מסמכים', transcription: 'биӯр мисмахӣм', translation: 'списание и утилизация документов по истечении срока', partOfSpeech: 'noun', gender: 'm', root: 'ב-ע-ר', lessonId: 0 },
      { id: 'lib_a_17', hebrew: 'קוֹפְסַת אַרְכִיּוֹן', hebrewPlain: 'קופסת ארכיון', transcription: 'куфсáт архийóн', translation: 'архивная (бескислотная) коробка', partOfSpeech: 'noun', gender: 'f', lessonId: 0 },
      { id: 'lib_a_18', hebrew: 'מָקוֹר וְהֶעְתֵּק', hebrewPlain: 'מקור והעתק', transcription: 'макóр веhеэтéк', translation: 'подлинник (оригинал) и копия (дубликат)', partOfSpeech: 'noun', gender: 'm', root: 'ק-ו-ר', lessonId: 0 },
      { id: 'lib_a_19', hebrew: 'חָסוּי / מוּגְבָּל', hebrewPlain: 'חסוי', transcription: 'хасӯй / мугбáль', translation: 'конфиденциальный / ограниченного доступа', partOfSpeech: 'adjective', gender: 'm', root: 'ח-ס-ה', lessonId: 0 },
      { id: 'lib_a_20', hebrew: 'נְגִישׁוּת לַצִּיבּוּר', hebrewPlain: 'נגישות לציבור', transcription: 'негишӯт лацибӯр', translation: 'общедоступность, открытый доступ для граждан', partOfSpeech: 'noun', gender: 'f', root: 'נ-ג-ש', lessonId: 0 },
      { id: 'lib_a_21', hebrew: 'סְרִיקָה בִּרְזוֹלוּצְיָה גְּבוֹהָה', hebrewPlain: 'סריקה ברזולוציה גבוהה', transcription: 'срикá би-резолю́ция гвоhá', translation: 'сканирование в высоком разрешении', partOfSpeech: 'noun', gender: 'f', root: 'ס-ר-ק', lessonId: 0 },
      { id: 'lib_a_22', hebrew: 'שִׁמּוּר נְיָר', hebrewPlain: 'שימור נייר', transcription: 'шимӯр нейáр', translation: 'консервация и восстановление бумаги', partOfSpeech: 'noun', gender: 'm', root: 'ש-מ-ר', lessonId: 0 },
      { id: 'lib_a_23', hebrew: 'אִנְוֶונְטָר / מִפְקָד', hebrewPlain: 'אינוונטר', transcription: 'инвентáр / мифкáд', translation: 'опись фонда, инвентарный перечень', partOfSpeech: 'noun', gender: 'm', root: 'פ-ק-ד', lessonId: 0 },
      { id: 'lib_a_24', hebrew: 'חוֹק הָאַרְכִיּוֹנִים', hebrewPlain: 'חוק הארכיונים', transcription: 'хок hа-архийонӣм', translation: 'закон об архивах Государства Израиль', partOfSpeech: 'noun', gender: 'm', root: 'ח-ק-ק', lessonId: 0 },
      { id: 'lib_a_25', hebrew: 'זְכוּיוֹת יוֹצְרִים', hebrewPlain: 'זכויות יוצרים', transcription: 'зхуйóт йоцрӣм', translation: 'авторские права и правообладание', partOfSpeech: 'noun', gender: 'f', root: 'י-צ-ר', lessonId: 0 },
    ],
  },

  // ==========================================
  // ДИАЛОГ В БИБЛИОТЕКЕ И АРХИВЕ
  // ==========================================
  {
    id: 'librarian-dialogue',
    title: 'Библиотека и архив — Диалоги и запросы',
    titleHebrew: 'שִׂיחָה עִם קוֹרְאִים וְחוֹקְרִים',
    description: '25 практических реплик: помощь в поиске книги, продление абонемента, правила тишины, заказ материалов из архива и работа с редкими рукописями.',
    level: 'all',
    category: 'librarian',
    icon: 'Users',
    words: [
      { id: 'lib_d_1', hebrew: 'שָׁלוֹם, אֵיךְ אֲנִי יָכוֹל לַעֲזוֹר לְךָ לִמְצוֹא אֶת הַסֵּפֶר?', hebrewPlain: 'שלום, איך אני יכול לעזור לך למצוא את הספר?', transcription: 'шалóм, эйх анӣ яхóль лаазóр лехá лимцó эт hасéфер?', translation: 'Здравствуйте, как я могу помочь вам найти книгу?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_2', hebrew: 'הַסֵּפֶר נִמְצָא בַּקּוֹמָה הַשְּׁנִיָּה בְּחֲדַר הָעִיּוּן', hebrewPlain: 'הספר נמצא בקומה השנייה בחדר העיון', transcription: 'hасéфер нимцá бакомá hашнийá бехадáр hаийӯн', translation: 'Книга находится на втором этаже в читальном зале', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_3', hebrew: 'תּוּכַל לְחַפֵּשׂ בַּקָּטָלוֹג הַמְּמוּחְשָׁב לְפִי שֵׁם הַמְּחַבֵּר', hebrewPlain: 'תוכל לחפש בקטלוג הממוחשב לפי שם המחבר', transcription: 'тухáль лехапéс бакаталóг hамемухшáв лефӣ шем hамехабéр', translation: 'Вы можете найти издание в электронном каталоге по автору', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_4', hebrew: 'אֶפְשָׁר לְהַאֲרִיךְ אֶת הַהַשְׁאָלָה בְּעוֹד שְׁבוּעַיִם?', hebrewPlain: 'אפשר להאריך את ההשאלה בעוד שבועיים?', transcription: 'эфшáр леhаарӣх эт hаhаш’алá беóд швуáйим?', translation: 'Можно ли продлить абонемент ещё на две недели?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_5', hebrew: 'הַסֵּפֶר מֻשְׁאָל כָּרֶגַע, רוֹצֶה לְהַזְמִין תּוֹר?', hebrewPlain: 'הספר מושאל כרגע, רוצה להזמין תור?', transcription: 'hасéфер муш’áль карéга, роцé леhазмӣн тор?', translation: 'Книга сейчас выдана, хотите встать в очередь ожидания?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_6', hebrew: 'יֵשׁ לָנוּ גַּם גִּרְסָה דִּיגִיטָלִית שֶׁל הַסֵּפֶר הַזֶּה', hebrewPlain: 'יש לנו גם גרסה דיגיטלית של הספר הזה', transcription: 'йеш лáну гам гирсá дигитáлит шель hасéфер hазé', translation: 'У нас также есть электронная версия этой книги', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_7', hebrew: 'סְלִיחָה, נָא לִשְׁמוֹר עַל הַשֶּׁקֶט בַּסִּפְרִיָּה', hebrewPlain: 'סליחה, נא לשמור על השקט בספרייה', transcription: 'слихá, на лишмóр аль hашéкет басифрийá', translation: 'Извините, пожалуйста, соблюдайте тишину в библиотеке', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_8', hebrew: 'כְּדֵי לִפְתּוֹחַ כַּרְטִיס קוֹרֵא צָרִיךְ תְּעוּדַת זֶהוּת', hebrewPlain: 'כדי לפתוח כרטיס קורא צריך תעודת זהות', transcription: 'кдей лифтóах картӣс корé царӣх теудáт зеhӯт', translation: 'Для открытия читательского билета нужен теудат-зеут', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_9', hebrew: 'אֵיפֹה נִמְצֵאת מַחְלֶקֶת כִּתְבֵי הָעֵת?', hebrewPlain: 'איפה נמצאת מחלקת כתבי העת?', transcription: 'э́йфо нимцéт махлéкет китвéй hаэ́т?', translation: 'Где находится отдел периодических изданий?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_10', hebrew: 'הַתִּיק הַזֶּה שָׁמוּר בְּאַרְכִיּוֹן וְדוֹרֵשׁ הַזְמָנָה מֵרֹאשׁ', hebrewPlain: 'התיק הזה שמור בארכיון ודורש הזמנה מראש', transcription: 'hатӣк hазé шамӯр беархийóн ведорéш hазманá мерóш', translation: 'Это дело хранится в архиве и требует предварительного заказа', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_11', hebrew: 'יֵשׁ לַעֲטוֹת כְּפָפוֹת לִפְנֵי נְגִיעָה בִּכְתַב הַיָּד הַנָּדִיר', hebrewPlain: 'יש לעטות כפפות לפני נגיעה בכתב היד הנדיר', transcription: 'йеш лаатóт кфафóт лифнéй негиá бихтав hайáд hанадӣр', translation: 'Необходимо надеть перчатки перед работой с редкой рукописью', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_12', hebrew: 'הַאִם מֻתָּר לְצַלֵּם אוֹ לִסְרוֹק אֶת הַמִּסְמָךְ?', hebrewPlain: 'האם מותר לצלם או לסרוק את המסמך?', transcription: 'hаӣм мутáр лецалéм о лисрóк эт hамисмáх?', translation: 'Разрешено ли фотографировать или сканировать этот документ?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_13', hebrew: 'הַחֹמֶר פָּתוּחַ לְעִיּוּן חוֹקְרִים בִּלְבַד', hebrewPlain: 'החומר פתוח לעיון חוקרים בלבד', transcription: 'hахóмер патӯах леийӯн хокрӣм бильвáд', translation: 'Материал открыт для ознакомления только исследователям', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_14', hebrew: 'הַתִּיק עֲדַיִן תַּחַת תְּקוּפַת חִסָּיוֹן', hebrewPlain: 'התיק עדיין תחת תקופת חיסיון', transcription: 'hатӣк адáйин тáхат ткуфáт хисайóн', translation: 'Это дело всё ещё находится под грифом закрытого доступа', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_15', hebrew: 'מָתַי צָרִיךְ לְהַחְזִיר אֶת הַסְּפָרִים?', hebrewPlain: 'מתי צריך להחזיר את הספרים?', transcription: 'матáй царӣх леhахзӣр эт hасфарӣм?', translation: 'Когда наступает крайний срок возврата книг?', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_16', hebrew: 'יֵשׁ לְךָ קְנָס קָטָן עַל אִחוּר בַּהַחְזָרָה', hebrewPlain: 'יש לך קנס קטן על איחור בהחזרה', transcription: 'йеш лехá кнас катáн аль ихӯр баhахзарá', translation: 'У вас небольшой штраф за задержку сдачи книг', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_17', hebrew: 'אֶפְשָׁר לְהַזְמִין אֶת הַסֵּפֶר בְּהַשְׁאָלָה בֵּין-סִפְרִיָּתִית', hebrewPlain: 'אפשר להזמין את הספר בהשאלה בין-ספרייתית', transcription: 'эфшáр леhазмӣн эт hасéфер беhаш’алá бейн-сифрийатӣт', translation: 'Можно заказать книгу через межбиблиотечный абонемент', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_18', hebrew: 'סִפְרֵי עִיּוּן וּמִלּוֹנִים אֵינָם לְהַשְׁאָלָה הַבַּיְתָה', hebrewPlain: 'ספרי עיון ומילונים אינם להשאלה הביתה', transcription: 'сифрéй ийӯн умилонӣм эйнáм леhаш’алá hабáйта', translation: 'Справочные издания и словари на дом не выдаются', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_19', hebrew: 'תּוּכַל לְהַדְפִּיס אֶת הַמַּאֲמָר בַּמַּדְפֶּסֶת הַצִּיבּוּרִית', hebrewPlain: 'תוכל להדפיס את המאמר במדפסת הציבורית', transcription: 'тухáль леhадпӣс эт hамаамáр бамадпéсет hацибурӣт', translation: 'Вы можете распечатать статью на общественном принтере', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_20', hebrew: 'אָנוּ מְבַצְּעִים פְּרוֹיֶקְט דִּיגִיטַצְיָה שֶׁל תַּצְלוּמִים הִיסְטוֹרִיִּים', hebrewPlain: 'אנו מבצעים פרויקט דיגיטציה של תצלומים היסטוריים', transcription: 'áну мевацъӣм проéкт дигитáция шель тацлумӣм hисторӣйим', translation: 'Мы ведём проект оцифровки исторического фотоархива', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_21', hebrew: 'הַסֵּפֶר נִפְגַּם, נַעֲבִיר אוֹתוֹ לְשִׁיקוּם וּכְרִיכָה', hebrewPlain: 'הספר נפגם, נעביר אותו לשיקום וכריכה', transcription: 'hасéфер нифгáм, наавӣр отó лешикӯм ухрихá', translation: 'Книга повреждена, мы передадим её в переплётную мастерскую', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_22', hebrew: 'הִנֵּה הַשִּׁיפְר שֶׁל הַסֵּפֶר — זֶה הַמִּקּוּם שֶׁלּוֹ עַל הַמַּדָּף', hebrewPlain: 'הנה השיפר של הספר — זה המיקום שלו על המדף', transcription: 'hинé hашӣфр шель hасéфер — зэ hамикӯм шелó аль hамадáф', translation: 'Вот шифр издания — по нему книга стоит на полке', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_23', hebrew: 'בָּאַרְכִיּוֹן יֵשׁ לְמַלֵּא טוֹפֶס בַּקָּשַׁת עִיּוּן', hebrewPlain: 'בארכיון יש למלא טופס בקשת עיון', transcription: 'баархийóн йеш лемалé тóфес бакашáт ийӯн', translation: 'В архиве требуется заполнить бланк запроса на ознакомление', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_24', hebrew: 'כָּל הַמֵּידָע שָׁמוּר וּמְגוּבֶּה בְּשָׂרָת מְאוּבְטָח', hebrewPlain: 'כל המידע שמור ומגובה בשרת מאובטח', transcription: 'коль hамейдá шамӯр умегубé бесарáт меувтáх', translation: 'Все материалы сохранены и скопированы на защищённый сервер', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'lib_d_25', hebrew: 'עֲבוֹדַת הַמֶּחְקָר שֶׁלְּךָ מְרַתֶּקֶת, בְּהַצְלָחָה!', hebrewPlain: 'עבודת המחקר שלך מרתקת, בהצלחה!', transcription: 'аводáт hамехкáр шельхá мератéкет, беhацлахá!', translation: 'Ваша исследовательская тема очень интересна, успехов!', partOfSpeech: 'expression', lessonId: 0 },
    ],
  },
];
