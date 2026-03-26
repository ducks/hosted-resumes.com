// Routing contexts:
//   (marketing) - landing, pricing, public pages on bare domain
//   (app)       - dashboard, editor, settings on bare domain (auth-gated)
//   (tenant)    - subdomain-hosted resume pages

import { sequence } from '@sveltejs/kit/hooks';
import type { Handle } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { env } from '$env/dynamic/public';
import { runMigrations } from '$lib/server/migrate';
import { parseHost } from '$lib/server/routing';
import { validateSession, setSessionCookie } from '$lib/server/auth';
import { getTierConfig } from '$lib/tier';

// Auto-run migrations in development on server startup.
// In production, use `make db-migrate` before deploying.
if (dev) {
  runMigrations().catch((err) => {
    console.error('migration failed:', err);
    throw err;
  });
}

const routing: Handle = async ({ event, resolve }) => {
  const host = event.request.headers.get('host') ?? '';
  const baseDomain = (env.PUBLIC_BASE_DOMAIN ?? 'localhost:5173')
    .replace(/^https?:\/\//, '');
  const route = parseHost(host, baseDomain, event.url.pathname);
  event.locals.route = route;
  return resolve(event);
};

const auth: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get('session');

  if (token) {
    const result = await validateSession(token);
    if (result) {
      event.locals.user = result.user;
      if (result.extended) {
        setSessionCookie(event.cookies, token);
      }
    } else {
      event.locals.user = null;
    }
  } else {
    event.locals.user = null;
  }

  return resolve(event);
};

const tierEnforcement: Handle = async ({ event, resolve }) => {
  const user = event.locals.user;
  if (!user) return resolve(event);
  event.locals.tierConfig = getTierConfig(user.tier);
  return resolve(event);
};

// Routing runs first, then auth, then tier resolution.
export const handle = sequence(routing, auth, tierEnforcement);
