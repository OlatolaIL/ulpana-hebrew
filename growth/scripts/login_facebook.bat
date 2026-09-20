@echo off
rem =============================================================
rem Вход в Facebook для партизанского радара «Ульпан Алеф»
rem =============================================================
cd /d "c:\Users\azrie\Documents\antigravity\goofy-maxwell"
echo Открываю Google Chrome для входа в Facebook...
"C:\Users\azrie\scoop\apps\nodejs-lts\current\node.exe" growth\scripts\facebook_radar.cjs --auth
pause
