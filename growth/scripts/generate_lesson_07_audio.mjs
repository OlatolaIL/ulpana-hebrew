import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const CACHE_DIR = path.resolve('./public/demo/audio_cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

async function synthesizeEdgeVoice(text, voiceName, wavPath, speed = 1.0, isPhone = false) {
  const tempMp3 = wavPath + '.temp.mp3';
  const tts = new MsEdgeTTS();
  await tts.setMetadata(voiceName, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

  const rateStr = speed === 1.0 ? '+0%' : speed > 1.0 ? `+${Math.round((speed - 1) * 100)}%` : `-${Math.round((1 - speed) * 100)}%`;
  const { audioStream } = tts.toStream(text, { rate: rateStr });
  const writeStream = fs.createWriteStream(tempMp3);

  await new Promise((resolve, reject) => {
    audioStream.pipe(writeStream);
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    audioStream.on('error', reject);
  });

  const filters = [];
  if (isPhone) {
    filters.push('highpass=f=300', 'lowpass=f=3400', 'volume=1.15');
  }

  const args = ['-y', '-i', tempMp3];
  if (filters.length > 0) {
    args.push('-filter:a', filters.join(','));
  }
  args.push('-ar', '44100', '-ac', '2', wavPath);

  cp.spawnSync(ffmpeg, args);

  if (fs.existsSync(tempMp3)) {
    try { fs.unlinkSync(tempMp3); } catch (_) {}
  }

  return true;
}

async function synthesizeClip({ id, text, lang, wavFile, voice, speed = 1.0, isPhone = false }) {
  const finalWavPath = path.join(CACHE_DIR, wavFile);
  if (fs.existsSync(finalWavPath) && fs.statSync(finalWavPath).size > 2000) {
    console.log(`✅ [Кэш] ${wavFile}`);
    return finalWavPath;
  }

  console.log(`🎙️ Синтез "${id}": "${text.slice(0, 45)}..." [${voice}]`);
  await synthesizeEdgeVoice(text, voice, finalWavPath, speed, isPhone);

  const stat = fs.statSync(finalWavPath);
  console.log(`  ✅ Готово: ${wavFile} (${(stat.size / 1024).toFixed(1)} KB)`);
  return finalWavPath;
}

export const LESSON_07_CUES = [
  // АКТ 1: СЛОВАРЬ (0.0s -> ~10.0s)
  {
    id: 'cue_01_hook',
    wavFile: 'l07_01_hook.wav',
    lang: 'ru',
    voice: 'ru-RU-DmitryNeural',
    text: 'Ищете квартиру в Израиле? В седьмом уроке учим ключевые слова для аренды:',
    speed: 1.05,
    gapAfterSec: 0.2,
  },
  {
    id: 'cue_02_word1',
    wavFile: 'l07_02_word1.wav',
    lang: 'iw',
    voice: 'he-IL-AvriNeural',
    text: 'דִּירָה',
    speed: 1.0,
    gapAfterSec: 0.2,
  },
  {
    id: 'cue_03_word2',
    wavFile: 'l07_03_word2.wav',
    lang: 'iw',
    voice: 'he-IL-AvriNeural',
    text: 'שְׁלוֹשָׁה חֲדָרִים',
    speed: 1.0,
    gapAfterSec: 0.2,
  },
  {
    id: 'cue_04_word3',
    wavFile: 'l07_04_word3.wav',
    lang: 'iw',
    voice: 'he-IL-AvriNeural',
    text: 'מְקָרֵר',
    speed: 1.0,
    gapAfterSec: 0.25,
  },

  // АКТ 2: ДИАЛОГ С РАСПОЗНАВАНИЕМ ГОЛОСА (10.0s -> ~23.5s)
  {
    id: 'cue_05_bridge_dialogue',
    wavFile: 'l07_05_bridge_dialogue.wav',
    lang: 'ru',
    voice: 'ru-RU-DmitryNeural',
    text: 'В диалоге тренируем ответ по ролям:',
    speed: 1.05,
    gapAfterSec: 0.2,
  },
  {
    id: 'cue_06_eli_question',
    wavFile: 'l07_06_eli_question.wav',
    lang: 'iw',
    voice: 'he-IL-AvriNeural',
    text: 'שָׁלוֹם! כַּמָּה חֲדָרִים אַתָּה מְחַפֵּשׂ?',
    speed: 1.0,
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_07_student_answer',
    wavFile: 'l07_07_student_answer.wav',
    lang: 'iw',
    voice: 'he-IL-HilaNeural',
    text: 'אֲנִי מְחַפֵּשׂ דִּירָה שֶׁל שְׁלוֹשָׁה חֲדָרִים. יֵשׁ מְקָרֵר?',
    speed: 1.0,
    gapAfterSec: 0.2,
  },
  {
    id: 'cue_08_eval',
    wavFile: 'l07_08_eval.wav',
    lang: 'ru',
    voice: 'ru-RU-DmitryNeural',
    text: 'ИИ моментально проверяет точность каждого слова.',
    speed: 1.05,
    gapAfterSec: 0.25,
  },

  // АКТ 3: ИМИТАЦИЯ ЗВОНКА С ИИ (23.5s -> ~44.0s)
  {
    id: 'cue_09_bridge_phone',
    wavFile: 'l07_09_bridge_phone.wav',
    lang: 'ru',
    voice: 'ru-RU-DmitryNeural',
    text: 'А в симуляторе звонка тренируем разговор с ИИ-хозяином без стресса:',
    speed: 1.05,
    gapAfterSec: 0.2,
  },
  {
    id: 'cue_10_eli_phone_hello',
    wavFile: 'l07_10_eli_phone_hello.wav',
    lang: 'iw',
    voice: 'he-IL-AvriNeural',
    text: 'הַלּוֹ? כֵּן, בְּקֶשֶׁר לַדִּירָה?',
    speed: 1.0,
    isPhone: true,
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_11_student_phone',
    wavFile: 'l07_11_student_phone.wav',
    lang: 'iw',
    voice: 'he-IL-HilaNeural',
    text: 'שָׁלוֹם! יֵשׁ כְּבָר מְקָרֵר וּמִיטָּה?',
    speed: 1.0,
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_12_eli_phone_confirm',
    wavFile: 'l07_12_eli_phone_confirm.wav',
    lang: 'iw',
    voice: 'he-IL-AvriNeural',
    text: 'בֶּטַח! בּוֹא לִרְאוֹת הַיּוֹם בְּשֵׁשׁ.',
    speed: 1.0,
    isPhone: true,
    gapAfterSec: 0.2,
  },
  {
    id: 'cue_13_student_phone_ok',
    wavFile: 'l07_13_student_phone_ok.wav',
    lang: 'iw',
    voice: 'he-IL-HilaNeural',
    text: 'מְעוּלֶּה, תּוֹדָה!',
    speed: 1.0,
    gapAfterSec: 0.3,
  },

  // АКТ 4: ОФФЕР И ПРИЗЫВ К ДЕЙСТВИЮ (44.0s -> ~51.0s)
  {
    id: 'cue_14_outro',
    wavFile: 'l07_14_outro.wav',
    lang: 'ru',
    voice: 'ru-RU-DmitryNeural',
    text: 'Забирай словарь в описании и тренируй иврит 30 дней бесплатно!',
    speed: 1.05,
    gapAfterSec: 0.3,
  },
];

export async function buildLesson07MasterAudio(masterOutPath) {
  console.log('🚀 Синтез аудиоклипов для Урока 7...');
  for (const cue of LESSON_07_CUES) {
    await synthesizeClip(cue);
  }

  console.log('\n🎛️ Сборка мастер-аудио с 15ms сглаживанием и SFX...');
  const sampleRate = 44100;
  const numChannels = 2;

  const loadedClips = [];
  for (const cue of LESSON_07_CUES) {
    const wavPath = path.join(CACHE_DIR, cue.wavFile);
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

  // Расчет таймкодов
  let currentTime = 0.25;
  for (const clip of loadedClips) {
    // Вставляем 0.8s для реалистичного гудка вызова
    if (clip.id === 'cue_10_eli_phone_hello') {
      currentTime += 0.8;
    }

    clip.timeSec = currentTime;
    clip.endSec = clip.timeSec + clip.durationSec;
    currentTime = clip.endSec + (clip.gapAfterSec || 0.2);
    console.log(`  🔊 [${clip.timeSec.toFixed(2)}s -> ${clip.endSec.toFixed(2)}s] ${clip.id} (${clip.wavFile}) [${clip.durationSec.toFixed(2)}s]`);
  }

  const totalDurationSec = Math.ceil(currentTime + 0.2);
  const totalSamples = Math.floor(sampleRate * totalDurationSec);
  console.log(`⏱️ Итоговая общая длительность мастер-аудио: ${totalDurationSec}s (сэмплов: ${totalSamples})`);

  const voiceL = new Float32Array(totalSamples);
  const voiceR = new Float32Array(totalSamples);

  // Косинусное сглаживание 15ms (de-clicking)
  const fadeLen = Math.floor(sampleRate * 0.015);
  for (const clip of loadedClips) {
    const startSample = Math.floor(clip.timeSec * sampleRate);
    for (let i = 0; i < clip.clipSamples; i++) {
      const idx = startSample + i;
      if (idx >= totalSamples) break;

      let fade = 1.0;
      if (i < fadeLen) {
        fade = 0.5 * (1 - Math.cos(Math.PI * i / fadeLen));
      } else if (i > clip.clipSamples - fadeLen) {
        fade = 0.5 * (1 - Math.cos(Math.PI * (clip.clipSamples - i) / fadeLen));
      }

      const sL = (clip.pcmData.readInt16LE(i * 4) / 32768.0) * fade;
      const sR = (clip.pcmData.readInt16LE(i * 4 + 2) / 32768.0) * fade;

      voiceL[idx] += sL * 1.15;
      voiceR[idx] += sR * 1.15;
    }
  }

  // SFX 1: Телефонный гудок перед тем, как Эли берет трубку
  const bridgePhone = loadedClips.find(c => c.id === 'cue_09_bridge_phone');
  const eliPhone = loadedClips.find(c => c.id === 'cue_10_eli_phone_hello');
  if (bridgePhone && eliPhone) {
    const ringStartSec = bridgePhone.endSec + 0.15;
    const ring1Start = Math.floor(ringStartSec * sampleRate);
    const ring1End = Math.floor((ringStartSec + 0.65) * sampleRate);

    const applyRing = (s, e) => {
      for (let i = s; i < e && i < totalSamples; i++) {
        const t = (i - s) / sampleRate;
        const env = Math.min(1.0, Math.min(t / 0.05, (e - i) / (sampleRate * 0.05)));
        const ringSound = (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 480 * t)) * 0.22 * env;
        voiceL[i] += ringSound;
        voiceR[i] += ringSound;
      }
    };
    applyRing(ring1Start, ring1End);
  }

  // SFX 2: Перезвон успеха (success chime) после диалога
  const studentClip = loadedClips.find(c => c.id === 'cue_07_student_answer');
  if (studentClip) {
    const chimeStart = Math.floor((studentClip.endSec + 0.1) * sampleRate);
    for (let i = chimeStart; i < chimeStart + Math.floor(sampleRate * 1.2) && i < totalSamples; i++) {
      const t = (i - chimeStart) / sampleRate;
      const decay = Math.exp(-4.0 * t);
      const chime = (Math.sin(2 * Math.PI * 587.33 * t) + Math.sin(2 * Math.PI * 880.00 * t) + Math.sin(2 * Math.PI * 1174.66 * t)) * 0.18 * decay;
      voiceL[i] += chime;
      voiceR[i] += chime;
    }
  }

  // SFX 3: Звук окончания звонка (hang-up short chime)
  const studentOkClip = loadedClips.find(c => c.id === 'cue_13_student_phone_ok');
  if (studentOkClip) {
    const hangStart = Math.floor((studentOkClip.endSec + 0.05) * sampleRate);
    for (let i = hangStart; i < hangStart + Math.floor(sampleRate * 0.35) && i < totalSamples; i++) {
      const t = (i - hangStart) / sampleRate;
      const decay = Math.exp(-8.0 * t);
      const sound = Math.sin(2 * Math.PI * 520 * t) * 0.15 * decay;
      voiceL[i] += sound;
      voiceR[i] += sound;
    }
  }

  // Запись WAV 44100 Hz, stereo
  const dataSize = totalSamples * numChannels * 2;
  const outBuf = Buffer.alloc(44 + dataSize);

  outBuf.write('RIFF', 0);
  outBuf.writeUInt32LE(36 + dataSize, 4);
  outBuf.write('WAVE', 8);
  outBuf.write('fmt ', 12);
  outBuf.writeUInt32LE(16, 16);
  outBuf.writeUInt16LE(1, 20);
  outBuf.writeUInt16LE(numChannels, 22);
  outBuf.writeUInt32LE(sampleRate, 24);
  outBuf.writeUInt32LE(sampleRate * numChannels * 2, 28);
  outBuf.writeUInt16LE(numChannels * 2, 32);
  outBuf.writeUInt16LE(16, 34);
  outBuf.write('data', 36);
  outBuf.writeUInt32LE(dataSize, 40);

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    let sampleL = Math.max(-0.99, Math.min(0.99, voiceL[i]));
    let sampleR = Math.max(-0.99, Math.min(0.99, voiceR[i]));

    outBuf.writeInt16LE(Math.floor(sampleL * 32767), offset);
    outBuf.writeInt16LE(Math.floor(sampleR * 32767), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(masterOutPath, outBuf);
  console.log(`✅ Мастер-аудио сохранено: ${masterOutPath}`);

  return {
    totalDurationSec,
    clips: loadedClips,
    outputPath: masterOutPath,
  };
}

if (process.argv[1]?.endsWith('generate_lesson_07_audio.mjs')) {
  const outPath = path.resolve(CACHE_DIR, 'l07_master_audio.wav');
  buildLesson07MasterAudio(outPath).catch(err => {
    console.error('❌ Ошибка генерации мастер-аудио:', err);
    process.exit(1);
  });
}
