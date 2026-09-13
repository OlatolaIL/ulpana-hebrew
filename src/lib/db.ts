import { Pool } from 'pg';

let pool: Pool | null = null;

export function getDbPool(): Pool | null {
  let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!connectionString) {
    return null;
  }
  connectionString = connectionString.trim().replace(/^["']|["']$/g, '');

  if (!pool) {
    const databaseUrl = new URL(connectionString);
    const isLoopback = ['localhost', '127.0.0.1', '[::1]'].includes(databaseUrl.hostname);
    const sslMode = databaseUrl.searchParams.get('sslmode');
    if (!isLoopback || (sslMode && sslMode !== 'disable')) {
      databaseUrl.searchParams.set('sslmode', 'verify-full');
    }
    pool = new Pool({
      connectionString: databaseUrl.toString(),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      statement_timeout: 15000,
    });
  }

  return pool;
}

let initialized = false;
let initialization: Promise<void> | null = null;

export async function initDatabase() {
  if (initialized) return;
  if (!initialization) initialization = initializeDatabase().finally(() => { initialization = null; });
  return initialization;
}

async function initializeDatabase() {
  const database = getDbPool();
  if (!database) {
    console.warn('[DB] No DATABASE_URL found. Running in offline/fallback mode.');
    return;
  }

  const db = await database.connect();
  try {
    await db.query('BEGIN');
    // Serialize first-start migrations across server processes, and roll back partial DDL.
    await db.query("SELECT pg_advisory_xact_lock(hashtext('ulpana_schema_v1'))");
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
      ALTER TABLE ulpana_users ADD COLUMN IF NOT EXISTS sync_revision BIGINT NOT NULL DEFAULT 0;
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
      CREATE UNIQUE INDEX IF NOT EXISTS ulpana_vocab_user_hebrew_plain_idx
      ON ulpana_vocabulary (user_id, hebrew_plain);
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
      ALTER TABLE ulpana_call_logs ADD COLUMN IF NOT EXISTS audio_data JSONB DEFAULT '{}';
    `);

    // 7. Таблица сохраненных аудиозаписей учеников (строго 1 последняя попытка на user_id + lesson_id + stage)
    await db.query(`
      CREATE TABLE IF NOT EXISTS ulpana_audio_recordings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lesson_id INT NOT NULL,
        stage TEXT NOT NULL,
        turns_audio JSONB DEFAULT '{}',
        full_audio_url TEXT,
        duration_seconds INT DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT ulpana_user_lesson_stage_unique UNIQUE (user_id, lesson_id, stage)
      );
    `);

    // 8. Таблица сохраненных сочинений учеников и рецензий ИИ
    await db.query(`
      CREATE TABLE IF NOT EXISTS ulpana_essays (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        user_name TEXT,
        lesson_id INT NOT NULL,
        topic_title TEXT,
        essay_text TEXT NOT NULL,
        score INT DEFAULT 0,
        rating TEXT,
        evaluation JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT ulpana_user_lesson_essay_unique UNIQUE (user_id, lesson_id)
      );
      ALTER TABLE ulpana_lesson_progress ADD COLUMN IF NOT EXISTS essay JSONB DEFAULT NULL;
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS ulpana_ai_usage (
        scope TEXT NOT NULL,
        window_start TIMESTAMPTZ NOT NULL,
        request_count INT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (scope, window_start)
      );
      CREATE INDEX IF NOT EXISTS ulpana_ai_usage_expiry_idx ON ulpana_ai_usage(expires_at);
    `);

    await db.query('COMMIT');
    initialized = true;
    console.log('[DB] Database tables initialized successfully.');
  } catch (err) {
    await db.query('ROLLBACK');
    console.error('[DB] Failed to initialize tables:', err);
    throw err;
  } finally { db.release(); }
}
