#!/usr/bin/env node
/**
 * scripts/ship.cjs - Автоматизированный конвейер безопасной выгрузки (Safe Deployment Flow)
 *
 * Назначение:
 * 1. Исключает 10-15 ручных шагов выгрузки и предотвращает захват чужих бинарных файлов (MP3/видео).
 * 2. Запускает быструю валидацию (typecheck).
 * 3. Выполняет точечный стейджинг, коммит и отправку в `origin main`.
 *
 * Использование:
 *   npm run ship -- "feat(dialogue): update lesson 3" src/data/dialogues/dialogues_01_10.ts src/lib/speech.ts
 *   node scripts/ship.cjs "fix(audio): pitch fix" src/lib/speech.ts
 *
 * Если файлы не указаны, скрипт безопасно определяет модифицированные файлы кода (ts, tsx, js, cjs, json, md, css),
 * КАТЕГОРИЧЕСКИ игнорируя тяжелые медиа и чужие артефакты (mp3, mp4, wav, demo кэши).
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..');

function run(cmd, options = {}) {
  try {
    const stdout = execSync(cmd, {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: options.silent ? ['pipe', 'pipe', 'pipe'] : ['inherit', 'pipe', 'pipe'],
      ...options,
    });
    return { ok: true, output: (stdout || '').trim() };
  } catch (err) {
    const out = ((err.stdout || '') + '\n' + (err.stderr || '')).trim();
    return { ok: false, output: out, code: err.status || 1 };
  }
}

const isDryRun = process.argv.includes('--dry-run');
const rawArgs = process.argv.slice(2).filter(a => a !== '--dry-run');
const commitMessage = rawArgs[0];
const targetFiles = rawArgs.slice(1);

if (!commitMessage || commitMessage.trim().length === 0) {
  console.error('❌ Ошибка: Не указано сообщение коммита!');
  console.error('Использование: npm run ship -- "<сообщение_коммита>" [файлы...] [--dry-run]');
  process.exit(1);
}

// 1. Проверка на запрещённые огульные шаблоны
const forbiddenArgs = ['.', '-A', '--all', '*'];
for (const f of targetFiles) {
  if (forbiddenArgs.includes(f)) {
    console.error(`❌ Ошибка: Аргумент "${f}" запрещён регламентом R-14!`);
    console.error('Стейджинг обязан быть точечным. Перечислите конкретные файлы задачи.');
    process.exit(1);
  }
}

console.log('🚀 Запуск автоматизированного конвейера выгрузки (Safe Deployment Flow)...');

// 2. Определение списка файлов для стейджинга
let filesToStage = [];

if (targetFiles.length > 0) {
  filesToStage = targetFiles;
} else {
  // Автоматический безопасный сбор измененных файлов кода
  console.log('🔍 Файлы не переданы явно. Выполняю безопасный анализ modified-файлов...');
  const statusRes = run('git status --porcelain', { silent: true });
  if (!statusRes.ok || !statusRes.output) {
    console.log('ℹ️ Рабочая копия чиста, нет изменений для коммита.');
    process.exit(0);
  }

  const lines = statusRes.output.split('\n');
  const safeExts = ['.ts', '.tsx', '.js', '.cjs', '.mjs', '.json', '.md', '.css'];
  const dangerousPatterns = ['public/demo/', 'growth/data/', '.mp4', '.webm', '.wav', '.mp3'];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split(/\s+/);
    const filePath = parts[parts.length - 1];

    const isDangerous = dangerousPatterns.some(p => filePath.includes(p) || filePath.endsWith(p));
    const ext = path.extname(filePath).toLowerCase();
    const isSafeCode = safeExts.includes(ext);

    if (isSafeCode && !isDangerous) {
      filesToStage.push(filePath);
    } else if (isDangerous) {
      console.warn(`⚠️ Пропущен потенциально опасный/медиа-файл: ${filePath} (требуется явное указание)`);
    }
  }

  if (filesToStage.length === 0) {
    console.error('❌ Не найдено безопасных файлов кода для автоматического стейджинга.');
    console.error('Укажите нужные файлы явно: npm run ship -- "<msg>" <file1> <file2>...');
    process.exit(1);
  }
}

console.log(`📦 Файлы к стейджингу (${filesToStage.length}):`);
filesToStage.forEach(f => console.log(`   + ${f}`));

// 3. Предрелизная валидация типов (Typecheck)
console.log('\n🔎 Шаг 1/4: Проверка типов TypeScript (npm run typecheck)...');
const typecheckRes = run('npm run typecheck', { silent: true });
if (!typecheckRes.ok) {
  console.error('❌ Ошибка компиляции TypeScript:');
  console.error(typecheckRes.output);
  process.exit(1);
}
console.log('✅ TypeScript компиляция прошла успешно (0 ошибок).');

// 4. Точечный стейджинг
console.log('\n📦 Шаг 2/4: Точечный стейджинг файлов...');
// Экранируем имена файлов для безопасного вызова
const escapedFiles = filesToStage.map(f => `"${f}"`).join(' ');
const addRes = run(`git add ${escapedFiles}`, { silent: true });
if (!addRes.ok) {
  console.error('❌ Ошибка git add:');
  console.error(addRes.output);
  process.exit(1);
}

const diffRes = run('git diff --cached --stat', { silent: true });
if (!diffRes.ok || !diffRes.output) {
  console.warn('⚠️ В индексе нет изменений после git add.');
  process.exit(0);
}
console.log(diffRes.output);

if (isDryRun) {
  console.log('\n🧪 [DRY-RUN] Проверка и симуляция стейджинга завершены успешно!');
  console.log('   Никаких коммитов и пушей в origin main не производилось.');
  run('git reset', { silent: true });
  process.exit(0);
}

// 5. Фиксация коммита
console.log('\n💾 Шаг 3/4: Создание коммита...');
const commitRes = run(`git commit -m "${commitMessage.replace(/"/g, '\\"')}"`, { silent: true });
if (!commitRes.ok) {
  console.error('❌ Ошибка git commit:');
  console.error(commitRes.output);
  process.exit(1);
}
console.log(commitRes.output.split('\n')[0]);

// 6. Отправка в origin
const branchRes = run('git rev-parse --abbrev-ref HEAD', { silent: true });
const currentBranch = branchRes.ok ? branchRes.output.trim() : 'main';

console.log(`\n🌐 Шаг 4/4: Отправка ветки ${currentBranch} в origin...`);
// Устанавливаем безопасный буфер
run('git config http.postBuffer 524288000', { silent: true });

let pushRes = run(`git push origin ${currentBranch}`, { silent: true });
if (!pushRes.ok) {
  console.error(`❌ Ошибка git push origin ${currentBranch}:`);
  console.error(pushRes.output);
  process.exit(1);
}
console.log(`✅ Ветка ${currentBranch} отправлена в origin/${currentBranch}!`);

// Если мы на feature/growth ветке, обновляем также main для деплоя Production на Vercel
if (currentBranch !== 'main') {
  console.log('🚀 Синхронизация с origin/main для Production деплоя на Vercel...');
  const pushMainRes = run(`git push origin ${currentBranch}:main`, { silent: true });
  if (pushMainRes.ok) {
    run(`git branch -f main ${currentBranch}`, { silent: true });
    console.log('✅ origin/main успешно обновлен!');
  } else {
    console.warn('⚠️ Предупреждение: не удалось синхронизировать origin/main:', pushMainRes.output);
  }
}

console.log('⚡ Vercel автоматически разворачивает обновление на https://ulpana-hebrew.vercel.app');
console.log('🎉 Выгрузка успешно завершена в автоматическом режиме.');
