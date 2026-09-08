import { resultsData } from '../lib/results-data';
import { findLiveResult } from '../lib/live-results';

export { findLiveResult };

export function useLiveResults() {
  return resultsData;
}

export function findReplayMatch(liveResults, title) {
  return findLiveResult(Array.isArray(liveResults) ? liveResults : [], title);
}

export default function LiveResultBanner({ live, label = 'Latest result · via BoxingScene' }) {
  if (!live || !live.winner || !live.loser) return null;
  const link = live.verb && live.verb.toLowerCase() !== 'defeats' ? live.verb.toLowerCase() : 'defeats';
  return (
    <div className="live-result">
      <span className="live-result__label">{label}</span>
      <strong>
        {live.winner} {link} {live.loser}
      </strong>
      {live.method ? <span className="live-result__method">{live.method}</span> : null}
    </div>
  );
}