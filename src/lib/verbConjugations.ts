import { VerbConjugation } from '@/types';
import { stripNikkud } from './transcription';

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
};

import { RootRelatedWord } from '@/types';
import { findWordsByRoot } from './ulpanDictionary';

// Предустановленные богатые семьи корней (משפחת מילים в стиле Pealim)
export const ROOT_FAMILIES_PRESETS: Record<string, RootRelatedWord[]> = {
  'רצה': [
    { hebrew: 'רָצוֹן', hebrewPlain: 'רצון', transcription: 'рацóн', translation: 'желание, воля (м.р.)', partOfSpeech: 'noun', root: 'ר-צ-ה' },
    { hebrew: 'בְּרָצוֹן', hebrewPlain: 'ברצון', transcription: 'берацóн', translation: 'с удовольствием, охотно', partOfSpeech: 'expression', root: 'ר-צ-ה' },
    { hebrew: 'מְרֻצֶּה', hebrewPlain: 'מרוצה', transcription: 'меруцé', translation: 'довольный, удовлетворенный', partOfSpeech: 'adjective', root: 'ר-צ-ה' },
    { hebrew: 'לְרַצּוֹת', hebrewPlain: 'לרצות', transcription: 'лерацóт', translation: 'угождать, удовлетворять (Пиэль)', partOfSpeech: 'verb', binyan: 'פִּעֵל (Пиэль)', root: 'ר-צ-ה' },
  ],
  'שתה': [
    { hebrew: 'שְׁתִיָּה', hebrewPlain: 'שתיה', transcription: 'штийá', translation: 'питье, напитки (ж.р.)', partOfSpeech: 'noun', root: 'ש-ת-ה' },
    { hebrew: 'מַשְׁקֶה', hebrewPlain: 'משקה', transcription: 'машкé', translation: 'напиток (м.р.)', partOfSpeech: 'noun', root: 'ש-ת-ה' },
    { hebrew: 'שְׁתִיָּה קַלָּה', hebrewPlain: 'שתיה קלה', transcription: 'штийá калá', translation: 'прохладительные напитки', partOfSpeech: 'expression', root: 'ש-ת-ה' },
    { hebrew: 'לְהַשְׁקוֹת', hebrewPlain: 'להשקות', transcription: 'леhашкóт', translation: 'поить, поливать растения (Ифъиль)', partOfSpeech: 'verb', binyan: 'הִפְעִיל (Ифъиль)', root: 'ש-ת-ה' },
  ],
  'כתב': [
    { hebrew: 'מִכְתָּב', hebrewPlain: 'מכתב', transcription: 'михтáв', translation: 'письмо (почтовое)', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'כְּתֹבֶת', hebrewPlain: 'כתובת', transcription: 'ктóвет', translation: 'адрес, надпись', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'כַּתָּב', hebrewPlain: 'כתב', transcription: 'катáв', translation: 'корреспондент, журналист', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'כְּתָב', hebrewPlain: 'כתב', transcription: 'ктав', translation: 'почерк, шрифт, письмо', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'הַכְתָּבָה', hebrewPlain: 'הכתבה', transcription: 'hахтавá', translation: 'диктант (ж.р.)', partOfSpeech: 'noun', root: 'כ-ת-ב' },
    { hebrew: 'לְהַכְתִּיב', hebrewPlain: 'להכתיב', transcription: 'леhахтӣв', translation: 'диктовать (Ифъиль)', partOfSpeech: 'verb', binyan: 'הִפְעִיל (Ифъиль)', root: 'כ-ת-ב' },
    { hebrew: 'לְהִתְכַּתֵּב', hebrewPlain: 'להתכתב', transcription: 'леhиткатéв', translation: 'переписываться (Итпаэль)', partOfSpeech: 'verb', binyan: 'הִתְפַּעֵל (Итпаэль)', root: 'כ-ת-ב' },
  ],
  'למד': [
    { hebrew: 'תַּלְמִיד', hebrewPlain: 'תלמיד', transcription: 'тальмӣд', translation: 'ученик, школьник', partOfSpeech: 'noun', root: 'ל-מ-ד' },
    { hebrew: 'תַּלְמִידָה', hebrewPlain: 'תלמידה', transcription: 'тальмидá', translation: 'ученица', partOfSpeech: 'noun', root: 'ל-מ-ד' },
    { hebrew: 'לִמּוּדִים', hebrewPlain: 'לימודים', transcription: 'лимудӣм', translation: 'учеба, занятия (мн.ч.)', partOfSpeech: 'noun', root: 'ל-מ-ד' },
    { hebrew: 'לְלַמֵּד', hebrewPlain: 'ללמד', transcription: 'леламéд', translation: 'обучать, преподавать (Пиэль)', partOfSpeech: 'verb', binyan: 'פִּעֵל (Пиэль)', root: 'ל-מ-ד' },
    { hebrew: 'מַלְמָד', hebrewPlain: 'מלמד', transcription: 'мельмáд', translation: 'учитель (в хедере)', partOfSpeech: 'noun', root: 'ל-מ-ד' },
  ],
  'דבר': [
    { hebrew: 'דָּבָר', hebrewPlain: 'דבר', transcription: 'давáр', translation: 'вещь, предмет, слово', partOfSpeech: 'noun', root: 'ד-ב-ר' },
    { hebrew: 'דִּבּוּר', hebrewPlain: 'דיבור', transcription: 'дибӯр', translation: 'разговор, речь', partOfSpeech: 'noun', root: 'ד-ב-ר' },
    { hebrew: 'מַדְבֵּרָה', hebrewPlain: 'מדברה', transcription: 'мадберá', translation: 'ораторское искусство', partOfSpeech: 'noun', root: 'ד-ב-р' },
    { hebrew: 'לְהִדָּבֵר', hebrewPlain: 'להידבר', transcription: 'леhидабéр', translation: 'договариваться (Нифъаль)', partOfSpeech: 'verb', binyan: 'נִפְעַל (Нифъаль)', root: 'ד-ב-ר' },
  ],
  'רגש': [
    { hebrew: 'רֶגֶשׁ', hebrewPlain: 'רגש', transcription: 'рéгеш', translation: 'чувство, эмоция', partOfSpeech: 'noun', root: 'ר-ג-ש' },
    { hebrew: 'הַרְגָּשָׁה', hebrewPlain: 'הרגשה', transcription: 'hаргашá', translation: 'самочувствие, ощущение', partOfSpeech: 'noun', root: 'ר-ג-ש' },
    { hebrew: 'רָגִישׁ', hebrewPlain: 'רגיש', transcription: 'рагӣш', translation: 'чувствительный, ранимый', partOfSpeech: 'adjective', root: 'ר-ג-ש' },
    { hebrew: 'הִתְרַגְּשׁוּת', hebrewPlain: 'התרגשות', transcription: 'hитрагшӯт', translation: 'волнение, восторг', partOfSpeech: 'noun', root: 'ר-ג-ש' },
    { hebrew: 'לְהִתְרַגֵּשׁ', hebrewPlain: 'להתרגש', transcription: 'леhитрагéш', translation: 'волновать(ся) (Итпаэль)', partOfSpeech: 'verb', binyan: 'הִתְפַּעֵל (Итпаэль)', root: 'ר-ג-ש' },
  ],
  'לבש': [
    { hebrew: 'לְבוּשׁ', hebrewPlain: 'לבוש', transcription: 'левӯш', translation: 'одежда, наряд', partOfSpeech: 'noun', root: 'ל-ב-ש' },
    { hebrew: 'תִּלְבֹּשֶׁת', hebrewPlain: 'תלבושת', transcription: 'тильбóшет', translation: 'форма (школьная/рабочая)', partOfSpeech: 'noun', root: 'ל-ב-ש' },
    { hebrew: 'לִלְבֹּשׁ', hebrewPlain: 'ללבוש', transcription: 'лильбóш', translation: 'надевать одежду (Пааль)', partOfSpeech: 'verb', binyan: 'פָּעַל (Пааль)', root: 'ל-ב-ש' },
    { hebrew: 'לְהַלְבִּישׁ', hebrewPlain: 'להלביש', transcription: 'леhальбӣш', translation: 'одевать кого-то (Ифъиль)', partOfSpeech: 'verb', binyan: 'הִפְעִיל (Ифъиль)', root: 'ל-ב-ש' },
  ],
};

/**
 * Получение всех однокоренных слов (Семья корня / Pealim Root Family)
 */
export function getRootFamilyWords(root?: string, explicitList?: RootRelatedWord[]): RootRelatedWord[] {
  if (!root) return explicitList || [];
  const cleanRootKey = root.replace(/[^א-ת]/g, '');

  const results: RootRelatedWord[] = [];
  const seen = new Set<string>();

  const addWord = (w: RootRelatedWord) => {
    const plain = stripNikkud(w.hebrewPlain || w.hebrew);
    if (!plain || seen.has(plain)) return;
    seen.add(plain);
    results.push(w);
  };

  // 1. Явный список из параметров
  if (explicitList) {
    explicitList.forEach(addWord);
  }

  // 2. Пресеты
  if (ROOT_FAMILIES_PRESETS[cleanRootKey]) {
    ROOT_FAMILIES_PRESETS[cleanRootKey].forEach(addWord);
  }

  // 3. Поиск по словарю и урокам
  const dictMatches = findWordsByRoot(root);
  for (const m of dictMatches) {
    addWord({
      hebrew: m.hebrew,
      hebrewPlain: m.hebrewPlain || stripNikkud(m.hebrew),
      transcription: m.transcription,
      translation: m.translation,
      partOfSpeech: (m.partOfSpeech as any) || 'other',
      root: m.root || root,
    });
  }

  return results;
}

/**
 * Быстрый поиск таблицы спряжения по любой форме глагола (инфинитив, настоящее, прошедшее, будущее)
 */
export function findOfflineVerbConjugation(query: string): VerbConjugation | null {
  if (!query) return null;
  const clean = stripNikkud(query.trim().toLowerCase());
  if (!clean) return null;

  let matchedVerb: VerbConjugation | null = null;

  // 1. Прямой поиск по ключу инфинитива (без огласовок)
  if (VERB_CONJUGATIONS_DATABASE[clean]) {
    matchedVerb = VERB_CONJUGATIONS_DATABASE[clean];
  } else {
    // 2. Поиск по всем глаголам в базе (проверка всех форм)
    for (const verb of Object.values(VERB_CONJUGATIONS_DATABASE)) {
      if (stripNikkud(verb.infinitive.hebrew).toLowerCase() === clean) {
        matchedVerb = verb;
        break;
      }

      if (verb.root && stripNikkud(verb.root.replace(/-/g, '')).toLowerCase() === clean.replace(/-/g, '')) {
        matchedVerb = verb;
        break;
      }

      if (verb.present.some((f) => stripNikkud(f.hebrew).toLowerCase() === clean)) {
        matchedVerb = verb;
        break;
      }

      if (
        verb.past.some(
          (f) =>
            stripNikkud(f.hebrew).toLowerCase() === clean ||
            f.hebrew.split(' / ').some((sub) => stripNikkud(sub).toLowerCase() === clean)
        )
      ) {
        matchedVerb = verb;
        break;
      }

      if (verb.future.some((f) => stripNikkud(f.hebrew).toLowerCase() === clean)) {
        matchedVerb = verb;
        break;
      }

      if (verb.imperative && verb.imperative.some((f) => stripNikkud(f.hebrew).toLowerCase() === clean)) {
        matchedVerb = verb;
        break;
      }
    }
  }

  if (matchedVerb) {
    const rootFamily = getRootFamilyWords(matchedVerb.root, matchedVerb.rootFamily);
    return {
      ...matchedVerb,
      rootFamily: rootFamily.length > 0 ? rootFamily : undefined,
    };
  }

  return null;
}

