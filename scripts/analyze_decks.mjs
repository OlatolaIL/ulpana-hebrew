import fs from 'fs';
import path from 'path';

const files = [
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

const HOLAM_HASER = /([^\u05D5])\u05B9/g;
const KUBBUTZ = /([^\u05D5])\u05BB/g;

for (const f of files) {
  const content = fs.readFileSync(f, 'utf8');
  const lines = content.split('\n');
  console.log(`\n=================== ${path.basename(f)} ===================`);
  
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const hm = l.match(/hebrew["']?\s*:\s*['"`](.*?)['"`]/);
    if (!hm) continue;
    const h = hm[1];

    const holamMatches = [...h.matchAll(HOLAM_HASER)];
    const kubbutzMatches = [...h.matchAll(KUBBUTZ)];
    
    // We can also check if hebrew has defective patterns
    if (holamMatches.length > 0 || kubbutzMatches.length > 0) {
      console.log(`L${i + 1}: ${h}`);
      if (holamMatches.length > 0) console.log(`   -> Holam haser: ${holamMatches.map(m => m[0]).join(', ')}`);
      if (kubbutzMatches.length > 0) console.log(`   -> Kubbutz: ${kubbutzMatches.map(m => m[0]).join(', ')}`);
    }
  }
}
