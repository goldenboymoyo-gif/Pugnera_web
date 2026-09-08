import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie.split('; ').find((c) => c.startsWith('pugnera_cookie_consent='));
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    document.cookie = 'pugnera_cookie_consent=accepted; path=/; max-age=31536000; SameSite=Lax';
    setVisible(false);
  };

  const decline = () => {
    document.cookie = 'pugnera_cookie_consent=declined; path=/; max-age=31536000; SameSite=Lax';
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-banner" role="alert">
      <div className="cookie-banner__inner container">
        <div className="cookie-banner__text">
          <p>
            We use cookies to improve your experience on Pugnera. By continuing to browse, you agree to our use of cookies. Read our <a href="/about#privacy">Privacy &amp; Data Protection</a> policy for more information.
          </p>
        </div>
        <div className="cookie-banner__actions">
          <button type="button" className="cookie-btn cookie-btn--accept" onClick={accept}>
            Accept
          </button>
          <button type="button" className="cookie-btn cookie-btn--decline" onClick={decline}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
