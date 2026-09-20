@echo off
rem =============================================================
rem Партизанский радар Facebook «Ульпан Алеф» (Запуск по расписанию)
rem =============================================================
cd /d "c:\Users\azrie\Documents\antigravity\goofy-maxwell"
if not exist "growth\data\logs" mkdir "growth\data\logs"
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" growth\scripts\facebook_radar.cjs --scan >> "growth\data\logs\fb_radar.log" 2>&1
