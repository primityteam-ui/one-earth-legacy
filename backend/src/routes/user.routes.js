import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { getMe } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", requireAuth, getMe);
router.get("/me/stats", requireAuth, getMe);

export default router;