import { getAllSystemSentences } from '../src/lib/audioSentencesCatalog';
import { stripNikkud } from '../src/lib/transcription';
import { getVerbPresentMap } from '../src/lib/drills/sentenceGenderAdapter';

const all = getAllSystemSentences();

function testCategorize(sentenceHe: string, sentenceTranscription: string = '') {
  const plain = stripNikkud(sentenceHe).trim();

  // 1. ПЕРВОЕ ЛИЦО: "אני ..."
  const isFirstPerson = plain.startsWith('אני ') || plain.includes(' אני ');
  if (isFirstPerson) {
    return 'first_person';
  }

  // 2. ВТОРОЕ ЛИЦО МУЖСКОЙ РОД: "אתה ..."
  const isSecondPersonM = plain.startsWith('אתה ') || plain.includes(' אתה ');
  if (isSecondPersonM) {
    return 'second_person_m';
  }

  // 3. ТРЕТЬЕ ЛИЦО МУЖСКОЙ РОД (Он, Давид, Мальчик и т.д.)
  if (
    plain.startsWith('הוא ') ||
    plain.startsWith('דוד ') ||
    plain.startsWith('יוסי ') ||
    plain.startsWith('הילד ') ||
    plain.includes(' הוא ')
  ) {
    return 'third_person_m';
  }

  // 4. ТРЕТЬЕ ЛИЦО ЖЕНСКИЙ РОД (Она, Сара, Мама, Девочка и т.д.)
  if (
    plain.startsWith('היא ') ||
    plain.startsWith('שרה ') ||
    plain.startsWith('אמא ') ||
    plain.startsWith('רחל ') ||
    plain.startsWith('הילדה ') ||
    plain.startsWith('המורה ') ||
    plain.includes(' היא ')
  ) {
    return 'third_person_f';
  }

  // 5. ВТОРОЕ ЛИЦО ЖЕНСКИЙ РОД (אַתְּ - ты ж.р., исключая אֶת предлог винительного падежа)
  const isSecondPersonF =
    sentenceHe.startsWith('אַתְּ ') ||
    sentenceHe.startsWith('אַתְּ,') ||
    sentenceHe.includes(' אַתְּ ') ||
    (plain.startsWith('את ') && !sentenceHe.startsWith('אֶת '));

  if (isSecondPersonF) {
    return 'second_person_f';
  }

  // 6. НЕЙТРАЛЬНЫЕ / БЕЗЛИЧНЫЕ
  return 'neutral';
}

const stats: Record<string, number> = {};
for (const s of all) {
  const cat = testCategorize(s.sentenceHe, s.sentenceTranscription);
  stats[cat] = (stats[cat] || 0) + 1;
}

console.log('Refined distribution:');
console.table(stats);

// Compute voices with user rule:
// "там где женская речь - мы озвучиваем женским, там где мужская мужским - все остальное давай женским"
let maleCount = 0;
let femaleCount = 0;

for (const s of all) {
  const cat = testCategorize(s.sentenceHe, s.sentenceTranscription);
  if (cat === 'first_person' || cat === 'second_person_m' || cat === 'third_person_m') {
    maleCount++;
  } else {
    // third_person_f, second_person_f, neutral
    femaleCount++;
  }
}

const femaleVariantsCount = all.filter(s => s.isGenderSensitive && s.femaleVariant).length;

console.log(`Male speech tracks: ${maleCount}`);
console.log(`Female speech + Neutral tracks: ${femaleCount}`);
console.log(`Female variants (1st/2nd person): ${femaleVariantsCount}`);
console.log(`Total MALE audio files: ${maleCount}`);
console.log(`Total FEMALE audio files: ${femaleCount + femaleVariantsCount}`);
console.log(`Total ALL: ${maleCount + femaleCount + femaleVariantsCount}`);
