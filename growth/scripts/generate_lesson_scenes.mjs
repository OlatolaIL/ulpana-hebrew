import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const SCENES_DIR = path.resolve(ROOT, 'growth/scenes');

const LESSON_CONFIGS = [
  {
    number: 1,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 1 (Приветствие и знакомство)',
    lessonLabel: 'УРОК 1',
    hookBadge: 'ОФИС В ТЕЛЬ-АВИВЕ 💻',
    hookLocation: 'Хайтек в Сароне • 09:30',
    hookTitle: 'Первый рабочий день',
    hookAvatar: '💼',
    characterName: 'Томер (Тимлид)',
    characterSub: 'Слушает вопрос нового сотрудника',
    promptLabel: 'ЗАДАЧА УРОКА 1',
    promptText: 'Спросить у коллеги, свободен ли он, и не перепутать пол',
    failBadge: 'ОШИБКА В РОДЕ! 😱',
    failAuthorStudent: 'Новичок',
    failAuthorLead: 'Тимлид',
    failStudentHe: 'סְלִיחָה, אַתְּ פְּנוּיָה?',
    failStudentRu: '«Извините, ты (ж.р.) свободна?»',
    failLeadHe: 'אֲנִי נִרְאֶה לָךְ כְּמוֹ בַּחוּרָה, אָחִי?!',
    failLeadRu: '«Я похож на девушку, брат?!»',
    errorWrong: 'אַתְּ (к женщине)',
    errorCorrect: 'אַתָּה (к мужчине)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 1 💡',
    ruleCol1Title: 'К МУЖЧИНЕ',
    ruleCol1He: 'אַתָּה',
    ruleCol1Trans: 'атá (ты)',
    ruleCol2Title: 'К ЖЕНЩИНЕ',
    ruleCol2He: 'אַתְּ',
    ruleCol2Trans: 'ат (ты)',
    simLeadHe: 'אַתָּה פָּנוּי כָּרֶגַע?',
    simStudentHe: 'כֵּן, אֲנִי פָּנוּי!',
    simStudentRu: 'Да, я свободен!',
    outroTitle: 'УРОК 1 • ЗНАКОМСТВО',
  },
  {
    number: 1,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 1 Spicy (Свидание)',
    lessonLabel: 'УРОК 1',
    hookBadge: 'ПЕРВОЕ СВИДАНИЕ 🍸',
    hookLocation: 'Бар на Ротшильд • 20:00',
    hookTitle: 'Комплимент на свидании',
    hookAvatar: '💃',
    characterName: 'Михаль',
    characterSub: 'Ждёт красивый комплимент',
    promptLabel: 'ЗАДАЧА УРОКА 1',
    promptText: 'Сделать комплимент девушке и не назвать её парнем',
    failBadge: 'КОМПЛИМЕНТ НЕ ТОМУ ПОЛУ! 🙈',
    failAuthorStudent: 'Парень',
    failAuthorLead: 'Девушка',
    failStudentHe: 'שָׁלוֹם! אַתָּה יָפֶה מְאוֹד!',
    failStudentRu: '«Привет! Ты (мужчина) очень красивый!»',
    failLeadHe: 'תוֹדָה, אֲבָל מֵאָז הַבֹּקֶר אֲנִי עֲדַיִן אִשָּׁה!',
    failLeadRu: '«Спасибо, но с утра я всё ещё женщина!»',
    errorWrong: 'אַתָּה יָפֶה (м.р.)',
    errorCorrect: 'אַתְּ יָפָה (ж.р.)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 1 💡',
    ruleCol1Title: 'МУЖЧИНЕ',
    ruleCol1He: 'אַתָּה יָפֶה',
    ruleCol1Trans: 'атá яфэ́',
    ruleCol2Title: 'ДЕВУШКЕ',
    ruleCol2He: 'אַתְּ יָפָה',
    ruleCol2Trans: 'ат яфа́',
    simLeadHe: 'מַה שְּׁלוֹמֵךְ הָעֶרֶב?',
    simStudentHe: 'אַתְּ יָפָה מְאוֹד הָעֶרֶב!',
    simStudentRu: 'Ты очень красивая сегодня вечером!',
    outroTitle: 'УРОК 1 • СВИДАНИЕ',
  },
  {
    number: 2,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 2 (Кафе и заказы)',
    lessonLabel: 'УРОК 2',
    hookBadge: 'АРОМА В ТЕЛЬ-АВИВЕ ☕',
    hookLocation: 'Aroma Espresso Bar • 10:15',
    hookTitle: 'Заказ кофе в первый день',
    hookAvatar: '☕',
    characterName: 'Эли (Бариста)',
    characterSub: 'Слушает заказ у стойки',
    promptLabel: 'ЗАДАЧА УРОКА 2',
    promptText: 'Заказать капучино и не опозориться перед всей очередью',
    failBadge: 'ОШИБКА В ОДНУ БУКВУ! 😱',
    failAuthorStudent: 'Новичок',
    failAuthorLead: 'Бариста',
    failStudentHe: 'אֲנִי רוֹצֶה קָפֶה עִם חָלָב הָפוּךְ!',
    failStudentRu: '«Я хочу кофе с перевёрнутым молоком!»',
    failLeadHe: 'כָּכָה טוֹב לְךָ, גֶּבֶר?!',
    failLeadRu: '«Так тебе пойдёт, мужик?!»',
    errorWrong: 'חָלָב הָפוּךְ',
    errorCorrect: 'קָפֶה הָפוּךְ',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 2 💡',
    ruleCol1Title: 'МУЖСКОЙ РОД',
    ruleCol1He: 'רוֹצֶה',
    ruleCol1Trans: 'роцэ́ (хочу)',
    ruleCol2Title: 'ЖЕНСКИЙ РОД',
    ruleCol2He: 'רוֹצָה',
    ruleCol2Trans: 'роца́ (хочу)',
    simLeadHe: 'מַה בִּשְׁבִילְךָ?',
    simStudentHe: 'אֲנִי רוֹצֶה קָפֶה הָפוּךְ, בְּבַקָּשָׁה!',
    simStudentRu: 'Я хочу капучино, пожалуйста!',
    outroTitle: 'УРОК 2 • В КАФЕ',
  },
  {
    number: 2,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 2 Spicy (Свидание)',
    lessonLabel: 'УРОК 2',
    hookBadge: 'СВИДАНИЕ В БАРЕ 🍸',
    hookLocation: 'Florentin Bar • 21:30',
    hookTitle: 'Первое свидание в Израиле',
    hookAvatar: '👱‍♀️',
    characterName: 'Майя (Официантка)',
    characterSub: 'Принимает заказ за столиком',
    promptLabel: 'ЗАДАЧА УРОКА 2',
    promptText: 'Попросить воды и не сделать случайный каминг-аут',
    failBadge: 'ОШИБКА В ОКОНЧАНИИ! 🙈',
    failAuthorStudent: 'Парень',
    failAuthorLead: 'Официантка',
    failStudentHe: 'סְלִיחָה... אֲנִי רוֹצָה אוֹתָךְ!',
    failStudentRu: '«Извините... я [как женщина] хочу тебя!»',
    failLeadHe: 'חָמוּד, קוֹדֵם כָּל אֲנִי סְטְרֵייטִית!',
    failLeadRu: '«Милый, я гетеро, а чаевые у нас кэшем!»',
    errorWrong: 'רוֹצָה (ж.р.)',
    errorCorrect: 'רוֹצֶה (м.р.)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 2 💡',
    ruleCol1Title: 'ДЛЯ МУЖЧИНЫ',
    ruleCol1He: 'רוֹצֶה',
    ruleCol1Trans: 'роцэ́ (хочу)',
    ruleCol2Title: 'ВОДА НА ИВРИТЕ',
    ruleCol2He: 'מַיִם',
    ruleCol2Trans: 'ма́им (вода)',
    simLeadHe: 'מַה תִּרְצֶה לִשְׁתּוֹת?',
    simStudentHe: 'אֲנִי רוֹצֶה מַיִם, בְּבַקָּשָׁה!',
    simStudentRu: 'Я хочу воды, пожалуйста!',
    outroTitle: 'УРОК 2 • СВИДАНИЯ',
  },
  {
    number: 3,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 3 (Такси и языки)',
    lessonLabel: 'УРОК 3',
    hookBadge: 'ТАКСИ В ТЕЛЬ-АВИВЕ 🚕',
    hookLocation: 'Дерех Намир • Светофор • 14:00',
    hookTitle: 'Поездка с израильским таксистом',
    hookAvatar: '🚕',
    characterName: 'Шимон (Таксист)',
    characterSub: 'Ищет свободные уши в пробке',
    promptLabel: 'ЗАДАЧА УРОКА 3',
    promptText: 'Сказать таксисту, что знаешь пару слов, и выжить',
    failBadge: 'ПУЛЕМЁТНЫЙ ИВРИТ! ⚡',
    failAuthorStudent: 'Пассажир',
    failAuthorLead: 'Таксист',
    failStudentHe: 'אֲנִי מְדַבֵּר עִבְרִית קְצָת!',
    failStudentRu: '«Я говорю на иврите чуть-чуть!»',
    failLeadHe: 'יֹפִי! אָז תַּקְשִׁיב, הַמֶּמְשָׁלָה הַזֹּאת...',
    failLeadRu: '«Отлично! Слушай, правительство ворует...»',
    errorWrong: 'עִבְרִית קְצָת',
    errorCorrect: 'לְאַט בְּבַקָּשָׁה',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 3 💡',
    ruleCol1Title: 'ОТКУДА ТЫ?',
    ruleCol1He: 'מֵאֵיפֹה?',
    ruleCol1Trans: 'ме-э́йфо (откуда)',
    ruleCol2Title: 'СПАСИТЕЛЬНАЯ ФРАЗА',
    ruleCol2He: 'לְאַט בְּבַקָּשָׁה',
    ruleCol2Trans: 'ле-а́т (медленно)',
    simLeadHe: 'מֵאֵיפֹה אַתָּה, חַבֵּיר?',
    simStudentHe: 'רַק כַּמָּה מִלִּים, לְאַט בְּבַקָּשָׁה!',
    simStudentRu: 'Только пару слов, медленно, пожалуйста!',
    outroTitle: 'УРОК 3 • ТАКСИ',
  },
  {
    number: 3,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 3 Spicy (Языки)',
    lessonLabel: 'УРОК 3',
    hookBadge: 'ВЕЧЕРИНКА В ФЛОРЕНТИНЕ 🍻',
    hookLocation: 'Rooftop Party • 23:00',
    hookTitle: 'Разговор о родных языках',
    hookAvatar: '🕺',
    characterName: 'Компания друзей',
    characterSub: 'Спрашивают, на чём ты говоришь дома',
    promptLabel: 'ЗАДАЧА УРОКА 3',
    promptText: 'Не перепутать речь с поцелуями',
    failBadge: 'ПУТАНИЦА АНАТОМИИ! 👄',
    failAuthorStudent: 'Парень',
    failAuthorLead: 'Компания',
    failStudentHe: 'אֲנִי מְדַבֵּר עִם הַשְּׂפָתַיִם שֶׁלִּי רַק בַּלַּיְלָה!',
    failStudentRu: '«Я разговариваю губами только по ночам!»',
    failLeadHe: 'וואו וואו, מַר פְלֵייבּוֹי, תַּרְגִּיעַ!',
    failLeadRu: '«Воу-воу, мистер плейбой, притормози!»',
    errorWrong: 'שְׂפָתַיִם (губы)',
    errorCorrect: 'שָׂפָה (язык/речь)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 3 💡',
    ruleCol1Title: 'ЯЗЫК (РЕЧЬ)',
    ruleCol1He: 'שָׂפָה',
    ruleCol1Trans: 'сафа́ (язык)',
    ruleCol2Title: 'ЯЗЫК (ОРГАН)',
    ruleCol2He: 'לָשׁוֹן',
    ruleCol2Trans: 'лашóн (орган)',
    simLeadHe: 'בְּאֵיזוֹ שָׂפָה אַתָּה מְדַבֵּר?',
    simStudentHe: 'אֲנִי מְדַבֵּר רוּסִית וְעִבְרִית!',
    simStudentRu: 'Я говорю по-русски и на иврите!',
    outroTitle: 'УРОК 3 • ЯЗЫКИ',
  },
  {
    number: 4,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 4 (Кто это и что это)',
    lessonLabel: 'УРОК 4',
    hookBadge: 'ОБЕД У БАБУШКИ 🍲',
    hookLocation: 'Шаббатний стол • 13:00',
    hookTitle: 'Неопознанное горячее блюдо',
    hookAvatar: '👵',
    characterName: 'Бабушка Фортуна',
    characterSub: 'Подает гигантскую кастрюлю хамина',
    promptLabel: 'ЗАДАЧА УРОКА 4',
    promptText: 'Спросить про еду, не обидев хозяйку дома',
    failBadge: 'ОНО ЧТО, ЖИВОЕ?! 😱',
    failAuthorStudent: 'Гость',
    failAuthorLead: 'Бабушка',
    failStudentHe: 'סְלִיחָה... מִי זֶה?!',
    failStudentRu: '«Извините... КТО ЭТО?!»',
    failLeadHe: 'מִי זֶה?! זֶה חַמִּין, חַבּוּבּ! הוּא לֹא נוֹשֵׁךְ!',
    failLeadRu: '«Кто это?! Это хамин, он не кусается!»',
    errorWrong: 'מִי זֶה (кто это)',
    errorCorrect: 'מַה זֶּה (что это)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 4 💡',
    ruleCol1Title: 'ПРО ЛЮДЕЙ',
    ruleCol1He: 'מִי זֶה?',
    ruleCol1Trans: 'ми зэ? (кто это?)',
    ruleCol2Title: 'ПРО ЕДУ И ВЕЩИ',
    ruleCol2He: 'מַה זֶּה?',
    ruleCol2Trans: 'ма зэ? (что это?)',
    simLeadHe: 'תִּטְעַם אֶת הַחַמִּין הַזֶּה!',
    simStudentHe: 'תּוֹדָה רַבָּה, מַה זֶּה טָעִים!',
    simStudentRu: 'Большое спасибо, это очень вкусно!',
    outroTitle: 'УРОК 4 • ЕДА VS ЛЮДИ',
  },
  {
    number: 4,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 4 Spicy (Знакомство)',
    lessonLabel: 'УРОК 4',
    hookBadge: 'ЗНАКОМСТВО В БАРЕ 👠',
    hookLocation: 'Dizengoff Square • 22:00',
    hookTitle: 'Друг знакомит со своей девушкой',
    hookAvatar: '👠',
    characterName: 'Дана',
    characterSub: 'Очень гордая и строгая спутница Йоси',
    promptLabel: 'ЗАДАЧА УРОКА 4',
    promptText: 'Не назвать живого человека «этой штукой»',
    failBadge: 'ДЕВУШКА В ЯРОСТИ! 💥',
    failAuthorStudent: 'Новичок',
    failAuthorLead: 'Дана',
    failStudentHe: 'יוֹסִי... מַה זֶּה?!',
    failStudentRu: '«Йоси... ЧТО ЭТО ТАКОЕ?!»',
    failLeadHe: '"מַה זֶּה" תִּקְרָא לָאִמָּא שֶׁלְּךָ!',
    failLeadRu: '«"Что это" маме своей скажешь, наглец!»',
    errorWrong: 'מַה זֶּה (что это)',
    errorCorrect: 'מִי זֹאת (кто это ж.р.)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 4 💡',
    ruleCol1Title: 'МУЖЧИНА',
    ruleCol1He: 'מִי זֶה?',
    ruleCol1Trans: 'ми зэ? (кто это?)',
    ruleCol2Title: 'ЖЕНЩИНА',
    ruleCol2He: 'מִי זֹאת?',
    ruleCol2Trans: 'ми зот? (кто это?)',
    simLeadHe: 'תַּכִּיר, זֹאת דָּנָה!',
    simStudentHe: 'נָעִים מְאוֹד, מִי זֹאת הַיָּפָה?',
    simStudentRu: 'Очень приятно, кто эта красавица?',
    outroTitle: 'УРОК 4 • ВЕЖЛИВОСТЬ',
  },
  {
    number: 5,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 5 (Рынок и фрукты)',
    lessonLabel: 'УРОК 5',
    hookBadge: 'КИОСК СОКОВ НА ДИЗЕНГОФ 🍊',
    hookLocation: 'Жара +38° • Tel Aviv',
    hookTitle: 'Заказ холодного напитка',
    hookAvatar: '🍊',
    characterName: 'Рами (Продавец соков)',
    characterSub: 'Чистит цитрусы у стойки',
    promptLabel: 'ЗАДАЧА УРОКА 5',
    promptText: 'Заказать цитрусовый фреш, а не картофельное пюре',
    failBadge: 'КАРТОФЕЛЬНЫЙ ФРЕШ?! 🥔',
    failAuthorStudent: 'Покупатель',
    failAuthorLead: 'Продавец',
    failStudentHe: 'תֵּן לִי מִיץ תַּפּוּחֵי אֲדָמָה, בְּבַקָּשָׁה!',
    failStudentRu: '«Дайте сок из картошки, пожалуйста!»',
    failLeadHe: 'אַתָּה בָּטוּחַ, אָחִי?! עִם קֶרַח אוֹ בְּלִי?!',
    failLeadRu: '«Ты уверен, брат?! Со льдом или без?!»',
    errorWrong: 'תַּפּוּחֵי אֲדָמָה (картошка)',
    errorCorrect: 'תַּפּוּזִים (апельсины)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 5 💡',
    ruleCol1Title: 'АПЕЛЬСИН',
    ruleCol1He: 'תַּפּוּז',
    ruleCol1Trans: 'тапу́з (апельсин)',
    ruleCol2Title: 'КАРТОШКА',
    ruleCol2He: 'תַּפּוּחַ אֲדָמָה',
    ruleCol2Trans: 'тапу́ах адамá',
    simLeadHe: 'אֵיזֶה מִיץ אַתָּה רוֹצֶה?',
    simStudentHe: 'מִיץ תַּפּוּזִים קַר, בְּבַקָּשָׁה!',
    simStudentRu: 'Холодный апельсиновый сок, пожалуйста!',
    outroTitle: 'УРОК 5 • РЫНОК И СОКИ',
  },
  {
    number: 5,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 5 Spicy (Шук Кармель)',
    lessonLabel: 'УРОК 5',
    hookBadge: 'РЫНОК КАРМЕЛЬ 🫒',
    hookLocation: 'Шук Кармель • Пятница • 12:00',
    hookTitle: 'Покупка солений на шаббат',
    hookAvatar: '🫒',
    characterName: 'Ави (Продавец солений)',
    characterSub: 'Продает крупные зеленые оливки',
    promptLabel: 'ЗАДАЧА УРОКА 5',
    promptText: 'Купить оливок и не сказать мат на весь базар',
    failBadge: 'БУКВА ВЫЗВАЛА ШОК! 🔞',
    failAuthorStudent: 'Покупатель',
    failAuthorLead: 'Ави',
    failStudentHe: 'שָׁלוֹם! כַּמָּה עוֹלֶה הַזַּיִן הַגָּדוֹל הַזֶּה?!',
    failStudentRu: '«Сколько стоит этот здоровенный х**?!»',
    failLeadHe: 'בִּשְׁבִילְךָ זֶה בְּחִנָּם, אֲבָל קוֹרְאִים לָזֶה זַיִת!',
    failLeadRu: '«Для тебя бесплатно, но это маслина!»',
    errorWrong: 'זַיִן (мат / буква)',
    errorCorrect: 'זַיִת (маслина)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 5 💡',
    ruleCol1Title: 'ОЛИВКА / МАСЛИНА',
    ruleCol1He: 'זַיִת',
    ruleCol1Trans: 'за́ит (мн. זֵיתִים)',
    ruleCol2Title: 'МНОЖЕСТВЕННОЕ ЧИСЛО',
    ruleCol2He: 'זֵיתִים',
    ruleCol2Trans: 'зейти́м (оливки)',
    simLeadHe: 'כַּמָּה זֵיתִים תִּרְצֶה?',
    simStudentHe: 'חֲצִי קִילוֹ זֵיתִים יְרוּקִים, בְּבַקָּשָׁה!',
    simStudentRu: 'Полкило зелёных оливок, пожалуйста!',
    outroTitle: 'УРОК 5 • ШУК КАРМЕЛЬ',
  },
  {
    number: 6,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 6 (Семья и принадлежность)',
    lessonLabel: 'УРОК 6',
    hookBadge: 'ДЕТСКАЯ ПЛОЩАДКА 🛝',
    hookLocation: 'Парк Яркон • Тель-Авив • 17:30',
    hookTitle: 'На детской площадке в Тель-Авиве',
    hookAvatar: '👦',
    characterName: 'Михаль (Мама)',
    characterSub: 'Гуляет с детьми на площадке',
    promptLabel: 'ЗАДАЧА УРОКА 6',
    promptText: 'Спросить чей ребёнок и не назвать маму папой',
    failBadge: 'ОШИБКА В ОГЛАСОВКЕ! 😱',
    failAuthorStudent: 'Парень',
    failAuthorLead: 'Михаль',
    failStudentHe: 'סְלִיחָה, זֶה הַיֶּלֶד שֶׁלְּךָ?',
    failStudentRu: '«Извините, это твой (обращаясь к мужчине) ребёнок?»',
    failLeadHe: 'שֶׁלִּי, אֲבָל אֲנִי אִמָּא שֶׁלּוֹ, לֹא אַבָּא שֶׁלּוֹ!',
    failLeadRu: '«Мой, но я его мама, а не папа!»',
    errorWrong: 'שֶׁלְּךָ (к мужчине)',
    errorCorrect: 'שֶׁלָּךְ (к женщине)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 6 💡',
    ruleCol1Title: 'МУЖЧИНЕ',
    ruleCol1He: 'שֶׁלְּךָ',
    ruleCol1Trans: 'шельха́ (твой)',
    ruleCol2Title: 'ЖЕНЩИНЕ',
    ruleCol2He: 'שֶׁלָּךְ',
    ruleCol2Trans: 'шела́х (твой)',
    simLeadHe: 'מִי הַיֶּלֶד הַזֶּה?',
    simStudentHe: 'זֶה הַיֶּלֶד שֶׁלָּךְ, נָכוֹן?',
    simStudentRu: 'Это твой ребёнок, верно?',
    outroTitle: 'УРОК 6 • СЕМЬЯ И БЫТ',
  },
  {
    number: 6,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 6 Spicy (Квартира и муж)',
    lessonLabel: 'УРОК 6',
    hookBadge: 'РАЗГОВОР С СОСЕДКОЙ 🏢',
    hookLocation: 'Подъезд в Бат-Яме • 12:45',
    hookTitle: 'Разговор с соседкой у лифта',
    hookAvatar: '👵',
    characterName: 'Клара (Соседка)',
    characterSub: 'Знает всё про всех жильцов',
    promptLabel: 'ЗАДАЧА УРОКА 6',
    promptText: 'Рассказать про лендлорда и не объявить его мужем',
    failBadge: 'СКАНДАЛ В ПОДЪЕЗДЕ! 🙈',
    failAuthorStudent: 'Девушка',
    failAuthorLead: 'Клара',
    failStudentHe: 'הַבַּעַל שֶׁלִּי בָּא לְפֹה כָּל שָׁבוּעַ וְלוֹקֵחַ כֶּסֶף!',
    failStudentRu: '«Мой муж приходит сюда каждую неделю и забирает деньги!»',
    failLeadHe: 'מַסְכֵּנָה... אֵיזֶה מִין נִשּׂוּאִים אֵלֶּה?! תִּתְקַשְּׁרִי לַמִּשְׁטָרָה!',
    failLeadRu: '«Бедняжка... что это за брак такой?! Звони в полицию!»',
    errorWrong: 'הַבַּעַל שֶׁלִּי (мой муж)',
    errorCorrect: 'בַּעַל הַבַּיִת (лендлорд)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 6 💡',
    ruleCol1Title: 'СУПРУГ',
    ruleCol1He: 'בַּעַל',
    ruleCol1Trans: 'ба́аль (муж)',
    ruleCol2Title: 'ХОЗЯИН ДОМА',
    ruleCol2He: 'בַּעַל הַבַּיִת',
    ruleCol2Trans: 'ба́аль а-ба́ит (лендлорд)',
    simLeadHe: 'מִי הָאִישׁ שֶׁבָּא לְפֹה?',
    simStudentHe: 'זֶה בַּעַל הַבַּיִת שֶׁלִּי, לֹא בַּעַל!',
    simStudentRu: 'Это мой хозяин квартиры, не муж!',
    outroTitle: 'УРОК 6 • СЕМЬЯ И БЫТ',
  },
  {
    number: 7,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 7 (Дом и квартира)',
    lessonLabel: 'УРОК 7',
    hookBadge: 'ТОРГОВЫЙ ЦЕНТР 🛍️',
    hookLocation: 'Каньон Азриэли • 15:40',
    hookTitle: 'Поиски туалета в израильском ТЦ',
    hookAvatar: '🏃‍♂️',
    characterName: 'Давид (Охранник)',
    characterSub: 'Стоит на входе в ТЦ',
    promptLabel: 'ЗАДАЧА УРОКА 7',
    promptText: 'Спросить где туалет и не попросить личную услугу',
    failBadge: 'ОШИБКА В ЧИСЛЕ! 😱',
    failAuthorStudent: 'Парень',
    failAuthorLead: 'Давид',
    failStudentHe: 'אֵיפֹה יֵשׁ פֹּה... שֵׁרוּת לָאָדָם?!',
    failStudentRu: '«Где здесь... услуга человеку?!»',
    failLeadHe: 'מוֹדִיעִין בַּקּוֹמָה שְׁנִיָּה, אָחִי!',
    failLeadRu: '«Справочная на втором этаже, брат!»',
    errorWrong: 'שֵׁרוּת (услуга, ед.ч.)',
    errorCorrect: 'שֵׁרוּתִים (туалет, мн.ч.)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 7 💡',
    ruleCol1Title: 'ЕД. ЧИСЛО',
    ruleCol1He: 'שֵׁרוּת',
    ruleCol1Trans: 'шэру́т (служба/сервис)',
    ruleCol2Title: 'ВСЕГДА МН. ЧИСЛО',
    ruleCol2He: 'שֵׁרוּתִים',
    ruleCol2Trans: 'шэрути́м (туалет)',
    simLeadHe: 'מַה אַתָּה מְחַפֵּשׂ?',
    simStudentHe: 'אֵיפֹה הַשֵּׁרוּתִים, בְּבַקָּשָׁה?',
    simStudentRu: 'Где туалет, пожалуйста?',
    outroTitle: 'УРОК 7 • ДОМ И БЫТ',
  },
  {
    number: 7,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 7 Spicy (Аренда квартиры)',
    lessonLabel: 'УРОК 7',
    hookBadge: 'АРЕНДА В ТЕЛЬ-АВИВЕ 🔑',
    hookLocation: 'Бен-Йегуда • Квартира мечты • 18:20',
    hookTitle: 'Подписание контракта на аренду',
    hookAvatar: '👩',
    characterName: 'Ривка (Хозяйка)',
    characterSub: 'Сдает 2-комнатную квартиру',
    promptLabel: 'ЗАДАЧА УРОКА 7',
    promptText: 'Подписать договор и не предложить расписаться на груди',
    failBadge: 'СТЫД НА ВСЮ УЛИЦУ! 🙈',
    failAuthorStudent: 'Арендатор',
    failAuthorLead: 'Ривка',
    failStudentHe: 'בָּאתִי לַחְתּוֹם עַל הַחָזֶה שֶׁלָּךְ עַכְשָׁיו!',
    failStudentRu: '«Я пришел подписать твою грудь прямо сейчас!»',
    failLeadHe: 'חוֹזֶה, מוֹתֶק! הַחָזֶה שֶׁלִּי לֹא בַּשְּׂכִירוּת!',
    failLeadRu: '«Контракт, милый! Моя грудь не сдается в аренду!»',
    errorWrong: 'חָזֶה (грудь, через А)',
    errorCorrect: 'חוֹזֶה (контракт, через О)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 7 💡',
    ruleCol1Title: 'ДОГОВОР (через О)',
    ruleCol1He: 'חוֹזֶה',
    ruleCol1Trans: 'хозэ́ (контракт)',
    ruleCol2Title: 'ГРУДЬ (через А)',
    ruleCol2He: 'חָזֶה',
    ruleCol2Trans: 'хазэ́ (грудь)',
    simLeadHe: 'אַתָּה מוּכָן לַחְתּוֹם?',
    simStudentHe: 'כֵּן, אֲנִי חוֹתֵם עַל הַחוֹזֶה!',
    simStudentRu: 'Да, я подписываю контракт!',
    outroTitle: 'УРОК 7 • АРЕНДА',
  },
  {
    number: 8,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 8 (Глаголы Пааль)',
    lessonLabel: 'УРОК 8',
    hookBadge: 'ОФИС В ХАЙ-ТЕКЕ 💻',
    hookLocation: 'Сарона • Офис стартапа • 10:00',
    hookTitle: 'В коридоре офиса с боссом',
    hookAvatar: '👨‍💼',
    characterName: 'Томер (Тимлид)',
    characterSub: 'Следит за дедлайнами проекта',
    promptLabel: 'ЗАДАЧА УРОКА 8',
    promptText: 'Рассказать о задачах и не перепутать работу с обедом',
    failBadge: 'ВТОРОЙ ОБЕД В 10 УТРА! 😱',
    failAuthorStudent: 'Сотрудник',
    failAuthorLead: 'Томер',
    failStudentHe: 'אֲנִי הוֹלֵךְ לֶאֱכוֹל שׁוּב!',
    failStudentRu: '«Я иду снова есть!»',
    failLeadHe: 'שָׁעָה עֶשֶׂר בַּבֹּקֶר! רַק הִגַּעְתָּ!',
    failLeadRu: '«10 утра! Ты только пришел!»',
    errorWrong: 'אוֹכֵל (ем)',
    errorCorrect: 'עוֹבֵד (работаю)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 8 💡',
    ruleCol1Title: 'ИДУ ЕСТЬ',
    ruleCol1He: 'אוֹכֵל',
    ruleCol1Trans: 'охэ́ль (ем)',
    ruleCol2Title: 'РАБОТАЮ',
    ruleCol2He: 'עוֹבֵד',
    ruleCol2Trans: 'овэ́д (работаю)',
    simLeadHe: 'מָה אַתָּה עוֹשֶׂה עַכְשָׁיו?',
    simStudentHe: 'אֲנִי הוֹלֵךְ לַעֲבוֹד עַל הַמְּשִׂימָה!',
    simStudentRu: 'Я иду работать над задачей!',
    outroTitle: 'УРОК 8 • ГЛАГОЛЫ ПААЛЬ',
  },
  {
    number: 8,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 8 Spicy (Опасный сленг)',
    lessonLabel: 'УРОК 8',
    hookBadge: 'КОНТРОЛЬНАЯ В КЛАССЕ 📝',
    hookLocation: 'Класс ульпана • Финал теста • 11:55',
    hookTitle: 'Сдача теста по грамматике',
    hookAvatar: '👩‍🏫',
    characterName: 'Сара (Учительница)',
    characterSub: 'Принимает бланки у доски',
    promptLabel: 'ЗАДАЧА УРОКА 8',
    promptText: 'Сказать «я закончил» и не сделать пошлый намек',
    failBadge: 'СКАНДАЛ НА УРОКЕ! 🙈',
    failAuthorStudent: 'Парень',
    failAuthorLead: 'Сара',
    failStudentHe: 'מוֹרָה! גָּמַרְתִּי אִתָּךְ!',
    failStudentRu: '«Учительница! Я кончил с тобой!»',
    failLeadHe: 'סִיַּמְתָּ אֶת הַמִּבְחָן! גּוֹמְרִים בְּמָקוֹם אַחֵר!',
    failLeadRu: '«Ты закончил тест! А кончают в другом месте!»',
    errorWrong: 'גָּמַרְתִּי (сленг 18+)',
    errorCorrect: 'סִיַּמְתִּי (закончил)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 8 💡',
    ruleCol1Title: 'БЕЗОПАСНО',
    ruleCol1He: 'סִיַּמְתִּי',
    ruleCol1Trans: 'сия́мти (я завершил)',
    ruleCol2Title: 'ОПАСНЫЙ СЛЕНГ',
    ruleCol2He: 'גָּמַרְתִּי',
    ruleCol2Trans: 'гамáрти (только 18+)',
    simLeadHe: 'דָּנִיאֵל, מָה עִם הַמִּבְחָן?',
    simStudentHe: 'כֵּן, סִיַּמְתִּי אֶת הַמִּבְחָן!',
    simStudentRu: 'Да, я завершил тест!',
    outroTitle: 'УРОК 8 • ГЛАГОЛЫ',
  },
  {
    number: 9,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 9 (Время и ударения)',
    lessonLabel: 'УРОК 9',
    hookBadge: 'УТРЕННИЙ ОФИС ☀️',
    hookLocation: 'Кухня офиса • Кофемашина • 08:45',
    hookTitle: 'Приветствие израильского босса',
    hookAvatar: '☕',
    characterName: 'Йони (Директор)',
    characterSub: 'Пьет черный кофе на кухне',
    promptLabel: 'ЗАДАЧА УРОКА 9',
    promptText: 'Пожелать доброго утра и не обозвать начальника скотиной',
    failBadge: 'УТРО ИЛИ КОРОВА?! 😱',
    failAuthorStudent: 'Сотрудник',
    failAuthorLead: 'Йони',
    failStudentHe: 'בָּקָר טוֹב, הַבּוֹס!',
    failStudentRu: '«Хорошая говядина / скот, босс!»',
    failLeadHe: 'אֲנִי צִמְחוֹנִי! מָה אַתָּה רוֹצֶה מִמֶּנִּי?!',
    failLeadRu: '«Я вегетарианец! Что ты от меня хочешь?!»',
    errorWrong: 'בָּקָר (бакáр — скот)',
    errorCorrect: 'בֹּקֶר (бо́кер — утро)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 9 💡',
    ruleCol1Title: 'УТРО (ударение на О)',
    ruleCol1He: 'בֹּקֶר',
    ruleCol1Trans: 'бо́кер (утро)',
    ruleCol2Title: 'СКОТ / МЯСО (на А)',
    ruleCol2He: 'בָּקָר',
    ruleCol2Trans: 'бакáр (говядина)',
    simLeadHe: 'בֹּקֶר טוֹב, מַה נִּשְׁמַע?',
    simStudentHe: 'בֹּקֶר מְעֻלֶּה, יוֹנִי!',
    simStudentRu: 'Отличное утро, Йони!',
    outroTitle: 'УРОК 9 • ВРЕМЯ И ЧАСЫ',
  },
  {
    number: 9,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 9 Spicy (Свидание и время)',
    lessonLabel: 'УРОК 9',
    hookBadge: 'НОЧНОЙ ТЕЛЬ-АВИВ 🌙',
    hookLocation: 'Бульвар Ротшильд • 23:45',
    hookTitle: 'Приглашение на чай после свидания',
    hookAvatar: '👱‍♀️',
    characterName: 'Ноа (Девушка)',
    characterSub: 'Ждет у входа в подъезд',
    promptLabel: 'ЗАДАЧА УРОКА 9',
    promptText: 'Согласиться подняться и не отложить встречу на завтра',
    failBadge: 'ПРОВАЛ НА СВИДАНИИ! 🙈',
    failAuthorStudent: 'Парень',
    failAuthorLead: 'Ноа',
    failStudentHe: 'לֹא... מָחָר מִדַּי, אֲנִי אָבוֹא מְאוּחָר!',
    failStudentRu: '«Нет... слишком завтра, я приду поздно!»',
    failLeadHe: 'דַּבֵּר אִתִּי בְּגִלְגּוּל הַבָּא, גֵּאוֹן!',
    failLeadRu: '«Поговорим в следующей жизни, гений!»',
    errorWrong: 'מָחָר (махáр — завтра)',
    errorCorrect: 'מְאוּחָר (меухáр — поздно)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 9 💡',
    ruleCol1Title: 'ЗАВТРА',
    ruleCol1He: 'מָחָר',
    ruleCol1Trans: 'махáр (день)',
    ruleCol2Title: 'ПОЗДНО',
    ruleCol2He: 'מְאוּחָר',
    ruleCol2Trans: 'меухáр (время)',
    simLeadHe: 'עוֹד לֹא מְאוּחָר מִדַּי לְתֵה?',
    simStudentHe: 'לֹא, זֶה בְּדִיּוּק הַזְּמַן, בּוֹאִי!',
    simStudentRu: 'Нет, как раз вовремя, пойдем!',
    outroTitle: 'УРОК 9 • ВРЕМЯ',
  },
  {
    number: 10,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 10 (Транспорт и автобус)',
    lessonLabel: 'УРОК 10',
    hookBadge: 'АВТОБУС В ТЕЛЬ-АВИВЕ 🚌',
    hookLocation: 'Маршрут 25 • Ибн Гвироль • 08:30',
    hookTitle: 'Поездка на автобусе в час пик',
    hookAvatar: '🚌',
    characterName: 'Ицик (Водитель)',
    characterSub: 'Мчит по выделенке на пределе',
    promptLabel: 'ЗАДАЧА УРОКА 10',
    promptText: 'Попросить остановиться и не заказать убийство',
    failBadge: 'УГРОЗА ВОДИТЕЛЮ! 😱',
    failAuthorStudent: 'Пассажир',
    failAuthorLead: 'Ицик',
    failStudentHe: 'נַהָג! תַּהֲרֹג פֹּה בְּבַקָּשָׁה!',
    failStudentRu: '«Водитель! Убей здесь, пожалуйста!»',
    failLeadHe: 'אֶת מִי לַהֲרֹג, יָא מְשֻׁגָּע?! אוֹתְךָ אוֹ אֶת הַזָּקֵן?!',
    failLeadRu: '«Кого убить, псих?! Тебя или старика?!»',
    errorWrong: 'תַּהֲרֹג (убей!)',
    errorCorrect: 'תַּעֲצוֹר (останови!)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 10 💡',
    ruleCol1Title: 'ОСТАНОВИТЬ',
    ruleCol1He: 'לַעֲצוֹר',
    ruleCol1Trans: 'лаацо́р (тормозить)',
    ruleCol2Title: 'УБИТЬ',
    ruleCol2He: 'לַהֲרוֹג',
    ruleCol2Trans: 'лаhаро́г (опасно!)',
    simLeadHe: 'אֵיפֹה אַתָּה צָרִיךְ?',
    simStudentHe: 'אֶפְשָׁר לַעֲצוֹר בַּתַּחֲנָה, בְּבַקָּשָׁה?',
    simStudentRu: 'Можно остановить на остановке, пожалуйста?',
    outroTitle: 'УРОК 10 • ТРАНСПОРТ',
  },
  {
    number: 10,
    variant: 'spicy',
    themeColor: '#ec4899',
    themeBg: '#0c0a14',
    themeCardBg: 'rgba(236, 72, 153, 0.08)',
    title: 'Ульпан Алеф — Урок 10 Spicy (Такси и возраст)',
    lessonLabel: 'УРОК 10',
    hookBadge: 'ТАКСИ НА АЯЛОНЕ 🚕',
    hookLocation: 'Трасса Аялон • Пробка • 19:15',
    hookTitle: 'Навигация для нервного таксиста',
    hookAvatar: '🚕',
    characterName: 'Мордехай (Таксист)',
    characterSub: '20 лет за рулем в Израиле',
    promptLabel: 'ЗАДАЧА УРОКА 10',
    promptText: 'Сказать «ехать прямо» и не обозвать водителя рухлядью',
    failBadge: 'ОСКОРБЛЕНИЕ ВОДИТЕЛЯ! 🙈',
    failAuthorStudent: 'Пассажир',
    failAuthorLead: 'Мордехай',
    failStudentHe: 'תִּסַּע יָשָׁן! עוֹד יוֹתֵר יָשָׁן!',
    failStudentRu: '«Езжай старый! Ещё более старый!»',
    failLeadHe: 'מִי יָשָׁן, יָא חַבּוּבּ?! אֲנִי נַהָג עֶשְׂרִים שָׁנָה! רֵד מֵהַמּוֹנִית!',
    failLeadRu: '«Кто старый, дружок?! Я 20 лет водитель! Вон из машины!»',
    errorWrong: 'יָשָׁן (старый)',
    errorCorrect: 'יָשָׁר (прямо)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 10 💡',
    ruleCol1Title: 'ПРЯМО',
    ruleCol1He: 'יָשָׁר',
    ruleCol1Trans: 'яша́р (вперёд)',
    ruleCol2Title: 'СТАРЫЙ',
    ruleCol2He: 'יָשָׁן',
    ruleCol2Trans: 'яша́н (ветхий)',
    simLeadHe: 'לְאָן לִפְנוֹת בָּרַמְזוֹר?',
    simStudentHe: 'תִּסַּע יָשָׁר, בְּבַקָּשָׁה!',
    simStudentRu: 'Езжайте прямо, пожалуйста!',
    outroTitle: 'УРОК 10 • ТРАНСПОРТ',
  },
  {
    number: 11,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 11 (Острая еда и сленг)',
    lessonLabel: 'УРОК 11',
    hookBadge: 'ИЗРАИЛЬСКИЙ РЕСТОРАН 🌶️',
    hookLocation: 'Шук Кармель • Ресторан • 13:30',
    hookTitle: 'Русские не боятся острого',
    hookAvatar: '🌶️',
    characterName: 'Эли (Официант)',
    characterSub: 'Принес соус с халапеньо',
    promptLabel: 'ЗАДАЧА УРОКА 11',
    promptText: 'Сказать, что во рту огонь, не вызывая пожарных',
    failBadge: 'ПОЖАР В РЕСТОРАНЕ! 🚒',
    failAuthorStudent: 'Гость',
    failAuthorLead: 'Официант',
    failStudentHe: 'הַמֶּלְצַר! אֲנִי שׂוֹרֵף! תַּזְמִין כַּבָּאִים!',
    failStudentRu: '«Официант! Я горю/поджигаю! Вызывай пожарных!»',
    failLeadHe: 'חַבּוּבּ, שׂוֹרֵף לְךָ הַפֶּה, הַבִּנְיָן לֹא בְּלֶהָבוֹת!',
    failLeadRu: '«Дружок, тебе во рту жжет, а не здание в огне!»',
    errorWrong: 'אֲנִי שׂוֹרֵף (я поджигаю)',
    errorCorrect: 'שׂוֹרֵף לִי (мне жжёт)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 11 💡',
    ruleCol1Title: 'Я ПОДЖИГАЮ',
    ruleCol1He: 'אֲנִי שׂוֹרֵף',
    ruleCol1Trans: 'ани сорэ́ф (опасно)',
    ruleCol2Title: 'МНЕ ЖЖЁТ',
    ruleCol2He: 'שׂוֹרֵף לִי',
    ruleCol2Trans: 'сорэ́ф ли (остро во рту)',
    simLeadHe: 'הַכֹּל בְּסֵדֶר עִם הַסְּחוּג?',
    simStudentHe: 'שׂוֹרֵף לִי, תָּבִיא מַיִם בְּבַקָּשָׁה!',
    simStudentRu: 'Мне жжёт, принеси воды пожалуйста!',
    outroTitle: 'УРОК 11 • ЕДА И ОСТРОТА',
  },
  {
    number: 12,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 12 (Битва за кондиционер)',
    lessonLabel: 'УРОК 12',
    hookBadge: 'БИТВА В ОФИСЕ ❄️',
    hookLocation: 'Хайтек в Тель-Авиве • Опенспейс • 15:00',
    hookTitle: 'Священная война за мазган',
    hookAvatar: '❄️',
    characterName: 'Томер (Тимлид)',
    characterSub: 'Охраняет пульт от кондиционера',
    promptLabel: 'ЗАДАЧА УРОКА 12',
    promptText: 'Выключить холод и не заказать убийство',
    failBadge: 'УБИЙСТВО В ОПЕНСПЕЙСЕ! 💀',
    failAuthorStudent: 'Сотрудник',
    failAuthorLead: 'Томер',
    failStudentHe: 'סְלִיחָה, קַר מְאוֹד! תַּהֲרֹג אֶת הַמַּזְגָן!',
    failStudentRu: '«Извините, очень холодно! Убей кондиционер!»',
    failLeadHe: 'אִם אַתָּה נוֹגֵעַ בַּשַּׁלָּט — אֲנִי הוֹרֵג אוֹתְךָ!',
    failLeadRu: '«Если ты тронешь пульт — я убью тебя!»',
    errorWrong: 'תַּהֲרֹג (убей)',
    errorCorrect: 'תְּכַבֶּה (выключи)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 12 💡',
    ruleCol1Title: 'ВЫКЛЮЧИТЬ',
    ruleCol1He: 'לְכַבּוֹת',
    ruleCol1Trans: 'лехабо́т (выключить)',
    ruleCol2Title: 'УБИТЬ',
    ruleCol2He: 'לַהֲרוֹג',
    ruleCol2Trans: 'лаhаро́г (убить)',
    simLeadHe: 'מָה הַבְּעָיָה עִם הַמַּזְגָן?',
    simStudentHe: 'אֶפְשָׁר לְכַבּוֹת אוֹ לְהַנְמִיךְ בְּבַקָּשָׁה?',
    simStudentRu: 'Можно выключить или убавить пожалуйста?',
    outroTitle: 'УРОК 12 • ОФИС И БЫТ',
  },
  {
    number: 13,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 13 (Магазин одежды Zara)',
    lessonLabel: 'УРОК 13',
    hookBadge: 'ПРИМЕРОЧНАЯ ZARA 👕',
    hookLocation: 'Дизенгоф Центр • Примерочная • 17:30',
    hookTitle: 'Примерка футболки на размер меньше',
    hookAvatar: '👕',
    characterName: 'Консультант (Zara)',
    characterSub: 'Оценивает слим-фит',
    promptLabel: 'ЗАДАЧА УРОКА 13',
    promptText: 'Выбраться из узкой футболки и попросить размер',
    failBadge: 'ПЛЕННИК ФУТБОЛКИ! 😱',
    failAuthorStudent: 'Покупатель',
    failAuthorLead: 'Консультант',
    failStudentHe: 'הַצִּילוּ! הַחֻלְצָה אוֹכֶלֶת אוֹתִי! אֵיפֹה הַיְּצִיאָה?!',
    failStudentRu: '«Спасите! Футболка пожирает меня! Где выход?!»',
    failLeadHe: 'זֶה סְלִים פִיט, אָחִי, זֶה אָמוּר לִהְיוֹת צָמוּד!',
    failLeadRu: '«Это слим-фит, брат, она и должна быть в обтяжку!»',
    errorWrong: 'אוֹכֶלֶת אוֹתִי',
    errorCorrect: 'קָטָן עָלַי (мало на меня)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 13 💡',
    ruleCol1Title: 'МАЛО НА МЕНЯ',
    ruleCol1He: 'זֶה קָטָן עָלַי',
    ruleCol1Trans: 'зэ катáн алáй',
    ruleCol2Title: 'РАЗМЕР ПОБОЛЬШЕ',
    ruleCol2He: 'מִדָּה יוֹתֵר גְּדוֹלָה',
    ruleCol2Trans: 'мидá йотэ́р гдолá',
    simLeadHe: 'אֵיךְ הַחֻלְצָה, מַתְאִימָה לְךָ?',
    simStudentHe: 'זֶה קָטָן עָלַי, יֵשׁ מִדָּה יוֹתֵר גְּדוֹלָה?',
    simStudentRu: 'Это мало на меня, есть размер побольше?',
    outroTitle: 'УРОК 13 • ПОКУПКИ И ОДЕЖДА',
  },
  {
    number: 14,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 14 (Очередь в поликлинике)',
    lessonLabel: 'УРОК 14',
    hookBadge: 'ПОЛИКЛИНИКА КЛАЛИТ 🏥',
    hookLocation: 'Клалит Тель-Авив • Коридор • 09:15',
    hookTitle: 'Попытка пройти без очереди',
    hookAvatar: '🏥',
    characterName: 'Бабушка в очереди',
    characterSub: 'Держит оборону кабинета',
    promptLabel: 'ЗАДАЧА УРОКА 14',
    promptText: 'Взять талон и не начать скандал',
    failBadge: 'Я ТОЛЬКО СПРОСИТЬ! ⚡',
    failAuthorStudent: 'Пациент',
    failAuthorLead: 'Очередь',
    failStudentHe: 'אֲנִי רַק שְׁאֵלָה קְטַנָּה!',
    failStudentRu: '«Я только маленький вопрос!»',
    failLeadHe: 'שֵׁב שָׁם! כֻּלָּנוּ פֹּה רַק שְׁאֵלָה מֵהַבֹּקֶר!',
    failLeadRu: '«Сядь там! Мы тут все только вопрос с утра!»',
    errorWrong: 'רַק שְׁאֵלָה (скандал)',
    errorCorrect: 'תּוֹר (очередь/талон)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 14 💡',
    ruleCol1Title: 'ТАЛОН / ОЧЕРЕДЬ',
    ruleCol1He: 'תּוֹר',
    ruleCol1Trans: 'тор (очередь)',
    ruleCol2Title: 'БОЛИТ ГОЛОВА',
    ruleCol2He: 'כּוֹאֵב לִי הָרֹאשׁ',
    ruleCol2Trans: 'коэ́в ли hа-рош',
    simLeadHe: 'מָה הַתּוֹר שֶׁלְּךָ, אָחִי?',
    simStudentHe: 'הִנֵּה הַתּוֹר שֶׁלִּי, כּוֹאֵב לִי הָרֹאשׁ!',
    simStudentRu: 'Вот мой талон, у меня болит голова!',
    outroTitle: 'УРОК 14 • МЕДИЦИНА И ОЧЕРЕДЬ',
  },
  {
    number: 15,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 15 (Сосед с перфоратором)',
    lessonLabel: 'УРОК 15',
    hookBadge: 'УТРО ПЯТНИЦЫ В ДОМЕ 🔨',
    hookLocation: 'Флорентин • Подъезд • Пятница 07:30',
    hookTitle: 'Законное утро и соседский ремонт',
    hookAvatar: '🔨',
    characterName: 'Йоси (Сосед)',
    characterSub: 'Сверлит стену в 7 утра',
    promptLabel: 'ЗАДАЧА УРОКА 15',
    promptText: 'Остановить перфоратор на правильном иврите',
    failBadge: 'ПЕРФОРАТОР С УТРА! 😱',
    failAuthorStudent: 'Сосед снизу',
    failAuthorLead: 'Йоси',
    failStudentHe: 'תִּפְסִיק לַחְפּוֹר, שַׁבָּת הַיּוֹם!',
    failStudentRu: '«Перестань сверлить/нудить, шаббат сегодня!»',
    failLeadHe: 'עוֹד לֹא נִכְנְסָה שַׁבָּת, אָחִי, יֵשׁ לִי עוֹד שָׁעָה לְשַׁפֵּץ!',
    failLeadRu: '«Шаббат еще не зашел, брат, у меня еще час на ремонт!»',
    errorWrong: 'לַחְפּוֹר (копать/нудить)',
    errorCorrect: 'לִישׁוֹן (спать)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 15 💡',
    ruleCol1Title: 'СПАТЬ',
    ruleCol1He: 'לִישׁוֹן',
    ruleCol1Trans: 'лишóн (спать)',
    ruleCol2Title: 'ХОЧУ ТИШИНЫ',
    ruleCol2He: 'אֲנִי רוֹצֶה שֶׁקֶט',
    ruleCol2Trans: 'ани роцэ́ шэ́кет',
    simLeadHe: 'מָה קָרָה, חַבֵּיר, לָמָּה אַתָּה צוֹעֵק?',
    simStudentHe: 'אֲנִי רוֹצֶה לִישׁוֹן, תִּהְיֶה בְּשֶׁקֶט בְּבַקָּשָׁה!',
    simStudentRu: 'Я хочу спать, потише пожалуйста!',
    outroTitle: 'УРОК 15 • ДОМ И СОСЕДИ',
  },
  {
    number: 16,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 16 (Ориентация в городе)',
    lessonLabel: 'УРОК 16',
    hookBadge: 'УЛИЦЫ ТЕЛЬ-АВИВА 🗺️',
    hookLocation: 'Ибн Гвироль • Площадь Рабина • 12:00',
    hookTitle: 'Прохожий спросил дорогу к мэрии',
    hookAvatar: '🗺️',
    characterName: 'Прохожий в городе',
    characterSub: 'Ищет здание Ирии',
    promptLabel: 'ЗАДАЧА УРОКА 16',
    promptText: 'Ответить прохожему вежливо, а не грубо',
    failBadge: 'БЕЗ ПОНЯТИЯ! 🤷‍♂️',
    failAuthorStudent: 'Репатриант',
    failAuthorLead: 'Прохожий',
    failStudentHe: 'סְלִיחָה, אֵין לִי מֻשָּׂג!',
    failStudentRu: '«Извините, понятия не имею!»',
    failLeadHe: 'אַתָּה גָּר פֹּה כְּבָר שָׁנָה, אֵיךְ אֵין לְךָ מֻשָּׂג?!',
    failLeadRu: '«Ты живешь тут уже год, как это понятия не имеешь?!»',
    errorWrong: 'אֵין לִי מֻשָּׂג (грубовато)',
    errorCorrect: 'אֲנִי לֹא מִכָּאן (вежливо)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 16 💡',
    ruleCol1Title: 'ПОНЯТИЯ НЕ ИМЕЮ',
    ruleCol1He: 'אֵין לִי מֻשָּׂג',
    ruleCol1Trans: 'эйн ли мусáг',
    ruleCol2Title: 'Я НЕ ОТСЮДА',
    ruleCol2He: 'אֲנִי לֹא מִכָּאן',
    ruleCol2Trans: 'ани ло ми-кáн',
    simLeadHe: 'סְלִיחָה, אֵיךְ מַגִּיעִים לְעִירִיָּה?',
    simStudentHe: 'סְלִיחָה, אֲנִי לֹא מִכָּאן, אֵין לִי מֻשָּׂג!',
    simStudentRu: 'Извините, я не отсюда, понятия не имею!',
    outroTitle: 'УРОК 16 • ГОРОД И ОРИЕНТАЦИЯ',
  },
  {
    number: 17,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 17 (Собеседование и зарплата)',
    lessonLabel: 'УРОК 17',
    hookBadge: 'СОБЕСЕДОВАНИЕ В САРОНЕ 💼',
    hookLocation: 'Башня Азриэли Сарона • 35 этаж • 11:00',
    hookTitle: 'Вопрос о зарплатных ожиданиях',
    hookAvatar: '💼',
    characterName: 'Томер (CEO)',
    characterSub: 'Спрашивает про оклад',
    promptLabel: 'ЗАДАЧА УРОКА 17',
    promptText: 'Назвать оклад и не продаться за две ложки сахара',
    failBadge: 'ЗАРПЛАТА ИЛИ САХАР?! ☕',
    failAuthorStudent: 'Кандидат',
    failAuthorLead: 'Томер',
    failStudentHe: 'וּמָה הַשָּׂכָר? שְׁתֵּי כַּפִּיּוֹת בְּלִי חָלָב, בְּבַקָּשָׁה!',
    failStudentRu: '«А зарплата? Две ложечки без молока, пожалуйста!»',
    failLeadHe: 'אַתָּה הָעוֹבֵד הַמֻּשְׁלָם! חוֹזֶה מִיָּד!',
    failLeadRu: '«Ты идеальный сотрудник! Контракт прямо сейчас!»',
    errorWrong: 'סֻכָּר (сахар в кофе)',
    errorCorrect: 'שָׂכָר (зарплата)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 17 💡',
    ruleCol1Title: 'ЗАРПЛАТА (буква Син)',
    ruleCol1He: 'שָׂכָר',
    ruleCol1Trans: 'саха́р (оклад)',
    ruleCol2Title: 'САХАР (буква Самех)',
    ruleCol2He: 'סֻכָּר',
    ruleCol2Trans: 'сука́р (в чае)',
    simLeadHe: 'מָה הַשָּׂכָר שֶׁאַתָּה מְצַפֶּה לְקַבֵּל?',
    simStudentHe: 'אֲנִי מְצַפֶּה לְשָׂכָר הוֹגֵן, תּוֹדָה!',
    simStudentRu: 'Я рассчитываю на достойную зарплату, спасибо!',
    outroTitle: 'УРОК 17 • РАБОТА И ЗАРПЛАТА',
  },
  {
    number: 18,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 18 (Пляж и ракетки маткот)',
    lessonLabel: 'УРОК 18',
    hookBadge: 'ПЛЯЖ ГОРДОН В ТЕЛЬ-АВИВЕ 🏖️',
    hookLocation: 'Пляж Гордон • Пятница • 16:00',
    hookTitle: 'Попытка поиграть с местными на пляже',
    hookAvatar: '🏖️',
    characterName: 'Пляжные игроки',
    characterSub: 'Лупят шариком без остановки',
    promptLabel: 'ЗАДАЧА УРОКА 18',
    promptText: 'Попросить ракетку и не напроситься на драку',
    failBadge: 'ДРАКА НА ПЛЯЖЕ! 🥊',
    failAuthorStudent: 'Отдыхающий',
    failAuthorLead: 'Игрок',
    failStudentHe: 'שָׁלוֹם! אֲנִי מְאוֹד אוֹהֵב מַכּוֹת בַּחוֹף! תְּנוּ לִי גַּם!',
    failStudentRu: '«Привет! Я очень люблю побои на пляже! Дайте мне тоже!»',
    failLeadHe: 'בּוֹא, אָחִי, נְסַדֵּר לְךָ מַכּוֹת כְּמוֹ שֶׁאַתָּה אוֹהֵב!',
    failLeadRu: '«Иди сюда, брат, устроим тебе побои как ты любишь!»',
    errorWrong: 'מַכּוֹת (побои/удары)',
    errorCorrect: 'מַטְקוֹת (пляжные ракетки)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 18 💡',
    ruleCol1Title: 'РАКЕТКИ (буква Тет)',
    ruleCol1He: 'מַטְקוֹת',
    ruleCol1Trans: 'матко́т (игра)',
    ruleCol2Title: 'ПОБОИ (буква Каф)',
    ruleCol2He: 'מַכּוֹת',
    ruleCol2Trans: 'мако́т (драка)',
    simLeadHe: 'אַתָּה יוֹדֵעַ לְשַׂחֵק מַטְקוֹת?',
    simStudentHe: 'כֵּן, אֲנִי מְשַׂחֵק מַטְקוֹת מְעֻלֶּה!',
    simStudentRu: 'Да, я отлично играю в маткот!',
    outroTitle: 'УРОК 18 • ОТДЫХ И СПОРТ',
  },
  {
    number: 19,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 19 (Почта Доар Исраэль)',
    lessonLabel: 'УРОК 19',
    hookBadge: 'ПОЧТА ДОАР ИСРАЭЛЬ 📦',
    hookLocation: 'Отделение почты • Очередь • 11:30',
    hookTitle: 'Посылка с Алиэкспресса через полгода',
    hookAvatar: '📦',
    characterName: 'Работник почты',
    characterSub: 'Ищет посылку в горе коробок',
    promptLabel: 'ЗАДАЧА УРОКА 19',
    promptText: 'Забрать посылку и назвать трек-номер',
    failBadge: 'ПОСЫЛКА ВЫРОСЛА! 👶',
    failAuthorStudent: 'Клиент',
    failAuthorLead: 'Почтальон',
    failStudentHe: 'אֲבָל הִזְמַנְתִּי רַק נַעֲלַיִם!',
    failStudentRu: '«Но я заказал только обувь!»',
    failLeadHe: 'הַמִּשְׁלוֹחַ הָיָה כָּל כָּךְ אָרֹךְ, שֶׁהַנַּעֲלַיִם הִתְחַתְּנוּ וְנוֹלְדָה לָהֶם עֲגָלָה!',
    failLeadRu: '«Доставка была такой долгой, что туфли поженились и у них родилась коляска!»',
    errorWrong: 'בְּלִי מִסְפַּר מַעֲקָב',
    errorCorrect: 'מִסְפַּר מַעֲקָב (трек-номер)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 19 💡',
    ruleCol1Title: 'ТРЕК-НОМЕР',
    ruleCol1He: 'מִסְפַּר מַעֲקָב',
    ruleCol1Trans: 'миспа́р маакáв',
    ruleCol2Title: 'ЭТО СРОЧНО',
    ruleCol2He: 'זֶה דָּחוּף',
    ruleCol2Trans: 'зэ даху́ф',
    simLeadHe: 'יֵשׁ לְךָ הַזְמָנָה מֵהַדּוֹאַר?',
    simStudentHe: 'יֵשׁ לִי מִסְפַּר מַעֲקָב, זֶה דָּחוּף בְּבַקָּשָׁה!',
    simStudentRu: 'У меня есть трек-номер, это срочно пожалуйста!',
    outroTitle: 'УРОК 19 • ПОЧТА И ПОСЫЛКИ',
  },
  {
    number: 20,
    variant: 'clean',
    themeColor: '#38bdf8',
    themeBg: '#060913',
    themeCardBg: 'rgba(255, 255, 255, 0.05)',
    title: 'Ульпан Алеф — Урок 20 (Автосервис в Яффо)',
    lessonLabel: 'УРОК 20',
    hookBadge: 'АВТОСЕРВИС В ЯФФО 🚗',
    hookLocation: 'Гараж в Яффо • 14:00',
    hookTitle: 'Починить фару в сервисе',
    hookAvatar: '🚗',
    characterName: 'Абу-Рами (Механик)',
    characterSub: 'Мастер «устроить красиво»',
    promptLabel: 'ЗАДАЧА УРОКА 20',
    promptText: 'Узнать цену ремонта до того, как выставят счёт',
    failBadge: 'СЧЁТ НА 9000 ШЕКЕЛЕЙ! 💸',
    failAuthorStudent: 'Клиент',
    failAuthorLead: 'Механик',
    failStudentHe: 'תֵּשַׁע אֲלָפִים שֶׁקֶל עַל בּוֹרֶג?!',
    failStudentRu: '«9000 шекелей за болт?!»',
    failLeadHe: 'אָמַרְתִּי לְךָ שֶׁאֲנִי אֲסַדֵּר אוֹתְךָ, לֹא?!',
    failLeadRu: '«Я же сказал тебе, что я устрою тебя красиво, нет?!»',
    errorWrong: 'אֲנִי אֲסַדֵּר אוֹתְךָ (разведу на бабки)',
    errorCorrect: 'כַּמָּה זֶה יַעֲלֶה (сколько стоит)',
    solutionBadge: 'УЛЬПАН АЛЕФ • УРОК 20 💡',
    ruleCol1Title: 'ПОЧИНИТЬ / НАВЕСТИ ПОРЯДОК',
    ruleCol1He: 'לְסַדֵּר',
    ruleCol1Trans: 'лесадэ́р (сленг: развести)',
    ruleCol2Title: 'СКОЛЬКО ЭТО СТОИТ?',
    ruleCol2He: 'כַּמָּה זֶה יַעֲלֶה?',
    ruleCol2Trans: 'кáма зэ яалэ́?',
    simLeadHe: 'אַל תִּדְאַג, גֶּבֶר, אֲנִי מְסַדֵּר אוֹתְךָ!',
    simStudentHe: 'תַּגִּיד, כַּמָּה זֶה יַעֲלֶה בְּדִיּוּק מֵרֹאשׁ?',
    simStudentRu: 'Скажи, сколько точно это будет стоить заранее?',
    outroTitle: 'УРОК 20 • АВТОСЕРВИС И ТОРГ',
  },
];

function buildHtml(config) {
  const isSpicy = config.variant === 'spicy';
  const accent = config.themeColor;
  const numPad = String(config.number).padStart(2, '0');

  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=390, height=844, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>${config.title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700;800;900&family=Montserrat:wght@700;800;900&family=Heebo:wght@500;700;900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }

    body {
      width: 390px;
      height: 844px;
      overflow: hidden;
      background: ${config.themeBg};
      font-family: 'Rubik', sans-serif;
      color: #fff;
      position: relative;
    }

    #phone-container {
      width: 390px;
      height: 844px;
      position: relative;
      overflow: hidden;
      background: ${config.themeBg};
    }

    .reels-subtitles {
      position: absolute;
      top: 22px;
      left: 14px;
      right: 14px;
      z-index: 1000;
      text-align: center;
      pointer-events: none;
    }

    .sub-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-family: 'Montserrat', sans-serif;
      font-size: 17px;
      font-weight: 900;
      text-transform: uppercase;
      padding: 9px 18px;
      border-radius: 14px;
      background: rgba(10, 15, 30, 0.94);
      border: 2px solid ${accent};
      color: #fff;
      text-shadow: 0 2px 8px rgba(0,0,0,0.8);
      box-shadow: 0 10px 25px rgba(0,0,0,0.6), 0 0 25px ${accent}66;
      transform: scale(0.98);
      transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .sub-badge .yt-pill {
      background: #ef4444;
      color: #fff;
      font-size: 11px;
      font-weight: 900;
      padding: 2px 7px;
      border-radius: 6px;
      letter-spacing: 0.5px;
    }

    .scene {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      pointer-events: none;
      visibility: hidden;
      transition: opacity 0.35s ease, transform 0.35s ease, visibility 0.35s;
      transform: scale(0.98);
      overflow: hidden;
    }

    .scene.active {
      opacity: 1;
      pointer-events: auto;
      visibility: visible;
      transform: scale(1);
    }

    .brand-top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 18px;
      padding: 10px 14px;
      backdrop-filter: blur(12px);
    }

    .brand-left {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .brand-cube {
      width: 34px;
      height: 34px;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Heebo', sans-serif;
      font-weight: 900;
      font-size: 20px;
      color: #fff;
      box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4);
    }

    .brand-text h1 {
      font-size: 14px;
      font-weight: 800;
      letter-spacing: 0.3px;
      line-height: 1.15;
    }

    .brand-text p {
      font-size: 11px;
      color: #94a3b8;
      font-weight: 600;
    }

    .brand-badge-live {
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.5);
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 800;
      color: #fca5a5;
    }

    .live-dot {
      width: 6px;
      height: 6px;
      background: #ef4444;
      border-radius: 50%;
      animation: pulse 1s infinite alternate;
    }

    @keyframes pulse {
      0% { opacity: 0.4; }
      100% { opacity: 1; }
    }

    .app-nav-tabs {
      display: flex;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 4px;
      gap: 4px;
    }

    .tab-item {
      flex: 1;
      text-align: center;
      padding: 7px 0;
      font-size: 12px;
      font-weight: 700;
      border-radius: 10px;
      color: #94a3b8;
    }

    .tab-item.active {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.2) 0%, rgba(2, 132, 199, 0.3) 100%);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.4);
    }

    #scene-intro {
      background: radial-gradient(circle at 50% 30%, #1e293b 0%, #060913 100%);
      display: flex;
      flex-direction: column;
      padding: 72px 16px 20px;
      gap: 12px;
    }

    .situation-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 16px;
      backdrop-filter: blur(16px);
      box-shadow: 0 15px 35px rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .situation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .location-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0284c7;
      color: #e0f2fe;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .situation-title {
      font-size: 18px;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1.25;
    }

    .character-card {
      background: linear-gradient(135deg, rgba(30, 58, 138, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%);
      border: 1.5px solid ${accent};
      border-radius: 18px;
      padding: 14px 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 10px 25px rgba(2, 132, 199, 0.25);
    }

    .character-avatar {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: #0f172a;
      border: 2px solid ${accent};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 30px;
    }

    .character-details h3 {
      font-size: 15px;
      font-weight: 800;
      color: #fff;
    }

    .character-details p {
      font-size: 12px;
      color: #93c5fd;
      margin-top: 2px;
    }

    .intro-bottom-prompt {
      background: rgba(0, 0, 0, 0.4);
      border-radius: 16px;
      padding: 14px;
      border: 1px dashed rgba(56, 189, 248, 0.3);
      display: flex;
      flex-direction: column;
      gap: 6px;
      text-align: center;
    }

    .prompt-label {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: ${accent};
    }

    .prompt-text {
      font-size: 15px;
      font-weight: 700;
      color: #e2e8f0;
      line-height: 1.35;
    }

    #scene-fail {
      background: radial-gradient(circle at 50% 35%, #450a0a 0%, #100404 100%);
      display: flex;
      flex-direction: column;
      padding: 72px 16px 20px;
      gap: 12px;
    }

    .fail-card {
      background: rgba(239, 68, 68, 0.1);
      border: 2px dashed rgba(239, 68, 68, 0.45);
      border-radius: 20px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .dialogue-thread-fail {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .bubble-fail {
      border-radius: 14px;
      padding: 12px 14px;
    }

    .bubble-student-blunder {
      background: rgba(30, 41, 59, 0.95);
      border: 1.5px solid rgba(239, 68, 68, 0.6);
      align-self: flex-start;
      max-width: 90%;
    }

    .bubble-lead-shock {
      background: linear-gradient(135deg, rgba(185, 28, 28, 0.8) 0%, rgba(127, 29, 29, 0.9) 100%);
      border: 1.5px solid #f87171;
      align-self: flex-end;
      max-width: 90%;
      box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
    }

    .bubble-author {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .author-student { color: #fca5a5; }
    .author-lead { color: #fef08a; }

    .bubble-he {
      font-family: 'Heebo', sans-serif;
      font-size: 19px;
      font-weight: 900;
      color: #fff;
      direction: rtl;
      text-align: right;
    }

    .bubble-ru {
      font-size: 12px;
      color: #e2e8f0;
      margin-top: 4px;
      font-style: italic;
    }

    .error-breakdown {
      background: rgba(0, 0, 0, 0.5);
      border-radius: 14px;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .error-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
    }

    .error-pill-wrong {
      background: rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 8px;
    }

    .error-pill-correct {
      background: rgba(34, 197, 94, 0.25);
      color: #86efac;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 8px;
    }

    #scene-solution {
      background: #060913;
      display: flex;
      flex-direction: column;
      padding: 72px 16px 20px;
      gap: 10px;
    }

    .rule-card-ulpan {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 16px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .rule-columns {
      display: flex;
      gap: 8px;
    }

    .rule-col {
      flex: 1;
      background: rgba(0, 0, 0, 0.35);
      border-radius: 12px;
      padding: 8px 10px;
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .rule-col.col1 { border: 1.5px solid #22c55e; }
    .rule-col.col2 { border: 1.5px solid #38bdf8; }

    .col-gender {
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .col-gender.col1-text { color: #4ade80; }
    .col-gender.col2-text { color: #38bdf8; }

    .col-hebrew {
      font-family: 'Heebo', sans-serif;
      font-size: 21px;
      font-weight: 900;
      color: #fff;
    }

    .col-trans {
      font-size: 11.5px;
      color: #cbd5e1;
      font-weight: 600;
    }

    .dialogue-simulator-box {
      background: #0c1427;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 18px;
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }

    .sim-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 6px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 12px;
      color: #cbd5e1;
    }

    .sim-thread {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sim-bubble-lead {
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px 12px 12px 2px;
      padding: 8px 12px;
      align-self: flex-start;
      max-width: 88%;
    }

    .sim-bubble-lead .text-he {
      font-family: 'Heebo', sans-serif;
      font-size: 16px;
      font-weight: 800;
      color: #f1f5f9;
      direction: rtl;
      text-align: right;
    }

    .sim-bubble-student {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
      border-radius: 12px 12px 2px 12px;
      padding: 8px 12px;
      align-self: flex-end;
      max-width: 88%;
      box-shadow: 0 4px 15px rgba(2, 132, 199, 0.35);
      opacity: 0;
      transform: translateY(6px);
      transition: all 0.3s ease;
    }

    .sim-bubble-student.show {
      opacity: 1;
      transform: translateY(0);
    }

    .sim-bubble-student .text-he {
      font-family: 'Heebo', sans-serif;
      font-size: 16px;
      font-weight: 900;
      color: #fff;
      direction: rtl;
      text-align: right;
    }

    .sim-bubble-student .text-ru {
      font-size: 10.5px;
      color: #bae6fd;
      margin-top: 2px;
    }

    .mic-control-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      position: relative;
      margin-top: 2px;
    }

    .mic-button {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 0 20px rgba(56, 189, 248, 0.6);
      position: relative;
    }

    .wave-ripple {
      position: absolute;
      inset: -6px;
      border-radius: 50%;
      border: 2px solid rgba(56, 189, 248, 0.5);
      animation: rippleAnim 1.4s infinite;
      opacity: 0;
    }

    .mic-button.recording .wave-ripple { opacity: 1; }

    @keyframes rippleAnim {
      0% { transform: scale(0.9); opacity: 0.8; }
      100% { transform: scale(1.4); opacity: 0; }
    }

    .touch-cursor {
      position: absolute;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.85);
      border: 2px solid #38bdf8;
      top: 8px;
      right: 140px;
      pointer-events: none;
      opacity: 0;
      transform: scale(0.7);
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 0 15px rgba(255, 255, 255, 0.6);
    }

    .touch-cursor.click {
      opacity: 1;
      transform: scale(1.1);
    }

    .ai-score-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: rgba(34, 197, 94, 0.2);
      border: 1px solid rgba(34, 197, 94, 0.6);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 800;
      color: #86efac;
      opacity: 0;
      transform: scale(0.8);
      transition: all 0.25s ease;
    }

    .ai-score-badge.show {
      opacity: 1;
      transform: scale(1);
    }

    #scene-outro {
      background: radial-gradient(circle at 50% 40%, #1e1b4b 0%, #050510 100%);
      display: flex;
      flex-direction: column;
      padding: 72px 16px 20px;
      gap: 12px;
      align-items: center;
      text-align: center;
    }

    .outro-hero-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding: 20px 16px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 14px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.6);
    }

    .outro-logo-wrap {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Heebo', sans-serif;
      font-weight: 900;
      font-size: 38px;
      color: #fff;
      box-shadow: 0 10px 25px rgba(56, 189, 248, 0.5);
    }

    .outro-title {
      font-size: 21px;
      font-weight: 900;
      letter-spacing: -0.5px;
      color: #f8fafc;
    }

    .outro-subtitle {
      font-size: 13px;
      color: #94a3b8;
      font-weight: 600;
    }

    .promo-code-plate {
      width: 100%;
      background: linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(202, 138, 4, 0.25) 100%);
      border: 2px dashed #facc15;
      border-radius: 18px;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 0 25px rgba(250, 204, 21, 0.35);
      transform: scale(0.95);
      opacity: 0.8;
      transition: all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }

    .promo-code-plate.pop-in {
      transform: scale(1.05);
      opacity: 1;
      border-style: solid;
      box-shadow: 0 0 40px rgba(250, 204, 21, 0.7);
    }

    .promo-plate-badge {
      font-size: 11px;
      font-weight: 900;
      color: #fde047;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .promo-code-text {
      font-family: 'Montserrat', sans-serif;
      font-size: 34px;
      font-weight: 900;
      color: #fff;
      letter-spacing: 3px;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
    }

    .promo-trial-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #eab308;
      color: #000;
      font-size: 12px;
      font-weight: 900;
      padding: 4px 10px;
      border-radius: 10px;
      align-self: center;
    }

    .outro-cta-btn {
      width: 100%;
      background: linear-gradient(135deg, #0284c7 0%, #38bdf8 100%);
      color: #fff;
      font-weight: 900;
      font-size: 15px;
      padding: 14px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(2, 132, 199, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .promo-note {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }
  </style>
</head>
<body>
  <div id="phone-container">
    <div class="reels-subtitles">
      <div class="sub-badge" id="reels-badge">
        <span class="yt-pill">YT</span>
        <span id="badge-title">${config.hookBadge}</span>
      </div>
    </div>

    <!-- 1. СЦЕНА 1: ХУК -->
    <div class="scene active" id="scene-intro">
      <div class="brand-top-bar">
        <div class="brand-left">
          <div class="brand-cube">א</div>
          <div class="brand-text">
            <h1>Ульпан Алеф</h1>
            <p>Иврит без паники • ${config.lessonLabel}</p>
          </div>
        </div>
        <div class="brand-badge-live">
          <div class="live-dot"></div>
          <span>LIVE</span>
        </div>
      </div>

      <div class="app-nav-tabs">
        <div class="tab-item">Словарь</div>
        <div class="tab-item active">Диалог</div>
        <div class="tab-item">Звонок</div>
      </div>

      <div class="situation-card">
        <div class="situation-header">
          <div class="location-badge">📍 ${config.hookLocation}</div>
        </div>
        <div class="situation-title">${config.hookTitle}</div>
      </div>

      <div class="character-card">
        <div class="character-avatar">${config.hookAvatar}</div>
        <div class="character-details">
          <h3>${config.characterName}</h3>
          <p>${config.characterSub}</p>
        </div>
      </div>

      <div class="intro-bottom-prompt">
        <div class="prompt-label">${config.promptLabel}</div>
        <div class="prompt-text">${config.promptText}</div>
      </div>
    </div>

    <!-- 2. СЦЕНА 2: ФАКАП -->
    <div class="scene" id="scene-fail">
      <div class="brand-top-bar">
        <div class="brand-left">
          <div class="brand-cube">א</div>
          <div class="brand-text">
            <h1>Ульпан Алеф</h1>
            <p>Симулятор реальной речи</p>
          </div>
        </div>
        <div class="brand-badge-live">
          <div class="live-dot"></div>
          <span>RECORDING</span>
        </div>
      </div>

      <div class="fail-card">
        <div class="dialogue-thread-fail">
          <div class="bubble-fail bubble-student-blunder">
            <div class="bubble-author author-student">${config.failAuthorStudent}</div>
            <div class="bubble-he">${config.failStudentHe}</div>
            <div class="bubble-ru">${config.failStudentRu}</div>
          </div>

          <div class="bubble-fail bubble-lead-shock">
            <div class="bubble-author author-lead">${config.failAuthorLead}</div>
            <div class="bubble-he">${config.failLeadHe}</div>
            <div class="bubble-ru">${config.failLeadRu}</div>
          </div>
        </div>

        <div class="error-breakdown">
          <div class="error-row">
            <span>Сказано по ошибке:</span>
            <span class="error-pill-wrong">${config.errorWrong}</span>
          </div>
          <div class="error-row">
            <span>Как правильно:</span>
            <span class="error-pill-correct">${config.errorCorrect}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. СЦЕНА 3: РАЗБОР В ПРИЛОЖЕНИИ -->
    <div class="scene" id="scene-solution">
      <div class="brand-top-bar">
        <div class="brand-left">
          <div class="brand-cube">א</div>
          <div class="brand-text">
            <h1>Ульпан Алеф</h1>
            <p>Тренажер живой речи • Этап 5</p>
          </div>
        </div>
        <div class="brand-badge-live">
          <div class="live-dot"></div>
          <span>AI DRILL</span>
        </div>
      </div>

      <div class="rule-card-ulpan">
        <div class="rule-columns">
          <div class="rule-col col1">
            <span class="col-gender col1-text">${config.ruleCol1Title}</span>
            <span class="col-hebrew">${config.ruleCol1He}</span>
            <span class="col-trans">${config.ruleCol1Trans}</span>
          </div>
          <div class="rule-col col2">
            <span class="col-gender col2-text">${config.ruleCol2Title}</span>
            <span class="col-hebrew">${config.ruleCol2He}</span>
            <span class="col-trans">${config.ruleCol2Trans}</span>
          </div>
        </div>
      </div>

      <div class="dialogue-simulator-box">
        <div class="sim-status-bar">
          <div class="sim-caller">
            <span>🗣️ Тренировка произношения</span>
          </div>
          <div class="ai-score-badge" id="ai-score">
            <span>🎯 98% Точность</span>
          </div>
        </div>

        <div class="sim-thread">
          <div class="sim-bubble-lead">
            <div class="text-he">${config.simLeadHe}</div>
          </div>

          <div class="sim-bubble-student" id="student-solution-bubble">
            <div class="text-he">${config.simStudentHe}</div>
            <div class="text-ru">${config.simStudentRu}</div>
          </div>
        </div>

        <div class="mic-control-area">
          <div class="mic-button" id="mic-btn">
            <div class="wave-ripple"></div>
            🎙️
          </div>
          <div class="touch-cursor" id="touch-finger"></div>
        </div>
      </div>
    </div>

    <!-- 4. СЦЕНА 4: OUTRO CTA -->
    <div class="scene" id="scene-outro">
      <div class="outro-hero-card">
        <div class="outro-logo-wrap">א</div>
        <div class="outro-title">${config.outroTitle}</div>
        <div class="outro-subtitle">Говори на иврите с первого урока без страха и путаницы</div>

        <div class="promo-code-plate" id="promo-code-plate">
          <div class="promo-plate-badge">🎁 ПРОМОКОД ДЛЯ YOUTUBE</div>
          <div class="promo-code-text">YT</div>
          <div class="promo-trial-pill">🔥 30 ДНЕЙ ПРЕМИУМ БЕСПЛАТНО</div>
        </div>

        <div class="outro-cta-btn">
          <span>🚀 НАЧАТЬ УРОК ПРЯМО СЕЙЧАС</span>
        </div>
        <div class="promo-note">Активируй код <b>YT</b> по ссылке в описании 👇</div>
      </div>
    </div>
  </div>

  <script>
    const PLATFORM_CONFIG = {
      YT: { name: 'YOUTUBE', code: 'YT', linkText: 'по ссылке в описании 👇' },
      TG: { name: 'TELEGRAM', code: 'TG', linkText: 'по ссылке в посте 👇' },
      INSTA: { name: 'INSTAGRAM', code: 'INSTA', linkText: 'по ссылке в шапке профиля 👆' },
      TIKTOK: { name: 'TIKTOK', code: 'TIKTOK', linkText: 'по ссылке в профиле 🔗' },
      FB: { name: 'FACEBOOK', code: 'FB', linkText: 'по ссылке в описании 👇' },
    };

    window.startReelsTimeline = function(timings, platform = 'YT') {
      const pKey = (platform || 'YT').toUpperCase();
      const pConfig = PLATFORM_CONFIG[pKey] || PLATFORM_CONFIG.YT;

      const ytPill = document.querySelector('.yt-pill');
      if (ytPill) ytPill.textContent = pConfig.code;

      const plateBadge = document.querySelector('.promo-plate-badge');
      if (plateBadge) plateBadge.textContent = '🎁 ПРОМОКОД ДЛЯ ' + pConfig.name;

      const codeText = document.querySelector('.promo-code-text');
      if (codeText) codeText.textContent = pConfig.code;

      const promoNote = document.querySelector('.promo-note');
      if (promoNote) promoNote.innerHTML = 'Активируй код <b>' + pConfig.code + '</b> ' + pConfig.linkText;

      const sIntro = document.getElementById('scene-intro');
      const sFail = document.getElementById('scene-fail');
      const sSolution = document.getElementById('scene-solution');
      const sOutro = document.getElementById('scene-outro');
      const badgeTitle = document.getElementById('badge-title');
      const reelsBadge = document.getElementById('reels-badge');

      const studentBubble = document.getElementById('student-solution-bubble');
      const micBtn = document.getElementById('mic-btn');
      const touchFinger = document.getElementById('touch-finger');
      const aiScore = document.getElementById('ai-score');
      const promoPlate = document.getElementById('promo-code-plate');

      function switchScene(scene, text, borderColor = '${accent}') {
        [sIntro, sFail, sSolution, sOutro].forEach(s => s && s.classList.remove('active'));
        if (scene) scene.classList.add('active');
        if (badgeTitle) badgeTitle.innerText = text;
        if (reelsBadge) {
          reelsBadge.style.borderColor = borderColor;
          reelsBadge.style.boxShadow = '0 10px 25px rgba(0,0,0,0.6), 0 0 25px ' + borderColor + '66';
        }
      }

      switchScene(sIntro, '${config.hookBadge}', '${accent}');

      setTimeout(() => {
        switchScene(sFail, '${config.failBadge}', '#ef4444');
      }, timings.tStudent || timings.tGuy || 4800);

      setTimeout(() => {
        switchScene(sSolution, '${config.solutionBadge}', '#22c55e');

        setTimeout(() => {
          if (touchFinger) touchFinger.classList.add('click');
          if (micBtn) micBtn.classList.add('recording');

          setTimeout(() => {
            if (studentBubble) studentBubble.classList.add('show');
            if (touchFinger) touchFinger.classList.remove('click');
          }, 600);

          setTimeout(() => {
            if (aiScore) aiScore.classList.add('show');
            if (micBtn) micBtn.classList.remove('recording');
          }, 1800);
        }, 3200);
      }, timings.tExplainer || 11000);

      setTimeout(() => {
        switchScene(sOutro, '30 ДНЕЙ БЕСПЛАТНО 🚀', '#facc15');

        setTimeout(() => {
          if (promoPlate) promoPlate.classList.add('pop-in');
        }, 3500);
      }, timings.tCta || 21500);
    };
  </script>
</body>
</html>
`;
}

function main() {
  console.log('========================================================');
  console.log('🏭 ГЕНЕРАТОР HTML-СЦЕН ДЛЯ УРОКОВ 2–5 (ФАБРИКА-500)');
  console.log('========================================================\n');

  let generated = 0;
  for (const config of LESSON_CONFIGS) {
    const numPad = String(config.number).padStart(2, '0');
    const folderName = `lesson_${numPad}_${config.variant}`;
    const targetDir = path.resolve(SCENES_DIR, folderName);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const htmlPath = path.resolve(targetDir, 'index.html');
    const htmlContent = buildHtml(config);
    fs.writeFileSync(htmlPath, htmlContent, 'utf8');

    console.log(`✅ [Урок ${config.number} • ${config.variant.toUpperCase()}] Сгенерирована сцена: growth/scenes/${folderName}/index.html (${htmlContent.length} байт)`);
    generated++;
  }

  console.log(`\n🎉 Успешно создано ${generated} HTML-сцен для Уроков 2, 3, 4, 5!`);
}

main();
