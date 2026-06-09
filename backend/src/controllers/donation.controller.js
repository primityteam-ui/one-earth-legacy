import crypto from "crypto";

import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Tile from "../models/Tile.js";
import AuditEntry from "../models/AuditEntry.js";

import {
  donationPreviewValidators,
  mockCreateDonationValidators
} from "../validators/donation.validators.js";

import { buildDonationAuditEntries } from "../utils/audit.helpers.js";

import {
  applyDonationRankToUser,
  calculateDonationPreview,
  createSafeUsername,
  hasVideoTile,
  selectedBorderFromAddOns
} from "../utils/donation.helpers.js";

export { donationPreviewValidators, mockCreateDonationValidators };

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

    await AuditEntry.insertMany(
      buildDonationAuditEntries({
        userId: user._id,
        amountUSD: preview.amountUSD,
        currency: preview.currency,
        displayName: user.displayName,
        anonymous: preview.tile.anonymous,
        causeCategory: preview.causeCategory,
        causeImpact: preview.causeImpact,
        cause: preview.cause,
        split: preview.split,
        paymentMethod: "mock"
      })
    );

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