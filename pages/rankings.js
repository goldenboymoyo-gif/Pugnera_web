import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { rankings } from '../lib/rankings';
import { fighters } from '../lib/boxing-data';
import { flagSrc } from '../lib/flags';

export async function getStaticProps() {
  return { props: { divisions: rankings, fighters } };
}

export default function RankingsPage({ divisions, fighters }) {
  const [activeId, setActiveId] = useState('p4p');
  const division = divisions.find((d) => d.id === activeId) || divisions[0];

  const photoOf = (name) => {
    const f = fighters.find(
      (x) => x.name.toLowerCase().split(' ').slice(0, 2).join(' ') === name.toLowerCase().split(' ').slice(0, 2).join(' ')
    );
    return f;
  };

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Rankings</h1>
          <p>Pound-for-pound and divisional rankings — updated for the 2026 season.</p>
        </div>
        <div className="container">
          <div className="division-tabs">
            {divisions.map((d) => (
              <button
                key={d.id}
                className={`division-tab ${d.id === activeId ? 'active' : ''}`}
                onClick={() => setActiveId(d.id)}
              >
                {d.name}
              </button>
            ))}
          </div>
          <p className="rank-chip">
            {division.name} · Source: {division.source}
            {division.champion ? ` · Champion: ${division.champion}` : ''}
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
                const f = photoOf(e.name);
                return (
                  <tr key={e.rank}>
                    <td>
                      <span className="rank__num">{e.rank.toLocaleString('en-US', { minimumIntegerDigits: 2 })}</span>
                    </td>
                    <td>
                      <div className="rank__fighter">
                        <span
                          className="rank__photo"
                          style={
                            f && f.image
                              ? { backgroundImage: `url('/boxing/portraits/${f.image}.webp')` }
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
        </div>
        <p className="ticket-note" style={{ textAlign: 'center' }}>
          Rankings combined from Ring Magazine &amp; ESPN divisional panels — June to August 2026.
        </p>
      </main>
      <Footer />
    </>
  );
}