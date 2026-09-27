# 🚀 Сводный документ передачи контекста: Фабрика-500 (Видеопродакшн «Ульпан Алеф»)

> **Дата составления:** 27 сентября 2026  
> **Статус:** 🟢 Полная готовность контура Фабрика-500 к пакетному производству  
> **Назначение:** Единый документ для мгновенной передачи контекста в любую новую сессию/агенту без потерь.

---

## 📌 1. Цель проекта и архитектурная задача

Массовое производство **500+ вертикальных коротких видео (9:16, 780×1688)** для 100 уроков курса «Ульпан Алеф» по стандарту **«Фабрика-500»** ([growth/VIDEO_PRODUCTION_PLAYBOOK.md](file:///c:/Users/azrie/Documents/antigravity/goofy-maxwell/growth/VIDEO_PRODUCTION_PLAYBOOK.md)):
* **2 сценария на каждый урок:**
  * 🟢 **Clean (Ad-Safe):** белый юмор, бытовые курьёзы для рекламы и семейных сообществ.
  * 🌶️ **Spicy (Organic Viral):** сленг, свидания, омофоны на грани фола для взрывных алгоритмов TikTok/Reels/Shorts.
* **5 каналов дистрибуции с уникальными аудио-CTA и анимированными промокодами:**
  1. `YT` — YouTube Shorts (промокод `YT`)
  2. `TG` — Telegram (промокод `TG`)
  3. `INSTA` — Instagram Reels (промокод `INSTA`)
  4. `TIKTOK` — TikTok (промокод `TIKTOK`)
  5. `FB` — Facebook Reels (промокод `FB`)

---

## 📊 2. Текущий статус выполнения

### 🟢 Урок 1: Сдан на 100% (10 из 10 видеороликов)
Все 10 видео смонтированы в HD 780×1688, озвучены тремя голосами Gemini TTS и зарегистрированы:
1. `lesson_01_clean_youtube_shorts.mp4` (7.04 MB, 32.8s) [Код: `YT`]
2. `lesson_01_clean_telegram.mp4` (6.77 MB, 32.1s) [Код: `TG`]
3. `lesson_01_clean_instagram_reels.mp4` (6.75 MB, 31.1s) [Код: `INSTA`]
4. `lesson_01_clean_tiktok.mp4` (7.03 MB, 31.3s) [Код: `TIKTOK`]
5. `lesson_01_clean_facebook_reels.mp4` (6.68 MB, 30.8s) [Код: `FB`]
6. `lesson_01_spicy_youtube_shorts.mp4` (8.07 MB, 31.5s) [Код: `YT`]
7. `lesson_01_spicy_telegram.mp4` (8.09 MB, 32.3s) [Код: `TG`]
8. `lesson_01_spicy_instagram_reels.mp4` (8.08 MB, 33.1s) [Код: `INSTA`]
9. `lesson_01_spicy_tiktok.mp4` (8.11 MB, 32.9s) [Код: `TIKTOK`]
10. `lesson_01_spicy_facebook_reels.mp4` (8.09 MB, 31.5s) [Код: `FB`]

* **Директория видео:** `public/demo/lessons/`
* **Маркетинговые описания и UTM-ссылки:** [`growth/content/lesson_01_descriptions.md`](file:///c:/Users/azrie/Documents/antigravity/goofy-maxwell/growth/content/lesson_01_descriptions.md)
* **Интерактивный плеер для просмотра:** `all_platforms_player.html` в директории артефактов сессии.

---

## 🧠 3. Принятые архитектурные решения

1. **Audio-Bank First (Двухэтапный конвейер):**
   * **Этап 1:** Все фразы озвучиваются пакетом через API и сохраняются в банк звуков (`public/demo/audio_bank/`).
   * **Этап 2:** Рендерер видео работает оффлайн на полной скорости машины, беря готовые аудиофайлы из банка.
   * **Экономия ресурсов:** Реплики сцен 1–3 (Хук, Диалог, Разбор) одинаковы для всех 5 площадок. Мы озвучиваем их **1 раз**, а не 5 раз! Экономия квоты Google API — 80%.
2. **Голосовой кастинг:**
   * **Диктор (Русский язык, темп 1.15x):** Gemini TTS `Charon` / Google Cloud `ru-RU-Neural2-D`.
   * **Мужской иврит (ученик, бариста, тимлид, таксист):** Gemini TTS `Orus` / Google Cloud `he-IL-Wavenet-B`.
   * **Женский иврит (девушка, официантка, бабушка):** Gemini TTS `Aoede` / Google Cloud `he-IL-Wavenet-A`.
3. **Стандарт анимации промокода в Outro:**
   * Pop-in Bounce на 3.6 сек (когда диктор произносит «Промокод на экране»), Neon Shockwave Pulse и циклический Shimmer-блик.

---

## 📁 4. Карта ключевых файлов и каталогов

| Файл / Папка | Назначение |
| :--- | :--- |
| [`growth/VIRAL_SCRIPTS_CATALOG.md`](file:///c:/Users/azrie/Documents/antigravity/goofy-maxwell/growth/VIRAL_SCRIPTS_CATALOG.md) | **Полный каталог 200 сценариев для всех 100 уроков** (2 824 строки). Готовые реплики на иврите с никудом, транскрипцией и русский закадровый текст. |
| [`growth/MASTER_TTS_CATALOG.md`](file:///c:/Users/azrie/Documents/antigravity/goofy-maxwell/growth/MASTER_TTS_CATALOG.md) | **Человекочитаемый реестр всех 1 006 фраз** с ролями, полом, языком, голосами и текстом. |
| [`growth/MASTER_TTS_CATALOG.json`](file:///c:/Users/azrie/Documents/antigravity/goofy-maxwell/growth/MASTER_TTS_CATALOG.json) | **Машиночитаемый JSON всех 1 006 фраз** для автоматических скриптов озвучки. |
| [`growth/lessons_video_registry.json`](file:///c:/Users/azrie/Documents/antigravity/goofy-maxwell/growth/lessons_video_registry.json) | **Единый реестр готовых видео:** пути к файлам, тайминги, размеры, промокоды. |
| [`growth/scripts/export_tts_catalog.mjs`](file:///c:/Users/azrie/Documents/antigravity/goofy-maxwell/growth/scripts/export_tts_catalog.mjs) | Скрипт парсинга и обновления `MASTER_TTS_CATALOG` из `VIRAL_SCRIPTS_CATALOG.md`. |
| [`growth/scripts/batch_synthesize_tts.mjs`](file:///c:/Users/azrie/Documents/antigravity/goofy-maxwell/growth/scripts/batch_synthesize_tts.mjs) | **Утилита пакетной озвучки:** поддерживает Google Cloud TTS (`--engine=gcloud`) и Gemini TTS (`--engine=gemini`), автоматический кэш, пропуск существующих файлов, защиту от 429. |
| [`growth/scripts/render_lesson_01_all_platforms.mjs`](file:///c:/Users/azrie/Documents/antigravity/goofy-maxwell/growth/scripts/render_lesson_01_all_platforms.mjs) | Мастер-скрипт рендеринга 10 видеороликов через Playwright и ffmpeg. |
| `public/demo/audio_bank/` | Локальный банк сгенерированных аудиодорожек. |
| `public/demo/lessons/` | Готовые собранные видеоролики MP4. |

---

## 🔑 5. Настройка API-ключей в `.env.local`

Для запуска пакетного синтеза в `.env.local` проекта должны быть указаны ключи:
```ini
# Ключ для Google Cloud Text-to-Speech REST API:
GOOGLE_TTS_API_KEY=AIzaSy...

# Либо ключи для Gemini TTS:
GEMINI_API_KEY=AIzaSy...
GEMINI_PRIMARY_API_KEY=...
```

---

## ⚡ 6. Команды для работы

### Синтез аудио:
```bash
# Озвучить фразы Урока 2 через Google Cloud TTS:
node growth/scripts/batch_synthesize_tts.mjs --lesson=2 --engine=gcloud

# Озвучить фразы Урока 2 через Gemini TTS:
node growth/scripts/batch_synthesize_tts.mjs --lesson=2 --engine=gemini

# Озвучить все 100 уроков (1 006 фраз) пакетом с автокэшированием:
node growth/scripts/batch_synthesize_tts.mjs --all --engine=gcloud
```

### Верификация тестов и инвариантов матрицы:
```bash
# Проверка 14 инвариантов матрицы:
node --test tests/decision-matrix-invariants.test.cjs

# Полный прогон тестов:
npm test

# Аудит покрытия намерений:
npm run audit:intent
```

---

## 🎯 7. План действий для новой сессии

1. **Проверить наличие ключа:** Убедиться, что в `.env.local` прописан рабочий ключ `GOOGLE_TTS_API_KEY` или `GEMINI_API_KEY`.
2. **Запустить пакетный синтез аудио:**
   * Для пилота: `node growth/scripts/batch_synthesize_tts.mjs --lesson=2`
   * Для всей базы: `node growth/scripts/batch_synthesize_tts.mjs --all`
3. **Проверить банк аудио:** Убедиться, что файлы легли в `public/demo/audio_bank/`.
4. **Собрать видео:** Запустить конвейерный рендеринг видео на основе готовых аудиофайлов по шаблону Урока 1.
