import { body } from "express-validator";
import crypto from "crypto";

import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Tile from "../models/Tile.js";
import AuditEntry from "../models/AuditEntry.js";

const rankTable = [
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

const addOnPrices = {
  animatedBorder: 4.99,
  videoTile: 9.99,
  analytics: 2.99,
  resurrection: 19.99,
  nft: 9.99
};

function getRank(amountUSD) {
  return rankTable.find((rank) => amountUSD >= rank.min && amountUSD <= rank.max) || rankTable[0];
}

function getNextRank(amountUSD) {
  return rankTable.find((rank) => rank.min > amountUSD) || null;
}

function createSafeUsername(email) {
  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .slice(0, 20);

  const suffix = crypto.randomInt(1000, 9999);
  return `${base}_${suffix}`;
}

function normalizeCauseSelection(body) {
  const rawCategory = String(body.causeCategory || "").trim();
  const rawImpact = String(body.causeImpact || "").trim();
  const rawCause = String(body.cause || "").trim();

  let causeCategory = rawCategory;
  let causeImpact = rawImpact;

  if ((!causeCategory || !causeImpact) && rawCause.includes("—")) {
    const parts = rawCause.split("—").map((part) => part.trim());
    causeCategory = causeCategory || parts[0];
    causeImpact = causeImpact || parts.slice(1).join(" — ");
  }

  if (!causeCategory) {
    causeCategory = "Human Survival";
  }

  if (!causeImpact) {
    causeImpact = "Clean Water for Life";
  }

  const cause = `${causeCategory} — ${causeImpact}`;

  return {
    causeCategory,
    causeImpact,
    cause
  };
}

function calculatePreview(body) {
  const amount = Number(body.amount);
  const currency = String(body.currency || "USD").toUpperCase();
  const addOns = Array.isArray(body.addOns) ? body.addOns : [];
  const causeSelection = normalizeCauseSelection(body);

  const amountUSD = amount;

  const addOnDetails = addOns
    .filter((id) => Object.prototype.hasOwnProperty.call(addOnPrices, id))
    .map((id) => ({
      id,
      price: addOnPrices[id]
    }));

  const addOnTotal = addOnDetails.reduce((sum, item) => sum + item.price, 0);
  const totalToday = amountUSD + addOnTotal;

  const currentRank = getRank(amountUSD);
  const nextRank = getNextRank(amountUSD);

  const split = {
    causeAmount: Number((amountUSD * 0.6).toFixed(2)),
    platformAmount: Number((amountUSD * 0.25).toFixed(2)),
    lotteryAmount: Number((amountUSD * 0.15).toFixed(2))
  };

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

export const donationPreviewValidators = [
  body("amount")
    .isFloat({ min: 1 })
    .withMessage("Donation amount must be at least 1"),

  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),

  body("message")
    .optional()
    .isString()
    .isLength({ max: 280 })
    .withMessage("Message cannot exceed 280 characters"),

  body("displayName")
    .optional()
    .isString()
    .isLength({ max: 40 })
    .withMessage("Display name cannot exceed 40 characters"),

  body("theme")
    .optional()
    .isString()
    .isLength({ max: 30 })
    .withMessage("Theme is invalid"),

  body("causeCategory")
    .optional()
    .isString()
    .isLength({ max: 80 })
    .withMessage("Cause category is invalid"),

  body("causeImpact")
    .optional()
    .isString()
    .isLength({ max: 120 })
    .withMessage("Cause impact is invalid"),

  body("cause")
    .optional()
    .isString()
    .isLength({ max: 220 })
    .withMessage("Cause is invalid"),

  body("anonymous")
    .optional()
    .isBoolean()
    .withMessage("Anonymous must be true or false"),

  body("addOns")
    .optional()
    .isArray()
    .withMessage("Add-ons must be an array")
];

export async function previewDonation(req, res) {
  const preview = calculatePreview(req.body);

  res.status(200).json({
    preview: {
      ...preview,
      paymentStatus: "preview_only",
      note: "Stripe and Razorpay checkout will be connected in the next backend payment step."
    }
  });
}

export const mockCreateDonationValidators = [
  ...donationPreviewValidators,

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required to create mock donation")
];

export async function mockCreateDonation(req, res, next) {
  try {
    const preview = calculatePreview(req.body);
    const email = req.body.email.toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        username: createSafeUsername(email),
        displayName: req.body.displayName || email.split("@")[0],
        referralCode: crypto.randomUUID().slice(0, 8)
      });
    }

    user.displayName = req.body.displayName || user.displayName;
    user.totalDonated = Number((Number(user.totalDonated || 0) + preview.amountUSD).toFixed(2));
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

    await user.save();

    const donation = await Donation.create({
      userId: user._id,
      amount: preview.amount,
      currency: preview.currency,
      amountUSD: preview.amountUSD,
      causeCategory: preview.causeCategory,
      causeImpact: preview.causeImpact,
      cause: preview.cause,
      paymentMethod: "mock",
      paymentId: `mock_${crypto.randomUUID()}`,
      paymentStatus: "paid",
      settlementStatus: "settled",
      tileMessage: preview.tile.message,
      tileBorder: selectedBorderFromAddOns(preview.addOns),
      tileTheme: preview.tile.theme,
      isVideoTile: preview.addOns.some((item) => item.id === "videoTile"),
      rankAtTime: preview.rank,
      isAnonymous: preview.tile.anonymous,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    const tile = await Tile.create({
      userId: user._id,
      donationId: donation._id,
      message: preview.tile.message,
      borderType: selectedBorderFromAddOns(preview.addOns),
      themeColor: preview.tile.theme,
      sizeScore: Math.max(1, Math.log10(preview.amountUSD + 1)),
      isFeatured: preview.amountUSD >= 1000
    });

    await AuditEntry.insertMany([
      {
        type: "donation_received",
        amount: preview.amountUSD,
        currency: preview.currency,
        recipient: "One Earth Legacy",
        causeCategory: preview.causeCategory,
        causeImpact: preview.causeImpact,
        cause: preview.cause,
        description: `Mock donation received from ${preview.tile.anonymous ? "Anonymous" : user.displayName}.`,
        initiatedBy: user._id
      },
      {
        type: "cause_allocation",
        amount: preview.split.causeAmount,
        currency: preview.currency,
        recipient: preview.cause,
        causeCategory: preview.causeCategory,
        causeImpact: preview.causeImpact,
        cause: preview.cause,
        description: "60% allocation reserved for verified global cause payout.",
        initiatedBy: user._id
      },
      {
        type: "platform_allocation",
        amount: preview.split.platformAmount,
        currency: preview.currency,
        recipient: "Platform operations",
        causeCategory: preview.causeCategory,
        causeImpact: preview.causeImpact,
        cause: preview.cause,
        description: "25% allocation reserved for hosting, security, monitoring, and platform sustainability.",
        initiatedBy: user._id
      },
      {
        type: "lottery_allocation",
        amount: preview.split.lotteryAmount,
        currency: preview.currency,
        recipient: "Monthly donor lottery",
        causeCategory: preview.causeCategory,
        causeImpact: preview.causeImpact,
        cause: preview.cause,
        description: "15% allocation added to monthly donor prize pool.",
        initiatedBy: user._id
      }
    ]);

    res.status(201).json({
      message: "Mock donation saved to MongoDB",
      donation: {
        id: donation._id,
        amountUSD: donation.amountUSD,
        causeCategory: donation.causeCategory,
        causeImpact: donation.causeImpact,
        cause: donation.cause,
        rankAtTime: donation.rankAtTime,
        paymentStatus: donation.paymentStatus,
        settlementStatus: donation.settlementStatus
      },
      tile: {
        id: tile._id,
        message: tile.message,
        themeColor: tile.themeColor,
        sizeScore: tile.sizeScore
      },
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        totalDonated: user.totalDonated,
        currentRank: user.currentRank,
        role: user.role
      },
      split: preview.split
    });
  } catch (error) {
    next(error);
  }
}

function selectedBorderFromAddOns(addOns) {
  return addOns.some((item) => item.id === "animatedBorder") ? "animated" : "standard";
}