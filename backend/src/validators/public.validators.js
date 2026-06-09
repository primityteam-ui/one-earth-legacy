import { query, validationResult } from "express-validator";

import {
  getApprovedImpactNames,
  getApprovedMissionNames,
  isApprovedImpactForMission,
  isApprovedMission
} from "../constants/legacyOptions.js";

function cleanValue(value) {
  return String(value || "").trim();
}

function getRequestedMission(req) {
  return cleanValue(req.query.mission || req.query.causeCategory);
}

function getRequestedImpact(req) {
  return cleanValue(req.query.impact || req.query.causeImpact);
}

function validatePublicMission(value) {
  const mission = cleanValue(value);

  if (!mission) {
    return true;
  }

  if (!isApprovedMission(mission)) {
    throw new Error(
      `Mission must be one of: ${getApprovedMissionNames().join(", ")}`
    );
  }

  return true;
}

function validatePublicImpact(value, { req }) {
  const mission = getRequestedMission(req);
  const impact = cleanValue(value);

  if (!impact) {
    return true;
  }

  if (mission) {
    if (!isApprovedImpactForMission(mission, impact)) {
      throw new Error(`Impact is not valid for ${mission}`);
    }

    return true;
  }

  if (!getApprovedImpactNames().includes(impact)) {
    throw new Error(
      `Impact must be one of: ${getApprovedImpactNames().join(", ")}`
    );
  }

  return true;
}

function validatePublicCause(value, { req }) {
  const cause = cleanValue(value);

  if (!cause) {
    return true;
  }

  if (!cause.includes("—")) {
    throw new Error("Cause must use format: Mission — Impact");
  }

  const [missionPart, ...impactParts] = cause.split("—");
  const mission = cleanValue(missionPart);
  const impact = cleanValue(impactParts.join("—"));

  if (!isApprovedMission(mission)) {
    throw new Error(
      `Cause mission must be one of: ${getApprovedMissionNames().join(", ")}`
    );
  }

  if (!isApprovedImpactForMission(mission, impact)) {
    throw new Error(`Cause impact is not valid for ${mission}`);
  }

  const queryMission = getRequestedMission(req);
  const queryImpact = getRequestedImpact(req);

  if (queryMission && queryMission !== mission) {
    throw new Error("Cause does not match mission query");
  }

  if (queryImpact && queryImpact !== impact) {
    throw new Error("Cause does not match impact query");
  }

  return true;
}

export const publicCauseFilterValidators = [
  query("mission")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 80 })
    .withMessage("Mission filter is too long")
    .custom(validatePublicMission),

  query("causeCategory")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 80 })
    .withMessage("Cause category filter is too long")
    .custom(validatePublicMission),

  query("impact")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 120 })
    .withMessage("Impact filter is too long")
    .custom(validatePublicImpact),

  query("causeImpact")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 120 })
    .withMessage("Cause impact filter is too long")
    .custom(validatePublicImpact),

  query("cause")
    .optional({ checkFalsy: true })
    .isString()
    .trim()
    .isLength({ max: 220 })
    .withMessage("Cause filter is too long")
    .custom(validatePublicCause)
];

export function validatePublicQuery(req, res, next) {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({
    message: "Invalid public filter query",
    errors: errors.array().map((error) => ({
      field: error.path,
      value: error.value,
      message: error.msg
    }))
  });
}