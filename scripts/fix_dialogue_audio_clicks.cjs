/**
 * scripts/fix_dialogue_audio_clicks.cjs
 *
 * Локальное устранение звуковых всплесков и щелчков (Anti-Click Micro Fade-Out)
 * во всех существующих MP3-файлах диалогов без повторного обращения к API (R-27).
 *
 * Применяет фильтр обратного фейд-ина: areverse,afade=t=in:st=0:d=0.1,areverse
 * Это плавно сводит хвост аудио к абсолютному нулю, устраняя щелчок диффузора
 * и пиковый клиппинг без необходимости знать точную длительность файла в контейнере.
 */

const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const repoRoot = path.join(__dirname, '..');
const ffmpegPath = require(path.join(repoRoot, 'node_modules/@ffmpeg-installer/ffmpeg')).path;
const DIALOGUES_GEMINI_DIR = path.resolve(repoRoot, 'public/audio/dialogues/gemini');

if (!fs.existsSync(DIALOGUES_GEMINI_DIR)) {
  console.error('Каталог не найден:', DIALOGUES_GEMINI_DIR);
  process.exit(1);
}

function applyFadeOut(filePath) {
  const tempPath = filePath + '.fade.mp3';

  const res = cp.spawnSync(ffmpegPath, [
    '-y',
    '-i', filePath,
    '-af', 'afade=t=in:st=0:d=0.05,areverse,atrim=start=0.15,afade=t=in:st=0:d=0.08,areverse',
    '-ar', '44100',
    '-b:a', '128k',
    tempPath
  ], { stdio: 'ignore' });

  if (res.status === 0 && fs.existsSync(tempPath) && fs.statSync(tempPath).size > 100) {
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);
    return true;
  }

  if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  return false;
}

function main() {
  const files = fs.readdirSync(DIALOGUES_GEMINI_DIR).filter(f => f.endsWith('.mp3'));
  console.log(`Найдено ${files.length} MP3-файлов в ${DIALOGUES_GEMINI_DIR}`);
  console.log('Применяем Anti-Click Bilateral Smoothing (fade-in 50ms + areverse fade-in 80ms)...');

  let processed = 0;
  for (const f of files) {
    const p = path.join(DIALOGUES_GEMINI_DIR, f);
    if (applyFadeOut(p)) {
      processed++;
    }
  }

  console.log(`✓ Успешно обработано: ${processed} из ${files.length} файлов.`);

  const MANIFEST_PATH = path.resolve(repoRoot, 'public/audio/dialogues/manifest.json');
  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
    let updatedCount = 0;
    for (const key of Object.keys(manifest)) {
      const entry = manifest[key];
      if (entry && entry.engine === 'gemini' && entry.fileName) {
        const p = path.join(DIALOGUES_GEMINI_DIR, entry.fileName);
        if (fs.existsSync(p)) {
          const size = fs.statSync(p).size;
          if (entry.bytes !== size) {
            entry.bytes = size;
            updatedCount++;
          }
        }
      }
    }
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
    console.log(`✓ Обновлен manifest.json (${updatedCount} записей синхронизировано по байтам).`);
  }
}

main();
