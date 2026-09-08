import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { supabaseBrowser } from '../lib/supabase/client';
import { syncSessionCookie } from '../lib/client-api';

// Handles the magic recovery redirect: /reset-password?type=recovery&access_token=...
export default function ResetPasswordPage() {
  const router = useRouter();
  const [phase, setPhase] = useState('loading'); // loading | form | done | error
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const { type, access_token, error: qErr } = router.query;
    if (qErr) {
      setError('The reset link is invalid or has expired.');
      setPhase('error');
      return;
    }
    if (type !== 'recovery' || !access_token) {
      setPhase('error');
      setError('This page is only reachable from a password reset email.');
      return;
    }
    const supabase = supabaseBrowser();
    if (!supabase) {
      setPhase('error');
      setError('The backend is not configured.');
      return;
    }
    supabase.auth
      .setSession({ access_token: String(access_token), refresh_token: '' })
      .then(({ error: se }) => {
        if (se) {
          setPhase('error');
          setError('The reset link is invalid or has expired.');
        } else {
          setPhase('form');
        }
      });
  }, [router.isReady, router.query]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    const supabase = supabaseBrowser();
    if (!supabase) return;
    setBusy(true);
    const { error: upErr } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    await supabase.auth.signOut();
    await syncSessionCookie();
    setPhase('done');
  };

  return (
    <>
      <Head>
        <title>Reset password · Pugnera</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="container register-page">
          <header className="register-head">
            <h1>Reset password</h1>
            <p>Choose a new password for your Pugnera account.</p>
          </header>

          {phase === 'form' && (
            <form className="register-form" onSubmit={submit} noValidate>
              {error && <p className="rf-error rf-error--summary" role="alert">{error}</p>}
              <div className="form-field">
                <label htmlFor="password">New password</label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="form-field">
                <label htmlFor="confirm">Confirm new password</label>
                <input
                  id="confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Enter it again"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn--primary register-submit" disabled={busy}>
                {busy ? 'Updating…' : 'Update password'}
              </button>
            </form>
          )}

          {phase === 'done' && (
            <div className="register-success">
              <h2>Password updated</h2>
              <p>Your password has been changed. You can now sign in.</p>
              <a className="btn btn--primary register-submit" href="/login">Sign in</a>
            </div>
          )}

          {(phase === 'error' || phase === 'loading') && (
            <p className="rf-error rf-error--summary" role="alert">
              {phase === 'loading' ? 'Checking your reset link…' : error || 'Unable to reset.'}
            </p>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}