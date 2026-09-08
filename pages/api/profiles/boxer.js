// Boxer profile completion/editing (own profile only).
import { ok, fail, asyncHandler } from '../../../lib/api';
import { rateLimit } from '../../../lib/rate-limit';
import { boxerProfileSchema } from '../../../lib/validate';
import { supabaseAdmin } from '../../../lib/supabase/server';
import { getUserFromRequest, getProfileForUser } from '../../../lib/auth';

const ALLOWED = {
  boxingName: 'boxing_name',
  country: 'country_code',
  weightClass: 'weight_class',
  heightCm: 'height_cm',
  reachCm: 'reach_cm',
  gym: 'gym',
  proDebut: 'pro_debut',
  bio: 'bio',
  socialLinks: 'social_links',
};

const handler = asyncHandler(async (req, res) => {
  if (req.method !== 'PUT') return fail(res, 405, 'Method not allowed');

  const limited = rateLimit(req, { limit: 30, windowMs: 10 * 60_000 });
  if (limited) return fail(res, 429, 'Too many requests', { retryAfter: limited.retryAfter });

  const user = await getUserFromRequest(req);
  if (!user) return fail(res, 401, 'Please sign in.');
  const profile = await getProfileForUser(user);
  if (!profile) return fail(res, 404, 'Profile not found');

  const parsed = boxerProfileSchema.safeParse(req.body || {});
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return fail(res, 400, first ? first.message : 'Invalid details');
  }

  const input = parsed.data;
  const db = {};
  Object.keys(ALLOWED).forEach((key) => {
    if (input[key] === undefined) return;
    const col = ALLOWED[key];
    if (key === 'socialLinks') {
      db[col] = Array.isArray(input[key]) ? input[key] : [];
    } else if (key === 'heightCm' || key === 'reachCm' || key === 'proDebut') {
      db[col] = input[key] === null ? null : input[key];
    } else {
      db[col] = input[key];
    }
  });

  // Empty strings for reference columns must become NULL (they are FKs).
  ['weight_class', 'country_code'].forEach((col) => {
    if (db[col] === '') delete db[col];
  });

  if (Object.keys(db).length === 0) {
    return ok(res, { updated: false });
  }

  const supabase = supabaseAdmin();
  if (!supabase) return fail(res, 503, 'Backend not configured');

  // The UI sends weight class *names* (e.g. "Super Lightweight"); the schema
  // stores reference codes. Resolve before writing.
  let weightClass = input.weightClass;
  if (weightClass) {
    const { data: wc } = await supabase
      .from('weight_classes')
      .select('code')
      .eq('name', weightClass)
      .maybeSingle();
    if (!wc) {
      const { data: byCode } = await supabase
        .from('weight_classes')
        .select('code')
        .eq('code', weightClass)
        .maybeSingle();
      if (!byCode) return fail(res, 400, 'Unknown weight class');
    }
    weightClass = wc ? wc.code : weightClass;
    db.weight_class = weightClass;
  }

  const { data: existing } = await supabase
    .from('boxer_profiles')
    .select('*')
    .eq('profile_id', profile.user_id)
    .maybeSingle();

  let row;
  if (existing) {
    const { data, error } = await supabase
      .from('boxer_profiles')
      .update(db)
      .eq('profile_id', profile.user_id)
      .select('*')
      .single();
    if (error) return fail(res, 400, error.message);
    row = data;
  } else {
    const { data, error } = await supabase
      .from('boxer_profiles')
      .insert({ profile_id: profile.user_id, ...db })
      .select('*')
      .single();
    if (error) return fail(res, 400, error.message);
    row = data;
  }

  return ok(res, {
    updated: true,
    fighter: {
      id: row.id,
      status: row.status,
      recordSource: row.record_source,
      verified: row.verified,
      boxingName: row.boxing_name,
      weightClass: row.weight_class,
      country: row.country_code,
    },
  });
});

export default handler;