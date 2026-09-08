import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const NAV = [
  { label: 'Home', href: '/' },
  { label: 'Fighters', href: '/fighters' },
  { label: 'Results', href: '/results' },
  { label: 'Upcoming Fights', href: '/upcoming' },
  { label: 'Live', href: '/live' },
  { label: 'Watch', href: '/watch' },
  { label: 'News', href: '/news' },
  { label: 'Rankings', href: '/rankings' },
  { label: 'Tickets', href: '/tickets' },
];

export default function Header() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchOpen && inputRef.current) inputRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setQuery('');
  }, [router.asPath]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMenuOpen(false);
    setSearchOpen(false);
    router.push('/search?q=' + encodeURIComponent(q));
  };

  return (
    <header className="header">
      <div className="header__inner">
        <a href="/" className="brand-logo" aria-label="Pugnera Boxing — home">
          <img src="/boxing/logo/image.png" alt="Pugnera Boxing logo" />
        </a>

        <nav className="header__nav" aria-label="Main">
          {NAV.map((item) => {
            const active =
              item.href === '/' ? router.pathname === '/' : router.pathname.startsWith(item.href);
            return (
              <a key={item.href} href={item.href} className={`nav__link ${active ? 'active' : ''}`}>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="header__search">
          {searchOpen && (
            <form className="header__search-form" onSubmit={submitSearch}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search fighters, fights & news"
                aria-label="Search"
              />
            </form>
          )}
          <button
            type="button"
            className="header__search-btn"
            aria-label="Toggle search"
            onClick={() => setSearchOpen((v) => !v)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>

        <div className="header__right">
          <a href="/tickets" className="btn-upgrade">Get Tickets</a>
        </div>

        <button
          type="button"
          className={`nav__toggle ${menuOpen ? 'open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <form className="mobile-search" onSubmit={submitSearch}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search fighters, fights & news"
            aria-label="Search"
          />
        </form>
        <nav className="mobile-nav" aria-label="Mobile main">
          {NAV.map((item) => {
            const active =
              item.href === '/' ? router.pathname === '/' : router.pathname.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                className={`mobile-nav__link ${active ? 'active' : ''}`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>
        <a href="/tickets" className="mobile-cta">Get Tickets</a>
      </div>
    </header>
  );
}