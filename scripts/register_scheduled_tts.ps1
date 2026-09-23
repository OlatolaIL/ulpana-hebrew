# scripts/register_scheduled_tts.ps1
$TaskName = "Ulpana_Sentences_GeminiTTS"
$OldTaskName = "Ulpana_MomDrills_GeminiTTS"
$ActionScript = "c:\Users\azrie\Documents\antigravity\goofy-maxwell\scripts\run_scheduled_sentences.bat"

# Remove old task if exists
$OldTask = Get-ScheduledTask -TaskName $OldTaskName -ErrorAction SilentlyContinue
if ($OldTask) {
    Unregister-ScheduledTask -TaskName $OldTaskName -Confirm:$false
    Write-Host "Old task $OldTaskName removed."
}

# Remove existing task if exists
$Existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($Existing) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
    Write-Host "Existing task $TaskName removed."
}

$Action = New-ScheduledTaskAction -Execute $ActionScript

# Trigger: Daily starting at 00:05, repeating every 1 hour for 24 hours
$Trigger = New-ScheduledTaskTrigger -Daily -At "00:05"
$Trigger.Repetition = (New-ScheduledTaskTrigger -Once -At "00:05" -RepetitionInterval (New-TimeSpan -Hours 1) -RepetitionDuration (New-TimeSpan -Days 1)).Repetition

# Settings: StartWhenAvailable = True (run immediately when PC turns on if scheduled time was missed)
$Settings = New-ScheduledTaskSettingsSet `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 45) `
    -MultipleInstances IgnoreNew

$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask `
    -TaskName $TaskName `
    -Action $Action `
    -Trigger $Trigger `
    -Settings $Settings `
    -Principal $Principal `
    -Description "Ulpana Alef - Gemini 3.5 TTS batch generation for all 2688 sentences with hourly retry"

Write-Host "Task $TaskName registered successfully."
Get-ScheduledTask -TaskName $TaskName | Format-List TaskName, State
