import { Lesson, PhoneScenario, PhoneScenarioWord, UserGender } from '@/types';

/**
 * Кастомные сценарии телефонных звонков для ключевых жизненных ситуаций в Израиле.
 */
export const BESPOKE_PHONE_SCENARIOS: Record<number, PhoneScenario> = {
  // Урок 1: Знакомство и первые фразы
  1: {
    callerName: 'נוֹעַם',
    callerNameRu: 'Ноам (сосед по дому)',
    callerRole: 'Новый сосед из квартиры напротив',
    avatarEmoji: '👋',
    situationSummary: 'Вам звонит новый сосед из квартиры напротив, чтобы познакомиться.',
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
    systemPromptAddition: 'Ты Ноам, дружелюбный сосед. Говори короткими фразами (1-2 предложения). Спроси как дела и как зовут собеседника.',
  },

  // Урок 2: В кафе
  2: {
    callerName: 'בֵּית קָפֶה «אֲרוֹמָה»',
    callerNameRu: 'Арома (бариста Йоси)',
    callerRole: 'Бариста в кофейне',
    avatarEmoji: '☕',
    situationSummary: 'Вы звоните сделать предзаказ кофе и выпечки на вынос (Take Away).',
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
    callerName: 'שָׂרָה',
    callerNameRu: 'Сара (студентка из ульпана)',
    callerRole: 'Студентка из ульпана',
    avatarEmoji: '🇫🇷',
    situationSummary: 'Вам звонит новая однокурсница Сара из ульпана, чтобы познакомиться.',
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
        transcription: 'анӣ мэдабэ́р русӣт, англӣт у-кцат иврӣт.',
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
    systemPromptAddition: 'Ты Сара, студентка ульпана из Франции. Говори короткими фразами (1-2 предложения). Спроси собеседника, откуда он (מֵאֵיפֹה אַתָּה?), где он живет (אֵיפֹה אַתָּה גָּר?) и на каких языках говорит (בְּאֵיזוֹ שָׂפָה אַתָּה מְדַבֵּר?). В русском переводе СТРОГО используй чистый русский литературный язык: "На каком языке ты говоришь?" и "Где ты живешь?". Никаких дословных калек!',
  },

  // Урок 5: Поездки и Такси
  5: {
    callerName: 'נַהָג גֶּט (Gett)',
    callerNameRu: 'Водитель Gett (Эли)',
    callerRole: 'Водитель такси',
    avatarEmoji: '🚕',
    situationSummary: 'Вам звонит водитель такси, который подъехал к дому.',
    initialGreeting: {
      hebrew: 'הַלּוֹ? שָׁלוֹם! אֲנִי הַנַּהָג שֶׁל גֶּט, אֲנִי לְמַטָּה בָּרְחוֹב. אֵיפֹה אַתָּה?',
      transcription: 'hалó? шалóм! анӣ hа-наháг шэль гет, анӣ лэмáта ба-рэхóв. э́йфо атá?',
      translation: 'Алло? Привет! Я водитель из Gett, я внизу на улице. Ты где?',
    },
    goals: [
      'Сказать, что вы спускаетесь (אֲנִי יוֹרֵד עַכְשָׁו)',
      'Уточнить цвет или номер машины',
      'Попросить подождать 2 минуты',
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
    systemPromptAddition: 'Ты израильский водитель такси Эли. Говори просто, используй живой тон (רגע, אין בעיה, מחכה לך).',
  },

  // Урок 15: Аренда квартиры
  15: {
    callerName: 'בַּעַל הַדִּירָה',
    callerNameRu: 'Хозяин квартиры (Ави)',
    callerRole: 'Арендодатель в Тель-Авиве',
    avatarEmoji: '🔑',
    situationSummary: 'Вы звоните по объявлению об аренде 2-комнатной квартиры.',
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
    systemPromptAddition: 'Ты хозяин квартиры Ави. Скажи, что аренда 5500 шекелей, есть мазган и балкон. Предложи встретиться сегодня вечером.',
  },

  // Урок 25: Курьер Wolt
  25: {
    callerName: 'שָׁלִיחַ וְוֹלְט (Wolt)',
    callerNameRu: 'Курьер Wolt (Рон)',
    callerRole: 'Курьер с доставкой еды',
    avatarEmoji: '🛵',
    situationSummary: 'Вам звонит курьер Wolt, который привез ваш заказ, но не может войти в подъезд.',
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
    systemPromptAddition: 'Ты спешащий, но вежливый курьер Wolt Рон. Уточни этаж и скажи, что поднимаешься на лифте.',
  },

  // Урок 40: Запись к врачу (Купат Холим)
  40: {
    callerName: 'מוֹקֵד קֻפַּת חוֹלִים',
    callerNameRu: 'Поликлиника (Макаби / Клалит)',
    callerRole: 'Секретарь в регистратуре',
    avatarEmoji: '🏥',
    situationSummary: 'Вы звоните в медицинскую кассу, чтобы записаться на прием к семейному врачу.',
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
 * Получить или динамически сгенерировать телефонный сценарий для любого урока
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

  // 3. Автоматический генератор на основе темы урока и диалога
  const dial = lesson.dialogue;
  const initialHeb = isFemale
    ? dial.initialMessage.hebrew.replace(/לְךָ/g, 'לָךְ').replace(/תִּרְצֶה/g, 'תִּרְצִי')
    : dial.initialMessage.hebrew.replace(/לָךְ/g, 'לְךָ').replace(/תִּרְצִי/g, 'תִּרְצֶה');

  const initialTr = isFemale
    ? dial.initialMessage.transcription.replace(/лэхá/g, 'лах').replace(/тирцé/g, 'тирцӣ')
    : dial.initialMessage.transcription.replace(/лах/g, 'лэхá').replace(/тирцӣ/g, 'тирцé');

  const dynamicUsefulWords: PhoneScenarioWord[] = (lesson.vocabulary || []).slice(0, 7).map((w) => ({
    hebrew: w.hebrew,
    transcription: w.transcription || '',
    translation: w.translation,
  }));

  // Добавляем стандартные разговорные формулы для звонка, если их нет
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

  return {
    callerName: dial.aiRole || `חָבֵר (Урок ${lesson.number})`,
    callerNameRu: dial.aiRole || `Собеседник (Урок ${lesson.number})`,
    callerRole: dial.aiRole || 'Израильский знакомый / Собеседник',
    avatarEmoji: getEmojiForCategory(lesson.category),
    situationSummary: `Телефонный разговор по теме урока: «${lesson.titleRussian}». ${dial.situation}`,
    initialGreeting: {
      hebrew: `הַלּוֹ? שָׁלוֹם! ${initialHeb}`,
      transcription: `hалó? шалóм! ${initialTr}`,
      translation: `Алло? Привет! ${dial.initialMessage.translation}`,
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
        hebrew: isFemale ? 'הַלּוֹ, שָׁלוֹם! אֲנִי שׁוֹמַעַת אוֹתְךָ מְצוּיָן.' : 'הַלּוֹ, שָׁלוֹם! אֲנִי שׁוֹמֵעַ אוֹתְךָ מְצוּיָן.',
        transcription: isFemale ? 'hалó, шалóм! анӣ шомáат отхá мэцуйáн.' : 'hалó, шалóм! анӣ шомéа отхá мэцуйáн.',
        translation: isFemale ? 'Алло, привет! Я отлично тебя слышу (ж.р.).' : 'Алло, привет! Я отлично тебя слышу (м.р.).',
      },
      {
        hebrew: 'הַכֹּל בְּסֵדֶר, תּוֹדָה! מָה אִתְּךָ?',
        transcription: 'hакóль бэсэ́дер, тодá! ма итхá?',
        translation: 'Все в порядке, спасибо! Как ты?',
      },
    ],
    vocabularyHints: dial.vocabularyHints || (lesson.vocabulary || []).slice(0, 5).map(w => w.hebrew),
    usefulWords: dynamicUsefulWords,
    systemPromptAddition: `Это реалистичный телефонный звонок в Израиле. Ты ${dial.aiRole || 'израильский собеседник'}. Говори короткими телефонными репликами (1-2 предложения). Поддерживай живой диалог.`,
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
