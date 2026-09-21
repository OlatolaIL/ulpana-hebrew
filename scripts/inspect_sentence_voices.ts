import { getAllSystemSentences } from '../src/lib/audioSentencesCatalog';
import { stripNikkud } from '../src/lib/transcription';

const all = getAllSystemSentences();

// Let's examine:
// What makes a sentence strictly MALE speech?
// 1. First person masculine base: "אֲנִי רוֹצֶה", "אֲנִי אוֹכֵל", "אֲנִי קוֹרֵא", etc. (211 items)
// 2. Second person masculine base: "אַתָּה יוֹדֵעַ", "אַתָּה שׁוֹתֶה", etc. (29 items)
// 3. Third person masculine: "הוּא אָכַל", "דָּוִד הוֹלֵךְ", "יוֹסִי", "הַיֶּלֶד" (259 items)
// Total male speech = 499 items.

// What makes a sentence strictly FEMALE speech?
// 1. Female variants for 1st person: "אֲנִי רוֹצָה", "אֲנִי אוֹכֶלֶת", etc. (211 items)
// 2. Female variants for 2nd person: "אַתְּ יוֹדַעַת", etc. (2 items)
// 3. Third person feminine base: "הִיא אָכְלָה", "שָׂרָה הוֹלֶכֶת", "אִמָּא בַּבַּיִת", etc. (64 items)
// 4. Second person feminine base (where text has אַתְּ): e.g. "אַתְּ"

// "все остальное давай женским":
// All neutral sentences, questions, nouns, prepositions, plural, impersonal:
// They are voiced by FEMALE voice!

console.log('Total base sentences in catalog:', all.length);
const femaleVariants = all.filter(s => s.isGenderSensitive && s.femaleVariant);
console.log('Female variants:', femaleVariants.length);
console.log('Total entries:', all.length + femaleVariants.length);
