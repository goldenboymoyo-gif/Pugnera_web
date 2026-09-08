import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';
import { news } from '../lib/news';

export async function getStaticProps() {
  return { props: { news } };
}

export default function NewsPage({ news }) {
  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Boxing <span style={{ color: 'var(--red)' }}>News</span></h1>
          <p>The latest on fights, results, announcements and the stories behind the 2026 season.</p>
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
      </main>
      <Footer />
    </>
  );
}