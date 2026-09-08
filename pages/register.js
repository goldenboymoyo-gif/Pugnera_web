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

const FOLLOW_WEIGHTS = ['Heavyweight', 'Light Heavyweight', 'Middleweight', 'Welterweight', 'Lightweight', 'Featherweight', 'Bantamweight'];

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BoxerIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M12 15.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9z" />
    <path d="M8.7 13.3 5 21l3-1.3 1.4-3.2M15.3 13.3 19 21l-3-1.3-1.4-3.2" />
  </svg>
);

const FanIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

export default function RegisterPage() {
  const [role, setRole] = useState('');
  const [values, setValues] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    confirm: '',
    country: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [created, setCreated] = useState(null);

  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const next = {};
    const users = JSON.parse(localStorage.getItem('pugnera_users') || '[]');

    if (!role) next.role = 'Choose an account type to continue.';
    if (!values.fullName.trim()) next.fullName = 'Enter your full name.';
    if (!values.email.trim()) next.email = 'Enter your email address.';
    else if (!EMAIL_RE.test(values.email)) next.email = 'Enter a valid email address.';
    if (!values.username.trim()) next.username = 'Choose a username.';
    else if (values.username.trim().length < 3) next.username = 'Username must be at least 3 characters.';
    else if (users.find((u) => u.username === values.username.trim())) next.username = 'That username is already taken.';
    if (!values.password) next.password = 'Create a password.';
    else if (values.password.length < 6) next.password = 'Password must be at least 6 characters.';
    if (!values.confirm) next.confirm = 'Enter your password again.';
    else if (values.confirm !== values.password) next.confirm = 'Passwords do not match.';
    if (role === 'boxer' && !values.country) next.country = 'Select your country.';
    if (!values.terms) next.terms = 'You need to agree to the Terms of Service to continue.';

    return next;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    const users = JSON.parse(localStorage.getItem('pugnera_users') || '[]');

    const user = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      role,
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      username: values.username.trim(),
      country: role === 'boxer' ? values.country : '',
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    localStorage.setItem('pugnera_users', JSON.stringify(users));
    document.cookie =
      'pugnera_user=' + encodeURIComponent(user.username) + '; path=/; max-age=31536000; SameSite=Lax';

    setCreated(user);
  };

  if (created) {
    return <RegisterSuccess user={created} />;
  }

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="container register-page">
          <header className="register-head">
            <h1>Create your account</h1>
            <p>Sign up to follow professional boxing on Pugnera.</p>
          </header>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <fieldset className="role-fieldset">
              <legend>What are you signing up as?</legend>
              {errors.role && (
                <p className="rf-error rf-error--summary" role="alert">
                  {errors.role}
                </p>
              )}
              <div className="account-options">
                <label className={`account-option ${role === 'boxer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="boxer"
                    checked={role === 'boxer'}
                    onChange={() => {
                      setRole('boxer');
                      if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
                    }}
                  />
                  <span className="account-option__icon">{BoxerIcon}</span>
                  <span className="account-option__body">
                    <span className="account-option__name">Boxer</span>
                    <span className="account-option__desc">
                      Create a profile and share your professional boxing journey.
                    </span>
                  </span>
                  <span className="account-option__check" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </label>

                <label className={`account-option ${role === 'fan' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="fan"
                    checked={role === 'fan'}
                    onChange={() => {
                      setRole('fan');
                      if (errors.role) setErrors((prev) => ({ ...prev, role: '' }));
                    }}
                  />
                  <span className="account-option__icon">{FanIcon}</span>
                  <span className="account-option__body">
                    <span className="account-option__name">Fan</span>
                    <span className="account-option__desc">
                      Follow fighters, discover fights and keep up with boxing.
                    </span>
                  </span>
                  <span className="account-option__check" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                </label>
              </div>
            </fieldset>

            <section className="form-section">
              <div className="form-field">
                <label htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={values.fullName}
                  onChange={handleChange}
                  aria-invalid={!!errors.fullName}
                  aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                />
                {errors.fullName && (
                  <p className="rf-error" id="fullName-error">{errors.fullName}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={values.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p className="rf-error" id="email-error">{errors.email}</p>
                )}
              </div>

              <div className="form-field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Choose a username"
                  autoComplete="username"
                  value={values.username}
                  onChange={handleChange}
                  aria-invalid={!!errors.username}
                  aria-describedby={errors.username ? 'username-error' : undefined}
                />
                {errors.username && (
                  <p className="rf-error" id="username-error">{errors.username}</p>
                )}
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="password">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                    value={values.password}
                    onChange={handleChange}
                    aria-invalid={!!errors.password}
                    aria-describedby={errors.password ? 'password-error' : undefined}
                  />
                  {errors.password && (
                    <p className="rf-error" id="password-error">{errors.password}</p>
                  )}
                </div>
                <div className="form-field">
                  <label htmlFor="confirm">Confirm password</label>
                  <input
                    id="confirm"
                    name="confirm"
                    type="password"
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    value={values.confirm}
                    onChange={handleChange}
                    aria-invalid={!!errors.confirm}
                    aria-describedby={errors.confirm ? 'confirm-error' : undefined}
                  />
                  {errors.confirm && (
                    <p className="rf-error" id="confirm-error">{errors.confirm}</p>
                  )}
                </div>
              </div>

              {role === 'boxer' && (
                <div className="form-field">
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={values.country}
                    onChange={handleChange}
                    aria-invalid={!!errors.country}
                    aria-describedby={errors.country ? 'country-error' : undefined}
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.country && (
                    <p className="rf-error" id="country-error">{errors.country}</p>
                  )}
                </div>
              )}

              <div className="form-field rf-terms">
                <label className="rf-checkbox">
                  <input
                    type="checkbox"
                    name="terms"
                    checked={values.terms}
                    onChange={handleChange}
                    aria-invalid={!!errors.terms}
                  />
                  <span>
                    I agree to Pugnera&apos;s <a href="/about#privacy">Terms of Service</a> and{' '}
                    <a href="/about#privacy">Privacy Policy</a>
                  </span>
                </label>
                {errors.terms && (
                  <p className="rf-error" role="alert">{errors.terms}</p>
                )}
              </div>

              <button type="submit" className="btn btn--primary register-submit">
                Create account
              </button>
            </section>

            <p className="register-signin">
              Already have an account? <a href="/">Sign in</a>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

function RegisterSuccess({ user }) {
  const [boxer, setBoxer] = useState({
    boxingName: '',
    country: user.country || '',
    weight: '',
    gym: '',
    debut: '',
    record: '',
    bio: '',
    social: '',
  });
  const [interests, setInterests] = useState({
    fighters: false,
    events: false,
    weights: [],
    countries: [],
  });
  const [saved, setSaved] = useState(false);

  const handleBoxer = (e) => {
    setBoxer((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const toggleInterest = (key, value) => {
    setInterests((prev) => {
      if (key === 'weights' || key === 'countries') {
        const list = prev[key];
        return {
          ...prev,
          [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
        };
      }
      return { ...prev, [key]: !prev[key] };
    });
  };

  const saveBoxerProfile = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('pugnera_users') || '[]');
    const updated = users.map((u) =>
      u.id === user.id
        ? {
            ...u,
            profile: {
              boxingName: boxer.boxingName,
              country: boxer.country,
              weight: boxer.weight,
              gym: boxer.gym,
              debut: boxer.debut,
              record: boxer.record,
              bio: boxer.bio,
              social: boxer.social,
            },
          }
        : u
    );
    localStorage.setItem('pugnera_users', JSON.stringify(updated));
    setSaved(true);
  };

  const saveInterests = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('pugnera_users') || '[]');
    const updated = users.map((u) => (u.id === user.id ? { ...u, interests } : u));
    localStorage.setItem('pugnera_users', JSON.stringify(updated));
    setSaved(true);
  };

  return (
    <>
      <Header />
      <main>
        <div className="container register-success">
          <div className="register-success__icon">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h1>Your account is ready</h1>
          <p>
            {user.role === 'boxer'
              ? 'You registered as a boxer, so your profile has a home on the Fighters page. Take a minute to complete your professional profile — you can always do this later.'
              : 'You registered as a fan. Personalise your experience so Pugnera follows what matters to you.'}
          </p>

          {!saved && (
            <div className="next-step">
              {user.role === 'boxer' && (
                <>
                  <h2>Complete your professional profile</h2>
                  <form onSubmit={saveBoxerProfile} className="register-form">
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="boxingName">Boxing name</label>
                        <input
                          id="boxingName"
                          name="boxingName"
                          type="text"
                          placeholder="e.g. The Fighting Prince"
                          value={boxer.boxingName}
                          onChange={handleBoxer}
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="p-country">Country</label>
                        <select id="p-country" name="country" value={boxer.country} onChange={handleBoxer}>
                          <option value="">Select your country</option>
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="weight">Weight class</label>
                        <select id="weight" name="weight" value={boxer.weight} onChange={handleBoxer}>
                          <option value="">Select weight class</option>
                          {WEIGHT_CLASSES.map((w) => (
                            <option key={w} value={w}>
                              {w}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-field">
                        <label htmlFor="gym">Gym</label>
                        <input
                          id="gym"
                          name="gym"
                          type="text"
                          placeholder="Name of your gym"
                          value={boxer.gym}
                          onChange={handleBoxer}
                        />
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-field">
                        <label htmlFor="debut">Professional debut</label>
                        <input
                          id="debut"
                          name="debut"
                          type="text"
                          placeholder="Year, e.g. 2021"
                          value={boxer.debut}
                          onChange={handleBoxer}
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="record">Professional record</label>
                        <input
                          id="record"
                          name="record"
                          type="text"
                          placeholder="e.g. 12-0-0 (8 KOs)"
                          value={boxer.record}
                          onChange={handleBoxer}
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label htmlFor="bio">Biography</label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows="4"
                        placeholder="A short introduction about you and your career"
                        value={boxer.bio}
                        onChange={handleBoxer}
                      />
                    </div>
                    <div className="form-field">
                      <label htmlFor="social">Social media links</label>
                      <input
                        id="social"
                        name="social"
                        type="text"
                        placeholder="Instagram, X or other profiles"
                        value={boxer.social}
                        onChange={handleBoxer}
                      />
                    </div>
                    <div className="next-step__actions">
                      <button type="submit" className="btn btn--primary">
                        Save profile
                      </button>
                      <a href="/fighters" className="btn btn--outline">
                        Skip for now
                      </a>
                    </div>
                  </form>
                </>
              )}

              {user.role === 'fan' && (
                <>
                  <h2>Personalise your experience</h2>
                  <p className="next-step__intro">
                    Choose what you want to follow. You can change this at any time.
                  </p>
                  <form onSubmit={saveInterests} className="register-form">
                    <div className="form-field rf-interest-group">
                      <span className="rf-interest-title">Follow</span>
                      <label className="rf-checkbox rf-checkbox--inline">
                        <input
                          type="checkbox"
                          checked={interests.fighters}
                          onChange={() => toggleInterest('fighters')}
                        />
                        <span>Fighters</span>
                      </label>
                      <label className="rf-checkbox rf-checkbox--inline">
                        <input
                          type="checkbox"
                          checked={interests.events}
                          onChange={() => toggleInterest('events')}
                        />
                        <span>Events</span>
                      </label>
                    </div>
                    <div className="form-field rf-interest-group">
                      <span className="rf-interest-title">Weight classes</span>
                      <div className="rf-chiplist">
                        {FOLLOW_WEIGHTS.map((w) => (
                          <label key={w} className={`rf-chip ${interests.weights.includes(w) ? 'active' : ''}`}>
                            <input
                              type="checkbox"
                              checked={interests.weights.includes(w)}
                              onChange={() => toggleInterest('weights', w)}
                            />
                            <span>{w}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="form-field rf-interest-group">
                      <span className="rf-interest-title">Countries</span>
                      <div className="rf-chiplist">
                        {['ZA', 'NG', 'GH', 'ZW', 'ZM', 'KE', 'EG', 'US', 'GB', 'MX', 'JP'].map((c) => (
                          <label key={c} className={`rf-chip ${interests.countries.includes(c) ? 'active' : ''}`}>
                            <input
                              type="checkbox"
                              checked={interests.countries.includes(c)}
                              onChange={() => toggleInterest('countries', c)}
                            />
                            <span>{c}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div className="next-step__actions">
                      <button type="submit" className="btn btn--primary">
                        Save preferences
                      </button>
                      <a href="/" className="btn btn--outline">
                        Skip for now
                      </a>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}

          {saved && (
            <div className="next-step next-step--done">
              <h2>Saved</h2>
              <p>
                {user.role === 'boxer'
                  ? 'Your professional profile is ready. It will now appear on the Fighters page.'
                  : 'Your preferences are saved. We will use them to keep boxing front and centre for you.'}
              </p>
              <div className="next-step__actions">
                {user.role === 'boxer' && (
                  <a href="/fighters" className="btn btn--primary">View Fighters</a>
                )}
                {user.role === 'fan' && (
                  <a href="/upcoming" className="btn btn--primary">Upcoming Fights</a>
                )}
                <a href="/" className="btn btn--outline">Back to home</a>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}