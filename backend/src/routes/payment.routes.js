import express from "express";
import {
  createStripeCheckoutSession,
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

router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;