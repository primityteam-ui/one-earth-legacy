import express from "express";

import { createAdminAuditEntry, exportAdminDonationsCsv, getAdminDonationDetail, getAdminOverview } from "../controllers/admin.controller.js";
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


router.get(
  "/donations/:donationId",
  requireAuth,
  requireRole("admin"),
  getAdminDonationDetail
);


router.post(
  "/audit",
  requireAuth,
  requireRole("admin"),
  createAdminAuditEntry
);

export default router;
