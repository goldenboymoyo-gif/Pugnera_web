// Server-side registration.
//
// Signups go through the service role so we can:
//   * validate input with the shared Zod schema,
//   * set resolved user_metadata (the DB trigger derives the profiles row
//     from it and only accepts fan/boxer),
//   * honour SUPABASE_AUTO_CONFIRM=true for local development.
//
// Account type "admin" is impossible here and at the database trigger layer.
import { ok, fail, asyncHandler } from '../../../lib/api';
import { rateLimit } from '../../../lib/rate-limit';
import { registerSchema } from '../../../lib/validate';
import { supabaseAdmin } from '../../../lib/supabase/server';

const handler = asyncHandler(async (req, res) => {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');

  const limited = rateLimit(req, { limit: 10, windowMs: 10 * 60_000 });
  if (limited) return fail(res, 429, 'Too many signup attempts. Try again shortly.', { retryAfter: limited.retryAfter });

  const supabase = supabaseAdmin();
  if (!supabase) {
    return fail(res, 503, 'Registration is temporarily unavailable. Please check that the backend is configured.');
  }

  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail(res, 400, first ? first.message : 'Invalid details');
  }
  const { email, password, username, fullName, accountType } = parsed.data;

  // Pre-check username (defence in depth; profiles.username unique still
  // protects the race condition at the database level).
  const { data: existing } = await supabase
    .from('profiles')
    .select('user_id')
    .eq('username', username)
    .maybeSingle();
  if (existing) {
    return fail(res, 409, 'That username is already taken.');
  }

  const autoConfirm = process.env.SUPABASE_AUTO_CONFIRM === 'true';

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: autoConfirm,
    user_metadata: {
      username,
      full_name: fullName,
      account_type: accountType,
    },
  });

  if (error) {
    const message = error.message || 'Could not create account';
    if (message.toLowerCase().includes('already registered') || message.toLowerCase().includes('already been registered')) {
      return fail(res, 409, 'An account with this email already exists.');
    }
    return fail(res, 400, message);
  }

  return ok(res, {
    id: data.user && data.user.id,
    requiresEmailConfirmation: !autoConfirm,
  });
});

export default handler;