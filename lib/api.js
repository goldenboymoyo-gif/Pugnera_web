// Small shared helpers for Next.js API routes.

function send(res, status, body) {
  res.status(status).json(body);
}

function ok(res, data, extra) {
  send(res, 200, { ok: true, ...(data || {}), ...(extra || {}) });
}

function fail(res, status, message, extra) {
  send(res, status, { ok: false, error: message, ...(extra || {}) });
}

// Wraps an async handler so thrown errors become clean 500 responses instead
// of crashing the server. Never leaks stack traces or internals.
function asyncHandler(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (err) {
      const msg = err && err.message ? err.message : 'Internal server error';
      if (process.env.NODE_ENV !== 'production') {
        console.error('[api]', req.method, req.url, err);
      }
      fail(res, 500, msg);
    }
  };
}

function clientIp(req) {
  return (
    (req.headers && (req.headers['x-forwarded-for'] || '').split(',')[0].trim()) ||
    (req && req.socket && req.socket.remoteAddress) ||
    'unknown'
  );
}

module.exports = { send, ok, fail, asyncHandler, clientIp };