import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { supabaseBrowser } from '../lib/supabase/client';
import { syncSessionCookie } from '../lib/client-api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const next = router.query.next ? String(router.query.next) : '/account';

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const supabase = supabaseBrowser();
    if (!supabase) {
      setError('Sign-in is unavailable right now. Please check that the backend is configured.');
      return;
    }
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      await syncSessionCookie();
      router.replace(next);
    } catch (err) {
      setError('Could not sign in. Please try again.');
      setBusy(false);
    }
  };

  const sendReset = async () => {
    setError('');
    setNotice('');
    const supabase = supabaseBrowser();
    if (!supabase) {
      setError('Sign-in is unavailable right now.');
      return;
    }
    if (!email.trim()) {
      setError('Enter your email address first.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
    } else {
      setNotice('If an account exists for that email, a password reset link has been sent.');
    }
  };

  return (
    <>
      <Head>
        <title>Sign in · Pugnera</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="container register-page">
          <header className="register-head">
            <h1>Sign in</h1>
            <p>Welcome back. Sign in to manage your Pugnera profile.</p>
          </header>

          <form className="register-form" onSubmit={submit} noValidate>
            {error && (
              <p className="rf-error rf-error--summary" role="alert">{error}</p>
            )}
            {notice && (
              <p className="rf-notice" role="status">{notice}</p>
            )}

            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn--primary register-submit" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="register-signin">
            <button type="button" className="link-btn" onClick={sendReset} disabled={busy}>
              Forgot your password?
            </button>
          </p>

          <p className="register-signin">
            New to Pugnera?{' '}
            <a href="/register">Create an account</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}