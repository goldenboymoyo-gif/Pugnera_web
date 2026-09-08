import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import BackButton from '../../components/BackButton';
import { getFighter } from '../../lib/db';
import { flagSrc } from '../../lib/flags';
import { videos } from '../../lib/videos';
import { apiFetch } from '../../lib/client-api';

export async function getServerSideProps({ params }) {
  const { source, fighter } = await getFighter(params.slug);
  return {
    notFound: source === 'db' && !fighter,
    props: { source, fighter, record: null, slug: params.slug },
  };
}

const profileVideos = ['P-xDqzj6Vp0', 'kg1LYIzxVPk', 'bIkRT1gcfJ4'];

export default function FighterProfile({ source, fighter, slug }) {
  const router = useRouter();
  const isDb = source === 'db';
  const [registeredBoxer, setRegisteredBoxer] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followBusy, setFollowBusy] = useState(false);

  useEffect(() => {
    // Backend-driven mode: the database is authoritative. Legacy mode merges
    // localStorage boxers for the pre-backend setup only.
    if (isDb) {
      setLoaded(true);
      return;
    }
    try {
      const users = JSON.parse(localStorage.getItem('pugnera_users') || '[]');
      const boxer = users.find((u) => u.role === 'boxer' && u.username === slug);
      if (boxer) {
        setRegisteredBoxer({
          ...boxer,
          name: boxer.fullName,
          record: `${boxer.wins || 0}-${boxer.losses || 0}-${boxer.draws || 0}`,
          kos: boxer.kos || 0,
          image: boxer.image || null,
          weight: boxer.profile && boxer.profile.weight ? boxer.profile.weight : 'Heavyweight',
          country: boxer.country || 'US',
          stance: boxer.stance || 'Orthodox',
          height: boxer.height || '—',
          reach: boxer.reach || '—',
        });
      }
    } catch (e) {}
    setLoaded(true);
  }, [isDb, slug]);

  useEffect(() => {
    let cancelled = false;
    const loadFollow = async () => {
      try {
        const res = await apiFetch('/api/follows');
        if (!cancelled && res.ok && fighter) {
          setFollowing(
            res.data.follows.some(
              (f) => f.follow_type === 'fighter' && f.target_id === fighter.id
            )
          );
        }
      } catch (e) {}
    };
    loadFollow();
    return () => {
      cancelled = true;
    };
  }, [fighter]);

  if (isDb && !fighter) {
    return (
      <>
        <Header />
        <main>
          <div className="container page-top">
            <BackButton />
          </div>
          <div className="container search-empty">Fighter not found.</div>
        </main>
        <Footer />
      </>
    );
  }

  const currentFighter = registeredBoxer || fighter;

  if (!currentFighter && isDb && loaded) {
    return (
      <>
        <Header />
        <main>
          <div className="container page-top">
            <BackButton />
          </div>
          <div className="container search-empty">Fighter not found.</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!currentFighter) {
    return (
      <>
        <Header />
        <main>
          <div className="container search-empty">Loading fighter...</div>
        </main>
        <Footer />
      </>
    );
  }

  const flag = flagSrc(currentFighter.country);
  const isRegistered = !isDb && !!registeredBoxer;
  const selfReported = isDb && currentFighter.recordSource === 'self';

  const photoStyle = {
    backgroundColor: '#0c0c0c',
    backgroundImage: currentFighter.imageUrl
      ? `url(${currentFighter.imageUrl})`
      : currentFighter.image
      ? `url('/boxing/portraits/${currentFighter.image}.webp')`
      : 'linear-gradient(165deg,#22060d 0%,#000 60%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };
  const showInitials = !currentFighter.imageUrl && !currentFighter.image;

  const toggleFollow = async () => {
    if (!fighter || followBusy) return;
    setFollowBusy(true);
    try {
      if (following) {
        const res = await apiFetch(`/api/follows?type=fighter&target=${fighter.id}`, { method: 'DELETE' });
        if (res.ok) setFollowing(false);
      } else {
        const res = await apiFetch('/api/follows', {
          method: 'POST',
          body: { followType: 'fighter', targetId: fighter.id },
        });
        if (res.ok) setFollowing(true);
      }
    } catch (e) {}
    setFollowBusy(false);
  };

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
          <div className="profile__photo" style={photoStyle}>
            {showInitials && (
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
                {currentFighter.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div className="profile__photo-name">
              <h2>{currentFighter.name}</h2>
              <div className="country">
                {flag ? <img className="flag-sm" src={flag} alt={currentFighter.country} /> : null}
                {currentFighter.country} · {currentFighter.weight}
              </div>
            </div>
          </div>
          <dl className="profile__info">
            <div className="stat">
              <dt>Division</dt>
              <dd>{currentFighter.weight}</dd>
            </div>
            <div className="stat">
              <dt>Nationality</dt>
              <dd>{currentFighter.country}</dd>
            </div>
            <div className="stat">
              <dt>Pro Record</dt>
              <dd>{currentFighter.record || '—'}</dd>
            </div>
            {isDb && currentFighter.gym ? (
              <div className="stat">
                <dt>Gym</dt>
                <dd>{currentFighter.gym}</dd>
              </div>
            ) : null}
            {isDb && currentFighter.proDebut ? (
              <div className="stat">
                <dt>Pro Debut</dt>
                <dd>{currentFighter.proDebut}</dd>
              </div>
            ) : null}
            {isDb && currentFighter.verified ? (
              <div className="belt">Pugnera Verified</div>
            ) : null}
            {isDb && currentFighter.status === 'approved' ? (
              <div className="belt">Pugnera Registered Fighter</div>
            ) : null}
            {isRegistered ? <div className="belt">Pugnera Registered Fighter</div> : null}
          </dl>
          {isDb && fighter ? (
            <button type="button" className="btn btn--outline profile__follow" onClick={toggleFollow} disabled={followBusy}>
              {following ? 'Following' : followBusy ? '…' : 'Follow'}
            </button>
          ) : null}
        </aside>

        <div className="profile__main">
          <h1>{currentFighter.name}</h1>
          <p className="record">
            {currentFighter.record || currentFighter.weight}
            {selfReported ? <small> · Self-reported, pending official confirmation</small> : null}
          </p>

          <div className="profile__section">
            <h2>Fighter Profile</h2>
            <div className="profile__facts">
              <div className="fact">
                <div className="fact__label">Division</div>
                <div className="fact__value">{currentFighter.weight} division</div>
              </div>
              <div className="fact">
                <div className="fact__label">Record</div>
                <div className="fact__value">
                  {currentFighter.record || 'Available via BoxRec'}
                </div>
              </div>
              <div className="fact">
                <div className="fact__label">Record status</div>
                <div className="fact__value">
                  {isDb && selfReported
                    ? 'Self-reported — confirmed by Pugnera review'
                    : isDb
                    ? 'Confirmed by Pugnera'
                    : 'Editorial'}
                </div>
              </div>
              <div className="fact">
                <div className="fact__label">Nationality</div>
                <div className="fact__value">{currentFighter.country}</div>
              </div>
            </div>
            {isDb && currentFighter.bio ? (
              <p className="profile__bio">{currentFighter.bio}</p>
            ) : null}
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