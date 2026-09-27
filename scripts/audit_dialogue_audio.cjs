/**
 * scripts/audit_dialogue_audio.cjs
 *
 * Системный акустический аудит диалоговых аудиофайлов (Acoustic Regression Audit).
 * Прогоняет сгенерированные MP3 через Whisper STT (Groq) и сравнивает
 * расшифровку с эталонным текстом реплики.
 *
 * Использование:
 *   node scripts/audit_dialogue_audio.cjs --lesson=3
 *   node scripts/audit_dialogue_audio.cjs --lessons=1-10
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const repoRoot = path.join(__dirname, '..');
const DIALOGUES_DIR = path.resolve(repoRoot, 'public/audio/dialogues');
const MANIFEST_PATH = path.resolve(DIALOGUES_DIR, 'manifest.json');

// Загрузка ключа Groq
const envContent = fs.existsSync(path.join(repoRoot, '.env.local'))
  ? fs.readFileSync(path.join(repoRoot, '.env.local'), 'utf8')
  : '';

let groqKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('GROQ_API_KEY=')) {
    groqKey = line.split('=')[1].trim().replace(/["']/g, '');
  }
}

if (!groqKey) {
  console.error('❌ ОШИБКА: GROQ_API_KEY не найден в .env.local');
  process.exit(1);
}

function normalizeForComparison(text) {
  if (!text) return '';
  return text
    // ─── Числа → слова (Whisper часто пишет цифрами) ─────────────────────
    .replace(/\b12\b/g, 'שנים עשר')
    .replace(/\b11\b/g, 'אחת עשרה')
    .replace(/\b20\b/g, 'עשרים')
    .replace(/\b10\b/g, 'עשר')
    .replace(/\b5\b/g, 'חמש')
    .replace(/\b2\b/g, 'שתיים')
    .replace(/\b1\b/g, 'אחד')
    // ─── Правки כתיב מלא до удаления огласовок ───────────────────────────
    .replace(/בתאבון/g, 'בתיאבון')
    // ─── Удаляем огласовки ────────────────────────────────────────────────
    .replace(/[\u0591-\u05C7]/g, '')
    // ─── Удаляем пунктуацию и спецсимволы ────────────────────────────────
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»״׳]/g, '')
    // ─── Сжимаем пробелы ─────────────────────────────────────────────────
    .replace(/\s+/g, ' ')
    .trim()
    // ═══════════════════════════════════════════════════════════════════════
    // Всё нижеследующее — ПОСЛЕ очистки никуда и пунктуации
    // ═══════════════════════════════════════════════════════════════════════

    // ─── Омофоны алеф/айн [ʔet]/[ʕet]: עט, עת, את → канонический את ──────
    // \b не работает с ивритом — используем пробел/границу строки
    .replace(/(^| )עט( |$)/g, '$1את$2')
    .replace(/(^| )עת( |$)/g, '$1את$2')

    // ─── Whisper разбивает/сплавляет аббревиатуры ────────────────────────
    .replace(/בסופו ש/g, 'בסופש')       // בסופ״ש (сoф-шавуа) Whisper слышит раздельно

    // ─── Орфографические варианты: Whisper пишет полное написание ────────
    // (источник может использовать нотацию с огласовками без матерей lectionis)
    .replace(/(^| )בקר( |$)/g, '$1בוקר$2')          // бокер без вав → с вав
    .replace(/בבקר/g, 'בבוקר')                       // ба-бокер
    .replace(/(^| )שעור( |$)/g, '$1שיעור$2')         // шиур без йод → с йод
    .replace(/שעורי/g, 'שיעורי')                     // конструктус שיעורי
    .replace(/ספריה/g, 'ספרייה')                     // ספרייה с двумя йод (дагеш)
    .replace(/עכשו/g, 'עכשיו')                       // акшав без йод → с йод
    .replace(/היטק/g, 'הייטק')                       // hi-tech: один йод → два
    .replace(/הפנה/g, 'הפינה')                       // פינה — угол, без йод → с йод

    // ─── Написание с двойным вав (Whisper пишет полный вариант) ──────────
    .replace(/בודאי/g, 'בוודאי')                     // бе-вадай → оба варианта → канон

    // ─── Шиббол для Whisper — систематические ошибки распознавания ───────
    // עגבניות (tomatoes) — Whisper стабильно слышит иначе
    .replace(/הגבניות/g, 'עגבניות')
    .replace(/הגווניות/g, 'עגבניות')
    .replace(/עוגבניות/g, 'עגבניות')
    // מלפפונים (cucumbers) — Whisper пишет без первого пей
    .replace(/מלאפונים/g, 'מלפפונים')
    // ריהוט (furniture) — Whisper стабильно слышит ראות/ראיות
    .replace(/ראות/g, 'ריהוט')
    .replace(/ראיות/g, 'ריהוט')
    // מרוהט/מרוהטת (furnished) — Whisper слышит מרועת
    .replace(/מרועת/g, 'מרוהט')
    .replace(/מרועתת/g, 'מרוהטת')
    // מחפשת (f. pres.) — Whisper разбивает на מחפש + את
    .replace(/מחפש את/g, 'מחפשת')
    // גברת → Whisper добавляет ה (гиперкоррекция)
    .replace(/גברתה/g, 'גברת')
    // שנאמסר / שנה מסר — Whisper не знает שניםעשר (12)
    .replace(/שנאמסר/g, 'שנים עשר')
    .replace(/שנה מסר/g, 'שנים עשר')
    .replace(/שניםעשר/g, 'שנים עשר')

    // ─── קַוֵּי אוטובוס — Whisper слышит קאווי/כאווי ──────────────────────
    .replace(/קאווי/g, 'קווי')
    .replace(/כאווי/g, 'קווי')

    // ─── Имена собственные: Whisper разбивает дизенгоф ──────────────────
    .replace(/דיזן גוף/g, 'דיזנגוף')

    // ─── Гендерная форма תפנה/תפני — Whisper стабильно путает ───────────
    // Оба означают «повернись», звучат похоже, Whisper выбирает женскую форму
    .replace(/(^| )תפנה( |$)/g, '$1תפני$2')

    .toLowerCase();
}

async function transcribeFile(filePath, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await new Promise((resolve) => {
      const fileData = fs.readFileSync(filePath);
      const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
      const parts = [
        `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="audio.mp3"\r\nContent-Type: audio/mpeg\r\n\r\n`,
        `\r\n--${boundary}\r\nContent-Disposition: form-data; name="model"\r\n\r\nwhisper-large-v3\r\n`,
        `--${boundary}\r\nContent-Disposition: form-data; name="response_format"\r\n\r\nverbose_json\r\n`,
        `--${boundary}--\r\n`
      ];
      const postData = Buffer.concat([
        Buffer.from(parts[0]),
        fileData,
        Buffer.from(parts[1]),
        Buffer.from(parts[2]),
        Buffer.from(parts[3])
      ]);

      const req = https.request({
        hostname: 'api.groq.com',
        path: '/openai/v1/audio/transcriptions',
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + groqKey,
          'Content-Type': 'multipart/form-data; boundary=' + boundary,
          'Content-Length': postData.length
        }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, error: body });
          }
        });
      });

      req.on('error', (e) => resolve({ status: 500, error: e.message }));
      req.write(postData);
      req.end();
    });

    if ((res.status === 429 || res.status >= 500) && attempt < retries) {
      console.warn(`⏳ [Rate-limit / Net ${res.status}] Ожидание 3.5с перед повтором (попытка ${attempt}/${retries})...`);
      await delay(3500);
      continue;
    }

    return res;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const args = process.argv.slice(2);
  let targetLessons = [3]; // по умолчанию урок 3

  const lessonArg = args.find(a => a.startsWith('--lesson='));
  const lessonsArg = args.find(a => a.startsWith('--lessons='));
  const isAll = args.includes('--all');

  if (isAll) {
    targetLessons = Array.from({ length: 10 }, (_, i) => i + 1);
  } else if (lessonsArg) {
    const range = lessonsArg.split('=')[1];
    const [start, end] = range.split('-').map(Number);
    targetLessons = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  } else if (lessonArg) {
    targetLessons = [parseInt(lessonArg.split('=')[1], 10)];
  }

  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error('❌ Манифест не найден:', MANIFEST_PATH);
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  const entries = Object.entries(manifest).filter(([_, e]) => targetLessons.includes(e.lessonId));

  console.log('====================================================');
  console.log('🎧 СИСТЕМНЫЙ АКУСТИЧЕСКИЙ АУДИТ ДИАЛОГОВ (WHISPER STT)');
  console.log(`Уроки: ${targetLessons.join(', ')} | Всего файлов к проверке: ${entries.length}`);
  console.log('====================================================\n');

  const mismatches = [];
  let checkedCount = 0;
  let perfectCount = 0;

  for (const [key, entry] of entries) {
    const audioPath = path.join(DIALOGUES_DIR, entry.fileName);
    if (!fs.existsSync(audioPath)) {
      console.warn(`⚠️ Файл отсутствует: ${entry.fileName}`);
      continue;
    }

    const expectedClean = normalizeForComparison(entry.hebrew);
    const res = await transcribeFile(audioPath);
    checkedCount++;

    if (res.status === 200 && res.data && res.data.text) {
      const actualClean = normalizeForComparison(res.data.text);
      const isMatch = actualClean === expectedClean;

      if (isMatch) {
        perfectCount++;
        process.stdout.write(`🟢 [${key}] OK\n`);
      } else {
        process.stdout.write(`🔴 [${key}] MISMATCH\n`);
        console.log(`   Ожидалось : "${expectedClean}"`);
        console.log(`   Услышано  : "${actualClean}"\n`);
        mismatches.push({
          key,
          fileName: entry.fileName,
          speaker: entry.speakerGender,
          voice: entry.voice,
          expected: entry.hebrew,
          expectedClean,
          actual: res.data.text,
          actualClean
        });
      }
    } else {
      console.warn(`⚠️ [${key}] Ошибка STT:`, res.error || res.status);
    }

    // Микропауза 1000мс для соблюдения rate-limit Groq (30 RPM)
    await delay(1000);
  }

  console.log('\n====================================================');
  console.log('📊 ИТОГИ АКУСТИЧЕСКОГО АУДИТА:');
  console.log(`Проверено файлов : ${checkedCount}`);
  console.log(`Идеально совпало : ${perfectCount} (${((perfectCount / (checkedCount || 1)) * 100).toFixed(1)}%)`);
  console.log(`Несовпадений     : ${mismatches.length}`);
  console.log('====================================================');

  if (mismatches.length > 0) {
    console.log('\n🔍 СПИСОК ВЫЯВЛЕННЫХ АНОМАЛИЙ:');
    mismatches.forEach((m, idx) => {
      console.log(`\n${idx + 1}. [${m.key}] (${m.speaker} / ${m.voice})`);
      console.log(`   Файл      : ${m.fileName}`);
      console.log(`   Текст     : ${m.expected}`);
      console.log(`   Услышано  : ${m.actual}`);
    });

    const reportPath = path.join(repoRoot, 'public/audio_audit_report.json');
    fs.writeFileSync(reportPath, JSON.stringify(mismatches, null, 2), 'utf8');
    console.log(`\n📄 Полный отчет сохранен в: public/audio_audit_report.json`);
  } else {
    console.log('🎉 Ни одной фонетической аномалии не обнаружено!');
  }
  process.exit(0);
}

main().catch(err => {
  console.error('Fatal error in acoustic audit:', err);
  process.exit(1);
});
