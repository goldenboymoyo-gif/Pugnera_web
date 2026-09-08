import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { getUserFromRequest, getProfileForUser, getAdminRole } from '../lib/auth';
import { supabaseAdmin } from '../lib/supabase/server';
import { apiFetch, syncSessionCookie } from '../lib/client-api';
import { supabaseBrowser } from '../lib/supabase/client';

// Weight class / country reference for the editor forms.
const WEIGHT_CLASSES = [
  'Mini Flyweight', 'Light Flyweight', 'Flyweight', 'Super Flyweight', 'Bantamweight',
  'Super Bantamweight', 'Featherweight', 'Super Featherweight', 'Lightweight',
  'Super Lightweight', 'Welterweight', 'Super Welterweight', 'Middleweight',
  'Super Middleweight', 'Light Heavyweight', 'Cruiserweight', 'Heavyweight',
];
const COUNTRIES = [
  'AF','AL','DZ','AO','AR','AM','AU','AT','AZ','BS','BH','BD','BB','BY','BE','BZ','BJ','BT','BO',
  'BA','BW','BR','BN','BG','BF','BI','KH','CM','CA','CF','TD','CL','CN','CO','KM','CG','CD','CR',
  'HR','CU','CY','CZ','DK','DJ','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FJ','FI','FR','GA',
  'GM','GE','DE','GH','GR','GT','GN','GW','GY','HT','HN','HU','IS','IN','ID','IR','IQ','IE','IL',
  'IT','CI','JM','JP','JO','KZ','KE','KI','KW','KG','LA','LV','LB','LS','LR','LY','LT','LU','MG',
  'MW','MY','MV','ML','MT','MH','MR','MU','MX','FM','MD','MC','MN','ME','MA','MZ','MM','NA','NR',
  'NP','NL','NZ','NI','NE','NG','MK','NO','OM','PK','PW','PA','PG','PY','PE','PH','PL','PT','QA',
  'RO','RU','RW','KN','LC','VC','WS','SM','ST','SA','SN','RS','SC','SL','SG','SK','SI','SB','SO',
  'ZA','KR','SS','ES','LK','SD','SR','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TO','TT','TN',
  'TR','TM','TV','UG','UA','AE','GB','US','UY','UZ','VU','VE','VN','YE','ZM','ZW',
];
const FOLLOW_WEIGHTS = ['Heavyweight', 'Light Heavyweight', 'Middleweight', 'Welterweight', 'Lightweight', 'Featherweight', 'Bantamweight'];

const STATUS_LABEL = {
  pending: 'Pending review',
  approved: 'Approved',
  rejected: 'Not approved',
  suspended: 'Suspended',
};

export async function getServerSideProps(ctx) {
  const user = await getUserFromRequest(ctx.req);
  const backend = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!user || !backend) {
    return { redirect: { destination: '/login?next=/account', permanent: false } };
  }

  const supabase = supabaseAdmin();
  let profile = await getProfileForUser(user);
  let boxer = null;
  let fan = null;
  let adminRole = null;

  if (profile) {
    if (profile.account_type === 'boxer') {
      const { data } = await supabase.from('boxer_profiles').select('*').eq('profile_id', user.id).maybeSingle();
      boxer = data || null;
    }
    if (profile.account_type === 'fan') {
      const { data } = await supabase.from('fan_profiles').select('*').eq('profile_id', user.id).maybeSingle();
      fan = data || null;
    }
  }
  adminRole = await getAdminRole(user.id);

  return {
    props: {
      user: { id: user.id, email: user.email },
      profile,
      boxer,
      fan,
      adminRole,
    },
  };
}

export default function AccountPage({ user, profile, boxer, fan, adminRole }) {
  const router = useRouter();
  const isBoxer = profile && profile.account_type === 'boxer';
  const [notice, setNotice] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const [boxerForm, setBoxerForm] = useState({
    boxingName: (boxer && boxer.boxing_name) || '',
    country: (boxer && boxer.country_code) || '',
    weight: (boxer && boxer.weight_class) || '',
    gym: (boxer && boxer.gym) || '',
    debut: (boxer && boxer.pro_debut) ? String(boxer.pro_debut) : '',
    bio: (boxer && boxer.bio) || '',
    social: ((boxer && boxer.social_links) || []).join(' '),
  });

  const [fanForm, setFanForm] = useState({
    fighters: fan ? fan.follow_fighters : false,
    events: fan ? fan.follow_events : false,
    weights: fan ? fan.preferred_weight_classes : [],
    countries: fan ? fan.preferred_countries : [],
  });

  const weightName = (code) => {
    const w = WEIGHT_CLASSES.find((name) =>
      name.toLowerCase().replace(/[^a-z]/g, '') === String(code || '').toLowerCase().replace(/[^a-z]/g, '')
      || name === code
    );
    return w || code || '—';
  };

  const handleBoxerChange = (e) => setBoxerForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const toggleFan = (key, value) => {
    setFanForm((prev) => {
      if (key === 'weights' || key === 'countries') {
        const list = prev[key];
        return { ...prev, [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] };
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  const saveBoxer = async (e) => {
    e.preventDefault();
    setErr('');
    setNotice('');
    setBusy(true);
    const socialLinks = boxerForm.social
      .split(/[\s,]+/)
      .filter(Boolean)
      .filter((u) => /^https?:\/\//.test(u));
    const res = await apiFetch('/api/profiles/boxer', {
      method: 'PUT',
      body: {
        boxingName: boxerForm.boxingName,
        country: boxerForm.country || undefined,
        weightClass: boxerForm.weight || undefined,
        gym: boxerForm.gym || undefined,
        proDebut: boxerForm.debut ? parseInt(boxerForm.debut, 10) || null : null,
        bio: boxerForm.bio || undefined,
        socialLinks,
      },
    });
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || 'Could not save your profile.');
      return;
    }
    setNotice('Profile saved.');
  };

  const saveFan = async (e) => {
    e.preventDefault();
    setErr('');
    setNotice('');
    setBusy(true);
    const res = await apiFetch('/api/profiles/fan', {
      method: 'PUT',
      body: {
        followFighters: fanForm.fighters,
        followEvents: fanForm.events,
        preferredWeightClasses: fanForm.weights,
        preferredCountries: fanForm.countries,
      },
    });
    setBusy(false);
    if (!res.ok) {
      setErr(res.error || 'Could not save your preferences.');
      return;
    }
    setNotice('Preferences saved.');
  };

  const uploadAvatar = async (file) => {
    setErr('');
    setNotice('');
    if (!/^image\/(jpeg|png|webp|gif)$/.test(file.type)) {
      setErr('Choose a JPEG, PNG, WEBP or GIF image.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErr('Image must be under 2 MB.');
      return;
    }
    setBusy(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const res = await apiFetch('/api/media', { method: 'POST', body: { dataUrl: reader.result } });
      setBusy(false);
      if (!res.ok) {
        setErr(res.error || 'Upload failed.');
        return;
      }
      setNotice('Profile photo uploaded.');
    };
    reader.readAsDataURL(file);
  };

  const signOut = async () => {
    const supabase = supabaseBrowser();
    if (supabase) await supabase.auth.signOut();
    await syncSessionCookie();
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>My account · Pugnera</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="container register-page">
          <header className="register-head account-head">
            <div>
              <h1>My account</h1>
              <p>
                @{profile ? profile.username : user.email} ·{' '}
                {profile ? profile.account_type : 'fan'}
                {adminRole ? ` · admin (${adminRole})` : ''}
              </p>
            </div>
            <button type="button" className="btn btn--outline account-head__signout" onClick={signOut}>
              Sign out
            </button>
          </header>

          {adminRole && (
            <p className="account-admin">
              <a href="/admin" className="btn btn--red">Open admin dashboard</a>
            </p>
          )}

          {err && <p className="rf-error rf-error--summary" role="alert">{err}</p>}
          {notice && <p className="rf-notice" role="status">{notice}</p>}

          {isBoxer && (
            <section className="next-step account-section">
              <h2>Fighter profile</h2>
              <p className="account-status">
                Status: <strong>{STATUS_LABEL[boxer ? boxer.status : 'pending'] || 'Unknown'}</strong>
                {boxer && boxer.status === 'approved'
                  ? ' — your profile is live on the Fighters page.'
                  : boxer && boxer.status === 'pending'
                  ? ' — a member of the Pugnera team is reviewing it.'
                  : ''}
              </p>
              {boxer && boxer.record_source === 'official' && (
                <p className="account-status">
                  Official record:{' '}
                  <strong>
                    {boxer.wins}-{boxer.losses}-{boxer.draws}
                    {boxer.kos > 0 ? ` (${boxer.kos} KO)` : ''}
                  </strong>{' '}
                  — confirmed by Pugnera.
                </p>
              )}
              <p className="account-status">
                Weight class: <strong>{weightName(boxerForm.weight)}</strong>
              </p>

              <form onSubmit={saveBoxer} className="register-form">
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="boxingName">Boxing name</label>
                    <input id="boxingName" name="boxingName" type="text" value={boxerForm.boxingName} onChange={handleBoxerChange} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="country">Country</label>
                    <select id="country" name="country" value={boxerForm.country} onChange={handleBoxerChange}>
                      <option value="">Select</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="weight">Weight class</label>
                    <select id="weight" name="weight" value={boxerForm.weight} onChange={handleBoxerChange}>
                      <option value="">Select</option>
                      {WEIGHT_CLASSES.map((w) => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="gym">Gym</label>
                    <input id="gym" name="gym" type="text" value={boxerForm.gym} onChange={handleBoxerChange} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="debut">Professional debut</label>
                    <input id="debut" name="debut" type="text" placeholder="Year, e.g. 2021" value={boxerForm.debut} onChange={handleBoxerChange} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="account-bio">Biography</label>
                    <input id="account-bio" name="bio" type="text" value={boxerForm.bio} onChange={handleBoxerChange} />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="social">Social media links</label>
                  <input id="social" name="social" type="text" placeholder="Full URLs, separated by spaces or commas" value={boxerForm.social} onChange={handleBoxerChange} />
                </div>
                <p className="next-step__note">
                  Your professional record is confirmed by the Pugnera team from sanctioned sources.
                  You can request a review from the Fighters page contact.
                </p>
                <div className="next-step__actions">
                  <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
                  <label className="btn btn--outline account-upload">
                    Upload profile photo
                    <input type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && uploadAvatar(e.target.files[0])} />
                  </label>
                </div>
              </form>
            </section>
          )}

          {profile && !isBoxer && (
            <section className="next-step account-section">
              <h2>Fan preferences</h2>
              <p className="next-step__intro">What would you like to follow?</p>
              <form onSubmit={saveFan} className="register-form">
                <div className="form-field rf-interest-group">
                  <span className="rf-interest-title">Follow</span>
                  <label className="rf-checkbox rf-checkbox--inline">
                    <input type="checkbox" checked={fanForm.fighters} onChange={() => toggleFan('fighters')} />
                    <span>Fighters</span>
                  </label>
                  <label className="rf-checkbox rf-checkbox--inline">
                    <input type="checkbox" checked={fanForm.events} onChange={() => toggleFan('events')} />
                    <span>Events</span>
                  </label>
                </div>
                <div className="form-field rf-interest-group">
                  <span className="rf-interest-title">Weight classes</span>
                  <div className="rf-chiplist">
                    {FOLLOW_WEIGHTS.map((w) => (
                      <label key={w} className={`rf-chip ${fanForm.weights.includes(w) ? 'active' : ''}`}>
                        <input type="checkbox" checked={fanForm.weights.includes(w)} onChange={() => toggleFan('weights', w)} />
                        <span>{w}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-field rf-interest-group">
                  <span className="rf-interest-title">Countries</span>
                  <div className="rf-chiplist">
                    {['ZA', 'NG', 'GH', 'ZW', 'ZM', 'KE', 'EG', 'US', 'GB', 'MX', 'JP'].map((c) => (
                      <label key={c} className={`rf-chip ${fanForm.countries.includes(c) ? 'active' : ''}`}>
                        <input type="checkbox" checked={fanForm.countries.includes(c)} onChange={() => toggleFan('countries', c)} />
                        <span>{c}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="next-step__actions">
                  <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? 'Saving…' : 'Save preferences'}</button>
                </div>
              </form>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}