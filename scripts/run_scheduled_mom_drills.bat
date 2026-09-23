@echo off
rem =============================================================
rem Генератор студийного аудио «Мамы Израиля» Gemini 3.5 TTS
rem Запуск по расписанию: батчи до 100 фраз, повтор при пропуске
rem =============================================================
cd /d "c:\Users\azrie\Documents\antigravity\goofy-maxwell"
if not exist "logs" mkdir "logs"
echo [%date% %time%] === Запуск генерации батча Gemini 3.5 TTS === >> "logs\gemini_tts_mom_drills.log" 2>&1
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" scripts\generate_mom_drills_gemini.cjs --limit=100 >> "logs\gemini_tts_mom_drills.log" 2>&1
echo [%date% %time%] === Завершение работы батча === >> "logs\gemini_tts_mom_drills.log" 2>&1
echo. >> "logs\gemini_tts_mom_drills.log" 2>&1
