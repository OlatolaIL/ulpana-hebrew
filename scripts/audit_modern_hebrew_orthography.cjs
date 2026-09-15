#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');

// Регулярное выражение: согласная (не вав) с огласовкой кубуц \u05BB,
// за которой нет буквы вав ו.
const ARCHAIC_KUBUTZ_REGEX = /([א-הז-ת][\u05BC\u05C1\u05C2]*)\u05BB(?![ְֱֲֳִֵֶַָֹֺֻּֽֿׁׂׅׄ]*ו)/g;

function getFiles(dir, recursive = true) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && recursive && entry.name !== 'node_modules' && entry.name !== '.next') {
      files.push(...getFiles(fullPath, recursive));
    } else if (entry.isFile() && /\.(ts|tsx|json)$/.test(entry.name)) {
      if (entry.name !== 'database.ts' && !entry.name.startsWith('pealimMaster')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function auditFiles() {
  const allFiles = new Set();
  allFiles.add(path.join(repoRoot, 'src/data/dialogueLessons.ts'));
  allFiles.add(path.join(repoRoot, 'src/data/phoneScenarios.ts'));
  allFiles.add(path.join(repoRoot, 'src/data/essayTopics.ts'));
  allFiles.add(path.join(repoRoot, 'src/data/thematicDecks.ts'));
  allFiles.add(path.join(repoRoot, 'src/data/verbSentencesData.ts'));
  
  for (const d of [path.join(repoRoot, 'src/data/dialogues'), path.join(repoRoot, 'src/data/lessons')]) {
    for (const f of getFiles(d, true)) {
      allFiles.add(f);
    }
  }

  const violations = [];

  for (const file of allFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, lineIdx) => {
      let match;
      ARCHAIC_KUBUTZ_REGEX.lastIndex = 0;
      while ((match = ARCHAIC_KUBUTZ_REGEX.exec(line)) !== null) {
        const start = Math.max(0, match.index - 15);
        const end = Math.min(line.length, match.index + 20);
        const snippet = line.slice(start, end).trim();

        violations.push({
          file: path.relative(repoRoot, file),
          line: lineIdx + 1,
          char: match[0],
          snippet,
        });
      }
    });
  }

  return violations;
}

const violations = auditFiles();

if (violations.length === 0) {
  console.log('✅ Аудит орфографии современного иврита (כתיב מלא): нарушений не найдено.');
  process.exit(0);
} else {
  console.error(`❌ Обнаружено ${violations.length} нарушений стандарта כתיב מלא (архаичный кубуц без вав):`);
  const sample = violations.slice(0, 15);
  for (const v of sample) {
    console.error(`  - ${v.file}:${v.line} -> «${v.snippet}»`);
  }
  if (violations.length > 15) {
    console.error(`  ... и ещё ${violations.length - 15} нарушений.`);
  }
  process.exit(1);
}
