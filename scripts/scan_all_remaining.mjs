import fs from 'fs';
import path from 'path';

const otherFiles = [
  'src/data/spokenHebrewCatalog.ts',
  'src/data/phoneScenarios.ts',
  'src/data/alphabetData.ts',
  'src/data/guideContent.ts',
  'src/data/thematicDecks/advanced.ts',
  'src/data/thematicDecks/cityAndPeople.ts',
  'src/data/thematicDecks/foodAndHome.ts',
  'src/data/thematicDecks/health.ts',
  'src/data/thematicDecks/verbs.ts',
  'src/data/professionalDecks/accounting.ts',
  'src/data/professionalDecks/autoRepair.ts',
  'src/data/professionalDecks/caregiver.ts',
  'src/data/professionalDecks/doctor.ts',
  'src/data/professionalDecks/kindergarten.ts',
];

const NIKUD = /[\u05B0-\u05C7\uFB1D-\uFB4E]/g;
function countChar(s, c) { return (s.match(new RegExp(c, 'g')) || []).length; }

let grandTotal = 0;

for (const f of otherFiles) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  let fileCount = 0;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const hm = l.match(/["']?hebrew["']?\s*:\s*['"`](.*?)['"`]/);
    if (!hm) continue;
    const hebrew = hm[1];

    let plain = null;
    let plainLine = -1;
    for (let j = i + 1; j < Math.min(lines.length, i + 10); j++) {
      const pm = lines[j].match(/["']?hebrewPlain["']?\s*:\s*['"`](.*?)['"`]/);
      if (pm) { plain = pm[1]; plainLine = j + 1; break; }
      if (lines[j].match(/["']?id["']?\s*:/)) break;
    }
    if (!plain) continue;

    const stripped = hebrew.replace(NIKUD, '');
    const vDiff = countChar(plain, 'ו') - countChar(stripped, 'ו');
    const yDiff = countChar(plain, 'י') - countChar(stripped, 'י');
    if (vDiff > 0 || yDiff > 0) {
      fileCount++;
      grandTotal++;
      console.log(`[${path.basename(f)}] L${i + 1}: "${hebrew}" ("${stripped}") vs "${plain}" (L${plainLine}) | missing: ${vDiff > 0 ? vDiff + ' ו ' : ''}${yDiff > 0 ? yDiff + ' י' : ''}`);
    }
  }
  if (fileCount > 0) {
    console.log(`--> ${f}: ${fileCount} issues\n`);
  }
}

console.log(`\n========================================`);
console.log(`Grand total remaining across decks: ${grandTotal}`);
console.log(`========================================\n`);
