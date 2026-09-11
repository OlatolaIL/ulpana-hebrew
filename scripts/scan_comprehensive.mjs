import fs from 'fs';
import path from 'path';

const NIKUD = /[\u05B0-\u05C7\uFB1D-\uFB4E]/g;
function countChar(s, c) { return (s.match(new RegExp(c, 'g')) || []).length; }

const allDataFiles = [
  'src/data/alphabetData.ts',
  'src/data/dialogueLessons.ts',
  'src/data/dialogues/dialogues_01_10.ts',
  'src/data/dialogues/dialogues_11_25.ts',
  'src/data/guideContent.ts',
  'src/data/hebrewStrokeRules.ts',
  'src/data/lessonsData.ts',
  'src/data/phoneScenarios.ts',
  'src/data/spokenHebrewCatalog.ts',
  'src/data/lessons/alef_01_10.ts',
  'src/data/lessons/alef_11_25.ts',
  'src/data/lessons/alef_26_35.ts',
  'src/data/lessons/alef_36_50.ts',
  'src/data/lessons/bet_51_65.ts',
  'src/data/lessons/bet_66_80.ts',
  'src/data/lessons/bet_81_90.ts',
  'src/data/lessons/bet_91_100.ts',
  'src/data/professionalDecks/accounting.ts',
  'src/data/professionalDecks/autoRepair.ts',
  'src/data/professionalDecks/caregiver.ts',
  'src/data/professionalDecks/doctor.ts',
  'src/data/professionalDecks/kindergarten.ts',
  'src/data/thematicDecks/advanced.ts',
  'src/data/thematicDecks/cityAndPeople.ts',
  'src/data/thematicDecks/foodAndHome.ts',
  'src/data/thematicDecks/health.ts',
  'src/data/thematicDecks/verbs.ts',
];

let grandTotal = 0;
const resultsByFile = {};

for (const f of allDataFiles) {
  if (!fs.existsSync(f)) continue;
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  const fileIssues = [];

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    
    // Check if hebrew and hebrewPlain are on the same line
    const sameLineMatch = l.match(/["']?hebrew["']?\s*:\s*['"`](.*?)['"`].*?["']?hebrewPlain["']?\s*:\s*['"`](.*?)['"`]/);
    let hebrew = null;
    let plain = null;
    let plainLine = i + 1;

    if (sameLineMatch) {
      hebrew = sameLineMatch[1];
      plain = sameLineMatch[2];
    } else {
      const hm = l.match(/["']?hebrew["']?\s*:\s*['"`](.*?)['"`]/);
      if (hm) {
        hebrew = hm[1];
        // Look in subsequent lines
        for (let j = i + 1; j < Math.min(lines.length, i + 15); j++) {
          const pm = lines[j].match(/["']?hebrewPlain["']?\s*:\s*['"`](.*?)['"`]/);
          if (pm) {
            plain = pm[1];
            plainLine = j + 1;
            break;
          }
          // If we hit another item id, stop searching
          if (lines[j].match(/^\s*\{?\s*["']?id["']?\s*:/)) break;
        }
      }
    }

    if (!hebrew || !plain) continue;

    const stripped = hebrew.replace(NIKUD, '');
    const vDiff = countChar(plain, 'ו') - countChar(stripped, 'ו');
    const yDiff = countChar(plain, 'י') - countChar(stripped, 'י');

    if (vDiff > 0 || yDiff > 0) {
      fileIssues.push({
        line: i + 1,
        plainLine,
        hebrew,
        stripped,
        plain,
        missingV: vDiff > 0 ? vDiff : 0,
        missingY: yDiff > 0 ? yDiff : 0,
      });
    }
  }

  if (fileIssues.length > 0) {
    resultsByFile[f] = fileIssues;
    grandTotal += fileIssues.length;
    console.log(`\n--- [${f}] (${fileIssues.length} issues) ---`);
    for (const issue of fileIssues) {
      console.log(`L${issue.line}: "${issue.hebrew}" (stripped: "${issue.stripped}") vs "${issue.plain}" (L${issue.plainLine}) | missing: ${issue.missingV ? issue.missingV + ' ו ' : ''}${issue.missingY ? issue.missingY + ' י' : ''}`);
    }
  }
}

console.log(`\n========================================`);
console.log(`GRAND TOTAL ACROSS ALL DATA FILES: ${grandTotal}`);
console.log(`========================================\n`);

fs.writeFileSync('scripts/comprehensive_scan_results.json', JSON.stringify(resultsByFile, null, 2));
