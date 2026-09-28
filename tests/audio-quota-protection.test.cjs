/* eslint-disable @typescript-eslint/no-require-imports */
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const repoRoot = path.join(__dirname, '..');

test('R-27: batch_synthesize_tts reports 0 needed API requests for completed lessons 1-5', () => {
  const result = cp.spawnSync(
    process.execPath,
    ['growth/scripts/batch_synthesize_tts.mjs', '--lessons=1-5', '--dry-run'],
    { cwd: repoRoot, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, `Script must exit cleanly. Stderr: ${result.stderr}`);
  assert.ok(
    result.stdout.includes('РЕАЛЬНО ТРЕБУЕТСЯ СИНТЕЗИРОВАТЬ ЧЕРЕЗ API: 0 фраз') ||
    result.stdout.includes('0 ЗАПРОСОВ К API'),
    'Completed lessons 1-5 must require 0 API requests'
  );
});

test('R-27: generate_dialogue_audio reports 0 needed API requests for lesson 3', () => {
  const result = cp.spawnSync(
    process.execPath,
    ['--require', './tests/register.cjs', 'scripts/generate_dialogue_audio.cjs', '--lesson=3', '--engine=gemini', '--dry-run'],
    { cwd: repoRoot, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, `Script must exit cleanly. Stderr: ${result.stderr}`);
  assert.ok(
    result.stdout.includes('РЕАЛЬНО ТРЕБУЕТСЯ СИНТЕЗИРОВАТЬ: 0 реплик') ||
    result.stdout.includes('0 ЗАПРОСОВ К API'),
    'Existing dialogue turns for lesson 3 must require 0 API requests'
  );
});

test('R-27: generate_all_gemini_sentences heals and protects existing files on disk', () => {
  const result = cp.spawnSync(
    process.execPath,
    ['scripts/generate_all_gemini_sentences.cjs', '--limit=1', '--dry-run'],
    { cwd: repoRoot, encoding: 'utf8' }
  );

  assert.equal(result.status, 0, `Script must exit cleanly. Stderr: ${result.stderr}`);
  const match = result.stdout.match(/Уже сгенерировано и верифицировано:\s+(\d+)/);
  assert.ok(match, 'Must report verified sentences count');
  assert.ok(parseInt(match[1], 10) >= 1300, `Expected at least 1300 verified sentences, got ${match[1]}`);
});

test('R-27: Video registry gate skips lessons where all 10 platform MP4s exist', () => {
  const registryPath = path.join(repoRoot, 'growth/lessons_video_registry.json');
  assert.ok(fs.existsSync(registryPath), 'Video registry must exist');

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const platforms = ['YT', 'TG', 'INSTA', 'TIKTOK', 'FB'];
  const completedLessons = [1, 3, 4, 5];
  for (const l of completedLessons) {
    const lKey = String(l);
    assert.ok(registry.lessons[lKey], `Registry must contain lesson ${lKey}`);
    for (const variant of ['clean', 'spicy']) {
      const files = registry.lessons[lKey].variants?.[variant]?.files || {};
      for (const p of platforms) {
        assert.ok(files[p]?.path, `Lesson ${lKey} ${variant} must specify path for ${p}`);
        const absPath = path.resolve(repoRoot, files[p].path);
        assert.ok(fs.existsSync(absPath), `File ${files[p].path} must exist on disk`);
        assert.ok(fs.statSync(absPath).size > 500 * 1024, `File ${files[p].path} must be > 500KB`);
      }
    }
  }
});
