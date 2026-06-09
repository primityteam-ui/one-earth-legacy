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

export async function saveConfirmedDonation({
  email,
  amount,
  currency = "USD",
  amountUSD,
  displayName,
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
      referralCode: crypto.randomUUID().slice(0, 8)
    });
  }

  user.displayName = safeDisplayName || user.displayName;
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