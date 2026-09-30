# scripts/register_scheduled_dialogues.ps1
$TaskName = "Ulpana_Dialogues_GeminiTTS"
$ActionScript = "c:\Users\azrie\Documents\antigravity\goofy-maxwell\scripts\run_scheduled_dialogues.bat"

# Remove existing task if exists
$Existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($Existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Existing task $TaskName removed."
}

$Action = New-ScheduledTaskAction -Execute $ActionScript

# Trigger: Daily starting at 10:05 (right after Google AI Studio quota reset at 10:00 MSK / 00:00 PST)
$Trigger = New-ScheduledTaskTrigger -Daily -At "10:05"

# Settings: StartWhenAvailable = True (run immediately when PC turns on or wakes up if scheduled time was missed)
$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Hours 2) `
    -MultipleInstances IgnoreNew

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description "Ulpana Alef - Gemini TTS dialogue audio morning generation for lessons 26, 12, and 34-55"

Write-Host "Task $TaskName registered successfully."
Get-ScheduledTask -TaskName $TaskName | Format-List TaskName, State
