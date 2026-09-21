import { getAllSystemSentences } from '../src/lib/audioSentencesCatalog';

const all = getAllSystemSentences();

const stats: Record<string, number> = {};
let maleVoiceCount = 0;
let femaleVoiceCount = 0;

for (const s of all) {
  const cat = s.genderCategory || 'neutral';
  stats[cat] = (stats[cat] || 0) + 1;
}

console.log('Category distribution of 2,475 base sentences:');
console.table(stats);

// Now calculate voices based on user principle:
// "там где мужская мужским - все остальное давай женским"
//
// Let's see:
// If sentence is 1st person masculine (e.g. אני רוצה / אני אוכל) -> MALE
// If sentence is 2nd person masculine (e.g. אתה יודע) -> MALE
// If sentence is 3rd person masculine (e.g. הוא אכל, דוד הולך) -> MALE
// Everything else (neutral, 3rd person female, impersonal, nouns, prepositions) -> FEMALE
// AND the 213 female variants (אני רוצה, את יודעת) -> FEMALE

let baseMaleCount = 0;
let baseFemaleCount = 0;

for (const s of all) {
  const cat = s.genderCategory || 'neutral';
  if (cat === 'first_person' || cat === 'second_person_m' || cat === 'third_person_m') {
    baseMaleCount++;
  } else {
    baseFemaleCount++;
  }
}

const femaleVariantsCount = all.filter((s) => s.isGenderSensitive && s.femaleVariant).length;

console.log('--- Voice Allocation Breakdown ---');
console.log(`Base Masculine sentences (voiced by MALE): ${baseMaleCount}`);
console.log(`Base Feminine/Neutral/Impersonal (voiced by FEMALE): ${baseFemaleCount}`);
console.log(`Female variants for 1st/2nd person (voiced by FEMALE): ${femaleVariantsCount}`);
console.log(`Total MALE audio tracks: ${baseMaleCount}`);
console.log(`Total FEMALE audio tracks: ${baseFemaleCount + femaleVariantsCount}`);
console.log(`Total ALL audio tracks: ${baseMaleCount + baseFemaleCount + femaleVariantsCount}`);
