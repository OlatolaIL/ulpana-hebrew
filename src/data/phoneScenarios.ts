import { Lesson, PhoneScenario, PhoneScenarioWord, UserGender, PhoneCallType } from '@/types';

/**
 * Кастомные сценарии телефонных звонков для ключевых жизненных ситуаций в Израиле.
 */
export const BESPOKE_PHONE_SCENARIOS: Record<number, PhoneScenario> = {
  // Урок 1: Знакомство и первые фразы
  1: {
    callType: 'incoming',
    callerName: 'נוֹעַם',
    callerNameRu: 'Ноам (сосед по дому)',
    callerRole: 'Новый сосед из квартиры напротив',
    avatarEmoji: '👋',
    situationSummary: 'Вам звонит новый сосед из квартиры напротив, чтобы познакомиться.',
    callerObjective: 'Познакомиться с новым соседом, узнать как дела и как его зовут.',
    studentObjective: 'Поздороваться, сказать что всё отлично, и назвать своё имя.',
    completionCondition: 'Ученик ответил на приветствие и назвал имя.',
    targetTurns: 2,
    initialGreeting: {
      hebrew: 'הַלּוֹ? שָׁלוֹם! זֶה נוֹעַם מִדִּירָה 4. מָה נִשְׁמַע?',
      transcription: 'hалó? шалóм! зэ Нóам ми-дирá 4. ма нишмá?',
      translation: 'Алло? Привет! Это Ноам из 4 квартиры. Как дела?',
    },
    goals: [
      'Поздороваться в ответ (שָׁלוֹם / בּוֹקֶר טוֹב)',
      'Назвать свое имя (אֲנִי... / קוֹרְאִים לִי...)',
      'Сказать «Все отлично, спасибо» (הַכֹּל טוֹב, תּוֹדָה)',
    ],
    suggestedReplies: [
      {
        hebrew: 'הַלּוֹ נוֹעַם, שָׁלוֹם! הַכֹּל טוֹב, תּוֹדָה.',
        transcription: 'hалó Нóам, шалóм! hакóль тов, тодá.',
        translation: 'Алло Ноам, привет! Все хорошо, спасибо.',
      },
      {
        hebrew: 'נָעִים מְאוֹד, אֲנִי דָּוִד מִדִּירָה 5.',
        transcription: 'наӣм мэóд, анӣ Давӣд ми-дирá 5.',
        translation: 'Очень приятно, я Давид из 5 квартиры.',
      },
    ],
    vocabularyHints: ['שָׁלוֹם', 'הַכֹּל טוֹב', 'נָעִים מְאוֹד', 'תּוֹדָה', 'לְהִתְרָאוֹת'],
    usefulWords: [
      {
        hebrew: 'שָׁלוֹם',
        transcription: 'шалóм',
        translation: 'привет / здравствуйте / мир',
      },
      {
        hebrew: 'בּוֹקֶר טוֹב',
        transcription: 'бóкер тов',
        translation: 'доброе утро',
      },
      {
        hebrew: 'מָה נִשְׁמַע?',
        transcription: 'ма нишмá?',
        translation: 'как дела? / что слышно?',
      },
      {
        hebrew: 'הַכֹּל טוֹב',
        transcription: 'hакóль тов',
        translation: 'всё отлично / всё хорошо',
      },
      {
        hebrew: 'נָעִים מְאוֹד',
        transcription: 'наӣм мэóд',
        translation: 'очень приятно',
      },
      {
        hebrew: 'קוֹרְאִים לִי...',
        transcription: 'коръӣм ли...',
        translation: 'меня зовут...',
      },
      {
        hebrew: 'דִּירָה',
        transcription: 'дирá',
        translation: 'квартира',
        isNew: true,
      },
      {
        hebrew: 'לְהִתְרָאוֹת',
        transcription: 'лэhитраóт',
        translation: 'до свидания',
      },
    ],
    systemPromptAddition: 'Ты Ноам, сосед по дому. Твоя цель — быстро познакомиться. Когда сосед назовет имя, тепло ответь: «נעים מאוד! להתראות!» и повесь трубку.',
  },

  // Урок 2: В кафе
  2: {
    callType: 'outgoing',
    callerName: 'בֵּית קָפֶה «אֲרוֹמָה»',
    callerNameRu: 'Арома (бариста Йоси)',
    callerRole: 'Бариста в кофейне',
    avatarEmoji: '☕',
    situationSummary: 'Вы звоните сделать предзаказ кофе и выпечки навынос (Take Away).',
    callerObjective: 'Принять заказ кофе/выпечки навынос, быстро уточнить детали (размер, сахар) и подтвердить.',
    studentObjective: 'Заказать напиток на вынос и узнать стоимость.',
    completionCondition: 'Ученик сделал заказ кофе и узнал стоимость.',
    targetTurns: 2,
    initialGreeting: {
      hebrew: 'שָׁלוֹם, קָפֶה אֲרוֹמָה! מָה תִּרְצֶה לְהַזְמִין?',
      transcription: 'шалóм, кафэ́ арóма! ма тирцé лэhазмӣн?',
      translation: 'Здравствуйте, кафе Арома! Что вы хотите заказать?',
    },
    goals: [
      'Заказать напиток (кофе с молоком или чай)',
      'Уточнить размер (גָּדוֹל / קָטָן) и сахар',
      'Спросить стоимость (כַּמָּה זֶה עוֹלֶה?)',
    ],
    suggestedReplies: [
      {
        hebrew: 'שָׁלוֹם, אֲנִי רוֹצֶה קָפֶה גָּדוֹל עִם חָלָב, בְּבַקָּשָׁה.',
        transcription: 'шалóм, анӣ роцé кафэ́ гадóль им халáв, бэвакашá.',
        translation: 'Здравствуйте, я хочу большой кофе с молоком, пожалуйста.',
      },
      {
        hebrew: 'אֶפְשָׁר גַּם מַיִם קָרִים וְעוּגָה?',
        transcription: 'эфшáр гам мáйим карӣм вэ-угá?',
        translation: 'Можно также холодную воду и пирожное?',
      },
      {
        hebrew: 'כַּמָּה זֶה עוֹלֶה?',
        transcription: 'кáма зэ олé?',
        translation: 'Сколько это стоит?',
      },
    ],
    vocabularyHints: ['רוֹצֶה / רוֹצָה', 'קָפֶה עִם חָלָב', 'גָּדוֹל / קָטָן', 'כַּמָּה זֶה עוֹלֶה?', 'בְּבַקָּשָׁה'],
    usefulWords: [
      {
        hebrew: 'גָּדוֹל',
        transcription: 'гадóль',
        translation: 'большой (размер порции)',
        isNew: true,
      },
      {
        hebrew: 'קָטָן',
        transcription: 'катáн',
        translation: 'маленький',
        isNew: true,
      },
      {
        hebrew: 'כַּמָּה זֶה עוֹלֶה?',
        transcription: 'кáма зэ олé?',
        translation: 'сколько это стоит?',
        isNew: true,
      },
      {
        hebrew: 'לְהַזְמִין',
        transcription: 'лэhазмӣн',
        translation: 'заказать / делать заказ',
        isNew: true,
      },
      {
        hebrew: 'אֶפְשָׁר...',
        transcription: 'эфшáр...',
        translation: 'можно... / разрешите...',
        isNew: true,
      },
      {
        hebrew: 'בְּלִי סוּכָּר',
        transcription: 'бли сукáр',
        translation: 'без сахара (בְּלִי = без)',
        isNew: true,
      },
      {
        hebrew: 'לָקַחַת (טֵייק אַוֵויי)',
        transcription: 'лакáхат (тейк авэ́й)',
        translation: 'навынос (с собой)',
        isNew: true,
      },
      {
        hebrew: 'קָפֶה עִם חָלָב',
        transcription: 'кафэ́ им халáв',
        translation: 'кофе с молоком',
      },
      {
        hebrew: 'קְרוּאָסוֹן / עוּגָה',
        transcription: 'круасóн / угá',
        translation: 'круассан / пирожное',
      },
      {
        hebrew: 'חֶשְׁבּוֹן',
        transcription: 'хэжбóн',
        translation: 'счет',
      },
    ],
    systemPromptAddition: 'Ты бариста Йоси. Уточни про сахар, размер (катан или гадоль) и молоко (обычное или овсяное). Отвечай быстро и дружелюбно.',
  },

  // Урок 4: Страны, города и языки
  4: {
    callType: 'incoming',
    callerName: 'שָׂרָה',
    callerNameRu: 'Сара (студентка из ульпана)',
    callerRole: 'Студентка из ульпана',
    avatarEmoji: '🇫🇷',
    situationSummary: 'Вам звонит новая однокурсница Сара из ульпана, чтобы познакомиться.',
    callerObjective: 'Узнать у однокурсника, из какой он страны, где живёт и на каких языках говорит.',
    studentObjective: 'Сказать, откуда вы родом, в каком городе живете и на каких языках говорите.',
    completionCondition: 'Ученик назвал страну/город или языки.',
    targetTurns: 2,
    initialGreeting: {
      hebrew: 'הַלּוֹ? שָׁלוֹם! זֹאת שָׂרָה מֵהַאוּלְפָּן. מָה נִשְׁמַע?',
      transcription: 'hалó? шалóм! зот Сáра мэ-hа-ульпáн. ма нишмá?',
      translation: 'Алло? Привет! Это Сара из ульпана. Как дела?',
    },
    goals: [
      'Поздороваться и ответить, как дела (שָׁלוֹם, הַכֹּל בְּסֵדֶר)',
      'Сказать, из какой вы страны (אֲנִי מֵרוּסְיָה / אֲנִי מִ...)',
      'Сказать, в каком городе вы живете (אֲנִי גָּר / גָּרָה בְּ...)',
      'Сказать, на каких языках вы говорите (אֲנִי מְדַבֵּר / מְדַבֶּרֶת...)',
    ],
    suggestedReplies: [
      {
        hebrew: 'הַלּוֹ שָׂרָה! הַכֹּל טוֹב, תּוֹדָה. מָה שְׁלוֹמֵךְ?',
        transcription: 'hалó Сáра! hакóль тов, тодá. ма шломéх?',
        translation: 'Алло Сара! Всё хорошо, спасибо. Как твои дела?',
      },
      {
        hebrew: 'אֲנִי מֵרוּסְיָה וְעַכְשָׁו אֲנִי גָּר בְּתֵל אָבִיב.',
        transcription: 'анӣ мэ-Рýсья вэ-ахшáв анӣ гар бэ-Тэль Авӣв.',
        translation: 'Я из России, а сейчас живу в Тель-Авиве.',
      },
      {
        hebrew: 'אֲנִי מְדַבֵּר רוּסִית, אַנְגְּלִית וּקְצָת עִבְרִית.',
        transcription: 'анӣ мэдабэ́р русӣт, англӣт вэ-кцат иврӣт.',
        translation: 'Я говорю по-русски, по-английски и немного на иврите.',
      },
    ],
    vocabularyHints: ['מֵאֵיפֹה אַתָּה?', 'אֵיפֹה אַתָּה גָּר?', 'עִבְרִית', 'רוּסִית', 'קְצָת'],
    usefulWords: [
      {
        hebrew: 'מֵאֵיפֹה אַתָּה?',
        transcription: 'мэ-э́йфо атá?',
        translation: 'откуда ты? (к мужчине)',
        isNew: true,
      },
      {
        hebrew: 'אֵיפֹה אַתָּה גָּר?',
        transcription: 'э́йфо атá гар?',
        translation: 'где ты живешь? (к мужчине)',
        isNew: true,
      },
      {
        hebrew: 'בְּאֵיזֶה שָׂפוֹת אַתָּה מְדַבֵּר?',
        transcription: 'бэ-э́йзе сафóт атá мэдабэ́р?',
        translation: 'на каких языках ты говоришь?',
        isNew: true,
      },
      {
        hebrew: 'עִבְרִית וְרוּסִית',
        transcription: 'иврӣт вэ-русӣт',
        translation: 'иврит и русский',
        isNew: true,
      },
    ],
    systemPromptAddition: 'Ты Сара, студентка ульпана из Франции. Говори короткими фразами (1-2 предложения). Узнав ответ, вежливо скажи: «יוֹפִי, נִתְרָאֶה בַּאוּלְפָּן! בַּיי!» и заверши разговор.',
  },

  // Урок 5: Поездки и Такси
  5: {
    callType: 'incoming',
    callerName: 'נַהָג גֶּט (Gett)',
    callerNameRu: 'Водитель Gett (Эли)',
    callerRole: 'Водитель такси',
    avatarEmoji: '🚕',
    situationSummary: 'Вам звонит водитель такси, который подъехал к дому на белой Тойоте.',
    callerObjective: 'Сообщить пассажиру, что такси уже внизу на улице, и узнать, где пассажир.',
    studentObjective: 'Сказать водителю, что вы спускаетесь («אֲנִי יוֹרֵד עַכְשָׁו») или попросить подождать пару минут («רֶגַע, עוֹד שְׁתֵּי דַּקּוֹת»).',
    completionCondition: 'Пассажир сообщил, что спускается («אני יורד»), попросил подождать («עוד שתי דקות», «רגע») или спросил машину.',
    targetTurns: 1,
    initialGreeting: {
      hebrew: 'הַלּוֹ? שָׁלוֹם! אֲנִי הַנַּהָג שֶׁל גֶּט, אֲנִי לְמַטָּה בָּרְחוֹב. אֵיפֹה אַתָּה?',
      transcription: 'hалó? шалóм! анӣ hа-наháг шэль гет, анӣ лэмáта ба-рэхóв. э́йфо атá?',
      translation: 'Алло? Привет! Я водитель из Gett, я внизу на улице. Ты где?',
    },
    goals: [
      'Сказать водителю, что вы спускаетесь (אֲנִי יוֹרֵד עַכְשָׁו / אֲנִי יוֹרֶדֶת עַכְשָׁו) или попросить подождать 2 минуты (עוֹד שְׁתֵּי דַּקּוֹת)',
      'При желании спросить цвет или марку машины (אֵיזֶה רֶכֶב יֵשׁ לְךָ?)',
    ],
    suggestedReplies: [
      {
        hebrew: 'שָׁלוֹם! אֲנִי יוֹרֵד עַכְשָׁו, עוֹד שְׁתֵּי דַּקּוֹת אֲנִי שָׁם.',
        transcription: 'шалóм! анӣ йорéд ахшáв, од штэй дакóт анӣ шам.',
        translation: 'Привет! Я спускаюсь сейчас, через 2 минуты буду там.',
      },
      {
        hebrew: 'רֶגַע, אֵיזֶה רֶכֶב יֵשׁ לְךָ?',
        transcription: 'рéга, э́йзе рéхев йеш лэхá?',
        translation: 'Секунду, какая у тебя машина?',
      },
    ],
    vocabularyHints: ['עַכְשָׁו', 'יוֹרֵד / יוֹרֶדֶת', 'רֶגַע', 'דַּקָּה', 'תּוֹדָה'],
    usefulWords: [
      {
        hebrew: 'עַכְשָׁו',
        transcription: 'ахшáв',
        translation: 'сейчас',
        isNew: true,
      },
      {
        hebrew: 'יוֹרֵד / יוֹרֶדֶת',
        transcription: 'йорéд / йорéдет',
        translation: 'спускаюсь (м.р. / ж.р.)',
        isNew: true,
      },
      {
        hebrew: 'לְמַטָּה',
        transcription: 'лэмáта',
        translation: 'внизу',
        isNew: true,
      },
      {
        hebrew: 'עוֹד שְׁתֵּי דַּקּוֹת',
        transcription: 'од штэй дакóт',
        translation: 'еще две минуты',
        isNew: true,
      },
      {
        hebrew: 'רֶגַע',
        transcription: 'рéга',
        translation: 'секунду / момент',
        isNew: true,
      },
      {
        hebrew: 'אֵיזֶה רֶכֶב?',
        transcription: 'э́йзе рéхев?',
        translation: 'какая машина?',
        isNew: true,
      },
    ],
    systemPromptAddition: `Ты израильский водитель такси Эли на белой Тойоте (טוֹיוֹטָה לְבָנָה). Ты приехал по заказу и ждёшь пассажира внизу на улице.
Как только пассажир ответил (сказал «רגע, אני יורד» / «עוד שתי דקות» / спросил машину) — сразу скажи: «מְעֻלֶּה! אֲנִי מְחַכֶּה לְךָ לְמַטָּה בְּטוֹיוֹטָה לְבָנָה. בַּיי!», установи shouldHangUp: true и повесь трубку!`,
  },

  // Урок 15: Аренда квартиры
  15: {
    callType: 'outgoing',
    callerName: 'בַּעַל הַדִּירָה',
    callerNameRu: 'Хозяин квартиры (Ави)',
    callerRole: 'Арендодатель в Тель-Авиве',
    avatarEmoji: '🔑',
    situationSummary: 'Вы звоните по объявлению об аренде 2-комнатной квартиры.',
    callerObjective: 'Ответить на звонок по аренде, сообщить цену (5500 шекелей) и договориться о встрече.',
    studentObjective: 'Спросить свободна ли квартира, сколько стоит аренда и когда можно посмотреть.',
    completionCondition: 'Ученик спросил о квартире и договорился о времени просмотра.',
    targetTurns: 2,
    initialGreeting: {
      hebrew: 'הַלּוֹ? כֵּן, בְּקֶשֶׁר לַדִּירָה בְּרְחוֹב דִּיזֶנְגּוֹף?',
      transcription: 'hалó? кен, бэ-кéшер ла-дирá бэ-рэхóв Ди́зенгоф?',
      translation: 'Алло? Да, насчет квартиры на улице Дизенгоф?',
    },
    goals: [
      'Спросить, свободна ли квартира (הַדִּירָה פְּנוּיָה?)',
      'Узнать стоимость аренды и арноны',
      'Договориться о времени просмотра (מָתַי אֶפְשָׁר לִרְאוֹת?)',
    ],
    suggestedReplies: [
      {
        hebrew: 'שָׁלוֹם, כֵּן! מָתַי אֶפְשָׁר לָבוֹא וְלִרְאוֹת אֶת הַדִּירָה?',
        transcription: 'шалóм, кен! матáй эфшáр лавó вэ-лиръóт эт hа-дирá?',
        translation: 'Здравствуйте, да! Когда можно прийти и посмотреть квартиру?',
      },
      {
        hebrew: 'כַּמָּה שְׂכַר דִּירָה בְּחֹדֶשׁ, וְיֵשׁ מַזְגָן?',
        transcription: 'кáма схар дирá бэ-хóдеш, вэ-йеш мазгáн?',
        translation: 'Сколько аренда в месяц, и есть ли кондиционер?',
      },
    ],
    vocabularyHints: ['דִּירָה', 'שְׂכַר דִּירָה', 'מַזְגָן', 'מָתַי', 'לִרְאוֹת'],
    usefulWords: [
      {
        hebrew: 'פְּנוּיָה',
        transcription: 'пнуйá',
        translation: 'свободна (о квартире)',
        isNew: true,
      },
      {
        hebrew: 'שְׂכַר דִּירָה',
        transcription: 'схар дирá',
        translation: 'арендная плата',
        isNew: true,
      },
      {
        hebrew: 'כַּמָּה זֶה בְּחֹדֶשׁ?',
        transcription: 'кáма зэ бэ-хóдеш?',
        translation: 'сколько это в месяц?',
        isNew: true,
      },
      {
        hebrew: 'מַזְגָן',
        transcription: 'мазгáн',
        translation: 'кондиционер',
        isNew: true,
      },
      {
        hebrew: 'מָתַי אֶפְשָׁר לִרְאוֹת?',
        transcription: 'матáй эфшáр лиръóт?',
        translation: 'когда можно посмотреть?',
        isNew: true,
      },
    ],
    systemPromptAddition: 'Ты хозяин квартиры Ави. Скажи, что аренда 5500 шекелей, есть мазган и балкон. Предложи встретиться сегодня вечером, согласуй время и вежливо попрощайся.',
  },

  // Урок 25: Курьер Wolt
  25: {
    callType: 'incoming',
    callerName: 'שָׁלִיחַ וְוֹלְט (Wolt)',
    callerNameRu: 'Курьер Wolt (Рон)',
    callerRole: 'Курьер с доставкой еды',
    avatarEmoji: '🛵',
    situationSummary: 'Вам звонит курьер Wolt, который привез ваш заказ, но не может войти в подъезд.',
    callerObjective: 'Узнать код от домофона или номер квартиры/этаж, чтобы передать заказ.',
    studentObjective: 'Назвать код домофона или попросить оставить пакет у двери.',
    completionCondition: 'Ученик назвал код от двери («הַקּוֹד הוּא...») или попросил оставить у двери.',
    targetTurns: 1,
    initialGreeting: {
      hebrew: 'הַלּוֹ? שָׁלוֹם, אֲנִי שְׁלִיחַ שֶׁל וְוֹלְט, אֲנִי לְמַטָּה בַּכְּנִיסָה. מָה הַקּוֹד?',
      transcription: 'hалó? шалóм, анӣ шлӣах шэль вольт, анӣ лэмáта ба-книсá. ма hа-код?',
      translation: 'Алло? Привет, я курьер Wolt, я внизу у входа. Какой код?',
    },
    goals: [
      'Назвать код от домофона (הַקּוֹד הוּא...)',
      'Назвать свой этаж и номер квартиры (קוֹמָה..., דִּירָה...)',
      'Попросить оставить заказ у двери (לְהַשְׁאִיר לְיַד הַדֶּלֶת)',
    ],
    suggestedReplies: [
      {
        hebrew: 'הַקּוֹד הוּא 1-2-3-4. קוֹמָה שְׁלִישִׁית, דִּירָה 7.',
        transcription: 'hа-код hу ахáт-штáйим-шалóш-áрба. комá шлиши́т, дирá шéва.',
        translation: 'Код 1234. Третий этаж, квартира 7.',
      },
      {
        hebrew: 'תַּשְׁאִיר אֶת הַשַּׂקִּית לְיַד הַדֶּלֶת, בְּבַקָּשָׁה. תּוֹדָה!',
        transcription: 'ташъӣр эт hа-сакӣт лэ-йад hа-дéлет, бэвакашá. тодá!',
        translation: 'Оставь пакет возле двери, пожалуйста. Спасибо!',
      },
    ],
    vocabularyHints: ['קּוֹד', 'כְּנִיסָה', 'קוֹמָה', 'דֶּלֶת', 'תַּשְׁאִיר', 'תּוֹדָה'],
    usefulWords: [
      {
        hebrew: 'הַקּוֹד הוּא...',
        transcription: 'hа-код hу...',
        translation: 'код домофона...',
        isNew: true,
      },
      {
        hebrew: 'קוֹמָה',
        transcription: 'комá',
        translation: 'этаж',
        isNew: true,
      },
      {
        hebrew: 'לְיַד הַדֶּלֶת',
        transcription: 'лэ-йад hа-дéлет',
        translation: 'возле двери',
        isNew: true,
      },
      {
        hebrew: 'תַּשְׁאִיר',
        transcription: 'ташъӣр',
        translation: 'оставь',
        isNew: true,
      },
      {
        hebrew: 'שַׂקִּית',
        transcription: 'сакӣт',
        translation: 'пакет',
        isNew: true,
      },
    ],
    systemPromptAddition: 'Ты курьер Wolt Рон. Как только ученик назовет код домофона или попросит оставить у двери, скажи: «מְעֻלֶּה, תּוֹדָה רַבָּה! בְּתֵאָבוֹן וּלְהִתְרָאוֹת!», заверши звонок и повесь трубку.',
  },

  // Урок 40: Запись к врачу (Купат Холим)
  40: {
    callType: 'outgoing',
    callerName: 'מוֹקֵד קֻפַּת חוֹלִים',
    callerNameRu: 'Поликлиника (Макаби / Клалит)',
    callerRole: 'Секретарь в регистратуре',
    avatarEmoji: '🏥',
    situationSummary: 'Вы звоните в медицинскую кассу, чтобы записаться на прием к семейному врачу.',
    callerObjective: 'Принять звонок в регистратуру, предложить свободное время и подтвердить запись к врачу.',
    studentObjective: 'Записаться на прием к семейному врачу на удобный день.',
    completionCondition: 'Ученик согласовал очередь к врачу.',
    targetTurns: 2,
    initialGreeting: {
      hebrew: 'שָׁלוֹם, מֵרְכָּז רְפוּאִי. אֵיךְ אֶפְשָׁר לַעֲזֹר לְךָ הַיּוֹם?',
      transcription: 'шалóм, меркáз рэфуӣ. эйх эфшáр лаазóр лэхá hайóм?',
      translation: 'Здравствуйте, медицинский центр. Чем мы можем вам помочь сегодня?',
    },
    goals: [
      'Сказать, что хотите записаться к семейному врачу (רוֹפֵא מִשְׁפָּחָה)',
      'Выбрать день и удобное время (יוֹם רְבִיעִי בַּבֹּקֶר)',
      'Назвать номер теудат-зеута или фамилию',
    ],
    suggestedReplies: [
      {
        hebrew: 'שָׁלוֹם, אֲנִי רוֹצֶה לִקְבֹּעַ תּוֹר לְרוֹפֵא מִשְׁפָּחָה, בְּבַקָּשָׁה.',
        transcription: 'шалóм, анӣ роцé ликбóа тор лэ-рофэ́ мишпахá, бэвакашá.',
        translation: 'Здравствуйте, я хочу назначить очередь к семейному врачу, пожалуйста.',
      },
      {
        hebrew: 'יֵשׁ תּוֹר פָּנוּי מָחָר בַּבֹּקֶר?',
        transcription: 'йеш тор панӯй махáр ба-бóкер?',
        translation: 'Есть свободная очередь завтра утром?',
      },
    ],
    vocabularyHints: ['תּוֹר', 'רוֹפֵא מִשְׁפָּחָה', 'בְּדִיקָה', 'מָחָר', 'קַבָּלָה'],
    usefulWords: [
      {
        hebrew: 'לִקְבֹּעַ תּוֹר',
        transcription: 'ликбóа тор',
        translation: 'назначить очередь',
        isNew: true,
      },
      {
        hebrew: 'רוֹפֵא מִשְׁפָּחָה',
        transcription: 'рофэ́ мишпахá',
        translation: 'семейный врач (терапевт)',
        isNew: true,
      },
      {
        hebrew: 'תּוֹר פָּנוּי',
        transcription: 'тор панӯй',
        translation: 'свободная очередь',
        isNew: true,
      },
      {
        hebrew: 'בַּבֹּקֶר',
        transcription: 'ба-бóкер',
        translation: 'утром',
        isNew: true,
      },
      {
        hebrew: 'תְּעוּדַת זֶהוּת',
        transcription: 'тэудáт зэhӯт',
        translation: 'удостоверение личности (паспорт)',
        isNew: true,
      },
    ],
    systemPromptAddition: 'Ты секретарь больничной кассы Михаль. Предложи очередь на завтра на 10:30 утра или четверг на 16:00.',
  },
};

/**
 * Получить или динамически сгенерировать телефонный сценарий для любого урока (1-100)
 */
export function getLessonPhoneScenario(lesson: Lesson, gender: UserGender): PhoneScenario {
  const isFemale = gender === 'female';

  // 1. Проверяем кастомный сценарий внутри самого объекта урока
  if (lesson.phoneScenario) {
    return adaptGenderInScenario(lesson.phoneScenario, isFemale);
  }

  // 2. Проверяем словарь готовых сценариев
  if (BESPOKE_PHONE_SCENARIOS[lesson.number]) {
    return adaptGenderInScenario(BESPOKE_PHONE_SCENARIOS[lesson.number], isFemale);
  }

  // 3. Системный автоматический генератор для ВСЕХ остальных уроков (1-100)
  const dial = lesson.dialogue;
  const aiRole = dial.aiRole || 'Собеседник';
  const aiRoleLower = aiRole.toLowerCase();
  const situationLower = (dial.situation || '').toLowerCase();
  const titleLower = (lesson.titleRussian || '').toLowerCase();
  const catLower = (lesson.category || '').toLowerCase();

  // Определяем тип звонка: входящий (звонят ученику) или исходящий (ученик звонит в службу/организацию)
  const isIncoming =
    aiRoleLower.includes('נהג') ||
    aiRoleLower.includes('שליח') ||
    aiRoleLower.includes('חבר') ||
    aiRoleLower.includes('שכן') ||
    aiRoleLower.includes('водитель') ||
    aiRoleLower.includes('курьер') ||
    aiRoleLower.includes('сосед') ||
    aiRoleLower.includes('друг') ||
    aiRoleLower.includes('знакомый') ||
    aiRoleLower.includes('коллега') ||
    situationLower.includes('вам звонит') ||
    situationLower.includes('звонит вам');

  const callType: PhoneCallType = isIncoming ? 'incoming' : 'outgoing';

  let callerObjective = '';
  let studentObjective = '';
  let initialGreetingHeb = '';
  let initialGreetingTr = '';
  let initialGreetingRu = '';

  if (isIncoming) {
    callerObjective = `Кратко выяснить у ученика нужную информацию по теме «${lesson.titleRussian}» и завершить звонок.`;
    studentObjective = `Ответить на вопрос собеседника и подтвердить информацию.`;
    if (dial.initialMessage?.hebrew) {
      initialGreetingHeb = `הַלּוֹ? שָׁלוֹם! ${dial.initialMessage.hebrew}`;
      initialGreetingTr = `hалó? шалóм! ${dial.initialMessage.transcription || ''}`;
      initialGreetingRu = `Алло? Привет! ${dial.initialMessage.translation || ''}`;
    } else {
      initialGreetingHeb = `הַלּוֹ? שָׁלוֹם! זֶה ${aiRole}. מָה נִשְׁמַע?`;
      initialGreetingTr = `hалó? шалóм! зэ ${aiRole}. ма нишмá?`;
      initialGreetingRu = `Алло? Привет! Это ${aiRole}. Как дела?`;
    }
  } else {
    // Outgoing call: ученик звонит в организацию / сервис
    callerObjective = `Принять звонок в роли «${aiRole}», ответить на просьбу ученика и вежливо подтвердить договоренность.`;
    studentObjective = `Поздороваться, изложить свой запрос по теме «${lesson.titleRussian}» и договориться.`;
    if (dial.initialMessage?.hebrew && !dial.initialMessage.hebrew.includes('?')) {
      initialGreetingHeb = `שָׁלוֹם, ${aiRole}! ${dial.initialMessage.hebrew}`;
      initialGreetingTr = `шалóм, ${aiRole}! ${dial.initialMessage.transcription || ''}`;
      initialGreetingRu = `Здравствуйте, ${aiRole}! ${dial.initialMessage.translation || ''}`;
    } else {
      initialGreetingHeb = `שָׁלוֹם, ${aiRole}! אֵיךְ אֶפְשָׁר לַעֲזֹר?`;
      initialGreetingTr = `шалóм, ${aiRole}! эйх эфшáр лаазóр?`;
      initialGreetingRu = `Здравствуйте, ${aiRole}! Чем могу помочь?`;
    }
  }

  // Адаптация рода в приветствии
  if (isFemale) {
    initialGreetingHeb = initialGreetingHeb.replace(/לְךָ/g, 'לָךְ').replace(/תִּרְצֶה/g, 'תִּרְצִי').replace(/אַתָּה/g, 'אַתְּ');
    initialGreetingTr = initialGreetingTr.replace(/лэхá/g, 'лах').replace(/тирцé/g, 'тирцӣ').replace(/атá/g, 'ат');
  }

  const dynamicUsefulWords: PhoneScenarioWord[] = (lesson.vocabulary || []).slice(0, 7).map((w) => ({
    hebrew: w.hebrew,
    transcription: w.transcription || '',
    translation: w.translation,
  }));

  if (!dynamicUsefulWords.some((w) => w.hebrew.includes('הַלּוֹ') || w.hebrew.includes('שָׁלוֹם'))) {
    dynamicUsefulWords.unshift({
      hebrew: 'הַלּוֹ, שָׁלוֹם!',
      transcription: 'hалó, шалóм!',
      translation: 'алло, привет / здравствуйте',
    });
  }
  if (!dynamicUsefulWords.some((w) => w.hebrew.includes('לְהִתְרָאוֹת'))) {
    dynamicUsefulWords.push({
      hebrew: 'לְהִתְרָאוֹת',
      transcription: 'лэhитраóт',
      translation: 'до свидания / пока',
    });
  }

  const firstVocabWord = lesson.vocabulary?.[0]?.hebrew || '';

  return {
    callType,
    callerName: aiRole,
    callerNameRu: aiRole,
    callerRole: aiRole,
    avatarEmoji: getEmojiForCategory(lesson.category),
    situationSummary: isIncoming
      ? `Вам звонит ${aiRole} по теме урока: «${lesson.titleRussian}».`
      : `Вы звоните (${aiRole}) по теме урока: «${lesson.titleRussian}».`,
    callerObjective,
    studentObjective,
    completionCondition: isIncoming
      ? 'Ученик ответил на вопрос собеседника и согласовал детали.'
      : 'Ученик высказал свою просьбу и получил подтверждение.',
    targetTurns: 2,
    initialGreeting: {
      hebrew: initialGreetingHeb,
      transcription: initialGreetingTr,
      translation: initialGreetingRu,
    },
    goals: dial.goals && dial.goals.length > 0
      ? dial.goals
      : [
          'Ответить на звонок и поддержать беседу',
          'Использовать ключевые слова из урока',
          'Вежливо завершить разговор (לְהִתְרָאוֹת)',
        ],
    suggestedReplies: [
      {
        hebrew: isIncoming
          ? (isFemale ? 'שָׁלוֹם! הַכֹּל בְּסֵדֶר, מָה אִתָּךְ?' : 'שָׁלוֹם! הַכֹּל בְּסֵדֶר, מָה אִתְּךָ?')
          : (firstVocabWord ? `שָׁלוֹם, אֲנִי רוֹצֶה ${firstVocabWord}, בְּבַקָּשָׁה.` : 'שָׁלוֹם, אֶפְשָׁר עֶזְרָה בְּבַקָּשָׁה?'),
        transcription: isIncoming
          ? (isFemale ? 'шалóм! hакóль бэсэ́дер, ма итáх?' : 'шалóм! hакóль бэсэ́дер, ма итхá?')
          : 'шалóм, эфшáр эзрá бэвакашá?',
        translation: isIncoming
          ? 'Привет! Все хорошо, как ты?'
          : 'Здравствуйте, можно помощь пожалуйста?',
      },
      {
        hebrew: 'תּוֹדָה רַבָּה, יוֹם טוֹב וּלְהִתְרָאוֹת!',
        transcription: 'тодá рабá, йом тов у-лэhитраóт!',
        translation: 'Большое спасибо, хорошего дня и до свидания!',
      },
    ],
    vocabularyHints: dial.vocabularyHints || (lesson.vocabulary || []).slice(0, 5).map((w) => w.hebrew),
    usefulWords: dynamicUsefulWords,
    systemPromptAddition: `Ты ${aiRole}. Это короткий жизненный телефонный звонок в Израиле. Говори короткими репликами (1-2 предложения). Как только вопрос решен — тепло попрощайся и повесь трубку.`,
  };
}

function adaptGenderInScenario(scenario: PhoneScenario, isFemale: boolean): PhoneScenario {
  const copy: PhoneScenario = JSON.parse(JSON.stringify(scenario));
  if (isFemale) {
    copy.initialGreeting.hebrew = copy.initialGreeting.hebrew
      .replace(/לְךָ/g, 'לָךְ')
      .replace(/תִּרְצֶה/g, 'תִּרְצִי')
      .replace(/אַתָּה/g, 'אַתְּ');
    copy.initialGreeting.transcription = copy.initialGreeting.transcription
      .replace(/лэхá/g, 'лах')
      .replace(/тирцé/g, 'тирцӣ')
      .replace(/атá/g, 'ат');
  }
  return copy;
}

function getEmojiForCategory(category: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('кафе') || cat.includes('еда')) return '☕';
  if (cat.includes('дом') || cat.includes('квартира')) return '🏠';
  if (cat.includes('город') || cat.includes('такси') || cat.includes('дорога')) return '🚕';
  if (cat.includes('здоровье') || cat.includes('врач')) return '🏥';
  if (cat.includes('работа') || cat.includes('офис')) return '💼';
  if (cat.includes('покуп') || cat.includes('магазин')) return '🛒';
  return '📞';
}
