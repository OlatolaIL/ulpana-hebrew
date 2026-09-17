/**
 * scripts/audit_complex_drills_coverage.cjs
 *
 * Детектор разрыва покрытия слухового комплекса (ComplexDrills Zero-Drift Guard).
 * Сканирует все слова из:
 *   1. Уроков 1–100 (DETAILED_LESSONS)
 *   2. Тематических колод (THEMATIC_DECKS)
 *   3. Профессиональных колод (PROFESSIONAL_DECKS)
 *
 * Использование:
 *   node scripts/audit_complex_drills_coverage.cjs
 *   node scripts/audit_complex_drills_coverage.cjs --summary
 *   node scripts/audit_complex_drills_coverage.cjs --dump-missing=missing_words.json
 *   node scripts/audit_complex_drills_coverage.cjs --strict-lessons
 *   node scripts/audit_complex_drills_coverage.cjs --strict-all
 */

require('../tests/register.cjs');

const fs = require('fs');
const path = require('path');
const { hasComplexDrill } = require('../src/data/drills/index.ts');
const { DETAILED_LESSONS } = require('../src/data/lessonsData.ts');
const { THEMATIC_DECKS } = require('../src/data/thematicDecks/index.ts');
const { PROFESSIONAL_DECKS } = require('../src/data/professionalDecks/index.ts');
const { stripNikkud } = require('../src/lib/transcription.ts');

const args = process.argv.slice(2);
const isSummaryOnly = args.includes('--summary');
const isStrictLessons = args.includes('--strict-lessons');
const isStrictAll = args.includes('--strict-all');
const dumpArg = args.find(a => a.startsWith('--dump-missing='));
const dumpFile = dumpArg ? dumpArg.split('=')[1] : null;

// 1. Сбор слов из уроков
const lessonWords = [];
for (let i = 1; i <= 100; i++) {
  const lesson = DETAILED_LESSONS[i];
  if (!lesson || !lesson.vocabulary) continue;
  for (const w of lesson.vocabulary) {
    lessonWords.push({
      ...w,
      sourceType: 'lesson',
      sourceName: `Урок ${i}`,
      lessonId: i,
    });
  }
}

// 2. Сбор слов из тематических колод
const thematicWords = [];
for (const deck of THEMATIC_DECKS) {
  if (!deck.words) continue;
  for (const w of deck.words) {
    thematicWords.push({
      ...w,
      sourceType: 'thematic',
      sourceName: `Тема: ${deck.title} (${deck.id})`,
      deckId: deck.id,
    });
  }
}

// 3. Сбор слов из профессиональных колод
const profWords = [];
for (const deck of PROFESSIONAL_DECKS) {
  if (!deck.words) continue;
  for (const w of deck.words) {
    profWords.push({
      ...w,
      sourceType: 'professional',
      sourceName: `Проф: ${deck.title} (${deck.id})`,
      deckId: deck.id,
    });
  }
}

function analyzeScope(wordsList, scopeName) {
  let total = 0;
  let covered = 0;
  const missing = [];
  const seen = new Set();

  for (const w of wordsList) {
    total++;
    const plain = stripNikkud(w.hebrewPlain || w.hebrew || '').trim();
    const isCovered = hasComplexDrill(w);

    if (isCovered) {
      covered++;
    } else {
      if (!seen.has(plain)) {
        seen.add(plain);
        missing.push({
          plain,
          hebrew: w.hebrew,
          translation: w.translation,
          partOfSpeech: w.partOfSpeech || 'unknown',
          gender: w.gender,
          sourceType: w.sourceType,
          sourceName: w.sourceName,
          lessonId: w.lessonId,
        });
      }
    }
  }

  return { scopeName, total, covered, missing, uniqueMissing: missing.length };
}

const resLessons = analyzeScope(lessonWords, 'Уроки курса 1–100');
const resThematic = analyzeScope(thematicWords, 'Тематические колоды');
const resProf = analyzeScope(profWords, 'Профессиональные колоды');

const allWords = [...lessonWords, ...thematicWords, ...profWords];
const resAll = analyzeScope(allWords, 'ВСЯ СИСТЕМА (Уроки + Колоды)');

console.log('========================================================================');
console.log('📊 АУДИТ ПОКРЫТИЯ СЛУХОВОГО ТРЕНАЖЁРА «КОМПЛЕКС» (ComplexDrills)');
console.log('========================================================================\n');

function printRes(r) {
  const pct = ((r.covered / r.total) * 100).toFixed(1);
  const icon = r.uniqueMissing === 0 ? '🟢' : '🟡';
  console.log(`${icon} ${r.scopeName.padEnd(32)}: ${String(r.covered).padStart(4)} / ${String(r.total).padEnd(4)} (${pct.padStart(5)}%) | Не хватает уникальных: ${r.uniqueMissing}`);
}

printRes(resLessons);
printRes(resThematic);
printRes(resProf);
console.log('------------------------------------------------------------------------');
printRes(resAll);
console.log('');

// Если запрошен дамп пропущенных слов в JSON
if (dumpFile) {
  const fullDumpPath = path.isAbsolute(dumpFile) ? dumpFile : path.join(process.cwd(), dumpFile);
  fs.writeFileSync(fullDumpPath, JSON.stringify(resAll.missing, null, 2), 'utf8');
  console.log(`💾 Дамп ${resAll.missing.length} недостающих слов сохранён в: ${fullDumpPath}\n`);
}

// Если подробный вывод
if (!isSummaryOnly && resAll.uniqueMissing > 0) {
  console.log('📋 Сводка недостающих слов по частям речи:');
  const posMap = {};
  for (const m of resAll.missing) {
    posMap[m.partOfSpeech] = (posMap[m.partOfSpeech] || 0) + 1;
  }
  for (const [pos, count] of Object.entries(posMap)) {
    console.log(`   • ${pos.padEnd(14)}: ${count} слов`);
  }
  console.log('');
  console.log('💡 Для авто-генерации недостающих слов используйте:');
  console.log('   node scripts/sync_complex_drills.cjs --prepare-missing\n');
}

// Проверка строгих флагов CI
if (isStrictLessons && resLessons.uniqueMissing > 0) {
  console.error(`🔴 [FAIL CI] В уроках обнаружено ${resLessons.uniqueMissing} слов без режима «Комплекс»!`);
  process.exit(1);
}

if (isStrictAll && resAll.uniqueMissing > 0) {
  console.error(`🔴 [FAIL CI] В системе обнаружено ${resAll.uniqueMissing} слов без режима «Комплекс»!`);
  process.exit(1);
}

console.log('✅ Аудит покрытия успешно завершён.');
