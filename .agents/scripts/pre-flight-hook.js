#!/usr/bin/env node
/**
 * pre-flight-hook.js
 * PreInvocation hook для проекта «Ульпан Алеф».
 *
 * Срабатывает перед первым вызовом модели (invocationNum === 0).
 * Инжектирует в контекст напоминание о DECISION_MATRIX.md и Pre-Flight.
 *
 * Вход (stdin): JSON с полем invocationNum
 * Выход (stdout): JSON с injectSteps
 */

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  let payload = {};
  try { payload = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch {}

  // Инжектируем только на первом вызове модели в беседе
  if (payload.invocationNum !== 0) {
    process.stdout.write(JSON.stringify({ injectSteps: [] }));
    return;
  }

  const message = [
    '⚠️  ОБЯЗАТЕЛЬНЫЙ PRE-FLIGHT CHECKLIST — «Ульпан Алеф»',
    '',
    'Перед любым изменением кода выполни:',
    '1. Прочитай DECISION_MATRIX.md (c:\\Users\\azrie\\Documents\\antigravity\\goofy-maxwell\\DECISION_MATRIX.md)',
    '2. Выведи Intent Radar: 🟢 Активные инварианты / 🟡 Предупреждения / ⛔ Запрещённые подходы',
    '3. Только после Intent Radar — приступай к коду',
    '',
    'Критические правила без чтения матрицы:',
    '• R-16 BLOCKING: НИКОГДА не читай и не выводи .env.local полностью — там секреты!',
    '• R-17 BLOCKING: speakHebrew всегда с { rate: userProfile.speechRate || 0.7 }',
    '• R-02 BLOCKING: database.ts — только через скрипт, не вручную',
    '• R-04/R-05 BLOCKING: только כתיב מלא (полное написание)',
    '',
    'Скилл с полными инструкциями: ulpana-pre-flight',
  ].join('\n');

  process.stdout.write(JSON.stringify({
    injectSteps: [
      { ephemeralMessage: message }
    ]
  }));
});
