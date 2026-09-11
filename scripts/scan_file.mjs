import fs from 'fs';

const targetFile = process.argv[2];
if (!targetFile || !fs.existsSync(targetFile)) {
  console.error('File not found:', targetFile);
  process.exit(1);
}

const NIKUD = /[\u05B0-\u05C7\uFB1D-\uFB4E]/g;
function countChar(s, c) { return (s.match(new RegExp(c, 'g')) || []).length; }

const content = fs.readFileSync(targetFile, 'utf8');
const lines = content.split('\n');
console.log(`\n=== Scanning ${targetFile} ===`);
let count = 0;

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
    count++;
    console.log(`Line ${i + 1}: "${hebrew}" (stripped: "${stripped}") vs "${plain}" (L${plainLine}) | missing: ${vDiff > 0 ? vDiff + ' ו ' : ''}${yDiff > 0 ? yDiff + ' י' : ''}`);
  }
}

console.log(`\nTotal found: ${count}`);
