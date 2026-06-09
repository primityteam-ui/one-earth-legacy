import express from "express";
import {
  getAuditEntries,
  getCountryLeaderboard,
  getCurrentEmperor,
  getLeaderboard,
  getPublicProfile,
  getPublicStats,
  getTiles
} from "../controllers/public.controller.js";

const router = express.Router();

router.get("/stats", getPublicStats);
router.get("/tiles", getTiles);
router.get("/leaderboard", getLeaderboard);
router.get("/leaderboard/countries", getCountryLeaderboard);
router.get("/emperor", getCurrentEmperor);
router.get("/audit", getAuditEntries);
router.get("/profiles/:username", getPublicProfile);

export default router;