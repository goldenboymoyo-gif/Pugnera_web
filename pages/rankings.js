import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { getRankings } from '../lib/db';
import { flagSrc } from '../lib/flags';

export async function getServerSideProps() {
  const { source, divisions, error } = await getRankings();
  return { props: { source, divisions, dbError: !!error } };
}

export default function RankingsPage({ source, divisions, dbError }) {
  const initialId = divisions.some((d) => d.id === 'p4p') ? 'p4p' : divisions[0] ? divisions[0].id : null;
  const [activeId, setActiveId] = useState(initialId);
  const isDb = source === 'db';

  if (isDb && divisions.length === 0) {
    return (
      <RankingShell>
        <div className="search-empty">
          {dbError
            ? 'Rankings are temporarily unavailable. Please try again shortly.'
            : 'Rankings are being prepared by the Pugnera team. Check back soon.'}
        </div>
      </RankingShell>
    );
  }

  const division = divisions.find((d) => d.id === activeId) || divisions[0];
  if (!division) {
    return (
      <RankingShell>
        <div className="search-empty">No rankings available yet.</div>
      </RankingShell>
    );
  }

  return (
    <RankingShell>
      <div className="division-tabs">
        {divisions.map((d) => (
          <button
            key={d.id}
            className={`division-tab ${d.id === division.id ? 'active' : ''}`}
            onClick={() => setActiveId(d.id)}
          >
            {d.name}
          </button>
        ))}
      </div>
      <p className="rank-chip">
        {division.name} · Source: {division.source}
      </p>
      <table className="ranking-table">
        <thead>
          <tr>
            <th style={{ width: 90 }}>Rank</th>
            <th>Fighter</th>
            <th>Country</th>
            <th>Record</th>
          </tr>
        </thead>
        <tbody>
          {division.entries.map((e) => {
            const flag = flagSrc(e.country);
            return (
              <tr key={`${division.id}-${e.rank}`}>
                <td>
                  <span className="rank__num">{e.rank.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</span>
                </td>
                <td>
                  <div className="rank__fighter">
                    <span
                      className="rank__photo"
                      style={
                        e.imageUrl
                          ? { backgroundImage: `url(${e.imageUrl})` }
                          : { background: 'linear-gradient(165deg,#22060d,#000)' }
                      }
                    />
                    <span>
                      <span className="rank__name">{e.name}</span>
                      {e.note ? <span className="rank__note"> · {e.note}</span> : null}
                    </span>
                  </div>
                </td>
                <td className="rank__country">{e.country}</td>
                <td className="rank__rec">{e.record}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {isDb ? (
        <p className="ticket-note" style={{ textAlign: 'center' }}>
          The Pugnera editorial panel compiles these rankings. Fighter records shown are as confirmed.
        </p>
      ) : (
        <p className="ticket-note" style={{ textAlign: 'center' }}>
          Rankings combined from Ring Magazine &amp; ESPN divisional panels — June to August 2026.
        </p>
      )}
    </RankingShell>
  );
}

function RankingShell({ children }) {
  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Rankings</h1>
          <p>Pound-for-pound and divisional rankings — updated by the Pugnera editorial team.</p>
        </div>
        <div className="container">{children}</div>
      </main>
      <Footer />
    </>
  );
}