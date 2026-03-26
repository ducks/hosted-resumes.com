import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { eq, and, gt, lt } from 'drizzle-orm';
import { db } from '$lib/db';
import { sessions, users } from '$lib/db/schema';
import type { Cookies } from '@sveltejs/kit';
import { dev } from '$app/environment';

const SESSION_TTL_DAYS = 30;
const SESSION_EXTEND_THRESHOLD_DAYS = 15;

export type SessionUser = {
  id: string;
  email: string;
  username: string;
  tier: string;
};

export function hashPassword(password: string): string {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `${salt.toString('hex')}:${hash.toString('hex')}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [saltHex, hashHex] = stored.split(':');
  const salt = Buffer.from(saltHex, 'hex');
  const storedHash = Buffer.from(hashHex, 'hex');
  const derived = scryptSync(password, salt, 64);
  return timingSafeEqual(storedHash, derived);
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await db.insert(sessions).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

export async function validateSession(token: string): Promise<{
  user: SessionUser;
  extended: boolean;
} | null> {
  const now = new Date();

  const rows = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      userId: users.id,
      email: users.email,
      username: users.username,
      tier: users.tier,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.token, token))
    .limit(1);

  if (rows.length === 0) {
    return null;
  }

  const row = rows[0];

  if (row.expiresAt < now) {
    await db.delete(sessions).where(eq(sessions.token, token));
    return null;
  }

  let extended = false;
  const thresholdMs = SESSION_EXTEND_THRESHOLD_DAYS * 24 * 60 * 60 * 1000;
  const remainingMs = row.expiresAt.getTime() - now.getTime();

  if (remainingMs < thresholdMs) {
    const newExpiry = new Date(now.getTime() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);
    await db
      .update(sessions)
      .set({ expiresAt: newExpiry })
      .where(eq(sessions.id, row.sessionId));
    extended = true;
  }

  return {
    user: {
      id: row.userId,
      email: row.email,
      username: row.username,
      tier: row.tier,
    },
    extended,
  };
}

export async function destroySession(token: string): Promise<void> {
  await db.delete(sessions).where(eq(sessions.token, token));
}

export function setSessionCookie(cookies: Cookies, token: string): void {
  cookies.set('session', token, {
    path: '/',
    httpOnly: true,
    secure: !dev,
    sameSite: 'lax',
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
  });
}

export function clearSessionCookie(cookies: Cookies): void {
  cookies.delete('session', { path: '/' });
}
