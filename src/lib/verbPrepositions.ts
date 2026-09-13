import { stripNikkud } from './transcription';

export interface VerbPrepositionInfo {
  preposition: string; // "לְ..." | "בְּ..." | "אֶת..." | "עִם..." | "עַל..." | "מִ..." | "אֶל..."
  prepositionPlain: string; // "ל" | "ב" | "את" | "עם" | "על" | "מ" | "אל"
  ruleRu: string; // "кому-то", "в/с чем-то", "кого/что (прямой объект)"
  exampleHe: string; // "עוֹזֵר לַחֲבֵר"
  exampleRu: string; // "помогает другу"
}

export const VERB_PREPOSITIONS: Record<string, VerbPrepositionInfo> = {
  // --- Предлог לְ... (кому-то / направление / дательный) ---
  'לעזור': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'кому-то (дательный падеж)',
    exampleHe: 'עוֹזֵר לַחֲבֵר',
    exampleRu: 'помогает другу',
  },
  'להתקשר': {
    preposition: 'לְ... / אֶל...',
    prepositionPlain: 'ל',
    ruleRu: 'кому-то',
    exampleHe: 'מִתְקַשֵּׁר לְאִמָּא',
    exampleRu: 'звонит маме',
  },
  'להקשיב': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'кому-то / чему-то (внимать)',
    exampleHe: 'מַקְשִׁיב לַמּוֹרֶה',
    exampleRu: 'слушает учителя',
  },
  'לענות': {
    preposition: 'לְ... / עַל...',
    prepositionPlain: 'ל',
    ruleRu: 'отвечать кому-то (ל) / на что-то (על)',
    exampleHe: 'עוֹנֶה לַחֲבֵר עַל הַשְּׁאֵלָה',
    exampleRu: 'отвечает другу на вопрос',
  },
  'לחכות': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'ждать кого-то / что-то',
    exampleHe: 'מְחַכֶּה לָאוֹטוֹבּוּס',
    exampleRu: 'ждёт автобус',
  },
  'לספר': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'рассказывать кому-то (ל) о чем-то (על)',
    exampleHe: 'מְסַפֵּר לַחֲבֵר עַל הַטִּיּוּל',
    exampleRu: 'рассказывает другу о поездке',
  },
  'לשלוח': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'отправлять кому-то',
    exampleHe: 'שׁוֹלֵחַ מִכְתָּב לַמִּשְׁפָּחָה',
    exampleRu: 'отправляет письмо семье',
  },
  'לתת': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'давать кому-то',
    exampleHe: 'נוֹתֵן מַתָּנָה לַיֶּלֶד',
    exampleRu: 'даёт подарок ребёнку',
  },
  'להסביר': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'объяснять кому-то',
    exampleHe: 'מַסְבִּיר לַתַּלְמִיד',
    exampleRu: 'объясняет ученику',
  },
  'לומר': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'говорить / сказать кому-то',
    exampleHe: 'אוֹמֵר לַחֲבֵר שָׁלוֹם',
    exampleRu: 'говорит другу «привет»',
  },
  'להגיד': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'сказать кому-то',
    exampleHe: 'מַגִּיד לָהֶם אֶת הָאֱמֶת',
    exampleRu: 'говорит им правду',
  },
  'להודות': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'благодарить кого-то (ל) за что-то (על)',
    exampleHe: 'מוֹדֶה לַמּוֹרֶה עַל הָעֶזְרָה',
    exampleRu: 'благодарит учителя за помощь',
  },
  'לדאוג': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'беспокоиться / заботиться о ком-то',
    exampleHe: 'דּוֹאֵג לַמִּשְׁפָּחָה',
    exampleRu: 'заботится о семье',
  },
  'להתגעגע': {
    preposition: 'לְ... / אֶל...',
    prepositionPlain: 'ל',
    ruleRu: 'скучать по кому-то / чему-то',
    exampleHe: 'מִתְגַּעְגֵּעַ לַבַּיִת',
    exampleRu: 'скучает по дому',
  },
  'להתרגל': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'привыкать к чему-то',
    exampleHe: 'מִתְרַגֵּל לַחַיִּים בְּיִשְׂרָאֵל',
    exampleRu: 'привыкает к жизни в Израиле',
  },
  'להתאים': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'подходить кому-то / чему-то',
    exampleHe: 'הַזְּמַן מַתְאִים לִי',
    exampleRu: 'время мне подходит',
  },
  'להאמין': {
    preposition: 'לְ... / בְּ...',
    prepositionPlain: 'ל',
    ruleRu: 'верить кому-то (ל) / верить в кого-то (ב)',
    exampleHe: 'מַאֲמִין לְךָ / מַאֲמִין בֶּאֱלֹהִים',
    exampleRu: 'верю тебе / верю в Бога',
  },
  'להבטיח': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'обещать кому-то',
    exampleHe: 'מַבְטִיחַ לַחֲבֵר לָבוֹא',
    exampleRu: 'обещает другу прийти',
  },
  'להציע': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'предлагать кому-то',
    exampleHe: 'מַצִּיעַ עֶזְרָה לַשָּׁכֵן',
    exampleRu: 'предлагает помощь соседу',
  },
  'להזכיר': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'напоминать кому-то',
    exampleHe: 'מַזְכִּיר לוֹ אֶת הַפְּגִישָׁה',
    exampleRu: 'напоминает ему о встрече',
  },
  'להשתדל': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'стараться (с инфинитивом)',
    exampleHe: 'מִשְׁתַּדֵּל לַעֲשׂוֹת טוֹב',
    exampleRu: 'старается делать хорошо',
  },
  'להיכנס': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'входить куда-то',
    exampleHe: 'נִכְנָס לַחֶדֶר',
    exampleRu: 'входит в комнату',
  },
  'ללכת': {
    preposition: 'לְ... / אֶל...',
    prepositionPlain: 'ל',
    ruleRu: 'идти куда-то / к кому-то',
    exampleHe: 'הוֹלֵךְ לַעֲבוֹדָה',
    exampleRu: 'идёт на работу',
  },
  'לנסוע': {
    preposition: 'לְ... (בְּ...)',
    prepositionPlain: 'ל',
    ruleRu: 'ехать куда-то (ל) на чём-то (ב)',
    exampleHe: 'נוֹסֵעַ לִירוּשָׁלַיִם בָּרַכֶּבֶת',
    exampleRu: 'едет в Иерусалим на поезде',
  },
  'לקוות': {
    preposition: 'לְ...',
    prepositionPlain: 'ל',
    ruleRu: 'надеяться на что-то',
    exampleHe: 'מְקַוֶּה לְטוֹב',
    exampleRu: 'надеется на лучшее',
  },

  // --- Предлог בְּ... (в чём-то / инструментальный / использование) ---
  'לבחור': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'выбирать кого-то / что-то',
    exampleHe: 'בּוֹחֵר בַּתְּשׁוּבָה הַנְּכוֹנָה',
    exampleRu: 'выбирает правильный ответ',
  },
  'לטפל': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'заботиться о / ухаживать за / решать проблему',
    exampleHe: 'מְטַפֵּל בַּיֶּלֶד / בַּבְּעָיָה',
    exampleRu: 'заботится о ребёнке / решает вопрос',
  },
  'להשתמש': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'пользоваться чем-то',
    exampleHe: 'מִשְׁתַּמֵּשׁ בַּמַּחְשֵׁב',
    exampleRu: 'пользуется компьютером',
  },
  'לגעת': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'прикасаться к / трогать',
    exampleHe: 'נוֹגֵעַ בַּמַּסָּךְ',
    exampleRu: 'касается экрана',
  },
  'להתעניין': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'интересоваться чем-то',
    exampleHe: 'מִתְעַנְיֵן בְּשָׂפוֹת',
    exampleRu: 'интересуется языками',
  },
  'להתאהб': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'влюбляться в кого-то',
    exampleHe: 'מִתְאַהֵב בָּהּ',
    exampleRu: 'влюбляется в неё',
  },
  'להתאהב': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'влюбляться в кого-то',
    exampleHe: 'מִתְאַהֵב בָּהּ',
    exampleRu: 'влюбляется в неё',
  },
  'להיזכר': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'вспоминать о чём-то',
    exampleHe: 'נִזְכָּר בְּמַשֶּׁהוּ חָשׁוּב',
    exampleRu: 'вспоминает о чём-то важном',
  },
  'לגור': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'жить / проживать где-то',
    exampleHe: 'גָּר בְּתֵל אָבִיב',
    exampleRu: 'живёт в Тель-Авиве',
  },
  'לעבוד': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'работать где-то',
    exampleHe: 'עוֹבֵד בְּמִשְׂרָד',
    exampleRu: 'работает в офисе',
  },
  'ללמוד': {
    preposition: 'בְּ... (אֶת...)',
    prepositionPlain: 'ב',
    ruleRu: 'учиться где-то (ב) / изучать что-то (את)',
    exampleHe: 'לוֹמֵד בָּאוּנִיבֶרְסִיטָה',
    exampleRu: 'учится в университете',
  },
  'להצליח': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'преуспевать в чём-то',
    exampleHe: 'מַצְלִיחַ בַּמִּבְחָן',
    exampleRu: 'преуспевает на экзамене',
  },
  'להיכשל': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'проваливаться в чём-то',
    exampleHe: 'נִכְשָׁל בַּטֶּסְט',
    exampleRu: 'проваливает тест',
  },
  'להשתתף': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'участвовать в чём-то',
    exampleHe: 'מִשְׁתַּתֵּף בַּשִּׁעוּר',
    exampleRu: 'участвует в уроке',
  },
  'להישאר': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'оставаться где-то',
    exampleHe: 'נִשְׁאָר בַּבַּיִת',
    exampleRu: 'остаётся дома',
  },
  'לטייל': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'гулять / путешествовать где-то',
    exampleHe: 'מְטַיֵּל בַּפַּארְק',
    exampleRu: 'гуляет по парку',
  },
  'לשחות': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'плавать где-то',
    exampleHe: 'שׂוֹחֶה בַּבְּרֵכָה',
    exampleRu: 'плавает в бассейне',
  },
  'לזכות': {
    preposition: 'בְּ...',
    prepositionPlain: 'ב',
    ruleRu: 'выигрывать / удостаиваться чего-то',
    exampleHe: 'זוֹכֶה בַּפְּרָס',
    exampleRu: 'выигрывает приз',
  },

  // --- Предлог אֶת... (прямой объект / винительный падеж) ---
  'לפגוש': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'встречать кого-то (прямой объект)',
    exampleHe: 'פּוֹגֵשׁ אֶת הַחֲבֵר',
    exampleRu: 'встречает друга',
  },
  'לראות': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'видеть / смотреть кого-то или что-то',
    exampleHe: 'רוֹאֶה אֶת הַסֶּרֶט',
    exampleRu: 'смотрит фильм',
  },
  'לשמוע': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'слышать кого-то или что-то',
    exampleHe: 'שׁוֹמֵעַ אֶת הַמּוּזִיקָה',
    exampleRu: 'слушает музыку',
  },
  'לאהוב': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'любить кого-то или что-то',
    exampleHe: 'אוֹהֵב אֶת הַיְּלָדִים',
    exampleRu: 'любит детей',
  },
  'להכיר': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'знать кого-то / быть знакомым',
    exampleHe: 'מַכִּיר אֶת הָאִישׁ הַזֶּה',
    exampleRu: 'знает этого человека',
  },
  'להזמין': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'приглашать кого-то / заказывать что-то',
    exampleHe: 'מַזְמִין אֶת הָאוֹרְחִים / פִּיצָה',
    exampleRu: 'приглашает гостей / заказывает пиццу',
  },
  'לזכור': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'помнить кого-то / что-то',
    exampleHe: 'זוֹכֵר אֶת הַשֵּׁם שֶׁלּוֹ',
    exampleRu: 'помнит его имя',
  },
  'לשכוח': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'забывать кого-то / что-то',
    exampleHe: 'שׁוֹכֵחַ אֶת הַמַּפְתֵּחַ',
    exampleRu: 'забывает ключ',
  },
  'לפתוח': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'открывать что-то',
    exampleHe: 'פּוֹתֵחַ אֶת הַדֶּלֶת',
    exampleRu: 'открывает дверь',
  },
  'לסגור': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'закрывать что-то',
    exampleHe: 'סוֹגֵר אֶת הַחַלּוֹן',
    exampleRu: 'закрывает окно',
  },
  'לקחת': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'брать что-то',
    exampleHe: 'לוֹקֵחַ אֶת הַתִּיק',
    exampleRu: 'берёт сумку',
  },
  'לקנות': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'покупать что-то',
    exampleHe: 'קוֹנֶה אֶת הַסֵּפֶר',
    exampleRu: 'покупает книгу',
  },
  'לאכול': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'есть что-то',
    exampleHe: 'אוֹכֵל אֶת הַתַּפּוּחַ',
    exampleRu: 'ест яблоко',
  },
  'לשתות': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'пить что-то',
    exampleHe: 'שׁוֹתֶה אֶת הַקָּפֶה',
    exampleRu: 'пьёт кофе',
  },
  'לדעת': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'знать что-то (прямой объект)',
    exampleHe: 'יוֹדֵעַ אֶת הַתְּשׁוּבָה',
    exampleRu: 'знает ответ',
  },
  'להבין': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'понимать кого-то / что-то',
    exampleHe: 'מֵבִין אֶת הַמּוֹרֶה',
    exampleRu: 'понимает учителя',
  },
  'לחפש': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'искать кого-то / что-то',
    exampleHe: 'מְחַפֵּשׂ אֶת הַמִּשְׁקָפַיִם',
    exampleRu: 'ищет очки',
  },
  'למצוא': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'находить что-то',
    exampleHe: 'מוֹצֵא אֶת הַכֶּסֶף',
    exampleRu: 'находит деньги',
  },
  'לבדוק': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'проверять что-то',
    exampleHe: 'בּוֹדֵק אֶת הַמְּשִׂימָה',
    exampleRu: 'проверяет задание',
  },
  'לסיים': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'заканчивать что-то',
    exampleHe: 'מְסַיֵּם אֶת הָעֲבוֹדָה',
    exampleRu: 'заканчивает работу',
  },
  'לנקות': {
    preposition: 'אֶת...',
    prepositionPlain: 'את',
    ruleRu: 'убирать / мыть что-то',
    exampleHe: 'מְנַקֶּה אֶת הַבַּיִת',
    exampleRu: 'убирает дом',
  },

  // --- Предлог עַל... (о чём-то / на чём-то) ---
  'לחשוב': {
    preposition: 'עַל...',
    prepositionPlain: 'על',
    ruleRu: 'думать о ком-то / чём-то',
    exampleHe: 'חוֹשֵׁב עַל הֶעָתִיד',
    exampleRu: 'думает о будущем',
  },
  'לדבר': {
    preposition: 'עַל... (עִם...)',
    prepositionPlain: 'על',
    ruleRu: 'говорить о чём-то (על) с кем-то (עם)',
    exampleHe: 'מְדַבֵּר עַל הַמַּצָּב עִם דָּנִי',
    exampleRu: 'говорит о ситуации с Дани',
  },
  'לשמור': {
    preposition: 'עַל...',
    prepositionPlain: 'על',
    ruleRu: 'охранять / беречь кого-то или что-то',
    exampleHe: 'שׁוֹמֵר עַל הַבְּרִיאוּת',
    exampleRu: 'бережет здоровье',
  },
  'לסמוך': {
    preposition: 'עַל...',
    prepositionPlain: 'על',
    ruleRu: 'полагаться / доверять кому-то',
    exampleHe: 'סוֹמֵךְ עָלֶיךָ',
    exampleRu: 'полагается на тебя',
  },
  'להשפיע': {
    preposition: 'עַל...',
    prepositionPlain: 'על',
    ruleRu: 'влиять на кого-то / что-то',
    exampleHe: 'מַשְׁפִּיעַ עַל הַהַחְלָטָה',
    exampleRu: 'влияет на решение',
  },
  'לכעוס': {
    preposition: 'עַל...',
    prepositionPlain: 'על',
    ruleRu: 'злиться / сердиться на кого-то',
    exampleHe: 'כּוֹעֵס עַל הַיֶּלֶד',
    exampleRu: 'злится на ребёнка',
  },
  'לשלם': {
    preposition: 'עַל... (לְ...)',
    prepositionPlain: 'על',
    ruleRu: 'платить за что-то (על) кому-то (ל)',
    exampleHe: 'מְשַׁלֵּם עַל הָאֲרוּחָה לַמֶּלְצַר',
    exampleRu: 'платит за обед официанту',
  },
  'להמליץ': {
    preposition: 'עַל...',
    prepositionPlain: 'על',
    ruleRu: 'рекомендовать что-то',
    exampleHe: 'מַמְלִיץ עַל הַסֵּפֶר הַזֹּאת',
    exampleRu: 'рекомендует этот ресторан',
  },

  // --- Предлог מִ... (из / от / от чего-то) ---
  'לבקש': {
    preposition: 'מִ...',
    prepositionPlain: 'מ',
    ruleRu: 'просить у кого-то (מ) что-то (את)',
    exampleHe: 'מְבַקֵּשׁ עֶזְרָה מֵהַמּוֹרֶה',
    exampleRu: 'просит помощи у учителя',
  },
  'לקבל': {
    preposition: 'מִ...',
    prepositionPlain: 'מ',
    ruleRu: 'получать от кого-то',
    exampleHe: 'מְקַבֵּל מִכְתָּב מֵחָבֵר',
    exampleRu: 'получает письмо от друга',
  },
  'לפחד': {
    preposition: 'מִ...',
    prepositionPlain: 'מ',
    ruleRu: 'бояться кого-то / чего-то',
    exampleHe: 'מְפַחֵד מֵהַחֹשֶׁךְ',
    exampleRu: 'боится темноты',
  },
  'להיפרד': {
    preposition: 'מִ...',
    prepositionPlain: 'מ',
    ruleRu: 'прощаться / расставаться с кем-то',
    exampleHe: 'נִפְרָד מֵהַחֲבֵרִים',
    exampleRu: 'прощается с друзьями',
  },
  'לצאת': {
    preposition: 'מִ...',
    prepositionPlain: 'מ',
    ruleRu: 'выходить из чего-то',
    exampleHe: 'יוֹצֵא מֵהַבַּיִת',
    exampleRu: 'выходит из дома',
  },
  'להתרגש': {
    preposition: 'מִ...',
    prepositionPlain: 'מ',
    ruleRu: 'волноваться / растрогаться от чего-то',
    exampleHe: 'מִתְרַגֵּשׁ מֵהַבְּשׂוֹרָה',
    exampleRu: 'растроган новостью',
  },

  // --- Предлог עִם... (с кем-то) ---
  'להסכים': {
    preposition: 'עִם...',
    prepositionPlain: 'עם',
    ruleRu: 'соглашаться с кем-то',
    exampleHe: 'מַסְכִּים עִם הַדֵּעָה שֶׁלְּךָ',
    exampleRu: 'согласен с твоим мнением',
  },
  'להיפגש': {
    preposition: 'עִם...',
    prepositionPlain: 'עם',
    ruleRu: 'встречаться (по договоренности) с кем-то',
    exampleHe: 'נִפְגָּשׁ עִם הָרוֹפֵא',
    exampleRu: 'встречается с врачом',
  },
  'להסתדר': {
    preposition: 'עִם...',
    prepositionPlain: 'עם',
    ruleRu: 'ладить с кем-то / справляться с чем-то',
    exampleHe: 'מִסְתַּדֵּר עִם כֻּלָּם',
    exampleRu: 'ладит со всеми',
  },
  'לריב': {
    preposition: 'עִם...',
    prepositionPlain: 'עם',
    ruleRu: 'ссориться с кем-то',
    exampleHe: 'רָב עִם הָאָח',
    exampleRu: 'ссорится с братом',
  },
};

/**
 * Получить информацию о предлоге управления для глагола (по инфинитиву или корню)
 */
export function getVerbPrepositionInfo(verbHebrew: string): VerbPrepositionInfo | null {
  if (!verbHebrew) return null;
  const clean = stripNikkud(verbHebrew).trim().toLowerCase().replace(/["'״׳\-–—]/g, '');
  if (!clean) return null;

  // Прямой поиск по словарю управления
  if (VERB_PREPOSITIONS[clean]) {
    return VERB_PREPOSITIONS[clean];
  }

  // Поиск с добавлением/удалением начальной 'ל'
  if (!clean.startsWith('ל') && VERB_PREPOSITIONS['ל' + clean]) {
    return VERB_PREPOSITIONS['ל' + clean];
  }

  // Поиск по подстроке в ключах
  for (const [key, info] of Object.entries(VERB_PREPOSITIONS)) {
    if (clean.includes(key) || key.includes(clean)) {
      return info;
    }
  }

  return null;
}
