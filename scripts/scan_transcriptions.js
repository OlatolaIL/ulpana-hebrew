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
const pattern = /(бб|мм|лл|пп|тт|кк|дд|сс|рр|вв|нн|гг|зз|жж|цц|чч|שש)/gi;

const matches = [];

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (line.includes('transcription') || line.includes("'") || line.includes('"')) {
      // Find matches in strings
      const stringMatches = line.match(/(['"])(.*?)\1/g);
      if (stringMatches) {
        stringMatches.forEach(str => {
          if (pattern.test(str)) {
            matches.push({
              file: path.relative(path.join(__dirname, '..'), filePath),
              line: index + 1,
              fullLine: line.trim(),
              matchString: str,
            });
          }
        });
      }
    }
  });
});

console.log(`Found ${matches.length} occurrences with double consonants:`);
matches.forEach(m => {
  console.log(`${m.file}:${m.line} -> ${m.matchString}`);
});
