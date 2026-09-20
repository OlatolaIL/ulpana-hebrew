/**
 * PM2 Process Configuration for Ulpana Telegram Lead Radar (Hetzner VPS 24/7)
 * 
 * Usage on Hetzner:
 *   pm2 start growth/ecosystem.config.cjs
 *   pm2 save
 *   pm2 logs ulpana-telegram-radar
 */

module.exports = {
  apps: [
    {
      name: 'ulpana-telegram-radar',
      script: './growth/scripts/telegram_radar.cjs',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '150M',
      time: true,
      env: {
        NODE_ENV: 'production',
      },
      error_file: './growth/data/logs/radar-error.log',
      out_file: './growth/data/logs/radar-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
