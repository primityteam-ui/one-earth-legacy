import crypto from "crypto";

import {
  addOnPrices,
  defaultCauseCategory,
  defaultCauseImpact,
  rankTable
} from "../constants/legacyOptions.js";

export function getRank(amountUSD) {
  return rankTable.find((rank) => amountUSD >= rank.min && amountUSD <= rank.max) || rankTable[0];
}

export function getNextRank(amountUSD) {
  return rankTable.find((rank) => rank.min > amountUSD) || null;
}

export function createSafeUsername(email) {
  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .slice(0, 20);

  const suffix = crypto.randomInt(1000, 9999);
  return `${base}_${suffix}`;
}

export function normalizeCauseSelection(source = {}) {
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

  return {
    causeCategory,
    causeImpact,
    cause: `${causeCategory} — ${causeImpact}`
  };
}

export function normalizeAddOns(addOns) {
  return Array.isArray(addOns) ? addOns : [];
}

export function getAddOnDetails(addOns) {
  return normalizeAddOns(addOns)
    .filter((id) => Object.prototype.hasOwnProperty.call(addOnPrices, id))
    .map((id) => ({
      id,
      price: addOnPrices[id]
    }));
}

export function calculateAddOnTotal(addOns) {
  return getAddOnDetails(addOns).reduce((sum, item) => sum + item.price, 0);
}

export function calculateTotalAmount(body = {}) {
  const donationAmount = Number(body.amount || 0);
  const addOnTotal = calculateAddOnTotal(body.addOns);

  return Number((donationAmount + addOnTotal).toFixed(2));
}

export function calculateMoneySplit(amountUSD) {
  return {
    causeAmount: Number((amountUSD * 0.6).toFixed(2)),
    platformAmount: Number((amountUSD * 0.25).toFixed(2)),
    lotteryAmount: Number((amountUSD * 0.15).toFixed(2))
  };
}

export function selectedBorderFromAddOns(addOns) {
  return normalizeAddOns(addOns).some((item) => {
    if (typeof item === "string") {
      return item === "animatedBorder";
    }

    return item?.id === "animatedBorder";
  })
    ? "animated"
    : "standard";
}

export function hasVideoTile(addOns) {
  return normalizeAddOns(addOns).some((item) => {
    if (typeof item === "string") {
      return item === "videoTile";
    }

    return item?.id === "videoTile";
  });
}

export function parseAddOnsFromMetadata(metadata = {}) {
  try {
    const parsed = JSON.parse(metadata.addOns || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function calculateDonationPreview(body = {}) {
  const amount = Number(body.amount);
  const currency = String(body.currency || "USD").toUpperCase();
  const addOns = normalizeAddOns(body.addOns);
  const addOnDetails = getAddOnDetails(addOns);
  const addOnTotal = addOnDetails.reduce((sum, item) => sum + item.price, 0);
  const amountUSD = amount;
  const totalToday = amountUSD + addOnTotal;
  const currentRank = getRank(amountUSD);
  const nextRank = getNextRank(amountUSD);
  const causeSelection = normalizeCauseSelection(body);
  const split = calculateMoneySplit(amountUSD);

  return {
    amount,
    currency,
    amountUSD,
    causeCategory: causeSelection.causeCategory,
    causeImpact: causeSelection.causeImpact,
    cause: causeSelection.cause,
    addOns: addOnDetails,
    addOnTotal: Number(addOnTotal.toFixed(2)),
    totalToday: Number(totalToday.toFixed(2)),
    rank: currentRank.name,
    nextRank: nextRank
      ? {
          name: nextRank.name,
          amountNeeded: Number((nextRank.min - amountUSD).toFixed(2))
        }
      : null,
    split,
    tile: {
      displayName: body.displayName || "Anonymous Donor",
      message: body.message || "",
      theme: body.theme || "Gold",
      causeCategory: causeSelection.causeCategory,
      causeImpact: causeSelection.causeImpact,
      cause: causeSelection.cause,
      anonymous: Boolean(body.anonymous)
    }
  };
}

export function applyDonationRankToUser(user, amountUSD) {
  user.totalDonated = Number((Number(user.totalDonated || 0) + amountUSD).toFixed(2));
  user.currentRank = getRank(user.totalDonated).name;

  if (user.totalDonated >= 1000 && user.role === "user") {
    user.role = "lord_plus";
  }

  if (user.totalDonated >= 1000000) {
    user.role = "emperor";
  }

  user.rankHistory.push({
    rank: user.currentRank,
    totalDonated: user.totalDonated,
    changedAt: new Date()
  });

  return user;
}