const { test } = require('node:test');
const assert = require('node:assert/strict');
const { rateLimit } = require('../lib/rate-limit');

function mkReq(method = 'GET', path = '/api/fights', from = '1.2.3.4') {
  return {
    method,
    url: path,
    headers: {
      'x-forwarded-for': from,
      'x-real-ip': from,
    },
    connection: { remoteAddress: from },
  };
}

test('rateLimit allows requests under the limit', () => {
  const req = mkReq('GET', '/api/t-under');
  for (let i = 0; i < 3; i++) {
    assert.equal(rateLimit(req, { limit: 5, windowMs: 60000 }), null);
  }
});

test('rateLimit blocks requests over the limit with retryAfter', () => {
  const req = mkReq('POST', '/api/t-block');
  const calls = Array.from({ length: 4 }, () => rateLimit(req, { limit: 3, windowMs: 60000 }));
  assert.deepEqual(calls.slice(0, 3), [null, null, null]);
  const blocked = calls[3];
  assert.notEqual(blocked, null);
  assert.equal(blocked.remaining, 0);
  assert.ok(blocked.retryAfter >= 1);
});

test('rateLimit buckets are per endpoint and per client', () => {
  const r1 = mkReq('GET', '/api/t-bucket', '10.0.0.1');
  const r2 = mkReq('GET', '/api/t-bucket', '10.0.0.2');
  const r3 = mkReq('GET', '/api/t-bucket-b', '10.0.0.1');
  const opts = { limit: 2, windowMs: 60000 };
  assert.equal(rateLimit(r1, opts), null);
  assert.equal(rateLimit(r2, opts), null);
  assert.equal(rateLimit(r3, opts), null);
  assert.equal(rateLimit(r1, opts), null); // r1 has 2/2
  assert.notEqual(rateLimit(r1, opts), null); // r1 now 3/2 -> blocked
  assert.equal(rateLimit(r2, opts), null); // r2 untouched at 2/2 -> allowed
});

test('rateLimit resets after the window', () => {
  const req = mkReq('GET', '/api/t-window');
  rateLimit(req, { limit: 1, windowMs: 5 });
  assert.notEqual(rateLimit(req, { limit: 1, windowMs: 5 }), null);
  return new Promise((resolve) => setTimeout(resolve, 12)).then(() => {
    assert.equal(rateLimit(req, { limit: 1, windowMs: 5 }), null);
  });
});