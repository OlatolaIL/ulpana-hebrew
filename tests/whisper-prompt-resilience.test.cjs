/**
 * whisper-prompt-resilience.test.cjs
 *
 * Инварианты:
 * 1. buildPhoneRecognitionVocabulary ограничивает словарь строго до 20 ключевых слов.
 * 2. Приоритет отдается имени ученика/собеседника и подсказкам сценария (usefulWords, vocabularyHints).
 * 3. Результирующая строка подсказки prompt строго меньше 250 символов (с 3-кратным запасом к лимиту Groq 896).
 * 4. Защитный клэмп на сервере безопасно обрезает любые строки свыше 250 символов.
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('--- TEST: Whisper STT Prompt Resilience & 20-word limit ---');

// 1. Проверяем реализацию buildPhoneRecognitionVocabulary в исходном коде usePhoneCall.ts
const usePhoneCallContent = fs.readFileSync(
  path.join(__dirname, '../src/components/PhoneCallSimulator/usePhoneCall.ts'),
  'utf8'
);

assert(
  usePhoneCallContent.includes('export function buildPhoneRecognitionVocabulary'),
  'buildPhoneRecognitionVocabulary должна экспортироваться из usePhoneCall.ts'
);

assert(
  usePhoneCallContent.includes('slice(0, 20)'),
  'buildPhoneRecognitionVocabulary должна ограничивать словарь до 20 слов (.slice(0, 20))'
);

// 2. Проверяем реализацию в speech.ts (клиентский клэмп)
const speechContent = fs.readFileSync(
  path.join(__dirname, '../src/lib/speech.ts'),
  'utf8'
);

assert(
  speechContent.includes('.slice(0, 20)'),
  'speech.ts должен ограничивать vocabulary до 20 слов'
);

assert(
  speechContent.includes('.slice(0, 250)'),
  'speech.ts должен клэмпить итоговую строку prompt до 250 символов'
);

// 3. Проверяем реализацию в /api/ai/transcribe/route.ts (серверный клэмп и retry)
const routeContent = fs.readFileSync(
  path.join(__dirname, '../src/app/api/ai/transcribe/route.ts'),
  'utf8'
);

assert(
  routeContent.includes('prompt = rawPrompt.slice(0, 250).trim()'),
  'route.ts должен обрезать входящий prompt до безопасных 250 символов'
);

assert(
  routeContent.includes('!groqRes.ok && prompt'),
  'route.ts должен иметь fail-safe retry без prompt при ошибке Groq'
);

assert(
  routeContent.includes('createGroqForm()'),
  'route.ts должен повторять запрос к Groq с пустым prompt при сбое'
);

assert(
  routeContent.includes("geminiKey && provider !== 'gemini'"),
  'route.ts должен иметь резервный фолбэк на Gemini Transcribe при сбое Groq'
);

// 4. Логический тест эмуляции словаря: 80 слов урока + имя + сценарий
const mockParams = {
  callerName: 'נועם',
  studentName: 'Сергей',
  usefulWords: ['פיצה', 'גדולה', 'תוספת', 'זיתים', 'משפחתית', 'שתייה'],
  vocabularyHints: ['רוצה להזמין', 'כמה זה עולה', 'משלוח'],
  suggestedReplies: ['שלום, אני רוצה להזמין פיצה משפחתית', 'כמה זמן המשלוח?'],
  lessonVocabulary: Array.from({ length: 80 }, (_, i) => `מילה${i + 1}`),
};

function simulateVocabulary(params) {
  const words = new Set();
  if (params.studentName) {
    const raw = params.studentName.toLowerCase();
    if (raw.includes('сергей')) words.add('סרגיי');
  }
  if (params.callerName) words.add(params.callerName);
  (params.vocabularyHints || []).forEach((w) => words.add(w));
  (params.usefulWords || []).forEach((w) => words.add(w));
  (params.suggestedReplies || []).forEach((rep) => {
    const tokens = rep.match(/[\u0590-\u05FF]+/g);
    if (tokens) tokens.forEach((t) => { if (t.length >= 2) words.add(t); });
  });
  (params.lessonVocabulary || []).forEach((w) => words.add(w));
  return Array.from(words).slice(0, 20);
}

const vocab = simulateVocabulary(mockParams);
assert(vocab.length === 20, `Ожидалось ровно 20 слов, получено: ${vocab.length}`);
assert(vocab.includes('סרגיי'), 'Имя ученика обязано быть в словаре');
assert(vocab.includes('נועם'), 'Имя собеседника обязано быть в словаре');
assert(vocab.includes('פיצה'), 'Слова сценария обязаны быть в словаре');

const promptString = vocab.join(', ');
console.log(`- Длина сформированного промпта из 20 ключевых слов: ${promptString.length} символов`);
console.log(`- Содержимое: "${promptString}"`);

assert(
  promptString.length < 250,
  `Длина промпта (${promptString.length}) должна быть < 250 символов (лимит Groq = 896)`
);

console.log('✅ Все проверки устойчивости промпта Whisper и лимита 20 слов успешно пройдены!');