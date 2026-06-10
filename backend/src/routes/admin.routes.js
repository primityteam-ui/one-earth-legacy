import express from "express";

import { exportAdminDonationsCsv, getAdminOverview } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/overview",
  requireAuth,
  requireRole("admin"),
  getAdminOverview
);


router.get(
  "/donations.csv",
  requireAuth,
  requireRole("admin"),
  exportAdminDonationsCsv
);

export default router;
