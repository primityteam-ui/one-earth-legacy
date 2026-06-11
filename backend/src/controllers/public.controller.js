import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Tile from "../models/Tile.js";
import AuditEntry from "../models/AuditEntry.js";
import Emperor from "../models/Emperor.js";

import {
  defaultCause,
  defaultCauseCategory,
  defaultCauseImpact
} from "../constants/legacyOptions.js";

const countryDirectory = {
  US: {
    country: "United States",
    countryCode: "US",
    flag: "🇺🇸",
    lat: 37.0902,
    lng: -95.7129
  },
  IN: {
    country: "India",
    countryCode: "IN",
    flag: "🇮🇳",
    lat: 20.5937,
    lng: 78.9629
  },
  BR: {
    country: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    lat: -14.235,
    lng: -51.9253
  },
  IT: {
    country: "Italy",
    countryCode: "IT",
    flag: "🇮🇹",
    lat: 41.8719,
    lng: 12.5674
  },
  JP: {
    country: "Japan",
    countryCode: "JP",
    flag: "🇯🇵",
    lat: 36.2048,
    lng: 138.2529
  },
  KR: {
    country: "South Korea",
    countryCode: "KR",
    flag: "🇰🇷",
    lat: 35.9078,
    lng: 127.7669
  },
  CA: {
    country: "Canada",
    countryCode: "CA",
    flag: "🇨🇦",
    lat: 56.1304,
    lng: -106.3468
  },
  NG: {
    country: "Nigeria",
    countryCode: "NG",
    flag: "🇳🇬",
    lat: 9.082,
    lng: 8.6753
  },
  AU: {
    country: "Australia",
    countryCode: "AU",
    flag: "🇦🇺",
    lat: -25.2744,
    lng: 133.7751
  },
  KE: {
    country: "Kenya",
    countryCode: "KE",
    flag: "🇰🇪",
    lat: -0.0236,
    lng: 37.9062
  },
  GB: {
    country: "United Kingdom",
    countryCode: "GB",
    flag: "🇬🇧",
    lat: 55.3781,
    lng: -3.436
  },
  DE: {
    country: "Germany",
    countryCode: "DE",
    flag: "🇩🇪",
    lat: 51.1657,
    lng: 10.4515
  },
  FR: {
    country: "France",
    countryCode: "FR",
    flag: "🇫🇷",
    lat: 46.2276,
    lng: 2.2137
  },
  ES: {
    country: "Spain",
    countryCode: "ES",
    flag: "🇪🇸",
    lat: 40.4637,
    lng: -3.7492
  },
  CN: {
    country: "China",
    countryCode: "CN",
    flag: "🇨🇳",
    lat: 35.8617,
    lng: 104.1954
  },
  SG: {
    country: "Singapore",
    countryCode: "SG",
    flag: "🇸🇬",
    lat: 1.3521,
    lng: 103.8198
  },
  ZA: {
    country: "South Africa",
    countryCode: "ZA",
    flag: "🇿🇦",
    lat: -30.5595,
    lng: 22.9375
  },
  EG: {
    country: "Egypt",
    countryCode: "EG",
    flag: "🇪🇬",
    lat: 26.8206,
    lng: 30.8025
  },
  AE: {
    country: "United Arab Emirates",
    countryCode: "AE",
    flag: "🇦🇪",
    lat: 23.4241,
    lng: 53.8478
  },
  GL: {
    country: "Global",
    countryCode: "GL",
    flag: "🌍",
    lat: 0,
    lng: 0
  }
};

const countryNameToCode = {
  "united states": "US",
  usa: "US",
  us: "US",
  america: "US",
  india: "IN",
  bharat: "IN",
  brazil: "BR",
  italy: "IT",
  japan: "JP",
  "south korea": "KR",
  korea: "KR",
  canada: "CA",
  nigeria: "NG",
  australia: "AU",
  kenya: "KE",
  "united kingdom": "GB",
  uk: "GB",
  england: "GB",
  germany: "DE",
  france: "FR",
  spain: "ES",
  china: "CN",
  singapore: "SG",
  "south africa": "ZA",
  egypt: "EG",
  uae: "AE",
  "united arab emirates": "AE",
  global: "GL"
};

const mockDonors = [
  {
    id: "emperor-empty",
    name: "The Empty Throne",
    username: "empty-throne",
    country: "Global",
    countryCode: "GL",
    flag: "🌍",
    rank: "Emperor",
    amountUSD: 1000000,
    message: "The throne awaits the first Emperor of Earth.",
    causeCategory: "Not chosen yet",
    causeImpact: "Not chosen yet",
    cause: "Not chosen yet",
    isEmperor: true
  },
  {
    id: "maya-singh",
    name: "Maya Singh",
    username: "maya",
    country: "India",
    countryCode: "IN",
    flag: "🇮🇳",
    rank: "Duke",
    amountUSD: 25000,
    message: "Let this stand as a promise.",
    causeCategory: "Human Survival",
    causeImpact: "Meals for the Hungry",
    cause: "Human Survival — Meals for the Hungry",
    isEmperor: false
  },
  {
    id: "lucas-silva",
    name: "Lucas Silva",
    username: "lucas",
    country: "Brazil",
    countryCode: "BR",
    flag: "🇧🇷",
    rank: "Baron",
    amountUSD: 6800,
    message: "A legacy bigger than one lifetime.",
    causeCategory: "Planet Protection",
    causeImpact: "Climate Repair Fund",
    cause: "Planet Protection — Climate Repair Fund",
    isEmperor: false
  },
  {
    id: "aarav-mehta",
    name: "Aarav Mehta",
    username: "aarav",
    country: "India",
    countryCode: "IN",
    flag: "🇮🇳",
    rank: "Lord",
    amountUSD: 1250,
    message: "For clean water and future generations.",
    causeCategory: "Human Survival",
    causeImpact: "Clean Water for Life",
    cause: "Human Survival — Clean Water for Life",
    isEmperor: false
  }
];

function normalizeCountry(user = {}) {
  const rawCountryCode = String(user.countryCode || "").trim().toUpperCase();
  const rawCountry = String(user.country || "").trim();
  const normalizedCountryKey = rawCountry.toLowerCase();

  const countryCodeFromName = countryNameToCode[normalizedCountryKey];
  const finalCountryCode =
    countryDirectory[rawCountryCode] && rawCountryCode !== "UN"
      ? rawCountryCode
      : countryCodeFromName || "US";

  const countryInfo = countryDirectory[finalCountryCode] || countryDirectory.US;

  return {
    country: countryInfo.country,
    countryCode: countryInfo.countryCode,
    flag: countryInfo.flag,
    lat: countryInfo.lat,
    lng: countryInfo.lng
  };
}

function normalizeDonorLocation(user = {}) {
  const countryData = normalizeCountry(user);
  const location = user.donorLocation || {};

  const city = String(location.city || "").trim();
  const region = String(location.region || "").trim();

  const lat = Number(location.lat);
  const lng = Number(location.lng);

  const hasSafeCoordinates =
    Number.isFinite(lat) &&
    lat >= -90 &&
    lat <= 90 &&
    Number.isFinite(lng) &&
    lng >= -180 &&
    lng <= 180;

  const locationLabel = city
    ? [city, region, countryData.country].filter(Boolean).join(", ")
    : countryData.country;

  return {
    city,
    region,
    country: countryData.country,
    countryCode: countryData.countryCode,
    flag: countryData.flag,
    lat: hasSafeCoordinates ? lat : countryData.lat,
    lng: hasSafeCoordinates ? lng : countryData.lng,
    locationLabel,
    precision: location.precision || (city ? "city" : "country"),
    source: location.source || "manual"
  };
}

function getFlag(countryCode) {
  const code = String(countryCode || "").trim().toUpperCase();
  return countryDirectory[code]?.flag || "🌍";
}

function cleanQueryValue(value) {
  return String(value || "").trim();
}

function getCauseFilters(req) {
  const mission = cleanQueryValue(req.query.mission || req.query.causeCategory);
  const impact = cleanQueryValue(req.query.impact || req.query.causeImpact);
  const cause = cleanQueryValue(req.query.cause);

  return {
    mission,
    impact,
    cause
  };
}

function buildCauseMongoFilter(req) {
  const filters = getCauseFilters(req);
  const query = {};

  if (filters.mission) {
    query.causeCategory = filters.mission;
  }

  if (filters.impact) {
    query.causeImpact = filters.impact;
  }

  if (filters.cause) {
    query.cause = filters.cause;
  }

  return query;
}

function matchesCauseFilters(item, filters) {
  if (filters.mission && item.causeCategory !== filters.mission) {
    return false;
  }

  if (filters.impact && item.causeImpact !== filters.impact) {
    return false;
  }

  if (filters.cause && item.cause !== filters.cause) {
    return false;
  }

  return true;
}

function normalizeCauseData(source = {}) {
  const rawCategory = String(source.causeCategory || "").trim();
  const rawImpact = String(source.causeImpact || "").trim();
  const rawCause = String(source.cause || "").trim();

  let causeCategory = rawCategory;
  let causeImpact = rawImpact;

  if ((!causeCategory || !causeImpact) && rawCause.includes("—")) {
    const parts = rawCause.split("—").map((part) => part.trim());
    causeCategory = causeCategory || parts[0];
    causeImpact = causeImpact || parts.slice(1).join(" — ");
  }

  if (!causeCategory) {
    causeCategory = defaultCauseCategory;
  }

  if (!causeImpact) {
    causeImpact = defaultCauseImpact;
  }

  const cause =
    rawCause && rawCause !== "Clean drinking water"
      ? rawCause
      : `${causeCategory} — ${causeImpact}`;

  return {
    causeCategory,
    causeImpact,
    cause
  };
}

async function getLatestDonationsByUserIds(userIds, donationFilter = {}) {
  const donations = await Donation.find({
    userId: { $in: userIds },
    ...donationFilter
  })
    .sort({ createdAt: -1 })
    .lean();

  const latestMap = new Map();

  for (const donation of donations) {
    const key = donation.userId?.toString();

    if (key && !latestMap.has(key)) {
      latestMap.set(key, donation);
    }
  }

  return latestMap;
}

async function getDatabaseDonors(req) {
  const donationFilter = buildCauseMongoFilter(req);
  const hasCauseFilter = Object.keys(donationFilter).length > 0;

  const users = await User.find({
    totalDonated: { $gt: 0 },
    isBanned: false
  })
    .sort({ totalDonated: -1 })
    .limit(200)
    .lean();

  const latestDonationMap = await getLatestDonationsByUserIds(
    users.map((user) => user._id),
    donationFilter
  );

  return users
    .map((user) => {
      const latestDonation = latestDonationMap.get(user._id.toString());

      if (hasCauseFilter && !latestDonation) {
        return null;
      }

      const causeData = normalizeCauseData(latestDonation);
      const countryData = normalizeCountry(user);

      return {
        id: user._id.toString(),
        name: user.isAnonymous
          ? "Anonymous"
          : user.displayName || user.username || user.email,
        username: user.username,
        country: countryData.country,
        countryCode: countryData.countryCode,
        flag: countryData.flag,
        lat: countryData.lat,
        lng: countryData.lng,
        rank: user.currentRank || "Spark",
        amountUSD: Number(user.totalDonated || 0),
        message: latestDonation?.tileMessage || "Saved MongoDB donor profile.",
        causeCategory: causeData.causeCategory,
        causeImpact: causeData.causeImpact,
        cause: causeData.cause,
        isEmperor: user.role === "emperor",
        createdAt: user.createdAt
      };
    })
    .filter(Boolean);
}

async function getDatabaseTiles(req) {
  const donationFilter = buildCauseMongoFilter(req);
  const hasCauseFilter = Object.keys(donationFilter).length > 0;

  let matchingDonationIds = null;

  if (hasCauseFilter) {
    const matchingDonations = await Donation.find(donationFilter)
      .select("_id")
      .lean();

    matchingDonationIds = matchingDonations.map((donation) => donation._id);
  }

  const tileQuery = hasCauseFilter
    ? { donationId: { $in: matchingDonationIds } }
    : {};

  const tiles = await Tile.find(tileQuery)
    .populate(
      "userId",
      "displayName username email country countryCode donorLocation currentRank totalDonated isAnonymous role"
    )
    .populate(
      "donationId",
      "amountUSD rankAtTime tileMessage isAnonymous tileTheme causeCategory causeImpact cause createdAt"
    )
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return tiles.map((tile) => {
    const user = tile.userId || {};
    const donation = tile.donationId || {};
    const causeData = normalizeCauseData(donation);
    const locationData = normalizeDonorLocation(user);

    return {
      id: tile._id.toString(),
      name:
        donation.isAnonymous || user.isAnonymous
          ? "Anonymous"
          : user.displayName || user.username || user.email || "Unknown Donor",
      username: user.username || "unknown",
      city: locationData.city,
      region: locationData.region,
      country: locationData.country,
      countryCode: locationData.countryCode,
      flag: locationData.flag,
      lat: locationData.lat,
      lng: locationData.lng,
      locationLabel: locationData.locationLabel,
      precision: locationData.precision,
      rank: donation.rankAtTime || user.currentRank || "Spark",
      amountUSD: Number(donation.amountUSD || user.totalDonated || 0),
      message: tile.message || donation.tileMessage || "Saved MongoDB legacy tile.",
      causeCategory: causeData.causeCategory,
      causeImpact: causeData.causeImpact,
      cause: causeData.cause,
      isEmperor: user.role === "emperor",
      createdAt: tile.createdAt
    };
  });
}

function getFilteredMockDonors(req) {
  const filters = getCauseFilters(req);
  return mockDonors.filter((donor) => matchesCauseFilters(donor, filters));
}

export async function getPublicStats(req, res, next) {
  try {
    const donationFilter = buildCauseMongoFilter(req);

    const matchingDonations = await Donation.find(donationFilter)
      .populate("userId", "countryCode country isBanned")
      .lean();

    const validDonations = matchingDonations.filter((donation) => {
      return donation.userId && !donation.userId.isBanned;
    });

    if (validDonations.length > 0) {
      const totalDonated = validDonations.reduce(
        (sum, donation) => sum + Number(donation.amountUSD || 0),
        0
      );

      const donors = new Set(
        validDonations.map((donation) => donation.userId._id.toString())
      );

      const countries = new Set(
        validDonations.map((donation) => normalizeCountry(donation.userId).countryCode)
      );

      return res.status(200).json({
        totalDonated: Number(totalDonated.toFixed(2)),
        donors: donors.size,
        countries: countries.size,
        livesImpacted: Math.floor(totalDonated * 2.4),
        filters: getCauseFilters(req),
        source: "mongodb"
      });
    }

    const realDonors = getFilteredMockDonors(req).filter((donor) => !donor.isEmperor);
    const totalDonated = realDonors.reduce((sum, donor) => sum + donor.amountUSD, 0);
    const countries = new Set(realDonors.map((donor) => donor.countryCode));

    return res.status(200).json({
      totalDonated,
      donors: realDonors.length,
      countries: countries.size,
      livesImpacted: Math.floor(totalDonated * 2.4),
      filters: getCauseFilters(req),
      source: "mock"
    });
  } catch (error) {
    next(error);
  }
}

export async function getTiles(req, res, next) {
  try {
    const dbTiles = await getDatabaseTiles(req);
    const filters = getCauseFilters(req);
    const hasCauseFilter = Boolean(filters.mission || filters.impact || filters.cause);

    if (dbTiles.length > 0 || hasCauseFilter) {
      const throne = {
        id: "emperor-empty",
        name: "The Empty Throne",
        username: "empty-throne",
        country: "Global",
        countryCode: "GL",
        flag: "🌍",
        lat: 0,
        lng: 0,
        rank: "Emperor",
        amountUSD: 1000000,
        message: "The throne awaits the first Emperor of Earth.",
        causeCategory: "Not chosen yet",
        causeImpact: "Not chosen yet",
        cause: "Not chosen yet",
        isEmperor: true
      };

      const tiles = hasCauseFilter ? dbTiles : [throne, ...dbTiles];

      return res.status(200).json({
        tiles,
        filters,
        source: "mongodb"
      });
    }

    return res.status(200).json({
      tiles: getFilteredMockDonors(req),
      filters,
      source: "mock"
    });
  } catch (error) {
    next(error);
  }
}

export async function getLeaderboard(req, res, next) {
  try {
    const dbDonors = await getDatabaseDonors(req);
    const filters = getCauseFilters(req);
    const hasCauseFilter = Boolean(filters.mission || filters.impact || filters.cause);

    if (dbDonors.length > 0 || hasCauseFilter) {
      const throne = {
        id: "emperor-empty",
        name: "The Empty Throne",
        username: "empty-throne",
        country: "Global",
        countryCode: "GL",
        flag: "🌍",
        lat: 0,
        lng: 0,
        rank: "Emperor",
        amountUSD: 1000000,
        message: "The throne awaits the first Emperor of Earth.",
        causeCategory: "Not chosen yet",
        causeImpact: "Not chosen yet",
        cause: "Not chosen yet",
        isEmperor: true
      };

      const leaderboard = hasCauseFilter ? dbDonors : [throne, ...dbDonors];

      return res.status(200).json({
        leaderboard: leaderboard.sort(
          (a, b) => Number(b.amountUSD || 0) - Number(a.amountUSD || 0)
        ),
        filters,
        source: "mongodb"
      });
    }

    return res.status(200).json({
      leaderboard: getFilteredMockDonors(req).sort((a, b) => b.amountUSD - a.amountUSD),
      filters,
      source: "mock"
    });
  } catch (error) {
    next(error);
  }
}

export async function getCountryLeaderboard(req, res, next) {
  try {
    const donationFilter = buildCauseMongoFilter(req);

    const donations = await Donation.find(donationFilter)
      .populate(
        "userId",
        "displayName username email country countryCode donorLocation totalDonated isAnonymous isBanned"
      )
      .sort({ createdAt: -1 })
      .lean();

    const validDonations = donations.filter((donation) => {
      return donation.userId && !donation.userId.isBanned;
    });

    const sourceItems =
      validDonations.length > 0
        ? validDonations.map((donation) => {
            const user = donation.userId || {};
            const locationData = normalizeDonorLocation(user);
            const causeData = normalizeCauseData(donation);

            return {
              id: donation._id.toString(),
              name: user.isAnonymous
                ? "Anonymous"
                : user.displayName || user.username || user.email || "Unknown Donor",
              city: locationData.city,
              region: locationData.region,
              country: locationData.country,
              countryCode: locationData.countryCode,
              flag: locationData.flag,
              lat: locationData.lat,
              lng: locationData.lng,
              locationLabel: locationData.locationLabel,
              precision: locationData.precision,
              amountUSD: Number(donation.amountUSD || 0),
              causeCategory: causeData.causeCategory,
              causeImpact: causeData.causeImpact,
              cause: causeData.cause,
              createdAt: donation.createdAt
            };
          })
        : getFilteredMockDonors(req)
            .filter((item) => !item.isEmperor)
            .map((donor) => {
              const countryData = normalizeCountry(donor);

              return {
                ...donor,
                country: countryData.country,
                countryCode: countryData.countryCode,
                flag: countryData.flag,
                lat: countryData.lat,
                lng: countryData.lng
              };
            });

    const countryMap = new Map();

    for (const item of sourceItems) {
      const key = item.lat && item.lng
        ? `${item.countryCode || "US"}:${Number(item.lat).toFixed(2)}:${Number(item.lng).toFixed(2)}`
        : item.countryCode || "US";

      const existing = countryMap.get(key) || {
        city: item.city || "",
        region: item.region || "",
        country: item.country,
        countryCode: item.countryCode,
        flag: item.flag,
        lat: item.lat,
        lng: item.lng,
        locationLabel: item.locationLabel || item.country,
        precision: item.precision || "country",
        totalDonated: 0,
        totalAmount: 0,
        donors: 0,
        donorCount: 0,
        topDonor: item.name,
        topAmount: 0,
        topMission: item.causeCategory,
        mission: item.causeCategory,
        causeCategory: item.causeCategory,
        causeImpact: item.causeImpact,
        cause: item.cause,
        missionTotals: {}
      };

      existing.totalDonated += Number(item.amountUSD || 0);
      existing.totalAmount += Number(item.amountUSD || 0);
      existing.donors += 1;
      existing.donorCount += 1;

      const mission = item.causeCategory || defaultCauseCategory;
      existing.missionTotals[mission] =
        Number(existing.missionTotals[mission] || 0) + Number(item.amountUSD || 0);

      if (Number(item.amountUSD || 0) > Number(existing.topAmount || 0)) {
        existing.topAmount = Number(item.amountUSD || 0);
        existing.topDonor = item.name;
        existing.topMission = mission;
        existing.mission = mission;
        existing.causeCategory = item.causeCategory;
        existing.causeImpact = item.causeImpact;
        existing.cause = item.cause;
      }

      countryMap.set(key, existing);
    }

    const countries = Array.from(countryMap.values())
      .map((item) => {
        const missionEntries = Object.entries(item.missionTotals || {});
        const topMissionEntry = missionEntries.sort((a, b) => b[1] - a[1])[0];

        const topMission = topMissionEntry?.[0] || item.topMission || defaultCauseCategory;

        return {
          city: item.city || "",
          region: item.region || "",
          country: item.country,
          countryCode: item.countryCode,
          flag: item.flag,
          lat: item.lat,
          lng: item.lng,
          locationLabel: item.locationLabel || item.country,
          precision: item.precision || "country",
          totalDonated: Number(item.totalDonated.toFixed(2)),
          totalAmount: Number(item.totalAmount.toFixed(2)),
          donors: item.donors,
          donorCount: item.donorCount,
          topDonor: item.topDonor,
          topAmount: Number(item.topAmount.toFixed(2)),
          topMission,
          mission: topMission,
          causeCategory: topMission,
          causeImpact: item.causeImpact,
          cause: item.cause
        };
      })
      .sort((a, b) => b.totalDonated - a.totalDonated);

    return res.status(200).json({
      countries,
      data: countries,
      filters: getCauseFilters(req),
      source: validDonations.length > 0 ? "mongodb" : "mock"
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentEmperor(req, res, next) {
  try {
    const activeEmperor = await Emperor.findOne({
      isActive: true,
      dethroned: false
    })
      .populate("userId", "displayName username country countryCode totalDonated")
      .sort({ totalDonated: -1 })
      .lean();

    if (!activeEmperor) {
      return res.status(200).json({
        emperor: null,
        throneEmpty: true,
        message: "The throne is empty.",
        selectedCause: null,
        source: "mongodb"
      });
    }

    return res.status(200).json({
      emperor: {
        id: activeEmperor.userId?._id,
        name: activeEmperor.userId?.displayName || activeEmperor.userId?.username,
        username: activeEmperor.userId?.username,
        country: normalizeCountry(activeEmperor.userId).country,
        countryCode: normalizeCountry(activeEmperor.userId).countryCode,
        totalDonated: activeEmperor.totalDonated
      },
      throneEmpty: false,
      message: activeEmperor.globalMessage || "The Emperor has chosen the global cause.",
      selectedCause: activeEmperor.chosenCause,
      source: "mongodb"
    });
  } catch (error) {
    next(error);
  }
}

export async function getAuditEntries(req, res, next) {
  try {
    const auditFilter = buildCauseMongoFilter(req);
    const filters = getCauseFilters(req);

    const dbEntries = await AuditEntry.find(auditFilter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    if (dbEntries.length > 0 || Object.keys(auditFilter).length > 0) {
      return res.status(200).json({
        entries: dbEntries.map((entry) => {
          const causeData = normalizeCauseData(entry);

          return {
            id: entry._id.toString(),
            type: entry.type,
            amount: Number(entry.amount || 0),
            currency: entry.currency || "USD",
            recipient: entry.recipient,
            causeCategory: causeData.causeCategory,
            causeImpact: causeData.causeImpact,
            cause: causeData.cause,
            description: entry.description,
            status: "recorded",
            proofUrl: entry.proofUrl,
            createdAt: entry.createdAt
          };
        }),
        filters,
        source: "mongodb"
      });
    }

    return res.status(200).json({
      entries: [
        {
          id: "audit-1",
          type: "donation_received",
          amount: 25,
          currency: "USD",
          recipient: "One Earth Legacy",
          causeCategory: defaultCauseCategory,
          causeImpact: defaultCauseImpact,
          cause: defaultCause,
          description: "Citizen rank donation received from mock donor.",
          status: "settled",
          createdAt: new Date().toISOString()
        },
        {
          id: "audit-2",
          type: "cause_allocation",
          amount: 15,
          currency: "USD",
          recipient: defaultCause,
          causeCategory: defaultCauseCategory,
          causeImpact: defaultCauseImpact,
          cause: defaultCause,
          description: "60% allocation reserved for verified global cause payout.",
          status: "reserved",
          createdAt: new Date().toISOString()
        },
        {
          id: "audit-3",
          type: "platform_allocation",
          amount: 6.25,
          currency: "USD",
          recipient: "Platform operations",
          causeCategory: defaultCauseCategory,
          causeImpact: defaultCauseImpact,
          cause: defaultCause,
          description: "25% allocation reserved for hosting, security, monitoring, and operations.",
          status: "reserved",
          createdAt: new Date().toISOString()
        },
        {
          id: "audit-4",
          type: "lottery_allocation",
          amount: 3.75,
          currency: "USD",
          recipient: "Monthly donor lottery",
          causeCategory: defaultCauseCategory,
          causeImpact: defaultCauseImpact,
          cause: defaultCause,
          description: "15% allocation added to monthly donor prize pool.",
          status: "reserved",
          createdAt: new Date().toISOString()
        }
      ].filter((entry) => matchesCauseFilters(entry, filters)),
      filters,
      source: "mock"
    });
  } catch (error) {
    next(error);
  }
}

export async function getPublicProfile(req, res, next) {
  try {
    const { username } = req.params;
    const cleanUsername = String(username || "").trim().toLowerCase();

    const user = await User.findOne({
      username: cleanUsername,
      isBanned: false
    }).lean();

    if (user) {
      const donations = await Donation.find({ userId: user._id })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      const tiles = await Tile.find({ userId: user._id })
        .populate(
          "donationId",
          "causeCategory causeImpact cause amountUSD rankAtTime tileMessage isAnonymous tileTheme createdAt"
        )
        .sort({ createdAt: -1 })
        .limit(6)
        .lean();

      const latestTile = tiles[0] || null;
      const latestDonation = latestTile?.donationId || donations[0] || {};
      const causeData = normalizeCauseData(latestDonation);
      const locationData = normalizeDonorLocation(user);

      const higherRankCount = await User.countDocuments({
        totalDonated: { $gt: Number(user.totalDonated || 0) },
        isBanned: false
      });

      const missionMap = new Map();

      for (const donation of donations) {
        const normalizedCause = normalizeCauseData(donation);
        const key = normalizedCause.cause;

        const existing = missionMap.get(key) || {
          causeCategory: normalizedCause.causeCategory,
          causeImpact: normalizedCause.causeImpact,
          cause: normalizedCause.cause,
          totalDonated: 0,
          donations: 0
        };

        existing.totalDonated += Number(donation.amountUSD || 0);
        existing.donations += 1;

        missionMap.set(key, existing);
      }

      const missionsSupported = Array.from(missionMap.values())
        .map((mission) => ({
          ...mission,
          totalDonated: Number(mission.totalDonated.toFixed(2))
        }))
        .sort((a, b) => b.totalDonated - a.totalDonated);

      const recentTiles = tiles.map((tile) => {
        const donation = tile.donationId || {};
        const normalizedCause = normalizeCauseData(donation);

        return {
          id: tile._id.toString(),
          rank: donation.rankAtTime || user.currentRank || "Spark",
          message:
            tile.message ||
            donation.tileMessage ||
            "A public legacy tile was created.",
          causeCategory: normalizedCause.causeCategory,
          causeImpact: normalizedCause.causeImpact,
          cause: normalizedCause.cause,
          amountUSD: Number(donation.amountUSD || 0),
          themeColor: tile.themeColor || donation.tileTheme || "Gold",
          createdAt: tile.createdAt
        };
      });

      const totalDonated = Number(user.totalDonated || 0);

      return res.status(200).json({
        profile: {
          displayName: user.isAnonymous
            ? "Anonymous"
            : user.displayName || user.username,
          username: user.username,
          city: locationData.city,
          region: locationData.region,
          country: locationData.country,
          countryCode: locationData.countryCode,
          flag: locationData.flag,
          lat: locationData.lat,
          lng: locationData.lng,
          locationLabel: locationData.locationLabel,
          precision: locationData.precision,
          rank: user.currentRank || "Spark",
          rankPosition: higherRankCount + 1,
          totalDonated,
          donationCount: donations.length,
          message:
            latestTile?.message ||
            latestDonation?.tileMessage ||
            "Saved MongoDB donor profile.",
          causeCategory: causeData.causeCategory,
          causeImpact: causeData.causeImpact,
          cause: causeData.cause,
          joined: user.createdAt
            ? new Date(user.createdAt).getFullYear().toString()
            : "2026",
          tileTheme:
            latestTile?.themeColor ||
            latestDonation?.tileTheme ||
            "Gold",
          impact: {
            causeAmount: Number((totalDonated * 0.6).toFixed(2)),
            platformAmount: Number((totalDonated * 0.25).toFixed(2)),
            lotteryAmount: Number((totalDonated * 0.15).toFixed(2))
          },
          missionsSupported,
          recentTiles,
          timeline: [
            {
              title: "Joined One Earth Legacy",
              date: user.createdAt
                ? new Date(user.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })
                : "Saved in MongoDB",
              text: "Created a secure legacy profile."
            },
            {
              title: `Reached ${user.currentRank || "Spark"} rank`,
              date: "Current",
              text: `Current public rank is ${user.currentRank || "Spark"}.`
            },
            {
              title: "Legacy tile created",
              date: latestTile
                ? new Date(latestTile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  })
                : "Pending",
              text: latestTile
                ? `A public tile was saved for ${causeData.cause}.`
                : "This donor does not have a saved tile yet."
            }
          ]
        },
        source: "mongodb"
      });
    }

    const donor = mockDonors.find(
      (item) => item.username.toLowerCase() === cleanUsername
    );

    if (!donor) {
      return res.status(404).json({
        message: "Public profile not found"
      });
    }

    const countryData = normalizeCountry(donor);

    return res.status(200).json({
      profile: {
        displayName: donor.name,
        username: donor.username,
        city: "",
        region: "",
        country: countryData.country,
        countryCode: countryData.countryCode,
        flag: countryData.flag,
        lat: countryData.lat,
        lng: countryData.lng,
        locationLabel: countryData.country,
        precision: "country",
        rank: donor.rank,
        rankPosition: 1,
        totalDonated: donor.amountUSD,
        donationCount: 1,
        message: donor.message,
        causeCategory: donor.causeCategory,
        causeImpact: donor.causeImpact,
        cause: donor.cause,
        joined: "2026",
        tileTheme: "Gold",
        impact: {
          causeAmount: Number((donor.amountUSD * 0.6).toFixed(2)),
          platformAmount: Number((donor.amountUSD * 0.25).toFixed(2)),
          lotteryAmount: Number((donor.amountUSD * 0.15).toFixed(2))
        },
        missionsSupported: [
          {
            causeCategory: donor.causeCategory,
            causeImpact: donor.causeImpact,
            cause: donor.cause,
            totalDonated: donor.amountUSD,
            donations: 1
          }
        ],
        recentTiles: [
          {
            id: `${donor.username}-mock-tile`,
            rank: donor.rank,
            message: donor.message,
            causeCategory: donor.causeCategory,
            causeImpact: donor.causeImpact,
            cause: donor.cause,
            amountUSD: donor.amountUSD,
            themeColor: "Gold",
            createdAt: new Date().toISOString()
          }
        ],
        timeline: [
          {
            title: "Joined One Earth Legacy",
            date: "Mock",
            text: "Created a secure legacy profile."
          },
          {
            title: `Reached ${donor.rank} rank`,
            date: "Mock",
            text: `Current public rank is ${donor.rank}.`
          },
          {
            title: "Legacy tile created",
            date: "Mock",
            text: `A permanent public tile was added for ${donor.cause}.`
          }
        ]
      },
      source: "mock"
    });
  } catch (error) {
    next(error);
  }
}

