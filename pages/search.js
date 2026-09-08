import { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import MediaCard from '../components/MediaCard';
import FighterCard from '../components/FighterCard';
import { getContent, records } from '../lib/boxing-data';
import { news } from '../lib/news';

export async function getStaticProps() {
  const content = getContent();
  return {
    props: {
      fights: content.fights,
      fighters: content.fighters,
      news,
    },
  };
}

export default function SearchPage({ fights, fighters, news }) {
  const router = useRouter();
  const [input, setInput] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof router.query.q === 'string') setInput(router.query.q);
  }, [router.query.q]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  const q = input.trim().toLowerCase();

  const matches = (text) => !q || String(text || '').toLowerCase().includes(q);

  const results = useMemo(() => {
    if (!q) return null;
    const close = (s) => {
      const n = s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return n;
    };
    const m = (text) => !q || close(text || '').includes(q);
    const fightHits = fights.filter(
      (f) => m(f.title) || m(f.tag) || m(f.description) || m(f.venue)
    );
    const fighterHits = fighters.filter(
      (f) => m(f.name) || m(f.weight) || m(f.country) || m(records[f.name] || '')
    );
    const newsHits = news.filter((n) => m(n.title) || m(n.excerpt) || m(n.tag));
    return { fightHits, fighterHits, newsHits };
  }, [q, fights, fighters, news]);

  const submit = (e) => {
    e.preventDefault();
    const qv = input.trim();
    if (!qv) return;
    router.replace('/search?q=' + encodeURIComponent(qv), undefined, { shallow: true });
  };

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Search</h1>
          <p>Find any fighter, fight night, highlight or story across the site.</p>
        </div>
        <div className="container">
          <form className="searchbar" onSubmit={submit}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search fighters, fights, highlights & news"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              aria-label="Search"
            />
          </form>

          {!q && (
            <div className="search-empty">Type a fighter name, fight title or topic to start searching.</div>
          )}

          {q && results && results.fightHits.length + results.fighterHits.length + results.newsHits.length === 0 && (
            <div className="search-empty">No results for “{q}”.</div>
          )}

          {q && results && results.fightHits.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">Fights & Highlights</h2>
              <div className="grid grid--fights">
                {results.fightHits.map((f) => (
                  <MediaCard key={f.slug} media={f} />
                ))}
              </div>
            </section>
          )}

          {q && results && results.fighterHits.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">Fighters</h2>
              <div className="grid grid--portrait">
                {results.fighterHits.map((f) => (
                  <FighterCard key={f.slug} fighter={f} />
                ))}
              </div>
            </section>
          )}

          {q && results && results.newsHits.length > 0 && (
            <section className="search-section">
              <h2 className="search-section__title">News</h2>
              <div className="search-news">
                {results.newsHits.map((n) => (
                  <a key={n.id} href={n.href || '#news'} className="search-news__item">
                    <div className="search-news__meta">
                      <span className="search-news__tag">{n.tag}</span>
                      <span className="search-news__date">{n.date}</span>
                    </div>
                    <div className="search-news__title">{n.title}</div>
                    <div className="search-news__excerpt">{n.excerpt}</div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}