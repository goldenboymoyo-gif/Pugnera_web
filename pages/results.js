import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { getContent, previousEvents } from '../lib/boxing-data';
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

function shortDate(dateStr) {
  if (!dateStr) return null;
  const m = /^[A-Za-z]{3}, ([A-Za-z]{3}) (\d{1,2}), (\d{4})/.exec(dateStr);
  if (m) return `${m[2]} ${m[1]} ${m[3]}`;
  return dateStr;
}

export async function getStaticProps() {
  const content = getContent();
  return { props: { content, previous: previousEvents } };
}

export default function ResultsPage({ content, previous }) {
  const liveResults = useLiveResults();
  const live = Array.isArray(liveResults) ? liveResults : [];

  for (const p of previous) {
    const hit = findLiveResult(live, p.title);
    if (hit) hit.__replay = p;
  }

  const items = [];
  for (const r of live) {
    const rep = r.__replay;
    items.push({
      key: `live-${items.length}`,
      kind: rep ? 'replay-live' : 'live',
      winner: r.winner,
      loser: r.loser,
      method: r.method,
      date: r.date,
      ts: bsTimestamp(r.date),
      title: rep ? rep.title : null,
      venue: rep ? rep.venue : null,
      href: rep ? `/fights/${rep.slug}` : null,
    });
  }
  for (const p of previous) {
    const hasLive = live.some((r) => r.__replay && r.__replay.slug === p.slug);
    if (hasLive) continue;
    items.push({
      key: `replay-${p.slug}`,
      kind: 'replay',
      winner: null,
      loser: null,
      method: null,
      date: p.date,
      ts: replayTimestamp(p.date),
      title: p.title,
      venue: p.venue,
      href: `/fights/${p.slug}`,
    });
  }

  items.sort((a, b) => (b.ts ?? -Infinity) - (a.ts ?? -Infinity));

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Results <span style={{ color: 'var(--red)' }}>Centre</span></h1>
          <p>Every result from the biggest nights — updated automatically via BoxingScene, alongside full replays on demand.</p>
        </div>
        <div className="container">
          <div className="results-list">
            {items.length === 0 && (
              <div className="results-empty">
                No results to show yet — check back after the next fight night.
              </div>
            )}
            {items.map((it) => {
              const isLive = it.kind !== 'replay';
              return (
                <div key={it.key} className={`result-row ${isLive ? 'result-row--live' : ''}`}>
                  <div className="result-row__main">
                    {isLive ? (
                      <>
                        <span className="result-row__names">
                          <strong>{it.winner}</strong> defeats <strong>{it.loser}</strong>
                        </span>
                        <span className="result-row__method">{it.method}</span>
                        {it.title && <span className="result-row__event">{it.title} · {it.venue}</span>}
                      </>
                    ) : (
                      <>
                        <span className="result-row__names">{it.title}</span>
                        <span className="result-row__method">Full event replay</span>
                        {it.venue && <span className="result-row__event">{it.venue}</span>}
                      </>
                    )}
                  </div>
                  <div className="result-row__side">
                    <span className="result-row__date">{shortDate(it.date) || it.date || '—'}</span>
                    <span className={`source-badge ${isLive ? 'source-badge--live' : ''}`}>
                      {isLive ? 'BoxingScene' : 'Pugnera'}
                    </span>
                    {it.href && <a className="btn-result" href={it.href}>Watch &rsaquo;</a>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}