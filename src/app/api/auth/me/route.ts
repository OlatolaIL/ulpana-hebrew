import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';
import { getDbPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('ulpana_session')?.value;
    if (!token) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ authenticated: false, user: null });
    }

    const db = getDbPool();
    let updatedSession = session;
    let gender = 'female';
    let fontStyle = 'print';

    if (db) {
      const res = await db.query('SELECT * FROM ulpana_users WHERE id = $1', [session.id]);
      if (res.rows.length > 0) {
        const row = res.rows[0];
        gender = row.gender || 'female';
        fontStyle = row.font_style || 'print';

        // Проверяем срок действия подписки
        let tier = row.subscription_tier || 'free';
        const expiresAt = row.subscription_expires_at ? Number(row.subscription_expires_at) : null;
        if (tier === 'pro' && expiresAt && Date.now() > expiresAt) {
          tier = 'free';
          await db.query(`UPDATE ulpana_users SET subscription_tier = 'free' WHERE id = $1`, [session.id]);
        }

        updatedSession = {
          ...session,
          name: row.name || session.name,
          username: row.username || session.username,
          avatarUrl: row.avatar_url || session.avatarUrl,
          subscriptionTier: tier,
          subscriptionExpiresAt: expiresAt,
        };
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: updatedSession,
      gender,
      fontStyle,
    });
  } catch (error) {
    console.error('[API Auth Me] Error:', error);
    return NextResponse.json({ authenticated: false, user: null });
  }
}
