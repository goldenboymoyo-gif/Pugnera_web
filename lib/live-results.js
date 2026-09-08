const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const NAME_ALIASES = {
  zurdo: 'Gilberto Ramirez',
  rolly: 'Rolando Romero',
  boots: 'Jaron Ennis',
  fury: 'Tyson Fury',
};

function findLiveResult(results, title) {
  if (!results || !results.length || !title) return null;
  const sides = title
    .split(/\s+vs\.?\s+/i)
    .map((s) => NAME_ALIASES[normalize(s)] || s)
    .filter(Boolean);
  if (sides.length < 2) return null;
  const sideTokens = sides.map((s) => normalize(s).split(' ').filter((t) => t.length >= 4));
  if (sideTokens.some((t) => !t.length)) return null;
  for (const entry of results) {
    const names = normalize(`${entry.winner} ${entry.loser}`);
    if (sideTokens[0].some((t) => names.includes(t)) && sideTokens[1].some((t) => names.includes(t))) {
      return entry;
    }
  }
  return null;
}

module.exports = { findLiveResult, normalize };