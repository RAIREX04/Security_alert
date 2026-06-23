import { env } from '../config/env';

function getApiOrigin() {
  const fallbackBase = env.apiFallbackUrl || env.apiBaseUrl;
  const rawBase = env.apiBaseUrl || fallbackBase;

  try {
    const parsed = new URL(rawBase);
    const pathname = parsed.pathname.replace(/\/api\/?$/i, '').replace(/\/+$/g, '');
    return `${parsed.origin}${pathname}`.replace(/\/+$/, '');
  } catch {
    return null;
  }
}

function isLoopbackHost(hostname: string) {
  return /^(localhost|127\.0\.0\.1|0\.0\.0\.0|::1|\[::1\])$/i.test(hostname);
}

function isPrivateNetworkHost(hostname: string) {
  if (isLoopbackHost(hostname)) {
    return true;
  }

  const ipv4 = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!ipv4) {
    return false;
  }

  const octets = ipv4.slice(1).map((value) => Number(value));
  if (octets.some((value) => Number.isNaN(value) || value < 0 || value > 255)) {
    return false;
  }

  const [a, b] = octets;
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254)
  );
}

export function normalizeMediaUrl(input?: string | null) {
  if (!input) {
    return null;
  }

  const value = input.trim();
  if (!value) {
    return null;
  }

  if (/^(data:|file:|content:|blob:)/i.test(value)) {
    return value;
  }

  const apiOrigin = getApiOrigin();

  try {
    if (/^https?:\/\//i.test(value)) {
      const parsed = new URL(value);
      if (isPrivateNetworkHost(parsed.hostname) && apiOrigin) {
        const replacement = new URL(apiOrigin);
        return `${replacement.origin}${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
      return parsed.toString();
    }

    if (value.startsWith('/')) {
      return apiOrigin ? `${apiOrigin}${value}` : value;
    }

    return apiOrigin ? `${apiOrigin}/${value.replace(/^\/+/, '')}` : value;
  } catch {
    return value;
  }
}
