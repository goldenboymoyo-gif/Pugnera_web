// Mirrors the client Supabase session into an httpOnly cookie so server-side
// code can authenticate via getUser(accessToken). Called by SessionBridge on
// every session change / refresh, and on logout (accessToken: null).
import { ok, fail, asyncHandler } from '../../../lib/api';
import { rateLimit } from '../../../lib/rate-limit';
import { getUserFromToken, SESSION_COOKIE, cookieOptions } from '../../../lib/auth';

const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function serializeCookie(name, value, opts) {
  const parts = [`${name}=${encodeURIComponent(value || '')}`];
  if (opts.path) parts.push(`Path=${opts.path}`);
  if (opts.httpOnly) parts.push('HttpOnly');
  if (opts.sameSite) parts.push(`SameSite=${opts.sameSite}`);
  if (opts.maxAge) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.secure) parts.push('Secure');
  return parts.join('; ');
}

const handler = asyncHandler(async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method === 'POST') {
    const limited = rateLimit(req, { limit: 120, windowMs: 60_000 });
    if (limited) return fail(res, 429, 'Too many requests', { retryAfter: limited.retryAfter });

    const { accessToken } = req.body || {};

    if (!accessToken || typeof accessToken !== 'string') {
      // Treat as explicit logout: clear the cookie.
      res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE, '', { ...cookieOptions(), maxAge: 0 }));
      return ok(res, { authenticated: false });
    }

    const user = await getUserFromToken(accessToken);
    if (!user) {
      return fail(res, 401, 'Invalid session', { authenticated: false });
    }

    res.setHeader(
      'Set-Cookie',
      serializeCookie(SESSION_COOKIE, accessToken, { ...cookieOptions(), maxAge: MAX_AGE })
    );
    return ok(res, { authenticated: true, user: { id: user.id, email: user.email } });
  }

  if (req.method === 'DELETE') {
    res.setHeader('Set-Cookie', serializeCookie(SESSION_COOKIE, '', { ...cookieOptions(), maxAge: 0 }));
    return ok(res, { authenticated: false });
  }

  return fail(res, 405, 'Method not allowed');
});

export default handler;