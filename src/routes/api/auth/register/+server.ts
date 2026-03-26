import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserByEmail, getUserByUsername } from '$lib/server/queries/users';
import { createUser } from '$lib/server/queries/users';
import { hashPassword, createSession, setSessionCookie } from '$lib/server/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function slugifyEmail(email: string): string {
  const local = email.split('@')[0];
  return local
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

async function uniqueUsername(base: string): Promise<string> {
  let candidate = base;
  let attempts = 0;
  while (attempts < 10) {
    const existing = await getUserByUsername(candidate);
    if (!existing) return candidate;
    const suffix = Math.random().toString(36).slice(2, 6);
    candidate = `${base}-${suffix}`;
    attempts++;
  }
  throw new Error('could not generate unique username');
}

export const POST: RequestHandler = async ({ request, cookies }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'invalid json' }, { status: 400 });
  }

  const { email, password } = body as { email?: string; password?: string };

  if (!email || !EMAIL_RE.test(email)) {
    return json({ error: 'invalid email' }, { status: 400 });
  }

  if (!password || password.length < 8) {
    return json({ error: 'password must be at least 8 characters' }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing) {
    return json({ error: 'email already registered' }, { status: 409 });
  }

  const passwordHash = hashPassword(password);
  const username = await uniqueUsername(slugifyEmail(email));

  const user = await createUser({
    email,
    passwordHash,
    username,
  });

  const token = await createSession(user.id);
  setSessionCookie(cookies, token);

  return json({ user: { id: user.id, email: user.email } }, { status: 201 });
};
