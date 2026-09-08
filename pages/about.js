import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';

const FighterIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="7.5" r="3.5" />
    <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
  </svg>
);

const FanIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
);

const EventIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <rect x="3" y="4.5" width="18" height="17" rx="2" />
    <path d="M3 9h18M8 2.5v4M16 2.5v4" />
    <path d="M8.5 13.5 11 16l4.5-4.5" />
  </svg>
);

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <section className="about-hero">
          <div className="about-hero__bg"></div>
          <div className="about-hero__content container">
            <span className="about-hero__label">About Pugnera</span>
            <h1>
              Boxing has the talent.
              <br />
              We&apos;re building the connection.
            </h1>
            <p>
              Pugnera is a platform built around professional boxing, helping fighters, fans and the people
              behind the sport connect in one place.
            </p>
          </div>
        </section>

        <div className="about-content">
          <section className="about-section">
            <h2>Why Pugnera?</h2>
            <p className="about-lead">We kept seeing the same problem.</p>
            <p>
              There are talented boxers across Africa, but finding information about them isn&apos;t always
              easy. A fighter can have years of experience, important wins and a growing following, yet still
              be difficult to discover online.
            </p>
            <p>
              Fight information can be scattered across different pages and social media accounts. Fans may
              hear about a fight after it has already happened. And fighters don&apos;t always have a proper
              place to build their professional profile.
            </p>
            <p>We believe that can be better.</p>
            <div className="about-quote">
              <p>That&apos;s where Pugnera comes in.</p>
            </div>
          </section>

          <section className="about-section">
            <h2>One place for professional boxing</h2>
            <p>
              Pugnera is being built to make it easier to discover fighters, follow their careers and keep up
              with upcoming fights and events.
            </p>
            <p>
              Fans can find fighters they care about. Boxers can build their profiles and share their journey.
              As the platform grows, we want to create more ways for the boxing community to connect with
              opportunities, events and each other.
            </p>

            <div className="about-features">
              <div className="about-feature">
                <span className="about-feature__icon">{FighterIcon}</span>
                <h3>Fighters</h3>
                <p>A place to build a professional profile and be easier to discover.</p>
              </div>
              <div className="about-feature">
                <span className="about-feature__icon">{FanIcon}</span>
                <h3>Fans</h3>
                <p>A simple way to follow fighters and keep up with the sport.</p>
              </div>
              <div className="about-feature">
                <span className="about-feature__icon">{EventIcon}</span>
                <h3>Events</h3>
                <p>Discover fights and stay informed about what&apos;s happening.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>What we want to achieve</h2>
            <p className="about-lead">We&apos;re starting with boxing. The bigger goal is connection.</p>
            <p>
              We want to help make African professional boxing easier to discover and easier to follow.
            </p>
            <p>
              We want a fighter&apos;s location to matter less when it comes to being seen. Whether they&apos;re
              fighting in Harare, Lagos, Johannesburg, Accra or elsewhere on the continent, their career
              should have a place online where people can find it.
            </p>
            <p>
              We know Pugnera won&apos;t solve every problem in boxing. But we believe better digital tools can
              make a real difference.
            </p>
          </section>

          <section className="about-mission">
            <span className="about-hero__label">Our Mission</span>
            <h2>To make professional boxing easier to discover, follow and connect across Africa.</h2>
            <div className="about-mission__words">
              <span>Visibility</span>
              <span>Connection</span>
              <span>Opportunity</span>
            </div>
          </section>

          <section className="about-section">
            <h2>Where we want to go</h2>
            <p>
              We want to see a future where African boxers can build careers that are visible beyond their
              hometowns and countries.
            </p>
            <p>A future where fans can easily find the fighters and fights they care about.</p>
            <p>
              And a future where the people investing in African boxing can find the talent and opportunities
              that already exist here.
            </p>
          </section>

          <section className="about-section">
            <h2>Built by Bright Moyo &amp; Mildred Ngoma</h2>
            <div className="about-founders">
              <div className="about-founder">
                <div className="about-founder__monogram" aria-hidden="true">BM</div>
                <h3>Bright Moyo</h3>
                <span className="about-founder__role">Co-Founder</span>
                <p>
                  Bright is a full-stack developer and one of the people behind the technology powering
                  Pugnera. He is focused on building the platform and turning the idea into something people
                  can actually use.
                </p>
              </div>
              <div className="about-founder">
                <div className="about-founder__monogram" aria-hidden="true">MN</div>
                <h3>Mildred Ngoma</h3>
                <span className="about-founder__role">Co-Founder</span>
                <p>
                  Mildred is a co-founder of Pugnera, working alongside Bright on the direction and growth of
                  the platform.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section about-section--privacy">
            <h2>Your information matters</h2>
            <p>
              Pugnera collects information needed to provide and improve the platform. We don&apos;t believe
              users should have to give us information that we don&apos;t need.
            </p>
            <p>
              We take reasonable steps to protect accounts and personal information and will continue
              improving our security as Pugnera grows.
            </p>
            <div className="about-privacy-actions">
              <a href="/about#privacy" className="btn btn--outline">Privacy Policy</a>
              <a href="/about#privacy" className="btn btn--outline">Terms of Service</a>
            </div>
          </section>

          <section className="about-cta">
            <h2>We&apos;re building Pugnera one step at a time.</h2>
            <p>
              There&apos;s a lot we want to build. For now, we&apos;re focused on getting the basics right and
              creating something useful for the boxing community.
            </p>
            <div className="about-cta__actions">
              <a href="/register" className="btn btn--primary">Create an account</a>
              <a href="/fighters" className="btn btn--outline">Explore Pugnera</a>
            </div>
            <p className="about-cta__brand">Built for boxing. Built for Africa. Built for the next generation.</p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}