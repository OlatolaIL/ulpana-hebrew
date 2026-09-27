import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const LESSONS_DIR = path.resolve(ROOT, 'public/demo/lessons');

const REPO = 'OlatolaIL/ulpana-hebrew';

function getGithubToken() {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  if (process.env.GH_TOKEN) return process.env.GH_TOKEN;
  try {
    const remoteUrl = cp.execSync('git remote get-url origin', { cwd: ROOT, encoding: 'utf8' }).trim();
    const match = remoteUrl.match(/https:\/\/(?:([^:]+)@)?github\.com/);
    if (match && match[1] && match[1].startsWith('github_pat_')) {
      return match[1];
    }
  } catch (_) {}
  return null;
}

async function getOrCreateRelease(tag, pat) {
  const getUrl = `https://api.github.com/repos/${REPO}/releases/tags/${tag}`;
  const res = await fetch(getUrl, {
    headers: {
      'Authorization': `token ${pat}`,
      'User-Agent': 'Antigravity-Agent',
    },
  });

  if (res.ok) {
    const json = await res.json();
    console.log(`📦 Найден существующий релиз: ${json.name} (ID: ${json.id})`);
    return json;
  }

  if (res.status === 404) {
    console.log(`🆕 Создание нового GitHub Release [${tag}]...`);
    const createUrl = `https://api.github.com/repos/${REPO}/releases`;
    const createRes = await fetch(createUrl, {
      method: 'POST',
      headers: {
        'Authorization': `token ${pat}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Antigravity-Agent',
      },
      body: JSON.stringify({
        tag_name: tag,
        name: `🎬 Медиа-пакет Фабрики-500: ${tag}`,
        body: `Сборка видеопакетов Фабрики-500 для ${tag}.`,
        draft: false,
        prerelease: false,
      }),
    });

    if (!createRes.ok) {
      throw new Error(`Ошибка создания релиза: ${createRes.status} - ${await createRes.text()}`);
    }
    const created = await createRes.json();
    console.log(`✅ Создан релиз: ${created.name} (ID: ${created.id})`);
    return created;
  }

  throw new Error(`Ошибка запроса релиза: ${res.status} - ${await res.text()}`);
}

async function uploadAsset(filename, release, pat, force = false) {
  const filePath = path.resolve(LESSONS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`  ⚠️ Файл не найден локально: ${filePath}`);
    return null;
  }

  const fileStats = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  // Проверить, загружен ли уже
  const existingAsset = release.assets?.find((a) => a.name === filename);
  if (existingAsset) {
    if (!force && existingAsset.size === fileStats.size) {
      console.log(`  ⏭️ ${filename} уже загружен (${(fileStats.size / 1024 / 1024).toFixed(2)} MB), пропускаем.`);
      return existingAsset.browser_download_url;
    }
    console.log(`  🔄 Удаление устаревшей версии ${filename} (ID: ${existingAsset.id})...`);
    await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${existingAsset.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `token ${pat}`,
        'User-Agent': 'Antigravity-Agent',
      },
    });
  }

  console.log(`  ⏳ Загрузка ${filename} (${(fileStats.size / (1024 * 1024)).toFixed(2)} MB)...`);

  const uploadUrl = `https://uploads.github.com/repos/${REPO}/releases/${release.id}/assets?name=${encodeURIComponent(filename)}`;

  let lastErr = null;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      if (attempt > 1) {
        console.log(`  🔄 Повторная попытка ${attempt}/4 для ${filename}...`);
        await new Promise((r) => setTimeout(r, 2000 * attempt));
      }
      const res = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `token ${pat}`,
          'Content-Type': 'video/mp4',
          'Content-Length': String(fileStats.size),
          'User-Agent': 'Antigravity-Agent',
        },
        body: fileBuffer,
      });

      if (!res.ok) {
        const err = await res.text();
        console.error(`  ❌ Ошибка загрузки ${filename}: HTTP ${res.status} - ${err}`);
        if (res.status >= 500 || res.status === 429) continue;
        return null;
      }

      const json = await res.json();
      console.log(`  ✅ Загружен: ${json.name} -> ${json.browser_download_url}`);
      return json.browser_download_url;
    } catch (err) {
      lastErr = err;
      console.warn(`  ⚠️ Сетевой сбой при загрузке ${filename} (${err.message}). Попытка ${attempt}/4...`);
    }
  }

  console.error(`  ❌ Не удалось загрузить ${filename} после 4 попыток:`, lastErr?.message);
  return null;
}

async function updateReleaseBody(release, tag, filesList, pat) {
  const lines = [
    `# 🎬 Видеоматериалы уроков (${tag})`,
    ``,
    `> **Курс:** «Ульпан Алеф» — Иврит без паники`,
    `> **Разрешение:** HD 780×1688 (вертикальное 9:16)`,
    `> **Озвучка:** Gemini TTS (Charon ♂, Orus ♂, Aoede ♀)`,
    `> **Стандарт:** Фабрика-500 (R-25)`,
    ``,
    `---`,
    ``,
    `## 📦 Список видеороликов и прямые ссылки на CDN`,
    ``,
    `| Файл | Размер | Ссылка на скачивание |`,
    `| :--- | :---: | :--- |`,
  ];

  for (const f of filesList) {
    const filePath = path.resolve(LESSONS_DIR, f);
    const sizeMb = fs.existsSync(filePath) ? (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A';
    const cdnUrl = `https://github.com/${REPO}/releases/download/${tag}/${f}`;
    lines.push(`| \`${f}\` | ${sizeMb} | [Скачать MP4](${cdnUrl}) |`);
  }

  lines.push('');
  lines.push('---');
  lines.push('*Сгенерировано автоматически с соблюдением инварианта R-14 (zero MP4 files in git).*');

  const body = lines.join('\n');

  const patchUrl = `https://api.github.com/repos/${REPO}/releases/${release.id}`;
  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${pat}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Antigravity-Agent',
    },
    body: JSON.stringify({ body }),
  });

  if (res.ok) {
    console.log('✅ Описание релиза успешно обновлено!');
  } else {
    console.error('⚠️ Ошибка обновления описания релиза:', await res.text());
  }
}

async function main() {
  const args = process.argv.slice(2);
  const tagArg = args.find((a) => a.startsWith('--release-tag='));
  const tag = tagArg ? tagArg.split('=')[1].trim() : 'v-media-lessons-02-05';

  const pat = getGithubToken();
  if (!pat) {
    console.error('❌ Не найден GitHub токен в окружении или git remote');
    process.exit(1);
  }

  console.log(`======================================================`);
  console.log(`🚀 ЗАГРУЗКА ВИДЕО В GITHUB RELEASES CDN [${tag}]`);
  console.log(`======================================================\n`);

  const release = await getOrCreateRelease(tag, pat);

  // Найти файлы для уроков 2-5 (или по фильтру)
  let targetFiles = [];
  if (fs.existsSync(LESSONS_DIR)) {
    const all = fs.readdirSync(LESSONS_DIR).filter((f) => f.endsWith('.mp4'));
    if (tag.includes('02-05')) {
      targetFiles = all.filter((f) => /^lesson_0[2-5]_/.test(f));
    } else if (tag.includes('lesson-01')) {
      targetFiles = all.filter((f) => /^lesson_01_/.test(f));
    } else {
      targetFiles = all;
    }
  }

  const force = args.includes('--force');

  targetFiles.sort();
  console.log(`Найдено файлов к загрузке: ${targetFiles.length} (force: ${force})\n`);

  for (const filename of targetFiles) {
    await uploadAsset(filename, release, pat, force);
  }

  await updateReleaseBody(release, tag, targetFiles, pat);

  console.log('\n======================================================');
  console.log(`🎉 Все видео успешно опубликованы на GitHub Release CDN:`);
  console.log(`👉 https://github.com/${REPO}/releases/tag/${tag}`);
  console.log(`======================================================\n`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
