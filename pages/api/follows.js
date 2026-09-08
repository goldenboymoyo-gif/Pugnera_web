// Follow/unfollow for fans (own rows only).
import { ok, fail, asyncHandler } from '../../lib/api';
import { rateLimit } from '../../lib/rate-limit';
import { followSchema } from '../../lib/validate';
import { supabaseAdmin } from '../../lib/supabase/server';
import { getUserFromRequest, getProfileForUser } from '../../lib/auth';

async function targetExists(supabase, followType, targetId) {
  if (followType === 'fighter') {
    const { data } = await supabase.from('boxer_profiles').select('id').eq('id', targetId).eq('status', 'approved').maybeSingle();
    return !!data;
  }
  if (followType === 'event') {
    const { data } = await supabase.from('events').select('id').eq('id', targetId).eq('status', 'published').maybeSingle();
    return !!data;
  }
  if (followType === 'weight_class') {
    const { data } = await supabase.from('weight_classes').select('code').eq('code', targetId).maybeSingle();
    return !!data;
  }
  if (followType === 'country') {
    const { data } = await supabase.from('countries').select('code').eq('code', targetId.toUpperCase()).maybeSingle();
    return !!data;
  }
  return false;
}

const handler = asyncHandler(async (req, res) => {
  const limited = rateLimit(req, { limit: 120, windowMs: 60_000 });
  if (limited) return fail(res, 429, 'Too many requests', { retryAfter: limited.retryAfter });

  const user = await getUserFromRequest(req);
  if (!user) return fail(res, 401, 'Please sign in.');

  const supabase = supabaseAdmin();
  if (!supabase) return fail(res, 503, 'Backend not configured');

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', user.id)
      .order('created_at', { ascending: false });
    if (error) return fail(res, 400, error.message);
    return ok(res, { follows: data || [] });
  }

  if (req.method === 'POST') {
    const parsed = followSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const { followType, targetId } = parsed.data;

    if (!(await targetExists(supabase, followType, targetId))) {
      return fail(res, 404, 'Target not found');
    }

    const { error } = await supabase
      .from('follows')
      .insert({ follower_id: user.id, follow_type: followType, target_id: targetId })
      .onConflict(['follower_id', 'follow_type', 'target_id'])
      .ignore();
    if (error) return fail(res, 400, error.message);

    return ok(res, { followed: true });
  }

  if (req.method === 'DELETE') {
    const parsed = followSchema.safeParse({
      followType: req.query.type,
      targetId: req.query.target,
    });
    if (!parsed.success) return fail(res, 400, 'Invalid request');
    const { followType, targetId } = parsed.data;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('follow_type', followType)
      .eq('target_id', targetId);
    if (error) return fail(res, 400, error.message);

    return ok(res, { followed: false });
  }

  return fail(res, 405, 'Method not allowed');
});

export default handler;