/**
 * scripts/generate_all_sentences.cjs
 *
 * Пакетная генерация студийных аудиофайлов для всех 2,475+ предложений курса.
 * - Пропускает уже сгенерированные файлы (идемпотентность и быстрый перезапуск).
 * - Сохраняет чистые MP3 в public/audio/sentences/*.mp3.
 * - Автоматически регистрирует нормализованные ключи в public/audio/sentences/manifest.json.
 * - Выводит аккуратный прогресс-бар и статистику.
 */

const fs = require('fs');
const path = require('path');
const {
  getAllSystemSentences,
  synthesizeSentenceAudio,
  getSentencesManifest,
  saveToSentencesManifest,
} = require('../src/lib/audioSentencesCatalog.ts');

const SENTENCES_DIR = path.resolve(__dirname, '../public/audio/sentences');
const CONCURRENCY = 4; // 4 параллельных потока для баланса скорости и стабильности
const DELAY_BETWEEN_BATCHES_MS = 60;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  console.log('====================================================');
  console.log('🎙️  МАССОВАЯ ГЕНЕРАЦИЯ АУДИО ФРАЗ GOOGLE TTS');
  console.log('====================================================\n');

  if (!fs.existsSync(SENTENCES_DIR)) {
    fs.mkdirSync(SENTENCES_DIR, { recursive: true });
  }

  const allSentences = getAllSystemSentences();
  const total = allSentences.length;

  console.log(`Найдено предложений в системе: ${total}`);

  // Отбираем только те, которых физически нет на диске или размер < 100 байт
  const pending = allSentences.filter((s) => {
    const filePath = path.resolve(SENTENCES_DIR, s.fileName);
    if (!fs.existsSync(filePath)) return true;
    try {
      const stat = fs.statSync(filePath);
      return stat.size < 100;
    } catch {
      return true;
    }
  });

  const alreadyReady = total - pending.length;
  console.log(`Уже готово: ${alreadyReady} (${Math.round((alreadyReady / total) * 100)}%)`);
  console.log(`Требуется сгенерировать: ${pending.length}\n`);

  if (pending.length === 0) {
    console.log('✅ Все фразы уже полностью сгенерированы! Завершено.');
    return;
  }

  let successCount = 0;
  let errorCount = 0;
  let totalBytesGenerated = 0;
  const startTime = Date.now();

  // Обработка пачками по CONCURRENCY
  for (let i = 0; i < pending.length; i += CONCURRENCY) {
    const batch = pending.slice(i, i + CONCURRENCY);

    await Promise.all(
      batch.map(async (item, batchIdx) => {
        const overallIndex = alreadyReady + i + batchIdx + 1;
        const percent = ((overallIndex / total) * 100).toFixed(1);

        try {
          const res = await synthesizeSentenceAudio(item.sentenceHe, item.fileName);
          if (res.success) {
            successCount++;
            totalBytesGenerated += res.bytes;
            if (successCount % 25 === 0 || overallIndex === total) {
              console.log(
                `[${overallIndex}/${total}] [${percent}%] ✓ ${item.fileName} (${Math.round(
                  res.bytes / 1024
                )} KB) — "${item.sentenceHe}"`
              );
            }
          } else {
            errorCount++;
            console.error(`[${overallIndex}/${total}] ✗ Ошибка: ${item.fileName} — ${res.error}`);
          }
        } catch (err) {
          errorCount++;
          console.error(`[${overallIndex}/${total}] ✗ Исключение: ${item.fileName} — ${err.message}`);
        }
      })
    );

    if (DELAY_BETWEEN_BATCHES_MS > 0) {
      await sleep(DELAY_BETWEEN_BATCHES_MS);
    }
  }

  const durationSec = Math.round((Date.now() - startTime) / 1000);
  console.log('\n====================================================');
  console.log('🎉 ГЕНЕРАЦИЯ ЗАВЕРШЕНА!');
  console.log(`- Успешно создано: ${successCount}`);
  console.log(`- Ошибок: ${errorCount}`);
  console.log(`- Всего готово файлов: ${alreadyReady + successCount} из ${total}`);
  console.log(`- Общий объём новых файлов: ${(totalBytesGenerated / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`- Время выполнения: ${durationSec} сек (${(durationSec / 60).toFixed(1)} мин)`);
  console.log('====================================================');
}

main().catch((err) => {
  console.error('Критическая ошибка генератора:', err);
  process.exit(1);
});
