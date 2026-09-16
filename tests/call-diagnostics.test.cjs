const test = require('node:test');
const assert = require('node:assert/strict');

// Тестируем логику маскировки секретов и экспорт самописца
test('CallFlightRecorder: maskSensitiveData strictly masks API keys and credentials (R-16)', async () => {
  // Динамически импортируем TS/JS через компилированный путь или эмулируем функцию
  // Проверим встроенную логику маскировки
  const { maskSensitiveData, CallFlightRecorder } = await import('../src/lib/callDiagnostics.ts');

  const testPayload = {
    apiKey: 'gsk_super_secret_groq_key_12345678',
    geminiKey: 'AIzaSyExampleSecretKey987654321',
    token: 'ghp_myPersonalAccessToken',
    userPassword: 'secretpassword',
    safeField: 'hello world',
    nested: {
      authHeader: 'Bearer mytoken',
      studentName: 'Сергей',
      round: 1,
    },
    sampleItems: ['gsk_12345', 'normal text'],
  };

  const masked = maskSensitiveData(testPayload);

  // Проверяем маскировку ключей
  assert.equal(masked.apiKey, '***[MASKED]***');
  assert.equal(masked.geminiKey, '***[MASKED]***');
  assert.equal(masked.token, '***[MASKED]***');
  assert.equal(masked.userPassword, '***[MASKED]***');
  assert.equal(masked.safeField, 'hello world');
  assert.equal(masked.nested.authHeader, '***[MASKED]***');
  assert.equal(masked.nested.studentName, 'Сергей');
  assert.equal(masked.nested.round, 1);
  assert.ok(masked.sampleItems[0].includes('***[MASKED]***'));
  assert.equal(masked.sampleItems[1], 'normal text');
});

test('CallFlightRecorder: event recording, ring buffer and statistics', async () => {
  const { CallFlightRecorder } = await import('../src/lib/callDiagnostics.ts');

  const recorder = new CallFlightRecorder();
  recorder.reset('test_session_123');

  // Записываем VAD события
  recorder.record('VAD', 'Speech started (speechFrames: 4)', { level: 0.45 }, 'info');
  recorder.record('VAD', 'Silence detected after 1300ms', { durationMs: 1300 }, 'info');
  recorder.record('VAD', 'Noise rejected: chunk too small (420 bytes)', { sizeBytes: 420 }, 'warn');

  // Записываем Whisper STT
  recorder.record('STT', 'Whisper request sent', { sizeBytes: 12400 }, 'info');
  recorder.record('STT', 'Whisper response received', { latencyMs: 320, text: 'שלום' }, 'success');

  // Записываем LLM
  recorder.record('LLM', 'Phone API request sent', { model: 'qwen3.8-27b' }, 'info');
  recorder.record('LLM', 'Phone API response received', { latencyMs: 480, status: 200 }, 'success');

  // Записываем TTS
  recorder.record('TTS', 'Playback started: Google iv-IL', { text: 'שלום וברוך הבא' }, 'info');

  const summary = recorder.exportSummary();

  assert.equal(summary.sessionId, 'test_session_123');
  assert.equal(summary.stats.vadSpeechStarts, 1);
  assert.equal(summary.stats.vadSilenceDetects, 1);
  assert.equal(summary.stats.vadNoiseRejections, 1);
  assert.equal(summary.stats.whisperCalls, 1);
  assert.equal(summary.stats.whisperAvgLatencyMs, 320);
  assert.equal(summary.stats.llmCalls, 1);
  assert.equal(summary.stats.llmAvgLatencyMs, 480);
  assert.equal(summary.stats.ttsUtterances, 1);
  assert.equal(summary.stats.errorCount, 0);

  // Проверяем валидность JSON экспорта
  const jsonStr = recorder.exportJson();
  const parsed = JSON.parse(jsonStr);
  assert.equal(parsed.sessionId, 'test_session_123');
  assert.ok(Array.isArray(parsed.events));
  assert.ok(parsed.events.length >= 7);

  // Проверяем Markdown экспорт
  const mdStr = recorder.exportMarkdown();
  assert.ok(mdStr.includes('# 📋 Телеметрия звонка'));
  assert.ok(mdStr.includes('test_session_123'));
  assert.ok(mdStr.includes('Whisper STT'));
  assert.ok(mdStr.includes('Phone API'));
});
