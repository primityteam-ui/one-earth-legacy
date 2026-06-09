import express from "express";

import {
  donationPreviewValidators,
  mockCreateDonation,
  mockCreateDonationValidators,
  previewDonation
} from "../controllers/donation.controller.js";

import { validateRequest } from "../middleware/validate.js";

const router = express.Router();

function blockMockDonationsInProduction(req, res, next) {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({
      success: false,
      message: "Mock donation creation is disabled in production. Please use Stripe checkout."
    });
  }

  return next();
}

router.post(
  "/preview",
  donationPreviewValidators,
  validateRequest,
  previewDonation
);

router.post(
  "/mock-create",
  blockMockDonationsInProduction,
  mockCreateDonationValidators,
  validateRequest,
  mockCreateDonation
);

export default router;