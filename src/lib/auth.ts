import crypto from 'crypto';
import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { UserSession } from '@/types';

function sessionSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes');
  }
  return new TextEncoder().encode(secret);
}

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
  if (!Number.isSafeInteger(data.auth_date) || data.auth_date <= 0 || data.auth_date > now + 60 || now - data.auth_date > 86400) {
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
    if (!Number.isSafeInteger(authDate) || authDate <= 0 || authDate > now + 60 || now - authDate > 172800) {
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
    .sign(sessionSecret());
}

/**
 * Расшифровка и проверка JWT токена сессии
 */
export async function verifySessionToken(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, sessionSecret(), { algorithms: ['HS256'] });
    if (typeof payload.id !== 'string' || !payload.id || !payload.exp) return null;
    return payload as unknown as UserSession;
  } catch {
    return null;
  }
}

export interface GoogleTokenPayload {
  sub: string;
  email: string;
  email_verified?: boolean;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

/**
 * Валидация криптографической подписи и данных Google ID Token (JWT)
 */
export async function verifyGoogleIdToken(
  idToken: string,
  expectedClientId?: string
): Promise<GoogleTokenPayload | null> {
  try {
    const rawClientId =
      expectedClientId ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID;
    const clientId = rawClientId?.trim();
    if (!clientId) return null;

    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
    });

    if (!payload || !payload.sub || !payload.email || payload.email_verified !== true) {
      return null;
    }

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      email_verified: Boolean(payload.email_verified),
      name: (payload.name as string) || (payload.email as string).split('@')[0],
      picture: payload.picture as string | undefined,
      given_name: payload.given_name as string | undefined,
      family_name: payload.family_name as string | undefined,
    };
  } catch (error) {
    console.error('[verifyGoogleIdToken] Error verifying Google token:', error);
    return null;
  }
}

/**
 * Получение профиля пользователя Google по Access Token (OAuth2 Popup Flow)
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleTokenPayload | null> {
  try {
    const clientId = (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID)?.trim();
    if (!clientId || !accessToken || accessToken.length > 16000) return null;
    // UserInfo alone does not establish which OAuth client obtained the token.
    const infoResponse = await fetch(`https://www.googleapis.com/oauth2/v2/tokeninfo?access_token=${encodeURIComponent(accessToken)}`, {
      method: 'POST', cache: 'no-store', signal: AbortSignal.timeout(10000),
    });
    if (!infoResponse.ok) return null;
    const tokenInfo = await infoResponse.json();
    if (tokenInfo.issued_to !== clientId || tokenInfo.audience !== clientId ||
        !Number.isFinite(Number(tokenInfo.expires_in)) || Number(tokenInfo.expires_in) <= 0 ||
        typeof tokenInfo.user_id !== 'string' || tokenInfo.verified_email !== true) return null;
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: 'no-store', signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error('[fetchGoogleUserInfo] Google userinfo rejected the request:', res.status);
      return null;
    }

    const data = await res.json();
    if (!data.sub || data.sub !== tokenInfo.user_id || !data.email || data.email_verified !== true) {
      return null;
    }

    return {
      sub: data.sub,
      email: data.email,
      email_verified: Boolean(data.email_verified),
      name: data.name || (data.email as string).split('@')[0],
      picture: data.picture,
      given_name: data.given_name,
      family_name: data.family_name,
    };
  } catch {
    console.error('[fetchGoogleUserInfo] Google verification unavailable');
    return null;
  }
}
