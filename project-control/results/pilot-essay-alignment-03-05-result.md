# Отчёт Gemini: согласование тем сочинений уроков 3–5 с учебными целями курса (итерация 2: разделение подсказок и компонентный тест)

Дата: 14 сентября 2026 года  
Исполнитель: Gemini (middle/senior-разработчик)  
Заказчик / Ревьюер: Архитектор ChatGPT  
Проект: «Ульпан Алеф»  
Задача: `project-control/tasks/pilot-essay-alignment-03-05.md`  
Базовый коммит: `8c0cc22e3e354d4d653f925d9db3381b26fdf90a` (локальная `main`)  
Промежуточный коммит (итерация 1): `256c437ea767cb9e397662a3ab556db8cfe1bec6`  
Итоговый коммит ветки (итерация 2): `502d06584145f42cdabdb73377e1cec93ffe3e28`  
Ревью архитектора: `project-control/results/pilot-essay-alignment-03-05-review.md`  
Нормативная база: `project-control/language-standard.md`, `project-control/pilot-goal-map.md`, авторитетные лексикографические источники (Pealim, Wiktionary)

---

## 1. Окружение, ветка и коммиты

- **Базовый коммит:** `8c0cc22e3e354d4d653f925d9db3381b26fdf90a` (локальная `main`, включает уточнённое согласование прошедшего времени и обособление прилагательных).
- **Изолированная рабочая копия (worktree):** `C:\Users\azrie\Documents\antigravity\goofy-maxwell-essay-alignment`
- **Ветка задачи:** `fix/pilot-essay-alignment-03-05`
- **Коммиты ветки:**
  1. `256c437ea767cb9e397662a3ab556db8cfe1bec6` — первичная синхронизация тем 3–5 с учебной картой пилота.
  2. `502d06584145f42cdabdb73377e1cec93ffe3e28` — устранение дефекта вставки подсказок: разделение парных подсказок на отдельные кнопки в `suggestedWords`, нормативное ударение `тальмидá` и интерактивный компонентный тест в jsdom.
- **Затронутые файлы:**
  1. `src/data/essayTopics.ts` — авторские темы `BESPOKE_ESSAY_PROMPTS[3]`, `[4]`, `[5]`. Темы 1, 2 и алгоритмический фоллбэк для 6–100 сохранены без изменений.
  2. `tests/pilot-essay-alignment.test.cjs` — автоматические тесты: сохранение уроков 1–2, поведение фоллбэка, компонентный тест реального монтажа `LessonEssay` в jsdom с кликами по кнопкам шпаргалки и перехват исходящих запросов к LLM.
- **Ограничения и гарантии:**
  - Общий компонент `LessonEssay.tsx` **не модифицировался**.
  - Общие документы управления проектом (`project-control/overview.md`, `project-control/state.json`, `project-control/pilot-goal-map.md`) **не изменялись**.
  - Предыдущие рабочие копии (`goofy-maxwell-mechanics`, `goofy-maxwell-transcription`, `goofy-maxwell-essay-evaluation`) **не затрагивались**.
  - Команды `git push`, слияние в `main` и деплой **не выполнялись**.

---

## 2. Анализ дефекта и принятые решения

### 2.1. Исходное несоответствие тем уроков 3–5 (пункты 6–8 pilot-01-05-review.md)
В исходном коде темы сочинений уроков 3–5 расходились с учебными целями основных уроков:
- **Урок 3:** изучались страны, города, языки и глаголы `גָּר / גָּרָה`, `מְדַבֵּר / מְדַבֶּרֶת`, предлог `מִ / מֵ`. В теме сочинения предлагалась семья и родственники (`הַמִּשְׁפָּחָה שֶׁלִּי`), не изучавшиеся в уроке.
- **Урок 4:** изучались указательные местоимения `זֶה`, `זֹאת / זוֹ`, `אֵלֶּה`, род существительных и предметы класса. Тема сочинения была о городе и квартире (`הָעִיר שֶׁלִּי וְהַדִּירָה שֶׁלִּי`).
- **Урок 5:** изучались покупки, продукты, слитный артикль `בַּ-`, числительные и цена (`כַּמָּה זֶה עוֹלֶה`, `שְׁקָלִים`). Тема сочинения дублировала говорение о языках (`לִמּוּדִים בָּאוּלְפָּן וּשְׂפוֹת`).

### 2.2. Выявленный архитектурным ревью дефект потребителя данных (LessonEssay.tsx:422)
При ревью коммита `256c437` архитектор обнаружил, что существующий обработчик вставки в `LessonEssay.tsx:422` выполняет:
```typescript
const cleanWord = stripHebrewVowels(item.hebrew.split('/')[0].trim());
```
При наличии слэша в поле `hebrew` (например, `גָּר / גָּרָה`, `מְדַבֵּר / מְדַבֶּרֶת`, `תַּלְמִיד / תַּלְמִידָה`) вставлялась только первая форма до слэша (мужской род: `גר`, `מדבר`, `תלמיד`). Для ученицы с профилем `gender: 'female'` выбор женской формы через шпаргалку оказывался технически невозможен.

### 2.3. Реализация исправления (коммит 502d065)
1. **Разделение подсказок на отдельные кнопки:**
   В пределах установленных границ (без изменения общего компонента `LessonEssay.tsx` и соседних уроков) все парные подсказки в `BESPOKE_ESSAY_PROMPTS` уроков 3–5 разделены на самостоятельные элементы:
   - Урок 3: `גָּר` (живу м.р.) и `גָּרָה` (живу ж.р.); `מְדַבֵּר` (говорю м.р.) и `מְדַבֶּרֶת` (говорю ж.р.); `מֵאַיִן` (откуда лит.) и `מֵאֵיפֹה` (откуда разг.).
   - Урок 4: `זֶה` (это м.р.), `זֹאת` (это ж.р.), `זוֹ` (это ж.р. вариант), `אֵלֶּה` (эти мн.ч.); `מוֹרֶה` (учитель м.р.) и `מוֹרָה` (учительница ж.р.); `תַּלְמִיד` (ученик м.р.) и `תַּלְמִידָה` (ученица ж.р.).
   - Урок 5: `בַּסּוּפֶּר` (в супермаркете) и `בַּשּׁוּק` (на рынке); `שֶׁקֶל` (шекель ед.ч.) и `שְׁקָלִים` (шекели мн.ч.).
2. **Особый случай `רוֹצֶה / רוֹצָה`:**
   После удаления огласовок обе формы пишутся идентично: `רוצה`. Поэтому запись `רוֹצֶה / רוֹצָה` сохранена единым элементом; в отчёте явно зафиксировано, что она не создаёт дефекта обрезки по слэшу и не выдаётся за доказательство различия вставленного текста.
3. **Ударение `тальмидá`:**
   Устранена неточность транскрипции `תַּלְמִידָה`: ударение установлено на конечном `á` (`тальмидá`) в подсказке и в `sampleEssay`.
4. **Согласование задания и образца урока 4:**
   Формулировка `situationRu` урока 4 скорректирована так, чтобы явно называть лиц в единственном числе (учитель, ученик или ученица) и предметы в единственном и множественном числе (`אֵלֶּה כִּיסְאוֹת`), устраняя разнобой с образцом `sampleEssay`, где упоминается одна ученица (`זֹאת תַּלְמִידָה`).

---

## 3. Таблица предпосылок (Prerequisite Mapping)

| Требуемая конструкция | Где введена в уроках 1–N | Как проверяется в письменном задании | Опора в задании / методическая роль |
|---|---|---|---|
| **Урок 3: Откуда я, где живу и на каких языках говорю** | | | |
| Предлог происхождения `מִ / מֵ` | Урок 3, `grammar[0]` (`מֵרוּסְיָה`, `מִקָּנָדָה`), карточки `w3-1` (`מֵאַיִן`), `w3-2` (`מֵאֵיפֹה`) | Ученик указывает страну происхождения (`אֲנִי מֵרוּסְיָה`) | В `grammarFocusRu` дано краткое практическое напоминание («Предлог מִ/מֵ перед страной или городом»); в `suggestedWords` раздельные кнопки `מֵאַיִן` и `מֵאֵיפֹה`. |
| Глагол `לָגוּר` в настоящем времени: `גָּר / גָּרָה` | Урок 3, `grammar[0].tables[0]` (таблица спряжения), карточка `w3-3` | Согласование глагола с полом автора текста (`אֲנִי גָּר / גָּרָה בְּ...`) | Раздельные кнопки `גָּר` и `גָּרָה` в `suggestedWords`; нормативное ударение `гарá` зафиксировано в транскрипции. |
| Пространственный предлог места `בְּ-` | Урок 2 (`בְּבֵית קָפֶה`), Урок 3 (`בְּיִשְׂרָאֵל`, `בְּתֵל אָבִיב`) | Употребление перед названием страны / города (`בְּיִשְׂרָאֵל`, `בְּתֵל אָבִיב`) | Закрепление ранее введённого пространственного предлога места (идиома `בְּסֵדֶר` из урока 1 не является доказательством предлога места). |
| Глагол речи `לְדַבֵּר`: `מְדַבֵּר / מְדַבֶּרֶת` | Урок 3, карточка `w3-10` | Согласование глагола с полом автора текста (`אֲנִי מְדַבֵּר / מְדַבֶּרֶת...`) | Раздельные кнопки `מְדַבֵּר` и `מְדַבֶּרֶת` в `suggestedWords`, напоминание в `grammarFocusRu`. |
| Названия языков на `-ית` (`עִבְרִית`, `רוּסִית`, `אַנְגְּלִית`) | Урок 3, карточки `w3-7`, `w3-8`, `w3-9`, правило `grammar[0].rules[0]` | Прямое употребление после глагола речи без предлогов | В `suggestedWords` включены три базовых языка урока. |
| Наречие `קְצָת`, союз `וְ / וּ` | `קְצָת` введено в уроке 3 (`w3-11`), союз `ו` — в уроках 1–2 | Обогащение фразы (`וּקְצָת עִבְרִית`) | Кнопка `קְצָת`; нормативное чтение союза `וּ` перед шва передано как `у-кцат` по стандарту проекта. |
| **Урок 4: В классе ульпана: кто это и что это** | | | |
| Указательное местоимение м.р. `זֶה` | Урок 4, `grammar[0]`, карточка `w4-1` | Указание на предмет или лицо м.р. (`זֶה מוֹרֶה`, `זֶה סֵפֶר`, `זֶה עֵט`) | Кнопка `זֶה` в `suggestedWords`, правило в `grammarFocusRu`. |
| Указательные местоимения ж.р. `זֹאת / זוֹ` | Урок 4, `grammar[0]`, карточка `w4-2` | Указание на предмет или лицо ж.р. (`זֹאת הַכִּיתָּה`, `זֹאת מוֹרָה`, `זֹאת תַּלְמִידָה`, `זֹאת מַחְבֶּרֶת`) | Раздельные кнопки `זֹאת` и `זוֹ` в `suggestedWords`. |
| Указательное местоимение мн.ч. `אֵלֶּה` | Урок 4, `grammar[0]`, карточка `w4-3` | Указание на группу предметов (`אֵלֶּה כִּיסְאוֹת`, `אֵלֶּה תַּלְמִידִים`) | Кнопка `אֵלֶּה` в `suggestedWords`. |
| Предметы и лица класса с разным родом | Урок 4, карточки `w4-6` (`תַּלְמִיד/ה`), `w4-7` (`מוֹרֶה/ה`), `w4-8` (`סֵפֶר`), `w4-9` (`מַחְבֶּרֶת`), `w4-10` (`עֵט`), `w4-11` (`שׁוּלְחָן`), `w4-12` (`כִּיסֵּא`) | Выбор указательного слова в зависимости от рода существительного | Раздельные кнопки для всех предметов и лиц; ученик и ученица разделены на `תַּלְמִיד` и `תַּלְמִידָה`. |
| **Урок 5: Покупки на рынке и в магазине** | | | |
| Слитный артикль `בַּ-` | Урок 5, `grammar[0]` (`בְּ + הַ = בַּ`) | Употребление контекста покупки (`בַּסּוּפֶּר`, `בַּשּׁוּק`) | Раздельные кнопки `בַּסּוּפֶּר` и `בַּשּׁוּק`. |
| Вопрос о стоимости: `כַּמָּה זֶה עוֹלֶה?` | Урок 5, `grammar[0].rules[0]`, фраза `s5-1`, карточки `w5-8`, `w5-9` | Запрос цены товара (`כַּמָּה זֶה עוֹלֶה?`) | Готовая фраза `כַּמָּה זֶה עוֹלֶה` в `suggestedWords`. |
| Глагол `רוֹצֶה / רוֹצָה` | Урок 2 (`w2-1`), повторено во фразе `s5-3` | Выражение намерения купить товар | Кнопка `רוֹצֶה / רוֹצָה` (написание без огласовок идентично: `רוצה`). |
| Лексика продуктов (овощи, хлеб, сыр) | Урок 5, карточки `w5-3` (`עַגְבָנִיָּה`), `w5-4` (`מְלָפְפוֹן`), `w5-5` (`לֶחֶם`), `w5-6` (`גְּבִינָה`), `w5-10` (`קִילוֹ`), `w5-11` (`שַׂקִּית`) | Составление списка покупки | Кнопки продуктов в `suggestedWords`. |
| Числительные и форма `שְׁקָלִים` | Урок 5, `grammar[0].tables[0]`, фраза `s5-2` (`עֲשָׂרָה שְׁקָלִים`), карточка `w5-7` | Указание стоимости товара (`זֶה עוֹלֶה עֲשָׂרָה שְׁקָלִים`) | Раздельные кнопки `שֶׁקֶל` и `שְׁקָלִים`, готовое нормативное сочетание `עֲשָׂרָה שְׁקָלִים`. |

---

## 4. Языковая верификация и подтверждённые источники

В соответствии с замечаниями ревью статус каждого источника зафиксирован честно и точно:

1. **Глагол לָגוּר (жить):**
   - Источник: [Pealim: 4-lagur](https://www.pealim.com/ru/dict/4-lagur/) (страница проверена).
   - Настоящее время: м.р. `גָּר` (`гар`), ж.р. нормативное `גָּרָה` (`гарá`).
   - Ударение зафиксировано как `гар` и `гарá` на раздельных кнопках в строгом согласии с разделом 2 языкового стандарта (`project-control/language-standard.md:24-31`).
2. **Глагол לְדַבֵּר (разговаривать):**
   - Источник: [Pealim: 2-ledaber](https://www.pealim.com/ru/dict/2-ledaber/) (ID 2, страница проверена архитектором; ссылка с ID 8 отозвана как ошибочная).
   - Настоящее время: м.р. `מְדַבֵּר` (`мэдабэ́р`), ж.р. `מְדַבֶּרֶת` (`мэдабэ́рэт`).
3. **Ударение слова תַּלְמִידָה:**
   - Источник: [Wiktionary: תלמידה](https://en.wiktionary.org/wiki/תלמידה).
   - Явно подтверждает ударение на конечном слоге: `talmidá` (`тальмидá`).
   - *Честная оговорка:* это авторитетный лексикографический справочник, но не прямая проверка на сайте Академии языка иврит (ссылка со статьи Викисловаря на старый поиск Академии возвращает 404). В отчёте это зафиксировано без приписывания прямого подтверждения Академии.
4. **Статус ссылок на предметы класса (Урок 4) и продукты (Урок 5):**
   - *Честная оговорка:* страницы Pealim для `2387-kise` и `2388-shulchan`, а также для продуктов (`4854-agvaniya`, `4855-melafefon`, `4859-sakit`) не открывались в ходе текущей сессии и помечены как **непроверенные по сети**. Грамматические формы (`כִּיסֵּא` м.р. / мн.ч. `כִּיסְאוֹת`, `שׁוּלְחָן` м.р. / мн.ч. `שׁוּלְחָנוֹת`, `עֲשָׂרָה שְׁקָלִים`) соответствуют нормативной грамматике иврита и ранее проверенным урокам курса.
5. **Союз וּ перед шва:**
   - Во фразе `וּקְצָת עִבְרִית` сохранено нормативное чтение `у-кцат иврӣт` (`project-control/language-standard.md:16-23`).

---

## 5. Достижимость объёма и образцы текстов (sampleEssay)

Минимальный рекомендуемый объём для уроков 3, 4 и 5 составляет **12 слов** (`minWords: 12`).

### Урок 3:
- **Иврит:** `שָׁלוֹם! אֲנִי מֵרוּסְיָה וְעַכְשָׁו אֲנִי גָּר בְּיִשְׂרָאֵל, בְּתֵל אָבִיב. אֲנִי מְדַבֵּר רוּסִית, אַנְגְּלִית וּקְצָת עִבְרִית.`
- **Объём:** 15 слов (при нормативе 12).
- **Транскрипция:** `шалóм! анӣ мэ-Рýсья вэ-ахшáв анӣ гар бэ-Исраэ́ль, бэ-Тэль Авӣв. анӣ мэдабэ́р русӣт, англӣт у-кцат иврӣт.`
- **Перевод:** «Здравствуйте! Я из России, а сейчас я живу в Израиле, в Тель-Авиве. Я говорю по-русски, по-английски и немного на иврите. (Образец от лица мужчины; для женщины: גָּרָה, מְדַבֶּרֶת).»

### Урок 4:
- **Иврит:** `שָׁלוֹם, זֹאת הַכִּיתָּה שֶׁלִּי בָּאוּלְפָּן. זֶה מוֹרֶה וְזֹאת תַּלְמִידָה. זֶה סֵפֶר, זֹאת מַחְבֶּרֶת וְזֶה עֵט עַל הַשּׁוּלְחָן. אֵלֶּה כִּיסְאוֹת.`
- **Объём:** 19 слов (при нормативе 12).
- **Транскрипция:** `шалóм, зот hа-китá шелӣ ба-ульпáн. зэ морэ́ вэ-зот тальмидá. зэ сэ́фер, зот махбэ́рэт вэ-зэ эт аль hа-шульхáн. э́ле кис’óт.`
- **Перевод:** «Здравствуйте, это мой класс в ульпане. Это учитель, а это ученица. Это книга, это тетрадь, а это ручка на столе. Это стулья. (Образец нейтрален к полу автора; при рассказе о себе используйте תַּלְמִיד или תַּלְמִידָה).»

### Урок 5:
- **Иврит:** `הַיּוֹם אֲנִי בַּשּׁוּק. אֲנִי רוֹצֶה לֶחֶם, גְּבִינָה וְקִילוֹ עַגְבָנִיּוֹת. כַּמָּה זֶה עוֹלֶה? זֶה עוֹלֶה עֲשָׂרָה שְׁקָלִים. אֶפְשָׁר שַׂקִּית, בְּבַקָּשָׁה? תּוֹדָה!`
- **Объём:** 20 слов (при нормативе 12).
- **Транскрипция:** `hа-йом анӣ ба-шук. анӣ роцé лэ́хем, гвинá вэ-кӣло агванийóт. кáма зэ олé? зэ олé асарá шкалӣм. эфшáр сакӣт, бэвакашá? тодá!`
- **Перевод:** «Сегодня я на рынке. Я хочу хлеб, сыр и килограмм помидоров. Сколько это стоит? Это стоит десять шекелей. Можно пакет, пожалуйста? Спасибо! (Образец от лица мужчины; для женщины: רוֹצָה).»

*Важное методическое уточнение о видимости данных:*  
Поля `sampleEssay` и `topicHe` **не отображаются** в текущем интерфейсе компонента `LessonEssay.tsx`, а `sampleEssay` также **не передаётся** в запросах к LLM. Видимыми для ученика ориентирами являются `prompt.topicRu`, `prompt.situationRu`, `prompt.grammarFocusRu` и кнопки подсказок `prompt.suggestedWords`. Поэтому образец служит эталоном достаточности словаря урока и резервом для локального фоллбэка, но не направляет ученика напрямую на экране.

---

## 6. Проверка реальных потребителей данных и компонентный тест

### 6.1. Потребители данных
- **Интерфейс (`LessonEssay.tsx`):**
  - Получает тему через `getLessonEssayPrompt(lesson.id)`.
  - Заголовок и ситуация: `:370` (`topicRu`), `:376` (`situationRu`).
  - Шпаргалка: `:405` (`grammarFocusRu`), `:416–437` (`suggestedWords` как кнопки).
  - При клике на кнопку подсказки (`:422`) удаляются огласовки и берётся строка до `/`. Благодаря разделению подсказок в `suggestedWords`, клик по кнопке `גָּרָה` теперь гарантированно вставляет `גרה `, клик по `מְדַבֶּרֶת` — `מדברת `, а по `תַּלְמִידָה` — `תלמידה `.
- **Серверный маршрут (`src/app/api/ai/essay/evaluate/route.ts`):**
  - Принимает `topic` или вызывает `getLessonEssayPrompt(lessonId)`.
  - Формирует промпт для LLM с новым описанием темы и ситуации.

### 6.2. Интерактивный компонентный тест в jsdom (`tests/pilot-essay-alignment.test.cjs`)
В тест добавлен блок реального монтажа компонента через React 19 `createRoot` и `act` в окружении `jsdom` (с полифиллами `requestAnimationFrame`, `scrollIntoView` и `attachEvent`/`detachEvent`):
1. **Урок 3 (профиль ученицы `gender: 'female'`):**
   - Монтируется `<LessonEssay lesson={lesson3} userProfile={femaleProfile} ... />`.
   - Находится и нажимается кнопка «Шпаргалка».
   - Нажимается кнопка `גָּרָה` -> в поле ввода появляется `גרה `.
   - Нажимается кнопка `מְדַבֶּרֶת` -> в поле ввода становится `גרה מדברת `.
   - Нажимается кнопка мужской формы `גָּר` -> в поле ввода становится `גרה מדברת גר ` (мужская форма остаётся полностью доступной).
2. **Урок 4 (профиль ученицы `gender: 'female'`):**
   - Монтируется `<LessonEssay lesson={lesson4} userProfile={femaleProfile} ... />`.
   - Нажимается кнопка «Шпаргалка».
   - Нажимается кнопка `תַּלְמִידָה` -> в поле ввода появляется `תלמידה `.
   - Нажимается кнопка `תַּלְמִיד` -> в поле ввода становится `תלמידה תלמיד ` (обе формы работают независимо).

### 6.3. Границы автоматизированных тестов (точное указание охвата)
- Тест уроков 1–2 проверяет сохранение неизменными тем 1 и 2.
- Тест генератора фоллбэка проверяет уроки 6 и 10. *Честная оговорка:* это выборочная проверка логики генератора, а не полное поштучное доказательство неизменности всех 97 уроков. Полная побайтовая идентичность и совпадение SHA-256 для остальных 97 заданий независимо подтверждены архитектором по файлам `evidence/essay-alignment-before.json` и `evidence/essay-alignment-256c.json`.
- Тест маршрута оценивания перехватывает исходящий сетевой запрос `fetch` к API LLM для уроков 3, 4 и 5 и подтверждает попадание новых тем и отсутствие утечки старых тем (семья/квартира/учёба).

---

## 7. Результаты обязательных проверок DEVELOPMENT.md

Все проверки запущены в рабочей копии `C:\Users\azrie\Documents\antigravity\goofy-maxwell-essay-alignment` на коммите `502d06584145f42cdabdb73377e1cec93ffe3e28`:

1. **Тестовый набор (`npm test`):**
   - Команда: `node --require ./tests/register.cjs --test --test-isolation=none tests/*.test.cjs`
   - Результат: **76 тестов пройдено, 0 упало, 0 пропущено** (PASS, 4.42с).
   - Включает компонентный тест вставки в jsdom и перехват исходящих запросов к LLM.
2. **Контроль типов TypeScript (`npm run typecheck`):**
   - Команда: `next typegen && tsc --noEmit`
   - Результат: **код 0**, ошибок нет.
3. **Аудит безопасности зависимостей (`npm audit --audit-level=high`):**
   - Результат: **код 0**, `found 0 vulnerabilities`.
4. **Стандартная сборка проекта (`npm run build`):**
   - Команда: `next build --webpack`
   - Результат: **код 0**, скомпилировано успешно, сгенерированы все 33/33 статические страницы.
5. **Линтинг изменённого файла (`npx eslint src/data/essayTopics.ts`):**
   - Результат: **код 0**, 0 ошибок, 0 предупреждений.

---

## 8. Полный Git Diff ветки от базового коммита (8c0cc22..502d065)

```diff
diff --git a/src/data/essayTopics.ts b/src/data/essayTopics.ts
index f4e4a04..36f92a0 100644
--- a/src/data/essayTopics.ts
+++ b/src/data/essayTopics.ts
@@ -52,72 +52,92 @@ export const BESPOKE_ESSAY_PROMPTS: Record<number, LessonEssayPrompt> = {
     },
   },
   3: {
-    topicRu: 'Моя семья и фотографии',
-    topicHe: 'הַמִּשְׁפָּחָה שֶׁלִּי',
+    topicRu: 'Откуда я, где живу и на каких языках говорю',
+    topicHe: 'מֵאַיִן אֲנִי, אֵיפֹה אֲנִי גָּר וּבְאֵילוּ שָׂפוֹת אֲנִי מְדַבֵּר',
     situationRu:
-      'Расскажите о своей семье, показывая фотографии: кто ваши родители, есть ли у вас братья или сестры, какая у вас семья (большая или дружная).',
+      'Представьтесь новому знакомому: расскажите, из какой вы страны (מִ / מֵ), в каком городе вы живёте (גָּר / גָּרָה בְּ...), и на каких языках вы говорите (מְדַבֵּר / מְדַבֶּרֶת עִבְרִית, רוּסִית, אַנְגְּלִית).',
     grammarFocusRu:
-      'Указательные слова и согласование: Обратите внимание на выбор указательного местоимения в зависимости от мужского или женского рода предмета/лица. Прилагательное всегда следует после существительного.',
+      'Предлог מִ/מֵ перед страной или городом, предлог בְּ- для места жительства, согласование глаголов настоящего времени גָּר/גָּרָה и מְדַבֵּר/מְדַבֶּרֶת по роду автора текста (זכר / נקבה). Названия языков употребляются сразу после глагола речи без предлога.',
     minWords: 12,
     suggestedWords: [
-      { hebrew: 'מִשְׁפָּחָה', translation: 'семья', transcription: 'мишпахá' },
-      { hebrew: 'אַבָּא', translation: 'папа', transcription: 'áба' },
-      { hebrew: 'אִמָּא', translation: 'мама', transcription: 'ӣма' },
-      { hebrew: 'אָח', translation: 'брат', transcription: 'ах' },
-      { hebrew: 'אָחוֹת', translation: 'сестра', transcription: 'ахóт' },
-      { hebrew: 'זֶה / זֹאת', translation: 'это (м.р. / ж.р.)', transcription: 'зэ / зот' },
-      { hebrew: 'גָּדוֹל / גְּדוֹלָה', translation: 'большой / большая', transcription: 'гадóль / гдолá' },
+      { hebrew: 'מֵאַיִן', translation: 'откуда (лит.)', transcription: 'мэ-áйин' },
+      { hebrew: 'מֵאֵיפֹה', translation: 'откуда (разг.)', transcription: 'мэ-э́йфо' },
+      { hebrew: 'גָּר', translation: 'живу (м.р.)', transcription: 'гар' },
+      { hebrew: 'גָּרָה', translation: 'живу (ж.р.)', transcription: 'гарá' },
+      { hebrew: 'עִיר', translation: 'город (ж.р.)', transcription: 'ир' },
+      { hebrew: 'מְדִינָה', translation: 'страна', transcription: 'мэдинá' },
+      { hebrew: 'יִשְׂרָאֵל', translation: 'Израиль', transcription: 'Исраэ́ль' },
+      { hebrew: 'מְדַבֵּר', translation: 'говорю (м.р.)', transcription: 'мэдабэ́р' },
+      { hebrew: 'מְדַבֶּרֶת', translation: 'говорю (ж.р.)', transcription: 'мэдабэ́рэт' },
+      { hebrew: 'עִבְרִית', translation: 'иврит', transcription: 'иврӣт' },
+      { hebrew: 'רוּסִית', translation: 'русский язык', transcription: 'русӣт' },
+      { hebrew: 'אַנְגְּלִית', translation: 'английский язык', transcription: 'англӣт' },
+      { hebrew: 'קְצָת', translation: 'немного, чуть-чуть', transcription: 'кцат' },
     ],
     sampleEssay: {
-      hebrew: 'זֹאת הַמִּשְׁפָּחָה שֶׁלִּי. זֶה אַבָּא שֶׁלִּי וְזֹאת אִמָּא שֶׁלִּי. יֵשׁ לִי אָח גָּדוֹל וְאָחוֹת קְטַנָּה. זֹאת מִשְׁפָּחָה יָפָה וּנְחְמָדָה מְאוֹד.',
-      transcription: 'зот hа-мишпахá шелӣ. зэ áба шелӣ вэ-зот ӣма шелӣ. йеш ли ах гадóль вэ-ахóт ктанá. зот мишпахá яфá у-нэхмадá мэóд.',
-      translation: 'Это моя семья. Это мой папа, а это моя мама. У меня есть старший брат и младшая сестра. Это красивая и очень приятная семья.',
+      hebrew: 'שָׁלוֹם! אֲנִי מֵרוּסְיָה וְעַכְשָׁו אֲנִי גָּר בְּיִשְׂרָאֵל, בְּתֵל אָבִיב. אֲנִי מְדַבֵּר רוּסִית, אַנְגְּלִית וּקְצָת עִבְרִית.',
+      transcription: 'шалóм! анӣ мэ-Рýсья вэ-ахшáв анӣ гар бэ-Исраэ́ль, бэ-Тэль Авӣв. анӣ мэдабэ́р русӣт, англӣт у-кцат иврӣт.',
+      translation:
+        'Здравствуйте! Я из России, а сейчас я живу в Израиле, в Тель-Авиве. Я говорю по-русски, по-английски и немного на иврите. (Образец написан от лица мужчины; для женщины: גָּרָה, מְדַבֶּרֶת).',
     },
   },
   4: {
-    topicRu: 'Мой город и моя квартира',
-    topicHe: 'הָעִיר שֶׁלִּי וְהַדִּירָה שֶׁלִּי',
+    topicRu: 'В классе ульпана: кто это и что это',
+    topicHe: 'בַּכִּיתָּה בָּאוּלְפָּן: מִי זֶה וּמַה זֶּה',
     situationRu:
-      'Опишите город, в котором вы живёте, вашу улицу и квартиру: уютная ли она, что находится рядом.',
+      'Вы находитесь в классе ульпана. Опишите людей и предметы вокруг себя: назовите учителя, ученика или ученицу (זֶה מוֹרֶה, זֹאת תַּלְמִידָה / מַחְבֶּרֶת), а также предметы в классе или на столе в единственном и множественном числе, используя правильные указательные слова זֶה (м.р.), זֹאת / זוֹ (ж.р.) и אֵלֶּה (мн.ч.).',
     grammarFocusRu:
-      'Слитные предлоги и род: Не забывайте слитный предлог направления и места «в». Помните о грамматическом роде слов «город» и «квартира» при согласовании с прилагательными.',
+      'Указательные местоимения и род: זֶה (мужской род: סֵפֶר, עֵט, שׁוּלְחָן, מוֹרֶה), זֹאת или זוֹ (женский род: מַחְבֶּרֶת, מוֹרָה, תַּלְמִידָה), אֵלֶּה (множественное число: תַּלְמִידִים, סְפָרִים). Помните о грамматическом роде существительных при выборе указательного слова.',
     minWords: 12,
     suggestedWords: [
-      { hebrew: 'גָּר / גָּרָה', translation: 'живу (м.р. / ж.р.)', transcription: 'гар / гáра' },
-      { hebrew: 'עִיר', translation: 'город (ж.р.!)', transcription: 'ир' },
-      { hebrew: 'דִּירָה', translation: 'квартира (ж.р.)', transcription: 'дирá' },
-      { hebrew: 'רְחוֹב', translation: 'улица (м.р.)', transcription: 'рэхóв' },
-      { hebrew: 'יָפֶה / יָפָה', translation: 'красивый / красивая', transcription: 'яфэ́ / яфá' },
-      { hebrew: 'קָטָן / קְטַנָּה', translation: 'маленький / маленькая', transcription: 'катáн / ктанá' },
-      { hebrew: 'נֶחְמָד / נֶחְמָדָה', translation: 'симпатичный / милая', transcription: 'нэхмáд / нэхмадá' },
+      { hebrew: 'זֶה', translation: 'это (м.р.)', transcription: 'зэ' },
+      { hebrew: 'זֹאת', translation: 'это (ж.р.)', transcription: 'зот' },
+      { hebrew: 'זוֹ', translation: 'это (ж.р., вариант)', transcription: 'зу' },
+      { hebrew: 'אֵלֶּה', translation: 'эти (мн.ч.)', transcription: 'э́ле' },
+      { hebrew: 'מוֹרֶה', translation: 'учитель (м.р.)', transcription: 'морэ́' },
+      { hebrew: 'מוֹרָה', translation: 'учительница (ж.р.)', transcription: 'морá' },
+      { hebrew: 'תַּלְמִיד', translation: 'ученик (м.р.)', transcription: 'тальмӣд' },
+      { hebrew: 'תַּלְמִידָה', translation: 'ученица (ж.р.)', transcription: 'тальмидá' },
+      { hebrew: 'סֵפֶר', translation: 'книга (м.р.)', transcription: 'сэ́фер' },
+      { hebrew: 'מַחְבֶּרֶת', translation: 'тетрадь (ж.р.)', transcription: 'махбэ́рэт' },
+      { hebrew: 'עֵט', translation: 'ручка (м.р.)', transcription: 'эт' },
+      { hebrew: 'שׁוּלְחָן', translation: 'стол (м.р.)', transcription: 'шульхáн' },
+      { hebrew: 'כִּיסֵּא', translation: 'стул (м.р.)', transcription: 'кисэ́' },
     ],
     sampleEssay: {
-      hebrew: 'אֲנִי גָּר בְּתֵל אָבִיב. תֵּל אָבִיב זֹאת עִיר יָפָה מְאוֹד. יֵשׁ לִי דִּירָה קְטַנָּה בִּרְחוֹב נֶחְמָד וְשֶׁקֶט.',
-      transcription: 'анӣ гар бэ-Тель Авӣв. Тель Авӣв зот ир яфá мэóд. йеш ли дирá ктанá би-рхóв нэхмáд вэ-шэ́кет.',
-      translation: 'Я живу в Тель-Авиве. Тель-Авив — это очень красивый город. У меня есть маленькая квартира на приятной и тихой улице.',
+      hebrew: 'שָׁלוֹם, זֹאת הַכִּיתָּה שֶׁלִּי בָּאוּלְפָּן. זֶה מוֹרֶה וְזֹאת תַּלְמִידָה. זֶה סֵפֶר, זֹאת מַחְבֶּרֶת וְזֶה עֵט עַל הַשּׁוּלְחָן. אֵלֶּה כִּיסְאוֹת.',
+      transcription: 'шалóм, зот hа-китá шелӣ ба-ульпáн. зэ морэ́ вэ-зот тальмидá. зэ сэ́фер, зот махбэ́рэт вэ-зэ эт аль hа-шульхáн. э́ле кис’óт.',
+      translation:
+        'Здравствуйте, это мой класс в ульпане. Это учитель, а это ученица. Это книга, это тетрадь, а это ручка на столе. Это стулья. (Образец нейтрален к полу автора и подходит для ученика любого пола; при рассказе о себе используйте תַּלְמִיד или תַּלְמִידָה).',
     },
   },
   5: {
-    topicRu: 'Учёба в ульпане и языки',
-    topicHe: 'לִמּוּדִים בָּאוּלְפָּן וּשְׂפוֹת',
+    topicRu: 'Покупки на рынке и в магазине',
+    topicHe: 'קְנִיּוֹת בַּשּׁוּק וּבַסּוּפֶּרְמַרְקֶט',
     situationRu:
-      'Расскажите о своих занятиях в ульпане: на каких языках вы говорите, почему вы учите иврит и нравится ли вам класс.',
+      'Напишите короткую записку или заказ продуктов: что вы хотите купить в супермаркете или на рынке (хлеб, сыр, овощи), укажите количество или спросите цену (כַּמָּה זֶה עוֹלֶה), используя слитный артикль (בַּסּוּפֶּר, בַּשּׁוּק).',
     grammarFocusRu:
-      'Управление глаголов речи: Название языка употребляется сразу после глагола речи без лишних предлогов. Отрицание ставьте перед глаголом. Помните о грамматическом роде слова «язык».',
-    minWords: 14,
+      'Определенный артикль הַ- и слитные предлоги בַּ- (в магазине / на рынке). Вопрос о цене: כַּמָּה זֶה עוֹלֶה?. Числительные 1–10, согласование глагола רוֹצֶה / רוֹצָה по роду автора и форма שְׁקָלִים (например, עֲשָׂרָה שְׁקָלִים).',
+    minWords: 12,
     suggestedWords: [
-      { hebrew: 'לוֹמֵד / לוֹמֶדֶת', translation: 'учу / учусь', transcription: 'ломэ́д / ломэ́дэт' },
-      { hebrew: 'מְדַבֵּר / מְדַבֶּרֶת', translation: 'говорю', transcription: 'мэдабэ́р / мэдабэ́рэт' },
-      { hebrew: 'עִבְרִית', translation: 'иврит', transcription: 'иврӣт' },
-      { hebrew: 'רוּסִית', translation: 'русский язык', transcription: 'русӣт' },
-      { hebrew: 'אַנְגְּלִית', translation: 'английский язык', transcription: 'англӣт' },
-      { hebrew: 'שָׂפָה', translation: 'язык (ж.р.)', transcription: 'сафá' },
-      { hebrew: 'כִּיתָּה', translation: 'класс / аудитория', transcription: 'китá' },
+      { hebrew: 'בַּסּוּפֶּר', translation: 'в супермаркете', transcription: 'ба-су́пер' },
+      { hebrew: 'בַּשּׁוּק', translation: 'на рынке', transcription: 'ба-шук' },
+      { hebrew: 'רוֹצֶה / רוֹצָה', translation: 'хочу (м.р. / ж.р.)', transcription: 'роцé / роцá' },
+      { hebrew: 'לֶחֶם', translation: 'хлеб', transcription: 'лэ́хем' },
+      { hebrew: 'גְּבִינָה', translation: 'сыр', transcription: 'гвинá' },
+      { hebrew: 'עַגְבָנִיָּה', translation: 'помидор (мн.ч. עַגְבָנִיּוֹת)', transcription: 'агвания́' },
+      { hebrew: 'מְלָפְפוֹן', translation: 'огурец (мн.ч. מְלָפְפוֹנִים)', transcription: 'мэлафэфóн' },
+      { hebrew: 'כַּמָּה זֶה עוֹלֶה', translation: 'сколько это стоит?', transcription: 'кáма зэ олé' },
+      { hebrew: 'שֶׁקֶל', translation: 'шекель (ед.ч.)', transcription: 'шэ́кель' },
+      { hebrew: 'שְׁקָלִים', translation: 'шекели (мн.ч.)', transcription: 'шкалӣм' },
+      { hebrew: 'עֲשָׂרָה שְׁקָלִים', translation: 'десять шекелей', transcription: 'асарá шкалӣм' },
+      { hebrew: 'שַׂקִּית', translation: 'пакет', transcription: 'сакӣт' },
     ],
     sampleEssay: {
-      hebrew: 'אֲנִי מְדַבֵּר רוּסִית וְאַנְגְּלִית, וְעַכְשָׁו אֲנִי לוֹמֵד עִבְרִית בָּאוּלְפָּן. עִבְרִית זֹאת שָׂפָה מְעַנְיֶנֶת וְיָפָה. יֵשׁ לָנוּ מוֹרֶה מְצֻיָּן בַּכִּיתָּה.',
-      transcription: 'анӣ мэдабэ́р русӣт вэ-англӣт, вэ-ахшáв анӣ ломэ́д иврӣт ба-ульпáн. иврӣт зот сафá мэаньенэт вэ-яфá. йеш лáну морé мэцуян ба-китá.',
-      translation: 'Я говорю по-русски и по-английски, а сейчас учу иврит в ульпане. Иврит — это интересный и красивый язык. У нас отличный учитель в классе.',
+      hebrew: 'הַיּוֹם אֲנִי בַּשּׁוּק. אֲנִי רוֹצֶה לֶחֶם, גְּבִינָה וְקִילוֹ עַגְבָנִיּוֹת. כַּמָּה זֶה עוֹלֶה? זֶה עוֹלֶה עֲשָׂרָה שְׁקָלִים. אֶפְשָׁר שַׂקִּית, בְּבַקָּשָׁה? תּוֹדָה!',
+      transcription: 'hа-йом анӣ ба-шук. анӣ роцé лэ́хем, гвинá вэ-кӣло агванийóт. кáма зэ олé? зэ олé асарá шкалӣм. эфшáр сакӣт, бэвакашá? тодá!',
+      translation:
+        'Сегодня я на рынке. Я хочу хлеб, сыр и килограмм помидоров. Сколько это стоит? Это стоит десять шекелей. Можно пакет, пожалуйста? Спасибо! (Образец написан от лица мужчины; для женщины: רוֹצָה).',
     },
   },
 };
diff --git a/tests/pilot-essay-alignment.test.cjs b/tests/pilot-essay-alignment.test.cjs
new file mode 100644
index 0000000..e73d34a
--- /dev/null
+++ b/tests/pilot-essay-alignment.test.cjs
@@ -0,0 +1,345 @@
+/* eslint-disable @typescript-eslint/no-require-imports */
+const test = require('node:test');
+const assert = require('node:assert/strict');
+const { NextRequest } = require('next/server');
+const React = require('react');
+const { createRoot } = require('react-dom/client');
+const { act } = require('react');
+const { JSDOM } = require('jsdom');
+
+const { BESPOKE_ESSAY_PROMPTS, getLessonEssayPrompt } = require('../src/data/essayTopics.ts');
+const { getLessonById } = require('../src/data/lessonsData.ts');
+const { createSessionToken } = require('../src/lib/auth.ts');
+const { LessonEssay } = require('../src/components/LessonEssay/LessonEssay.tsx');
+
+test('BESPOKE_ESSAY_PROMPTS preserves lessons 1 and 2 intact', () => {
+  const prompt1 = BESPOKE_ESSAY_PROMPTS[1];
+  assert.ok(prompt1, 'Lesson 1 bespoke prompt must exist');
+  assert.equal(prompt1.topicRu, 'Знакомство и первые приветствия');
+  assert.equal(prompt1.minWords, 8);
+  assert.ok(prompt1.sampleEssay.hebrew.includes('דָּנִיאֵל'));
+
+  const prompt2 = BESPOKE_ESSAY_PROMPTS[2];
+  assert.ok(prompt2, 'Lesson 2 bespoke prompt must exist');
+  assert.equal(prompt2.topicRu, 'Мой заказ в кафе');
+  assert.equal(prompt2.minWords, 10);
+  assert.ok(prompt2.sampleEssay.hebrew.includes('בְּבֵית קָפֶה'));
+});
+
+test('getLessonEssayPrompt maintains fallbacks for lessons beyond bespoke 1-5', () => {
+  assert.equal(BESPOKE_ESSAY_PROMPTS[6], undefined, 'Lesson 6 should not have a bespoke prompt');
+  const prompt6 = getLessonEssayPrompt(6);
+  assert.ok(prompt6, 'Lesson 6 must generate a fallback prompt');
+  assert.ok(prompt6.topicRu.startsWith('Рассказ по теме:'));
+  assert.ok(prompt6.suggestedWords.length > 0);
+
+  const prompt10 = getLessonEssayPrompt(10);
+  assert.equal(prompt10.minWords, 10);
+});
+
+function setupDom() {
+  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="root"></div></body></html>', {
+    url: 'http://localhost/',
+    pretendToBeVisual: true,
+  });
+
+  const savedWindow = global.window;
+  const savedDocument = global.document;
+  const savedNavigator = global.navigator;
+  const savedHTMLElement = global.HTMLElement;
+  const savedElement = global.Element;
+  const savedNode = global.Node;
+  const savedHTMLTextArea = global.HTMLTextAreaElement;
+  const savedActEnv = global.IS_REACT_ACT_ENVIRONMENT;
+  const savedAddEvent = global.addEventListener;
+  const savedRemoveEvent = global.removeEventListener;
+  const savedRaf = global.requestAnimationFrame;
+  const savedCaf = global.cancelAnimationFrame;
+
+  global.window = dom.window;
+  global.document = dom.window.document;
+  global.navigator = dom.window.navigator;
+  global.HTMLElement = dom.window.HTMLElement;
+  global.Element = dom.window.Element;
+  global.Node = dom.window.Node;
+  global.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
+  global.IS_REACT_ACT_ENVIRONMENT = true;
+  global.addEventListener = dom.window.addEventListener.bind(dom.window);
+  global.removeEventListener = dom.window.removeEventListener.bind(dom.window);
+
+  dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
+  dom.window.cancelAnimationFrame = (id) => clearTimeout(id);
+  global.requestAnimationFrame = dom.window.requestAnimationFrame;
+  global.cancelAnimationFrame = dom.window.cancelAnimationFrame;
+
+  dom.window.Element.prototype.scrollIntoView = () => {};
+  dom.window.scrollTo = () => {};
+  dom.window.Element.prototype.attachEvent = () => {};
+  dom.window.Element.prototype.detachEvent = () => {};
+
+  const container = dom.window.document.getElementById('root');
+  const root = createRoot(container);
+
+  const cleanup = async () => {
+    await act(async () => {
+      root.unmount();
+    });
+    global.window = savedWindow;
+    global.document = savedDocument;
+    global.navigator = savedNavigator;
+    global.HTMLElement = savedHTMLElement;
+    global.Element = savedElement;
+    global.Node = savedNode;
+    global.HTMLTextAreaElement = savedHTMLTextArea;
+    global.IS_REACT_ACT_ENVIRONMENT = savedActEnv;
+    global.addEventListener = savedAddEvent;
+    global.removeEventListener = savedRemoveEvent;
+    global.requestAnimationFrame = savedRaf;
+    global.cancelAnimationFrame = savedCaf;
+  };
+
+  return { dom, container, root, cleanup };
+}
+
+test('interactive LessonEssay component in jsdom: opening cheat sheet and selecting female or male verb and noun forms (Lessons 3 and 4)', async () => {
+  const femaleProfile = {
+    gender: 'female',
+    lessonProgress: {},
+    aiProvider: 'groq',
+  };
+
+  // --- 1. LESSON 3: Female and male living and speaking verbs ---
+  {
+    const { container, root, cleanup } = setupDom();
+    try {
+      const lesson3 = getLessonById(3);
+      await act(async () => {
+        root.render(
+          React.createElement(LessonEssay, {
+            lesson: lesson3,
+            userProfile: femaleProfile,
+            onCompleted: () => {},
+            onUpdateProfile: () => {},
+          })
+        );
+      });
+
+      const getButtons = () => Array.from(container.querySelectorAll('button'));
+      const cheatSheetBtn = getButtons().find(
+        (b) => b.textContent && b.textContent.includes('шпаргалк') || (b.textContent && b.textContent.includes('Шпаргалк'))
+      );
+      assert.ok(cheatSheetBtn, 'Cheat sheet toggle button must be rendered');
+
+      await act(async () => {
+        cheatSheetBtn.click();
+      });
+
+      const textarea = container.querySelector('textarea');
+      assert.ok(textarea, 'Textarea must be rendered');
+      assert.equal(textarea.value, '', 'Textarea starts empty');
+
+      // Female student clicks female verb gara
+      const femaleGaraBtn = getButtons().find(
+        (b) => b.textContent && b.textContent.includes('גָּרָה')
+      );
+      assert.ok(femaleGaraBtn, 'Female gara button must be present in cheat sheet');
+
+      await act(async () => {
+        femaleGaraBtn.click();
+      });
+      assert.equal(textarea.value, 'גרה ', 'Clicking female gara must insert unpointed feminine form "גרה "');
+
+      // Female student clicks female verb medaberet
+      const femaleMedaberetBtn = getButtons().find(
+        (b) => b.textContent && b.textContent.includes('מְדַבֶּרֶת')
+      );
+      assert.ok(femaleMedaberetBtn, 'Female medaberet button must be present');
+
+      await act(async () => {
+        femaleMedaberetBtn.click();
+      });
+      assert.equal(
+        textarea.value,
+        'גרה מדברת ',
+        'Clicking female medaberet must insert unpointed feminine form "מדברת "'
+      );
+
+      // Male options remain available and functional
+      const maleGarBtn = getButtons().find(
+        (b) => b.textContent && b.textContent.includes('גָּר') && !b.textContent.includes('גָּרָה')
+      );
+      assert.ok(maleGarBtn, 'Male gar button must remain available');
+
+      await act(async () => {
+        maleGarBtn.click();
+      });
+      assert.equal(
+        textarea.value,
+        'גרה מדברת גר ',
+        'Clicking male gar must insert unpointed masculine form "גר "'
+      );
+    } finally {
+      await cleanup();
+    }
+  }
+
+  // --- 2. LESSON 4: Female and male student nouns ---
+  {
+    const { container, root, cleanup } = setupDom();
+    try {
+      const lesson4 = getLessonById(4);
+      await act(async () => {
+        root.render(
+          React.createElement(LessonEssay, {
+            lesson: lesson4,
+            userProfile: femaleProfile,
+            onCompleted: () => {},
+            onUpdateProfile: () => {},
+          })
+        );
+      });
+
+      const getButtons = () => Array.from(container.querySelectorAll('button'));
+      const cheatSheetBtn = getButtons().find(
+        (b) => b.textContent && b.textContent.includes('шпаргалк') || (b.textContent && b.textContent.includes('Шпаргалк'))
+      );
+      assert.ok(cheatSheetBtn, 'Cheat sheet toggle button must be rendered for Lesson 4');
+
+      await act(async () => {
+        cheatSheetBtn.click();
+      });
+
+      const textarea = container.querySelector('textarea');
+      assert.ok(textarea, 'Textarea must be rendered for Lesson 4');
+
+      // Female student clicks talmida
+      const femaleTalmidaBtn = getButtons().find(
+        (b) => b.textContent && b.textContent.includes('תַּלְמִידָה')
+      );
+      assert.ok(femaleTalmidaBtn, 'Female talmida button must be present in Lesson 4');
+
+      await act(async () => {
+        femaleTalmidaBtn.click();
+      });
+      assert.equal(
+        textarea.value,
+        'תלמידה ',
+        'Clicking female talmida must insert unpointed feminine form "תלמידה "'
+      );
+
+      // Male student clicks talmid
+      const maleTalmidBtn = getButtons().find(
+        (b) => b.textContent && b.textContent.includes('תַּלְמִיד') && !b.textContent.includes('תַּלְמִידָה')
+      );
+      assert.ok(maleTalmidBtn, 'Male talmid button must remain available');
+
+      await act(async () => {
+        maleTalmidBtn.click();
+      });
+      assert.equal(
+        textarea.value,
+        'תלמידה תלמיד ',
+        'Clicking male talmid must insert unpointed masculine form "תלמיד "'
+      );
+    } finally {
+      await cleanup();
+    }
+  }
+});
+
+test('essay evaluation route uses aligned prompts 3-5 in outbound LLM requests', async () => {
+  const { POST } = require('../src/app/api/ai/essay/evaluate/route.ts');
+  const interceptedRequests = [];
+  const savedFetch = global.fetch;
+  const savedGroq = process.env.GROQ_API_KEY;
+  const savedSecret = process.env.JWT_SECRET;
+
+  process.env.GROQ_API_KEY = 'synthetic-key';
+  process.env.JWT_SECRET = 'test-only-session-secret-not-for-deployment-123456';
+
+  try {
+    const token = await createSessionToken({ id: 'student-test', name: 'student', subscriptionTier: 'free' });
+    const authHeaders = {
+      'content-type': 'application/json',
+      cookie: 'ulpana_session=' + token,
+    };
+
+    global.fetch = async (url, options) => {
+      interceptedRequests.push({
+        url: String(url),
+        body: JSON.parse(options.body),
+      });
+      return new Response(JSON.stringify({ error: 'outage' }), {
+        status: 503,
+        headers: { 'content-type': 'application/json' },
+      });
+    };
+
+    // Test lesson 3
+    const req3 = new NextRequest('http://localhost/api/ai/essay/evaluate', {
+      method: 'POST',
+      headers: authHeaders,
+      body: JSON.stringify({
+        lessonId: 3,
+        userEssay: 'אני גר בישראל ואני מדבר עברית ורוסית.',
+        userGender: 'male',
+      }),
+    });
+    await POST(req3);
+
+    assert.equal(interceptedRequests.length, 1);
+    const call3 = interceptedRequests[0];
+    const userPrompt3 = call3.body.messages.find((m) => m.role === 'user')?.content || '';
+    assert.ok(userPrompt3.includes('Откуда я, где живу и на каких языках говорю'));
+    assert.ok(userPrompt3.includes('Представьтесь новому знакомому'));
+    assert.ok(!userPrompt3.includes('Моя семья и фотографии'), 'Old family prompt must not leak');
+
+    // Test lesson 4
+    const req4 = new NextRequest('http://localhost/api/ai/essay/evaluate', {
+      method: 'POST',
+      headers: authHeaders,
+      body: JSON.stringify({
+        lessonId: 4,
+        userEssay: 'זה מורה וזאת תלמידה בכיתה.',
+        userGender: 'male',
+      }),
+    });
+    await POST(req4);
+
+    assert.equal(interceptedRequests.length, 2);
+    const call4 = interceptedRequests[1];
+    const userPrompt4 = call4.body.messages.find((m) => m.role === 'user')?.content || '';
+    assert.ok(userPrompt4.includes('В классе ульпана: кто это и что это'));
+    assert.ok(!userPrompt4.includes('Мой город и моя квартира'), 'Old apartment prompt must not leak');
+
+    // Test lesson 5
+    const req5 = new NextRequest('http://localhost/api/ai/essay/evaluate', {
+      method: 'POST',
+      headers: authHeaders,
+      body: JSON.stringify({
+        lessonId: 5,
+        userEssay: 'אני בשוק ורוצה לקנות עגבניות.',
+        userGender: 'female',
+      }),
+    });
+    await POST(req5);
+
+    assert.equal(interceptedRequests.length, 3);
+    const call5 = interceptedRequests[2];
+    const userPrompt5 = call5.body.messages.find((m) => m.role === 'user')?.content || '';
+    assert.ok(userPrompt5.includes('Покупки на рынке и в магазине'));
+    assert.ok(!userPrompt5.includes('Учёба в ульпане и языки'), 'Old study prompt must not leak');
+  } finally {
+    global.fetch = savedFetch;
+    if (savedGroq !== undefined) {
+      process.env.GROQ_API_KEY = savedGroq;
+    } else {
+      delete process.env.GROQ_API_KEY;
+    }
+    if (savedSecret !== undefined) {
+      process.env.JWT_SECRET = savedSecret;
+    } else {
+      delete process.env.JWT_SECRET;
+    }
+  }
+});
```

---

## 9. Заключение

Все замечания архитектурного ревью полностью устранены:
- Парные подсказки уроков 3–5 разделены на индивидуальные кнопки в `suggestedWords`, обеспечивая корректную вставку женских (`גרה`, `מדברת`, `תלמיда`) и мужских (`גר`, `מדבר`, `תלמיד`) форм при неизменном общем компоненте `LessonEssay.tsx`;
- Написание `רוֹצֶה / רוֹצָה` сохранено с пониманием идентичности формы без огласовок (`רוצה`);
- Ударение `тальмидá` скорректировано и подтверждено словарной статьёй Викисловаря (без необоснованной ссылки на Академию);
- Ссылка на Pealim для глагола `לְדַבֵּר` исправлена на подтверждённую `2-ledaber` (ID 2), а непроверенные ссылки честно обозначены;
- В таблице предпосылок указаны реальные пространственные примеры (`בְּבֵית קָפֶה`, `בְּיִשְׂרָאֵל`, `בְּתֵל אָבִיב`), убрано утверждение о подробном правиле гортанных;
- Настоящий монтаж компонента в jsdom проверен автоматическим тестом;
- Все 5 обязательных технических проверок пройдены со статусом PASS.

Коммит `502d06584145f42cdabdb73377e1cec93ffe3e28` в ветке `fix/pilot-essay-alignment-03-05` рабочей копии `goofy-maxwell-essay-alignment` готов к приёмке.
