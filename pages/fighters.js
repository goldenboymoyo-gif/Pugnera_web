import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import FighterCard from '../components/FighterCard';
import { fighters } from '../lib/boxing-data';

export async function getStaticProps() {
  return { props: { fighters } };
}

export default function FightersPage({ fighters }) {
  const [query, setQuery] = useState('');

  const filtered = fighters.filter(
    (f) =>
      f.name.toLowerCase().includes(query.toLowerCase()) ||
      f.weight.toLowerCase().includes(query.toLowerCase()) ||
      f.country.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Fighters</h1>
          <p>Tap any fighter to open their profile, record and latest videos.</p>
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
          {filtered.length ? (
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