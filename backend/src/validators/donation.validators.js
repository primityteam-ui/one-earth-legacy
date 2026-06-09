import { body } from "express-validator";

export const sharedDonationInputValidators = [
  body("amount")
    .isFloat({ min: 1 })
    .withMessage("Donation amount must be at least 1"),

  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency must be a 3-letter code"),

  body("displayName")
    .optional()
    .isString()
    .isLength({ max: 40 })
    .withMessage("Display name cannot exceed 40 characters"),

  body("message")
    .optional()
    .isString()
    .isLength({ max: 280 })
    .withMessage("Message cannot exceed 280 characters"),

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

export const donationPreviewValidators = [...sharedDonationInputValidators];

export const mockCreateDonationValidators = [
  ...sharedDonationInputValidators,

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required to create mock donation")
];

export const stripeCheckoutValidators = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),

  ...sharedDonationInputValidators
];