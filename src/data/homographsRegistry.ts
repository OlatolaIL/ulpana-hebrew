/**
 * Реестр омографов современного иврита (Homographs Registry)
 * Слова с одинаковым написанием без огласовок, но разным произношением и значением.
 * Используется в WordLookupModal для детерминированного образовательного показа без вызова AI.
 */

export interface HomographVariant {
  hebrew: string;
  transcription: string;
  translation: string;
  partOfSpeech?: string;
  exampleSentence?: {
    hebrew: string;
    transcription: string;
    translation: string;
  };
}

export interface HomographEntry {
  clean: string;
  note?: string;
  variants: HomographVariant[];
}

export const HOMOGRAPHS_REGISTRY: Record<string, HomographEntry> = {
  'שם': {
    clean: 'שם',
    note: 'Без огласовок пишется одинаково (שם). Значение зависит от огласовок и контекста.',
    variants: [
      {
        hebrew: 'שָׁם',
        transcription: 'шам',
        translation: 'там, туда (наречие места)',
        partOfSpeech: 'adverb',
        exampleSentence: {
          hebrew: 'הֵם הָיוּ שָׁם אֶתְמוֹל.',
          transcription: 'hем hайý шам этмóль.',
          translation: 'Они были там вчера.',
        },
      },
      {
        hebrew: 'שֵׁם',
        transcription: 'шем',
        translation: 'имя, название (существительное м.р.)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'מָה הַשֵּׁם שֶׁלְּךָ?',
          transcription: 'ма hа-шем шелха́?',
          translation: 'Как тебя зовут (какое твоё имя)?',
        },
      },
    ],
  },
  'ספר': {
    clean: 'ספר',
    note: 'Без огласовок «ספר» может означать книгу, парикмахера или глагол «считать».',
    variants: [
      {
        hebrew: 'סֵפֶר',
        transcription: 'сéфер',
        translation: 'книга (существительное м.р., мн.ч. סְפָרִים)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'אֲנִי קוֹרֵא סֵפֶר מְעַנְיֵן.',
          transcription: 'ани корэ́ сéфер мэаньéн.',
          translation: 'Я читаю интересную книгу.',
        },
      },
      {
        hebrew: 'סַפָּר',
        transcription: 'сапáр',
        translation: 'парикмахер (существительное м.р.)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'הַסַּפָּר סִפֵּר אוֹתִי יָפֶה.',
          transcription: 'hа-сапáр сипéр отӣ яфэ́.',
          translation: 'Парикмахер красиво меня постриг.',
        },
      },
      {
        hebrew: 'סָפַר',
        transcription: 'сафáр',
        translation: 'считал, пересчитывал (глагол пааль, прош. вр.)',
        partOfSpeech: 'verb',
        exampleSentence: {
          hebrew: 'הוּא סָפַר אֶת הַכֶּסֶף.',
          transcription: 'hу сафáр эт hа-кéсеф.',
          translation: 'Он пересчитал деньги.',
        },
      },
    ],
  },
  'בקר': {
    clean: 'בקר',
    note: 'В современном כתיב מלא «утро» пишется בוקר, но без огласовок часто встречается בקר.',
    variants: [
      {
        hebrew: 'בֹּקֶר',
        transcription: 'бóкер',
        translation: 'утро (существительное м.р., в כתיב מלא: בּוֹקֶר)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'בֹּקֶר טוֹב!',
          transcription: 'бóкер тов!',
          translation: 'Доброе утро!',
        },
      },
      {
        hebrew: 'בָּקָר',
        transcription: 'бакáр',
        translation: 'говядина / крупный рогатый скот (בְּשַׂר בָּקָר)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'בְּשַׂר בָּקָר טָרִי.',
          transcription: 'бс́ар бакáр тарӣ.',
          translation: 'Свежая говядина.',
        },
      },
      {
        hebrew: 'בִּקֵּר',
        transcription: 'бикéр',
        translation: 'навещал, посещал / критиковал (глагол пиэль, в כתיב מלא: ביקר)',
        partOfSpeech: 'verb',
        exampleSentence: {
          hebrew: 'הוּא בִּקֵּר אֶת הַמִּשְׁפָּחָה.',
          transcription: 'hу бикéр эт hа-мишпахá.',
          translation: 'Он навестил семью.',
        },
      },
    ],
  },
  'מרשם': {
    clean: 'מרשם',
    note: 'Может быть медицинским рецептом или глаголом «записывает» с предлогом.',
    variants: [
      {
        hebrew: 'מִרְשָׁם',
        transcription: 'миршáм',
        translation: 'рецепт от врача (существительное м.р.)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'הָרוֹפֵא נָתַן לִי מִרְשָׁם לִתְרוּפָה.',
          transcription: 'hа-рофэ́ натáн ли миршáм ли-труфá.',
          translation: 'Врач дал мне рецепт на лекарство.',
        },
      },
      {
        hebrew: 'רוֹשֵׁם',
        transcription: 'рошéм',
        translation: 'записывает, делает заметку / выписывает (глагол пааль)',
        partOfSpeech: 'verb',
        exampleSentence: {
          hebrew: 'הוּא רוֹשֵׁם אֶת הַכְּתֹבֶת.',
          transcription: 'hу рошéм эт hа-ктóвет.',
          translation: 'Он записывает адрес.',
        },
      },
    ],
  },
  'שבר': {
    clean: 'שבר',
    note: 'Может быть существительным «перелом/обломок» или глаголом «сломал».',
    variants: [
      {
        hebrew: 'שֶׁבֶר',
        transcription: 'шéвер',
        translation: 'перелом, трещина, обломок / дробь (существительное м.р.)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'יֵשׁ לוֹ שֶׁבֶר בַּיָּד.',
          transcription: 'йеш ло шéвер ба-яд.',
          translation: 'У него перелом руки.',
        },
      },
      {
        hebrew: 'שָׁבַר',
        transcription: 'шавáр',
        translation: 'сломал, разбил (глагол пааль, прош. вр.)',
        partOfSpeech: 'verb',
        exampleSentence: {
          hebrew: 'הוּא שָׁבַר אֶת הַכּוֹס.',
          transcription: 'hу шавáр эт hа-кос.',
          translation: 'Он разбил стакан.',
        },
      },
    ],
  },
  'מסרק': {
    clean: 'מסרק',
    note: 'Существительное «расчёска» (מַסְרֵק) или глагол «причёсывает» (מְסָרֵק).',
    variants: [
      {
        hebrew: 'מַסְרֵק',
        transcription: 'масрéк',
        translation: 'расчёска, гребень (существительное м.р.)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'אֵיפֹה הַמַּסְרֵק שֶׁלִּי?',
          transcription: 'э́йфо hа-масрéк шелӣ?',
          translation: 'Где моя расчёска?',
        },
      },
      {
        hebrew: 'מְסָרֵק',
        transcription: 'мэсарéк',
        translation: 'расчёсывает, причёсывает (глагол пиэль, наст. вр.)',
        partOfSpeech: 'verb',
        exampleSentence: {
          hebrew: 'הָאַבָּא מְסָרֵק אֶת הַיַּלְדָּה.',
          transcription: 'hа-áба мэсарéк эт hа-яльдá.',
          translation: 'Папа причёсывает девочку.',
        },
      },
    ],
  },
  'פרח': {
    clean: 'פרח',
    note: 'Существительное «цветок» (פֶּרַח) или глагол «цвёл / расцветал» (פָּרַח).',
    variants: [
      {
        hebrew: 'פֶּרַח',
        transcription: 'пéрах',
        translation: 'цветок (существительное м.р., мн.ч. פְּרָחִים)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'קָנִיתִי פֶּרַח יָפֶה.',
          transcription: 'канӣти пéрах яфэ́.',
          translation: 'Я купил красивый цветок.',
        },
      },
      {
        hebrew: 'פָּרַח',
        transcription: 'парáх',
        translation: 'цвёл, расцветал / улетучился (глагол пааль, прош. вр.)',
        partOfSpeech: 'verb',
        exampleSentence: {
          hebrew: 'הָעֵץ פָּרַח בָּאָבִיב.',
          transcription: 'hа-эц парáх ба-авӣв.',
          translation: 'Дерево цвело весной.',
        },
      },
    ],
  },
  'דלת': {
    clean: 'דלת',
    note: 'Существительное «дверь» (דֶּלֶת) или название буквы «Далет» (דָּלֶת).',
    variants: [
      {
        hebrew: 'דֶּלֶת',
        transcription: 'дéлет',
        translation: 'дверь (существительное ж.р., мн.ч. דְּלָתוֹת)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'תִּסְגֹּר אֶת הַדֶּלֶת בְּבַקָּשָׁה.',
          transcription: 'тизгóр эт hа-дéлет бэвакашá.',
          translation: 'Закрой дверь, пожалуйста.',
        },
      },
      {
        hebrew: 'דָּלֶת',
        transcription: 'дáлет',
        translation: 'буква Далет (четвёртая буква алфавита иврита)',
        partOfSpeech: 'noun',
      },
    ],
  },
  'מלח': {
    clean: 'מלח',
    note: 'Существительное «соль» (מֶלַח) или «моряк, матрос» (מַלָּח).',
    variants: [
      {
        hebrew: 'מֶלַח',
        transcription: 'мéлах',
        translation: 'соль (существительное м.р.)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'אֶפְשָׁר מֶלַח בְּבַקָּשָׁה?',
          transcription: 'эфшáр мéлах бэвакашá?',
          translation: 'Можно соль, пожалуйста?',
        },
      },
      {
        hebrew: 'מַלָּח',
        transcription: 'малáх',
        translation: 'моряк, матрос (существительное м.р.)',
        partOfSpeech: 'noun',
        exampleSentence: {
          hebrew: 'הַמַּלָּח עָלָה עַל הָאֳנִיָּה.',
          transcription: 'hа-малáх алá аль hа-онийá.',
          translation: 'Моряк поднялся на корабль.',
        },
      },
    ],
  },
  'כבד': {
    clean: 'כבד',
    note: 'Прилагательное «тяжёлый» / существительное «печень» или глагол «уважал».',
    variants: [
      {
        hebrew: 'כָּבֵד',
        transcription: 'кавéд',
        translation: 'тяжёлый (прил.) / печень (сущ. ж.р.)',
        partOfSpeech: 'adjective',
        exampleSentence: {
          hebrew: 'הַתִּיק הַזֶּה כָּבֵד מְאוֹד.',
          transcription: 'hа-тик hа-зэ кавéд мэóд.',
          translation: 'Эта сумка очень тяжёлая.',
        },
      },
      {
        hebrew: 'כִּבֵּד',
        transcription: 'кибéд',
        translation: 'уважал, почитал / угощал (глагол пиэль, в כתיב מלא: כיבד)',
        partOfSpeech: 'verb',
        exampleSentence: {
          hebrew: 'הוּא כִּבֵּד אֶת הָהוֹרִים שֶׁלּוֹ.',
          transcription: 'hу кибéд эт hа-hорӣм шелó.',
          translation: 'Он уважал своих родителей.',
        },
      },
    ],
  },
};

/**
 * Получить информацию об омографе по чистому слову (без огласовок)
 */
export function findHomographEntry(cleanWord: string): HomographEntry | null {
  if (!cleanWord) return null;
  const clean = cleanWord.trim().toLowerCase();
  return HOMOGRAPHS_REGISTRY[clean] || null;
}
