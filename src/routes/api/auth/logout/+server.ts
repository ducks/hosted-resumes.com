import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { destroySession, clearSessionCookie } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
  const token = cookies.get('session');

  if (token) {
    await destroySession(token);
  }

  clearSessionCookie(cookies);

  return json({ ok: true });
};
