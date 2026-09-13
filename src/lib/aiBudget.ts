import type { Pool } from 'pg';

export class AiBudgetExceeded extends Error {}

function positiveLimit(name: string, fallback: number): number {
  const configured = process.env[name];
  if (!configured) return fallback;
  const value = Number(configured);
  if (!Number.isSafeInteger(value) || value < 1 || value > 1_000_000) throw new Error(`Invalid ${name}`);
  return value;
}

/** Shared across application instances; all reservations succeed or roll back together. */
export async function consumeAiBudget(db: Pool, identity: string, registered: boolean): Promise<void> {
  const now = Date.now();
  const minute = new Date(Math.floor(now / 60000) * 60000);
  const day = new Date(new Date(now).toISOString().slice(0, 10));
  const reservations = [
    { scope: 'global:day', start: day, limit: positiveLimit('AI_DAILY_GLOBAL_LIMIT', 2000), ttl: 172800000 },
    { scope: `identity:${identity}:day`, start: day, limit: positiveLimit(registered ? 'AI_DAILY_USER_LIMIT' : 'AI_DAILY_GUEST_LIMIT', registered ? 200 : 30), ttl: 172800000 },
    { scope: `identity:${identity}:minute`, start: minute, limit: positiveLimit('AI_MINUTE_LIMIT', 40), ttl: 3600000 },
  ];
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    for (const reservation of reservations) {
      const result = await client.query(
        `INSERT INTO ulpana_ai_usage(scope, window_start, request_count, expires_at)
         VALUES ($1, $2, 1, $4)
         ON CONFLICT (scope, window_start) DO UPDATE
         SET request_count = ulpana_ai_usage.request_count + 1
         WHERE ulpana_ai_usage.request_count < $3
         RETURNING request_count`,
        [reservation.scope, reservation.start, reservation.limit, new Date(reservation.start.getTime() + reservation.ttl)],
      );
      if (!result.rowCount) throw new AiBudgetExceeded(reservation.scope.endsWith(':minute')
        ? 'Слишком много запросов. Попробуйте через минуту.'
        : 'Дневной лимит ИИ для беты исчерпан. Остальные учебные материалы доступны; проверку можно повторить завтра.');
    }
    await client.query('DELETE FROM ulpana_ai_usage WHERE expires_at < NOW()');
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}
