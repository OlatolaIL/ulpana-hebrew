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
const doubleConsonantsRegex = /([бвгджзклмнпрстфхцчшщ])\1/i;

const results = [];

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    // Only check lines with transcription property or table rows
    if (line.includes('transcription:') || line.includes('"transcription"') || line.includes('transcription :')) {
      const match = line.match(doubleConsonantsRegex);
      if (match) {
        results.push({
          file: path.relative(path.join(__dirname, '..'), filePath),
          lineNum: index + 1,
          line: line.trim()
        });
      }
    }
    // Also check table rows: ['...', '...', 'transcription', '...']
    if (line.trim().startsWith("['") || line.trim().startsWith('["')) {
      const parts = line.split(',');
      if (parts.length >= 3) {
        const potentialTranscription = parts[parts.length - 2]; // usually 2nd or 3rd
        const match = line.match(doubleConsonantsRegex);
        if (match && !line.includes('title') && !line.includes('headers')) {
          results.push({
            file: path.relative(path.join(__dirname, '..'), filePath),
            lineNum: index + 1,
            line: line.trim()
          });
        }
      }
    }
  });
});

console.log(`Found ${results.length} transcription lines with double consonants:`);
results.forEach(r => console.log(`${r.file}:${r.lineNum} -> ${r.line}`));
