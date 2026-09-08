import { useState, useEffect } from 'react';

export default function HeroSlider({ slides }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const t = setInterval(() => setActive((a) => (a + 1) % slides.length), 8000);
    return () => clearInterval(t);
  }, [slides.length]);

  const go = (dir) => setActive((a) => (a + dir + slides.length) % slides.length);

  return (
    <section className="hero-dazn" role="region" aria-roledescription="carousel" aria-label="Featured">
      {slides.map((slide, i) => (
        <div key={slide.id} className={`hero-dazn__inner ${i === active ? 'active' : ''}`}>
          <div className="hero-dazn__bg" style={{ backgroundImage: `url(${slide.background})` }} />
          <div className="container hero-dazn__content">
            {slide.badge ? <span className="hero-dazn__badge">{slide.badge}</span> : null}
            <h2 className="hero-dazn__title">{slide.title}</h2>
            <p className="hero-dazn__desc">{slide.description}</p>
            <a href="#featured" className="hero-dazn__btn">{slide.cta} →</a>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button className="hero-dazn__nav prev" type="button" onClick={() => go(-1)} aria-label="Previous">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
          <button className="hero-dazn__nav next" type="button" onClick={() => go(1)} aria-label="Next">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <div className="hero-dazn__dots">
            {slides.map((s, i) => (
              <button
                key={s.id}
                className={`hero-dazn__dot ${i === active ? 'active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}