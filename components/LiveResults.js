import { useEffect, useState } from 'react';
import { findLiveResult } from '../lib/live-results';

export { findLiveResult };

let sharedResults = null;
let sharedPromise = null;

export function useLiveResults() {
  const [results, setResults] = useState(sharedResults);
  useEffect(() => {
    let mounted = true;
    if (sharedResults) {
      setResults(sharedResults);
      return undefined;
    }
    if (!sharedPromise) {
      sharedPromise = fetch('/api/results/boxingscene')
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error('sync unavailable'))))
        .then((d) => {
          sharedResults = Array.isArray(d.results) ? d.results : [];
          return sharedResults;
        })
        .catch(() => {
          sharedResults = [];
          return sharedResults;
        });
    }
    sharedPromise.then((val) => {
      if (mounted) setResults(val);
    });
    return () => {
      mounted = false;
    };
  }, []);
  return results;
}

export default function LiveResultBanner({ live, label = 'Latest result · via BoxingScene' }) {
  if (!live || !live.winner) return null;
  return (
    <div className="live-result">
      <span className="live-result__label">{label}</span>
      <strong>
        {live.winner} defeats {live.loser}
      </strong>
      {live.method ? <span className="live-result__method">{live.method}</span> : null}
    </div>
  );
}