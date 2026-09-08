// Admin API. Catch-all: /api/admin/<resource>[/<id>[/<action>]]
//
// Every handler first requires a valid session cookie AND membership in
// public.admin_roles (checked server-side, never via the UI). Mutations also
// require the anti-CSRF header `x-requested-with: pugnera`.
//
// Boxer status/record/verification changes call the SECURITY DEFINER database
// functions with the caller's JWT so RLS + guard triggers + audit logging all
// run correctly. Content tables (events/fights/rankings) are written with the
// service role after this route has verified the caller.
import { ok, fail, asyncHandler } from '../../../lib/api';
import { rateLimit } from '../../../lib/rate-limit';
import { requireAdmin } from '../../../lib/auth';
import { supabaseAdmin } from '../../../lib/supabase/server';
import {
  captainSchema,
  fightSchema,
  rankingSchema,
  statusChangeSchema,
  recordSchema,
  verifySchema,
  roleGrantSchema,
} from '../../../lib/validate';

const { createClient } = require('@supabase/supabase-js');

export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };

function isMutation(method) {
  return method === 'POST' || method === 'PUT' || method === 'DELETE';
}

function authedClient(token) {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}`, 'x-application-name': 'pugnera-admin' } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

async function verifyAdminCall(req) {
  if (isMutation(req.method)) {
    const origin = req.headers.origin;
    if (origin) {
      const host = req.headers.host;
      try {
        if (origin && new URL(origin).host !== host) {
          return { error: 'Cross-origin request rejected', status: 403 };
        }
      } catch (err) {
        return { error: 'Invalid origin', status: 400 };
      }
    }
    if (req.headers['x-requested-with'] !== 'pugnera') {
      return { error: 'Missing anti-CSRF header', status: 403 };
    }
  }
  return null;
}

// --- loading helpers --------------------------------------------------------

async function loadApprovedBoxerChoices() {
  const supabase = supabaseAdmin();
  const { data } = await supabase.from('boxer_profiles').select('id, boxing_name, profile_id').eq('status', 'approved').order('created_at');
  const ids = (data || []).map((b) => b.profile_id);
  const { data: profiles } = await supabase.from('profiles').select('user_id, username, full_name').in('user_id', ids);
  const pm = {};
  (profiles || []).forEach((p) => {
    pm[p.user_id] = p;
  });
  return (data || []).map((b) => ({
    id: b.id,
    label: b.boxing_name || (pm[b.profile_id] && pm[b.profile_id].full_name) || 'Unnamed boxer',
    username: pm[b.profile_id] && pm[b.profile_id].username,
  }));
}

async function loadWeightClassNames() {
  const supabase = supabaseAdmin();
  const { data } = await supabase.from('weight_classes').select('code, name').order('order_index');
  const m = {};
  (data || []).forEach((w) => {
    m[w.code] = w.name;
  });
  return m;
}

async function loadCountryNames() {
  const supabase = supabaseAdmin();
  const { data } = await supabase.from('countries').select('code, name').order('name');
  return (data || []).map((c) => ({ code: c.code, name: c.name }));
}

// --- resource handlers ------------------------------------------------------

const handlers = {};

handlers.overview = async (supabase) => {
  const count = async (query) => {
    const { count, error } = await query.count({ count: 'exact', head: true });
    return error ? 0 : count || 0;
  };

  const [fans, boxers, pending, scheduled, published, followsTotal, rankings, auditToday] = await Promise.all([
    count(supabase.from('profiles').select('*').eq('account_type', 'fan')),
    count(supabase.from('profiles').select('*').eq('account_type', 'boxer')),
    count(supabase.from('boxer_profiles').select('*').eq('status', 'pending')),
    count(supabase.from('fights').select('*').eq('status', 'scheduled')),
    count(supabase.from('events').select('*').eq('status', 'published')),
    count(supabase.from('follows').select('*')),
    count(supabase.from('rankings').select('*').eq('status', 'active')),
    count(supabase.from('audit_logs').select('*').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())),
  ]);

  const { data: statusCounts } = await supabase.from('boxer_profiles').select('status');
  const byStatus = { pending: 0, approved: 0, rejected: 0, suspended: 0 };
  (statusCounts || []).forEach((r) => {
    if (byStatus[r.status] !== undefined) byStatus[r.status] += 1;
  });

  return {
    fans,
    boxers,
    pendingBoxers: pending,
    boxerByStatus: byStatus,
    scheduledFights: scheduled,
    publishedEvents: published,
    follows: followsTotal,
    activeRankings: rankings,
    auditLast24h: auditToday,
  };
};

handlers.boxers = async (req, res, supabase) => {
  if (req.method === 'GET') {
    const weight = await loadWeightClassNames();
    const { data: rows, error } = await supabase
      .from('boxer_profiles')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) return fail(res, 400, error.message);

    const ids = (rows || []).map((b) => b.profile_id);
    const { data: profiles } = await supabase.from('profiles').select('user_id, username, full_name, email').in('user_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

    const pm = {};
    (profiles || []).forEach((p) => {
      pm[p.user_id] = p;
    });

    return ok(res, {
      boxers: (rows || []).map((b) => ({
        id: b.id,
        profileId: b.profile_id,
        username: pm[b.profile_id] && pm[b.profile_id].username,
        fullName: pm[b.profile_id] && pm[b.profile_id].full_name,
        email: pm[b.profile_id] && pm[b.profile_id].email,
        boxingName: b.boxing_name,
        weightClass: b.weight_class,
        weightClassLabel: b.weight_class ? weight[b.weight_class] : null,
        country: b.country_code,
        gym: b.gym,
        proDebut: b.pro_debut,
        wins: b.wins,
        losses: b.losses,
        draws: b.draws,
        kos: b.kos,
        recordSource: b.record_source,
        verified: b.verified,
        status: b.status,
        avatarUrl: b.avatar_url,
        createdAt: b.created_at,
      })),
    });
  }
  return fail(res, 405, 'Method not allowed');
};

handlers.boxerAction = async (req, res, token, { id, action }) => {
  const supabase = supabaseAdmin();
  const client = authedClient(token);
  const body = req.body || {};

  if (action === 'status') {
    const limited = rateLimit(req, { limit: 120, windowMs: 60_000 });
    if (limited) return fail(res, 429, 'Too many requests', { retryAfter: limited.retryAfter });
    const parsed = statusChangeSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const { data, error } = await client.rpc('admin_set_boxer_status', {
      p_boxer: id,
      p_status: parsed.data.status,
      p_note: parsed.data.note || null,
    });
    if (error) return fail(res, 400, error.message);
    return ok(res, { boxer: data });
  }

  if (action === 'record') {
    const parsed = recordSchema.safeParse(body);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const { data, error } = await client.rpc('admin_set_boxer_record', {
      p_boxer: id,
      p_wins: parsed.data.wins,
      p_losses: parsed.data.losses,
      p_draws: parsed.data.draws,
      p_kos: parsed.data.kos,
      p_source: parsed.data.source || 'official',
    });
    if (error) return fail(res, 400, error.message);
    return ok(res, { boxer: data });
  }

  if (action === 'verify') {
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) return fail(res, 400, 'Invalid request');
    const { data, error } = await client.rpc('admin_toggle_verification', {
      p_boxer: id,
      p_verified: parsed.data.verified,
    });
    if (error) return fail(res, 400, error.message);
    return ok(res, { boxer: data });
  }

  return fail(res, 400, 'Unknown action');
};

handlers.fans = async (req, res, supabase) => {
  const { data: rows, error } = await supabase
    .from('fan_profiles')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) return fail(res, 400, error.message);

  const ids = (rows || []).map((f) => f.profile_id);
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username, full_name, account_type')
    .in('user_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

  const pm = {};
  (profiles || []).forEach((p) => {
    pm[p.user_id] = p;
  });

  return ok(res, {
    fans: (rows || []).map((f) => ({
      profileId: f.profile_id,
      username: pm[f.profile_id] && pm[f.profile_id].username,
      fullName: pm[f.profile_id] && pm[f.profile_id].full_name,
      followFighters: f.follow_fighters,
      followEvents: f.follow_events,
      weights: f.preferred_weight_classes,
      countries: f.preferred_countries,
      createdAt: f.created_at,
    })),
  });
};

handlers.users = async (req, res, supabase) => {
  const { data: rows, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) return fail(res, 400, error.message);

  const ids = (rows || []).map((p) => p.user_id);
  const { data: admins } = await supabase
    .from('admin_roles')
    .select('user_id, role')
    .in('user_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);

  const am = {};
  (admins || []).forEach((a) => {
    am[a.user_id] = a;
  });

  return ok(res, {
    users: (rows || []).map((p) => ({
      userId: p.user_id,
      username: p.username,
      fullName: p.full_name,
      accountType: p.account_type,
      avatarUrl: p.avatar_url,
      adminRole: am[p.user_id] ? am[p.user_id].role : null,
      createdAt: p.created_at,
    })),
  });
};

handlers.usersAction = async (req, res, token, supabase, { userId, action }) => {
  const client = authedClient(token);

  if (action === 'grant') {
    const parsed = roleGrantSchema.safeParse({ userId, role: req.body && req.body.role });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const { error } = await client.rpc('admin_grant_role', { p_user: userId, p_role: parsed.data.role });
    if (error) return fail(res, 400, error.message);
    return ok(res, { granted: true, role: parsed.data.role });
  }

  if (action === 'revoke') {
    const { error } = await client.rpc('admin_revoke_role', { p_user: userId });
    if (error) return fail(res, 400, error.message);
    return ok(res, { revoked: true });
  }

  return fail(res, 400, 'Unknown action');
};

handlers.fights = async (req, res, supabase) => {
  if (req.method === 'GET') {
    const weight = await loadWeightClassNames();
    const { data: rows, error } = await supabase.from('fights').select('*').order('date', { ascending: false, nullsFirst: false });
    if (error) return fail(res, 400, error.message);

    const boxerIds = [...new Set((rows || []).flatMap((f) => [f.boxer1_profile, f.boxer2_profile]).filter(Boolean))];
    const { data: boxers } = await supabase
      .from('boxer_profiles')
      .select('id, boxing_name, profile_id')
      .in('id', boxerIds.length ? boxerIds : ['00000000-0000-0000-0000-000000000000']);
    const bm = {};
    (boxers || []).forEach((b) => {
      bm[b.id] = b;
    });

    const eventIds = [...new Set((rows || []).map((f) => f.event_id).filter(Boolean))];
    const { data: events } = await supabase
      .from('events')
      .select('id, name')
      .in('id', eventIds.length ? eventIds : ['00000000-0000-0000-0000-000000000000']);
    const em = {};
    (events || []).forEach((e) => {
      em[e.id] = e;
    });

    return ok(res, {
      fights: (rows || []).map((f) => ({
        id: f.id,
        slug: f.slug,
        title: f.title,
        eventId: f.event_id,
        eventName: f.event_id ? (em[f.event_id] || {}).name : null,
        boxer1: f.boxer1_profile,
        boxer1Label: f.boxer1_profile ? bm[f.boxer1_profile] && (bm[f.boxer1_profile].boxing_name || bm[f.boxer1_profile].boxing_name) : null,
        boxer2: f.boxer2_profile,
        boxer2Label: f.boxer2_profile ? bm[f.boxer2_profile] && (bm[f.boxer2_profile].boxing_name || 'Boxer 2') : null,
        weightClass: f.weight_class,
        weightClassLabel: f.weight_class ? weight[f.weight_class] : null,
        date: f.date,
        venue: f.venue,
        country: f.country_code,
        status: f.status,
        resultMethod: f.result_method,
        resultRound: f.result_round,
        resultWinner: f.result_winner,
        videoRef: f.video_ref,
        createdAt: f.created_at,
      })),
    });
  }

  if (req.method === 'POST') {
    const parsed = fightSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const v = parsed.data;
    const slug = (v.title || `fight-${Date.now()}`).toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s/]+/g, '-').replace(/-+/g, '-');

    const { data, error } = await supabase.from('fights').insert({
      slug,
      title: v.title || 'Fight night',
      event_id: v.eventId || null,
      boxer1_profile: v.boxer1 || null,
      boxer2_profile: v.boxer2 || null,
      weight_class: v.weightClass || null,
      date: v.date || null,
      venue: v.venue || null,
      country_code: v.country || null,
      status: v.status || 'scheduled',
      result_winner: v.resultWinner || null,
      result_method: v.resultMethod || null,
      result_round: v.resultRound || null,
      video_ref: v.videoRef || null,
    }).select('*').single();
    if (error) return fail(res, 400, error.message);

    await supabase.from('audit_logs').insert({
      actor_id: res.locals && res.locals.adminUserId,
      action: 'fight.create',
      target_type: 'fight',
      target_id: data.id,
      metadata: { title: data.title },
    });

    return ok(res, { fight: data });
  }

  return fail(res, 405, 'Method not allowed');
};

handlers.fightAction = async (req, res, supabase, { id, method }) => {
  if (method === 'DELETE') {
    const { error } = await supabase.from('fights').delete().eq('id', id);
    if (error) return fail(res, 400, error.message);
    return ok(res, { deleted: true });
  }

  if (method === 'PUT') {
    const parsed = fightSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const v = parsed.data;
    const patch = {
      title: v.title,
      event_id: v.eventId,
      boxer1_profile: v.boxer1,
      boxer2_profile: v.boxer2,
      weight_class: v.weightClass,
      date: v.date,
      venue: v.venue,
      country_code: v.country,
      status: v.status,
      result_winner: v.resultWinner,
      result_method: v.resultMethod,
      result_round: v.resultRound,
      video_ref: v.videoRef,
    };
    Object.keys(patch).forEach((k) => {
      if (patch[k] === undefined) delete patch[k];
    });

    const { data, error } = await supabase.from('fights').update(patch).eq('id', id).select('*').single();
    if (error) return fail(res, 400, error.message);
    return ok(res, { fight: data });
  }

  return fail(res, 405, 'Method not allowed');
};

handlers.events = async (req, res, supabase, resLocals) => {
  if (req.method === 'GET') {
    const { data: rows, error } = await supabase.from('events').select('*').order('date', { ascending: false, nullsFirst: false });
    if (error) return fail(res, 400, error.message);

    const ids = (rows || []).map((e) => e.id);
    const { data: fightCounts } = await supabase
      .from('fights')
      .select('event_id, id')
      .in('event_id', ids.length ? ids : ['00000000-0000-0000-0000-000000000000']);
    const counts = {};
    (fightCounts || []).forEach((f) => {
      counts[f.event_id] = (counts[f.event_id] || 0) + 1;
    });

    return ok(res, {
      events: (rows || []).map((e) => ({
        id: e.id,
        slug: e.slug,
        name: e.name,
        date: e.date,
        time: e.time,
        venue: e.venue,
        city: e.city,
        country: e.country_code,
        posterUrl: e.poster_url,
        blurb: e.blurb,
        status: e.status,
        fightCount: counts[e.id] || 0,
        createdAt: e.created_at,
      })),
    });
  }

  if (req.method === 'POST') {
    const parsed = captainSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const v = parsed.data;
    const slug = v.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/[\s/]+/g, '-').replace(/-+/g, '-');

    const { data, error } = await supabase.from('events').insert({
      slug,
      name: v.name,
      date: v.date || null,
      time: v.time || null,
      venue: v.venue || null,
      city: v.city || null,
      country_code: v.country || null,
      blurb: v.blurb || null,
      poster_url: v.posterUrl || null,
      status: v.status || 'draft',
      created_by: resLocals.adminUserId,
    }).select('*').single();
    if (error) return fail(res, 400, error.message);

    await supabase.from('audit_logs').insert({
      actor_id: resLocals.adminUserId,
      action: 'event.create',
      target_type: 'event',
      target_id: data.id,
      metadata: { name: data.name, status: data.status },
    });

    return ok(res, { event: data });
  }

  return fail(res, 405, 'Method not allowed');
};

handlers.eventAction = async (req, res, supabase, resLocals, { id, method }) => {
  if (method === 'DELETE') {
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) return fail(res, 400, error.message);
    return ok(res, { deleted: true });
  }

  if (method === 'PUT') {
    const parsed = captainSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const v = parsed.data;
    const patch = {
      name: v.name,
      date: v.date,
      time: v.time,
      venue: v.venue,
      city: v.city,
      country_code: v.country,
      blurb: v.blurb,
      poster_url: v.posterUrl,
      status: v.status,
    };
    Object.keys(patch).forEach((k) => {
      if (patch[k] === undefined) delete patch[k];
    });

    const { data, error } = await supabase.from('events').update(patch).eq('id', id).select('*').single();
    if (error) return fail(res, 400, error.message);
    return ok(res, { event: data });
  }

  return fail(res, 405, 'Method not allowed');
};

handlers.rankings = async (req, res, supabase, resLocals) => {
  if (req.method === 'GET') {
    const weight = await loadWeightClassNames();
    const { data: rows, error } = await supabase.from('rankings').select('*').order('created_at', { ascending: false }).limit(500);
    if (error) return fail(res, 400, error.message);

    const boxerIds = [...new Set((rows || []).map((r) => r.boxer_profile).filter(Boolean))];
    const { data: boxers } = await supabase
      .from('boxer_profiles')
      .select('id, boxing_name, profile_id')
      .in('id', boxerIds.length ? boxerIds : ['00000000-0000-0000-0000-000000000000']);
    const bm = {};
    (boxers || []).forEach((b) => {
      bm[b.id] = b;
    });

    return ok(res, {
      rankings: (rows || []).map((r) => ({
        id: r.id,
        weightClass: r.weight_class,
        weightClassLabel: r.weight_class ? weight[r.weight_class] : null,
        position: r.position,
        boxerProfile: r.boxer_profile,
        boxerLabel: bm[r.boxer_profile] && bm[r.boxer_profile].boxing_name,
        period: r.period,
        source: r.source,
        status: r.status,
        createdAt: r.created_at,
      })),
    });
  }

  if (req.method === 'POST') {
    const parsed = rankingSchema.safeParse(req.body || {});
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const v = parsed.data;
    const { data, error } = await supabase.from('rankings').insert({
      weight_class: v.weightClass,
      position: v.position,
      boxer_profile: v.boxerProfile,
      period: v.period,
      source: v.source || null,
      status: v.status || 'active',
      created_by: resLocals.adminUserId,
    }).select('*').single();
    if (error) return fail(res, 400, error.message);

    await supabase.from('audit_logs').insert({
      actor_id: resLocals.adminUserId,
      action: 'ranking.create',
      target_type: 'ranking',
      target_id: data.id,
      metadata: { weight_class: data.weight_class, position: data.position, period: data.period },
    });

    return ok(res, { ranking: data });
  }

  return fail(res, 405, 'Method not allowed');
};

handlers.rankingAction = async (req, res, supabase, resLocals, { id, method }) => {
  if (method === 'DELETE') {
    const { error } = await supabase.from('rankings').delete().eq('id', id);
    if (error) return fail(res, 400, error.message);
    return ok(res, { deleted: true });
  }

  if (method === 'PUT') {
    const parsed = rankingSchema.partial().safeParse(req.body || {});
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return fail(res, 400, first ? first.message : 'Invalid request');
    }
    const v = parsed.data;
    const patch = {
      weight_class: v.weightClass,
      position: v.position,
      boxer_profile: v.boxerProfile,
      period: v.period,
      source: v.source,
      status: v.status,
    };
    Object.keys(patch).forEach((k) => {
      if (patch[k] === undefined) delete patch[k];
    });

    const { data, error } = await supabase.from('rankings').update(patch).eq('id', id).select('*').single();
    if (error) return fail(res, 400, error.message);
    return ok(res, { ranking: data });
  }

  return fail(res, 405, 'Method not allowed');
};

handlers.audit = async (req, res, supabase) => {
  const { data: rows, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) return fail(res, 400, error.message);

  const actorIds = [...new Set((rows || []).map((r) => r.actor_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('user_id, username')
    .in('user_id', actorIds.length ? actorIds : ['00000000-0000-0000-0000-000000000000']);
  const pm = {};
  (profiles || []).forEach((p) => {
    pm[p.user_id] = p;
  });

  return ok(res, {
    audit: (rows || []).map((r) => ({
      id: r.id,
      actor: r.actor_id ? ((pm[r.actor_id] || {}).username || r.actor_id) : 'system',
      action: r.action,
      targetType: r.target_type,
      targetId: r.target_id,
      metadata: r.metadata,
      createdAt: r.created_at,
    })),
  });
};

handlers.refdata = async (req, res, supabase) => {
  const [weightClasses, countries, boxerChoices] = await Promise.all([
    supabase.from('weight_classes').select('code, name').order('order_index'),
    loadCountryNames(),
    loadApprovedBoxerChoices(),
  ]);
  return ok(res, {
    weightClasses: weightClasses.data || [],
    countries,
    boxerChoices,
  });
};

// --- router ---------------------------------------------------------------

const handler = asyncHandler(async (req, res) => {
  const limited = rateLimit(req, { limit: 300, windowMs: 60_000 });
  if (limited) return fail(res, 429, 'Too many requests', { retryAfter: limited.retryAfter });

  const csrf = await verifyAdminCall(req);
  if (csrf) return fail(res, csrf.status, csrf.error);

  const { user, role, reason } = await requireAdmin(req);
  if (!user) {
    return fail(res, reason === 'forbidden' ? 403 : 401, reason === 'forbidden' ? 'Administrator access required' : 'Please sign in');
  }

  res.locals = res.locals || {};
  res.locals.adminUserId = user.id;
  res.locals.adminRole = role;

  const supabase = supabaseAdmin();
  if (!supabase) return fail(res, 503, 'Backend not configured');

  const slug = req.query.slug || [];
  const token = require('../../../lib/auth').getTokenFromCookies(req);
  const [resource, id, action] = slug;

  switch (slug.length) {
    case 1:
      if (resource === 'overview' && req.method === 'GET') return ok(res, await handlers.overview(supabase));
      if (resource === 'boxers') return handlers.boxers(req, res, supabase);
      if (resource === 'fans') return handlers.fans(req, res, supabase);
      if (resource === 'users') return handlers.users(req, res, supabase);
      if (resource === 'fights') return handlers.fights(req, res, supabase);
      if (resource === 'events') return handlers.events(req, res, supabase, res.locals);
      if (resource === 'rankings') return handlers.rankings(req, res, supabase, res.locals);
      if (resource === 'audit') return handlers.audit(req, res, supabase);
      if (resource === 'refdata') return handlers.refdata(req, res, supabase);
      break;
    case 2:
      if (resource === 'boxers' && req.method === 'GET') {
        // single boxer detail not currently needed by the dashboard
        return handlers.boxers(req, res, supabase);
      }
      if (resource === 'fights' && id) return handlers.fightAction(req, res, supabase, { id, method: req.method });
      if (resource === 'events' && id) return handlers.eventAction(req, res, supabase, res.locals, { id, method: req.method });
      if (resource === 'rankings' && id) return handlers.rankingAction(req, res, supabase, res.locals, { id, method: req.method });
      break;
    case 3:
      if (resource === 'boxers' && id && action === 'status') return handlers.boxerAction(req, res, token, { id, action: 'status' });
      if (resource === 'boxers' && id && action === 'record') return handlers.boxerAction(req, res, token, { id, action: 'record' });
      if (resource === 'boxers' && id && action === 'verify') return handlers.boxerAction(req, res, token, { id, action: 'verify' });
      if (resource === 'users' && id && action === 'grant') return handlers.usersAction(req, res, token, supabase, { userId: id, action: 'grant' });
      if (resource === 'users' && id && action === 'revoke') return handlers.usersAction(req, res, token, supabase, { userId: id, action: 'revoke' });
      break;
  }

  return fail(res, 404, 'Not found');
});

export default handler;