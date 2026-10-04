/**
 * Scheduled Publisher Runner — Автономный запуск выгрузки по расписанию
 * 
 * Назначение:
 *   Триггер крон-выгрузки публикаций со статусом "scheduled", время которых наступило.
 *   Может вызываться через планировщик Windows Task Scheduler, cron на сервере или локально.
 * 
 * Использование:
 *   node growth/scripts/run_scheduled_publisher.cjs                  # Вызов боевого сервера (или localhost)
 *   node growth/scripts/run_scheduled_publisher.cjs --local          # Вызов строго локального сервера http://localhost:3000
 *   node growth/scripts/run_scheduled_publisher.cjs --url="https://..." # Кастомный URL
 */

const fs = require('fs');
const path = require('path');

// Загрузка переменных окружения
try {
  if (fs.existsSync('.env.local')) {
    process.loadEnvFile('.env.local');
  }
} catch (e) {}

const isLocal = process.argv.includes('--local');
const customUrlArg = process.argv.find((a) => a.startsWith('--url='));
const customUrl = customUrlArg ? customUrlArg.split('=')[1] : null;

const baseUrl = customUrl || (isLocal ? 'http://localhost:3000' : (process.env.NEXT_PUBLIC_APP_URL || 'https://ulpana-hebrew.vercel.app'));
const cronSecret = process.env.CRON_SECRET || '';

async function run() {
  console.log(`[Scheduled Publisher] Запуск проверки расписания...`);
  console.log(`[Scheduled Publisher] Целевой URL: ${baseUrl}/api/cron/publish`);

  const headers = {
    'Content-Type': 'application/json',
  };
  if (cronSecret) {
    headers['Authorization'] = `Bearer ${cronSecret}`;
  }

  try {
    const res = await fetch(`${baseUrl}/api/cron/publish`, {
      method: 'POST',
      headers,
    });

    const data = await res.json();
    if (res.ok && data.success) {
      console.log(`[Scheduled Publisher] Успешно: ${data.message}`);
      if (data.results && data.results.length > 0) {
        console.table(data.results);
      }
    } else {
      console.error(`[Scheduled Publisher] Ошибка HTTP ${res.status}:`, data.error || data);
    }
  } catch (err) {
    console.error(`[Scheduled Publisher] Сетевая ошибка при вызове крон-эндпоинта:`, err.message);
  }
}

run();
