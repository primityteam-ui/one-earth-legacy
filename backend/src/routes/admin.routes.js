import express from "express";

import { getAdminOverview } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.get(
  "/overview",
  requireAuth,
  requireRole("admin"),
  getAdminOverview
);

export default router;
