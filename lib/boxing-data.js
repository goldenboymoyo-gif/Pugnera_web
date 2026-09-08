const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s/]+/g, '-')
    .replace(/-+/g, '-');

const { videos: VIDEO_LIBRARY } = require('./videos');

const VIDEO_BY_ID = {};
VIDEO_LIBRARY.forEach((v) => {
  VIDEO_BY_ID[v.id] = v;
});

const RELATED_MAP = [
  { key: 'rolly', ids: ['T0vDjBzwHdY', 'g-ZCi94vriI', 'rz3eUQxkfQo'] },
  { key: 'hrgov', ids: ['4b-Ray_H03U', '73WstyfAWHI', 'rS0ayLB-BkA'] },
  { key: 'usyk', ids: ['XB79TUE4H4M', 'viOZMsgZYKg', 'SaYqv59-ACU', 'V3XBgf2bVek'] },
  { key: 'benav', ids: ['e0aJReDWcMY', 'MB0OhkqlOeI', 'IBx2mY8TK6U'] },
  { key: 'inoue', ids: ['wvYrvXEvnhc', 'zNXymaemhI4', 'I4S2Tz1ISfY'] },
  { key: 'ennis', ids: ['ZdGcx9fiw8U', '2aam7BcojxE', '4U1saQT64Jc'] },
  { key: 'garcia', ids: ['KihGo9jd2As', '51TJpGenuck', 'P-xDqzj6Vp0'] },
  { key: 'canelo', ids: ['TJwSYPtnmV8', 'qJyyk3XlGgA', 'kg1LYIzxVPk'] },
  { key: 'joshu', ids: ['3P4QeH0e2ps', '9MiwQO-qhpc', 'eacU_tjzyYM'] },
  { key: 'knock', ids: ['51TJpGenuck', '7vDiRln38Uk'] },
  { key: 'dubois', ids: ['51TJpGenuck', '7vDiRln38Uk'] },
  { key: 'whittaker', ids: ['51TJpGenuck', '7vDiRln38Uk'] },
  { key: 'baumgardner', ids: ['51TJpGenuck', '7vDiRln38Uk'] },
  { key: 'smith', ids: ['51TJpGenuck', '7vDiRln38Uk'] },
  { key: 'ball', ids: ['7vDiRln38Uk', '51TJpGenuck'] },
];

function relatedVideos(title) {
  const t = title.toLowerCase();
  const match = RELATED_MAP.find((r) => t.includes(r.key));
  const ids = (match ? match.ids : []).filter((id) => VIDEO_BY_ID[id]);
  return {
    ids,
    items: ids.map((id) => ({ ...VIDEO_BY_ID[id], video: id })),
  };
}

const fighters = [
  { name: 'Moses Itauma', image: 'fighter-2', weight: 'Heavyweight', country: 'GB' },
  { name: 'Filip Hrgovic', image: 'fighter-3', weight: 'Heavyweight', country: 'HR' },
  { name: 'Katie Taylor', image: 'fighter-4', weight: 'Super Lightweight', country: 'IE' },
  { name: 'Flora Pili', image: 'fighter-5', weight: 'Super Lightweight', country: 'FR' },
  { name: 'Ryan Garcia', image: 'fighter-6', weight: 'Welterweight', country: 'US' },
  { name: 'Conor Benn', image: 'fighter-7', weight: 'Welterweight', country: 'GB' },
  { name: 'Rolando Romero', image: 'fighter-8', weight: 'Super Lightweight', country: 'US' },
  { name: 'Teofimo Lopez', image: 'fighter-9', weight: 'Super Lightweight', country: 'US' },
  { name: 'Andy Ruiz Jr.', image: 'fighter-10', weight: 'Heavyweight', country: 'US' },
  { name: 'Damian Knyba', image: 'fighter-11', weight: 'Heavyweight', country: 'PL' },
  { name: 'Pat Brown', image: 'fighter-12', weight: 'Cruiserweight', country: 'GB' },
  { name: 'John Hedges', image: 'fighter-13', weight: 'Cruiserweight', country: 'GB' },
  { name: 'Ben Whittaker', image: 'fighter-14', weight: 'Light Heavyweight', country: 'GB' },
  { name: 'Conor Wallace', image: 'fighter-15', weight: 'Light Heavyweight', country: 'AU' },
  { name: 'Dalton Smith', image: 'fighter-16', weight: 'Super Lightweight', country: 'GB' },
  { name: 'Alberto Puello', image: 'fighter-17', weight: 'Super Lightweight', country: 'DO' },
  { name: 'Canelo Alvarez', image: 'fighter-18', weight: 'Super Middleweight', country: 'MX' },
  { name: 'Christian Mbilli', image: 'fighter-19', weight: 'Super Middleweight', country: 'FR' },
  { name: 'Claressa Shields', image: 'fighter-20', weight: 'Middleweight', country: 'US' },
  { name: 'Kaye Scott', image: 'fighter-21', weight: 'Super Welterweight', country: 'AU' },
  { name: 'Lamont Roach Jr', image: 'fighter-22', weight: 'Lightweight', country: 'US' },
  { name: 'William Zepeda', image: 'fighter-23', weight: 'Lightweight', country: 'MX' },
  { name: 'Errol Spence Jr', image: 'fighter-24', weight: 'Welterweight', country: 'US' },
  { name: 'Tim Tszyu', image: 'fighter-25', weight: 'Super Welterweight', country: 'AU' },
  { name: 'Anthony Joshua', image: 'fighter-26', weight: 'Heavyweight', country: 'GB' },
  { name: 'Kristian Prenga', image: 'fighter-27', weight: 'Heavyweight', country: 'AL' },
  { name: 'Abdullah Mason', image: 'fighter-28', weight: 'Lightweight', country: 'US' },
  { name: 'Albert Bell', image: 'fighter-29', weight: 'Lightweight', country: 'US' },
  { name: 'Xander Zayas', image: 'fighter-30', weight: 'Super Welterweight', country: 'PR' },
  { name: 'Jaron Ennis', image: 'fighter-31', weight: 'Welterweight', country: 'US' },
  { name: 'Joe Cordina', image: 'fighter-32', weight: 'Lightweight', country: 'GB' },
  { name: 'Lewis Crocker', image: 'fighter-33', weight: 'Welterweight', country: 'GB' },
  { name: 'Liam Paro', image: 'fighter-34', weight: 'Super Lightweight', country: 'AU' },
  { name: 'Oscar Collazo', image: 'fighter-35', weight: 'Mini Flyweight', country: 'US' },
  { name: 'Jesse Rodriguez', image: 'fighter-36', weight: 'Super Flyweight', country: 'US' },
  { name: 'Antonio Vargas', image: 'fighter-37', weight: 'Bantamweight', country: 'US' },
  { name: 'Tommy Fury', image: 'fighter-38', weight: 'Cruiserweight', country: 'GB' },
  { name: 'Eddie Hall', image: 'fighter-39', weight: 'Heavyweight', country: 'GB' },
  { name: 'Dmitry Bivol', image: 'fighter-40', weight: 'Light Heavyweight', country: 'KG' },
  { name: "O'Shaquie Foster", image: 'fighter-41', weight: 'Super Featherweight', country: 'US' },
  { name: 'Raymond Ford', image: 'fighter-42', weight: 'Featherweight', country: 'US' },
  { name: 'Oleksandr Usyk', image: 'fighter-43', weight: 'Heavyweight', country: 'UA' },
  { name: 'Rico Verhoeven', image: 'fighter-44', weight: 'Heavyweight', country: 'NL' },
  { name: 'Keyshawn Davis', image: 'fighter-45', weight: 'Super Lightweight', country: 'US' },
  { name: 'Nahir Albright', image: 'fighter-46', weight: 'Super Lightweight', country: 'US' },
  { name: 'Dave Allen', image: 'fighter-47', weight: 'Heavyweight', country: 'GB' },
  { name: 'Fabio Wardley', image: 'fighter-48', weight: 'Heavyweight', country: 'GB' },
  { name: 'Daniel Dubois', image: 'fighter-49', weight: 'Heavyweight', country: 'GB' },
  { name: 'David Benavidez', image: 'fighter-50', weight: 'Super Middleweight', country: 'US' },
  { name: 'Naoya Inoue', image: 'fighter-51', weight: 'Super Bantamweight', country: 'JP' },
  { name: 'Junto Nakatani', image: 'fighter-52', weight: 'Bantamweight', country: 'JP' },
  { name: 'Jarrell Miller', image: 'fighter-53', weight: 'Heavyweight', country: 'US' },
  { name: 'Lenier Pero', image: 'fighter-54', weight: 'Heavyweight', country: 'CU' },
  { name: 'Tyson Fury', image: 'fighter-55', weight: 'Heavyweight', country: 'GB' },
  { name: 'Callum Smith', image: 'fighter-56', weight: 'Light Heavyweight', country: 'GB' },
  { name: 'David Morrell', image: 'fighter-57', weight: 'Light Heavyweight', country: 'CU' },
  { name: 'Deontay Wilder', image: 'fighter-58', weight: 'Heavyweight', country: 'US' },
  { name: 'Derek Chisora', image: 'fighter-59', weight: 'Heavyweight', country: 'GB' },
  { name: 'Jermaine Franklin', image: 'fighter-60', weight: 'Heavyweight', country: 'US' },
  { name: 'Carlos Adames', image: 'fighter-61', weight: 'Middleweight', country: 'DO' },
  { name: 'Austin Williams', image: 'fighter-62', weight: 'Middleweight', country: 'US' },
  { name: 'Arnold Barboza Jr', image: 'fighter-63', weight: 'Super Lightweight', country: 'US' },
  { name: "Eduardo 'Sugar' Nunez", image: 'fighter-64', weight: 'Super Featherweight', country: 'MX' },
  { name: 'Jazza Dickens', image: 'fighter-65', weight: 'Super Featherweight', country: 'GB' },
  { name: 'Anthony Cacace', image: 'fighter-66', weight: 'Super Featherweight', country: 'IE' },
  { name: 'Mario Barrios', image: 'fighter-67', weight: 'Welterweight', country: 'US' },
  { name: 'Leigh Wood', image: 'fighter-68', weight: 'Featherweight', country: 'GB' },
  { name: 'Josh Warrington', image: 'fighter-69', weight: 'Super Featherweight', country: 'GB' },
  { name: 'Nick Ball', image: 'fighter-70', weight: 'Featherweight', country: 'GB' },
  { name: 'Brandon Figueroa', image: 'fighter-71', weight: 'Featherweight', country: 'US' },
  { name: 'Shakur Stevenson', image: 'fighter-72', weight: 'Lightweight', country: 'US' },
  { name: 'Josh Kelly', image: 'fighter-73', weight: 'Middleweight', country: 'GB' },
  { name: 'Raymond Muratalla', image: 'fighter-74', weight: 'Lightweight', country: 'US' },
  { name: 'Andy Cruz', image: 'fighter-75', weight: 'Lightweight', country: 'CU' },
  { name: 'Alexis Rocha', image: 'fighter-76', weight: 'Welterweight', country: 'US' },
  { name: 'Raul Curiel', image: 'fighter-77', weight: 'Welterweight', country: 'US' },
  { name: 'Agit Kabayel', image: 'fighter-78', weight: 'Heavyweight', country: 'DE' },
  { name: 'Amanda Serrano', image: 'fighter-79', weight: 'Super Lightweight', country: 'PR' },
  { name: 'Alan Picasso Romero', image: 'fighter-80', weight: 'Super Bantamweight', country: 'MX' },
  { name: 'Jake Paul', image: 'fighter-81', weight: 'Cruiserweight', country: 'US' },
  { name: 'Terence Crawford', image: 'fighter-82', weight: 'Welterweight', country: 'US' },
  { name: 'Giorgio Visioli', image: 'fighter-83', weight: 'Lightweight', country: 'GB' },
  { name: 'Diego Pacheco', image: 'fighter-84', weight: 'Super Middleweight', country: 'US' },
  { name: 'Shabaz Masoud', image: 'fighter-85', weight: 'Super Bantamweight', country: 'GB' },
  { name: 'Peter McGrail', image: 'fighter-86', weight: 'Super Bantamweight', country: 'GB' },
  { name: 'Johnny Fisher', image: 'fighter-87', weight: 'Heavyweight', country: 'GB' },
  { name: 'Anthony Yarde', image: 'fighter-88', weight: 'Light Heavyweight', country: 'GB' },
  { name: 'Devin Haney', image: 'fighter-89', weight: 'Super Lightweight', country: 'US' },
  { name: 'Brian Norman Jr', image: 'fighter-90', weight: 'Welterweight', country: 'US' },
  { name: 'Sam Noakes', image: 'fighter-91', weight: 'Lightweight', country: 'GB' },
  { name: 'Chris Eubank Jr.', image: 'fighter-92', weight: 'Middleweight', country: 'GB' },
  { name: 'Jack Catterall', image: 'fighter-93', weight: 'Super Lightweight', country: 'GB' },
  { name: 'Ekow Essuman', image: 'fighter-94', weight: 'Welterweight', country: 'GB' },
  { name: 'Joseph Parker', image: 'fighter-95', weight: 'Heavyweight', country: 'NZ' },
  { name: 'Dillian Whyte', image: 'fighter-96', weight: 'Heavyweight', country: 'GB' },
  { name: 'Edgar Berlanga', image: 'fighter-97', weight: 'Super Middleweight', country: 'US' },
  { name: 'Hamzah Sheeraz', image: 'fighter-98', weight: 'Middleweight', country: 'GB' },
  { name: 'Gilberto Ramírez', image: 'fighter-99', weight: 'Cruiserweight', country: 'MX' },
  { name: 'Floyd Schofield', image: 'fighter-100', weight: 'Lightweight', country: 'US' },
  { name: 'Richardson Hitchins', image: 'fighter-101', weight: 'Super Lightweight', country: 'US' },
].map((f) => ({ ...f, slug: slugify(f.name) }));

const records = {
  'Canelo Alvarez': '64-3-2 (38 KO)',
  'Christian Mbilli': '31-0-0 (28 KO)',
  'Terence Crawford': '41-0-0 (31 KO)',
  'Oleksandr Usyk': '25-0-0 (16 KO)',
  'Agit Kabayel': '27-0-0 (17 KO)',
  'Tyson Fury': '34-3-1 (24 KO)',
  'Anthony Joshua': '28-5-0 (25 KO)',
  'Dmitry Bivol': '25-1-0 (10 KO)',
  'David Benavidez': '32-0-0 (26 KO)',
  'David Morrell': '13-1-0 (10 KO)',
  'Gilberto Ramírez': '48-2-0 (30 KO)',
  'Hamzah Sheeraz': '24-0-1 (19 KO)',
  'Edgar Berlanga': '24-2-0 (18 KO)',
  'Richardson Hitchins': '21-0-0 (8 KO)',
  'Anthony Yarde': '27-4-0 (24 KO)',
  'Naoya Inoue': '33-0-0 (27 KO)',
  'Junto Nakatani': '32-1-0 (24 KO)',
  'Devin Haney': '33-0-0 (14 KO)',
  'Jaron Ennis': '36-0-0 (31 KO)',
  'Shakur Stevenson': '24-0-0 (9 KO)',
  'Ryan Garcia': '25-2-0 (20 KO)',
  'Conor Benn': '25-0-0 (14 KO)',
  'Rolando Romero': '18-2-0 (10 KO)',
  'Teofimo Lopez': '22-1-0 (13 KO)',
  'Keyshawn Davis': '15-0-0 (9 KO)',
  'Jesse Rodriguez': '22-1-0 (13 KO)',
  'Oscar Collazo': '13-0-0 (9 KO)',
  'Filip Hrgovic': '18-1-0 (17 KO)',
  'Moses Itauma': '12-0-0 (10 KO)',
  'Daniel Dubois': '23-2-0 (19 KO)',
  'Fabio Wardley': '18-1-0 (17 KO)',
  'Joseph Parker': '36-3-0 (24 KO)',
  'Katie Taylor': '26-1-0 (6 KO)',
  'Amanda Serrano': '49-3-1 (32 KO)',
  'Claressa Shields': '16-0-0 (3 KO)',
  'Liam Paro': '28-1-0 (8 KO)',
  'Jack Catterall': '33-2-0 (8 KO)',
  'Brian Norman Jr': '27-0-0 (25 KO)',
  'Xander Zayas': '23-1-0 (13 KO)',
  'William Zepeda': '34-1-0 (29 KO)',
  'Abdullah Mason': '20-0-0 (17 KO)',
  'Dillian Whyte': '30-5-0 (22 KO)',
  'Andy Ruiz Jr.': '36-3-0 (21 KO)',
  'Deontay Wilder': '43-4-1 (42 KO)',
  'Jake Paul': '11-2-0 (7 KO)',
  'Chris Eubank Jr.': '35-4-0 (25 KO)',
};

const championBelts = {
  'Naoya Inoue': 'Ring & Undisputed Super Bantamweight Champion',
  'Agit Kabayel': 'WBC Heavyweight Champion',
  'Dmitry Bivol': 'Ring Light Heavyweight Champion',
  'Hamzah Sheeraz': 'WBO Super Middleweight Champion',
  'Devin Haney': 'WBO Welterweight Champion',
  'Liam Paro': 'IBF Welterweight Champion',
  'Ryan Garcia': 'WBC Welterweight Champion',
  'Shakur Stevenson': 'Ring Super Lightweight Champion',
  'Jaron Ennis': 'Ring Super Welterweight Champion',
  'Jesse Rodriguez': 'Super Flyweight Champion',
  'Oscar Collazo': 'Mini Flyweight Champion',
  'Katie Taylor': 'Undisputed Super Lightweight Champion',
};

const heroSlides = [
  {
    id: 'hero-schedule',
    title: 'Your Boxing Schedule',
    description: "Don't miss a single moment — watch all these thrilling fights live on Pugnera.",
    badge: 'Aug 29',
    cta: 'See schedule',
    background: '/boxing/hero/hero-schedule-2x-b.webp',
  },
  {
    id: 'hero-canelo',
    title: 'Canelo vs. Mbilli',
    description: "Boxing's biggest star returns from defeat to face unbeaten WBC champion Mbilli. What's next for the king?",
    badge: 'Oct 31',
    cta: 'Included in Ultimate',
    background: '/boxing/hero/spotlight-1440.webp',
  },
  {
    id: 'hero-lockerroom',
    title: 'Garcia vs. Benn',
    description: 'The biggest grudge match in boxing. Sep 12, live only on Pugnera.',
    badge: 'Sep 12',
    cta: 'Watch the build-up',
    background: '/boxing/hero/spotlight-benn.webp',
  },
  {
    id: 'hero-ring',
    title: 'Ring Magazine',
    description: 'Interviews, Podcasts, Fight Highlights, The W.A.D.E Concept and so much more',
    badge: 'Boxing',
    cta: 'Discover More',
    background: '/boxing/hero/hero-ring.webp',
  },
];

const upcomingFights = [
  { title: 'Garcia vs. Benn', date: 'Sep 12', venue: 'Las Vegas', tag: 'WBC Welterweight title', status: 'upcoming', description: 'The biggest grudge match in boxing lands Sep 12 — live.', image: '/boxing/fights/garcia-benn.webp', video: 'KihGo9jd2As' },
  { title: 'Canelo vs. Mbilli', date: 'Oct 31', venue: 'Riyadh', tag: 'WBC Super Middleweight title', status: 'upcoming', description: "Boxing's biggest star vs the unbeaten WBC champion.", image: '/boxing/fights/canelo-mbilli.webp', video: 'TJwSYPtnmV8' },
  { title: 'Dalton Smith vs. Puello', date: 'Oct 24', venue: 'Sheffield', tag: 'Super Lightweight', status: 'upcoming', description: 'Two unbeaten champions collide in the UK.', image: '/boxing/fights/smith-puello.webp', video: '51TJpGenuck' },
  { title: 'Joshua vs. Fury', date: 'Nov 20', venue: 'Madison Square Garden', tag: 'Heavyweight', status: 'upcoming', description: 'The fight the world has waited a decade for — pencilled for MSG.', image: '/boxing/hero/hero-lockerroom.webp', video: '9MiwQO-qhpc' },
  { title: 'Baumgardner vs. Turhan', date: 'Nov 8', venue: 'Arlington, TX', tag: 'IBF Women\u2019s Lightweight', status: 'upcoming', description: 'A women\u2019s championship double-header under the Texas lights.', image: '/boxing/fights/hl-extended.webp', video: 'PzkltpFwAlw' },
  { title: 'Dubois vs. Wardley 2', date: 'TBC', venue: 'TBC', tag: 'Heavyweight', status: 'upcoming', description: 'The rematch — two British heavyweights settle the score.', image: '/boxing/fights/dubois-wardley2.webp', video: 'eacU_tjzyYM' },
  { title: 'Whittaker vs. Wallace', date: 'TBC', venue: 'TBC', tag: 'Light Heavyweight', status: 'upcoming', description: 'The Showman climbs the ladder at 175lbs.', image: '/boxing/fights/whittaker-wallace.webp', video: '51TJpGenuck' },
  { title: 'Nick Ball', date: 'Dec 19', venue: 'Belfast', tag: 'WBC Super Featherweight', status: 'upcoming', description: 'Liverpool\u2019s Ball challenges for world honours in Belfast.', image: '/boxing/fights/hl-fight.webp', video: '7vDiRln38Uk' },
];

const previousEvents = [
  { title: 'Rolly vs. Teofimo', date: 'Aug 22', venue: 'Las Vegas', tag: 'Full Event', status: 'replay', description: 'Teofimo Lopez beats Rolly Romero in Vegas — every round back on demand.', image: '/boxing/fights/rolly-teofimo.webp', video: 'T0vDjBzwHdY' },
  { title: 'Hrgovic vs. Itauma', date: 'Aug 29', venue: 'London O2', tag: 'IBF Heavyweight', status: 'replay', description: 'The London O2 blockbuster — every round and the finish back on demand.', image: '/boxing/fights/santillan-russell.webp', video: '4b-Ray_H03U' },
  { title: 'Usyk vs. Verhoeven', date: 'May 23', venue: 'Giza', tag: 'Heavyweight', status: 'replay', description: 'Usyk stops Verhoeven in an 11th-round thriller at the Pyramids of Giza.', image: '/boxing/fights/rolly-teofimo.webp', video: 'XB79TUE4H4M' },
  { title: 'Benavidez vs. Zurdo', date: 'May 2', venue: 'Las Vegas', tag: 'Super Middleweight', status: 'replay', description: 'Benavidez stops Ramirez in six to take the crown.', image: '/boxing/fights/hl-full-event.webp', video: 'e0aJReDWcMY' },
  { title: 'Inoue vs. Nakatani', date: 'May 2', venue: 'Tokyo Dome', tag: 'Super Bantamweight', status: 'replay', description: 'The Monster dominates at the Tokyo Dome.', image: '/boxing/fights/utria-mercado.webp', video: 'wvYrvXEvnhc' },
  { title: 'Ennis vs. Zayas', date: 'Jun 27', venue: 'Brooklyn', tag: 'Super Welterweight', status: 'replay', description: 'Boots Ennis drops Zayas three times and stops him in seven for the WBA/WBO titles.', image: '/boxing/fights/hernandez-veron.webp', video: 'ZdGcx9fiw8U' },
];

const highlights = [
  { title: 'Best Knockouts 2024-2025', date: 'Series', tag: 'Knockouts', status: 'replay', description: 'Part 1 of the best finishes in recent boxing.', image: '/boxing/fights/hl-full-event.webp', video: '51TJpGenuck' },
  { title: 'Rolly vs. Teofimo: Full Event Highlights', date: '23 AUG', tag: 'Highlights', status: 'replay', description: 'All the best moments from Las Vegas.', image: '/boxing/fights/hl-fight.webp', video: 'T0vDjBzwHdY' },
  { title: 'The Best Knockouts of 2025', date: 'Series', tag: 'Knockouts', status: 'replay', description: 'Top Rank\u2019s picks for the year\u2019s biggest hurts.', image: '/boxing/fights/hl-extended.webp', video: '7vDiRln38Uk' },
  { title: 'Rolly vs. Teofimo: Extended Highlights', date: '23 AUG', tag: 'Highlights', status: 'replay', description: 'The extended cut — every round, every exchange.', image: '/boxing/fights/hl-utria-mercado.webp', video: 'g-ZCi94vriI' },
];

const tickets = [
  { title: 'Garcia vs. Benn', date: 'Sep 12', time: '9:00 PM ET', venue: 'T-Mobile Arena', location: 'Las Vegas, NV', price: '$85', description: 'Main event of the night. Premium and standard seating.', image: '/boxing/fights/garcia-benn.webp', url: 'https://www.ticketmaster.com/search?q=Garcia%20vs%20Benn' },
  { title: 'Canelo vs. Mbilli', date: 'Oct 31', time: '12:00 PM ET', venue: 'Kingdom Arena', location: 'Riyadh', price: '$120', description: 'Riyadh Season headliner — hospitality available.', image: '/boxing/fights/canelo-mbilli.webp', url: 'https://www.ticketmaster.com/search?q=Canelo%20vs%20Mbilli' },
  { title: 'Dalton Smith vs. Puello', date: 'Oct 24', time: '7:00 PM BST', venue: 'Sheffield Arena', location: 'Sheffield, UK', price: '\u00a350', description: 'Homecoming for Dalton Smith at the Sheffield Arena.', image: '/boxing/fights/smith-puello.webp', url: 'https://www.ticketmaster.co.uk/search?q=Dalton%20Smith%20Puello' },
  { title: 'Joshua vs. Fury', date: 'Nov 20', time: 'TBC', venue: 'Madison Square Garden', location: 'New York, NY', price: '$145', description: 'The MSG blockbuster. Expect a sell-out.', image: '/boxing/hero/hero-lockerroom.webp', url: 'https://www.ticketmaster.com/search?q=Joshua%20vs%20Fury' },
  { title: 'Nick Ball', date: 'Dec 19', time: '7:00 PM GMT', venue: 'SSE Arena', location: 'Belfast, UK', price: '\u00a340', description: 'World title night in the SSE Arena Belfast.', image: '/boxing/fights/hl-fight.webp', url: 'https://www.ticketmaster.co.uk/search?q=Nick%20Ball' },
];

const fights = [
  ...upcomingFights,
  ...previousEvents,
  ...highlights,
].map((f) => ({
  ...f,
  type: f.status === 'upcoming' ? 'upcoming' : 'replay',
  slug: slugify(f.title),
  primary: f.video,
  related: relatedVideos(f.title).items,
}));

function fightBySlug(slug) {
  return fights.find((f) => f.slug === slug);
}

function getContent() {
  return { fighters, heroSlides, upcomingFights, previousEvents, highlights, tickets, fights };
}

module.exports = {
  fighters,
  heroSlides,
  upcomingFights,
  previousEvents,
  highlights,
  tickets,
  fights,
  fightBySlug,
  records,
  championBelts,
  getContent,
};