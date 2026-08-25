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
const targets = [
  /áбба/g, /а́бба/g, /абба/gi,
  /ӣмма/g, /и́мма/g, /имма/gi,
  /сáбба/g, /са́бба/g, /сабба/gi,
  /калáтти/g, /калатти/gi,
  /hэссэ́г/g, /hэссэг/gi, /hэссег/gi
];

const occurrences = [];

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    targets.forEach(t => {
      if (t.test(line)) {
        occurrences.push({
          file: path.relative(path.join(__dirname, '..'), filePath),
          lineNum: index + 1,
          line: line.trim()
        });
      }
    });
  });
});

// Remove duplicates in occurrences by file:lineNum
const unique = [];
const seen = new Set();
occurrences.forEach(o => {
  const key = `${o.file}:${o.lineNum}`;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(o);
  }
});

console.log(`Found ${unique.length} lines matching targets:`);
unique.forEach(u => console.log(`${u.file}:${u.lineNum} -> ${u.line}`));
