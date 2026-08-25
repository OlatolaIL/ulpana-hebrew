const fs = require('fs');
const path = require('path');

const srcDataDir = path.join(__dirname, '..', 'src', 'data');

function getTsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTsFiles(fullPath));
    } else if (file.endsWith('.ts')) {
      results.push(fullPath);
    }
  });
  return results;
}

const files = getTsFiles(srcDataDir);
const transcriptions = [];

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    const match = line.match(/transcription:\s*['"](.*?)['"]/);
    if (match) {
      transcriptions.push({
        file: path.basename(filePath),
        line: index + 1,
        transcription: match[1],
      });
    }
  });
});

console.log(`Total transcriptions scanned: ${transcriptions.length}`);

// Check double consonants in transcriptions
const doubleConsonants = /([бвгджзклмнпрстфхцчшщ])\1/i;
const problematic = transcriptions.filter(t => doubleConsonants.test(t.transcription));

console.log(`Found ${problematic.length} transcriptions with double consonants:`);
problematic.forEach(p => console.log(`${p.file}:${p.line} -> "${p.transcription}"`));
