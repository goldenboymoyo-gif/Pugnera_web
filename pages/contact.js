import { useState } from 'react';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BackButton from '../components/BackButton';

const WHATSAPP = '263714719659';
const EMAIL = 'pugnera26@gmail.com';

const SUBJECTS = [
  'General enquiry',
  'Fighter profile',
  'Events & promotion',
  'Partnership or press',
  'Something else',
];

export default function ContactPage() {
  const [name, setName] = useState('');
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const valid = () => {
    if (!name.trim()) return 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(from.trim())) return 'Please enter a valid email address.';
    if (message.trim().length < 10) return 'Please write a short message.';
    return '';
  };

  const body = () =>
    `Name: ${name}\nEmail: ${from}\nSubject: ${subject}\n\n${message}`.trim();

  const sendWhatsApp = (e) => {
    e.preventDefault();
    const err = valid();
    if (err) return setError(err);
    setError('');
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(body())}`, '_blank', 'noopener,noreferrer');
  };

  const sendEmail = (e) => {
    e.preventDefault();
    const err = valid();
    if (err) return setError(err);
    setError('');
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Pugnera — ${subject}`)}&body=${encodeURIComponent(body())}`;
  };

  return (
    <>
      <Header />
      <main>
        <div className="container page-top">
          <BackButton />
        </div>
        <div className="page-hero">
          <h1>Contact <span style={{ color: 'var(--red)' }}>Pugnera</span></h1>
          <p>Have a question, an idea or a fight to talk about? Send us a message and we&apos;ll get back to you.</p>
        </div>

        <div className="container about-content">
          <section className="about-section">
            <h2>Send us a message</h2>
            <form className="contact-form" onSubmit={sendEmail} noValidate>
              {error && (
                <p className="rf-error" role="alert">{error}</p>
              )}
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="con-name">Your name</label>
                  <input
                    id="con-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Tinashe Moyo"
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="con-email">Your email</label>
                  <input
                    id="con-email"
                    type="email"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              <div className="form-field">
                <label htmlFor="con-subject">Subject</label>
                <select id="con-subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="con-message">Message</label>
                <textarea
                  id="con-message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help?"
                />
              </div>
              <div className="contact-form__actions">
                <button type="submit" className="btn btn--primary">Send by email</button>
                <button type="button" className="btn btn--outline" onClick={sendWhatsApp}>
                  Send on WhatsApp
                </button>
              </div>
              <p className="contact-form__hint">
                Submitting opens your email app or WhatsApp with the message ready to send.
              </p>
            </form>
          </section>

          <section className="about-section">
            <h2>Other ways to reach us</h2>
            <p className="about-lead">You can also contact us directly — no forms needed.</p>
            <ul className="contact-links">
              <li>
                <span className="contact-links__tag">Email</span>
                <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </li>
              <li>
                <span className="contact-links__tag">WhatsApp</span>
                <a href="https://wa.me/263714719659" target="_blank" rel="noopener noreferrer">+263 714 719 659</a>
              </li>
              <li>
                <span className="contact-links__tag">WhatsApp</span>
                <a href="https://wa.me/263778277299" target="_blank" rel="noopener noreferrer">+263 778 277 299</a>
              </li>
              <li>
                <span className="contact-links__tag">Call</span>
                <a href="tel:+263714719659">+263 714 719 659</a>
                <span className="contact-links__muted"> · also WhatsApp</span>
              </li>
              <li>
                <span className="contact-links__tag">Call</span>
                <a href="tel:+263778277299">+263 778 277 299</a>
                <span className="contact-links__muted"> · also WhatsApp</span>
              </li>
            </ul>
          </section>

          <section className="about-cta">
            <h2>Let&apos;s keep boxing growing.</h2>
            <p>
              Whether you&apos;re a fighter building your profile, a promoter planning a night or a fan with a
              story to share — reach out and we&apos;ll get back to you.
            </p>
            <div className="about-cta__actions">
              <a href={`mailto:${EMAIL}`} className="btn btn--primary">Email us</a>
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