@echo off
rem =============================================================
rem Ulpana Alef - Автоматическая генерация диалогов Gemini TTS
rem 1. Переозвучка Уроков 1-11 строго на моделях Gemini 3.8 (263 реплики)
rem 2. Добор хвостов Уроков 42 и 52 (24 реплики)
rem 3. Пакетная генерация следующих уроков (56-70)
rem =============================================================
cd /d "c:\Users\azrie\Documents\antigravity\goofy-maxwell"
if not exist "logs" mkdir "logs"
echo [%date% %time%] === Запуск утренней генерации диалогов Gemini TTS === >> "logs\gemini_dialogues_batch.log" 2>&1

rem Шаг 1: Переозвучка Уроков 1-11 строго на моделях Gemini 3.8
echo [%date% %time%] --- Шаг 1: Синтез Уроков 1-11 на Gemini 3.8 (--only-38) --- >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" --require ./tests/register.cjs scripts\generate_dialogue_audio.cjs --lessons=1-11 --engine=gemini --only-38 >> "logs\gemini_dialogues_batch.log" 2>&1

rem Шаг 2: Добор недостающих реплик Уроков 42 и 52
echo [%date% %time%] --- Шаг 2: Добор хвостов Уроков 42 и 52 --- >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" --require ./tests/register.cjs scripts\generate_dialogue_audio.cjs --lessons=42,52 --engine=gemini >> "logs\gemini_dialogues_batch.log" 2>&1

rem Шаг 3: Синтез следующих диалогов курса (Уроки 56-70)
echo [%date% %time%] --- Шаг 3: Синтез диалогов уроков 56-70 --- >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" --require ./tests/register.cjs scripts\generate_dialogue_audio.cjs --lessons=56-70 --engine=gemini >> "logs\gemini_dialogues_batch.log" 2>&1

rem Шаг 4: Проверка инвариантов
echo [%date% %time%] --- Шаг 4: Контроль инвариантов --- >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" tests\decision-matrix-invariants.test.cjs >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" tests\audio-quota-protection.test.cjs >> "logs\gemini_dialogues_batch.log" 2>&1

echo [%date% %time%] === Завершение утреннего батча диалогов === >> "logs\gemini_dialogues_batch.log" 2>&1
echo. >> "logs\gemini_dialogues_batch.log" 2>&1
