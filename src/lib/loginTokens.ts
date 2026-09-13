import crypto from 'crypto';
import type { Pool } from 'pg';
import type { UserSession } from '@/types';

export type TokenPurpose = 'polling' | 'magic_link';

export const LOGIN_TOKEN_PREFIX = {
  POLLING: 'ulp_poll_',
  MAGIC_LINK: 'ulp_ml_',
} as const;

export const TOKEN_TTL_MINUTES = 10;
export const TOKEN_TTL_SECONDS = 10 * 60; // 600 секунд

export interface TokenUserData {
  purpose: TokenPurpose;
  id?: string;
  telegramId?: number;
  username?: string;
  name?: string;
  avatarUrl?: string;
  subscriptionTier?: 'free' | 'pro' | 'admin';
  subscriptionExpiresAt?: number | null;
  gender?: 'male' | 'female';
  fontStyle?: 'print' | 'cursive';
  [key: string]: unknown;
}

/**
 * Криптографический хэш токена (SHA-256) для хранения в БД.
 * В базу данных сохраняется только хэш; сырой токен никогда не сохраняется в открытом виде.
 */
export function hashLoginToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Проверка формата токена поллинга (строго ulp_poll_ + 32 hex символа)
 */
export function isValidPollingToken(token: unknown): token is string {
  if (typeof token !== 'string') return false;
  return /^ulp_poll_[a-f0-9]{32}$/.test(token);
}

/**
 * Проверка формата токена magic link (строго ulp_ml_ + 32 hex символа)
 */
export function isValidMagicLinkToken(token: unknown): token is string {
  if (typeof token !== 'string') return false;
  return /^ulp_ml_[a-f0-9]{32}$/.test(token);
}

/**
 * Распознавание устаревших или небезопасных токенов (сырые JWT, старый формат без назначения)
 */
export function isLegacyOrInsecureToken(token: unknown): boolean {
  if (typeof token !== 'string') return false;
  // JWT начинается с eyJ
  if (token.startsWith('eyJ')) return true;
  // Старый формат ulp_ без типа poll_ или ml_
  if (
    token.startsWith('ulp_') &&
    !token.startsWith(LOGIN_TOKEN_PREFIX.POLLING) &&
    !token.startsWith(LOGIN_TOKEN_PREFIX.MAGIC_LINK)
  ) {
    return true;
  }
  return false;
}

/**
 * Генерация случайного непрозрачного токена для поллинга
 */
export function generatePollingToken(): string {
  return `${LOGIN_TOKEN_PREFIX.POLLING}${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Генерация случайного непрозрачного токена для magic link
 */
export function generateMagicLinkToken(): string {
  return `${LOGIN_TOKEN_PREFIX.MAGIC_LINK}${crypto.randomBytes(16).toString('hex')}`;
}

/**
 * Проверка доступности и корректности JWT конфигурации
 */
export function checkAuthConfiguration(): { ok: boolean; error?: string } {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    return { ok: false, error: 'Служба входа временно недоступна. Попробуйте позже.' };
  }
  return { ok: true };
}

/**
 * Создание ожидающей сессии поллинга в базе данных.
 * Сохраняет только хэш токена с временем жизни 10 минут.
 */
export async function createPollingSession(db: Pool): Promise<string> {
  const rawToken = generatePollingToken();
  const tokenHash = hashLoginToken(rawToken);

  const initialData: TokenUserData = { purpose: 'polling' };

  await db.query(
    `INSERT INTO ulpana_auth_tokens (token, status, user_data, created_at, expires_at)
     VALUES ($1, 'pending', $2, NOW(), NOW() + INTERVAL '10 minutes')`,
    [tokenHash, JSON.stringify(initialData)]
  );

  return rawToken;
}

/**
 * Подтверждение сессии поллинга через Telegram Webhook.
 * Атомарно обновляет статус ТОЛЬКО если токен в статусе pending и не просрочен.
 */
export async function confirmPollingSession(
  db: Pool,
  rawToken: string,
  userData: TokenUserData
): Promise<boolean> {
  if (!isValidPollingToken(rawToken)) return false;

  const tokenHash = hashLoginToken(rawToken);
  const payload: TokenUserData = { ...userData, purpose: 'polling' };

  const res = await db.query(
    `UPDATE ulpana_auth_tokens
     SET status = 'completed',
         user_data = $1
     WHERE token = $2
       AND status = 'pending'
       AND user_data->>'purpose' = 'polling'
       AND expires_at > NOW()
     RETURNING token`,
    [JSON.stringify(payload), tokenHash]
  );

  return res.rowCount !== null && res.rowCount > 0;
}

/**
 * Атомарное одноразовое потребление токена поллинга.
 * Устраняет гонку SELECT -> DELETE: при статусе 'completed' запись удаляется и возвращается одним запросом.
 */
export async function consumePollingSession(
  db: Pool,
  rawToken: string
): Promise<{
  completed: boolean;
  status: 'completed' | 'pending' | 'expired' | 'invalid';
  userData?: TokenUserData;
}> {
  if (!isValidPollingToken(rawToken)) {
    return { completed: false, status: 'invalid' };
  }

  const tokenHash = hashLoginToken(rawToken);

  // 1. Атомарно удаляем и считываем данные, если токен подтвержден и не просрочен
  const consumeRes = await db.query(
    `DELETE FROM ulpana_auth_tokens
     WHERE token = $1
       AND status = 'completed'
       AND user_data->>'purpose' = 'polling'
       AND expires_at > NOW()
     RETURNING user_data`,
    [tokenHash]
  );

  if (consumeRes.rowCount !== null && consumeRes.rowCount > 0) {
    const rawData = consumeRes.rows[0].user_data;
    const userData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    return {
      completed: true,
      status: 'completed',
      userData: userData as TokenUserData,
    };
  }

  // 2. Если токен еще не подтвержден, проверяем, находится ли он в ожидании
  const checkRes = await db.query(
    `SELECT status FROM ulpana_auth_tokens
     WHERE token = $1
       AND status = 'pending'
       AND user_data->>'purpose' = 'polling'
       AND expires_at > NOW()`,
    [tokenHash]
  );

  if (checkRes.rowCount !== null && checkRes.rowCount > 0) {
    return { completed: false, status: 'pending' };
  }

  return { completed: false, status: 'expired' };
}

/**
 * Создание одноразовой короткой ссылки (magic link) со сроком действия 10 минут.
 * Сохраняет только хэш токена.
 */
export async function createMagicLinkSession(
  db: Pool,
  userData: TokenUserData
): Promise<string> {
  const rawToken = generateMagicLinkToken();
  const tokenHash = hashLoginToken(rawToken);
  const payload: TokenUserData = { ...userData, purpose: 'magic_link' };

  await db.query(
    `INSERT INTO ulpana_auth_tokens (token, status, user_data, created_at, expires_at)
     VALUES ($1, 'completed', $2, NOW(), NOW() + INTERVAL '10 minutes')`,
    [tokenHash, JSON.stringify(payload)]
  );

  return rawToken;
}

/**
 * Атомарное одноразовое потребление magic link токена.
 * Удаляет токен из базы и возвращает данные пользователя. Повторный вызов вернет null.
 */
export async function consumeMagicLinkSession(
  db: Pool,
  rawToken: string
): Promise<TokenUserData | null> {
  if (!isValidMagicLinkToken(rawToken)) {
    return null;
  }

  const tokenHash = hashLoginToken(rawToken);

  const res = await db.query(
    `DELETE FROM ulpana_auth_tokens
     WHERE token = $1
       AND status = 'completed'
       AND user_data->>'purpose' = 'magic_link'
       AND expires_at > NOW()
     RETURNING user_data`,
    [tokenHash]
  );

  if (!res.rowCount || res.rowCount === 0) {
    return null;
  }

  const rawData = res.rows[0].user_data;
  return (typeof rawData === 'string' ? JSON.parse(rawData) : rawData) as TokenUserData;
}

/**
 * Приведение TokenUserData к объекту UserSession с сохранением канонического id профиля
 */
export function toUserSession(userData: TokenUserData): UserSession {
  if (!userData || (!(typeof userData.id === 'string' && userData.id.trim()) &&
      !(Number.isSafeInteger(userData.telegramId) && Number(userData.telegramId) > 0))) {
    throw new Error('Invalid login identity');
  }
  const canonicalId =
    typeof userData.id === 'string' && userData.id.trim().length > 0
      ? userData.id.trim()
      : `tg_${userData.telegramId}`;

  const displayName =
    userData.name || (userData.username ? `@${userData.username}` : 'Ученик');

  return {
    id: canonicalId,
    telegramId: userData.telegramId ? Number(userData.telegramId) : undefined,
    username: userData.username,
    name: displayName,
    avatarUrl: userData.avatarUrl,
    subscriptionTier: userData.subscriptionTier || 'free',
    subscriptionExpiresAt: userData.subscriptionExpiresAt ?? null,
  };
}
