import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import MediaCard from '../components/MediaCard';
import { getContent, fights } from '../lib/boxing-data';
import { useLiveResults, findLiveResult } from '../components/LiveResults';

export async function getStaticProps() {
  const content = getContent();
  const upcoming = fights.filter((f) => f.type === 'upcoming');
  return { props: { content, upcoming } };
}

export default function UpcomingPage({ content, upcoming }) {
  const liveResults = useLiveResults();
  const ordered = [...upcoming].sort((a, b) => {
    const d = (s) => (s === 'TBC' ? 999 : parseInt(s.split(' ')[1], 10));
    return d(a.date) - d(b.date);
  });
  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Upcoming <span style={{ color: 'var(--red)' }}>Fights</span></h1>
          <p>Every big boxing night coming up — open a card for the fight info, tickets and build-up videos.</p>
        </div>
        <div className="container">
          <div className="grid grid--fights">
            {ordered.map((f) => (
              <MediaCard
                key={f.slug}
                media={f}
                badgeLabel={findLiveResult(liveResults, f.title) ? 'Result' : undefined}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}