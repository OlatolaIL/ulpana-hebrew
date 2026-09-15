#!/usr/bin/env node
/**
 * secrets-guard.js
 * PreToolUse hook — блокирует команды, которые могут вывести .env.local целиком.
 *
 * R-16 BLOCKING: секреты не должны попадать в логи и транскрипты.
 *
 * Вход (stdin): JSON с полем toolCall.args.CommandLine
 * Выход (stdout): JSON с decision: allow/deny
 */

const chunks = [];
process.stdin.on('data', d => chunks.push(d));
process.stdin.on('end', () => {
  let payload = {};
  try { payload = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch {}

  const cmd = (payload?.toolCall?.args?.CommandLine || '').toLowerCase();

  // Паттерны, которые могут вывести весь .env.local в транскрипт
  const dangerousPatterns = [
    /get-content.*\.env/i,
    /cat\s+\.env/i,
    /type\s+\.env/i,
    /select-string.*\.env\.local.*groq\|jwt\|token\|password\|secret\|key/i,
  ];

  // Паттерны Select-String с конкретными безопасными полями (разрешать)
  const safeSelectString = /select-string.*\.env.*groq_model|select-string.*\.env.*gemini_model/i;

  const isDangerous = dangerousPatterns.some(p => p.test(cmd)) && !safeSelectString.test(cmd);

  if (isDangerous) {
    process.stdout.write(JSON.stringify({
      decision: 'deny',
      reason: '[R-16 BLOCKING] Запрещено выводить .env.local целиком — файл содержит секреты (GROQ_API_KEY, DATABASE_URL, JWT_SECRET, TELEGRAM_BOT_TOKEN). Читай только конкретные переменные: Select-String ... -Pattern "GROQ_MODEL"'
    }));
    return;
  }

  process.stdout.write(JSON.stringify({ decision: 'allow' }));
});
