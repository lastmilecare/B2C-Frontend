/** Village master — capture & dashboard filter by village name only. */
export const MHCU_VILLAGES = [
  { name: "Umarda", population: 417 },
  { name: "Majhtoliya", population: 480 },
  { name: "Bhalmudi", population: 244 },
  { name: "Saristal", population: 241 },
  { name: "Chandrauthi", population: 234 },
  { name: "Pakriha", population: 264 },
  { name: "Majhauli", population: 352 },
  { name: "Chhatai", population: 1200 },
  { name: "Pipariya", population: 434 },
  { name: "Gulidand", population: 1063 },
  { name: "Tarsily", population: 1087 },
  { name: "Kothi", population: 4500 },
  { name: "Baihatola", population: 2197 },
  { name: "Maintola", population: 446 },
  { name: "Katkona", population: 3303 },
  { name: "Dogariya Khurd", population: 973 },
];

export const MHCU_VILLAGE_NAMES = MHCU_VILLAGES.map((v) => v.name);

export const MHCU_TOTAL_POP = MHCU_VILLAGES.reduce((s, v) => s + v.population, 0);