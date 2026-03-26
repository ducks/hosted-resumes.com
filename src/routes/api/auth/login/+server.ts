import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserByEmail } from '$lib/server/queries/users';
import { verifyPassword, createSession, setSessionCookie } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, { status: 400 });
  }

  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return json({ error: 'email and password are required' }, { status: 400 });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return json({ error: 'invalid email or password' }, { status: 401 });
  }

  const valid = verifyPassword(password, user.passwordHash);
  if (!valid) {
    return json({ error: 'invalid email or password' }, { status: 401 });
  }

  const token = await createSession(user.id);
  setSessionCookie(cookies, token);

  return json({ user: { id: user.id, email: user.email } });
};
