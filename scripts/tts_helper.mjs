import https from 'https';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const CACHE_DIR = path.resolve('./public/demo/audio_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function fetchSingleTts(text, lang, filename) {
  const filePath = path.join(CACHE_DIR, filename);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    return Promise.resolve(filePath);
  }

  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`TTS failed with status ${res.statusCode} for: "${text}"`));
      }
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(filePath);
      });
    }).on('error', reject);
  });
}

export async function fetchTts(text, lang, filename) {
  const filePath = path.join(CACHE_DIR, filename);
  if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
    return filePath;
  }

  // Если текст длиннее 140 символов, разбиваем на части и сшиваем через ffmpeg
  if (text.length > 140) {
    const words = text.split(' ');
    const chunks = [];
    let current = '';

    for (const w of words) {
      if ((current + ' ' + w).trim().length > 130) {
        if (current) chunks.push(current.trim());
        current = w;
      } else {
        current = current ? `${current} ${w}` : w;
      }
    }
    if (current) chunks.push(current.trim());

    const chunkFiles = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkName = `${path.parse(filename).name}_part${i}.mp3`;
      const chunkPath = await fetchSingleTts(chunks[i], lang, chunkName);
      chunkFiles.push(chunkPath);
    }

    const listPath = path.join(CACHE_DIR, `${path.parse(filename).name}_list.txt`);
    fs.writeFileSync(listPath, chunkFiles.map((f) => `file '${f.replace(/\\/g, '/')}'`).join('\n'));

    cp.spawnSync(FFMPEG_PATH, [
      '-y',
      '-f', 'concat',
      '-safe', '0',
      '-i', listPath,
      '-c', 'copy',
      filePath,
    ]);

    return filePath;
  }

  return fetchSingleTts(text, lang, filename);
}
