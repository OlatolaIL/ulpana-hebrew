import fs from 'fs';

const filePath = 'src/data/lessons/alef_26_35.ts';
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  // Compound / prefixed phrases
  ['הַדִּירָה מְרֻהֶטֶת', 'הַדִּירָה מְרוּהֶטֶת'],
  ['מְרֻהָט / מְרֻהֶטֶת', 'מְרוּהָט / מְרוּהֶטֶת'],
  ['"hebrewPlain": "מרוהט"', '"hebrewPlain": "מרוהט / מרוהטת"'],
  ['שֻׁתָּף / שֻׁתָּפָה', 'שׁוּתָף / שׁוּתָפָה'],
  ['"hebrewPlain": "שותף"', '"hebrewPlain": "שותף / שותפה"'],
  ['שֻׁתָּפִים', 'שׁוּתָפִים'],
  ['שֵׂעָר', 'שֵׂיעָר'],
  ['עֵינַיִם', 'עֵינַיִּים'],
  ['מִזְוָדוֹת', 'מִזְוָודוֹת'],
  ['מִזְוָדָה', 'מִזְוָודָה'],
  ['סִיסְמָה לַוַּיְי-פַיְי', 'סִיסְמָה לַוַּוייפַיְי'],
  ['חֻפְשָׁה נְעִימָה', 'חוּפְשָׁה נְעִימָה'],
  ['חֻפְשָׁה', 'חוּפְשָׁה'],
  ['עִתּוֹנִים', 'עִיתּוֹנִים'],
  ['עִתּוֹן', 'עִיתּוֹן'],
  ['טִפּוֹת', 'טִיפּוֹת'],
  ['לִפְנֵי הָאֹכֶל', 'לִפְנֵי הָאוֹכֶל'],
  ['אַחֲרֵי הָאֹכֶל', 'אַחֲרֵי הָאוֹכֶל'],
  ['מֻצָּרִים', 'מוּצָרִים'],
  ['מֻצָּר', 'מוּצָר'],
  ['קֻפּוֹת', 'קוּפּוֹת'],
  ['קֻפָּה', 'קוּפָּה'],
  ['זִכּוּי', 'זִיכּוּי'],
  ['כִּוּוּנִים', 'כִּיוּוּנִים'],
  ['כִּוּוּן', 'כִּיוּוּן'],
  ['עִכּוּב / אִחוּר', 'עִיכּוּב / אִיחוּר'],
  ['"hebrewPlain": "עיכוב"', '"hebrewPlain": "עיכוב / איחור"'],
  ['חֳדָשִׁים', 'חוֹדָשִׁים'],
  ['חֹדֶשׁ', 'חוֹדֶשׁ'],
  ['בַּבֹּקֶר', 'בַּבּוֹקֶר'],
];

let totalReplaced = 0;
for (const [from, to] of replacements) {
  const matches = (content.match(new RegExp(from, 'g')) || []).length;
  if (matches > 0) {
    content = content.replaceAll(from, to);
    totalReplaced += matches;
    console.log(`Replaced "${from}" -> "${to}" (${matches} times)`);
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log(`\nDone! Total replacements in ${filePath}: ${totalReplaced}`);
