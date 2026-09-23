@echo off
rem =============================================================
rem Генератор студийного аудио 2 688 предложений Gemini 3.5 TTS
rem Запуск по расписанию: батчи по 100 предложений, повтор при пропуске
rem =============================================================
cd /d "c:\Users\azrie\Documents\antigravity\goofy-maxwell"
if not exist "logs" mkdir "logs"
echo [%date% %time%] === Запуск генерации батча Gemini 3.5 TTS (2688 предложений) === >> "logs\gemini_tts_batch.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" scripts\generate_all_gemini_sentences.cjs --limit=100 >> "logs\gemini_tts_batch.log" 2>&1
echo [%date% %time%] === Завершение работы батча === >> "logs\gemini_tts_batch.log" 2>&1
echo. >> "logs\gemini_tts_batch.log" 2>&1
