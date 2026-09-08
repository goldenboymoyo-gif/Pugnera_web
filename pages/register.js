import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';

const WEIGHT_CLASSES = [
  'Mini Flyweight',
  'Light Flyweight',
  'Flyweight',
  'Super Flyweight',
  'Bantamweight',
  'Super Bantamweight',
  'Featherweight',
  'Super Featherweight',
  'Lightweight',
  'Super Lightweight',
  'Welterweight',
  'Super Welterweight',
  'Middleweight',
  'Super Middleweight',
  'Light Heavyweight',
  'Cruiserweight',
  'Heavyweight',
];

const COUNTRIES = [
  'AF','AL','DZ','AO','AR','AM','AU','AT','AZ','BS','BH','BD','BB','BY','BE',
  'BZ','BJ','BT','BO','BA','BW','BR','BN','BG','BF','BI','KH','CM','CA',
  'CF','TD','CL','CN','CO','KM','CG','CD','CR','HR','CU','CY','CZ','DK',
  'DJ','DO','EC','EG','SV','GQ','ER','EE','SZ','ET','FJ','FI','FR','GA',
  'GM','GE','DE','GH','GR','GT','GN','GW','GY','HT','HN','HU','IS','IN',
  'ID','IR','IQ','IE','IL','IT','CI','JM','JP','JO','KZ','KE','KI','KW',
  'KG','LA','LV','LB','LS','LR','LY','LT','LU','MG','MW','MY','MV','ML',
  'MT','MH','MR','MU','MX','FM','MD','MC','MN','ME','MA','MZ','MM','NA',
  'NR','NP','NL','NZ','NI','NE','NG','MK','NO','OM','PK','PW','PA','PG',
  'PY','PE','PH','PL','PT','QA','RO','RU','RW','KN','LC','VC','WS','SM',
  'ST','SA','SN','RS','SC','SL','SG','SK','SI','SB','SO','ZA','KR','SS',
  'ES','LK','SD','SR','SE','CH','SY','TW','TJ','TZ','TH','TL','TG','TO',
  'TT','TN','TR','TM','TV','UG','UA','AE','GB','US','UY','UZ','VU','VE',
  'VN','YE','ZM','ZW',
];

export default function RegisterPage() {
  const [role, setRole] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    weight: '',
    nickname: '',
    stance: '',
    height: '',
    reach: '',
    wins: '',
    losses: '',
    draws: '',
    kos: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please choose whether you are registering as a Fan or a Boxer.');
      return;
    }
    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    const users = JSON.parse(localStorage.getItem('pugnera_users') || '[]');
    if (users.find((u) => u.email === form.email)) {
      setError('An account with this email already exists.');
      return;
    }

    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      role,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      country: form.country,
      createdAt: new Date().toISOString(),
    };

    if (role === 'boxer') {
      newUser.weight = form.weight || 'Heavyweight';
      newUser.nickname = form.nickname;
      newUser.stance = form.stance || 'Orthodox';
      newUser.height = form.height;
      newUser.reach = form.reach;
      newUser.wins = parseInt(form.wins) || 0;
      newUser.losses = parseInt(form.losses) || 0;
      newUser.draws = parseInt(form.draws) || 0;
      newUser.kos = parseInt(form.kos) || 0;
      newUser.slug = (
        form.firstName.toLowerCase() +
        '-' +
        form.lastName.toLowerCase()
      )
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s]+/g, '-');
      newUser.image = 'fighter-1';
    }

    users.push(newUser);
    localStorage.setItem('pugnera_users', JSON.stringify(users));
    document.cookie =
      'pugnera_user=' + encodeURIComponent(newUser.email) + '; path=/; max-age=31536000; SameSite=Lax';

    setSuccess(true);
  };

  if (success) {
    return (
      <>
        <Header />
        <main>
          <div className="container page-top">
            <BackButton />
          </div>
          <div className="register-success">
            <div className="register-success__icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1>Welcome to Pugnera</h1>
            <p>
              Your {role === 'boxer' ? 'boxer' : 'fan'} account has been created successfully.
              {role === 'boxer' && ' Your profile will now appear on the Fighters page.'}
            </p>
            <div className="register-success__actions">
              <a href="/fighters" className="btn btn--primary">
                {role === 'boxer' ? 'View Fighters' : 'Explore Fighters'}
              </a>
              <a href="/" className="btn btn--outline">
                Back to Home
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Create Account</h1>
          <p>Register as a fan or a professional boxer. Boxer profiles appear on the Fighters page.</p>
        </div>
        <div className="container register-page">
          {error && <div className="register-error">{error}</div>}
          <form className="register-form" onSubmit={handleSubmit}>
            <fieldset className="role-fieldset">
              <legend>I am a</legend>
              <div className="role-options">
                <label className={`role-option ${role === 'fan' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="fan"
                    checked={role === 'fan'}
                    onChange={() => setRole('fan')}
                  />
                  <span className="role-option__name">Fan</span>
                  <span className="role-option__desc">
                    Follow fighters, discover events and stay connected with African boxing.
                  </span>
                </label>
                <label className={`role-option ${role === 'boxer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="boxer"
                    checked={role === 'boxer'}
                    onChange={() => setRole('boxer')}
                  />
                  <span className="role-option__name">Boxer</span>
                  <span className="role-option__desc">
                    Create your professional profile and get discovered across Africa and beyond.
                  </span>
                </label>
              </div>
            </fieldset>

            <section className="form-section">
              <h3 className="form-section__title">Basic Information</h3>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="email">Email *</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="password">Password *</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="confirmPassword">Confirm Password *</label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="country">Country</label>
                <select id="country" name="country" value={form.country} onChange={handleChange}>
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {role === 'boxer' && (
              <section className="form-section">
                <h3 className="form-section__title">Boxing Information</h3>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="weight">Weight Class *</label>
                    <select id="weight" name="weight" value={form.weight} onChange={handleChange} required>
                      <option value="">Select weight class</option>
                      {WEIGHT_CLASSES.map((w) => (
                        <option key={w} value={w}>
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-field">
                    <label htmlFor="stance">Stance</label>
                    <select id="stance" name="stance" value={form.stance} onChange={handleChange}>
                      <option value="Orthodox">Orthodox</option>
                      <option value="Southpaw">Southpaw</option>
                      <option value="Switch">Switch</option>
                    </select>
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="nickname">Ring Name / Nickname</label>
                  <input
                    id="nickname"
                    name="nickname"
                    type="text"
                    placeholder="e.g. The Beast"
                    value={form.nickname}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="height">Height</label>
                    <input
                      id="height"
                      name="height"
                      type="text"
                      placeholder="e.g. 6'2&quot;"
                      value={form.height}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-field">
                    <label htmlFor="reach">Reach</label>
                    <input
                      id="reach"
                      name="reach"
                      type="text"
                      placeholder="e.g. 76&quot;"
                      value={form.reach}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="form-row form-row--four">
                  <div className="form-field">
                    <label htmlFor="wins">Wins</label>
                    <input id="wins" name="wins" type="number" min="0" value={form.wins} onChange={handleChange} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="losses">Losses</label>
                    <input id="losses" name="losses" type="number" min="0" value={form.losses} onChange={handleChange} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="draws">Draws</label>
                    <input id="draws" name="draws" type="number" min="0" value={form.draws} onChange={handleChange} />
                  </div>
                  <div className="form-field">
                    <label htmlFor="kos">KOs</label>
                    <input id="kos" name="kos" type="number" min="0" value={form.kos} onChange={handleChange} />
                  </div>
                </div>
              </section>
            )}

            <button type="submit" className="btn btn--primary register-submit">
              Create Account
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}