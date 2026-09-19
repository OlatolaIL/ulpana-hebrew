const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const CACHE_DIR = path.resolve('./public/demo/audio_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithGeminiTts(text, filename, voiceName = 'Charon', maxRetries = 5) {
  const wavPath = path.join(CACHE_DIR, filename);
  if (fs.existsSync(wavPath) && fs.statSync(wavPath).size > 2000) {
    console.log(`✅ [КЭШ] ${filename} уже существует (${fs.statSync(wavPath).size} байт)`);
    return wavPath;
  }

  const allKeys = getGeminiApiKeys();
  if (!allKeys.length) {
    throw new Error('GEMINI API keys not found');
  }

  // Фильтруем заведомо неработающие ключи
  const workingKeys = [...allKeys];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    for (let i = 0; i < workingKeys.length; i++) {
      const apiKey = workingKeys[i];
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
          console.warn(`⏳ [Gemini TTS 429] Free Tier Rate limit (3 RPM). Ожидание 65с для сброса окна...`);
          await sleep(65000);
          // Повторяем тот же ключ после сброса
          i--;
          continue;
        }

        if (data.error?.message?.includes('prepayment credits are depleted')) {
          console.warn(`⚠️ Ключ исключен из пула (depleted).`);
          workingKeys.splice(i, 1);
          i--;
          continue;
        }

        if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.inlineData?.data) {
          const pcmBuffer = Buffer.from(data.candidates[0].content.parts[0].inlineData.data, 'base64');
          const tempPcm = wavPath + '.pcm';
          fs.writeFileSync(tempPcm, pcmBuffer);
          cp.spawnSync(ffmpeg, [
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
          console.log(`🎉 [TTS] Сгенерирован ${filename} (${fs.statSync(wavPath).size} байт)`);
          console.log(`⏳ Пауза 22с для соблюдения квоты 3 RPM...`);
          await sleep(22000);
          return wavPath;
        }
        console.warn(`TTS API error:`, data.error?.message?.slice(0, 100));
      } catch (err) {
        console.warn(`TTS Network error:`, err.message);
      }
    }
    console.log(`⏳ Ожидание 30с перед попыткой (${attempt}/${maxRetries})...`);
    await sleep(30000);
  }
  throw new Error(`Не удалось сгенерировать аудио для "${text.slice(0, 30)}"`);
}

async function run() {
  console.log('🎙️ Генерация аудиоклипов для Обучающего видео: Этап 5 (Диалоги)...');
  
  // 1. Введение / Цель
  await generateWithGeminiTts(
    'Этап пять: Диалоги. Здесь ты учишься говорить связно в реальных ситуациях без стресса.',
    'tut5_raw_01_intro.wav',
    'Charon'
  );

  // 2. Реплика бариста
  await generateWithGeminiTts(
    'שָׁלוֹם! מָה אַתָּה רוֹצֶה לִשְׁתּוֹת?',
    'tut5_raw_02_barista.wav',
    'Puck'
  );

  // 3. Реплика ученика
  await generateWithGeminiTts(
    'אֲנִי רוֹצֶה קָפֶה קָטָן, בְּבַקָּשָׁה.',
    'tut5_raw_03_student.wav',
    'Aoede'
  );

  // 4. Пояснение механики Whisper
  await generateWithGeminiTts(
    'Серверный Whisper распознает речь без спешки. ИИ оценивает каждое слово и произношение!',
    'tut5_raw_04_eval.wav',
    'Charon'
  );

  // 5. Результат / Зачет
  await generateWithGeminiTts(
    'Девяносто восемь процентов! Этап успешно зачтён. Говори уверенно в Израиле!',
    'tut5_raw_05_outro.wav',
    'Charon'
  );

  // Обработка темпа через FFmpeg (ускорение диктора до 1.22x согласно R-25)
  console.log('⚡ Ускорение закадровой русской речи до 1.22x (R-25)...');
  const speedups = [
    { in: 'tut5_raw_01_intro.wav', out: 'tut5_sped_01_intro.wav', speed: '1.22' },
    { in: 'tut5_raw_04_eval.wav', out: 'tut5_sped_04_eval.wav', speed: '1.22' },
    { in: 'tut5_raw_05_outro.wav', out: 'tut5_sped_05_outro.wav', speed: '1.22' },
  ];

  for (const s of speedups) {
    const inPath = path.join(CACHE_DIR, s.in);
    const outPath = path.join(CACHE_DIR, s.out);
    cp.spawnSync(ffmpeg, [
      '-y',
      '-i', inPath,
      '-filter:a', `atempo=${s.speed}`,
      outPath
    ]);
    console.log(`✅ Обработан ${s.out}`);
  }

  console.log('🎉 Все аудиоклипы успешно подготовлены!');
}

run().catch((err) => {
  console.error('❌ Ошибка генерации аудио:', err);
  process.exit(1);
});
