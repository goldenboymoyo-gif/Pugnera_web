import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import HeroSlider from '../components/layout/HeroSlider';
import MediaCard from '../components/MediaCard';
import FighterCard from '../components/FighterCard';
import { getContent, fighters, records } from '../lib/boxing-data';
import { rankings } from '../lib/rankings';
import { videos } from '../lib/videos';
import { news } from '../lib/news';
import { flagSrc } from '../lib/flags';

export async function getStaticProps() {
  const content = getContent();
  const spotlight = [fighters.find((f) => f.name === 'Naoya Inoue'), fighters.find((f) => f.name === 'Shakur Stevenson'), fighters.find((f) => f.name === 'Ryan Garcia')].filter(Boolean);
  const p4p = rankings.find((r) => r.id === 'p4p');
  return { props: { content, spotlight, p4p, featuredVideos: videos.slice(0, 4), news: news.slice(0, 4) } };
}

export default function Home({ content, spotlight, p4p, featuredVideos, news }) {
  return (
    <>
      <Header />
      <main>
        <HeroSlider slides={content.heroSlides} />

        <section className="section" id="featured">
          <div className="section__head">
            <span className="section__mark">●</span>
            <h2>Fights You Can&apos;t Miss</h2>
            <a className="more" href="/upcoming">View all upcoming →</a>
          </div>
          <div className="container">
            <div className="grid grid--fights">
              {content.upcomingFights.slice(0, 4).map((f) => (
                <MediaCard key={f.title} media={f} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section__head">
            <span className="section__mark">●</span>
            <h2>Replays &amp; Highlights</h2>
            <a className="more" href="/watch">Open the library →</a>
          </div>
          <div className="container">
            <div className="grid grid--fights">
              {[...content.previousEvents.slice(0, 3), ...content.highlights.slice(1, 2)].map((f) => (
                <MediaCard key={f.title} media={f} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section__head">
            <span className="section__mark">●</span>
            <h2>Pound-for-Pound Top 5</h2>
            <a className="more" href="/rankings">All rankings →</a>
          </div>
          <div className="container">
            <div className="grid grid--portrait" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
              {p4p.entries.slice(0, 5).map((e) => {
                const f = fighters.find(
                  (x) => x.name.toLowerCase().split(' ')[0] === e.name.toLowerCase().split(' ')[0]
                );
                const flag = flagSrc(e.country);
                return (
                  <a key={e.rank} className="p4p-card" href={`/fighters/${(f && f.slug) || '#'}`}>
                    <div
                      className="p4p-card__photo"
                      style={
                        f && f.image
                          ? { backgroundImage: `url('/boxing/portraits/${f.image}.webp')` }
                          : { background: 'linear-gradient(165deg,#22060d,#000)' }
                      }
                    >
                      <div className="p4p-card__top">
                        <span className="p4p-card__num">#{e.rank}</span>
                        {flag ? <img className="flag-sm" src={flag} alt={e.country} /> : null}
                      </div>
                    </div>
                    <div className="p4p-card__body">
                      <h3>{e.name}</h3>
                      <p>{e.record} · {e.note || e.country}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section__head">
            <span className="section__mark">●</span>
            <h2>Fighter Spotlight</h2>
            <a className="more" href="/fighters">All fighters →</a>
          </div>
          <div className="container">
            <div className="grid grid--portrait">
              {spotlight.map((f) => (
                <FighterCard key={f.slug} fighter={f} />
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section__head">
            <span className="section__mark">●</span>
            <h2>Get Tickets</h2>
            <a className="more" href="/tickets">All tickets →</a>
          </div>
          <div className="container">
            <div className="grid grid--half">
              {content.tickets.slice(0, 3).map((t) => (
                <div className="ticket-card" key={t.title}>
                  <div className="ticket-card__thumb" style={{ backgroundImage: `url(${t.image})` }} />
                  <div className="ticket-card__body">
                    <h3>{t.title}</h3>
                    <p className="ticket-meta">{t.date} · {t.venue}, {t.location}</p>
                    <p>From {t.price}</p>
                  </div>
                  <a className="ticket-card__cta" href={t.url} target="_blank" rel="noopener noreferrer">Get Tickets</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section__head">
            <span className="section__mark">●</span>
            <h2>Latest News</h2>
            <a className="more" href="/news">All news →</a>
          </div>
          <div className="container">
            <div className="news-grid">
              {news.map((n) => (
                <a key={n.id} className="news-card" href={n.href}>
                  <div className="news-card__media" style={{ backgroundImage: `url(${n.image})` }}>
                    <span className="news-card__tag">{n.tag}</span>
                    <span className="news-card__date">{n.date}</span>
                  </div>
                  <div className="news-card__body">
                    <h3>{n.title}</h3>
                    <p>{n.excerpt}</p>
                    <span className="news-card__more">Read more →</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section__head">
            <span className="section__mark">●</span>
            <h2>Watch on Pugnera</h2>
            <a className="more" href="/watch">Everything →</a>
          </div>
          <div className="container">
            <div className="grid grid--video">
              {featuredVideos.map((v) => (
                <MediaCard
                  key={v.id}
                  media={{ image: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`, title: v.title, date: v.tag, video: v.id }}
                  href={`/watch?v=${v.id}`}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}