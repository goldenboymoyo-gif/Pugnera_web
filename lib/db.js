// Database access for public (read) pages.
//
// The pages that consume this module use getServerSideProps. Reads go through
// the service-role client so they are not subject to client RLS, but the data
// returned is exactly what public RLS policies would expose: approved boxers,
// published events, scheduled/completed fights, active rankings.
//
// Fallback behaviour (documented in docs/BACKEND.md):
//   * Supabase configured  + data present -> database content.
//   * Supabase configured  + no data      -> explicit empty state (never
//     fabricates content).
//   * Supabase NOT configured -> existing static editorial content, so the
//     site keeps working before the backend is connected.
const { fighters, upcomingFights, records } = require('./boxing-data');
const { rankings: staticRankings } = require('./rankings');
const { supabaseAdmin } = require('./supabase/server');

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s/]+/g, '-')
    .replace(/-+/g, '-');

const formatDate = (iso) => {
  if (!iso) return 'TBC';
  const d = new Date(iso + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

const nullish = (v, fallback = '') => (v === null || v === undefined ? fallback : v);

async function loadWeightClasses() {
  const supabase = supabaseAdmin();
  if (!supabase) return { byCode: {}, byName: {} };
  const { data } = await supabase.from('weight_classes').select('*').order('order_index');
  const byCode = {};
  const byName = {};
  (data || []).forEach((wc) => {
    byCode[wc.code] = wc;
    byName[wc.name] = wc;
  });
  return { byCode, byName };
}

function composeBoxer(row, weightClasses, profile) {
  const wc = weightClasses.byCode[row.weight_class];
  const name = (row.boxing_name && row.boxing_name.trim()) || (profile && profile.full_name) || 'Pugnera boxer';
  const record = `${nullish(row.wins, 0)}-${nullish(row.losses, 0)}-${nullish(row.draws, 0)}${
    nullish(row.kos, 0) > 0 ? ` (${row.kos} KO)` : ''
  }`;
  return {
    id: row.id,
    slug: (profile && profile.username) || slugify(name),
    name,
    username: (profile && profile.username) || null,
    fullName: (profile && profile.full_name) || null,
    weight: (wc && wc.name) || null,
    weightClass: row.weight_class,
    country: row.country_code,
    record,
    recordSource: row.record_source,
    verified: !!row.verified,
    status: row.status,
    gym: row.gym,
    proDebut: row.pro_debut,
    bio: row.bio,
    socialLinks: row.social_links || [],
    imageUrl: row.avatar_url || null,
    image: null,
    isDb: true,
  };
}

async function getFighters() {
  const supabase = supabaseAdmin();
  if (!supabase) {
    return { source: 'static', fighters: fighters.map((f) => ({ ...f, isDb: false })) };
  }

  try {
    const weightClasses = await loadWeightClasses();
    const { data: rows, error } = await supabase
      .from('boxer_profiles')
      .select('*')
      .eq('status', 'approved')
      .order('created_at');

    if (error) throw error;

    if (!rows || rows.length === 0) {
      return { source: 'db', fighters: [] };
    }

    const ids = rows.map((r) => r.profile_id);
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('user_id, username, full_name')
      .in('user_id', ids);
    if (pErr) throw pErr;
    const profileMap = {};
    (profiles || []).forEach((p) => {
      profileMap[p.user_id] = p;
    });

    const list = rows
      .map((r) => composeBoxer(r, weightClasses, profileMap[r.profile_id]))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { source: 'db', fighters: list };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[db.getFighters]', err);
    // A misconfigured relationship/query must not take the public page down;
    // degrade to the explicit empty state rather than fabricated content.
    return { source: 'db', fighters: [], error: true };
  }
}

async function getFighter(slug) {
  const supabase = supabaseAdmin();
  if (!supabase) {
    const f = fighters.find((x) => x.slug === slug) || null;
    return f
      ? { source: 'static', fighter: { ...f, isDb: false, record: records[f.name] || null } }
      : { source: 'static', fighter: null };
  }

  try {
    const weightClasses = await loadWeightClasses();
    const { data: rows, error } = await supabase
      .from('boxer_profiles')
      .select('*')
      .eq('status', 'approved');

    if (error) throw error;

    if (!rows || rows.length === 0) return { source: 'db', fighter: null };

    const ids = rows.map((r) => r.profile_id);
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('user_id, username, full_name')
      .in('user_id', ids);
    if (pErr) throw pErr;
    const profileMap = {};
    (profiles || []).forEach((p) => {
      profileMap[p.user_id] = p;
    });

    const row = (rows || []).find((r) => {
      const p = profileMap[r.profile_id];
      if (p && slugify(p.username) === slug) return true;
      if (p && p.username === slug) return true;
      if (r.boxing_name && slugify(r.boxing_name) === slug) return true;
      return r.id === slug;
    });

    if (!row) return { source: 'db', fighter: null };

    const fighter = composeBoxer(row, weightClasses, profileMap[row.profile_id]);
    return { source: 'db', fighter };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[db.getFighter]', err);
    return { source: 'db', fighter: null };
  }
}

async function getRankings() {
  const supabase = supabaseAdmin();
  if (!supabase) {
    return { source: 'static', divisions: staticRankings };
  }

  try {
    const weightClasses = await loadWeightClasses();
    const { data: rows, error } = await supabase
      .from('rankings')
      .select('*')
      .eq('status', 'active')
      .order('period', { ascending: false })
      .order('position');

    if (error) throw error;

    if (!rows || rows.length === 0) {
      return { source: 'db', divisions: [] };
    }

    const boxerIds = [...new Set(rows.map((r) => r.boxer_profile))];
    const { data: boxers, error: bErr } = await supabase
      .from('boxer_profiles')
      .select('*')
      .in('id', boxerIds);
    if (bErr) throw bErr;

    const profileIds = [...new Set((boxers || []).map((b) => b.profile_id))];
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('user_id, username, full_name, account_type')
      .in('user_id', profileIds);
    if (pErr) throw pErr;
    const profileMap = {};
    (profiles || []).forEach((p) => {
      profileMap[p.user_id] = p;
    });

    const boxerMap = {};
    (boxers || []).forEach((b) => {
      boxerMap[b.id] = composeBoxer(b, weightClasses, profileMap[b.profile_id]);
    });

    const period = rows[0].period;
    const byClass = {};
    rows.forEach((r) => {
      if (r.period !== period) return;
      if (!byClass[r.weight_class]) {
        const wc = weightClasses.byCode[r.weight_class];
        byClass[r.weight_class] = {
          id: r.weight_class,
          name: (wc && wc.name) || r.weight_class,
          source: `Pugnera rankings — ${period}`,
          entries: [],
        };
      }
      const bx = boxerMap[r.boxer_profile];
      if (!bx) return; // boxer no longer active/approved
      byClass[r.weight_class].entries.push({
        rank: r.position,
        name: bx.name,
        country: bx.country || '—',
        record: bx.record,
        note: bx.verified ? 'Pugnera verified' : null,
        slug: bx.slug,
        imageUrl: bx.imageUrl,
      });
    });

    const divisions = Object.values(byClass)
      .sort((a, b) => a.id.localeCompare(b.id))
      .map((d) => ({ ...d, entries: d.entries.sort((a, b) => a.rank - b.rank) }));

    return { source: 'db', divisions };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[db.getRankings]', err);
    return { source: 'db', divisions: [], error: true };
  }
}

async function getUpcoming() {
  const supabase = supabaseAdmin();
  if (!supabase) {
    return { source: 'static', fights: upcomingFights };
  }

  try {
    const weightClasses = await loadWeightClasses();
    const { data: fightsRows, error: fErr } = await supabase
      .from('fights')
      .select('*')
      .eq('status', 'scheduled')
      .order('date', { ascending: true, nullsFirst: false });
    if (fErr) throw fErr;

    const { data: eventRows, error: eErr } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: true, nullsFirst: false });
    if (eErr) throw eErr;

    const out = [];

    (fightsRows || []).forEach((row) => {
      out.push({
        title: row.title || 'Fight night',
        slug: row.slug,
        date: formatDate(row.date),
        venue: row.venue || null,
        tag: (weightClasses.byCode[row.weight_class] && weightClasses.byCode[row.weight_class].name) || 'Fight night',
        status: 'upcoming',
        description: 'Scheduled on the Pugnera fight calendar.',
        image: '/boxing/hero/hero-ring.webp',
        video: row.video_ref || null,
        isDb: true,
      });
    });

    (eventRows || []).forEach((row) => {
      out.push({
        title: row.name,
        slug: row.slug,
        date: formatDate(row.date),
        venue: row.city ? (row.venue ? `${row.venue}, ${row.city}` : row.city) : row.venue || null,
        tag: row.country_code ? `${row.country_code} · Event night` : 'Event night',
        status: 'upcoming',
        description: row.blurb || '',
        image: row.poster_url || '/boxing/hero/hero-ring.webp',
        video: null,
        isDb: true,
      });
    });

    return { source: 'db', fights: out };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') console.error('[db.getUpcoming]', err);
    return { source: 'db', fights: [], error: true };
  }
}

module.exports = { getFighters, getFighter, getRankings, getUpcoming };