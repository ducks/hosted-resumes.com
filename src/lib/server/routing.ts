import { error } from '@sveltejs/kit';

export type RouteContext =
  | { kind: 'marketing' }
  | { kind: 'app' }
  | { kind: 'tenant'; subdomain: string };

const APP_PREFIXES = ['/dashboard', '/editor', '/settings', '/api'];

const SUBDOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;

export function parseHost(
  host: string,
  baseDomain: string,
  pathname: string
): RouteContext {
  const normalizedHost = host.split(':')[0].toLowerCase();
  const normalizedBase = baseDomain.split(':')[0].toLowerCase();

  if (normalizedHost === normalizedBase) {
    if (APP_PREFIXES.some((p) => pathname.startsWith(p))) {
      return { kind: 'app' };
    }
    return { kind: 'marketing' };
  }

  const suffix = '.' + normalizedBase;
  if (normalizedHost.endsWith(suffix)) {
    const label = normalizedHost.slice(0, -suffix.length);

    if (label.includes('.')) {
      return { kind: 'marketing' };
    }

    if (SUBDOMAIN_RE.test(label)) {
      return { kind: 'tenant', subdomain: label };
    }

    return { kind: 'marketing' };
  }

  return { kind: 'marketing' };
}

export function requireTenant(locals: App.Locals): string {
  if (locals.route.kind !== 'tenant') {
    throw error(404);
  }
  return locals.route.subdomain;
}

export function requireApp(locals: App.Locals): void {
  if (locals.route.kind === 'tenant') {
    throw error(404);
  }
}
