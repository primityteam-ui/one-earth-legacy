export const ranks = [
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

export const presetAmounts = [5, 10, 25, 50, 100, 250, 1000];

export const addOns = [
  { id: "animatedBorder", name: "Animated border", price: 4.99 },
  { id: "videoTile", name: "Video tile", price: 9.99 },
  { id: "analytics", name: "Analytics dashboard", price: 2.99 },
  { id: "resurrection", name: "Tile resurrection", price: 19.99 },
  { id: "nft", name: "NFT certificate", price: 9.99 }
];

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

export const legacyMissions = [
  {
    id: "human-survival",
    name: "Human Survival",
    iconName: "heart",
    tagline: "Immediate help for people fighting hunger, thirst, sickness, homelessness, and crisis.",
    impacts: [
      {
        id: "clean-water-for-life",
        name: "Clean Water for Life",
        description: "Support safe drinking water, wells, filtration, and hygiene access."
      },
      {
        id: "meals-for-the-hungry",
        name: "Meals for the Hungry",
        description: "Help provide food support for families facing hunger."
      },
      {
        id: "emergency-medical-aid",
        name: "Emergency Medical Aid",
        description: "Support urgent medical care, basic treatment, and health response."
      },
      {
        id: "shelter-and-warmth",
        name: "Shelter & Warmth",
        description: "Help people facing homelessness, cold, and unsafe living conditions."
      },
      {
        id: "disaster-rescue-fund",
        name: "Disaster Rescue Fund",
        description: "Support relief after floods, fires, earthquakes, storms, and emergencies."
      },
      {
        id: "refugee-crisis-relief",
        name: "Refugee & Crisis Relief",
        description: "Help displaced families with survival essentials and emergency support."
      }
    ]
  },
  {
    id: "planet-protection",
    name: "Planet Protection",
    iconName: "globe",
    tagline: "Protect forests, oceans, animals, climate, land, and the future of Earth.",
    impacts: [
      {
        id: "forests-of-the-future",
        name: "Forests of the Future",
        description: "Support tree planting, forest protection, and reforestation."
      },
      {
        id: "ocean-cleanup-mission",
        name: "Ocean Cleanup Mission",
        description: "Help remove plastic waste and protect marine ecosystems."
      },
      {
        id: "wildlife-guardians",
        name: "Wildlife Guardians",
        description: "Support animal protection, rescue, habitats, and anti-poaching efforts."
      },
      {
        id: "climate-repair-fund",
        name: "Climate Repair Fund",
        description: "Support climate action, clean energy, and carbon reduction projects."
      },
      {
        id: "plastic-free-earth",
        name: "Plastic-Free Earth",
        description: "Support plastic waste reduction, cleanup, and recycling initiatives."
      },
      {
        id: "land-restoration",
        name: "Land Restoration",
        description: "Help restore damaged soil, farms, grasslands, and natural habitats."
      }
    ]
  },
  {
    id: "children-education",
    name: "Children & Education",
    iconName: "school",
    tagline: "Help children survive, learn, grow, and build a better future.",
    impacts: [
      {
        id: "school-starter-kits",
        name: "School Starter Kits",
        description: "Support books, bags, uniforms, supplies, and classroom basics."
      },
      {
        id: "child-health-shield",
        name: "Child Health Shield",
        description: "Support child nutrition, basic healthcare, vaccines, and wellness."
      },
      {
        id: "girls-education-fund",
        name: "Girls’ Education Fund",
        description: "Help girls stay in school and access safe learning opportunities."
      },
      {
        id: "scholarship-pathways",
        name: "Scholarship Pathways",
        description: "Support student fees, scholarships, and long-term education access."
      },
      {
        id: "digital-learning-access",
        name: "Digital Learning Access",
        description: "Support laptops, internet access, digital tools, and remote learning."
      },
      {
        id: "vulnerable-child-care",
        name: "Orphan & Vulnerable Child Care",
        description: "Support children without stable family, safety, or basic resources."
      }
    ]
  }
];

export function getRankForAmount(amountUSD) {
  return ranks.find((rank) => amountUSD >= rank.min && amountUSD <= rank.max) || ranks[0];
}

export function getNextRankForAmount(amountUSD) {
  return ranks.find((rank) => rank.min > amountUSD) || null;
}

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