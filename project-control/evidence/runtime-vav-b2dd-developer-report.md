# Отчёт Gemini: сохранение нормативного союза в живых диалогах и подготовке текста озвучки

**Дата:** 14 сентября 2026 года  
**Исполнитель:** Gemini (middle/senior-разработчик)  
**Ревьюер / Заказчик:** Архитектор ChatGPT  
**Проект:** «Ульпан Алеф»  
**Задача:** `project-control/tasks/runtime-normative-vav.md`  
**Базовый коммит:** `d413f9489f144599c4c95bd8321c9613b01a78db` (принятый коммит практики урока 5 в локальной `main`)  
**Итоговый коммит ветки:** `b2dd5f21eaace35604285d011e889350f1729679` (включает реализацию `316570f` и исправление дескрипторов изоляции `b2dd5f2`)  
**Ветка:** `fix/runtime-normative-vav`  
**Рабочая копия:** `C:\Users\azrie\Documents\antigravity\goofy-maxwell-runtime-vav`  
**Основной репозиторий (main):** `C:\Users\azrie\Documents\antigravity\goofy-maxwell` (не изменялся, без push и выпуска)  

---

## 1. Границы изменений и затронутые файлы

В строгом соответствии с заданием (`project-control/tasks/runtime-normative-vav.md`) и критериями приёмки:
- Учебные данные в `src/data/lessons/*` **не изменялись** (`git status` подтверждает 0 изменений в уроках).
- Схемы данных, механизмы авторизации, бюджеты, логика выбора провайдеров и настройки голосов **не изменялись**.
- Все изменения кода и тестов выполнены исключительно в изолированной рабочей копии `goofy-maxwell-runtime-vav`.

### Затронутые файлы приложения (реализация 316570f сохранена без изменений):
1. `src/lib/speech.ts` (+0, -9):
   - Удалён принудительный блок автозамены шурука `וּ` (\u05D5\u05BC), шва `וְ` (\u05D5\u05B0) и начального `ו` перед согласными на сэголь `וֶ` в функции `fixHebrewPhonetics`.
   - Сохранены в неизменном виде: реестр `PHONETIC_CORRECTIONS` (24 правила), правила для `סַפְּרִי` / `סַפֵּר`, фильтрация служебных символов и эмодзи в `cleanHebrewForSpeech`, управление очередью, скоростью, отменой и fallback.

2. `src/app/api/ai/phone/route.ts` (+2, -5):
   - Из функции `sanitizeTranscription` удалена принудительная регулярная замена `/(^|[\s"«(—])у-([а-яёА-ЯЁa-zA-Z])/gi` на `вэ-`. Теперь функция безопасно возвращает очищенную строку с `trim()`, аналогично обработчику `chat/route.ts`.
   - В системном промпте телефона (строка 279) директива `Союз ו ВСЕГДА транскрибируй как «вэ-» (не «у-»)` заменена на положительное нормативное соответствие:
     `2. "cyrillic_transcription": Русская транскрипция кириллицей с ударением (´) и буквой 'h' для ה. Транскрипция союза ו строго соответствует его нормативной огласовке: וּ передаётся как «у-» (например, «וּגְבִינָה» → «у-гвинá»), וְ передаётся как «вэ-» (например, «וְסֵפֶר» → «вэ-сéфер»).`

3. `src/app/api/ai/chat/route.ts` (+3, -3):
   - В системном промпте чата (строки 452, 453, 459) сняты категорические запреты на «у-» и принудительное требование «ВСЕГДА вэ-».
   - Сформулированы понятные положительные правила нормативного соответствия транскрипции союза `ו` его огласовке (`וּ` → «у-», `וְ` → «вэ-»).
   - Исходящие промпты чата и телефона возвращают 0 совпадений по контрольному выражению архитектора `/ВСЕГДА.*вэ-|ЗАПРЕЩЕНО.*у-|союзом "вэ-"/`.

### Файлы тестов:
4. `tests/runtime-normative-vav.test.cjs` (+597, -0):
   - Создан целевой тестовый набор из 6 тестов (CommonJS, директива `/* eslint-disable @typescript-eslint/no-require-imports */`).
   - Реализована строгая изоляция свойств `globalThis` через функцию `snapshotGlobalProperties`: сохранение оригинальных дескрипторов (`Object.getOwnPropertyDescriptor`) перед настройкой заглушек, а при восстановлении — удаление через `delete globalThis[k]`, если свойства ранее не существовало, либо восстановление оригинального дескриптора через `Object.defineProperty`.
   - Восстановление зарегистрировано как в блоке `finally`, так и в хуке `t.after()`, гарантируя отсутствие утечек даже при аварийном падении assertion внутри теста.

---

## 2. Источники языковой нормы

1. **Официальный учебный материал Министерства образования Израиля** (`language-standard.md`, стр. 41):
   - Нормативное чтение соединительного союза `ו` перед буквами губного ряда (БУМАФ: ב, ו, מ, פ) и перед согласными со шва (шва нави / шва в начале слова) — огласовка шурук со звучанием `/u/` (кириллицей «у-»).
   - Пример: `וּגְבִינָה` (союз перед буквой гимель со шва) нормативно огласуется с шуруком и транскрибируется как «у-гвинá».
   *(Примечание: упоминание Pealim из предварительного отчёта исключено, так как отдельная словарная статья для союза с существительным в словаре отсутствует; норма подтверждается правилами Академии языка иврит и официальной учебной программой Минпросвещения Израиля).*
2. **Разделение союза и корневой буквы**:
   - В словах вроде `וִילוֹן` (занавеска) и `וֶרֶד` (роза) буква `ו` является частью корня, а не союзом. Удаление искусственной автозамены союза гарантирует сохранность корневых огласовок без искажения в синтезе речи.

---

## 3. Сравнение поведения «До» и «После»

| Компонент / Маршрут | До (база d413f94) | После (коммит b2dd5f2) |
|---|---|---|
| **`cleanHebrewForSpeech('וּגְבִינָה')`** | Возвращал `וֶגְבִינָה` (искажение шурука в сэголь) | Возвращает `וּגְבִינָה` (шурук сохранён) |
| **`cleanHebrewForSpeech('לֶחֶם וּגְבִינָה')`** | Возвращал `לֶחֶם וֶגְבִינָה` | Возвращает `לֶחֶם וּגְבִינָה` |
| **`cleanHebrewForSpeech('וְסֵפֶר')`** | Возвращал `וֶסֵפֶר` | Возвращает `וְסֵפֶר` |
| **`cleanHebrewForSpeech('וִילוֹן')`** | Возвращал `וִילוֹן` | Возвращает `וִילוֹן` |
| **TTS Sinks (`speakHebrew`)** | Передавал `לֶחֶם וֶגְבִינָה` в browser-tts и fallback-audio | Передает правильный текст `לֶחֶם וּגְבִינָה` во все 3 ветки (native TTS, unsupported synthesis fallback, error fallback) |
| **`POST /api/ai/phone` (Groq & Gemini)** | Превращал синтетическое `у-гвинá` в `вэ-гвинá` в ответе и подсказках | Сохраняет `у-гвинá` в реплике и `suggestedReplies`; сохраняет `вэ-сéфер` без обратной мутации |
| **Исходящий промпт Phone** | Содержал 1 директиву принудительного «ВСЕГДА вэ-» | 0 директив `FORCED_VE_REGEX`; положительное правило `וּ → «у-»`, `וְ → «вэ-»` |
| **`POST /api/ai/chat` (Groq & Gemini)** | Обработчик сохранял `у-`, но промпт содержал 3 директивы «ВСЕГДА вэ-» и запрет «у-» | 0 директив `FORCED_VE_REGEX`; положительное правило `וּ → «у-»`, `וְ → «вэ-»` |

---

## 4. Доказательства проверок

### 4.1. Целевой тест `tests/runtime-normative-vav.test.cjs`
Команда запуска:
```sh
node --require ./tests/register.cjs --test --test-isolation=none tests/runtime-normative-vav.test.cjs
```
Результат: **6 из 6 тестов пройдено, 0 ошибок (1140ms)**:
- `✔ cleanHebrewForSpeech preserves normative vav and root-vav words without forced segol substitution`
- `✔ speakHebrew transmits normative text across native TTS, unsupported synthesis, and error fallback`
- `✔ POST /api/ai/phone preserves normative "у-" transcription and provides positive prompt rules (Groq and Gemini)`
- `✔ POST /api/ai/phone preserves standard "вэ-" and trims surrounding whitespace`
- `✔ POST /api/ai/chat preserves normative "у-" transcription and provides positive prompt rules (Groq and Gemini)`
- `✔ POST /api/ai/chat preserves standard "вэ-" and trims surrounding whitespace`

### 4.2. Проверка изоляции окружения независимым гардом архитектора
Команда запуска:
```sh
node --require ./tests/register.cjs --require C:/Users/azrie/Documents/antigravity/goofy-maxwell/project-control/evidence/runtime-vav-isolation-guard.cjs --test --test-isolation=none tests/runtime-normative-vav.test.cjs
```
Результат: **код возврата 0, утечки отсутствуют**:
```
ISOLATION {"leakedGlobals":[],"leakedEnvKeys":[],"scope":"Named global property descriptors and environment keys; no secret values recorded"}
ℹ tests 6
ℹ suites 0
ℹ pass 6
ℹ fail 0
```
Свойства `window`, `SpeechSynthesisUtterance`, `Audio`, `localStorage` полностью удаляются из `globalThis` после выполнения теста и не оставляются со значением `undefined`.

### 4.3. Отрицательный контрольный прогон на базовых модулях `d413f94`
Выполнен разработчиком для самопроверки через воспроизведение на коде базового коммита:
Результат: **4 падения из 6 тестов на реальном базовом коде**:
1. `cleanHebrewForSpeech`: падает с `AssertionError: Initial וּ must be preserved without segol: actual 'וֶגְבִינָה', expected 'וּגְבִינָה'`.
2. `speakHebrew`: падает с `AssertionError: Native TTS must receive unmodified normative וּגְבִינָה: actual 'לֶחֶם וֶגְבִינָה', expected 'לֶחֶם וּגְבִינָה'`.
3. `POST /api/ai/phone`: падает с `AssertionError: phone/groq main transcription must preserve "у-гвинá": actual 'вэ-гвинá', expected 'у-гвинá'`.
4. `POST /api/ai/chat`: падает с `AssertionError: chat/groq prompt must not contain forced-ve rules, found: 3 !== 0`.

### 4.4. Самопроверка скриптами архитектора из `project-control/evidence/`
*(Самостоятельный запуск разработчиком в рабочей копии для подтверждения контрактов; не является заменой независимой приёмки архитектором).*
- `node project-control/evidence/runtime-vav-review.cjs goofy-maxwell-runtime-vav ...`:
  - `speech`: `וּגְבִינָה` $\rightarrow$ `וּגְבִינָה`, `לֶחֶם וּגְבִינָה` $\rightarrow$ `לֶחֶם וּגְבִינָה`, `וְסֵפֶר` $\rightarrow$ `וְסֵפֶר`, `וִילוֹן` $\rightarrow$ `וִילוֹן`.
  - `phone/groq`: transcription `"у-гвинá"`, suggestedReply `"у-гвинá"`, forcedVeInstructions: **0**.
  - `phone/gemini`: transcription `"у-гвинá"`, suggestedReply `"у-гвинá"`, forcedVeInstructions: **0**.
  - `chat/groq`: transcription `"у-гвинá"`, suggestedReply `"у-гвинá"`, forcedVeInstructions: **0**.
  - `chat/gemini`: transcription `"у-гвинá"`, suggestedReply `"у-гвинá"`, forcedVeInstructions: **0**.
- `node project-control/evidence/speech-vav-sink-review.cjs goofy-maxwell-runtime-vav ...`:
  - `browser-tts`: text `"לֶחֶם וּגְבִינָה"`, lang `"he-IL"`, rate `0.8`.
  - `fallback-audio` (unsupported synthesis): text `"לֶחֶם וּגְבִינָה"`, rate `0.8`.
  - `fallback-audio` (onerror fallback): text `"לֶחֶם וּגְבִינָה"`, rate `0.8`.

---

## 5. Сводная таблица проверок проекта

| Проверка | Команда | Результат | Статус |
|---|---|---|---|
| **Целевой тест задачи + Guard** | `node --require ./tests/register.cjs --require .../runtime-vav-isolation-guard.cjs --test --test-isolation=none tests/runtime-normative-vav.test.cjs` | **6 из 6 пройдено**, 0 утечек `leakedGlobals: []`, код 0 | **PASS** |
| **Полный набор тестов** | `npm test` | **91 из 91 теста пройдено**, 0 падений (~3.9s) | **PASS** |
| **Контроль типов** | `npm run typecheck` (`next typegen && tsc --noEmit`) | Код 0, Types generated successfully | **PASS** |
| **Аудит зависимостей** | `npm audit --audit-level=high` | Код 0, found 0 vulnerabilities | **PASS** |
| **Обязательный ESLint (DEVELOPMENT.md)** | `npx eslint src/components/AuthModal.tsx src/components/FlashcardTrainer/FlashcardTrainer.tsx src/components/LessonAiChat/useAiChat.ts tests/runtime-normative-vav.test.cjs` | Код 0, **0 errors, 0 warnings** | **PASS** |
| **Дополнительный ESLint компонентов** | `npx eslint src/components/LessonExercises.tsx src/components/PhoneCallSimulator.tsx src/components/ScriptedDialogueTrainer.tsx` | Код 0, **0 errors, 0 warnings** | **PASS** |
| **ESLint сравнение с базой для изменённых файлов** | `npx eslint src/lib/speech.ts src/app/api/ai/phone/route.ts src/app/api/ai/chat/route.ts` | База `d413f94`: 32 замечания техдолга; Текущее состояние: **ровно те же 32 замечания**, 0 новых нарушений | **PASS** |
| **Сборка проекта** | `npm run build` (`next build --webpack`) | Код 0, 33/33 статических страниц сгенерировано | **PASS** |

---

## 6. Соблюдение ограничений и статус

1. Ветка `main` в основном репозитории остаётся нетронутой на коммите `d413f9489f144599c4c95bd8321c9613b01a78db`.
2. Команды `git push`, слияние в `main` и операции релиза не производились.
3. Внешние платные AI API и боевая БД не опрашивались; тесты выполнены через перехват сетевых запросов `fetch` с валидными синтетическими данными сессии.
4. Физическое звучание голосовых движков (акустический синтез браузеров / Google TTS) не тестировалось на слух и не декларируется как проверенное; подтверждена корректность и сохранность нормативного текста на всех этапах его подготовки и передачи во все 3 конечные точки синтеза речи.
5. Коммит `b2dd5f21eaace35604285d011e889350f1729679` в ветке `fix/runtime-normative-vav` рабочей копии `C:\Users\azrie\Documents\antigravity\goofy-maxwell-runtime-vav` готов к независимой приёмке архитектором.
