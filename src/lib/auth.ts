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

export interface TelegramWebAppUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebAppDataResult {
  isValid: boolean;
  user?: TelegramWebAppUser;
  authDate?: number;
  queryId?: string;
}

/**
 * Валидация подписи Telegram Mini Apps (initData) по официальному стандарту Telegram
 */
export function verifyTelegramWebAppData(initData: string, botToken: string): TelegramWebAppDataResult {
  if (!botToken || !initData) {
    return { isValid: false };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) {
      return { isValid: false };
    }

    // 1. Сортируем все параметры кроме hash
    const checkArr: string[] = [];
    const keys = Array.from(params.keys())
      .filter((k) => k !== 'hash')
      .sort();

    for (const key of keys) {
      const val = params.get(key);
      if (val !== null) {
        checkArr.push(`${key}=${val}`);
      }
    }

    const dataCheckString = checkArr.join('\n');

    // 2. Secret Key = HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    // 3. Calculated Hash = HMAC_SHA256(secretKey, dataCheckString)
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return { isValid: false };
    }

    // 4. Проверяем срок давности (до 48 часов)
    const authDateStr = params.get('auth_date');
    const authDate = authDateStr ? parseInt(authDateStr, 10) : 0;
    const now = Math.floor(Date.now() / 1000);
    if (authDate > 0 && now - authDate > 172800) {
      return { isValid: false };
    }

    let user: TelegramWebAppUser | undefined;
    const userStr = params.get('user');
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch {}
    }

    return {
      isValid: true,
      user,
      authDate,
      queryId: params.get('query_id') || undefined,
    };
  } catch {
    return { isValid: false };
  }
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
