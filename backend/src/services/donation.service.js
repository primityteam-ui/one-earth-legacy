import crypto from "crypto";

import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Tile from "../models/Tile.js";
import AuditEntry from "../models/AuditEntry.js";

import { buildDonationAuditEntries } from "../utils/audit.helpers.js";

import {
  applyDonationRankToUser,
  calculateMoneySplit,
  createSafeUsername,
  getRank,
  hasVideoTile,
  selectedBorderFromAddOns
} from "../utils/donation.helpers.js";

const approvedCountries = {
  US: "United States",
  IN: "India",
  BR: "Brazil",
  IT: "Italy",
  JP: "Japan",
  KR: "South Korea",
  CA: "Canada",
  NG: "Nigeria",
  AU: "Australia",
  KE: "Kenya",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  CN: "China",
  SG: "Singapore",
  ZA: "South Africa",
  EG: "Egypt",
  AE: "United Arab Emirates"
};

function normalizeDonationCountry(country, countryCode) {
  const safeCountryCode = String(countryCode || "US").trim().toUpperCase();
  const approvedCountry = approvedCountries[safeCountryCode];

  if (!approvedCountry) {
    return {
      country: "United States",
      countryCode: "US"
    };
  }

  return {
    country: approvedCountry,
    countryCode: safeCountryCode
  };
}

function roundCoordinate(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return undefined;
  }

  return Number(number.toFixed(2));
}

function normalizeDonorLocation({
  country,
  countryCode,
  donorCity = "",
  donorRegion = "",
  donorLat,
  donorLng,
  donorLocationPrecision = "country",
  donorLocationSource = "manual"
}) {
  const safeCountry = normalizeDonationCountry(country, countryCode);

  const safeLat = roundCoordinate(donorLat);
  const safeLng = roundCoordinate(donorLng);

  const hasCoordinates =
    Number.isFinite(safeLat) &&
    safeLat >= -90 &&
    safeLat <= 90 &&
    Number.isFinite(safeLng) &&
    safeLng >= -180 &&
    safeLng <= 180;

  const safeCity = String(donorCity || "").trim().slice(0, 80);
  const safeRegion = String(donorRegion || "").trim().slice(0, 80);

  let precision = "country";

  if (hasCoordinates) {
    precision = "approximate";
  } else if (safeCity) {
    precision = "city";
  }

  const requestedPrecision = String(donorLocationPrecision || precision).trim();

  if (["country", "city", "approximate"].includes(requestedPrecision)) {
    precision = requestedPrecision === "approximate" && !hasCoordinates
      ? precision
      : requestedPrecision;
  }

  const source = ["manual", "browser", "default"].includes(donorLocationSource)
    ? donorLocationSource
    : "manual";

  return {
    city: safeCity,
    region: safeRegion,
    country: safeCountry.country,
    countryCode: safeCountry.countryCode,
    lat: hasCoordinates ? safeLat : undefined,
    lng: hasCoordinates ? safeLng : undefined,
    precision,
    source,
    updatedAt: new Date()
  };
}

export async function saveConfirmedDonation({
  email,
  amount,
  currency = "USD",
  amountUSD,
  displayName,
  country = "United States",
  countryCode = "US",
  donorCity = "",
  donorRegion = "",
  donorLat,
  donorLng,
  donorLocationPrecision = "country",
  donorLocationSource = "manual",
  message = "",
  theme = "Gold",
  causeCategory,
  causeImpact,
  cause,
  anonymous = false,
  addOns = [],
  paymentMethod = "mock",
  paymentId,
  settlementStatus = "settled",
  ipAddress,
  userAgent
}) {
  const normalizedEmail = String(email || "").toLowerCase().trim();

  if (!normalizedEmail) {
    throw new Error("Email is required to save donation");
  }

  const safeAmountUSD = Number(amountUSD || amount || 0);

  if (!safeAmountUSD || safeAmountUSD <= 0) {
    throw new Error("Donation amount is missing or invalid");
  }

  const safeCurrency = String(currency || "USD").toUpperCase();
  const safeDisplayName = displayName || normalizedEmail.split("@")[0];
  const safePaymentId = paymentId || `${paymentMethod}_${crypto.randomUUID()}`;
  const safeLocation = normalizeDonorLocation({
    country,
    countryCode,
    donorCity,
    donorRegion,
    donorLat,
    donorLng,
    donorLocationPrecision,
    donorLocationSource
  });

  const existingDonation = await Donation.findOne({
    paymentId: safePaymentId
  });

  if (existingDonation) {
    return {
      alreadyExists: true,
      donation: existingDonation
    };
  }

  let user = await User.findOne({
    email: normalizedEmail
  });

  if (!user) {
    user = await User.create({
      email: normalizedEmail,
      username: createSafeUsername(normalizedEmail),
      displayName: safeDisplayName,
      country: safeLocation.country,
      countryCode: safeLocation.countryCode,
      donorLocation: safeLocation,
      referralCode: crypto.randomUUID().slice(0, 8)
    });
  }

  user.displayName = safeDisplayName || user.displayName;
  user.country = safeLocation.country;
  user.countryCode = safeLocation.countryCode;
  user.donorLocation = safeLocation;

  applyDonationRankToUser(user, safeAmountUSD);

  await user.save();

  const rankAtTime = getRank(safeAmountUSD).name;
  const tileBorder = selectedBorderFromAddOns(addOns);
  const split = calculateMoneySplit(safeAmountUSD);

  const donation = await Donation.create({
    userId: user._id,
    amount: Number(amount || safeAmountUSD),
    currency: safeCurrency,
    amountUSD: safeAmountUSD,
    causeCategory,
    causeImpact,
    cause,
    paymentMethod,
    paymentId: safePaymentId,
    paymentStatus: "paid",
    settlementStatus,
    tileMessage: message,
    tileBorder,
    tileTheme: theme,
    isVideoTile: hasVideoTile(addOns),
    rankAtTime,
    isAnonymous: Boolean(anonymous),
    ipAddress,
    userAgent
  });

  const tile = await Tile.create({
    userId: user._id,
    donationId: donation._id,
    message,
    borderType: tileBorder,
    themeColor: theme,
    sizeScore: Math.max(1, Math.log10(safeAmountUSD + 1)),
    isFeatured: safeAmountUSD >= 1000
  });

  await AuditEntry.insertMany(
    buildDonationAuditEntries({
      userId: user._id,
      amountUSD: safeAmountUSD,
      currency: safeCurrency,
      displayName: user.displayName,
      anonymous: Boolean(anonymous),
      causeCategory,
      causeImpact,
      cause,
      split,
      paymentMethod
    })
  );

  return {
    alreadyExists: false,
    user,
    donation,
    tile,
    split
  };
}