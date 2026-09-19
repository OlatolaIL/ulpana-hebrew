import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const OUTPUT_DIR = path.resolve('./public/demo');
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const CACHE_DIR = path.resolve('./public/demo/audio_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function getGeminiApiKeys() {
  const keys = [];
  if (process.env.GEMINI_PRIMARY_API_KEY) keys.push(process.env.GEMINI_PRIMARY_API_KEY);
  if (process.env.GEMINI_API_KEY) keys.push(process.env.GEMINI_API_KEY);
  const envPath = path.resolve('.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const m1 = content.match(/GEMINI_PRIMARY_API_KEY=([^\r\n]+)/);
    const m2 = content.match(/GEMINI_API_KEY=([^\r\n]+)/);
    if (m1 && !keys.includes(m1[1].trim())) keys.push(m1[1].trim());
    if (m2 && !keys.includes(m2[1].trim())) keys.push(m2[1].trim());
  }
  return keys;
}

async function generateWithGeminiTts(text, filename, voiceName = 'Charon', maxRetries = 5) {
  const wavPath = path.join(CACHE_DIR, filename);
  if (fs.existsSync(wavPath) && fs.statSync(wavPath).size > 2000) {
    return wavPath;
  }

  const keys = getGeminiApiKeys();
  if (!keys.length) {
    throw new Error('GEMINI API keys not found in environment or .env.local');
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (let keyIdx = 0; keyIdx < keys.length; keyIdx++) {
      const apiKey = keys[keyIdx];
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-tts-preview:generateContent?key=${apiKey}`;
      const payload = {
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      };

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (res.status === 429 || data.error?.code === 429) {
          console.warn(`⏳ [Gemini TTS 429] Rate limit на ключе ${keyIdx + 1}. Переход к следующему...`);
          continue;
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
          const pcmBuffer = Buffer.from(data.candidates[0].content.parts[0].inlineData.data, 'base64');
          const tempPcm = wavPath + '.pcm';
          fs.writeFileSync(tempPcm, pcmBuffer);
          cp.spawnSync(FFMPEG_PATH, [
            '-y',
            '-f', 's16le',
            '-ar', '24000',
            '-ac', '1',
            '-i', tempPcm,
            '-ar', '44100',
            '-ac', '2',
            wavPath
          ]);
          if (fs.existsSync(tempPcm)) fs.unlinkSync(tempPcm);
          return wavPath;
        }
        console.warn(`Key ${keyIdx + 1} response error:`, data.error?.message || JSON.stringify(data));
      } catch (err) {
        console.warn(`Key ${keyIdx + 1} network error:`, err.message);
      }
    }
    console.log(`⏳ Ожидание 10с перед повторной попыткой (${attempt}/${maxRetries})...`);
    await sleep(10000);
  }
  throw new Error(`Не удалось сгенерировать аудио для "${text.slice(0, 30)}" через Gemini TTS`);
}

const REELS_CUES = [
  {
    id: 'cue_01',
    wavFile: 'reels_v3_01_Charon.wav',
    gapAfterSec: 0.3,
  },
  {
    id: 'cue_02',
    wavFile: 'reels_sped_02_Charon.wav',
    gapAfterSec: 0.95, // Телефон звонит во время этой паузы
  },
  {
    id: 'cue_courier',
    wavFile: 'reels_cue_courier_Puck.wav',
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_panic',
    wavFile: 'reels_panic_ani_v2.wav',
    gapAfterSec: 0.35, // Ступор ученика «...Ани... Ани...»
  },
  {
    id: 'cue_03',
    wavFile: 'reels_sped_03_Charon.wav',
    gapAfterSec: 0.3, // Диктор: «Тренажёр реальных звонков в Ульпан Алеф»
  },
  {
    id: 'cue_student',
    wavFile: 'reels_cue_student_Aoede.wav',
    gapAfterSec: 0.45, // Ученик: «אֲנִי כְּבָר יוֹרֵד!» + джингл успеха ИИ
  },
  {
    id: 'cue_outro',
    wavFile: 'reels_sped_outro_Charon.wav',
    gapAfterSec: 0.5, // CTA
  },
];

async function buildReelsMasterAudio(outputPath = './public/demo/reels_audio.wav') {
  console.log('🎙️ Сборка мастер-аудиодорожки с устранением щелчков и динамическим темпом...');
  const sampleRate = 44100;
  const numChannels = 2;

  // Шаг 1: Загрузка всех аудиофайлов из кэша
  const loadedClips = [];
  for (const cue of REELS_CUES) {
    const wavPath = path.join(CACHE_DIR, cue.wavFile);
    if (!fs.existsSync(wavPath)) {
      throw new Error(`Аудиофайл не найден: ${wavPath}`);
    }
    const wavBuf = fs.readFileSync(wavPath);
    const pcmData = wavBuf.subarray(44);
    const clipSamples = Math.floor(pcmData.length / 4);
    const durationSec = clipSamples / sampleRate;

    loadedClips.push({
      ...cue,
      wavPath,
      pcmData,
      clipSamples,
      durationSec,
    });
  }

  // Шаг 2: Последовательный расчет таймкодов (строго без наложений)
  let currentTime = 0.3; // Начальная микропауза для естественности
  for (const clip of loadedClips) {
    clip.timeSec = currentTime;
    clip.endSec = clip.timeSec + clip.durationSec;
    currentTime = clip.endSec + (clip.gapAfterSec || 0.35);
    console.log(`  🔊 [${clip.timeSec.toFixed(2)}s -> ${clip.endSec.toFixed(2)}s] ${clip.id} (${clip.wavFile}): (${clip.durationSec.toFixed(2)}s)`);
  }

  const totalDurationSec = Math.ceil(currentTime + 0.5);
  const totalSamples = Math.floor(sampleRate * totalDurationSec);
  console.log(`⏱️ Общая длительность аудиодорожки: ${totalDurationSec}s (сэмплов: ${totalSamples})`);

  const voiceL = new Float32Array(totalSamples);
  const voiceR = new Float32Array(totalSamples);

  // Шаг 3: Микширование речи с 15ms сглаживанием (de-clicking / raised cosine window)
  const fadeLen = Math.floor(sampleRate * 0.015); // ~660 сэмплов (15ms)
  for (const clip of loadedClips) {
    const startSample = Math.floor(clip.timeSec * sampleRate);
    for (let i = 0; i < clip.clipSamples; i++) {
      const idx = startSample + i;
      if (idx >= totalSamples) break;

      // Косинусное сглаживание начала и конца клипа (устраняет щелчки на стыках)
      let fade = 1.0;
      if (i < fadeLen) {
        fade = 0.5 * (1 - Math.cos(Math.PI * i / fadeLen));
      } else if (i > clip.clipSamples - fadeLen) {
        fade = 0.5 * (1 - Math.cos(Math.PI * (clip.clipSamples - i) / fadeLen));
      }

      const sL = (clip.pcmData.readInt16LE(i * 4) / 32768.0) * fade;
      const sR = (clip.pcmData.readInt16LE(i * 4 + 2) / 32768.0) * fade;

      voiceL[idx] += sL * 1.25;
      voiceR[idx] += sR * 1.25;
    }
  }

  // Шаг 4: Добавление звуковых эффектов (SFX) в паузы между репликами
  const cue01 = loadedClips.find(c => c.id === 'cue_01');
  const cue02 = loadedClips.find(c => c.id === 'cue_02');
  const cueCourier = loadedClips.find(c => c.id === 'cue_courier');
  const cuePanic = loadedClips.find(c => c.id === 'cue_panic');
  const cue03 = loadedClips.find(c => c.id === 'cue_03');
  const cueStudent = loadedClips.find(c => c.id === 'cue_student');
  const cueOutro = loadedClips.find(c => c.id === 'cue_outro');

  // 4.1 Звук телефонного звонка: сразу после реплики диктора cue_02 и до ответа курьера
  // Сглаженная синусоидальная огибающая (без ступенчатых щелчков)
  if (cue02 && cueCourier) {
    const ringStart = Math.floor((cue02.endSec + 0.05) * sampleRate);
    const ringEnd = Math.floor((cueCourier.timeSec - 0.1) * sampleRate);
    for (let i = ringStart; i < ringEnd && i < totalSamples; i++) {
      const t = (i - ringStart) / sampleRate;
      const pulseVal = Math.sin(2 * Math.PI * 4 * t);
      const ringPulse = pulseVal > 0 ? 0.28 * Math.pow(pulseVal, 2) : 0;
      const ringSound = (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 480 * t)) * 0.5 * ringPulse;
      voiceL[i] += ringSound;
      voiceR[i] += ringSound;
    }
  }

  // 4.2 Звук победного джингла ИИ: сразу после ответа ученика cue_student
  if (cueStudent && cueOutro) {
    const chimeStart = Math.floor((cueStudent.endSec + 0.05) * sampleRate);
    const chimeEnd = Math.floor((cueOutro.timeSec - 0.08) * sampleRate);
    for (let i = chimeStart; i < chimeEnd && i < totalSamples; i++) {
      const t = (i - chimeStart) / sampleRate;
      const decay = Math.exp(-4.5 * t);
      const chime = (Math.sin(2 * Math.PI * 587.33 * t) + Math.sin(2 * Math.PI * 880.00 * t) + Math.sin(2 * Math.PI * 1174.66 * t)) * 0.15 * decay;
      voiceL[i] += chime;
      voiceR[i] += chime;
    }
  }

  // Шаг 5: Формирование чистого WAV файла
  const dataSize = totalSamples * numChannels * 2;
  const outBuf = Buffer.alloc(44 + dataSize);

  outBuf.write('RIFF', 0);
  outBuf.writeUInt32LE(36 + dataSize, 4);
  outBuf.write('WAVE', 8);
  outBuf.write('fmt ', 12);
  outBuf.writeUInt32LE(16, 16);
  outBuf.writeUInt16LE(1, 20); // PCM
  outBuf.writeUInt16LE(numChannels, 22);
  outBuf.writeUInt32LE(sampleRate, 24);
  outBuf.writeUInt32LE(sampleRate * numChannels * 2, 28);
  outBuf.writeUInt16LE(numChannels * 2, 32);
  outBuf.writeUInt16LE(16, 34);
  outBuf.write('data', 36);
  outBuf.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    let sampleL = voiceL[i];
    let sampleR = voiceR[i];

    sampleL = Math.max(-0.99, Math.min(0.99, sampleL));
    sampleR = Math.max(-0.99, Math.min(0.99, sampleR));

    outBuf.writeInt16LE(Math.floor(sampleL * 32767), offset);
    outBuf.writeInt16LE(Math.floor(sampleR * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(outputPath, outBuf);
  console.log(`✅ Мастер-аудио готово: ${outputPath} (${(outBuf.length / 1024 / 1024).toFixed(2)} MB)`);

  // Вычисляем визуальные тайминги для HTML5-сцены
  const visualTimings = {
    checkTap: Math.round((cue01.endSec - 0.7) * 1000),
    sceneCall: Math.round(cue02.timeSec * 1000),
    callTap: Math.round((cue02.endSec + 0.55) * 1000),
    callAnswered: Math.round((cue02.endSec + 0.75) * 1000),
    callPanic: Math.round(cuePanic.timeSec * 1000),
    sceneUlpana: Math.round((cuePanic.endSec + 0.25) * 1000),
    micTap: Math.round((cue03.endSec - 0.4) * 1000),
    sceneCta: Math.round((cueStudent.endSec + 0.35) * 1000),
    ctaTap: Math.round((cueStudent.endSec + 1.8) * 1000),
  };

  return {
    totalDurationSec,
    visualTimings,
    outputPath,
  };
}

async function runViralReelsRecording() {
  const masterAudioPath = path.resolve('./public/demo/reels_audio.wav');
  const { totalDurationSec, visualTimings } = await buildReelsMasterAudio(masterAudioPath);

  console.log('🎬 Вычисленные визуальные тайминги для сцены:', visualTimings);
  console.log('📱 Запуск Chromium для записи 9:16 (390x844)...');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: OUTPUT_DIR,
      size: { width: 390, height: 844 },
    },
  });

  const page = await context.newPage();

  // Передаем точные тайминги в браузер до инициализации скрипта страницы
  await page.addInitScript((timings) => {
    window.__PLAYWRIGHT_MANUAL_START__ = true;
    window.__REELS_TIMINGS__ = timings;
  }, visualTimings);

  const sceneHtmlPath = path.resolve('./growth/scenes/duolingo_vs_reality/index.html');
  const sceneUrl = `file:///${sceneHtmlPath.replace(/\\/g, '/')}`;

  console.log(`🌐 Загрузка сцены: ${sceneUrl}...`);
  await page.goto(sceneUrl, { waitUntil: 'domcontentloaded' });
  await sleep(600); // Даем шрифтам прогрузиться

  // Запуск таймлайна с точными таймингами
  await page.evaluate((timings) => {
    window.startReelsTimeline(timings);
  }, visualTimings);

  console.log(`⏳ Запись видеопотока (${totalDurationSec} сек)...`);
  await sleep(Math.floor(totalDurationSec * 1000));

  console.log('🛑 Завершение записи сцены...');
  await page.close();
  await context.close();
  await browser.close();

  // Находим свежезаписанный файл webm от Playwright
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter((f) => f.endsWith('.webm'))
    .map((f) => ({
      name: f,
      time: fs.statSync(path.join(OUTPUT_DIR, f)).mtimeMs,
    }))
    .sort((a, b) => b.time - a.time);

  if (!files.length) {
    throw new Error('Playwright не создал файл .webm в ' + OUTPUT_DIR);
  }

  const rawVideoPath = path.join(OUTPUT_DIR, files[0].name);
  const finalMp4Path = path.resolve('./public/demo/reels_duolingo_vs_reality.mp4');

  console.log(`🎬 Сведение видео (${rawVideoPath}) и мастер-аудио в ${finalMp4Path}...`);

  const ffmpegRes = cp.spawnSync(FFMPEG_PATH, [
    '-y',
    '-i', rawVideoPath,
    '-i', masterAudioPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '20',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    finalMp4Path,
  ]);

  if (ffmpegRes.status !== 0) {
    console.error('Ошибка FFmpeg:', ffmpegRes.stderr.toString());
    throw new Error('FFmpeg не смог собрать финальный MP4');
  }

  const finalStat = fs.statSync(finalMp4Path);
  console.log(`\n🎉 ВИРАЛЬНЫЙ РОЛИК УСПЕШНО СОЗДАН!`);
  console.log(`📁 Путь: ${finalMp4Path}`);
  console.log(`📦 Размер: ${(finalStat.size / 1024 / 1024).toFixed(2)} MB`);
  console.log(`⏱️ Хронометраж: ${totalDurationSec}s (9:16 vertical)`);
}

runViralReelsRecording().catch((err) => {
  console.error('❌ Ошибка генерации видео:', err);
  process.exit(1);
});
