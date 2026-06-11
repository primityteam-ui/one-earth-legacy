import mongoose from "mongoose";

import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Tile from "../models/Tile.js";
import AuditEntry from "../models/AuditEntry.js";
import SecurityLog from "../models/SecurityLog.js";
import { logSecurityEvent } from "../utils/securityLog.js";

function safeNumber(value) {
  return Number(value || 0);
}

function money(value) {
  return Number(safeNumber(value).toFixed(2));
}

function getLocation(user = {}) {
  const location = user.donorLocation || {};

  const city = String(location.city || "").trim();
  const region = String(location.region || "").trim();
  const country = String(location.country || user.country || "Unknown").trim();
  const countryCode = String(location.countryCode || user.countryCode || "UN").trim();

  return {
    city,
    region,
    country,
    countryCode,
    lat: location.lat,
    lng: location.lng,
    precision: location.precision || (city ? "city" : "country"),
    label: [city, region, country].filter(Boolean).join(", ") || country
  };
}

function writeAdminAction(req, action, details = {}) {
  return logSecurityEvent({
    type: "admin_action",
    userId: req.user?._id,
    email: req.user?.email,
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    details: {
      action,
      ...details
    }
  });
}

function csvEscape(value) {
  const text = String(value ?? "");

  if (text.includes(",") || text.includes('"') || text.includes("\n")) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function buildDonationCsvRow(donation) {
  const user = donation.userId || {};
  const location = getLocation(user);

  const donorName = donation.isAnonymous || user.isAnonymous
    ? "Anonymous"
    : user.displayName || user.username || user.email || "Unknown donor";

  return [
    donation._id,
    donorName,
    user.email || "",
    user.username || "",
    money(donation.amountUSD),
    donation.currency || "USD",
    donation.causeCategory || "Unassigned",
    donation.causeImpact || "",
    donation.cause || "",
    donation.paymentMethod || "",
    donation.paymentStatus || "",
    donation.settlementStatus || "",
    location.city,
    location.region,
    location.country,
    location.countryCode,
    location.lat ?? "",
    location.lng ?? "",
    location.precision,
    donation.rankAtTime || user.currentRank || "Spark",
    donation.createdAt ? new Date(donation.createdAt).toISOString() : ""
  ].map(csvEscape).join(",");
}

function normalizeAuditFilterType(value) {
  const allowedTypes = [
    "all",
    "donation_received",
    "cause_allocation",
    "platform_allocation",
    "lottery_allocation"
  ];

  const safeType = String(value || "all").trim();

  return allowedTypes.includes(safeType) ? safeType : "all";
}

function buildAuditQuery(query = {}) {
  const auditType = normalizeAuditFilterType(query.auditType);
  const auditStartDate = String(query.auditStartDate || "").trim();
  const auditEndDate = String(query.auditEndDate || "").trim();

  const auditQuery = {};

  if (auditType !== "all") {
    auditQuery.type = auditType;
  }

  if (auditStartDate || auditEndDate) {
    auditQuery.createdAt = {};

    if (auditStartDate) {
      auditQuery.createdAt.$gte = new Date(`${auditStartDate}T00:00:00.000Z`);
    }

    if (auditEndDate) {
      auditQuery.createdAt.$lte = new Date(`${auditEndDate}T23:59:59.999Z`);
    }
  }

  return {
    auditQuery,
    auditFilters: {
      auditType,
      auditStartDate,
      auditEndDate
    }
  };
}

function getAdminHealthChecks() {
  const mongoReadyState = mongoose.connection.readyState;

  const mongoStatusMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting"
  };

  const stripeSecretConfigured = Boolean(process.env.STRIPE_SECRET_KEY);
  const stripeWebhookConfigured = Boolean(process.env.STRIPE_WEBHOOK_SECRET);

  return {
    backend: {
      status: "online",
      nodeEnv: process.env.NODE_ENV || "development",
      uptimeSeconds: Math.round(process.uptime())
    },
    database: {
      status: mongoStatusMap[mongoReadyState] || "unknown",
      readyState: mongoReadyState,
      connected: mongoReadyState === 1
    },
    stripe: {
      secretKeyConfigured: stripeSecretConfigured,
      webhookSecretConfigured: stripeWebhookConfigured,
      readyForCheckout: stripeSecretConfigured,
      readyForWebhooks: stripeSecretConfigured && stripeWebhookConfigured
    },
    security: {
      adminIpAllowlistEnabled: process.env.ADMIN_IP_ALLOWLIST_ENABLED === "true",
      adminAllowedIpsConfigured: Boolean(process.env.ADMIN_ALLOWED_IPS),
      adminTwoFactorRequired: process.env.ADMIN_2FA_REQUIRED === "true",
      adminRateLimiterEnabled: process.env.NODE_ENV !== "development"
    },
    generatedAt: new Date().toISOString()
  };
}

function cleanAuditText(value, fallback = "", maxLength = 300) {
  return String(value || fallback)
    .trim()
    .slice(0, maxLength);
}

function normalizeAuditCurrency(value) {
  const currency = cleanAuditText(value, "USD", 3).toUpperCase();

  if (!/^[A-Z]{3}$/.test(currency)) {
    return "USD";
  }

  return currency;
}

function normalizeProofUrl(value) {
  const proofUrl = cleanAuditText(value, "", 500);

  if (!proofUrl) {
    return "";
  }

  try {
    const url = new URL(proofUrl);

    if (url.protocol !== "https:") {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

function normalizeAuditAmount(value) {
  const amount = Number(value || 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return Math.min(amount, 1000000);
}

function normalizeAuditType(value) {
  const allowedTypes = [
    "donation_received",
    "cause_allocation",
    "platform_allocation",
    "lottery_allocation",
    "cause_allocation"
  ];

  const safeType = cleanAuditText(value, "cause_allocation");

  return allowedTypes.includes(safeType) ? safeType : "cause_allocation";
}

function buildAuditCsvRow(entry) {
  return [
    entry._id,
    entry.type || "",
    money(entry.amount),
    entry.currency || "USD",
    entry.recipient || "",
    entry.causeCategory || "Unassigned",
    entry.causeImpact || "",
    entry.cause || "",
    entry.description || "",
    entry.proofUrl || "",
    entry.createdAt ? new Date(entry.createdAt).toISOString() : "",
    entry.updatedAt ? new Date(entry.updatedAt).toISOString() : ""
  ].map(csvEscape).join(",");
}

export async function exportAdminAuditCsv(req, res, next) {
  try {
    const { auditQuery, auditFilters } = buildAuditQuery(req.query);

    await writeAdminAction(req, "download_audit_csv", auditFilters);

    const entries = await AuditEntry.find(auditQuery)
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    const headers = [
      "Audit Entry ID",
      "Type",
      "Amount",
      "Currency",
      "Recipient",
      "Mission",
      "Impact",
      "Cause",
      "Description",
      "Proof URL",
      "Created At",
      "Updated At"
    ];

    const csv = [
      headers.map(csvEscape).join(","),
      ...entries.map(buildAuditCsvRow)
    ].join("\n");

    const fileName = `one-earth-legacy-audit-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
}

export async function createAdminAuditEntry(req, res, next) {
  try {
    const amount = normalizeAuditAmount(req.body.amount);

    if (!amount || amount <= 0) {
      return res.status(400).json({
        message: "Audit amount must be greater than 0."
      });
    }

    const rawProofUrl = cleanAuditText(req.body.proofUrl, "", 500);
    const proofUrl = normalizeProofUrl(rawProofUrl);

    if (rawProofUrl && !proofUrl) {
      return res.status(400).json({
        message: "Proof URL must be a valid https:// link."
      });
    }

    const causeCategory = cleanAuditText(req.body.causeCategory, "Human Survival", 80);
    const causeImpact = cleanAuditText(req.body.causeImpact, "Clean Water for Life", 120);
    const cause = cleanAuditText(
      req.body.cause,
      `${causeCategory} — ${causeImpact}`,
      180
    );

    const entry = await AuditEntry.create({
      type: normalizeAuditType(req.body.type),
      amount,
      currency: normalizeAuditCurrency(req.body.currency),
      recipient: cleanAuditText(req.body.recipient, "One Earth Legacy", 120),
      causeCategory,
      causeImpact,
      cause,
      description: cleanAuditText(req.body.description, "Manual admin audit entry.", 800),
      proofUrl
    });

    await writeAdminAction(req, "create_audit_entry", {
      auditEntryId: entry._id.toString(),
      type: entry.type,
      amount: entry.amount,
      recipient: entry.recipient,
      cause: entry.cause
    });

    return res.status(201).json({
      message: "Audit entry created.",
      entry: {
        id: entry._id,
        type: entry.type,
        amount: money(entry.amount),
        currency: entry.currency || "USD",
        recipient: entry.recipient || "",
        causeCategory: entry.causeCategory || "Unassigned",
        causeImpact: entry.causeImpact || "",
        cause: entry.cause || "",
        description: entry.description || "",
        proofUrl: entry.proofUrl || "",
        createdAt: entry.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function getAdminDonationDetail(req, res, next) {
  try {
    const { donationId } = req.params;

    await writeAdminAction(req, "view_donation_detail", {
      donationId
    });

    const donation = await Donation.findById(donationId)
      .populate(
        "userId",
        "email username displayName country countryCode donorLocation currentRank totalDonated isAnonymous isBanned role createdAt"
      )
      .lean();

    if (!donation) {
      return res.status(404).json({
        message: "Donation not found."
      });
    }

    const user = donation.userId || {};
    const location = getLocation(user);

    return res.status(200).json({
      id: donation._id,
      amountUSD: money(donation.amountUSD),
      currency: donation.currency || "USD",
      paymentMethod: donation.paymentMethod || "",
      paymentStatus: donation.paymentStatus || "",
      settlementStatus: donation.settlementStatus || "",
      stripeSessionId: donation.stripeSessionId || "",
      stripePaymentIntentId: donation.stripePaymentIntentId || "",
      causeCategory: donation.causeCategory || "Unassigned",
      causeImpact: donation.causeImpact || "",
      cause: donation.cause || "",
      message: donation.message || "",
      rankAtTime: donation.rankAtTime || user.currentRank || "Spark",
      isAnonymous: Boolean(donation.isAnonymous || user.isAnonymous),
      createdAt: donation.createdAt,
      updatedAt: donation.updatedAt,
      donor: {
        id: user._id || "",
        email: user.email || "",
        username: user.username || "",
        displayName: user.displayName || "",
        role: user.role || "",
        currentRank: user.currentRank || "",
        totalDonated: money(user.totalDonated),
        isBanned: Boolean(user.isBanned),
        createdAt: user.createdAt || null
      },
      location
    });
  } catch (error) {
    next(error);
  }
}

function buildDonationAdminFilters(query = {}) {
  const search = String(query.search || "").trim().toLowerCase();
  const paymentStatus = String(query.paymentStatus || "").trim();
  const mission = String(query.mission || "").trim();
  const country = String(query.country || "").trim().toLowerCase();

  const donationQuery = {};

  if (paymentStatus && paymentStatus !== "all") {
    donationQuery.paymentStatus = paymentStatus;
  }

  if (mission && mission !== "all") {
    donationQuery.causeCategory = mission;
  }

  return {
    search,
    country,
    donationQuery,
    filters: {
      search,
      paymentStatus: paymentStatus || "all",
      mission: mission || "all",
      country: country || "all"
    }
  };
}

function filterAdminDonationRows(donations, search, country) {
  return donations.filter((donation) => {
    const user = donation.userId || {};
    const location = getLocation(user);

    const donorText = [
      user.email,
      user.username,
      user.displayName,
      donation.causeCategory,
      donation.causeImpact,
      donation.cause,
      location.label,
      location.country,
      location.countryCode
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = search ? donorText.includes(search) : true;

    const matchesCountry =
      country && country !== "all"
        ? location.country.toLowerCase().includes(country) ||
          location.countryCode.toLowerCase() === country ||
          location.label.toLowerCase().includes(country)
        : true;

    return matchesSearch && matchesCountry;
  });
}

export async function exportAdminDonationsCsv(req, res, next) {
  try {
    const { search, country, donationQuery, filters } = buildDonationAdminFilters(req.query);

    await writeAdminAction(req, "download_donations_csv", filters);

    const rawDonations = await Donation.find(donationQuery)
      .populate(
        "userId",
        "email username displayName country countryCode donorLocation currentRank totalDonated isAnonymous isBanned role"
      )
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    const donations = filterAdminDonationRows(rawDonations, search, country);

    const headers = [
      "Donation ID",
      "Donor Name",
      "Email",
      "Username",
      "Amount USD",
      "Currency",
      "Mission",
      "Impact",
      "Cause",
      "Payment Method",
      "Payment Status",
      "Settlement Status",
      "City",
      "Region",
      "Country",
      "Country Code",
      "Latitude",
      "Longitude",
      "Location Precision",
      "Rank At Time",
      "Created At"
    ];

    const csv = [
      headers.map(csvEscape).join(","),
      ...donations.map(buildDonationCsvRow)
    ].join("\n");

    const fileName = `one-earth-legacy-donations-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
}

export async function getAdminOverview(req, res, next) {
  try {
    await writeAdminAction(req, "view_admin_overview", {
      search: req.query.search || "",
      paymentStatus: req.query.paymentStatus || "all",
      mission: req.query.mission || "all",
      country: req.query.country || "all"
    });

    const search = String(req.query.search || "").trim().toLowerCase();
    const paymentStatus = String(req.query.paymentStatus || "").trim();
    const mission = String(req.query.mission || "").trim();
    const country = String(req.query.country || "").trim().toLowerCase();
    const { auditQuery, auditFilters } = buildAuditQuery(req.query);

    const donationQuery = {};

    if (paymentStatus && paymentStatus !== "all") {
      donationQuery.paymentStatus = paymentStatus;
    }

    if (mission && mission !== "all") {
      donationQuery.causeCategory = mission;
    }

    const [
      users,
      rawDonations,
      recentAuditEntries,
      recentSecurityLogs,
      tilesCount,
      auditCount
    ] = await Promise.all([
      User.find({ isBanned: false })
        .sort({ totalDonated: -1 })
        .limit(250)
        .lean(),

      Donation.find(donationQuery)
        .populate(
          "userId",
          "email username displayName country countryCode donorLocation currentRank totalDonated isAnonymous isBanned role"
        )
        .sort({ createdAt: -1 })
        .limit(250)
        .lean(),

      AuditEntry.find(auditQuery)
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),

      SecurityLog.find({})
        .populate("userId", "email username displayName role")
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),

      Tile.countDocuments({}),
      AuditEntry.countDocuments({})
    ]);

    const donations = rawDonations.filter((donation) => {
      const user = donation.userId || {};
      const location = getLocation(user);

      const donorText = [
        user.email,
        user.username,
        user.displayName,
        donation.causeCategory,
        donation.causeImpact,
        donation.cause,
        location.label,
        location.country,
        location.countryCode
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = search ? donorText.includes(search) : true;

      const matchesCountry =
        country && country !== "all"
          ? location.country.toLowerCase().includes(country) ||
            location.countryCode.toLowerCase() === country ||
            location.label.toLowerCase().includes(country)
          : true;

      return matchesSearch && matchesCountry;
    });

    const paidDonations = donations.filter((donation) => {
      return donation.paymentStatus === "paid";
    });

    const totalRevenue = paidDonations.reduce((sum, donation) => {
      return sum + safeNumber(donation.amountUSD);
    }, 0);

    const uniqueDonorIds = new Set(
      paidDonations
        .map((donation) => donation.userId?._id?.toString())
        .filter(Boolean)
    );

    const activeCountries = new Set(
      paidDonations
        .map((donation) => {
          const user = donation.userId || {};
          const location = getLocation(user);
          return location.countryCode;
        })
        .filter((code) => code && code !== "UN")
    );

    const missionTotals = {};
    const countryTotals = {};
    const auditTotalsByType = {};

    for (const donation of paidDonations) {
      const user = donation.userId || {};
      const location = getLocation(user);

      const mission = donation.causeCategory || "Unassigned";
      missionTotals[mission] = money(
        safeNumber(missionTotals[mission]) + safeNumber(donation.amountUSD)
      );

      const countryKey = location.country || "Unknown";
      const existingCountry = countryTotals[countryKey] || {
        country: countryKey,
        countryCode: location.countryCode || "UN",
        totalDonated: 0,
        donors: 0
      };

      existingCountry.totalDonated = money(
        safeNumber(existingCountry.totalDonated) + safeNumber(donation.amountUSD)
      );
      existingCountry.donors += 1;

      countryTotals[countryKey] = existingCountry;
    }

    for (const entry of recentAuditEntries) {
      const type = entry.type || "unknown";

      auditTotalsByType[type] = money(
        safeNumber(auditTotalsByType[type]) + safeNumber(entry.amount)
      );
    }

    const recentDonations = donations.map((donation) => {
      const user = donation.userId || {};
      const location = getLocation(user);

      return {
        id: donation._id,
        userId: user._id,
        donorName: donation.isAnonymous || user.isAnonymous
          ? "Anonymous"
          : user.displayName || user.username || user.email || "Unknown donor",
        email: user.email || "",
        username: user.username || "",
        rank: donation.rankAtTime || user.currentRank || "Spark",
        amountUSD: money(donation.amountUSD),
        currency: donation.currency || "USD",
        causeCategory: donation.causeCategory || "Unassigned",
        causeImpact: donation.causeImpact || "",
        cause: donation.cause || "",
        paymentMethod: donation.paymentMethod || "",
        paymentStatus: donation.paymentStatus || "",
        settlementStatus: donation.settlementStatus || "",
        location,
        createdAt: donation.createdAt
      };
    });

    const topDonors = users.map((user) => {
      const location = getLocation(user);

      return {
        id: user._id,
        displayName: user.isAnonymous
          ? "Anonymous"
          : user.displayName || user.username || user.email || "Unknown donor",
        email: user.email,
        username: user.username,
        rank: user.currentRank || "Spark",
        totalDonated: money(user.totalDonated),
        role: user.role,
        location,
        createdAt: user.createdAt
      };
    });

    return res.status(200).json({
      stats: {
        totalRevenue: money(totalRevenue),
        causeReserve: money(totalRevenue * 0.6),
        platformReserve: money(totalRevenue * 0.25),
        lotteryReserve: money(totalRevenue * 0.15),
        totalDonors: uniqueDonorIds.size,
        activeCountries: activeCountries.size,
        donationsCount: paidDonations.length,
        tilesCount,
        auditCount
      },
      missionTotals,
      countryTotals: Object.values(countryTotals).sort(
        (a, b) => Number(b.totalDonated || 0) - Number(a.totalDonated || 0)
      ),
      recentDonations,
      topDonors,
      auditTotalsByType,
      recentAuditEntries: recentAuditEntries.map((entry) => ({
        id: entry._id,
        type: entry.type,
        amount: money(entry.amount),
        currency: entry.currency || "USD",
        recipient: entry.recipient || "",
        causeCategory: entry.causeCategory || "Unassigned",
        causeImpact: entry.causeImpact || "",
        cause: entry.cause || "",
        description: entry.description || "",
        proofUrl: entry.proofUrl || "",
        createdAt: entry.createdAt
      })),
      recentSecurityLogs: recentSecurityLogs.map((log) => ({
        id: log._id,
        type: log.type,
        email: log.email || log.userId?.email || "",
        username: log.userId?.username || "",
        displayName: log.userId?.displayName || "",
        role: log.userId?.role || "",
        ipAddress: log.ipAddress || "",
        userAgent: log.userAgent || "",
        details: log.details || {},
        createdAt: log.createdAt
      })),
      health: getAdminHealthChecks(),
      filters: {
        search,
        paymentStatus: paymentStatus || "all",
        mission: mission || "all",
        country: country || "all",
        ...auditFilters
      }
    });
  } catch (error) {
    next(error);
  }
}
