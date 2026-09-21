/**
 * scripts/generate_all_with_gcp.cjs
 *
 * Массовая генерация 100% аудиофайлов курса через Google Cloud Text-to-Speech (Chirp 3 HD / WaveNet)
 * за счёт триального баланса Google Cloud ($300 / 891 ₪).
 *
 * Использование:
 *   node scripts/generate_all_with_gcp.cjs --token=ya29... [--project=project-id] [--dry-run] [--concurrency=4]
 */

const fs = require('fs');
const path = require('path');

// Подключаем каталог предложений через ts-node / register
const repoRoot = path.resolve(__dirname, '..');
const {
  getAllSystemSentences,
  saveToSentencesManifest,
  getSentencesManifest,
} = require(path.join(repoRoot, 'src/lib/audioSentencesCatalog.ts'));
const { normalizeSentenceKey } = require(path.join(repoRoot, 'src/lib/speech.ts'));

const SENTENCES_DIR = path.resolve(repoRoot, 'public/audio/sentences');
if (!fs.existsSync(SENTENCES_DIR)) {
  fs.mkdirSync(SENTENCES_DIR, { recursive: true });
}

// Аргументы командной строки
const args = process.argv.slice(2);
const tokenArg = args.find((a) => a.startsWith('--token='));
const projectArg = args.find((a) => a.startsWith('--project='));
const concurrencyArg = args.find((a) => a.startsWith('--concurrency='));
const isDryRun = args.includes('--dry-run');
const isForce = args.includes('--force');
const testOnly = args.find((a) => a.startsWith('--limit='));

const token = tokenArg ? tokenArg.replace('--token=', '').trim() : process.env.GCP_ACCESS_TOKEN || '';
const projectId = projectArg ? projectArg.replace('--project=', '').trim() : process.env.GCP_PROJECT_ID || 'project-aebc6692-f6eb-4d2f-b1b';
const concurrency = concurrencyArg ? parseInt(concurrencyArg.replace('--concurrency=', ''), 10) : 5;
const limit = testOnly ? parseInt(testOnly.replace('--limit=', ''), 10) : Infinity;

if (!token) {
  console.error('❌ ОШИБКА: Не передан OAuth2 токен Google Cloud!');
  console.error('Использование: node scripts/generate_all_with_gcp.cjs --token=ya29... [--project=YOUR_PROJECT_ID]\n');
  process.exit(1);
}

/**
 * Получить список всех доступных голосов для иврита в Google Cloud
 */
async function fetchHebrewVoices() {
  const url = 'https://texttospeech.googleapis.com/v1/voices?languageCode=he-IL';
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'x-goog-user-project': projectId,
    },
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Не удалось получить список голосов Google Cloud (${res.status}): ${errText}`);
  }
  const data = await res.json();
  return data.voices || [];
}

/**
 * Синтез одного предложения через Google Cloud Text-to-Speech
 */
async function synthesizeGcp(text, destPath, voiceName) {
  const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  const payload = {
    input: { text },
    voice: { languageCode: 'he-IL', name: voiceName },
    audioConfig: {
      audioEncoding: 'MP3',
      sampleRateHertz: 24000,
      speakingRate: 0.92, // Естественный темп ульпана
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'x-goog-user-project': projectId,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`HTTP ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (data.audioContent) {
    const buf = Buffer.from(data.audioContent, 'base64');
    fs.writeFileSync(destPath, buf);
    return buf.length;
  }
  throw new Error(`Нет audioContent в ответе: ${JSON.stringify(data)}`);
}

function cleanHebrewText(text) {
  return text
    .replace(/[؟？]/g, '?')
    .replace(/[！]/g, '!')
    .replace(/["״׳«»]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

async function main() {
  console.log('================================================================');
  console.log('🎙️  МАССОВАЯ ГЕНЕРАЦИЯ ВСЕХ ПРЕДЛОЖЕНИЙ ЧЕРЕЗ GOOGLE CLOUD TTS');
  console.log('    Баланс: Google Cloud Trial ($300 / 891 ₪)');
  console.log(`    Project ID: ${projectId}`);
  console.log('================================================================\n');

  // 1. Проверяем доступность API и получаем каталог голосов
  console.log('🔍 Проверка токена и опрос доступных голосов Google Cloud he-IL...');
  let voices = [];
  try {
    voices = await fetchHebrewVoices();
    console.log(`✓ Авторизация успешна! Найдено ${voices.length} голосов для he-IL:`);
    voices.forEach((v) => {
      console.log(`   - ${v.name.padEnd(26)} [${v.ssmlGender.padEnd(6)}] ${v.naturalSampleRateHertz}Hz`);
    });
    console.log('');
  } catch (err) {
    console.error('❌ Ошибка авторизации Google Cloud:', err.message);
    process.exit(1);
  }

  // Определяем дефолтные голоса
  // Женский: если доступен Chirp 3 HD, берем его, иначе Neural2 / Wavenet
  const chirpFemale = voices.find((v) => v.name.includes('Chirp3-HD') && v.ssmlGender === 'FEMALE');
  const neuralFemale = voices.find((v) => v.name.includes('Neural2') && v.ssmlGender === 'FEMALE');
  const femaleVoice = chirpFemale ? chirpFemale.name : (neuralFemale ? neuralFemale.name : 'he-IL-Chirp3-HD-Aoede');

  // Мужской: ищем Chirp Male или Wavenet Male
  const chirpMale = voices.find((v) => v.name.includes('Chirp') && v.ssmlGender === 'MALE');
  const wavenetMale = voices.find((v) => (v.name.includes('Wavenet-B') || v.name.includes('Wavenet-C')) && v.ssmlGender === 'MALE');
  const maleVoice = chirpMale ? chirpMale.name : (wavenetMale ? wavenetMale.name : femaleVoice);

  console.log(`🎯 Выбранные студийные голоса:`);
  console.log(`   - Женский (♀): ${femaleVoice}`);
  console.log(`   - Мужской (♂): ${maleVoice}\n`);

  // 2. Собираем список всех предложений
  const allSentences = getAllSystemSentences();
  console.log(`Всего предложений в системе: ${allSentences.length}`);

  const tasks = [];
  for (const s of allSentences) {
    // Женские варианты чувствительных предложений
    if (s.isGenderSensitive && s.femaleVariant) {
      const fFileName = s.femaleVariant.fileName;
      const fPath = path.resolve(SENTENCES_DIR, fFileName);
      if (isForce || !fs.existsSync(fPath) || fs.statSync(fPath).size < 100) {
        tasks.push({
          type: 'female_variant',
          text: cleanHebrewText(s.femaleVariant.sentenceHe),
          voice: femaleVoice,
          fileName: fFileName,
          manifestKeys: [
            `${normalizeSentenceKey(s.sentenceHe)}::female`,
            normalizeSentenceKey(s.femaleVariant.sentenceHe),
          ],
        });
      }
    }

    // Основные предложения
    const mainFileName = s.fileName;
    const mainPath = path.resolve(SENTENCES_DIR, mainFileName);
    if (isForce || !fs.existsSync(mainPath) || fs.statSync(mainPath).size < 100) {
      // Если фраза от лица женщины в 3-м лице ("Она говорит...") - женский голос, иначе мужской
      const voice = s.genderCategory === 'third_person_f' ? femaleVoice : maleVoice;
      tasks.push({
        type: 'main',
        text: cleanHebrewText(s.sentenceHe),
        voice,
        fileName: mainFileName,
        manifestKeys: [normalizeSentenceKey(s.sentenceHe)],
      });
    }
  }

  const tasksToRun = tasks.slice(0, limit);
  console.log(`Всего задач на генерацию: ${tasksToRun.length} (уже готово: ${tasks.length === 0 ? 'все' : allSentences.length - tasks.length})\n`);

  if (tasksToRun.length === 0) {
    console.log('✅ Все аудиофайлы уже сгенерированы! Перезапуск не требуется.');
    return;
  }

  if (isDryRun) {
    console.log('🔍 Режим --dry-run: генерация пропущена.');
    return;
  }

  // 3. Пакетная генерация
  let completed = 0;
  let errors = 0;
  let totalBytes = 0;
  const startTime = Date.now();

  for (let i = 0; i < tasksToRun.length; i += concurrency) {
    const batch = tasksToRun.slice(i, i + concurrency);
    await Promise.all(
      batch.map(async (task) => {
        const dest = path.resolve(SENTENCES_DIR, task.fileName);
        try {
          const bytes = await synthesizeGcp(task.text, dest, task.voice);
          completed++;
          totalBytes += bytes;
          task.manifestKeys.forEach((k) => saveToSentencesManifest(k, task.fileName));

          if (completed % 20 === 0 || completed === tasksToRun.length) {
            const pct = Math.round((completed / tasksToRun.length) * 100);
            const elapsed = Math.round((Date.now() - startTime) / 1000);
            console.log(`[${completed}/${tasksToRun.length}] [${pct}%] (${elapsed}с) ✓ ${task.fileName} — "${task.text}"`);
          }
        } catch (err) {
          errors++;
          console.error(`✗ Ошибка для ${task.fileName} ("${task.text}"):`, err.message);
        }
      })
    );
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log('\n================================================================');
  console.log(`✅ Генерация завершена за ${durationSec} сек.!`);
  console.log(`   Успешно: ${completed} файлов`);
  console.log(`   Ошибок:   ${errors}`);
  console.log(`   Общий объём: ${(totalBytes / (1024 * 1024)).toFixed(2)} МБ`);
  console.log('================================================================\n');
}

main().catch((err) => {
  console.error('Фатальная ошибка:', err);
  process.exit(1);
});
