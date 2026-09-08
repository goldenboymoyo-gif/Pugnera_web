import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import MediaCard from '../components/MediaCard';
import { getContent } from '../lib/boxing-data';

export async function getStaticProps() {
  return { props: { content: getContent() } };
}

export default function LivePage({ content }) {
  const events = [...content.upcomingFights].sort((a, b) => {
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
          <h1>Fight <span style={{ color: 'var(--red)' }}>Nights</span></h1>
          <p>Every upcoming live fight night on Pugnera — pick your event for the card, tickets and the full build-up.</p>
        </div>

        <div className="container">
          <div className="upcoming-note">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>
              No live broadcast is streaming right now. The next fight night goes live below — it will stream on
              Pugnera from fight night itself. Order tickets now or watch the build-up.
            </p>
          </div>

          <div className="grid grid--fights">
            {events.map((f) => (
              <MediaCard key={f.title} media={{ ...f, status: 'upcoming' }} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}