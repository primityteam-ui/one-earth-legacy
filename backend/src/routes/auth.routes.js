import express from "express";

import {
  googleAuth,
  googleAuthValidators,
  logout,
  refreshToken,
  sendOtp,
  sendOtpValidators,
  verifyOtp,
  verifyOtpValidators
} from "../controllers/auth.controller.js";

import { validateRequest } from "../middleware/validate.js";
import { authLimiter, otpLimiter } from "../middleware/rateLimits.js";

const router = express.Router();

/*
  Rate limit behavior:
  - Development: bypassed by rateLimits.js so local testing is easy.
  - Production: active automatically to protect OTP/login endpoints.
*/

router.post(
  "/email/send-otp",
  otpLimiter,
  sendOtpValidators,
  validateRequest,
  sendOtp
);

router.post(
  "/email/verify-otp",
  authLimiter,
  verifyOtpValidators,
  validateRequest,
  verifyOtp
);

router.post(
  "/google",
  authLimiter,
  googleAuthValidators,
  validateRequest,
  googleAuth
);

router.post(
  "/refresh-token",
  authLimiter,
  refreshToken
);

router.post(
  "/logout",
  logout
);

export default router;