import { body } from "express-validator";
import crypto from "crypto";

import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Tile from "../models/Tile.js";
import AuditEntry from "../models/AuditEntry.js";

import {
  applyDonationRankToUser,
  calculateDonationPreview,
  createSafeUsername,
  hasVideoTile,
  selectedBorderFromAddOns
} from "../utils/donation.helpers.js";

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
  const preview = calculateDonationPreview(req.body);

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
    const preview = calculateDonationPreview(req.body);
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
    applyDonationRankToUser(user, preview.amountUSD);

    await user.save();

    const tileBorder = selectedBorderFromAddOns(preview.addOns);

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
      tileBorder,
      tileTheme: preview.tile.theme,
      isVideoTile: hasVideoTile(preview.addOns),
      rankAtTime: preview.rank,
      isAnonymous: preview.tile.anonymous,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    const tile = await Tile.create({
      userId: user._id,
      donationId: donation._id,
      message: preview.tile.message,
      borderType: tileBorder,
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