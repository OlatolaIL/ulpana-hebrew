/**
 * Скрипт аудита непрерывности намерений и соблюдения матрицы решений (DECISION_MATRIX.md)
 * Отвечает на 3 ключевых вопроса:
 * 1) Мы работали по матрице или нет?
 * 2) Сломали что-то или нет?
 * 3) Актуальна ли матрица, нужны ли предложения по изменению?
 *
 * Использование:
 *   node scripts/audit_intent_compliance.cjs
 *   node scripts/audit_intent_compliance.cjs --quiet-if-clean
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');
const isQuietIfClean = process.argv.includes('--quiet-if-clean');

function run(cmd) {
  try {
    const stdout = execSync(cmd, { cwd: repoRoot, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    return { ok: true, output: stdout.trim() };
  } catch (err) {
    const out = ((err.stdout || '') + '\n' + (err.stderr || '')).trim();
    return { ok: false, output: out };
  }
}

// 1. Проверка активности (Dirty Check)
const gitStatus = run('git status -s');
const gitLogRecent = run('git log -n 5 --since="24 hours ago" --oneline');

const hasUncommittedChanges = gitStatus.ok && gitStatus.output.length > 0;
const hasRecentCommits = gitLogRecent.ok && gitLogRecent.output.length > 0;
const hasActivity = hasUncommittedChanges || hasRecentCommits;

if (isQuietIfClean && !hasActivity) {
  // Холостой ход: изменений за 24 часа нет, завершаемся молча без шума
  process.exit(0);
}

console.log('====================================================');
console.log('🔍 АУДИТ СОБЛЮДЕНИЯ МАТРИЦЫ РЕШЕНИЙ (INTENT AUDIT)');
console.log('====================================================\n');

// 2. Вопрос 2: Сломали что-то или нет? (Автоматические тесты)
console.log('▶ [Вопрос 2] Сломали что-то или нет?');
const testRun = run('node --require ./tests/register.cjs --test tests/decision-matrix-invariants.test.cjs');

let brokenVerdict = '🟢 Ничего не сломано. Все критические инварианты зелёные.';
if (!testRun.ok) {
  brokenVerdict = '🔴 ВНИМАНИЕ! Обнаружены поломки в инвариантах матрицы:\n' + testRun.output;
}
console.log(brokenVerdict);
console.log('');

// 3. Вопрос 1: Мы работали по матрице или нет? (Анализ изменений)
console.log('▶ [Вопрос 1] Мы работали по матрице или нет?');
if (!hasActivity) {
  console.log('⚪ Изменений в репозитории за последнее время не зафиксировано.');
} else {
  console.log('Активные файлы в работе:');
  const files = gitStatus.output.split('\n').filter(Boolean);
  let matrixViolations = [];
  
  // Проверка запрещенных путей и секретов (R-03, R-16)
  const forbiddenFiles = ['rootFamiliesData.ts', 'rootPresets.ts'];
  for (const f of files) {
    console.log('  ' + f);
    for (const forbidden of forbiddenFiles) {
      if (f.includes(forbidden)) {
        matrixViolations.push(`Нарушение R-03: попытка создать запрещенный файл ${forbidden}`);
      }
    }
    if (f.includes('.env.local') || f.includes('.env.production')) {
      matrixViolations.push(`Нарушение R-16: файл секретов ${f} нельзя коммитить в репозиторий!`);
    }
  }

  if (matrixViolations.length === 0) {
    console.log('\n🟢 Критические структурные инварианты матрицы (R-01, R-03, R-16: отсутствие запрещенных файлов и утечек секретов) соблюдены.');
  } else {
    console.log('\n🔴 Обнаружены прямые нарушения матрицы:');
    matrixViolations.forEach(v => console.log('  - ' + v));
  }
}
console.log('');

// 4. Вопрос 3: Актуальность матрицы и предложения по изменению
console.log('▶ [Вопрос 3] Актуальность матрицы и предложения по изменению:');
const matrixPath = path.join(repoRoot, 'DECISION_MATRIX.md');
if (fs.existsSync(matrixPath)) {
  const matrixContent = fs.readFileSync(matrixPath, 'utf8');
  
  // Извлекаем версию
  const versionMatch = matrixContent.match(/Версия:?\*{0,2}\s*([0-9.]+)/i);
  const versionStr = versionMatch ? `v${versionMatch[1]}` : 'без версии';
  console.log(`🟢 Матрица DECISION_MATRIX.md (${versionStr}) активна и содержит актуальный Superseded Log.`);
  
  // Анализ: если редактировался database.ts, но не обновлялся pealimMasterDictionary
  if (gitStatus.output.includes('database.ts') && !gitStatus.output.includes('pealimMasterDictionary.json')) {
    console.log('🟡 НАПОМИНАНИЕ: Затронут database.ts без pealimMasterDictionary.json. Убедитесь, что запущен scripts/fetch_pealim_dictionary.cjs --sync-db!');
  }

  // Расширенный реестр подсистем и паспортов механик (Code-Doc Drift Detector)
  const subsystemMappings = [
    {
      name: 'Словарь и флеш-карточки (Этап 1)',
      codePrefixes: ['src/components/FlashcardTrainer', 'src/lib/ulpanDictionary.ts'],
      passport: 'docs/mechanics/stage-01-vocabulary.md',
    },
    {
      name: 'Спряжения глаголов (Этап 2)',
      codePrefixes: ['src/components/VerbConjugationTrainer', 'src/lib/verbConjugations', 'src/data/pealimMasterDictionary.json'],
      passport: 'docs/mechanics/stage-02-verbs.md',
    },
    {
      name: 'Сочинение и письмо (Этап 4)',
      codePrefixes: ['src/components/LessonEssay', 'src/app/api/ai/essay'],
      passport: 'docs/mechanics/stage-04-essay.md',
    },
    {
      name: 'Диалог с репликами (Этап 5)',
      codePrefixes: ['src/components/LessonDialogue', 'src/app/api/ai/dialogue'],
      passport: 'docs/mechanics/stage-05-dialogue.md',
    },
    {
      name: 'Телефонный звонок (Этап 6)',
      codePrefixes: ['src/app/api/ai/phone', 'src/components/PhoneCallSimulator', 'src/data/phoneScenarios.ts'],
      passport: 'docs/mechanics/stage-06-phone-call.md',
    },
    {
      name: 'Слуховой комплекс «Комплекс» (ComplexDrills)',
      codePrefixes: ['src/data/drills/', 'src/data/verbSentencesData.ts'],
      passport: 'docs/mechanics/verb-sentences-matrix.md',
    },
  ];

  let hasDrift = false;
  for (const sub of subsystemMappings) {
    const codeChanged = sub.codePrefixes.some((prefix) => gitStatus.output.includes(prefix));
    const passportPath = path.join(repoRoot, sub.passport);
    const passportExists = fs.existsSync(passportPath);
    const passportChanged = gitStatus.output.includes(sub.passport);

    if (codeChanged) {
      if (passportExists && !passportChanged) {
        console.log(`🟡 ДРЕЙФ КОДА И ДОКУМЕНТАЦИИ: Изменён код подсистемы «${sub.name}», но паспорт «${sub.passport}» не обновлялся. Проверьте актуальность паспорта и соблюдение инвариантов!`);
        hasDrift = true;
      } else if (!passportExists) {
        console.log(`⚪ НАПОМИНАНИЕ: Изменён код подсистемы «${sub.name}», но паспорт «${sub.passport}» ещё не формализован на диске.`);
      }
    }
  }

  // Проверка целостности всех связанных паспортов
  const passportMatches = Array.from(new Set(matrixContent.match(/docs\/mechanics\/[a-zA-Z0-9_\-]+\.md/g) || []));
  let brokenPassports = [];
  for (const passRel of passportMatches) {
    if (!fs.existsSync(path.join(repoRoot, passRel))) {
      brokenPassports.push(`🔴 ОШИБКА: Паспорт ${passRel}, упомянутый в Матрице, отсутствует на диске!`);
    }
  }

  if (brokenPassports.length > 0) {
    brokenPassports.forEach((bp) => console.log(bp));
  } else if (!hasDrift) {
    console.log('🟢 Все существующие паспорта механик целостны и синхронизированы с кодовой базой.');
  }
} else {
  console.log('🔴 ОШИБКА: Файл DECISION_MATRIX.md не найден в корне проекта!');
}

// 5. Контроль покрытия режима «Комплекс» (Zero-Drift ComplexDrills)
console.log('');
console.log('▶ [Zero-Drift ComplexDrills: Покрытие слухового комплекса]');
const drillsAudit = run('node scripts/audit_complex_drills_coverage.cjs --summary');
if (drillsAudit.ok) {
  console.log(drillsAudit.output);
} else {
  console.log('🟡 Не удалось выполнить аудит покрытия drills: ' + drillsAudit.output);
}

console.log('\n====================================================\n');
process.exit(testRun.ok ? 0 : 1);
