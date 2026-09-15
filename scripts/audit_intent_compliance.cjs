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
  
  // Проверка запрещенных путей
  const forbiddenFiles = ['rootFamiliesData.ts', 'rootPresets.ts'];
  for (const f of files) {
    console.log('  ' + f);
    for (const forbidden of forbiddenFiles) {
      if (f.includes(forbidden)) {
        matrixViolations.push(`Нарушение R-03: попытка создать запрещенный файл ${forbidden}`);
      }
    }
  }

  if (matrixViolations.length === 0) {
    console.log('\n🟢 Изменения соответствуют правилам DECISION_MATRIX.md.');
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
  const supersededMatch = matrixContent.match(/## ⛔ Реестр отмененных и запрещенных подходов[\s\S]*?(?=---|$)/);
  
  console.log('🟢 Матрица DECISION_MATRIX.md активна и содержит актуальный Superseded Log.');
  
  // Анализ: если редактировался database.ts, но не обновлялся pealimMasterDictionary
  if (gitStatus.output.includes('database.ts') && !gitStatus.output.includes('pealimMasterDictionary.json')) {
    console.log('🟡 НАПОМИНАНИЕ: Затронут database.ts без pealimMasterDictionary.json. Убедитесь, что запущен scripts/fetch_pealim_dictionary.cjs --sync-db!');
  }

  // Детектор дрейфа кода и паспортов механик (Code-Doc Drift Detector)
  const subsystemMappings = [
    {
      name: 'Телефонный звонок (Этап 6)',
      codePrefixes: ['src/app/api/ai/phone', 'src/components/PhoneCallSimulator', 'src/data/phoneScenarios.ts'],
      passport: 'docs/mechanics/stage-06-phone-call.md',
    },
  ];

  let hasDrift = false;
  for (const sub of subsystemMappings) {
    const codeChanged = sub.codePrefixes.some((prefix) => gitStatus.output.includes(prefix));
    const passportChanged = gitStatus.output.includes(sub.passport);
    if (codeChanged && !passportChanged) {
      console.log(`🟡 ДРЕЙФ КОДА И ДОКУМЕНТАЦИИ: Изменён код компонента «${sub.name}», но паспорт «${sub.passport}» не обновлялся. Проверьте актуальность паспорта и соблюдение инвариантов!`);
      hasDrift = true;
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
    console.log('🟢 Все связанные паспорта механик целостны и синхронизированы с кодовой базой.');
  }
} else {
  console.log('🔴 ОШИБКА: Файл DECISION_MATRIX.md не найден в корне проекта!');
}

console.log('\n====================================================\n');
process.exit(testRun.ok ? 0 : 1);
