/**
 * Sanitizes a redirect target to ensure it is a safe, internal relative path.
 * Precludes Open Redirects (schemes, double-slash, backslash) and auth route loops (/login, /cadastro).
 *
 * @param target - Raw redirect candidate string
 * @returns Safe path string (defaults to '/' if target is invalid or insecure)
 */
export function sanitizeRedirect(target: string | null | undefined): string {
  if (!target || typeof target !== 'string') {
    return '/';
  }

  const trimmed = target.trim();

  // Must start with exactly one '/' and not '//'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return '/';
  }

  // Block backslash characters used in path/scheme confusion tricks (e.g., /\evil.com)
  if (trimmed.includes('\\')) {
    return '/';
  }

  // Block any scheme declarations (e.g., javascript:, data:, https:)
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed) || /javascript:/i.test(trimmed) || /data:/i.test(trimmed)) {
    return '/';
  }

  // Extract base pathname without search parameters or hash to inspect route
  const pathOnly = trimmed.split('?')[0]?.split('#')[0] ?? '';
  const normalizedPath = pathOnly.toLowerCase().replace(/\/+$/, '');

  // Prevent authentication loops
  if (normalizedPath === '/login' || normalizedPath === '/cadastro') {
    return '/';
  }

  return trimmed;
}

/**
 * Normalizes user email address by trimming surrounding whitespace and converting to lowercase.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalizes username by trimming surrounding whitespace and converting to lowercase.
 */
export function normalizeUsername(username: string): string {
  return username.trim().toLowerCase();
}
