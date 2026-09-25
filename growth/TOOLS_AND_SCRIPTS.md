# Инструментарий и автоматизация маркетинга («Ульпан Алеф» — Growth Toolbox)

> **Статус:** 🔴 BLOCKING (Правило R-23 в `DECISION_MATRIX.md`)  
> **Назначение:** Единая шпаргалка по всем скриптам, командам, генераторам и автоматизациям для маркетинга, контента и соцсетей.

---

## 🛠 1. Скрипты публикации (Telegram, Facebook, YouTube)

### А. Скрипт автопостинга в Telegram-канал `@ulpana_il`: `growth/scripts/post_to_telegram.cjs`
* **Предпросмотр поста (Dry-Run без отправки):**
  ```bash
  node growth/scripts/post_to_telegram.cjs --preview
  ```
* **Реальная отправка поста в канал `@ulpana_il`:**
  ```bash
  node growth/scripts/post_to_telegram.cjs --send
  ```
* **Отправка конкретного файла с постом:**
  ```bash
  node growth/scripts/post_to_telegram.cjs --file=growth/content/tg_posts/post_01.md --send
  ```
* **Публикация видео в канал:**
  ```bash
  node growth/scripts/post_to_telegram.cjs --video=./public/demo/reels_duolingo_vs_reality.mp4 --send
  ```
* **Отправка в другой чат/группу:**
  ```bash
  node growth/scripts/post_to_telegram.cjs --chat=@other_chat --send
  ```

### Б. Скрипт публикации на Facebook Page: `growth/scripts/post_to_meta.cjs`
* **Предпросмотр поста:**
  ```bash
  node growth/scripts/post_to_meta.cjs --preview
  ```
* **Публикация поста на страницу Facebook:**
  ```bash
  node growth/scripts/post_to_meta.cjs --send
  ```
* **Публикация и автоматическая запись в реестр `publications.json`:**
  ```bash
  node growth/scripts/post_to_meta.cjs --send --register
  ```
* **Публикация с кастомным файлом и ссылкой:**
  ```bash
  node growth/scripts/post_to_meta.cjs --file=post.txt --link="https://ulpana-hebrew.vercel.app/?promo=FB" --send
  ```

### В. Скрипт публикации видео и Shorts в YouTube: `growth/scripts/post_to_youtube.cjs`
* **Предпросмотр видео и метаданных (Dry-Run без загрузки):**
  ```bash
  node growth/scripts/post_to_youtube.cjs --preview
  ```
* **Мастер первичной авторизации OAuth 2.0 (в 1 клик):**
  ```bash
  node growth/scripts/post_to_youtube.cjs --auth
  ```
* **Реальная загрузка видео на YouTube-канал:**
  ```bash
  node growth/scripts/post_to_youtube.cjs --send
  ```
* **Загрузка конкретного видеоролика и регистрация в `publications.json`:**
  ```bash
  node growth/scripts/post_to_youtube.cjs --video=./public/demo/reels_duolingo_vs_reality.mp4 --send --register
  ```
* **Публикация с доступом по ссылке (unlisted) или приватно (private):**
  ```bash
  node growth/scripts/post_to_youtube.cjs --privacy=unlisted --send
  ```
* **Кастомные метаданные (заголовок, описание, теги):**
  ```bash
  node growth/scripts/post_to_youtube.cjs --title="Заголовок #Shorts" --tags="иврит,ульпан,shorts" --send
  ```

### Г. Скрипт партизанского радара групп Facebook: `growth/scripts/facebook_radar.cjs`
* **Первичная авторизация (открывает окно Chrome для входа и сохраняет cookies):**
  ```bash
  node growth/scripts/facebook_radar.cjs --auth
  ```
* **Основной цикл сканирования групп раз в 12 часов (щадящий режим + пуш на боевой):**
  ```bash
  node growth/scripts/facebook_radar.cjs --scan
  ```
* **Быстрое сканирование для проверки (сокращенные паузы):**
  ```bash
  node growth/scripts/facebook_radar.cjs --scan --fast
  ```
* **Тестовый прогон на демо-данных без входа в соцсеть:**
  ```bash
  node growth/scripts/facebook_radar.cjs --dry-run
  ```
* **Проверка ИИ-анализа и отправки для конкретной реплики:**
  ```bash
  node growth/scripts/facebook_radar.cjs --test-msg="Воспитательница звонит из садика, ступор от страха"
  ```
* **Сводка найденных лидов:**
  ```bash
  node growth/scripts/facebook_radar.cjs --summary
  ```

---

## 🌐 2. Автопостинг на боевом сервере (Production / Vercel Serverless)

На боевом сервере (`https://ulpana-hebrew.vercel.app`) нет SSH-доступа и консольного терминала. Поэтому публикация в соцсети (YouTube, Telegram, Facebook) полностью интегрирована в **веб-панель управления `/admin`**:

### 1. Веб-интерфейс в `/admin` (Вкладка «Маркетинг»):
* **Мониторинг здоровья каналов (Marketing Health):**
  В шапке отображается статус всех сервисов (Telegram Bot, Groq, Gemini, WhatsApp, Meta и **▶️ YouTube Data API v3**). Если токен валиден — горит зелёный индикатор с названием канала.
* **1-клик публикация («⚡ Быстрая публикация»):**
  Кнопка в реестре публикаций открывает окно быстрой выгрузки:
  1. Выбираете площадку: YouTube Shorts, Telegram или Facebook.
  2. Вводите заголовок и описание (или используете готовый пресет).
  3. Для YouTube выбираете готовый видеофайл из `public/demo/` (например, `reels_duolingo_vs_reality.mp4`).
  4. Нажимаете «🚀 Запустить публикацию».
  5. Серверный роут `/api/admin/marketing/publish` самостоятельно связывается с YouTube Data API v3, выполняет потоковую загрузку ролика и сразу возвращает ссылку на опубликованное видео (`https://www.youtube.com/shorts/...`) с регистрацией в `publications.json`.

### 2. Необходимые переменные окружения на Vercel (Project Settings -> Environment Variables):
| Переменная | Назначение |
| :--- | :--- |
| `YOUTUBE_CLIENT_ID` | OAuth 2.0 Client ID из Google Cloud Console |
| `YOUTUBE_CLIENT_SECRET` | OAuth 2.0 Client Secret |
| `YOUTUBE_REFRESH_TOKEN` | Долгоживущий Refresh Token (полученный через `node growth/scripts/post_to_youtube.cjs --auth`) |
| `TELEGRAM_BOT_TOKEN` | Токен бота @Ulpinebot для отправки постов и видео |
| `FB_PAGE_ID` | ID страницы Facebook |
| `META_ACCESS_TOKEN` | Page Access Token для Meta Graph API |

---

## 🎬 3. Автоматическая запись видео с экрана (Playwright 9:16)

В проекте настроен автоматический робот для записи экрана смартфона в вертикальном формате (9:16, 390x844, Retina x2):

### Генерация видео-шпаргалки по уроку:
* **Команда:**
  ```bash
  npm run demo:record
  ```
* **Исходный скрипт:** `scripts/record_demo_walkthrough.mjs`
* **Конфиг сцен и таймингов:** `scripts/demo_config.json`
* **Куда сохраняется видео:** `public/demo/`
* **Что делает:** Сам открывает Chrome, эмулирует мобильный тач-экран iPhone, последовательно проходит все 5 этапов урока (Теория, Словарь, Тесты, Диалог, Звонок курьера) и сохраняет готовый `.webm`/`.mp4` видеофайл для Reels/Shorts.

### Запись видео с живым звуком синтезатора речи:
* **Команда:**
  ```bash
  npm run demo:record-audio
  ```
* **Исходный скрипт:** `scripts/record_full_walkthrough_with_sound.mjs`

### Генерация вирального ролика (Reels / TikTok / Shorts) «Duolingo vs Реальность»:
* **Команда:**
  ```bash
  node growth/scripts/record_viral_reels.mjs
  # или через npm:
  npm run reels:generate
  ```
* **Исходный скрипт:** `growth/scripts/record_viral_reels.mjs`
* **Сцена и моушн:** `growth/scenes/duolingo_vs_reality/index.html`
* **Сценарий:** `growth/content/reels_scripts/reels_01_duolingo_vs_reality.md`
* **Куда сохраняется видео:** `public/demo/reels_duolingo_vs_reality.mp4`
* **Что делает:** Робот запускает Playwright в 9:16 (390x844), синтезирует реплики и звуковые эффекты (гудок курьера, джингл ИИ), проигрывает анимацию со сменой 4 сцен и с помощью FFmpeg собирает готовый `.mp4` ролик на 17.5 секунд.

### Генерация вирального ролика Урока 69 («זֶה עָלַי — Что на мне?!»):
* **Команды:**
  ```bash
  # 1. Синтез реплик (Gemini TTS / Google TTS)
  node growth/scripts/generate_lesson_69_audio.mjs
  # 2. Запись Playwright 9:16 и монтаж FFmpeg
  node growth/scripts/record_lesson_69_reels.mjs
  ```
* **Исходный скрипт:** `growth/scripts/record_lesson_69_reels.mjs`
* **Сцена и моушн:** `growth/scenes/ze_alay_lesson_69/index.html`
* **Сценарий:** `growth/content/reels_scripts/reels_02_ze_alay_lesson_69.md`
* **Куда сохраняется видео:** `public/demo/reels_lesson_69_ze_alay.mp4`
* **Что делает:** Робот визуализирует сцену в кафе Тель-Авива, ступор от фразы «זֶה עָלַי» (*зэ алáй*), переход в Урок 69 приложения с симуляцией звонка друга Надава и сведением мастер-аудио с косинусным de-clicking 15ms.

### Генерация обучающего ролика (Walkthrough / Tutorial) Урока 69:
* **Команды:**
  ```bash
  # 1. Синтез дикторских реплик и озвучки тренажёра (44.1kHz stereo)
  node growth/scripts/generate_tutorial_69_audio.mjs
  # 2. Запись Playwright 9:16 и монтаж FFmpeg с таймингами сцен
  node growth/scripts/record_tutorial_69_video.mjs
  ```
* **Исходный скрипт:** `growth/scripts/record_tutorial_69_video.mjs`
* **Сцена и моушн:** `growth/scenes/tutorial_lesson_69/index.html`
* **Куда сохраняется видео:** `public/demo/tutorial_lesson_69.mp4` (64.0s, Full HD 9:16, 2.45 MB)
* **Что делает:** Полный методический проход урока 69 по 3 ключевым этапам:
  1. *Акт 1 (0:00–0:16):* Интерактивные карточки словаря (Этап 2) с тап-подсветкой форм предлога `עַל` (`עָלַי`, `עָלֶיךָ`, `עָלָיו`).
  2. *Акт 2 (0:16–0:33):* Диалоговый тренажёр (Этап 5) в кафе с распознаванием речи Whisper и бейджем точности 98%.
  3. *Акт 3 (0:33–0:52):* Реалистичный входящий звонок друга Надава (Этап 6) с итоговым ИИ-разбором ошибок.
  4. *Акт 4 (0:52–1:04):* Оффер и CTA с приглашением в Урок 69.
  Зарегистрирован в `growth/data/publications.json` как `pub-tut-l69-showcase` для выгрузки в 1 клик через `/admin`.

---

## 📚 4. Словарные инструменты и контентная база

Маркетинговые материалы обязаны опираться на академический стандарт проекта:

* **Поиск слова/спряжения в базе Pealim (SSOT):**  
  База `src/data/pealimMasterDictionary.json` доступна для чтения.
* **Аудит покрытия слуховых комплексов:**
  ```bash
  npm run drills:audit
  ```
* **Автогенерация карточек ComplexDrills:**
  ```bash
  npm run drills:sync -- --prepare-missing
  ```

---

## 🔄 5. Протокол изменений и обновлений в Growth Engine

На инструменты и документы в контуре `growth/` распространяются **те же строгие правила, что и на `DECISION_MATRIX.md`**:

1. **Детектор дрейфа (Code-Doc Drift):**  
   Если в `growth/scripts/` добавляется новый флаг, параметр или новый скрипт — он **в обязательном порядке** заносится в этот файл (`TOOLS_AND_SCRIPTS.md`).
2. **Superseded Log:**  
   Если мы отказываемся от какого-то инструмента, стороннего сервиса или подхода к рекламе — он фиксируется в `MARKETING_STRATEGY.md` и в `DECISION_MATRIX.md`.
3. **Автоматический контроль целостности:**  
   Тест `tests/decision-matrix-invariants.test.cjs` (инвариант R-23) непрерывно проверяет наличие и валидность маркетинговых паспортов.
4. **Post-Task аудит:**  
   По завершении любой маркетинговой задачи агент отвечает на 3 обязательных вопроса:
   * *1. Работали по паспорту стратегии?*
   * *2. Сломали что-то в сборке или тестах?*
   * *3. Требуется ли обновить документацию инструментов?*
