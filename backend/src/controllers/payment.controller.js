import Stripe from "stripe";
import crypto from "crypto";

import User from "../models/User.js";
import Donation from "../models/Donation.js";
import Tile from "../models/Tile.js";
import AuditEntry from "../models/AuditEntry.js";

import { stripeCheckoutValidators } from "../validators/donation.validators.js";

import {
  applyDonationRankToUser,
  calculateMoneySplit,
  calculateTotalAmount,
  createSafeUsername,
  getRank,
  hasVideoTile,
  normalizeCauseSelection,
  parseAddOnsFromMetadata,
  selectedBorderFromAddOns
} from "../utils/donation.helpers.js";

export { stripeCheckoutValidators };

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
        anonymous: String(Boolean(req.body.anonymous)),
        addOns: JSON.stringify(req.body.addOns || [])
      }
    });

    return res.status(200).json({
      checkoutUrl: session.url,
      sessionId: session.id,
      amount: totalAmount,
      currency: currency.toUpperCase()
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

  if (!amountUSD || amountUSD <= 0) {
    throw new Error("Donation amount is missing or invalid");
  }

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      username: createSafeUsername(email),
      displayName,
      referralCode: crypto.randomUUID().slice(0, 8)
    });
  }

  user.displayName = displayName || user.displayName;
  applyDonationRankToUser(user, amountUSD);

  await user.save();

  const rankAtTime = getRank(amountUSD).name;
  const tileBorder = selectedBorderFromAddOns(addOns);

  const donation = await Donation.create({
    userId: user._id,
    amount: amountUSD,
    currency,
    amountUSD,
    causeCategory: causeSelection.causeCategory,
    causeImpact: causeSelection.causeImpact,
    cause: causeSelection.cause,
    paymentMethod: "stripe",
    paymentId: session.id,
    paymentStatus: "paid",
    settlementStatus: "settled",
    tileMessage: message,
    tileBorder,
    tileTheme: theme,
    isVideoTile: hasVideoTile(addOns),
    rankAtTime,
    isAnonymous: anonymous
  });

  const tile = await Tile.create({
    userId: user._id,
    donationId: donation._id,
    message,
    borderType: tileBorder,
    themeColor: theme,
    sizeScore: Math.max(1, Math.log10(amountUSD + 1)),
    isFeatured: amountUSD >= 1000
  });

  const split = calculateMoneySplit(amountUSD);

  await AuditEntry.insertMany([
    {
      type: "donation_received",
      amount: amountUSD,
      currency,
      recipient: "One Earth Legacy",
      causeCategory: causeSelection.causeCategory,
      causeImpact: causeSelection.causeImpact,
      cause: causeSelection.cause,
      description: `Stripe donation received from ${anonymous ? "Anonymous" : user.displayName}.`,
      initiatedBy: user._id
    },
    {
      type: "cause_allocation",
      amount: split.causeAmount,
      currency,
      recipient: causeSelection.cause,
      causeCategory: causeSelection.causeCategory,
      causeImpact: causeSelection.causeImpact,
      cause: causeSelection.cause,
      description: "60% allocation reserved for verified global cause payout.",
      initiatedBy: user._id
    },
    {
      type: "platform_allocation",
      amount: split.platformAmount,
      currency,
      recipient: "Platform operations",
      causeCategory: causeSelection.causeCategory,
      causeImpact: causeSelection.causeImpact,
      cause: causeSelection.cause,
      description: "25% allocation reserved for hosting, security, monitoring, and platform sustainability.",
      initiatedBy: user._id
    },
    {
      type: "lottery_allocation",
      amount: split.lotteryAmount,
      currency,
      recipient: "Monthly donor lottery",
      causeCategory: causeSelection.causeCategory,
      causeImpact: causeSelection.causeImpact,
      cause: causeSelection.cause,
      description: "15% allocation added to monthly donor prize pool.",
      initiatedBy: user._id
    }
  ]);

  console.log("Stripe paid donation saved:", {
    sessionId: session.id,
    donationId: donation._id.toString(),
    tileId: tile._id.toString(),
    email,
    amountUSD,
    causeCategory: causeSelection.causeCategory,
    causeImpact: causeSelection.causeImpact,
    cause: causeSelection.cause
  });

  return donation;
}