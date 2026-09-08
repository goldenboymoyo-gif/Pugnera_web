import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabaseBrowser } from '../../lib/supabase/client';
import { syncSessionCookie } from '../../lib/client-api';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/boxers', label: 'Boxers' },
  { href: '/admin/fans', label: 'Fans' },
  { href: '/admin/fights', label: 'Fights' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/rankings', label: 'Rankings' },
  { href: '/admin/audit', label: 'Audit log' },
];

export default function AdminLayout({ title, admin, children }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const signOut = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = supabaseBrowser();
      if (supabase) await supabase.auth.signOut();
      await syncSessionCookie();
    } catch (err) {
      // fall through — redirect anyway
    }
    router.push('/');
  };

  return (
    <>
      <Head>
        <title>{title ? `${title} · Admin` : 'Admin · Pugnera'}</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="admin">
        <aside className="admin__sidebar">
          <Link href="/" className="admin__brand">
            <img src="/boxing/logo/image.png" alt="Pugnera" />
            <span>Admin</span>
          </Link>
          <nav className="admin__nav" aria-label="Admin">
            {NAV.map((item) => {
              const active =
                item.href === '/admin'
                  ? router.pathname === '/admin'
                  : router.pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={`admin__nav-item ${active ? 'active' : ''}`}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="admin__main">
          <header className="admin__topbar">
            <div>
              <h1 className="admin__page-title">{title || 'Dashboard'}</h1>
              {admin ? (
                <p className="admin__who">
                  Signed in as <strong>{admin.username}</strong> · role: {admin.role}
                </p>
              ) : null}
            </div>
            <div className="admin__actions">
              <Link href="/" className="btn btn--outline">View site</Link>
              <button type="button" className="btn btn--red" onClick={signOut} disabled={busy}>
                {busy ? 'Signing out…' : 'Sign out'}
              </button>
            </div>
          </header>

          <div className="admin__content">{children}</div>
        </div>
      </div>
    </>
  );
}