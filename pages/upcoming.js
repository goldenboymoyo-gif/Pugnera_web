import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import MediaCard from '../components/MediaCard';
import { getUpcoming } from '../lib/db';
import { useLiveResults, findLiveResult } from '../components/LiveResults';

export async function getServerSideProps() {
  const { source, fights, error } = await getUpcoming();
  return { props: { source, fights, dbError: !!error } };
}

export default function UpcomingPage({ source, fights, dbError }) {
  const liveResults = useLiveResults();
  const isDb = source === 'db';

  const ordered = [...fights].sort((a, b) => {
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
          {isDb && fights.length === 0 ? (
            <div className="search-empty">
              {dbError
                ? 'The fight calendar is temporarily unavailable. Please try again shortly.'
                : 'No upcoming fights announced yet. New nights appear here as soon as they are announced.'}
            </div>
          ) : (
            <div className="grid grid--fights">
              {ordered.map((f) => (
                <MediaCard
                  key={f.slug}
                  media={f}
                  badgeLabel={findLiveResult(liveResults, f.title) ? 'Result' : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}