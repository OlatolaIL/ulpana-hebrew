@echo off
rem =============================================================
rem Генератор студийного аудио 2 688 предложений Gemini TTS
rem Трехмодельный каскад: 3.8-lite + 3.8-flash + 3.1 (до 300 фраз/сутки)
rem =============================================================
cd /d "c:\Users\azrie\Documents\antigravity\goofy-maxwell"
if not exist "logs" mkdir "logs"

rem =============================================================
rem ШАГ 1 (ПРИОРИТЕТ): Принудительная перегенерация всех фраз с «майим»
rem Исправляет баг: старые файлы были синтезированы без нормализации двойного йода
rem и произносятся «маим» вместо «майим». --force-water всегда игнорирует кэш.
rem =============================================================
echo [%date% %time%] === ШАГ 1: Перегенерация фраз с водой (маим -> майим) === >> "logs\gemini_tts_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" scripts\generate_all_gemini_sentences.cjs --force-water >> "logs\gemini_tts_batch.log" 2>&1
echo [%date% %time%] === Завершение ШАГ 1 === >> "logs\gemini_tts_batch.log" 2>&1

rem =============================================================
rem ШАГ 2: Обычный батч до 300 фраз (оставшиеся несгенерированные)
rem =============================================================
echo [%date% %time%] === ШАГ 2: Обычная генерация оставшихся фраз (до 300) === >> "logs\gemini_tts_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" scripts\generate_all_gemini_sentences.cjs --limit=300 >> "logs\gemini_tts_batch.log" 2>&1
echo [%date% %time%] === Завершение работы батча === >> "logs\gemini_tts_batch.log" 2>&1
echo. >> "logs\gemini_tts_batch.log" 2>&1
