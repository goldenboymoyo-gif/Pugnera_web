// In-memory sliding-window rate limiter for API routes.
//
// Suitable for a single Node process. When the app is scaled horizontally or
// moved behind multiple instances, swap this for a shared store (Redis, the
// platform's own rate limiter) — the call sites in pages/api only rely on the
// exported `rateLimit(req, options)` signature, so the change is contained.

const buckets = new Map();

function prune(now) {
  for (const [key, meta] of buckets) {
    if (meta.resetAt <= now) buckets.delete(key);
  }
  if (buckets.size > 10000) {
    // Defensive cap so an abusive spread of keys cannot grow memory unbounded.
    buckets.clear();
  }
}

/**
 * @returns {null | {remaining:number, retryAfter:number}} null when allowed,
 * otherwise the number of seconds until the caller can retry.
 */
function rateLimit(req, { limit = 60, windowMs = 60000 } = {}) {
  const now = Date.now();
  prune(now);

  const clientIp = require('./api').clientIp(req) || 'unknown';
  const key = `${req.method}:${req._parsedUrl ? req._parsedUrl.pathname : req.url}:${clientIp}`;

  let entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt: now + windowMs };
    buckets.set(key, entry);
  }

  entry.count += 1;

  if (entry.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((entry.resetAt - now) / 1000));
    return { remaining: 0, retryAfter };
  }

  return null;
}

module.exports = { rateLimit };