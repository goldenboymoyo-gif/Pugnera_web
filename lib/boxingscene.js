const BOXINGSCENE_RESULTS_URL = 'https://www.boxingscene.com/results';
const CACHE_TTL_MS = 30 * 60 * 1000;

const cache = { ts: 0, entries: [] };
let lastEmpty = 0;
const NEGATIVE_TTL_MS = 5 * 60 * 1000;

function stripHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/Load more results/gi, ' ')
    .replace(/View Results/gi, ' | ')
    .replace(/\s+/g, ' ')
    .trim();
}

const clean = (s) =>
  s
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeName = (s) =>
  String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

function parseStructured(html) {
  const doc = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
  const cardRe = /font-bold text-xl lg:text-2xl tracking-tight card-title">\s*([\s\S]*?)\s*<span class="text-hoverRed">([^<]+)<\/span>\s*([\s\S]*?)<\/div>\s*<div class="text-zinc-300 font-semibold text-base lg:text-lg">([^<]+)<\/div>/g;
  const headerRe = /<h3 class="sr-only">([^<]+)<\/h3>[\s\S]*?<div class="text-sm lg:text-base text-zinc-400 text-center">([^<]+)<\/div>/g;

  const results = [];
  let m;
  while ((m = cardRe.exec(doc))) {
    const winner = clean(m[1]);
    const loser = clean(m[3]);
    if (winner && loser) {
      results.push({ winner, verb: clean(m[2]), loser, method: clean(m[4]) });
    }
  }

  const headers = [];
  let hm;
  while ((hm = headerRe.exec(doc))) headers.push({ title: clean(hm[1]), date: clean(hm[2]) });

  return results.map((r) => {
    const ws = new Set(normalizeName(r.winner).split(' ').filter((t) => t.length >= 4));
    const ls = new Set(normalizeName(r.loser).split(' ').filter((t) => t.length >= 4));
    let date = null;
    if (ws.size && ls.size) {
      for (const h of headers) {
        const t = normalizeName(h.title);
        if ([...ws].some((x) => t.includes(x)) && [...ls].some((x) => t.includes(x))) {
          date = h.date;
          break;
        }
      }
    }
    return { winner: r.winner, loser: r.loser, method: r.method, verb: r.verb, date };
  });
}

function parseTextResults(html) {
  const text = stripHtml(html);
  const entries = [];
  const re = /([A-Z][\w.'-]*(?:\s+[A-Z][\w.'-]*){0,3}?)\s+Defeats\s+([A-Z][\w.'-]*(?:\s+[A-Z][\w.'-]*){0,3}?)\s+((?:Unanimous|Split|Majority|Technical|TKO|KO|RTD|No Contest|DQ|UD|SD|MD)\b[^|]{0,80})/g;
  let m;
  while ((m = re.exec(text))) {
    const winner = m[1].trim();
    const loser = m[2].trim();
    const method = m[3].replace(/\s+/g, ' ').trim();
    if (winner && loser) entries.push({ winner, loser, method, verb: 'Defeats' });
  }
  return entries;
}

function parseResults(html) {
  const fromMarkup = parseStructured(html);
  if (fromMarkup.length) return fromMarkup;
  return parseTextResults(html);
}

async function getResults() {
  if (cache.entries.length && Date.now() - cache.ts < CACHE_TTL_MS) {
    return cache.entries;
  }
  if (!cache.entries.length && lastEmpty && Date.now() - lastEmpty < NEGATIVE_TTL_MS) {
    return [];
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(BOXINGSCENE_RESULTS_URL, {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
          'cache-control': 'no-cache',
          'sec-ch-ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'document',
          'sec-fetch-mode': 'navigate',
          'sec-fetch-site': 'none',
          'sec-fetch-user': '?1',
          'upgrade-insecure-requests': '1',
        },
        redirect: 'follow',
      });
      const html = await res.text();
      const entries = parseResults(html);
      if (entries.length) {
        cache.ts = Date.now();
        cache.entries = entries;
        return entries;
      }
      const wait = attempt === 1 ? 3000 : 6000;
      await new Promise((r) => setTimeout(r, wait));
    } catch (err) {
      if (attempt >= 3) {
        lastEmpty = Date.now();
        return cache.entries;
      }
      await new Promise((r) => setTimeout(r, attempt === 1 ? 3000 : 6000));
    }
  }
  lastEmpty = Date.now();
  return cache.entries;
}

function lastUpdated() {
  return cache.ts ? new Date(cache.ts).toISOString() : null;
}

module.exports = { getResults, parseResults, lastUpdated };