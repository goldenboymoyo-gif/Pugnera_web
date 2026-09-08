const SOCIALS = [
  {
    name: 'X',
    href: 'https://x.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 1.5h3.7l-8.1 9.3L24 22.5h-7.5l-5.9-7.7-6.7 7.7H.2l8.7-9.9L0 1.5h7.7l5.3 7 6-7zM17.6 20.4h2.1L6.4 3.5H4.2l13.4 16.9z" />
      </svg>
    ),
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
      </svg>
    ),
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
        <circle cx="12" cy="12" r="4.2" />
        <circle cx="17.6" cy="6.4" r="1.2" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
];

const EXPLORE = [
  { label: 'Fighters', href: '/fighters' },
  { label: 'Upcoming Fights', href: '/upcoming' },
  { label: 'Live', href: '/live' },
  { label: 'Watch', href: '/watch' },
  { label: 'News', href: '/news' },
  { label: 'Rankings', href: '/rankings' },
];

const WATCH = [
  { label: 'Replays', href: '/watch' },
  { label: 'Highlights', href: '/watch' },
  { label: 'Classic Fights', href: '/watch' },
  { label: 'Documentaries', href: '/watch' },
  { label: 'Technique & Training', href: '/watch' },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__columns">
          <div className="footer__col footer__col--brand">
            <a href="/" className="footer__logo" aria-label="Pugnera Boxing">
              <img src="/boxing/logo/image.png" alt="Pugnera Boxing logo" />
            </a>
            <p className="footer__tagline">
              The home of African boxing. Fighter profiles, events, rankings and news — all in one place.
            </p>
            <div className="footer__socials">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__social"
                  aria-label={s.name}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Explore</h4>
            <ul className="footer__list">
              {EXPLORE.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Watch</h4>
            <ul className="footer__list">
              {WATCH.map((l) => (
                <li key={l.label}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h4 className="footer__heading">Company</h4>
            <ul className="footer__list">
              <li>
                <a href="/about">About Pugnera</a>
              </li>
              <li>
                <a href="/register">Sign Up</a>
              </li>
              <li>
                <a href="https://pugnera.com" target="_blank" rel="noopener noreferrer">
                  Pugnera Group
                </a>
              </li>
              <li>
                <a href="https://pugnera.com/contact" target="_blank" rel="noopener noreferrer">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/rankings">Rankings</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bar">
          <p className="footer__trademark">&copy; 2026 Pugnera Boxing. All rights reserved.</p>
          <div className="footer__legal">
            <a href="/about#privacy">Terms of Service</a>
            <a href="/about#privacy">Privacy Policy</a>
            <a href="/about#privacy">Cookie Notice</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
