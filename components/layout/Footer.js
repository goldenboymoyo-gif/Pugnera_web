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
                <a href="/contact">Contact Us</a>
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
