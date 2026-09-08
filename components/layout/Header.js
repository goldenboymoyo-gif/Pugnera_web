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
        <div className="header__right">
          <a href="/tickets" className="btn-upgrade">Get Tickets</a>
        </div>
      </div>
    </header>
  );
}