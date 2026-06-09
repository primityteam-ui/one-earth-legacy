import {
  donationPreviewValidators,
  mockCreateDonationValidators
} from "../validators/donation.validators.js";

import { calculateDonationPreview } from "../utils/donation.helpers.js";

import { saveConfirmedDonation } from "../services/donation.service.js";

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

    const result = await saveConfirmedDonation({
      email,
      amount: preview.amount,
      currency: preview.currency,
      amountUSD: preview.amountUSD,
      displayName: req.body.displayName || email.split("@")[0],
      message: preview.tile.message,
      theme: preview.tile.theme,
      causeCategory: preview.causeCategory,
      causeImpact: preview.causeImpact,
      cause: preview.cause,
      anonymous: preview.tile.anonymous,
      addOns: preview.addOns,
      paymentMethod: "mock",
      settlementStatus: "settled",
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    const { user, donation, tile, split } = result;

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
      split
    });
  } catch (error) {
    next(error);
  }
}