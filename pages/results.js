import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { previousEvents, fights } from '../lib/boxing-data';
import { useLiveResults, findLiveResult } from '../components/LiveResults';

const MONTHS = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5, Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11 };

function bsTimestamp(dateStr) {
  const m = /^[A-Za-z]{3}, ([A-Za-z]{3}) (\d{1,2}), (\d{4})/.exec(dateStr || '');
  if (!m || MONTHS[m[1]] === undefined) return null;
  return Date.UTC(+m[3], MONTHS[m[1]], +m[2]);
}

function replayTimestamp(dateStr) {
  const m = /^([A-Za-z]{3}) (\d{1,2})/.exec(dateStr || '');
  if (!m || MONTHS[m[1]] === undefined) return null;
  return Date.UTC(2026, MONTHS[m[1]], +m[2]);
}

export async function getStaticProps() {
  const slugByTitle = Object.fromEntries(fights.map((f) => [f.title, f.slug]));
  const previous = previousEvents.map((p) => ({ ...p, slug: slugByTitle[p.title] }));
  return { props: { previous } };
}

export default function ResultsPage({ previous }) {
  const allResults = useLiveResults();
  const live = Array.isArray(allResults) ? allResults : [];

  const consumed = new Set();
  const combined = [];
  for (const p of previous) {
    const hit = findLiveResult(live, p.title);
    if (hit) {
      consumed.add(hit);
      combined.push({ rep: p, hit });
    }
  }

  const cards = [];
  for (const { rep, hit } of combined) {
    cards.push({
      key: `live-${cards.length}`,
      kind: 'live',
      winner: hit.winner,
      loser: hit.loser,
      verb: hit.verb,
      method: hit.method,
      date: hit.date,
      image: hit.image,
      url: hit.url,
      title: rep.title,
      venue: rep.venue,
      href: `/fights/${rep.slug}`,
      replay: true,
    });
  }
  for (const r of live) {
    if (consumed.has(r)) continue;
    cards.push({
      key: `live-${cards.length}`,
      kind: 'live',
      winner: r.winner,
      loser: r.loser,
      verb: r.verb,
      method: r.method,
      date: r.date,
      image: r.image,
      url: r.url,
      title: null,
      venue: null,
      href: null,
      replay: false,
    });
  }

  const extraReplays = previous.filter((p) => !findLiveResult(live, p.title));
  extraReplays.sort((a, b) => (replayTimestamp(b.date) ?? -Infinity) - (replayTimestamp(a.date) ?? -Infinity));

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Results <span style={{ color: 'var(--red)' }}>Centre</span></h1>
          <p>Every result from the biggest nights — with official scorecards and full replays on demand.</p>
        </div>
        <div className="container">
          <div className="result-card-grid">
            {cards.map((c) => {
              const isDraw = c.verb && String(c.verb).toLowerCase() !== 'defeats';
              const method =
                c.method ||
                (c.kind === 'live' ? 'Official Scorecards' : 'Full event replay');
              return (
                <article key={c.key} className="result-card">
                  <div className="result-card__img">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={`/boxing/results/${c.image}`} alt={`${c.winner} ${c.verb} ${c.loser}`} loading="lazy" />
                    ) : (
                      <div className="result-card__placeholder" />
                    )}
                    <span className={`source-badge ${c.kind === 'live' ? 'source-badge--live' : ''}`}>
                      {c.kind === 'live' ? 'BoxingScene' : 'Pugnera'}
                    </span>
                  </div>
                  <div className="result-card__body">
                    <div className="result-card__date">{c.date || '—'}</div>
                    <div className="result-card__title">
                      {isDraw ? (
                        <>
                          <strong>{c.winner}</strong> <span>vs</span> <strong>{c.loser}</strong>
                        </>
                      ) : (
                        <>
                          <strong>{c.winner}</strong> <span>{c.verb || 'defeats'}</span> <strong>{c.loser}</strong>
                        </>
                      )}
                    </div>
                    <div className="result-card__method">{method}</div>
                    {c.title ? (
                      <div className="result-card__event">
                        Full event: <a href={c.href}>{c.title}</a> · {c.venue}
                      </div>
                    ) : null}
                    <a
                      className="btn-result"
                      href={c.replay ? c.href : (c.url || undefined)}
                      rel={c.url && !c.replay ? 'noopener noreferrer' : undefined}
                      target={c.url && !c.replay ? '' : undefined}
                    >
                      {c.replay ? 'Watch Replay' : 'View Results'}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>

          {extraReplays.length > 0 && (
            <div className="replays-extra">
              <h2 className="replays-extra__title">More full-event replays on Pugnera</h2>
              {extraReplays.map((p) => (
                <a key={p.slug} className="replays-extra__row" href={`/fights/${p.slug}`}>
                  <span>{p.title}</span>
                  <span className="replays-extra__venue">{p.venue}</span>
                  <span className="replays-extra__date">{p.date}</span>
                  <span className="btn-result">Watch Replay</span>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}