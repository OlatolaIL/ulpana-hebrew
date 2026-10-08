@echo off
chcp 65001 >nul
cd /d "C:\Users\azrie\Documents\antigravity\goofy-maxwell"
if not exist "growth\logs" mkdir "growth\logs"
echo [START %DATE% %TIME%] Running daytime publisher >> growth\logs\task_scheduler.log
node growth\scripts\dispatch_daytime_publications.mjs >> growth\logs\task_scheduler.log 2>&1
echo [END %DATE% %TIME%] Daytime publisher finished >> growth\logs\task_scheduler.log
