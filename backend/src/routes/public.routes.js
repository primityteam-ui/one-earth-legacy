import { Router } from "express";

import {
  getAuditEntries,
  getCountryLeaderboard,
  getCurrentEmperor,
  getLeaderboard,
  getPublicProfile,
  getPublicStats,
  getTiles
} from "../controllers/public.controller.js";

import {
  publicCauseFilterValidators,
  validatePublicQuery
} from "../validators/public.validators.js";

const router = Router();

const validatePublicFilters = [
  ...publicCauseFilterValidators,
  validatePublicQuery
];

router.get("/stats", validatePublicFilters, getPublicStats);
router.get("/tiles", validatePublicFilters, getTiles);
router.get("/leaderboard", validatePublicFilters, getLeaderboard);
router.get("/leaderboard/countries", validatePublicFilters, getCountryLeaderboard);
router.get("/audit", validatePublicFilters, getAuditEntries);

router.get("/emperor", getCurrentEmperor);
router.get("/profiles/:username", getPublicProfile);

export default router;