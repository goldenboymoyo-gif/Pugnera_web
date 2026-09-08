import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { getContent, previousEvents, fights } from '../lib/boxing-data';
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
  const slugByTitle = Object.fromEntries(fights.map((f) => [f.title, f.slug]));
  const previous = previousEvents.map((p) => ({ ...p, slug: slugByTitle[p.title] }));
  return { props: { content, previous } };
}

export default function ResultsPage({ content, previous }) {
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

  const items = [];
  for (const { rep, hit } of combined) {
    items.push({
      key: `live-${items.length}`,
      kind: 'live',
      winner: hit.winner,
      loser: hit.loser,
      verb: hit.verb,
      method: hit.method,
      date: hit.date,
      ts: bsTimestamp(hit.date),
      title: rep.title,
      venue: rep.venue,
      href: `/fights/${rep.slug}`,
    });
  }
  for (const r of live) {
    if (consumed.has(r)) continue;
    items.push({
      key: `live-${items.length}`,
      kind: 'live',
      winner: r.winner,
      loser: r.loser,
      verb: r.verb,
      method: r.method,
      date: r.date,
      ts: bsTimestamp(r.date),
      title: null,
      venue: null,
      href: null,
    });
  }
  for (const p of previous) {
    if (findLiveResult(live, p.title)) continue;
    items.push({
      key: `replay-${p.slug}`,
      kind: 'replay',
      winner: null,
      loser: null,
      verb: null,
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
          <p>Every result from the biggest nights — with official scorecards and full replays on demand.</p>
        </div>
        <div className="container">
          <div className="results-list">
            {items.length === 0 && (
              <div className="results-empty">
                No results to show yet — check back after the next fight night.
              </div>
            )}
            {items.map((it) => {
              const isLive = it.kind === 'live';
              const isDraw = isLive && it.verb && String(it.verb).toLowerCase() !== 'defeats';
              return (
                <div key={it.key} className={`result-row ${isLive ? 'result-row--live' : ''}`}>
                  <div className="result-row__main">
                    {isLive ? (
                      <>
                        <span className="result-row__names">
                          {isDraw ? (
                            <><strong>{it.winner}</strong> vs <strong>{it.loser}</strong></>
                          ) : (
                            <><strong>{it.winner}</strong> defeats <strong>{it.loser}</strong></>
                          )}
                        </span>
                        <span className="result-row__method">{it.method || 'Official Scorecards'}</span>
                        {it.title ? <span className="result-row__event">{it.title} · {it.venue}</span> : null}
                      </>
                    ) : (
                      <>
                        <span className="result-row__names">{it.title}</span>
                        <span className="result-row__method">Full event replay</span>
                        {it.venue ? <span className="result-row__event">{it.venue}</span> : null}
                      </>
                    )}
                  </div>
                  <div className="result-row__side">
                    <span className="result-row__date">{shortDate(it.date) || it.date || '—'}</span>
                    <span className={`source-badge ${isLive ? 'source-badge--live' : ''}`}>
                      {isLive ? 'BoxingScene' : 'Pugnera'}
                    </span>
                    {it.href ? <a className="btn-result" href={it.href}>Watch &rsaquo;</a> : null}
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