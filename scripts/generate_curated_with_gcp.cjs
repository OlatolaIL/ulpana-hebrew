/**
 * scripts/generate_curated_with_gcp.cjs
 *
 * Генерация оставшихся аудиофайлов через Google Cloud Text-to-Speech (Chirp 3 HD)
 * с авторизацией через OAuth2 токен Google Cloud пользователя.
 * Полностью покрывается триальным балансом (891 ₪) без списаний с карты.
 */

const fs = require('fs');
const path = require('path');

const token = process.env.GCP_ACCESS_TOKEN || process.argv[2] || '';
const projectId = process.env.GCP_PROJECT_ID || 'project-aebc6692-f6eb-4d2f-b1b';

const WORDS_DIR = path.resolve(__dirname, '../public/audio/words');
const SENTENCES_DIR = path.resolve(__dirname, '../public/audio/sentences');

const REMAINING_WORDS = [
  { id: 'syllabus', text: 'סִילָבּוּס', file: 'syllabus.mp3' },
  { id: 'baasa', text: 'בָּאסָה', file: 'baasa.mp3' },
  { id: 'yalla', text: 'יַאלְלָה', file: 'yalla.mp3' },
];

const REMAINING_SENTENCES = [
  { id: 'tachles_tsodek', text: 'תַּכְלֶס, אַתָּה מַמָּשׁ צוֹדֵק.', file: 'tachles_tsodek.mp3' },
  { id: 'lo_fraier', text: 'אַף אֶחָד לֹא פְרָאיֶיר.', file: 'lo_fraier.mp3' },
  { id: 'sahbak_amiti', text: 'הוּא סַחְבָּק אֲמִתִּי שֶׁלָּנוּ.', file: 'sahbak_amiti.mp3' },
  { id: 'pancher_baoto', text: "יֵשׁ לִי פַּנְצֶ'ר בָּאוֹטוֹ.", file: 'pancher_baoto.mp3' },
  { id: 'tzimer_tzafon', text: 'שָׂכַרְנוּ צִימֶר יָפֶה בַּצָּפוֹן.', file: 'tzimer_tzafon.mp3' },
  { id: 'tabu_dira', text: 'הַדִּירָה כְּבָר רְשׁוּמָה בַּטַּאבּוּ.', file: 'tabu_dira.mp3' },
  { id: 'syllabus_mevorat', text: 'הַסִּילָבּוּס מְפוֹרָט מְאֹד הַשָּׁנָה.', file: 'syllabus_mevorat.mp3' },
  { id: 'zahal_megen', text: 'צַהַ"ל מֵגֵן עַל הַמְּדִינָה.', file: 'zahal_megen.mp3' },
];

async function synthesize(text, destPath, voiceName = 'he-IL-Chirp3-HD-Aoede') {
  const url = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  const payload = {
    input: { text },
    voice: { languageCode: 'he-IL', name: voiceName },
    audioConfig: { audioEncoding: 'MP3' }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-goog-user-project': projectId
    },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.audioContent) {
    const buf = Buffer.from(data.audioContent, 'base64');
    fs.writeFileSync(destPath, buf);
    return buf.length;
  }
  throw new Error(JSON.stringify(data));
}

async function main() {
  console.log('🎙️ Генерация оставшихся 11 файлов через Google Cloud Chirp 3 HD (Aoede)...');
  console.log('Баланс: Google Cloud Trial (891 ₪)\n');

  console.log('--- 1. Слова (3 единицы) ---');
  for (const item of REMAINING_WORDS) {
    const target = path.join(WORDS_DIR, item.file);
    try {
      const bytes = await synthesize(item.text, target);
      console.log(`✓ [Слово] ${item.text.padEnd(14)} -> /audio/words/${item.file.padEnd(14)} (${bytes} байт)`);
    } catch (e) {
      console.error(`✗ Ошибка для ${item.text}:`, e.message);
      process.exit(1);
    }
  }

  console.log('\n--- 2. Предложения (8 единиц) ---');
  for (const item of REMAINING_SENTENCES) {
    const target = path.join(SENTENCES_DIR, item.file);
    try {
      const bytes = await synthesize(item.text, target);
      console.log(`✓ [Фраза] ${item.text.padEnd(32)} -> /audio/sentences/${item.file.padEnd(20)} (${bytes} байт)`);
    } catch (e) {
      console.error(`✗ Ошибка для ${item.text}:`, e.message);
      process.exit(1);
    }
  }

  console.log('\n✅ Все 11 файлов успешно сгенерированы через Google Cloud Chirp 3 HD!');
}

main().catch(console.error);
