import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CATALOG_PATH = path.resolve(ROOT, 'growth/VIRAL_SCRIPTS_CATALOG.md');
const JSON_OUT_PATH = path.resolve(ROOT, 'growth/MASTER_TTS_CATALOG.json');
const MD_OUT_PATH = path.resolve(ROOT, 'growth/MASTER_TTS_CATALOG.md');

const content = fs.readFileSync(CATALOG_PATH, 'utf8');
const rawParts = content.split(/### 🎬 Урок\s*(\d+)[:.]/);
const catalog = [];

for (let i = 1; i < rawParts.length; i += 2) {
  const lessonNum = parseInt(rawParts[i], 10);
  const text = rawParts[i + 1];
  const topicMatch = text.match(/^\s*([^\r\n]+)/);
  const topic = topicMatch ? topicMatch[1].trim() : '';

  const variants = [
    { type: 'clean', label: 'Clean (Ad-Safe)', text: (text.match(/#### 🟢 Вариант А[^]*?(?=#### 🌶️ Вариант B|$)/) || [''])[0] },
    { type: 'spicy', label: 'Spicy (Organic)', text: (text.match(/#### 🌶️ Вариант B[^]*?$/) || [''])[0] }
  ];

  for (const v of variants) {
    if (!v.text) continue;
    const lines = v.text.split('\n');
    let currentBeat = '1_hook';
    let lineIdx = 0;

    for (let l of lines) {
      const trimmed = l.trim();
      if (trimmed.includes('**Хук')) currentBeat = '1_hook';
      else if (trimmed.includes('**Факап') || trimmed.includes('**Диалог')) currentBeat = '2_dialogue';
      else if (trimmed.includes('**Разбор')) currentBeat = '3_explanation';
      else if (trimmed.includes('**CTA') || trimmed.includes('**Пэйофф')) currentBeat = '4_cta';

      const match = trimmed.match(/\*\s*\*([^:*]+)[:*]+\s*«([^»]+)»/);
      if (match) {
        lineIdx++;
        let rawRole = match[1].trim();
        let spokenText = match[2].trim();
        let role = rawRole.replace(/\([^)]*\)/g, '').trim();

        const isNarrator = /диктор|пэйофф|голос/i.test(role);
        let gender = 'male';
        if (/девушка|женщина|бабушка|официантка|мама|подруга|пассажирка|чиновница|соседка/i.test(role)) {
          gender = 'female';
        }

        let lang = isNarrator ? 'ru' : (/[\u0590-\u05FF]/.test(spokenText) ? 'he' : 'ru');

        // Recommended voices
        let geminiVoice = 'Charon';
        let googleCloudVoice = 'ru-RU-Neural2-D';
        if (lang === 'he') {
          if (gender === 'female') {
            geminiVoice = 'Aoede';
            googleCloudVoice = 'he-IL-Wavenet-A';
          } else {
            geminiVoice = 'Orus';
            googleCloudVoice = 'he-IL-Wavenet-B';
          }
        } else {
          if (gender === 'female') {
            geminiVoice = 'Kore';
            googleCloudVoice = 'ru-RU-Neural2-C';
          } else {
            geminiVoice = 'Charon';
            googleCloudVoice = 'ru-RU-Neural2-D';
          }
        }

        const lessonStr = String(lessonNum).padStart(2, '0');
        const id = `l${lessonStr}_${v.type}_s${currentBeat.slice(0, 1)}_${String(lineIdx).padStart(2, '0')}`;

        catalog.push({
          id,
          lesson: lessonNum,
          topic,
          variant: v.type,
          variantLabel: v.label,
          beat: currentBeat,
          role,
          gender,
          language: lang,
          geminiVoice,
          googleCloudVoice,
          text: spokenText
        });
      }
    }
  }
}

// Write JSON
fs.writeFileSync(JSON_OUT_PATH, JSON.stringify(catalog, null, 2), 'utf8');

// Generate Markdown Sheet
let md = `# 🎙️ Мастер-реестр фраз для озвучки (100 уроков, 200 видео)

> **Стандарт:** Фабрика-500 («Ульпан Алеф»)  
> **Всего фраз:** ${catalog.length}  
> **Языки:** Иврит (he) и Русский (ru)  
> **Сценариев:** 200 (100 Clean / Ad-Safe + 100 Spicy / Organic)  
> **Машиночитаемый JSON:** \`growth/MASTER_TTS_CATALOG.json\`

---

## 🎭 Голосовой кастинг

| Язык | Пол | Роль | Рекомендуемый голос Gemini | Рекомендуемый голос Google Cloud TTS | Темп |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Русский (ru)** | 👨 Мужской | Диктор / Закадровый голос | \`Charon\` | \`ru-RU-Neural2-D\` | 1.15x – 1.2x |
| **Русский (ru)** | 👩 Женский | Диктор / Закадровый голос | \`Kore\` | \`ru-RU-Neural2-C\` | 1.15x |
| **Иврит (he)** | 👨 Мужской | Ученик / Израильтянин (бариста, тимлид, таксист) | \`Orus\` (или \`Puck\`) | \`he-IL-Wavenet-B\` / \`he-IL-Neural2-B\` | 1.0x (ученик 0.95x, таксист 1.1x) |
| **Иврит (he)** | 👩 Женский | Ученица / Израильтянка (официантка, девушка, тёща) | \`Aoede\` | \`he-IL-Wavenet-A\` / \`he-IL-Neural2-A\` | 1.0x |

---

## 📋 Таблица всех фраз по урокам

`;

let currentLesson = -1;
for (const item of catalog) {
  if (item.lesson !== currentLesson) {
    currentLesson = item.lesson;
    md += `\n### 🎬 Урок ${item.lesson}: ${item.topic}\n\n`;
    md += `| ID | Сценарий | Такт | Роль | Пол | Язык | Голос (Gemini / GCloud) | Текст реплики |\n`;
    md += `| :--- | :--- | :--- | :--- | :---: | :---: | :--- | :--- |\n`;
  }
  const cleanText = item.text.replace(/\|/g, '\\|').replace(/\n/g, ' ');
  const genderIcon = item.gender === 'female' ? '👩' : '👨';
  const langBadge = item.language === 'he' ? '🇮🇱 he' : '🇷🇺 ru';
  const beatLabel = item.beat.replace('_', ' ');
  md += `| \`${item.id}\` | ${item.variant} | ${beatLabel} | ${item.role} | ${genderIcon} | ${langBadge} | \`${item.geminiVoice}\` / \`${item.googleCloudVoice}\` | ${cleanText} |\n`;
}

fs.writeFileSync(MD_OUT_PATH, md, 'utf8');

console.log(`✅ Успешно экспортировано:`);
console.log(`- ${JSON_OUT_PATH} (${catalog.length} записей)`);
console.log(`- ${MD_OUT_PATH} (${catalog.length} строк в таблице)`);
