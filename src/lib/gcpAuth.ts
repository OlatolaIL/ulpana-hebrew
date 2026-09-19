import crypto from 'crypto';

function base64url(input: string | Buffer): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Creates a signed Google OAuth2 JWT Bearer assertion for Service Account authentication.
 */
export function createGoogleJwt(
  clientEmail: string,
  privateKey: string,
  scope = 'https://www.googleapis.com/auth/cloud-platform'
): string {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: clientEmail,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(dataToSign);
  const signature = signer.sign(privateKey);
  const encodedSignature = base64url(signature);

  return `${dataToSign}.${encodedSignature}`;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Retrieves a valid OAuth2 Bearer access token for Google Cloud Vertex AI using Service Account credentials.
 * Tokens are automatically cached in-memory and refreshed before expiry.
 */
export async function getVertexAiAccessToken(): Promise<string | null> {
  // Check in-memory cache with 5-minute safety buffer
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const rawKey = process.env.GCP_SA_KEY_BASE64 || process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (!rawKey) return null;

  try {
    let saJson: { client_email?: string; private_key?: string; project_id?: string };
    if (rawKey.trim().startsWith('{')) {
      saJson = JSON.parse(rawKey);
    } else {
      const decoded = Buffer.from(rawKey.trim(), 'base64').toString('utf-8');
      saJson = JSON.parse(decoded);
    }

    if (!saJson.client_email || !saJson.private_key) {
      console.warn('GCP Service Account missing client_email or private_key');
      return null;
    }

    const jwt = createGoogleJwt(saJson.client_email, saJson.private_key);
    const body = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('Failed to get GCP access token:', res.status, errText);
      return null;
    }

    const data = await res.json();
    if (typeof data.access_token === 'string') {
      const expiresInSec = typeof data.expires_in === 'number' ? data.expires_in : 3600;
      cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + expiresInSec * 1000,
      };
      return data.access_token;
    }
  } catch (err) {
    console.error('Error obtaining GCP access token:', err);
  }

  return null;
}

/**
 * Returns the GCP project ID configured for Vertex AI.
 */
export function getGcpProjectId(): string {
  if (process.env.GCP_PROJECT_ID) return process.env.GCP_PROJECT_ID.trim();
  const rawKey = process.env.GCP_SA_KEY_BASE64 || process.env.GCP_SERVICE_ACCOUNT_KEY;
  if (rawKey) {
    try {
      const text = rawKey.trim().startsWith('{') ? rawKey : Buffer.from(rawKey.trim(), 'base64').toString('utf-8');
      const parsed = JSON.parse(text);
      if (parsed.project_id) return parsed.project_id.trim();
    } catch {
      // ignore
    }
  }
  return 'project-aebc6692-f6eb-4d2f-b1b';
}
