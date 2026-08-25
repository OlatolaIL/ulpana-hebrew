import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' && !connectionString.includes('localhost')
        ? { rejectUnauthorized: false }
        : undefined,
      max: 10,
      idleTimeoutMillis: 30000,
    });
  }

  return pool;
}

let initialized = false;

export async function initDatabase() {
  if (initialized) return;
  const db = getDbPool();
  if (!db) {
    console.warn('[DB] No DATABASE_URL found. Running in offline/fallback mode.');
    return;
  }

  try {
    // 1. Таблица пользователей
    await db.query(`
      CREATE TABLE IF NOT EXISTS ulpana_users (
        id TEXT PRIMARY KEY,
        telegram_id BIGINT UNIQUE,
        email TEXT UNIQUE,
        name TEXT NOT NULL,
        username TEXT,
        avatar_url TEXT,
        gender TEXT DEFAULT 'female',
        font_style TEXT DEFAULT 'print',
        subscription_tier TEXT DEFAULT 'free',
        subscription_expires_at BIGINT,
        flashcard_stats JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE ulpana_users ADD COLUMN IF NOT EXISTS flashcard_stats JSONB DEFAULT '{}';
    `);

    // 2. Таблица прогресса по урокам
    await db.query(`
      CREATE TABLE IF NOT EXISTS ulpana_lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES ulpana_users(id) ON DELETE CASCADE,
        lesson_id INT NOT NULL,
        completed_tabs TEXT[] DEFAULT '{}',
        is_completed BOOLEAN DEFAULT FALSE,
        score INT DEFAULT 0,
        last_visited BIGINT DEFAULT 0,
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT ulpana_user_lesson_unique UNIQUE (user_id, lesson_id)
      );
    `);

    // 3. Таблица персонального словарика
    await db.query(`
      CREATE TABLE IF NOT EXISTS ulpana_vocabulary (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES ulpana_users(id) ON DELETE CASCADE,
        hebrew TEXT NOT NULL,
        hebrew_plain TEXT NOT NULL,
        transcription TEXT,
        translation TEXT NOT NULL,
        part_of_speech TEXT DEFAULT 'other',
        root TEXT,
        lesson_id INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 4. Таблица промокодов для PRO-подписки
    await db.query(`
      CREATE TABLE IF NOT EXISTS ulpana_promo_codes (
        id TEXT PRIMARY KEY,
        code TEXT UNIQUE NOT NULL,
        days_valid INT NOT NULL,
        max_uses INT DEFAULT 100,
        used_count INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // 5. Таблица токенов авторизации через Telegram-бота (DeepLink 1-Click)
    await db.query(`
      CREATE TABLE IF NOT EXISTS ulpana_auth_tokens (
        token TEXT PRIMARY KEY,
        status TEXT DEFAULT 'pending',
        user_data JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes')
      );
    `);

    // 6. Таблица истории и логов телефонных звонков с ИИ
    await db.query(`
      CREATE TABLE IF NOT EXISTS ulpana_call_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        user_name TEXT,
        lesson_id INT NOT NULL,
        caller_name TEXT,
        caller_role TEXT,
        duration_seconds INT DEFAULT 0,
        messages_count INT DEFAULT 0,
        transcript JSONB DEFAULT '[]',
        feedback TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Вставляем базовые промокоды, если таблица пуста
    const promoCheck = await db.query(`SELECT COUNT(*) as count FROM ulpana_promo_codes`);
    if (parseInt(promoCheck.rows[0].count, 10) === 0) {
      await db.query(`
        INSERT INTO ulpana_promo_codes (id, code, days_valid, max_uses, used_count, is_active)
        VALUES
          ('promo-1', 'ULPANA2026', 30, 1000, 0, true),
          ('promo-2', 'MAZAL_TOV', 90, 500, 0, true)
        ON CONFLICT (code) DO NOTHING;
      `);
    }

    initialized = true;
    console.log('[DB] Database tables initialized successfully.');
  } catch (err) {
    console.error('[DB] Failed to initialize tables:', err);
  }
}
