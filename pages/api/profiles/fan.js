// Fan profile preferences (own profile only).
import { ok, fail, asyncHandler } from '../../../lib/api';
import { rateLimit } from '../../../lib/rate-limit';
import { fanProfileSchema } from '../../../lib/validate';
import { supabaseAdmin } from '../../../lib/supabase/server';
import { getUserFromRequest, getProfileForUser } from '../../../lib/auth';

const handler = asyncHandler(async (req, res) => {
  if (req.method !== 'PUT') return fail(res, 405, 'Method not allowed');

  const limited = rateLimit(req, { limit: 30, windowMs: 10 * 60_000 });
  if (limited) return fail(res, 429, 'Too many requests', { retryAfter: limited.retryAfter });

  const user = await getUserFromRequest(req);
  if (!user) return fail(res, 401, 'Please sign in.');
  const profile = await getProfileForUser(user);
  if (!profile) return fail(res, 404, 'Profile not found');

  const parsed = fanProfileSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail(res, 400, first ? first.message : 'Invalid details');
  }
  const input = parsed.data;

  const supabase = supabaseAdmin();
  if (!supabase) return fail(res, 503, 'Backend not configured');

  const { data: existing } = await supabase
    .from('fan_profiles')
    .select('*')
    .eq('profile_id', profile.user_id)
    .maybeSingle();

  const db = {
    follow_fighters: input.followFighters,
    follow_events: input.followEvents,
    preferred_weight_classes: input.preferredWeightClasses || [],
    preferred_countries: input.preferredCountries || [],
  };

  let row;
  if (existing) {
    const { data, error } = await supabase
      .from('fan_profiles')
      .update(db)
      .eq('profile_id', profile.user_id)
      .select('*')
      .single();
    if (error) return fail(res, 400, error.message);
    row = data;
  } else {
    const { data, error } = await supabase
      .from('fan_profiles')
      .insert({ profile_id: profile.user_id, ...db })
      .select('*')
      .single();
    if (error) return fail(res, 400, error.message);
    row = data;
  }

  return ok(res, { updated: true, fan: row });
});

export default handler;