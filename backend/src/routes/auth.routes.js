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

const router = express.Router();

/*
  DEVELOPMENT NOTE:
  OTP and auth rate limiters are temporarily removed so local testing is easy.
  Before production launch, add otpLimiter and authLimiter back here.
*/

router.post("/email/send-otp", sendOtpValidators, validateRequest, sendOtp);
router.post("/email/verify-otp", verifyOtpValidators, validateRequest, verifyOtp);
router.post("/google", googleAuthValidators, validateRequest, googleAuth);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

export default router;