import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { getContent } from '../lib/boxing-data';

export async function getStaticProps() {
  return { props: { content: getContent() } };
}

export default function TicketsPage({ content }) {
  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Tickets</h1>
          <p>Official partner tickets for the biggest boxing nights of 2026.</p>
        </div>
        <div className="container">
          <div className="grid grid--half" style={{ gridTemplateColumns: '1fr' }}>
            {content.tickets.map((t) => (
              <div className="ticket-card" key={`${t.title}-${t.date}`}>
                <div
                  className="ticket-card__thumb"
                  style={{ backgroundImage: `url(${t.image})` }}
                />
                <div className="ticket-card__body">
                  <h3>{t.title}</h3>
                  <p className="ticket-meta">{t.date} · {t.time} · {t.venue}, {t.location}</p>
                  <p>From {t.price}</p>
                </div>
                <a className="ticket-card__cta" href={t.url} target="_blank" rel="noopener noreferrer">
                  Get Tickets
                </a>
              </div>
            ))}
          </div>
          <p className="ticket-note">
            Ticket links open the official promoter box-office in a new tab. Streaming of these events is available on Pugnera.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}