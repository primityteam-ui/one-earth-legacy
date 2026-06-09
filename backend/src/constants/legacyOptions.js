export const rankTable = [
  { name: "Spark", min: 1, max: 9 },
  { name: "Citizen", min: 10, max: 49 },
  { name: "Merchant", min: 50, max: 249 },
  { name: "Knight", min: 250, max: 999 },
  { name: "Lord", min: 1000, max: 4999 },
  { name: "Baron", min: 5000, max: 19999 },
  { name: "Duke", min: 20000, max: 49999 },
  { name: "Sovereign", min: 50000, max: 99999 },
  { name: "King/Queen", min: 100000, max: 999999 },
  { name: "Emperor", min: 1000000, max: Infinity }
];

export const addOnPrices = {
  animatedBorder: 4.99,
  videoTile: 9.99,
  analytics: 2.99,
  resurrection: 19.99,
  nft: 9.99
};

export const defaultCauseCategory = "Human Survival";
export const defaultCauseImpact = "Clean Water for Life";
export const defaultCause = `${defaultCauseCategory} — ${defaultCauseImpact}`;