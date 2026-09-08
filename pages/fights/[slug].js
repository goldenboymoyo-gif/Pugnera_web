import { useState } from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import BackButton from '../../components/BackButton';
import VideoPlayer from '../../components/VideoPlayer';
import MediaCard from '../../components/MediaCard';
import LiveResultBanner, { useLiveResults, findLiveResult } from '../../components/LiveResults';
import { fights, tickets, fighters, records } from '../../lib/boxing-data';
import { flagSrc } from '../../lib/flags';

export async function getStaticPaths() {
  return { paths: fights.map((f) => ({ params: { slug: f.slug } })), fallback: false };
}

export async function getStaticProps({ params }) {
  const fight = fights.find((f) => f.slug === params.slug);
  const ticket = tickets.find((t) => t.title === fight.title) || null;
  const moreFights = fights.filter((f) => f.slug !== fight.slug).slice(0, 4);
  return { props: { fight, ticket, moreFights } };
}

const normalize = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const NAME_ALIASES = {
  zurdo: 'Gilberto Ramírez',
  rolly: 'Rolando Romero',
  boots: 'Jaron Ennis',
  fury: 'Tyson Fury',
};

const portraitOf = (name) => {
  const q = NAME_ALIASES[normalize(name)] || name;
  const tokens = normalize(q)
    .split(' ')
    .filter((t) => t && !/^\d+$/.test(t));
  if (!tokens.length) return null;
  let best = null;
  let bestScore = 0;
  for (const x of fighters) {
    const fn = normalize(x.name).split(' ');
    let score = 0;
    for (const qt of tokens) {
      if (fn.some((ft) => ft === qt)) score += 2;
      else if (fn.some((ft) => ft.startsWith(qt) || ft.endsWith(qt))) score += 1;
      else {
        score = -1;
        break;
      }
    }
    if (score > bestScore) {
      best = x;
      bestScore = score;
    }
  }
  return best ? { fighter: best, record: records[best.name] || null } : null;
};

export default function FightDetail({ fight, ticket, moreFights }) {
  const [activeVideo, setActiveVideo] = useState(fight.video || (fight.related[0] && fight.related[0].id));
  const liveResults = useLiveResults();
  const live = findLiveResult(liveResults, fight.title);
  const allVideos = [
    ...(fight.video ? [{ ...{ id: fight.video, title: fight.title } }] : []),
    ...fight.related,
  ].filter((v, i, arr) => arr.findIndex((x) => x.id === v.id) === i);

  const active = allVideos.find((v) => v.id === activeVideo) || allVideos[0];
  const a = fight.title.split(/\s+vs\.?\s+/i).map((s) => s.trim()).filter(Boolean);
  const f1 = a[0] ? portraitOf(a[0]) : null;
  const f2 = a[1] ? portraitOf(a[1]) : null;
  const showMatchup = Boolean(a.length >= 2 && f1 && f2 && (f1.fighter || f2.fighter));

  const matchupSide = (f, sideName) => (
    <div className="matchup__side">
      <div
        className="matchup__photo"
        style={
          f.fighter
            ? { backgroundImage: `url('/boxing/portraits/${f.fighter.image}.webp')` }
            : { background: 'linear-gradient(165deg,#22060d,#000)' }
        }
      />
      <div className="matchup__name">
        {f.fighter ? f.fighter.name : sideName}
        {f.record ? <span className="matchup__rec">{f.record}</span> : null}
      </div>
      {f.fighter ? (
        <div className="matchup__flag">
          {flagSrc(f.fighter.country) ? (
            <img className="flag-sm" src={flagSrc(f.fighter.country)} alt={f.fighter.country} />
          ) : null}
          {f.fighter.weight}
        </div>
      ) : null}
    </div>
  );

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <section className="fight-hero">
          <div className="fight-hero__bg" style={{ backgroundImage: `url(${fight.image})` }} />
          <div className="fight-hero__overlay" />
          <div className="container fight-hero__content">
            {fight.tag ? <span className="fight-hero__tag">{fight.tag}</span> : null}
            <h1>{fight.title}</h1>
            <p className="fight-hero__meta">
              {fight.date}
              {fight.venue ? ` · ${fight.venue}` : ''}
            </p>
            <div className="fight-hero__actions">
              <a href="#alsovideos" className="btn btn--primary">▶ Watch the videos</a>
              {ticket ? (
                <a href={ticket.url} target="_blank" rel="noopener noreferrer" className="btn btn--outline">
                  Get Tickets {ticket.price ? `· from ${ticket.price}` : ''}
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <div className="container fight-layout">
          <section className="fight-info">
            <div className="fight-poster" style={{ backgroundImage: `url(${fight.image})` }} role="img" aria-label={fight.title} />
            <h2>Fight information</h2>
            <p className="fight-info__desc">{fight.description}</p>
            <div className="profile__facts">
              <div className="fact">
                <div className="fact__label">Fight status</div>
                <div className="fact__value">
                  {live
                    ? `Result · ${live.method || 'BoxingScene'}`
                    : fight.status === 'upcoming'
                      ? 'Upcoming'
                      : 'Replay · on demand'}
                </div>
              </div>
              <div className="fact">
                <div className="fact__label">Date</div>
                <div className="fact__value">{fight.date}</div>
              </div>
              <div className="fact">
                <div className="fact__label">Venue</div>
                <div className="fact__value">{fight.venue || 'TBC'}</div>
              </div>
              <div className="fact">
                <div className="fact__label">Division / Stakes</div>
                <div className="fact__value">{fight.tag || '—'}</div>
              </div>
              {ticket ? (
                <div className="fact">
                  <div className="fact__label">Tickets from</div>
                  <div className="fact__value">{ticket.price} · {ticket.location}</div>
                </div>
              ) : null}
            </div>

            {live && <LiveResultBanner live={live} />}

            {showMatchup && (
              <div className="matchup">
                {matchupSide(f1, a[0])}
                <div className="matchup__versus">VS</div>
                {matchupSide(f2, a[1])}
              </div>
            )}
          </section>

          <section id="alsovideos" className="fight-videos">
            <h2>Watch {fight.title}</h2>
            {active ? (
              <VideoPlayer id={active.id} title={active.title} />
            ) : (
              <p style={{ color: 'var(--muted)' }}>Videos for this fight will be published here closer to fight night.</p>
            )}
            <p className="fight-videos__note">
              {fight.status === 'upcoming'
                ? 'Previews, past fights and build-up you can watch now — the full card streams here on fight night.'
                : 'Highlights and full rounds you can replay on demand.'}
            </p>

            <h3>Related videos</h3>
            <div className="grid grid--video">
              {allVideos.map((v, i) => (
                <div key={v.id}>
                  <button
                    className={`video-pick ${activeVideo === v.id ? 'active' : ''}`}
                    onClick={() => setActiveVideo(v.id)}
                    aria-label={`Play ${v.title}`}
                  >
                    <span className="video-pick__thumb" style={{ backgroundImage: `url(https://i.ytimg.com/vi/${v.id}/hqdefault.jpg)` }}>
                      {activeVideo === v.id ? (
                        <span className="video-pick__now">Now playing</span>
                      ) : (
                        <span className="video-pick__play">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </span>
                      )}
                    </span>
                    <span className="video-pick__title">{v.title}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section className="section">
          <div className="section__head">
            <span className="section__mark">●</span>
            <h2>More fights</h2>
            <a className="more" href="/upcoming">All fights →</a>
          </div>
          <div className="container">
            <div className="grid grid--fights">
              {moreFights.map((f) => (
                <MediaCard key={f.slug} media={f} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}