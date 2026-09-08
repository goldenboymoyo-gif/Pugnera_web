import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import BackButton from '../../components/BackButton';
import { fighters, records, championBelts } from '../../lib/boxing-data';
import { flagSrc } from '../../lib/flags';
import { videos } from '../../lib/videos';

export async function getStaticPaths() {
  return {
    paths: fighters.map((f) => ({ params: { slug: f.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const fighter = fighters.find((f) => f.slug === params.slug);
  const related = [...videos.filter((v) => v.category === 'training'), ...videos].slice(0, 3);
  return { props: { fighter, related } };
}

const profileVideos = ['P-xDqzj6Vp0', 'kg1LYIzxVPk', 'bIkRT1gcfJ4'];

export default function FighterProfile({ fighter, related }) {
  const flag = flagSrc(fighter.country);
  const record = records[fighter.name];
  const belt = championBelts[fighter.name];

  const trainVideos = profileVideos.map((id) => {
    const v = videos.find((x) => x.id === id);
    return { ...v, video: v.id, image: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, href: `/watch?v=${id}` };
  });

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="container profile">
        <aside className="profile__card">
          <div
            className="profile__photo"
            style={{
              backgroundImage: fighter.image
                ? `url('/boxing/portraits/${fighter.image}.webp')`
                : undefined,
              background: fighter.image
                ? undefined
                : 'linear-gradient(165deg,#22060d 0%,#000 60%)',
            }}
          >
            {!fighter.image && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-special)',
                  fontWeight: 800,
                  fontSize: 60,
                  color: 'var(--red)',
                }}
              >
                {fighter.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="profile__photo-name">
              <h2>{fighter.name}</h2>
              <div className="country">
                {flag ? <img className="flag-sm" src={flag} alt={fighter.country} /> : null}
                {fighter.country} · {fighter.weight}
              </div>
            </div>
          </div>
          <dl className="profile__info">
            <div className="stat">
              <dt>Division</dt>
              <dd>{fighter.weight}</dd>
            </div>
            <div className="stat">
              <dt>Nationality</dt>
              <dd>{fighter.country}</dd>
            </div>
            <div className="stat">
              <dt>Pro Record</dt>
              <dd>{record || '—'}</dd>
            </div>
            {belt ? <div className="belt">{belt}</div> : null}
          </dl>
        </aside>

        <div className="profile__main">
          <h1>{fighter.name}</h1>
          <p className="record">
            {record || fighter.weight}
            {record ? <small> · {fighter.weight}</small> : null}
          </p>

          <div className="profile__section">
            <h2>Fighter Profile</h2>
            <div className="profile__facts">
              <div className="fact">
                <div className="fact__label">Division</div>
                <div className="fact__value">{fighter.weight} division</div>
              </div>
              <div className="fact">
                <div className="fact__label">Record</div>
                <div className="fact__value">{record || 'Available via BoxRec'}</div>
              </div>
              <div className="fact">
                <div className="fact__label">Championship status</div>
                <div className="fact__value">{belt || 'Top contender'}</div>
              </div>
              <div className="fact">
                <div className="fact__label">Nationality</div>
                <div className="fact__value">{fighter.country}</div>
              </div>
            </div>
          </div>

          <div className="profile__section">
            <h2>Technique &amp; Training <span style={{ color: 'var(--muted)', fontSize: 14, fontFamily: 'var(--font-normal)', fontWeight: 400 }}>— plays in the Watch library</span></h2>
            <div className="grid grid--video">
              {trainVideos.map((v) => (
                <a key={v.id} href={v.href} className="video-link-card">
                  <span className="video-link-card__thumb" style={{ backgroundImage: `url(${v.image})` }}>
                    <span className="media-card__play" aria-hidden="true">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                    </span>
                  </span>
                  <span className="video-link-card__title">{v.title}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
        </div>
      </main>
      <Footer />
    </>
  );
}