const FLAG_MAP = {
  GB: 'Flag_of_the_United_Kingdom__1-2__1',
  HR: 'Flag_of_Croatia_1',
  IE: 'Flag_of_Ireland_1',
  FR: 'Flag_of_France_1',
  US: 'United_states',
  PL: 'Flag_of_Poland_1',
  AL: 'Flag_of_Albania_1',
  CU: 'Flag_of_Cuba_1',
  DE: 'Flag_of_Germany_1',
  JP: 'Flag_of_Japan_1',
  KG: 'Flag_of_Kyrgyzstan_1',
  NZ: 'Flag_of_New_Zealand_1',
  DO: 'Flag_of_the_Dominican_Republic_1',
  UA: 'Flag_of_Ukraine_1',
  MX: 'mexico',
  NL: 'netherlands',
  PR: 'Puerto_Rico',
  AU: 'au',
  UZ: 'Flag_of_Uzbekistan_1',
};

const flagSrc = (code) => (FLAG_MAP[code] ? `/boxing/flags/${FLAG_MAP[code]}.webp` : null);

module.exports = { FLAG_MAP, flagSrc };