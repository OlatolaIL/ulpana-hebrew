import {
  ScriptedDialogue,
  ScriptedDialogueTurn,
  GenderVariant,
  DialogueParticipant,
  Lesson,
} from '@/types';
import { DETAILED_LESSONS, getLessonById } from './lessonsData';
import { stripNikkud } from '@/lib/transcription';

/**
 * Получение варианта реплики в зависимости от пола говорящего и слушающего:
 * speakerGender: пол того, кто произносит реплику ('male' | 'female')
 * listenerGender: пол того, к кому обращаются ('male' | 'female')
 */
export function getDialogueTurnVariant(
  turn: ScriptedDialogueTurn,
  speakerGender: 'male' | 'female',
  listenerGender: 'male' | 'female'
): GenderVariant {
  const key = `${speakerGender === 'male' ? 'm' : 'f'}${listenerGender === 'male' ? 'm' : 'f'}` as 'mm' | 'mf' | 'fm' | 'ff';
  return turn.variants[key] || turn.variants.mm;
}

/**
 * Вспомогательная функция сборки реплики с автогенерацией вариантов
 */
function makeTurn(
  id: string,
  speaker: 'a' | 'b',
  intentRu: string,
  defaultVariant: GenderVariant,
  customVariants?: Partial<{
    mm: GenderVariant;
    mf: GenderVariant;
    fm: GenderVariant;
    ff: GenderVariant;
  }>,
  acceptableKeywords?: string[],
  sampleVariations?: string[]
): ScriptedDialogueTurn {
  const mm = customVariants?.mm || defaultVariant;
  const mf = customVariants?.mf || mm;
  const fm = customVariants?.fm || defaultVariant;
  const ff = customVariants?.ff || customVariants?.fm || mf;

  return {
    id,
    speaker,
    intentRu,
    acceptableKeywords: acceptableKeywords || [],
    sampleVariations: sampleVariations || [],
    variants: { mm, mf, fm, ff },
  };
}

/**
 * Детально проработанные авторские диалоги для ключевых тем Ульпана
 */
const HANDCRAFTED_DIALOGUES: Record<number, ScriptedDialogue> = {
  // Урок 1: Знакомство в ульпане
  1: {
    id: 'dialogue_1',
    lessonId: 1,
    titleRu: 'Первое знакомство в ульпане',
    titleHe: 'הֶיכֵּרוּת רִאשׁוֹנָה בָּאוּלְפָּן',
    situationRu: 'Вы пришли в ульпан в первый день занятий и знакомитесь с соседом по парте.',
    speakerA: {
      male: {
        nameRu: 'Ноам',
        nameHe: 'נוֹעַם',
        roleRu: 'Студент ульпана',
        roleHe: 'תַּלְמִיד בָּאוּלְפָּן',
        avatarEmoji: '👨‍🎓',
        gender: 'male',
      },
      female: {
        nameRu: 'Ноа',
        nameHe: 'נוֹעָה',
        roleRu: 'Студентка ульпана',
        roleHe: 'תַּלְמִידָה בָּאוּלְפָּן',
        avatarEmoji: '👩‍🎓',
        gender: 'female',
      },
    },
    speakerB: {
      male: {
        nameRu: 'Даниэль',
        nameHe: 'דָּנִיאֵל',
        roleRu: 'Новый студент',
        roleHe: 'תַּלְמִיד חָדָשׁ',
        avatarEmoji: '🙋‍♂️',
        gender: 'male',
      },
      female: {
        nameRu: 'Даниэла',
        nameHe: 'דָּנִיאֵלָה',
        roleRu: 'Новая студентка',
        roleHe: 'תַּלְמִידָה חֲדָשָׁה',
        avatarEmoji: '🙋‍♀️',
        gender: 'female',
      },
    },
    turns: [
      makeTurn(
        't1-1',
        'a',
        'Поздороваться и спросить, как зовут собеседника',
        {
          hebrew: 'שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי נוֹעַם. אֵיךְ קוֹרְאִים לְךָ?',
          transcription: 'шалóм! бóкер тов. анӣ Нóам. эйх коръӣм лэхá?',
          translation: 'Привет! Доброе утро. Я Ноам. Как тебя зовут?',
        },
        {
          mm: {
            hebrew: 'שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי נוֹעַם. אֵיךְ קוֹרְאִים לְךָ?',
            transcription: 'шалóм! бóкер тов. анӣ Нóам. эйх коръӣм лэхá?',
            translation: 'Привет! Доброе утро. Я Ноам. Как тебя зовут? (к мужчине)',
          },
          mf: {
            hebrew: 'שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי נוֹעַם. אֵיךְ קוֹרְאִים לָךְ?',
            transcription: 'шалóм! бóкер тов. анӣ Нóам. эйх коръӣм лах?',
            translation: 'Привет! Доброе утро. Я Ноам. Как тебя зовут? (к женщине)',
          },
          fm: {
            hebrew: 'שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי נוֹעָה. אֵיךְ קוֹרְאִים לְךָ?',
            transcription: 'шалóм! бóкер тов. анӣ Нóа. эйх коръӣм лэхá?',
            translation: 'Привет! Доброе утро. Я Ноа. Как тебя зовут? (к мужчине)',
          },
          ff: {
            hebrew: 'שָׁלוֹם! בּוֹקֶר טוֹב. אֲנִי נוֹעָה. אֵיךְ קוֹרְאִים לָךְ?',
            transcription: 'шалóм! бóкер тов. анӣ Нóа. эйх коръӣм лах?',
            translation: 'Привет! Доброе утро. Я Ноа. Как тебя зовут? (к женщине)',
          },
        },
        ['שלום', 'בוקר טוב', 'קוראים', 'איך'],
        ['שלום', 'מה שמך', 'בוקר טוב']
      ),
      makeTurn(
        't1-2',
        'b',
        'Поздороваться в ответ, сказать «Очень приятно» и назвать свое имя',
        {
          hebrew: 'שָׁלוֹם, בּוֹקֶר טוֹב! נָעִים מְאוֹד, קוֹרְאִים לִי דָּנִיאֵל.',
          transcription: 'шалóм, бóкер тов! наӣм мэóд, коръӣм ли Даниэ́ль.',
          translation: 'Привет, доброе утро! Очень приятно, меня зовут Даниэль.',
        },
        {
          mm: {
            hebrew: 'שָׁלוֹם, בּוֹקֶר טוֹב! נָעִים מְאוֹד, קוֹרְאִים לִי דָּנִיאֵל.',
            transcription: 'шалóм, бóкер тов! наӣм мэóд, коръӣм ли Даниэ́ль.',
            translation: 'Привет, доброе утро! Очень приятно, меня зовут Даниэль.',
          },
          mf: {
            hebrew: 'שָׁלוֹם, בּוֹקֶר טוֹב! נָעִים מְאוֹד, קוֹרְאִים לִי דָּנִיאֵל.',
            transcription: 'шалóм, бóкер тов! наӣм мэóд, коръӣм ли Даниэ́ль.',
            translation: 'Привет, доброе утро! Очень приятно, меня зовут Даниэль.',
          },
          fm: {
            hebrew: 'שָׁלוֹם, בּוֹקֶר טוֹב! נָעִים מְאוֹד, קוֹרְאִים לִי דָּנִיאֵלָה.',
            transcription: 'шалóм, бóкер тов! наӣм мэóд, коръӣм ли Даниэ́ла.',
            translation: 'Привет, доброе утро! Очень приятно, меня зовут Даниэла.',
          },
          ff: {
            hebrew: 'שָׁלוֹם, בּוֹקֶר טוֹב! נָעִים מְאוֹד, קוֹרְאִים לִי דָּנִיאֵלָה.',
            transcription: 'шалóм, бóкер тов! наӣм мэóд, коръӣм ли Даниэ́ла.',
            translation: 'Привет, доброе утро! Очень приятно, меня зовут Даниэла.',
          },
        },
        ['שלום', 'נעים מאוד', 'קוראים לי', 'אני'],
        ['נעים מאוד אני דניאל', 'שלום קוראים לי דניאל', 'אני דניאל נעים מאוד']
      ),
      makeTurn(
        't1-3',
        'a',
        'Сказать «Очень приятно» и спросить, как дела',
        {
          hebrew: 'נָעִים מְאוֹד! מָה נִשְׁמַע?',
          transcription: 'наӣм мэóд! ма нишмá?',
          translation: 'Очень приятно! Как дела?',
        },
        {
          mm: {
            hebrew: 'נָעִים מְאוֹד! מָה נִשְׁמַע?',
            transcription: 'наӣм мэóд! ма нишмá?',
            translation: 'Очень приятно! Как дела?',
          },
          mf: {
            hebrew: 'נָעִים מְאוֹד! מָה נִשְׁמַע?',
            transcription: 'наӣм мэóд! ма нишмá?',
            translation: 'Очень приятно! Как дела?',
          },
          fm: {
            hebrew: 'נָעִים מְאוֹד! מָה נִשְׁמַע?',
            transcription: 'наӣм мэóд! ма нишмá?',
            translation: 'Очень приятно! Как дела?',
          },
          ff: {
            hebrew: 'נָעִים מְאוֹד! מָה נִשְׁמַע?',
            transcription: 'наӣм мэóд! ма нишмá?',
            translation: 'Очень приятно! Как дела?',
          },
        },
        ['נעים מאוד', 'מה נשמע', 'מה קורה'],
        ['יופי מה נשמע', 'מה קורה הכל טוב']
      ),
      makeTurn(
        't1-4',
        'b',
        'Ответить, что все в порядке, поблагодарить и спросить в ответ',
        {
          hebrew: 'הַכֹּל בְּסֵדֶר, תּוֹדָה! וּמָה אִתְּךָ?',
          transcription: 'hакóль бэсэ́дер, тодá! у-ма итхá?',
          translation: 'Все в порядке, спасибо! А как у тебя?',
        },
        {
          mm: {
            hebrew: 'הַכֹּל בְּסֵדֶר, תּוֹדָה! וּמָה אִתְּךָ?',
            transcription: 'hакóль бэсэ́дер, тодá! у-ма итхá?',
            translation: 'Все в порядке, спасибо! А как у тебя? (к мужчине)',
          },
          mf: {
            hebrew: 'הַכֹּל בְּסֵדֶר, תּוֹדָה! וּמָה אִתָּךְ?',
            transcription: 'hакóль бэсэ́дер, тодá! у-ма итáх?',
            translation: 'Все в порядке, спасибо! А как у тебя? (к женщине)',
          },
          fm: {
            hebrew: 'הַכֹּל בְּסֵדֶר, תּוֹדָה! וּמָה אִתְּךָ?',
            transcription: 'hакóль бэсэ́дер, тодá! у-ма итхá?',
            translation: 'Все в порядке, спасибо! А как у тебя? (к мужчине)',
          },
          ff: {
            hebrew: 'הַכֹּל בְּסֵדֶר, תּוֹדָה! וּמָה אִתָּךְ?',
            transcription: 'hакóль бэсэ́дер, тодá! у-ма итáх?',
            translation: 'Все в порядке, спасибо! А как у тебя? (к женщине)',
          },
        },
        ['הכל בסדר', 'הכל טוב', 'תודה', 'מה איתך'],
        ['בסדר גמור תודה', 'הכל טוב תודה רבה', 'מצוין תודה']
      ),
      makeTurn(
        't1-5',
        'a',
        'Ответить, что тоже отлично, и пожелать хорошего дня',
        {
          hebrew: 'יוֹפִי! הַכֹּל טוֹב. שֶׁיִּהְיֶה יוֹם מְצוּיָן!',
          transcription: 'йóфи! hакóль тов. шэ-йиhйé йом мэцуйáн!',
          translation: 'Отлично! Все хорошо. Прекрасного дня!',
        },
        {
          mm: {
            hebrew: 'יוֹפִי! הַכֹּל טוֹב. שֶׁיִּהְיֶה יוֹם מְצוּיָן!',
            transcription: 'йóфи! hакóль тов. шэ-йиhйé йом мэцуйáн!',
            translation: 'Отлично! Все хорошо. Прекрасного дня!',
          },
          mf: {
            hebrew: 'יוֹפִי! הַכֹּל טוֹב. שֶׁיִּהְיֶה יוֹם מְצוּיָן!',
            transcription: 'йóфи! hакóль тов. шэ-йиhйé йом мэцуйáн!',
            translation: 'Отлично! Все хорошо. Прекрасного дня!',
          },
          fm: {
            hebrew: 'יוֹפִי! הַכֹּל טוֹב. שֶׁיִּהְיֶה יוֹם מְצוּיָן!',
            transcription: 'йóфи! hакóль тов. шэ-йиhйé йом мэцуйáн!',
            translation: 'Отлично! Все хорошо. Прекрасного дня!',
          },
          ff: {
            hebrew: 'יוֹפִי! הַכֹּל טוֹב. שֶׁיִּהְיֶה יוֹם מְצוּיָן!',
            transcription: 'йóфи! hакóль тов. шэ-йиhйé йом мэцуйáн!',
            translation: 'Отлично! Все хорошо. Прекрасного дня!',
          },
        },
        ['יופי', 'הכל טוב', 'יום מצוין'],
        ['הכל בסדר תודה', 'מצוין']
      ),
      makeTurn(
        't1-6',
        'b',
        'Поблагодарить и попрощаться',
        {
          hebrew: 'תּוֹדָה רַבָּה, לְהִתְרָאוֹת!',
          transcription: 'тодá рабá, лэhитраóт!',
          translation: 'Большое спасибо, до свидания!',
        },
        {
          mm: {
            hebrew: 'תּוֹדָה רַבָּה, לְהִתְרָאוֹת!',
            transcription: 'тодá рабá, лэhитраóт!',
            translation: 'Большое спасибо, до свидания!',
          },
          mf: {
            hebrew: 'תּוֹדָה רַבָּה, לְהִתְרָאוֹת!',
            transcription: 'тодá рабá, лэhитраóт!',
            translation: 'Большое спасибо, до свидания!',
          },
          fm: {
            hebrew: 'תּוֹדָה רַבָּה, לְהִתְרָאוֹת!',
            transcription: 'тодá рабá, лэhитраóт!',
            translation: 'Большое спасибо, до свидания!',
          },
          ff: {
            hebrew: 'תּוֹדָה רַבָּה, לְהִתְרָאוֹת!',
            transcription: 'тодá рабá, лэhитраóт!',
            translation: 'Большое спасибо, до свидания!',
          },
        },
        ['תודה', 'להתראות', 'שלום'],
        ['ביי להתראות', 'תודה להתראות']
      ),
    ],
  },

  // Урок 2: В кофейне
  2: {
    id: 'dialogue_2',
    lessonId: 2,
    titleRu: 'Заказ в тель-авивском кафе',
    titleHe: 'הַזְמָנָה בְּבֵית קָפֶה',
    situationRu: 'Вы пришли в кафе и делаете заказ у бариста.',
    speakerA: {
      male: {
        nameRu: 'Йоси',
        nameHe: 'יוֹסִי',
        roleRu: 'Официант / Бариста',
        roleHe: 'מֶלְצַר בַּקָּפֶה',
        avatarEmoji: '☕',
        gender: 'male',
      },
      female: {
        nameRu: 'Яэль',
        nameHe: 'יָעֵל',
        roleRu: 'Официантка / Бариста',
        roleHe: 'מֶלְצָרִית בַּקָּפֶה',
        avatarEmoji: '👩‍🍳',
        gender: 'female',
      },
    },
    speakerB: {
      male: {
        nameRu: 'Посетитель',
        nameHe: 'לָקוֹחַ',
        roleRu: 'Гость кафе',
        roleHe: 'אוֹרֵחַ בַּקָּפֶה',
        avatarEmoji: '🧔',
        gender: 'male',
      },
      female: {
        nameRu: 'Посетительница',
        nameHe: 'לְקוֹחָה',
        roleRu: 'Гостья кафе',
        roleHe: 'אוֹרַחַת בַּקָּפֶה',
        avatarEmoji: '👩',
        gender: 'female',
      },
    },
    turns: [
      makeTurn(
        't2-1',
        'a',
        'Поздороваться и спросить, что гость желает заказать',
        {
          hebrew: 'שָׁלוֹם! בָּרוּךְ הַבָּא. מָה תִּרְצֶה לִשְׁתּוֹת?',
          transcription: 'шалóм! барӯх hа-ба. ма тирцé лишто́т?',
          translation: 'Здравствуйте! Добро пожаловать. Что вы хотите выпить?',
        },
        {
          mm: {
            hebrew: 'שָׁלוֹם! בָּרוּךְ הַבָּא. מָה תִּרְצֶה לִשְׁתּוֹת?',
            transcription: 'шалóм! барӯх hа-ба. ма тирцé лишто́т?',
            translation: 'Здравствуйте! Добро пожаловать. Что вы хотите выпить? (к мужчине)',
          },
          mf: {
            hebrew: 'שָׁלוֹם! בְּרוּכָה הַבָּאָה. מָה תִּרְצִי לִשְׁתּוֹת?',
            transcription: 'шалóм! брухá hа-баá. ма тирцӣ лишто́т?',
            translation: 'Здравствуйте! Добро пожаловать. Что вы хотите выпить? (к женщине)',
          },
          fm: {
            hebrew: 'שָׁלוֹם! בָּרוּךְ הַבָּא. מָה תִּרְצֶה לִשְׁתּוֹת?',
            transcription: 'шалóм! барӯх hа-ба. ма тирцé лишто́т?',
            translation: 'Здравствуйте! Добро пожаловать. Что вы хотите выпить? (к мужчине)',
          },
          ff: {
            hebrew: 'שָׁלוֹם! בְּרוּכָה הַבָּאָה. מָה תִּרְצִי לִשְׁתּוֹת?',
            transcription: 'шалóм! брухá hа-баá. ма тирцӣ лишто́т?',
            translation: 'Здравствуйте! Добро пожаловать. Что вы хотите выпить? (к женщине)',
          },
        },
        ['שלום', 'שתות', 'מה תרצה', 'מה תרצי'],
        ['מה לשתות', 'שלום מה אפשר להביא לך']
      ),
      makeTurn(
        't2-2',
        'b',
        'Заказать кофе с молоком и вежливо сказать «пожалуйста»',
        {
          hebrew: 'שָׁלוֹם, אֲנִי רוֹצֶה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.',
          transcription: 'шалóм, анӣ роцé кафэ́ им халáв, бэвакашá.',
          translation: 'Здравствуйте, я хочу кофе с молоком, пожалуйста.',
        },
        {
          mm: {
            hebrew: 'שָׁלוֹם, אֲנִי רוֹצֶה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.',
            transcription: 'шалóм, анӣ роцé кафэ́ им халáв, бэвакашá.',
            translation: 'Здравствуйте, я хочу кофе с молоком, пожалуйста (мужчина).',
          },
          mf: {
            hebrew: 'שָׁלוֹם, אֲנִי רוֹצֶה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.',
            transcription: 'шалóм, анӣ роцé кафэ́ им халáв, бэвакашá.',
            translation: 'Здравствуйте, я хочу кофе с молоком, пожалуйста (мужчина).',
          },
          fm: {
            hebrew: 'שָׁלוֹם, אֲנִי רוֹצָה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.',
            transcription: 'шалóм, анӣ роцá кафэ́ им халáв, бэвакашá.',
            translation: 'Здравствуйте, я хочу кофе с молоком, пожалуйста (женщина).',
          },
          ff: {
            hebrew: 'שָׁלוֹם, אֲנִי רוֹצָה קָפֶה עִם חָלָב, בְּבַקָּשָׁה.',
            transcription: 'шалóм, анӣ роцá кафэ́ им халáв, бэвакашá.',
            translation: 'Здравствуйте, я хочу кофе с молоком, пожалуйста (женщина).',
          },
        },
        ['קפה', 'חלב', 'בבקשה', 'רוצה', 'אפשר'],
        ['אפשר קפה עם חלב בבקשה', 'קפה עם חלב בבקשה', 'אני רוצה קפה']
      ),
      makeTurn(
        't2-3',
        'a',
        'Спросить, хочет ли гость сахар или круассан к кофе',
        {
          hebrew: 'בְּשִׂמְחָה! עִם סוּכָּר? וְאַתָּה רוֹצֶה גַּם קְרוּאָסוֹן?',
          transcription: 'бэ-симхá! им сукáр? вэ-атá роцé гам круасóн?',
          translation: 'С удовольствием! С сахаром? И вы хотите круассан?',
        },
        {
          mm: {
            hebrew: 'בְּשִׂמְחָה! עִם סוּכָּר? וְאַתָּה רוֹצֶה גַּם קְרוּאָסוֹן?',
            transcription: 'бэ-симхá! им сукáр? вэ-атá роцé гам круасóн?',
            translation: 'С удовольствием! С сахаром? И вы хотите круассан? (к мужчине)',
          },
          mf: {
            hebrew: 'בְּשִׂמְחָה! עִם סוּכָּר? וְאַתְּ רוֹצָה גַּם קְרוּאָסוֹן?',
            transcription: 'бэ-симхá! им сукáр? вэ-ат роцá гам круасóн?',
            translation: 'С удовольствием! С сахаром? И вы хотите круассан? (к женщине)',
          },
          fm: {
            hebrew: 'בְּשִׂמְחָה! עִם סוּכָּר? וְאַתָּה רוֹצֶה גַּם קְרוּאָסוֹן?',
            transcription: 'бэ-симхá! им сукáр? вэ-атá роцé гам круасóн?',
            translation: 'С удовольствием! С сахаром? И вы хотите круассан? (к мужчине)',
          },
          ff: {
            hebrew: 'בְּשִׂמְחָה! עִם סוּכָּר? וְאַתְּ רוֹצָה גַּם קְרוּאָסוֹן?',
            transcription: 'бэ-симхá! им сукáр? вэ-ат роцá гам круасóн?',
            translation: 'С удовольствием! С сахаром? И вы хотите круассан? (к женщине)',
          },
        },
        ['סוכר', 'קרואסון', 'בשמחה', 'רוצה'],
        ['עם סוכר', 'רוצה עוגה']
      ),
      makeTurn(
        't2-4',
        'b',
        'Ответить, нужен ли сахар, и спросить счет',
        {
          hebrew: 'בְּלִי סוּכָּר, תּוֹדָה. וְאֶפְשָׁר חֶשְׁבּוֹן?',
          transcription: 'бли сукáр, тодá. вэ-эфшáр хэжбóн?',
          translation: 'Без сахара, спасибо. И можно счет?',
        },
        {
          mm: {
            hebrew: 'בְּלִי סוּכָּר, תּוֹדָה. וְאֶפְשָׁר חֶשְׁבּוֹן?',
            transcription: 'бли сукáр, тодá. вэ-эфшáр хэжбóн?',
            translation: 'Без сахара, спасибо. И можно счет?',
          },
          mf: {
            hebrew: 'בְּלִי סוּכָּר, תּוֹדָה. וְאֶפְשָׁר חֶשְׁבּוֹן?',
            transcription: 'бли сукáр, тодá. вэ-эфшáр хэжбóн?',
            translation: 'Без сахара, спасибо. И можно счет?',
          },
          fm: {
            hebrew: 'בְּלִי סוּכָּר, תּוֹדָה. וְאֶפְשָׁר חֶשְׁבּוֹן?',
            transcription: 'бли сукáр, тодá. вэ-эфшáр хэжбóн?',
            translation: 'Без сахара, спасибо. И можно счет?',
          },
          ff: {
            hebrew: 'בְּלִי סוּכָּר, תּוֹדָה. וְאֶפְשָׁר חֶשְׁבּוֹן?',
            transcription: 'бли сукáр, тодá. вэ-эфшáр хэжбóн?',
            translation: 'Без сахара, спасибо. И можно счет?',
          },
        },
        ['בלי סוכר', 'עם סוכר', 'חשבון', 'אפשר חשבון', 'כמה זה'],
        ['אפשר חשבון בבקשה', 'בלי סוכר כמה זה עולה', 'חשבון בבקשה']
      ),
      makeTurn(
        't2-5',
        'a',
        'Сказать стоимость заказа и пожелать приятного аппетита',
        {
          hebrew: 'בְּטֶח, זֶה עֶשְׂרִים שְׁקָלִים. בְּתֵאָבוֹן!',
          transcription: 'бэ́тах, зэ эсрӣм шкали́м. бэтэавóн!',
          translation: 'Конечно, с вас двадцать шекелей. Приятного аппетита!',
        },
        {
          mm: {
            hebrew: 'בְּטֶח, זֶה עֶשְׂרִים שְׁקָלִים. בְּתֵאָבוֹן!',
            transcription: 'бэ́тах, зэ эсрӣм шкали́м. бэтэавóн!',
            translation: 'Конечно, с вас двадцать шекелей. Приятного аппетита!',
          },
          mf: {
            hebrew: 'בְּטֶח, זֶה עֶשְׂרִים שְׁקָלִים. בְּתֵאָבוֹן!',
            transcription: 'бэ́тах, зэ эсрӣм шкали́м. бэтэавóн!',
            translation: 'Конечно, с вас двадцать шекелей. Приятного аппетита!',
          },
          fm: {
            hebrew: 'בְּטֶח, זֶה עֶשְׂרִים שְׁקָלִים. בְּתֵאָבוֹן!',
            transcription: 'бэ́тах, зэ эсрӣм шкали́м. бэтэавóн!',
            translation: 'Конечно, с вас двадцать шекелей. Приятного аппетита!',
          },
          ff: {
            hebrew: 'בְּטֶח, זֶה עֶשְׂרִים שְׁקָלִים. בְּתֵאָבוֹן!',
            transcription: 'бэ́тах, зэ эсрӣм шкали́м. бэтэавóн!',
            translation: 'Конечно, с вас двадцать шекелей. Приятного аппетита!',
          },
        },
        ['שקלים', 'בתיאבון', 'בטח'],
        ['בבקשה בתיאבון', 'הנה החשבון']
      ),
      makeTurn(
        't2-6',
        'b',
        'Поблагодарить официанта',
        {
          hebrew: 'תּוֹדָה רַבָּה! הַקָּפֶה מְעֻלֶּה.',
          transcription: 'тодá рабá! hа-кафэ́ мэулé.',
          translation: 'Большое спасибо! Кофе отличный.',
        },
        {
          mm: {
            hebrew: 'תּוֹדָה רַבָּה! הַקָּפֶה מְעֻלֶּה.',
            transcription: 'тодá рабá! hа-кафэ́ мэулé.',
            translation: 'Большое спасибо! Кофе отличный.',
          },
          mf: {
            hebrew: 'תּוֹדָה רַבָּה! הַקָּפֶה מְעֻלֶּה.',
            transcription: 'тодá рабá! hа-кафэ́ мэулé.',
            translation: 'Большое спасибо! Кофе отличный.',
          },
          fm: {
            hebrew: 'תּוֹדָה רַבָּה! הַקָּפֶה מְעֻלֶּה.',
            transcription: 'тодá рабá! hа-кафэ́ мэулé.',
            translation: 'Большое спасибо! Кофе отличный.',
          },
          ff: {
            hebrew: 'תּוֹדָה רַבָּה! הַקָּפֶה מְעֻלֶּה.',
            transcription: 'тодá рабá! hа-кафэ́ мэулé.',
            translation: 'Большое спасибо! Кофе отличный.',
          },
        },
        ['תודה', 'מעולה', 'יופי'],
        ['תודה רבה יום טוב', 'תודה']
      ),
    ],
  },
};

/**
 * Автоматический синтез грамматических вариантов по родам (mm, mf, fm, ff)
 * на базе текста и ключевых форм глаголов и местоимений
 */
function adaptSentenceForGenders(
  hebrew: string,
  transcription: string,
  translation: string
): {
  mm: GenderVariant;
  mf: GenderVariant;
  fm: GenderVariant;
  ff: GenderVariant;
} {
  const base = { hebrew, transcription, translation };

  // Если предложение содержит слэш «זָכָר / נְקֵבָה» (например "רוֹצֶה / רוֹצָה" или "עוֹלֶה / עוֹלָה")
  if (hebrew.includes('/')) {
    const partsHe = hebrew.split('/').map((s) => s.trim());
    const partsTr = transcription.split('/').map((s) => s.trim());
    const partsRu = translation.split('/').map((s) => s.trim());

    const mHe = partsHe[0] || hebrew;
    const fHe = partsHe[1] || partsHe[0] || hebrew;
    const mTr = partsTr[0] || transcription;
    const fTr = partsTr[1] || partsTr[0] || transcription;
    const mRu = partsRu[0] || translation;
    const fRu = partsRu[1] || partsRu[0] || translation;

    return {
      mm: { hebrew: mHe, transcription: mTr, translation: mRu },
      mf: { hebrew: mHe, transcription: mTr, translation: mRu },
      fm: { hebrew: fHe, transcription: fTr, translation: fRu },
      ff: { hebrew: fHe, transcription: fTr, translation: fRu },
    };
  }

  // Замены при обращении ко второму лицу (אַתָּה vs אַתְּ, לְךָ vs לָךְ)
  // Это зависит от пола слушающего (listenerGender: m vs f)
  const isSecondPersonQuestion =
    hebrew.includes('אַתָּה') ||
    hebrew.includes('אַתְּ') ||
    hebrew.includes('לְךָ') ||
    hebrew.includes('לָךְ') ||
    hebrew.includes('אִתְּךָ') ||
    hebrew.includes('אִתָּךְ') ||
    hebrew.includes('תִּרְצֶה') ||
    hebrew.includes('תִּרְצִי') ||
    hebrew.includes('שׁוֹתֶה') ||
    hebrew.includes('שׁוֹתָה') ||
    hebrew.includes('קוֹרְאִים לְךָ') ||
    hebrew.includes('קוֹרְאִים לָךְ');

  if (isSecondPersonQuestion) {
    const toFemaleHe = hebrew
      .replace(/לְךָ/g, 'לָךְ')
      .replace(/אַתָּה/g, 'אַתְּ')
      .replace(/אִתְּךָ/g, 'אִתָּךְ')
      .replace(/תִּרְצֶה/g, 'תִּרְצִי')
      .replace(/תַּעֲשֶׂה/g, 'תַּעֲשִׂי')
      .replace(/תֵּדַע/g, 'תֵּדְעִי')
      .replace(/תָּבוֹא/g, 'תָּבוֹאִי')
      .replace(/תַּגִּיד/g, 'תַּגִּידִי');

    const toFemaleTr = transcription
      .replace(/лэхá/g, 'лах')
      .replace(/атá/g, 'ат')
      .replace(/итхá/g, 'итáх')
      .replace(/тирцé/g, 'тирцӣ');

    const toFemaleRu = translation
      .replace(/\(к мужчине\)/g, '(к женщине)')
      .replace(/ты сам/g, 'ты сама')
      .replace(/ты готов\b/g, 'ты готова');

    return {
      mm: base,
      mf: { hebrew: toFemaleHe, transcription: toFemaleTr, translation: toFemaleRu },
      fm: base,
      ff: { hebrew: toFemaleHe, transcription: toFemaleTr, translation: toFemaleRu },
    };
  }

  // Замены при первом лице (говорящий говорит о себе: אֲנִי רוֹצֶה vs אֲנִי רוֹצָה, אֲנִי גָּר vs אֲנִי גָּרָה)
  // Это зависит от пола говорящего (speakerGender: m vs f)
  const isFirstPerson =
    hebrew.includes('אֲנִי') ||
    hebrew.includes('רוֹצֶה') ||
    hebrew.includes('מְדַבֵּר') ||
    hebrew.includes('גָּר ') ||
    hebrew.includes('עוֹבֵד') ||
    hebrew.includes('לוֹמֵד') ||
    hebrew.includes('יוֹדֵעַ') ||
    hebrew.includes('מַרְגִּישׁ');

  if (isFirstPerson) {
    const femaleSpeakerHe = hebrew
      .replace(/רוֹצֶה/g, 'רוֹצָה')
      .replace(/מְדַבֵּר/g, 'מְדַבֶּרֶת')
      .replace(/גָּר /g, 'גָּרָה ')
      .replace(/עוֹבֵד/g, 'עוֹבֶדֶת')
      .replace(/לוֹמֵד/g, 'לוֹמֶדֶת')
      .replace(/יוֹדֵעַ/g, 'יוֹדַעַת')
      .replace(/מַרְגִּישׁ/g, 'מַרְגִּישָׁה')
      .replace(/מֵבִין/g, 'מְבִינָה')
      .replace(/חוֹשֵׁב/g, 'חוֹשֶׁבֶת');

    const femaleSpeakerTr = transcription
      .replace(/роцé/g, 'роцá')
      .replace(/мэдабэ́р/g, 'мэдабэ́рэт')
      .replace(/гар /g, 'гарá ')
      .replace(/овэ́д/g, 'овэ́дэт')
      .replace(/ломэ́д/g, 'ломэ́дэт')
      .replace(/йодэ́а/g, 'йодáат')
      .replace(/маргӣш/g, 'маргишá');

    const femaleSpeakerRu = translation
      .replace(/\(мужчина\)/g, '(женщина)')
      .replace(/я готов\b/g, 'я готова')
      .replace(/я рад\b/g, 'я рада');

    return {
      mm: base,
      mf: base,
      fm: { hebrew: femaleSpeakerHe, transcription: femaleSpeakerTr, translation: femaleSpeakerRu },
      ff: { hebrew: femaleSpeakerHe, transcription: femaleSpeakerTr, translation: femaleSpeakerRu },
    };
  }

  // По умолчанию возвращаем исходную фразу для всех комбинаций
  return { mm: base, mf: base, fm: base, ff: base };
}

/**
 * Создает структурированный диалог для любого урока курса (1-100)
 * на базе его сценария, начальной фразы, базовых предложений и словаря.
 */
function createScriptedDialogueFromLesson(lesson: Lesson): ScriptedDialogue {
  const lessonId = lesson.id;
  const diag = lesson.dialogue;
  const sents = lesson.basicSentences || [];
  const vocab = lesson.vocabulary || [];

  // 1. Определение персонажей
  const aiRoleName = diag.aiRole || 'Собеседник';
  const userRoleName = diag.userRole || 'Ученик';

  const speakerAMale: DialogueParticipant = {
    nameRu: aiRoleName.split(' ')[0] || 'Собеседник',
    nameHe: 'דָּנִי',
    roleRu: aiRoleName,
    roleHe: 'בֶּן שִׂיחָה',
    avatarEmoji: '💬',
    gender: 'male',
  };

  const speakerAFemale: DialogueParticipant = {
    nameRu: aiRoleName.split(' ')[0] ? `${aiRoleName.split(' ')[0]} (ж.р.)` : 'Собеседница',
    nameHe: 'מִיכַל',
    roleRu: aiRoleName,
    roleHe: 'בַּת שִׂיחָה',
    avatarEmoji: '👩‍💼',
    gender: 'female',
  };

  const speakerBMale: DialogueParticipant = {
    nameRu: userRoleName,
    nameHe: 'תַּלְמִיד',
    roleRu: userRoleName,
    roleHe: 'תַּלְמִיד',
    avatarEmoji: '🙋‍♂️',
    gender: 'male',
  };

  const speakerBFemale: DialogueParticipant = {
    nameRu: `${userRoleName} (ж.р.)`,
    nameHe: 'תַּלְמִידָה',
    roleRu: userRoleName,
    roleHe: 'תַּלְמִידָה',
    avatarEmoji: '🙋‍♀️',
    gender: 'female',
  };

  // 2. Сборка реплик диалога
  const turns: ScriptedDialogueTurn[] = [];

  // Реплика 1 (Спикер А): Начальная реплика урока
  const initMsg = diag.initialMessage || {
    hebrew: sents[0]?.hebrew || 'שָׁלוֹם! מָה נִשְׁמַע?',
    transcription: sents[0]?.transcription || 'шалóм! ма нишмá?',
    translation: sents[0]?.translation || 'Привет! Как дела?',
  };

  const initVariants = adaptSentenceForGenders(
    initMsg.hebrew,
    initMsg.transcription,
    initMsg.translation
  );

  turns.push({
    id: `turn_${lessonId}_1`,
    speaker: 'a',
    intentRu: diag.situation || 'Поздороваться и начать разговор по теме урока',
    acceptableKeywords: diag.vocabularyHints || [stripNikkud(initMsg.hebrew).split(' ')[0]],
    sampleVariations: [initMsg.hebrew],
    variants: initVariants,
  });

  // Реплика 2 (Спикер Б / Ученик): Ответ по теме
  const s2 = sents[0] || sents[1] || {
    hebrew: 'שָׁלוֹם, נָעִים מְאוֹד! הַכֹּל בְּסֵדֶר.',
    transcription: 'шалóм, наӣм мэóд! hакóль бэсэ́дер.',
    translation: 'Привет, очень приятно! Все в порядке.',
  };
  const s2Variants = adaptSentenceForGenders(s2.hebrew, s2.transcription, s2.translation);

  turns.push({
    id: `turn_${lessonId}_2`,
    speaker: 'b',
    intentRu: diag.goals && diag.goals[0] ? diag.goals[0] : `Ответить собеседнику: ${s2.translation}`,
    acceptableKeywords: vocab.slice(0, 3).map((w) => stripNikkud(w.hebrew)),
    sampleVariations: [s2.hebrew],
    variants: s2Variants,
  });

  // Реплика 3 (Спикер А): Уточняющий вопрос собеседника
  const s3 = sents[1] || sents[2] || {
    hebrew: 'מְצֻיָּן! וּמָה אַתָּה רוֹצֶה לַעֲשׂוֹת עַכְשָׁו?',
    transcription: 'мэцуйáн! у-ма атá роцé лаасóт ахшáв?',
    translation: 'Отлично! А что вы хотите сделать сейчас?',
  };
  const s3Variants = adaptSentenceForGenders(s3.hebrew, s3.transcription, s3.translation);

  turns.push({
    id: `turn_${lessonId}_3`,
    speaker: 'a',
    intentRu: 'Задать вопрос или уточнить детали разговора',
    acceptableKeywords: [stripNikkud(s3.hebrew).split(' ')[0]],
    sampleVariations: [s3.hebrew],
    variants: s3Variants,
  });

  // Реплика 4 (Спикер Б / Ученик): Основное высказывание по теме урока
  const s4 = sents[2] || sents[3] || sents[0] || {
    hebrew: 'אֲנִי מְאֹד רוֹצֶה לְהַמְשִׁיךְ וּלְדַבֵּר עִבְרִית.',
    transcription: 'анӣ мэóд роцé лэhамшӣх у-лэдабэ́р иврӣт.',
    translation: 'Я очень хочу продолжить и говорить на иврите.',
  };
  const s4Variants = adaptSentenceForGenders(s4.hebrew, s4.transcription, s4.translation);

  turns.push({
    id: `turn_${lessonId}_4`,
    speaker: 'b',
    intentRu: diag.goals && diag.goals[1] ? diag.goals[1] : `Сформулировать ответ: ${s4.translation}`,
    acceptableKeywords: vocab.slice(3, 7).map((w) => stripNikkud(w.hebrew)),
    sampleVariations: [s4.hebrew],
    variants: s4Variants,
  });

  // Реплика 5 (Спикер А): Похвала и заключение собеседника
  const s5 = sents[3] || {
    hebrew: 'יוֹפִי! הַכֹּל מְצֻיָּן. שֶׁיִּהְיֶה יוֹם נִפְלָא!',
    transcription: 'йóфи! hакóль мэцуйáн. шэ-йиhйé йом нефлá!',
    translation: 'Отлично! Все замечательно. Прекрасного дня!',
  };
  const s5Variants = adaptSentenceForGenders(s5.hebrew, s5.transcription, s5.translation);

  turns.push({
    id: `turn_${lessonId}_5`,
    speaker: 'a',
    intentRu: 'Похвалить, согласиться и подвести итог беседы',
    acceptableKeywords: ['יופי', 'מצוין', 'טוב'],
    sampleVariations: [s5.hebrew],
    variants: s5Variants,
  });

  // Реплика 6 (Спикер Б / Ученик): Благодарность и прощание
  const s6Variants = {
    mm: {
      hebrew: 'תּוֹדָה רַבָּה לְךָ! לְהִתְרָאוֹת.',
      transcription: 'тодá рабá лэхá! лэhитраóт.',
      translation: 'Большое спасибо вам! До свидания.',
    },
    mf: {
      hebrew: 'תּוֹדָה רַבָּה לָךְ! לְהִתְרָאוֹת.',
      transcription: 'тодá рабá лах! лэhитраóт.',
      translation: 'Большое спасибо вам! До свидания (к женщине).',
    },
    fm: {
      hebrew: 'תּוֹדָה רַבָּה לְךָ! לְהִתְרָאוֹת.',
      transcription: 'тодá рабá лэхá! лэhитраóт.',
      translation: 'Большое спасибо вам! До свидания.',
    },
    ff: {
      hebrew: 'תּוֹדָה רַבָּה לָךְ! לְהִתְרָאוֹת.',
      transcription: 'тодá рабá лах! лэhитраóт.',
      translation: 'Большое спасибо вам! До свидания (к женщине).',
    },
  };

  turns.push({
    id: `turn_${lessonId}_6`,
    speaker: 'b',
    intentRu: 'Поблагодарить собеседника и вежливо попрощаться',
    acceptableKeywords: ['תודה', 'להתראות', 'שלום'],
    sampleVariations: ['תודה רבה להתראות', 'תודה ולהתראות'],
    variants: s6Variants,
  });

  return {
    id: `dialogue_${lessonId}`,
    lessonId,
    titleRu: diag.title || lesson.titleRussian,
    titleHe: lesson.titleHebrew,
    situationRu: diag.situation || lesson.description,
    speakerA: {
      male: speakerAMale,
      female: speakerAFemale,
    },
    speakerB: {
      male: speakerBMale,
      female: speakerBFemale,
    },
    turns,
  };
}

/**
 * Получение полного структурированного диалога для любого урока (1-100)
 */
export function getScriptedDialogueForLesson(lessonId: number): ScriptedDialogue {
  // 1. Проверяем наличие детального ручного сценария
  if (HANDCRAFTED_DIALOGUES[lessonId]) {
    return HANDCRAFTED_DIALOGUES[lessonId];
  }

  // 2. Получаем данные урока из каталога 100 уроков
  const lesson = getLessonById(lessonId) || DETAILED_LESSONS[lessonId];
  if (!lesson) {
    // Безопасный фолбэк на 1 урок, если номер выходит за пределы
    return HANDCRAFTED_DIALOGUES[1];
  }

  return createScriptedDialogueFromLesson(lesson);
}
