export const VIP_USERNAMES = [
  'osa_il',
  'olatola',
  'azrie',
];

export function isVipUser(username?: string | null, telegramId?: number | string | null): boolean {
  if (!username && !telegramId) return false;
  
  if (username) {
    const clean = username.toLowerCase().replace(/^@/, '').trim();
    if (VIP_USERNAMES.includes(clean)) return true;
  }
  
  return false;
}

export const VIP_EXPIRES_AT = 2088000000000; // 2036 year (~10 years)
