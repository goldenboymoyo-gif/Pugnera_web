const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  registerSchema,
  boxerProfileSchema,
  fanProfileSchema,
  captainSchema,
  fightSchema,
  rankingSchema,
  followSchema,
  statusChangeSchema,
  recordSchema,
  verifySchema,
  roleGrantSchema,
  slugSchema,
} = require('../lib/validate');

const validRegister = {
  email: 'Boxer@Example.com',
  password: 'longenough123',
  username: 'Boxer_01',
  fullName: 'Jane Doe',
  accountType: 'boxer',
};

test('registerSchema accepts a valid registration and normalizes', () => {
  const r = registerSchema.safeParse(validRegister);
  assert.equal(r.success, true);
  assert.equal(r.data.email, 'boxer@example.com');
  assert.equal(r.data.username, 'boxer_01');
});

test('registerSchema rejects an invalid email', () => {
  const r = registerSchema.safeParse({ ...validRegister, email: 'nope' });
  assert.equal(r.success, false);
});

test('registerSchema rejects a short password', () => {
  const r = registerSchema.safeParse({ ...validRegister, password: 'short' });
  assert.equal(r.success, false);
});

test('registerSchema rejects a bad username', () => {
  const r = registerSchema.safeParse({ ...validRegister, username: 'CamelCase Bad!' });
  assert.equal(r.success, false);
});

test('registerSchema rejects an unknown account type', () => {
  const r = registerSchema.safeParse({ ...validRegister, accountType: 'admin' });
  assert.equal(r.success, false);
});

test('boxerProfileSchema accepts a minimal profile', () => {
  const r = boxerProfileSchema.safeParse({ country: 'US', weightClass: 'middleweight' });
  assert.equal(r.success, true);
});

test('boxerProfileSchema rejects a bad country code', () => {
  const r = boxerProfileSchema.safeParse({ country: 'USA' });
  assert.equal(r.success, false);
});

test('boxerProfileSchema rejects out-of-range height', () => {
  const r = boxerProfileSchema.safeParse({ heightCm: 500 });
  assert.equal(r.success, false);
});

test('fanProfileSchema accepts optional arrays', () => {
  const r = fanProfileSchema.safeParse({ followFighters: true, preferredCountries: ['US', 'GB'] });
  assert.equal(r.success, true);
});

test('fanProfileSchema rejects invalid country codes in prefs', () => {
  const r = fanProfileSchema.safeParse({ preferredCountries: ['France'] });
  assert.equal(r.success, false);
});

test('fightSchema accepts a valid fight', () => {
  const r = fightSchema.safeParse({
    title: 'Alvarez v Mbilli',
    date: '2026-12-05',
    status: 'scheduled',
    country: 'GB',
  });
  assert.equal(r.success, true);
});

test('fightSchema rejects a malformed date', () => {
  const r = fightSchema.safeParse({ date: '12/05/2026' });
  assert.equal(r.success, false);
});

test('fightSchema rejects a non-uuid boxer', () => {
  const r = fightSchema.safeParse({ boxer1: 'not-a-uuid' });
  assert.equal(r.success, false);
});

test('captainSchema accepts announced/completed statuses', () => {
  for (const status of ['announced', 'completed', 'published', 'draft', 'cancelled']) {
    const r = captainSchema.safeParse({ name: 'Fight Night', status });
    assert.equal(r.success, true, `status ${status} should be accepted`);
  }
});

test('captainSchema rejects an unknown status', () => {
  const r = captainSchema.safeParse({ name: 'Fight Night', status: 'nuked' });
  assert.equal(r.success, false);
});

test('rankingSchema accepts quarterly periods', () => {
  const r = rankingSchema.safeParse({
    weightClass: 'heavyweight',
    position: 1,
    boxerProfile: '00000000-0000-0000-0000-000000000000',
    period: '2026-Q3',
  });
  assert.equal(r.success, true);
});

test('rankingSchema rejects a garbage period', () => {
  const r = rankingSchema.safeParse({
    weightClass: 'heavyweight',
    position: 1,
    boxerProfile: '00000000-0000-0000-0000-000000000000',
    period: 'next week',
  });
  assert.equal(r.success, false);
});

test('rankingSchema rejects a zero position', () => {
  const r = rankingSchema.safeParse({
    weightClass: 'heavyweight',
    position: 0,
    boxerProfile: '00000000-0000-0000-0000-000000000000',
    period: '2026-Q3',
  });
  assert.equal(r.success, false);
});

test('followSchema accepts valid follow targets', () => {
  assert.equal(followSchema.safeParse({ followType: 'fighter', targetId: 'boxer_01' }).success, true);
  assert.equal(followSchema.safeParse({ followType: 'country', targetId: 'GB' }).success, true);
});

test('followSchema rejects an unknown follow type', () => {
  assert.equal(followSchema.safeParse({ followType: 'planet', targetId: 'x' }).success, false);
});

test('statusChangeSchema accepts pending/approved/rejected/suspended', () => {
  for (const status of ['pending', 'approved', 'rejected', 'suspended']) {
    const r = statusChangeSchema.safeParse({ status });
    assert.equal(r.success, true, `status ${status} should be accepted`);
  }
});

test('recordSchema accepts an official 20-0-1 record', () => {
  const r = recordSchema.safeParse({ wins: 20, losses: 0, draws: 1, kos: 14, source: 'official' });
  assert.equal(r.success, true);
});

test('recordSchema rejects negative losses', () => {
  assert.equal(recordSchema.safeParse({ losses: -1 }).success, false);
});

test('verifySchema is strict about booleans', () => {
  assert.equal(verifySchema.safeParse({ verified: true }).success, true);
  assert.equal(verifySchema.safeParse({ verified: 'yes' }).success, false);
});

test('roleGrantSchema accepts valid roles only', () => {
  assert.equal(roleGrantSchema.safeParse({ userId: '00000000-0000-0000-0000-000000000000', role: 'admin' }).success, true);
  assert.equal(roleGrantSchema.safeParse({ userId: '00000000-0000-0000-0000-000000000000', role: 'superuser' }).success, false);
});

test('slugSchema slugifies and strips unsafe characters', () => {
  const r = slugSchema.safeParse('Canelo Ãlvarez: The Undisputed!');
  assert.equal(r.success, true);
  assert.equal(r.data, 'canelo-lvarez-the-undisputed');
});