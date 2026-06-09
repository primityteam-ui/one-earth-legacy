import express from "express";
import {
  donationPreviewValidators,
  mockCreateDonation,
  mockCreateDonationValidators,
  previewDonation
} from "../controllers/donation.controller.js";
import { validateRequest } from "../middleware/validate.js";

const router = express.Router();

router.post("/preview", donationPreviewValidators, validateRequest, previewDonation);
router.post("/mock-create", mockCreateDonationValidators, validateRequest, mockCreateDonation);

export default router;