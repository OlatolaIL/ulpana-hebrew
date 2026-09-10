/**
 * Тематические колоды: Тело, здоровье, медицина и больничные кассы (Алеф и Бет)
 */

import { ThematicDeck } from '@/types';

export const HEALTH_DECKS: ThematicDeck[] = [
  // ==========================================
  // ТЕЛО И ЗДОРОВЬЕ (АЛЕФ)
  // ==========================================
  {
    id: 'body-health-alef',
    title: 'Части тела, Здоровье и Самочувствие',
    titleHebrew: 'גּוּף הָאָדָם וּבְרִיאוּת',
    description: '35 слов: части тела, симптомы, описание боли и базовые термины здоровья.',
    level: 'alef',
    category: 'body',
    icon: 'Heart',
    words: [
      { id: 'b_alef_1', hebrew: 'רֹאשׁ', hebrewPlain: 'ראש', transcription: 'рош', translation: 'голова', partOfSpeech: 'noun', plural: 'רָאשִׁים', lessonId: 0 },
      { id: 'b_alef_2', hebrew: 'יָד', hebrewPlain: 'יד', transcription: 'яд', translation: 'рука (кисть/рука, ж.р.)', partOfSpeech: 'noun', plural: 'יָדַיִם', lessonId: 0 },
      { id: 'b_alef_3', hebrew: 'רֶגֶל', hebrewPlain: 'רגל', transcription: 'рéгель', translation: 'нога (ж.р.)', partOfSpeech: 'noun', plural: 'רַגְלַיִם', lessonId: 0 },
      { id: 'b_alef_4', hebrew: 'עַיִן', hebrewPlain: 'עין', transcription: 'áйин', translation: 'глаз (ж.р.)', partOfSpeech: 'noun', plural: 'עֵינַיִם', lessonId: 0 },
      { id: 'b_alef_5', hebrew: 'אֹזֶן', hebrewPlain: 'אוזן', transcription: 'óзен', translation: 'ухо (ж.р.)', partOfSpeech: 'noun', plural: 'אָזְנַיִם', lessonId: 0 },
      { id: 'b_alef_6', hebrew: 'אַף', hebrewPlain: 'אף', transcription: 'аф', translation: 'нос', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_7', hebrew: 'פֶּה', hebrewPlain: 'פה', transcription: 'пэ', translation: 'рот', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_8', hebrew: 'שֵׁן', hebrewPlain: 'שן', transcription: 'шен', translation: 'зуб (ж.р.)', partOfSpeech: 'noun', plural: 'שִׁנַּיִם', lessonId: 0 },
      { id: 'b_alef_9', hebrew: 'בֶּטֶן', hebrewPlain: 'בטן', transcription: 'бéтен', translation: 'живот (ж.р.)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_10', hebrew: 'גַּב', hebrewPlain: 'גב', transcription: 'гав', translation: 'спина', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_11', hebrew: 'לֵב', hebrewPlain: 'לב', transcription: 'лев', translation: 'сердце', partOfSpeech: 'noun', plural: 'לְבָבוֹת', lessonId: 0 },
      { id: 'b_alef_12', hebrew: 'גָּרוֹן', hebrewPlain: 'גרון', transcription: 'гарóн', translation: 'горло', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_13', hebrew: 'כּוֹאֵב', hebrewPlain: 'כואב', transcription: 'ко’éв', translation: 'болит (м.р.)', partOfSpeech: 'adjective', lessonId: 0 },
      { id: 'b_alef_14', hebrew: 'כּוֹאֶבֶת', hebrewPlain: 'כואבת', transcription: 'ко’éвет', translation: 'болит (ж.р.)', partOfSpeech: 'adjective', lessonId: 0 },
      { id: 'b_alef_15', hebrew: 'כּוֹאֵב לִי הָרֹאשׁ', hebrewPlain: 'כואב לי הראש', transcription: 'ко’éв ли hа-рош', translation: 'У меня болит голова', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'b_alef_16', hebrew: 'כּוֹאֶבֶת לִי הַבֶּטֶן', hebrewPlain: 'כואבת לי הבטן', transcription: 'ко’éвет ли hа-бéтен', translation: 'У меня болит живот', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'b_alef_17', hebrew: 'חוֹם', hebrewPlain: 'חום', transcription: 'хом', translation: 'жар, высокая температура', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_18', hebrew: 'יֵשׁ לִי חוֹם', hebrewPlain: 'יש לי חום', transcription: 'йеш ли хом', translation: 'У меня температура', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'b_alef_19', hebrew: 'רוֹפֵא', hebrewPlain: 'רופא', transcription: 'рофé', translation: 'врач (м.р.)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_20', hebrew: 'רוֹפְאָה', hebrewPlain: 'רופאה', transcription: 'роф’á', translation: 'врач (ж.р.)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_21', hebrew: 'חוֹלֶה', hebrewPlain: 'חולה', transcription: 'холé', translation: 'больной (м.р.)', partOfSpeech: 'adjective', lessonId: 0 },
      { id: 'b_alef_22', hebrew: 'חוֹלָה', hebrewPlain: 'חולה', transcription: 'холá', translation: 'больная (ж.р.)', partOfSpeech: 'adjective', lessonId: 0 },
      { id: 'b_alef_23', hebrew: 'בָּרִיא', hebrewPlain: 'בריא', transcription: 'барӣ', translation: 'здоровый', partOfSpeech: 'adjective', lessonId: 0 },
      { id: 'b_alef_24', hebrew: 'בְּרִיאוּת', hebrewPlain: 'בריאות', transcription: 'бри’ӯт', translation: 'здоровье', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_25', hebrew: 'תְּרוּפָה', hebrewPlain: 'תרופה', transcription: 'труфá', translation: 'лекарство', partOfSpeech: 'noun', plural: 'תְּרוּפוֹת', lessonId: 0 },
      { id: 'b_alef_26', hebrew: 'כַּדּוּר', hebrewPlain: 'כדור', transcription: 'кадӯр', translation: 'таблетка / мяч', partOfSpeech: 'noun', plural: 'כַּדּוּרִים', lessonId: 0 },
      { id: 'b_alef_27', hebrew: 'בֵּית מִרְקַחַת', hebrewPlain: 'בית מרקחת', transcription: 'бэйт миркáхат', translation: 'аптека', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_28', hebrew: 'בֵּית חוֹלִים', hebrewPlain: 'בית חולים', transcription: 'бэйт холӣм', translation: 'больница', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_29', hebrew: 'אֶמְבּוּלַנְס', hebrewPlain: 'אמבולנס', transcription: 'áмбуланс', translation: 'скорая помощь', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'b_alef_30', hebrew: 'עָיֵף', hebrewPlain: 'עייף', transcription: 'айéф', translation: 'уставший', partOfSpeech: 'adjective', lessonId: 0 },
      { id: 'b_alef_31', hebrew: 'עֲיֵפָה', hebrewPlain: 'עייפה', transcription: 'айефá', translation: 'уставшая', partOfSpeech: 'adjective', lessonId: 0 },
      { id: 'b_alef_32', hebrew: 'תַּרְגִּישׁ טוֹב', hebrewPlain: 'תרגיש טוב', transcription: 'таргӣш тов', translation: 'Поправляйся! (м.р.)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'b_alef_33', hebrew: 'תַּרְגִּישִׁי טוֹב', hebrewPlain: 'תרגישי טוב', transcription: 'таргишӣ тов', translation: 'Поправляйся! (ж.р.)', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'b_alef_34', hebrew: 'בְּסֵדֶר', hebrewPlain: 'בסדר', transcription: 'бесéдер', translation: 'в порядке, нормально', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'b_alef_35', hebrew: 'לַחַץ דָּם', hebrewPlain: 'לחץ דם', transcription: 'лáхац дам', translation: 'кровяное давление', partOfSpeech: 'noun', lessonId: 0 },
    ],
  },

  // ==========================================
  // МЕДИЦИНА И КУПАТ ХОЛИМ (БЕТ)
  // ==========================================
  {
    id: 'medical-clinic-bet',
    title: 'Медицина и Поликлиника (Купат Холим)',
    titleHebrew: 'רְפוּאָה וּקֻפַּת חוֹלִים',
    description: '30 слов: запись к врачу, направления, анализы, страховка и диагнозы.',
    level: 'bet',
    category: 'health',
    icon: 'Stethoscope',
    words: [
      { id: 'm_bet_1', hebrew: 'קֻפַּת חוֹלִים', hebrewPlain: 'קופת חולים', transcription: 'купáт холӣм', translation: 'больничная касса (Клалит, Маккаби, Меухедет, Леумит)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_2', hebrew: 'תּוֹר', hebrewPlain: 'תור', transcription: 'тор', translation: 'очередь / запись на прием', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_3', hebrew: 'לִקְבֹּעַ תּוֹר', hebrewPlain: 'לקבוע תור', transcription: 'ликбóа тор', translation: 'записаться на прием к врачу', partOfSpeech: 'expression', lessonId: 0 },
      { id: 'm_bet_4', hebrew: 'רוֹפֵא מִשְׁפָּחָה', hebrewPlain: 'רופא משפחה', transcription: 'рофé мишпахá', translation: 'семейный врач (терапевт)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_5', hebrew: 'רוֹפֵא מֻמְחֶה', hebrewPlain: 'רופא מומחה', transcription: 'рофé мумхé', translation: 'врач-специалист (узкий профиль)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_6', hebrew: 'הַפְנָיָה', hebrewPlain: 'הפניה', transcription: 'hафнайá', translation: 'направление (к врачу/на анализы)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_7', hebrew: 'מִרְשָׁם', hebrewPlain: 'מרשם', transcription: 'миршáм', translation: 'рецепт на лекарство', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_8', hebrew: 'בְּדִיקַת דָּם', hebrewPlain: 'בדיקת דם', transcription: 'бдикáт дам', translation: 'анализ крови', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_9', hebrew: 'תּוֹצָאוֹת', hebrewPlain: 'תוצאות', transcription: 'тоца’óт', translation: 'результаты (анализов)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_10', hebrew: 'בִּטּוּחַ רְפוּאִי', hebrewPlain: 'ביטוח רפואי', transcription: 'битӯах рефу’ӣ', translation: 'медицинская страховка', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_11', hebrew: 'חֹדֶר מִיּוּן', hebrewPlain: 'חדר מיון', transcription: 'хадáр мийӯн', translation: 'приемный покой в больнице (ER)', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_12', hebrew: 'דַּלֶּקֶת', hebrewPlain: 'דלקת', transcription: 'далéкет', translation: 'воспаление', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_13', hebrew: 'אַנְטִיבִּיאוֹטִיקָה', hebrewPlain: 'אנטיביוטיקה', transcription: 'антибиóтика', translation: 'антибиотики', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_14', hebrew: 'חִסּוּן', hebrewPlain: 'חיסון', transcription: 'хисӯн', translation: 'прививка, вакцинация', partOfSpeech: 'noun', lessonId: 0 },
      { id: 'm_bet_15', hebrew: 'אִשְׁפּוּז', hebrewPlain: 'אשפוז', transcription: 'ишпӯз', translation: 'госпитализация', partOfSpeech: 'noun', lessonId: 0 },
    ],
  },
];
