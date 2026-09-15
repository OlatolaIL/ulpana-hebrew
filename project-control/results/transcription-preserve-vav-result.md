# Отчёт Gemini: сохранение нормативного произношения союза в транскрипции

Дата: 14 сентября 2026 года  
Исполнитель: Gemini (middle/senior-разработчик)  
Заказчик / Ревьюер: Архитектор ChatGPT  
Проект: «Ульпан Алеф»  
Задача: `project-control/tasks/transcription-preserve-vav.md`  
Основание: принятый commit `0674b160c23f38004347833f2edf5172ba3c7058`  
Исходные фактические данные: `project-control/evidence/transcription-before.json` (сохранён без изменений)  
Языковой стандарт: `project-control/language-standard.md` и `project-control/evidence/language-sources-2026-09-14.json`  

---

## 1. Окружение, ветка и коммит

- **Базовый коммит (origin/main):** `0674b160c23f38004347833f2edf5172ba3c7058` (включает принятые компонентные тесты механик)
- **Изолированная рабочая копия (worktree):** `C:\Users\azrie\Documents\antigravity\goofy-maxwell-transcription`
- **Ветка задачи:** `fix/transcription-preserve-vav`
- **Итоговый коммит:** `6b397f67253ecbb8776bc8ec74126f6be0902663`
- **Сообщение коммита:** `fix(transcription): preserve normative /u/ prefix for conjunction vav`
- **Затронутые файлы:**
  1. `src/lib/transcription.ts` (исправление двух независимых мест подмены /u/)
  2. `tests/transcription-preserve-vav.test.cjs` (новые регрессионные тесты всех 5 экспортируемых функций)
- **Гарантии:**
  - Никаких правок в `project-control/overview.md` и `project-control/state.json` (управление остаётся за архитектором).
  - Файл исходных данных `project-control/evidence/transcription-before.json` **не перезаписывался**.
  - Ветка и рабочая копия механик (`goofy-maxwell-mechanics`) оставлены нетронутыми.
  - Никаких команд `git push`, слияний в `main` или выкаток на боевой сервер не производилось.

---

## 2. Суть дефектов и выполненные исправления

В соответствии с правилами Академии языка иврит и Министерства образования Израиля, соединительный союз «ו» (вав) имеет нормативное слогообразующее произношение **/u/** (в огласовке шурук — «וּ»):
- перед губными согласными **בומ״פ** (бет, вав, мем, пей): *וּמֵאָה* (у-меа), *וּגְבִינָה* (у-гвина — перед буквой со шва);
- перед согласными с простым шва (**שווא**): *וּשְׁנַיִם* (у-шнаим).

В кодовой базе были обнаружены и исправлены **два независимых дефекта**, искажавших это нормативное произношение:

### Дефект 1: Безусловная замена в `normalizeTranscription`
- **Код до исправления (строки 44–46):**
```ts
// 1. Союз «ו» в современном разговорном иврите всегда звучит как «вэ-», заменяем архаичное книжное «у-»
res = res.replace(/(^|[\s"«(—\[])у-([а-яёА-ЯЁa-zA-Z])/gi, '$1вэ-$2');
```
- **Проблема:** нормализатор принудительно заменял корректное нормативное «у-» на разговорное «вэ-» во всех входных данных — включая ручные словарные статьи и транскрипции уроков (например, заданное методистом «у-гвинá» превращалось в «вэ-гвинá»). Комментарий ошибочно объявлял нормативное правило «архаичным книжным».
- **Исправление:** строка регулярного выражения удалена; комментарий заменён на ссылку на стандарт Академии языка иврит о сохранении нормативного союза «у-».

### Дефект 2: Принудительная генерация «вэ-» в `generateHebrewTranscription`
- **Код до исправления (строки 105–108):**
```ts
if (char === 'ו') {
  if (i === 0 && dagesh && nextIdx < w.length) {
    // Союз "וּ" в начале слова: в современном разговорном иврите произносится как "вэ-"
    consonant = 'вэ-';
  } else if (dagesh) consonant = 'у';
  ...
}
```
- **Проблема:** даже если нормализатор не трогал «у-», алгоритмический генератор транскрипций при обнаружении начальной буквы вав с дагешем (шурук «וּ») сам непосредственно порождал префикс `вэ-`.
- **Исправление:** заменено на `consonant = 'у-';` с сохранением нормативного чтения шурука в начале слова.

---

## 3. Доказательство исходного падения и взаимной независимости ошибок

Для проверки строгого выполнения пункта 4 и пункта 6 технического задания был создан набор тестов `tests/transcription-preserve-vav.test.cjs`, тестирующий реально экспортируемые функции.

### 3.1. Запуск тестов на исходном коде базового коммита
Все 5 проверок упали с точными сообщениями об ошибках:
1. `normalizeTranscription`:
   `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: 'вэ-гвинá' !== 'у-гвинá'`
2. `convertLatinHebrewTranscriptionToCyrillic`:
   `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: 'вэ-гвина' !== 'у-гвина'`
3. `generateHebrewTranscription`:
   `AssertionError [ERR_ASSERTION]: Expected false to be truthy: "וּמֵאָה" generated unexpected initial "вэ": вэ-меа`
4. `ensureCyrillicHebrewTranscription`:
   `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: 'вэ-гвинá' !== 'у-гвинá'`
5. `getWordTranscription`:
   `AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: 'вэ-гвинá' !== 'у-гвинá'`

### 3.2. Доказательство независимости: правка ТОЛЬКО `normalizeTranscription`
При устранении замены в `normalizeTranscription`, но сохранении `consonant = 'вэ-'` в генераторе:
- Тесты 1 и 2 прошли (ручные транскрипции перестали искажаться).
- **Тесты 3, 4 и 5 упали**: генератор для `וּמֵאָה` и `וּשְׁנַיִם` продолжал выдавать `вэ-меа` и `вэ-шнаим`.

### 3.3. Доказательство независимости: правка ТОЛЬКО `generateHebrewTranscription`
При исправлении `consonant = 'у-'` в генераторе, но сохранении regex в `normalizeTranscription`:
- Генератор порождал `у-меа`, но на выходе вызывался `normalizeTranscription(rawTranscription)`, который повторно перетирал результат в `вэ-меа`.
- **Все 5 тестов снова упали**.

**Вывод:** дефекты независимы, исправление каждого из них по отдельности недостаточно; только одновременное устранение обоих дефектов обеспечивает целостность нормативного вывода.

---

## 4. Трассировка потребителей в кодовой базе

Были детально исследованы все потребители транскрипционных функций:

1. **Личный словарь (`src/components/PersonalDictionary.tsx`):**
   - Строка 14: импортирует `getWordTranscription` и `generateHebrewTranscription`.
   - Строки 87–88: вызывает `getWordTranscription(w)` для отображения транскрипции в карточках слов. Если ручная транскрипция отсутствует, используется fallback-генерация.
   - *Результат:* словарные карточки для слов с союзом шурук (например, «וּגְבִינָה», «וּמֵאָה») отображают нормативное «у-гвина», «у-меа», а существующие ручные транскрипции не уродуются в «вэ-».
2. **API оценки сочинения (`src/app/api/ai/essay/evaluate/route.ts`):**
   - Строка 187: вызывает `ensureCyrillicHebrewTranscription(correctedVersion.transcription, correctedVersion.hebrew)`.
   - *Результат:* сгенерированные или исправленные моделью предложения и слова при сохранении в словарь учащегося получают корректную кириллическую транскрипцию с сохранением «у-».
3. **Экран разбора сочинения (`src/components/EssayEvaluationView.tsx`):**
   - Строка 95: вызывает `ensureCyrillicHebrewTranscription(entry.transcription, entry.hebrew)` при рендере разобранных лексических единиц.
4. **Модальное окно слов колоды (`src/components/DeckWordsModal.tsx`):**
   - Строка 116: использует `getWordTranscription(word)` для показа транскрипции.
5. **Словарь урока (`src/components/LessonVocabulary.tsx`):**
   - Строка 159: использует `getWordTranscription(word)`.
6. **Тренажёр карточек (`src/components/FlashcardTrainer/`):**
   - `AutoAudioMode.tsx:142`, `BuilderMode.tsx:165`, `FlipCardMode.tsx:89` — все вызывают `getWordTranscription(word)`.

Все эти компоненты опираются на экспортируемые функции модуля `src/lib/transcription.ts`, которые теперь верифицированы тестами.

---

## 5. Границы реализации и ограничения генератора

В соответствии с пунктом 16 и пунктом 19 технического задания:
1. **Только огласованный текст:** генератор транскрипций работает на основе символов огласовок (nikkud). Если входной текст не огласован (например, `ומאה`), отличить союз вав со шва от шурука или корневой буквы алгоритмически невозможно без полного морфологического словаря. В таких случаях эвристика не выдумывает огласовку и не угадывает союз.
2. **Ударения:** алгоритмический генератор не расставляет автоматические знаки ударения (acute: `á`, `é` и т.д.), поэтому для `וּמֵאָה` и `וּגְבִינָה` он возвращает `у-меа` и `у-гвина`. В то же время ручные транскрипции в уроках и словаре содержат точные знаки ударения (`у-гвинá`, `у-меá`) — функция `getWordTranscription` и нормализатор полностью сохраняют эти знаки без потерь.
3. **Слово «וּשְׁנַיִם»:** генератор возвращает фонетическую транскрипцию `у-шнаим` (буква `שְׁ` со шва становится `ш`, `נַ` с патахом — `на`, `יִ` с хириком — `и`, конечная `ם` — `м`). Это полностью соответствует требованию задачи: начальный звук строго `у-` и ни в коем случае не `вэ-`.
4. **Необратимость явного «вэ-»:** если во входных данных явно задано `вэ-гвинá` (например, разговорный вариант), функция `normalizeTranscription` **не преобразует** его насильно в «у-» без контекста. Это гарантирует сохранение намеренных авторских формулировок.
5. **Сохранение других правил:** предлог `בַּבֹּקֶר` (`бабóкер`), `бэвакашá`, `тодá рабá` и обработка союза вав со шва (`וְשָׁלוֹם` -> `вешалом`, `וְגַם` -> `вегам`) полностью сохранены.

---

## 6. Результаты обязательных проверок (DEVELOPMENT.md)

Все проверки запущены и успешно завершены в рабочей копии `C:\Users\azrie\Documents\antigravity\goofy-maxwell-transcription`:

| Проверка | Команда | Результат | Статус |
| :--- | :--- | :--- | :--- |
| **Модульные тесты** | `npm test` | **70 passed**, 0 failed (2.78 сек). Все 5 новых тестов + 65 существующих тестов. | **PASS** |
| **Проверка типов TypeScript** | `npm run typecheck` | Код завершения 0, маршруты Next.js сгенерированы без ошибок. | **PASS** |
| **Аудит безопасности зависимостей** | `npm audit --audit-level=high` | 0 vulnerabilities (found 0 vulnerabilities). Код завершения 0. | **PASS** |
| **Сборка приложения** | `npm run build` (`next build --webpack`) | Скомпилировано за 26.1 с; сгенерированы 33/33 статических страниц. Код 0. | **PASS** |
| **Целевой линтинг ESLint** | `npx eslint src/lib/transcription.ts tests/transcription-preserve-vav.test.cjs` | 0 errors, 1 pre-existing warning (`shinDot` на строке 89). Код 0. | **PASS** |
| **Общий линтинг** | `npm run lint` | 0 ошибок в `src/lib/transcription.ts`. Существующий техдолг по непричастным файлам проекта зафиксирован (94 errors в других каталогах). | **PASS** (в рамках задачи) |

---

## 7. Инструкция для воспроизведения ревьюером

В изолированной рабочей копии (или после чекаута коммита `6b397f67253ecbb8776bc8ec74126f6be0902663`):

```bash
cd C:\Users\azrie\Documents\antigravity\goofy-maxwell-transcription

# 1. Запуск полного набора тестов (70 тестов)
npm test

# 2. Проверка типов
npm run typecheck

# 3. Аудит безопасности
npm audit --audit-level=high

# 4. Проверка линтером затронутых файлов
npx eslint src/lib/transcription.ts tests/transcription-preserve-vav.test.cjs

# 5. Проверка производственной сборки
npm run build
```

---

## 8. Полный Git Diff коммита

```diff
diff --git a/src/lib/transcription.ts b/src/lib/transcription.ts
index c55abb4..ed6b009 100644
--- a/src/lib/transcription.ts
+++ b/src/lib/transcription.ts
@@ -41,8 +41,8 @@ export function normalizeTranscription(transcription: string): string {
   if (!transcription) return '';
   let res = transcription.trim();
 
-  // 1. Союз «ו» в современном разговорном иврите всегда звучит как «вэ-», заменяем архаичное книжное «у-»
-  res = res.replace(/(^|[\s"«(—\[])у-([а-яёА-ЯЁa-zA-Z])/gi, '$1вэ-$2');
+  // 1. Нормативное произношение союза «ו» как «у-» (перед буквами בומ״פ и перед שווא)
+  // сохраняется в соответствии со стандартом Академии языка иврит и не подменяется на «вэ-».
 
   // 2. «בַּבֹּקֶר» (бабóкер): предлог בְּ + артикль הַ дает сильный дагеш во второй ב ([б], а не [в])
   res = res.replace(/(^|[\s"«(—\[])(?:б[аá]вокер|б[аá]-вокер|б[эеé]вокер|б[эеé]-вокер)(?=$|[\s.,!?;:"»)—\]])/gi, '$1бабóкер');
@@ -103,8 +103,8 @@ export function generateHebrewTranscription(text: string): string {
             (i === w.length - 1 || nextIdx === w.length) && !dagesh ? '' : 'h';
         else if (char === 'ו') {
           if (i === 0 && dagesh && nextIdx < w.length) {
-            // Союз "וּ" в начале слова: в современном разговорном иврите произносится как "вэ-"
-            consonant = 'вэ-';
+            // Союз «וּ» (шурук) в начале слова перед שווא и согласными בומ״פ: нормативное произношение «у-»
+            consonant = 'у-';
           } else if (dagesh) consonant = 'у';
           else if (vowels.includes(0x05b9) || vowels.includes(0x05ba))
             consonant = 'о';
diff --git a/tests/transcription-preserve-vav.test.cjs b/tests/transcription-preserve-vav.test.cjs
new file mode 100644
index 0000000..f705ae1
--- /dev/null
+++ b/tests/transcription-preserve-vav.test.cjs
@@ -0,0 +1,119 @@
+/* eslint-disable @typescript-eslint/no-require-imports */
+const test = require('node:test');
+const assert = require('node:assert/strict');
+
+
+const {
+  normalizeTranscription,
+  generateHebrewTranscription,
+  convertLatinHebrewTranscriptionToCyrillic,
+  ensureCyrillicHebrewTranscription,
+  getWordTranscription,
+} = require('../src/lib/transcription.ts');
+
+test('normalizeTranscription preserves manual canonical /u/ prefix and does not force "вэ-"', () => {
+  // Manual transcription with conjunction /u/ (as in dictionary / lessons)
+  assert.equal(normalizeTranscription('у-гвинá'), 'у-гвинá');
+  assert.equal(normalizeTranscription('у-меá'), 'у-меá');
+  assert.equal(normalizeTranscription('«у-гвинá»'), '«у-гвинá»');
+  assert.equal(normalizeTranscription('у-шнаим'), 'у-шнаим');
+
+  // Existing explicit "вэ-" is preserved and not converted in reverse without context
+  assert.equal(normalizeTranscription('вэ-гвинá'), 'вэ-гвинá');
+
+  // Empty string handling
+  assert.equal(normalizeTranscription(''), '');
+
+  // Other dictionary normalizations in normalizeTranscription remain intact
+  assert.equal(normalizeTranscription('бэвокер'), 'бабóкер');
+  assert.equal(normalizeTranscription('бэвакаша'), 'бэвакашá');
+  assert.equal(normalizeTranscription('тодá рáба'), 'тодá рабá');
+});
+
+test('convertLatinHebrewTranscriptionToCyrillic preserves initial /u/ for Latin input', () => {
+  // u-gvina should yield Cyrillic у-гвина, NOT вэ-гвина
+  assert.equal(convertLatinHebrewTranscriptionToCyrillic('u-gvina'), 'у-гвина');
+
+  // Explicit ve- remains вэ-
+  assert.equal(convertLatinHebrewTranscriptionToCyrillic('ve-gvina'), 'вэ-гвина');
+
+  // Empty input
+  assert.equal(convertLatinHebrewTranscriptionToCyrillic(''), '');
+});
+
+test('generateHebrewTranscription renders initial shuruk vav (וּ) as /u/ and does not emit initial "вэ"', () => {
+  // Conjunction וּ before BUMAF and sheva
+  const mea = generateHebrewTranscription('וּמֵאָה');
+  assert.ok(!mea.startsWith('вэ'), `"וּמֵאָה" generated unexpected initial "вэ": ${mea}`);
+  assert.ok(mea.startsWith('у-'), `"וּמֵאָה" should start with "у-": ${mea}`);
+  assert.equal(mea, 'у-меа');
+
+  const shnayim = generateHebrewTranscription('וּשְׁנַיִם');
+  assert.ok(!shnayim.startsWith('вэ'), `"וּשְׁנַיִם" generated unexpected initial "вэ": ${shnayim}`);
+  assert.ok(shnayim.startsWith('у-'), `"וּשְׁנַיִם" should start with "у-": ${shnayim}`);
+  assert.equal(shnayim, 'у-шнаим');
+
+  const gvina = generateHebrewTranscription('וּגְבִינָה');
+  assert.ok(!gvina.startsWith('вэ'), `"וּגְבִינָה" generated unexpected initial "вэ": ${gvina}`);
+  assert.ok(gvina.startsWith('у-'), `"וּגְבִינָה" should start with "у-": ${gvina}`);
+  assert.equal(gvina, 'у-гвина');
+
+  // Empty input
+  assert.equal(generateHebrewTranscription(''), '');
+
+  // Conjunction with regular shva (וְ) is unaffected and keeps /ve/
+  assert.equal(generateHebrewTranscription('וְשָׁלוֹם'), 'вешалом');
+  assert.equal(generateHebrewTranscription('וְגַם'), 'вегам');
+});
+
+test('ensureCyrillicHebrewTranscription preserves manual /u/ and generates /u/ for missing transcription', () => {
+  // Preserves existing Cyrillic transcription with /u/
+  assert.equal(
+    ensureCyrillicHebrewTranscription('у-гвинá', 'וּגְבִינָה'),
+    'у-гвинá'
+  );
+
+  // Preserves existing Cyrillic transcription with /ve/
+  assert.equal(
+    ensureCyrillicHebrewTranscription('вэ-гвинá', 'וּגְבִינָה'),
+    'вэ-гвинá'
+  );
+
+  // When transcription is missing, generates from vocalized Hebrew with /u/
+  const genFromHeb = ensureCyrillicHebrewTranscription('', 'וּמֵאָה');
+  assert.ok(!genFromHeb.startsWith('вэ'), `Generated transcription must not start with "вэ": ${genFromHeb}`);
+  assert.equal(genFromHeb, 'у-меа');
+
+  // Latin transcription with u- converted to Cyrillic у-
+  assert.equal(
+    ensureCyrillicHebrewTranscription('u-gvina'),
+    'у-гвина'
+  );
+});
+
+test('getWordTranscription returns manual /u/ when present and generates /u/ when absent', () => {
+  // With manual transcription: preserves exact manual string
+  const manualWord = {
+    hebrew: 'וּגְבִינָה',
+    transcription: 'у-гвинá',
+  };
+  assert.equal(getWordTranscription(manualWord), 'у-гвинá');
+
+  // Without manual transcription: generates dynamically with /u/
+  const autoWord = {
+    hebrew: 'וּגְבִינָה',
+  };
+  const autoResult = getWordTranscription(autoWord);
+  assert.ok(!autoResult.startsWith('вэ'), `Generated transcription must not start with "вэ": ${autoResult}`);
+  assert.equal(autoResult, 'у-гвина');
+
+  const autoMea = {
+    hebrew: 'וּמֵאָה',
+  };
+  assert.equal(getWordTranscription(autoMea), 'у-меа');
+
+  // Null/undefined/empty handling
+  assert.equal(getWordTranscription(null), '');
+  assert.equal(getWordTranscription(undefined), '');
+  assert.equal(getWordTranscription({}), '');
+});
+```
+