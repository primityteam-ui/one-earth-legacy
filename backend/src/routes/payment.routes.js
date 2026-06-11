import express from "express";
import {
  createStripeCheckoutSession,
  getStripeCheckoutSessionStatus,
  getStripeConfigStatus,
  stripeCheckoutValidators,
  stripeWebhook
} from "../controllers/payment.controller.js";
import { validateRequest } from "../middleware/validate.js";

const router = express.Router();

router.post(
  "/stripe/create-checkout-session",
  express.json({ limit: "1mb" }),
  stripeCheckoutValidators,
  validateRequest,
  createStripeCheckoutSession
);

router.get(
  "/stripe/config-status",
  getStripeConfigStatus
);

router.get(
  "/stripe/session-status",
  getStripeCheckoutSessionStatus
);

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;