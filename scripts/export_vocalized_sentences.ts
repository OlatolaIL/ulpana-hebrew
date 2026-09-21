import fs from 'fs';
import path from 'path';
import { getAllSystemSentences } from '../src/lib/audioSentencesCatalog';

const ROOT = path.resolve(process.cwd());
const ARTIFACT_DIR = path.resolve('C:/Users/azrie/.gemini/antigravity/brain/71381168-613c-4ea2-bb00-d7e800bbc235');
const PUBLIC_DIR = path.resolve(ROOT, 'public');

const all = getAllSystemSentences();
console.log('Total sentences to export:', all.length);

// 1. Простой текстовый список: номер и фраза с огласовками
// Идеально для вставки пачками в онлайн-диктофон / TTS
const txtLines = all.map((s, idx) => (idx + 1) + '. ' + s.sentenceHe);
const txtContent = txtLines.join('\n');

// 2. TSV (Tab-Separated): Номер <TAB> Фраза <TAB> Перевод <TAB> Имя файла
const tsvLines = [
  '#\tsentenceHe\tsentenceRu\tfileName\tvoice',
  ...all.map((s, idx) => {
    const isFemale =
      s.defaultVoice === 'he-IL-HilaNeural' ||
      s.genderCategory === 'second_person_f' ||
      s.genderCategory === 'third_person_f' ||
      s.sentenceHe.startsWith('הִיא') ||
      s.sentenceHe.includes('אַתְּ ') ||
      s.category === 'mom';
    const voice = isFemale ? 'female' : 'male';
    return [idx + 1, s.sentenceHe, s.sentenceRu, s.fileName, voice].join('\t');
  }),
];
const tsvContent = tsvLines.join('\n');

// 3. CSV (Excel с UTF-8 BOM)
function escapeCsv(str: string) {
  return '"' + (str || '').replace(/"/g, '""') + '"';
}

const csvLines = [
  'Номер,Иврит с огласовками,Русский перевод,Категория,Имя аудиофайла,Рекомендуемый голос',
  ...all.map((s, idx) => {
    const isFemale =
      s.defaultVoice === 'he-IL-HilaNeural' ||
      s.genderCategory === 'second_person_f' ||
      s.genderCategory === 'third_person_f' ||
      s.sentenceHe.startsWith('הִיא') ||
      s.sentenceHe.includes('אַתְּ ') ||
      s.category === 'mom';
    const voice = isFemale ? 'Женский' : 'Мужской';
    return [
      idx + 1,
      escapeCsv(s.sentenceHe),
      escapeCsv(s.sentenceRu),
      escapeCsv(s.categoryRu || s.category),
      escapeCsv(s.fileName),
      escapeCsv(voice),
    ].join(',');
  }),
];
const BOM = '\uFEFF';
const csvContent = BOM + csvLines.join('\r\n');

// Сохраняем в public/
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_vocalized.txt'), txtContent, 'utf8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_vocalized.tsv'), tsvContent, 'utf8');
fs.writeFileSync(path.join(PUBLIC_DIR, 'sentences_vocalized.csv'), csvContent, 'utf8');

// Сохраняем в артефакты диалога
if (!fs.existsSync(ARTIFACT_DIR)) fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
fs.writeFileSync(path.join(ARTIFACT_DIR, 'sentences_vocalized.txt'), txtContent, 'utf8');
fs.writeFileSync(path.join(ARTIFACT_DIR, 'sentences_vocalized.tsv'), tsvContent, 'utf8');
fs.writeFileSync(path.join(ARTIFACT_DIR, 'sentences_vocalized.csv'), csvContent, 'utf8');

console.log('✅ Экспорт успешно завершён!');
console.log('1. sentences_vocalized.txt —', txtLines.length, 'строк');
console.log('2. sentences_vocalized.tsv —', tsvLines.length, 'строк');
console.log('3. sentences_vocalized.csv —', csvLines.length, 'строк');
