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

function getFlag(countryCode) {
  const flags = {
    US: "🇺🇸",
    IN: "🇮🇳",
    BR: "🇧🇷",
    IT: "🇮🇹",
    JP: "🇯🇵",
    KR: "🇰🇷",
    CA: "🇨🇦",
    NG: "🇳🇬",
    GL: "🌍",
    UN: "🌍"
  };

  return flags[countryCode] || "🌍";
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

      return {
        id: user._id.toString(),
        name: user.isAnonymous ? "Anonymous" : user.displayName || user.username || user.email,
        username: user.username,
        country: user.country || "Unknown",
        countryCode: user.countryCode || "UN",
        flag: getFlag(user.countryCode || "UN"),
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
    .populate("userId", "displayName username email country countryCode currentRank totalDonated isAnonymous role")
    .populate("donationId", "amountUSD rankAtTime tileMessage isAnonymous tileTheme causeCategory causeImpact cause createdAt")
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return tiles.map((tile) => {
    const user = tile.userId || {};
    const donation = tile.donationId || {};
    const causeData = normalizeCauseData(donation);

    return {
      id: tile._id.toString(),
      name: donation.isAnonymous || user.isAnonymous
        ? "Anonymous"
        : user.displayName || user.username || user.email || "Unknown Donor",
      username: user.username || "unknown",
      country: user.country || "Unknown",
      countryCode: user.countryCode || "UN",
      flag: getFlag(user.countryCode || "UN"),
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
      .populate("userId", "countryCode isBanned")
      .lean();

    const validDonations = matchingDonations.filter((donation) => {
      return donation.userId && !donation.userId.isBanned;
    });

    if (validDonations.length > 0) {
      const totalDonated = validDonations.reduce(
        (sum, donation) => sum + Number(donation.amountUSD || 0),
        0
      );

      const donors = new Set(validDonations.map((donation) => donation.userId._id.toString()));
      const countries = new Set(validDonations.map((donation) => donation.userId.countryCode || "UN"));

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
        leaderboard: leaderboard.sort((a, b) => Number(b.amountUSD || 0) - Number(a.amountUSD || 0)),
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
    const dbDonors = await getDatabaseDonors(req);
    const filters = getCauseFilters(req);
    const sourceDonors = dbDonors.length > 0
      ? dbDonors
      : getFilteredMockDonors(req).filter((item) => !item.isEmperor);

    const countryMap = new Map();

    for (const donor of sourceDonors.filter((item) => !item.isEmperor)) {
      const existing = countryMap.get(donor.countryCode) || {
        country: donor.country,
        countryCode: donor.countryCode,
        flag: donor.flag,
        totalDonated: 0,
        donors: 0,
        topDonor: donor.name,
        topAmount: 0
      };

      existing.totalDonated += Number(donor.amountUSD || 0);
      existing.donors += 1;

      if (Number(donor.amountUSD || 0) > Number(existing.topAmount || 0)) {
        existing.topAmount = Number(donor.amountUSD || 0);
        existing.topDonor = donor.name;
      }

      countryMap.set(donor.countryCode, existing);
    }

    return res.status(200).json({
      countries: Array.from(countryMap.values())
        .map((item) => ({
          ...item,
          totalDonated: Number(item.totalDonated.toFixed(2))
        }))
        .sort((a, b) => b.totalDonated - a.totalDonated),
      filters,
      source: dbDonors.length > 0 ? "mongodb" : "mock"
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
        country: activeEmperor.userId?.country,
        countryCode: activeEmperor.userId?.countryCode,
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

    const user = await User.findOne({
      username: username.toLowerCase(),
      isBanned: false
    }).lean();

    if (user) {
      const latestTile = await Tile.findOne({ userId: user._id })
        .populate("donationId", "causeCategory causeImpact cause amountUSD rankAtTime tileMessage isAnonymous tileTheme createdAt")
        .sort({ createdAt: -1 })
        .lean();

      const latestDonation = latestTile?.donationId || {};
      const causeData = normalizeCauseData(latestDonation);

      return res.status(200).json({
        profile: {
          displayName: user.displayName || user.username,
          username: user.username,
          country: user.country || "Unknown",
          countryCode: user.countryCode || "UN",
          flag: getFlag(user.countryCode || "UN"),
          rank: user.currentRank || "Spark",
          totalDonated: Number(user.totalDonated || 0),
          message: latestTile?.message || "Saved MongoDB donor profile.",
          causeCategory: causeData.causeCategory,
          causeImpact: causeData.causeImpact,
          cause: causeData.cause,
          joined: new Date(user.createdAt).getFullYear().toString(),
          tileTheme: latestTile?.themeColor || "Gold",
          impact: {
            causeAmount: Number((Number(user.totalDonated || 0) * 0.6).toFixed(2)),
            platformAmount: Number((Number(user.totalDonated || 0) * 0.25).toFixed(2)),
            lotteryAmount: Number((Number(user.totalDonated || 0) * 0.15).toFixed(2))
          },
          timeline: [
            {
              title: "Joined One Earth Legacy",
              date: "Saved in MongoDB",
              text: "Created a secure legacy profile."
            },
            {
              title: `Reached ${user.currentRank || "Spark"} rank`,
              date: "Current",
              text: `Current public rank is ${user.currentRank || "Spark"}.`
            },
            {
              title: "Legacy tile created",
              date: latestTile ? "Saved in MongoDB" : "Pending",
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
      (item) => item.username.toLowerCase() === username.toLowerCase()
    );

    if (!donor) {
      return res.status(404).json({
        message: "Public profile not found"
      });
    }

    return res.status(200).json({
      profile: {
        displayName: donor.name,
        username: donor.username,
        country: donor.country,
        countryCode: donor.countryCode,
        flag: donor.flag,
        rank: donor.rank,
        totalDonated: donor.amountUSD,
        message: donor.message,
        causeCategory: donor.causeCategory,
        causeImpact: donor.causeImpact,
        cause: donor.cause,
        joined: "2026",
        tileTheme: "Gold",
        impact: {
          causeAmount: donor.amountUSD * 0.6,
          platformAmount: donor.amountUSD * 0.25,
          lotteryAmount: donor.amountUSD * 0.15
        },
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