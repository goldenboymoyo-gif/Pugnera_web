import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';

const CONTACT = [
  {
    kind: 'Email',
    label: 'pugnera26@gmail.com',
    href: 'mailto:pugnera26@gmail.com',
    note: 'Write to the Pugnera team for general enquiries, partnerships and press.',
  },
  {
    kind: 'WhatsApp',
    label: '+263 714 719 659',
    href: 'https://wa.me/263714719659',
    note: 'Chat with us on WhatsApp — fighters, fans and promoters welcome.',
  },
  {
    kind: 'Phone',
    label: '+263 714 719 659',
    href: 'tel:+263714719659',
    note: 'Call us directly. The number also works on WhatsApp.',
  },
  {
    kind: 'WhatsApp',
    label: '+263 778 277 299',
    href: 'https://wa.me/263778277299',
    note: 'Second WhatsApp line for fighter enquiries and event bookings.',
  },
  {
    kind: 'Phone',
    label: '+263 778 277 299',
    href: 'tel:+263778277299',
    note: 'Call us directly. The number also works on WhatsApp.',
  },
];

function ContactIcon({ kind }) {
  if (kind === 'Email') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="2.5" y="4.5" width="19" height="15" rx="2" />
        <path d="m3.5 6.5 8.5 7 8.5-7" />
      </svg>
    );
  }
  if (kind === 'WhatsApp') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3z" />
        <path d="M9 8.5c-.4 1.6.6 3.9 2.3 5.6s4 2.7 5.6 2.3" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M5 4h4l1.5 4L8 10a13 13 0 0 0 6 6l2-2.5 4 1.5v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Contact <span style={{ color: 'var(--red)' }}>Pugnera</span></h1>
          <p>Have a question, a partnership idea or a fight to talk about? We&apos;d love to hear from you.</p>
        </div>
        <div className="container about-content">
          <section className="about-section">
            <h2>Get in touch</h2>
            <p className="about-lead">Reach the Pugnera team by email or WhatsApp.</p>
            <p>
              Email works best for quick questions and partnerships. Both phone numbers accept calls and
              WhatsApp messages, so you can reach us however suits you.
            </p>
          </section>

          <section className="about-section">
            <h2>Contact details</h2>
            <div className="contact-cards">
              {CONTACT.map((c) => (
                <a key={`${c.kind}-${c.label}`} href={c.href} className="contact-card" target={c.href.startsWith('http') ? '_blank' : undefined} rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                  <span className="contact-card__icon">{ContactIcon({ kind: c.kind })}</span>
                  <span className="contact-card__body">
                    <span className="contact-card__kind">{c.kind}</span>
                    <span className="contact-card__value">{c.label}</span>
                    <span className="contact-card__note">{c.note}</span>
                  </span>
                  <span className="contact-card__arrow" aria-hidden="true">›</span>
                </a>
              ))}
            </div>
          </section>

          <section className="about-cta">
            <h2>Let&apos;s keep boxing growing.</h2>
            <p>
              Whether you&apos;re a fighter building your profile, a promoter planning a night or a fan with a
              story to share — get in contact and we&apos;ll get back to you.
            </p>
            <div className="about-cta__actions">
              <a href="mailto:pugnera26@gmail.com" className="btn btn--primary">Email us</a>
              <a href="https://wa.me/263714719659" target="_blank" rel="noopener noreferrer" className="btn btn--outline">
                WhatsApp us
              </a>
              <a href="/fighters" className="btn btn--outline">Explore Pugnera</a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}