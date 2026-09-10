import { VerbConjugation } from '@/types';
import { stripNikkud } from '@/lib/transcription';

export const VERB_CONJUGATIONS_DATABASE: Record<string, VerbConjugation> = {
  'לרצות': {
    infinitive: {
      hebrew: 'לִרְצוֹת',
      transcription: 'лирцóт',
      translation: 'хотеть',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ר-צ-ה',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'רוֹצֶה', transcription: 'роцé', translation: 'хочет / хочу (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'רוֹצָה', transcription: 'роцá', translation: 'хочет / хочу (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'רוֹצִים', transcription: 'роцӣм', translation: 'хотят / хотим (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'רוֹצוֹת', transcription: 'роцóт', translation: 'хотят / хотим (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'רָצִיתִי', transcription: 'рацӣти', translation: 'я хотел(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'רָצִיתָ', transcription: 'рацӣта', translation: 'ты хотел' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'רָצִית', transcription: 'рацӣт', translation: 'ты хотела' },
      { pronoun: 'הוּא (он)', hebrew: 'רָצָה', transcription: 'рацá', translation: 'он хотел' },
      { pronoun: 'הִיא (она)', hebrew: 'רָצְתָה', transcription: 'рацтá', translation: 'она хотела' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'רָצִינוּ', transcription: 'рацӣну', translation: 'мы хотели' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'רְצִיתֶם / רְצִיתֶן', transcription: 'рцитéм / рцитéн', translation: 'вы хотели' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'רָצוּ', transcription: 'рацӯ', translation: 'они хотели' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶרְצֶה', transcription: 'эрцé', translation: 'я захочу / буду хотеть' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּרְצֶה', transcription: 'тирцé', translation: 'ты захочешь / она захочет' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּרְצִי', transcription: 'тирцӣ', translation: 'ты захочешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִרְצֶה', transcription: 'йирцé', translation: 'он захочет' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִרְצֶה', transcription: 'нирцé', translation: 'мы захотим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּרְצוּ', transcription: 'тирцӯ', translation: 'вы захотите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִרְצוּ', transcription: 'йирцӯ', translation: 'они захотят' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'רְצֵה', transcription: 'рцэ', translation: 'хоти / изволь (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'רְצִי', transcription: 'рцӣ', translation: 'хоти / изволь (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'רְצוּ', transcription: 'рцӯ', translation: 'хотите (мн.ч.)' },
    ],
  },
  'לשתות': {
    infinitive: {
      hebrew: 'לִשְׁתּוֹת',
      transcription: 'лишто́т',
      translation: 'пить',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ש-ת-ה',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'שׁוֹתֶה', transcription: 'шотé', translation: 'пьёт / пью (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'שׁוֹתָה', transcription: 'шотá', translation: 'пьёт / пью (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'שׁוֹתִים', transcription: 'шотӣм', translation: 'пьют / пьём (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'שׁוֹתוֹת', transcription: 'шотóт', translation: 'пьют / пьём (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'שָׁתִיתִי', transcription: 'шатӣти', translation: 'я пил(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'שָׁתִיתָ', transcription: 'шатӣта', translation: 'ты пил' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'שָׁתִית', transcription: 'шатӣт', translation: 'ты пила' },
      { pronoun: 'הוּא (он)', hebrew: 'שָׁתָה', transcription: 'шатá', translation: 'он пил' },
      { pronoun: 'הִיא (она)', hebrew: 'שָׁתְתָה', transcription: 'шатэтá', translation: 'она пила' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'שָׁתִינוּ', transcription: 'шатӣну', translation: 'мы пили' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'שְׁתִיתֶם / שְׁתִיתֶן', transcription: 'штитéм / штитéн', translation: 'вы пили' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'שָׁתוּ', transcription: 'шатӯ', translation: 'они пили' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶשְׁתֶּה', transcription: 'эштэ́', translation: 'я буду пить / выпью' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּשְׁתֶּה', transcription: 'тиштэ́', translation: 'ты выпьешь / она выпьет' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּשְׁתִּי', transcription: 'тиштӣ', translation: 'ты выпьешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִשְׁתֶּה', transcription: 'йиштэ́', translation: 'он выпьет' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִשְׁתֶּה', transcription: 'ништэ́', translation: 'мы выпьем' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּשְׁתּוּ', transcription: 'тиштӯ', translation: 'вы выпьете' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִשְׁתּוּ', transcription: 'йиштӯ', translation: 'они выпьют' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'שְׁתֵה', transcription: 'штэ', translation: 'пей (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'שְׁתִי', transcription: 'штӣ', translation: 'пей (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'שְׁתוּ', transcription: 'штӯ', translation: 'пейте' },
    ],
  },
  'לאכול': {
    infinitive: {
      hebrew: 'לֶאֱכֹל',
      transcription: 'лээхóль',
      translation: 'есть, кушать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'א-כ-ל',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'אוֹכֵל', transcription: 'охéль', translation: 'ест / ем (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'אוֹכֶלֶת', transcription: 'охéлет', translation: 'ест / ем (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'אוֹכְלִים', transcription: 'охлӣм', translation: 'едят / едим (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'אוֹכְלוֹת', transcription: 'охлóт', translation: 'едят / едим (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אָכַלְתִּי', transcription: 'ахáльти', translation: 'я ел(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'אָכַלְתָּ', transcription: 'ахáльта', translation: 'ты ел' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'אָכַלְתְּ', transcription: 'ахáльт', translation: 'ты ела' },
      { pronoun: 'הוּא (он)', hebrew: 'אָכַל', transcription: 'ахáль', translation: 'он ел' },
      { pronoun: 'הִיא (она)', hebrew: 'אָכְלָה', transcription: 'ахлá', translation: 'она ела' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'אָכַלְנוּ', transcription: 'ахáльну', translation: 'мы ели' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'אֲכַלְתֶּם / אֲכַלְתֶּן', transcription: 'ахальтéм / ахальтéн', translation: 'вы ели' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'אָכְלוּ', transcription: 'ахлӯ', translation: 'они ели' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֹכַל', transcription: 'охáль', translation: 'я буду есть / съем' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תֹּאכַל', transcription: 'тохáль', translation: 'ты съешь / она съест' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תֹּאכְלִי', transcription: 'тохлӣ', translation: 'ты съешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יֹאכַל', transcription: 'йохáль', translation: 'он съест' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נֹאכַל', transcription: 'нохáль', translation: 'мы съедим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תֹּאכְלוּ', transcription: 'тохлӯ', translation: 'вы съедите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יֹאכְלוּ', transcription: 'йохлӯ', translation: 'они съедят' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'אֱכֹל', transcription: 'эхóль', translation: 'ешь (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'אִכְלִי', transcription: 'ихлӣ', translation: 'ешь (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'אִכְלוּ', transcription: 'ихлӯ', translation: 'ешьте' },
    ],
  },
  'לדבר': {
    infinitive: {
      hebrew: 'לְדַבֵּר',
      transcription: 'лэдабéр',
      translation: 'говорить, разговаривать',
    },
    binyan: 'פִּעֵל (Пиэль)',
    root: 'ד-ב-ר',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְדַבֵּר', transcription: 'мэдабéр', translation: 'говорит / говорю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְדַבֶּרֶת', transcription: 'мэдабéрет', translation: 'говорит / говорю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְדַבְּרִים', transcription: 'мэдабрӣм', translation: 'говорят / говорим (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְדַבְּרוֹת', transcription: 'мэдабрóт', translation: 'говорят / говорим (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'דִּבַּרְתִּי', transcription: 'дибáрти', translation: 'я говорил(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'דִּבַּרְתָּ', transcription: 'дибáрта', translation: 'ты говорил' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'דִּבַּרְתְּ', transcription: 'дибáрт', translation: 'ты говорила' },
      { pronoun: 'הוּא (он)', hebrew: 'דִּבֵּר', transcription: 'дибéр', translation: 'он говорил' },
      { pronoun: 'הִיא (она)', hebrew: 'דִּבְּרָה', transcription: 'дибрá', translation: 'она говорила' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'דִּבַּרְנוּ', transcription: 'дибáрну', translation: 'мы говорили' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'דִּבַּרְתֶּם / דִּבַּרְתֶּן', transcription: 'дибартéм / дибартéн', translation: 'вы говорили' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'דִּבְּרוּ', transcription: 'дибрӯ', translation: 'они говорили' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֲדַבֵּר', transcription: 'адабéр', translation: 'я поговорю / буду говорить' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּדַבֵּר', transcription: 'тэдабéр', translation: 'ты поговоришь / она поговорит' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּדַבְּרִי', transcription: 'тэдабрӣ', translation: 'ты поговоришь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יְדַבֵּר', transcription: 'едабéр', translation: 'он поговорит' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְדַבֵּר', transcription: 'нэдабéр', translation: 'мы поговорим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּדַבְּרוּ', transcription: 'тэдабрӯ', translation: 'вы поговорите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְדַבְּרוּ', transcription: 'едабрӯ', translation: 'они договорят' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'דַּבֵּר', transcription: 'дабéр', translation: 'говори (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'דַּבְּרִי', transcription: 'дабрӣ', translation: 'говори (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'דַּבְּרוּ', transcription: 'дабрӯ', translation: 'говорите' },
    ],
  },
  'ללכת': {
    infinitive: {
      hebrew: 'לָלֶכֶת',
      transcription: 'лалéхет',
      translation: 'идти, ходить',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ה-ל-ך',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'הוֹלֵךְ', transcription: 'hолéх', translation: 'идёт / иду (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'הוֹלֶכֶת', transcription: 'hолéхет', translation: 'идёт / иду (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'הוֹלְכִים', transcription: 'hолхӣм', translation: 'идут / идём (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'הוֹלְכוֹת', transcription: 'hолхóт', translation: 'идут / идём (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'הָלַכְתִּי', transcription: 'hалáхти', translation: 'я шёл / шла' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הָלַכְתָּ', transcription: 'hалáхта', translation: 'ты шёл' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הָלַכְתְּ', transcription: 'hалáхт', translation: 'ты шла' },
      { pronoun: 'הוּא (он)', hebrew: 'הָלַךְ', transcription: 'hалáх', translation: 'он шёл' },
      { pronoun: 'הִיא (она)', hebrew: 'הָלְכָה', transcription: 'hалхá', translation: 'она шла' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הָלַכְנוּ', transcription: 'hалáхну', translation: 'мы шли' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הֲלַכְתֶּם / הֲלַכְתֶּן', transcription: 'hалахтéм / hалахтéн', translation: 'вы шли' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'הָלְכוּ', transcription: 'hалхӯ', translation: 'они шли' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֵלֵךְ', transcription: 'элéх', translation: 'я пойду' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תֵּלֵךְ', transcription: 'тэлéх', translation: 'ты пойдёшь / она пойдёт' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תֵּלְכִי', transcription: 'тэлхӣ', translation: 'ты пойдёшь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יֵלֵךְ', transcription: 'йелéх', translation: 'он пойдёт' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נֵלֵךְ', transcription: 'нэлéх', translation: 'мы пойдем' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תֵּלְכוּ', transcription: 'тэлхӯ', translation: 'вы пойдёте' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יֵלְכוּ', transcription: 'йелхӯ', translation: 'они пойдут' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'לֵךְ', transcription: 'лех', translation: 'иди (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'לְכִי', transcription: 'лэхӣ', translation: 'иди (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'לְכוּ', transcription: 'лэхӯ', translation: 'идите' },
    ],
  },
  'לכתוב': {
    infinitive: {
      hebrew: 'לִכְתֹּב',
      transcription: 'лихтóв',
      translation: 'писать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'כ-ת-ב',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'כּוֹתֵב', transcription: 'котéв', translation: 'пишет / пишу (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'כּוֹתֶבֶת', transcription: 'котéвет', translation: 'пишет / пишу (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'כּוֹתְבִים', transcription: 'котвӣм', translation: 'пишут / пишем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'כּוֹתְבוֹת', transcription: 'котвóт', translation: 'пишут / пишем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'כָּתַבְתִּי', transcription: 'катáвти', translation: 'я писал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'כָּתַבְתָּ', transcription: 'катáвта', translation: 'ты писал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'כָּתַבְתְּ', transcription: 'катáвт', translation: 'ты писала' },
      { pronoun: 'הוּא (он)', hebrew: 'כָּתַב', transcription: 'катáв', translation: 'он писал' },
      { pronoun: 'הִיא (она)', hebrew: 'כָּתְבָה', transcription: 'катвá', translation: 'она писала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'כָּתַבְנוּ', transcription: 'катáвну', translation: 'мы писали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'כְּתַבְתֶּם / כְּתַבְתֶּן', transcription: 'ктавтéм / ктавтéн', translation: 'вы писали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'כָּתְבוּ', transcription: 'катвӯ', translation: 'они писали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶכְתֹּב', transcription: 'эхтóв', translation: 'я напишу' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּכְתֹּב', transcription: 'тихтóв', translation: 'ты напишешь / она напишет' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּכְתְּבִי', transcription: 'тихтэвӣ', translation: 'ты напишешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִכְתֹּב', transcription: 'йихтóв', translation: 'он напишет' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִכְתֹּב', transcription: 'нихтóв', translation: 'мы напишем' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּכְתְּבוּ', transcription: 'тихтэвӯ', translation: 'вы напишете' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִכְתְּבוּ', transcription: 'йихтэвӯ', translation: 'они напишут' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'כְּתֹב', transcription: 'ктóв', translation: 'пиши (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'כִּתְבִי', transcription: 'китвӣ', translation: 'пиши (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'כִּתְבוּ', transcription: 'китвӯ', translation: 'пишите' },
    ],
  },
  'לקרוא': {
    infinitive: {
      hebrew: 'לִקְרֹא',
      transcription: 'ликрó',
      translation: 'читать, звать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ק-ר-א',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'קוֹרֵא', transcription: 'корé', translation: 'читает / читаю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'קוֹרֵאת', transcription: 'корéт', translation: 'читает / читаю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'קוֹרְאִים', transcription: 'коръӣм', translation: 'читают / читаем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'קוֹרְאוֹת', transcription: 'коръóт', translation: 'читают / читаем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'קָרָאתִי', transcription: 'карáти', translation: 'я читал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'קָרָאתָ', transcription: 'карáта', translation: 'ты читал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'קָרָאת', transcription: 'карáт', translation: 'ты читала' },
      { pronoun: 'הוּא (он)', hebrew: 'קָרָא', transcription: 'карá', translation: 'он читал' },
      { pronoun: 'הִיא (она)', hebrew: 'קָרְאָה', transcription: 'каръá', translation: 'она читала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'קָרָאנוּ', transcription: 'карáну', translation: 'мы читали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'קְרָאתֶם / קְרָאתֶן', transcription: 'кратéм / кратéн', translation: 'вы читали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'קָרְאוּ', transcription: 'каръӯ', translation: 'они читали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶקְרָא', transcription: 'экрэ́', translation: 'я прочитаю' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּקְרָא', transcription: 'тикрэ́', translation: 'ты прочитаешь / она прочитает' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּקְרְאִי', transcription: 'тикрыӣ', translation: 'ты прочитаешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִקְרָא', transcription: 'йикрэ́', translation: 'он прочитает' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִקְרָא', transcription: 'никрэ́', translation: 'мы прочитаем' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּקְרְאוּ', transcription: 'тикрыӯ', translation: 'вы прочитаете' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִקְרְאוּ', transcription: 'йикрыӯ', translation: 'они прочитают' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'קְרָא', transcription: 'кра', translation: 'читай (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'קִרְאִי', transcription: 'киръӣ', translation: 'читай (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'קִרְאוּ', transcription: 'киръӯ', translation: 'читайте' },
    ],
  },
  'לקבל': {
    infinitive: {
      hebrew: 'לְקַבֵּל',
      transcription: 'лэкабéль',
      translation: 'получать, принимать',
    },
    binyan: 'פִּעֵל (Пиэль)',
    root: 'ק-ב-ל',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְקַבֵּל', transcription: 'мэкабéль', translation: 'получает / получаю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְקַבֶּלֶת', transcription: 'мэкабéлет', translation: 'получает / получаю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְקַבְּלִים', transcription: 'мэкаблӣм', translation: 'получают / получаем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְקַבְּלוֹת', transcription: 'мэкаблóт', translation: 'получают / получаем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'קִבַּלְתִּי', transcription: 'кибáльти', translation: 'я получил(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'קִבַּלְתָּ', transcription: 'кибáльта', translation: 'ты получил' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'קִבַּלְתְּ', transcription: 'кибáльт', translation: 'ты получила' },
      { pronoun: 'הוּא (он)', hebrew: 'קִבֵּל', transcription: 'кибéль', translation: 'он получил' },
      { pronoun: 'הִיא (она)', hebrew: 'קִבְּלָה', transcription: 'киблá', translation: 'она получила' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'קִבַּלְנוּ', transcription: 'кибáльну', translation: 'мы получили' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'קִבַּלְתֶּם / קִבַּלְתֶּן', transcription: 'кибальтéм / кибальтéн', translation: 'вы получили' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'קִבְּלוּ', transcription: 'киблӯ', translation: 'они получили' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֲקַבֵּל', transcription: 'акабéль', translation: 'я получу' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּקַבֵּל', transcription: 'тэкабéль', translation: 'ты получишь / она получит' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּקַבְּלִי', transcription: 'тэкаблӣ', translation: 'ты получишь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יְקַבֵּל', transcription: 'екабéль', translation: 'он получит' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְקַבֵּל', transcription: 'нэкабéль', translation: 'мы получим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּקַבְּלוּ', transcription: 'тэкаблӯ', translation: 'вы получите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְקַבְּלוּ', transcription: 'екаблӯ', translation: 'они получат' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'קַבֵּל', transcription: 'кабéль', translation: 'прими / получи (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'קַבְּלִי', transcription: 'каблӣ', translation: 'прими / получи (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'קַבְּלוּ', transcription: 'каблӯ', translation: 'примите' },
    ],
  },
  'להרגיש': {
    infinitive: {
      hebrew: 'לְהַרְגִּישׁ',
      transcription: 'лэhаргӣш',
      translation: 'чувствовать',
    },
    binyan: 'הִפְעִיל (hифъиль)',
    root: 'ר-ג-שׁ',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַרְגִּישׁ', transcription: 'маргӣш', translation: 'чувствует / чувствую (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַרְגִּישָׁה', transcription: 'маргишá', translation: 'чувствует / чувствую (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַרְגִּישִׁים', transcription: 'маргишӣм', translation: 'чувствуют / чувствуем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַרְגִּישׁוֹת', transcription: 'маргишóт', translation: 'чувствуют / чувствуем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'הִרְגַּשְׁתִּי', transcription: 'hиргáшти', translation: 'я чувствовал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִרְגַּשְׁתָּ', transcription: 'hиргáшта', translation: 'ты чувствовал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִרְגַּשְׁתְּ', transcription: 'hиргáшт', translation: 'ты чувствовала' },
      { pronoun: 'הוּא (он)', hebrew: 'הִרְגִּישׁ', transcription: 'hиргӣш', translation: 'он чувствовал' },
      { pronoun: 'הִיא (она)', hebrew: 'הִרְגִּישָׁה', transcription: 'hиргишá', translation: 'она чувствовала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִרְגַּשְׁנוּ', transcription: 'hиргáшну', translation: 'мы чувствовали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִרְגַּשְׁתֶּם / הִרְגַּשְׁתֶּן', transcription: 'hиргаштéм / hиргаштéн', translation: 'вы чувствовали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִרְגִּישׁוּ', transcription: 'hиргишӯ', translation: 'они чувствовали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אַרְגִּישׁ', transcription: 'аргӣш', translation: 'я почувствую' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּרְגִּישׁ', transcription: 'таргӣш', translation: 'ты почувствуешь / она почувствует' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּרְגִּישִׁי', transcription: 'таргишӣ', translation: 'ты почувствуешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יַרְגִּישׁ', transcription: 'яргӣш', translation: 'он почувствует' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַרְגִּישׁ', transcription: 'наргӣш', translation: 'мы почувствуем' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּרְגִּישׁוּ', transcription: 'таргишӯ', translation: 'вы почувствуете' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַרְגִּישׁוּ', transcription: 'яргишӯ', translation: 'они почувствуют' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַרְגֵּשׁ', transcription: 'hаргéш', translation: 'чувствуй (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַרְגִּישִׁי', transcription: 'hаргишӣ', translation: 'чувствуй (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַרְגִּישׁוּ', transcription: 'hаргишӯ', translation: 'чувствуйте' },
    ],
  },
  'להזמין': {
    infinitive: {
      hebrew: 'לְהַזְמִין',
      transcription: 'лэhазмӣн',
      translation: 'заказывать, приглашать',
    },
    binyan: 'הִפְעִיל (hифъиль)',
    root: 'ז-מ-ן',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַזְמִין', transcription: 'мазмӣн', translation: 'заказывает / заказываю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַזְמִינָה', transcription: 'мазминá', translation: 'заказывает / заказываю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַזְמִינִים', transcription: 'мазминӣм', translation: 'заказывают / заказываем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַזְמִינוֹת', transcription: 'мазминóт', translation: 'заказывают / заказываем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'הִזְמַנְתִּי', transcription: 'hизмáнти', translation: 'я заказал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִזְמַנְתָּ', transcription: 'hизмáнта', translation: 'ты заказал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִזְמַנְתְּ', transcription: 'hизмáнт', translation: 'ты заказала' },
      { pronoun: 'הוּא (он)', hebrew: 'הִזְמִין', transcription: 'hизмӣн', translation: 'он заказал' },
      { pronoun: 'הִיא (она)', hebrew: 'הִזְמִינָה', transcription: 'hизминá', translation: 'она заказала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִזְמַנּוּ', transcription: 'hизмáну', translation: 'мы заказали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִזְמַנְתֶּם / הִזְמַנְתֶּן', transcription: 'hизмантéм / hизмантéн', translation: 'вы заказали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִזְמִינוּ', transcription: 'hизминӯ', translation: 'они заказали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אַזְמִין', transcription: 'азмӣн', translation: 'я закажу' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּזְמִין', transcription: 'тазмӣн', translation: 'ты закажешь / она закажет' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּזְמִינִי', transcription: 'тазминӣ', translation: 'ты закажешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יַזְמִין', transcription: 'язмӣн', translation: 'он закажет' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַזְמִין', transcription: 'назмӣн', translation: 'мы закажем' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּזְמִינוּ', transcription: 'тазминӯ', translation: 'вы закажете' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַזְמִינוּ', transcription: 'язминӯ', translation: 'они закажут' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַזְמֵן', transcription: 'hазмéн', translation: 'закажи (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַזְמִינִי', transcription: 'hазминӣ', translation: 'закажи (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַזְמִינוּ', transcription: 'hазминӯ', translation: 'закажите' },
    ],
  },
  'לדעת': {
    infinitive: {
      hebrew: 'לָדַעַת',
      transcription: 'ладáат',
      translation: 'знать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'י-ד-ע',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'יוֹדֵעַ', transcription: 'йодéа', translation: 'знает / знаю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'יוֹדַעַת', transcription: 'йодáат', translation: 'знает / знаю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'יוֹדְעִים', transcription: 'йодъӣм', translation: 'знают / знаем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'יוֹדְעוֹת', transcription: 'йодъóт', translation: 'знают / знаем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'יָדַעְתִּי', transcription: 'ядáти', translation: 'я знал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'יָדַעְתָּ', transcription: 'ядáта', translation: 'ты знал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'יָדַעְתְּ', transcription: 'ядáт', translation: 'ты знала' },
      { pronoun: 'הוּא (он)', hebrew: 'יָדַע', transcription: 'ядá', translation: 'он знал' },
      { pronoun: 'הִיא (она)', hebrew: 'יָדְעָה', transcription: 'ядъá', translation: 'она знала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'יָדַעְנוּ', transcription: 'ядáну', translation: 'мы знали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'יְדַעְתֶּם / יְדַעְתֶּן', transcription: 'эдаэтéм / эдаэтéн', translation: 'вы знали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יָדְעוּ', transcription: 'ядъӯ', translation: 'они знали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֵדַע', transcription: 'эдá', translation: 'я узнаю' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תֵּדַע', transcription: 'тэдá', translation: 'ты узнаешь / она узнает' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תֵּדְעִי', transcription: 'тэдъӣ', translation: 'ты узнаешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יֵדַע', transcription: 'йедá', translation: 'он узнает' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נֵדַע', transcription: 'нэдá', translation: 'мы узнаем' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תֵּדְעוּ', transcription: 'тэдъӯ', translation: 'вы узнаете' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יֵדְעוּ', transcription: 'йедъӯ', translation: 'они узнают' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'דַּע', transcription: 'да', translation: 'знай (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'דְּעִי', transcription: 'дэъӣ', translation: 'знай (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'דְּעוּ', transcription: 'дэъӯ', translation: 'знайте' },
    ],
  },
  'לגור': {
    infinitive: {
      hebrew: 'לָגוּר',
      transcription: 'лагӯр',
      translation: 'жить, проживать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ג-ו-ר',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'גָּר', transcription: 'гар', translation: 'живёт / живу (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'גָּרָה', transcription: 'гарá', translation: 'живёт / живу (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'גָּרִים', transcription: 'гарӣм', translation: 'живут / живём (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'גָּרוֹת', transcription: 'гарóт', translation: 'живут / живём (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'גַּרְתִּי', transcription: 'гáрти', translation: 'я жил(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'גַּרְתָּ', transcription: 'гáрта', translation: 'ты жил' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'גַּרְתְּ', transcription: 'гáрт', translation: 'ты жила' },
      { pronoun: 'הוּא (он)', hebrew: 'גָּר', transcription: 'гар', translation: 'он жил' },
      { pronoun: 'הִיא (она)', hebrew: 'גָּרָה', transcription: 'гарá', translation: 'она жила' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'גַּרְנוּ', transcription: 'гáрну', translation: 'мы жили' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'גַּרְתֶּם / גַּרְתֶּן', transcription: 'гартéм / гартéн', translation: 'вы жили' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'גָּרוּ', transcription: 'гарӯ', translation: 'они жили' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אָגוּר', transcription: 'агӯр', translation: 'я буду жить' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תָּגוּר', transcription: 'тагӯр', translation: 'ты будешь жить / она будет жить' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תָּגוּרִי', transcription: 'тагӯри', translation: 'ты будешь жить (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יָגוּר', transcription: 'ягӯр', translation: 'он будет жить' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נָגוּר', transcription: 'нагӯр', translation: 'мы будем жить' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תָּגוּרוּ', transcription: 'тагӯру', translation: 'вы будете жить' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יָגוּרוּ', transcription: 'ягӯру', translation: 'они будут жить' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'גּוּר', transcription: 'гур', translation: 'живи (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'גּוּרִי', transcription: 'гӯри', translation: 'живи (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'גּוּרוּ', transcription: 'гӯру', translation: 'живите' },
    ],
  },
  'לעבוד': {
    infinitive: {
      hebrew: 'לַעֲבֹד',
      transcription: 'лаавóд',
      translation: 'работать',
    },
    binyan: 'פָּعַל (Пааль)',
    root: 'ע-ב-ד',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'עוֹבֵד', transcription: 'овéд', translation: 'работает / работаю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'עוֹבֶדֶת', transcription: 'овéдет', translation: 'работает / работаю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'עוֹבְדִים', transcription: 'овдӣм', translation: 'работают / работаем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'עוֹבְדוֹת', transcription: 'овдóт', translation: 'работают / работаем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'עָבַדְתִּי', transcription: 'авáдти', translation: 'я работал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'עָבַדְתָּ', transcription: 'авáдта', translation: 'ты работал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'עָבַדְתְּ', transcription: 'авáдт', translation: 'ты работала' },
      { pronoun: 'הוּא (он)', hebrew: 'עָבַד', transcription: 'авáд', translation: 'он работал' },
      { pronoun: 'הִיא (она)', hebrew: 'עָבְדָה', transcription: 'авдá', translation: 'она работала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'עָבַדְנוּ', transcription: 'авáдну', translation: 'мы работали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'עֲבַדְתֶּם / עֲבַדְתֶּן', transcription: 'авадтéм / авадтéн', translation: 'вы работали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'עָבְדוּ', transcription: 'авдӯ', translation: 'они работали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶעֱבֹד', transcription: 'ээвóд', translation: 'я буду работать' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּעֲבֹד', transcription: 'таавóд', translation: 'ты будешь работать / она будет работать' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּעַבְדִי', transcription: 'таавдӣ', translation: 'ты будешь работать (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יַעֲבֹד', transcription: 'яавóд', translation: 'он будет работать' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַעֲבֹד', transcription: 'наавóд', translation: 'мы будем работать' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּעַבְדוּ', transcription: 'таавдӯ', translation: 'вы будете работать' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַעַבְדוּ', transcription: 'яавдӯ', translation: 'они будут работать' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'עֲבֹד', transcription: 'авóд', translation: 'работай (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'עִבְדִי', transcription: 'ивдӣ', translation: 'работай (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'עִבְדוּ', transcription: 'ивдӯ', translation: 'работайте' },
    ],
  },
  'ללמוד': {
    infinitive: {
      hebrew: 'לִלְמֹד',
      transcription: 'лильмóд',
      translation: 'учиться, изучать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ל-מ-ד',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'לוֹמֵד', transcription: 'ломéд', translation: 'учит / учусь (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'לוֹמֶדֶת', transcription: 'ломéдет', translation: 'учит / учусь (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'לוֹמְדִים', transcription: 'ломдӣм', translation: 'учат / учимся (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'לוֹמְדוֹת', transcription: 'ломдóт', translation: 'учат / учимся (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'לָמַדְתִּי', transcription: 'ламáдти', translation: 'я учил(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'לָמַדְתָּ', transcription: 'ламáдта', translation: 'ты учил' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'לָמַדְתְּ', transcription: 'ламáдт', translation: 'ты учила' },
      { pronoun: 'הוּא (он)', hebrew: 'לָמַד', transcription: 'ламáд', translation: 'он учил' },
      { pronoun: 'הִיא (она)', hebrew: 'לָמְדָה', transcription: 'ламдá', translation: 'она учила' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'לָמַדְנוּ', transcription: 'ламáдну', translation: 'мы учили' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'לְמַדְתֶּם / לְמַדְתֶּן', transcription: 'лемадтéм / лемадтéн', translation: 'вы учили' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'לָמְדוּ', transcription: 'ламдӯ', translation: 'они учили' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶלְמַד', transcription: 'эльмáд', translation: 'я буду учить / выучу' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּלְמַד', transcription: 'тильмáд', translation: 'ты будешь учить / она будет учить' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּלְמְדִי', transcription: 'тильмэдӣ', translation: 'ты будешь учить (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִלְמַד', transcription: 'йильмáд', translation: 'он будет учить' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִלְמַד', transcription: 'нильмáд', translation: 'мы будем учить' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּלְמְדוּ', transcription: 'тильмэдӯ', translation: 'вы будете учить' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִלְמְדוּ', transcription: 'йильмэдӯ', translation: 'они будут учить' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'לְמַד', transcription: 'льмáд', translation: 'учись (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'לִמְדִי', transcription: 'лимдӣ', translation: 'учись (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'לִמְדוּ', transcription: 'лимдӯ', translation: 'учитесь' },
    ],
  },
  'לאהוב': {
    infinitive: {
      hebrew: 'לֶאֱהֹב',
      transcription: 'лээhóв',
      translation: 'любить',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'א-ה-ב',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'אוֹהֵב', transcription: 'оhéв', translation: 'любит / люблю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'אוֹהֶבֶת', transcription: 'оhéвет', translation: 'любит / люблю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'אוֹהֲבִים', transcription: 'оhавӣм', translation: 'любят / любим (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'אוֹהֲבוֹת', transcription: 'оhавóт', translation: 'любят / любим (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אָהַבְתִּי', transcription: 'аháвти', translation: 'я любил(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'אָהַבְתָּ', transcription: 'аháвта', translation: 'ты любил' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'אָהַבְתְּ', transcription: 'аháвт', translation: 'ты любила' },
      { pronoun: 'הוּא (он)', hebrew: 'אָהַב', transcription: 'аháв', translation: 'он любил' },
      { pronoun: 'הִיא (она)', hebrew: 'אָהֲבָה', transcription: 'аhавá', translation: 'она любила' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'אָהַבְנוּ', transcription: 'аháвну', translation: 'мы любили' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'אֲהַבְתֶּם / אֲהַבְתֶּן', transcription: 'аhавтéм / аhавтéн', translation: 'вы любили' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'אָהֲבוּ', transcription: 'аhавӯ', translation: 'они любили' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֹהַב', transcription: 'оháв', translation: 'я полюблю' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תֹּאהַב', transcription: 'тоháв', translation: 'ты полюбишь / она полюбит' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תֹּאהֲבִי', transcription: 'тоhавӣ', translation: 'ты полюбишь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יֹאהַב', transcription: 'йоháв', translation: 'он полюбит' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נֹאהַב', transcription: 'ноháв', translation: 'мы полюбим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תֹּאהֲבוּ', transcription: 'тоhавӯ', translation: 'вы полюбите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יֹאהֲבוּ', transcription: 'йоhавӯ', translation: 'они полюбят' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'אֱהַב', transcription: 'эháв', translation: 'люби (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'אֶהֱבִי', transcription: 'эhэвӣ', translation: 'люби (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'אֶהֱבוּ', transcription: 'эhэвӯ', translation: 'любите' },
    ],
  },
  'לעשות': {
    infinitive: {
      hebrew: 'לַעֲשׂוֹת',
      transcription: 'лаасóт',
      translation: 'делать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ע-שׂ-ה',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'עוֹשֶׂה', transcription: 'осэ́', translation: 'делает / делаю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'עוֹשָׂה', transcription: 'осá', translation: 'делает / делаю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'עוֹשִׂים', transcription: 'осӣм', translation: 'делают / делаем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'עוֹשׂוֹת', transcription: 'осóт', translation: 'делают / делаем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'עָשִׂיתִי', transcription: 'асӣти', translation: 'я делал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'עָשִׂיתָ', transcription: 'асӣта', translation: 'ты делал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'עָשִׂית', transcription: 'асӣт', translation: 'ты делала' },
      { pronoun: 'הוּא (он)', hebrew: 'עָשָׂה', transcription: 'асá', translation: 'он делал' },
      { pronoun: 'הִיא (она)', hebrew: 'עָשְׂתָה', transcription: 'астá', translation: 'она делала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'עָשִׂינוּ', transcription: 'асӣну', translation: 'мы делали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'עֲשִׂיתֶם / עֲשִׂיתֶן', transcription: 'аситéм / аситéн', translation: 'вы делали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'עָשׂוּ', transcription: 'асӯ', translation: 'они делали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶעֱשֶׂה', transcription: 'ээсэ́', translation: 'я сделаю' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּעֲשֶׂה', transcription: 'таасэ́', translation: 'ты сделаешь / она сделает' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּעֲשִׂי', transcription: 'таасӣ', translation: 'ты сделаешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יַעֲשֶׂה', transcription: 'яасэ́', translation: 'он сделает' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַעֲשֶׂה', transcription: 'наасэ́', translation: 'мы сделаем' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּעֲשׂוּ', transcription: 'таасӯ', translation: 'вы сделаете' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַעֲשׂוּ', transcription: 'яасӯ', translation: 'они сделают' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'עֲשֵׂה', transcription: 'асэ́', translation: 'делай (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'עֲשִׂי', transcription: 'асӣ', translation: 'делай (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'עֲשׂוּ', transcription: 'асӯ', translation: 'делайте' },
    ],
  },
  'לבוא': {
    infinitive: {
      hebrew: 'לָבוֹא',
      transcription: 'лавó',
      translation: 'приходить, приезжать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ב-ו-א',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'בָּא', transcription: 'ба', translation: 'приходит / прихожу (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'בָּאָה', transcription: 'ба́а', translation: 'приходит / прихожу (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'בָּאִים', transcription: 'баӣм', translation: 'приходят / приходим (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'בָּאוֹת', transcription: 'баóт', translation: 'приходят / приходим (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'בָּאתִי', transcription: 'бáти', translation: 'я пришёл / пришла' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'בָּאתָ', transcription: 'бáта', translation: 'ты пришёл' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'בָּאת', transcription: 'бат', translation: 'ты пришла' },
      { pronoun: 'הוּא (он)', hebrew: 'בָּא', transcription: 'ба', translation: 'он пришёл' },
      { pronoun: 'הִיא (она)', hebrew: 'בָּאָה', transcription: 'ба́а', translation: 'она пришла' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'בָּאנוּ', transcription: 'бáну', translation: 'мы пришли' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'בָּאתֶם / בָּאתֶן', transcription: 'батéм / батéн', translation: 'вы пришли' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'בָּאוּ', transcription: 'бáу', translation: 'они пришли' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אָבוֹא', transcription: 'авó', translation: 'я приду' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תָּבוֹא', transcription: 'тавó', translation: 'ты придёшь / она придёт' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תָּבוֹאִי', transcription: 'тавóи', translation: 'ты придёшь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יָבוֹא', transcription: 'явó', translation: 'он придёт' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נָבוֹא', transcription: 'навó', translation: 'мы придём' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תָּבוֹאוּ', transcription: 'тавóу', translation: 'вы придёте' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יָבוֹאוּ', transcription: 'явóу', translation: 'они придут' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'בּוֹא', transcription: 'бо', translation: 'приходи / иди сюда (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'בּוֹאִי', transcription: 'бóи', translation: 'приходи / иди сюда (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'בּוֹאוּ', transcription: 'бóу', translation: 'приходите' },
    ],
  },
  'לראות': {
    infinitive: {
      hebrew: 'לִרְאוֹת',
      transcription: 'лиръóт',
      translation: 'видеть, смотреть',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ר-א-ה',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'רוֹאֶה', transcription: 'роэ́', translation: 'видит / вижу (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'רוֹאָה', transcription: 'роá', translation: 'видит / вижу (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'רוֹאִים', transcription: 'роъӣм', translation: 'видят / видим (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'רוֹאוֹת', transcription: 'роъóт', translation: 'видят / видим (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'רָאִיתִי', transcription: 'раӣти', translation: 'я видел(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'רָאִיתָ', transcription: 'раӣта', translation: 'ты видел' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'רָאִית', transcription: 'раӣт', translation: 'ты видела' },
      { pronoun: 'הוּא (он)', hebrew: 'רָאָה', transcription: 'раá', translation: 'он видел' },
      { pronoun: 'הִיא (она)', hebrew: 'רָאֲתָה', transcription: 'раатá', translation: 'она видела' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'רָאִינוּ', transcription: 'раӣну', translation: 'мы видели' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'רְאִיתֶם / רְאִיתֶן', transcription: 'реитéм / реитéн', translation: 'вы видели' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'רָאוּ', transcription: 'раӯ', translation: 'они видели' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶרְאֶה', transcription: 'эръэ́', translation: 'я увижу' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּרְאֶה', transcription: 'тиръэ́', translation: 'ты увидишь / она увидит' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּרְאִי', transcription: 'тиръӣ', translation: 'ты увидишь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִרְאֶה', transcription: 'йиръэ́', translation: 'он увидит' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִרְאֶה', transcription: 'ниръэ́', translation: 'мы увидим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּרְאוּ', transcription: 'тиръӯ', translation: 'вы увидите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִרְאוּ', transcription: 'йиръӯ', translation: 'они увидят' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'רְאֵה', transcription: 'реэ́', translation: 'смотри (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'רְאִי', transcription: 'реӣ', translation: 'смотри (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'רְאוּ', transcription: 'реӯ', translation: 'смотрите' },
    ],
  },
  'לשמוע': {
    infinitive: {
      hebrew: 'לִשְׁמֹעַ',
      transcription: 'лишмóа',
      translation: 'слышать, слушать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ש-מ-ע',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'שׁוֹמֵעַ', transcription: 'шомéа', translation: 'слышит / слышу (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'שׁוֹמַעַת', transcription: 'шомáат', translation: 'слышит / слышу (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'שׁוֹמְעִים', transcription: 'шомъӣм', translation: 'слышат / слышим (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'שׁוֹמְעוֹת', transcription: 'шомъóт', translation: 'слышат / слышим (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'שָׁמַעְתִּי', transcription: 'шамáти', translation: 'я слышал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'שָׁמַעְתָּ', transcription: 'шамáта', translation: 'ты слышал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'שָׁמַעְתְּ', transcription: 'шамáт', translation: 'ты слышала' },
      { pronoun: 'הוּא (он)', hebrew: 'שָׁמַע', transcription: 'шамá', translation: 'он слышал' },
      { pronoun: 'הִיא (она)', hebrew: 'שָׁמְעָה', transcription: 'шамъá', translation: 'она слышала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'שָׁמַעְנוּ', transcription: 'шамáну', translation: 'мы слышали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'שְׁמַעְתֶּם / שְׁמַעְתֶּן', transcription: 'шмаатéм / шмаатéн', translation: 'вы слышали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'שָׁמְעוּ', transcription: 'шамъӯ', translation: 'они слышали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶשְׁמַע', transcription: 'эшмá', translation: 'я услышу' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּשְׁמַע', transcription: 'тишмá', translation: 'ты услышишь / она услышит' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּשְׁמְעִי', transcription: 'тишмэъӣ', translation: 'ты услышишь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִשְׁמַע', transcription: 'йишмá', translation: 'он услышит' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִשְׁמַע', transcription: 'нишмá', translation: 'мы услышим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּשְׁמְעוּ', transcription: 'тишмэъӯ', translation: 'вы услышите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִשְׁמְעוּ', transcription: 'йишмэъӯ', translation: 'они услышат' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'שְׁמַע', transcription: 'шма', translation: 'слушай (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'שִׁמְעִי', transcription: 'шимъӣ', translation: 'слушай (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'שִׁמְעוּ', transcription: 'шимъӯ', translation: 'слушайте' },
    ],
  },
  'להבין': {
    infinitive: {
      hebrew: 'לְהָבִין',
      transcription: 'лэhавӣн',
      translation: 'понимать',
    },
    binyan: 'הִפְעִיל (hифъиль)',
    root: 'ב-ו-ן',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מֵבִין', transcription: 'мэвӣн', translation: 'понимает / понимаю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְבִינָה', transcription: 'мэвинá', translation: 'понимает / понимаю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְבִינִים', transcription: 'мэвинӣм', translation: 'понимают / понимаем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְבִינוֹת', transcription: 'мэвинóт', translation: 'понимают / понимаем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'הֵבַנְתִּי', transcription: 'hэвáнти', translation: 'я понял(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הֵבַנְתָּ', transcription: 'hэвáнта', translation: 'ты понял' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הֵבַנְתְּ', transcription: 'hэвáнт', translation: 'ты поняла' },
      { pronoun: 'הוּא (он)', hebrew: 'הֵבִין', transcription: 'hэвӣн', translation: 'он понял' },
      { pronoun: 'הִיא (она)', hebrew: 'הֵבִינָה', transcription: 'hэвинá', translation: 'она поняла' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הֵבַנּוּ', transcription: 'hэвáну', translation: 'мы поняли' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הֲבַנְתֶּם / הֲבַנְתֶּן', transcription: 'hавантéм / hавантéн', translation: 'вы поняли' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'הֵבִינוּ', transcription: 'hэвинӯ', translation: 'они поняли' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אָבִין', transcription: 'авӣн', translation: 'я пойму' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תָּבִין', transcription: 'тавӣн', translation: 'ты поймёшь / она поймёт' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תָּבִינִי', transcription: 'тавинӣ', translation: 'ты поймёшь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יָבִין', transcription: 'явӣн', translation: 'он поймёт' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נָבִין', transcription: 'навӣн', translation: 'мы поймём' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תָּבִינוּ', transcription: 'тавинӯ', translation: 'вы поймёте' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יָבִינוּ', transcription: 'явинӯ', translation: 'они поймут' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'הָבֵן', transcription: 'hавéн', translation: 'пойми (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הָבִינִי', transcription: 'hавинӣ', translation: 'пойми (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הָבִינוּ', transcription: 'hавинӯ', translation: 'поймите' },
    ],
  },
  'לתת': {
    infinitive: {
      hebrew: 'לָתֵת',
      transcription: 'латéт',
      translation: 'давать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'נ-ת-ן',
    present: [
      { pronoun: 'זָכָר יָחִיд (он / я / ты)', hebrew: 'נוֹתֵן', transcription: 'нотéн', translation: 'даёт / даю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'נוֹתֶנֶת', transcription: 'нотéнет', translation: 'даёт / даю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'נוֹתְנִים', transcription: 'нотнӣм', translation: 'дают / даём (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'נוֹתְנוֹת', transcription: 'нотнóт', translation: 'дают / даём (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'נָתַתִּי', transcription: 'натáти', translation: 'я дал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'נָתַתָּ', transcription: 'натáта', translation: 'ты дал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'נָתַתְּ', transcription: 'натáт', translation: 'ты дала' },
      { pronoun: 'הוּא (он)', hebrew: 'נָתַן', transcription: 'натáн', translation: 'он дал' },
      { pronoun: 'הִיא (она)', hebrew: 'נָתְנָה', transcription: 'натнá', translation: 'она дала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נָתַנּוּ', transcription: 'натáну', translation: 'мы дали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'נְתַתֶּם / נְתַתֶּן', transcription: 'нетаттéм / нетаттéн', translation: 'вы дали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'נָתְנוּ', transcription: 'натнӯ', translation: 'они дали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶתֵּן', transcription: 'этéн', translation: 'я дам' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּתֵּן', transcription: 'титéн', translation: 'ты дашь / она даст' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּתְּנִי', transcription: 'титнӣ', translation: 'ты дашь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִתֵּן', transcription: 'йитéн', translation: 'он даст' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִתֵּן', transcription: 'нитéн', translation: 'мы дадим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּתְּנוּ', transcription: 'титнӯ', translation: 'вы дадите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִתְּנוּ', transcription: 'йитнӯ', translation: 'они дадут' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'תֵּן', transcription: 'тэн', translation: 'дай (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'תְּנִי', transcription: 'тнӣ', translation: 'дай (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'תְּנוּ', transcription: 'тнӯ', translation: 'дайте' },
    ],
  },
  'לקנות': {
    infinitive: {
      hebrew: 'לִקְנוֹת',
      transcription: 'ликнóт',
      translation: 'покупать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ק-נ-ה',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'קוֹנֶה', transcription: 'конé', translation: 'покупает / покупаю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'קוֹנָה', transcription: 'конá', translation: 'покупает / покупаю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'קוֹנִים', transcription: 'конӣм', translation: 'покупают / покупаем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'קוֹנוֹת', transcription: 'конóт', translation: 'покупают / покупаем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'קָנִיתִי', transcription: 'канӣти', translation: 'я купил(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'קָנִיתָ', transcription: 'канӣта', translation: 'ты купил' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'קָנִית', transcription: 'канӣт', translation: 'ты купила' },
      { pronoun: 'הוּא (он)', hebrew: 'קָנָה', transcription: 'канá', translation: 'он купил' },
      { pronoun: 'הִיא (она)', hebrew: 'קָנְתָה', transcription: 'кантá', translation: 'она купила' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'קָנִינוּ', transcription: 'канӣну', translation: 'мы купили' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'קְנִיתֶם / קְנִיתֶן', transcription: 'книтéм / книтéн', translation: 'вы купили' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'קָנוּ', transcription: 'канӯ', translation: 'они купили' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶקְנֶה', transcription: 'экнэ́', translation: 'я куплю' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּקְנֶה', transcription: 'тикнэ́', translation: 'ты купишь / она купит' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּקְנִי', transcription: 'тикнӣ', translation: 'ты купишь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִקְנֶה', transcription: 'йикнэ́', translation: 'он купит' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִקְנֶה', transcription: 'никнэ́', translation: 'мы купим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּקְנוּ', transcription: 'тикнӯ', translation: 'вы купите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִקְנוּ', transcription: 'йикнӯ', translation: 'они купят' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'קְנֵה', transcription: 'кнэ', translation: 'купи (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'קְנִי', transcription: 'кнӣ', translation: 'купи (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'קְנוּ', transcription: 'кнӯ', translation: 'купите' },
    ],
  },
  'לחשוב': {
    infinitive: {
      hebrew: 'לַחְשֹׁב',
      transcription: 'лахшóв',
      translation: 'думать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ח-ש-ב',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'חוֹשֵׁב', transcription: 'хошéв', translation: 'думает / думаю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'חוֹשֶׁבֶת', transcription: 'хошéвет', translation: 'думает / думаю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'חוֹשְׁבִים', transcription: 'хошвӣм', translation: 'думают / думаем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'חוֹשְׁבוֹת', transcription: 'хошвóт', translation: 'думают / думаем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'חָשַׁבְתִּי', transcription: 'хашáвти', translation: 'я думал(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'חָשַׁבְתָּ', transcription: 'хашáвта', translation: 'ты думал' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'חָשַׁבְתְּ', transcription: 'хашáвт', translation: 'ты думала' },
      { pronoun: 'הוּא (он)', hebrew: 'חָשַׁב', transcription: 'хашáв', translation: 'он думал' },
      { pronoun: 'הִיא (она)', hebrew: 'חָשְׁבָה', transcription: 'хашвá', translation: 'она думала' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'חָשַׁבְנוּ', transcription: 'хашáвну', translation: 'мы думали' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'חֲשַׁבְתֶּם / חֲשַׁבְתֶּן', transcription: 'хашавтéм / хашавтéн', translation: 'вы думали' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'חָשְׁבוּ', transcription: 'хашвӯ', translation: 'они думали' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶחְשֹׁב', transcription: 'эхшóв', translation: 'я подумаю' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּחְשֹׁב', transcription: 'тахшóв', translation: 'ты подумаешь / она подумает' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּחְשְׁבִי', transcription: 'тахшэвӣ', translation: 'ты подумаешь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יַחְשֹׁב', transcription: 'яхшóв', translation: 'он подумает' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַחְשֹׁב', transcription: 'нахшóв', translation: 'мы подумаем' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּחְשְׁבוּ', transcription: 'тахшэвӯ', translation: 'вы подумаете' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַחְשְׁבוּ', transcription: 'яхшэвӯ', translation: 'они подумают' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'חֲשֹׁב', transcription: 'хашóв', translation: 'думай (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'חִשְׁבִי', transcription: 'хишвӣ', translation: 'думай (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'חִשְׁבוּ', transcription: 'хишвӯ', translation: 'думайте' },
    ],
  },
  'לשאול': {
    infinitive: {
      hebrew: 'לִשְׁאֹל',
      transcription: 'лишъóль',
      translation: 'спрашивать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ש-א-ל',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'שׁוֹאֵל', transcription: 'шоэ́ль', translation: 'спрашивает / спрашиваю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'שׁוֹאֶלֶת', transcription: 'шоэ́лет', translation: 'спрашивает / спрашиваю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'שׁוֹאֲלִים', transcription: 'шоалӣм', translation: 'спрашивают / спрашиваем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'שׁוֹאֲלוֹת', transcription: 'шоалóт', translation: 'спрашивают / спрашиваем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'שָׁאַלְתִּי', transcription: 'шаáльти', translation: 'я спросил(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'שָׁאַלְתָּ', transcription: 'шаáльта', translation: 'ты спросил' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'שָׁאַלְתְּ', transcription: 'шаáльт', translation: 'ты спросила' },
      { pronoun: 'הוּא (он)', hebrew: 'שָׁאַל', transcription: 'шаáль', translation: 'он спросил' },
      { pronoun: 'הִיא (она)', hebrew: 'שָׁאֲלָה', transcription: 'шаалá', translation: 'она спросила' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'שָׁאַלְנוּ', transcription: 'шаáльну', translation: 'мы спросили' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'שְׁאַלְתֶּם / שְׁאַלְתֶּן', transcription: 'шаальтéм / шаальтéн', translation: 'вы спросили' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'שָׁאֲלוּ', transcription: 'шаалӯ', translation: 'они спросили' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶשְׁאַל', transcription: 'эшъáль', translation: 'я спрошу' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּשְׁאַל', transcription: 'тишъáль', translation: 'ты спросишь / она спросит' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּשְׁאֲלִי', transcription: 'тишъалӣ', translation: 'ты спросишь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יִשְׁאַל', transcription: 'йишъáль', translation: 'он спросит' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִשְׁאַל', transcription: 'нишъáль', translation: 'мы спросим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּשְׁאֲלוּ', transcription: 'тишъалӯ', translation: 'вы спросите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִשְׁאֲלוּ', transcription: 'йишъалӯ', translation: 'они спросят' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'שְׁאַל', transcription: 'шъаль', translation: 'спроси (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'שַׁאֲלִי', transcription: 'шаалӣ', translation: 'спроси (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'שַׁאֲלוּ', transcription: 'шаалӯ', translation: 'спросите' },
    ],
  },
  'לענות': {
    infinitive: {
      hebrew: 'לַעֲנוֹת',
      transcription: 'лаанóт',
      translation: 'отвечать',
    },
    binyan: 'פָּעַל (Пааль)',
    root: 'ע-נ-ה',
    present: [
      { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'עוֹנֶה', transcription: 'онэ́', translation: 'отвечает / отвечаю (м.р.)' },
      { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'עוֹנָה', transcription: 'онá', translation: 'отвечает / отвечаю (ж.р.)' },
      { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'עוֹנִים', transcription: 'онӣм', translation: 'отвечают / отвечаем (м.р.)' },
      { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'עוֹנוֹת', transcription: 'онóт', translation: 'отвечают / отвечаем (ж.р.)' },
    ],
    past: [
      { pronoun: 'אֲנִי (я)', hebrew: 'עָנִיתִי', transcription: 'анӣти', translation: 'я ответил(а)' },
      { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'עָנִיתָ', transcription: 'анӣта', translation: 'ты ответил' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'עָנִית', transcription: 'анӣт', translation: 'ты ответила' },
      { pronoun: 'הוּא (он)', hebrew: 'עָנָה', transcription: 'анá', translation: 'он ответил' },
      { pronoun: 'הִיא (она)', hebrew: 'עָנְתָה', transcription: 'антá', translation: 'она ответила' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'עָנִינוּ', transcription: 'анӣну', translation: 'мы ответили' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'עֲנִיתֶם / עֲנִיתֶן', transcription: 'анитéм / анитéн', translation: 'вы ответили' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'עָנוּ', transcription: 'анӯ', translation: 'они ответили' },
    ],
    future: [
      { pronoun: 'אֲנִי (я)', hebrew: 'אֶעֱנֶה', transcription: 'ээнэ́', translation: 'я отвечу' },
      { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּעֲנֶה', transcription: 'таанэ́', translation: 'ты ответишь / она ответит' },
      { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּעֲנִי', transcription: 'таанӣ', translation: 'ты ответишь (ж.р.)' },
      { pronoun: 'הוּא (он)', hebrew: 'יַעֲנֶה', transcription: 'яанэ́', translation: 'он ответит' },
      { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַעֲנֶה', transcription: 'наанэ́', translation: 'мы ответим' },
      { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּעֲנוּ', transcription: 'таанӯ', translation: 'вы ответите' },
      { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַעֲנוּ', transcription: 'яанӯ', translation: 'они ответят' },
    ],
    imperative: [
      { pronoun: 'אַתָּה (м.р.)', hebrew: 'עֲנֵה', transcription: 'анэ́', translation: 'ответь (м.р.)' },
      { pronoun: 'אַתְּ (ж.р.)', hebrew: 'עֲנִי', transcription: 'анӣ', translation: 'ответь (ж.р.)' },
      { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'עֲנוּ', transcription: 'анӯ', translation: 'ответьте' },
    ],
  },
  'לחפש': {
  "infinitive": {
    "hebrew": "לְחַפֵּשׂ",
    "transcription": "лехапéс",
    "translation": "искать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ח-פ-שׂ",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְחַפֵּשׂ",
      "transcription": "мехапéс",
      "translation": "ищет / ищу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְחַפֶּשֶׂת",
      "transcription": "мехапéсет",
      "translation": "ищет / ищу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְחַפְּשִׂים",
      "transcription": "мехапсӣм",
      "translation": "ищут / ищем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְחַפְּשׂוֹת",
      "transcription": "мехапсóт",
      "translation": "ищут / ищем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "חִפַּשְׂתִּי",
      "transcription": "хипáсти",
      "translation": "я искал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "חִפַּשְׂתָּ",
      "transcription": "хипáста",
      "translation": "ты искал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "חִפַּשְׂתְּ",
      "transcription": "хипáст",
      "translation": "ты искала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "חִפֵּשׂ",
      "transcription": "хипéс",
      "translation": "он искал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "חִפְּשָׂה",
      "transcription": "хипсá",
      "translation": "она искала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "חִפַּשְׂנוּ",
      "transcription": "хипáсну",
      "translation": "мы искали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "חִפַּשְׂתֶּם / חִפַּשְׂתֶּן",
      "transcription": "хипастéм / хипастéн",
      "translation": "вы искали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "חִפְּשׂוּ",
      "transcription": "хипсӯ",
      "translation": "они искали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲחַפֵּשׂ",
      "transcription": "ахапéс",
      "translation": "я буду искать / найду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּחַפֵּשׂ",
      "transcription": "техапéс",
      "translation": "ты будешь искать / она будет искать"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּחַפְּשִׂי",
      "transcription": "техапсӣ",
      "translation": "ты будешь искать (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְחַפֵּשׂ",
      "transcription": "йехапéс",
      "translation": "он будет искать"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְחַפֵּשׂ",
      "transcription": "нехапéс",
      "translation": "мы будем искать"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּחַפְּשׂוּ",
      "transcription": "техапсӯ",
      "translation": "вы будете искать"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְחַפְּשׂוּ",
      "transcription": "йехапсӯ",
      "translation": "они будут искать"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "חַפֵּשׂ",
      "transcription": "хапéс",
      "translation": "ищи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "חַפְּשִׂי",
      "transcription": "хапсӣ",
      "translation": "ищи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "חַפְּשׂוּ",
      "transcription": "хапсӯ",
      "translation": "ищите"
    }
  ]
},
  'לבקש': {
  "infinitive": {
    "hebrew": "לְבַקֵּשׁ",
    "transcription": "левакéш",
    "translation": "просить"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ב-ק-ש",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְבַקֵּשׁ",
      "transcription": "мевакéш",
      "translation": "просит / прошу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְבַקֶּשֶׁת",
      "transcription": "мевакéшет",
      "translation": "просит / прошу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְבַקְשִׁים",
      "transcription": "мевакшӣм",
      "translation": "просят / просим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְבַקְשׁוֹת",
      "transcription": "мевакшóт",
      "translation": "просят / просим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "בִּקַּשְׁתִּי",
      "transcription": "бикáшти",
      "translation": "я просил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "בִּקַּשְׁתָּ",
      "transcription": "бикáшта",
      "translation": "ты просил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "בִּקַּשְׁתְּ",
      "transcription": "бикáшт",
      "translation": "ты просила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "בִּקֵּשׁ",
      "transcription": "бикéш",
      "translation": "он просил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "בִּקְּשָׁה",
      "transcription": "бикшá",
      "translation": "она просила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "בִּקַּשְׁנוּ",
      "transcription": "бикáшну",
      "translation": "мы просили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "בִּקַּשְׁתֶּם / בִּקַּשְׁתֶּן",
      "transcription": "бикаштéм / бикаштéн",
      "translation": "вы просили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "בִּקְּשׁוּ",
      "transcription": "бикшӯ",
      "translation": "они просили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲבַקֵּשׁ",
      "transcription": "авакéш",
      "translation": "я попрошу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּבַקֵּשׁ",
      "transcription": "тевакéш",
      "translation": "ты попросишь / она попросит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּבַקְשִׁי",
      "transcription": "тевакшӣ",
      "translation": "ты попросишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְבַקֵּשׁ",
      "transcription": "йевакéш",
      "translation": "он попросит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְבַקֵּשׁ",
      "transcription": "невакéш",
      "translation": "мы попросим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּבַקְשׁוּ",
      "transcription": "тевакшӯ",
      "translation": "вы попросите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְבַקְשׁוּ",
      "transcription": "йевакшӯ",
      "translation": "они попросят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "בַּקֵּשׁ",
      "transcription": "бакéш",
      "translation": "проси (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "בַּקְשִׁי",
      "transcription": "бакшӣ",
      "translation": "проси (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "בַּקְשׁוּ",
      "transcription": "бакшӯ",
      "translation": "просите"
    }
  ]
},
  'לשלם': {
  "infinitive": {
    "hebrew": "לְשַׁלֵּם",
    "transcription": "лешалéм",
    "translation": "платить"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ש-ל-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְשַׁלֵּם",
      "transcription": "мешалéм",
      "translation": "платит / плачу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְשַׁלֶּמֶת",
      "transcription": "мешалéмет",
      "translation": "платит / плачу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְשַׁלְּמִים",
      "transcription": "мешальмӣм",
      "translation": "платят / платим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְשַׁלְּמוֹת",
      "transcription": "мешальмóт",
      "translation": "платят / платим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "שִׁלַּמְתִּי",
      "transcription": "шилáмти",
      "translation": "я заплатил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "שִׁלַּמְתָּ",
      "transcription": "шилáмта",
      "translation": "ты заплатил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "שִׁלַּמְתְּ",
      "transcription": "шилáмт",
      "translation": "ты заплатила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "שִׁלֵּם",
      "transcription": "шилéм",
      "translation": "он заплатил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "שִׁלְּמָה",
      "transcription": "шильмá",
      "translation": "она заплатила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "שִׁלַּמְנוּ",
      "transcription": "шилáмну",
      "translation": "мы заплатили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "שִׁלַּמְתֶּם / שִׁלַּמְתֶּן",
      "transcription": "шиламтéм / шиламтéн",
      "translation": "вы заплатили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "שִׁלְּמוּ",
      "transcription": "шильмӯ",
      "translation": "они заплатили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲשַׁלֵּם",
      "transcription": "ашалéм",
      "translation": "я заплачу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּשַׁלֵּם",
      "transcription": "тешалéм",
      "translation": "ты заплатишь / она заплатит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּשַׁלְּמִי",
      "transcription": "тешальмӣ",
      "translation": "ты заплатишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְשַׁלֵּם",
      "transcription": "йешалéм",
      "translation": "он заплатит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְשַׁלֵּם",
      "transcription": "нешалéм",
      "translation": "мы заплатим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּשַׁלְּמוּ",
      "transcription": "тешальмӯ",
      "translation": "вы заплатите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְשַׁלְּמוּ",
      "transcription": "йешальмӯ",
      "translation": "они заплатят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שַׁלֵּם",
      "transcription": "шалéм",
      "translation": "плати (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שַׁלְּמִי",
      "transcription": "шальмӣ",
      "translation": "плати (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שַׁלְּמוּ",
      "transcription": "шальмӯ",
      "translation": "платите"
    }
  ]
},
  'לבשל': {
  "infinitive": {
    "hebrew": "לְבַשֵּׁל",
    "transcription": "левашéль",
    "translation": "готовить (еду)"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ב-ש-ל",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְבַשֵּׁל",
      "transcription": "мевашéль",
      "translation": "готовит / готовлю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְבַשֶּׁלֶת",
      "transcription": "мевашéлет",
      "translation": "готовит / готовлю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְבַשְּׁלִים",
      "transcription": "мевашлӣм",
      "translation": "готовят / готовим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְבַשְּׁלוֹת",
      "transcription": "мевашлóт",
      "translation": "готовят / готовим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "בִּשַּׁלְתִּי",
      "transcription": "бишáльти",
      "translation": "я готовил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "בִּשַּׁלְתָּ",
      "transcription": "бишáльта",
      "translation": "ты готовил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "בִּשַּׁלְתְּ",
      "transcription": "бишáльт",
      "translation": "ты готовила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "בִּשֵּׁל",
      "transcription": "бишéль",
      "translation": "он готовил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "בִּשְּׁלָה",
      "transcription": "бишлá",
      "translation": "она готовила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "בִּשַּׁלְנוּ",
      "transcription": "бишáльну",
      "translation": "мы готовили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "בִּשַּׁלְתֶּם / בִּשַּׁלְתֶּן",
      "transcription": "бишальтéм / бишальтéн",
      "translation": "вы готовили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "בִּשְּׁלוּ",
      "transcription": "бишлӯ",
      "translation": "они готовили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲבַשֵּׁל",
      "transcription": "авашéль",
      "translation": "я приготовлю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּבַשֵּׁל",
      "transcription": "тевашéль",
      "translation": "ты приготовишь / она приготовит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּבַשְּׁלִי",
      "transcription": "тевашлӣ",
      "translation": "ты приготовишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְבַשֵּׁל",
      "transcription": "йевашéль",
      "translation": "он приготовит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְבַשֵּׁל",
      "transcription": "невашéль",
      "translation": "мы приготовим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּבַשְּׁלוּ",
      "transcription": "тевашлӯ",
      "translation": "вы приготовите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְבַשְּׁלוּ",
      "transcription": "йевашлӯ",
      "translation": "они приготовят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "בַּשֵּׁל",
      "transcription": "башéль",
      "translation": "готовь (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "בַּשְּׁלִי",
      "transcription": "башлӣ",
      "translation": "готовь (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "בַּשְּׁלוּ",
      "transcription": "башлӯ",
      "translation": "готовьте"
    }
  ]
},
  'לספר': {
  "infinitive": {
    "hebrew": "לְסַפֵּר",
    "transcription": "лесапéр",
    "translation": "рассказывать, стричь"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ס-פ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְסַפֵּר",
      "transcription": "месапéр",
      "translation": "рассказывает / рассказываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְסַפֶּרֶת",
      "transcription": "месапéрет",
      "translation": "рассказывает / рассказываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְסַפְּרִים",
      "transcription": "месапрӣм",
      "translation": "рассказывают / рассказываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְסַפְּרוֹת",
      "transcription": "месапрóт",
      "translation": "рассказывают / рассказываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "סִפַּרְתִּי",
      "transcription": "сипáрти",
      "translation": "я рассказал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "סִפַּרְתָּ",
      "transcription": "сипáрта",
      "translation": "ты рассказал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "סִפַּרְתְּ",
      "transcription": "сипáрт",
      "translation": "ты рассказала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "סִפֵּר",
      "transcription": "сипéр",
      "translation": "он рассказал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "סִפְּרָה",
      "transcription": "сипрá",
      "translation": "она рассказала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "סִפַּרְנוּ",
      "transcription": "сипáрну",
      "translation": "мы рассказали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "סִפַּרְתֶּם / סִפַּרְתֶּן",
      "transcription": "сипартéм / сипартéн",
      "translation": "вы рассказали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "סִפְּרוּ",
      "transcription": "сипрӯ",
      "translation": "они рассказали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲסַפֵּר",
      "transcription": "асапéр",
      "translation": "я расскажу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּסַפֵּר",
      "transcription": "тесапéр",
      "translation": "ты расскажешь / она расскажет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּסַפְּרִי",
      "transcription": "тесапрӣ",
      "translation": "ты расскажешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְסַפֵּר",
      "transcription": "йесапéр",
      "translation": "он расскажет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְסַפֵּר",
      "transcription": "несапéр",
      "translation": "мы расскажем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּסַפְּרוּ",
      "transcription": "тесапрӯ",
      "translation": "вы расскажете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְסַפְּרוּ",
      "transcription": "йесапрӯ",
      "translation": "они расскажут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "סַפֵּר",
      "transcription": "сапéр",
      "translation": "расскажи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "סַפְּרִי",
      "transcription": "сапрӣ",
      "translation": "расскажи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "סַפְּרוּ",
      "transcription": "сапрӯ",
      "translation": "расскажите"
    }
  ]
},
  'ללמד': {
  "infinitive": {
    "hebrew": "לְלַמֵּד",
    "transcription": "леламéд",
    "translation": "обучать, преподавать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ל-מ-ד",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְלַמֵּד",
      "transcription": "меламéд",
      "translation": "обучает / обучаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְלַמֶּדֶת",
      "transcription": "меламéдет",
      "translation": "обучает / обучаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְלַמְּדִים",
      "transcription": "меламдӣм",
      "translation": "обучают / обучаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְלַמְּדוֹת",
      "transcription": "меламдóт",
      "translation": "обучают / обучаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "לִמַּדְתִּי",
      "transcription": "лимáдти",
      "translation": "я обучал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "לִמַּדְתָּ",
      "transcription": "лимáдта",
      "translation": "ты обучал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "לִמַּדְתְּ",
      "transcription": "лимáдт",
      "translation": "ты обучала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "לִמֵּד",
      "transcription": "лимéд",
      "translation": "он обучал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "לִמְּדָה",
      "transcription": "лимдá",
      "translation": "она обучала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "לִמַּדְנוּ",
      "transcription": "лимáдну",
      "translation": "мы обучали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "לִמַּדְתֶּם / לִמַּדְתֶּן",
      "transcription": "лимадтéм / лимадтéн",
      "translation": "вы обучали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "לִמְּדוּ",
      "transcription": "лимдӯ",
      "translation": "они обучали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲלַמֵּד",
      "transcription": "аламéд",
      "translation": "я обучу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּלַמֵּד",
      "transcription": "теламéд",
      "translation": "ты обучишь / она обучит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּלַמְּדִי",
      "transcription": "теламдӣ",
      "translation": "ты обучишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְלַמֵּד",
      "transcription": "йеламéд",
      "translation": "он обучит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְלַמֵּד",
      "transcription": "неламéд",
      "translation": "мы обучим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּלַמְּדוּ",
      "transcription": "теламдӯ",
      "translation": "вы обучите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְלַמְּדוּ",
      "transcription": "йеламдӯ",
      "translation": "они обучат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "לַמֵּד",
      "transcription": "ламéд",
      "translation": "обучай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "לַמְּדִי",
      "transcription": "ламдӣ",
      "translation": "обучай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "לַמְּדוּ",
      "transcription": "ламдӯ",
      "translation": "обучайте"
    }
  ]
},
  'לטייל': {
  "infinitive": {
    "hebrew": "לְטַיֵּל",
    "transcription": "летайéль",
    "translation": "гулять, путешествовать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ט-י-ל",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְטַיֵּל",
      "transcription": "метайéль",
      "translation": "гуляет / гуляю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְטַיֶּלֶת",
      "transcription": "метайéлет",
      "translation": "гуляет / гуляю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְטַיְּלִים",
      "transcription": "метайлӣм",
      "translation": "гуляют / гуляем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְטַיְּלוֹת",
      "transcription": "метайлóт",
      "translation": "гуляют / гуляем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "טִיַּלְתִּי",
      "transcription": "тийáльти",
      "translation": "я гулял(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "טִיַּלְתָּ",
      "transcription": "тийáльта",
      "translation": "ты гулял"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "טִיַּלְתְּ",
      "transcription": "тийáльт",
      "translation": "ты гуляла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "טִיֵּל",
      "transcription": "тийéль",
      "translation": "он гулял"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "טִיְּלָה",
      "transcription": "тийлá",
      "translation": "она гуляла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "טִיַּלְנוּ",
      "transcription": "тийáльну",
      "translation": "мы гуляли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "טִיַּלְתֶּם / טִיַּלְתֶּן",
      "transcription": "тийяльтéм / тийяльтéн",
      "translation": "вы гуляли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "טִיְּלוּ",
      "transcription": "тийлӯ",
      "translation": "они гуляли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲטַיֵּל",
      "transcription": "атайéль",
      "translation": "я погуляю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּטַיֵּל",
      "transcription": "тетайéль",
      "translation": "ты погуляешь / она погуляет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּטַיְּלִי",
      "transcription": "тетайлӣ",
      "translation": "ты погуляешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְטַיֵּל",
      "transcription": "йетайéль",
      "translation": "он погуляет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְטַיֵּל",
      "transcription": "нетайéль",
      "translation": "мы погуляем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּטַיְּלוּ",
      "transcription": "тетайлӯ",
      "translation": "вы погуляете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְטַיְּלוּ",
      "transcription": "йетайлӯ",
      "translation": "они погуляют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "טַיֵּל",
      "transcription": "тайéль",
      "translation": "гуляй (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "טַיְּלִי",
      "transcription": "тайлӣ",
      "translation": "гуляй (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "טַיְּלוּ",
      "transcription": "тайлӯ",
      "translation": "гуляйте"
    }
  ]
},
  'להתחיל': {
  "infinitive": {
    "hebrew": "לְהַתְחִיל",
    "transcription": "леhатхӣль",
    "translation": "начинать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ת-ח-ל",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַתְחִיל",
      "transcription": "матхӣль",
      "translation": "начинает / начинаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַתְחִילָה",
      "transcription": "матхилá",
      "translation": "начинает / начинаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַתְחִילִים",
      "transcription": "матхилӣм",
      "translation": "начинают / начинаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַתְחִילוֹת",
      "transcription": "матхилóт",
      "translation": "начинают / начинаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְחַלְתִּי",
      "transcription": "hитхáльти",
      "translation": "я начал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְחַלְתָּ",
      "transcription": "hитхáльта",
      "translation": "ты начал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְחַלְתְּ",
      "transcription": "hитхáльт",
      "translation": "ты начала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְחִיל",
      "transcription": "hитхӣль",
      "translation": "он начал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְחִילָה",
      "transcription": "hитхилá",
      "translation": "она начала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְחַלְנוּ",
      "transcription": "hитхáльну",
      "translation": "мы начали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְחַלְתֶּם / הִתְחַלְתֶּן",
      "transcription": "hитхальтéм / hитхальтéн",
      "translation": "вы начали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְחִילוּ",
      "transcription": "hитхилӯ",
      "translation": "они начали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַתְחִיל",
      "transcription": "атхӣль",
      "translation": "я начну"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּתְחִיל",
      "transcription": "татхӣль",
      "translation": "ты начнешь / она начнет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּתְחִילִי",
      "transcription": "татхилӣ",
      "translation": "ты начнешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַתְחִיל",
      "transcription": "йатхӣль",
      "translation": "он начнет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַתְחִיל",
      "transcription": "натхӣль",
      "translation": "мы начнем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּתְחִילוּ",
      "transcription": "татхилӯ",
      "translation": "вы начнете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַתְחִילוּ",
      "transcription": "йатхилӯ",
      "translation": "они начнут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַתְחֵל",
      "transcription": "hатхéль",
      "translation": "начинай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַתְחִילִי",
      "transcription": "hатхилӣ",
      "translation": "начинай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַתְחִילוּ",
      "transcription": "hатхилӯ",
      "translation": "начинайте"
    }
  ]
},
  'להמשיך': {
  "infinitive": {
    "hebrew": "לְהַמְשִׁיךְ",
    "transcription": "леhамшӣх",
    "translation": "продолжать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "מ-ש-ך",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַמְשִׁיךְ",
      "transcription": "мамшӣх",
      "translation": "продолжает / продолжаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַמְשִׁיכָה",
      "transcription": "мамшихá",
      "translation": "продолжает / продолжаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַמְשִׁיכִים",
      "transcription": "мамшихӣм",
      "translation": "продолжают / продолжаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַמְשִׁיכוֹת",
      "transcription": "мамшихóт",
      "translation": "продолжают / продолжаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִמְשַׁכְתִּי",
      "transcription": "hимшáхти",
      "translation": "я продолжал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִמְשַׁכְתָּ",
      "transcription": "hимшáхта",
      "translation": "ты продолжал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִמְשַׁכְתְּ",
      "transcription": "hимшáхт",
      "translation": "ты продолжала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִמְשִׁיךְ",
      "transcription": "hимшӣх",
      "translation": "он продолжал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִמְשִׁיכָה",
      "transcription": "hимшихá",
      "translation": "она продолжала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִמְשַׁכְנוּ",
      "transcription": "hимшáхну",
      "translation": "мы продолжали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִמְשַׁכְתֶּם / הִמְשַׁכְתֶּן",
      "transcription": "hимшахтéм / hимшахтéн",
      "translation": "вы продолжали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִמְשִׁיכוּ",
      "transcription": "hимшихӯ",
      "translation": "они продолжали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַמְשִׁיךְ",
      "transcription": "амшӣх",
      "translation": "я продолжу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּמְשִׁיךְ",
      "transcription": "тамшӣх",
      "translation": "ты продолжишь / она продолжит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּמְשִׁיכִי",
      "transcription": "тамшихӣ",
      "translation": "ты продолжишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַמְשִׁיךְ",
      "transcription": "йамшӣх",
      "translation": "он продолжит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַמְשִׁיךְ",
      "transcription": "намшӣх",
      "translation": "мы продолжим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּמְשִׁיכוּ",
      "transcription": "тамшихӯ",
      "translation": "вы продолжите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַמְשִׁיכוּ",
      "transcription": "йамшихӯ",
      "translation": "они продолжат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַמְשֵׁךְ",
      "transcription": "hамшéх",
      "translation": "продолжай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַמְשִׁיכִי",
      "transcription": "hамшихӣ",
      "translation": "продолжай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַמְשִׁיכוּ",
      "transcription": "hамшихӯ",
      "translation": "продолжайте"
    }
  ]
},
  'להגיע': {
  "infinitive": {
    "hebrew": "לְהַגִּיעַ",
    "transcription": "леhагӣа",
    "translation": "прибывать, добираться"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "נ-ג-ע",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַגִּיעַ",
      "transcription": "магӣа",
      "translation": "прибывает / прибываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַגִּיעָה",
      "transcription": "магиá",
      "translation": "прибывает / прибываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַגִּיעִים",
      "transcription": "магиӣм",
      "translation": "прибывают / прибываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַגִּיעוֹת",
      "transcription": "магиóт",
      "translation": "прибывают / прибываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִגַּעְתִּי",
      "transcription": "hигáти",
      "translation": "я прибыл(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִגַּעְתָּ",
      "transcription": "hигáта",
      "translation": "ты прибыл"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִגַּעְתְּ",
      "transcription": "hигáт",
      "translation": "ты прибыла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִגִּיעַ",
      "transcription": "hигӣа",
      "translation": "он прибыл"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִגִּיעָה",
      "transcription": "hигиá",
      "translation": "она прибыла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִגַּעְנוּ",
      "transcription": "hигáну",
      "translation": "мы прибыли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִגַּעְתֶּם / הִגַּעְתֶּן",
      "transcription": "hигатéм / hигатéн",
      "translation": "вы прибыли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִגִּיעוּ",
      "transcription": "hигиӯ",
      "translation": "они прибыли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַגִּיעַ",
      "transcription": "агӣа",
      "translation": "я прибуду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּגִּיעַ",
      "transcription": "тагӣа",
      "translation": "ты прибудешь / она прибудет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּגִּיעִי",
      "transcription": "тагиӣ",
      "translation": "ты прибудешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַגִּיעַ",
      "transcription": "йагӣа",
      "translation": "он прибудет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַגִּיעַ",
      "transcription": "нагӣа",
      "translation": "мы прибудем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּגִּיעוּ",
      "transcription": "тагиӯ",
      "translation": "вы прибудете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַגִּיעוּ",
      "transcription": "йагиӯ",
      "translation": "они прибудут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַגַּע",
      "transcription": "hагá",
      "translation": "прибудь (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַגִּיעִי",
      "transcription": "hагиӣ",
      "translation": "прибудь (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַגִּיעוּ",
      "transcription": "hагиӯ",
      "translation": "прибудьте"
    }
  ]
},
  'להסביר': {
  "infinitive": {
    "hebrew": "לְהַסְבִּיר",
    "transcription": "леhасбӣр",
    "translation": "объяснять"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ס-ב-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַסְבִּיר",
      "transcription": "масбӣр",
      "translation": "объясняет / объясняю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַסְבִּירָה",
      "transcription": "масбирá",
      "translation": "объясняет / объясняю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַסְבִּירִים",
      "transcription": "масбирӣм",
      "translation": "объясняют / объясняем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַסְבִּירוֹת",
      "transcription": "масбирóт",
      "translation": "объясняют / объясняем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִסְבַּרְתִּי",
      "transcription": "hисбáрти",
      "translation": "я объяснил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִסְבַּרְתָּ",
      "transcription": "hисбáрта",
      "translation": "ты объяснил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִסְבַּרְתְּ",
      "transcription": "hисбáрт",
      "translation": "ты объяснила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִסְבִּיר",
      "transcription": "hисбӣр",
      "translation": "он объяснил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִסְבִּירָה",
      "transcription": "hисбирá",
      "translation": "она объяснила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִסְבַּרְנוּ",
      "transcription": "hисбáрну",
      "translation": "мы объяснили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִסְבַּרְתֶּם / הִסְבַּרְתֶּן",
      "transcription": "hисбартéм / hисбартéн",
      "translation": "вы объяснили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִסְבִּירוּ",
      "transcription": "hисбирӯ",
      "translation": "они объяснили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַסְבִּיר",
      "transcription": "асбӣр",
      "translation": "я объясню"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּסְבִּיר",
      "transcription": "тасбӣр",
      "translation": "ты объяснишь / она объяснит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּסְבִּירִי",
      "transcription": "тасбирӣ",
      "translation": "ты объяснишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַסְבִּיר",
      "transcription": "йасбӣр",
      "translation": "он объяснит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַסְבִּיר",
      "transcription": "насбӣр",
      "translation": "мы объясним"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּסְבִּירוּ",
      "transcription": "тасбирӯ",
      "translation": "вы объясните"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַסְבִּירוּ",
      "transcription": "йасбирӯ",
      "translation": "они объяснят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַסְבֵּר",
      "transcription": "hасбéр",
      "translation": "объясни (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַסְבִּירִי",
      "transcription": "hасбирӣ",
      "translation": "объясни (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַסְבִּירוּ",
      "transcription": "hасбирӯ",
      "translation": "объясните"
    }
  ]
},
  'להכיר': {
  "infinitive": {
    "hebrew": "לְהַכִּיר",
    "transcription": "леhакӣр",
    "translation": "знать, знакомиться"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "נ-כ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַכִּיר",
      "transcription": "макӣр",
      "translation": "знает, знаком / знаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַכִּירָה",
      "transcription": "макирá",
      "translation": "знает, знакома / знаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַכִּירִים",
      "transcription": "макирӣм",
      "translation": "знают, знакомы / знаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַכִּירוֹת",
      "transcription": "макирóт",
      "translation": "знают, знакомы / знаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִכַּרְתִּי",
      "transcription": "hикáрти",
      "translation": "я знал(а) / познакомился"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִכַּרְתָּ",
      "transcription": "hикáрта",
      "translation": "ты знал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִכַּרְתְּ",
      "transcription": "hикáрт",
      "translation": "ты знала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִכִּיר",
      "transcription": "hикӣр",
      "translation": "он знал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִכִּירָה",
      "transcription": "hикирá",
      "translation": "она знала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִכַּרְנוּ",
      "transcription": "hикáрну",
      "translation": "мы знали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִכַּרְתֶּם / הִכַּרְתֶּן",
      "transcription": "hикартéм / hикартéн",
      "translation": "вы знали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִכִּירוּ",
      "transcription": "hикирӯ",
      "translation": "они знали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַכִּיר",
      "transcription": "акӣр",
      "translation": "я познакомлюсь / узнаю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּכִּיר",
      "transcription": "такӣр",
      "translation": "ты познакомишься / она познакомится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּכִּירִי",
      "transcription": "такирӣ",
      "translation": "ты познакомишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַכִּיר",
      "transcription": "йакӣр",
      "translation": "он познакомится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַכִּיר",
      "transcription": "накӣр",
      "translation": "мы познакомимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּכִּירוּ",
      "transcription": "такирӯ",
      "translation": "вы познакомитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַכִּירוּ",
      "transcription": "йакирӯ",
      "translation": "они познакомятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַכֵּר",
      "transcription": "hакéр",
      "translation": "познакомься (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַכִּירִי",
      "transcription": "hакирӣ",
      "translation": "познакомься (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַכִּירוּ",
      "transcription": "hакирӯ",
      "translation": "познакомьтесь"
    }
  ]
},
  'להתלבש': {
  "infinitive": {
    "hebrew": "לְהִתְלַבֵּשׁ",
    "transcription": "леhитлабéш",
    "translation": "одеваться"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ל-ב-ש",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְלַבֵּשׁ",
      "transcription": "митлабéш",
      "translation": "одевается / одеваюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְלַבֶּשֶׁת",
      "transcription": "митлабéшет",
      "translation": "одевается / одеваюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְלַבְּשִׁים",
      "transcription": "митлабшӣм",
      "translation": "одеваются / одеваемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְלַבְּשׁוֹת",
      "transcription": "митлабшóт",
      "translation": "одеваются / одеваемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְלַבַּשְׁתִּי",
      "transcription": "hитлабáшти",
      "translation": "я оделся / оделась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְלַבַּשְׁתָּ",
      "transcription": "hитлабáшта",
      "translation": "ты оделся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְלַבַּשְׁתְּ",
      "transcription": "hитлабáшт",
      "translation": "ты оделась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְלַבֵּשׁ",
      "transcription": "hитлабéш",
      "translation": "он оделся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְלַבְּשָׁה",
      "transcription": "hитлабшá",
      "translation": "она оделась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְלַבַּשְׁנוּ",
      "transcription": "hитлабáшну",
      "translation": "мы оделись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְלַבַּשְׁתֶּם / הִתְלַבַּשְׁתֶּן",
      "transcription": "hитлабаштéм / hитлабаштéн",
      "translation": "вы оделись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְלַבְּשׁוּ",
      "transcription": "hитлабшӯ",
      "translation": "они оделись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְלַבֵּשׁ",
      "transcription": "этлабéш",
      "translation": "я оденусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְלַבֵּשׁ",
      "transcription": "титлабéш",
      "translation": "ты оденешься / она оденется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְלַבְּשִׁי",
      "transcription": "титлабшӣ",
      "translation": "ты оденешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְלַבֵּשׁ",
      "transcription": "йитлабéш",
      "translation": "он оденется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְלַבֵּשׁ",
      "transcription": "нитлабéш",
      "translation": "мы оденемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְלַבְּשׁוּ",
      "transcription": "титлабшӯ",
      "translation": "вы оденетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְלַבְּשׁוּ",
      "transcription": "йитлабшӯ",
      "translation": "они оденутся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְלַבֵּשׁ",
      "transcription": "hитлабéш",
      "translation": "одевайся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְלַבְּשִׁי",
      "transcription": "hитлабшӣ",
      "translation": "одевайся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְלַבְּשׁוּ",
      "transcription": "hитлабшӯ",
      "translation": "одевайтесь"
    }
  ]
},
  'להשתמש': {
  "infinitive": {
    "hebrew": "לְהִשְׁתַּמֵּשׁ",
    "transcription": "леhиштаме́ш",
    "translation": "пользоваться, использовать"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ש-מ-ש",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִשְׁתַּמֵּשׁ",
      "transcription": "миштаме́ш",
      "translation": "пользуется / пользуюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִשְׁתַּמֶּשֶׁת",
      "transcription": "миштаме́шет",
      "translation": "пользуется / пользуюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִשְׁתַּמְּשִׁים",
      "transcription": "миштамшӣм",
      "translation": "пользуются / пользуемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִשְׁתַּמְּשׁוֹת",
      "transcription": "миштамшо́т",
      "translation": "пользуются / пользуемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִשְׁתַּמַּשְׁתִּי",
      "transcription": "hиштамáшти",
      "translation": "я пользовался / пользовалась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִשְׁתַּמַּשְׁתָּ",
      "transcription": "hиштамáшта",
      "translation": "ты пользовался"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִשְׁתַּמַּשְׁתְּ",
      "transcription": "hиштамáшт",
      "translation": "ты пользовалась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִשְׁתַּמֵּשׁ",
      "transcription": "hиштамéш",
      "translation": "он пользовался"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִשְׁתַּמְּשָׁה",
      "transcription": "hиштамшá",
      "translation": "она пользовалась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִשְׁתַּמַּשְׁנוּ",
      "transcription": "hиштамáшну",
      "translation": "мы пользовались"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִשְׁתַּמַּשְׁתֶּם / הִשְׁתַּמַּשְׁתֶּן",
      "transcription": "hиштамаштéм / hиштамаштéн",
      "translation": "вы пользовались"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִשְׁתַּמְּשׁוּ",
      "transcription": "hиштамшӯ",
      "translation": "они пользовались"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶשְׁתַּמֵּשׁ",
      "transcription": "эштамéш",
      "translation": "я воспользуюсь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּשְׁתַּמֵּשׁ",
      "transcription": "тиштамéш",
      "translation": "ты воспользуешься / она воспользуется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּשְׁתַּמְּשִׁי",
      "transcription": "тиштамшӣ",
      "translation": "ты воспользуешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִשְׁתַּמֵּשׁ",
      "transcription": "йиштамéш",
      "translation": "он воспользуется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִשְׁתַּמֵּשׁ",
      "transcription": "ништамéш",
      "translation": "мы воспользуемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּשְׁתַּמְּשׁוּ",
      "transcription": "тиштамшӯ",
      "translation": "вы воспользуетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִשְׁתַּמְּשׁוּ",
      "transcription": "йиштамшӯ",
      "translation": "они воспользуются"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִשְׁתַּמֵּשׁ",
      "transcription": "hиштамéш",
      "translation": "используй (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִשְׁתַּמְּשִׁי",
      "transcription": "hиштамшӣ",
      "translation": "используй (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִשְׁתַּמְּשׁוּ",
      "transcription": "hиштамшӯ",
      "translation": "используйте"
    }
  ]
},
  'להתקשר': {
  "infinitive": {
    "hebrew": "לְהִתְקַשֵּׁר",
    "transcription": "леhиткашéр",
    "translation": "звонить (по телефону), связываться"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ק-ש-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְקַשֵּׁר",
      "transcription": "миткашéр",
      "translation": "звонит / звоню (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְקַשֶּׁרֶת",
      "transcription": "миткашéрет",
      "translation": "звонит / звоню (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְקַשְׁרִים",
      "transcription": "миткашрӣм",
      "translation": "звонят / звоним (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְקַשְׁרוֹת",
      "transcription": "миткашрóт",
      "translation": "звонят / звоним (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְקַשַּׁרְתִּי",
      "transcription": "hиткашáрти",
      "translation": "я позвонил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְקַשַּׁרְתָּ",
      "transcription": "hиткашáрта",
      "translation": "ты позвонил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְקַשַּׁרְתְּ",
      "transcription": "hиткашáрт",
      "translation": "ты позвонила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְקַשֵּׁר",
      "transcription": "hиткашéр",
      "translation": "он позвонил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְקַשְׁרָה",
      "transcription": "hиткашрá",
      "translation": "она позвонила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְקַשַּׁרְנוּ",
      "transcription": "hиткашáрну",
      "translation": "мы позвонили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְקַשַּׁרְתֶּם / הִתְקַשַּׁרְתֶּן",
      "transcription": "hиткашартéм / hиткашартéн",
      "translation": "вы позвонили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְקַשְׁרוּ",
      "transcription": "hиткашрӯ",
      "translation": "они позвонили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְקַשֵּׁר",
      "transcription": "эткашéр",
      "translation": "я позвоню"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְקַשֵּׁר",
      "transcription": "титкашéр",
      "translation": "ты позвонишь / она позвонит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְקַשְׁרִי",
      "transcription": "титкашрӣ",
      "translation": "ты позвонишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְקַשֵּׁר",
      "transcription": "йиткашéр",
      "translation": "он позвонит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְקַשֵּׁר",
      "transcription": "ниткашéр",
      "translation": "мы позвоним"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְקַשְׁרוּ",
      "transcription": "титкашрӯ",
      "translation": "вы позвоните"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְקַשְׁרוּ",
      "transcription": "йиткашрӯ",
      "translation": "они позвонят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְקַשֵּׁר",
      "transcription": "hиткашéр",
      "translation": "позвони (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְקַשְׁרִי",
      "transcription": "hиткашрӣ",
      "translation": "позвони (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְקַשְׁרוּ",
      "transcription": "hиткашрӯ",
      "translation": "позвоните"
    }
  ]
},
  'לפתוח': {
  "infinitive": {
    "hebrew": "לִפְתֹּחַ",
    "transcription": "лифтóах",
    "translation": "открывать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "פ-ת-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "פּוֹתֵחַ",
      "transcription": "потéах",
      "translation": "открывает / открываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "פּוֹתַחַת",
      "transcription": "потáхат",
      "translation": "открывает / открываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "פּוֹתְחִים",
      "transcription": "потхӣм",
      "translation": "открывают / открываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "פּוֹתְחוֹת",
      "transcription": "потхóт",
      "translation": "открывают / открываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "פָּתַחְתִּי",
      "transcription": "патáхти",
      "translation": "я открыл(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "פָּתַחְתָּ",
      "transcription": "патáхта",
      "translation": "ты открыл"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "פָּתַחְתְּ",
      "transcription": "патáхт",
      "translation": "ты открыла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "פָּתַח",
      "transcription": "патáх",
      "translation": "он открыл"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "פָּתְחָה",
      "transcription": "патхá",
      "translation": "она открыла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "פָּתַחְנוּ",
      "transcription": "патáхну",
      "translation": "мы открыли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "פְּתַחְתֶּם / פְּתַחְתֶּן",
      "transcription": "птахтéм / птахтéн",
      "translation": "вы открыли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "פָּתְחוּ",
      "transcription": "патхӯ",
      "translation": "они открыли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶפְתַּח",
      "transcription": "эфтáх",
      "translation": "я открою"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּפְתַּח",
      "transcription": "тифтáх",
      "translation": "ты откроешь / она откроет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּפְתְּחִי",
      "transcription": "тифтэхӣ",
      "translation": "ты откроешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִפְתַּח",
      "transcription": "йифтáх",
      "translation": "он откроет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפְתַּח",
      "transcription": "нифтáх",
      "translation": "мы откроем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּפְתְּחוּ",
      "transcription": "тифтэхӯ",
      "translation": "вы откроете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִפְתְּחוּ",
      "transcription": "йифтэхӯ",
      "translation": "они откроют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "פְּתַח",
      "transcription": "птах",
      "translation": "открой (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "פִּתְחִי",
      "transcription": "питхӣ",
      "translation": "открой (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "פִּתְחוּ",
      "transcription": "питхӯ",
      "translation": "откройте"
    }
  ]
},
  'לסגור': {
  "infinitive": {
    "hebrew": "לִסְגֹּר",
    "transcription": "лисгóр",
    "translation": "закрывать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ס-ג-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "סוֹגֵר",
      "transcription": "согéр",
      "translation": "закрывает / закрываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "סוֹגֶרֶת",
      "transcription": "согéрет",
      "translation": "закрывает / закрываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "סוֹגְרִים",
      "transcription": "согрӣм",
      "translation": "закрывают / закрываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "סוֹגְרוֹת",
      "transcription": "согрóт",
      "translation": "закрывают / закрываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "סָגַרְתִּי",
      "transcription": "сагáрти",
      "translation": "я закрыл(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "סָגַרְתָּ",
      "transcription": "сагáрта",
      "translation": "ты закрыл"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "סָגַרְתְּ",
      "transcription": "сагáрт",
      "translation": "ты закрыла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "סָגַר",
      "transcription": "сагáр",
      "translation": "он закрыл"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "סָגְרָה",
      "transcription": "сагрá",
      "translation": "она закрыла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "סָגַרְנוּ",
      "transcription": "сагáрну",
      "translation": "мы закрыли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "סְגַרְתֶּם / סְגַרְתֶּן",
      "transcription": "сгартéм / сгартéн",
      "translation": "вы закрыли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "סָגְרוּ",
      "transcription": "сагрӯ",
      "translation": "они закрыли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶסְגֹּר",
      "transcription": "эсгóр",
      "translation": "я закрою"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּסְגֹּר",
      "transcription": "тисгóр",
      "translation": "ты закроешь / она закроет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּסְגְּרִי",
      "transcription": "тисгерӣ",
      "translation": "ты закроешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִסְגֹּר",
      "transcription": "йисгóр",
      "translation": "он закроет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִסְגֹּר",
      "transcription": "нисгóр",
      "translation": "мы закроем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּסְגְּרוּ",
      "transcription": "тисгерӯ",
      "translation": "вы закроете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִסְגְּרוּ",
      "transcription": "йисгерӯ",
      "translation": "они закроют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "סְגֹר",
      "transcription": "сгор",
      "translation": "закрой (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "סִגְרִי",
      "transcription": "сигрӣ",
      "translation": "закрой (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "סִגְרוּ",
      "transcription": "сигрӯ",
      "translation": "закройте"
    }
  ]
},
  'לעזור': {
  "infinitive": {
    "hebrew": "לַעֲזֹר",
    "transcription": "лаазóр",
    "translation": "помогать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ע-ז-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "עוֹזֵר",
      "transcription": "озéр",
      "translation": "помогает / помогаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "עוֹזֶרֶת",
      "transcription": "озéрет",
      "translation": "помогает / помогаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "עוֹזְרִים",
      "transcription": "озрӣм",
      "translation": "помогают / помогаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "עוֹזְרוֹת",
      "transcription": "озрóт",
      "translation": "помогают / помогаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "עָזַרְתִּי",
      "transcription": "азáрти",
      "translation": "я помог(ла)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "עָזַרְתָּ",
      "transcription": "азáрта",
      "translation": "ты помог"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "עָזַרְתְּ",
      "transcription": "азáрт",
      "translation": "ты помогла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "עָזַר",
      "transcription": "азáр",
      "translation": "он помог"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "עָזְרָה",
      "transcription": "азрá",
      "translation": "она помогла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "עָזַרְנוּ",
      "transcription": "азáрну",
      "translation": "мы помогли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "עֲזַרְתֶּם / עֲזַרְתֶּן",
      "transcription": "азартéм / азартéн",
      "translation": "вы помогли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "עָזְרוּ",
      "transcription": "азрӯ",
      "translation": "они помогли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶעֱזֹר",
      "transcription": "ээзóр",
      "translation": "я помогу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּעֲזֹר",
      "transcription": "таазóр",
      "translation": "ты поможешь / она поможет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּעַזְרִי",
      "transcription": "таазрӣ",
      "translation": "ты поможешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַעֲזֹר",
      "transcription": "йаазóр",
      "translation": "он поможет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַעֲזֹר",
      "transcription": "наазóр",
      "translation": "мы поможем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּעַזְרוּ",
      "transcription": "таазрӯ",
      "translation": "вы поможете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַעַזְרוּ",
      "transcription": "йаазрӯ",
      "translation": "они помогут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "עֲזֹר",
      "transcription": "азóр",
      "translation": "помоги (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "עִזְרִי",
      "transcription": "изрӣ",
      "translation": "помоги (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "עִזְרוּ",
      "transcription": "изрӯ",
      "translation": "помогите"
    }
  ]
},
  'למצוא': {
  "infinitive": {
    "hebrew": "לִמְצֹא",
    "transcription": "лимцó",
    "translation": "находить"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "מ-צ-א",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מוֹצֵא",
      "transcription": "моцé",
      "translation": "находит / нахожу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מוֹצֵאת",
      "transcription": "моцéт",
      "translation": "находит / нахожу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מוֹצְאִים",
      "transcription": "моц’ӣм",
      "translation": "находят / находим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מוֹצְאוֹת",
      "transcription": "моц’óт",
      "translation": "находят / находим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "מָצָאתִי",
      "transcription": "мацáти",
      "translation": "я нашел / нашла"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "מָצָאתָ",
      "transcription": "мацáта",
      "translation": "ты нашел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "מָצָאת",
      "transcription": "мацáт",
      "translation": "ты нашла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "מָצָא",
      "transcription": "мацá",
      "translation": "он нашел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "מָצְאָה",
      "transcription": "мац’á",
      "translation": "она нашла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "מָצָאנוּ",
      "transcription": "мацáну",
      "translation": "мы нашли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "מְצָאתֶם / מְצָאתֶן",
      "transcription": "мцатéм / мцатéн",
      "translation": "вы нашли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "מָצְאוּ",
      "transcription": "мац’ӯ",
      "translation": "они нашли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶמְצָא",
      "transcription": "эмцá",
      "translation": "я найду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּמְצָא",
      "transcription": "тимцá",
      "translation": "ты найдешь / она найдет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּמְצְאִי",
      "transcription": "тимцэ’ӣ",
      "translation": "ты найдешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִמְצָא",
      "transcription": "йимцá",
      "translation": "он найдет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִמְצָא",
      "transcription": "нимцá",
      "translation": "мы найдем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּמְצְאוּ",
      "transcription": "тимцэ’ӯ",
      "translation": "вы найдете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִמְצְאוּ",
      "transcription": "йимцэ’ӯ",
      "translation": "они найдут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "מְצָא",
      "transcription": "мца",
      "translation": "найди (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "מִצְאִי",
      "transcription": "миц’ӣ",
      "translation": "найди (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "מִצְאוּ",
      "transcription": "миц’ӯ",
      "translation": "найдите"
    }
  ]
},
  'לשים': {
  "infinitive": {
    "hebrew": "לָשִׂים",
    "transcription": "ласӣм",
    "translation": "класть, ставить"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ש-י-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "שָׂם",
      "transcription": "сам",
      "translation": "кладет / кладу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "שָׂמָה",
      "transcription": "самá",
      "translation": "кладет / кладу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "שָׂמִים",
      "transcription": "самӣм",
      "translation": "кладут / кладем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "שָׂמוֹת",
      "transcription": "самóт",
      "translation": "кладут / кладем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "שַׂמְתִּי",
      "transcription": "сáмти",
      "translation": "я положил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "שַׂמְתָּ",
      "transcription": "сáмта",
      "translation": "ты положил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "שַׂמְתְּ",
      "transcription": "сáмт",
      "translation": "ты положила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "שָׂם",
      "transcription": "сам",
      "translation": "он положил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "שָׂמָה",
      "transcription": "самá",
      "translation": "она положила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "שַׂמְנוּ",
      "transcription": "сáмну",
      "translation": "мы положили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "שַׂמְתֶּם / שַׂמְתֶּן",
      "transcription": "самтéм / самтéн",
      "translation": "вы положили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "שָׂמוּ",
      "transcription": "самӯ",
      "translation": "они положили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אָשִׂים",
      "transcription": "асӣм",
      "translation": "я положу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תָּשִׂים",
      "transcription": "тасӣм",
      "translation": "ты положишь / она положит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תָּשִׂימִי",
      "transcription": "тасимӣ",
      "translation": "ты положишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָשִׂים",
      "transcription": "йасӣм",
      "translation": "он положит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָשִׂים",
      "transcription": "насӣм",
      "translation": "мы положим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תָּשִׂימוּ",
      "transcription": "тасимӯ",
      "translation": "вы положите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָשִׂימוּ",
      "transcription": "йасимӯ",
      "translation": "они положат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שִׂים",
      "transcription": "сим",
      "translation": "положи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שִׂימִי",
      "transcription": "симӣ",
      "translation": "положи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שִׂימוּ",
      "transcription": "симӯ",
      "translation": "положите"
    }
  ]
},
  'לקום': {
  "infinitive": {
    "hebrew": "לָקוּם",
    "transcription": "лакӯм",
    "translation": "вставать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ק-ו-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "קָם",
      "transcription": "кам",
      "translation": "встает / встаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "קָמָה",
      "transcription": "камá",
      "translation": "встает / встаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "קָמִים",
      "transcription": "камӣм",
      "translation": "встают / встаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "קָמוֹת",
      "transcription": "камóт",
      "translation": "встают / встаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "קַמְתִּי",
      "transcription": "кáмти",
      "translation": "я встал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "קַמְתָּ",
      "transcription": "кáмта",
      "translation": "ты встал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "קַמְתְּ",
      "transcription": "кáмт",
      "translation": "ты встала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "קָם",
      "transcription": "кам",
      "translation": "он встал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "קָמָה",
      "transcription": "камá",
      "translation": "она встала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "קַמְנוּ",
      "transcription": "кáмну",
      "translation": "мы встали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "קַמְתֶּם / קַמְתֶּן",
      "transcription": "камтéм / камтéн",
      "translation": "вы встали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "קָמוּ",
      "transcription": "камӯ",
      "translation": "они встали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אָקוּם",
      "transcription": "акӯм",
      "translation": "я встану"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תָּקוּם",
      "transcription": "такӯм",
      "translation": "ты встанешь / она встанет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תָּקוּמִי",
      "transcription": "такумӣ",
      "translation": "ты встанешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָקוּם",
      "transcription": "йакӯм",
      "translation": "он встанет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָקוּם",
      "transcription": "накӯм",
      "translation": "мы встанем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תָּקוּמוּ",
      "transcription": "такумӯ",
      "translation": "вы встанете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָקוּמוּ",
      "transcription": "йакумӯ",
      "translation": "они встанут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "קוּם",
      "transcription": "кум",
      "translation": "встань (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "קוּמִי",
      "transcription": "кумӣ",
      "translation": "встань (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "קוּמוּ",
      "transcription": "кумӯ",
      "translation": "встаньте"
    }
  ]
},
  'לנוח': {
  "infinitive": {
    "hebrew": "לָנוּחַ",
    "transcription": "ланӯах",
    "translation": "отдыхать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "נ-ו-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נָח",
      "transcription": "нах",
      "translation": "отдыхает / отдыхаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נָחָה",
      "transcription": "нахá",
      "translation": "отдыхает / отдыхаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נָחִים",
      "transcription": "нахӣм",
      "translation": "отдыхают / отдыхаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נָחוֹת",
      "transcription": "нахóт",
      "translation": "отдыхают / отдыхаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נַחְתִּי",
      "transcription": "нáхти",
      "translation": "я отдохнул(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נַחְתָּ",
      "transcription": "нáхта",
      "translation": "ты отдохнул"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נַחְתְּ",
      "transcription": "нáхт",
      "translation": "ты отдохнула"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נָח",
      "transcription": "нах",
      "translation": "он отдохнул"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נָחָה",
      "transcription": "нахá",
      "translation": "она отдохнула"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַחְנוּ",
      "transcription": "нáхну",
      "translation": "мы отдохнули"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נַחְתֶּם / נַחְתֶּן",
      "transcription": "нахтéм / нахтéн",
      "translation": "вы отдохнули"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נָחוּ",
      "transcription": "нахӯ",
      "translation": "они отдохнули"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אָנוּחַ",
      "transcription": "анӯах",
      "translation": "я отдохну"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תָּנוּחַ",
      "transcription": "танӯах",
      "translation": "ты отдохнешь / она отдохнет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תָּנוּחִי",
      "transcription": "танӯхӣ",
      "translation": "ты отдохнешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָנוּחַ",
      "transcription": "йанӯах",
      "translation": "он отдохнет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָנוּחַ",
      "transcription": "нанӯах",
      "translation": "мы отдохнем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תָּנוּחוּ",
      "transcription": "танӯхӯ",
      "translation": "вы отдохнете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָנוּחוּ",
      "transcription": "йанӯхӯ",
      "translation": "они отдохнут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "נוּחַ",
      "transcription": "нӯах",
      "translation": "отдыхай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "נוּחִי",
      "transcription": "нӯхӣ",
      "translation": "отдыхай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "נוּחוּ",
      "transcription": "нӯхӯ",
      "translation": "отдыхайте"
    }
  ]
},
  'לישון': {
  "infinitive": {
    "hebrew": "לִישׁוֹן",
    "transcription": "лишóн",
    "translation": "спать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "י-ש-ן",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "יָשֵׁן",
      "transcription": "йашéн",
      "translation": "спит / сплю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "יְשֵׁנָה",
      "transcription": "йешенá",
      "translation": "спит / сплю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "יְשֵׁנִים",
      "transcription": "йешенӣм",
      "translation": "спят / спим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "יְשֵׁנוֹת",
      "transcription": "йешенóт",
      "translation": "спят / спим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "יָשַׁנְתִּי",
      "transcription": "йашáнти",
      "translation": "я спал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "יָשַׁנְתָּ",
      "transcription": "йашáнта",
      "translation": "ты спал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "יָשַׁנְתְּ",
      "transcription": "йашáнт",
      "translation": "ты спала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָשַׁן",
      "transcription": "йашáн",
      "translation": "он спал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "יָשְׁנָה",
      "transcription": "йашнá",
      "translation": "она спала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "יָשַׁנְנוּ",
      "transcription": "йашáнну",
      "translation": "мы спали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "יְשַׁנְתֶּם / יְשַׁנְתֶּן",
      "transcription": "йешантéм / йешантéн",
      "translation": "вы спали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָשְׁנוּ",
      "transcription": "йашнӯ",
      "translation": "они спали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אִישַׁן",
      "transcription": "ишáн",
      "translation": "я буду спать / посплю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּישַׁן",
      "transcription": "тишáн",
      "translation": "ты будешь спать / она будет спать"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּישְׁנִי",
      "transcription": "тишнӣ",
      "translation": "ты будешь спать (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִישַׁן",
      "transcription": "йишáн",
      "translation": "он будет спать"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִישַׁן",
      "transcription": "нишáн",
      "translation": "мы будем спать"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּישְׁנוּ",
      "transcription": "тишнӯ",
      "translation": "вы будете спать"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִישְׁנוּ",
      "transcription": "йишнӯ",
      "translation": "они будут спать"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שְׁכַב לִישׁוֹן / יְשַׁן",
      "transcription": "шкав лишон",
      "translation": "спи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שִׁכְבִי לִישׁוֹן / יִשְׁנִי",
      "transcription": "шихвӣ лишон",
      "translation": "спи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שִׁכְבוּ לִישׁוֹן / יִשְׁנוּ",
      "transcription": "шихвӯ лишон",
      "translation": "спите"
    }
  ]
},
  'לעלות': {
  "infinitive": {
    "hebrew": "לַעֲלוֹת",
    "transcription": "лаалóт",
    "translation": "подниматься, стоить, репатриироваться"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ע-ל-ה",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "עוֹלֶה",
      "transcription": "олé",
      "translation": "поднимается / стою (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "עוֹלָה",
      "transcription": "олá",
      "translation": "поднимается / стою (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "עוֹלִים",
      "transcription": "олӣм",
      "translation": "поднимаются / стоим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "עוֹלוֹת",
      "transcription": "олóт",
      "translation": "поднимаются / стоим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "עָלִיתִי",
      "transcription": "алӣти",
      "translation": "я поднялся / репатриировалась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "עָלִיתָ",
      "transcription": "алӣта",
      "translation": "ты поднялся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "עָלִית",
      "transcription": "алӣт",
      "translation": "ты поднялась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "עָלָה",
      "transcription": "алá",
      "translation": "он поднялся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "עָלְתָה",
      "transcription": "алтá",
      "translation": "она поднялась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "עָלִינוּ",
      "transcription": "алӣну",
      "translation": "мы поднялись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "עֲלִיתֶם / עֲלִיתֶן",
      "transcription": "алитéм / алитéн",
      "translation": "вы поднялись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "עָלוּ",
      "transcription": "алӯ",
      "translation": "они поднялись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶעֱלֶה",
      "transcription": "ээлé",
      "translation": "я поднимусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּעֲלֶה",
      "transcription": "таалé",
      "translation": "ты поднимешься / она поднимется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּעֲלִי",
      "transcription": "таалӣ",
      "translation": "ты поднимешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַעֲלֶה",
      "transcription": "йаалé",
      "translation": "он поднимется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַעֲלֶה",
      "transcription": "наалé",
      "translation": "мы поднимемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּעֲלוּ",
      "transcription": "таалӯ",
      "translation": "вы подниметесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַעֲלוּ",
      "transcription": "йаалӯ",
      "translation": "они поднимутся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "עֲלֵה",
      "transcription": "алé",
      "translation": "поднимайся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "עֲלִי",
      "transcription": "алӣ",
      "translation": "поднимайся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "עֲלוּ",
      "transcription": "алӯ",
      "translation": "поднимайтесь"
    }
  ]
},
  'לרדת': {
  "infinitive": {
    "hebrew": "לָרֶדֶת",
    "transcription": "ларéдет",
    "translation": "спускаться"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "י-ר-ד",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "יוֹרֵד",
      "transcription": "йорéд",
      "translation": "спускается / спускаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "יוֹרֶדֶת",
      "transcription": "йорéдет",
      "translation": "спускается / спускаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "יוֹרְדִים",
      "transcription": "йордӣм",
      "translation": "спускаются / спускаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "יוֹרְדוֹת",
      "transcription": "йордóт",
      "translation": "спускаются / спускаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "יָרַדְתִּי",
      "transcription": "йарáдти",
      "translation": "я спустился / спустилась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "יָרַדְתָּ",
      "transcription": "йарáдта",
      "translation": "ты спустился"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "יָרַדְתְּ",
      "transcription": "йарáдт",
      "translation": "ты спустилась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָרַד",
      "transcription": "йарáд",
      "translation": "он спустился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "יָרְדָה",
      "transcription": "йардá",
      "translation": "она спустилась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "יָרַדְנוּ",
      "transcription": "йарáдну",
      "translation": "мы спустились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "יְרַדְתֶּם / יְרַדְתֶּן",
      "transcription": "йерадтéм / йерадтéн",
      "translation": "вы спустились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָרְדוּ",
      "transcription": "йардӯ",
      "translation": "они спустились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֵרֵד",
      "transcription": "эрéд",
      "translation": "я спущусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תֵּרֵד",
      "transcription": "терéд",
      "translation": "ты спустишься / она спустится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תֵּרְדִי",
      "transcription": "тердӣ",
      "translation": "ты спустишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יֵרֵד",
      "transcription": "йерéд",
      "translation": "он спустится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נֵרֵד",
      "transcription": "нерéд",
      "translation": "мы спустимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תֵּרְדוּ",
      "transcription": "тердӯ",
      "translation": "вы спуститесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יֵרְדוּ",
      "transcription": "йердӯ",
      "translation": "они спустятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "רֵד",
      "transcription": "ред",
      "translation": "спускайся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "רְדִי",
      "transcription": "рдӣ",
      "translation": "спускайся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "רְדוּ",
      "transcription": "рдӯ",
      "translation": "спускайтесь"
    }
  ]
},
  'לצאת': {
  "infinitive": {
    "hebrew": "לָצֵאת",
    "transcription": "лацéт",
    "translation": "выходить"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "י-צ-א",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "יוֹצֵא",
      "transcription": "йоцé",
      "translation": "выходит / выхожу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "יוֹצֵאת",
      "transcription": "йоцéт",
      "translation": "выходит / выхожу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "יוֹצְאִים",
      "transcription": "йоц’ӣм",
      "translation": "выходят / выходим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "יוֹצְאוֹת",
      "transcription": "йоц’óт",
      "translation": "выходят / выходим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "יָצָאתִי",
      "transcription": "йацáти",
      "translation": "я вышел / вышла"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "יָצָאתָ",
      "transcription": "йацáта",
      "translation": "ты вышел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "יָצָאת",
      "transcription": "йацáт",
      "translation": "ты вышла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָצָא",
      "transcription": "йацá",
      "translation": "он вышел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "יָצְאָה",
      "transcription": "йац’á",
      "translation": "она вышла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "יָצָאנוּ",
      "transcription": "йацáну",
      "translation": "мы вышли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "יְצָאתֶם / יְצָאתֶן",
      "transcription": "йецатéм / йецатéн",
      "translation": "вы вышли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָצְאוּ",
      "transcription": "йац’ӯ",
      "translation": "они вышли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֵצֵא",
      "transcription": "эцé",
      "translation": "я выйду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תֵּצֵא",
      "transcription": "тецé",
      "translation": "ты выйдешь / она выйдет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תֵּצְאִי",
      "transcription": "тец’ӣ",
      "translation": "ты выйдешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יֵצֵא",
      "transcription": "йецé",
      "translation": "он выйдет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נֵצֵא",
      "transcription": "нецé",
      "translation": "мы выйдем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תֵּצְאוּ",
      "transcription": "тец’ӯ",
      "translation": "вы выйдете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יֵצְאוּ",
      "transcription": "йец’ӯ",
      "translation": "они выйдут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "צֵא",
      "transcription": "це",
      "translation": "выйди (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "צְאִי",
      "transcription": "цэ’ӣ",
      "translation": "выйди (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "צְאוּ",
      "transcription": "цэ’ӯ",
      "translation": "выйдите"
    }
  ]
},
  'לשבת': {
  "infinitive": {
    "hebrew": "לָשֶׁבֶת",
    "transcription": "лашéвет",
    "translation": "сидеть"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "י-ש-ב",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "יוֹשֵׁב",
      "transcription": "йошéв",
      "translation": "сидит / сижу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "יוֹשֶׁבֶת",
      "transcription": "йошéвет",
      "translation": "сидит / сижу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "יוֹשְׁבִים",
      "transcription": "йошвӣм",
      "translation": "сидят / сидим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "יוֹשְׁבוֹת",
      "transcription": "йошвóт",
      "translation": "сидят / сидим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "יָשַׁבְתִּי",
      "transcription": "йашáвти",
      "translation": "я сидел(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "יָשַׁבְתָּ",
      "transcription": "йашáвта",
      "translation": "ты сидел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "יָשַׁבְתְּ",
      "transcription": "йашáвт",
      "translation": "ты сидела"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָשַׁב",
      "transcription": "йашáв",
      "translation": "он сидел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "יָשְׁבָה",
      "transcription": "йашвá",
      "translation": "она сидела"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "יָשַׁבְנוּ",
      "transcription": "йашáвну",
      "translation": "мы сидели"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "יְשַׁבְתֶּם / יְשַׁבְתֶּן",
      "transcription": "йешавтéм / йешавтéн",
      "translation": "вы сидели"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָשְׁבוּ",
      "transcription": "йашвӯ",
      "translation": "они сидели"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֵשֵׁב",
      "transcription": "эшéв",
      "translation": "я сяду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תֵּשֵׁב",
      "transcription": "тешéв",
      "translation": "ты сядешь / она сядет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תֵּשְׁבִי",
      "transcription": "тешвӣ",
      "translation": "ты сядешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יֵשֵׁב",
      "transcription": "йешéв",
      "translation": "он сядет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נֵשֵׁב",
      "transcription": "нешéв",
      "translation": "мы сядем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תֵּשְׁבוּ",
      "transcription": "тешвӯ",
      "translation": "вы сядете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יֵשְׁבוּ",
      "transcription": "йешвӯ",
      "translation": "они сядут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שֵׁב",
      "transcription": "шев",
      "translation": "сядь / сиди (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שְׁבִי",
      "transcription": "швӣ",
      "translation": "сядь / сиди (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שְׁבוּ",
      "transcription": "швӯ",
      "translation": "сядьте / сидите"
    }
  ]
},
  'לקחת': {
  "infinitive": {
    "hebrew": "לָקַחַת",
    "transcription": "лакáхат",
    "translation": "брать, взять"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ל-ק-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "לוֹקֵחַ",
      "transcription": "локéах",
      "translation": "берет / беру (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "לוֹקַחַת",
      "transcription": "локáхат",
      "translation": "берет / беру (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "לוֹקְחִים",
      "transcription": "локхӣм",
      "translation": "берут / берем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "לוֹקְחוֹת",
      "transcription": "локхóт",
      "translation": "берут / берем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "לָקַחְתִּי",
      "transcription": "лакáхти",
      "translation": "я взял(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "לָקַחְתָּ",
      "transcription": "лакáхта",
      "translation": "ты взял"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "לָקַחְתְּ",
      "transcription": "лакáхт",
      "translation": "ты взяла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "לָקַח",
      "transcription": "лакáх",
      "translation": "он взял"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "לָקְחָה",
      "transcription": "лакхá",
      "translation": "она взяла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "לָקַחְנוּ",
      "transcription": "лакáхну",
      "translation": "мы взяли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "לְקַחְתֶּם / לְקַחְתֶּן",
      "transcription": "лекахтéм / лекахтéн",
      "translation": "вы взяли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "לָקְחוּ",
      "transcription": "лакхӯ",
      "translation": "они взяли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶקַּח",
      "transcription": "экáх",
      "translation": "я возьму"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּקַּח",
      "transcription": "тикáх",
      "translation": "ты возьмешь / она возьмет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּקְחִי",
      "transcription": "тикхӣ",
      "translation": "ты возьмешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִקַּח",
      "transcription": "йикáх",
      "translation": "он возьмет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִקַּח",
      "transcription": "никáх",
      "translation": "мы возьмем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּקְחוּ",
      "transcription": "тикхӯ",
      "translation": "вы возьмете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִקְחוּ",
      "transcription": "йикхӯ",
      "translation": "они возьмут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "קַח",
      "transcription": "ках",
      "translation": "возьми (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "קְחִי",
      "transcription": "кхӣ",
      "translation": "возьми (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "קְחוּ",
      "transcription": "кхӯ",
      "translation": "возьмите"
    }
  ]
},
  'ללבוש': {
  "infinitive": {
    "hebrew": "לִלְבֹּשׁ",
    "transcription": "лильбóш",
    "translation": "надевать одежду"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ל-ב-ש",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "לוֹבֵשׁ",
      "transcription": "ловéш",
      "translation": "надевает / надеваю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "לוֹבֶשֶׁת",
      "transcription": "ловéшет",
      "translation": "надевает / надеваю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "לוֹבְשִׁים",
      "transcription": "ловшӣм",
      "translation": "надевают / надеваем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "לוֹבְשׁוֹת",
      "transcription": "ловшóт",
      "translation": "надевают / надеваем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "לָבַשְׁתִּי",
      "transcription": "лавáшти",
      "translation": "я надел(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "לָבַשְׁתָּ",
      "transcription": "лавáшта",
      "translation": "ты надел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "לָבַשְׁתְּ",
      "transcription": "лавáшт",
      "translation": "ты надела"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "לָבַשׁ",
      "transcription": "лавáш",
      "translation": "он надел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "לָבְשָׁה",
      "transcription": "лавшá",
      "translation": "она надела"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "לָבַשְׁנוּ",
      "transcription": "лавáшну",
      "translation": "мы надели"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "לְבַשְׁתֶּם / לְבַשְׁתֶּן",
      "transcription": "леваштéм / леваштéн",
      "translation": "вы надели"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "לָבְשׁוּ",
      "transcription": "лавшӯ",
      "translation": "они надели"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶלְבַּשׁ",
      "transcription": "эльбáш",
      "translation": "я надену"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּלְבַּשׁ",
      "transcription": "тильбáш",
      "translation": "ты наденешь / она наденет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּלְבְּשִׁי",
      "transcription": "тильбешӣ",
      "translation": "ты наденешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִלְבַּשׁ",
      "transcription": "йильбáш",
      "translation": "он наденет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִלְבַּשׁ",
      "transcription": "нильбáш",
      "translation": "мы наденем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּלְבְּשׁוּ",
      "transcription": "тильбешӯ",
      "translation": "вы наденете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִלְבְּשׁוּ",
      "transcription": "йильбешӯ",
      "translation": "они наденут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "לְבַשׁ",
      "transcription": "льваш",
      "translation": "надень (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "לִבְשִׁי",
      "transcription": "лившӣ",
      "translation": "надень (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "לִבְשׁוּ",
      "transcription": "лившӯ",
      "translation": "наденьте"
    }
  ]
},
  'לסדוק': {
  "infinitive": {
    "hebrew": "לִסְדֹּק",
    "transcription": "лисдóк",
    "translation": "раскалывать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ס-ד-ק",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "סוֹדֵק",
      "transcription": "содéк",
      "translation": "раскалывает (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "סוֹדֶקֶת",
      "transcription": "содéкет",
      "translation": "раскалывает (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "סוֹדְקִים",
      "transcription": "содкӣм",
      "translation": "раскалывают (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "סוֹדְקוֹת",
      "transcription": "содкóт",
      "translation": "раскалывают (ж.р.)"
    }
  ],
  "past": [
    { "pronoun": "אֲנִי (я)", "hebrew": "סָדַקְתִּי", "transcription": "садáкти", "translation": "я расколол(а)" },
    { "pronoun": "אַתָּה (ты м.р.)", "hebrew": "סָדַקְתָּ", "transcription": "садáкта", "translation": "ты расколол" },
    { "pronoun": "אַתְּ (ты ж.р.)", "hebrew": "סָדַקְתְּ", "transcription": "садáкт", "translation": "ты расколола" },
    { "pronoun": "הוּא (он)", "hebrew": "סָדַק", "transcription": "садáк", "translation": "он расколол" },
    { "pronoun": "הִיא (она)", "hebrew": "סָדְקָה", "transcription": "садкá", "translation": "она расколола" },
    { "pronoun": "אֲנַחְנוּ (мы)", "hebrew": "סָדַקְנוּ", "transcription": "садáкну", "translation": "мы раскололи" },
    { "pronoun": "אַתֶּם / אַתֶּן (вы)", "hebrew": "סְדַקְתֶּם / סְדַקְתֶּן", "transcription": "сдактéм / сдактéн", "translation": "вы раскололи" },
    { "pronoun": "הֵם / הֵן (они)", "hebrew": "סָדְקוּ", "transcription": "садкӯ", "translation": "они раскололи" }
  ],
  "future": [
    { "pronoun": "אֲנִי (я)", "hebrew": "אֶסְדֹּק", "transcription": "эсдóк", "translation": "я расколю" },
    { "pronoun": "אַתָּה / הִיא (ты м.р. / она)", "hebrew": "תִּסְדֹּק", "transcription": "тисдóк", "translation": "ты расколешь / она расколет" },
    { "pronoun": "אַתְּ (ты ж.р.)", "hebrew": "תִּסְדְּקִי", "transcription": "тисдекӣ", "translation": "ты расколешь (ж.р.)" },
    { "pronoun": "הוּא (он)", "hebrew": "יִסְדֹּק", "transcription": "йисдóк", "translation": "он расколет" },
    { "pronoun": "אֲנַחְנוּ (мы)", "hebrew": "נִסְדֹּק", "transcription": "нисдóк", "translation": "мы расколем" },
    { "pronoun": "אַתֶּם / אַתֶּן (вы)", "hebrew": "תִּסְדְּקוּ", "transcription": "тисдекӯ", "translation": "вы расколете" },
    { "pronoun": "הֵם / הֵן (они)", "hebrew": "יִסְדְּקוּ", "transcription": "йисдекӯ", "translation": "они расколют" }
  ],
  "imperative": [
    { "pronoun": "אַתָּה (м.р.)", "hebrew": "סְדֹק", "transcription": "сдок", "translation": "расколи (м.р.)" },
    { "pronoun": "אַתְּ (ж.р.)", "hebrew": "סִדְקִי", "transcription": "сидкӣ", "translation": "расколи (ж.р.)" },
    { "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)", "hebrew": "סִדְקוּ", "transcription": "сидкӯ", "translation": "расколите" }
  ]
},
  'לנהוג': {
  "infinitive": {
    "hebrew": "לִנְהֹג",
    "transcription": "линhóг",
    "translation": "водить машину, вести себя, иметь обыкновение"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "נ-ה-ג",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נוֹהֵג",
      "transcription": "ноhéг",
      "translation": "водит / вожу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נוֹהֶגֶת",
      "transcription": "ноhéгет",
      "translation": "водит / вожу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נוֹהֲגִים",
      "transcription": "ноhагӣм",
      "translation": "водят / водим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נוֹהֲגוֹת",
      "transcription": "ноhагóт",
      "translation": "водят / водим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נָהַגְתִּי",
      "transcription": "наháгти",
      "translation": "я вел(а) машину"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נָהַגְתָּ",
      "transcription": "наháгта",
      "translation": "ты вел машину"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נָהַגְתְּ",
      "transcription": "наháгт",
      "translation": "ты вела машину"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נָהַג",
      "transcription": "наháг",
      "translation": "он вел машину"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נָהֲגָה",
      "transcription": "наhагá",
      "translation": "она вела машину"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָהַגְנוּ",
      "transcription": "наháгну",
      "translation": "мы вели машину"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נְהַגְתֶּם / נְהַגְתֶּן",
      "transcription": "нhагтéм / нhагтéн",
      "translation": "вы вели машину"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נָהֲגוּ",
      "transcription": "наhагӯ",
      "translation": "они вели машину"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶנְהַג",
      "transcription": "энháг",
      "translation": "я буду водить"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּנְהַג",
      "transcription": "тинháг",
      "translation": "ты будешь водить / она будет водить"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּנְהֲגִי",
      "transcription": "тинhагӣ",
      "translation": "ты будешь водить (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִנְהַג",
      "transcription": "йинháг",
      "translation": "он будет водить"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִנְהַג",
      "transcription": "нинháг",
      "translation": "мы будем водить"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּנְהֲגוּ",
      "transcription": "тинhагӯ",
      "translation": "вы будете водить"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִנְהֲגוּ",
      "transcription": "йинhагӯ",
      "translation": "они будут водить"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "נְהַג",
      "transcription": "нhаг",
      "translation": "веди машину (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "נַהֲגִי",
      "transcription": "наhагӣ",
      "translation": "веди машину (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "נַהֲגוּ",
      "transcription": "наhагӯ",
      "translation": "ведите машину"
    }
  ]
},
  'לרכוב': {
  "infinitive": {
    "hebrew": "לִרְכֹּב",
    "transcription": "лиркóв",
    "translation": "ехать верхом, кататься на велосипеде"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ר-כ-ב",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "רוֹכֵב",
      "transcription": "рохéв",
      "translation": "едет верхом / еду (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "רוֹכֶבֶת",
      "transcription": "рохéвет",
      "translation": "едет верхом / еду (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "רוֹכְבִים",
      "transcription": "рохвӣм",
      "translation": "едут верхом / едем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "רוֹכְבוֹת",
      "transcription": "рохвóт",
      "translation": "едут верхом / едем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "רָכַבְתִּי",
      "transcription": "рахáвти",
      "translation": "я ехал(а) верхом"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "רָכַבְתָּ",
      "transcription": "рахáвта",
      "translation": "ты ехал верхом"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "רָכַבְתְּ",
      "transcription": "рахáвт",
      "translation": "ты ехала верхом"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "רָכַב",
      "transcription": "рахáв",
      "translation": "он ехал верхом"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "רָכְבָה",
      "transcription": "рахвá",
      "translation": "она ехала верхом"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "רָכַבְנוּ",
      "transcription": "рахáвну",
      "translation": "мы ехали верхом"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "רְכַבְתֶּם / רְכַבְתֶּן",
      "transcription": "рхавтéм / рхавтéн",
      "translation": "вы ехали верхом"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "רָכְבוּ",
      "transcription": "рахвӯ",
      "translation": "они ехали верхом"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶרְכַּב",
      "transcription": "эркáв",
      "translation": "я поеду верхом"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּרְכַּב",
      "transcription": "тиркáв",
      "translation": "ты поедешь верхом / она поедет верхом"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּרְכְּבִי",
      "transcription": "тиркевӣ",
      "translation": "ты поедешь верхом (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִרְכַּב",
      "transcription": "йиркáв",
      "translation": "он поедет верхом"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִרְכַּב",
      "transcription": "ниркáв",
      "translation": "мы поедем верхом"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּרְכְּבוּ",
      "transcription": "тиркевӯ",
      "translation": "вы поедете верхом"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִרְכְּבוּ",
      "transcription": "йиркевӯ",
      "translation": "они поедут верхом"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "רְכַב",
      "transcription": "рхав",
      "translation": "езжай верхом (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "רִכְבִי",
      "transcription": "рихвӣ",
      "translation": "езжай верхом (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "רִכְבוּ",
      "transcription": "рихвӯ",
      "translation": "езжайте верхом"
    }
  ]
},
  'לחתוך': {
  "infinitive": {
    "hebrew": "לַחְתּוֹךְ",
    "transcription": "лахтóх",
    "translation": "резать, нарезать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ח-ת-ך",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "חוֹתֵךְ",
      "transcription": "хотéх",
      "translation": "режет / режу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "חוֹתֶכֶת",
      "transcription": "хотéхет",
      "translation": "режет / режу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "חוֹתְכִים",
      "transcription": "хотхӣм",
      "translation": "режут / режем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "חוֹתְכוֹת",
      "transcription": "хотхóт",
      "translation": "режут / режем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "חָתַכְתִּי",
      "transcription": "хатáхти",
      "translation": "я порезал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "חָתַכְתָּ",
      "transcription": "хатáхта",
      "translation": "ты порезал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "חָתַכְתְּ",
      "transcription": "хатáхт",
      "translation": "ты порезала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "חָתַךְ",
      "transcription": "хатáх",
      "translation": "он порезал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "חָתְכָה",
      "transcription": "хатхá",
      "translation": "она порезала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "חָתַכְנוּ",
      "transcription": "хатáхну",
      "translation": "мы порезали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "חֲתַכְתֶּם / חֲתַכְתֶּן",
      "transcription": "хатахтéм / хатахтéн",
      "translation": "вы порезали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "חָתְכוּ",
      "transcription": "хатхӯ",
      "translation": "они порезали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶחְתֹּךְ",
      "transcription": "эхтóх",
      "translation": "я нарежу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּחְתֹּךְ",
      "transcription": "тахтóх",
      "translation": "ты нарежешь / она нарежет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּחְתְּכִי",
      "transcription": "тахтехӣ",
      "translation": "ты нарежешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַחְתֹּךְ",
      "transcription": "йахтóх",
      "translation": "он нарежет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַחְתֹּךְ",
      "transcription": "нахтóх",
      "translation": "мы нарежем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּחְתְּכוּ",
      "transcription": "тахтехӯ",
      "translation": "вы нарежете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַחְתְּכוּ",
      "transcription": "йахтехӯ",
      "translation": "они нарежут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "חֲתֹךְ",
      "transcription": "хатóх",
      "translation": "режь (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "חִתְכִי",
      "transcription": "хитхӣ",
      "translation": "режь (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "חִתְכוּ",
      "transcription": "хитхӯ",
      "translation": "режьте"
    }
  ]
},
  'לשבור': {
  "infinitive": {
    "hebrew": "לִשְׁבֹּר",
    "transcription": "лишбóр",
    "translation": "ломать, разбивать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ש-ב-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "שׁוֹבֵר",
      "transcription": "шовéр",
      "translation": "ломает / ломаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "שׁוֹבֶרֶת",
      "transcription": "шовéрет",
      "translation": "ломает / ломаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "שׁוֹבְרִים",
      "transcription": "шоврӣм",
      "translation": "ломают / ломаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "שׁוֹבְרוֹת",
      "transcription": "шоврóт",
      "translation": "ломают / ломаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "שָׁבַרְתִּי",
      "transcription": "шавáрти",
      "translation": "я сломал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "שָׁבַרְתָּ",
      "transcription": "шавáрта",
      "translation": "ты сломал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "שָׁבַרְתְּ",
      "transcription": "шавáрт",
      "translation": "ты сломала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "שָׁבַר",
      "transcription": "шавáр",
      "translation": "он сломал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "שָׁבְרָה",
      "transcription": "шаврá",
      "translation": "она сломала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "שָׁבַרְנוּ",
      "transcription": "шавáрну",
      "translation": "мы сломали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "שְׁבַרְתֶּם / שְׁבַרְתֶּן",
      "transcription": "швартéм / швартéн",
      "translation": "вы сломали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "שָׁבְרוּ",
      "transcription": "шаврӯ",
      "translation": "они сломали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶשְׁבֹּר",
      "transcription": "эшбóр",
      "translation": "я сломаю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּשְׁבֹּר",
      "transcription": "тишбóр",
      "translation": "ты сломаешь / она сломает"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּשְׁבְּרִי",
      "transcription": "тишберӣ",
      "translation": "ты сломаешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִשְׁבֹּר",
      "transcription": "йишбóр",
      "translation": "он сломает"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִשְׁבֹּר",
      "transcription": "нишбóр",
      "translation": "мы сломаем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּשְׁבְּרוּ",
      "transcription": "тишберӯ",
      "translation": "вы сломаете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִשְׁבְּרוּ",
      "transcription": "йишберӯ",
      "translation": "они сломают"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שְׁבֹר",
      "transcription": "шбор",
      "translation": "сломай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שִׁבְרִי",
      "transcription": "шиврӣ",
      "translation": "сломай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שִׁבְרוּ",
      "transcription": "шиврӯ",
      "translation": "сломайте"
    }
  ]
},
  'לזרוק': {
  "infinitive": {
    "hebrew": "לִזְרֹק",
    "transcription": "лизрóк",
    "translation": "бросать, выкидывать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ז-ר-ק",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "זוֹרֵק",
      "transcription": "зорéк",
      "translation": "бросает / бросаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "זוֹרֶקֶת",
      "transcription": "зорéкет",
      "translation": "бросает / бросаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "זוֹרְקִים",
      "transcription": "зоркӣм",
      "translation": "бросают / бросаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "זוֹרְקוֹת",
      "transcription": "зоркóт",
      "translation": "бросают / бросаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "זָרַקְתִּי",
      "transcription": "зарáкти",
      "translation": "я бросил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "זָרַקְתָּ",
      "transcription": "зарáкта",
      "translation": "ты бросил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "זָרַקְתְּ",
      "transcription": "зарáкт",
      "translation": "ты бросила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "זָרַק",
      "transcription": "зарáк",
      "translation": "он бросил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "זָרְקָה",
      "transcription": "заркá",
      "translation": "она бросила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "זָרַקְנוּ",
      "transcription": "зарáкну",
      "translation": "мы бросили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "זְרַקְתֶּם / זְרַקְתֶּן",
      "transcription": "зрактéм / зрактéн",
      "translation": "вы бросили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "זָרְקוּ",
      "transcription": "заркӯ",
      "translation": "они бросили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶזְרֹק",
      "transcription": "эзрóк",
      "translation": "я брошу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּזְרֹק",
      "transcription": "тизрóк",
      "translation": "ты бросишь / она бросит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּזְרְקִי",
      "transcription": "тизрекӣ",
      "translation": "ты бросишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִזְרֹק",
      "transcription": "йизрóк",
      "translation": "он бросит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִזְרֹק",
      "transcription": "низрóк",
      "translation": "мы бросим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּזְרְקוּ",
      "transcription": "тизрекӯ",
      "translation": "вы бросите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִזְרְקוּ",
      "transcription": "йизрекӯ",
      "translation": "они бросят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "זְרֹק",
      "transcription": "зрок",
      "translation": "брось (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "זִרְקִי",
      "transcription": "зиркӣ",
      "translation": "брось (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "זִרְקוּ",
      "transcription": "зиркӯ",
      "translation": "бросьте"
    }
  ]
},
  'לתפוס': {
  "infinitive": {
    "hebrew": "לִתְפֹּס",
    "transcription": "литпóс",
    "translation": "ловить, занимать место, понимать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ת-פ-ס",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "תּוֹפֵס",
      "transcription": "тофéс",
      "translation": "ловит / ловлю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "תּוֹפֶסֶת",
      "transcription": "тофéсет",
      "translation": "ловит / ловлю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "תּוֹפְסִים",
      "transcription": "тофсӣм",
      "translation": "ловят / ловим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "תּוֹפְסוֹת",
      "transcription": "тофсóт",
      "translation": "ловят / ловим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "תָּפַסְתִּי",
      "transcription": "тафáсти",
      "translation": "я поймал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "תָּפַסְתָּ",
      "transcription": "тафáста",
      "translation": "ты поймал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תָּפַסְתְּ",
      "transcription": "тафáст",
      "translation": "ты поймала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "תָּפַס",
      "transcription": "тафáс",
      "translation": "он поймал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "תָּפְסָה",
      "transcription": "тафсá",
      "translation": "она поймала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "תָּפַסְנוּ",
      "transcription": "тафáсну",
      "translation": "мы поймали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּפַסְתֶּם / תְּפַסְתֶּן",
      "transcription": "тфастéм / тфастéн",
      "translation": "вы поймали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "תָּפְסוּ",
      "transcription": "тафсӯ",
      "translation": "они поймали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְפֹּס",
      "transcription": "этпóс",
      "translation": "я поймаю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְפֹּס",
      "transcription": "титпóс",
      "translation": "ты поймаешь / она поймает"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְפְּסִי",
      "transcription": "титпесӣ",
      "translation": "ты поймаешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְפֹּס",
      "transcription": "йитпóс",
      "translation": "он поймает"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְפֹּס",
      "transcription": "нитпóс",
      "translation": "мы поймаем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְפְּסוּ",
      "transcription": "титпесӯ",
      "translation": "вы поймаете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְפְּסוּ",
      "transcription": "йитпесӯ",
      "translation": "они поймают"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "תְּפֹס",
      "transcription": "тфос",
      "translation": "лови (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "תִּפְסִי",
      "transcription": "тифсӣ",
      "translation": "лови (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "תִּפְסוּ",
      "transcription": "тифсӯ",
      "translation": "ловите"
    }
  ]
},
  'ליפול': {
  "infinitive": {
    "hebrew": "לִפֹּל",
    "transcription": "липóль",
    "translation": "падать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "נ-פ-ל",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נוֹפֵל",
      "transcription": "нофéль",
      "translation": "падает / падаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נוֹפֶלֶת",
      "transcription": "нофéлет",
      "translation": "падает / падаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נוֹפְלִים",
      "transcription": "нофлӣм",
      "translation": "падают / падаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נוֹפְלוֹת",
      "transcription": "нофлóт",
      "translation": "падают / падаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נָפַלְתִּי",
      "transcription": "нафáльти",
      "translation": "я упал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נָפַלְתָּ",
      "transcription": "нафáльта",
      "translation": "ты упал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נָפַלְתְּ",
      "transcription": "нафáльт",
      "translation": "ты упала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נָפַל",
      "transcription": "нафáль",
      "translation": "он упал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נָפְלָה",
      "transcription": "нафлá",
      "translation": "она упала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָפַלְנוּ",
      "transcription": "нафáльну",
      "translation": "мы упали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נְפַלְתֶּם / נְפַלְתֶּן",
      "transcription": "нфальтéм / нфальтéн",
      "translation": "вы упали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נָפְלוּ",
      "transcription": "нафлӯ",
      "translation": "они упали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶפֹּל",
      "transcription": "эпóль",
      "translation": "я упаду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּפֹּל",
      "transcription": "типóль",
      "translation": "ты упадешь / она упадет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּפְּלִי",
      "transcription": "типлӣ",
      "translation": "ты упадешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִפֹּל",
      "transcription": "йипóль",
      "translation": "он упадет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפֹּל",
      "transcription": "нипóль",
      "translation": "мы упадем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּפְּלוּ",
      "transcription": "типлӯ",
      "translation": "вы упадете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִפְּלוּ",
      "transcription": "йиплӯ",
      "translation": "они упадут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "נְפֹל",
      "transcription": "нфоль",
      "translation": "упади (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "נִפְלִי",
      "transcription": "нифлӣ",
      "translation": "упади (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "נִפְלוּ",
      "transcription": "нифлӯ",
      "translation": "упадите"
    }
  ]
},
  'לצעוק': {
  "infinitive": {
    "hebrew": "לִצְעֹק",
    "transcription": "лиц’óк",
    "translation": "кричать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "צ-ע-ק",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "צוֹעֵק",
      "transcription": "цоéк",
      "translation": "кричит / кричу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "צוֹעֶקֶת",
      "transcription": "цоéкет",
      "translation": "кричит / кричу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "צוֹעֲקִים",
      "transcription": "цоакӣм",
      "translation": "кричат / кричим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "צוֹעֲקוֹת",
      "transcription": "цоакóт",
      "translation": "кричат / кричим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "צָעַקְתִּי",
      "transcription": "цаáкти",
      "translation": "я кричал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "צָעַקְתָּ",
      "transcription": "цаáкта",
      "translation": "ты кричал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "צָעַקְתְּ",
      "transcription": "цаáкт",
      "translation": "ты кричала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "צָעַק",
      "transcription": "цаáк",
      "translation": "он кричал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "צָעֲקָה",
      "transcription": "цаакá",
      "translation": "она кричала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "צָעַקְנוּ",
      "transcription": "цаáкну",
      "translation": "мы кричали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "צְעַקְתֶּם / צְעַקְתֶּן",
      "transcription": "цаактéм / цаактéн",
      "translation": "вы кричали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "צָעֲקוּ",
      "transcription": "цаакӯ",
      "translation": "они кричали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶצְעַק",
      "transcription": "эц’áк",
      "translation": "я закричу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּצְעַק",
      "transcription": "тиц’áк",
      "translation": "ты закричишь / она закричит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּצְעֲקִי",
      "transcription": "тиц’акӣ",
      "translation": "ты закричишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִצְעַק",
      "transcription": "йиц’áк",
      "translation": "он закричит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִצְעַק",
      "transcription": "ниц’áк",
      "translation": "мы закричим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּצְעֲקוּ",
      "transcription": "тиц’акӯ",
      "translation": "вы закричите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִצְעֲקוּ",
      "transcription": "йиц’акӯ",
      "translation": "они закричат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "צְעַק",
      "transcription": "ц’ак",
      "translation": "кричи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "צַעֲקִי",
      "transcription": "цаакӣ",
      "translation": "кричи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "צַעֲקוּ",
      "transcription": "цаакӯ",
      "translation": "кричите"
    }
  ]
},
  'לכעוס': {
  "infinitive": {
    "hebrew": "לִכְעֹס",
    "transcription": "лих’óс",
    "translation": "сердиться, злиться"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "כ-ע-ס",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "כּוֹעֵס",
      "transcription": "коéс",
      "translation": "злится / злюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "כּוֹעֶסֶת",
      "transcription": "коéсет",
      "translation": "злится / злюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "כּוֹעֲסִים",
      "transcription": "коасӣм",
      "translation": "злятся / злимся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "כּוֹעֲסוֹת",
      "transcription": "коасóт",
      "translation": "злятся / злимся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "כָּעַסְתִּי",
      "transcription": "каáсти",
      "translation": "я разозлился / разозлилась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "כָּעַסְתָּ",
      "transcription": "каáста",
      "translation": "ты разозлился"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "כָּעַסְתְּ",
      "transcription": "каáст",
      "translation": "ты разозлилась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "כָּעַס",
      "transcription": "каáс",
      "translation": "он разозлился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "כָּעֲסָה",
      "transcription": "каасá",
      "translation": "она разозлилась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "כָּעַסְנוּ",
      "transcription": "каáсну",
      "translation": "мы разозлились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "כְּעַסְתֶּם / כְּעַסְתֶּן",
      "transcription": "каастéм / каастéн",
      "translation": "вы разозлились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "כָּעֲסוּ",
      "transcription": "каасӯ",
      "translation": "они разозлились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶכְעַס",
      "transcription": "эх’áс",
      "translation": "я рассержусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּכְעַס",
      "transcription": "тих’áс",
      "translation": "ты рассердишься / она рассердится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּכְעֲסִי",
      "transcription": "тих’асӣ",
      "translation": "ты рассердишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִכְעַס",
      "transcription": "йих’áс",
      "translation": "он рассердится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִכְעַס",
      "transcription": "них’áс",
      "translation": "мы рассердимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּכְעֲסוּ",
      "transcription": "тих’асӯ",
      "translation": "вы рассердитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִכְעֲסוּ",
      "transcription": "йих’асӯ",
      "translation": "они рассердятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "כְּעַס",
      "transcription": "к’ас",
      "translation": "сердись (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "כַּעֲסִי",
      "transcription": "каасӣ",
      "translation": "сердись (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "כַּעֲסוּ",
      "transcription": "каасӯ",
      "translation": "сердитесь"
    }
  ]
},
  'לפחוד': {
  "infinitive": {
    "hebrew": "לִפְחֹד",
    "transcription": "лифхóд",
    "translation": "бояться, опасаться"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "פ-ח-ד",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "פּוֹחֵד",
      "transcription": "похéд",
      "translation": "боится / боюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "פּוֹחֶדֶת",
      "transcription": "похéдет",
      "translation": "боится / боюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "פּוֹחֲדִים",
      "transcription": "похадӣм",
      "translation": "боятся / боимся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "פּוֹחֲדוֹת",
      "transcription": "похадóт",
      "translation": "боятся / боимся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "פָּחַדְתִּי",
      "transcription": "пахáдти",
      "translation": "я испугался / испугалась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "פָּחַדְתָּ",
      "transcription": "пахáдта",
      "translation": "ты испугался"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "פָּחַדְתְּ",
      "transcription": "пахáдт",
      "translation": "ты испугалась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "פָּחַד",
      "transcription": "пахáд",
      "translation": "он испугался"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "פָּחֲדָה",
      "transcription": "пахадá",
      "translation": "она испугалась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "פָּחַדְנוּ",
      "transcription": "пахáдну",
      "translation": "мы испугались"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "פְּחַדְתֶּם / פְּחַדְתֶּן",
      "transcription": "пхадтéм / пхадтéн",
      "translation": "вы испугались"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "פָּחֲדוּ",
      "transcription": "пахадӯ",
      "translation": "они испугались"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶפְחַד",
      "transcription": "эфхáд",
      "translation": "я испугаюсь / буду бояться"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּפְחַד",
      "transcription": "тифхáд",
      "translation": "ты испугаешься / она испугается"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּפְחֲדִי",
      "transcription": "тифхадӣ",
      "translation": "ты испугаешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִפְחַד",
      "transcription": "йифхáд",
      "translation": "он испугается"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפְחַד",
      "transcription": "нифхáд",
      "translation": "мы испугаемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּפְחֲדוּ",
      "transcription": "тифхадӯ",
      "translation": "вы испугаетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִפְחֲדוּ",
      "transcription": "йифхадӯ",
      "translation": "они испугаются"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "פְּחַד",
      "transcription": "пхад",
      "translation": "бойся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "פַּחֲדִי",
      "transcription": "пахадӣ",
      "translation": "бойся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "פַּחֲדוּ",
      "transcription": "пахадӯ",
      "translation": "бойтесь"
    }
  ]
},
  'לנקות': {
  "infinitive": {
    "hebrew": "לְנַקּוֹת",
    "transcription": "ленакóт",
    "translation": "убирать, чистить"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "נ-ק-ה",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְנַקֶּה",
      "transcription": "менакé",
      "translation": "убирает / убираю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְנַקָּה",
      "transcription": "менакá",
      "translation": "убирает / убираю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְנַקִּים",
      "transcription": "менакӣм",
      "translation": "убирают / убираем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְנַקּוֹת",
      "transcription": "менакóт",
      "translation": "убирают / убираем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִקֵּיתִי",
      "transcription": "никéйти",
      "translation": "я убрал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִקֵּיתָ",
      "transcription": "никéйта",
      "translation": "ты убрал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִקֵּית",
      "transcription": "никéйт",
      "translation": "ты убрала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִקָּה",
      "transcription": "никá",
      "translation": "он убрал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִקְּתָה",
      "transcription": "никтá",
      "translation": "она убрала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִקֵּינוּ",
      "transcription": "никéйну",
      "translation": "мы убрали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִקֵּיתֶם / נִקֵּיתֶן",
      "transcription": "никэйтéм / никэйтéн",
      "translation": "вы убрали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִקּוּ",
      "transcription": "никӯ",
      "translation": "они убрали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲנַקֶּה",
      "transcription": "анакé",
      "translation": "я уберу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּנַקֶּה",
      "transcription": "тенакé",
      "translation": "ты уберешь / она уберет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּנַקִּי",
      "transcription": "тенакӣ",
      "translation": "ты уберешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְנַקֶּה",
      "transcription": "йенакé",
      "translation": "он уберет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְנַקֶּה",
      "transcription": "ненакé",
      "translation": "мы уберем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּנַקּוּ",
      "transcription": "тенакӯ",
      "translation": "вы уберете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְנַקּוּ",
      "transcription": "йенакӯ",
      "translation": "они уберут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "נַקֵּה",
      "transcription": "накé",
      "translation": "убери (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "נַקִּי",
      "transcription": "накӣ",
      "translation": "убери (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "נַקּוּ",
      "transcription": "накӯ",
      "translation": "уберите"
    }
  ]
},
  'לצייר': {
  "infinitive": {
    "hebrew": "לְצַיֵּר",
    "transcription": "лецайéр",
    "translation": "рисовать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "צ-י-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְצַיֵּר",
      "transcription": "мецайéр",
      "translation": "рисует / рисую (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְצַיֶּרֶת",
      "transcription": "мецайéрет",
      "translation": "рисует / рисую (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְצַיְּרִים",
      "transcription": "мецайрӣм",
      "translation": "рисуют / рисуем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְצַיְּרוֹת",
      "transcription": "мецайрóт",
      "translation": "рисуют / рисуем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "צִיַּרְתִּי",
      "transcription": "цийáрти",
      "translation": "я нарисовал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "צִיַּרְתָּ",
      "transcription": "цийáрта",
      "translation": "ты нарисовал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "צִיַּרְתְּ",
      "transcription": "цийáрт",
      "translation": "ты нарисовала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "צִיֵּר",
      "transcription": "цийéр",
      "translation": "он нарисовал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "צִיְּרָה",
      "transcription": "цийрá",
      "translation": "она нарисовала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "צִיַּרְנוּ",
      "transcription": "цийáрну",
      "translation": "мы нарисовали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "צִיַּרְתֶּם / צִיַּרְתֶּן",
      "transcription": "цийяртéм / цийяртéн",
      "translation": "вы нарисовали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "צִיְּרוּ",
      "transcription": "цийрӯ",
      "translation": "они нарисовали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲצַיֵּר",
      "transcription": "ацайéр",
      "translation": "я нарисую"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּצַיֵּר",
      "transcription": "тецайéр",
      "translation": "ты нарисуешь / она нарисует"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּצַיְּרִי",
      "transcription": "тецайрӣ",
      "translation": "ты нарисуешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְצַיֵּר",
      "transcription": "йецайéр",
      "translation": "он нарисует"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְצַיֵּר",
      "transcription": "нецайéр",
      "translation": "мы нарисуем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּצַיְּרוּ",
      "transcription": "тецайрӯ",
      "translation": "вы нарисуете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְצַיְּרוּ",
      "transcription": "йецайрӯ",
      "translation": "они нарисуют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "צַיֵּר",
      "transcription": "цайéр",
      "translation": "рисуй (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "צַיְּרִי",
      "transcription": "цайрӣ",
      "translation": "рисуй (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "צַיְּרוּ",
      "transcription": "цайрӯ",
      "translation": "рисуйте"
    }
  ]
},
  'לצלם': {
  "infinitive": {
    "hebrew": "לְצַלֵּם",
    "transcription": "лецалéм",
    "translation": "фотографировать, снимать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "צ-ל-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְצַלֵּם",
      "transcription": "мецалéм",
      "translation": "фотографирует / фотографирую (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְצַלֶּמֶת",
      "transcription": "мецалéмет",
      "translation": "фотографирует / фотографирую (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְצַלְּמִים",
      "transcription": "мецальмӣм",
      "translation": "фотографируют / фотографируем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְצַלְּמוֹת",
      "transcription": "мецальмóт",
      "translation": "фотографируют / фотографируем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "צִלַּמְתִּי",
      "transcription": "цилáмти",
      "translation": "я сфотографировал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "צִלַּמְתָּ",
      "transcription": "цилáмта",
      "translation": "ты сфотографировал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "צִלַּמְתְּ",
      "transcription": "цилáмт",
      "translation": "ты сфотографировала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "צִלֵּם",
      "transcription": "цилéм",
      "translation": "он сфотографировал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "צִלְּמָה",
      "transcription": "цильмá",
      "translation": "она сфотографировала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "צִלַּמְנוּ",
      "transcription": "цилáмну",
      "translation": "мы сфотографировали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "צִלַּמְתֶּם / צִלַּמְתֶּן",
      "transcription": "циламтéм / циламтéн",
      "translation": "вы сфотографировали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "צִלְּמוּ",
      "transcription": "цильмӯ",
      "translation": "они сфотографировали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲצַלֵּם",
      "transcription": "ацалéм",
      "translation": "я сфотографирую"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּצַלֵּם",
      "transcription": "тецалéм",
      "translation": "ты сфотографируешь / она сфотографирует"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּצַלְּמִי",
      "transcription": "тецальмӣ",
      "translation": "ты сфотографируешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְצַלֵּם",
      "transcription": "йецалéм",
      "translation": "он сфотографирует"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְצַלֵּם",
      "transcription": "нецалéм",
      "translation": "мы сфотографируем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּצַלְּמוּ",
      "transcription": "тецальмӯ",
      "translation": "вы сфотографируете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְצַלְּמוּ",
      "transcription": "йецальмӯ",
      "translation": "они сфотографируют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "צַלֵּם",
      "transcription": "цалéм",
      "translation": "фотографируй (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "צַלְּמִי",
      "transcription": "цальмӣ",
      "translation": "фотографируй (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "צַלְּמוּ",
      "transcription": "цальмӯ",
      "translation": "фотографируйте"
    }
  ]
},
  'לבקר': {
  "infinitive": {
    "hebrew": "לְבַקֵּר",
    "transcription": "левакéр",
    "translation": "навещать, посещать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ב-ק-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְבַקֵּר",
      "transcription": "мевакéр",
      "translation": "навещает / навещаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְבַקֶּרֶת",
      "transcription": "мевакéрет",
      "translation": "навещает / навещаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְבַקְּרִים",
      "transcription": "мевакрӣм",
      "translation": "навещают / навещаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְבַקְּרוֹת",
      "transcription": "мевакрóт",
      "translation": "навещают / навещаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "בִּקַּרְתִּי",
      "transcription": "бикáрти",
      "translation": "я навестил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "בִּקַּרְתָּ",
      "transcription": "бикáрта",
      "translation": "ты навестил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "בִּקַּרְתְּ",
      "transcription": "бикáрт",
      "translation": "ты навестила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "בִּקֵּר",
      "transcription": "бикéр",
      "translation": "он навестил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "בִּקְּרָה",
      "transcription": "бикрá",
      "translation": "она навестила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "בִּקַּרְנוּ",
      "transcription": "бикáрну",
      "translation": "мы навестили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "בִּקַּרְתֶּם / בִּקַּרְתֶּן",
      "transcription": "бикартéм / бикартéн",
      "translation": "вы навестили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "בִּקְּרוּ",
      "transcription": "бикрӯ",
      "translation": "они навестили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲבַקֵּר",
      "transcription": "авакéр",
      "translation": "я навещу / буду навещать"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּבַקֵּר",
      "transcription": "тевакéр",
      "translation": "ты навестишь / она навестит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּבַקְּרִי",
      "transcription": "тевакрӣ",
      "translation": "ты навестишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְבַקֵּר",
      "transcription": "йевакéр",
      "translation": "он навестит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְבַקֵּר",
      "transcription": "невакéр",
      "translation": "мы навестим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּבַקְּרוּ",
      "transcription": "тевакрӯ",
      "translation": "вы навестите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְבַקְּרוּ",
      "transcription": "йевакрӯ",
      "translation": "они навестят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "בַּקֵּר",
      "transcription": "бакéр",
      "translation": "навести (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "בַּקְּרִי",
      "transcription": "бакрӣ",
      "translation": "навести (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "בַּקְּרוּ",
      "transcription": "бакрӯ",
      "translation": "навестите (мн.ч.)"
    }
  ]
},
  'לתקן': {
  "infinitive": {
    "hebrew": "לְתַקֵּן",
    "transcription": "летакéн",
    "translation": "чинить, исправлять"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ת-ק-ן",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְתַקֵּן",
      "transcription": "метакéн",
      "translation": "чинит / чиню (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְתַקֶּנֶת",
      "transcription": "метакéнет",
      "translation": "чинит / чиню (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְתַקְּנִים",
      "transcription": "метакнӣм",
      "translation": "чинят / чиним (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְתַקְּנוֹת",
      "transcription": "метакнóт",
      "translation": "чинят / чиним (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "תִּקַּנְתִּי",
      "transcription": "тикáнти",
      "translation": "я починил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "תִּקַּנְתָּ",
      "transcription": "тикáнта",
      "translation": "ты починил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּקַּנְתְּ",
      "transcription": "тикáнт",
      "translation": "ты починила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "תִּקֵּן",
      "transcription": "тикéн",
      "translation": "он починил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "תִּקְּנָה",
      "transcription": "тикнá",
      "translation": "она починила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "תִּקַּנּוּ",
      "transcription": "тикáнну",
      "translation": "мы починили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּקַּנְתֶּם / תִּקַּנְתֶּן",
      "transcription": "тикантéм / тикантéн",
      "translation": "вы починили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "תִּקְּנוּ",
      "transcription": "тикнӯ",
      "translation": "они починили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲתַקֵּן",
      "transcription": "атакéн",
      "translation": "я починю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּתַקֵּן",
      "transcription": "тетакéн",
      "translation": "ты починишь / она починит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּתַקְּנִי",
      "transcription": "тетакнӣ",
      "translation": "ты починишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְתַקֵּן",
      "transcription": "йетакéн",
      "translation": "он починит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְתַקֵּן",
      "transcription": "нетакéн",
      "translation": "мы починим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּתַקְּנוּ",
      "transcription": "тетакнӯ",
      "translation": "вы почините"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְתַקְּנוּ",
      "transcription": "йетакнӯ",
      "translation": "они починят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "תַּקֵּן",
      "transcription": "такéн",
      "translation": "почини (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "תַּקְּנִי",
      "transcription": "такнӣ",
      "translation": "почини (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "תַּקְּנוּ",
      "transcription": "такнӯ",
      "translation": "почините"
    }
  ]
},
  'לחכות': {
  "infinitive": {
    "hebrew": "לְחַכּוֹת",
    "transcription": "лехакóт",
    "translation": "ждать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ח-כ-ה",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְחַכֶּה",
      "transcription": "мехакé",
      "translation": "ждет / жду (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְחַכָּה",
      "transcription": "мехакá",
      "translation": "ждет / жду (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְחַכִּים",
      "transcription": "мехакӣм",
      "translation": "ждут / ждем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְחַכּוֹת",
      "transcription": "мехакóт",
      "translation": "ждут / ждем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "חִכִּיתִי",
      "transcription": "хикӣти",
      "translation": "я ждал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "חִכִּיתָ",
      "transcription": "хикӣта",
      "translation": "ты ждал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "חִכִּית",
      "transcription": "хикӣт",
      "translation": "ты ждала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "חִכָּה",
      "transcription": "хикá",
      "translation": "он ждал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "חִכְּתָה",
      "transcription": "хиктá",
      "translation": "она ждала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "חִכִּינוּ",
      "transcription": "хикӣну",
      "translation": "мы ждали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "חִכִּיתֶם / חִכִּיתֶן",
      "transcription": "хикитéм / хикитéн",
      "translation": "вы ждали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "חִכּוּ",
      "transcription": "хикӯ",
      "translation": "они ждали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲחַכֶּה",
      "transcription": "ахакé",
      "translation": "я подожду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּחַכֶּה",
      "transcription": "техакé",
      "translation": "ты подождешь / она подождет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּחַכִּי",
      "transcription": "техакӣ",
      "translation": "ты подождешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְחַכֶּה",
      "transcription": "йехакé",
      "translation": "он подождет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְחַכֶּה",
      "transcription": "нехакé",
      "translation": "мы подождем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּחַכּוּ",
      "transcription": "техакӯ",
      "translation": "вы подождете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְחַכּוּ",
      "transcription": "йехакӯ",
      "translation": "они подождут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "חַכֵּה",
      "transcription": "хакé",
      "translation": "жди (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "חַכִּי",
      "transcription": "хакӣ",
      "translation": "жди (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "חַכּוּ",
      "transcription": "хакӯ",
      "translation": "ждите"
    }
  ]
},
  'לקוות': {
  "infinitive": {
    "hebrew": "לְקַוּוֹת",
    "transcription": "лекавóт",
    "translation": "надеяться"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ק-ו-ה",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְקַוֶּה",
      "transcription": "мекавé",
      "translation": "надеется / надеюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְקַוָּה",
      "transcription": "мекавá",
      "translation": "надеется / надеюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְקַוִּים",
      "transcription": "мекавӣм",
      "translation": "надеются / надеемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְקַוּוֹת",
      "transcription": "мекавóт",
      "translation": "надеются / надеемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "קִוִּיתִי",
      "transcription": "кивӣти",
      "translation": "я надеялся / надеялась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "קִוִּיתָ",
      "transcription": "кивӣта",
      "translation": "ты надеялся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "קִוִּית",
      "transcription": "кивӣт",
      "translation": "ты надеялась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "קִוָּה",
      "transcription": "кивá",
      "translation": "он надеялся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "קִוְּתָה",
      "transcription": "кивтá",
      "translation": "она надеялась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "קִוִּינוּ",
      "transcription": "кивӣну",
      "translation": "мы надеялись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "קִוִּיתֶם / קִוִּיתֶן",
      "transcription": "кивитéм / кивитéн",
      "translation": "вы надеялись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "קִוּוּ",
      "transcription": "кивӯ",
      "translation": "они надеялись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲקַוֶּה",
      "transcription": "акавé",
      "translation": "я буду надеяться"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּקַוֶּה",
      "transcription": "текавé",
      "translation": "ты будешь надеяться / она будет надеяться"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּקַוִּי",
      "transcription": "текавӣ",
      "translation": "ты будешь надеяться (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְקַוֶּה",
      "transcription": "йекавé",
      "translation": "он будет надеяться"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְקַוֶּה",
      "transcription": "некавé",
      "translation": "мы будем надеяться"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּקַוּוּ",
      "transcription": "текавӯ",
      "translation": "вы будете надеяться"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְקַוּוּ",
      "transcription": "йекавӯ",
      "translation": "они будут надеяться"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "קַוֵּה",
      "transcription": "кавé",
      "translation": "надейся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "קַוִּי",
      "transcription": "кавӣ",
      "translation": "надейся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "קַוּוּ",
      "transcription": "кавӯ",
      "translation": "надейтесь"
    }
  ]
},
  'לשנות': {
  "infinitive": {
    "hebrew": "לְשַׁנּוֹת",
    "transcription": "лешанóт",
    "translation": "менять, изменять"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ש-נ-ה",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְשַׁנֶּה",
      "transcription": "мешанé",
      "translation": "меняет / меняю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְשַׁנָּה",
      "transcription": "мешанá",
      "translation": "меняет / меняю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְשַׁנִּים",
      "transcription": "мешанӣм",
      "translation": "меняют / меняем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְשַׁנּוֹת",
      "transcription": "мешанóт",
      "translation": "меняют / меняем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "שִׁנִּיתִי",
      "transcription": "шинӣти",
      "translation": "я изменил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "שִׁנִּיתָ",
      "transcription": "шинӣта",
      "translation": "ты изменил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "שִׁנִּית",
      "transcription": "шинӣт",
      "translation": "ты изменила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "שִׁנָּה",
      "transcription": "шинá",
      "translation": "он изменил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "שִׁנְּתָה",
      "transcription": "шинтá",
      "translation": "она изменила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "שִׁנִּינוּ",
      "transcription": "шинӣну",
      "translation": "мы изменили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "שִׁנִּיתֶם / שִׁנִּיתֶן",
      "transcription": "шинитéм / шинитéн",
      "translation": "вы изменили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "שִׁנּוּ",
      "transcription": "шинӯ",
      "translation": "они изменили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲשַׁנֶּה",
      "transcription": "ашанé",
      "translation": "я изменю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּשַׁנֶּה",
      "transcription": "тешанé",
      "translation": "ты изменишь / она изменит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּשַׁנִּי",
      "transcription": "тешанӣ",
      "translation": "ты изменишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְשַׁנֶּה",
      "transcription": "йешанé",
      "translation": "он изменит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְשַׁנֶּה",
      "transcription": "нешанé",
      "translation": "мы изменим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּשַׁנּוּ",
      "transcription": "тешанӯ",
      "translation": "вы измените"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְשַׁנּוּ",
      "transcription": "йешанӯ",
      "translation": "они изменят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שַׁנֵּה",
      "transcription": "шанé",
      "translation": "измени (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שַׁנִּי",
      "transcription": "шанӣ",
      "translation": "измени (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שַׁנּוּ",
      "transcription": "шанӯ",
      "translation": "измените"
    }
  ]
},
  'לנסות': {
  "infinitive": {
    "hebrew": "לְנַסּוֹת",
    "transcription": "ленасóт",
    "translation": "пытаться, пробовать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "נ-ס-ה",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְנַסֶּה",
      "transcription": "менасé",
      "translation": "пробует / пробую (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְנַסָּה",
      "transcription": "менасá",
      "translation": "пробует / пробую (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְנַסִּים",
      "transcription": "менасӣм",
      "translation": "пробуют / пробуем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְנַסּוֹת",
      "transcription": "менасóт",
      "translation": "пробуют / пробуем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִסִּיתִי",
      "transcription": "нисӣти",
      "translation": "я попробовал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִסִּיתָ",
      "transcription": "нисӣта",
      "translation": "ты попробовал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִסִּית",
      "transcription": "нисӣт",
      "translation": "ты попробовала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִסָּה",
      "transcription": "нисá",
      "translation": "он попробовал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִסְּתָה",
      "transcription": "нистá",
      "translation": "она попробовала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִסִּינוּ",
      "transcription": "нисӣну",
      "translation": "мы попробовали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִסִּיתֶם / נִסִּיתֶן",
      "transcription": "ниситéм / ниситéн",
      "translation": "вы попробовали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִסּוּ",
      "transcription": "нисӯ",
      "translation": "они попробовали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲנַסֶּה",
      "transcription": "анасé",
      "translation": "я попробую"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּנַסֶּה",
      "transcription": "тенасé",
      "translation": "ты попробуешь / она попробует"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּנַסִּי",
      "transcription": "тенасӣ",
      "translation": "ты попробуешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְנַסֶּה",
      "transcription": "йенасé",
      "translation": "он попробует"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְנַסֶּה",
      "transcription": "ненасé",
      "translation": "мы попробуем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּנַסּוּ",
      "transcription": "тенасӯ",
      "translation": "вы попробуете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְנַסּוּ",
      "transcription": "йенасӯ",
      "translation": "они попробуют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "נַסֵּה",
      "transcription": "насé",
      "translation": "попробуй (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "נַסִּי",
      "transcription": "насӣ",
      "translation": "попробуй (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "נַסּוּ",
      "transcription": "насӯ",
      "translation": "попробуйте"
    }
  ]
},
  'לסיים': {
  "infinitive": {
    "hebrew": "לְסַיֵּם",
    "transcription": "лесайéм",
    "translation": "заканчивать, завершать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ס-י-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְסַיֵּם",
      "transcription": "месайéм",
      "translation": "заканчивает / заканчиваю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְסַיֶּמֶת",
      "transcription": "месайéмет",
      "translation": "заканчивает / заканчиваю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְסַיְּמִים",
      "transcription": "месаймӣм",
      "translation": "заканчивают / заканчиваем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְסַיְּמוֹת",
      "transcription": "месаймóт",
      "translation": "заканчивают / заканчиваем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "סִיַּמְתִּי",
      "transcription": "сийáмти",
      "translation": "я закончил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "סִיַּמְתָּ",
      "transcription": "сийáмта",
      "translation": "ты закончил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "סִיַּמְתְּ",
      "transcription": "сийáмт",
      "translation": "ты закончила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "סִיֵּם",
      "transcription": "сийéм",
      "translation": "он закончил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "סִיְּמָה",
      "transcription": "сиймá",
      "translation": "она закончила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "סִיַּמְנוּ",
      "transcription": "сийáмну",
      "translation": "мы закончили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "סִיַּמְתֶּם / סִיַּמְתֶּן",
      "transcription": "сийямтéм / сийямтéн",
      "translation": "вы закончили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "סִיְּמוּ",
      "transcription": "сиймӯ",
      "translation": "они закончили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲסַיֵּם",
      "transcription": "асайéм",
      "translation": "я закончу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּסַיֵּם",
      "transcription": "тесайéм",
      "translation": "ты закончишь / она закончит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּסַיְּמִי",
      "transcription": "тесаймӣ",
      "translation": "ты закончишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְסַיֵּם",
      "transcription": "йесайéм",
      "translation": "он закончит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְסַיֵּם",
      "transcription": "несайéм",
      "translation": "мы закончим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּסַיְּמוּ",
      "transcription": "тесаймӯ",
      "translation": "вы закончите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְסַיְּמוּ",
      "transcription": "йесаймӯ",
      "translation": "они закончат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "סַיֵּם",
      "transcription": "сайéм",
      "translation": "закончи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "סַיְּמִי",
      "transcription": "саймӣ",
      "translation": "закончи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "סַיְּמוּ",
      "transcription": "саймӯ",
      "translation": "закончите"
    }
  ]
},
  'להקשיב': {
  "infinitive": {
    "hebrew": "לְהַקְשִׁיב",
    "transcription": "леhакшӣв",
    "translation": "внимательно слушать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ק-ש-ב",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַקְשִׁיב",
      "transcription": "макшӣв",
      "translation": "слушает / слушаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַקְשִׁיבָה",
      "transcription": "макшивá",
      "translation": "слушает / слушаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַקְשִׁיבִים",
      "transcription": "макшивӣм",
      "translation": "слушают / слушаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַקְשִׁיבוֹת",
      "transcription": "макшивóт",
      "translation": "слушают / слушаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִקְשַׁבְתִּי",
      "transcription": "hикшáвти",
      "translation": "я слушал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִקְשַׁבְתָּ",
      "transcription": "hикшáвта",
      "translation": "ты слушал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִקְשַׁבְתְּ",
      "transcription": "hикшáвт",
      "translation": "ты слушала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִקְשִׁיב",
      "transcription": "hикшӣв",
      "translation": "он слушал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִקְשִׁיבָה",
      "transcription": "hикшивá",
      "translation": "она слушала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִקְשַׁבְנוּ",
      "transcription": "hикшáвну",
      "translation": "мы слушали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִקְשַׁבְתֶּם / הִקְשַׁבְתֶּן",
      "transcription": "hикшавтéм / hикшавтéн",
      "translation": "вы слушали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִקְשִׁיבוּ",
      "transcription": "hикшивӯ",
      "translation": "они слушали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַקְשִׁיב",
      "transcription": "акшӣв",
      "translation": "я послушаю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּקְשִׁיב",
      "transcription": "такшӣв",
      "translation": "ты послушаешь / она послушает"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּקְשִׁיבִי",
      "transcription": "такшивӣ",
      "translation": "ты послушаешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַקְשִׁיב",
      "transcription": "йакшӣв",
      "translation": "он послушает"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַקְשִׁיב",
      "transcription": "накшӣв",
      "translation": "мы послушаем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּקְשִׁיבוּ",
      "transcription": "такшивӯ",
      "translation": "вы послушаете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַקְשִׁיבוּ",
      "transcription": "йакшивӯ",
      "translation": "они послушают"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַקְשֵׁב",
      "transcription": "hакшéв",
      "translation": "слушай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַקְשִׁיבִי",
      "transcription": "hакшивӣ",
      "translation": "слушай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַקְשִׁיבוּ",
      "transcription": "hакшивӯ",
      "translation": "слушайте"
    }
  ]
},
  'להחליט': {
  "infinitive": {
    "hebrew": "לְהַחְלִיט",
    "transcription": "леhахлӣт",
    "translation": "решать, принимать решение"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ח-ל-ט",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַחְלִיט",
      "transcription": "махлӣт",
      "translation": "решает / решаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַחְלִיטָה",
      "transcription": "махлитá",
      "translation": "решает / решаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַחְלִיטִים",
      "transcription": "махлитӣм",
      "translation": "решают / решаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַחְלִיטוֹת",
      "transcription": "махлитóт",
      "translation": "решают / решаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הֶחְלַטְתִּי",
      "transcription": "hэхлáтти",
      "translation": "я решил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הֶחְלַטְתָּ",
      "transcription": "hэхлáтта",
      "translation": "ты решил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הֶחְלַטְתְּ",
      "transcription": "hэхлáтт",
      "translation": "ты решила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הֶחְלִיט",
      "transcription": "hэхлӣт",
      "translation": "он решил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הֶחְלִיטָה",
      "transcription": "hэхлитá",
      "translation": "она решила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הֶחְלַטְנוּ",
      "transcription": "hэхлáтну",
      "translation": "мы решили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הֶחְלַטְתֶּם / הֶחְלַטְתֶּן",
      "transcription": "hэхлаттéм / hэхлаттéн",
      "translation": "вы решили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הֶחְלִיטוּ",
      "transcription": "hэхлитӯ",
      "translation": "они решили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַחְלִיט",
      "transcription": "ахлӣт",
      "translation": "я решу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּחְלִיט",
      "transcription": "тахлӣт",
      "translation": "ты решишь / она решит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּחְלִיטִי",
      "transcription": "тахлитӣ",
      "translation": "ты решишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַחְלִיט",
      "transcription": "йахлӣт",
      "translation": "он решит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַחְלִיט",
      "transcription": "нахлӣт",
      "translation": "мы решим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּחְלִיטוּ",
      "transcription": "тахлитӯ",
      "translation": "вы решите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַחְלִיטוּ",
      "transcription": "йахлитӯ",
      "translation": "они решат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַחְלֵט",
      "transcription": "hахлéт",
      "translation": "реши (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַחְלִיטִי",
      "transcription": "hахлитӣ",
      "translation": "реши (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַחְלִיטוּ",
      "transcription": "hахлитӯ",
      "translation": "решите"
    }
  ]
},
  'להביא': {
  "infinitive": {
    "hebrew": "לְהָבִיא",
    "transcription": "леhавӣ",
    "translation": "приносить, приводить"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ב-ו-א",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מֵבִיא",
      "transcription": "мевӣ",
      "translation": "приносит / приношу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְבִיאָה",
      "transcription": "мевиá",
      "translation": "приносит / приношу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְבִיאִים",
      "transcription": "мевиӣм",
      "translation": "приносят / приносим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְבִיאוֹת",
      "transcription": "мевиóт",
      "translation": "приносят / приносим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הֵבֵאתִי",
      "transcription": "hевéти",
      "translation": "я принес(ла)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הֵבֵאתָ",
      "transcription": "hевéта",
      "translation": "ты принес"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הֵבֵאת",
      "transcription": "hевéт",
      "translation": "ты принесла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הֵבִיא",
      "transcription": "hевӣ",
      "translation": "он принес"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הֵבִיאָה",
      "transcription": "hевиá",
      "translation": "она принесла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הֵבֵאנוּ",
      "transcription": "hевéну",
      "translation": "мы принесли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הֲבֵאתֶם / הֲבֵאתֶן",
      "transcription": "hаветéм / hаветéн",
      "translation": "вы принесли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הֵבִיאוּ",
      "transcription": "hевиӯ",
      "translation": "они принесли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אָבִיא",
      "transcription": "авӣ",
      "translation": "я принесу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תָּבִיא",
      "transcription": "тавӣ",
      "translation": "ты принесешь / она принесет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תָּבִיאִי",
      "transcription": "тавиӣ",
      "translation": "ты принесешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָבִיא",
      "transcription": "йавӣ",
      "translation": "он принесет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָבִיא",
      "transcription": "навӣ",
      "translation": "мы принесем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תָּבִיאוּ",
      "transcription": "тавиӯ",
      "translation": "вы принесете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָבִיאוּ",
      "transcription": "йавиӯ",
      "translation": "они принесут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הָבֵא",
      "transcription": "hавé",
      "translation": "принеси (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הָבִיאִי",
      "transcription": "hавиӣ",
      "translation": "принеси (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הָבִיאוּ",
      "transcription": "hавиӯ",
      "translation": "принесите"
    }
  ]
},
  'להדליק': {
  "infinitive": {
    "hebrew": "לְהַדְלִיק",
    "transcription": "леhадлӣк",
    "translation": "включать (свет, прибор), зажигать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ד-ל-ק",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַדְלִיק",
      "transcription": "мадлӣк",
      "translation": "включает / включаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַדְלִיקָה",
      "transcription": "мадликá",
      "translation": "включает / включаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַדְלִיקִים",
      "transcription": "мадликӣм",
      "translation": "включают / включаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַדְלִיקוֹת",
      "transcription": "мадликóт",
      "translation": "включают / включаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִדְלַקְתִּי",
      "transcription": "hидлáкти",
      "translation": "я включил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִדְלַקְתָּ",
      "transcription": "hидлáкта",
      "translation": "ты включил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִדְלַקְתְּ",
      "transcription": "hидлáкт",
      "translation": "ты включила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִדְלִיק",
      "transcription": "hидлӣк",
      "translation": "он включил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִדְלִיקָה",
      "transcription": "hидликá",
      "translation": "она включила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִדְלַקְנוּ",
      "transcription": "hидлáкну",
      "translation": "мы включили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִדְלַקְתֶּם / הִדְלַקְתֶּן",
      "transcription": "hидлактéм / hидлактéн",
      "translation": "вы включили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִדְלִיקוּ",
      "transcription": "hидликӯ",
      "translation": "они включили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַדְלִיק",
      "transcription": "адлӣк",
      "translation": "я включу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּדְלִיק",
      "transcription": "тадлӣк",
      "translation": "ты включишь / она включит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּדְלִיקִי",
      "transcription": "тадликӣ",
      "translation": "ты включишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַדְלִיק",
      "transcription": "йадлӣк",
      "translation": "он включит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַדְלִיק",
      "transcription": "надлӣк",
      "translation": "мы включим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּדְלִיקוּ",
      "transcription": "тадликӯ",
      "translation": "вы включите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַדְלִיקוּ",
      "transcription": "йадликӯ",
      "translation": "они включат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַדְלֵק",
      "transcription": "hадлéк",
      "translation": "включи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַדְלִיקִי",
      "transcription": "hадликӣ",
      "translation": "включи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַדְלִיקוּ",
      "transcription": "hадликӯ",
      "translation": "включите"
    }
  ]
},
  'להפסיק': {
  "infinitive": {
    "hebrew": "לְהַפְסִיק",
    "transcription": "леhафсӣк",
    "translation": "прекращать, переставать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "פ-ס-ק",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַפְסִיק",
      "transcription": "мафсӣк",
      "translation": "прекращает / прекращаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַפְסִיקָה",
      "transcription": "мафсикá",
      "translation": "прекращает / прекращаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַפְסִיקִים",
      "transcription": "мафсикӣм",
      "translation": "прекращают / прекращаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַפְסִיקוֹת",
      "transcription": "мафсикóт",
      "translation": "прекращают / прекращаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִפְסַקְתִּי",
      "transcription": "hифсáкти",
      "translation": "я перестал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִפְסַקְתָּ",
      "transcription": "hифсáкта",
      "translation": "ты перестал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִפְסַקְתְּ",
      "transcription": "hифсáкт",
      "translation": "ты перестала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִפְסִיק",
      "transcription": "hифсӣк",
      "translation": "он перестал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִפְסִיקָה",
      "transcription": "hифсикá",
      "translation": "она перестала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִפְסַקְנוּ",
      "transcription": "hифсáкну",
      "translation": "мы перестали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִפְסַקְתֶּם / הִפְסַקְתֶּן",
      "transcription": "hифсактéм / hифсактéн",
      "translation": "вы перестали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִפְסִיקוּ",
      "transcription": "hифсикӯ",
      "translation": "они перестали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַפְסִיק",
      "transcription": "афсӣк",
      "translation": "я перестану"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּפְסִיק",
      "transcription": "тафсӣк",
      "translation": "ты перестанешь / она перестанет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּפְסִיקִי",
      "transcription": "тафсикӣ",
      "translation": "ты перестанешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַפְסִיק",
      "transcription": "йафсӣк",
      "translation": "он перестанет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַפְסִיק",
      "transcription": "нафсӣк",
      "translation": "мы перестанем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּפְסִיקוּ",
      "transcription": "тафсикӯ",
      "translation": "вы перестанете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַפְסִיקוּ",
      "transcription": "йафсикӯ",
      "translation": "они перестанут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַפְסֵק",
      "transcription": "hафсéк",
      "translation": "прекрати (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַפְסִיקִי",
      "transcription": "hафсикӣ",
      "translation": "прекрати (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַפְסִיקוּ",
      "transcription": "hафсикӯ",
      "translation": "прекратите"
    }
  ]
},
  'להצליח': {
  "infinitive": {
    "hebrew": "לְהַצְלִיחַ",
    "transcription": "леhацлӣах",
    "translation": "иметь успех, преуспевать, удаваться"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "צ-ל-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַצְלִיחַ",
      "transcription": "мацлӣах",
      "translation": "преуспевает / мне удается (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַצְלִיחָה",
      "transcription": "мацлихá",
      "translation": "преуспевает / мне удается (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַצְלִיחִים",
      "transcription": "мацлихӣм",
      "translation": "преуспевают / нам удается (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַצְלִיחוֹת",
      "transcription": "мацлихóт",
      "translation": "преуспевают / нам удается (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִצְלַחְתִּי",
      "transcription": "hицлáхти",
      "translation": "я преуспел(а) / у меня получилось"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִצְלַחְתָּ",
      "transcription": "hицлáхта",
      "translation": "ты преуспел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִצְלַחְתְּ",
      "transcription": "hицлáхт",
      "translation": "ты преуспела"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִצְלִיחַ",
      "transcription": "hицлӣах",
      "translation": "он преуспел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִצְלִיחָה",
      "transcription": "hицлихá",
      "translation": "она преуспела"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִצְלַחְנוּ",
      "transcription": "hицлáхну",
      "translation": "мы преуспели"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִצְלַחְתֶּם / הִצְלַחְתֶּן",
      "transcription": "hицлахтéм / hицлахтéн",
      "translation": "вы преуспели"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִצְלִיחוּ",
      "transcription": "hицлихӯ",
      "translation": "они преуспели"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַצְלִיחַ",
      "transcription": "ацлӣах",
      "translation": "у меня получится"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּצְלִיחַ",
      "transcription": "тацлӣах",
      "translation": "у тебя получится / у нее получится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּצְלִיחִי",
      "transcription": "тацлихӣ",
      "translation": "у тебя получится (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַצְלִיחַ",
      "transcription": "йацлӣах",
      "translation": "у него получится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַצְלִיחַ",
      "transcription": "нацлӣах",
      "translation": "у нас получится"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּצְלִיחוּ",
      "transcription": "тацлихӯ",
      "translation": "у вас получится"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַצְלִיחוּ",
      "transcription": "йацлихӯ",
      "translation": "у них получится"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַצְלַח",
      "transcription": "hацлáх",
      "translation": "добейся успеха (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַצְלִיחִי",
      "transcription": "hацлихӣ",
      "translation": "добейся успеха (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַצְלִיחוּ",
      "transcription": "hацлихӯ",
      "translation": "добейтесь успеха"
    }
  ]
},
  'להעדיף': {
  "infinitive": {
    "hebrew": "לְהַעֲדִיף",
    "transcription": "леhаадӣф",
    "translation": "предпочитать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ע-ד-ף",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַעֲדִיף",
      "transcription": "маадӣф",
      "translation": "предпочитает / предпочитаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַעֲדִיפָה",
      "transcription": "маадифá",
      "translation": "предпочитает / предпочитаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַעֲדִיפִים",
      "transcription": "маадифӣм",
      "translation": "предпочитают / предпочитаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַעֲדִיפוֹת",
      "transcription": "маадифóт",
      "translation": "предпочитают / предпочитаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הֶעֱדַפְתִּי",
      "transcription": "hээдáфти",
      "translation": "я предпочел / предпочла"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הֶעֱדַפְתָּ",
      "transcription": "hээдáфта",
      "translation": "ты предпочел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הֶעֱדַפְתְּ",
      "transcription": "hээдáфт",
      "translation": "ты предпочла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הֶעֱדִיף",
      "transcription": "hээдӣф",
      "translation": "он предпочел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הֶעֱדִיפָה",
      "transcription": "hээдифá",
      "translation": "она предпочла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הֶעֱדַפְנוּ",
      "transcription": "hээдáфну",
      "translation": "мы предпочли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הֶעֱדַפְתֶּם / הֶעֱדַפְתֶּן",
      "transcription": "hээдафтéм / hээдафтéн",
      "translation": "вы предпочли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הֶעֱדִיפוּ",
      "transcription": "hээдифӯ",
      "translation": "они предпочли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַעֲדִיף",
      "transcription": "аадӣф",
      "translation": "я предпочту"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּעֲדִיף",
      "transcription": "таадӣф",
      "translation": "ты предпочтешь / она предпочтет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּעֲדִיפִי",
      "transcription": "таадифӣ",
      "translation": "ты предпочтешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַעֲדִיף",
      "transcription": "йаадӣф",
      "translation": "он предпочтет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַעֲדִיף",
      "transcription": "наадӣф",
      "translation": "мы предпочтем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּעֲדִיפוּ",
      "transcription": "таадифӯ",
      "translation": "вы предпочтете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַעֲדִיפוּ",
      "transcription": "йаадифӯ",
      "translation": "они предпочтут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַעֲדֵף",
      "transcription": "hаадéф",
      "translation": "предпочти (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַעֲדִיפִי",
      "transcription": "hаадифӣ",
      "translation": "предпочти (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַעֲדִיפוּ",
      "transcription": "hаадифӯ",
      "translation": "предпочтите"
    }
  ]
},
  'להסכים': {
  "infinitive": {
    "hebrew": "לְהַסְכִּים",
    "transcription": "леhаскӣм",
    "translation": "соглашаться"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ס-כ-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַסְכִּים",
      "transcription": "маскӣм",
      "translation": "согласен / соглашаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַסְכִּימָה",
      "transcription": "маскимá",
      "translation": "согласна / соглашаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַסְכִּימִים",
      "transcription": "маскимӣм",
      "translation": "согласны / соглашаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַסְכִּימוֹת",
      "transcription": "маскимóт",
      "translation": "согласны / соглашаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִסְכַּמְתִּי",
      "transcription": "hискáмти",
      "translation": "я согласился / согласилась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִסְכַּמְתָּ",
      "transcription": "hискáмта",
      "translation": "ты согласился"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִסְכַּמְתְּ",
      "transcription": "hискáмт",
      "translation": "ты согласилась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִסְכִּים",
      "transcription": "hискӣм",
      "translation": "он согласился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִסְכִּימָה",
      "transcription": "hискимá",
      "translation": "она согласилась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִסְכַּמְנוּ",
      "transcription": "hискáмну",
      "translation": "мы согласились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִסְכַּמְתֶּם / הִסְכַּמְתֶּן",
      "transcription": "hискамтéм / hискамтéн",
      "translation": "вы согласились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִסְכִּימוּ",
      "transcription": "hискимӯ",
      "translation": "они согласились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַסְכִּים",
      "transcription": "аскӣм",
      "translation": "я соглашусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּסְכִּים",
      "transcription": "таскӣм",
      "translation": "ты согласишься / она согласится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּסְכִּימִי",
      "transcription": "таскимӣ",
      "translation": "ты согласишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַסְכִּים",
      "transcription": "йаскӣм",
      "translation": "он согласится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַסְכִּים",
      "transcription": "наскӣм",
      "translation": "мы согласимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּסְכִּימוּ",
      "transcription": "таскимӯ",
      "translation": "вы согласитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַסְכִּימוּ",
      "transcription": "йаскимӯ",
      "translation": "они согласятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַסְכֵּם",
      "transcription": "hаскéм",
      "translation": "согласись (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַסְכִּימִי",
      "transcription": "hаскимӣ",
      "translation": "согласись (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַסְכִּימוּ",
      "transcription": "hаскимӯ",
      "translation": "согласитесь"
    }
  ]
},
  'להתרחץ': {
  "infinitive": {
    "hebrew": "לְהִתְרַחֵץ",
    "transcription": "леhитрахéц",
    "translation": "мыться, умываться, купаться"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ר-ח-ץ",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְרַחֵץ",
      "transcription": "митрахéц",
      "translation": "моется / моюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְרַחֶצֶת",
      "transcription": "митрахéцет",
      "translation": "моется / моюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְרַחֲצִים",
      "transcription": "митрахацӣм",
      "translation": "моются / моемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְרַחֲצוֹת",
      "transcription": "митрахацóт",
      "translation": "моются / моемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְרַחַצְתִּי",
      "transcription": "hитрахáцти",
      "translation": "я помылся / помылась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְרַחַצְתָּ",
      "transcription": "hитрахáцта",
      "translation": "ты помылся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְרַחַצְתְּ",
      "transcription": "hитрахáцт",
      "translation": "ты помылась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְרַחֵץ",
      "transcription": "hитрахéц",
      "translation": "он помылся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְרַחֲצָה",
      "transcription": "hитрахацá",
      "translation": "она помылась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְרַחַצְנוּ",
      "transcription": "hитрахáцну",
      "translation": "мы помылись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְרַחַצְתֶּם / הִתְרַחַצְתֶּן",
      "transcription": "hитрахацтéм / hитрахацтéн",
      "translation": "вы помылись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְרַחֲצוּ",
      "transcription": "hитрахацӯ",
      "translation": "они помылись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְרַחֵץ",
      "transcription": "этрахéц",
      "translation": "я помоюсь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְרַחֵץ",
      "transcription": "титрахéц",
      "translation": "ты помоешься / она помоется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְרַחֲצִי",
      "transcription": "титрахацӣ",
      "translation": "ты помоешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְרַחֵץ",
      "transcription": "йитрахéц",
      "translation": "он помоется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְרַחֵץ",
      "transcription": "нитрахéц",
      "translation": "мы помоемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְרַחֲצוּ",
      "transcription": "титрахацӯ",
      "translation": "вы помоетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְרַחֲצוּ",
      "transcription": "йитрахацӯ",
      "translation": "они помоются"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְרַחֵץ",
      "transcription": "hитрахéц",
      "translation": "умойся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְרַחֲצִי",
      "transcription": "hитрахацӣ",
      "translation": "умойся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְרַחֲצוּ",
      "transcription": "hитрахацӯ",
      "translation": "умойтесь"
    }
  ]
},
  'להתרגש': {
  "infinitive": {
    "hebrew": "לְהִתְרַגֵּשׁ",
    "transcription": "леhитрагéш",
    "translation": "волновать(ся), переживать, восторгаться"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ר-ג-ש",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְרַגֵּשׁ",
      "transcription": "митрагéш",
      "translation": "волнуется / волнуюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְרַגֶּשֶׁת",
      "transcription": "митрагéшет",
      "translation": "волнуется / волнуюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְרַגְּשִׁים",
      "transcription": "митрагшӣм",
      "translation": "волнуются / волнуемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְרַגְּשׁוֹת",
      "transcription": "митрагшóт",
      "translation": "волнуются / волнуемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְרַגַּשְׁתִּי",
      "transcription": "hитрагáшти",
      "translation": "я разволновался / разволновалась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְרַגַּשְׁתָּ",
      "transcription": "hитрагáшта",
      "translation": "ты разволновался"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְרַגַּשְׁתְּ",
      "transcription": "hитрагáшт",
      "translation": "ты разволновалась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְרַגֵּשׁ",
      "transcription": "hитрагéш",
      "translation": "он разволновался"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְרַגְּשָׁה",
      "transcription": "hитрагшá",
      "translation": "она разволновалась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְרַגַּשְׁנוּ",
      "transcription": "hитрагáшну",
      "translation": "мы разволновались"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְרַגַּשְׁתֶּם / הִתְרַגַּשְׁתֶּן",
      "transcription": "hитрагаштéм / hитрагаштéн",
      "translation": "вы разволновались"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְרַגְּשׁוּ",
      "transcription": "hитрагшӯ",
      "translation": "они разволновались"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְרַגֵּשׁ",
      "transcription": "этрагéш",
      "translation": "я буду волноваться"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְרַגֵּשׁ",
      "transcription": "титрагéш",
      "translation": "ты будешь волноваться / она будет волноваться"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְרַגְּשִׁי",
      "transcription": "титрагшӣ",
      "translation": "ты будешь волноваться (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְרַגֵּשׁ",
      "transcription": "йитрагéш",
      "translation": "он будет волноваться"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְרַגֵּשׁ",
      "transcription": "нитрагéш",
      "translation": "мы будем волноваться"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְרַגְּשׁוּ",
      "transcription": "титрагшӯ",
      "translation": "вы будете волноваться"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְרַגְּשׁוּ",
      "transcription": "йитрагшӯ",
      "translation": "они будут волноваться"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְרַגֵּשׁ",
      "transcription": "hитрагéш",
      "translation": "волнуйся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְרַגְּשִׁי",
      "transcription": "hитрагшӣ",
      "translation": "волнуйся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְרַגְּשׁוּ",
      "transcription": "hитрагшӯ",
      "translation": "волнуйтесь"
    }
  ]
},
  'להתחתן': {
  "infinitive": {
    "hebrew": "לְהִתְחַתֵּן",
    "transcription": "леhитхатéн",
    "translation": "жениться, выходить замуж"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ח-ת-ן",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְחַתֵּן",
      "transcription": "митхатéн",
      "translation": "женится / женюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְחַתֶּנֶת",
      "transcription": "митхатéнет",
      "translation": "выходит замуж / выхожу замуж (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְחַתְּנִים",
      "transcription": "митхатнӣм",
      "translation": "женятся / женимся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְחַתְּנוֹת",
      "transcription": "митхатнóт",
      "translation": "выходят замуж / выходим замуж (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְחַתַּנְתִּי",
      "transcription": "hитхатáнти",
      "translation": "я поженился / вышла замуж"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְחַתַּנְתָּ",
      "transcription": "hитхатáнта",
      "translation": "ты женился"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְחַתַּנְתְּ",
      "transcription": "hитхатáнт",
      "translation": "ты вышла замуж"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְחַתֵּן",
      "transcription": "hитхатéн",
      "translation": "он женился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְחַתְּנָה",
      "transcription": "hитхатнá",
      "translation": "она вышла замуж"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְחַתַּנּוּ",
      "transcription": "hитхатáнну",
      "translation": "мы поженились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְחַתַּנְתֶּם / הִתְחַתַּנְתֶּן",
      "transcription": "hитхатантéм / hитхатантéн",
      "translation": "вы поженились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְחַתְּנוּ",
      "transcription": "hитхатнӯ",
      "translation": "они поженились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְחַתֵּן",
      "transcription": "этхатéн",
      "translation": "я женюсь / выйду замуж"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְחַתֵּן",
      "transcription": "титхатéн",
      "translation": "ты женишься / она выйдет замуж"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְחַתְּנִי",
      "transcription": "титхатнӣ",
      "translation": "ты выйдешь замуж (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְחַתֵּן",
      "transcription": "йитхатéн",
      "translation": "он женится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְחַתֵּן",
      "transcription": "нитхатéн",
      "translation": "мы поженимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְחַתְּנוּ",
      "transcription": "титхатнӯ",
      "translation": "вы поженитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְחַתְּנוּ",
      "transcription": "йитхатнӯ",
      "translation": "они поженятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְחַתֵּן",
      "transcription": "hитхатéн",
      "translation": "женись (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְחַתְּנִי",
      "transcription": "hитхатнӣ",
      "translation": "выходи замуж (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְחַתְּנוּ",
      "transcription": "hитхатнӯ",
      "translation": "женитесь"
    }
  ]
},
  'להסתכל': {
  "infinitive": {
    "hebrew": "לְהִסְתַּכֵּל",
    "transcription": "леhистакéль",
    "translation": "смотреть, глядеть"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ס-כ-ל",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִסְתַּכֵּל",
      "transcription": "мистакéль",
      "translation": "смотрит / смотрю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִסְתַּכֶּלֶת",
      "transcription": "мистакéлет",
      "translation": "смотрит / смотрю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִסְתַּכְּלִים",
      "transcription": "мистаклӣм",
      "translation": "смотрят / смотрим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִסְתַּכְּלוֹת",
      "transcription": "мистаклóт",
      "translation": "смотрят / смотрим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִסְתַּכַּלְתִּי",
      "transcription": "hистакáльти",
      "translation": "я посмотрел(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִסְתַּכַּלְתָּ",
      "transcription": "hистакáльта",
      "translation": "ты посмотрел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִסְתַּכַּלְתְּ",
      "transcription": "hистакáльт",
      "translation": "ты посмотрела"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִסְתַּכֵּל",
      "transcription": "hистакéль",
      "translation": "он посмотрел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִסְתַּכְּלָה",
      "transcription": "hистаклá",
      "translation": "она посмотрела"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִסְתַּכַּלְנוּ",
      "transcription": "hистакáльну",
      "translation": "мы посмотрели"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִסְתַּכַּלְתֶּם / הִסְתַּכַּלְתֶּן",
      "transcription": "hистакальтéм / hистакальтéн",
      "translation": "вы посмотрели"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִסְתַּכְּלוּ",
      "transcription": "hистаклӯ",
      "translation": "они посмотрели"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶסְתַּכֵּל",
      "transcription": "эстакéль",
      "translation": "я посмотрю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּסְתַּכֵּל",
      "transcription": "тистакéль",
      "translation": "ты посмотришь / она посмотрит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּסְתַּכְּלִי",
      "transcription": "тистаклӣ",
      "translation": "ты посмотришь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִסְתַּכֵּל",
      "transcription": "йистакéль",
      "translation": "он посмотрит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִסְתַּכֵּל",
      "transcription": "нистакéль",
      "translation": "мы посмотрим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּסְתַּכְּלוּ",
      "transcription": "тистаклӯ",
      "translation": "вы посмотрите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִסְתַּכְּלוּ",
      "transcription": "йистаклӯ",
      "translation": "они посмотрят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִסְתַּכֵּל",
      "transcription": "hистакéль",
      "translation": "смотри (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִסְתַּכְּלִי",
      "transcription": "hистаклӣ",
      "translation": "смотри (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִסְתַּכְּלוּ",
      "transcription": "hистаклӯ",
      "translation": "смотрите"
    }
  ]
},
  'להתקדם': {
  "infinitive": {
    "hebrew": "לְהִתְקַדֵּם",
    "transcription": "леhиткадéм",
    "translation": "продвигаться, делать успехи"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ק-ד-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְקַדֵּם",
      "transcription": "миткадéм",
      "translation": "продвигается / продвигаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְקַדֶּמֶת",
      "transcription": "миткадéмет",
      "translation": "продвигается / продвигаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְקַדְּמִים",
      "transcription": "миткадмӣм",
      "translation": "продвигаются / продвигаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְקַדְּמוֹת",
      "transcription": "миткадмóт",
      "translation": "продвигаются / продвигаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְקַדַּמְתִּי",
      "transcription": "hиткадáмти",
      "translation": "я продвинулся / продвинулась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְקַדַּמְתָּ",
      "transcription": "hиткадáмта",
      "translation": "ты продвинулся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְקַדַּמְתְּ",
      "transcription": "hиткадáмт",
      "translation": "ты продвинулась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְקַדֵּם",
      "transcription": "hиткадéм",
      "translation": "он продвинулся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְקַדְּמָה",
      "transcription": "hиткадмá",
      "translation": "она продвинулась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְקַדַּמְנוּ",
      "transcription": "hиткадáмну",
      "translation": "мы продвинулись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְקַדַּמְתֶּם / הִתְקַדַּמְתֶּן",
      "transcription": "hиткадамтéм / hиткадамтéн",
      "translation": "вы продвинулись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְקַדְּמוּ",
      "transcription": "hиткадмӯ",
      "translation": "они продвинулись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְקַדֵּם",
      "transcription": "эткадéм",
      "translation": "я продвинусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְקַדֵּם",
      "transcription": "титкадéм",
      "translation": "ты продвинешься / она продвинется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְקַדְּמִי",
      "transcription": "титкадмӣ",
      "translation": "ты продвинешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְקַדֵּם",
      "transcription": "йиткадéм",
      "translation": "он продвинется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְקַדֵּם",
      "transcription": "ниткадéм",
      "translation": "мы продвинемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְקַדְּמוּ",
      "transcription": "титкадмӯ",
      "translation": "вы продвинетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְקַדְּמוּ",
      "transcription": "йиткадмӯ",
      "translation": "они продвинутся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְקַדֵּם",
      "transcription": "hиткадéм",
      "translation": "продвигайся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְקַדְּמִי",
      "transcription": "hиткадмӣ",
      "translation": "продвигайся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְקַדְּמוּ",
      "transcription": "hиткадмӯ",
      "translation": "продвигайтесь"
    }
  ]
},
  'להתרגל': {
  "infinitive": {
    "hebrew": "לְהִתְרַגֵּל",
    "transcription": "леhитрагéль",
    "translation": "привыкать"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ר-ג-ל",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְרַגֵּל",
      "transcription": "митрагéль",
      "translation": "привыкает / привыкаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְרַגֶּלֶת",
      "transcription": "митрагéлет",
      "translation": "привыкает / привыкаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְרַגְּלִים",
      "transcription": "митраглӣм",
      "translation": "привыкают / привыкаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְרַגְּלוֹת",
      "transcription": "митраглóт",
      "translation": "привыкают / привыкаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְרַגַּלְתִּי",
      "transcription": "hитрагáльти",
      "translation": "я привык(ла)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְרַגַּלְתָּ",
      "transcription": "hитрагáльта",
      "translation": "ты привык"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְרַגַּלְתְּ",
      "transcription": "hитрагáльт",
      "translation": "ты привыкла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְרַגֵּל",
      "transcription": "hитрагéль",
      "translation": "он привык"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְרַגְּלָה",
      "transcription": "hитраглá",
      "translation": "она привыкла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְרַגַּלְנוּ",
      "transcription": "hитрагáльну",
      "translation": "мы привыкли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְרַגַּלְתֶּם / הִתְרַגַּלְתֶּן",
      "transcription": "hитрагальтéм / hитрагальтéн",
      "translation": "вы привыкли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְרַגְּלוּ",
      "transcription": "hитраглӯ",
      "translation": "они привыкли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְרַגֵּל",
      "transcription": "этрагéль",
      "translation": "я привыкну"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְרַגֵּל",
      "transcription": "титрагéль",
      "translation": "ты привыкнешь / она привыкнет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְרַגְּלִי",
      "transcription": "титраглӣ",
      "translation": "ты привыкнешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְרַגֵּל",
      "transcription": "йитрагéль",
      "translation": "он привыкнет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְרַגֵּל",
      "transcription": "нитрагéль",
      "translation": "мы привыкнем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְרַגְּלוּ",
      "transcription": "титраглӯ",
      "translation": "вы привыкнете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְרַגְּלוּ",
      "transcription": "йитраглӯ",
      "translation": "они привыкнут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְרַגֵּל",
      "transcription": "hитрагéль",
      "translation": "привыкай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְרַגְּלִי",
      "transcription": "hитраглӣ",
      "translation": "привыкай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְרַגְּלוּ",
      "transcription": "hитраглӯ",
      "translation": "привыкайте"
    }
  ]
},
  'להיזהר': {
  "infinitive": {
    "hebrew": "לְהִזָּהֵר",
    "transcription": "леhизаhéр",
    "translation": "остерегаться, быть осторожным"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "ז-ה-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִזְהָר",
      "transcription": "низháр",
      "translation": "осторожен / осторожничаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִזְהֶרֶת",
      "transcription": "низhéрет",
      "translation": "осторожна / осторожничаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִזְהָרִים",
      "transcription": "низhарӣм",
      "translation": "осторожны / осторожничаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִזְהָרוֹת",
      "transcription": "низhарóт",
      "translation": "осторожны / осторожничаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִזְהַרְתִּי",
      "transcription": "низháрти",
      "translation": "я остерегался / остерегалась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִזְהַרְתָּ",
      "transcription": "низháрта",
      "translation": "ты остерегался"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִזְהַרְתְּ",
      "transcription": "низháрт",
      "translation": "ты остерегалась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִזְהַר",
      "transcription": "низháр",
      "translation": "он остерегался"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִזְהֲרָה",
      "transcription": "низhарá",
      "translation": "она остерегалась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִזְהַרְנוּ",
      "transcription": "низháрну",
      "translation": "мы остерегались"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִזְהַרְתֶּם / נִזְהַרְתֶּן",
      "transcription": "низhартéм / низhартéн",
      "translation": "вы остерегались"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִזְהֲרוּ",
      "transcription": "низhарӯ",
      "translation": "они остерегались"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶזָּהֵר",
      "transcription": "эззаhéр",
      "translation": "я буду осторожен / осторожна"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּזָּהֵר",
      "transcription": "тиззаhéр",
      "translation": "ты будешь осторожен / она будет осторожна"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּזָּהֲרִי",
      "transcription": "тиззаhарӣ",
      "translation": "ты будешь осторожна (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִזָּהֵר",
      "transcription": "йиззаhéр",
      "translation": "он будет осторожен"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִזָּהֵר",
      "transcription": "низзаhéр",
      "translation": "мы будем осторожны"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּזָּהֲרוּ",
      "transcription": "тиззаhарӯ",
      "translation": "вы будете осторожны"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִזָּהֲרוּ",
      "transcription": "йиззаhарӯ",
      "translation": "они будут осторожны"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִזָּהֵר",
      "transcription": "hиззаhéр",
      "translation": "осторожно / берегись (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִזָּהֲרִי",
      "transcription": "hиззаhарӣ",
      "translation": "осторожно / берегись (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִזָּהֲרוּ",
      "transcription": "hиззаhарӯ",
      "translation": "осторожно / берегитесь"
    }
  ]
},
  'להיזכר': {
  "infinitive": {
    "hebrew": "לְהִזָּכֵר",
    "transcription": "леhизахéр",
    "translation": "вспоминать, припоминать"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "ז-כ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִזְכָּר",
      "transcription": "низкáр",
      "translation": "вспоминает / вспоминаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִזְכֶּרֶת",
      "transcription": "низкéрет",
      "translation": "вспоминает / вспоминаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִזְכָּרִים",
      "transcription": "низкарӣм",
      "translation": "вспоминают / вспоминаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִזְכָּרוֹת",
      "transcription": "низкарóт",
      "translation": "вспоминают / вспоминаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִזְכַּרְתִּי",
      "transcription": "низкáрти",
      "translation": "я вспомнил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִזְכַּרְתָּ",
      "transcription": "низкáрта",
      "translation": "ты вспомнил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִזְכַּרְתְּ",
      "transcription": "низкáрт",
      "translation": "ты вспомнила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִזְכַּר",
      "transcription": "низкáр",
      "translation": "он вспомнил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִזְכְּרָה",
      "transcription": "низкрá",
      "translation": "она вспомнила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִזְכַּרְנוּ",
      "transcription": "низкáрну",
      "translation": "мы вспомнили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִזְכַּרְתֶּם / נִזְכַּרְתֶּן",
      "transcription": "низкартéм / низкартéн",
      "translation": "вы вспомнили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִזְכְּרוּ",
      "transcription": "низкрӯ",
      "translation": "они вспомнили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶזָּכֵר",
      "transcription": "эззахéр",
      "translation": "я вспомню"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּזָּכֵר",
      "transcription": "тиззахéр",
      "translation": "ты вспомнишь / она вспомнит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּזָּכְרִי",
      "transcription": "тиззахрӣ",
      "translation": "ты вспомнишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִזָּכֵר",
      "transcription": "йиззахéр",
      "translation": "он вспомнит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִזָּכֵר",
      "transcription": "низзахéр",
      "translation": "мы вспомним"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּזָּכְרוּ",
      "transcription": "тиззахрӯ",
      "translation": "вы вспомните"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִזָּכְרוּ",
      "transcription": "йиззахрӯ",
      "translation": "они вспомнят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִזָּכֵר",
      "transcription": "hиззахéр",
      "translation": "вспомни (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִזָּכְרִי",
      "transcription": "hиззахрӣ",
      "translation": "вспомни (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִזָּכְרוּ",
      "transcription": "hиззахрӯ",
      "translation": "вспомните"
    }
  ]
},
  'להיפרד': {
  "infinitive": {
    "hebrew": "לְהִפָּרֵד",
    "transcription": "леhипарéд",
    "translation": "расставаться, прощаться"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "פ-ר-ד",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִפְרָד",
      "transcription": "нифрáд",
      "translation": "прощается / прощаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִפְרֶדֶת",
      "transcription": "нифрéдет",
      "translation": "прощается / прощаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִפְרָדִים",
      "transcription": "нифрадӣм",
      "translation": "прощаются / прощаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִפְרָדוֹת",
      "transcription": "нифрадóт",
      "translation": "прощаются / прощаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִפְרַדְתִּי",
      "transcription": "нифрáдти",
      "translation": "я попрощался / попрощалась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִפְרַדְתָּ",
      "transcription": "нифрáдта",
      "translation": "ты попрощался"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִפְרַדְתְּ",
      "transcription": "нифрáдт",
      "translation": "ты попрощалась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִפְרַד",
      "transcription": "нифрáд",
      "translation": "он попрощался"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִפְרְדָה",
      "transcription": "нифредá",
      "translation": "она попрощалась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפְרַדְנוּ",
      "transcription": "нифрáдну",
      "translation": "мы попрощались"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִפְרַדְתֶּם / נִפְרַדְתֶּן",
      "transcription": "нифрадтéм / нифрадтéн",
      "translation": "вы попрощались"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִפְרְדוּ",
      "transcription": "нифредӯ",
      "translation": "они попрощались"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶפָּרֵד",
      "transcription": "эппарéд",
      "translation": "я попрощаюсь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּפָּרֵד",
      "transcription": "типпарéд",
      "translation": "ты попрощаешься / она попрощается"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּפָּרְדִי",
      "transcription": "типпардӣ",
      "translation": "ты попрощаешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִפָּרֵד",
      "transcription": "йиппарéд",
      "translation": "он попрощается"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפָּרֵד",
      "transcription": "ниппарéд",
      "translation": "мы попрощаемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּפָּרְדוּ",
      "transcription": "типпардӯ",
      "translation": "вы попрощаетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִפָּרְדוּ",
      "transcription": "йиппардӯ",
      "translation": "они попрощаются"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִפָּרֵד",
      "transcription": "hиппарéд",
      "translation": "прощайся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִפָּרְדִי",
      "transcription": "hиппардӣ",
      "translation": "прощайся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִפָּרְדוּ",
      "transcription": "hиппардӯ",
      "translation": "прощайтесь"
    }
  ]
},
  'להירדם': {
  "infinitive": {
    "hebrew": "לְהֵרָדֵם",
    "transcription": "леhерадéм",
    "translation": "засыпать"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "ר-ד-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִרְדָּם",
      "transcription": "нирдáм",
      "translation": "засыпает / засыпаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִרְדֶּמֶת",
      "transcription": "нирдéмет",
      "translation": "засыпает / засыпаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִרְדָּמִים",
      "transcription": "нирдамӣм",
      "translation": "засыпают / засыпаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִרְדָּמוֹת",
      "transcription": "нирдамóт",
      "translation": "засыпают / засыпаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִרְדַּמְתִּי",
      "transcription": "нирдáмти",
      "translation": "я заснул(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִרְדַּמְתָּ",
      "transcription": "нирдáмта",
      "translation": "ты заснул"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִרְדַּמְתְּ",
      "transcription": "нирдáмт",
      "translation": "ты заснула"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִרְדַּם",
      "transcription": "нирдáм",
      "translation": "он заснул"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִרְדְּמָה",
      "transcription": "нирдэмá",
      "translation": "она заснула"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִרְדַּמְנוּ",
      "transcription": "нирдáмну",
      "translation": "мы заснули"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִרְדַּמְתֶּם / נִרְדַּמְתֶּן",
      "transcription": "нирдамтéм / нирдамтéн",
      "translation": "вы заснули"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִרְדְּמוּ",
      "transcription": "нирдэмӯ",
      "translation": "они заснули"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֵרָדֵם",
      "transcription": "эрадéм",
      "translation": "я засну"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תֵּרָדֵם",
      "transcription": "терадéм",
      "translation": "ты заснешь / она заснет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תֵּרָדְמִי",
      "transcription": "терадмӣ",
      "translation": "ты заснешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יֵרָדֵם",
      "transcription": "йерадéм",
      "translation": "он заснет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נֵרָדֵם",
      "transcription": "нерадéм",
      "translation": "мы заснем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תֵּרָדְמוּ",
      "transcription": "терадмӯ",
      "translation": "вы заснете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יֵרָדְמוּ",
      "transcription": "йерадмӯ",
      "translation": "они заснут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הֵרָדֵם",
      "transcription": "hерадéм",
      "translation": "засыпай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הֵרָדְמִי",
      "transcription": "hерадмӣ",
      "translation": "засыпай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הֵרָדְמוּ",
      "transcription": "hерадмӯ",
      "translation": "засыпайте"
    }
  ]
},
  'לפגוש': {
  "infinitive": {
    "hebrew": "לִפְגּוֹשׁ",
    "transcription": "лифгóш",
    "translation": "встречать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "פ-ג-ש",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "פּוֹגֵשׁ",
      "transcription": "погéш",
      "translation": "встречает / встречаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "פּוֹגֶשֶׁת",
      "transcription": "погéшет",
      "translation": "встречает / встречаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "פּוֹגְשִׁים",
      "transcription": "погшӣм",
      "translation": "встречают / встречаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "פּוֹגְשׁוֹת",
      "transcription": "погшóт",
      "translation": "встречают / встречаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "פָּגַשְׁתִּי",
      "transcription": "пагáшти",
      "translation": "я встретил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "פָּגַשְׁתָּ",
      "transcription": "пагáшта",
      "translation": "ты встретил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "פָּגַשְׁתְּ",
      "transcription": "пагáшт",
      "translation": "ты встретила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "פָּגַשׁ",
      "transcription": "пагáш",
      "translation": "он встретил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "פָּגְשָׁה",
      "transcription": "пагшá",
      "translation": "она встретила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "פָּגַשְׁנוּ",
      "transcription": "пагáшну",
      "translation": "мы встретили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "פְּגַשְׁתֶּם / פְּגַשְׁתֶּן",
      "transcription": "пгаштéм / пгаштéн",
      "translation": "вы встретили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "פָּגְשׁוּ",
      "transcription": "пагшӯ",
      "translation": "они встретили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶפְגֹּשׁ",
      "transcription": "эфгóш",
      "translation": "я встречу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּפְגֹּשׁ",
      "transcription": "тифгóш",
      "translation": "ты встретишь / она встретит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּפְגְּשִׁי",
      "transcription": "тифгешӣ",
      "translation": "ты встретишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִפְגֹּשׁ",
      "transcription": "йифгóш",
      "translation": "он встретит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפְגֹּשׁ",
      "transcription": "нифгóш",
      "translation": "мы встретим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּפְגְּשׁוּ",
      "transcription": "тифгешӯ",
      "translation": "вы встретите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִפְגְּשׁוּ",
      "transcription": "йифгешӯ",
      "translation": "они встретят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "פְּגֹשׁ",
      "transcription": "пгош",
      "translation": "встреть (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "פִּגְשִׁי",
      "transcription": "пигшӣ",
      "translation": "встреть (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "פִּגְשׁוּ",
      "transcription": "пигшӯ",
      "translation": "встретьте"
    }
  ]
},
  'לסדר': {
  "infinitive": {
    "hebrew": "לְסַדֵּר",
    "transcription": "лесадéр",
    "translation": "наводить порядок, устраивать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ס-ד-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְסַדֵּר",
      "transcription": "месадéр",
      "translation": "убирает / навожу порядок (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְסַדֶּרֶת",
      "transcription": "месадéрет",
      "translation": "убирает / навожу порядок (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְסַדְּרִים",
      "transcription": "месадрӣм",
      "translation": "убирают / наводим порядок (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְסַדְּרוֹת",
      "transcription": "месадрóт",
      "translation": "убирают / наводим порядок (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "סִדַּרְתִּי",
      "transcription": "сидáрти",
      "translation": "я навел(а) порядок"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "סִדַּרְתָּ",
      "transcription": "сидáрта",
      "translation": "ты навел порядок"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "סִדַּרְתְּ",
      "transcription": "сидáрт",
      "translation": "ты навела порядок"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "סִדֵּר",
      "transcription": "сидéр",
      "translation": "он навел порядок"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "סִדְּרָה",
      "transcription": "сидрá",
      "translation": "она навела порядок"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "סִדַּרְנוּ",
      "transcription": "сидáрну",
      "translation": "мы навели порядок"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "סִדַּרְתֶּם / סִדַּרְתֶּן",
      "transcription": "сидартéм / сидартéн",
      "translation": "вы навели порядок"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "סִדְּרוּ",
      "transcription": "сидрӯ",
      "translation": "они навели порядок"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲסַדֵּר",
      "transcription": "асадéр",
      "translation": "я наведу порядок"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּסַדֵּר",
      "transcription": "тесадéр",
      "translation": "ты наведешь порядок / она наведет порядок"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּסַדְּרִי",
      "transcription": "тесадрӣ",
      "translation": "ты наведешь порядок (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְסַדֵּר",
      "transcription": "йесадéр",
      "translation": "он наведет порядок"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְסַדֵּר",
      "transcription": "несадéр",
      "translation": "мы наведем порядок"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּסַדְּרוּ",
      "transcription": "тесадрӯ",
      "translation": "вы наведете порядок"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְסַדְּרוּ",
      "transcription": "йесадрӯ",
      "translation": "они наведут порядок"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "סַדֵּר",
      "transcription": "садéр",
      "translation": "наведи порядок (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "סַדְּרִי",
      "transcription": "садрӣ",
      "translation": "наведи порядок (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "סַדְּרוּ",
      "transcription": "садрӯ",
      "translation": "наведите порядок"
    }
  ]
},
  'לשחק': {
  "infinitive": {
    "hebrew": "לְשַׂחֵק",
    "transcription": "лесахéк",
    "translation": "играть (в игры, на сцене)"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ש-ח-ק",
  "present": [
    {
      "pronoun": "זָכָר יָחִיд (он / я / ты)",
      "hebrew": "מְשַׂחֵק",
      "transcription": "месахéк",
      "translation": "играет / играю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְשַׂחֶקֶת",
      "transcription": "месахéкет",
      "translation": "играет / играю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְשַׂחֲקִים",
      "transcription": "месахакӣм",
      "translation": "играют / играем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְשַׂחֲקוֹת",
      "transcription": "месахакóт",
      "translation": "играют / играем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "שִׂחַקְתִּי",
      "transcription": "сихáкти",
      "translation": "я играл(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "שִׂחַקְתָּ",
      "transcription": "сихáкта",
      "translation": "ты играл"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "שִׂחַקְתְּ",
      "transcription": "сихáкт",
      "translation": "ты играла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "שִׂחֵק",
      "transcription": "сихéк",
      "translation": "он играл"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "שִׂחֲקָה",
      "transcription": "сихакá",
      "translation": "она играла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "שִׂחַקְנוּ",
      "transcription": "сихáкну",
      "translation": "мы играли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "שִׂחַקְתֶּם / שִׂחַקְתֶּן",
      "transcription": "сихактéм / сихактéн",
      "translation": "вы играли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "שִׂחֲקוּ",
      "transcription": "сихакӯ",
      "translation": "они играли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲשַׂחֵק",
      "transcription": "асахéк",
      "translation": "я сыграю / буду играть"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּשַׂחֵק",
      "transcription": "тесахéк",
      "translation": "ты сыграешь / она сыграет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּשַׂחֲקִי",
      "transcription": "тесахакӣ",
      "translation": "ты сыграешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְשַׂחֵק",
      "transcription": "йесахéк",
      "translation": "он сыграет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְשַׂחֵק",
      "transcription": "несахéк",
      "translation": "мы сыграем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּשַׂחֲקוּ",
      "transcription": "тесахакӯ",
      "translation": "вы сыграете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְשַׂחֲקוּ",
      "transcription": "йесахакӯ",
      "translation": "они сыграют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שַׂחֵק",
      "transcription": "сахéк",
      "translation": "играй (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שַׂחֲקִי",
      "transcription": "сахкӣ",
      "translation": "играй (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שַׂחֲקוּ",
      "transcription": "сахкӯ",
      "translation": "играйте"
    }
  ]
},
  'לעשן': {
  "infinitive": {
    "hebrew": "לְעַשֵּׁן",
    "transcription": "леашéн",
    "translation": "курить"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ע-ש-ן",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְעַשֵּׁן",
      "transcription": "меашéн",
      "translation": "курит / курю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְעַשֶּׁנֶת",
      "transcription": "меашéнет",
      "translation": "курит / курю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְעַשְּׁנִים",
      "transcription": "меашнӣм",
      "translation": "курят / курим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְעַשְּׁנוֹת",
      "transcription": "меашнóт",
      "translation": "курят / курим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "עִשַּׁנְתִּי",
      "transcription": "ишáнти",
      "translation": "я курил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "עִשַּׁנְתָּ",
      "transcription": "ишáнта",
      "translation": "ты курил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "עִשַּׁנְתְּ",
      "transcription": "ишáнт",
      "translation": "ты курила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "עִשֵּׁן",
      "transcription": "ишéн",
      "translation": "он курил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "עִשְּׁנָה",
      "transcription": "ишнá",
      "translation": "она курила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "עִשַּׁנּוּ",
      "transcription": "ишáнну",
      "translation": "мы курили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "עִשַּׁנְתֶּם / עִשַּׁנְתֶּן",
      "transcription": "ишантéм / ишантéн",
      "translation": "вы курили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "עִשְּׁנוּ",
      "transcription": "ишнӯ",
      "translation": "они курили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲעַשֵּׁן",
      "transcription": "аашéн",
      "translation": "я буду курить"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּעַשֵּׁן",
      "transcription": "теашéн",
      "translation": "ты будешь курить / она будет курить"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּעַשְּׁנִי",
      "transcription": "теашнӣ",
      "translation": "ты будешь курить (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְעַשֵּׁן",
      "transcription": "йеашéн",
      "translation": "он будет курить"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְעַשֵּׁן",
      "transcription": "неашéн",
      "translation": "мы будем курить"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּעַשְּׁנוּ",
      "transcription": "теашнӯ",
      "translation": "вы будете курить"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְעַשְּׁנוּ",
      "transcription": "йеашнӯ",
      "translation": "они будут курить"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "עַשֵּׁן",
      "transcription": "ашéн",
      "translation": "кури (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "עַשְּׁנִי",
      "transcription": "ашнӣ",
      "translation": "кури (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "עַשְּׁנוּ",
      "transcription": "ашнӯ",
      "translation": "курите"
    }
  ]
},
  'לברך': {
  "infinitive": {
    "hebrew": "לְבָרֵךְ",
    "transcription": "леварéх",
    "translation": "благословлять, поздравлять"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "ב-ר-ך",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְבָרֵךְ",
      "transcription": "меварéх",
      "translation": "поздравляет / поздравляю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְבָרֶכֶת",
      "transcription": "меварéхет",
      "translation": "поздравляет / поздравляю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְבָרְכִים",
      "transcription": "мевархӣм",
      "translation": "поздравляют / поздравляем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְבָרְכוֹת",
      "transcription": "мевархóт",
      "translation": "поздравляют / поздравляем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "בֵּרַכְתִּי",
      "transcription": "берáхти",
      "translation": "я поздравил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "בֵּרַכְתָּ",
      "transcription": "берáхта",
      "translation": "ты поздравил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "בֵּרַכְתְּ",
      "transcription": "берáхт",
      "translation": "ты поздравила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "בֵּרֵךְ",
      "transcription": "берéх",
      "translation": "он поздравил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "בֵּרְכָה",
      "transcription": "берхá",
      "translation": "она поздравила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "בֵּרַכְנוּ",
      "transcription": "берáхну",
      "translation": "мы поздравили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "בֵּרַכְתֶּם / בֵּרַכְתֶּן",
      "transcription": "берахтéм / берахтéн",
      "translation": "вы поздравили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "בֵּרְכוּ",
      "transcription": "берхӯ",
      "translation": "они поздравили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲבָרֵךְ",
      "transcription": "аварéх",
      "translation": "я поздравлю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּבָרֵךְ",
      "transcription": "теварéх",
      "translation": "ты поздравишь / она поздравит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּבָרְכִי",
      "transcription": "тевархӣ",
      "translation": "ты поздравишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְבָרֵךְ",
      "transcription": "йеварéх",
      "translation": "он поздравит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְבָרֵךְ",
      "transcription": "неварéх",
      "translation": "мы поздравим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּבָרְכוּ",
      "transcription": "тевархӯ",
      "translation": "вы поздравите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְבָרְכוּ",
      "transcription": "йевархӯ",
      "translation": "они поздравят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "בָּרֵךְ",
      "transcription": "барéх",
      "translation": "поздравь (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "בָּרְכִי",
      "transcription": "бархӣ",
      "translation": "поздравь (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "בָּרְכוּ",
      "transcription": "бархӯ",
      "translation": "поздравьте"
    }
  ]
},
  'לאחל': {
  "infinitive": {
    "hebrew": "לְאַחֵל",
    "transcription": "леахéль",
    "translation": "желать (кому-то что-то)"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "א-ח-ל",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְאַחֵל",
      "transcription": "меахéль",
      "translation": "желает / желаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְאַחֶלֶת",
      "transcription": "меахéлет",
      "translation": "желает / желаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְאַחֲלִים",
      "transcription": "меахалӣм",
      "translation": "желают / желаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְאַחֲלוֹת",
      "transcription": "меахалóт",
      "translation": "желают / желаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אִחַלְתִּי",
      "transcription": "ихáльти",
      "translation": "я пожелал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "אִחַלְתָּ",
      "transcription": "ихáльта",
      "translation": "ты пожелал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "אִחַלְתְּ",
      "transcription": "ихáльт",
      "translation": "ты пожелала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "אִחֵל",
      "transcription": "ихéль",
      "translation": "он пожелал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "אִחֲלָה",
      "transcription": "ихалá",
      "translation": "она пожелала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "אִחַלְנוּ",
      "transcription": "ихáльну",
      "translation": "мы пожелали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "אִחַלְתֶּם / אִחַלְתֶּן",
      "transcription": "ихальтéм / ихальтéн",
      "translation": "вы пожелали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "אִחֲלוּ",
      "transcription": "ихалӯ",
      "translation": "они пожелали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲאַחֵל",
      "transcription": "аахéль",
      "translation": "я пожелаю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּאַחֵל",
      "transcription": "теахéль",
      "translation": "ты пожелаешь / она пожелает"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּאַחֲלִי",
      "transcription": "теахалӣ",
      "translation": "ты пожелаешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְאַחֵל",
      "transcription": "йеахéль",
      "translation": "он пожелает"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְאַחֵל",
      "transcription": "неахéль",
      "translation": "мы пожелаем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּאַחֲלוּ",
      "transcription": "теахалӯ",
      "translation": "вы пожелаете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְאַחֲלוּ",
      "transcription": "йеахалӯ",
      "translation": "они пожелают"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "אַחֵל",
      "transcription": "ахéль",
      "translation": "пожелай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "אַחֲלִי",
      "transcription": "ахалӣ",
      "translation": "пожелай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "אַחֲלוּ",
      "transcription": "ахалӯ",
      "translation": "пожелайте"
    }
  ]
},
  'לארגן': {
  "infinitive": {
    "hebrew": "לְאַרְגֵּן",
    "transcription": "леаргéн",
    "translation": "организовывать"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "א-ר-ג-ן",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְאַרְגֵּן",
      "transcription": "меаргéн",
      "translation": "организует / организую (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְאַרְגֶּנֶת",
      "transcription": "меаргéнет",
      "translation": "организует / организую (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְאַרְגְּנִים",
      "transcription": "меаргенӣм",
      "translation": "организуют / организуем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְאַרְגְּנוֹת",
      "transcription": "меаргенóт",
      "translation": "организуют / организуем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אִרְגַּנְתִּי",
      "transcription": "иргáнти",
      "translation": "я организовал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "אִרְגַּנְתָּ",
      "transcription": "иргáнта",
      "translation": "ты организовал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "אִרְגַּנְתְּ",
      "transcription": "иргáнт",
      "translation": "ты организовала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "אִרְגֵּן",
      "transcription": "иргéн",
      "translation": "он организовал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "אִרְגְּנָה",
      "transcription": "иргенá",
      "translation": "она организовала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "אִרְגַּנּוּ",
      "transcription": "иргáнну",
      "translation": "мы организовали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "אִרְגַּנְתֶּם / אִרְגַּנְתֶּן",
      "transcription": "иргантéм / иргантéн",
      "translation": "вы организовали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "אִרְגְּנוּ",
      "transcription": "иргенӯ",
      "translation": "они организовали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲאַרְגֵּן",
      "transcription": "ааргéн",
      "translation": "я организую"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּאַרְגֵּן",
      "transcription": "теаргéн",
      "translation": "ты организуешь / она организует"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּאַרְגְּנִי",
      "transcription": "теаргенӣ",
      "translation": "ты организуешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְאַרְגֵּן",
      "transcription": "йеаргéн",
      "translation": "он организует"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְאַרְגֵּן",
      "transcription": "неаргéн",
      "translation": "мы организуем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּאַרְגְּנוּ",
      "transcription": "теаргенӯ",
      "translation": "вы организуете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְאַרְגְּנוּ",
      "transcription": "йеаргенӯ",
      "translation": "они организуют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "אַרְגֵּן",
      "transcription": "аргéн",
      "translation": "организуй (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "אַרְגְּנִי",
      "transcription": "аргенӣ",
      "translation": "организуй (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "אַרְגְּנוּ",
      "transcription": "аргенӯ",
      "translation": "организуйте"
    }
  ]
},
  'לכבות': {
  "infinitive": {
    "hebrew": "לְכַבּוֹת",
    "transcription": "лехабóт",
    "translation": "выключать свет/прибор, тушить"
  },
  "binyan": "פִּעֵל (Пиэль)",
  "root": "כ-ב-ה",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מְכַבֶּה",
      "transcription": "мехабé",
      "translation": "выключает / выключаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מְכַבָּה",
      "transcription": "мехабá",
      "translation": "выключает / выключаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מְכַבִּים",
      "transcription": "мехабӣм",
      "translation": "выключают / выключаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מְכַבּוֹת",
      "transcription": "мехабóт",
      "translation": "выключают / выключаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "כִּבִּיתִי",
      "transcription": "кибӣти",
      "translation": "я выключил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "כִּבִּיתָ",
      "transcription": "кибӣта",
      "translation": "ты выключил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "כִּבִּית",
      "transcription": "кибӣт",
      "translation": "ты выключила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "כִּבָּה",
      "transcription": "кибá",
      "translation": "он выключил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "כִּבְּתָה",
      "transcription": "кибтá",
      "translation": "она выключила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "כִּבִּינוּ",
      "transcription": "кибӣну",
      "translation": "мы выключили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "כִּבִּיתֶם / כִּבִּיתֶן",
      "transcription": "кибитéм / кибитéн",
      "translation": "вы выключили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "כִּבּוּ",
      "transcription": "кибӯ",
      "translation": "они выключили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֲכַבֶּה",
      "transcription": "ахабé",
      "translation": "я выключу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תְּכַבֶּה",
      "transcription": "техабé",
      "translation": "ты выключишь / она выключит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תְּכַבִּי",
      "transcription": "техабӣ",
      "translation": "ты выключишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יְכַבֶּה",
      "transcription": "йехабé",
      "translation": "он выключит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נְכַבֶּה",
      "transcription": "нехабé",
      "translation": "мы выключим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תְּכַבּוּ",
      "transcription": "техабӯ",
      "translation": "вы выключите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יְכַבּוּ",
      "transcription": "йехабӯ",
      "translation": "они выключат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "כַּבֵּה",
      "transcription": "кабé",
      "translation": "выключи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "כַּבִּי",
      "transcription": "кабӣ",
      "translation": "выключи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "כַּבּוּ",
      "transcription": "кабӯ",
      "translation": "выключите"
    }
  ]
},
  'להמליץ': {
  "infinitive": {
    "hebrew": "לְהַמְלִיץ",
    "transcription": "леhамлӣц",
    "translation": "рекомендовать, советовать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "מ-ל-ץ",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַמְלִיץ",
      "transcription": "мамлӣц",
      "translation": "рекомендует / рекомендую (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַמְלִיצָה",
      "transcription": "мамлицá",
      "translation": "рекомендует / рекомендую (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַמְלִיצִים",
      "transcription": "мамлицӣм",
      "translation": "рекомендуют / рекомендуем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַמְלִיצוֹת",
      "transcription": "мамлицóт",
      "translation": "рекомендуют / рекомендуем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִמְלַצְתִּי",
      "transcription": "hимлáцти",
      "translation": "я порекомендовал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִמְלַצְתָּ",
      "transcription": "hимлáцта",
      "translation": "ты порекомендовал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִמְלַצְתְּ",
      "transcription": "hимлáцт",
      "translation": "ты порекомендовала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִמְלִיץ",
      "transcription": "hимлӣц",
      "translation": "он порекомендовал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִמְלִיצָה",
      "transcription": "hимлицá",
      "translation": "она порекомендовала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִמְלַצְנוּ",
      "transcription": "hимлáцну",
      "translation": "мы порекомендовали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִמְלַצְתֶּם / הִמְלַצְתֶּן",
      "transcription": "hимлацтéм / hимлацтéн",
      "translation": "вы порекомендовали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִמְלִיצוּ",
      "transcription": "hимлицӯ",
      "translation": "они порекомендовали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַמְלִיץ",
      "transcription": "амлӣц",
      "translation": "я порекомендую"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּמְלִיץ",
      "transcription": "тамлӣц",
      "translation": "ты порекомендуешь / она порекомендует"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּמְלִיצִי",
      "transcription": "тамлицӣ",
      "translation": "ты порекомендуешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַמְלִיץ",
      "transcription": "йамлӣц",
      "translation": "он порекомендует"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַמְלִיץ",
      "transcription": "намлӣц",
      "translation": "мы порекомендуем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּמְלִיצוּ",
      "transcription": "тамлицӯ",
      "translation": "вы порекомендуете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַמְלִיצוּ",
      "transcription": "йамлицӯ",
      "translation": "они порекомендуют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַמְלֵץ",
      "transcription": "hамлéц",
      "translation": "порекомендуй (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַמְלִיצִי",
      "transcription": "hамлицӣ",
      "translation": "порекомендуй (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַמְלִיצוּ",
      "transcription": "hамлицӯ",
      "translation": "порекомендуйте"
    }
  ]
},
  'להתפלל': {
  "infinitive": {
    "hebrew": "לְהִתְפַּלֵּל",
    "transcription": "леhитпалéль",
    "translation": "молиться"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "פ-ל-ל",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְפַּלֵּל",
      "transcription": "митпалéль",
      "translation": "молится / молюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְפַּלֶּלֶת",
      "transcription": "митпалéлет",
      "translation": "молится / молюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְפַּלְּלִים",
      "transcription": "митпалелӣм",
      "translation": "молятся / молимся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְפַּלְּלוֹת",
      "transcription": "митпалелóт",
      "translation": "молятся / молимся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְפַּלַּלְתִּי",
      "transcription": "hитпалáльти",
      "translation": "я помолился / помолилась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְפַּלַּלְתָּ",
      "transcription": "hитпалáльта",
      "translation": "ты помолился"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְפַּלַּלְתְּ",
      "transcription": "hитпалáльт",
      "translation": "ты помолилась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְפַּלֵּל",
      "transcription": "hитпалéль",
      "translation": "он помолился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְפַּלְּלָה",
      "transcription": "hитпалелá",
      "translation": "она помолилась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְפַּלַּלְנוּ",
      "transcription": "hитпалáльну",
      "translation": "мы помолились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְפַּלַּלְתֶּם / הִתְפַּלַּלְתֶּן",
      "transcription": "hитпалальтéм / hитпалальтéн",
      "translation": "вы помолились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְפַּלְּלוּ",
      "transcription": "hитпалелӯ",
      "translation": "они помолились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְפַּלֵּל",
      "transcription": "этпалéль",
      "translation": "я помолюсь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְפַּלֵּל",
      "transcription": "титпалéль",
      "translation": "ты помолишься / она помолится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְפַּלְּלִי",
      "transcription": "титпалелӣ",
      "translation": "ты помолишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְפַּלֵּל",
      "transcription": "йитпалéль",
      "translation": "он помолится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְפַּלֵּל",
      "transcription": "нитпалéль",
      "translation": "мы помолимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְפַּלְּלוּ",
      "transcription": "титпалелӯ",
      "translation": "вы помолитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְפַּלְּלוּ",
      "transcription": "йитпалелӯ",
      "translation": "они помолятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְפַּלֵּל",
      "transcription": "hитпалéль",
      "translation": "молись (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְפַּלְּלִי",
      "transcription": "hитпалелӣ",
      "translation": "молись (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְפַּלְּלוּ",
      "transcription": "hитпалелӯ",
      "translation": "молитесь"
    }
  ]
},
  'להצטער': {
  "infinitive": {
    "hebrew": "לְהִצְטַעֵר",
    "transcription": "леhицтаéр",
    "translation": "сожалеть, извиняться"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "צ-ע-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִצְטַעֵר",
      "transcription": "мицтаéр",
      "translation": "сожалеет / извиняюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִצְטַעֶרֶת",
      "transcription": "мицтаéрет",
      "translation": "сожалеет / извиняюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִצְטַעֲרִים",
      "transcription": "мицтаарӣм",
      "translation": "сожалеют / извиняемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִצְטַעֲרוֹת",
      "transcription": "мицтаарóт",
      "translation": "сожалеют / извиняемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִצְטַעַרְתִּי",
      "transcription": "hицтаáрти",
      "translation": "я пожалел(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִצְטַעַרְתָּ",
      "transcription": "hицтаáрта",
      "translation": "ты пожалел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִצְטַעַרְתְּ",
      "transcription": "hицтаáрт",
      "translation": "ты пожалела"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִצְטַעֵר",
      "transcription": "hицтаéр",
      "translation": "он пожалел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִצְטַעֲרָה",
      "transcription": "hицтаарá",
      "translation": "она пожалела"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִצְטַעַרְנוּ",
      "transcription": "hицтаáрну",
      "translation": "мы пожалели"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִצְטַעַרְתֶּם / הִצְטַעַרְתֶּן",
      "transcription": "hицтаартéм / hицтаартéн",
      "translation": "вы пожалели"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִצְטַעֲרוּ",
      "transcription": "hицтаарӯ",
      "translation": "они пожалели"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶצְטַעֵר",
      "transcription": "эцтаéр",
      "translation": "я пожалею"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּצְטַעֵר",
      "transcription": "тицтаéр",
      "translation": "ты пожалеешь / она пожалеет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּצְטַעֲרִי",
      "transcription": "тицтаарӣ",
      "translation": "ты пожалеешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִצְטַעֵר",
      "transcription": "йицтаéр",
      "translation": "он пожалеет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִצְטַעֵר",
      "transcription": "ництаéр",
      "translation": "мы пожалеем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּצְטַעֲרוּ",
      "transcription": "тицтаарӯ",
      "translation": "вы пожалеете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִצְטַעֲרוּ",
      "transcription": "йицтаарӯ",
      "translation": "они пожалеют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִצְטַעֵר",
      "transcription": "hицтаéр",
      "translation": "сожалей (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִצְטַעֲרִי",
      "transcription": "hицтаарӣ",
      "translation": "сожалей (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִצְטַעֲרוּ",
      "transcription": "hицтаарӯ",
      "translation": "сожалейте"
    }
  ]
},
  'להיכנס': {
  "infinitive": {
    "hebrew": "לְהִכָּנֵס",
    "transcription": "леhиканéс",
    "translation": "входить"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "כ-נ-ס",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִכְנָס",
      "transcription": "нихнáс",
      "translation": "входит / вхожу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִכְנֶסֶת",
      "transcription": "нихнéсет",
      "translation": "входит / вхожу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִכְנָסִים",
      "transcription": "нихнасӣм",
      "translation": "входят / входим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִכְנָסוֹת",
      "transcription": "нихнасóт",
      "translation": "входят / входим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִכְנַסְתִּי",
      "transcription": "нихнáсти",
      "translation": "я вошел / вошла"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִכְנַסְתָּ",
      "transcription": "нихнáста",
      "translation": "ты вошел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִכְנַסְתְּ",
      "transcription": "нихнáст",
      "translation": "ты вошла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִכְנַס",
      "transcription": "нихнáс",
      "translation": "он вошел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִכְנְסָה",
      "transcription": "нихнесá",
      "translation": "она вошла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִכְנַסְנוּ",
      "transcription": "нихнáсну",
      "translation": "мы вошли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִכְנַסְתֶּם / נִכְנַסְתֶּן",
      "transcription": "нихнастéм / нихнастéн",
      "translation": "вы вошли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִכְנְסוּ",
      "transcription": "нихнесӯ",
      "translation": "они вошли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶכָּנֵס",
      "transcription": "экканéс",
      "translation": "я войду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּכָּנֵס",
      "transcription": "тикканéс",
      "translation": "ты войдешь / она войдет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּכָּנְסִי",
      "transcription": "тиккансӣ",
      "translation": "ты войдешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִכָּנֵס",
      "transcription": "йикканéс",
      "translation": "он войдет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִכָּנֵס",
      "transcription": "никканéс",
      "translation": "мы войдем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּכָּנְסוּ",
      "transcription": "тиккансӯ",
      "translation": "вы войдете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִכָּנְסוּ",
      "transcription": "йиккансӯ",
      "translation": "они войдут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִכָּנֵס",
      "transcription": "hикканéс",
      "translation": "войди (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִכָּנְסִי",
      "transcription": "hиккансӣ",
      "translation": "войди (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִכָּנְסוּ",
      "transcription": "hиккансӯ",
      "translation": "войдите"
    }
  ]
},
  'להישאר': {
  "infinitive": {
    "hebrew": "לְהִשָּׁאֵר",
    "transcription": "леhишаэ́р",
    "translation": "оставаться"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "ש-א-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִשְׁאָר",
      "transcription": "ниш’áр",
      "translation": "остается / остаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִשְׁאֶרֶת",
      "transcription": "ниш’éрет",
      "translation": "остается / остаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִשְׁאָרִים",
      "transcription": "ниш’арӣм",
      "translation": "остаются / остаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִשְׁאָרוֹת",
      "transcription": "ниш’арóт",
      "translation": "остаются / остаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִשְׁאַרְתִּי",
      "transcription": "ниш’áрти",
      "translation": "я остался / осталась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִשְׁאַרְתָּ",
      "transcription": "ниш’áрта",
      "translation": "ты остался"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִשְׁאַרְתְּ",
      "transcription": "ниш’áрт",
      "translation": "ты осталась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִשְׁאַר",
      "transcription": "ниш’áр",
      "translation": "он остался"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִשְׁאֲרָה",
      "transcription": "ниш’арá",
      "translation": "она осталась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִשְׁאַרְנוּ",
      "transcription": "ниш’áрну",
      "translation": "мы остались"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִשְׁאַרְתֶּם / נִשְׁאַרְתֶּן",
      "transcription": "ниш’артéм / ниш’артéн",
      "translation": "вы остались"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִשְׁאֲרוּ",
      "transcription": "ниш’арӯ",
      "translation": "они остались"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶשָּׁאֵר",
      "transcription": "эшшаэ́р",
      "translation": "я останусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּשָּׁאֵר",
      "transcription": "тишшаэ́р",
      "translation": "ты останешься / она останется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּשָּׁאֲרִי",
      "transcription": "тишшаарӣ",
      "translation": "ты останешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִשָּׁאֵר",
      "transcription": "йишшаэ́р",
      "translation": "он останется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִשָּׁאֵר",
      "transcription": "нишшаэ́р",
      "translation": "мы останемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּשָּׁאֲרוּ",
      "transcription": "тишшаарӯ",
      "translation": "вы останетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִשָּׁאֲרוּ",
      "transcription": "йишшаарӯ",
      "translation": "они останутся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִשָּׁאֵר",
      "transcription": "hишшаэ́р",
      "translation": "останься (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִשָּׁאֲרִי",
      "transcription": "hишшаарӣ",
      "translation": "останься (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִשָּׁאֲרוּ",
      "transcription": "hишшаарӯ",
      "translation": "останьтесь"
    }
  ]
},
  'להיפגש': {
  "infinitive": {
    "hebrew": "לְהִפָּגֵשׁ",
    "transcription": "леhипагéш",
    "translation": "встречаться друг с другом"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "פ-ג-ש",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִפְגָּשׁ",
      "transcription": "нифгáш",
      "translation": "встречается / встречаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִפְגֶּשֶׁת",
      "transcription": "нифгéшет",
      "translation": "встречается / встречаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִפְגָּשִׁים",
      "transcription": "нифгашӣм",
      "translation": "встречаются / встречаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִפְגָּשׁוֹת",
      "transcription": "нифгашóт",
      "translation": "встречаются / встречаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִפְגַּשְׁתִּי",
      "transcription": "нифгáшти",
      "translation": "я встретился / встретилась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִפְגַּשְׁתָּ",
      "transcription": "нифгáшта",
      "translation": "ты встретился"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִפְגַּשְׁתְּ",
      "transcription": "нифгáшт",
      "translation": "ты встретилась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִפְגַּשׁ",
      "transcription": "нифгáш",
      "translation": "он встретился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִפְגְּשָׁה",
      "transcription": "нифгешá",
      "translation": "она встретилась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפְגַּשְׁנוּ",
      "transcription": "нифгáшну",
      "translation": "мы встретились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִפְגַּשְׁתֶּם / נִפְגַּשְׁתֶּן",
      "transcription": "нифгаштéм / нифгаштéн",
      "translation": "вы встретились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִפְגְּשׁוּ",
      "transcription": "нифгешӯ",
      "translation": "они встретились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶפָּגֵשׁ",
      "transcription": "эппагéш",
      "translation": "я встречусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּפָּגֵשׁ",
      "transcription": "типпагéш",
      "translation": "ты встретишься / она встретится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּפָּגְשִׁי",
      "transcription": "типпагшӣ",
      "translation": "ты встретишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִפָּגֵשׁ",
      "transcription": "йиппагéш",
      "translation": "он встретится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפָּגֵשׁ",
      "transcription": "ниппагéш",
      "translation": "мы встретимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּפָּגְשׁוּ",
      "transcription": "типпагшӯ",
      "translation": "вы встретитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִפָּגְשׁוּ",
      "transcription": "йиппагшӯ",
      "translation": "они встретятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִפָּגֵשׁ",
      "transcription": "hиппагéш",
      "translation": "встреться (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִפָּגְשִׁי",
      "transcription": "hиппагшӣ",
      "translation": "встреться (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִפָּגְשׁוּ",
      "transcription": "hиппагшӯ",
      "translation": "встретьтесь"
    }
  ]
},
  'להיסגר': {
  "infinitive": {
    "hebrew": "לְהִסָּגֵר",
    "transcription": "леhисагéр",
    "translation": "закрываться"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "ס-ג-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִסְגָּר",
      "transcription": "нисгáр",
      "translation": "закрывается / закрываюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִסְגֶּרֶת",
      "transcription": "нисгéрет",
      "translation": "закрывается / закрываюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִסְגָּרִים",
      "transcription": "нисгарӣм",
      "translation": "закрываются / закрываемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִסְגָּרוֹת",
      "transcription": "нисгарóт",
      "translation": "закрываются / закрываемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִסְגַּרְתִּי",
      "transcription": "нисгáрти",
      "translation": "я закрылся / закрылась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִסְגַּרְתָּ",
      "transcription": "нисгáрта",
      "translation": "ты закрылся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִסְגַּרְתְּ",
      "transcription": "нисгáрт",
      "translation": "ты закрылась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִסְגַּר",
      "transcription": "нисгáр",
      "translation": "он закрылся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִסְגְּרָה",
      "transcription": "нисгрá",
      "translation": "она закрылась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִסְגַּרְנוּ",
      "transcription": "нисгáрну",
      "translation": "мы закрылись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִסְגַּרְתֶּם / נִסְגַּרְתֶּן",
      "transcription": "нисгартéм / нисгартéн",
      "translation": "вы закрылись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִסְגְּרוּ",
      "transcription": "нисгрӯ",
      "translation": "они закрылись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶסָּגֵר",
      "transcription": "эссагéр",
      "translation": "я закроюсь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּסָּגֵר",
      "transcription": "тиссагéр",
      "translation": "ты закроешься / она закроется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּסָּגְרִי",
      "transcription": "тиссагрӣ",
      "translation": "ты закроешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִסָּגֵר",
      "transcription": "йиссагéр",
      "translation": "он закроется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִסָּגֵר",
      "transcription": "ниссагéр",
      "translation": "мы закроемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּסָּגְרוּ",
      "transcription": "тиссагрӯ",
      "translation": "вы закроетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִסָּגְרוּ",
      "transcription": "йиссагрӯ",
      "translation": "они закроются"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִסָּגֵר",
      "transcription": "hиссагéр",
      "translation": "закройся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִסָּגְרִי",
      "transcription": "hиссагрӣ",
      "translation": "закройся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִסָּגְרוּ",
      "transcription": "hиссагрӯ",
      "translation": "закройтесь"
    }
  ]
},
  'להיפתח': {
  "infinitive": {
    "hebrew": "לְהִפָּתַח",
    "transcription": "леhипатáх",
    "translation": "открываться"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "פ-ת-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִפְתָּח",
      "transcription": "нифтáх",
      "translation": "открывается / открываюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִפְתַּחַת",
      "transcription": "нифтáхат",
      "translation": "открывается / открываюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִפְתָּחִים",
      "transcription": "нифтахӣм",
      "translation": "открываются / открываемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִפְתָּחוֹת",
      "transcription": "нифтахóт",
      "translation": "открываются / открываемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִפְתַּחְתִּי",
      "transcription": "нифтáхти",
      "translation": "я открылся / открылась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִפְתַּחְתָּ",
      "transcription": "нифтáхта",
      "translation": "ты открылся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִפְתַּחְתְּ",
      "transcription": "нифтáхт",
      "translation": "ты открылась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִפְתַּח",
      "transcription": "нифтáх",
      "translation": "он открылся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִפְתְּחָה",
      "transcription": "нифтехá",
      "translation": "она открылась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפְתַּחְנוּ",
      "transcription": "нифтáхну",
      "translation": "мы открылись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִפְתַּחְתֶּם / נִפְתַּחְתֶּן",
      "transcription": "нифтахтéм / нифтахтéн",
      "translation": "вы открылись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִפְתְּחוּ",
      "transcription": "нифтехӯ",
      "translation": "они открылись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶפָּתַח",
      "transcription": "эппатáх",
      "translation": "я откроюсь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּפָּתַח",
      "transcription": "типпатáх",
      "translation": "ты откроешься / она откроется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּפָּתְחִי",
      "transcription": "типпатхӣ",
      "translation": "ты откроешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִפָּתַח",
      "transcription": "йиппатáх",
      "translation": "он откроется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִפָּתַח",
      "transcription": "ниппатáх",
      "translation": "мы откроемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּפָּתְחוּ",
      "transcription": "типпатхӯ",
      "translation": "вы откроетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִפָּתְחוּ",
      "transcription": "йиппатхӯ",
      "translation": "они откроются"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִפָּתַח",
      "transcription": "hиппатáх",
      "translation": "откройся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִפָּתְחִי",
      "transcription": "hиппатхӣ",
      "translation": "откройся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִפָּתְחוּ",
      "transcription": "hиппатхӯ",
      "translation": "откройтесь"
    }
  ]
},
  'להספיק': {
  "infinitive": {
    "hebrew": "לְהַסְפִּיק",
    "transcription": "леhаспӣк",
    "translation": "успевать (по времени)"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ס-פ-ק",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַסְפִּיק",
      "transcription": "маспӣк",
      "translation": "успевает / достаточно (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַסְפִּיקָה",
      "transcription": "маспикá",
      "translation": "успевает / успеваю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַסְפִּיקִים",
      "transcription": "маспикӣм",
      "translation": "успевают / успеваем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַסְפִּיקוֹת",
      "transcription": "маспикóт",
      "translation": "успевают / успеваем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִסְפַּקְתִּי",
      "transcription": "hиспáкти",
      "translation": "я успел(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִסְפַּקְתָּ",
      "transcription": "hиспáкта",
      "translation": "ты успел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִסְפַּקְתְּ",
      "transcription": "hиспáкт",
      "translation": "ты успела"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִסְפִּיק",
      "transcription": "hиспӣк",
      "translation": "он успел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִסְפִּיקָה",
      "transcription": "hиспикá",
      "translation": "она успела"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִסְפַּקְנוּ",
      "transcription": "hиспáкну",
      "translation": "мы успели"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִסְפַּקְתֶּם / הִסְפַּקְתֶּן",
      "transcription": "hиспактéм / hиспактéн",
      "translation": "вы успели"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִסְפִּיקוּ",
      "transcription": "hиспикӯ",
      "translation": "они успели"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַסְפִּיק",
      "transcription": "аспӣк",
      "translation": "я успею"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּסְפִּיק",
      "transcription": "таспӣк",
      "translation": "ты успеешь / она успеет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּסְפִּיקִי",
      "transcription": "таспикӣ",
      "translation": "ты успеешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַסְפִּיק",
      "transcription": "йаспӣк",
      "translation": "он успеет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַסְפִּיק",
      "transcription": "наспӣк",
      "translation": "мы успеем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּסְפִּיקוּ",
      "transcription": "таспикӯ",
      "translation": "вы успеете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַסְפִּיקוּ",
      "transcription": "йаспикӯ",
      "translation": "они успеют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַסְפֵּק",
      "transcription": "hаспéк",
      "translation": "успей (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַסְפִּיקִי",
      "transcription": "hаспикӣ",
      "translation": "успей (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַסְפִּיקוּ",
      "transcription": "hаспикӯ",
      "translation": "успейте"
    }
  ]
},
  'להשפיע': {
  "infinitive": {
    "hebrew": "לְהַשְׁפִּיעַ",
    "transcription": "леhашпӣа",
    "translation": "влиять"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ש-פ-ע",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַשְׁפִּיעַ",
      "transcription": "машпӣа",
      "translation": "влияет / влияю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַשְׁפִּיעָה",
      "transcription": "машпи’á",
      "translation": "влияет / влияю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַשְׁפִּיעִים",
      "transcription": "машпи’ӣм",
      "translation": "влияют / влияем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַשְׁפִּיעוֹת",
      "transcription": "машпи’óт",
      "translation": "влияют / влияем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִשְׁפַּעְתִּי",
      "transcription": "hишпáти",
      "translation": "я повлиял(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִשְׁפַּעְתָּ",
      "transcription": "hишпáта",
      "translation": "ты повлиял"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִשְׁפַּעְתְּ",
      "transcription": "hишпáт",
      "translation": "ты повлияла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִשְׁפִּיעַ",
      "transcription": "hишпӣа",
      "translation": "он повлиял"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִשְׁפִּיעָה",
      "transcription": "hишпи’á",
      "translation": "она повлияла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִשְׁפַּעְנוּ",
      "transcription": "hишпáну",
      "translation": "мы повлияли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִשְׁפַּעְתֶּם / הִשְׁפַּעְתֶּן",
      "transcription": "hишпатéм / hишпатéн",
      "translation": "вы повлияли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִשְׁפִּיעוּ",
      "transcription": "hишпи’ӯ",
      "translation": "они повлияли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַשְׁפִּיעַ",
      "transcription": "ашпӣа",
      "translation": "я повлияю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּשְׁפִּיעַ",
      "transcription": "ташпӣа",
      "translation": "ты повлияешь / она повлияет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּשְׁפִּיעִי",
      "transcription": "ташпи’ӣ",
      "translation": "ты повлияешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַשְׁפִּיעַ",
      "transcription": "йашпӣа",
      "translation": "он повлияет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַשְׁפִּיעַ",
      "transcription": "нашпӣа",
      "translation": "мы повлияем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּשְׁפִּיעוּ",
      "transcription": "ташпи’ӯ",
      "translation": "вы повлияете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַשְׁפִּיעוּ",
      "transcription": "йашпи’ӯ",
      "translation": "они повлияют"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַשְׁפַּע",
      "transcription": "hашпá",
      "translation": "повлияй (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַשְׁפִּיעִי",
      "transcription": "hашпи’ӣ",
      "translation": "повлияй (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַשְׁפִּיעוּ",
      "transcription": "hашпи’ӯ",
      "translation": "повлияйте"
    }
  ]
},
  'להשקיע': {
  "infinitive": {
    "hebrew": "לְהַשְׁקִיעַ",
    "transcription": "леhашкӣа",
    "translation": "инвестировать, вкладывать силы"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ש-ק-ע",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַשְׁקִיעַ",
      "transcription": "машкӣа",
      "translation": "инвестирует / вкладываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַשְׁקִיעָה",
      "transcription": "машки’á",
      "translation": "инвестирует / вкладываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַשְׁקִיעִים",
      "transcription": "машки’ӣм",
      "translation": "инвестируют / вкладываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַשְׁקִיעוֹת",
      "transcription": "машки’óт",
      "translation": "инвестируют / вкладываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִשְׁקַעְתִּי",
      "transcription": "hишкáти",
      "translation": "я вложил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִשְׁקַעְתָּ",
      "transcription": "hишкáта",
      "translation": "ты вложил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִשְׁקַעְתְּ",
      "transcription": "hишкáт",
      "translation": "ты вложила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִשְׁקִיעַ",
      "transcription": "hишкӣа",
      "translation": "он вложил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִשְׁקִיעָה",
      "transcription": "hишки’á",
      "translation": "она вложила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִשְׁקַעְנוּ",
      "transcription": "hишкáну",
      "translation": "мы вложили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִשְׁקַעְתֶּם / הִשְׁקַעְתֶּן",
      "transcription": "hишкатéм / hишкатéн",
      "translation": "вы вложили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִשְׁקִיעוּ",
      "transcription": "hишки’ӯ",
      "translation": "они вложили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַשְׁקִיעַ",
      "transcription": "ашкӣа",
      "translation": "я вложу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּשְׁקִיעַ",
      "transcription": "ташкӣа",
      "translation": "ты вложишь / она вложит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּשְׁקִיעִי",
      "transcription": "ташки’ӣ",
      "translation": "ты вложишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַשְׁקִיעַ",
      "transcription": "йашкӣа",
      "translation": "он вложит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַשְׁקִיעַ",
      "transcription": "нашкӣа",
      "translation": "мы вложим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּשְׁקִיעוּ",
      "transcription": "ташки’ӯ",
      "translation": "вы вложите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַשְׁקִיעוּ",
      "transcription": "йашки’ӯ",
      "translation": "они вложат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַשְׁקַע",
      "transcription": "hашкá",
      "translation": "вложи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַשְׁקִיעִי",
      "transcription": "hашки’ӣ",
      "translation": "вложи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַשְׁקִיעוּ",
      "transcription": "hашки’ӯ",
      "translation": "вложите"
    }
  ]
},
  'להציע': {
  "infinitive": {
    "hebrew": "לְהַצִּיעַ",
    "transcription": "леhацӣа",
    "translation": "предлагать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "י-צ-ע",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַצִּיעַ",
      "transcription": "мацӣа",
      "translation": "предлагает / предлагаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַצִּיעָה",
      "transcription": "маци’á",
      "translation": "предлагает / предлагаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַצִּיעִים",
      "transcription": "маци’ӣм",
      "translation": "предлагают / предлагаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַצִּיעוֹת",
      "transcription": "маци’óт",
      "translation": "предлагают / предлагаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִצַּעְתִּי",
      "transcription": "hицáти",
      "translation": "я предложил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִצַּעְתָּ",
      "transcription": "hицáта",
      "translation": "ты предложил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִצַּעְתְּ",
      "transcription": "hицáт",
      "translation": "ты предложила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִצִּיעַ",
      "transcription": "hицӣа",
      "translation": "он предложил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִצִּיעָה",
      "transcription": "hици’á",
      "translation": "она предложила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִצַּעְנוּ",
      "transcription": "hицáну",
      "translation": "мы предложили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִצַּעְתֶּם / הִצַּעְתֶּן",
      "transcription": "hицатéм / hицатéн",
      "translation": "вы предложили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִצִּיעוּ",
      "transcription": "hици’ӯ",
      "translation": "они предложили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַצִּיעַ",
      "transcription": "ацӣа",
      "translation": "я предложу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּצִּיעַ",
      "transcription": "тацӣа",
      "translation": "ты предложишь / она предложит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּצִּיעִי",
      "transcription": "таци’ӣ",
      "translation": "ты предложишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַצִּיעַ",
      "transcription": "йацӣа",
      "translation": "он предложит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַצִּיעַ",
      "transcription": "нацӣа",
      "translation": "мы предложим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּצִּיעוּ",
      "transcription": "таци’ӯ",
      "translation": "вы предложите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַצִּיעוּ",
      "transcription": "йаци’ӯ",
      "translation": "они предложат"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַצַּע",
      "transcription": "hацá",
      "translation": "предложи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַצִּיעִי",
      "transcription": "hаци’ӣ",
      "translation": "предложи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַצִּיעוּ",
      "transcription": "hаци’ӯ",
      "translation": "предложите"
    }
  ]
},
  'להופיע': {
  "infinitive": {
    "hebrew": "לְהוֹפִיעַ",
    "transcription": "леhофӣа",
    "translation": "выступать, появляться"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "י-פ-ע",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מוֹפִיעַ",
      "transcription": "мофӣа",
      "translation": "выступает / появляюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מוֹפִיעָה",
      "transcription": "мофи’á",
      "translation": "выступает / появляюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מוֹפִיעִים",
      "transcription": "мофи’ӣм",
      "translation": "выступают / появляемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מוֹפִיעוֹת",
      "transcription": "мофи’óт",
      "translation": "выступают / появляемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הוֹפַעְתִּי",
      "transcription": "hофáти",
      "translation": "я выступил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הוֹפַעְתָּ",
      "transcription": "hофáта",
      "translation": "ты выступил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הוֹפַעְתְּ",
      "transcription": "hофáт",
      "translation": "ты выступила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הוֹפִיעַ",
      "transcription": "hофӣа",
      "translation": "он выступил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הוֹפִיעָה",
      "transcription": "hофи’á",
      "translation": "она выступила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הוֹפַעְנוּ",
      "transcription": "hофáну",
      "translation": "мы выступили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הוֹפַעְתֶּם / הוֹפַעְתֶּן",
      "transcription": "hофатéм / hофатéн",
      "translation": "вы выступили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הוֹפִיעוּ",
      "transcription": "hофи’ӯ",
      "translation": "они выступили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אוֹפִיעַ",
      "transcription": "офӣа",
      "translation": "я выступлю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תּוֹפִיעַ",
      "transcription": "тофӣа",
      "translation": "ты выступишь / она выступит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תּוֹפִיעִי",
      "transcription": "тофи’ӣ",
      "translation": "ты выступишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יוֹפִיעַ",
      "transcription": "йофӣа",
      "translation": "он выступит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נוֹפִיעַ",
      "transcription": "нофӣа",
      "translation": "мы выступим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תּוֹפִיעוּ",
      "transcription": "тофи’ӯ",
      "translation": "вы выступите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יוֹפִיעוּ",
      "transcription": "йофи’ӯ",
      "translation": "они выступят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הוֹפַע",
      "transcription": "hофá",
      "translation": "выступи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הוֹפִיעִי",
      "transcription": "hофи’ӣ",
      "translation": "выступи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הוֹפִיעוּ",
      "transcription": "hофи’ӯ",
      "translation": "выступите"
    }
  ]
},
  'להבטיח': {
  "infinitive": {
    "hebrew": "לְהַבְטִיחַ",
    "transcription": "леhавтӣах",
    "translation": "обещать, гарантировать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "ב-ט-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מַבְטִיחַ",
      "transcription": "мавтӣах",
      "translation": "обещает / обещаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מַבְטִיחָה",
      "transcription": "мавтихá",
      "translation": "обещает / обещаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מַבְטִיחִים",
      "transcription": "мавтихӣм",
      "translation": "обещают / обещаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מַבְטִיחוֹת",
      "transcription": "мавтихóт",
      "translation": "обещают / обещаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִבְטַחְתִּי",
      "transcription": "hивтáхти",
      "translation": "я пообещал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִבְטַחְתָּ",
      "transcription": "hивтáхта",
      "translation": "ты пообещал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִבְטַחְתְּ",
      "transcription": "hивтáхт",
      "translation": "ты пообещала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִבְטִיחַ",
      "transcription": "hивтӣах",
      "translation": "он пообещал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִבְטִיחָה",
      "transcription": "hивтихá",
      "translation": "она пообещала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִבְטַחְנוּ",
      "transcription": "hивтáхну",
      "translation": "мы пообещали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִבְטַחְתֶּם / הִבְטַחְתֶּן",
      "transcription": "hивтахтéм / hивтахтéн",
      "translation": "вы пообещали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִבְטִיחוּ",
      "transcription": "hивтихӯ",
      "translation": "они пообещали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אַבְטִיחַ",
      "transcription": "автӣах",
      "translation": "я пообещаю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּבְטִיחַ",
      "transcription": "тавтӣах",
      "translation": "ты пообещаешь / она пообещает"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּבְטִיחִי",
      "transcription": "тавтихӣ",
      "translation": "ты пообещаешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַבְטִיחַ",
      "transcription": "йавтӣах",
      "translation": "он пообещает"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַבְטִיחַ",
      "transcription": "навтӣах",
      "translation": "мы пообещаем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּבְטִיחוּ",
      "transcription": "тавтихӯ",
      "translation": "вы пообещаете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַבְטִיחוּ",
      "transcription": "йавтихӯ",
      "translation": "они пообещают"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הַבְטַח",
      "transcription": "hавтáх",
      "translation": "обещай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הַבְטִיחִי",
      "transcription": "hавтихӣ",
      "translation": "обещай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הַבְטִיחוּ",
      "transcription": "hавтихӯ",
      "translation": "обещайте"
    }
  ]
},
  'להוכיח': {
  "infinitive": {
    "hebrew": "לְהוֹכִיחַ",
    "transcription": "леhохӣах",
    "translation": "доказывать"
  },
  "binyan": "הִפְעִיל (Ифъиль)",
  "root": "י-כ-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מוֹכִיחַ",
      "transcription": "мохӣах",
      "translation": "доказывает / доказываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מוֹכִיחָה",
      "transcription": "мохихá",
      "translation": "доказывает / доказываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מוֹכִיחִים",
      "transcription": "мохихӣм",
      "translation": "доказывают / доказываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מוֹכִיחוֹת",
      "transcription": "мохихóт",
      "translation": "доказывают / доказываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הוֹכַחְתִּי",
      "transcription": "hохáхти",
      "translation": "я доказал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הוֹכַחְתָּ",
      "transcription": "hохáхта",
      "translation": "ты доказал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הוֹכַחְתְּ",
      "transcription": "hохáхт",
      "translation": "ты доказала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הוֹכִיחַ",
      "transcription": "hохӣах",
      "translation": "он доказал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הוֹכִיחָה",
      "transcription": "hохихá",
      "translation": "она доказала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הוֹכַחְנוּ",
      "transcription": "hохáхну",
      "translation": "мы доказали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הוֹכַחְתֶּם / הוֹכַחְתֶּן",
      "transcription": "hохахтéм / hохахтéн",
      "translation": "вы доказали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הוֹכִיחוּ",
      "transcription": "hохихӯ",
      "translation": "они доказали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אוֹכִיחַ",
      "transcription": "охӣах",
      "translation": "я докажу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תּוֹכִיחַ",
      "transcription": "тохӣах",
      "translation": "ты докажешь / она докажет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תּוֹכִיחִי",
      "transcription": "тохихӣ",
      "translation": "ты докажешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יוֹכִיחַ",
      "transcription": "йохӣах",
      "translation": "он докажет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נוֹכִיחַ",
      "transcription": "нохӣах",
      "translation": "мы докажем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תּוֹכִיחוּ",
      "transcription": "тохихӯ",
      "translation": "вы докажете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יוֹכִיחוּ",
      "transcription": "йохихӯ",
      "translation": "они докажут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הוֹכַח",
      "transcription": "hохáх",
      "translation": "докажи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הוֹכִיחִי",
      "transcription": "hохихӣ",
      "translation": "докажи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הוֹכִיחוּ",
      "transcription": "hохихӯ",
      "translation": "докажите"
    }
  ]
},
  'להתמודד': {
  "infinitive": {
    "hebrew": "לְהִתְמוֹדֵד",
    "transcription": "леhитмодéд",
    "translation": "справляться, противостоять"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "מ-ו-ד",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְמוֹדֵד",
      "transcription": "митмодéд",
      "translation": "справляется / справляюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְמוֹדֶדֶת",
      "transcription": "митмодéдет",
      "translation": "справляется / справляюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְמוֹדְדִים",
      "transcription": "митмодедӣм",
      "translation": "справляются / справляемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְמוֹדְדוֹת",
      "transcription": "митмодедóт",
      "translation": "справляются / справляемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְמוֹדַדְתִּי",
      "transcription": "hитмодáдти",
      "translation": "я справился / справилась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְמוֹדַדְתָּ",
      "transcription": "hитмодáдта",
      "translation": "ты справился"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְמוֹדַדְתְּ",
      "transcription": "hитмодáдт",
      "translation": "ты справилась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְמוֹדֵד",
      "transcription": "hитмодéд",
      "translation": "он справился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְמוֹדְדָה",
      "transcription": "hитмодедá",
      "translation": "она справилась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְמוֹדַדְנוּ",
      "transcription": "hитмодáдну",
      "translation": "мы справились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְמוֹדַדְתֶּם / הִתְמוֹדַדְתֶּן",
      "transcription": "hитмодадтéм / hитмодадтéн",
      "translation": "вы справились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְמוֹדְדוּ",
      "transcription": "hитмодедӯ",
      "translation": "они справились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְמוֹדֵד",
      "transcription": "этмодéд",
      "translation": "я справлюсь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְמוֹדֵד",
      "transcription": "титмодéд",
      "translation": "ты справишься / она справится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְמוֹדְדִי",
      "transcription": "титмодедӣ",
      "translation": "ты справишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְמוֹדֵד",
      "transcription": "йитмодéд",
      "translation": "он справится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְמוֹדֵד",
      "transcription": "нитмодéд",
      "translation": "мы справимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְמוֹדְדוּ",
      "transcription": "титмодедӯ",
      "translation": "вы справитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְמוֹדְדוּ",
      "transcription": "йитмодедӯ",
      "translation": "они справятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְמוֹדֵד",
      "transcription": "hитмодéд",
      "translation": "справляйся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְמוֹדְדִי",
      "transcription": "hитмодедӣ",
      "translation": "справляйся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְמוֹדְדוּ",
      "transcription": "hитмодедӯ",
      "translation": "справляйтесь"
    }
  ]
},
  'להתנדב': {
  "infinitive": {
    "hebrew": "לְהִתְנַדֵּב",
    "transcription": "леhитнадéв",
    "translation": "быть волонтером, вызваться"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "נ-ד-ב",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְנַדֵּב",
      "transcription": "митнадéв",
      "translation": "волонтерит / волонтерю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְנַדֶּבֶת",
      "transcription": "митнадéвет",
      "translation": "волонтерит / волонтерю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְנַדְּבִים",
      "transcription": "митнадвӣм",
      "translation": "волонтерят / волонтерим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְנַדְּבוֹת",
      "transcription": "митнадвóт",
      "translation": "волонтерят / волонтерим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְנַדַּבְתִּי",
      "transcription": "hитнадáвти",
      "translation": "я был(а) волонтером"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְנַדַּבְתָּ",
      "transcription": "hитнадáвта",
      "translation": "ты был волонтером"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְנַדַּבְתְּ",
      "transcription": "hитнадáвт",
      "translation": "ты была волонтером"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְנַדֵּב",
      "transcription": "hитнадéв",
      "translation": "он был волонтером"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְנַדְּבָה",
      "transcription": "hитнадвá",
      "translation": "она была волонтером"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְנַדַּבְנוּ",
      "transcription": "hитнадáвну",
      "translation": "мы были волонтерами"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְנַדַּבְתֶּם / הִתְנַדַּבְתֶּן",
      "transcription": "hитнадавтéм / hитнадавтéн",
      "translation": "вы были волонтерами"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְנַדְּבוּ",
      "transcription": "hитнадвӯ",
      "translation": "они были волонтерами"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְנַדֵּב",
      "transcription": "этнадéв",
      "translation": "я буду волонтером"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְנַדֵּב",
      "transcription": "титнадéв",
      "translation": "ты будешь волонтером / она будет волонтером"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְנַדְּבִי",
      "transcription": "титнадвӣ",
      "translation": "ты будешь волонтером (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְנַדֵּב",
      "transcription": "йитнадéв",
      "translation": "он будет волонтером"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְנַדֵּב",
      "transcription": "нитнадéв",
      "translation": "мы будем волонтерами"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְנַדְּבוּ",
      "transcription": "титнадвӯ",
      "translation": "вы будете волонтерами"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְנַדְּבוּ",
      "transcription": "йитнадвӯ",
      "translation": "они будут волонтерами"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְנַדֵּב",
      "transcription": "hитнадéв",
      "translation": "будь волонтером (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְנַדְּבִי",
      "transcription": "hитнадвӣ",
      "translation": "будь волонтером (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְנַדְּבוּ",
      "transcription": "hитнадвӯ",
      "translation": "будьте волонтерами"
    }
  ]
},
  'להתנהג': {
  "infinitive": {
    "hebrew": "לְהִתְנַהֵג",
    "transcription": "леhитнаhéг",
    "translation": "вести себя"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "נ-ה-ג",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְנַהֵג",
      "transcription": "митнаhéг",
      "translation": "ведет себя / веду себя (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְנַהֶגֶת",
      "transcription": "митнаhéгет",
      "translation": "ведет себя / веду себя (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְנַהֲגִים",
      "transcription": "митнаhагӣм",
      "translation": "ведут себя / ведем себя (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְנַהֲגוֹת",
      "transcription": "митнаhагóт",
      "translation": "ведут себя / ведем себя (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְנַהַגְתִּי",
      "transcription": "hитнаháгти",
      "translation": "я вел(а) себя"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְנַהַגְתָּ",
      "transcription": "hитнаháгта",
      "translation": "ты вел себя"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְנַהַגְתְּ",
      "transcription": "hитнаháгт",
      "translation": "ты вела себя"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְנַהֵג",
      "transcription": "hитнаhéг",
      "translation": "он вел себя"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְנַהֲגָה",
      "transcription": "hитнаhагá",
      "translation": "она вела себя"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְנַהַגְנוּ",
      "transcription": "hитнаháгну",
      "translation": "мы вели себя"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְנַהַגְתֶּם / הִתְנַהַגְתֶּן",
      "transcription": "hитнаhагтéм / hитнаhагтéн",
      "translation": "вы вели себя"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְנַהֲגוּ",
      "transcription": "hитнаhагӯ",
      "translation": "они вели себя"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְנַהֵג",
      "transcription": "этнаhéг",
      "translation": "я буду вести себя"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְנַהֵג",
      "transcription": "титнаhéг",
      "translation": "ты будешь вести себя / она будет вести себя"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְנַהֲגִי",
      "transcription": "титнаhагӣ",
      "translation": "ты будешь вести себя (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְנַהֵג",
      "transcription": "йитнаhéг",
      "translation": "он будет вести себя"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְנַהֵג",
      "transcription": "нитнаhéг",
      "translation": "мы будем вести себя"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְנַהֲגוּ",
      "transcription": "титнаhагӯ",
      "translation": "вы будете вести себя"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְנַהֲגוּ",
      "transcription": "йитнаhагӯ",
      "translation": "они будут вести себя"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְנַהֵג",
      "transcription": "hитнаhéг",
      "translation": "веди себя хорошо (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְנַהֲגִי",
      "transcription": "hитнаhагӣ",
      "translation": "веди себя хорошо (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְנַהֲגוּ",
      "transcription": "hитнаhагӯ",
      "translation": "ведите себя хорошо"
    }
  ]
},
  'להתפתח': {
  "infinitive": {
    "hebrew": "לְהִתְפַּתֵּחַ",
    "transcription": "леhитпатéах",
    "translation": "развиваться"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "פ-ת-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְפַּתֵּחַ",
      "transcription": "митпатéах",
      "translation": "развивается / развиваюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְפַּתַּחַת",
      "transcription": "митпатáхат",
      "translation": "развивается / развиваюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְפַּתְּחִים",
      "transcription": "митпатхӣм",
      "translation": "развиваются / развиваемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְפַּתְּחוֹת",
      "transcription": "митпатхóт",
      "translation": "развиваются / развиваемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְפַּתַּחְתִּי",
      "transcription": "hитпатáхти",
      "translation": "я развился / развилась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְפַּתַּחְתָּ",
      "transcription": "hитпатáхта",
      "translation": "ты развился"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְפַּתַּחְתְּ",
      "transcription": "hитпатáхт",
      "translation": "ты развилась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְפַּתֵּחַ",
      "transcription": "hитпатéах",
      "translation": "он развился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְפַּתְּחָה",
      "transcription": "hитпатхá",
      "translation": "она развилась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְפַּתַּחְנוּ",
      "transcription": "hитпатáхну",
      "translation": "мы развились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְפַּתַּחְתֶּם / הִתְפַּתַּחְתֶּן",
      "transcription": "hитпатахтéм / hитпатахтéн",
      "translation": "вы развились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְפַּתְּחוּ",
      "transcription": "hитпатхӯ",
      "translation": "они развились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְפַּתֵּחַ",
      "transcription": "этпатéах",
      "translation": "я буду развиваться"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְפַּתֵּחַ",
      "transcription": "титпатéах",
      "translation": "ты будешь развиваться / она будет развиваться"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְפַּתְּחִי",
      "transcription": "титпатхӣ",
      "translation": "ты будешь развиваться (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְפַּתֵּחַ",
      "transcription": "йитпатéах",
      "translation": "он будет развиваться"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְפַּתֵּחַ",
      "transcription": "нитпатéах",
      "translation": "мы будем развиваться"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְפַּתְּחוּ",
      "transcription": "титпатхӯ",
      "translation": "вы будете развиваться"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְפַּתְּחוּ",
      "transcription": "йитпатхӯ",
      "translation": "они будут развиваться"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְפַּתֵּחַ",
      "transcription": "hитпатéах",
      "translation": "развивайся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְפַּתְּחִי",
      "transcription": "hитпатхӣ",
      "translation": "развивайся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְפַּתְּחוּ",
      "transcription": "hитпатхӯ",
      "translation": "развивайтесь"
    }
  ]
},
  'להתלונן': {
  "infinitive": {
    "hebrew": "לְהִתְלוֹנֵן",
    "transcription": "леhитлонéн",
    "translation": "жаловаться"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ל-ו-ן",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְלוֹנֵן",
      "transcription": "митлонéн",
      "translation": "жалуется / жалуюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְלוֹנֶנֶת",
      "transcription": "митлонéнет",
      "translation": "жалуется / жалуюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְלוֹנְנִים",
      "transcription": "митлоненӣм",
      "translation": "жалуются / жалуемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְלוֹנְנוֹת",
      "transcription": "митлоненóт",
      "translation": "жалуются / жалуемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְלוֹנַנְתִּי",
      "transcription": "hитлонáнти",
      "translation": "я пожаловался / пожаловалась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְלוֹנַנְתָּ",
      "transcription": "hитлонáнта",
      "translation": "ты пожаловался"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְלוֹנַנְתְּ",
      "transcription": "hитлонáнт",
      "translation": "ты пожаловалась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְלוֹנֵן",
      "transcription": "hитлонéн",
      "translation": "он пожаловался"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְלוֹנְנָה",
      "transcription": "hитлоненá",
      "translation": "она пожаловалась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְלוֹנַנּוּ",
      "transcription": "hитлонáнну",
      "translation": "мы пожаловались"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְלוֹנַנְתֶּם / הִתְלוֹנַנְתֶּן",
      "transcription": "hитлонантéм / hитлонантéн",
      "translation": "вы пожаловались"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְלוֹנְנוּ",
      "transcription": "hитлоненӯ",
      "translation": "они пожаловались"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְלוֹנֵן",
      "transcription": "этлонéн",
      "translation": "я пожалуюсь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְלוֹנֵן",
      "transcription": "титлонéн",
      "translation": "ты пожалуешься / она пожалуется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְלוֹנְנִי",
      "transcription": "титлоненӣ",
      "translation": "ты пожалуешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְלוֹנֵן",
      "transcription": "йитлонéн",
      "translation": "он пожалуется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְלוֹנֵן",
      "transcription": "нитлонéн",
      "translation": "мы пожалуемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְלוֹנְנוּ",
      "transcription": "титлоненӯ",
      "translation": "вы пожалуетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְלוֹנְנוּ",
      "transcription": "йитлоненӯ",
      "translation": "они пожалуются"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְלוֹנֵן",
      "transcription": "hитлонéн",
      "translation": "жалуйся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְלוֹנְנִי",
      "transcription": "hитлоненӣ",
      "translation": "жалуйся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְלוֹנְנוּ",
      "transcription": "hитлоненӯ",
      "translation": "жалуйтесь"
    }
  ]
},
  'להיוולד': {
  "infinitive": {
    "hebrew": "לְהִוָּלֵד",
    "transcription": "леhивалéд",
    "translation": "рождаться"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "י-ל-ד",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נוֹלָד",
      "transcription": "нолáд",
      "translation": "рождается / рождаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נוֹלֶדֶת",
      "transcription": "нолéдет",
      "translation": "рождается / рождаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נוֹלָדִים",
      "transcription": "ноладӣм",
      "translation": "рождаются / рождаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נוֹלָדוֹת",
      "transcription": "ноладóт",
      "translation": "рождаются / рождаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נוֹלַדְתִּי",
      "transcription": "нолáдти",
      "translation": "я родился / родилась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נוֹלַדְתָּ",
      "transcription": "нолáдта",
      "translation": "ты родился"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נוֹלַדְתְּ",
      "transcription": "нолáдт",
      "translation": "ты родилась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נוֹלַד",
      "transcription": "нолáд",
      "translation": "он родился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נוֹלְדָה",
      "transcription": "нольдá",
      "translation": "она родилась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נוֹלַדְנוּ",
      "transcription": "нолáдну",
      "translation": "мы родились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נוֹלַדְתֶּם / נוֹלַדְתֶּן",
      "transcription": "ноладтéм / ноладтéн",
      "translation": "вы родились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נוֹלְדוּ",
      "transcription": "нольдӯ",
      "translation": "они родились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶוָּלֵד",
      "transcription": "эввалéд",
      "translation": "я рожусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּוָּלֵד",
      "transcription": "тиввалéд",
      "translation": "ты родишься / она родится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּוָּלְדִי",
      "transcription": "тиввалдӣ",
      "translation": "ты родишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִוָּלֵד",
      "transcription": "йиввалéд",
      "translation": "он родится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִוָּלֵד",
      "transcription": "ниввалéд",
      "translation": "мы родимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּוָּלְדוּ",
      "transcription": "тиввалдӯ",
      "translation": "вы родитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִוָּלְדוּ",
      "transcription": "йиввалдӯ",
      "translation": "они родятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִוָּלֵד",
      "transcription": "hиввалéд",
      "translation": "родись (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִוָּלְדִי",
      "transcription": "hиввалдӣ",
      "translation": "родись (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִוָּלְדוּ",
      "transcription": "hиввалдӯ",
      "translation": "родитесь"
    }
  ]
},
  'להיעלם': {
  "infinitive": {
    "hebrew": "לְהֵעָלֵם",
    "transcription": "леhеалéм",
    "translation": "исчезать, пропадать"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "ע-ל-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נֶעֱלָם",
      "transcription": "неэлáм",
      "translation": "исчезает / исчезаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נֶעֱלֶמֶת",
      "transcription": "неэлéмет",
      "translation": "исчезает / исчезаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נֶעֱלָמִים",
      "transcription": "неэламӣм",
      "translation": "исчезают / исчезаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נֶעֱלָמוֹת",
      "transcription": "неэламóт",
      "translation": "исчезают / исчезаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נֶעֱלַמְתִּי",
      "transcription": "неэлáмти",
      "translation": "я исчез(ла)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נֶעֱלַמְתָּ",
      "transcription": "неэлáмта",
      "translation": "ты исчез"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נֶעֱלַמְתְּ",
      "transcription": "неэлáмт",
      "translation": "ты исчезла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נֶעֱלַם",
      "transcription": "неэлáм",
      "translation": "он исчез"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נֶעֶלְמָה",
      "transcription": "неэльмá",
      "translation": "она исчезла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נֶעֱלַמְנוּ",
      "transcription": "неэлáмну",
      "translation": "мы исчезли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נֶעֱלַמְתֶּם / נֶעֱלַמְתֶּן",
      "transcription": "неэламтéм / неэламтéн",
      "translation": "вы исчезли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נֶעֶלְמוּ",
      "transcription": "неэльмӯ",
      "translation": "они исчезли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֵעָלֵם",
      "transcription": "эалéм",
      "translation": "я исчезну"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תֵּעָלֵם",
      "transcription": "теалéм",
      "translation": "ты исчезнешь / она исчезнет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תֵּעָלְמִי",
      "transcription": "теальмӣ",
      "translation": "ты исчезнешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יֵעָלֵם",
      "transcription": "йеалéм",
      "translation": "он исчезнет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נֵעָלֵם",
      "transcription": "неалéм",
      "translation": "мы исчезнем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תֵּעָלְמוּ",
      "transcription": "теальмӯ",
      "translation": "вы исчезнете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יֵעָלְמוּ",
      "transcription": "йеальмӯ",
      "translation": "они исчезнут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הֵעָלֵם",
      "transcription": "hеалéм",
      "translation": "исчезни (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הֵעָלְמִי",
      "transcription": "hеальмӣ",
      "translation": "исчезни (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הֵעָלְמוּ",
      "transcription": "hеальмӯ",
      "translation": "исчезните"
    }
  ]
},
  'להימשך': {
  "infinitive": {
    "hebrew": "לְהִמָּשֵׁךְ",
    "transcription": "леhимашéх",
    "translation": "продолжаться, длиться, тянуться"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "מ-ש-ך",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִמְשָׁךְ",
      "transcription": "нимшáх",
      "translation": "длится / длясь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִמְשֶׁכֶת",
      "transcription": "нимшéхет",
      "translation": "длится / длясь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִמְשָׁכִים",
      "transcription": "нимшахӣм",
      "translation": "длятся / длится (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִמְשָׁכוֹת",
      "transcription": "нимшахóт",
      "translation": "длятся / длится (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִמְשַׁכְתִּי",
      "transcription": "нимшáхти",
      "translation": "я тянулся / тянулась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִמְשַׁכְתָּ",
      "transcription": "нимшáхта",
      "translation": "ты тянулся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִמְשַׁכְתְּ",
      "transcription": "нимшáхт",
      "translation": "ты тянулась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִמְשַׁךְ",
      "transcription": "нимшáх",
      "translation": "он длился"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִמְשְׁכָה",
      "transcription": "нимшехá",
      "translation": "она длилась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִמְשַׁכְנוּ",
      "transcription": "нимшáхну",
      "translation": "мы длились"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִמְשַׁכְתֶּם / נִמְשַׁכְתֶּן",
      "transcription": "нимшахтéм / нимшахтéн",
      "translation": "вы длились"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִמְשְׁכוּ",
      "transcription": "нимшехӯ",
      "translation": "они длились"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶמָּשֵׁךְ",
      "transcription": "эммашéх",
      "translation": "я протянусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּמָּשֵׁךְ",
      "transcription": "тиммашéх",
      "translation": "ты продлишься / она продлится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּמָּשְׁכִי",
      "transcription": "тиммашхӣ",
      "translation": "ты продлишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִמָּשֵׁךְ",
      "transcription": "йиммашéх",
      "translation": "он продлится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִמָּשֵׁךְ",
      "transcription": "ниммашéх",
      "translation": "мы продлимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּמָּשְׁכוּ",
      "transcription": "тиммашхӯ",
      "translation": "вы продлитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִמָּשְׁכוּ",
      "transcription": "йиммашхӯ",
      "translation": "они продлятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִמָּשֵׁךְ",
      "transcription": "hиммашéх",
      "translation": "продолжайся (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִמָּשְׁכִי",
      "transcription": "hиммашхӣ",
      "translation": "продолжайся (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִמָּשְׁכוּ",
      "transcription": "hиммашхӯ",
      "translation": "продолжайтесь"
    }
  ]
},
  'להיכשל': {
  "infinitive": {
    "hebrew": "לְהִכָּשֵׁל",
    "transcription": "леhикашéль",
    "translation": "терпеть неудачу, проваливаться"
  },
  "binyan": "נִפְעַל (Нифъаль)",
  "root": "כ-ש-ל",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נִכְשָׁל",
      "transcription": "нихшáль",
      "translation": "проваливается / проваливаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נִכְשֶׁלֶת",
      "transcription": "нихшéлет",
      "translation": "проваливается / проваливаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נִכְשָׁלִים",
      "transcription": "нихшалӣм",
      "translation": "проваливаются / проваливаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נִכְשָׁלוֹת",
      "transcription": "нихшалóт",
      "translation": "проваливаются / проваливаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נִכְשַׁלְתִּי",
      "transcription": "нихшáльти",
      "translation": "я потерпел(а) неудачу"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נִכְשַׁלְתָּ",
      "transcription": "нихшáльта",
      "translation": "ты потерпел неудачу"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נִכְשַׁלְתְּ",
      "transcription": "нихшáльт",
      "translation": "ты потерпела неудачу"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נִכְשַׁל",
      "transcription": "нихшáль",
      "translation": "он потерпел неудачу"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נִכְשְׁלָה",
      "transcription": "нихшелá",
      "translation": "она потерпела неудачу"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִכְשַׁלְנוּ",
      "transcription": "нихшáльну",
      "translation": "мы потерпели неудачу"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נִכְשַׁלְתֶּם / נִכְשַׁלְתֶּן",
      "transcription": "нихшальтéм / нихшальтéн",
      "translation": "вы потерпели неудачу"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נִכְשְׁלוּ",
      "transcription": "нихшелӯ",
      "translation": "они потерпели неудачу"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶכָּשֵׁל",
      "transcription": "эккашéль",
      "translation": "я провалюсь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּכָּשֵׁל",
      "transcription": "тиккашéль",
      "translation": "ты провалишься / она провалится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּכָּשְׁלִי",
      "transcription": "тиккашлӣ",
      "translation": "ты провалишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִכָּשֵׁל",
      "transcription": "йиккашéль",
      "translation": "он провалится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִכָּשֵׁל",
      "transcription": "никкашéль",
      "translation": "мы провалимся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּכָּשְׁלוּ",
      "transcription": "тиккашлӯ",
      "translation": "вы провалитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִכָּשְׁלוּ",
      "transcription": "йиккашлӯ",
      "translation": "они провалятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִכָּשֵׁל",
      "transcription": "hиккашéль",
      "translation": "не провались (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִכָּשְׁלִי",
      "transcription": "hиккашлӣ",
      "translation": "не провались (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִכָּשְׁלוּ",
      "transcription": "hиккашлӯ",
      "translation": "не провалитесь"
    }
  ]
},
  'לחזור': {
  "infinitive": {
    "hebrew": "לַחֲזֹר",
    "transcription": "лахазóр",
    "translation": "возвращаться, повторять"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ח-ז-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "חוֹזֵר",
      "transcription": "хозéр",
      "translation": "возвращается / возвращаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "חוֹזֶרֶת",
      "transcription": "хозéрет",
      "translation": "возвращается / возвращаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "חוֹזְרִים",
      "transcription": "хозрӣм",
      "translation": "возвращаются / возвращаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "חוֹזְרוֹת",
      "transcription": "хозрóт",
      "translation": "возвращаются / возвращаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "חָזַרְתִּי",
      "transcription": "хазáрти",
      "translation": "я вернулся / вернулась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "חָזַרְתָּ",
      "transcription": "хазáрта",
      "translation": "ты вернулся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "חָזַרְתְּ",
      "transcription": "хазáрт",
      "translation": "ты вернулась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "חָזַר",
      "transcription": "хазáр",
      "translation": "он вернулся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "חָזְרָה",
      "transcription": "хазрá",
      "translation": "она вернулась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "חָזַרְנוּ",
      "transcription": "хазáрну",
      "translation": "мы вернулись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "חֲזַרְתֶּם / חֲזַרְתֶּן",
      "transcription": "хазартéм / хазартéн",
      "translation": "вы вернулись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "חָזְרוּ",
      "transcription": "хазрӯ",
      "translation": "они вернулись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶחֱזֹר",
      "transcription": "эхезóр",
      "translation": "я вернусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּחֲזֹר",
      "transcription": "тахазóр",
      "translation": "ты вернешься / она вернется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּחְזְרִי",
      "transcription": "тахзерӣ",
      "translation": "ты вернешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַחֲזֹר",
      "transcription": "яхазóр",
      "translation": "он вернется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַחֲזֹר",
      "transcription": "нахазóр",
      "translation": "мы вернемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּחְזְרוּ",
      "transcription": "тахзерӯ",
      "translation": "вы вернетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַחְזְרוּ",
      "transcription": "яхазерӯ",
      "translation": "они вернутся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "חֲזֹר",
      "transcription": "хазóр",
      "translation": "вернись / повтори (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "חִזְרִי",
      "transcription": "хизрӣ",
      "translation": "вернись / повтори (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "חִזְרוּ",
      "transcription": "хизрӯ",
      "translation": "вернитесь / повторите"
    }
  ]
},
  'לחזר': {
  "infinitive": {
    "hebrew": "לַחֲזֹר",
    "transcription": "лахазóр",
    "translation": "возвращаться, повторять"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ח-ז-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "חוֹזֵר",
      "transcription": "хозéр",
      "translation": "возвращается / возвращаюсь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "חוֹזֶרֶת",
      "transcription": "хозéрет",
      "translation": "возвращается / возвращаюсь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "חוֹזְרִים",
      "transcription": "хозрӣм",
      "translation": "возвращаются / возвращаемся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "חוֹזְרוֹת",
      "transcription": "хозрóт",
      "translation": "возвращаются / возвращаемся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "חָזַרְתִּי",
      "transcription": "хазáрти",
      "translation": "я вернулся / вернулась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "חָזַרְתָּ",
      "transcription": "хазáрта",
      "translation": "ты вернулся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "חָזַרְתְּ",
      "transcription": "хазáрт",
      "translation": "ты вернулась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "חָזַר",
      "transcription": "хазáр",
      "translation": "он вернулся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "חָזְרָה",
      "transcription": "хазрá",
      "translation": "она вернулась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "חָזַרְנוּ",
      "transcription": "хазáрну",
      "translation": "мы вернулись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "חֲזַרְתֶּם / חֲזַרְתֶּן",
      "transcription": "хазартéм / хазартéн",
      "translation": "вы вернулись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "חָזְרוּ",
      "transcription": "хазрӯ",
      "translation": "они вернулись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶחֱזֹר",
      "transcription": "эхезóр",
      "translation": "я вернусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּחֲזֹר",
      "transcription": "тахазóр",
      "translation": "ты вернешься / она вернется"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּחְזְרִי",
      "transcription": "тахзерӣ",
      "translation": "ты вернешься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַחֲזֹר",
      "transcription": "яхазóр",
      "translation": "он вернется"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַחֲזֹר",
      "transcription": "нахазóр",
      "translation": "мы вернемся"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּחְזְרוּ",
      "transcription": "тахзерӯ",
      "translation": "вы вернетесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַחְזְרוּ",
      "transcription": "яхазерӯ",
      "translation": "они вернутся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "חֲזֹר",
      "transcription": "хазóр",
      "translation": "вернись / повтори (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "חִזְרִי",
      "transcription": "хизрӣ",
      "translation": "вернись / повтори (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "חִזְרוּ",
      "transcription": "хизрӯ",
      "translation": "вернитесь / повторите"
    }
  ]
},
  'לעמוד': {
  "infinitive": {
    "hebrew": "לַעֲמֹד",
    "transcription": "лаамóд",
    "translation": "стоять"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ע-מ-ד",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "עוֹמֵד",
      "transcription": "омéд",
      "translation": "стоит / стою (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "עוֹמֶדֶת",
      "transcription": "омéдет",
      "translation": "стоит / стою (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "עוֹמְדִים",
      "transcription": "омдӣм",
      "translation": "стоят / стоим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "עוֹמְדוֹת",
      "transcription": "омдóт",
      "translation": "стоят / стоим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "עָמַדְתִּי",
      "transcription": "амáдти",
      "translation": "я стоял(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "עָמַדְתָּ",
      "transcription": "амáдта",
      "translation": "ты стоял"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "עָמַדְתְּ",
      "transcription": "амáдт",
      "translation": "ты стояла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "עָמַד",
      "transcription": "амáд",
      "translation": "он стоял"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "עָמְדָה",
      "transcription": "амдá",
      "translation": "она стояла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "עָמַדְנוּ",
      "transcription": "амáдну",
      "translation": "мы стояли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "עֲמַדְתֶּם / עֲמַדְתֶּן",
      "transcription": "амадтéм / амадтéн",
      "translation": "вы стояли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "עָמְדוּ",
      "transcription": "амдӯ",
      "translation": "они стояли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶעֱמֹד",
      "transcription": "ээмóд",
      "translation": "я буду стоять"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּעֲמֹד",
      "transcription": "таамóд",
      "translation": "ты будешь стоять / она будет стоять"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּעַמְדִי",
      "transcription": "таамдӣ",
      "translation": "ты будешь стоять (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַעֲמֹד",
      "transcription": "яамóд",
      "translation": "он будет стоять"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַעֲמֹד",
      "transcription": "наамóд",
      "translation": "мы будем стоять"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּעַמְדוּ",
      "transcription": "таамдӯ",
      "translation": "вы будете стоять"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַעַמְדוּ",
      "transcription": "яамдӯ",
      "translation": "они будут стоять"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "עֲמֹד",
      "transcription": "амóд",
      "translation": "стой (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "עִמְדִי",
      "transcription": "имдӣ",
      "translation": "стой (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "עִמְדוּ",
      "transcription": "имдӯ",
      "translation": "стойте"
    }
  ]
},
  'לעמד': {
  "infinitive": {
    "hebrew": "לַעֲמֹד",
    "transcription": "лаамóд",
    "translation": "стоять"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ע-מ-ד",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "עוֹמֵד",
      "transcription": "омéд",
      "translation": "стоит / стою (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "עוֹמֶדֶת",
      "transcription": "омéдет",
      "translation": "стоит / стою (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "עוֹמְדִים",
      "transcription": "омдӣм",
      "translation": "стоят / стоим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "עוֹמְדוֹת",
      "transcription": "омдóт",
      "translation": "стоят / стоим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "עָמַדְתִּי",
      "transcription": "амáдти",
      "translation": "я стоял(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "עָמַדְתָּ",
      "transcription": "амáдта",
      "translation": "ты стоял"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "עָמַדְתְּ",
      "transcription": "амáдт",
      "translation": "ты стояла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "עָמַד",
      "transcription": "амáд",
      "translation": "он стоял"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "עָמְדָה",
      "transcription": "амдá",
      "translation": "она стояла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "עָמַדְנוּ",
      "transcription": "амáдну",
      "translation": "мы стояли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "עֲמַדְתֶּם / עֲמַדְתֶּן",
      "transcription": "амадтéм / амадтéн",
      "translation": "вы стояли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "עָמְדוּ",
      "transcription": "амдӯ",
      "translation": "они стояли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶעֱמֹד",
      "transcription": "ээмóд",
      "translation": "я буду стоять"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּעֲמֹד",
      "transcription": "таамóд",
      "translation": "ты будешь стоять / она будет стоять"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּעַמְדִי",
      "transcription": "таамдӣ",
      "translation": "ты будешь стоять (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַעֲמֹד",
      "transcription": "яамóд",
      "translation": "он будет стоять"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַעֲמֹד",
      "transcription": "наамóд",
      "translation": "мы будем стоять"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּעַמְדוּ",
      "transcription": "таамдӯ",
      "translation": "вы будете стоять"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַעַמְדוּ",
      "transcription": "яамдӯ",
      "translation": "они будут стоять"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "עֲמֹד",
      "transcription": "амóд",
      "translation": "стой (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "עִמְדִי",
      "transcription": "имдӣ",
      "translation": "стой (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "עִמְדוּ",
      "transcription": "имдӯ",
      "translation": "стойте"
    }
  ]
},
  'לומר': {
  "infinitive": {
    "hebrew": "לוֹמַר",
    "transcription": "ломáр",
    "translation": "говорить, сказать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "א-מ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "אוֹמֵר",
      "transcription": "омéр",
      "translation": "говорит / говорю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "אוֹמֶרֶת",
      "transcription": "омéрет",
      "translation": "говорит / говорю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "אוֹמְרִים",
      "transcription": "омрӣм",
      "translation": "говорят / говорим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "אוֹמְרוֹת",
      "transcription": "омрóт",
      "translation": "говорят / говорим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אָמַרְתִּי",
      "transcription": "амáрти",
      "translation": "я сказал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "אָמַרְתָּ",
      "transcription": "амáрта",
      "translation": "ты сказал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "אָמַרְתְּ",
      "transcription": "амáрт",
      "translation": "ты сказала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "אָמַר",
      "transcription": "амáр",
      "translation": "он сказал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "אָמְרָה",
      "transcription": "амрá",
      "translation": "она сказала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "אָמַרְנוּ",
      "transcription": "амáрну",
      "translation": "мы сказали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "אֲמַרְתֶּם / אֲמַרְתֶּן",
      "transcription": "амартéм / амартéн",
      "translation": "вы сказали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "אָמְרוּ",
      "transcription": "амрӯ",
      "translation": "они сказали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֹמַר (אַגִּיד)",
      "transcription": "омáр (агӣд)",
      "translation": "я скажу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תֹּאמַר (תַּגִּיד)",
      "transcription": "томáр (тагӣд)",
      "translation": "ты скажешь / она скажет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תֹּאמְרִי (תַּגִּידִי)",
      "transcription": "томрӣ (тагидӣ)",
      "translation": "ты скажешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יֹאמַר (יַגִּיד)",
      "transcription": "йомáр (ягӣд)",
      "translation": "он скажет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נֹאמַר (נַגִּיד)",
      "transcription": "номáр (нагӣд)",
      "translation": "мы скажем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תֹּאמְרוּ (תַּגִּידוּ)",
      "transcription": "томрӯ (тагидӯ)",
      "translation": "вы скажете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יֹאמְרוּ (יַגִּידוּ)",
      "transcription": "йомрӯ (ягидӯ)",
      "translation": "они скажут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "אֱמֹר (תַּגִּיד)",
      "transcription": "эмóр (тагӣд)",
      "translation": "скажи (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "אִמְרִי (תַּגִּידִי)",
      "transcription": "имрӣ (тагидӣ)",
      "translation": "скажи (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "אִמְרוּ (תַּגִּידוּ)",
      "transcription": "имрӯ (тагидӯ)",
      "translation": "скажите"
    }
  ]
},
  'לנסוע': {
  "infinitive": {
    "hebrew": "לִנְסֹעַ",
    "transcription": "линсóа",
    "translation": "ехать, ехать на транспорте"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "נ-ס-ע",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נוֹסֵעַ",
      "transcription": "носéа",
      "translation": "едет / еду (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נוֹסַעַת",
      "transcription": "носáат",
      "translation": "едет / еду (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נוֹסְעִים",
      "transcription": "нос’ӣм",
      "translation": "едут / едем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נוֹסְעוֹת",
      "transcription": "нос’óт",
      "translation": "едут / едем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נָסַעְתִּי",
      "transcription": "насáти",
      "translation": "я поехал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נָסַעְתָּ",
      "transcription": "насáта",
      "translation": "ты поехал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נָסַעְתְּ",
      "transcription": "насáт",
      "translation": "ты поехала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נָסַע",
      "transcription": "насá",
      "translation": "он поехал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נָסְעָה",
      "transcription": "нас’á",
      "translation": "она поехала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָסַעְנוּ",
      "transcription": "насáну",
      "translation": "мы поехали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נְסַעְתֶּם / נְסַעְתֶּן",
      "transcription": "несатéм / несатéн",
      "translation": "вы поехали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נָסְעוּ",
      "transcription": "нас’ӯ",
      "translation": "они поехали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶסַּע",
      "transcription": "эссá",
      "translation": "я поеду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּסַּע",
      "transcription": "тиссá",
      "translation": "ты поедешь / она поедет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּסְעִי",
      "transcription": "тис’ӣ",
      "translation": "ты поедешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִסַּע",
      "transcription": "йиссá",
      "translation": "он поедет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִסַּע",
      "transcription": "ниссá",
      "translation": "мы поедем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּסְעוּ",
      "transcription": "тис’ӯ",
      "translation": "вы поедете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִסְעוּ",
      "transcription": "йис’ӯ",
      "translation": "они поедут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "סַע",
      "transcription": "са",
      "translation": "езжай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "סְעִי",
      "transcription": "се’ӣ",
      "translation": "езжай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "סְעוּ",
      "transcription": "се’ӯ",
      "translation": "езжайте"
    }
  ]
},
  'לנסע': {
  "infinitive": {
    "hebrew": "לִנְסֹעַ",
    "transcription": "линсóа",
    "translation": "ехать, ехать на транспорте"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "נ-ס-ע",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "נוֹסֵעַ",
      "transcription": "носéа",
      "translation": "едет / еду (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "נוֹסַעַת",
      "transcription": "носáат",
      "translation": "едет / еду (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "נוֹסְעִים",
      "transcription": "нос’ӣм",
      "translation": "едут / едем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "נוֹסְעוֹת",
      "transcription": "нос’óт",
      "translation": "едут / едем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "נָסַעְתִּי",
      "transcription": "насáти",
      "translation": "я поехал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "נָסַעְתָּ",
      "transcription": "насáта",
      "translation": "ты поехал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "נָסַעְתְּ",
      "transcription": "насáт",
      "translation": "ты поехала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "נָסַע",
      "transcription": "насá",
      "translation": "он поехал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "נָסְעָה",
      "transcription": "нас’á",
      "translation": "она поехала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָסַעְנוּ",
      "transcription": "насáну",
      "translation": "мы поехали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "נְסַעְתֶּם / נְסַעְתֶּן",
      "transcription": "несатéм / несатéн",
      "translation": "вы поехали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "נָסְעוּ",
      "transcription": "нас’ӯ",
      "translation": "они поехали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶסַּע",
      "transcription": "эссá",
      "translation": "я поеду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּסַּע",
      "transcription": "тиссá",
      "translation": "ты поедешь / она поедет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּסְעִי",
      "transcription": "тис’ӣ",
      "translation": "ты поедешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִסַּע",
      "transcription": "йиссá",
      "translation": "он поедет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִסַּע",
      "transcription": "ниссá",
      "translation": "мы поедем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּסְעוּ",
      "transcription": "тис’ӯ",
      "translation": "вы поедете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִסְעוּ",
      "transcription": "йис’ӯ",
      "translation": "они поедут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "סַע",
      "transcription": "са",
      "translation": "езжай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "סְעִי",
      "transcription": "се’ӣ",
      "translation": "езжай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "סְעוּ",
      "transcription": "се’ӯ",
      "translation": "езжайте"
    }
  ]
},
  'לרוץ': {
  "infinitive": {
    "hebrew": "לָרוּץ",
    "transcription": "ларӯц",
    "translation": "бегать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ר-ו-ץ",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "רָץ",
      "transcription": "рац",
      "translation": "бежит / бегу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "רָצָה",
      "transcription": "рацá",
      "translation": "бежит / бегу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "רָצִים",
      "transcription": "рацӣм",
      "translation": "бегут / бежим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "רָצוֹת",
      "transcription": "рацóт",
      "translation": "бегут / бежим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "רַצְתִּי",
      "transcription": "рáцти",
      "translation": "я бежал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "רַצְתָּ",
      "transcription": "рáцта",
      "translation": "ты бежал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "רַצְתְּ",
      "transcription": "рацт",
      "translation": "ты бежала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "רָץ",
      "transcription": "рац",
      "translation": "он бежал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "רָצָה",
      "transcription": "рацá",
      "translation": "она бежала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "רַצְנוּ",
      "transcription": "рáцну",
      "translation": "мы бежали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "רַצְתֶּם / רַצְתֶּן",
      "transcription": "рацтéм / рацтéн",
      "translation": "вы бежали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "רָצוּ",
      "transcription": "рáцу",
      "translation": "они бежали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אָרוּץ",
      "transcription": "арӯц",
      "translation": "я побегу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תָּרוּץ",
      "transcription": "тарӯц",
      "translation": "ты побежишь / она побежит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תָּרוּצִי",
      "transcription": "тарӯци",
      "translation": "ты побежишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָרוּץ",
      "transcription": "ярӯц",
      "translation": "он побежит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָרוּץ",
      "transcription": "нарӯц",
      "translation": "мы побежим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תָּרוּצוּ",
      "transcription": "тарӯцу",
      "translation": "вы побежите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָרוּצוּ",
      "transcription": "ярӯцу",
      "translation": "они побегут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "רוּץ",
      "transcription": "руц",
      "translation": "беги (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "רוּצִי",
      "transcription": "рӯци",
      "translation": "беги (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "רוּצוּ",
      "transcription": "рӯцу",
      "translation": "бегите"
    }
  ]
},
  'לזכור': {
  "infinitive": {
    "hebrew": "לִזְכֹּר",
    "transcription": "лизкóр",
    "translation": "помнить"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ז-כ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "זוֹכֵר",
      "transcription": "зохéр",
      "translation": "помнит / помню (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "זוֹכֶרֶת",
      "transcription": "зохéрет",
      "translation": "помнит / помню (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "זוֹכְרִים",
      "transcription": "зохрӣм",
      "translation": "помнят / помним (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "זוֹכְרוֹת",
      "transcription": "зохрóт",
      "translation": "помнят / помним (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "זָכַרְתִּי",
      "transcription": "захáрти",
      "translation": "я помнил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "זָכַרְתָּ",
      "transcription": "захáрта",
      "translation": "ты помнил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "זָכַרְתְּ",
      "transcription": "захáрт",
      "translation": "ты помнила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "זָכַר",
      "transcription": "захáр",
      "translation": "он помнил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "זָכְרָה",
      "transcription": "захрá",
      "translation": "она помнила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "זָכַרְנוּ",
      "transcription": "захáрну",
      "translation": "мы помнили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "זְכַרְתֶּם / זְכַרְתֶּן",
      "transcription": "зхартéм / зхартéн",
      "translation": "вы помнили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "זָכְרוּ",
      "transcription": "захрӯ",
      "translation": "они помнили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶזְכֹּר",
      "transcription": "эзкóр",
      "translation": "я вспомню / буду помнить"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּזְכֹּר",
      "transcription": "тизкóр",
      "translation": "ты вспомнишь / она вспомнит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּזְכְּרִי",
      "transcription": "тизкерӣ",
      "translation": "ты вспомнишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִזְכֹּר",
      "transcription": "йизкóр",
      "translation": "он вспомнит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִזְכֹּר",
      "transcription": "низкóр",
      "translation": "мы вспомним"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּזְכְּרוּ",
      "transcription": "тизкерӯ",
      "translation": "вы вспомните"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִזְכְּרוּ",
      "transcription": "йизкерӯ",
      "translation": "они вспомнят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "זְכֹר",
      "transcription": "зхор",
      "translation": "помни (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "זִכְרִי",
      "transcription": "зихрӣ",
      "translation": "помни (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "זִכְרוּ",
      "transcription": "зихрӯ",
      "translation": "помните"
    }
  ]
},
  'לזכר': {
  "infinitive": {
    "hebrew": "לִזְכֹּר",
    "transcription": "лизкóр",
    "translation": "помнить"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ז-כ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "זוֹכֵר",
      "transcription": "зохéр",
      "translation": "помнит / помню (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "זוֹכֶרֶת",
      "transcription": "зохéрет",
      "translation": "помнит / помню (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "זוֹכְרִים",
      "transcription": "зохрӣм",
      "translation": "помнят / помним (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "זוֹכְרוֹת",
      "transcription": "зохрóт",
      "translation": "помнят / помним (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "זָכַרְתִּי",
      "transcription": "захáрти",
      "translation": "я помнил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "זָכַרְתָּ",
      "transcription": "захáрта",
      "translation": "ты помнил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "זָכַרְתְּ",
      "transcription": "захáрт",
      "translation": "ты помнила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "זָכַר",
      "transcription": "захáр",
      "translation": "он помнил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "זָכְרָה",
      "transcription": "захрá",
      "translation": "она помнила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "זָכַרְנוּ",
      "transcription": "захáрну",
      "translation": "мы помнили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "זְכַרְתֶּם / זְכַרְתֶּן",
      "transcription": "зхартéм / зхартéн",
      "translation": "вы помнили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "זָכְרוּ",
      "transcription": "захрӯ",
      "translation": "они помнили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶזְכֹּר",
      "transcription": "эзкóр",
      "translation": "я вспомню / буду помнить"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּזְכֹּר",
      "transcription": "тизкóр",
      "translation": "ты вспомнишь / она вспомнит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּזְכְּרִי",
      "transcription": "тизкерӣ",
      "translation": "ты вспомнишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִזְכֹּר",
      "transcription": "йизкóр",
      "translation": "он вспомнит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִזְכֹּר",
      "transcription": "низкóр",
      "translation": "мы вспомним"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּזְכְּרוּ",
      "transcription": "тизкерӯ",
      "translation": "вы вспомните"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִזְכְּרוּ",
      "transcription": "йизкерӯ",
      "translation": "они вспомнят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "זְכֹר",
      "transcription": "зхор",
      "translation": "помни (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "זִכְרִי",
      "transcription": "зихрӣ",
      "translation": "помни (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "זִכְרוּ",
      "transcription": "зихрӯ",
      "translation": "помните"
    }
  ]
},
  'לשכוח': {
  "infinitive": {
    "hebrew": "לִשְׁכֹּחַ",
    "transcription": "лишкóах",
    "translation": "забывать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ש-כ-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "שׁוֹכֵחַ",
      "transcription": "шохéах",
      "translation": "забывает / забываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "שׁוֹכַחַת",
      "transcription": "шохáхат",
      "translation": "забывает / забываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "שׁוֹכְחִים",
      "transcription": "шоххӣм",
      "translation": "забывают / забываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "שׁוֹכְחוֹת",
      "transcription": "шоххóт",
      "translation": "забывают / забываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "שָׁכַחְתִּי",
      "transcription": "шахáхти",
      "translation": "я забыл(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "שָׁכַחְתָּ",
      "transcription": "шахáхта",
      "translation": "ты забыл"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "שָׁכַחְתְּ",
      "transcription": "шахáхт",
      "translation": "ты забыла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "שָׁכַח",
      "transcription": "шахáх",
      "translation": "он забыл"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "שָׁכְחָה",
      "transcription": "шаххá",
      "translation": "она забыла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "שָׁכַחְנוּ",
      "transcription": "шахáхну",
      "translation": "мы забыли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "שְׁכַחְתֶּם / שְׁכַחְתֶּן",
      "transcription": "шхахтéм / шхахтéн",
      "translation": "вы забыли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "שָׁכְחוּ",
      "transcription": "шаххӯ",
      "translation": "они забыли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶשְׁכַּח",
      "transcription": "эшкáх",
      "translation": "я забуду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּשְׁכַּח",
      "transcription": "тишкáх",
      "translation": "ты забудешь / она забудет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּשְׁכְּחִי",
      "transcription": "тишкехӣ",
      "translation": "ты забудешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִשְׁכַּח",
      "transcription": "йишкáх",
      "translation": "он забудет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִשְׁכַּח",
      "transcription": "нишкáх",
      "translation": "мы забудем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּשְׁכְּחוּ",
      "transcription": "тишкехӯ",
      "translation": "вы забудете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִשְׁכְּחוּ",
      "transcription": "йишкехӯ",
      "translation": "они забудут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שְׁכַח",
      "transcription": "шках",
      "translation": "забудь (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שִׁכְחִי",
      "transcription": "шихӣ",
      "translation": "забудь (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שִׁכְחוּ",
      "transcription": "шихӯ",
      "translation": "забудьте"
    }
  ]
},
  'לשכח': {
  "infinitive": {
    "hebrew": "לִשְׁכֹּחַ",
    "transcription": "лишкóах",
    "translation": "забывать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ש-כ-ח",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "שׁוֹכֵחַ",
      "transcription": "шохéах",
      "translation": "забывает / забываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "שׁוֹכַחַת",
      "transcription": "шохáхат",
      "translation": "забывает / забываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "שׁוֹכְחִים",
      "transcription": "шоххӣм",
      "translation": "забывают / забываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "שׁוֹכְחוֹת",
      "transcription": "шоххóт",
      "translation": "забывают / забываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "שָׁכַחְתִּי",
      "transcription": "шахáхти",
      "translation": "я забыл(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "שָׁכַחְתָּ",
      "transcription": "шахáхта",
      "translation": "ты забыл"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "שָׁכַחְתְּ",
      "transcription": "шахáхт",
      "translation": "ты забыла"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "שָׁכַח",
      "transcription": "шахáх",
      "translation": "он забыл"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "שָׁכְחָה",
      "transcription": "шаххá",
      "translation": "она забыла"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "שָׁכַחְנוּ",
      "transcription": "шахáхну",
      "translation": "мы забыли"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "שְׁכַחְתֶּם / שְׁכַחְתֶּן",
      "transcription": "шхахтéм / шхахтéн",
      "translation": "вы забыли"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "שָׁכְחוּ",
      "transcription": "шаххӯ",
      "translation": "они забыли"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶשְׁכַּח",
      "transcription": "эшкáх",
      "translation": "я забуду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּשְׁכַּח",
      "transcription": "тишкáх",
      "translation": "ты забудешь / она забудет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּשְׁכְּחִי",
      "transcription": "тишкехӣ",
      "translation": "ты забудешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִשְׁכַּח",
      "transcription": "йишкáх",
      "translation": "он забудет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִשְׁכַּח",
      "transcription": "нишкáх",
      "translation": "мы забудем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּשְׁכְּחוּ",
      "transcription": "тишкехӯ",
      "translation": "вы забудете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִשְׁכְּחוּ",
      "transcription": "йишкехӯ",
      "translation": "они забудут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שְׁכַח",
      "transcription": "шках",
      "translation": "забудь (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שִׁכְחִי",
      "transcription": "шихӣ",
      "translation": "забудь (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שִׁכְחוּ",
      "transcription": "шихӯ",
      "translation": "забудьте"
    }
  ]
},
  'לטוס': {
  "infinitive": {
    "hebrew": "לָטוּס",
    "transcription": "латӯс",
    "translation": "летать (на самолете)"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ט-ו-ס",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "טָס",
      "transcription": "тас",
      "translation": "летит / лечу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "טָסָה",
      "transcription": "тасá",
      "translation": "летит / лечу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "טָסִים",
      "transcription": "тасӣм",
      "translation": "летят / летим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "טָסוֹת",
      "transcription": "тасóт",
      "translation": "летят / летим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "טַסְתִּי",
      "transcription": "тáсти",
      "translation": "я летел(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "טַסְתָּ",
      "transcription": "тáста",
      "translation": "ты летел"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "טַסְתְּ",
      "transcription": "таст",
      "translation": "ты летела"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "טָס",
      "transcription": "тас",
      "translation": "он летел"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "טָסָה",
      "transcription": "тасá",
      "translation": "она летела"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "טַסְנוּ",
      "transcription": "тáсну",
      "translation": "мы летели"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "טַסְתֶּם / טַסְתֶּן",
      "transcription": "тастéм / тастéн",
      "translation": "вы летели"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "טָסוּ",
      "transcription": "тáсу",
      "translation": "они летели"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אָטוּס",
      "transcription": "атӯс",
      "translation": "я полечу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תָּטוּס",
      "transcription": "татӯс",
      "translation": "ты полетишь / она полетит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תָּטוּסִי",
      "transcription": "татӯси",
      "translation": "ты полетишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יָטוּס",
      "transcription": "ятӯс",
      "translation": "он полетит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נָטוּס",
      "transcription": "натӯс",
      "translation": "мы полетим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תָּטוּסוּ",
      "transcription": "татӯсу",
      "translation": "вы полетите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יָטוּסוּ",
      "transcription": "ятӯсу",
      "translation": "они полетят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "טוּס",
      "transcription": "тус",
      "translation": "лети (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "טוּסִי",
      "transcription": "тӯси",
      "translation": "лети (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "טוּסוּ",
      "transcription": "тӯсу",
      "translation": "летите"
    }
  ]
},
  'למכור': {
  "infinitive": {
    "hebrew": "לִמְכֹּר",
    "transcription": "лимкóр",
    "translation": "продавать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "מ-כ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיд (он / я / ты)",
      "hebrew": "מוֹכֵר",
      "transcription": "мохéр",
      "translation": "продает / продаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מוֹכֶרֶת",
      "transcription": "мохéрет",
      "translation": "продает / продаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מוֹכְרִים",
      "transcription": "мохрӣм",
      "translation": "продают / продаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מוֹכְרוֹת",
      "transcription": "мохрóт",
      "translation": "продают / продаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "מָכַרְתִּי",
      "transcription": "махáрти",
      "translation": "я продал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "מָכַרְתָּ",
      "transcription": "махáрта",
      "translation": "ты продал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "מָכַרְתְּ",
      "transcription": "махáрт",
      "translation": "ты продала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "מָכַר",
      "transcription": "махáр",
      "translation": "он продал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "מָכְרָה",
      "transcription": "махрá",
      "translation": "она продала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "מָכַרְנוּ",
      "transcription": "махáрну",
      "translation": "мы продали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "מְכַרְתֶּם / מְכַרְתֶּן",
      "transcription": "мхартéм / мхартéн",
      "translation": "вы продали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "מָכְרוּ",
      "transcription": "махрӯ",
      "translation": "они продали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶמְכֹּר",
      "transcription": "эмкóр",
      "translation": "я продам"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּמְכֹּר",
      "transcription": "тимкóр",
      "translation": "ты продашь / она продаст"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּמְכְּרִי",
      "transcription": "тимкерӣ",
      "translation": "ты продашь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִמְכֹּר",
      "transcription": "йимкóр",
      "translation": "он продаст"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִמְכֹּר",
      "transcription": "нимкóр",
      "translation": "мы продадим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּמְכְּרוּ",
      "transcription": "тимкерӯ",
      "translation": "вы продадите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִמְכְּרוּ",
      "transcription": "йимкерӯ",
      "translation": "они продадут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "מְכֹר",
      "transcription": "мхор",
      "translation": "продай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "מִכְרִי",
      "transcription": "михрӣ",
      "translation": "продай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "מִכְרוּ",
      "transcription": "михрӯ",
      "translation": "продайте"
    }
  ]
},
  'למכר': {
  "infinitive": {
    "hebrew": "לִמְכֹּר",
    "transcription": "лимкóр",
    "translation": "продавать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "מ-כ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מוֹכֵר",
      "transcription": "мохéр",
      "translation": "продает / продаю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מוֹכֶרֶת",
      "transcription": "мохéрет",
      "translation": "продает / продаю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מוֹכְרִים",
      "transcription": "мохрӣм",
      "translation": "продают / продаем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מוֹכְרוֹת",
      "transcription": "мохрóт",
      "translation": "продают / продаем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "מָכַרְתִּי",
      "transcription": "махáрти",
      "translation": "я продал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "מָכַרְתָּ",
      "transcription": "махáрта",
      "translation": "ты продал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "מָכַרְתְּ",
      "transcription": "махáрт",
      "translation": "ты продала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "מָכַר",
      "transcription": "махáр",
      "translation": "он продал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "מָכְרָה",
      "transcription": "махрá",
      "translation": "она продала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "מָכַרְנוּ",
      "transcription": "махáрну",
      "translation": "мы продали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "מְכַרְתֶּם / מְכַרְתֶּן",
      "transcription": "мхартéм / мхартéн",
      "translation": "вы продали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "מָכְרוּ",
      "transcription": "махрӯ",
      "translation": "они продали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶמְכֹּר",
      "transcription": "эмкóр",
      "translation": "я продам"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּמְכֹּר",
      "transcription": "тимкóр",
      "translation": "ты продашь / она продаст"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּמְכְּרִי",
      "transcription": "тимкерӣ",
      "translation": "ты продашь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִמְכֹּר",
      "transcription": "йимкóр",
      "translation": "он продаст"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִמְכֹּר",
      "transcription": "нимкóр",
      "translation": "мы продадим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּמְכְּרוּ",
      "transcription": "тимкерӯ",
      "translation": "вы продадите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִמְכְּרוּ",
      "transcription": "йимкерӯ",
      "translation": "они продадут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "מְכֹר",
      "transcription": "мхор",
      "translation": "продай (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "מִכְרִי",
      "transcription": "михрӣ",
      "translation": "продай (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "מִכְרוּ",
      "transcription": "михрӯ",
      "translation": "продайте"
    }
  ]
},
  'לבחור': {
  "infinitive": {
    "hebrew": "לִבְחֹר",
    "transcription": "ливхóр",
    "translation": "выбирать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ב-ח-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "בּוֹחֵר",
      "transcription": "бохéр",
      "translation": "выбирает / выбираю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "בּוֹחֶרֶת",
      "transcription": "бохéрет",
      "translation": "выбирает / выбираю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "בּוֹחֲרִים",
      "transcription": "бохарӣм",
      "translation": "выбирают / выбираем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "בּוֹחֲרוֹת",
      "transcription": "бохарóт",
      "translation": "выбирают / выбираем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "בָּחַרְתִּי",
      "transcription": "бахáрти",
      "translation": "я выбрал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "בָּחַרְתָּ",
      "transcription": "бахáрта",
      "translation": "ты выбрал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "בָּחַרְתְּ",
      "transcription": "бахáрт",
      "translation": "ты выбрала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "בָּחַר",
      "transcription": "бахáр",
      "translation": "он выбрал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "בָּחֲרָה",
      "transcription": "бахарá",
      "translation": "она выбрала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "בָּחַרְנוּ",
      "transcription": "бахáрну",
      "translation": "мы выбрали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "בְּחַרְתֶּם / בְּחַרְתֶּן",
      "transcription": "бхартéм / бхартéн",
      "translation": "вы выбрали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "בָּחֲרוּ",
      "transcription": "бахарӯ",
      "translation": "они выбрали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶבְחַר",
      "transcription": "эвхáр",
      "translation": "я выберу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּבְחַר",
      "transcription": "тивхáр",
      "translation": "ты выберешь / она выберет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּבְחֲרִי",
      "transcription": "тивхарӣ",
      "translation": "ты выберешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִבְחַר",
      "transcription": "йивхáр",
      "translation": "он выберет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִבְחַר",
      "transcription": "нивхáр",
      "translation": "мы выберем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּבְחֲרוּ",
      "transcription": "тивхарӯ",
      "translation": "вы выберете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִבְחֲרוּ",
      "transcription": "йивхарӯ",
      "translation": "они выберут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "בְּחַר",
      "transcription": "бхар",
      "translation": "выбери (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "בַּחֲרִי",
      "transcription": "бахарӣ",
      "translation": "выбери (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "בַּחֲרוּ",
      "transcription": "бахарӯ",
      "translation": "выберите"
    }
  ]
},
  'לבחר': {
  "infinitive": {
    "hebrew": "לִבְחֹר",
    "transcription": "ливхóр",
    "translation": "выбирать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ב-ח-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "בּוֹחֵר",
      "transcription": "бохéр",
      "translation": "выбирает / выбираю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "בּוֹחֶרֶת",
      "transcription": "бохéрет",
      "translation": "выбирает / выбираю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "בּוֹחֲרִים",
      "transcription": "бохарӣм",
      "translation": "выбирают / выбираем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "בּוֹחֲרוֹת",
      "transcription": "бохарóт",
      "translation": "выбирают / выбираем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "בָּחַרְתִּי",
      "transcription": "бахáрти",
      "translation": "я выбрал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "בָּחַרְתָּ",
      "transcription": "бахáрта",
      "translation": "ты выбрал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "בָּחַרְתְּ",
      "transcription": "бахáрт",
      "translation": "ты выбрала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "בָּחַר",
      "transcription": "бахáр",
      "translation": "он выбрал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "בָּחֲרָה",
      "transcription": "бахарá",
      "translation": "она выбрала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "בָּחַרְנוּ",
      "transcription": "бахáрну",
      "translation": "мы выбрали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "בְּחַרְתֶּם / בְּחַרְתֶּן",
      "transcription": "бхартéм / бхартéн",
      "translation": "вы выбрали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "בָּחֲרוּ",
      "transcription": "бахарӯ",
      "translation": "они выбрали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶבְחַר",
      "transcription": "эвхáр",
      "translation": "я выберу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּבְחַר",
      "transcription": "тивхáр",
      "translation": "ты выберешь / она выберет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּבְחֲרִי",
      "transcription": "тивхарӣ",
      "translation": "ты выберешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִבְחַר",
      "transcription": "йивхáр",
      "translation": "он выберет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִבְחַר",
      "transcription": "нивхáр",
      "translation": "мы выберем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּבְחֲרוּ",
      "transcription": "тивхарӯ",
      "translation": "вы выберете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִבְחֲרוּ",
      "transcription": "йивхарӯ",
      "translation": "они выберут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "בְּחַר",
      "transcription": "бхар",
      "translation": "выбери (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "בַּחֲרִי",
      "transcription": "бахарӣ",
      "translation": "выбери (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "בַּחֲרוּ",
      "transcription": "бахарӯ",
      "translation": "выберите"
    }
  ]
},
  'לבדוק': {
  "infinitive": {
    "hebrew": "לִבְדֹּק",
    "transcription": "ливдóк",
    "translation": "проверять"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ב-ד-ק",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "בּוֹדֵק",
      "transcription": "бодéк",
      "translation": "проверяет / проверяю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "בּוֹדֶקֶת",
      "transcription": "бодéкет",
      "translation": "проверяет / проверяю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "בּוֹדְקִים",
      "transcription": "бодкӣм",
      "translation": "проверяют / проверяем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "בּוֹדְקוֹת",
      "transcription": "бодкóт",
      "translation": "проверяют / проверяем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "בָּדַקְתִּי",
      "transcription": "бадáкти",
      "translation": "я проверил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "בָּדַקְתָּ",
      "transcription": "бадáкта",
      "translation": "ты проверил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "בָּדַקְתְּ",
      "transcription": "бадáкт",
      "translation": "ты проверила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "בָּדַק",
      "transcription": "бадáк",
      "translation": "он проверил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "בָּדְקָה",
      "transcription": "бадкá",
      "translation": "она проверила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "בָּדַקְנוּ",
      "transcription": "бадáкну",
      "translation": "мы проверили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "בְּדַקְתֶּם / בְּדַקְתֶּן",
      "transcription": "бдактéм / бдактéн",
      "translation": "вы проверили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "בָּדְקוּ",
      "transcription": "бадкӯ",
      "translation": "они проверили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶבְדֹּק",
      "transcription": "эвдóк",
      "translation": "я проверю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּבְדֹּק",
      "transcription": "тивдóк",
      "translation": "ты проверишь / она проверит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּבְדְּקִי",
      "transcription": "тивдекӣ",
      "translation": "ты проверишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִבְדֹּק",
      "transcription": "йивдóк",
      "translation": "он проверит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִבְדֹּק",
      "transcription": "нивдóк",
      "translation": "мы проверим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּבְדְּקוּ",
      "transcription": "тивдекӯ",
      "translation": "вы проверите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִבְדְּקוּ",
      "transcription": "йивдекӯ",
      "translation": "они проверят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "בְּדֹק",
      "transcription": "бдок",
      "translation": "проверь (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "בִּדְקִי",
      "transcription": "бидкӣ",
      "translation": "проверь (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "בִּדְקוּ",
      "transcription": "бидкӯ",
      "translation": "проверьте"
    }
  ]
},
  'לבדק': {
  "infinitive": {
    "hebrew": "לִבְדֹּק",
    "transcription": "ливдóк",
    "translation": "проверять"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ב-ד-ק",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "בּוֹדֵק",
      "transcription": "бодéк",
      "translation": "проверяет / проверяю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "בּוֹדֶקֶת",
      "transcription": "бодéкет",
      "translation": "проверяет / проверяю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "בּוֹדְקִים",
      "transcription": "бодкӣм",
      "translation": "проверяют / проверяем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "בּוֹדְקוֹת",
      "transcription": "бодкóт",
      "translation": "проверяют / проверяем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "בָּדַקְתִּי",
      "transcription": "бадáкти",
      "translation": "я проверил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "בָּדַקְתָּ",
      "transcription": "бадáкта",
      "translation": "ты проверил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "בָּדַקְתְּ",
      "transcription": "бадáкт",
      "translation": "ты проверила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "בָּדַק",
      "transcription": "бадáк",
      "translation": "он проверил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "בָּדְקָה",
      "transcription": "бадкá",
      "translation": "она проверила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "בָּדַקְנוּ",
      "transcription": "бадáкну",
      "translation": "мы проверили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "בְּדַקְתֶּם / בְּדַקְתֶּן",
      "transcription": "бдактéм / бдактéн",
      "translation": "вы проверили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "בָּדְקוּ",
      "transcription": "бадкӯ",
      "translation": "они проверили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶבְדֹּק",
      "transcription": "эвдóк",
      "translation": "я проверю"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּבְדֹּק",
      "transcription": "тивдóк",
      "translation": "ты проверишь / она проверит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּבְדְּקִי",
      "transcription": "тивдекӣ",
      "translation": "ты проверишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִבְדֹּק",
      "transcription": "йивдóк",
      "translation": "он проверит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִבְדֹּק",
      "transcription": "нивдóк",
      "translation": "мы проверим"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּבְדְּקוּ",
      "transcription": "тивдекӯ",
      "translation": "вы проверите"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִבְדְּקוּ",
      "transcription": "йивдекӯ",
      "translation": "они проверят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "בְּדֹק",
      "transcription": "бдок",
      "translation": "проверь (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "בִּדְקִי",
      "transcription": "бидкӣ",
      "translation": "проверь (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "בִּדְקוּ",
      "transcription": "бидкӯ",
      "translation": "проверьте"
    }
  ]
},
  'לשמור': {
  "infinitive": {
    "hebrew": "לִשְׁמֹר",
    "transcription": "лишмóр",
    "translation": "сохранять, беречь, сторожить"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ש-מ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "שׁוֹמֵר",
      "transcription": "шомéр",
      "translation": "хранит / храню (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "שׁוֹמֶרֶת",
      "transcription": "шомéрет",
      "translation": "хранит / храню (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "שׁוֹמְרִים",
      "transcription": "шомрӣм",
      "translation": "хранят / храним (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "שׁוֹמְרוֹת",
      "transcription": "шомрóт",
      "translation": "хранят / храним (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "שָׁמַרְתִּי",
      "transcription": "шамáрти",
      "translation": "я сохранил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "שָׁמַרְתָּ",
      "transcription": "шамáрта",
      "translation": "ты сохранил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "שָׁמַרְתְּ",
      "transcription": "шамáрт",
      "translation": "ты сохранила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "שָׁמַר",
      "transcription": "шамáр",
      "translation": "он сохранил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "שָׁמְרָה",
      "transcription": "шамрá",
      "translation": "она сохранила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "שָׁמַרְנוּ",
      "transcription": "шамáрну",
      "translation": "мы сохранили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "שְׁמַרְתֶּם / שְׁמַרְתֶּן",
      "transcription": "шмартéм / шмартéн",
      "translation": "вы сохранили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "שָׁמְרוּ",
      "transcription": "шамрӯ",
      "translation": "они сохранили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶשְׁמֹר",
      "transcription": "эшмóр",
      "translation": "я сохраню"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּשְׁמֹר",
      "transcription": "тишмóр",
      "translation": "ты сохранишь / она сохранит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּשְׁמְרִי",
      "transcription": "тишмерӣ",
      "translation": "ты сохранишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִשְׁמֹר",
      "transcription": "йишмóр",
      "translation": "он сохранит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִשְׁמֹר",
      "transcription": "нишмóр",
      "translation": "мы сохраним"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּשְׁמְרוּ",
      "transcription": "тишмерӯ",
      "translation": "вы сохраните"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִשְׁמְרוּ",
      "transcription": "йишмерӯ",
      "translation": "они сохранят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שְׁמֹר",
      "transcription": "шмор",
      "translation": "сохрани / береги (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שִׁמְרִי",
      "transcription": "шимрӣ",
      "translation": "сохрани / береги (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שִׁמְרוּ",
      "transcription": "шимрӯ",
      "translation": "сохраните / берегите"
    }
  ]
},
  'לשמר': {
  "infinitive": {
    "hebrew": "לִשְׁמֹר",
    "transcription": "лишмóр",
    "translation": "сохранять, беречь, сторожить"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ש-מ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "שׁוֹמֵר",
      "transcription": "шомéр",
      "translation": "хранит / храню (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "שׁוֹמֶרֶת",
      "transcription": "шомéрет",
      "translation": "хранит / храню (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "שׁוֹמְרִים",
      "transcription": "шомрӣм",
      "translation": "хранят / храним (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "שׁוֹמְרוֹת",
      "transcription": "шомрóт",
      "translation": "хранят / храним (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "שָׁמַרְתִּי",
      "transcription": "шамáрти",
      "translation": "я сохранил(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "שָׁמַרְתָּ",
      "transcription": "шамáрта",
      "translation": "ты сохранил"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "שָׁמַרְתְּ",
      "transcription": "шамáрт",
      "translation": "ты сохранила"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "שָׁמַר",
      "transcription": "шамáр",
      "translation": "он сохранил"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "שָׁמְרָה",
      "transcription": "шамрá",
      "translation": "она сохранила"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "שָׁמַרְנוּ",
      "transcription": "шамáрну",
      "translation": "мы сохранили"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "שְׁמַרְתֶּם / שְׁמַרְתֶּן",
      "transcription": "шмартéм / шмартéн",
      "translation": "вы сохранили"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "שָׁמְרוּ",
      "transcription": "шамрӯ",
      "translation": "они сохранили"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶשְׁמֹר",
      "transcription": "эшмóр",
      "translation": "я сохраню"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּשְׁמֹר",
      "transcription": "тишмóр",
      "translation": "ты сохранишь / она сохранит"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּשְׁמְרִי",
      "transcription": "тишмерӣ",
      "translation": "ты сохранишь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִשְׁמֹר",
      "transcription": "йишмóр",
      "translation": "он сохранит"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִשְׁמֹר",
      "transcription": "нишмóр",
      "translation": "мы сохраним"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּשְׁמְרוּ",
      "transcription": "тишмерӯ",
      "translation": "вы сохраните"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִשְׁמְרוּ",
      "transcription": "йишмерӯ",
      "translation": "они сохранят"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "שְׁמֹר",
      "transcription": "шмор",
      "translation": "сохрани / береги (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "שִׁמְרִי",
      "transcription": "шимрӣ",
      "translation": "сохрани / береги (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "שִׁמְרוּ",
      "transcription": "шимрӯ",
      "translation": "сохраните / берегите"
    }
  ]
},
  'לעבור': {
  "infinitive": {
    "hebrew": "לַעֲבֹר",
    "transcription": "лаавóр",
    "translation": "переходить, переезжать, проходить"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ע-ב-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "עוֹבֵר",
      "transcription": "овéр",
      "translation": "переходит / перехожу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "עוֹבֶרֶת",
      "transcription": "овéрет",
      "translation": "переходит / перехожу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "עוֹבְרִים",
      "transcription": "оврӣм",
      "translation": "переходят / переходим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "עוֹבְרוֹת",
      "transcription": "оврóт",
      "translation": "переходят / переходим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "עָבַרְתִּי",
      "transcription": "авáрти",
      "translation": "я перешел / переехал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "עָבַרְתָּ",
      "transcription": "авáрта",
      "translation": "ты перешел / переехал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "עָבַרְתְּ",
      "transcription": "авáрт",
      "translation": "ты перешла / переехала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "עָבַר",
      "transcription": "авáр",
      "translation": "он перешел / переехал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "עָבְרָה",
      "transcription": "аврá",
      "translation": "она перешла / переехала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "עָבַרְנוּ",
      "transcription": "авáрну",
      "translation": "мы перешли / переехали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "עֲבַרְתֶּם / עֲבַרְתֶּן",
      "transcription": "авартéм / авартéн",
      "translation": "вы перешли / переехали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "עָבְרוּ",
      "transcription": "аврӯ",
      "translation": "они перешли / переехали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶעֱבֹר",
      "transcription": "ээвóр",
      "translation": "я перейду / перееду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּעֲבֹר",
      "transcription": "таавóр",
      "translation": "ты перейдешь / она перейдет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּעַבְרִי",
      "transcription": "тааврӣ",
      "translation": "ты перейдешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַעֲבֹר",
      "transcription": "яавóр",
      "translation": "он перейдет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַעֲבֹר",
      "transcription": "наавóр",
      "translation": "мы перейдем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּעַבְרוּ",
      "transcription": "тааврӯ",
      "translation": "вы перейдете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַעַבְרוּ",
      "transcription": "яаврӯ",
      "translation": "они перейдут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "עֲבֹר",
      "transcription": "авóр",
      "translation": "перейди (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "עִבְרִי",
      "transcription": "иврӣ",
      "translation": "перейди (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "עִבְרוּ",
      "transcription": "иврӯ",
      "translation": "перейдите"
    }
  ]
},
  'לעבר': {
  "infinitive": {
    "hebrew": "לַעֲבֹר",
    "transcription": "лаавóр",
    "translation": "переходить, переезжать, проходить"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ע-ב-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "עוֹבֵר",
      "transcription": "овéр",
      "translation": "переходит / перехожу (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "עוֹבֶרֶת",
      "transcription": "овéрет",
      "translation": "переходит / перехожу (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "עוֹבְרִים",
      "transcription": "оврӣм",
      "translation": "переходят / переходим (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "עוֹבְרוֹת",
      "transcription": "оврóт",
      "translation": "переходят / переходим (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "עָבַרְתִּי",
      "transcription": "авáрти",
      "translation": "я перешел / переехал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "עָבַרְתָּ",
      "transcription": "авáрта",
      "translation": "ты перешел / переехал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "עָבַרְתְּ",
      "transcription": "авáрт",
      "translation": "ты перешла / переехала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "עָבַר",
      "transcription": "авáр",
      "translation": "он перешел / переехал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "עָבְרָה",
      "transcription": "аврá",
      "translation": "она перешла / переехала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "עָבַרְנוּ",
      "transcription": "авáрну",
      "translation": "мы перешли / переехали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "עֲבַרְתֶּם / עֲבַרְתֶּן",
      "transcription": "авартéм / авартéн",
      "translation": "вы перешли / переехали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "עָבְרוּ",
      "transcription": "аврӯ",
      "translation": "они перешли / переехали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶעֱבֹר",
      "transcription": "ээвóр",
      "translation": "я перейду / перееду"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּעֲבֹר",
      "transcription": "таавóр",
      "translation": "ты перейдешь / она перейдет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּעַבְרִי",
      "transcription": "тааврӣ",
      "translation": "ты перейдешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַעֲבֹר",
      "transcription": "яавóр",
      "translation": "он перейдет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַעֲבֹר",
      "transcription": "наавóр",
      "translation": "мы перейдем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּעַבְרוּ",
      "transcription": "тааврӯ",
      "translation": "вы перейдете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַעַבְרוּ",
      "transcription": "яаврӯ",
      "translation": "они перейдут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "עֲבֹר",
      "transcription": "авóр",
      "translation": "перейди (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "עִבְרִי",
      "transcription": "иврӣ",
      "translation": "перейди (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "עִבְרוּ",
      "transcription": "иврӯ",
      "translation": "перейдите"
    }
  ]
},
  'לעצור': {
  "infinitive": {
    "hebrew": "לַעֲצֹר",
    "transcription": "лаацóр",
    "translation": "останавливать(ся)"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ע-צ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "עוֹצֵר",
      "transcription": "оцéр",
      "translation": "останавливает(ся) / останавливаю(сь) (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "עוֹצֶרֶת",
      "transcription": "оцéрет",
      "translation": "останавливает(ся) / останавливаю(сь) (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "עוֹצְרִים",
      "transcription": "оцрӣм",
      "translation": "останавливают(ся) / останавливаем(ся) (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "עוֹצְרוֹת",
      "transcription": "оцрóт",
      "translation": "останавливают(ся) / останавливаем(ся) (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "עָצַרְתִּי",
      "transcription": "ацáрти",
      "translation": "я остановил(ся) / остановила(сь)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "עָצַרְתָּ",
      "transcription": "ацáрта",
      "translation": "ты остановил(ся)"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "עָצַרְתְּ",
      "transcription": "ацáрт",
      "translation": "ты остановила(сь)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "עָצַר",
      "transcription": "ацáр",
      "translation": "он остановил(ся)"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "עָצְרָה",
      "transcription": "ацрá",
      "translation": "она остановила(сь)"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "עָצַרְנוּ",
      "transcription": "ацáрну",
      "translation": "мы остановили(сь)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "עֲצַרְתֶּם / עֲצַרְתֶּן",
      "transcription": "ацартéм / ацартéн",
      "translation": "вы остановили(сь)"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "עָצְרוּ",
      "transcription": "ацрӯ",
      "translation": "они остановили(сь)"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶעֱצֹר",
      "transcription": "ээцóр",
      "translation": "я остановлю(сь)"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּעֲצֹר",
      "transcription": "таацóр",
      "translation": "ты остановишь(ся) / она остановит(ся)"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּעַצְרִי",
      "transcription": "таацрӣ",
      "translation": "ты остановишь(ся) (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַעֲצֹר",
      "transcription": "яацóр",
      "translation": "он остановит(ся)"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַעֲצֹר",
      "transcription": "наацóр",
      "translation": "мы остановим(ся)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּעַצְרוּ",
      "transcription": "таацрӯ",
      "translation": "вы остановите(сь)"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַעַצְרוּ",
      "transcription": "яацрӯ",
      "translation": "они остановят(ся)"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "עֲצֹר",
      "transcription": "ацóр",
      "translation": "остановись / стой (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "עִצְרִי",
      "transcription": "ицрӣ",
      "translation": "остановись / стой (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "עִצְרוּ",
      "transcription": "ицрӯ",
      "translation": "остановитесь / стойте"
    }
  ]
},
  'לעצר': {
  "infinitive": {
    "hebrew": "לַעֲצֹר",
    "transcription": "лаацóр",
    "translation": "останавливать(ся)"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ע-צ-ר",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "עוֹצֵר",
      "transcription": "оцéр",
      "translation": "останавливает(ся) / останавливаю(сь) (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "עוֹצֶרֶת",
      "transcription": "оцéрет",
      "translation": "останавливает(ся) / останавливаю(сь) (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "עוֹצְרִים",
      "transcription": "оцрӣм",
      "translation": "останавливают(ся) / останавливаем(ся) (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "עוֹצְרוֹת",
      "transcription": "оцрóт",
      "translation": "останавливают(ся) / останавливаем(ся) (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "עָצַרְתִּי",
      "transcription": "ацáрти",
      "translation": "я остановил(ся) / остановила(сь)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "עָצַרְתָּ",
      "transcription": "ацáрта",
      "translation": "ты остановил(ся)"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "עָצַרְתְּ",
      "transcription": "ацáрт",
      "translation": "ты остановила(сь)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "עָצַר",
      "transcription": "ацáр",
      "translation": "он остановил(ся)"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "עָצְרָה",
      "transcription": "ацрá",
      "translation": "она остановила(сь)"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "עָצַרְנוּ",
      "transcription": "ацáрну",
      "translation": "мы остановили(сь)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "עֲצַרְתֶּם / עֲצַרְתֶּן",
      "transcription": "ацартéм / ацартéн",
      "translation": "вы остановили(сь)"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "עָצְרוּ",
      "transcription": "ацрӯ",
      "translation": "они остановили(сь)"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶעֱצֹר",
      "transcription": "ээцóр",
      "translation": "я остановлю(сь)"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּעֲצֹר",
      "transcription": "таацóр",
      "translation": "ты остановишь(ся) / она остановит(ся)"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּעַצְרִי",
      "transcription": "таацрӣ",
      "translation": "ты остановишь(ся) (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַעֲצֹר",
      "transcription": "яацóр",
      "translation": "он остановит(ся)"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַעֲצֹר",
      "transcription": "наацóр",
      "translation": "мы остановим(ся)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּעַצְרוּ",
      "transcription": "таацрӯ",
      "translation": "вы остановите(сь)"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַעַצְרוּ",
      "transcription": "яацрӯ",
      "translation": "они остановят(ся)"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "עֲצֹר",
      "transcription": "ацóр",
      "translation": "остановись / стой (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "עִצְרִי",
      "transcription": "ицрӣ",
      "translation": "остановись / стой (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "עִצְרוּ",
      "transcription": "ицрӯ",
      "translation": "остановитесь / стойте"
    }
  ]
},
  'להתראות': {
  "infinitive": {
    "hebrew": "לְהִתְרָאוֹת",
    "transcription": "леhитра’óт",
    "translation": "увидеться (до свидания)"
  },
  "binyan": "הִתְפַּעֵל (Итпаэль)",
  "root": "ר-א-ה",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "מִתְרָאֶה",
      "transcription": "митра’é",
      "translation": "видится / вижусь (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "מִתְרָאָה",
      "transcription": "митра’á",
      "translation": "видится / вижусь (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "מִתְרָאִים",
      "transcription": "митра’ӣм",
      "translation": "видятся / видимся (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "מִתְרָאוֹת",
      "transcription": "митра’óт",
      "translation": "видятся / видимся (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "הִתְרָאֵיתִי",
      "transcription": "hитра’éйти",
      "translation": "я увиделся / увиделась"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "הִתְרָאֵיתָ",
      "transcription": "hитра’éйта",
      "translation": "ты увиделся"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "הִתְרָאֵית",
      "transcription": "hитра’éйт",
      "translation": "ты увиделась"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "הִתְרָאָה",
      "transcription": "hитра’á",
      "translation": "он увиделся"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "הִתְרָאֲתָה",
      "transcription": "hитра’атá",
      "translation": "она увиделась"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "הִתְרָאֵינוּ",
      "transcription": "hитра’éйну",
      "translation": "мы увиделись"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "הִתְרָאֵיתֶם / הִתְרָאֵיתֶן",
      "transcription": "hитра’ейтéм / hитра’ейтéн",
      "translation": "вы увиделись"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "הִתְרָאוּ",
      "transcription": "hитра’ӯ",
      "translation": "они увиделись"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶתְרָאֶה",
      "transcription": "этра’é",
      "translation": "я увижусь"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תִּתְרָאֶה",
      "transcription": "титра’é",
      "translation": "ты увидишься / она увидится"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תִּתְרָאִי",
      "transcription": "титра’ӣ",
      "translation": "ты увидишься (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יִתְרָאֶה",
      "transcription": "йитра’é",
      "translation": "он увидится"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נִתְרָאֶה",
      "transcription": "нитра’é",
      "translation": "мы увидимся (до встречи!)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תִּתְרָאוּ",
      "transcription": "титра’ӯ",
      "translation": "вы увидитесь"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יִתְרָאוּ",
      "transcription": "йитра’ӯ",
      "translation": "они увидятся"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "הִתְרָאֵה",
      "transcription": "hитра’é",
      "translation": "увидься (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "הִתְרָאִי",
      "transcription": "hитра’ӣ",
      "translation": "увидься (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "הִתְרָאוּ",
      "transcription": "hитра’ӯ",
      "translation": "увидьтесь"
    }
  ]
},
  'לחתום': {
  "infinitive": {
    "hebrew": "לַחְתֹּם",
    "transcription": "лахтóм",
    "translation": "подписывать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ח-ת-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "חוֹתֵם",
      "transcription": "хотéм",
      "translation": "подписывает / подписываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "חוֹתֶמֶת",
      "transcription": "хотéмет",
      "translation": "подписывает / подписываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "חוֹתְמִים",
      "transcription": "хотмӣм",
      "translation": "подписывают / подписываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "חוֹתְמוֹת",
      "transcription": "хотмóт",
      "translation": "подписывают / подписываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "חָתַמְתִּי",
      "transcription": "хатáмти",
      "translation": "я подписал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "חָתַמְתָּ",
      "transcription": "хатáмта",
      "translation": "ты подписал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "חָתַמְתְּ",
      "transcription": "хатáмт",
      "translation": "ты подписала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "חָתַם",
      "transcription": "хатáм",
      "translation": "он подписал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "חָתְמָה",
      "transcription": "хатмá",
      "translation": "она подписала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "חָתַמְנוּ",
      "transcription": "хатáмну",
      "translation": "мы подписали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "חֲתַמְתֶּם / חֲתַמְתֶּן",
      "transcription": "хатамтéм / хатамтéн",
      "translation": "вы подписали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "חָתְמוּ",
      "transcription": "хатмӯ",
      "translation": "они подписали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶחְתֹּם",
      "transcription": "эхтóм",
      "translation": "я подпишу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּחְתֹּם",
      "transcription": "тахтóм",
      "translation": "ты подпишешь / она подпишет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּחְתְּמִי",
      "transcription": "тахтемӣ",
      "translation": "ты подпишешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַחְתֹּם",
      "transcription": "яхтóм",
      "translation": "он подпишет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַחְתֹּם",
      "transcription": "нахтóм",
      "translation": "мы подпишем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּחְתְּמוּ",
      "transcription": "тахтемӯ",
      "translation": "вы подпишете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַחְתְּמוּ",
      "transcription": "яхтемӯ",
      "translation": "они подпишут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "חֲתֹם",
      "transcription": "хатóм",
      "translation": "подпиши (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "חִתְמִי",
      "transcription": "хитмӣ",
      "translation": "подпиши (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "חִתְמוּ",
      "transcription": "хитмӯ",
      "translation": "подпишите"
    }
  ]
},
  'לחתם': {
  "infinitive": {
    "hebrew": "לַחְתֹּם",
    "transcription": "лахтóм",
    "translation": "подписывать"
  },
  "binyan": "פָּעַל (Пааль)",
  "root": "ח-ת-ם",
  "present": [
    {
      "pronoun": "זָכָר יָחִיד (он / я / ты)",
      "hebrew": "חוֹתֵם",
      "transcription": "хотéм",
      "translation": "подписывает / подписываю (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה יְחִידָה (она / я / ты)",
      "hebrew": "חוֹתֶמֶת",
      "transcription": "хотéмет",
      "translation": "подписывает / подписываю (ж.р.)"
    },
    {
      "pronoun": "זָכָר רַבִּים (они / мы / вы)",
      "hebrew": "חוֹתְמִים",
      "transcription": "хотмӣм",
      "translation": "подписывают / подписываем (м.р.)"
    },
    {
      "pronoun": "נְקֵבָה רַבּוֹת (они / мы / вы)",
      "hebrew": "חוֹתְמוֹת",
      "transcription": "хотмóт",
      "translation": "подписывают / подписываем (ж.р.)"
    }
  ],
  "past": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "חָתַמְתִּי",
      "transcription": "хатáмти",
      "translation": "я подписал(а)"
    },
    {
      "pronoun": "אַתָּה (ты м.р.)",
      "hebrew": "חָתַמְתָּ",
      "transcription": "хатáмта",
      "translation": "ты подписал"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "חָתַמְתְּ",
      "transcription": "хатáмт",
      "translation": "ты подписала"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "חָתַם",
      "transcription": "хатáм",
      "translation": "он подписал"
    },
    {
      "pronoun": "הִיא (она)",
      "hebrew": "חָתְמָה",
      "transcription": "хатмá",
      "translation": "она подписала"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "חָתַמְנוּ",
      "transcription": "хатáмну",
      "translation": "мы подписали"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "חֲתַמְתֶּם / חֲתַמְתֶּן",
      "transcription": "хатамтéм / хатамтéн",
      "translation": "вы подписали"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "חָתְמוּ",
      "transcription": "хатмӯ",
      "translation": "они подписали"
    }
  ],
  "future": [
    {
      "pronoun": "אֲנִי (я)",
      "hebrew": "אֶחְתֹּם",
      "transcription": "эхтóм",
      "translation": "я подпишу"
    },
    {
      "pronoun": "אַתָּה / הִיא (ты м.р. / она)",
      "hebrew": "תַּחְתֹּם",
      "transcription": "тахтóм",
      "translation": "ты подпишешь / она подпишет"
    },
    {
      "pronoun": "אַתְּ (ты ж.р.)",
      "hebrew": "תַּחְתְּמִי",
      "transcription": "тахтемӣ",
      "translation": "ты подпишешь (ж.р.)"
    },
    {
      "pronoun": "הוּא (он)",
      "hebrew": "יַחְתֹּם",
      "transcription": "яхтóм",
      "translation": "он подпишет"
    },
    {
      "pronoun": "אֲנַחְנוּ (мы)",
      "hebrew": "נַחְתֹּם",
      "transcription": "нахтóм",
      "translation": "мы подпишем"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (вы)",
      "hebrew": "תַּחְתְּמוּ",
      "transcription": "тахтемӯ",
      "translation": "вы подпишете"
    },
    {
      "pronoun": "הֵם / הֵן (они)",
      "hebrew": "יַחְתְּמוּ",
      "transcription": "яхтемӯ",
      "translation": "они подпишут"
    }
  ],
  "imperative": [
    {
      "pronoun": "אַתָּה (м.р.)",
      "hebrew": "חֲתֹם",
      "transcription": "хатóм",
      "translation": "подпиши (м.р.)"
    },
    {
      "pronoun": "אַתְּ (ж.р.)",
      "hebrew": "חִתְמִי",
      "transcription": "хитмӣ",
      "translation": "подпиши (ж.р.)"
    },
    {
      "pronoun": "אַתֶּם / אַתֶּן (мн.ч.)",
      "hebrew": "חִתְמוּ",
      "transcription": "хитмӯ",
      "translation": "подпишите"
    }
  ]
},

// ==========================================
// ГЛАГОЛЫ ПРОФЕССИИ МЕТАПЕЛЕТ (מטפלת)
// ==========================================

'לטפל': {
  infinitive: {
    hebrew: 'לְטַפֵּל',
    transcription: 'летапéль',
    translation: 'ухаживать, лечить',
  },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ט-פ-ל',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְטַפֵּל', transcription: 'метапéль', translation: 'ухаживает / ухаживаю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְטַפֶּלֶת', transcription: 'метапéлет', translation: 'ухаживает / ухаживаю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְטַפְּלִים', transcription: 'метапелӣм', translation: 'ухаживают / ухаживаем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְטַפְּלוֹת', transcription: 'метапелóт', translation: 'ухаживают / ухаживаем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'טִפַּלְתִּי', transcription: 'типáлти', translation: 'я ухаживал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'טִפַּלְתָּ', transcription: 'типáлта', translation: 'ты ухаживал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'טִפַּלְתְּ', transcription: 'типáлт', translation: 'ты ухаживала' },
    { pronoun: 'הוּא (он)', hebrew: 'טִפֵּל', transcription: 'типéль', translation: 'он ухаживал' },
    { pronoun: 'הִיא (она)', hebrew: 'טִפְּלָה', transcription: 'типлá', translation: 'она ухаживала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'טִפַּלְנוּ', transcription: 'типáлну', translation: 'мы ухаживали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'טִפַּלְתֶּם / טִפַּלְתֶּן', transcription: 'типалтéм / типалтéн', translation: 'вы ухаживали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'טִפְּלוּ', transcription: 'типлу́', translation: 'они ухаживали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲטַפֵּל', transcription: 'атапéль', translation: 'я буду ухаживать' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּטַפֵּל', transcription: 'тетапéль', translation: 'ты будешь ухаживать / она будет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּטַפְּלִי', transcription: 'тетапелī', translation: 'ты будешь ухаживать (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְטַפֵּל', transcription: 'йетапéль', translation: 'он будет ухаживать' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְטַפֵּל', transcription: 'нетапéль', translation: 'мы будем ухаживать' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּטַפְּלוּ', transcription: 'тетапелу́', translation: 'вы будете ухаживать' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְטַפְּלוּ', transcription: 'йетапелу́', translation: 'они будут ухаживать' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'טַפֵּל', transcription: 'тапéль', translation: 'ухаживай (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'טַפְּלִי', transcription: 'тапелī', translation: 'ухаживай (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'טַפְּלוּ', transcription: 'тапелу́', translation: 'ухаживайте' },
  ],
  rootFamily: [
    { hebrew: 'מְטַפֵּל', hebrewPlain: 'מטפל', transcription: 'метапéль', translation: 'сиделка, ухаживающий (м.р.)', partOfSpeech: 'noun', root: 'ט-פ-ל' },
    { hebrew: 'מְטַפֶּלֶת', hebrewPlain: 'מטפלת', transcription: 'метапéлет', translation: 'сиделка, ухаживающая (ж.р.)', partOfSpeech: 'noun', root: 'ט-פ-ל' },
    { hebrew: 'טִיפּוּל', hebrewPlain: 'טיפול', transcription: 'типу́ль', translation: 'уход, лечение, терапия', partOfSpeech: 'noun', root: 'ט-פ-ל' },
    { hebrew: 'טִפּוּל', hebrewPlain: 'טיפול', transcription: 'типу́ль', translation: 'уход (мед.)', partOfSpeech: 'noun', root: 'ט-פ-ל' },
    { hebrew: 'בִּיטּוּל', hebrewPlain: 'ביטול', transcription: 'битуль', translation: 'отмена, аннулирование', partOfSpeech: 'noun', root: 'ב-ט-ל' },
  ],
},

'לרחץ': {
  infinitive: {
    hebrew: 'לְרַחֵץ',
    transcription: 'лерахéц',
    translation: 'мыть, купать',
  },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ר-ח-ץ',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְרַחֵץ', transcription: 'мерахéц', translation: 'моет / мою (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְרַחֶצֶת', transcription: 'мерахéцет', translation: 'моет / мою (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְרַחֲצִים', transcription: 'мерахацȋм', translation: 'моют / моем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְרַחֲצוֹת', transcription: 'мерахацóт', translation: 'моют / моем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'רִחַצְתִּי', transcription: 'рихáцти', translation: 'я мыл(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'רִחַצְתָּ', transcription: 'рихáцта', translation: 'ты мыл' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'רִחַצְתְּ', transcription: 'рихáцт', translation: 'ты мыла' },
    { pronoun: 'הוּא (он)', hebrew: 'רִחֵץ', transcription: 'рихéц', translation: 'он мыл' },
    { pronoun: 'הִיא (она)', hebrew: 'רִחֲצָה', transcription: 'рихацá', translation: 'она мыла' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'רִחַצְנוּ', transcription: 'рихáцну', translation: 'мы мыли' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'רִחַצְתֶּם / רִחַצְתֶּן', transcription: 'рихацтéм / рихацтéн', translation: 'вы мыли' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'רִחֲצוּ', transcription: 'рихацу́', translation: 'они мыли' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲרַחֵץ', transcription: 'арахéц', translation: 'я буду мыть' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּרַחֵץ', transcription: 'терахéц', translation: 'ты будешь мыть / она будет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּרַחֲצִי', transcription: 'терахацī', translation: 'ты будешь мыть (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְרַחֵץ', transcription: 'йерахéц', translation: 'он будет мыть' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְרַחֵץ', transcription: 'нерахéц', translation: 'мы будем мыть' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּרַחֲצוּ', transcription: 'терахацу́', translation: 'вы будете мыть' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְרַחֲצוּ', transcription: 'йерахацу́', translation: 'они будут мыть' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'רַחֵץ', transcription: 'рахéц', translation: 'мой (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'רַחֲצִי', transcription: 'рахацī', translation: 'мой (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'רַחֲצוּ', transcription: 'рахацу́', translation: 'мойте' },
  ],
  rootFamily: [
    { hebrew: 'רַחְצָה', hebrewPlain: 'רחצה', transcription: 'рахцá', translation: 'купание, мытьё (ж.р.)', partOfSpeech: 'noun', root: 'ר-ח-ץ' },
    { hebrew: 'רְחִיצָה', hebrewPlain: 'רחיצה', transcription: 'рехицá', translation: 'мытьё (ж.р.)', partOfSpeech: 'noun', root: 'ר-ח-ץ' },
    { hebrew: 'מִקְוֶה', hebrewPlain: 'מקווה', transcription: 'миквé', translation: 'бассейн, купальня', partOfSpeech: 'noun', root: 'ר-ח-ץ' },
    { hebrew: 'רָחוּץ', hebrewPlain: 'רחוץ', transcription: 'рахуц', translation: 'вымытый, чистый', partOfSpeech: 'adjective', root: 'ר-ח-ץ' },
  ],
},

'להלביש': {
  infinitive: {
    hebrew: 'לְהַלְבִּישׁ',
    transcription: 'лехальбíш',
    translation: 'одевать (кого-то)',
  },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'ל-ב-ש',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַלְבִּישׁ', transcription: 'мальбíш', translation: 'одевает / одеваю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַלְבִּישָׁה', transcription: 'мальбишá', translation: 'одевает / одеваю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַלְבִּישִׁים', transcription: 'мальбишȋм', translation: 'одевают / одеваем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַלְבִּישׁוֹת', transcription: 'мальбишóт', translation: 'одевают / одеваем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הִלְבַּשְׁתִּי', transcription: 'хильбáшти', translation: 'я одевал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִלְבַּשְׁתָּ', transcription: 'хильбáшта', translation: 'ты одевал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִלְבַּשְׁתְּ', transcription: 'хильбáшт', translation: 'ты одевала' },
    { pronoun: 'הוּא (он)', hebrew: 'הִלְבִּישׁ', transcription: 'хильбíш', translation: 'он одевал' },
    { pronoun: 'הִיא (она)', hebrew: 'הִלְבִּישָׁה', transcription: 'хильбишá', translation: 'она одевала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִלְבַּשְׁנוּ', transcription: 'хильбáшну', translation: 'мы одевали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִלְבַּשְׁתֶּם / הִלְבַּשְׁתֶּן', transcription: 'хильбаштéм / хильбаштéн', translation: 'вы одевали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִלְבִּישׁוּ', transcription: 'хильбишу́', translation: 'они одевали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַלְבִּישׁ', transcription: 'альбíш', translation: 'я буду одевать' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּלְבִּישׁ', transcription: 'тальбíш', translation: 'ты будешь одевать / она будет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּלְבִּישִׁי', transcription: 'тальбишī', translation: 'ты будешь одевать (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַלְבִּישׁ', transcription: 'йальбíш', translation: 'он будет одевать' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַלְבִּישׁ', transcription: 'нальбíш', translation: 'мы будем одевать' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּלְבִּישׁוּ', transcription: 'тальбишу́', translation: 'вы будете одевать' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַלְבִּישׁוּ', transcription: 'йальбишу́', translation: 'они будут одевать' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַלְבֵּשׁ', transcription: 'хальбéш', translation: 'одевай (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַלְבִּישִׁי', transcription: 'хальбишī', translation: 'одевай (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַלְבִּישׁוּ', transcription: 'хальбишу́', translation: 'одевайте' },
  ],
  rootFamily: [
    { hebrew: 'לִלְבֹּשׁ', hebrewPlain: 'ללבוש', transcription: 'лильбóш', translation: 'носить, надевать (на себя)', partOfSpeech: 'verb', binyan: 'פָּעַל', root: 'ל-ב-ש' },
    { hebrew: 'לְהִתְלַבֵּשׁ', hebrewPlain: 'להתלבש', transcription: 'летитлабéш', translation: 'одеваться (самому)', partOfSpeech: 'verb', binyan: 'הִתְפַּעֵל', root: 'ל-ב-ש' },
    { hebrew: 'בֶּגֶד', hebrewPlain: 'בגד', transcription: 'бéгед', translation: 'одежда, вещь', partOfSpeech: 'noun', root: 'ל-ב-ש' },
    { hebrew: 'לָבוּשׁ', hebrewPlain: 'לבוש', transcription: 'лавуш', translation: 'одетый (прилаг.)', partOfSpeech: 'adjective', root: 'ל-ב-ש' },
  ],
},

'להאכיל': {
  infinitive: {
    hebrew: 'לְהַאֲכִיל',
    transcription: 'лехаахиль',
    translation: 'кормить (кого-то)',
  },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'א-כ-ל',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַאֲכִיל', transcription: 'маахиль', translation: 'кормит / кормлю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַאֲכִילָה', transcription: 'маахилá', translation: 'кормит / кормлю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַאֲכִילִים', transcription: 'маахилȋм', translation: 'кормят / кормим (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַאֲכִילוֹת', transcription: 'маахилóт', translation: 'кормят / кормим (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הֶאֱכַלְתִּי', transcription: 'хеэхáлти', translation: 'я кормил(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הֶאֱכַלְתָּ', transcription: 'хеэхáлта', translation: 'ты кормил' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הֶאֱכַלְתְּ', transcription: 'хеэхáлт', translation: 'ты кормила' },
    { pronoun: 'הוּא (он)', hebrew: 'הֶאֱכִיל', transcription: 'хеэхиль', translation: 'он кормил' },
    { pronoun: 'הִיא (она)', hebrew: 'הֶאֱכִילָה', transcription: 'хеэхилá', translation: 'она кормила' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הֶאֱכַלְנוּ', transcription: 'хеэхáлну', translation: 'мы кормили' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הֶאֱכַלְתֶּם / הֶאֱכַלְתֶּן', transcription: 'хеэхалтéм / хеэхалтéн', translation: 'вы кормили' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הֶאֱכִילוּ', transcription: 'хеэхилу́', translation: 'они кормили' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַאֲכִיל', transcription: 'ааxиль', translation: 'я буду кормить' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּאֲכִיל', transcription: 'таaхиль', translation: 'ты будешь кормить / она будет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּאֲכִילִי', transcription: 'таaхилī', translation: 'ты будешь кормить (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַאֲכִיל', transcription: 'йааxиль', translation: 'он будет кормить' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַאֲכִיל', transcription: 'нааxиль', translation: 'мы будем кормить' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּאֲכִילוּ', transcription: 'тааxилу́', translation: 'вы будете кормить' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַאֲכִילוּ', transcription: 'йааxилу́', translation: 'они будут кормить' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַאֲכֵל', transcription: 'хаахéль', translation: 'корми (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַאֲכִילִי', transcription: 'хаaхилī', translation: 'корми (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַאֲכִילוּ', transcription: 'хаaхилу́', translation: 'кормите' },
  ],
  rootFamily: [
    { hebrew: 'לֶאֱכֹל', hebrewPlain: 'לאכול', transcription: 'леэхóль', translation: 'есть, кушать', partOfSpeech: 'verb', binyan: 'פָּעַל', root: 'א-כ-ל' },
    { hebrew: 'אֹכֶל', hebrewPlain: 'אוכל', transcription: 'óхель', translation: 'еда', partOfSpeech: 'noun', root: 'א-כ-ל' },
    { hebrew: 'אֲכִילָה', hebrewPlain: 'אכילה', transcription: 'ахилá', translation: 'приём пищи', partOfSpeech: 'noun', root: 'א-כ-ל' },
    { hebrew: 'מַאֲכָל', hebrewPlain: 'מאכל', transcription: 'маaхáль', translation: 'блюдо, еда', partOfSpeech: 'noun', root: 'א-כ-ל' },
  ],
},

'להשכיב': {
  infinitive: {
    hebrew: 'לְהַשְׁכִּיב',
    transcription: 'лехашкíв',
    translation: 'укладывать (спать)',
  },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'ש-כ-ב',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַשְׁכִּיב', transcription: 'машкíв', translation: 'укладывает / укладываю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַשְׁכִּיבָה', transcription: 'машкивá', translation: 'укладывает / укладываю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַשְׁכִּיבִים', transcription: 'машкивȋм', translation: 'укладывают / укладываем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַשְׁכִּיבוֹת', transcription: 'машкивóт', translation: 'укладывают / укладываем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הִשְׁכַּבְתִּי', transcription: 'хишкáвти', translation: 'я укладывал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִשְׁכַּבְתָּ', transcription: 'хишкáвта', translation: 'ты укладывал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִשְׁכַּבְתְּ', transcription: 'хишкáвт', translation: 'ты укладывала' },
    { pronoun: 'הוּא (он)', hebrew: 'הִשְׁכִּיב', transcription: 'хишкíв', translation: 'он укладывал' },
    { pronoun: 'הִיא (она)', hebrew: 'הִשְׁכִּיבָה', transcription: 'хишкивá', translation: 'она укладывала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִשְׁכַּבְנוּ', transcription: 'хишкáвну', translation: 'мы укладывали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִשְׁכַּבְתֶּם / הִשְׁכַּבְתֶּן', transcription: 'хишкавтéм / хишкавтéн', translation: 'вы укладывали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִשְׁכִּיבוּ', transcription: 'хишкиву́', translation: 'они укладывали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַשְׁכִּיב', transcription: 'ашкíв', translation: 'я буду укладывать' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּשְׁכִּיב', transcription: 'ташкíв', translation: 'ты будешь укладывать / она будет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּשְׁכִּיבִי', transcription: 'ташкивī', translation: 'ты будешь укладывать (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַשְׁכִּיב', transcription: 'йашкíв', translation: 'он будет укладывать' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַשְׁכִּיב', transcription: 'нашкíв', translation: 'мы будем укладывать' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּשְׁכִּיבוּ', transcription: 'ташкиву́', translation: 'вы будете укладывать' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַשְׁכִּיבוּ', transcription: 'йашкиву́', translation: 'они будут укладывать' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַשְׁכֵּב', transcription: 'хашкéв', translation: 'уложи (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַשְׁכִּיבִי', transcription: 'хашкивī', translation: 'уложи (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַשְׁכִּיבוּ', transcription: 'хашкиву́', translation: 'уложите' },
  ],
  rootFamily: [
    { hebrew: 'לִשְׁכַּב', hebrewPlain: 'לשכב', transcription: 'лишкáв', translation: 'лежать', partOfSpeech: 'verb', binyan: 'פָּעַל', root: 'ש-כ-ב' },
    { hebrew: 'שְׁכִיבָה', hebrewPlain: 'שכיבה', transcription: 'шхивá', translation: 'лёжа, лежание', partOfSpeech: 'noun', root: 'ש-כ-ב' },
    { hebrew: 'מִיטָה', hebrewPlain: 'מיטה', transcription: 'митá', translation: 'кровать', partOfSpeech: 'noun', root: 'ש-כ-ב' },
    { hebrew: 'לְהֵרָדֵם', hebrewPlain: 'להירדם', transcription: 'лехерадéм', translation: 'засыпать', partOfSpeech: 'verb', binyan: 'נִפְעַל', root: 'ר-ד-ם' },
  ],
},

'לסייע': {
  infinitive: {
    hebrew: 'לְסַיֵּעַ',
    transcription: 'лесайéа',
    translation: 'помогать, оказывать содействие',
  },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ס-י-ע',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְסַיֵּעַ', transcription: 'месайéа', translation: 'помогает / помогаю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְסַיַּעַת', transcription: 'месайáат', translation: 'помогает / помогаю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְסַיְּעִים', transcription: 'месайеȋм', translation: 'помогают / помогаем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְסַיְּעוֹת', transcription: 'месайеóт', translation: 'помогают / помогаем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'סִיַּעְתִּי', transcription: 'сийáти', translation: 'я помогал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'סִיַּעְתָּ', transcription: 'сийáта', translation: 'ты помогал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'סִיַּעְתְּ', transcription: 'сийáт', translation: 'ты помогала' },
    { pronoun: 'הוּא (он)', hebrew: 'סִיֵּעַ', transcription: 'сийéа', translation: 'он помогал' },
    { pronoun: 'הִיא (она)', hebrew: 'סִיְּעָה', transcription: 'сийеá', translation: 'она помогала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'סִיַּעְנוּ', transcription: 'сийáну', translation: 'мы помогали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'סִיַּעְתֶּם / סִיַּעְתֶּן', transcription: 'сийатéм / сийатéн', translation: 'вы помогали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'סִיְּעוּ', transcription: 'сийеу́', translation: 'они помогали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲסַיֵּעַ', transcription: 'асайéа', translation: 'я буду помогать' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּסַיֵּעַ', transcription: 'тесайéа', translation: 'ты будешь помогать / она будет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּסַיְּעִי', transcription: 'тесайеī', translation: 'ты будешь помогать (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְסַיֵּעַ', transcription: 'йесайéа', translation: 'он будет помогать' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְסַיֵּעַ', transcription: 'несайéа', translation: 'мы будем помогать' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּסַיְּעוּ', transcription: 'тесайеу́', translation: 'вы будете помогать' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְסַיְּעוּ', transcription: 'йесайеу́', translation: 'они будут помогать' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'סַיֵּעַ', transcription: 'сайéа', translation: 'помогай (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'סַיְּעִי', transcription: 'сайеī', translation: 'помогай (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'סַיְּעוּ', transcription: 'сайеу́', translation: 'помогайте' },
  ],
  rootFamily: [
    { hebrew: 'סִיּוּעַ', hebrewPlain: 'סיוע', transcription: 'сийуа', translation: 'помощь, содействие', partOfSpeech: 'noun', root: 'ס-י-ע' },
    { hebrew: 'עֶזְרָה', hebrewPlain: 'עזרה', transcription: 'эзрá', translation: 'помощь', partOfSpeech: 'noun', root: 'ע-ז-ר' },
    { hebrew: 'לַעֲזֹר', hebrewPlain: 'לעזור', transcription: 'лаазóр', translation: 'помогать (Пааль)', partOfSpeech: 'verb', binyan: 'פָּעַל', root: 'ע-ז-ר' },
    { hebrew: 'עוֹזֵר / עוֹזֶרֶת', hebrewPlain: 'עוזר / עוזרת', transcription: 'озéр / озéрет', translation: 'помощник / помощница', partOfSpeech: 'noun', root: 'ע-ז-ר' },
  ],
},

'למדוד': {
  infinitive: {
    hebrew: 'לִמְדֹּד',
    transcription: 'лимдóд',
    translation: 'измерять',
  },
  binyan: 'פָּעַל (Пааль)',
  root: 'מ-ד-ד',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מוֹדֵד', transcription: 'модéд', translation: 'измеряет / измеряю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מוֹדֶדֶת', transcription: 'модéдет', translation: 'измеряет / измеряю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מוֹדְדִים', transcription: 'модедȋм', translation: 'измеряют / измеряем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מוֹדְדוֹת', transcription: 'модедóт', translation: 'измеряют / измеряем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'מָדַדְתִּי', transcription: 'мадáдти', translation: 'я измерял(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'מָדַדְתָּ', transcription: 'мадáдта', translation: 'ты измерял' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'מָדַדְתְּ', transcription: 'мадáдт', translation: 'ты измеряла' },
    { pronoun: 'הוּא (он)', hebrew: 'מָדַד', transcription: 'мадáд', translation: 'он измерял' },
    { pronoun: 'הִיא (она)', hebrew: 'מָדְדָה', transcription: 'мадедá', translation: 'она измеряла' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'מָדַדְנוּ', transcription: 'мадáдну', translation: 'мы измеряли' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'מְדַדְתֶּם / מְדַדְתֶּן', transcription: 'мдадтéм / мдадтéн', translation: 'вы измеряли' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'מָדְדוּ', transcription: 'мадеду́', translation: 'они измеряли' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אָמֹד', transcription: 'амóд', translation: 'я буду измерять' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תָּמֹד', transcription: 'тамóд', translation: 'ты будешь измерять / она будет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תָּמֹדִי', transcription: 'тамодī', translation: 'ты будешь измерять (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יָמֹד', transcription: 'йамóд', translation: 'он будет измерять' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נָמֹד', transcription: 'намóд', translation: 'мы будем измерять' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תָּמֹדּוּ', transcription: 'тамóду', translation: 'вы будете измерять' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יָמֹדּוּ', transcription: 'йамóду', translation: 'они будут измерять' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'מְדֹד', transcription: 'мдóд', translation: 'измерь (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'מִדְדִי', transcription: 'миддī', translation: 'измерь (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'מִדְדוּ', transcription: 'мидду́', translation: 'измерьте' },
  ],
  rootFamily: [
    { hebrew: 'מִידָה', hebrewPlain: 'מידה', transcription: 'мидá', translation: 'размер, мера', partOfSpeech: 'noun', root: 'מ-ד-ד' },
    { hebrew: 'מֶדֶד', hebrewPlain: 'מדד', transcription: 'мéдед', translation: 'измерение, индекс', partOfSpeech: 'noun', root: 'מ-ד-ד' },
    { hebrew: 'מַד', hebrewPlain: 'מד', transcription: 'мад', translation: 'датчик, прибор', partOfSpeech: 'noun', root: 'מ-ד-ד' },
    { hebrew: 'מַד-חוֹם', hebrewPlain: 'מד-חום', transcription: 'мад-хóм', translation: 'термометр', partOfSpeech: 'noun', root: 'מ-ד-ד' },
    { hebrew: 'מַד-לָחַץ', hebrewPlain: 'מד-לחץ', transcription: 'мад-лáхац', translation: 'тонометр (давление)', partOfSpeech: 'noun', root: 'מ-ד-ד' },
  ],
},

'לחמם': {
  infinitive: {
    hebrew: 'לְחַמֵּם',
    transcription: 'лехамéм',
    translation: 'разогревать, согревать',
  },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ח-מ-מ',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְחַמֵּם', transcription: 'мехамéм', translation: 'разогревает / разогреваю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְחַמֶּמֶת', transcription: 'мехамéмет', translation: 'разогревает / разогреваю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְחַמְּמִים', transcription: 'мехамемȋм', translation: 'разогревают / разогреваем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְחַמְּמוֹת', transcription: 'мехамемóт', translation: 'разогревают / разогреваем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'חִמַּמְתִּי', transcription: 'химáмти', translation: 'я разогревал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'חִמַּמְתָּ', transcription: 'химáмта', translation: 'ты разогревал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'חִמַּמְתְּ', transcription: 'химáмт', translation: 'ты разогревала' },
    { pronoun: 'הוּא (он)', hebrew: 'חִמֵּם', transcription: 'химéм', translation: 'он разогревал' },
    { pronoun: 'הִיא (она)', hebrew: 'חִמְּמָה', transcription: 'химемá', translation: 'она разогревала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'חִמַּמְנוּ', transcription: 'химáмну', translation: 'мы разогревали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'חִמַּמְתֶּם / חִמַּמְתֶּן', transcription: 'химамтéм / химамтéн', translation: 'вы разогревали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'חִמְּמוּ', transcription: 'химему́', translation: 'они разогревали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲחַמֵּם', transcription: 'ахамéм', translation: 'я буду разогревать' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּחַמֵּם', transcription: 'техамéм', translation: 'ты будешь разогревать / она будет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּחַמְּמִי', transcription: 'техамемī', translation: 'ты будешь разогревать (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְחַמֵּם', transcription: 'йехамéм', translation: 'он будет разогревать' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְחַמֵּם', transcription: 'нехамéм', translation: 'мы будем разогревать' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּחַמְּמוּ', transcription: 'техамему́', translation: 'вы будете разогревать' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְחַמְּמוּ', transcription: 'йехамему́', translation: 'они будут разогревать' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'חַמֵּם', transcription: 'хамéм', translation: 'разогрей (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'חַמְּמִי', transcription: 'хамемī', translation: 'разогрей (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'חַמְּמוּ', transcription: 'хамему́', translation: 'разогрейте' },
  ],
  rootFamily: [
    { hebrew: 'חֹם', hebrewPlain: 'חום', transcription: 'хом', translation: 'тепло, жара, температура', partOfSpeech: 'noun', root: 'ח-מ-מ' },
    { hebrew: 'חַמִּים', hebrewPlain: 'חמים', transcription: 'хамȋм', translation: 'тёплый (мн.ч.)', partOfSpeech: 'adjective', root: 'ח-מ-מ' },
    { hebrew: 'חִמּוּם', hebrewPlain: 'חימום', transcription: 'химу́м', translation: 'нагрев, прогрев', partOfSpeech: 'noun', root: 'ח-מ-מ' },
    { hebrew: 'חַם', hebrewPlain: 'חם', transcription: 'хам', translation: 'горячий, тёплый', partOfSpeech: 'adjective', root: 'ח-מ-מ' },
    { hebrew: 'מִיקְרוֹגַל', hebrewPlain: 'מיקרוגל', transcription: 'микрогáль', translation: 'микроволновка', partOfSpeech: 'noun', root: 'ח-מ-מ' },
  ],
},

'לשטוף': {
  infinitive: {
    hebrew: 'לִשְׁטֹף',
    transcription: 'лиштóф',
    translation: 'мыть, полоскать',
  },
  binyan: 'פָּעַל (Пааль)',
  root: 'ש-ט-ף',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'שׁוֹטֵף', transcription: 'шотéф', translation: 'моет / мою (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'שׁוֹטֶפֶת', transcription: 'шотéфет', translation: 'моет / мою (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'שׁוֹטְפִים', transcription: 'шотефȋм', translation: 'моют / моем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'שׁוֹטְפוֹת', transcription: 'шотефóт', translation: 'моют / моем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'שָׁטַפְתִּי', transcription: 'шатáфти', translation: 'я мыл(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'שָׁטַפְתָּ', transcription: 'шатáфта', translation: 'ты мыл' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'שָׁטַפְתְּ', transcription: 'шатáфт', translation: 'ты мыла' },
    { pronoun: 'הוּא (он)', hebrew: 'שָׁטַף', transcription: 'шатáф', translation: 'он мыл' },
    { pronoun: 'הִיא (она)', hebrew: 'שָׁטְפָה', transcription: 'шатефá', translation: 'она мыла' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'שָׁטַפְנוּ', transcription: 'шатáфну', translation: 'мы мыли' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'שְׁטַפְתֶּם / שְׁטַפְתֶּן', transcription: 'штафтéм / штафтéн', translation: 'вы мыли' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'שָׁטְפוּ', transcription: 'шатефу́', translation: 'они мыли' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֶשְׁטֹף', transcription: 'эштóф', translation: 'я буду мыть' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּשְׁטֹף', transcription: 'тиштóф', translation: 'ты будешь мыть / она будет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּשְׁטְפִי', transcription: 'тиштефī', translation: 'ты будешь мыть (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יִשְׁטֹף', transcription: 'йиштóф', translation: 'он будет мыть' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִשְׁטֹף', transcription: 'ништóф', translation: 'мы будем мыть' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּשְׁטְפוּ', transcription: 'тиштефу́', translation: 'вы будете мыть' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִשְׁטְפוּ', transcription: 'йиштефу́', translation: 'они будут мыть' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'שְׁטֹף', transcription: 'штоф', translation: 'вымой (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'שִׁטְפִי', transcription: 'шитфī', translation: 'вымой (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'שִׁטְפוּ', transcription: 'шитфу́', translation: 'вымойте' },
  ],
  rootFamily: [
    { hebrew: 'שְׁטִיפָה', hebrewPlain: 'שטיפה', transcription: 'штифá', translation: 'мытьё, полоскание', partOfSpeech: 'noun', root: 'ש-ט-ף' },
    { hebrew: 'שֶׁטֶף', hebrewPlain: 'שטף', transcription: 'шéтеф', translation: 'поток, напор', partOfSpeech: 'noun', root: 'ש-ט-ף' },
    { hebrew: 'שׁוֹטֵף', hebrewPlain: 'שוטף', transcription: 'шотéф', translation: 'постоянный, текущий', partOfSpeech: 'adjective', root: 'ש-ט-ף' },
    { hebrew: 'מְכוֹנַת כְּבִיסָה', hebrewPlain: 'מכונת כביסה', transcription: 'мехонат квисá', translation: 'стиральная машина', partOfSpeech: 'noun', root: 'כ-ב-ס' },
  ],
},

// ==========================================
// ГЛАГОЛЫ: АВТОМАСТЕРСКАЯ И ТЕХОБСЛУЖИВАНИЕ (מוסך)
// ==========================================

'לפרק': {
  infinitive: { hebrew: 'לְפָרֵק', transcription: 'лефарéк', translation: 'разбирать, демонтировать, снимать' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'פ-ר-ק',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְפָרֵק', transcription: 'мефарéк', translation: 'разбирает / разбираю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְפָרֶקֶת', transcription: 'мефарéкет', translation: 'разбирает / разбираю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְפָרְקִים', transcription: 'мефаркӣм', translation: 'разбирают / разбираем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְפָרְקוֹת', transcription: 'мефаркóт', translation: 'разбирают / разбираем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'פֵּרַקְתִּי', transcription: 'перáкти', translation: 'я разбирал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'פֵּרַקְתָּ', transcription: 'перáкта', translation: 'ты разбирал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'פֵּרַקְתְּ', transcription: 'перáкт', translation: 'ты разбирала' },
    { pronoun: 'הוּא (он)', hebrew: 'פֵּרֵק', transcription: 'перéк', translation: 'он разбирал' },
    { pronoun: 'הִיא (она)', hebrew: 'פֵּרְקָה', transcription: 'перкá', translation: 'она разбирала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'פֵּרַקְנוּ', transcription: 'перáкну', translation: 'мы разбирали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'פֵּרַקְתֶּם / פֵּרַקְתֶּן', transcription: 'перактéм / перактéн', translation: 'вы разбирали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'פֵּרְקוּ', transcription: 'перкӯ', translation: 'они разбирали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲפָרֵק', transcription: 'афарéк', translation: 'я разберу' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּפָרֵק', transcription: 'тефарéк', translation: 'ты разберёшь / она разберёт' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּפָרְקִי', transcription: 'тефаркӣ', translation: 'ты разберёшь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְפָרֵק', transcription: 'йефарéк', translation: 'он разберёт' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְפָרֵק', transcription: 'нефарéк', translation: 'мы разберём' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּפָרְקוּ', transcription: 'тефаркӯ', translation: 'вы разберёте' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְפָרְקוּ', transcription: 'йефаркӯ', translation: 'они разберут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'פָּרֵק', transcription: 'парéк', translation: 'разбери (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'פָּרְקִי', transcription: 'паркӣ', translation: 'разбери (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'פָּרְקוּ', transcription: 'паркӯ', translation: 'разберите' },
  ],
  rootFamily: [
    { hebrew: 'פֵּרוּק', hebrewPlain: 'פירוק', transcription: 'перӯк', translation: 'разборка, демонтаж', partOfSpeech: 'noun', root: 'פ-ר-ק' },
    { hebrew: 'פֶּרֶק', hebrewPlain: 'פרק', transcription: 'пéрек', translation: 'часть, глава, сустав', partOfSpeech: 'noun', root: 'פ-ר-ק' },
    { hebrew: 'מְפֹרָק', hebrewPlain: 'מפורק', transcription: 'мефорáк', translation: 'разобранный, расчленённый', partOfSpeech: 'adjective', root: 'פ-ר-ק' },
    { hebrew: 'פְּרָקִים', hebrewPlain: 'פרקים', transcription: 'пракӣм', translation: 'сочленения, шарниры', partOfSpeech: 'noun', root: 'פ-ר-ק' },
  ],
},

'להרכיב': {
  infinitive: { hebrew: 'לְהַרְכִּיב', transcription: 'леhаркӣв', translation: 'собирать, устанавливать, монтировать' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'ר-כ-ב',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַרְכִּיב', transcription: 'маркӣв', translation: 'собирает / монтирую (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַרְכִּיבָה', transcription: 'маркивá', translation: 'собирает / монтирую (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַרְכִּיבִים', transcription: 'маркивӣм', translation: 'собирают / монтируем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַרְכִּיבוֹת', transcription: 'маркивóт', translation: 'собирают / монтируем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הִרְכַּבְתִּי', transcription: 'hиркáвти', translation: 'я собирал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִרְכַּבְתָּ', transcription: 'hиркáвта', translation: 'ты собирал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִרְכַּבְתְּ', transcription: 'hиркáвт', translation: 'ты собирала' },
    { pronoun: 'הוּא (он)', hebrew: 'הִרְכִּיב', transcription: 'hиркӣв', translation: 'он собирал' },
    { pronoun: 'הִיא (она)', hebrew: 'הִרְכִּיבָה', transcription: 'hиркивá', translation: 'она собирала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִרְכַּבְנוּ', transcription: 'hиркáвну', translation: 'мы собирали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִרְכַּבְתֶּם / הִרְכַּבְתֶּן', transcription: 'hиркавтéм / hиркавтéн', translation: 'вы собирали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִרְכִּיבוּ', transcription: 'hиркивӯ', translation: 'они собирали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַרְכִּיב', transcription: 'аркӣв', translation: 'я соберу' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּרְכִּיב', transcription: 'таркӣв', translation: 'ты соберёшь / она соберёт' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּרְכִּיבִי', transcription: 'таркивӣ', translation: 'ты соберёшь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַרְכִּיב', transcription: 'йаркӣв', translation: 'он соберёт' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַרְכִּיב', transcription: 'наркӣв', translation: 'мы соберём' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּרְכִּיבוּ', transcription: 'таркивӯ', translation: 'вы соберёте' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַרְכִּיבוּ', transcription: 'йаркивӯ', translation: 'они соберут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַרְכֵּב', transcription: 'hаркéв', translation: 'собери (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַרְכִּיבִי', transcription: 'hаркивӣ', translation: 'собери (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַרְכִּיבוּ', transcription: 'hаркивӯ', translation: 'соберите' },
  ],
  rootFamily: [
    { hebrew: 'הַרְכָּבָה', hebrewPlain: 'הרכבה', transcription: 'hаркавá', translation: 'сборка, монтаж', partOfSpeech: 'noun', root: 'ר-כ-ב' },
    { hebrew: 'מֻרְכָּב', hebrewPlain: 'מורכב', transcription: 'муркáв', translation: 'сложный, составной', partOfSpeech: 'adjective', root: 'ר-כ-ב' },
    { hebrew: 'מַרְכִּיב', hebrewPlain: 'מרכיב', transcription: 'маркӣв', translation: 'компонент, элемент', partOfSpeech: 'noun', root: 'ר-כ-ב' },
    { hebrew: 'רֶכֶב', hebrewPlain: 'רכב', transcription: 'рéхев', translation: 'автомобиль', partOfSpeech: 'noun', root: 'ר-כ-ב' },
  ],
},

'להחליף': {
  infinitive: { hebrew: 'לְהַחְלִיף', transcription: 'леhахлӣф', translation: 'менять, заменять' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'ח-ל-ף',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַחְלִיף', transcription: 'махлӣф', translation: 'меняет / меняю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַחְלִיפָה', transcription: 'махлифá', translation: 'меняет / меняю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַחְלִיפִים', transcription: 'махлифӣм', translation: 'меняют / меняем (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַחְלִיפוֹת', transcription: 'махлифóт', translation: 'меняют / меняем (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הֶחְלַפְתִּי', transcription: 'hехлáфти', translation: 'я менял(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הֶחְלַפְתָּ', transcription: 'hехлáфта', translation: 'ты менял' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הֶחְלַפְתְּ', transcription: 'hехлáфт', translation: 'ты меняла' },
    { pronoun: 'הוּא (он)', hebrew: 'הֶחְלִיף', transcription: 'hехлӣф', translation: 'он менял' },
    { pronoun: 'הִיא (она)', hebrew: 'הֶחְלִיפָה', transcription: 'hехлифá', translation: 'она меняла' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הֶחְלַפְנוּ', transcription: 'hехлáфну', translation: 'мы меняли' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הֶחְלַפְתֶּם / הֶחְלַפְתֶּן', transcription: 'hехлафтéм / hехлафтéн', translation: 'вы меняли' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הֶחְלִיפוּ', transcription: 'hехлифӯ', translation: 'они меняли' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַחְלִיף', transcription: 'ахлӣф', translation: 'я поменяю' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּחְלִיף', transcription: 'тахлӣф', translation: 'ты поменяешь / она поменяет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּחְלִיפִי', transcription: 'тахлифӣ', translation: 'ты поменяешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַחְלִיף', transcription: 'йахлӣф', translation: 'он поменяет' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַחְלִיף', transcription: 'нахлӣф', translation: 'мы поменяем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּחְלִיפוּ', transcription: 'тахлифӯ', translation: 'вы поменяете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַחְלִיפוּ', transcription: 'йахлифӯ', translation: 'они поменяют' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַחְלֵף', transcription: 'hахлéф', translation: 'поменяй (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַחְלִיפִי', transcription: 'hахлифӣ', translation: 'поменяй (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַחְלִיפוּ', transcription: 'hахлифӯ', translation: 'поменяйте' },
  ],
  rootFamily: [
    { hebrew: 'הַחְלָפָה', hebrewPlain: 'החלפה', transcription: 'hахлафá', translation: 'замена, обмен', partOfSpeech: 'noun', root: 'ח-ל-ף' },
    { hebrew: 'חֶלְקֵי חִלּוּף', hebrewPlain: 'חלקי חילוף', transcription: 'хелькéй хилу́ф', translation: 'запасные части, запчасти', partOfSpeech: 'noun', root: 'ח-ל-ף' },
    { hebrew: 'חֲלִיפִי', hebrewPlain: 'חליפי', transcription: 'халифӣ', translation: 'альтернативный, запасной', partOfSpeech: 'adjective', root: 'ח-ל-ף' },
    { hebrew: 'מַחְלֵף', hebrewPlain: 'מחלף', transcription: 'махлéф', translation: 'транспортная развязка', partOfSpeech: 'noun', root: 'ח-ל-ף' },
  ],
},

'לבלום': {
  infinitive: { hebrew: 'לִבְלֹם', transcription: 'ливлóм', translation: 'тормозить' },
  binyan: 'פָּעַל (Пааль)',
  root: 'ב-ל-ם',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'בּוֹלֵם', transcription: 'болéм', translation: 'тормозит / торможу (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'בּוֹלֶמֶת', transcription: 'болéмет', translation: 'тормозит / торможу (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'בּוֹלְמִים', transcription: 'болмӣм', translation: 'тормозят / тормозим (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'בּוֹלְמוֹת', transcription: 'болмóт', translation: 'тормозят / тормозим (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'בָּלַמְתִּי', transcription: 'балáмти', translation: 'я тормозил(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'בָּלַמְתָּ', transcription: 'балáмта', translation: 'ты тормозил' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'בָּלַמְתְּ', transcription: 'балáмт', translation: 'ты тормозила' },
    { pronoun: 'הוּא (он)', hebrew: 'בָּלַם', transcription: 'балáм', translation: 'он тормозил' },
    { pronoun: 'הִיא (она)', hebrew: 'בָּלְמָה', transcription: 'бальмá', translation: 'она тормозила' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'בָּלַמְנוּ', transcription: 'балáмну', translation: 'мы тормозили' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'בְּלַמְתֶּם / בְּלַמְתֶּן', transcription: 'бламтéм / бламтéн', translation: 'вы тормозили' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'בָּלְמוּ', transcription: 'бальмӯ', translation: 'они тормозили' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֶבְלֹם', transcription: 'эвлóм', translation: 'я заторможу' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּבְלֹם', transcription: 'тивлóм', translation: 'ты затормозишь / она затормозит' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּבְלְמִי', transcription: 'тивлемӣ', translation: 'ты затормозишь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יִבְלֹם', transcription: 'йивлóм', translation: 'он затормозит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִבְלֹם', transcription: 'нивлóм', translation: 'мы затормозим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּבְלְמוּ', transcription: 'тивлемӯ', translation: 'вы затормозите' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִבְלְמוּ', transcription: 'йивлемӯ', translation: 'они затормозят' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'בְּלֹם', transcription: 'блóм', translation: 'тормози (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'בִּלְמִי', transcription: 'бильмӣ', translation: 'тормози (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'בִּלְמוּ', transcription: 'бильмӯ', translation: 'тормозите' },
  ],
  rootFamily: [
    { hebrew: 'בְּלָמִים', hebrewPlain: 'בלמים', transcription: 'бламӣм', translation: 'тормоза', partOfSpeech: 'noun', root: 'ב-ל-ם' },
    { hebrew: 'בְּלִימָה', hebrewPlain: 'בלימה', transcription: 'блимá', translation: 'торможение', partOfSpeech: 'noun', root: 'ב-ל-ם' },
    { hebrew: 'בֶּלֶם', hebrewPlain: 'בלם', transcription: 'бéлем', translation: 'тормоз', partOfSpeech: 'noun', root: 'ב-ל-ם' },
  ],
},

'להניע': {
  infinitive: { hebrew: 'לְהָנִיעַ', transcription: 'леhанӣа', translation: 'заводить (мотор), приводить в движение' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'נ-ו-ע',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מֵנִיעַ', transcription: 'менӣа', translation: 'заводит / завожу (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְנִיעָה', transcription: 'мениá', translation: 'заводит / завожу (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְנִיעִים', transcription: 'мениим', translation: 'заводят / заводим (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְנִיעוֹת', transcription: 'мениóт', translation: 'заводят / заводим (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הֵנַעְתִּי', transcription: 'hенáти', translation: 'я завёл / завела' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הֵנַעְתָּ', transcription: 'hенáта', translation: 'ты завёл' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הֵנַעְתְּ', transcription: 'hенáт', translation: 'ты завела' },
    { pronoun: 'הוּא (он)', hebrew: 'הֵנִיעַ', transcription: 'hенӣа', translation: 'он завёл' },
    { pronoun: 'הִיא (она)', hebrew: 'הֵנִיעָה', transcription: 'hениá', translation: 'она завела' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הֵנַעְנוּ', transcription: 'hенáну', translation: 'мы завели' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הֲנַעְתֶּם / הֲנַעְתֶּן', transcription: 'hанатéм / hанатéн', translation: 'вы завели' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הֵנִיעוּ', transcription: 'hениӯ', translation: 'они завели' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אָנִיעַ', transcription: 'анӣа', translation: 'я заведу' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תָּנִיעַ', transcription: 'танӣа', translation: 'ты заведёшь / она заведёт' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תָּנִיעִי', transcription: 'таниӣ', translation: 'ты заведёшь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יָנִיעַ', transcription: 'йанӣа', translation: 'он заведёт' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נָנִיעַ', transcription: 'нанӣа', translation: 'мы заведём' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תָּנִיעוּ', transcription: 'таниӯ', translation: 'вы заведёте' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יָנִיעוּ', transcription: 'йаниӯ', translation: 'они заведут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הָנַע', transcription: 'hанá', translation: 'заведи (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הָנִיעִי', transcription: 'hаниӣ', translation: 'заведи (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הָנִיעוּ', transcription: 'hаниӯ', translation: 'заведите' },
  ],
  rootFamily: [
    { hebrew: 'מָנוֹעַ', hebrewPlain: 'מנוע', transcription: 'манóа', translation: 'двигатель, мотор', partOfSpeech: 'noun', root: 'נ-ו-ע' },
    { hebrew: 'תְּנוּעָה', hebrewPlain: 'תנועה', transcription: 'тенуá', translation: 'движение, дорожное движение', partOfSpeech: 'noun', root: 'נ-ו-ע' },
    { hebrew: 'הַתְנָעָה', hebrewPlain: 'התנעה', transcription: 'hатнаá', translation: 'пуск двигателя, зажигание', partOfSpeech: 'noun', root: 'נ-ו-ע' },
    { hebrew: 'נָע', hebrewPlain: 'נע', transcription: 'на', translation: 'подвижный, движущийся', partOfSpeech: 'adjective', root: 'נ-ו-ע' },
  ],
},

'לגרור': {
  infinitive: { hebrew: 'לִגְרֹר', transcription: 'лигрóр', translation: 'буксировать, эвакуировать' },
  binyan: 'פָּעַל (Пааль)',
  root: 'ג-ר-ר',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'גּוֹרֵר', transcription: 'горéр', translation: 'буксирует / эвакуирую (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'גּוֹרֶרֶת', transcription: 'горéрет', translation: 'буксирует / эвакуирую (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'גּוֹרְרִים', transcription: 'горерӣм', translation: 'буксируют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'גּוֹרְרוֹת', transcription: 'горерóт', translation: 'буксируют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'גָּרַרְתִּי', transcription: 'гарáрти', translation: 'я буксировал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'גָּרַרְתָּ', transcription: 'гарáрта', translation: 'ты буксировал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'גָּרַרְתְּ', transcription: 'гарáрт', translation: 'ты буксировала' },
    { pronoun: 'הוּא (он)', hebrew: 'גָּרַר', transcription: 'гарáр', translation: 'он буксировал' },
    { pronoun: 'הִיא (она)', hebrew: 'גָּרְרָה', transcription: 'гаррá', translation: 'она буксировала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'גָּרַרְנוּ', transcription: 'гарáрну', translation: 'мы буксировали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'גְּרַרְתֶּם / גְּרַרְתֶּן', transcription: 'грартéм / грартéн', translation: 'вы буксировали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'גָּרְרוּ', transcription: 'гаррӯ', translation: 'они буксировали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֶגְרֹר', transcription: 'эгрóр', translation: 'я отбуксирую' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּגְרֹר', transcription: 'тигрóр', translation: 'ты отбуксируешь / она отбуксирует' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּגְרְרִי', transcription: 'тигрерӣ', translation: 'ты отбуксируешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יִגְרֹר', transcription: 'йигрóр', translation: 'он отбуксирует' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִגְרֹר', transcription: 'нигрóр', translation: 'мы отбуксируем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּגְרְרוּ', transcription: 'тигрерӯ', translation: 'вы отбуксируете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִגְרְרוּ', transcription: 'йигрерӯ', translation: 'они отбуксируют' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'גְּרֹר', transcription: 'грóр', translation: 'эвакуируй (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'גִּרְרִי', transcription: 'гиррӣ', translation: 'эвакуируй (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'גִּרְרוּ', transcription: 'гиррӯ', translation: 'эвакуируйте' },
  ],
  rootFamily: [
    { hebrew: 'גְּרָר', hebrewPlain: 'גרר', transcription: 'грар', translation: 'эвакуатор, буксир', partOfSpeech: 'noun', root: 'ג-ר-ר' },
    { hebrew: 'גְּרִירָה', hebrewPlain: 'גרירה', transcription: 'грирá', translation: 'эвакуация, буксировка', partOfSpeech: 'noun', root: 'ג-ר-ר' },
    { hebrew: 'נִגְרָר', hebrewPlain: 'נגרר', transcription: 'нигрáр', translation: 'прицеп', partOfSpeech: 'noun', root: 'ג-ר-ר' },
  ],
},

'לשמן': {
  infinitive: { hebrew: 'לְשַׁמֵּן', transcription: 'лешамéн', translation: 'смазывать маслом' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ש-מ-ן',
  present: [
    { pronoun: 'זָכָר יָחִיд (он / я / ты)', hebrew: 'מְשַׁמֵּן', transcription: 'мешамéн', translation: 'смазывает / смазываю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְשַׁמֶּנֶת', transcription: 'мешамéнет', translation: 'смазывает / смазываю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְשַׁמְּנִים', transcription: 'мешамнӣм', translation: 'смазывают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְשַׁמְּנוֹת', transcription: 'мешамнóт', translation: 'смазывают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'שִׁמַּנְתִּי', transcription: 'шимантӣ', translation: 'я смазывал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'שִׁמַּנְתָּ', transcription: 'шимантá', translation: 'ты смазывал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'שִׁמַּנְתְּ', transcription: 'шимáнт', translation: 'ты смазывала' },
    { pronoun: 'הוּא (он)', hebrew: 'שִׁמֵּן', transcription: 'шимéн', translation: 'он смазывал' },
    { pronoun: 'הִיא (она)', hebrew: 'שִׁמְּנָה', transcription: 'шимнá', translation: 'она смазывала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'שִׁמַּנּוּ', transcription: 'шимáну', translation: 'мы смазывали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'שִׁמַּנְתֶּם / שִׁמַּנְתֶּן', transcription: 'шимантéм / шимантéн', translation: 'вы смазывали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'שִׁמְּנוּ', transcription: 'шимнӯ', translation: 'они смазывали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲשַׁמֵּן', transcription: 'ашамéн', translation: 'я смажу' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּשַׁמֵּן', transcription: 'тешамéн', translation: 'ты смажешь / она смажет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּשַׁמְּנִי', transcription: 'тешамнӣ', translation: 'ты смажешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְשַׁמֵּן', transcription: 'йешамéн', translation: 'он смажет' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְשַׁמֵּן', transcription: 'нешамéн', translation: 'мы смажем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּשַׁמְּנוּ', transcription: 'тешамнӯ', translation: 'вы смажете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְשַׁמְּנוּ', transcription: 'йешамнӯ', translation: 'они смажут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'שַׁמֵּן', transcription: 'шамéн', translation: 'смажь (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'שַׁמְּנִי', transcription: 'шамнӣ', translation: 'смажь (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'שַׁמְּנוּ', transcription: 'шамнӯ', translation: 'смажьте' },
  ],
  rootFamily: [
    { hebrew: 'שֶׁמֶן', hebrewPlain: 'שמן', transcription: 'шéмен', translation: 'масло', partOfSpeech: 'noun', root: 'ש-מ-ן' },
    { hebrew: 'שִׁמּוּן', hebrewPlain: 'שימון', transcription: 'шиму́н', translation: 'смазка, смазывание', partOfSpeech: 'noun', root: 'ש-מ-ן' },
    { hebrew: 'מְשֻׁמָּן', hebrewPlain: 'משומן', transcription: 'мешумáн', translation: 'смазанный маслом', partOfSpeech: 'adjective', root: 'ש-מ-ן' },
  ],
},

'לכוון': {
  infinitive: { hebrew: 'לְכַוֵּן', transcription: 'лехавéн', translation: 'регулировать, настраивать, направлять' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'כ-ו-ן',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְכַוֵּן', transcription: 'мехавéн', translation: 'регулирует / настраиваю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְכַוֶּנֶת', transcription: 'мехавéнет', translation: 'регулирует / настраиваю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְכַוְּנִים', transcription: 'мехавнӣм', translation: 'регулируют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְכַוְּנוֹת', transcription: 'мехавнóт', translation: 'регулируют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'כִּוַּנְתִּי', transcription: 'кивáнти', translation: 'я регулировал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'כִּוַּנְתָּ', transcription: 'кивáнта', translation: 'ты регулировал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'כִּוַּנְתְּ', transcription: 'кивáнт', translation: 'ты регулировала' },
    { pronoun: 'הוּא (он)', hebrew: 'כִּוֵּן', transcription: 'кивéн', translation: 'он регулировал' },
    { pronoun: 'הִיא (она)', hebrew: 'כִּוְּנָה', transcription: 'кивнá', translation: 'она регулировала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'כִּוַּנּוּ', transcription: 'кивáну', translation: 'мы регулировали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'כִּוַּנְתֶּם / כִּוַּנְתֶּן', transcription: 'кивантéм / кивантéн', translation: 'вы регулировали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'כִּוְּנוּ', transcription: 'кивнӯ', translation: 'они регулировали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲכַוֵּן', transcription: 'ахавéн', translation: 'я настрою' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּכַוֵּן', transcription: 'техавéн', translation: 'ты настроишь / она настроит' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּכַוְּנִי', transcription: 'техавнӣ', translation: 'ты настроишь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְכַוֵּן', transcription: 'йехавéн', translation: 'он настроит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְכַוֵּן', transcription: 'нехавéн', translation: 'мы настроим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּכַוְּנוּ', transcription: 'техавнӯ', translation: 'вы настроите' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְכַוְּנוּ', transcription: 'йехавнӯ', translation: 'они настроят' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'כַּוֵּן', transcription: 'кавéн', translation: 'настрой (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'כַּוְּנִי', transcription: 'кавнӣ', translation: 'настрой (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'כַּוְּנוּ', transcription: 'кавнӯ', translation: 'настройте' },
  ],
  rootFamily: [
    { hebrew: 'כִּוּוּן', hebrewPlain: 'כיוון', transcription: 'киву́н', translation: 'направление, регулировка', partOfSpeech: 'noun', root: 'כ-ו-ן' },
    { hebrew: 'כַּוָּנָה', hebrewPlain: 'כוונה', transcription: 'каванá', translation: 'намерение, цель', partOfSpeech: 'noun', root: 'כ-ו-ן' },
    { hebrew: 'מְכֻוָּן', hebrewPlain: 'מכוון', transcription: 'мехувáн', translation: 'настроенный, направленный', partOfSpeech: 'adjective', root: 'כ-ו-ן' },
    { hebrew: 'נָכוֹן', hebrewPlain: 'נכון', transcription: 'нахóн', translation: 'правильный, верный', partOfSpeech: 'adjective', root: 'כ-ו-ן' },
  ],
},

'לנקז': {
  infinitive: { hebrew: 'לְנַקֵּז', transcription: 'ленакéз', translation: 'сливать, дренировать (жидкость)' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'נ-ק-ז',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְנַקֵּז', transcription: 'менакéз', translation: 'сливает / сливаю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְנַקֶּזֶת', transcription: 'менакéзет', translation: 'сливает / сливаю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְנַקְּזִים', transcription: 'менакзӣм', translation: 'сливают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְנַקְּזוֹת', transcription: 'менакзóт', translation: 'сливают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'נִקַּזְתִּי', transcription: 'никазтӣ', translation: 'я сливал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'נִקַּזְתָּ', transcription: 'никазтá', translation: 'ты сливал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'נִקַּזְתְּ', transcription: 'никáзт', translation: 'ты сливала' },
    { pronoun: 'הוּא (он)', hebrew: 'נִקֵּז', transcription: 'никéз', translation: 'он сливал' },
    { pronoun: 'הִיא (она)', hebrew: 'נִקְּזָה', transcription: 'никзá', translation: 'она сливала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִקַּזְנוּ', transcription: 'никáзну', translation: 'мы сливали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'נִקַּזְתֶּם / נִקַּזְתֶּן', transcription: 'никазтéм / никазтéн', translation: 'вы сливали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'נִקְּזוּ', transcription: 'никзӯ', translation: 'они сливали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲנַקֵּז', transcription: 'анакéз', translation: 'я солью' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּנַקֵּז', transcription: 'тенакéз', translation: 'ты сольёшь / она сольёт' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּנַקְּזִי', transcription: 'тенакзӣ', translation: 'ты сольёшь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְנַקֵּז', transcription: 'йенакéз', translation: 'он сольёт' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְנַקֵּז', transcription: 'ненакéз', translation: 'мы сольём' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּנַקְּזוּ', transcription: 'тенакзӯ', translation: 'вы сольёте' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְנַקְּזוּ', transcription: 'йенакзӯ', translation: 'они сольют' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'נַקֵּז', transcription: 'накéз', translation: 'слей (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'נַקְּזִי', transcription: 'накзӣ', translation: 'слей (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'נַקְּזוּ', transcription: 'накзӯ', translation: 'слейте' },
  ],
  rootFamily: [
    { hebrew: 'נִקּוּז', hebrewPlain: 'ניקוז', transcription: 'нику́з', translation: 'слив, дренаж, водоотвод', partOfSpeech: 'noun', root: 'נ-ק-ז' },
    { hebrew: 'מְנֻקָּז', hebrewPlain: 'מנוקז', transcription: 'менукáз', translation: 'осушенный, дренированный', partOfSpeech: 'adjective', root: 'נ-ק-ז' },
  ],
},

// ==========================================
// ГЛАГОЛЫ: ДЕТСКИЙ САД И ВОСПИТАНИЕ (גן ילדים)
// ==========================================

'להשגיח': {
  infinitive: { hebrew: 'לְהַשְׁגִּיחַ', transcription: 'леhашгӣах', translation: 'присматривать, следить, надзирать' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'ש-ג-ח',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַשְׁגִּיחַ', transcription: 'машгӣах', translation: 'присматривает / присматриваю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַשְׁגִּיחָה', transcription: 'машгиха', translation: 'присматривает / присматриваю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַשְׁגִּיחִים', transcription: 'машгихим', translation: 'присматривают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַשְׁגִּיחוֹת', transcription: 'машгихóт', translation: 'присматривают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הִשְׁגַּחְתִּי', transcription: 'hишгáхти', translation: 'я присматривал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִשְׁגַּחְתָּ', transcription: 'hишгáхта', translation: 'ты присматривал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִשְׁגַּחְתְּ', transcription: 'hишгáхт', translation: 'ты присматривала' },
    { pronoun: 'הוּא (он)', hebrew: 'הִשְׁגִּיחַ', transcription: 'hишгӣах', translation: 'он присматривал' },
    { pronoun: 'הִיא (она)', hebrew: 'הִשְׁגִּיחָה', transcription: 'hишгиха', translation: 'она присматривала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִשְׁגַּחְנוּ', transcription: 'hишгáхну', translation: 'мы присматривали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִשְׁגַּחְתֶּם / הִשְׁגַּחְתֶּן', transcription: 'hишгахтéм / hишгахтéн', translation: 'вы присматривали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִשְׁגִּיחוּ', transcription: 'hишгихӯ', translation: 'они присматривали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַשְׁגִּיחַ', transcription: 'ашгӣах', translation: 'я присмотрю' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּשְׁגִּיחַ', transcription: 'ташгӣах', translation: 'ты присмотришь / она присмотрит' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּשְׁגִּיחִי', transcription: 'ташгихӣ', translation: 'ты присмотришь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַשְׁגִּיחַ', transcription: 'йашгӣах', translation: 'он присмотрит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַשְׁגִּיחַ', transcription: 'нашгӣах', translation: 'мы присмотрим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּשְׁגִּיחוּ', transcription: 'ташгихӯ', translation: 'вы присмотрите' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַשְׁגִּיחוּ', transcription: 'йашгихӯ', translation: 'они присмотрят' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַשְׁגַּח', transcription: 'hашгáх', translation: 'присмотри (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַשְׁגִּיחִי', transcription: 'hашгихӣ', translation: 'присмотри (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַשְׁגִּיחוּ', transcription: 'hашгихӯ', translation: 'присмотрите' },
  ],
  rootFamily: [
    { hebrew: 'הַשְׁגָּחָה', hebrewPlain: 'השגחה', transcription: 'hашгаха', translation: 'присмотр, надзор, опека', partOfSpeech: 'noun', root: 'ש-ג-ח' },
    { hebrew: 'מַשְׁגִּיחַ', hebrewPlain: 'משגיח', transcription: 'машгӣах', translation: 'контролёр, надзиратель', partOfSpeech: 'noun', root: 'ש-ג-ח' },
  ],
},

'לחבק': {
  infinitive: { hebrew: 'לְחַבֵּק', transcription: 'лехабéк', translation: 'обнимать' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ח-ב-ק',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְחַבֵּק', transcription: 'мехабéк', translation: 'обнимает / обнимаю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְחַבֶּקֶת', transcription: 'мехабéкет', translation: 'обнимает / обнимаю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְחַבְּקִים', transcription: 'мехабкӣм', translation: 'обнимают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְחַבְּקוֹת', transcription: 'мехабкóт', translation: 'обнимают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'חִבַּקְתִּי', transcription: 'хибáкти', translation: 'я обнимал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'חִבַּקְתָּ', transcription: 'хибáкта', translation: 'ты обнимал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'חִבַּקְתְּ', transcription: 'хибáкт', translation: 'ты обнимала' },
    { pronoun: 'הוּא (он)', hebrew: 'חִבֵּק', transcription: 'хибéк', translation: 'он обнимал' },
    { pronoun: 'הִיא (она)', hebrew: 'חִבְּקָה', transcription: 'хибкá', translation: 'она обнимала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'חִבַּקְנוּ', transcription: 'хибáкну', translation: 'мы обнимали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'חִבַּקְתֶּם / חִבַּקְתֶּן', transcription: 'хибактéм / хибактéн', translation: 'вы обнимали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'חִבְּקוּ', transcription: 'хибкӯ', translation: 'они обнимали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲחַבֵּק', transcription: 'ахабéк', translation: 'я обниму' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּחַבֵּק', transcription: 'техабéк', translation: 'ты обнимешь / она обнимет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּחַבְּקִי', transcription: 'техабкӣ', translation: 'ты обнимешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְחַבֵּק', transcription: 'йехабéк', translation: 'он обнимет' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְחַבֵּק', transcription: 'нехабéк', translation: 'мы обнимем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּחַבְּקוּ', transcription: 'техабкӯ', translation: 'вы обнимете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְחַבְּקוּ', transcription: 'йехабкӯ', translation: 'они обнимут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'חַבֵּק', transcription: 'хабéк', translation: 'обними (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'חַבְּקִי', transcription: 'хабкӣ', translation: 'обними (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'חַבְּקוּ', transcription: 'хабкӯ', translation: 'обнимите' },
  ],
  rootFamily: [
    { hebrew: 'חִבּוּק', hebrewPlain: 'חיבוק', transcription: 'хибӯк', translation: 'объятие', partOfSpeech: 'noun', root: 'ח-ב-ק' },
    { hebrew: 'מְחֻבָּק', hebrewPlain: 'מחובק', transcription: 'мехубáк', translation: 'обнятый', partOfSpeech: 'adjective', root: 'ח-ב-ק' },
  ],
},

'להדביק': {
  infinitive: { hebrew: 'לְהַדְבִּיק', transcription: 'леhадбӣк', translation: 'клеить, наклеивать' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'ד-ב-ק',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַדְבִּיק', transcription: 'мадбӣк', translation: 'клеит / клею (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַדְבִּיקָה', transcription: 'мадбикá', translation: 'клеит / клею (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַדְבִּיקִים', transcription: 'мадбикӣм', translation: 'клеят (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַדְבִּיקוֹת', transcription: 'мадбикóт', translation: 'клеят (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הִדְבַּקְתִּי', transcription: 'hидбáкти', translation: 'я клеил(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִדְבַּקְתָּ', transcription: 'hидбáкта', translation: 'ты клеил' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִדְבַּקְתְּ', transcription: 'hидбáкт', translation: 'ты клеила' },
    { pronoun: 'הוּא (он)', hebrew: 'הִדְבִּיק', transcription: 'hидбӣк', translation: 'он клеил' },
    { pronoun: 'הִיא (она)', hebrew: 'הִדְבִּיקָה', transcription: 'hидбикá', translation: 'она клеила' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִדְבַּקְנוּ', transcription: 'hидбáкну', translation: 'мы клеили' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִדְבַּקְתֶּם / הִדְבַּקְתֶּן', transcription: 'hидбактéм / hидбактéн', translation: 'вы клеили' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִדְבִּיקוּ', transcription: 'hидбикӯ', translation: 'они клеили' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַדְבִּיק', transcription: 'адбӣк', translation: 'я наклею' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּדְבִּיק', transcription: 'тадбӣк', translation: 'ты наклеешь / она наклеит' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּדְבִּיקִי', transcription: 'тадбикӣ', translation: 'ты наклеешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַדְבִּיק', transcription: 'йадбӣк', translation: 'он наклеит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַדְבִּיק', transcription: 'надбӣк', translation: 'мы наклеим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּדְבִּיקוּ', transcription: 'тадбикӯ', translation: 'вы наклеете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַדְבִּיקוּ', transcription: 'йадбикӯ', translation: 'они наклеят' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַדְבֵּק', transcription: 'hадбéк', translation: 'наклей (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַדְבִּיקִי', transcription: 'hадбикӣ', translation: 'наклей (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַדְבִּיקוּ', transcription: 'hадбикӯ', translation: 'наклейте' },
  ],
  rootFamily: [
    { hebrew: 'דֶּבֶק', hebrewPlain: 'דבק', transcription: 'дéвек', translation: 'клей', partOfSpeech: 'noun', root: 'ד-ב-ק' },
    { hebrew: 'מַדְבֵּקָה', hebrewPlain: 'מדבקה', transcription: 'мадбекá', translation: 'наклейка, стикер', partOfSpeech: 'noun', root: 'ד-ב-ק' },
    { hebrew: 'הַדְבָּקָה', hebrewPlain: 'הדבקה', transcription: 'hадбака', translation: 'наклеивание, аппликация', partOfSpeech: 'noun', root: 'ד-ב-ק' },
    { hebrew: 'דָּבִיק', hebrewPlain: 'דביק', transcription: 'давӣк', translation: 'липкий, клейкий', partOfSpeech: 'adjective', root: 'ד-ב-ק' },
  ],
},

'לגזור': {
  infinitive: { hebrew: 'לִגְזֹר', transcription: 'лигзóр', translation: 'вырезать (ножницами), кроить' },
  binyan: 'פָּעַל (Пааль)',
  root: 'ג-ז-ר',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'גּוֹזֵר', transcription: 'гозéр', translation: 'вырезает / режу (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'גּוֹזֶרֶת', transcription: 'гозéрет', translation: 'вырезает / режу (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'גּוֹזְרִים', transcription: 'гозрӣм', translation: 'вырезают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'גּוֹזְרוֹת', transcription: 'гозрóт', translation: 'вырезают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'גָּזַרְתִּי', transcription: 'газáрти', translation: 'я вырезал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'גָּזַרְתָּ', transcription: 'газáрта', translation: 'ты вырезал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'גָּזַרְתְּ', transcription: 'газáрт', translation: 'ты вырезала' },
    { pronoun: 'הוּא (он)', hebrew: 'גָּזַר', transcription: 'газáр', translation: 'он вырезал' },
    { pronoun: 'הִיא (она)', hebrew: 'גָּזְרָה', transcription: 'газрá', translation: 'она вырезала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'גָּזַרְנוּ', transcription: 'газáрну', translation: 'мы вырезали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'גְּזַרְתֶּם / גְּזַרְתֶּן', transcription: 'гзартéм / гзартéн', translation: 'вы вырезали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'גָּזְרוּ', transcription: 'газрӯ', translation: 'они вырезали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֶגְזֹר', transcription: 'эгзóр', translation: 'я вырежу' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּגְזֹר', transcription: 'тигзóр', translation: 'ты вырежешь / она вырежет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּגְזְרִי', transcription: 'тигзерӣ', translation: 'ты вырежешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יִגְזֹר', transcription: 'йигзóр', translation: 'он вырежет' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִגְזֹר', transcription: 'нигзóр', translation: 'мы вырежем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּגְזְרוּ', transcription: 'тигзерӯ', translation: 'вы вырежете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִגְזְרוּ', transcription: 'йигзерӯ', translation: 'они вырежут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'גְּזֹר', transcription: 'гзóр', translation: 'вырежи (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'גִּזְרִי', transcription: 'гизрӣ', translation: 'вырежи (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'גִּזְרוּ', transcription: 'гизрӯ', translation: 'вырежьте' },
  ],
  rootFamily: [
    { hebrew: 'גְּזִירָה', hebrewPlain: 'גזירה', transcription: 'гзирá', translation: 'вырезание, раскройка', partOfSpeech: 'noun', root: 'ג-ז-ר' },
    { hebrew: 'מִגְזֶרֶת', hebrewPlain: 'מגזרת', transcription: 'мигзéрет', translation: 'бумажный силуэт, аппликация', partOfSpeech: 'noun', root: 'ג-ז-ר' },
    { hebrew: 'גִּזְרָה', hebrewPlain: 'גזרה', transcription: 'гизрá', translation: 'выкройка, фасон, сектор', partOfSpeech: 'noun', root: 'ג-ז-ר' },
  ],
},

'לשתף': {
  infinitive: { hebrew: 'לְשַׁתֵּף', transcription: 'лешатéф', translation: 'делиться, вовлекать в игру' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ש-ת-ף',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְשַׁתֵּף', transcription: 'мешатéф', translation: 'делится / делюсь (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְשַׁתֶּפֶת', transcription: 'мешатéфет', translation: 'делится / делюсь (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְשַׁתְּפִים', transcription: 'мешатфӣм', translation: 'делятся (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְשַׁתְּפוֹת', transcription: 'мешатфóт', translation: 'делятся (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'שִׁתַּפְתִּי', transcription: 'шитафтӣ', translation: 'я поделился / поделилась' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'שִׁתַּפְתָּ', transcription: 'шитафтá', translation: 'ты поделился' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'שִׁתַּפְתְּ', transcription: 'шитáфт', translation: 'ты поделилась' },
    { pronoun: 'הוּא (он)', hebrew: 'שִׁתֵּף', transcription: 'шитéф', translation: 'он поделился' },
    { pronoun: 'הִיא (она)', hebrew: 'שִׁתְּפָה', transcription: 'шитфá', translation: 'она поделилась' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'שִׁתַּפְנוּ', transcription: 'шитáфну', translation: 'мы поделились' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'שִׁתַּפְתֶּם / שִׁתַּפְתֶּן', transcription: 'шитафтéм / шитафтéн', translation: 'вы поделились' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'שִׁתְּפוּ', transcription: 'шитфӯ', translation: 'они поделились' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲשַׁתֵּף', transcription: 'ашатéф', translation: 'я поделюсь' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּשַׁתֵּף', transcription: 'тешатéф', translation: 'ты поделишься / она поделится' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּשַׁתְּפִי', transcription: 'тешатфӣ', translation: 'ты поделишься (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְשַׁתֵּף', transcription: 'йешатéф', translation: 'он поделится' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְשַׁתֵּף', transcription: 'нешатéф', translation: 'мы поделимся' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּשַׁתְּפוּ', transcription: 'тешатфӯ', translation: 'вы поделитесь' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְשַׁתְּפוּ', transcription: 'йешатфӯ', translation: 'они поделятся' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'שַׁתֵּף', transcription: 'шатéф', translation: 'поделись (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'שַׁתְּפִי', transcription: 'шатфӣ', translation: 'поделись (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'שַׁתְּפוּ', transcription: 'шатфӯ', translation: 'поделитесь' },
  ],
  rootFamily: [
    { hebrew: 'שִׁתּוּף', hebrewPlain: 'שיתוף', transcription: 'шитӯф', translation: 'сотрудничество, совместное участие', partOfSpeech: 'noun', root: 'ש-ת-ף' },
    { hebrew: 'שֻׁתָּף', hebrewPlain: 'שותף', transcription: 'шутáф', translation: 'товарищ, партнер', partOfSpeech: 'noun', root: 'ש-ת-ף' },
    { hebrew: 'מְשֻׁתָּף', hebrewPlain: 'משותף', transcription: 'мешутáф', translation: 'общий, совместный', partOfSpeech: 'adjective', root: 'ש-ת-ף' },
  ],
},

'לנחם': {
  infinitive: { hebrew: 'לְנַחֵם', transcription: 'ленахéм', translation: 'утешать' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'נ-ח-ם',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְנַחֵם', transcription: 'менахéм', translation: 'утешает / утешаю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְנַחֶמֶת', transcription: 'менахéмет', translation: 'утешает / утешаю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְנַחֲמִים', transcription: 'менахамӣм', translation: 'утешают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְנַחֲמוֹת', transcription: 'менахамóт', translation: 'утешают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'נִחַמְתִּי', transcription: 'нихамтӣ', translation: 'я утешал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'נִחַמְתָּ', transcription: 'нихамтá', translation: 'ты утешал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'נִחַמְתְּ', transcription: 'нихáмт', translation: 'ты утешала' },
    { pronoun: 'הוּא (он)', hebrew: 'נִחֵם', transcription: 'нихéм', translation: 'он утешал' },
    { pronoun: 'הִיא (она)', hebrew: 'נִחֲמָה', transcription: 'нихамá', translation: 'она утешала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִחַמְנוּ', transcription: 'нихáмну', translation: 'мы утешали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'נִחַמְתֶּם / נִחַמְתֶּן', transcription: 'нихамтéм / нихамтéн', translation: 'вы утешали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'נִחֲמוּ', transcription: 'нихамӯ', translation: 'они утешали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲנַחֵם', transcription: 'анахéм', translation: 'я утешу' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּנַחֵם', transcription: 'тенахéм', translation: 'ты утешишь / она утешит' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּנַחֲמִי', transcription: 'тенахамӣ', translation: 'ты утешишь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְנַחֵם', transcription: 'йенахéм', translation: 'он утешит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְנַחֵם', transcription: 'ненахéм', translation: 'мы утешим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּנַחֲמוּ', transcription: 'тенахамӯ', translation: 'вы утешите' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְנַחֲמוּ', transcription: 'йенахамӯ', translation: 'они утешат' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'נַחֵם', transcription: 'нахéм', translation: 'утешь (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'נַחֲמִי', transcription: 'нахамӣ', translation: 'утешь (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'נַחֲמוּ', transcription: 'нахамӯ', translation: 'утешьте' },
  ],
  rootFamily: [
    { hebrew: 'נֶחָמָה', hebrewPlain: 'נחמה', transcription: 'нехамá', translation: 'утешение', partOfSpeech: 'noun', root: 'נ-ח-ם' },
    { hebrew: 'תַּנְחוּמִים', hebrewPlain: 'תנחומים', transcription: 'танхумӣм', translation: 'соболезнования, утешения', partOfSpeech: 'noun', root: 'נ-ח-ם' },
  ],
},

'לגמול': {
  infinitive: { hebrew: 'לִגְמֹל', transcription: 'лигмóль', translation: 'отучать (от соски/памперса), отнимать от груди' },
  binyan: 'פָּעַל (Пааль)',
  root: 'ג-מ-ל',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'גּוֹמֵל', transcription: 'гомéль', translation: 'отучает / отучаю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'גּוֹמֶלֶת', transcription: 'гомéлет', translation: 'отучает / отучаю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'גּוֹמְלִים', transcription: 'гомлӣм', translation: 'отучают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'גּוֹמְלוֹת', transcription: 'гомлóт', translation: 'отучают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'גָּמַלְתִּי', transcription: 'гамáльти', translation: 'я отучил(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'גָּמַלְתָּ', transcription: 'гамáльта', translation: 'ты отучил' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'גָּמַלְתְּ', transcription: 'гамáльт', translation: 'ты отучила' },
    { pronoun: 'הוּא (он)', hebrew: 'גָּמַל', transcription: 'гамáль', translation: 'он отучил' },
    { pronoun: 'הִיא (она)', hebrew: 'גָּמְלָה', transcription: 'гамлá', translation: 'она отучила' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'גָּמַלְנוּ', transcription: 'гамáльну', translation: 'мы отучили' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'גְּמַלְתֶּם / גְּמַלְתֶּן', transcription: 'гмальтéм / гмальтéн', translation: 'вы отучили' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'גָּמְלוּ', transcription: 'гамлӯ', translation: 'они отучили' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֶגְמֹל', transcription: 'эгмóль', translation: 'я отучу' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּגְמֹל', transcription: 'тигмóль', translation: 'ты отучишь / она отучит' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּגְמְלִי', transcription: 'тигмелӣ', translation: 'ты отучишь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יִגְמֹל', transcription: 'йигмóль', translation: 'он отучит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִגְמֹל', transcription: 'нигмóль', translation: 'мы отучим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּגְמְלוּ', transcription: 'тигмелӯ', translation: 'вы отучите' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִגְמְלוּ', transcription: 'йигмелӯ', translation: 'они отучат' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'גְּמֹל', transcription: 'гмóль', translation: 'отучи (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'גִּמְלִי', transcription: 'гимлӣ', translation: 'отучи (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'גִּמְלוּ', transcription: 'гимлӯ', translation: 'отучите' },
  ],
  rootFamily: [
    { hebrew: 'גְּמִילָה', hebrewPlain: 'גמילה', transcription: 'гмилá', translation: 'отучение (от соски/памперса)', partOfSpeech: 'noun', root: 'ג-מ-ל' },
    { hebrew: 'גָּמוּל', hebrewPlain: 'גמול', transcription: 'гамӯль', translation: 'отученный, самостоятельный', partOfSpeech: 'adjective', root: 'ג-מ-ל' },
  ],
},

// ==========================================
// ГЛАГОЛЫ: ВРАЧ И ПОЛИКЛИНИКА (רופא / מרפאה)
// ==========================================

'לאבחן': {
  infinitive: { hebrew: 'לְאַבְחֵן', transcription: 'леавхéн', translation: 'диагностировать, ставить диагноз' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'א-ב-ח-ן',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְאַבְחֵן', transcription: 'меавхéн', translation: 'диагностирует / диагностирую (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְאַבְחֶנֶת', transcription: 'меавхéнет', translation: 'диагностирует / диагностирую (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְאַבְחֲנִים', transcription: 'меавханӣм', translation: 'диагностируют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְאַבְחֲנוֹת', transcription: 'меавханóт', translation: 'диагностируют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אִבְחַנְתִּי', transcription: 'ивхáнти', translation: 'я диагностировал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'אִבְחַנְתָּ', transcription: 'ивхáнта', translation: 'ты диагностировал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'אִבְחַנְתְּ', transcription: 'ивхáнт', translation: 'ты диагностировала' },
    { pronoun: 'הוּא (он)', hebrew: 'אִבְחֵן', transcription: 'ивхéн', translation: 'он диагностировал' },
    { pronoun: 'הִיא (она)', hebrew: 'אִבְחֲנָה', transcription: 'ивханá', translation: 'она диагностировала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'אִבְחַנּוּ', transcription: 'ивхáну', translation: 'мы диагностировали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'אִבְחַנְתֶּם / אִבְחַנְתֶּן', transcription: 'ивхантéм / ивхантéн', translation: 'вы диагностировали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'אִבְחֲנוּ', transcription: 'ивханӯ', translation: 'они диагностировали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲאַבְחֵן', transcription: 'аавхéн', translation: 'я диагностирую' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּאַבְחֵן', transcription: 'теавхéн', translation: 'ты диагностируешь / она диагностирует' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּאַבְחֲנִי', transcription: 'теавханӣ', translation: 'ты диагностируешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְאַבְחֵן', transcription: 'йеавхéн', translation: 'он диагностирует' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְאַבְחֵן', transcription: 'неавхéн', translation: 'мы диагностируем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּאַבְחֲנוּ', transcription: 'теавханӯ', translation: 'вы диагностируете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְאַבְחֲנוּ', transcription: 'йеавханӯ', translation: 'они диагностируют' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'אַבְחֵן', transcription: 'авхéн', translation: 'поставь диагноз (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'אַבְחֲנִי', transcription: 'авханӣ', translation: 'поставь диагноз (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'אַבְחֲנוּ', transcription: 'авханӯ', translation: 'поставьте диагноз' },
  ],
  rootFamily: [
    { hebrew: 'אִבְחוּן', hebrewPlain: 'איבחון', transcription: 'ивху́н', translation: 'диагностика, диагноз', partOfSpeech: 'noun', root: 'א-ב-ח-ן' },
    { hebrew: 'מְאֻבְחָן', hebrewPlain: 'מאובחן', transcription: 'меувхáн', translation: 'диагностированный', partOfSpeech: 'adjective', root: 'א-ב-ח-ן' },
    { hebrew: 'מַבְחֵן', hebrewPlain: 'מבחן', transcription: 'мавхéн', translation: 'тест, испытание', partOfSpeech: 'noun', root: 'א-ב-ח-ן' },
  ],
},

'לרשום': {
  infinitive: { hebrew: 'לִרְשֹׁם', transcription: 'лиршóм', translation: 'выписывать (рецепт), записывать' },
  binyan: 'פָּעַל (Пааль)',
  root: 'ר-ש-ם',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'רוֹשֵׁם', transcription: 'рошéм', translation: 'выписывает / выписываю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'רוֹשֶׁמֶת', transcription: 'рошéмет', translation: 'выписывает / выписываю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'רוֹשְׁמִים', transcription: 'рошмӣм', translation: 'выписывают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'רוֹשְׁמוֹת', transcription: 'рошмóт', translation: 'выписывают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'רָשַׁמְתִּי', transcription: 'рашáмти', translation: 'я выписал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'רָשַׁמְתָּ', transcription: 'рашáмта', translation: 'ты выписал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'רָשַׁמְתְּ', transcription: 'рашáмт', translation: 'ты выписала' },
    { pronoun: 'הוּא (он)', hebrew: 'רָשַׁם', transcription: 'рашáм', translation: 'он выписал' },
    { pronoun: 'הִיא (она)', hebrew: 'רָשְׁמָה', transcription: 'рашмá', translation: 'она выписала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'רָשַׁמְנוּ', transcription: 'рашáмну', translation: 'мы выписали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'רְשַׁמְתֶּם / רְשַׁמְתֶּן', transcription: 'ршамтéм / ршамтéн', translation: 'вы выписали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'רָשְׁמוּ', transcription: 'рашмӯ', translation: 'они выписали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֶרְשֹׁם', transcription: 'эршóм', translation: 'я выпишу' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּרְשֹׁם', transcription: 'тиршóм', translation: 'ты выпишешь / она выпишет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּרְשְׁמִי', transcription: 'тиршемӣ', translation: 'ты выпишешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יִרְשֹׁם', transcription: 'йиршóм', translation: 'он выпишет' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִרְשֹׁם', transcription: 'ниршóм', translation: 'мы выпишем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּרְשְׁמוּ', transcription: 'тиршемӯ', translation: 'вы выпишете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִרְשְׁמוּ', transcription: 'йиршемӯ', translation: 'они выпишут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'רְשֹׁם', transcription: 'ршом', translation: 'выпиши (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'רִשְׁמִי', transcription: 'ришмӣ', translation: 'выпиши (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'רִשְׁמוּ', transcription: 'ришмӯ', translation: 'выпишите' },
  ],
  rootFamily: [
    { hebrew: 'מִרְשָׁם', hebrewPlain: 'מרשם', transcription: 'миршáм', translation: 'рецепт врача', partOfSpeech: 'noun', root: 'ר-ש-ם' },
    { hebrew: 'רְשִׁימָה', hebrewPlain: 'רשימה', transcription: 'решимá', translation: 'список, перечень', partOfSpeech: 'noun', root: 'ר-ש-ם' },
    { hebrew: 'הַרְשָׁמָה', hebrewPlain: 'הרשמה', transcription: 'hаршамá', translation: 'регистрация, запись', partOfSpeech: 'noun', root: 'ר-ש-ם' },
    { hebrew: 'רִשּׁוּם', hebrewPlain: 'רישום', transcription: 'ришӯм', translation: 'запись, протокол', partOfSpeech: 'noun', root: 'ר-ש-ם' },
  ],
},

'להפנות': {
  infinitive: { hebrew: 'לְהַפְנוֹת', transcription: 'леhафнóт', translation: 'направлять (на анализы / к специалисту)' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'פ-נ-ה',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַפְנֶה', transcription: 'мафнé', translation: 'направляет / направляю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַפְנָה', transcription: 'мафнá', translation: 'направляет / направляю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַפְנִים', transcription: 'мафнӣм', translation: 'направляют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַפְנוֹת', transcription: 'мафнóт', translation: 'направляют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הִפְנֵיתִי', transcription: 'hифнéйти', translation: 'я направил(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִפְנֵיתָ', transcription: 'hифнéйта', translation: 'ты направил' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִפְנֵית', transcription: 'hифнéйт', translation: 'ты направила' },
    { pronoun: 'הוּא (он)', hebrew: 'הִפְנָה', transcription: 'hифнá', translation: 'он направил' },
    { pronoun: 'הִיא (она)', hebrew: 'הִפְנְתָה', transcription: 'hифнетá', translation: 'она направила' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִפְנֵינוּ', transcription: 'hифнéйну', translation: 'мы направили' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִפְנֵיתֶם / הִפְנֵיתֶן', transcription: 'hифнейтéм / hифнейтéн', translation: 'вы направили' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִפְנוּ', transcription: 'hифнӯ', translation: 'они направили' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַפְנֶה', transcription: 'афнé', translation: 'я направлю' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּפְנֶה', transcription: 'тафнé', translation: 'ты направишь / она направит' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּפְנִי', transcription: 'тафнӣ', translation: 'ты направишь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַפְנֶה', transcription: 'йафнé', translation: 'он направит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַפְנֶה', transcription: 'нафнé', translation: 'мы направим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּפְנוּ', transcription: 'тафнӯ', translation: 'вы направите' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַפְנוּ', transcription: 'йафнӯ', translation: 'они направят' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַפְנֵה', transcription: 'hафнé', translation: 'направь (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַפְנִי', transcription: 'hафнӣ', translation: 'направь (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַפְנוּ', transcription: 'hафнӯ', translation: 'направьте' },
  ],
  rootFamily: [
    { hebrew: 'הַפְנָיָה', hebrewPlain: 'הפניה', transcription: 'hафная', translation: 'медицинское направление', partOfSpeech: 'noun', root: 'פ-נ-ה' },
    { hebrew: 'פְּנִיָּה', hebrewPlain: 'פניה', transcription: 'пния', translation: 'обращение к врачу', partOfSpeech: 'noun', root: 'פ-נ-ה' },
    { hebrew: 'פָּנִים', hebrewPlain: 'פנים', transcription: 'панӣм', translation: 'лицо', partOfSpeech: 'noun', root: 'פ-נ-ה' },
  ],
},

'לחטא': {
  infinitive: { hebrew: 'לְחַטֵּא', transcription: 'лехатé', translation: 'дезинфицировать, обеззараживать' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ח-ט-א',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְחַטֵּא', transcription: 'мехатé', translation: 'дезинфицирует / дезинфицирую (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְחַטֵּאת', transcription: 'мехатéт', translation: 'дезинфицирует / дезинфицирую (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְחַטְּאִים', transcription: 'мехат’ӣм', translation: 'дезинфицируют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְחַטְּאוֹת', transcription: 'мехат’óт', translation: 'дезинфицируют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'חִטֵּאתִי', transcription: 'хитéти', translation: 'я дезинфицировал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'חִטֵּאתָ', transcription: 'хитéта', translation: 'ты дезинфицировал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'חִטֵּאת', transcription: 'хитéт', translation: 'ты дезинфицировала' },
    { pronoun: 'הוּא (он)', hebrew: 'חִטֵּא', transcription: 'хитé', translation: 'он дезинфицировал' },
    { pronoun: 'הִיא (она)', hebrew: 'חִטְּאָה', transcription: 'хит’á', translation: 'она дезинфицировала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'חִטֵּאנוּ', transcription: 'хитéну', translation: 'мы дезинфицировали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'חִטֵּאתֶם / חִטֵּאתֶן', transcription: 'хитетéм / хитетéн', translation: 'вы дезинфицировали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'חִטְּאוּ', transcription: 'хит’ӯ', translation: 'они дезинфицировали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲחַטֵּא', transcription: 'ахатé', translation: 'я продезинфицирую' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּחַטֵּא', transcription: 'техатé', translation: 'ты продезинфицируешь / она продезинфицирует' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּחַטְּאִי', transcription: 'техат’ӣ', translation: 'ты продезинфицируешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְחַטֵּא', transcription: 'йехатé', translation: 'он продезинфицирует' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְחַטֵּא', transcription: 'нехатé', translation: 'мы продезинфицируем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּחַטְּאוּ', transcription: 'техат’ӯ', translation: 'вы продезинфицируете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְחַטְּאוּ', transcription: 'йехат’ӯ', translation: 'они продезинфицируют' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'חַטֵּא', transcription: 'хатé', translation: 'продезинфицируй (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'חַטְּאִי', transcription: 'хат’ӣ', translation: 'продезинфицируй (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'חַטְּאוּ', transcription: 'хат’ӯ', translation: 'продезинфицируйте' },
  ],
  rootFamily: [
    { hebrew: 'חִטּוּי', hebrewPlain: 'חיטוי', transcription: 'хиту́й', translation: 'дезинфекция', partOfSpeech: 'noun', root: 'ח-ט-א' },
    { hebrew: 'חֹמֶר חִטּוּי', hebrewPlain: 'חומר חיטוי', transcription: 'хóмер хиту́й', translation: 'антисептик', partOfSpeech: 'noun', root: 'ח-ט-א' },
    { hebrew: 'מְחֻטָּא', hebrewPlain: 'מחוטא', transcription: 'мехутá', translation: 'продезинфицированный', partOfSpeech: 'adjective', root: 'ח-ט-א' },
  ],
},

'לחבוש': {
  infinitive: { hebrew: 'לַחְבֹּשׁ', transcription: 'лахбóш', translation: 'бинтовать, накладывать повязку' },
  binyan: 'פָּעַל (Пааль)',
  root: 'ח-ב-ש',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'חוֹבֵשׁ', transcription: 'ховéш', translation: 'бинтует / бинтую (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'חוֹבֶשֶׁת', transcription: 'ховéшет', translation: 'бинтует / бинтую (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'חוֹבְשִׁים', transcription: 'ховшӣм', translation: 'бинтуют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'חוֹבְשׁוֹת', transcription: 'ховшóт', translation: 'бинтуют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'חָבַשְׁתִּי', transcription: 'хавáшти', translation: 'я бинтовал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'חָבַשְׁתָּ', transcription: 'хавáшта', translation: 'ты бинтовал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'חָבַשְׁתְּ', transcription: 'хавáшт', translation: 'ты бинтовала' },
    { pronoun: 'הוּא (он)', hebrew: 'חָבַשׁ', transcription: 'хавáш', translation: 'он бинтовал' },
    { pronoun: 'הִיא (она)', hebrew: 'חָבְשָׁה', transcription: 'хавшá', translation: 'она бинтовала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'חָבַשְׁנוּ', transcription: 'хавáшну', translation: 'мы бинтовали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'חֲבַשְׁתֶּם / חֲבַשְׁתֶּן', transcription: 'хаваштéм / хаваштéн', translation: 'вы бинтовали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'חָבְשׁוּ', transcription: 'хавшӯ', translation: 'они бинтовали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֶחְבֹּשׁ', transcription: 'эхбóш', translation: 'я забинтую' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּחְבֹּשׁ', transcription: 'тахбóш', translation: 'ты забинтуешь / она забинтует' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּחְבְּשִׁי', transcription: 'тахбешӣ', translation: 'ты забинтуешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַחְבֹּשׁ', transcription: 'йахбóш', translation: 'он забинтует' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַחְבֹּשׁ', transcription: 'нахбóш', translation: 'мы забинтуем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּחְבְּשׁוּ', transcription: 'тахбешӯ', translation: 'вы забинтуете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַחְבְּשׁוּ', transcription: 'йахбешӯ', translation: 'они забинтуют' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'חֲבֹשׁ', transcription: 'хавóш', translation: 'забинтуй (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'חִבְשִׁי', transcription: 'хившӣ', translation: 'забинтуй (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'חִבְשׁוּ', transcription: 'хившӯ', translation: 'забинтуйте' },
  ],
  rootFamily: [
    { hebrew: 'תַּחְבּוֹשֶׁת', hebrewPlain: 'תחבושת', transcription: 'тахбóшет', translation: 'повязка, бинт', partOfSpeech: 'noun', root: 'ח-ב-ש' },
    { hebrew: 'חוֹבֵשׁ', hebrewPlain: 'חובש', transcription: 'ховéш', translation: 'санитар, парамедик', partOfSpeech: 'noun', root: 'ח-ב-ש' },
    { hebrew: 'חֲבִישָׁה', hebrewPlain: 'חבישה', transcription: 'хавишá', translation: 'перевязка', partOfSpeech: 'noun', root: 'ח-ב-ש' },
  ],
},

'לנתח': {
  infinitive: { hebrew: 'לְנַתֵּחַ', transcription: 'ленатéах', translation: 'оперировать (хирургически), анализировать' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'נ-ת-ח',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְנַתֵּחַ', transcription: 'менатéах', translation: 'оперирует / оперирую (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְנַתַּחַת', transcription: 'менатáхат', translation: 'оперирует / оперирую (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְנַתְּחִים', transcription: 'менатхӣм', translation: 'оперируют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְנַתְּחוֹת', transcription: 'менатхóт', translation: 'оперируют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'נִתַּחְתִּי', transcription: 'нитáхти', translation: 'я оперировал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'נִתַּחְתָּ', transcription: 'нитáхта', translation: 'ты оперировал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'נִתַּחְתְּ', transcription: 'нитáхт', translation: 'ты оперировала' },
    { pronoun: 'הוּא (он)', hebrew: 'נִתֵּחַ', transcription: 'нитéах', translation: 'он оперировал' },
    { pronoun: 'הִיא (она)', hebrew: 'נִתְּחָה', transcription: 'нитхá', translation: 'она оперировала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִתַּחְנוּ', transcription: 'нитáхну', translation: 'мы оперировали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'נִתַּחְתֶּם / נִתַּחְתֶּן', transcription: 'нитахтéм / нитахтéн', translation: 'вы оперировали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'נִתְּחוּ', transcription: 'нитхӯ', translation: 'они оперировали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲנַתֵּחַ', transcription: 'анатéах', translation: 'я прооперирую' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּנַתֵּחַ', transcription: 'тенатéах', translation: 'ты прооперируешь / она прооперирует' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּנַתְּחִי', transcription: 'тенатхӣ', translation: 'ты прооперируешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְנַתֵּחַ', transcription: 'йенатéах', translation: 'он прооперирует' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְנַתֵּחַ', transcription: 'ненатéах', translation: 'мы прооперируем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּנַתְּחוּ', transcription: 'тенатхӯ', translation: 'вы прооперируете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְנַתְּחוּ', transcription: 'йенатхӯ', translation: 'они прооперируют' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'נַתֵּחַ', transcription: 'натéах', translation: 'прооперируй (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'נַתְּחִי', transcription: 'натхӣ', translation: 'прооперируй (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'נַתְּחוּ', transcription: 'натхӯ', translation: 'прооперируйте' },
  ],
  rootFamily: [
    { hebrew: 'נִתּוּחַ', hebrewPlain: 'ניתוח', transcription: 'нитӯах', translation: 'хирургическая операция', partOfSpeech: 'noun', root: 'נ-ת-ח' },
    { hebrew: 'מְנַתֵּחַ', hebrewPlain: 'מנתח', transcription: 'менатéах', translation: 'хирург', partOfSpeech: 'noun', root: 'נ-ת-ח' },
    { hebrew: 'חֲדַר נִתּוּחַ', hebrewPlain: 'חדר ניתוח', transcription: 'хадáр нитӯах', translation: 'операционная', partOfSpeech: 'noun', root: 'נ-ת-ח' },
  ],
},

'להרדים': {
  infinitive: { hebrew: 'לְהַרְדִּים', transcription: 'леhардӣм', translation: 'вводить наркоз, усыплять' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'ר-ד-ם',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַרְדִּים', transcription: 'мардӣм', translation: 'вводит наркоз / усыпляю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַרְדִּימָה', transcription: 'мардимá', translation: 'вводит наркоз / усыпляю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַרְדִּימִים', transcription: 'мардимӣм', translation: 'вводят наркоз (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַרְדִּימוֹת', transcription: 'мардимóт', translation: 'вводят наркоз (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הִרְדַּמְתִּי', transcription: 'hирдáмти', translation: 'я усыпил(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִרְדַּמְתָּ', transcription: 'hирдáмта', translation: 'ты усыпил' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִרְדַּמְתְּ', transcription: 'hирдáмт', translation: 'ты усыпила' },
    { pronoun: 'הוּא (он)', hebrew: 'הִרְדִּים', transcription: 'hирдӣм', translation: 'он усыпил' },
    { pronoun: 'הִיא (она)', hebrew: 'הִרְדִּימָה', transcription: 'hирдимá', translation: 'она усыпила' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִרְדַּמְנוּ', transcription: 'hирдáмну', translation: 'мы усыпили' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִרְדַּמְתֶּם / הִרְדַּמְתֶּן', transcription: 'hирдамтéм / hирдамтéн', translation: 'вы усыпили' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִרְדִּימוּ', transcription: 'hирдимӯ', translation: 'они усыпили' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַרְדִּים', transcription: 'ардӣм', translation: 'я усыплю (дам наркоз)' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּרְדִּים', transcription: 'тардӣм', translation: 'ты усыпишь / она усыпит' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּרְדִּימִי', transcription: 'тардимӣ', translation: 'ты усыпишь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַרְדִּים', transcription: 'йардӣм', translation: 'он усыпит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַרְדִּים', transcription: 'нардӣм', translation: 'мы усыпим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּרְדִּימוּ', transcription: 'тардимӯ', translation: 'вы усыпите' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַרְדִּימוּ', transcription: 'йардимӯ', translation: 'они усыпят' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַרְדֵּם', transcription: 'hардéм', translation: 'усыпи (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַרְדִּימִי', transcription: 'hардимӣ', translation: 'усыпи (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַרְדִּימוּ', transcription: 'hардимӯ', translation: 'усыпите' },
  ],
  rootFamily: [
    { hebrew: 'הַרְדָּמָה', hebrewPlain: 'הרדמה', transcription: 'hардамá', translation: 'наркоз, анестезия', partOfSpeech: 'noun', root: 'ר-ד-ם' },
    { hebrew: 'רוֹפֵא מַרְדִּים', hebrewPlain: 'רופא מרדים', transcription: 'рофé мардӣм', translation: 'врач-анестезиолог', partOfSpeech: 'noun', root: 'ר-ד-ם' },
    { hebrew: 'תַּרְדֶּמֶת', hebrewPlain: 'תרדמת', transcription: 'тардéмет', translation: 'летаргия, кома', partOfSpeech: 'noun', root: 'ר-ד-ם' },
  ],
},

'להחלים': {
  infinitive: { hebrew: 'לְהַחְלִים', transcription: 'леhахлӣм', translation: 'выздоравливать, поправляться' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'ח-ל-ם',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַחְלִים', transcription: 'махлӣм', translation: 'выздоравливает / выздоравливаю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַחְלִימָה', transcription: 'махлимá', translation: 'выздоравливает / выздоравливаю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַחְלִימִים', transcription: 'махлимӣм', translation: 'выздоравливают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַחְלִימוֹת', transcription: 'махлимóт', translation: 'выздоравливают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הֶחְלַמְתִּי', transcription: 'hехлáмти', translation: 'я выздоровел(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הֶחְלַמְתָּ', transcription: 'hехлáмта', translation: 'ты выздоровел' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הֶחְלַמְתְּ', transcription: 'hехлáмт', translation: 'ты выздоровела' },
    { pronoun: 'הוּא (он)', hebrew: 'הֶחְלִים', transcription: 'hехлӣм', translation: 'он выздоровел' },
    { pronoun: 'הִיא (она)', hebrew: 'הֶחְלִימָה', transcription: 'hехлимá', translation: 'она выздоровела' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הֶחְלַמְנוּ', transcription: 'hехлáмну', translation: 'мы выздоровели' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הֶחְלַמְתֶּם / הֶחְלַמְתֶּן', transcription: 'hехламтéм / hехламтéн', translation: 'вы выздоровели' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הֶחְלִימוּ', transcription: 'hехлимӯ', translation: 'они выздоровели' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַחְלִים', transcription: 'ахлӣм', translation: 'я выздоровлю' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּחְלִים', transcription: 'тахлӣм', translation: 'ты выздоровеешь / она выздоровеет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּחְלִימִי', transcription: 'тахлимӣ', translation: 'ты выздоровеешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַחְלִים', transcription: 'йахлӣм', translation: 'он выздоровеет' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַחְלִים', transcription: 'нахлӣм', translation: 'мы выздоровеем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּחְלִימוּ', transcription: 'тахлимӯ', translation: 'вы выздоровеете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַחְלִימוּ', transcription: 'йахлимӯ', translation: 'они выздоровеют' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַחְלֵם', transcription: 'hахлéм', translation: 'выздоравливай (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַחְלִימִי', transcription: 'hахлимӣ', translation: 'выздоравливай (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַחְלִימוּ', transcription: 'hахлимӯ', translation: 'выздоравливайте' },
  ],
  rootFamily: [
    { hebrew: 'הַחְלָמָה', hebrewPlain: 'החלמה', transcription: 'hахламá', translation: 'выздоровление, реабилитация', partOfSpeech: 'noun', root: 'ח-ל-ם' },
    { hebrew: 'מַחְלִים', hebrewPlain: 'מחלים', transcription: 'махлӣм', translation: 'выздоравливающий', partOfSpeech: 'adjective', root: 'ח-ל-ם' },
  ],
},

'להשתעל': {
  infinitive: { hebrew: 'לְהִשְׁתַּעֵל', transcription: 'леhишта’éль', translation: 'кашлять' },
  binyan: 'הִתְפַּעֵל (Хитпаэль)',
  root: 'ש-ע-ל',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מִשְׁתַּעֵל', transcription: 'мишта’éль', translation: 'кашляет / кашляю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מִשְׁתַּעֶלֶת', transcription: 'мишта’éлет', translation: 'кашляет / кашляю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מִשְׁתַּעֲלִים', transcription: 'мишта’алӣм', translation: 'кашляют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מִשְׁתַּעֲלוֹת', transcription: 'мишта’алóт', translation: 'кашляют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הִשְׁתַּעַלְתִּי', transcription: 'hишта’áльти', translation: 'я кашлял(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִשְׁתַּעַלְתָּ', transcription: 'hишта’áльта', translation: 'ты кашлял' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִשְׁתַּעַלְתְּ', transcription: 'hишта’áльт', translation: 'ты кашляла' },
    { pronoun: 'הוּא (он)', hebrew: 'הִשְׁתַּעֵל', transcription: 'hишта’éль', translation: 'он кашлял' },
    { pronoun: 'הִיא (она)', hebrew: 'הִשְׁתַּעֲלָה', transcription: 'hишта’алá', translation: 'она кашляла' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִשְׁתַּעַלְנוּ', transcription: 'hишта’áльну', translation: 'мы кашляли' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִשְׁתַּעַלְתֶּם / הִשְׁתַּעַלְתֶּן', transcription: 'hишта’альтéм / hишта’альтéн', translation: 'вы кашляли' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִשְׁתַּעֲלוּ', transcription: 'hишта’алӯ', translation: 'они кашляли' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֶשְׁתַּעֵל', transcription: 'эшта’éль', translation: 'я буду кашлять' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּשְׁתַּעֵל', transcription: 'тишта’éль', translation: 'ты будешь кашлять' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּשְׁתַּעֲלִי', transcription: 'тишта’алӣ', translation: 'ты будешь кашлять (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יִשְׁתַּעֵל', transcription: 'йишта’éль', translation: 'он будет кашлять' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִשְׁתַּעֵל', transcription: 'ништа’éль', translation: 'мы будем кашлять' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּשְׁתַּעֲלוּ', transcription: 'тишта’алӯ', translation: 'вы будете кашлять' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִשְׁתַּעֲלוּ', transcription: 'йишта’алӯ', translation: 'они будут кашлять' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הִשְׁתַּעֵל', transcription: 'hишта’éль', translation: 'кашляни (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הִשְׁתַּעֲלִי', transcription: 'hишта’алӣ', translation: 'кашляни (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הִשְׁתַּעֲלוּ', transcription: 'hишта’алӯ', translation: 'кашляните' },
  ],
  rootFamily: [
    { hebrew: 'שִׁעוּל', hebrewPlain: 'שיעול', transcription: 'ши’ӯль', translation: 'кашель', partOfSpeech: 'noun', root: 'ש-ע-ל' },
    { hebrew: 'סִירוֹפּ לְשִׁעוּל', hebrewPlain: 'סירופ לשיעול', transcription: 'сирóп леши’ӯль', translation: 'сироп от кашля', partOfSpeech: 'noun', root: 'ש-ע-ל' },
  ],
},

'להקיא': {
  infinitive: { hebrew: 'לְהַקִּיא', transcription: 'леhакӣ', translation: 'рвать, иметь рвоту' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'ק-ו-א',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מֵקִיא', transcription: 'мекӣ', translation: 'рвёт / меня тошнит (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְקִיאָה', transcription: 'мекиá', translation: 'рвёт / меня тошнит (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְקִיאִים', transcription: 'мекиӣм', translation: 'рвёт (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְקִיאוֹת', transcription: 'мекиóт', translation: 'рвёт (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הֵקֵאתִי', transcription: 'hекéти', translation: 'меня вырвало' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הֵקֵאתָ', transcription: 'hекéта', translation: 'тебя вырвало' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הֵקֵאת', transcription: 'hекéт', translation: 'тебя вырвало' },
    { pronoun: 'הוּא (он)', hebrew: 'הֵקִיא', transcription: 'hекӣ', translation: 'его вырвало' },
    { pronoun: 'הִיא (она)', hebrew: 'הֵקִיאָה', transcription: 'hекиá', translation: 'её вырвало' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הֵקֵאנוּ', transcription: 'hекéну', translation: 'нас вырвало' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הֲקֵאתֶם / הֲקֵאתֶן', transcription: 'hакетéм / hакетéн', translation: 'вас вырвало' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הֵקִיאוּ', transcription: 'hекиӯ', translation: 'их вырвало' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אָקִיא', transcription: 'акӣ', translation: 'меня вырвет' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תָּקִיא', transcription: 'такӣ', translation: 'тебя вырвет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תָּקִיאִי', transcription: 'такиӣ', translation: 'тебя вырвет (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יָקִיא', transcription: 'йакӣ', translation: 'его вырвет' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נָקִיא', transcription: 'накӣ', translation: 'нас вырвет' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תָּקִיאוּ', transcription: 'такиӯ', translation: 'вас вырвет' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יָקִיאוּ', transcription: 'йакиӯ', translation: 'их вырвет' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הָקֵא', transcription: 'hакé', translation: 'вырви (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הָקִיאִי', transcription: 'hакиӣ', translation: 'вырви (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הָקִיאוּ', transcription: 'hакиӯ', translation: 'вырвите' },
  ],
  rootFamily: [
    { hebrew: 'הַקָאָה', hebrewPlain: 'הקאה', transcription: 'hакаá', translation: 'рвота', partOfSpeech: 'noun', root: 'ק-ו-א' },
  ],
},

// ==========================================
// ГЛАГОЛЫ: БУХГАЛТЕРИЯ И ФИНАНСЫ (הנהלת חשבונות)
// ==========================================

'לחשב': {
  infinitive: { hebrew: 'לְחַשֵּׁב', transcription: 'лехашéв', translation: 'рассчитывать, вычислять' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ח-ש-ב',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְחַשֵּׁב', transcription: 'мехашéв', translation: 'рассчитывает / рассчитываю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְחַשֶּׁבֶת', transcription: 'мехашéвет', translation: 'рассчитывает / рассчитываю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְחַשְּׁבִים', transcription: 'мехашвӣм', translation: 'рассчитывают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְחַשְּׁבוֹת', transcription: 'мехашвóт', translation: 'рассчитывают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'חִשַּׁבְתִּי', transcription: 'хишáвти', translation: 'я рассчитал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'חִשַּׁבְתָּ', transcription: 'хишáвта', translation: 'ты рассчитал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'חִשַּׁבְתְּ', transcription: 'хишáвт', translation: 'ты рассчитала' },
    { pronoun: 'הוּא (он)', hebrew: 'חִשֵּׁב', transcription: 'хишéв', translation: 'он рассчитал' },
    { pronoun: 'הִיא (она)', hebrew: 'חִשְּׁבָה', transcription: 'хишвá', translation: 'она рассчитала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'חִשַּׁבְנוּ', transcription: 'хишáвну', translation: 'мы рассчитали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'חִשַּׁבְתֶּם / חִשַּׁבְתֶּן', transcription: 'хишавтéм / хишавтéн', translation: 'вы рассчитали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'חִשְּׁבוּ', transcription: 'хишвӯ', translation: 'они рассчитали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲחַשֵּׁב', transcription: 'ахашéв', translation: 'я рассчитаю' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּחַשֵּׁב', transcription: 'техашéв', translation: 'ты рассчитаешь / она рассчитает' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּחַשְּׁבִי', transcription: 'техашвӣ', translation: 'ты рассчитаешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְחַשֵּׁב', transcription: 'йехашéв', translation: 'он рассчитает' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְחַשֵּׁב', transcription: 'нехашéв', translation: 'мы рассчитаем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּחַשְּׁבוּ', transcription: 'техашвӯ', translation: 'вы рассчитаете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְחַשְּׁבוּ', transcription: 'йехашвӯ', translation: 'они рассчитают' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'חַשֵּׁב', transcription: 'хашéв', translation: 'рассчитай (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'חַשְּׁבִי', transcription: 'хашвӣ', translation: 'рассчитай (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'חַשְּׁבוּ', transcription: 'хашвӯ', translation: 'рассчитайте' },
  ],
  rootFamily: [
    { hebrew: 'חֶשְׁבּוֹן', hebrewPlain: 'חשבון', transcription: 'хешбóн', translation: 'счёт, расчёт', partOfSpeech: 'noun', root: 'ח-ש-ב' },
    { hebrew: 'רוֹאֵה חֶשְׁבּוֹן', hebrewPlain: 'רואה חשבון', transcription: 'ро’é хешбóн', translation: 'бухгалтер-аудитор', partOfSpeech: 'noun', root: 'ח-ש-ב' },
    { hebrew: 'הַנְהָלַת חֶשְׁבּוֹנוֹת', hebrewPlain: 'הנהלת חשבונות', transcription: 'hанhалáт хешбонóт', translation: 'бухгалтерия', partOfSpeech: 'noun', root: 'ח-ש-ב' },
    { hebrew: 'מַחְשְׁבוֹן', hebrewPlain: 'מחשבון', transcription: 'махшевóн', translation: 'калькулятор', partOfSpeech: 'noun', root: 'ח-ש-ב' },
  ],
},

'לחייב': {
  infinitive: { hebrew: 'לְחַיֵּב', transcription: 'лехайéв', translation: 'дебетовать, списывать со счёта, начислять к оплате' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ח-י-ב',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְחַיֵּב', transcription: 'мехайéв', translation: 'списывает / начисляю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְחַיֶּבֶת', transcription: 'мехайéвет', translation: 'списывает / начисляю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְחַיְּבִים', transcription: 'мехайевӣм', translation: 'списывают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְחַיְּבוֹת', transcription: 'мехайевóт', translation: 'списывают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'חִיַּבְתִּי', transcription: 'хийáвти', translation: 'я списал(а) со счёта' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'חִיַּבְתָּ', transcription: 'хийáвта', translation: 'ты списал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'חִיַּבְתְּ', transcription: 'хийáвт', translation: 'ты списала' },
    { pronoun: 'הוּא (он)', hebrew: 'חִיֵּב', transcription: 'хийéв', translation: 'он списал' },
    { pronoun: 'הִיא (она)', hebrew: 'חִיְּבָה', transcription: 'хийевá', translation: 'она списала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'חִיַּבְנוּ', transcription: 'хийáвну', translation: 'мы списали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'חִיַּבְתֶּם / חִיַּבְתֶּן', transcription: 'хийавтéм / хийавтéн', translation: 'вы списали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'חִיְּבוּ', transcription: 'хийевӯ', translation: 'они списали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲחַיֵּב', transcription: 'ахайéв', translation: 'я спишу со счёта' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּחַיֵּב', transcription: 'техайéв', translation: 'ты спишешь / она спишет' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּחַיְּבִי', transcription: 'техайевӣ', translation: 'ты спишешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְחַיֵּב', transcription: 'йехайéв', translation: 'он спишет' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְחַיֵּב', transcription: 'нехайéв', translation: 'мы спишем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּחַיְּבוּ', transcription: 'техайевӯ', translation: 'вы спишете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְחַיְּבוּ', transcription: 'йехайевӯ', translation: 'они спишут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'חַיֵּב', transcription: 'хайéв', translation: 'спиши со счёта (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'חַיְּבִי', transcription: 'хайевӣ', translation: 'спиши со счёта (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'חַיְּבוּ', transcription: 'хайевӯ', translation: 'спишите со счёта' },
  ],
  rootFamily: [
    { hebrew: 'חִיּוּב', hebrewPlain: 'חיוב', transcription: 'хийӯв', translation: 'дебет, списание средств со счёта', partOfSpeech: 'noun', root: 'ח-י-ב' },
    { hebrew: 'חוֹב', hebrewPlain: 'חוב', transcription: 'хов', translation: 'задолженность, долг', partOfSpeech: 'noun', root: 'ח-י-ב' },
    { hebrew: 'חַיָּב', hebrewPlain: 'חייב', transcription: 'хайáв', translation: 'должник, обязанный', partOfSpeech: 'adjective', root: 'ח-י-ב' },
    { hebrew: 'הִתְחַיְּבוּת', hebrewPlain: 'התחייבות', transcription: 'hитхайвеӯт', translation: 'финансовое обязательство', partOfSpeech: 'noun', root: 'ח-י-ב' },
  ],
},

'לזכות': {
  infinitive: { hebrew: 'לְזַכּוֹת', transcription: 'лезакóт', translation: 'кредитовать, начислять льготу, возмещать' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ז-כ-ה',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְזַכֶּה', transcription: 'мезакé', translation: 'кредитует / зачисляю возврат (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְזַכָּה', transcription: 'мезакá', translation: 'кредитует / зачисляю возврат (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְזַכִּים', transcription: 'мезакӣм', translation: 'кредитуют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְזַכּוֹת', transcription: 'мезакóт', translation: 'кредитуют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'זִכִּיתִי', transcription: 'зикӣти', translation: 'я начислил(а) возврат' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'זִכִּיתָ', transcription: 'зикӣта', translation: 'ты начислил возврат' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'זִכִּית', transcription: 'зикӣт', translation: 'ты начислила возврат' },
    { pronoun: 'הוּא (он)', hebrew: 'זִכָּה', transcription: 'зикá', translation: 'он начислил возврат' },
    { pronoun: 'הִיא (она)', hebrew: 'זִכְּתָה', transcription: 'зикетá', translation: 'она начислила возврат' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'זִכִּינוּ', transcription: 'зикӣну', translation: 'мы начислили возврат' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'זִכִּיתֶם / זִכִּיתֶן', transcription: 'зикитéм / зикитéн', translation: 'вы начислили возврат' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'זִכּוּ', transcription: 'зикӯ', translation: 'они начислили возврат' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲזַכֶּה', transcription: 'азакé', translation: 'я зачислю возврат' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּזַכֶּה', transcription: 'тезакé', translation: 'ты зачислишь возврат' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּזַכִּי', transcription: 'тезакӣ', translation: 'ты зачислишь возврат (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְזַכֶּה', transcription: 'йезакé', translation: 'он зачислит возврат' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְזַכֶּה', transcription: 'незакé', translation: 'мы зачислим возврат' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּזַכּוּ', transcription: 'тезакӯ', translation: 'вы зачислите возврат' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְזַכּוּ', transcription: 'йезакӯ', translation: 'они зачислят возврат' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'זַכֵּה', transcription: 'закé', translation: 'зачисли возврат (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'זַכִּי', transcription: 'закӣ', translation: 'зачисли возврат (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'זַכּוּ', transcription: 'закӯ', translation: 'зачислите возврат' },
  ],
  rootFamily: [
    { hebrew: 'זִכּוּי', hebrewPlain: 'זיכוי', transcription: 'зику́й', translation: 'кредит, возврат денег, налоговая льгота', partOfSpeech: 'noun', root: 'ז-כ-ה' },
    { hebrew: 'נְקֻדַּת זִכּוּי', hebrewPlain: 'נקודת זיכוי', transcription: 'некудáт зику́й', translation: 'льготный налоговый балл', partOfSpeech: 'noun', root: 'ז-כ-ה' },
    { hebrew: 'זְכוּת', hebrewPlain: 'זכות', transcription: 'зхут', translation: 'право, положительный баланс счёта', partOfSpeech: 'noun', root: 'ז-כ-ה' },
  ],
},

'להפיק': {
  infinitive: { hebrew: 'לְהָפִיק', transcription: 'леhафӣк', translation: 'выпускать, генерировать (счёт, отчёт)' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'פ-ו-ק',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מֵפִיק', transcription: 'мефӣк', translation: 'генерирует / выпускаю счёт (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְפִיקָה', transcription: 'мефикá', translation: 'генерирует / выпускаю счёт (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְפִיקִים', transcription: 'мефикӣм', translation: 'генерируют (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְפִיקוֹת', transcription: 'мефикóт', translation: 'генерируют (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הֵפַקְתִּי', transcription: 'hефáкти', translation: 'я выпустил(а) отчёт' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הֵפַקְתָּ', transcription: 'hефáкта', translation: 'ты выпустил' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הֵפַקְתְּ', transcription: 'hефáкт', translation: 'ты выпустила' },
    { pronoun: 'הוּא (он)', hebrew: 'הֵפִיק', transcription: 'hефӣк', translation: 'он выпустил' },
    { pronoun: 'הִיא (она)', hebrew: 'הֵפִיקָה', transcription: 'hефикá', translation: 'она выпустила' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הֵפַקְנוּ', transcription: 'hефáкну', translation: 'мы выпустили' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הֲפַקְתֶּם / הֲפַקְתֶּן', transcription: 'hафактéм / hафактéн', translation: 'вы выпустили' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הֵפִיקוּ', transcription: 'hефикӯ', translation: 'они выпустили' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אָפִיק', transcription: 'афӣк', translation: 'я выпущу отчёт' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תָּפִיק', transcription: 'тафӣк', translation: 'ты выпустишь отчёт' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תָּפִיקִי', transcription: 'тафикӣ', translation: 'ты выпустишь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יָפִיק', transcription: 'йафӣк', translation: 'он выпустит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נָפִיק', transcription: 'нафӣк', translation: 'мы выпустим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תָּפִיקוּ', transcription: 'тафикӯ', translation: 'вы выпустите' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יָפִיקוּ', transcription: 'йафикӯ', translation: 'они выпустят' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הָפֵק', transcription: 'hафéк', translation: 'выпусти отчёт (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הָפִיקִי', transcription: 'hафикӣ', translation: 'выпусти отчёт (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הָפִיקוּ', transcription: 'hафикӯ', translation: 'выпустите отчёт' },
  ],
  rootFamily: [
    { hebrew: 'הֲפָקָה', hebrewPlain: 'הפקה', transcription: 'hафакá', translation: 'генерация счёта, эмиссия', partOfSpeech: 'noun', root: 'פ-ו-ק' },
    { hebrew: 'מֵפִיק', hebrewPlain: 'מפיק', transcription: 'мефӣк', translation: 'эмитент, производитель', partOfSpeech: 'noun', root: 'פ-ו-ק' },
  ],
},

'לקזז': {
  infinitive: { hebrew: 'לְקַזֵּז', transcription: 'леказéз', translation: 'взаимозачитывать, сальдировать' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'ק-ז-ז',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְקַזֵּז', transcription: 'меказéз', translation: 'зачитывает / сальдирую (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְקַזֶּזֶת', transcription: 'меказéзет', translation: 'зачитывает / сальдирую (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְקַזְּזִים', transcription: 'меказзӣм', translation: 'зачитывают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְקַזְּזוֹת', transcription: 'меказзóт', translation: 'зачитывают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'קִזַּזְתִּי', transcription: 'кизáзти', translation: 'я зачёл / сальдировал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'קִזַּזְתָּ', transcription: 'кизáзта', translation: 'ты зачёл' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'קִזַּזְתְּ', transcription: 'кизáзт', translation: 'ты зачла' },
    { pronoun: 'הוּא (он)', hebrew: 'קִזֵּז', transcription: 'кизéз', translation: 'он зачёл' },
    { pronoun: 'הִיא (она)', hebrew: 'קִזְּזָה', transcription: 'киззá', translation: 'она зачла' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'קִזַּזְנוּ', transcription: 'кизáзну', translation: 'мы зачли' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'קִזַּזְתֶּם / קִזַּזְתֶּן', transcription: 'кизазтéм / кизазтéн', translation: 'вы зачли' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'קִזְּזוּ', transcription: 'киззӯ', translation: 'они зачли' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲקַזֵּז', transcription: 'аказéз', translation: 'я зачту налог' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּקַזֵּז', transcription: 'теказéз', translation: 'ты зачтёшь / она зачтёт' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּקַזְּזִי', transcription: 'теказзӣ', translation: 'ты зачтёшь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְקַזֵּז', transcription: 'йеказéз', translation: 'он зачтёт' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְקַזֵּז', transcription: 'неказéз', translation: 'мы зачтём' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּקַזְּזוּ', transcription: 'теказзӯ', translation: 'вы зачтёте' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְקַזְּזוּ', transcription: 'йеказзӯ', translation: 'они зачтут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'קַזֵּז', transcription: 'казéз', translation: 'зачти налог (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'קַזְּזִי', transcription: 'каззӣ', translation: 'зачти налог (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'קַזְּזוּ', transcription: 'каззӯ', translation: 'зачтите' },
  ],
  rootFamily: [
    { hebrew: 'קִזּוּז', hebrewPlain: 'קיזוז', transcription: 'кизу́з', translation: 'взаимозачёт, сальдирование', partOfSpeech: 'noun', root: 'ק-ז-ז' },
    { hebrew: 'מְקֻזָּז', hebrewPlain: 'מקוזז', transcription: 'мекузáз', translation: 'взаимозачтённый', partOfSpeech: 'adjective', root: 'ק-ז-ז' },
  ],
},

'לנכות': {
  infinitive: { hebrew: 'לְנַכּוֹת', transcription: 'ленакóт', translation: 'удерживать, вычитать (налог)' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'נ-כ-ה',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְנַכֶּה', transcription: 'менакé', translation: 'удерживает / вычитаю (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְנַכָּה', transcription: 'менакá', translation: 'удерживает / вычитаю (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְנַכִּים', transcription: 'менакӣм', translation: 'удерживают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְנַכּוֹת', transcription: 'менакóт', translation: 'удерживают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'נִכִּיתִי', transcription: 'никӣти', translation: 'я удержал(а) налог' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'נִכִּיתָ', transcription: 'никӣта', translation: 'ты удержал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'נִכִּית', transcription: 'никӣт', translation: 'ты удержала' },
    { pronoun: 'הוּא (он)', hebrew: 'נִכָּה', transcription: 'никá', translation: 'он удержал' },
    { pronoun: 'הִיא (она)', hebrew: 'נִכְּתָה', transcription: 'никетá', translation: 'она удержала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִכִּינוּ', transcription: 'никӣну', translation: 'мы удержали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'נִכִּיתֶם / נִכִּיתֶן', transcription: 'никитéм / никитéн', translation: 'вы удержали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'נִכּוּ', transcription: 'никӯ', translation: 'они удержали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲנַכֶּה', transcription: 'анакé', translation: 'я удержу налог' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּנַכֶּה', transcription: 'тенакé', translation: 'ты удержишь' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּנַכִּי', transcription: 'тенакӣ', translation: 'ты удержишь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְנַכֶּה', transcription: 'йенакé', translation: 'он удержит' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְנַכֶּה', transcription: 'ненакé', translation: 'мы удержим' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּנַכּוּ', transcription: 'тенакӯ', translation: 'вы удержите' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְנַכּוּ', transcription: 'йенакӯ', translation: 'они удержат' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'נַכֵּה', transcription: 'накé', translation: 'удержи налог (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'נַכִּי', transcription: 'накӣ', translation: 'удержи налог (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'נַכּוּ', transcription: 'накӯ', translation: 'удержите' },
  ],
  rootFamily: [
    { hebrew: 'נִכּוּי', hebrewPlain: 'ניכוי', transcription: 'нику́й', translation: 'вычет, удержание', partOfSpeech: 'noun', root: 'נ-כ-ה' },
    { hebrew: 'נִכּוּי בַּמָּקוֹר', hebrewPlain: 'ניכוי במקור', transcription: 'нику́й бамакóр', translation: 'удержание у источника выплаты', partOfSpeech: 'noun', root: 'נ-כ-ה' },
  ],
},

'לגבות': {
  infinitive: { hebrew: 'לִגְבּוֹת', transcription: 'лигбóт', translation: 'взимать, собирать оплату/долг' },
  binyan: 'פָּעַל (Пааль)',
  root: 'ג-ב-ה',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'גּוֹבֶה', transcription: 'говé', translation: 'взимает / собираю оплату (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'גּוֹבָה', transcription: 'говá', translation: 'взимает / собираю оплату (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'גּוֹבִים', transcription: 'говӣм', translation: 'взимают (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'גּוֹבוֹת', transcription: 'говóт', translation: 'взимают (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'גָּבִיתִי', transcription: 'гавӣти', translation: 'я взыскал(а) / собрал(а)' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'גָּבִיתָ', transcription: 'гавӣта', translation: 'ты взыскал' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'גָּבִית', transcription: 'гавӣт', translation: 'ты взыскала' },
    { pronoun: 'הוּא (он)', hebrew: 'גָּבָה', transcription: 'гавá', translation: 'он взыскал' },
    { pronoun: 'הִיא (она)', hebrew: 'גָּבְתָה', transcription: 'гаветá', translation: 'она взыскала' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'גָּבִינוּ', transcription: 'гавӣну', translation: 'мы взыскали' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'גְּבִיתֶם / גְּבִיתֶן', transcription: 'гвитéм / гвитéн', translation: 'вы взыскали' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'גָּבוּ', transcription: 'гавӯ', translation: 'они взыскали' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֶגְבֶּה', transcription: 'эгбé', translation: 'я взыщу оплату' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תִּגְבֶּה', transcription: 'тигбé', translation: 'ты взыщешь' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תִּגְבִּי', transcription: 'тигбӣ', translation: 'ты взыщешь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יִגְבֶּה', transcription: 'йигбé', translation: 'он взыщет' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נִגְבֶּה', transcription: 'нигбé', translation: 'мы взыщем' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תִּגְבּוּ', transcription: 'тигбӯ', translation: 'вы взыщете' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יִגְבּוּ', transcription: 'йигбӯ', translation: 'они взыщут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'גְּבֵה', transcription: 'гвé', translation: 'взыщи оплату (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'גְּבִי', transcription: 'гвӣ', translation: 'взыщи оплату (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'גְּבוּ', transcription: 'гвӯ', translation: 'взыщите' },
  ],
  rootFamily: [
    { hebrew: 'גְּבִיָּה', hebrewPlain: 'גבייה', transcription: 'гвия', translation: 'взимание, сбор платежей', partOfSpeech: 'noun', root: 'ג-ב-ה' },
    { hebrew: 'גּוֹבֶה', hebrewPlain: 'גובה', transcription: 'говé', translation: 'сборщик платежей / долгов', partOfSpeech: 'noun', root: 'ג-ב-ה' },
  ],
},

'לאזן': {
  infinitive: { hebrew: 'לְאַזֵּן', transcription: 'леазéн', translation: 'сводить баланс, уравновешивать' },
  binyan: 'פִּעֵל (Пиэль)',
  root: 'א-ז-ן',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מְאַזֵּן', transcription: 'меазéн', translation: 'сводит баланс / балансирую (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מְאַזֶּנֶת', transcription: 'меазéнет', translation: 'сводит баланс / балансирую (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מְאַזְּנִים', transcription: 'меазнӣм', translation: 'сводят баланс (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מְאַזְּנוֹת', transcription: 'меазнóт', translation: 'сводят баланс (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אִזַּנְתִּי', transcription: 'изáнти', translation: 'я свёл / свела баланс' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'אִזַּנְתָּ', transcription: 'изáнта', translation: 'ты свёл баланс' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'אִזַּנְתְּ', transcription: 'изáнт', translation: 'ты свела баланс' },
    { pronoun: 'הוּא (он)', hebrew: 'אִזֵּן', transcription: 'изéн', translation: 'он свёл баланс' },
    { pronoun: 'הִיא (она)', hebrew: 'אִזְּנָה', transcription: 'изнá', translation: 'она свела баланс' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'אִזַּנּוּ', transcription: 'изáну', translation: 'мы свели баланс' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'אִזַּנְתֶּם / אִזַּנְתֶּן', transcription: 'изантéм / изантéн', translation: 'вы свели баланс' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'אִזְּנוּ', transcription: 'изнӯ', translation: 'они свели баланс' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אֲאַזֵּן', transcription: 'аазéн', translation: 'я сведу баланс' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תְּאַזֵּן', transcription: 'теазéн', translation: 'ты сведёшь баланс' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תְּאַזְּנִי', transcription: 'теазнӣ', translation: 'ты сведёшь баланс (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יְאַזֵּן', transcription: 'йеазéн', translation: 'он сведёт баланс' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נְאַזֵּן', transcription: 'неазéн', translation: 'мы сведём баланс' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תְּאַזְּנוּ', transcription: 'теазнӯ', translation: 'вы сведёте баланс' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יְאַזְּנוּ', transcription: 'йеазнӯ', translation: 'они сведут баланс' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'אַזֵּן', transcription: 'азéн', translation: 'сведи баланс (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'אַזְּנִי', transcription: 'азнӣ', translation: 'сведи баланс (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'אַזְּנוּ', transcription: 'азнӯ', translation: 'сведите баланс' },
  ],
  rootFamily: [
    { hebrew: 'מַאֲזָן', hebrewPlain: 'מאזן', transcription: 'маазáн', translation: 'бухгалтерский баланс', partOfSpeech: 'noun', root: 'א-ז-ן' },
    { hebrew: 'אִזּוּן', hebrewPlain: 'איזון', transcription: 'изӯн', translation: 'балансировка, равновесие', partOfSpeech: 'noun', root: 'א-ז-ן' },
    { hebrew: 'מְאֻזָּן', hebrewPlain: 'מאוזן', transcription: 'меузáн', translation: 'сбалансированный', partOfSpeech: 'adjective', root: 'א-ז-ן' },
    { hebrew: 'מֹאזְנַיִם', hebrewPlain: 'מאזניים', transcription: 'мознаим', translation: 'весы', partOfSpeech: 'noun', root: 'א-ז-ן' },
  ],
},

'להפקיד': {
  infinitive: { hebrew: 'לְהַפְקִיד', transcription: 'леhафкӣд', translation: 'вносить на банковский счёт, депонировать' },
  binyan: 'הִפְעִיל (Хифиль)',
  root: 'פ-ק-ד',
  present: [
    { pronoun: 'זָכָר יָחִיד (он / я / ты)', hebrew: 'מַפְקִיד', transcription: 'мафкӣд', translation: 'вносит на счёт / вношу (м.р.)' },
    { pronoun: 'נְקֵבָה יְחִידָה (она / я / ты)', hebrew: 'מַפְקִידָה', transcription: 'мафкидá', translation: 'вносит на счёт / вношу (ж.р.)' },
    { pronoun: 'זָכָר רַבִּים (они / мы / вы)', hebrew: 'מַפְקִידִים', transcription: 'мафкидӣм', translation: 'вносят на счёт (м.р.)' },
    { pronoun: 'נְקֵבָה רַבּוֹת (они / мы / вы)', hebrew: 'מַפְקִידוֹת', transcription: 'мафкидóт', translation: 'вносят на счёт (ж.р.)' },
  ],
  past: [
    { pronoun: 'אֲנִי (я)', hebrew: 'הִפְקַדְתִּי', transcription: 'hифкáдти', translation: 'я внёс / внесла на счёт' },
    { pronoun: 'אַתָּה (ты м.р.)', hebrew: 'הִפְקַדְתָּ', transcription: 'hифкáдта', translation: 'ты внёс на счёт' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'הִפְקַדְתְּ', transcription: 'hифкáдт', translation: 'ты внесла на счёт' },
    { pronoun: 'הוּא (он)', hebrew: 'הִפְקִיד', transcription: 'hифкӣд', translation: 'он внёс на счёт' },
    { pronoun: 'הִיא (она)', hebrew: 'הִפְקִידָה', transcription: 'hифкидá', translation: 'она внесла на счёт' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'הִפְקַדְנוּ', transcription: 'hифкáдну', translation: 'мы внесли на счёт' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'הִפְקַדְתֶּם / הִפְקַדְתֶּן', transcription: 'hифкадтéм / hифкадтéн', translation: 'вы внесли на счёт' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'הִפְקִידוּ', transcription: 'hифкидӯ', translation: 'они внесли на счёт' },
  ],
  future: [
    { pronoun: 'אֲנִי (я)', hebrew: 'אַפְקִיד', transcription: 'афкӣд', translation: 'я внесу на счёт' },
    { pronoun: 'אַתָּה / הִיא (ты м.р. / она)', hebrew: 'תַּפְקִיד', transcription: 'тафкӣд', translation: 'ты внесёшь / она внесёт' },
    { pronoun: 'אַתְּ (ты ж.р.)', hebrew: 'תַּפְקִידִי', transcription: 'тафкидӣ', translation: 'ты внесёшь (ж.р.)' },
    { pronoun: 'הוּא (он)', hebrew: 'יַפְקִיד', transcription: 'йафкӣд', translation: 'он внесёт' },
    { pronoun: 'אֲנַחְנוּ (мы)', hebrew: 'נַפְקִיד', transcription: 'нафкӣд', translation: 'мы внесём' },
    { pronoun: 'אַתֶּם / אַתֶּן (вы)', hebrew: 'תַּפְקִידוּ', transcription: 'тафкидӯ', translation: 'вы внесёте' },
    { pronoun: 'הֵם / הֵן (они)', hebrew: 'יַפְקִידוּ', transcription: 'йафкидӯ', translation: 'они внесут' },
  ],
  imperative: [
    { pronoun: 'אַתָּה (м.р.)', hebrew: 'הַפְקֵד', transcription: 'hафкéд', translation: 'внеси на счёт (м.р.)' },
    { pronoun: 'אַתְּ (ж.р.)', hebrew: 'הַפְקִידִי', transcription: 'hафкидӣ', translation: 'внеси на счёт (ж.р.)' },
    { pronoun: 'אַתֶּם / אַתֶּן (мн.ч.)', hebrew: 'הַפְקִידוּ', transcription: 'hафкидӯ', translation: 'внесите на счёт' },
  ],
  rootFamily: [
    { hebrew: 'פִּקָּדוֹן', hebrewPlain: 'פיקדון', transcription: 'пикадóн', translation: 'банковский депозит, залог', partOfSpeech: 'noun', root: 'פ-ק-ד' },
    { hebrew: 'הַפְקָדָה', hebrewPlain: 'הפקדה', transcription: 'hафкадá', translation: 'внесение средств на счёт', partOfSpeech: 'noun', root: 'פ-ק-ד' },
    { hebrew: 'פְּקִיד בַּנְק', hebrewPlain: 'פקיד בנק', transcription: 'пкӣд банк', translation: 'банковский служащий', partOfSpeech: 'noun', root: 'פ-ק-ד' },
    { hebrew: 'תַּפְקִיד', hebrewPlain: 'תפקיד', transcription: 'тафкӣд', translation: 'должность, функция, обязанность', partOfSpeech: 'noun', root: 'פ-ק-ד' },
  ],
},
};