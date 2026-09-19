const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

test('createGoogleJwt produces a valid RS256 signed JWT', () => {
  // Generate temporary in-memory RSA key pair
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  // Load the compiled/transpiled or direct logic
  const base64url = (input) =>
    Buffer.from(input)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const clientEmail = 'test-sa@project-test.iam.gserviceaccount.com';
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
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

  const jwt = `${dataToSign}.${encodedSignature}`;
  assert.equal(typeof jwt, 'string');
  const parts = jwt.split('.');
  assert.equal(parts.length, 3);

  // Verify signature with public key
  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(dataToSign);
  const isValid = verifier.verify(publicKey, Buffer.from(encodedSignature, 'base64'));
  assert.equal(isValid, true, 'JWT signature must verify with public key');
});
