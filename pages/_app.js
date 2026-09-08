import '../styles/globals.css';
import CookieConsent from '../components/CookieConsent';
import SessionBridge from '../components/SessionBridge';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <SessionBridge />
      <CookieConsent />
    </>
  );
}
