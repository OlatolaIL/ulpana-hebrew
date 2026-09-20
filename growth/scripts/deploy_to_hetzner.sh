#!/usr/bin/env bash
# ==============================================================================
# Ulpana Aleph — Деплой автономного сторожа Telegram Lead Radar на Hetzner VPS
# ==============================================================================
# Этот скрипт настраивает и запускает фоновый демон Lead Radar на сервере Hetzner.
# Потребление ресурсов: ~50-70 МБ ОЗУ, < 0.1% CPU. Безопасен для совместной
# работы с другими проектами на одном сервере.
# ==============================================================================

set -e

echo "======================================================="
echo "🛰  ULPANA ALEPH — HETZNER DEPLOYMENT (TELEGRAM RADAR)"
echo "======================================================="

# 1. Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Ошибка: Node.js не установлен на сервере."
    echo "Установите Node.js (рекомендуется v20+ LTS):"
    echo "curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt install -y nodejs"
    exit 1
fi
echo "✅ Node.js $(node -v) обнаружен."

# 2. Проверка или установка PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 PM2 не найден. Устанавливаем pm2 глобально..."
    npm install -g pm2
fi
echo "✅ PM2 $(pm2 -v) готов к работе."

# 3. Установка зависимостей в проекте
echo "📦 Установка зависимостей (telegram, input)..."
npm install --no-audit --prefer-offline telegram input

# 4. Создание необходимых каталогов для данных и логов
mkdir -p growth/data/logs

# 5. Проверка наличия сессии и переменных окружения
if [ ! -f "growth/data/tg_session.txt" ] && [ -z "$TELEGRAM_SESSION_STRING" ]; then
    echo "⚠️ ВНИМАНИЕ: Файл growth/data/tg_session.txt не найден и TELEGRAM_SESSION_STRING не задан."
    echo "Скопируйте сгенерированный файл tg_session.txt с локальной машины:"
    echo "scp growth/data/tg_session.txt user@YOUR_HETZNER_IP:$(pwd)/growth/data/tg_session.txt"
    echo "Или вставьте строку сессии в .env.local как TELEGRAM_SESSION_STRING=..."
fi

if [ ! -f ".env.local" ] && [ -z "$TELEGRAM_API_ID" ]; then
    echo "⚠️ ВНИМАНИЕ: .env.local не найден."
    echo "Убедитесь, что в .env.local на Hetzner заданы:"
    echo "  TELEGRAM_API_ID=36196047"
    echo "  TELEGRAM_API_HASH=865beb4793ddf37b78fdc176bc6a4071"
    echo "  TELEGRAM_BOT_TOKEN=..."
    echo "  FOUNDER_TELEGRAM_CHAT_ID=..."
    echo "  GROQ_API_KEY=..."
fi

# 6. Запуск процесса в PM2
echo "🚀 Запуск/перезапуск демона через PM2..."
pm2 restart growth/ecosystem.config.cjs || pm2 start growth/ecosystem.config.cjs

# 7. Сохранение конфигурации автозапуска при перезагрузке сервера
echo "💾 Сохранение конфигурации автозапуска PM2..."
pm2 save

echo ""
echo "======================================================="
echo "✅ ДЕМОН УСПЕШНО ЗАПУЩЕН И РАБОТАЕТ В ФОНЕ (24/7)"
echo "======================================================="
echo "Полезные команды на Hetzner:"
echo "  pm2 status                        # Статус процессов"
echo "  pm2 logs ulpana-telegram-radar    # Смотреть логи в реальном времени"
echo "  pm2 restart ulpana-telegram-radar # Перезапуск"
echo "  pm2 stop ulpana-telegram-radar    # Остановка"
echo "======================================================="
