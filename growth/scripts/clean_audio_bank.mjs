import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const BANK_DIR = path.resolve(ROOT, 'public/demo/audio_bank');

function sanitizeAudioBuffer(pcmBuffer, sampleRate = 44100) {
  // 16-bit mono
  const samples = new Int16Array(pcmBuffer.buffer, pcmBuffer.byteOffset, Math.floor(pcmBuffer.byteLength / 2));
  
  // 1. Устранение щелчка в начале (RIFF header ~1.5-2ms)
  const headerSilenceSamples = Math.floor(sampleRate * 0.002); // 2ms = 88 samples
  const fadeInSamples = Math.floor(sampleRate * 0.010); // 10ms fade-in
  
  for (let i = 0; i < headerSilenceSamples && i < samples.length; i++) {
    samples[i] = 0;
  }
  for (let i = headerSilenceSamples; i < headerSilenceSamples + fadeInSamples && i < samples.length; i++) {
    const progress = (i - headerSilenceSamples) / fadeInSamples;
    const fade = 0.5 * (1 - Math.cos(Math.PI * progress));
    samples[i] = Math.round(samples[i] * fade);
  }

  // 2. Детект и обрезка хвоста водяного знака SynthID
  // Проверяем энергию в последних 200мс
  const last200msSamples = Math.floor(sampleRate * 0.2);
  let tailMax = 0;
  const tailStart = Math.max(0, samples.length - last200msSamples);
  for (let j = tailStart; j < samples.length; j++) {
    const val = Math.abs(samples[j]);
    if (val > tailMax) tailMax = val;
  }

  let finalLength = samples.length;

  if (tailMax > 5000) {
    // В хвосте есть всплеск шума SynthID.
    // Ищем зону тишины (амплитуда < 800) перед шумом продолжительностью >= 25мс
    const minSilenceLen = Math.floor(sampleRate * 0.025); // ~1100 сэмплов
    let silenceCount = 0;
    let cutPoint = samples.length;

    for (let k = samples.length - 1; k >= 0; k--) {
      if (Math.abs(samples[k]) < 800) {
        silenceCount++;
        if (silenceCount >= minSilenceLen) {
          cutPoint = k + minSilenceLen; // Отрезаем внутри естественной тишины
          break;
        }
      } else {
        silenceCount = 0;
      }
    }

    if (cutPoint < samples.length) {
      finalLength = cutPoint;
    }
  }

  // 3. Плавный fade-out в конце (15мс)
  const fadeOutSamples = Math.floor(sampleRate * 0.015);
  const fadeOutStart = Math.max(0, finalLength - fadeOutSamples);
  for (let i = fadeOutStart; i < finalLength; i++) {
    const progress = (finalLength - i) / fadeOutSamples;
    const fade = 0.5 * (1 - Math.cos(Math.PI * progress));
    samples[i] = Math.round(samples[i] * fade);
  }

  return samples.subarray(0, finalLength);
}

function cleanFile(filePath) {
  const fileName = path.basename(filePath);
  
  // Декодируем в PCM s16le 44.1kHz mono
  const pcm = cp.execFileSync(ffmpeg, [
    '-y',
    '-i', filePath,
    '-f', 's16le',
    '-ar', '44100',
    '-ac', '1',
    'pipe:1',
  ], { stdio: ['ignore', 'pipe', 'ignore'] });

  const cleanedSamples = sanitizeAudioBuffer(pcm, 44100);

  // Кодируем обратно в mp3 через временный файл
  const tempWav = filePath + '.tmp.wav';
  
  // Собираем минимальный WAV
  const numChannels = 1;
  const sampleRate = 44100;
  const dataByteLen = cleanedSamples.byteLength;
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataByteLen, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20); // PCM
  header.writeUInt16LE(numChannels, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * numChannels * 2, 28);
  header.writeUInt16LE(numChannels * 2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(dataByteLen, 40);

  const wavBuf = Buffer.concat([header, Buffer.from(cleanedSamples.buffer, cleanedSamples.byteOffset, cleanedSamples.byteLength)]);
  fs.writeFileSync(tempWav, wavBuf);

  // Сжимаем в чистый MP3
  const tempMp3 = filePath + '.tmp.mp3';
  cp.spawnSync(ffmpeg, [
    '-y',
    '-i', tempWav,
    '-ar', '44100',
    '-ac', '1',
    '-b:a', '128k',
    tempMp3,
  ]);

  try { fs.unlinkSync(tempWav); } catch (_) {}

  if (fs.existsSync(tempMp3) && fs.statSync(tempMp3).size > 1000) {
    fs.renameSync(tempMp3, filePath);
    return true;
  }
  try { if (fs.existsSync(tempMp3)) fs.unlinkSync(tempMp3); } catch (_) {}
  return false;
}

function sanitizeWavFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  try {
    const pcm = cp.execFileSync(ffmpeg, [
      '-y',
      '-i', filePath,
      '-f', 's16le',
      '-ar', '44100',
      '-ac', '2',
      'pipe:1',
    ], { maxBuffer: 50 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });

    const samples = new Int16Array(pcm.buffer, pcm.byteOffset, Math.floor(pcm.byteLength / 2));
    const sampleRate = 44100;
    const numChannels = 2;
    const clipSamples = Math.floor(samples.length / numChannels);

    // 1. Устранение щелчка в начале (2ms silence + 10ms fade-in)
    const headerSilence = Math.floor(sampleRate * 0.002);
    const fadeIn = Math.floor(sampleRate * 0.010);
    for (let i = 0; i < headerSilence && i < clipSamples; i++) {
      for (let c = 0; c < numChannels; c++) samples[i * numChannels + c] = 0;
    }
    for (let i = headerSilence; i < headerSilence + fadeIn && i < clipSamples; i++) {
      const fade = 0.5 * (1 - Math.cos((Math.PI * (i - headerSilence)) / fadeIn));
      for (let c = 0; c < numChannels; c++) samples[i * numChannels + c] = Math.round(samples[i * numChannels + c] * fade);
    }

    // 2. Детект и обрезка хвоста водяного знака SynthID
    const last200ms = Math.floor(sampleRate * 0.2);
    let tailMax = 0;
    const tailStart = Math.max(0, clipSamples - last200ms);
    for (let j = tailStart * numChannels; j < samples.length; j++) {
      const val = Math.abs(samples[j]);
      if (val > tailMax) tailMax = val;
    }

    let finalClipSamples = clipSamples;
    if (tailMax > 5000) {
      const minSilenceLen = Math.floor(sampleRate * 0.025);
      let silenceCount = 0;
      let cutPoint = clipSamples;
      for (let k = clipSamples - 1; k >= 0; k--) {
        let maxCh = 0;
        for (let c = 0; c < numChannels; c++) {
          const v = Math.abs(samples[k * numChannels + c]);
          if (v > maxCh) maxCh = v;
        }
        if (maxCh < 800) {
          silenceCount++;
          if (silenceCount >= minSilenceLen) {
            cutPoint = k + minSilenceLen;
            break;
          }
        } else {
          silenceCount = 0;
        }
      }
      if (cutPoint < clipSamples) finalClipSamples = cutPoint;
    }

    // 3. Fade out
    const fadeOut = Math.floor(sampleRate * 0.015);
    const fadeOutStart = Math.max(0, finalClipSamples - fadeOut);
    for (let i = fadeOutStart; i < finalClipSamples; i++) {
      const fade = 0.5 * (1 - Math.cos((Math.PI * (finalClipSamples - i)) / fadeOut));
      for (let c = 0; c < numChannels; c++) samples[i * numChannels + c] = Math.round(samples[i * numChannels + c] * fade);
    }

    const finalSamples = samples.subarray(0, finalClipSamples * numChannels);
    const dataByteLen = finalSamples.byteLength;
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + dataByteLen, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(numChannels, 22);
    header.writeUInt32LE(sampleRate, 24);
    header.writeUInt32LE(sampleRate * numChannels * 2, 28);
    header.writeUInt16LE(numChannels * 2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(dataByteLen, 40);

    fs.writeFileSync(filePath, Buffer.concat([header, Buffer.from(finalSamples.buffer, finalSamples.byteOffset, finalSamples.byteLength)]));
    return true;
  } catch (_) {
    return false;
  }
}

async function main() {
  console.log('🧹 [clean_audio_bank] Запуск глубокой санитаризации аудио-банка...');
  const files = fs.readdirSync(BANK_DIR).filter(f => f.endsWith('.mp3'));
  console.log(`Найдено ${files.length} MP3 файлов в ${BANK_DIR}`);

  let cleaned = 0;
  for (const f of files) {
    const fullPath = path.join(BANK_DIR, f);
    const ok = cleanFile(fullPath);
    if (ok) cleaned++;
  }
  console.log(`✅ Санитаризация MP3 завершена: успешно очищено ${cleaned} файлов.`);

  // Санитаризация персонализированных CTA в cache
  const CACHE_DIR = path.resolve(ROOT, 'public/demo/audio_cache');
  if (fs.existsSync(CACHE_DIR)) {
    const cacheFiles = fs.readdirSync(CACHE_DIR);
    let ctaCleaned = 0;
    for (const f of cacheFiles) {
      if (f.includes('_cta_') && f.endsWith('.wav')) {
        const ok = sanitizeWavFile(path.join(CACHE_DIR, f));
        if (ok) ctaCleaned++;
      } else if (/^l0[2-5]_.*\.wav$/.test(f) || /^l0[2-5]_.*\.mp3$/.test(f)) {
        // Удаляем промежуточные кэши конвертации уроков 2-5, чтобы перегенерировать из чистого банка
        try { fs.unlinkSync(path.join(CACHE_DIR, f)); } catch (_) {}
      }
    }
    console.log(`✅ Санитаризация CTA WAV завершена: очищено ${ctaCleaned} CTA файлов.`);
  }

  // Очистка старых master WAV
  const demoFiles = fs.readdirSync(path.resolve(ROOT, 'public/demo'));
  for (const f of demoFiles) {
    if (/^lesson_0[2-5]_.*_master\.wav$/.test(f)) {
      try { fs.unlinkSync(path.resolve(ROOT, 'public/demo', f)); } catch (_) {}
    }
  }
  console.log(`✅ Кэши master WAV очищены для чистой пересборки.`);
}

main().catch(err => {
  console.error('Ошибка:', err);
  process.exit(1);
});
