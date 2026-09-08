import Link from 'next/link';
import { flagSrc } from '../lib/flags';

const initials = (name) =>
  name
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function FighterCard({ fighter }) {
  const flag = flagSrc(fighter.country);
  return (
    <Link href={`/fighters/${fighter.slug}`} className="fighter-card">
      <div className="fighter-card__media">
        {fighter.imageUrl ? (
          <img src={fighter.imageUrl} alt={fighter.name} loading="lazy" />
        ) : fighter.image ? (
          <img src={`/boxing/portraits/${fighter.image}.webp`} alt={fighter.name} loading="lazy" />
        ) : (
          <div className="fighter-card__ph">{initials(fighter.name)}</div>
        )}
        <div className="fighter-card__overlay">
          {flag ? <img className="fighter-card__flag" src={flag} alt={fighter.country} /> : null}
          <h3 className="fighter-card__name">{fighter.name}</h3>
          <span className="fighter-card__weight">{fighter.weight}</span>
        </div>
      </div>
    </Link>
  );
}