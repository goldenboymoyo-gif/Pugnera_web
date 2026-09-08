import { useRouter } from 'next/router';

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      className="back-btn"
      onClick={() => {
        if (window.history.length > 1) router.back();
        else router.push('/');
      }}
      aria-label="Go back"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M15 6l-6 6 6 6" />
      </svg>
      Back
    </button>
  );
}