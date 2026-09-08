import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';

export default function AboutPage() {
  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>About <span style={{ color: 'var(--red)' }}>Pugnera</span></h1>
          <p>A technology-driven platform built to help modernise and strengthen professional boxing in Africa.</p>
        </div>

        <div className="about-content">
          <section className="about-section">
            <h2>Our Story</h2>
            <p>
              We believe African boxing has incredible talent, passionate fans and a growing community, but too many boxers, events and opportunities remain difficult to discover. Information is often scattered, athletes struggle to build consistent digital visibility, and fans can find it difficult to follow fighters, discover upcoming fights and stay connected with the sport.
            </p>
            <p>
              Pugnera exists to help change that. We are building a digital ecosystem where professional boxers, fans, events, promoters, sponsors and other stakeholders can connect through one accessible platform.
            </p>
            <div className="about-quote">
              <h2>Our goal is simple</h2>
              <p>Make African professional boxing easier to discover, follow, support and grow.</p>
            </div>
          </section>

          <section className="about-section">
            <h2>What We Do</h2>
            <p>
              Pugnera develops digital solutions designed specifically for the professional boxing ecosystem. Our platform is being built to bring important parts of the boxing experience together, including:
            </p>
            <ul className="about-list">
              <li>Professional boxer profiles</li>
              <li>Fighter records and career information</li>
              <li>Upcoming and past fights</li>
              <li>Boxing events</li>
              <li>Fight information and results</li>
              <li>Fan engagement</li>
              <li>Ratings and community interaction</li>
              <li>Digital visibility for boxers</li>
              <li>Event and fight discovery</li>
              <li>Opportunities for partnerships and sponsorship</li>
              <li>Boxing-related news and content</li>
              <li>Digital tools for people working within the boxing ecosystem</li>
            </ul>
            <p>
              We want a boxer in Zimbabwe, Zambia, Ghana, Nigeria, South Africa or anywhere else in Africa to have a digital presence that can be discovered beyond their local gym or city. At the same time, we want fans to have a central place where they can discover the fighters and events they care about.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Purpose</h2>
            <p>
              Our purpose is to use technology to close the digital gap surrounding African professional boxing. Africa has produced talented fighters throughout boxing history, yet talent alone is not always enough. Fighters also need visibility, professional presentation, opportunities, audiences and connections.
            </p>
            <p>We want to make it easier for:</p>
            <ul className="about-list">
              <li><strong>Boxers</strong> to build their professional identity and gain visibility.</li>
              <li><strong>Fans</strong> to discover fighters, follow careers and engage with boxing.</li>
              <li><strong>Event organisers</strong> to present their events professionally and reach wider audiences.</li>
              <li><strong>Sponsors and partners</strong> to discover athletes, events and opportunities within African boxing.</li>
              <li><strong>The wider boxing community</strong> to access reliable, organised and useful information.</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Our Mission</h2>
            <div className="about-quote">
              <p>
                To build a trusted digital ecosystem that connects African professional boxing with the people, audiences and opportunities it needs to grow.
              </p>
            </div>
            <p>
              We are committed to using technology to improve visibility, accessibility and engagement within the sport while creating opportunities for African boxers to build stronger professional careers. We want Pugnera to become more than a website — part of the digital infrastructure supporting the future of African professional boxing.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Vision</h2>
            <div className="about-quote">
              <p>
                To become Africa&apos;s leading digital platform for professional boxing, connecting fighters, fans, events and opportunities across the continent and eventually with the global boxing community.
              </p>
            </div>
            <p>
              We envision a future where an African boxer does not have to depend solely on word of mouth or local recognition to be discovered. Their career, achievements, fights and professional identity should be accessible to the world.
            </p>
          </section>

          <section className="about-section">
            <h2>What We Want to Achieve</h2>
            <div className="about-goals">
              <div className="about-goal">
                <span className="about-goal__num">01</span>
                <h3>Increase Boxer Visibility</h3>
                <p>Give professional boxers a stronger digital presence where fans, promoters, sponsors and other industry stakeholders can discover them.</p>
              </div>
              <div className="about-goal">
                <span className="about-goal__num">02</span>
                <h3>Connect African Boxing</h3>
                <p>Bring boxing communities across different African countries together rather than keeping them isolated within individual cities or national markets.</p>
              </div>
              <div className="about-goal">
                <span className="about-goal__num">03</span>
                <h3>Improve Access to Information</h3>
                <p>Make fight schedules, boxer profiles, results, events and other important information easier to find and understand.</p>
              </div>
              <div className="about-goal">
                <span className="about-goal__num">04</span>
                <h3>Strengthen Fan Engagement</h3>
                <p>Give boxing fans a better way to follow fighters, discover events and participate in the sport beyond simply watching fights.</p>
              </div>
              <div className="about-goal">
                <span className="about-goal__num">05</span>
                <h3>Create Commercial Opportunities</h3>
                <p>Help create better connections between boxers, events, sponsors, brands and potential partners.</p>
              </div>
              <div className="about-goal">
                <span className="about-goal__num">06</span>
                <h3>Build Digital Infrastructure</h3>
                <p>Develop technology that can support the professionalisation and continued growth of African boxing.</p>
              </div>
              <div className="about-goal">
                <span className="about-goal__num">07</span>
                <h3>Take Boxing to a Global Audience</h3>
                <p>African fighters should not only be known within their hometowns or countries — Pugnera helps make African professional boxing visible to audiences around the world.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Values</h2>
            <div className="about-values">
              <div className="about-value">
                <h3>Accessibility</h3>
                <p>Technology should make boxing easier to discover, not more complicated.</p>
              </div>
              <div className="about-value">
                <h3>Trust</h3>
                <p>Information about fighters, events and the sport should be handled responsibly and presented transparently.</p>
              </div>
              <div className="about-value">
                <h3>Innovation</h3>
                <p>We continuously look for better ways to use technology to solve real problems within boxing.</p>
              </div>
              <div className="about-value">
                <h3>Opportunity</h3>
                <p>Talent deserves an opportunity to be seen, supported and developed.</p>
              </div>
              <div className="about-value">
                <h3>Community</h3>
                <p>Boxing is more than the person inside the ring — it includes fans, coaches, promoters, organisers, sponsors and communities.</p>
              </div>
              <div className="about-value">
                <h3>African Excellence</h3>
                <p>African boxing deserves technology and digital platforms built with the same ambition as the talent found across the continent.</p>
              </div>
            </div>
          </section>

          <section className="about-section">
            <h2>Our Founders</h2>
            <div className="about-founders">
              <div className="about-founder">
                <h3>Bright Moyo</h3>
                <span className="about-founder__role">Co-Founder</span>
                <p>
                  Bright Moyo is a technology-focused entrepreneur and full-stack developer with an interest in building digital products that solve real-world problems. At Pugnera, Bright focuses on technology, product development and turning the company&apos;s vision into practical digital solutions — using software and innovation to create opportunities that extend beyond traditional geographical boundaries.
                </p>
              </div>
              <div className="about-founder">
                <h3>Mildred Ngoma</h3>
                <span className="about-founder__role">Co-Founder</span>
                <p>
                  Mildred Ngoma is a co-founder of Pugnera and contributes to the company&apos;s direction, development and growth. Together with Bright Moyo, she shares the vision of building a platform that can contribute to the digital transformation and growth of African professional boxing.
                </p>
              </div>
            </div>
          </section>

          <section className="about-section" id="privacy">
            <h2>Privacy &amp; Data Protection</h2>
            <p>
              Pugnera understands that trust is fundamental to building a digital platform. We are committed to protecting the personal information entrusted to us and handling user data responsibly. Depending on the features a user interacts with, we may collect information such as account details, contact information, profile information, platform activity and other information necessary to provide our services.
            </p>
            <ul className="about-list">
              <li>Collect only information that is reasonably necessary for our services.</li>
              <li>Explain how information is collected and used.</li>
              <li>Protect user information from unauthorised access.</li>
              <li>Avoid selling personal information to third parties.</li>
              <li>Use appropriate security measures to protect our systems.</li>
              <li>Give users appropriate control over their information.</li>
              <li>Retain information only for as long as reasonably necessary or legally required.</li>
              <li>Respect applicable privacy and data-protection requirements.</li>
            </ul>
          </section>

          <section className="about-section">
            <h2>Security</h2>
            <p>
              Security is an important part of how we build Pugnera. We are committed to implementing reasonable technical and organisational safeguards designed to protect user information and the platform.
            </p>
            <ul className="about-list">
              <li>Secure authentication</li>
              <li>Password protection and secure password handling</li>
              <li>Encrypted communication</li>
              <li>Access controls</li>
              <li>Secure database practices</li>
              <li>Monitoring for suspicious activity</li>
              <li>Regular software updates</li>
              <li>Protection against common web vulnerabilities</li>
              <li>Controlled access to sensitive information</li>
              <li>Secure handling of user sessions</li>
            </ul>
            <p>
              However, no internet service can guarantee absolute security. As Pugnera grows, we will continue improving our security practices and infrastructure to respond to new threats and protect our users.
            </p>
          </section>

          <section className="about-section">
            <h2>User Safety &amp; Responsible Use</h2>
            <p>
              Pugnera is intended to provide a professional environment for the boxing community. Users are expected to use the platform responsibly and respectfully. We do not tolerate:
            </p>
            <ul className="about-list">
              <li>Harassment</li>
              <li>Fraudulent activity</li>
              <li>Impersonation</li>
              <li>Deliberate misinformation</li>
              <li>Abuse of other users</li>
              <li>Unauthorised access to accounts or systems</li>
              <li>Attempts to manipulate platform functionality</li>
              <li>Content that violates applicable laws</li>
            </ul>
            <p>
              We reserve the right to investigate violations of our platform rules and take appropriate action where necessary.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Commitment to Boxers</h2>
            <p>
              Pugnera is being built with the boxer at the centre. Professional fighters should have more than a name on a fight poster — they should have a professional digital identity that can grow alongside their career. A boxer should be able to build recognition, connect with fans, showcase achievements and become easier for potential partners and audiences to discover.
            </p>
            <p>
              Our ambition is to help turn digital visibility into real opportunities.
            </p>
          </section>

          <section className="about-section">
            <h2>Our Commitment to Fans</h2>
            <p>
              Fans are an essential part of boxing. Pugnera aims to make it easier for fans to discover fighters, follow their journeys, find upcoming events and remain connected to the sport. We want fans to feel that African boxing is not happening somewhere far away — it should be accessible from their phone, computer or wherever they are in the world.
            </p>
          </section>

          <section className="about-section">
            <h2>Building for Africa</h2>
            <p>
              Pugnera is being built with Africa at its core. The African boxing ecosystem is diverse — different countries have different sporting structures, audiences, resources and digital environments. Rather than simply copying platforms built for other markets, we want to understand the realities of African boxing and build solutions that work within them.
            </p>
            <p>
              Our journey begins with Africa, but our ambition is global.
            </p>
          </section>

          <section className="about-section">
            <h2>The Future of Pugnera</h2>
            <p>
              Pugnera is only the beginning. As the platform grows, we intend to explore additional technologies and services that can support professional boxing, including deeper athlete profiles, event management capabilities, digital media, analytics, partnerships, fan experiences and other tools for the boxing ecosystem.
            </p>
            <p>
              We will continue listening to boxers, fans, promoters, sponsors and other stakeholders as we build. Our objective is not to build technology for the sake of technology.
            </p>
            <div className="about-quote">
              <p>We are building technology to solve real problems.</p>
            </div>
          </section>

          <div className="about-tagline">
            <h2>Pugnera</h2>
            <p>Built for boxing. Built for Africa. Built for the next generation.</p>
            <span className="about-tagline__founders">Founders: Bright Moyo &amp; Mildred Ngoma</span>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}