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

export const legacyMissions = [
  {
    id: "human-survival",
    name: "Human Survival",
    impacts: [
      "Clean Water for Life",
      "Meals for the Hungry",
      "Emergency Medical Aid",
      "Shelter & Warmth",
      "Disaster Rescue Fund",
      "Refugee & Crisis Relief"
    ]
  },
  {
    id: "planet-protection",
    name: "Planet Protection",
    impacts: [
      "Forests of the Future",
      "Ocean Cleanup Mission",
      "Wildlife Guardians",
      "Climate Repair Fund",
      "Plastic-Free Earth",
      "Land Restoration"
    ]
  },
  {
    id: "children-education",
    name: "Children & Education",
    impacts: [
      "School Starter Kits",
      "Child Health Shield",
      "Girls’ Education Fund",
      "Scholarship Pathways",
      "Digital Learning Access",
      "Orphan & Vulnerable Child Care"
    ]
  }
];

export const defaultCauseCategory = "Human Survival";
export const defaultCauseImpact = "Clean Water for Life";
export const defaultCause = `${defaultCauseCategory} — ${defaultCauseImpact}`;

export function getApprovedMissionNames() {
  return legacyMissions.map((mission) => mission.name);
}

export function getApprovedImpactNames() {
  return legacyMissions.flatMap((mission) => mission.impacts);
}

export function getApprovedAddOnIds() {
  return Object.keys(addOnPrices);
}

export function findMissionByName(missionName) {
  return legacyMissions.find((mission) => mission.name === missionName) || null;
}

export function isApprovedMission(missionName) {
  return Boolean(findMissionByName(missionName));
}

export function isApprovedImpactForMission(missionName, impactName) {
  const mission = findMissionByName(missionName);

  if (!mission) {
    return false;
  }

  return mission.impacts.includes(impactName);
}

export function isApprovedAddOnId(addOnId) {
  return Object.prototype.hasOwnProperty.call(addOnPrices, addOnId);
}

export function buildCauseFromParts(causeCategory, causeImpact) {
  return `${causeCategory} — ${causeImpact}`;
}