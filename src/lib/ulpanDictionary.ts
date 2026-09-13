import { stripNikkud } from './transcription';
import { DETAILED_LESSONS } from '@/data/lessonsData';
import { THEMATIC_DECKS } from '@/data/thematicDecks';
import { HANDCRAFTED_DIALOGUES } from '@/data/dialogueLessons';

export interface DictionaryEntry {
  hebrew: string;
  hebrewPlain: string;
  transcription: string;
  translation: string;
  root?: string | null;
  partOfSpeech: string;
  exampleSentence?: {
    hebrew: string;
    transcription: string;
    translation: string;
  } | null;
}

export const ULPAN_OFFLINE_DICTIONARY: DictionaryEntry[] = [
  {
    hebrew: 'רִיהוּט',
    hebrewPlain: 'ריהוט',
    transcription: 'риhӯт',
    translation: 'мебель, обстановка',
    root: 'ר-ה-ט',
    partOfSpeech: 'noun',
    exampleSentence: {
      hebrew: 'אֵיזֶה רִיהוּט אַתָּה צָרִיךְ בַּדִּירָה?',
      transcription: 'э́йзэ риhӯт атá царӣх ба-дирá?',
      translation: 'Какая мебель вам нужна в квартире?',
    },
  },
  {
    hebrew: 'רִהוּט',
    hebrewPlain: 'רהוט',
    transcription: 'риhӯт',
    translation: 'мебель, обстановка',
    root: 'ר-ה-ט',
    partOfSpeech: 'noun',
    exampleSentence: {
      hebrew: 'אֵיזֶה רִיהוּט אַתָּה צָרִיךְ בַּדִּירָה?',
      transcription: 'э́йзэ риhӯт атá царӣх ба-дирá?',
      translation: 'Какая мебель вам нужна в квартире?',
    },
  },
  {
    hebrew: 'מְרוֹהֶטֶת',
    hebrewPlain: 'מרוהטת',
    transcription: 'мэруhэ́тет',
    translation: 'меблированная (о квартире / комнате)',
    root: 'ר-ה-ט',
    partOfSpeech: 'adjective',
    exampleSentence: {
      hebrew: 'הַדִּירָה מְרוֹהֶטֶת לְגַמְרֵי.',
      transcription: 'hа-дирá мэруhэ́тет лэгамрэ́й.',
      translation: 'Квартира полностью меблирована.',
    },
  },
  {
    hebrew: 'שָׁלוֹם',
    hebrewPlain: 'שלום',
    transcription: 'шалóм',
    translation: 'привет, здравствуйте, мир',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'שָׁלוֹם, מָה נִשְׁמַע?',
      transcription: 'шалóм, ма нишмá?',
      translation: 'Привет, как дела?',
    },
  },
  {
    hebrew: 'תּוֹדָה',
    hebrewPlain: 'תודה',
    transcription: 'тодá',
    translation: 'спасибо',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'תּוֹדָה רַבָּה!',
      transcription: 'тодá рабá!',
      translation: 'Большое спасибо!',
    },
  },
  {
    hebrew: 'בְּבַקָּשָׁה',
    hebrewPlain: 'בבקשה',
    transcription: 'бэвакашá',
    translation: 'пожалуйста',
    root: 'ב-ק-ש',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'בְּבַקָּשָׁה, הִנֵּה הַקָּפֶה.',
      transcription: 'бэвакашá, hинэ́ hа-кафэ́.',
      translation: 'Пожалуйста, вот кофе.',
    },
  },
  {
    hebrew: 'כַּמּוּבָן',
    hebrewPlain: 'כמובן',
    transcription: 'камувáн',
    translation: 'конечно, разумеется',
    root: 'ב-ו-ן',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'כַּמּוּבָן, בְּבַקָּשָׁה!',
      transcription: 'камувáн, бэвакашá!',
      translation: 'Конечно, пожалуйста!',
    },
  },
  {
    hebrew: 'בֶּטַח',
    hebrewPlain: 'בטח',
    transcription: 'бéтах',
    translation: 'конечно, наверняка',
    root: 'ב-ט-ח',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'בֶּטַח, אֵין בְּעָיָה.',
      transcription: 'бéтах, эн бэайá.',
      translation: 'Конечно, без проблем.',
    },
  },
  {
    hebrew: 'בְּסֵדֶר',
    hebrewPlain: 'בסדר',
    transcription: 'бэсéдер',
    translation: 'в порядке, хорошо, ладно',
    root: 'ס-ד-ר',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'הַכֹּל בְּסֵדֶר.',
      transcription: 'hакóль бэсéдер.',
      translation: 'Всё в порядке.',
    },
  },
  {
    hebrew: 'מְצוּיָּן',
    hebrewPlain: 'מצוין',
    transcription: 'мэцуйáн',
    translation: 'отлично, превосходно',
    root: 'צ-י-ן',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'סַבָּבָּה',
    hebrewPlain: 'סבבה',
    transcription: 'сабáба',
    translation: 'круто, отлично, лады',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'בְּכֵיף',
    hebrewPlain: 'בכיף',
    transcription: 'бэкéйф',
    translation: 'с удовольствием, с кайфом',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'יוֹפִי',
    hebrewPlain: 'יופי',
    transcription: 'йóфи',
    translation: 'красота, отлично, здорово',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'אוּלַי',
    hebrewPlain: 'אולי',
    transcription: 'улáй',
    translation: 'может быть, возможно',
    partOfSpeech: 'adverb',
  },
  {
    hebrew: 'נָכוֹן',
    hebrewPlain: 'נכון',
    transcription: 'нахóн',
    translation: 'правильно, верно',
    root: 'כ-ו-ן',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'בָּרוּר',
    hebrewPlain: 'ברור',
    transcription: 'барӯр',
    translation: 'понятно, ясно',
    root: 'ב-ר-ר',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'הִנֵּה',
    hebrewPlain: 'הנה',
    transcription: 'hинэ́',
    translation: 'вот / здесь находится',
    partOfSpeech: 'expression',
    exampleSentence: {
      hebrew: 'הִנֵּה הַסֵּפֶר שֶׁלְּךָ.',
      transcription: 'hинэ́ hа-сéфер шэлха́.',
      translation: 'Вот твоя книга.',
    },
  },
  {
    hebrew: 'מַיִם',
    hebrewPlain: 'מים',
    transcription: 'мáйим',
    translation: 'вода',
    partOfSpeech: 'noun',
    exampleSentence: {
      hebrew: 'אֶפְשָׁר כּוֹס מַיִם?',
      transcription: 'эфшáр кос мáйим?',
      translation: 'Можно стакан воды?',
    },
  },
  {
    hebrew: 'קָרִים',
    hebrewPlain: 'קרים',
    transcription: 'карӣм',
    translation: 'холодные (м.р., мн.ч.)',
    root: 'ק-ר-ר',
    partOfSpeech: 'adjective',
    exampleSentence: {
      hebrew: 'מַיִם קָרִים, בְּבַקָּשָׁה.',
      transcription: 'мáйим карӣм, бэвакашá.',
      translation: 'Холодную воду, пожалуйста.',
    },
  },
  {
    hebrew: 'קָר',
    hebrewPlain: 'קר',
    transcription: 'кар',
    translation: 'холодный / холодно',
    root: 'ק-ר-ר',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'חַם',
    hebrewPlain: 'חם',
    transcription: 'хам',
    translation: 'горячий / тёплый / жарко',
    root: 'ח-מ-ם',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'חַמִּים',
    hebrewPlain: 'חמים',
    transcription: 'хамӣм',
    translation: 'тёплые / горячие (мн.ч.)',
    root: 'ח-מ-ם',
    partOfSpeech: 'adjective',
  },
  {
    hebrew: 'קָפֶה',
    hebrewPlain: 'קפה',
    transcription: 'кафэ́',
    translation: 'кофе',
    partOfSpeech: 'noun',
    exampleSentence: {
      hebrew: 'אֲנִי רוֹצֶה קָפֶה עִם חָלָב.',
      transcription: 'анӣ роцé кафэ́ им халáв.',
      translation: 'Я хочу кофе с молоком.',
    },
  },
  {
    hebrew: 'תֵּה',
    hebrewPlain: 'תה',
    transcription: 'тэ',
    translation: 'чай',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'חָלָב',
    hebrewPlain: 'חלב',
    transcription: 'халáв',
    translation: 'молоко',
    root: 'ח-ל-ב',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'סוּכָּר',
    hebrewPlain: 'סוכר',
    transcription: 'сукáр',
    translation: 'сахар',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'עוּגָה',
    hebrewPlain: 'עוגה',
    transcription: 'угá',
    translation: 'пирожное, торт, пирог',
    root: 'ע-ו-ג',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'קְרוּאָסוֹן',
    hebrewPlain: 'קרואסון',
    transcription: 'круасóн',
    translation: 'круассан',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'חֶשְׁבּוֹן',
    hebrewPlain: 'חשבון',
    transcription: 'хэшбóн',
    translation: 'счёт (в кафе, банке)',
    root: 'ח-ש-ב',
    partOfSpeech: 'noun',
    exampleSentence: {
      hebrew: 'אֶפְשָׁר לְקַבֵּל חֶשְׁבּוֹן?',
      transcription: 'эфшáр лэкабéль хэшбóн?',
      translation: 'Можно получить счёт?',
    },
  },
  {
    hebrew: 'אֶפְשָׁר',
    hebrewPlain: 'אפשר',
    transcription: 'эфшáр',
    translation: 'можно / возможно',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'לְקַבֵּל',
    hebrewPlain: 'לקבל',
    transcription: 'лэкабéль',
    translation: 'получить / принимать',
    root: 'ק-ב-ל',
    partOfSpeech: 'verb',
  },
  {
    hebrew: 'הַאִם',
    hebrewPlain: 'האם',
    transcription: 'hа-ӣм',
    translation: 'ли (вопросительная частица)',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'אוֹ',
    hebrewPlain: 'או',
    transcription: 'о',
    translation: 'или',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'תִּרְצֶה',
    hebrewPlain: 'תרצה',
    transcription: 'тирцé',
    translation: 'ты захочешь / хочешь (к мужчине)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'מָה תִּרְצֶה לִשְׁתּוֹת?',
      transcription: 'ма тирцé лишто́т?',
      translation: 'Что ты хочешь выпить? (к мужчине)',
    },
  },
  {
    hebrew: 'תִּרְצוּ',
    hebrewPlain: 'תרצו',
    transcription: 'тирцӯ',
    translation: 'вы захотите / хотите (мн.ч.)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'הַאִם תִּרְצוּ קָפֶה אוֹ תֵּה?',
      transcription: 'hа-ӣм тирцӯ кафэ́ о тэ?',
      translation: 'Хотите кофе или чай?',
    },
  },
  {
    hebrew: 'תִּרְצִי',
    hebrewPlain: 'תרצי',
    transcription: 'тирцӣ',
    translation: 'ты захочешь / хочешь (к женщине)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'מָה תִּרְצִי לִשְׁתּוֹת?',
      transcription: 'ма тирцӣ лишто́т?',
      translation: 'Что ты хочешь выпить? (к женщине)',
    },
  },
  {
    hebrew: 'רוֹצֶה',
    hebrewPlain: 'רוצה',
    transcription: 'роцé',
    translation: 'хочет / хочу (м.р.)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'אֲנִי רוֹצֶה קָפֶה.',
      transcription: 'анӣ роцé кафэ́.',
      translation: 'Я хочу кофе (мужчина).',
    },
  },
  {
    hebrew: 'רוֹצָה',
    hebrewPlain: 'רוצה',
    transcription: 'роцá',
    translation: 'хочет / хочу (ж.р.)',
    root: 'ר-צ-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'אֲנִי רוֹצָה מַיִם.',
      transcription: 'анӣ роцá мáйим.',
      translation: 'Я хочу воду (женщина).',
    },
  },
  {
    hebrew: 'לִשְׁתּוֹת',
    hebrewPlain: 'לשתות',
    transcription: 'лишто́т',
    translation: 'пить',
    root: 'ש-ת-ה',
    partOfSpeech: 'verb',
    exampleSentence: {
      hebrew: 'אֲנִי רוֹצֶה לִשְׁתּוֹת מַיִם.',
      transcription: 'анӣ роцé лишто́т мáйим.',
      translation: 'Я хочу пить воду.',
    },
  },
  {
    hebrew: 'לֶאֱכֹל',
    hebrewPlain: 'לאכול',
    transcription: 'лээхóль',
    translation: 'есть, кушать',
    root: 'א-כ-ל',
    partOfSpeech: 'verb',
  },
  {
    hebrew: 'בֹּקֶר',
    hebrewPlain: 'בוקר',
    transcription: 'бóкер',
    translation: 'утро',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'בֹּקֶר טוֹב',
    hebrewPlain: 'בוקר טוב',
    transcription: 'бóкер тов',
    translation: 'доброе утро',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'עֶרֶב טוֹב',
    hebrewPlain: 'ערב טוב',
    transcription: 'э́рев тов',
    translation: 'добрый вечер',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'לַיְלָה טוֹב',
    hebrewPlain: 'לילה טוב',
    transcription: 'лáйла тов',
    translation: 'спокойной ночи',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'יוֹם',
    hebrewPlain: 'יום',
    transcription: 'йом',
    translation: 'день',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'הַיּוֹם',
    hebrewPlain: 'היום',
    transcription: 'hайóм',
    translation: 'сегодня',
    partOfSpeech: 'expression',
  },
  {
    hebrew: 'שִׁיעוּר',
    hebrewPlain: 'שיעור',
    transcription: 'шиӯр',
    translation: 'урок',
    partOfSpeech: 'noun',
  },
  {
    hebrew: 'רַע',
    hebrewPlain: 'רע',
    transcription: 'ра',
    translation: 'плохой, дурной',
    partOfSpeech: 'adjective',
    exampleSentence: {
      hebrew: 'זֶה לֹא רַע.',
      transcription: 'зэ ло ра.',
      translation: 'Это неплохо.',
    },
  },
  {
    hebrew: 'בְּלִי',
    hebrewPlain: 'בלי',
    transcription: 'бли',
    translation: 'без',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'קָפֶה בְּלִי סוּכָּר, בְּבַקָּשָׁה.',
      transcription: 'кафэ́ бли сукáр, бэвакашá.',
      translation: 'Кофе без сахара, пожалуйста.',
    },
  },
  {
    hebrew: 'עִם',
    hebrewPlain: 'עם',
    transcription: 'им',
    translation: 'с, вместе с',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'תֵּה עִם לִימוֹן.',
      transcription: 'тэ им лимóн.',
      translation: 'Чай с лимоном.',
    },
  },
  {
    hebrew: 'עַל',
    hebrewPlain: 'על',
    transcription: 'аль',
    translation: 'на; о, про',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'הַסֵּפֶר עַל הַשֻּׁלְחָן.',
      transcription: 'hа-сéфер аль hа-шульхáн.',
      translation: 'Книга на столе.',
    },
  },
  {
    hebrew: 'תַּחַת',
    hebrewPlain: 'תחת',
    transcription: 'тáхат',
    translation: 'под',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'הַחֲתוּל תַּחַת הַכִּסֵּא.',
      transcription: 'hа-хатӯль тáхат hа-кисэ́.',
      translation: 'Кот под стулом.',
    },
  },
  {
    hebrew: 'לְיַד',
    hebrewPlain: 'ליד',
    transcription: 'лэ-йáд',
    translation: 'около, возле, рядом с',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'אֲנִי גָּר לְיַד הַיָּם.',
      transcription: 'анӣ гар лэ-йáд hа-йам.',
      translation: 'Я живу рядом с морем.',
    },
  },
  {
    hebrew: 'בֵּין',
    hebrewPlain: 'בין',
    transcription: 'бейн',
    translation: 'между',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'בֵּין הַבַּיִת לָרְחוֹב.',
      transcription: 'бейн hа-бáйит ла-рэхóв.',
      translation: 'Между домом и улицей.',
    },
  },
  {
    hebrew: 'מוּל',
    hebrewPlain: 'מול',
    transcription: 'муль',
    translation: 'напротив, перед',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'הַקָּפֶה מוּל הַבַּנְק.',
      transcription: 'hа-кафэ́ муль hа-банк.',
      translation: 'Кафе напротив банка.',
    },
  },
  {
    hebrew: 'לִפְנֵי',
    hebrewPlain: 'לפני',
    transcription: 'лифнéй',
    translation: 'до, перед (по времени или месту)',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'לִפְנֵי הַשִּׁיעוּר.',
      transcription: 'лифнéй hа-шиӯр.',
      translation: 'Перед уроком.',
    },
  },
  {
    hebrew: 'אַחֲרֵי',
    hebrewPlain: 'אחרי',
    transcription: 'ахарéй',
    translation: 'после, позади',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'אַחֲרֵי הָעֲבוֹדָה.',
      transcription: 'ахарéй hа-аводá.',
      translation: 'После работы.',
    },
  },
  {
    hebrew: 'בִּגְלַל',
    hebrewPlain: 'בגלל',
    transcription: 'биглáль',
    translation: 'из-за, по причине',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'בִּגְלַל הַגֶּשֶׁם.',
      transcription: 'биглáль hа-гéшем.',
      translation: 'Из-за дождя.',
    },
  },
  {
    hebrew: 'כְּמוֹ',
    hebrewPlain: 'כמו',
    transcription: 'кмо',
    translation: 'как, подобно',
    partOfSpeech: 'preposition',
    exampleSentence: {
      hebrew: 'הוּא מְדַבֵּר כְּמוֹ יִשְׂרְאֵלִי.',
      transcription: 'hу мэдабэ́р кмо исрээлӣ.',
      translation: 'Он говорит как израильтянин.',
    },
  },
  {
    hebrew: 'פֹּה',
    hebrewPlain: 'פה',
    transcription: 'по',
    translation: 'здесь, тут',
    partOfSpeech: 'adverb',
    exampleSentence: {
      hebrew: 'נָעִים מְאוֹד פֹּה.',
      transcription: 'наӣм мэóд по.',
      translation: 'Здесь очень приятно.',
    },
  },
  {
    hebrew: 'כָּאן',
    hebrewPlain: 'כאן',
    transcription: 'кан',
    translation: 'здесь, тут',
    partOfSpeech: 'adverb',
    exampleSentence: {
      hebrew: 'אֲנִי כָּאן.',
      transcription: 'анӣ кан.',
      translation: 'Я здесь.',
    },
  },
  {
    hebrew: 'שָׁם',
    hebrewPlain: 'שם',
    transcription: 'шам',
    translation: 'там',
    partOfSpeech: 'adverb',
    exampleSentence: {
      hebrew: 'הַחֲנוּת שָׁם.',
      transcription: 'hа-ханӯт шам.',
      translation: 'Магазин там.',
    },
  },
  {
    hebrew: 'רַק',
    hebrewPlain: 'רק',
    transcription: 'рак',
    translation: 'только, лишь',
    partOfSpeech: 'adverb',
    exampleSentence: {
      hebrew: 'רַק רֶגַע, בְּבַקָּשָׁה.',
      transcription: 'рак рéга, бэвакашá.',
      translation: 'Только минутку, пожалуйста.',
    },
  },
  {
    hebrew: 'עוֹד',
    hebrewPlain: 'עוד',
    transcription: 'од',
    translation: 'ещё, снова',
    partOfSpeech: 'adverb',
    exampleSentence: {
      hebrew: 'עוֹד קָפֶה, בְּבַקָּשָׁה.',
      transcription: 'од кафэ́, бэвакашá.',
      translation: 'Ещё кофе, пожалуйста.',
    },
  },
  {
    hebrew: 'כְּבָר',
    hebrewPlain: 'כבר',
    transcription: 'квар',
    translation: 'уже',
    partOfSpeech: 'adverb',
    exampleSentence: {
      hebrew: 'אֲנִי כְּבָר מוּכָן.',
      transcription: 'анӣ квар мухáн.',
      translation: 'Я уже готов.',
    },
  },
  {
    hebrew: 'אֲבָל',
    hebrewPlain: 'אבל',
    transcription: 'авáль',
    translation: 'но, однако',
    partOfSpeech: 'conjunction',
    exampleSentence: {
      hebrew: 'רוֹצֶה, אֲבָל לֹא עַכְשָׁיו.',
      transcription: 'роцé, авáль ло ахшáв.',
      translation: 'Хочу, но не сейчас.',
    },
  },
  {
    hebrew: 'הַרְבֵּה',
    hebrewPlain: 'הרבה',
    transcription: 'hарбé',
    translation: 'много',
    partOfSpeech: 'adverb',
    exampleSentence: {
      hebrew: 'יֵשׁ כָּאן הַרְבֵּה אֲנָשִׁים.',
      transcription: 'йеш кан hарбé анашӣм.',
      translation: 'Здесь много людей.',
    },
  },
  {
    hebrew: 'קְצָת',
    hebrewPlain: 'קצת',
    transcription: 'кцат',
    translation: 'немного, чуть-чуть',
    partOfSpeech: 'adverb',
    exampleSentence: {
      hebrew: 'רַק קְצָת חָלָב.',
      transcription: 'рак кцат халáв.',
      translation: 'Только немного молока.',
    },
  },
  {
    hebrew: 'זֶה',
    hebrewPlain: 'זה',
    transcription: 'зэ',
    translation: 'это, этот (м.р.)',
    partOfSpeech: 'pronoun',
    exampleSentence: {
      hebrew: 'זֶה קָפֶה טוֹב.',
      transcription: 'зэ кафэ́ тов.',
      translation: 'Это хороший кофе.',
    },
  },
  {
    hebrew: 'זֹאת',
    hebrewPlain: 'זאת',
    transcription: 'зот',
    translation: 'эта, это (ж.р.)',
    partOfSpeech: 'pronoun',
    exampleSentence: {
      hebrew: 'זֹאת עוּגָה טְעִימָה.',
      transcription: 'зот угá тэимá.',
      translation: 'Это вкусный пирог.',
    },
  },
  {
    hebrew: 'זוֹ',
    hebrewPlain: 'זו',
    transcription: 'зо',
    translation: 'эта, это (ж.р.)',
    partOfSpeech: 'pronoun',
    exampleSentence: {
      hebrew: 'זוֹ דִּירָה יָפָה.',
      transcription: 'зо дирá йафá.',
      translation: 'Это красивая квартира.',
    },
  },
  {
    hebrew: 'אֵלֶּה',
    hebrewPlain: 'אלה',
    transcription: 'э́ле',
    translation: 'эти (мн.ч.)',
    partOfSpeech: 'pronoun',
    exampleSentence: {
      hebrew: 'מִי אֵלֶּה?',
      transcription: 'ми э́ле?',
      translation: 'Кто эти (люди)?',
    },
  },
  {
    hebrew: 'אֵלּוּ',
    hebrewPlain: 'אלו',
    transcription: 'э́лу',
    translation: 'эти (мн.ч.)',
    partOfSpeech: 'pronoun',
    exampleSentence: {
      hebrew: 'אֵלּוּ דְּבָרִים חֲשׁוּבִים.',
      transcription: 'э́лу дварӣм хашувӣм.',
      translation: 'Это важные вещи.',
    },
  },
];

/**
 * Строгое совпадение без огласовок
 */
function exactMatchesHebrew(target: string, query: string): boolean {
  if (!target || !query) return false;
  return stripNikkud(target).trim().toLowerCase() === query;
}

/**
 * Безопасное сопоставление כתיב מלא / כתיב חסר (например רהוט ↔ ריהוט, חלצה ↔ חולצה).
 * ВАЖНО:
 * - Применяется только к словам от 4 букв (в 2-3 буквенных словах выпадение буквы ломает корень).
 * - Первая и последняя буквы ОБЯЗАНЫ совпадать строго (начальная י или ו — это корень/приставка, а не гласная!).
 */
function fuzzySpellingMatches(target: string, query: string): boolean {
  if (!target || !query) return false;
  const t = stripNikkud(target).trim().toLowerCase();
  const q = stripNikkud(query).trim().toLowerCase();
  if (t === q) return true;
  if (t.length < 4 || q.length < 4) return false;
  if (t[0] !== q[0] || t[t.length - 1] !== q[q.length - 1]) return false;

  // Сравниваем только внутренние согласные, удаляя внутренние י и ו
  const tInternal = t.slice(1, -1).replace(/[יו]/g, '');
  const qInternal = q.slice(1, -1).replace(/[יו]/g, '');
  return tInternal.length >= 2 && tInternal === qInternal;
}

/**
 * Быстрый поиск слова в оффлайн-базе Ульпана (словарь + авторские диалоги + 100 уроков + эвристика приставок)
 * Выполняется строго поэтапно:
 *   1. Точный поиск по всей базе (Exact match)
 *   2. Поиск с валидным отделением приставок (основа >= 3 букв)
 *   3. Безопасное ктив-мале / חסר сопоставление (только если точных совпадений нет нигде)
 */
export function lookupOfflineWord(rawQuery: string): DictionaryEntry | null {
  if (!rawQuery) return null;
  const clean = stripNikkud(rawQuery.trim().toLowerCase());
  if (!clean) return null;

  const searchInSources = (
    matcher: (target: string, q: string) => boolean,
    queryText: string
  ): DictionaryEntry | null => {
    // 1. Поиск в базовом оффлайн-словаре
    const directOffline = ULPAN_OFFLINE_DICTIONARY.find(
      (entry) =>
        matcher(entry.hebrewPlain, queryText) ||
        matcher(entry.hebrew, queryText)
    );
    if (directOffline) return directOffline;

    // 2. Поиск в полезных словах авторских диалогов (HANDCRAFTED_DIALOGUES)
    if (typeof HANDCRAFTED_DIALOGUES === 'object' && HANDCRAFTED_DIALOGUES !== null) {
      for (const diag of Object.values(HANDCRAFTED_DIALOGUES)) {
        if (!diag?.usefulWords) continue;
        const usefulWord = diag.usefulWords.find(
          (w) =>
            matcher(w.hebrewPlain || '', queryText) ||
            matcher(w.hebrew, queryText)
        );
        if (usefulWord) {
          return {
            hebrew: usefulWord.hebrew,
            hebrewPlain: usefulWord.hebrewPlain || usefulWord.hebrew,
            transcription: usefulWord.transcription,
            translation: usefulWord.translation,
            root: usefulWord.root || null,
            partOfSpeech: usefulWord.partOfSpeech || 'other',
            exampleSentence: usefulWord.exampleSentence || null,
          };
        }
      }
    }

    // 3. Поиск по всем 100 урокам курса Ульпана
    if (typeof DETAILED_LESSONS === 'object' && DETAILED_LESSONS !== null) {
      for (const lesson of Object.values(DETAILED_LESSONS)) {
        if (!lesson?.vocabulary) continue;
        const lessonWord = lesson.vocabulary.find(
          (w) =>
            matcher(w.hebrewPlain || '', queryText) ||
            matcher(w.hebrew, queryText)
        );
        if (lessonWord) {
          return {
            hebrew: lessonWord.hebrew,
            hebrewPlain: lessonWord.hebrewPlain || lessonWord.hebrew,
            transcription: lessonWord.transcription,
            translation: lessonWord.translation,
            root: lessonWord.root || null,
            partOfSpeech: lessonWord.partOfSpeech || 'other',
            exampleSentence: lessonWord.exampleSentence || null,
          };
        }
      }
    }

    // 4. Поиск по тематическим словарям (THEMATIC_DECKS)
    if (Array.isArray(THEMATIC_DECKS)) {
      for (const deck of THEMATIC_DECKS) {
        if (!deck.words) continue;
        const deckWord = deck.words.find(
          (w) =>
            matcher(w.hebrewPlain || '', queryText) ||
            matcher(w.hebrew, queryText)
        );
        if (deckWord) {
          return {
            hebrew: deckWord.hebrew,
            hebrewPlain: deckWord.hebrewPlain || deckWord.hebrew,
            transcription: deckWord.transcription,
            translation: deckWord.translation,
            root: deckWord.root || null,
            partOfSpeech: deckWord.partOfSpeech || 'other',
            exampleSentence: deckWord.exampleSentence || null,
          };
        }
      }
    }

    return null;
  };

  // ЭТАП 1: Точный поиск слова по всем базам
  const exactMatch = searchInSources(exactMatchesHebrew, clean);
  if (exactMatch) return exactMatch;

  // ЭТАП 2: Поиск с отделением приставки (הַ-, בְּ-, לְ-, וְ-, מִ-, כְּ-, שֶׁ-)
  // Основа слова после отделения приставки должна быть не менее 3 букв!
  // Это предотвращает ошибочное отрезание первой буквы у коротких слов (например 'ב' у 'בלי')
  const prefixes = ['ה', 'ב', 'ל', 'ו', 'מ', 'כ', 'ש'];
  for (const prefix of prefixes) {
    if (clean.startsWith(prefix) && clean.length >= 4) {
      const subClean = clean.slice(1);
      const subMatch = searchInSources(exactMatchesHebrew, subClean);
      if (subMatch) {
        return subMatch;
      }
    }
  }

  // ЭТАП 3: Осторожный поиск כתיב מלא / חסר (только для слов от 4 букв)
  const fuzzyMatch = searchInSources(fuzzySpellingMatches, clean);
  if (fuzzyMatch) return fuzzyMatch;

  return null;
}

/**
 * Поиск всех слов с заданным корнем (משפחת השורש в стиле Pealim)
 */
export function findWordsByRoot(root: string): DictionaryEntry[] {
  if (!root) return [];
  const cleanRoot = root.replace(/[^א-ת]/g, '');
  if (!cleanRoot) return [];

  const results: DictionaryEntry[] = [];
  const seenHebrews = new Set<string>();

  const addIfNew = (entry: DictionaryEntry) => {
    const plain = stripNikkud(entry.hebrewPlain || entry.hebrew || '');
    if (!plain || seenHebrews.has(plain)) return;
    seenHebrews.add(plain);
    results.push(entry);
  };

  // 1. Поиск в оффлайн словаре
  for (const entry of ULPAN_OFFLINE_DICTIONARY) {
    if (!entry.root) continue;
    const entryCleanRoot = entry.root.replace(/[^א-ת]/g, '');
    if (entryCleanRoot === cleanRoot) {
      addIfNew(entry);
    }
  }

  // 2. Поиск в каталоге уроков
  if (typeof DETAILED_LESSONS === 'object' && DETAILED_LESSONS !== null) {
    for (const lesson of Object.values(DETAILED_LESSONS)) {
      if (!lesson?.vocabulary) continue;
      for (const word of lesson.vocabulary) {
        if (!word.root) continue;
        const wordCleanRoot = word.root.replace(/[^א-ת]/g, '');
        if (wordCleanRoot === cleanRoot) {
          addIfNew({
            hebrew: word.hebrew,
            hebrewPlain: word.hebrewPlain || word.hebrew,
            transcription: word.transcription,
            translation: word.translation,
            root: word.root,
            partOfSpeech: word.partOfSpeech || 'other',
            exampleSentence: word.exampleSentence || null,
          });
        }
      }
    }
  }

  // 3. Поиск в тематических колодах
  if (Array.isArray(THEMATIC_DECKS)) {
    for (const deck of THEMATIC_DECKS) {
      if (!deck.words) continue;
      for (const word of deck.words) {
        if (!word.root) continue;
        const wordCleanRoot = word.root.replace(/[^א-ת]/g, '');
        if (wordCleanRoot === cleanRoot) {
          addIfNew({
            hebrew: word.hebrew,
            hebrewPlain: word.hebrewPlain || word.hebrew,
            transcription: word.transcription,
            translation: word.translation,
            root: word.root,
            partOfSpeech: word.partOfSpeech || 'other',
            exampleSentence: word.exampleSentence || null,
          });
        }
      }
    }
  }

  return results;
}

