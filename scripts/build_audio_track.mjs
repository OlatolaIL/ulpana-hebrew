import fs from 'fs';
import path from 'path';
import cp from 'child_process';
import { createRequire } from 'module';
import { fetchTts } from './tts_helper.mjs';
import { generateBackgroundMusic } from './synth_music.mjs';

const require = createRequire(import.meta.url);
const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const FFMPEG_PATH = ffmpeg.path;

// Получение длительности аудиофайла через ffmpeg probe
export function getAudioDuration(filePath) {
  try {
    const res = cp.spawnSync(FFMPEG_PATH, ['-i', filePath], { encoding: 'utf8' });
    const output = res.stderr || '';
    const match = output.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (match) {
      const hours = parseFloat(match[1]);
      const mins = parseFloat(match[2]);
      const secs = parseFloat(match[3]);
      return hours * 3600 + mins * 60 + secs;
    }
  } catch (e) {
    console.error('getAudioDuration error:', e);
  }
  return 3.0; // fallback
}

// Список реплик и их запланированное время старта (в секундах)
export const SPEECH_CUES = [
  {
    id: 'intro',
    timeSec: 1.0,
    lang: 'ru',
    text: 'Ульпана — интерактивный курс для изучения иврита. В программе сто уроков от базового Алеф до свободного Бет.',
  },
  {
    id: 'structure',
    timeSec: 9.0,
    lang: 'ru',
    text: 'В каждом уроке пять обязательных этапов: Теория правил, Словарный запас, Интерактивный тренажер, Тренировка диалогов и Живой звонок с искусственным интеллектом.',
  },
  {
    id: 'stage1_theory',
    timeSec: 20.5,
    lang: 'ru',
    text: 'Этап первый: теория с интерактивным конспектом. В один клик переключаем печатный шрифт на аутентичный рукописный курсив, а также скрываем огласовки для тренировки беглого чтения.',
  },
  {
    id: 'propisi',
    timeSec: 33.0,
    lang: 'ru',
    text: 'Раздел Прописи обучает рукописному шрифту. Здесь вы видите траекторию каждого штриха и легко учитесь читать реальные записи в Израиле.',
  },
  {
    id: 'decks_and_modes',
    timeSec: 44.0,
    lang: 'ru',
    text: 'В разделе Карточки собраны тематические колоды: глаголы, еда, сленг, с режимом перемешивания. А в настройках можно включить режим полного погружения — Иврит на иврите.',
  },
  {
    id: 'stage2_vocab',
    timeSec: 58.0,
    lang: 'ru',
    text: 'Этап второй: словарный запас урока с разбором корней и умные карточки с интервальным повторением для долговременной памяти.',
  },
  {
    id: 'stage3_exercises',
    timeSec: 69.5,
    lang: 'ru',
    text: 'Этап третий: интерактивный тренажер. Сборка фраз из слов и моментальная проверка понимания грамматики.',
  },
  {
    id: 'stage4_dialogue_teacher',
    timeSec: 79.5,
    lang: 'iw',
    text: 'שָׁלוֹם! מָה נִשְׁמַע?',
  },
  {
    id: 'stage4_dialogue_exp',
    timeSec: 82.5,
    lang: 'ru',
    text: 'Этап четвертый: живой диалог. ИИ озвучивает реплику, слушает ваш ответ и сразу оценивает чёткость произношения и ударения в процентах.',
  },
  {
    id: 'stage4_dialogue_student',
    timeSec: 93.0,
    lang: 'iw',
    text: 'שָׁלוֹם, הַכֹּל בְּסֵדֶר!',
  },
  {
    id: 'stage5_phone_courier',
    timeSec: 97.0,
    lang: 'iw',
    text: 'שָׁלוֹם! אֲנִי לְמַטָּה עִם הַמִּשְׁלוֹחַ',
  },
  {
    id: 'stage5_phone_exp',
    timeSec: 100.5,
    lang: 'ru',
    text: 'Этап пятый: телефонный звонок курьера в реальных бытовых ситуациях. Живой голос в динамике и подробный отчет по итогам разговора с оценкой речи.',
  },
  {
    id: 'stage5_phone_student',
    timeSec: 111.5,
    lang: 'iw',
    text: 'תּוֹדָה רַבָּה! תַּשְׁאִיר לְיַד הַדֶּלֶת',
  },
  {
    id: 'outro',
    timeSec: 116.0,
    lang: 'ru',
    text: 'Все пять этапов пройдены! Ульпана — ваш быстрый старт в разговорный иврит.',
  },
];

export async function buildMasterAudio(outputAudioPath) {
  console.log('🎙️ Загрузка аудио-сэмплов озвучки (TTS)...');
  const audioFiles = [];

  for (const cue of SPEECH_CUES) {
    const filename = `${cue.id}_${cue.lang}.mp3`;
    const filePath = await fetchTts(cue.text, cue.lang, filename);
    const dur = getAudioDuration(filePath);
    audioFiles.push({ ...cue, filePath, duration: dur });
    console.log(`  ✓ [${cue.timeSec}s] ${cue.id} (${cue.lang}): ${dur.toFixed(1)}s`);
  }

  const lastCue = audioFiles[audioFiles.length - 1];
  const totalDuration = Math.ceil(lastCue.timeSec + lastCue.duration + 4.0);
  console.log(`⏱️ Общая длительность аудиодорожки: ${totalDuration} секунд (~1 мин 58 сек)`);

  // 1. Создаем фоновую музыку точной длины
  const bgMusicPath = path.resolve('./public/demo/audio_cache/bg_ambient.wav');
  generateBackgroundMusic(totalDuration, bgMusicPath);

  // 2. Собираем ffmpeg команду для сведения голоса и музыки
  // Каждый сэмпл сдвигается на timeSec с помощью adelay
  console.log('🎛️ Сведение аудиодорожки в ffmpeg...');
  const inputArgs = [];
  const filterParts = [];

  audioFiles.forEach((cue, idx) => {
    inputArgs.push('-i', cue.filePath);
    const delayMs = Math.round(cue.timeSec * 1000);
    filterParts.push(`[${idx}:a]adelay=${delayMs}|${delayMs}[delayed_${idx}]`);
  });

  // Вход фоновой музыки
  const musicInputIdx = audioFiles.length;
  inputArgs.push('-i', bgMusicPath);

  const delayedLabels = audioFiles.map((_, idx) => `[delayed_${idx}]`).join('');
  // Микшируем все реплики голоса
  const voiceMix = `${delayedLabels}amix=inputs=${audioFiles.length}:duration=longest:dropout_transition=0[voice_mixed]`;

  // Снижаем громкость музыки до 14% и микшируем с голосом
  const musicVolume = `[${musicInputIdx}:a]volume=0.14[music_quiet]`;
  const finalMix = `[voice_mixed][music_quiet]amix=inputs=2:duration=first:dropout_transition=0[aout]`;

  const filterComplex = [...filterParts, voiceMix, musicVolume, finalMix].join(';');

  const cmdArgs = [
    '-y',
    ...inputArgs,
    '-filter_complex',
    filterComplex,
    '-map',
    '[aout]',
    '-c:a',
    'pcm_s16le',
    outputAudioPath,
  ];

  const res = cp.spawnSync(FFMPEG_PATH, cmdArgs, { encoding: 'utf8' });
  if (res.status !== 0) {
    console.error('Ошибка сведения аудио в ffmpeg:', res.stderr);
    throw new Error('ffmpeg audio mix failed');
  }

  console.log(`✅ Мастер-аудио успешно сведено: ${outputAudioPath} (${(fs.statSync(outputAudioPath).size / 1024 / 1024).toFixed(2)} MB)`);
  return { totalDuration, audioFiles };
}
