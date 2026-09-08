import { useState, useMemo } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import FighterCard from '../components/FighterCard';
import { getFighters } from '../lib/db';

export async function getServerSideProps() {
  const { source, fighters, error } = await getFighters();
  return { props: { source, fighters, dbError: !!error } };
}

export default function FightersPage({ source, fighters, dbError }) {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('');
  const [weight, setWeight] = useState('');

  const countries = useMemo(
    () => [...new Set(fighters.map((f) => f.country).filter(Boolean))].sort(),
    [fighters]
  );
  const weights = useMemo(
    () => [...new Set(fighters.map((f) => f.weight).filter(Boolean))].sort(),
    [fighters]
  );

  const filtered = fighters.filter((f) => {
    const q = query.trim().toLowerCase();
    const matchQ =
      !q ||
      f.name.toLowerCase().includes(q) ||
      (f.weight || '').toLowerCase().includes(q) ||
      (f.country || '').toLowerCase().includes(q);
    const matchC = !country || f.country === country;
    const matchW = !weight || f.weight === weight;
    return matchQ && matchC && matchW;
  });

  const isDb = source === 'db';

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Fighters</h1>
          <p>
            {isDb
              ? 'Approved Pugnera-registered fighters. Tap one to open their profile.'
              : 'Tap any fighter to open their profile, record and latest videos.'}
          </p>
        </div>
        <div className="container">
          <div className="searchbar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by Fighter, Weight & Nationality"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {(countries.length > 0 || weights.length > 0) && (
            <div className="filters">
              <select aria-label="Filter by nationality" value={country} onChange={(e) => setCountry(e.target.value)}>
                <option value="">All nationalities</option>
                {countries.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select aria-label="Filter by weight class" value={weight} onChange={(e) => setWeight(e.target.value)}>
                <option value="">All weight classes</option>
                {weights.map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          )}

          {isDb && fighters.length === 0 ? (
            <div className="search-empty">
              {dbError
                ? 'Fighters are temporarily unavailable. Please try again shortly.'
                : 'No approved fighters yet. New profiles appear here once the Pugnera team approves them.'}
            </div>
          ) : filtered.length ? (
            <div className="grid grid--portrait">
              {filtered.map((f) => (
                <FighterCard key={f.slug} fighter={f} />
              ))}
            </div>
          ) : (
            <div className="search-empty">No fighters match your search.</div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}