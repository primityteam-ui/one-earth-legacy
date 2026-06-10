import { body } from "express-validator";

import {
  defaultCauseCategory,
  defaultCauseImpact,
  getApprovedAddOnIds,
  getApprovedMissionNames,
  isApprovedAddOnId,
  isApprovedImpactForMission,
  isApprovedMission
} from "../constants/legacyOptions.js";

const approvedCountryMap = {
  US: "United States",
  IN: "India",
  BR: "Brazil",
  IT: "Italy",
  JP: "Japan",
  KR: "South Korea",
  CA: "Canada",
  NG: "Nigeria",
  AU: "Australia",
  KE: "Kenya",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  ES: "Spain",
  CN: "China",
  SG: "Singapore",
  ZA: "South Africa",
  EG: "Egypt",
  AE: "United Arab Emirates"
};

function getRequestedCauseCategory(req) {
  return String(req.body.causeCategory || defaultCauseCategory).trim();
}

function getRequestedCauseImpact(req) {
  return String(req.body.causeImpact || defaultCauseImpact).trim();
}

function validateCauseCategory(value) {
  const causeCategory = String(value || defaultCauseCategory).trim();

  if (!isApprovedMission(causeCategory)) {
    throw new Error(
      `Cause category must be one of: ${getApprovedMissionNames().join(", ")}`
    );
  }

  return true;
}

function validateCauseImpact(value, { req }) {
  const causeCategory = getRequestedCauseCategory(req);
  const causeImpact = String(value || defaultCauseImpact).trim();

  if (!isApprovedImpactForMission(causeCategory, causeImpact)) {
    throw new Error(
      `Cause impact is not valid for ${causeCategory}`
    );
  }

  return true;
}

function validateCauseText(value, { req }) {
  const causeCategory = getRequestedCauseCategory(req);
  const causeImpact = getRequestedCauseImpact(req);
  const cause = String(value || `${causeCategory} — ${causeImpact}`).trim();

  if (!cause.includes(causeCategory) || !cause.includes(causeImpact)) {
    throw new Error("Cause must match the selected category and impact");
  }

  return true;
}

function validateAddOns(addOns) {
  if (!Array.isArray(addOns)) {
    return true;
  }

  const invalidAddOns = addOns.filter((addOnId) => {
    return typeof addOnId !== "string" || !isApprovedAddOnId(addOnId);
  });

  if (invalidAddOns.length > 0) {
    throw new Error(
      `Invalid add-on selected. Approved add-ons are: ${getApprovedAddOnIds().join(", ")}`
    );
  }

  return true;
}

function validateCountryCode(value) {
  const countryCode = String(value || "US").trim().toUpperCase();

  if (!approvedCountryMap[countryCode]) {
    throw new Error(
      `Country code must be one of: ${Object.keys(approvedCountryMap).join(", ")}`
    );
  }

  return true;
}

function validateCountry(value, { req }) {
  const countryCode = String(req.body.countryCode || "US").trim().toUpperCase();
  const expectedCountry = approvedCountryMap[countryCode];
  const country = String(value || expectedCountry || "United States").trim();

  if (!expectedCountry) {
    throw new Error("Country code is invalid");
  }

  if (country !== expectedCountry) {
    throw new Error(`Country must match selected country code ${countryCode}`);
  }

  return true;
}

function validateDonorLat(value) {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < -90 || number > 90) {
    throw new Error("Latitude must be between -90 and 90");
  }

  return true;
}

function validateDonorLng(value) {
  if (value === undefined || value === null || value === "") {
    return true;
  }

  const number = Number(value);

  if (!Number.isFinite(number) || number < -180 || number > 180) {
    throw new Error("Longitude must be between -180 and 180");
  }

  return true;
}

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

  body("countryCode")
    .optional()
    .isString()
    .isLength({ min: 2, max: 2 })
    .withMessage("Country code must be 2 letters")
    .custom(validateCountryCode),

  body("country")
    .optional()
    .isString()
    .isLength({ max: 80 })
    .withMessage("Country is invalid")
    .custom(validateCountry),

  body("donorCity")
    .optional()
    .isString()
    .isLength({ max: 80 })
    .withMessage("City cannot exceed 80 characters"),

  body("donorRegion")
    .optional()
    .isString()
    .isLength({ max: 80 })
    .withMessage("Region cannot exceed 80 characters"),

  body("donorLat")
    .optional()
    .custom(validateDonorLat),

  body("donorLng")
    .optional()
    .custom(validateDonorLng),

  body("donorLocationPrecision")
    .optional()
    .isIn(["country", "city", "approximate"])
    .withMessage("Location precision is invalid"),

  body("donorLocationSource")
    .optional()
    .isIn(["manual", "browser", "default"])
    .withMessage("Location source is invalid"),

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
    .withMessage("Cause category is invalid")
    .custom(validateCauseCategory),

  body("causeImpact")
    .optional()
    .isString()
    .isLength({ max: 120 })
    .withMessage("Cause impact is invalid")
    .custom(validateCauseImpact),

  body("cause")
    .optional()
    .isString()
    .isLength({ max: 220 })
    .withMessage("Cause is invalid")
    .custom(validateCauseText),

  body("anonymous")
    .optional()
    .isBoolean()
    .withMessage("Anonymous must be true or false"),

  body("addOns")
    .optional()
    .isArray()
    .withMessage("Add-ons must be an array")
    .custom(validateAddOns)
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