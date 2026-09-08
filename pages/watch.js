import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import MediaCard from '../components/MediaCard';
import VideoPlayer from '../components/VideoPlayer';
import { videos, CATEGORIES } from '../lib/videos';

export async function getStaticProps() {
  return { props: { videos, categories: CATEGORIES } };
}

export default function WatchPage({ videos, categories }) {
  const router = useRouter();
  const [cat, setCat] = useState('all');
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    const q = router.query.v;
    if (typeof q === 'string' && videos.some((v) => v.id === q)) setActiveId(q);
  }, [router.query.v, videos]);

  const list = cat === 'all' ? videos : videos.filter((v) => v.category === cat);
  const active = activeId ? videos.find((v) => v.id === activeId) : null;

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Watch on <span style={{ color: 'var(--red)' }}>Pugnera</span></h1>
          <p>Classic fights, knockouts, documentaries and training — every video plays right here on the page.</p>
        </div>
        <div className="container">
          {active ? (
            <section className="watch-stage">
              <VideoPlayer id={active.id} title={active.title} />
              <div className="watch-stage__info">
                <span className="video-pick__now">Now playing</span>
                <h2>{active.title}</h2>
                <p>{active.channel} · {active.tag}</p>
              </div>
            </section>
          ) : (
            <div className="watch-empty">
              <p>Pick any video below to start watching. It plays here on the page.</p>
            </div>
          )}

          <div className="category-chips">
            {categories.map((c) => (
              <button key={c} className={`chip ${cat === c ? 'active' : ''}`} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid--video">
            {list.map((v) => (
              <MediaCard
                key={v.id}
                media={{ image: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, title: v.title, date: v.tag, video: v.id }}
                onClick={() => setActiveId(v.id)}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}