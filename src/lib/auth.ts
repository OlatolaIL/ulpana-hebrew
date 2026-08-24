import crypto from 'crypto';
import { SignJWT, jwtVerify } from 'jose';
import { UserSession } from '@/types';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'ulpana_hebrew_super_secret_jwt_key_2026'
);

export interface TelegramAuthData {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

/**
 * Валидация подписи Telegram Login Widget по официальному стандарту Telegram
 */
export function verifyTelegramAuth(data: TelegramAuthData, botToken: string): boolean {
  if (!botToken || !data.hash) return false;

  // Проверяем срок давности (не старше 24 часов)
  const now = Math.floor(Date.now() / 1000);
  if (now - data.auth_date > 86400) {
    return false;
  }

  // 1. Сортируем все поля кроме hash
  const { hash, ...rest } = data;
  const checkArr: string[] = [];

  for (const key of Object.keys(rest).sort()) {
    const val = (rest as Record<string, any>)[key];
    if (val !== undefined && val !== null && val !== '') {
      checkArr.push(`${key}=${val}`);
    }
  }

  const dataCheckString = checkArr.join('\n');

  // 2. Secret Key = SHA256(botToken)
  const secretKey = crypto.createHash('sha256').update(botToken).digest();

  // 3. HMAC-SHA256(dataCheckString, secretKey)
  const hmac = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hmac === hash;
}

/**
 * Создание подписанного JWT токена сессии
 */
export async function createSessionToken(session: UserSession): Promise<string> {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET);
}

/**
 * Расшифровка и проверка JWT токена сессии
 */
export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}
