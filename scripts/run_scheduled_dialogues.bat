@echo off
rem =============================================================
rem Ulpana Alef - Автоматическая генерация диалогов Gemini TTS
rem 1. Доозвучка хвоста Урока 26 (20 реплик)
rem 2. Выравнивание Урока 12 (--fix-mixed, 11 реплик)
rem 3. Пакетная генерация следующих уроков (34-55)
rem =============================================================
cd /d "c:\Users\azrie\Documents\antigravity\goofy-maxwell"
if not exist "logs" mkdir "logs"
echo [%date% %time%] === Запуск утренней генерации диалогов Gemini TTS === >> "logs\gemini_dialogues_batch.log" 2>&1

rem Шаг 1: Завершение Урока 26 (добор 20 реплик)
echo [%date% %time%] --- Шаг 1: Добор реплик Урока 26 --- >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" --require ./tests/register.cjs scripts\generate_dialogue_audio.cjs --lesson=26 --engine=gemini >> "logs\gemini_dialogues_batch.log" 2>&1

rem Шаг 2: Выравнивание модели Урока 12 (11 реплик под gemini-3.8-flash-tts)
echo [%date% %time%] --- Шаг 2: Выравнивание модели Урока 12 --- >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" --require ./tests/register.cjs scripts\generate_dialogue_audio.cjs --lesson=12 --engine=gemini --fix-mixed >> "logs\gemini_dialogues_batch.log" 2>&1

rem Шаг 3: Синтез следующих диалогов курса (Уроки 34-55)
echo [%date% %time%] --- Шаг 3: Синтез диалогов уроков 34-55 --- >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" --require ./tests/register.cjs scripts\generate_dialogue_audio.cjs --lessons=34-55 --engine=gemini >> "logs\gemini_dialogues_batch.log" 2>&1

rem Шаг 4: Проверка инвариантов
echo [%date% %time%] --- Шаг 4: Контроль инвариантов --- >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" tests\decision-matrix-invariants.test.cjs >> "logs\gemini_dialogues_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" tests\audio-quota-protection.test.cjs >> "logs\gemini_dialogues_batch.log" 2>&1

echo [%date% %time%] === Завершение утреннего батча диалогов === >> "logs\gemini_dialogues_batch.log" 2>&1
echo. >> "logs\gemini_dialogues_batch.log" 2>&1
