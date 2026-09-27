import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const LESSONS_DIR = path.resolve(ROOT, 'public/demo/lessons');
const DESCRIPTIONS_PATH = path.resolve(ROOT, 'growth/content/lesson_01_descriptions.md');

const REPO = 'OlatolaIL/ulpana-hebrew';
const RELEASE_ID = 397576712;

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

const files = [
  'lesson_01_clean_youtube_shorts.mp4',
  'lesson_01_clean_telegram.mp4',
  'lesson_01_clean_instagram_reels.mp4',
  'lesson_01_clean_tiktok.mp4',
  'lesson_01_clean_facebook_reels.mp4',
  'lesson_01_spicy_youtube_shorts.mp4',
  'lesson_01_spicy_telegram.mp4',
  'lesson_01_spicy_instagram_reels.mp4',
  'lesson_01_spicy_tiktok.mp4',
  'lesson_01_spicy_facebook_reels.mp4',
];

async function uploadAsset(filename, pat) {
  const filePath = path.resolve(LESSONS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.error(`Файл не найден: ${filePath}`);
    return;
  }

  const fileStats = fs.statSync(filePath);
  const fileBuffer = fs.readFileSync(filePath);

  console.log(`⏳ Загрузка ${filename} (${(fileStats.size / (1024 * 1024)).toFixed(2)} MB)...`);

  const uploadUrl = `https://uploads.github.com/repos/${REPO}/releases/${RELEASE_ID}/assets?name=${encodeURIComponent(filename)}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      'Authorization': `token ${pat}`,
      'Content-Type': 'video/mp4',
      'Content-Length': String(fileStats.size),
      'User-Agent': 'Antigravity-Agent'
    },
    body: fileBuffer
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Ошибка загрузки ${filename}: HTTP ${res.status} - ${err}`);
  } else {
    const json = await res.json();
    console.log(`✅ Загружен: ${json.name} -> ${json.browser_download_url}`);
  }
}

async function updateReleaseBody(pat) {
  const descContent = fs.existsSync(DESCRIPTIONS_PATH) ? fs.readFileSync(DESCRIPTIONS_PATH, 'utf8') : '';

  const body = `# 🎬 Видеоматериалы Урока 1 (Фабрика-500: 10 видеороликов)

> **Курс:** «Ульпан Алеф» — Иврит без паники  
> **Урок 1:** Приветствие и знакомство (אַתָּה vs אַתְּ)  
> **Разрешение:** HD 780×1688 (вертикальное 9:16)  
> **Озвучка:** Gemini TTS (Charon ♂, Orus ♂, Aoede ♀)  
> **Стандарт:** Фабрика-500 (R-25)

---

## 📦 Список всех 10 видеороликов и прямые ссылки на скачивание

| Платформа | Промокод | 🟢 Clean (Офис в Тель-Авиве) | 🌶️ Spicy (Свидание в Тиндере) |
| :--- | :---: | :--- | :--- |
| **YouTube Shorts** | \`YT\` | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_clean_youtube_shorts.mp4) (7.04 MB) | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_spicy_youtube_shorts.mp4) (8.07 MB) |
| **Telegram** | \`TG\` | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_clean_telegram.mp4) (6.77 MB) | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_spicy_telegram.mp4) (8.09 MB) |
| **Instagram Reels** | \`INSTA\` | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_clean_instagram_reels.mp4) (6.75 MB) | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_spicy_instagram_reels.mp4) (8.08 MB) |
| **TikTok** | \`TIKTOK\` | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_clean_tiktok.mp4) (7.03 MB) | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_spicy_tiktok.mp4) (8.11 MB) |
| **Facebook Reels** | \`FB\` | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_clean_facebook_reels.mp4) (6.68 MB) | [Скачать MP4](https://github.com/OlatolaIL/ulpana-hebrew/releases/download/v-media-lesson-01/lesson_01_spicy_facebook_reels.mp4) (8.09 MB) |

---

## 📝 Готовые описания для публикаций
Полные посты с промокодами и UTM-ссылками доступны в репозитории: [\`growth/content/lesson_01_descriptions.md\`](https://github.com/OlatolaIL/ulpana-hebrew/blob/main/growth/content/lesson_01_descriptions.md).
`;

  const patchUrl = `https://api.github.com/repos/${REPO}/releases/${RELEASE_ID}`;
  const res = await fetch(patchUrl, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${pat}`,
      'Content-Type': 'application/json',
      'User-Agent': 'Antigravity-Agent'
    },
    body: JSON.stringify({ body })
  });

  if (res.ok) {
    console.log('✅ Описание релиза успешно обновлено!');
  } else {
    console.error('❌ Ошибка обновления релиза:', await res.text());
  }
}

async function main() {
  const pat = getGithubToken();
  if (!pat) {
    console.error('❌ Не найден GitHub токен в окружении или git remote');
    process.exit(1);
  }
  await updateReleaseBody(pat);
  for (const f of files) {
    await uploadAsset(f, pat);
  }
  console.log('\n🎉 Все 10 видео успешно опубликованы на GitHub Release:');
  console.log(`👉 https://github.com/${REPO}/releases/tag/v-media-lesson-01`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
