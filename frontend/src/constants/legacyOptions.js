export const missionFilters = [
  "All Missions",
  "Human Survival",
  "Planet Protection",
  "Children & Education"
];

export const impactFilters = {
  "Human Survival": [
    "Clean Water for Life",
    "Meals for the Hungry",
    "Emergency Medical Aid",
    "Shelter & Warmth",
    "Disaster Rescue Fund",
    "Refugee & Crisis Relief"
  ],
  "Planet Protection": [
    "Forests of the Future",
    "Ocean Cleanup Mission",
    "Wildlife Guardians",
    "Climate Repair Fund",
    "Plastic-Free Earth",
    "Land Restoration"
  ],
  "Children & Education": [
    "School Starter Kits",
    "Child Health Shield",
    "Girls’ Education Fund",
    "Scholarship Pathways",
    "Digital Learning Access",
    "Orphan & Vulnerable Child Care"
  ]
};

export function getImpactsForMission(missionFilter) {
  if (missionFilter === "All Missions") {
    return [];
  }

  return impactFilters[missionFilter] || [];
}

export function buildPublicFilterParams(missionFilter, impactFilter) {
  const params = {};

  if (missionFilter !== "All Missions") {
    params.mission = missionFilter;
  }

  if (impactFilter !== "All Impacts") {
    params.impact = impactFilter;
  }

  return params;
}