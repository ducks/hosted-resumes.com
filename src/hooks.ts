import type { Reroute } from '@sveltejs/kit';

const BASE_DOMAIN = (
  import.meta.env.PUBLIC_BASE_DOMAIN ?? 'localhost:5173'
)
  .replace(/^https?:\/\//, '')
  .split(':')[0]
  .toLowerCase();

export const reroute: Reroute = ({ url }) => {
  const host = url.hostname.toLowerCase();

  const suffix = '.' + BASE_DOMAIN;
  if (host !== BASE_DOMAIN && host.endsWith(suffix)) {
    const label = host.slice(0, -suffix.length);
    if (!label.includes('.') && /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(label)) {
      return '/_t' + url.pathname;
    }
  }

  return url.pathname;
};
