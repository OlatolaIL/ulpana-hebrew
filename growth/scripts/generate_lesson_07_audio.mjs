import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { fetchTts } from '../../scripts/tts_helper.mjs';

const require = createRequire(import.meta.url);
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

async function tryGeminiTts(text, voiceName, wavPath) {
  const keys = getGeminiApiKeys();
  if (!keys.length) return false;

  for (let i = 0; i < keys.length; i++) {
    const apiKey = keys[i];
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
        return true;
      }
    } catch (_) {}
  }
  return false;
}

async function convertMp3ToWav(mp3Path, wavPath, speed = 1.0, pitchFactor = 1.0) {
  const args = ['-y', '-i', mp3Path];
  const filters = [];
  if (pitchFactor !== 1.0) {
    const sampleRate = 44100;
    const newRate = Math.round(sampleRate * pitchFactor);
    const tempoCorrection = (1 / pitchFactor).toFixed(4);
    filters.push(`asetrate=${newRate}`, `aresample=${sampleRate}`, `atempo=${tempoCorrection}`);
  }
  if (speed !== 1.0) {
    filters.push(`atempo=${speed}`);
  }
  if (filters.length > 0) {
    args.push('-filter:a', filters.join(','));
  }
  args.push('-ar', '44100', '-ac', '2', wavPath);

  cp.spawnSync(ffmpeg, args);
}

async function synthesizeClip({ id, text, lang, wavFile, geminiVoice, speed = 1.0, pitchFactor = 1.0 }) {
  const finalWavPath = path.join(CACHE_DIR, wavFile);
  if (fs.existsSync(finalWavPath) && fs.statSync(finalWavPath).size > 2000) {
    console.log(`✅ [Кэш] ${wavFile}`);
    return finalWavPath;
  }

  console.log(`🎙️ Синтез "${id}": "${text.slice(0, 45)}..." [${lang}]`);
  let geminiSuccess = false;
  if (geminiVoice) {
    try {
      geminiSuccess = await tryGeminiTts(text, geminiVoice, finalWavPath);
      if (geminiSuccess && (speed !== 1.0 || pitchFactor !== 1.0)) {
        const tempWav = finalWavPath + '.temp.wav';
        fs.renameSync(finalWavPath, tempWav);
        await convertMp3ToWav(tempWav, finalWavPath, speed, pitchFactor);
        if (fs.existsSync(tempWav)) fs.unlinkSync(tempWav);
      }
    } catch (_) {}
  }

  if (!geminiSuccess) {
    const mp3Name = wavFile.replace(/\.wav$/, '_raw.mp3');
    const mp3Path = await fetchTts(text, lang, mp3Name);
    await convertMp3ToWav(mp3Path, finalWavPath, speed, pitchFactor);
  }

  const stat = fs.statSync(finalWavPath);
  console.log(`  ✅ Готово: ${wavFile} (${(stat.size / 1024).toFixed(1)} KB)`);
  return finalWavPath;
}

export const LESSON_07_CUES = [
  {
    id: 'cue_01_hook',
    wavFile: 'l07_01_hook.wav',
    lang: 'ru',
    text: 'Ищете квартиру в Израиле, но боитесь звонить хозяевам на иврите? В седьмом уроке учим три ключевых слова:',
    geminiVoice: 'Charon',
    speed: 1.18,
    pitchFactor: 1.0,
    gapAfterSec: 0.25,
  },
  {
    id: 'cue_02_word1',
    wavFile: 'l07_02_word1.wav',
    lang: 'iw',
    text: 'דִּירָה',
    geminiVoice: 'Puck',
    speed: 1.0,
    pitchFactor: 0.92,
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_03_word2',
    wavFile: 'l07_03_word2.wav',
    lang: 'iw',
    text: 'שְׁלוֹשָׁה חֲדָרִים',
    geminiVoice: 'Puck',
    speed: 1.0,
    pitchFactor: 0.92,
    gapAfterSec: 0.35,
  },
  {
    id: 'cue_04_word3',
    wavFile: 'l07_04_word3.wav',
    lang: 'iw',
    text: 'מְקָרֵר',
    geminiVoice: 'Puck',
    speed: 1.0,
    pitchFactor: 0.92,
    gapAfterSec: 0.4,
  },
  {
    id: 'cue_05_bridge_dialogue',
    wavFile: 'l07_05_bridge_dialogue.wav',
    lang: 'ru',
    text: 'В диалоге тренируем ответ по ролям прямо в приложении.',
    geminiVoice: 'Charon',
    speed: 1.18,
    pitchFactor: 1.0,
    gapAfterSec: 0.3,
  },
  {
    id: 'cue_06_eli_question',
    wavFile: 'l07_06_eli_question.wav',
    lang: 'iw',
    text: 'שָׁלוֹם! כַּמָּה חֲדָרִים אַתָּה מְחַפֵּשׂ?',
    geminiVoice: 'Puck',
    speed: 0.95,
    pitchFactor: 0.88, // Басовитый арендодатель Эли
    gapAfterSec: 0.45,
  },
  {
    id: 'cue_07_student_answer',
    wavFile: 'l07_07_student_answer.wav',
    lang: 'iw',
    text: 'אֲנִי מְחַפֵּשׂ דִּירָה שֶׁל שְׁלוֹשָׁה חֲדָרִים. יֵשׁ מְקָרֵר?',
    geminiVoice: 'Aoede',
    speed: 0.95,
    pitchFactor: 1.15, // Контрастный голос ученика
    gapAfterSec: 0.4,
  },
  {
    id: 'cue_08_eval',
    wavFile: 'l07_08_eval.wav',
    lang: 'ru',
    text: 'ИИ моментально проверяет каждое слово и слышит правильное ударение.',
    geminiVoice: 'Charon',
    speed: 1.18,
    pitchFactor: 1.0,
    gapAfterSec: 0.4,
  },
  {
    id: 'cue_09_bridge_phone',
    wavFile: 'l07_09_bridge_phone.wav',
    lang: 'ru',
    text: 'А теперь звонок хозяину! В симуляторе звонка ИИ говорит как реальный израильтянин, но терпеливо ждёт вас без спешки.',
    geminiVoice: 'Charon',
    speed: 1.18,
    pitchFactor: 1.0,
    gapAfterSec: 0.4,
  },
  {
    id: 'cue_10_eli_phone',
    wavFile: 'l07_10_eli_phone.wav',
    lang: 'iw',
    text: 'בֶּטַח! יֵשׁ מְקָרֵר וּמִיטָּה. מָתַי אַתָּה רוֹצֶה לִרְאוֹת אֶת הַדִּירָה?',
    geminiVoice: 'Puck',
    speed: 0.95,
    pitchFactor: 0.88,
    gapAfterSec: 0.45,
  },
  {
    id: 'cue_11_outro',
    wavFile: 'l07_11_outro.wav',
    lang: 'ru',
    text: 'Забирай словарь этого урока в описании и тренируй живой иврит семь дней бесплатно!',
    geminiVoice: 'Charon',
    speed: 1.20,
    pitchFactor: 1.0,
    gapAfterSec: 0.5,
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

  // Расчет таймкодов без наложений
  let currentTime = 0.3;
  for (const clip of loadedClips) {
    clip.timeSec = currentTime;
    clip.endSec = clip.timeSec + clip.durationSec;
    currentTime = clip.endSec + (clip.gapAfterSec || 0.35);
    console.log(`  🔊 [${clip.timeSec.toFixed(2)}s -> ${clip.endSec.toFixed(2)}s] ${clip.id} (${clip.wavFile}) [${clip.durationSec.toFixed(2)}s]`);
  }

  const totalDurationSec = Math.ceil(currentTime + 0.5);
  const totalSamples = Math.floor(sampleRate * totalDurationSec);
  console.log(`⏱️ Общая длительность аудиодорожки: ${totalDurationSec}s (сэмплов: ${totalSamples})`);

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

      voiceL[idx] += sL * 1.2;
      voiceR[idx] += sR * 1.2;
    }
  }

  // SFX 1: Телефонный звонок перед репликой Эли в трубке
  const bridgePhone = loadedClips.find(c => c.id === 'cue_09_bridge_phone');
  const eliPhone = loadedClips.find(c => c.id === 'cue_10_eli_phone');
  if (bridgePhone && eliPhone) {
    const ringStart = Math.floor((bridgePhone.endSec + 0.05) * sampleRate);
    const ringEnd = Math.floor((eliPhone.timeSec - 0.08) * sampleRate);
    for (let i = ringStart; i < ringEnd && i < totalSamples; i++) {
      const t = (i - ringStart) / sampleRate;
      const pulseVal = Math.sin(2 * Math.PI * 4 * t);
      const ringPulse = pulseVal > 0 ? 0.25 * Math.pow(pulseVal, 2) : 0;
      const ringSound = (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 480 * t)) * 0.45 * ringPulse;
      voiceL[i] += ringSound;
      voiceR[i] += ringSound;
    }
  }

  // SFX 2: Перезвон успеха (success chime) после ответа студента
  const studentClip = loadedClips.find(c => c.id === 'cue_07_student_answer');
  if (studentClip) {
    const chimeStart = Math.floor((studentClip.endSec + 0.05) * sampleRate);
    for (let i = chimeStart; i < chimeStart + Math.floor(sampleRate * 1.2) && i < totalSamples; i++) {
      const t = (i - chimeStart) / sampleRate;
      const decay = Math.exp(-4.5 * t);
      const chime = (Math.sin(2 * Math.PI * 587.33 * t) + Math.sin(2 * Math.PI * 880.00 * t) + Math.sin(2 * Math.PI * 1174.66 * t)) * 0.15 * decay;
      voiceL[i] += chime;
      voiceR[i] += chime;
    }
  }

  // Запись WAV
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
