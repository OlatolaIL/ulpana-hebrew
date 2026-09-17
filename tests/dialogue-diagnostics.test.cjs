const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { CallFlightRecorder, maskSensitiveData } = require('../src/lib/callDiagnostics.ts');

test('CallFlightRecorder: records dialogue lifecycle events (SYSTEM, AUDIO, STT, LLM, TTS, ERROR)', () => {
  const recorder = new CallFlightRecorder();
  recorder.reset('test_dialogue_session');

  // 1. Старт записи
  recorder.record('SYSTEM', 'Dialogue voice recording started', {
    turnIndex: 0,
    userRoleSide: 'b',
    expectedHebrew: 'שלום',
    intentRu: 'Поприветствовать собеседника',
  }, 'info');

  // 2. Аудио блоб
  recorder.record('AUDIO', 'Dialogue audio blob recorded', {
    sizeBytes: 15420,
    mimeType: 'audio/webm',
    hasUrl: true,
  }, 'info');

  // 3. Запрос и ответ Whisper STT
  recorder.record('STT', 'Dialogue Whisper STT request sent', {
    sizeBytes: 15420,
    mime: 'audio/webm',
    promptLength: 25,
  }, 'info');

  recorder.record('STT', 'Dialogue Whisper STT success (450ms)', {
    text: 'שלום מה נשמע',
    latencyMs: 450,
  }, 'success');

  // 4. Оценка LLM
  recorder.record('LLM', 'Sending turn to /api/ai/dialogue/evaluate', {
    turnIndex: 0,
    userSpokenHebrew: 'שלום מה נשמע',
    targetIntentRu: 'Поприветствовать собеседника',
  }, 'info');

  recorder.record('LLM', 'Dialogue evaluated (820ms)', {
    score: 95,
    isCorrect: true,
    assessment: 'perfect',
    feedbackRu: 'Отлично! Вас поняли.',
    latencyMs: 820,
  }, 'success');

  // 5. Озвучка оппонента (TTS)
  recorder.record('TTS', 'Opponent speech: בסדר גמור', {
    turnIndex: 1,
    speaker: 'a',
    text: 'בסדר גמור',
  }, 'info');

  const summary = recorder.exportSummary();

  assert.equal(summary.sessionId, 'test_dialogue_session');
  assert.equal(summary.events.length, 8);
  assert.equal(summary.stats.whisperCalls, 1);
  assert.equal(summary.stats.whisperAvgLatencyMs, 450);
  assert.equal(summary.stats.llmCalls, 1);
  assert.equal(summary.stats.llmAvgLatencyMs, 820);
  assert.equal(summary.stats.ttsUtterances, 1);

  const markdown = recorder.exportMarkdown();
  assert.ok(markdown.includes('# 📋 Телеметрия звонка и диалога (Flight Recorder)'));
  assert.ok(markdown.includes('test_dialogue_session'));
});

test('CallFlightRecorder: masks sensitive tokens and keys in details (R-16)', () => {
  const masked = maskSensitiveData({
    apiKey: 'gsk_supersecretkey12345',
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
    safeField: 'שלום',
  });

  assert.equal(masked.apiKey, '***[MASKED]***');
  assert.equal(masked.token, '***[MASKED]***');
  assert.equal(masked.safeField, 'שלום');
});

test('Stage 5 integration: DialogueHeader, PracticeView, and ScriptedDialogueTrainer include Смотритель', () => {
  const headerPath = path.join(__dirname, '../src/components/ScriptedDialogueTrainer/DialogueHeader.tsx');
  const practicePath = path.join(__dirname, '../src/components/ScriptedDialogueTrainer/PracticeView.tsx');
  const trainerPath = path.join(__dirname, '../src/components/ScriptedDialogueTrainer/ScriptedDialogueTrainer.tsx');
  const hookPath = path.join(__dirname, '../src/components/ScriptedDialogueTrainer/useScriptedDialogue.ts');

  const headerCode = fs.readFileSync(headerPath, 'utf8');
  const practiceCode = fs.readFileSync(practicePath, 'utf8');
  const trainerCode = fs.readFileSync(trainerPath, 'utf8');
  const hookCode = fs.readFileSync(hookPath, 'utf8');

  // Header содержит onOpenDiagnostics и кнопку «Смотритель»
  assert.ok(headerCode.includes('onOpenDiagnostics?: () => void'));
  assert.ok(headerCode.includes('Смотритель'));
  assert.ok(headerCode.includes('<Activity'));

  // PracticeView содержит onOpenDiagnostics и ссылки на Смотритель в блоке проверки и ошибок
  assert.ok(practiceCode.includes('onOpenDiagnostics?: () => void'));
  assert.ok(practiceCode.includes('onOpenDiagnostics'));
  assert.ok(practiceCode.includes('Смотритель'));

  // ScriptedDialogueTrainer содержит CallDiagnosticsModal и showDiagnostics
  assert.ok(trainerCode.includes('showDiagnostics'));
  assert.ok(trainerCode.includes('CallDiagnosticsModal'));
  assert.ok(trainerCode.includes('Смотритель диалога (Flight Recorder)'));

  // useScriptedDialogue логирует в callFlightRecorder и имеет тайм-аут предохранитель
  assert.ok(hookCode.includes("callFlightRecorder.record('SYSTEM'"));
  assert.ok(hookCode.includes("callFlightRecorder.record('AUDIO'"));
  assert.ok(hookCode.includes("callFlightRecorder.record('STT'"));
  assert.ok(hookCode.includes("callFlightRecorder.record('LLM'"));
  assert.ok(hookCode.includes('createCombinedSignal'));
  assert.ok(hookCode.includes('Dialogue evaluation safety timeout triggered'));
});
