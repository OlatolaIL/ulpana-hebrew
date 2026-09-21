import { getAllSystemSentences } from '../src/lib/audioSentencesCatalog';
import { stripNikkud } from '../src/lib/transcription';

const all = getAllSystemSentences();

const s2f = all.filter(s => s.genderCategory === 'second_person_f');
console.log('Total categorized as second_person_f:', s2f.length);

// Let's see how many actually start with אַתְּ vs contain אֶת
let actuallyAt = 0;
let actuallyEt = 0;
for (const s of s2f) {
  if (s.sentenceHe.startsWith('אַתְּ ') || s.sentenceHe.startsWith('אַתְּ,') || s.sentenceHe.includes(' אַתְּ ')) {
    actuallyAt++;
  } else {
    actuallyEt++;
  }
}
console.log('Actually אַתְּ (you f):', actuallyAt);
console.log('Actually אֶת (et - accusative preposition):', actuallyEt);

// Also let's check if any start with הוא / היא but have את
const thirdPersonWithEt = s2f.filter(s => {
  const p = stripNikkud(s.sentenceHe).trim();
  return p.startsWith('הוא ') || p.startsWith('היא ') || p.startsWith('דוד ') || p.startsWith('שרה ');
});
console.log('Sentences starting with הוא/היא/etc but trapped in second_person_f because of את:', thirdPersonWithEt.length);
if (thirdPersonWithEt.length > 0) {
  console.log('Examples:');
  thirdPersonWithEt.slice(0, 5).forEach(s => console.log(' - ', s.sentenceHe));
}
