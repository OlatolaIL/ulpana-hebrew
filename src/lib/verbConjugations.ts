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
  'חפש': [
  {
    "hebrew": "חִפּוּשׂ",
    "hebrewPlain": "חיפוש",
    "transcription": "хипӯс",
    "translation": "поиск, обыск (м.р.)",
    "partOfSpeech": "noun",
    "root": "ח-פ-שׂ"
  },
  {
    "hebrew": "מְחֻפָּשׂ",
    "hebrewPlain": "מחופש",
    "transcription": "мехупáс",
    "translation": "переодетый, разыскиваемый",
    "partOfSpeech": "adjective",
    "root": "ח-פ-שׂ"
  },
  {
    "hebrew": "תַּחְפֹּשֶׂת",
    "hebrewPlain": "תחפושת",
    "transcription": "тахпóсет",
    "translation": "маскарадный костюм (ж.р.)",
    "partOfSpeech": "noun",
    "root": "ח-פ-שׂ"
  },
  {
    "hebrew": "לְהִתְחַפֵּשׂ",
    "hebrewPlain": "להתחפש",
    "transcription": "леhитхапéс",
    "translation": "маскироваться, наряжаться в костюм (Итпаэль)",
    "partOfSpeech": "verb",
    "binyan": "הִתְפַּעֵל (Итпаэль)",
    "root": "ח-פ-שׂ"
  }
],
  'בקש': [
  {
    "hebrew": "בַּקָּשָׁה",
    "hebrewPlain": "בקשה",
    "transcription": "бакашá",
    "translation": "просьба, заявление, пожалуйста (ж.р.)",
    "partOfSpeech": "noun",
    "root": "ב-ק-ש"
  },
  {
    "hebrew": "בְּבַקָּשָׁה",
    "hebrewPlain": "בבקשה",
    "transcription": "бевакашá",
    "translation": "пожалуйста, прошу вас",
    "partOfSpeech": "expression",
    "root": "ב-ק-ש"
  },
  {
    "hebrew": "מְבֻקָּשׁ",
    "hebrewPlain": "מבוקש",
    "transcription": "мевукáш",
    "translation": "востребованный, разыскиваемый",
    "partOfSpeech": "adjective",
    "root": "ב-ק-ש"
  }
],
  'שלם': [
  {
    "hebrew": "תַּשְׁלוּם",
    "hebrewPlain": "תשלום",
    "transcription": "ташлӯм",
    "translation": "платеж, оплата (м.р.)",
    "partOfSpeech": "noun",
    "root": "ש-ל-ם"
  },
  {
    "hebrew": "שָׁלוֹם",
    "hebrewPlain": "שלום",
    "transcription": "шалóм",
    "translation": "мир, привет, до свидания",
    "partOfSpeech": "noun",
    "root": "ש-ל-ם"
  },
  {
    "hebrew": "שָׁלֵם",
    "hebrewPlain": "שלם",
    "transcription": "шалéм",
    "translation": "целый, полный",
    "partOfSpeech": "adjective",
    "root": "ש-ל-ם"
  },
  {
    "hebrew": "מֻשְׁלָם",
    "hebrewPlain": "מושלם",
    "transcription": "мушлáм",
    "translation": "идеальный, совершенный",
    "partOfSpeech": "adjective",
    "root": "ש-ל-ם"
  },
  {
    "hebrew": "לְהַשְׁלִים",
    "hebrewPlain": "להשלים",
    "transcription": "леhашлӣм",
    "translation": "завершать, мириться (Ифъиль)",
    "partOfSpeech": "verb",
    "binyan": "הִפְעִיל (Ифъиль)",
    "root": "ש-ל-ם"
  }
],
  'פתח': [
  {
    "hebrew": "פֶּתַח",
    "hebrewPlain": "פתח",
    "transcription": "пéтах",
    "translation": "вход, отверстие (м.р.)",
    "partOfSpeech": "noun",
    "root": "פ-ת-ח"
  },
  {
    "hebrew": "מַפְתֵּחַ",
    "hebrewPlain": "מפתח",
    "transcription": "мафтéах",
    "translation": "ключ (м.р.)",
    "partOfSpeech": "noun",
    "root": "פ-ת-ח"
  },
  {
    "hebrew": "פְּתִיחָה",
    "hebrewPlain": "פתיחה",
    "transcription": "птихá",
    "translation": "открытие, вступление (ж.р.)",
    "partOfSpeech": "noun",
    "root": "פ-ת-ח"
  },
  {
    "hebrew": "פָּתוּחַ",
    "hebrewPlain": "פתוח",
    "transcription": "патӯах",
    "translation": "открытый",
    "partOfSpeech": "adjective",
    "root": "פ-ת-ח"
  }
],
  'סגר': [
  {
    "hebrew": "סְגִירָה",
    "hebrewPlain": "סגירה",
    "transcription": "сгирá",
    "translation": "закрытие (ж.р.)",
    "partOfSpeech": "noun",
    "root": "ס-ג-ר"
  },
  {
    "hebrew": "סָגוּר",
    "hebrewPlain": "סגור",
    "transcription": "сагӯр",
    "translation": "закрытый",
    "partOfSpeech": "adjective",
    "root": "ס-ג-ר"
  },
  {
    "hebrew": "מִסְגֶּרֶת",
    "hebrewPlain": "מסגרת",
    "transcription": "мисгéрет",
    "translation": "рамка, формат (ж.р.)",
    "partOfSpeech": "noun",
    "root": "ס-ג-ר"
  }
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
  const clean = stripNikkud(query.trim().toLowerCase()).replace(/["'״׳\-–—]/g, '');
  if (!clean) return null;

  let matchedVerb: VerbConjugation | null = null;

  // 1. Прямой поиск по ключу инфинитива
  if (VERB_CONJUGATIONS_DATABASE[clean]) {
    matchedVerb = VERB_CONJUGATIONS_DATABASE[clean];
  } else if (!clean.startsWith('ל') && VERB_CONJUGATIONS_DATABASE['ל' + clean]) {
    // 1b. Поиск без начальной 'ל' (например 'חפש' -> 'לחפש')
    matchedVerb = VERB_CONJUGATIONS_DATABASE['ל' + clean];
  } else {
    // 2. Поиск по всем глаголам в базе (инфинитив, корень, формы)
    for (const [, verb] of Object.entries(VERB_CONJUGATIONS_DATABASE)) {
      if (stripNikkud(verb.infinitive.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean) {
        matchedVerb = verb;
        break;
      }
      if (verb.root && stripNikkud(verb.root.replace(/[^א-ת]/g, '')).toLowerCase() === clean.replace(/[^א-ת]/g, '')) {
        matchedVerb = verb;
        break;
      }
      if (verb.present && verb.present.some((f) => stripNikkud(f.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean)) {
        matchedVerb = verb;
        break;
      }
      if (
        verb.past &&
        verb.past.some(
          (f) =>
            stripNikkud(f.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean ||
            f.hebrew.split(' / ').some((sub) => stripNikkud(sub).toLowerCase().replace(/["'״׳]/g, '') === clean)
        )
      ) {
        matchedVerb = verb;
        break;
      }
      if (verb.future && verb.future.some((f) => stripNikkud(f.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean)) {
        matchedVerb = verb;
        break;
      }
      if (verb.imperative && verb.imperative.some((f) => stripNikkud(f.hebrew).toLowerCase().replace(/["'״׳]/g, '') === clean)) {
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
