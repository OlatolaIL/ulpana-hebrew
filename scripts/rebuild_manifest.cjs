/**
 * scripts/rebuild_manifest.cjs
 *
 * Синхронизирует все ключи из public/sentences_male_manifest.tsv и public/sentences_female_manifest.tsv
 * в итоговый public/audio/sentences/manifest.json.
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const manifestPath = path.resolve(repoRoot, 'public/audio/sentences/manifest.json');
const malePath = path.resolve(repoRoot, 'public/sentences_male_manifest.tsv');
const femalePath = path.resolve(repoRoot, 'public/sentences_female_manifest.tsv');

function normalizeKey(text) {
  return text
    .replace(/[\u0591-\u05C7]/g, '')
    .toLowerCase()
    .replace(/[؟?.,!;:״׳"'—«»\-()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};

const maleLines = fs.readFileSync(malePath, 'utf8').split(/\r?\n/).filter((l) => l.trim());
let maleCount = 0;
for (let i = 1; i < maleLines.length; i++) {
  const parts = maleLines[i].split('\t');
  if (parts.length >= 3) {
    const file = parts[1].trim();
    const he = parts[2].trim();
    const k = normalizeKey(he);
    manifest[k] = file;
    maleCount++;
  }
}

const femaleLines = fs.readFileSync(femalePath, 'utf8').split(/\r?\n/).filter((l) => l.trim());
let femaleCount = 0;
for (let i = 1; i < femaleLines.length; i++) {
  const parts = femaleLines[i].split('\t');
  if (parts.length >= 3) {
    const file = parts[1].trim();
    const he = parts[2].trim();
    const k = normalizeKey(he);
    if (file.endsWith('_f.mp3')) {
      manifest[`${k}::female`] = file;
    } else {
      manifest[k] = file;
    }
    femaleCount++;
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
console.log('✅ Манифест успешно синхронизирован!');
console.log('   Всего уникальных ключей:', Object.keys(manifest).length);
console.log('   Мужских фраз учтено:   ', maleCount);
console.log('   Женских фраз учтено:   ', femaleCount);
