import fs from 'fs';
import path from 'path';
import { getAllSystemSentences, SentenceDrillItem } from '../src/lib/audioSentencesCatalog';

interface ExportRow {
  index: number;
  voiceGender: 'MALE' | 'FEMALE';
  genderCategory: string;
  fileName: string;
  sentenceHe: string;
  sentenceTranscription: string;
  sentenceRu: string;
  categoryName: string;
  targetWord: string;
}

const allBase = getAllSystemSentences();
const rows: ExportRow[] = [];

let counter = 1;

// 1. Process base sentences (2,475)
for (const item of allBase) {
  const isMaleSpeech =
    item.genderCategory === 'first_person' ||
    item.genderCategory === 'second_person_m' ||
    item.genderCategory === 'third_person_m';

  const voiceGender: 'MALE' | 'FEMALE' = isMaleSpeech ? 'MALE' : 'FEMALE';

  let catLabel = 'Нейтральные / Безличные';
  if (item.genderCategory === 'first_person') catLabel = '1-е лицо м.р. (אני רוצה)';
  else if (item.genderCategory === 'second_person_m') catLabel = '2-е лицо м.р. (אתה יודע)';
  else if (item.genderCategory === 'third_person_m') catLabel = '3-е лицо м.р. (הוא / דוד)';
  else if (item.genderCategory === 'third_person_f') catLabel = '3-е лицо ж.р. (היא / שרה)';
  else if (item.genderCategory === 'second_person_f') catLabel = '2-е лицо ж.р. (את)';

  rows.push({
    index: counter++,
    voiceGender,
    genderCategory: catLabel,
    fileName: item.fileName,
    sentenceHe: item.sentenceHe,
    sentenceTranscription: item.sentenceTranscription || '',
    sentenceRu: item.sentenceRu,
    categoryName: item.categoryRu,
    targetWord: item.targetWord || '',
  });

  // 2. If it has female variant (213 items), add it as explicit FEMALE track
  if (item.isGenderSensitive && item.femaleVariant) {
    const fv = item.femaleVariant;
    rows.push({
      index: counter++,
      voiceGender: 'FEMALE',
      genderCategory: 'Женская форма (адаптация 1/2 л.)',
      fileName: fv.fileName,
      sentenceHe: fv.sentenceHe,
      sentenceTranscription: fv.sentenceTranscription || '',
      sentenceRu: item.sentenceRu,
      categoryName: item.categoryRu,
      targetWord: item.targetWord || '',
    });
  }
}

console.log(`Total synthesized tracks registered: ${rows.length}`);
const maleRows = rows.filter(r => r.voiceGender === 'MALE');
const femaleRows = rows.filter(r => r.voiceGender === 'FEMALE');
console.log(`MALE voice tracks: ${maleRows.length}`);
console.log(`FEMALE voice tracks: ${femaleRows.length}`);

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');

// --- 1. FULL REGISTRY TXT ---
const fullTxtLines = rows.map(r => 
  `${r.index.toString().padStart(4, ' ')}. [${r.voiceGender}] [${r.fileName}] ${r.sentenceHe} | ${r.sentenceTranscription} | ${r.sentenceRu}`
);
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_full_registry.txt'), fullTxtLines.join('\n'), 'utf-8');

// --- 2. MALE TEXT FILE (Numbered + Hebrew with nikud) ---
const maleTxtLines = maleRows.map((r, i) => `${i + 1}. ${r.sentenceHe}`);
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_male.txt'), maleTxtLines.join('\n'), 'utf-8');

// --- 3. FEMALE TEXT FILE (Numbered + Hebrew with nikud) ---
const femaleTxtLines = femaleRows.map((r, i) => `${i + 1}. ${r.sentenceHe}`);
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_female.txt'), femaleTxtLines.join('\n'), 'utf-8');

// --- 4. CSV FULL REGISTRY (Excel UTF-8 BOM) ---
const csvHeader = 'Index;VoiceGender;Category;FileName;SentenceHebrew;SentenceTranscription;SentenceRussian;Group;TargetWord\n';
const csvLines = rows.map(r => {
  const sanitize = (s: string) => `"${s.replace(/"/g, '""')}"`;
  return [
    r.index,
    r.voiceGender,
    sanitize(r.genderCategory),
    r.fileName,
    sanitize(r.sentenceHe),
    sanitize(r.sentenceTranscription),
    sanitize(r.sentenceRu),
    sanitize(r.categoryName),
    sanitize(r.targetWord),
  ].join(';');
});
const BOM = '\uFEFF';
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_full_registry.csv'), BOM + csvHeader + csvLines.join('\n'), 'utf-8');

// --- 5. TSV FULL REGISTRY ---
const tsvHeader = 'Index\tVoiceGender\tCategory\tFileName\tSentenceHebrew\tSentenceTranscription\tSentenceRussian\tGroup\tTargetWord\n';
const tsvLines = rows.map(r => [
  r.index,
  r.voiceGender,
  r.genderCategory,
  r.fileName,
  r.sentenceHe,
  r.sentenceTranscription,
  r.sentenceRu,
  r.categoryName,
  r.targetWord,
].join('\t'));
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_full_registry.tsv'), BOM + tsvHeader + tsvLines.join('\n'), 'utf-8');

// --- 6. MALE MANIFEST TSV (for batch mapping) ---
const maleManifestHeader = 'Index\tFileName\tSentenceHebrew\tTranscription\tRussian\n';
const maleManifestLines = maleRows.map((r, i) => [
  i + 1,
  r.fileName,
  r.sentenceHe,
  r.sentenceTranscription,
  r.sentenceRu,
].join('\t'));
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_male_manifest.tsv'), BOM + maleManifestHeader + maleManifestLines.join('\n'), 'utf-8');

// --- 7. FEMALE MANIFEST TSV (for batch mapping) ---
const femaleManifestHeader = 'Index\tFileName\tSentenceHebrew\tTranscription\tRussian\n';
const femaleManifestLines = femaleRows.map((r, i) => [
  i + 1,
  r.fileName,
  r.sentenceHe,
  r.sentenceTranscription,
  r.sentenceRu,
].join('\t'));
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_female_manifest.tsv'), BOM + femaleManifestHeader + femaleManifestLines.join('\n'), 'utf-8');

// Also write copies to artifacts directory
const ARTIFACTS_DIR = 'C:\\Users\\azrie\\.gemini\\antigravity\\brain\\71381168-613c-4ea2-bb00-d7e800bbc235';
if (fs.existsSync(ARTIFACTS_DIR)) {
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'sentences_male.txt'), maleTxtLines.join('\n'), 'utf-8');
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'sentences_female.txt'), femaleTxtLines.join('\n'), 'utf-8');
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'sentences_male_manifest.tsv'), BOM + maleManifestHeader + maleManifestLines.join('\n'), 'utf-8');
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'sentences_female_manifest.tsv'), BOM + femaleManifestHeader + femaleManifestLines.join('\n'), 'utf-8');
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'sentences_full_registry.csv'), BOM + csvHeader + csvLines.join('\n'), 'utf-8');
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'sentences_full_registry.txt'), fullTxtLines.join('\n'), 'utf-8');
}

console.log('Successfully generated all export files!');

