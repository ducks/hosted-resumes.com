import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export type AuthenticatedUser = {
  id: string;
  email: string;
  username: string;
  tier: string;
};

// Extracts the authenticated user from the request event.
// Throws a 401 JSON response if no session is present.
export function requireAuth(event: RequestEvent): AuthenticatedUser {
  const user = event.locals.user;
  if (!user) {
    throw json({ error: 'authentication required' }, { status: 401 });
  }
  return user;
}

// Safely parses JSON from a request body.
// Returns the parsed value or throws a 400 JSON response.
export async function parseJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw json({ error: 'invalid json' }, { status: 400 });
  }
}

// Logs an API request at completion. No PII - only method,
// path, user id (opaque), and status code.
export function logRequest(
  method: string,
  path: string,
  userId: string | null,
  status: number
): void {
  console.log(
    `api: ${method} ${path} user=${userId ?? 'anon'} status=${status}`
  );
}
