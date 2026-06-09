import express from "express";

import { requireAuth } from "../middleware/auth.js";
import { avatarUpload } from "../middleware/upload.js";
import { getMe, uploadAvatar } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", requireAuth, getMe);
router.get("/me/stats", requireAuth, getMe);

router.post(
  "/me/avatar",
  requireAuth,
  avatarUpload,
  uploadAvatar
);

export default router;