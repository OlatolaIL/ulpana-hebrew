@echo off
rem =============================================================
rem Генератор студийного аудио 2 688 предложений Gemini TTS
rem Трехмодельный каскад: 3.8-lite + 3.8-flash + 3.1 (до 300 фраз/сутки)
rem =============================================================
cd /d "c:\Users\azrie\Documents\antigravity\goofy-maxwell"
if not exist "logs" mkdir "logs"
echo [%date% %time%] === Запуск трехмодельной генерации Gemini TTS (до 300 фраз) === >> "logs\gemini_tts_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" scripts\generate_all_gemini_sentences.cjs --limit=300 >> "logs\gemini_tts_batch.log" 2>&1
echo [%date% %time%] === Завершение работы батча === >> "logs\gemini_tts_batch.log" 2>&1
echo. >> "logs\gemini_tts_batch.log" 2>&1
