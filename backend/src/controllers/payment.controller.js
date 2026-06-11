import Stripe from "stripe";

import Donation from "../models/Donation.js";

import { stripeCheckoutValidators } from "../validators/donation.validators.js";

import {
  calculateTotalAmount,
  normalizeCauseSelection,
  parseAddOnsFromMetadata
} from "../utils/donation.helpers.js";

import { saveConfirmedDonation } from "../services/donation.service.js";

export { stripeCheckoutValidators };

function getStripeMode() {
  const secretKey = process.env.STRIPE_SECRET_KEY || "";

  if (secretKey.startsWith("sk_live_")) {
    return "live";
  }

  if (secretKey.startsWith("sk_test_")) {
    return "test";
  }

  return "unknown";
}

function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is missing. Check backend/.env");
  }

  if (!secretKey.startsWith("sk_test_") && !secretKey.startsWith("sk_live_")) {
    throw new Error("STRIPE_SECRET_KEY must start with sk_test_ or sk_live_");
  }

  return new Stripe(secretKey);
}

function buildLocationPayloadFromMetadata(metadata = {}) {
  return {
    country: metadata.country || "United States",
    countryCode: metadata.countryCode || "US",
    donorCity: metadata.donorCity || "",
    donorRegion: metadata.donorRegion || "",
    donorLat: metadata.donorLat ? Number(metadata.donorLat) : undefined,
    donorLng: metadata.donorLng ? Number(metadata.donorLng) : undefined,
    donorLocationPrecision: metadata.donorLocationPrecision || "country",
    donorLocationSource: metadata.donorLocationSource || "manual"
  };
}

function assertStripeSessionIsSafe(session) {
  if (!session) {
    throw new Error("Stripe session is missing");
  }

  if (session.mode !== "payment") {
    throw new Error(`Invalid Stripe session mode: ${session.mode}`);
  }

  if (session.payment_status !== "paid") {
    throw new Error(`Stripe payment is not paid yet. Current status: ${session.payment_status}`);
  }

  const metadata = session.metadata || {};
  const expectedTotal = Number(metadata.totalCharged || 0);
  const stripeAmountTotal = Number(session.amount_total || 0) / 100;

  if (!expectedTotal || expectedTotal <= 0) {
    throw new Error("Stripe metadata totalCharged is missing or invalid");
  }

  if (Number(stripeAmountTotal.toFixed(2)) !== Number(expectedTotal.toFixed(2))) {
    throw new Error(
      `Stripe amount mismatch. Stripe=${stripeAmountTotal}, Metadata=${expectedTotal}`
    );
  }

  if (!metadata.email && !session.customer_email) {
    throw new Error("Stripe session is missing customer email");
  }
}

export async function createStripeCheckoutSession(req, res, next) {
  try {
    const stripe = getStripeClient();

    const totalAmount = calculateTotalAmount(req.body);
    const currency = String(req.body.currency || "USD").toLowerCase();
    const causeSelection = normalizeCauseSelection(req.body);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: req.body.email,
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: "One Earth Legacy Donation",
              description: "Legacy tile donation and selected add-ons"
            },
            unit_amount: Math.round(totalAmount * 100)
          },
          quantity: 1
        }
      ],
      success_url: process.env.STRIPE_SUCCESS_URL || "http://localhost:5173/donate/success",
      cancel_url: process.env.STRIPE_CANCEL_URL || "http://localhost:5173/donate",
      metadata: {
        email: req.body.email,
        donationAmount: String(Number(req.body.amount || 0)),
        totalCharged: String(totalAmount),
        currency: String(req.body.currency || "USD").toUpperCase(),
        displayName: req.body.displayName || "",
        message: req.body.message || "",
        theme: req.body.theme || "Gold",
        causeCategory: causeSelection.causeCategory,
        causeImpact: causeSelection.causeImpact,
        cause: causeSelection.cause,
        country: req.body.country || "United States",
        countryCode: req.body.countryCode || "US",
        donorCity: req.body.donorCity || "",
        donorRegion: req.body.donorRegion || "",
        donorLat:
          req.body.donorLat === undefined || req.body.donorLat === null
            ? ""
            : String(req.body.donorLat),
        donorLng:
          req.body.donorLng === undefined || req.body.donorLng === null
            ? ""
            : String(req.body.donorLng),
        donorLocationPrecision: req.body.donorLocationPrecision || "country",
        donorLocationSource: req.body.donorLocationSource || "manual",
        anonymous: String(Boolean(req.body.anonymous)),
        addOns: JSON.stringify(req.body.addOns || [])
      }
    });

    return res.status(200).json({
      checkoutUrl: session.url,
      sessionId: session.id,
      amount: totalAmount,
      currency: currency.toUpperCase(),
      stripeMode: getStripeMode(),
      safetyNote:
        getStripeMode() === "live"
          ? "Live Stripe key detected. Confirm production readiness before accepting payments."
          : "Stripe test mode detected."
    });
  } catch (error) {
    return next(error);
  }
}

export async function stripeWebhook(req, res) {
  let stripe;

  try {
    stripe = getStripeClient();
  } catch (error) {
    console.error("Stripe client setup failed:", error.message);
    return res.status(500).json({
      message: "Stripe configuration error"
    });
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET === "temporary_later") {
    return res.status(400).json({
      message: "Stripe webhook secret is missing"
    });
  }

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({
      message: "Stripe signature header is missing"
    });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      assertStripeSessionIsSafe(session);
      await saveStripeDonation(session);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error("Stripe webhook save failed:", error.message);

    return res.status(500).json({
      message: "Webhook received but database save failed"
    });
  }
}

async function saveStripeDonation(session) {
  assertStripeSessionIsSafe(session);

  const existingDonation = await Donation.findOne({
    paymentId: session.id
  });

  if (existingDonation) {
    console.log("Stripe donation already saved:", session.id);
    return existingDonation;
  }

  const metadata = session.metadata || {};

  const email = String(metadata.email || session.customer_email || "").toLowerCase();

  if (!email) {
    throw new Error("Stripe session missing email");
  }

  const amountUSD = Number(metadata.donationAmount || 0);
  const currency = String(metadata.currency || "USD").toUpperCase();
  const displayName = metadata.displayName || email.split("@")[0];
  const message = metadata.message || "";
  const theme = metadata.theme || "Gold";
  const causeSelection = normalizeCauseSelection(metadata);
  const anonymous = metadata.anonymous === "true";
  const addOns = parseAddOnsFromMetadata(metadata);
  const location = buildLocationPayloadFromMetadata(metadata);

  if (!amountUSD || amountUSD <= 0) {
    throw new Error("Donation amount is missing or invalid");
  }

  const result = await saveConfirmedDonation({
    email,
    amount: amountUSD,
    currency,
    amountUSD,
    displayName,
    ...location,
    message,
    theme,
    causeCategory: causeSelection.causeCategory,
    causeImpact: causeSelection.causeImpact,
    cause: causeSelection.cause,
    anonymous,
    addOns,
    paymentMethod: "stripe",
    paymentId: session.id,
    settlementStatus: "settled"
  });

  if (result.alreadyExists) {
    console.log("Stripe donation already saved:", session.id);
    return result.donation;
  }

  console.log("Stripe paid donation saved:", {
    sessionId: session.id,
    donationId: result.donation._id.toString(),
    tileId: result.tile._id.toString(),
    email,
    amountUSD,
    causeCategory: causeSelection.causeCategory,
    causeImpact: causeSelection.causeImpact,
    cause: causeSelection.cause
  });

  return result.donation;
}