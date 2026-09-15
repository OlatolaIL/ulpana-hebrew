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
    '🚨 ОБЯЗАТЕЛЬНЫЙ ЗАКОН ПРОЕКТА «УЛЬПАН АЛЕФ» (БЕЗУСЛОВНЫЙ ПРИОРИТЕТ) 🚨',
    '',
    'Ты ОБЯЗАН начать свою работу с чтения матрицы решений и вывода Intent Radar.',
    'Это правило действует ВСЕГДА: на ЛЮБОЙ запрос — вопрос («почему возникла проблема»), анализ, аудит, отладку, диагностику или изменение кода!',
    '',
    'ТВОЙ ОБЯЗАТЕЛЬНЫЙ ПЕРВЫЙ ШАГ:',
    '1. Открыть и прочитать DECISION_MATRIX.md через view_file (c:\\Users\\azrie\\Documents\\antigravity\\goofy-maxwell\\DECISION_MATRIX.md).',
    '2. Вывести в первом ответе визуальный блок Intent Radar:',
    '   🟢 Активные инварианты (какие правила матрицы R-01..R-17 относятся к теме запроса)',
    '   🟡 Предупреждения / Advisory',
    '   ⛔ Отмененные подходы (из Superseded Log матрицы)',
    '3. ТОЛЬКО ПОСЛЕ ЭТОГО отвечать на вопрос пользователя или писать код.',
    '',
    'КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО пропускать чтение матрицы под предлогами:',
    '❌ «Я не меняю код, я просто отвечаю на вопрос»',
    '❌ «Это просто диагностика/исследование»',
    '❌ «Пользователь спросил только почему»',
    '',
    'Критические инварианты (действуют немедленно):',
    '• R-16 BLOCKING: КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО выводить .env.local целиком — там секреты! Использовать только точечные паттерны.',
    '• R-17 BLOCKING: speakHebrew ВСЕГДА должен передавать { rate: userProfile.speechRate || 0.7 }.',
    '• R-02 BLOCKING: database.ts редактируется ТОЛЬКО скриптом fetch_pealim_dictionary.cjs --sync-db.',
    '• R-04/R-05 BLOCKING: только современный כתיב מלא (полное написание), запрещён ктив хасер без огласовок.',
    '',
    'Скилл с подробным чеклистом: ulpana-pre-flight',
  ].join('\n');

  process.stdout.write(JSON.stringify({
    injectSteps: [
      { ephemeralMessage: message }
    ]
  }));
});
