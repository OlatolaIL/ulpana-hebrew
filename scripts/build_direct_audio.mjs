import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { fetchTts } from './tts_helper.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

const TIMED_CUES = [
  {
    id: 'intro',
    timeSec: 1.0,
    lang: 'ru',
    text: 'Ульпа́на — интерактивная платформа для изучения иврита. В программе сто уроков от базового Алеф до свободного Бет.',
  },
  {
    id: 'structure',
    timeSec: 12.0,
    lang: 'ru',
    text: 'В каждом уроке пять обязательных этапов: интерактивная теория, словарный запас, тренажер упражнений, диалоги с оценкой произношения и живой телефонный звонок.',
  },
  {
    id: 'stage1_theory',
    timeSec: 27.5,
    lang: 'ru',
    text: 'Этап первый: теория с интерактивным конспектом. Каждое слово и фраза озвучены носителями. В один клик переключаем печатный шрифт на рукописный курсив и скрываем огласовки для тренировки беглого чтения.',
  },
  {
    id: 'propisi',
    timeSec: 45.0,
    lang: 'ru',
    text: 'Раздел Прописи обучает реальному рукописному шрифту. Здесь вы видите траекторию каждого штриха, школьную линовку и тренируетесь писать буквы от руки прямо на экране.',
  },
  {
    id: 'decks_and_pealim',
    timeSec: 58.5,
    lang: 'ru',
    text: 'В тематических колодах и карточках урока встроен полный справочник Пеалим. Прямо на обороте карточки открываются спряжения глагола во всех временах: настоящее, прошедшее и будущее, с разбором корня и озвучкой каждой формы.',
  },
  {
    id: 'stage3_exercises',
    timeSec: 80.0,
    lang: 'ru',
    text: 'Этап третий: интерактивный тренажер. Сборка предложений из блоков закрепляет порядок слов и понимание грамматики на автомате.',
  },
  {
    id: 'stage4_dialogue_teacher',
    timeSec: 90.0,
    lang: 'iw',
    text: 'שָׁלוֹם! מָה נִשְׁמַע?',
  },
  {
    id: 'stage4_dialogue_exp',
    timeSec: 92.5,
    lang: 'ru',
    text: 'Этап четвертый: живой диалог. ИИ озвучивает реплики и сразу оценивает чёткость вашего произношения и правильность ударения в процентах.',
  },
  {
    id: 'stage4_dialogue_student',
    timeSec: 105.5,
    lang: 'iw',
    text: 'שָׁלוֹם, הַכֹּל בְּסֵדֶר!',
  },
  {
    id: 'stage5_phone_call',
    timeSec: 109.0,
    lang: 'iw',
    text: 'שָׁלוֹם! אֲנִי הַנַּהָג שֶׁל הַטֶּקְסִי, אֲנִי לְמַטָּה',
  },
  {
    id: 'stage5_phone_exp',
    timeSec: 114.0,
    lang: 'ru',
    text: 'Этап пятый: телефонные звонки в жизненных ситуациях — заказ такси, разговор с другом, звонок врачу или курьеру. Вы общаетесь живым голосом в динамике смартфона и получаете подробный отчет с оценкой речи.',
  },
  {
    id: 'stage5_phone_student',
    timeSec: 127.5,
    lang: 'iw',
    text: 'מְצוּיָן! אֲנִי יוֹרֵד עַכְשָׁו',
  },
  {
    id: 'outro',
    timeSec: 132.0,
    lang: 'ru',
    text: 'Все пять этапов урока пройдены! Ульпа́на — говорите на иврите легко и уверенно.',
  },
];

export async function createLoudMasterAudio(totalDurationSec = 140, outputPath = './public/demo/master_audio.wav') {
  console.log(`🎙️ Сборка громкой мастер-аудиодорожки (${totalDurationSec}s)...`);
  const sampleRate = 44100;
  const numChannels = 2;
  const totalSamples = Math.floor(sampleRate * totalDurationSec);

  // Создаем чистый массив сэмплов для голоса
  const voiceL = new Float32Array(totalSamples);
  const voiceR = new Float32Array(totalSamples);

  // 1. Конвертируем каждый MP3 в нормализованный WAV 44100 stereo и считываем сэмплы
  for (const cue of TIMED_CUES) {
    const mp3Name = `${cue.id}_${cue.lang}.mp3`;
    const wavName = `${cue.id}_${cue.lang}.wav`;
    const mp3Path = await fetchTts(cue.text, cue.lang, mp3Name);
    const wavPath = path.join(path.dirname(mp3Path), wavName);

    // Конвертация в 44.1kHz 16-bit stereo WAV без сжатия
    cp.spawnSync(FFMPEG_PATH, [
      '-y',
      '-i', mp3Path,
      '-ar', '44100',
      '-ac', '2',
      wavPath,
    ]);

    const wavBuf = fs.readFileSync(wavPath);
    // Пропускаем 44 байта заголовка
    const pcmData = wavBuf.subarray(44);
    const clipSamples = Math.floor(pcmData.length / 4);

    const startSample = Math.floor(cue.timeSec * sampleRate);
    console.log(`  🔊 [${cue.timeSec}s] ${cue.id}: ${cue.lang} (сэмплов: ${clipSamples}, длительность: ${(clipSamples / sampleRate).toFixed(1)}s)`);

    for (let i = 0; i < clipSamples; i++) {
      const idx = startSample + i;
      if (idx >= totalSamples) break;

      const sL = pcmData.readInt16LE(i * 4) / 32768.0;
      const sR = pcmData.readInt16LE(i * 4 + 2) / 32768.0;

      // Голос без малейшего ослабления + легкий буст 1.25x для четкости
      voiceL[idx] += sL * 1.25;
      voiceR[idx] += sR * 1.25;
    }
  }

  // 2. Генерируем фоновую музыку (Lo-Fi Ambient) на тихой громкости (0.06 = ~ -24dB)
  console.log('🎵 Генерация тихой фоновой музыки...');
  const chords = [
    [261.63, 329.63, 392.00, 493.88], // Cmaj7
    [220.00, 261.63, 329.63, 392.00], // Am7
    [174.61, 220.00, 261.63, 329.63], // Fmaj7
    [196.00, 246.94, 293.66, 349.23], // G7
  ];
  const chordDuration = 4.0;
  const musicVolume = 0.055; // Тихая музыка, которая абсолютно не мешает голосу

  // 3. Формируем финальный WAV файл
  const dataSize = totalSamples * numChannels * 2;
  const outBuf = Buffer.alloc(44 + dataSize);

  // Заголовок WAV
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
    const t = i / sampleRate;
    const chordIndex = Math.floor((t / chordDuration) % chords.length);
    const chord = chords[chordIndex];
    const chordTime = (t % chordDuration) / chordDuration;
    const env = Math.sin(Math.PI * Math.pow(chordTime, 0.7)) * 0.18;

    let musicL = 0;
    let musicR = 0;
    for (let f = 0; f < chord.length; f++) {
      const freq = chord[f];
      const s = Math.sin(2 * Math.PI * freq * t) * 0.7 + Math.sin(4 * Math.PI * freq * t) * 0.2;
      const pan = (f / (chord.length - 1)) * 0.4 - 0.2;
      musicL += s * (0.5 - pan);
      musicR += s * (0.5 + pan);
    }
    musicL = musicL * env * musicVolume;
    musicR = musicR * env * musicVolume;

    // Смешиваем голос + тихую музыку
    let sampleL = voiceL[i] + musicL;
    let sampleR = voiceR[i] + musicR;

    // Лимитер (защита от клиппинга)
    sampleL = Math.max(-0.99, Math.min(0.99, sampleL));
    sampleR = Math.max(-0.99, Math.min(0.99, sampleR));

    outBuf.writeInt16LE(Math.floor(sampleL * 32767), offset);
    outBuf.writeInt16LE(Math.floor(sampleR * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(outputPath, outBuf);
  console.log(`✅ Идеальная громкая мастер-дорожка готова: ${outputPath} (${(outBuf.length / 1024 / 1024).toFixed(2)} MB)`);
  return outputPath;
}
