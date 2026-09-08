// Username availability check used by the registration form.
import { ok, fail, asyncHandler } from '../../../lib/api';
import { rateLimit } from '../../../lib/rate-limit';
import { supabaseAdmin } from '../../../lib/supabase/server';

const handler = asyncHandler(async (req, res) => {
  if (req.method !== 'GET') return fail(res, 405, 'Method not allowed');

  const username = (req.query.username || '').trim().toLowerCase();
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return fail(res, 400, 'Usernames use 3-30 lowercase letters, numbers and underscores');
  }

  const limited = rateLimit(req, { limit: 60, windowMs: 60_000 });
  if (limited) return fail(res, 429, 'Too many requests', { retryAfter: limited.retryAfter });

  const supabase = supabaseAdmin();
  if (!supabase) {
    return ok(res, { available: true, source: 'static' });
  }

  const { data } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('username', username)
    .maybeSingle();

  return ok(res, { available: !data, source: 'db' });
});

export default handler;