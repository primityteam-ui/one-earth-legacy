import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { body } from "express-validator";

import User from "../models/User.js";
import Otp from "../models/Otp.js";
import RefreshToken from "../models/RefreshToken.js";
import { sendOtpEmail } from "../utils/email.js";
import { logSecurityEvent } from "../utils/securityLog.js";
import {
  hashToken,
  refreshTokenExpiryDate,
  signAccessToken,
  signRefreshToken
} from "../utils/jwt.js";
import { clearRefreshCookie, setRefreshCookie } from "../utils/cookies.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

function createSafeUsername(email) {
  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "_")
    .slice(0, 20);

  const suffix = crypto.randomInt(1000, 9999);
  return `${base}_${suffix}`;
}

function publicUser(user) {
  return {
    id: user._id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatar: user.avatar,
    country: user.country,
    countryCode: user.countryCode,
    totalDonated: user.totalDonated,
    currentRank: user.currentRank,
    role: user.role,
    twoFactorEnabled: user.twoFactorEnabled
  };
}

async function issueTokens({ user, req, res }) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: refreshTokenExpiryDate(),
    ipAddress: req.ip,
    userAgent: req.get("user-agent")
  });

  setRefreshCookie(res, refreshToken);

  return accessToken;
}

export const sendOtpValidators = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required")
];

export async function sendOtp(req, res, next) {
  try {
    const email = req.body.email.toLowerCase();

    const otp = String(crypto.randomInt(100000, 999999));
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.updateMany({ email, used: false }, { used: true });

    await Otp.create({
      email,
      otpHash,
      expiresAt,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    await sendOtpEmail({ to: email, otp });

    await logSecurityEvent({
      type: "otp_requested",
      email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    res.status(200).json({ message: "OTP sent" });
  } catch (error) {
    next(error);
  }
}

export const verifyOtpValidators = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("otp")
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage("Valid 6-digit OTP is required")
];

export async function verifyOtp(req, res, next) {
  try {
    const email = req.body.email.toLowerCase();
    const { otp } = req.body;

    const record = await Otp.findOne({
      email,
      used: false,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });

    if (!record) {
      await logSecurityEvent({
        type: "otp_failed",
        email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        details: { reason: "missing_or_expired" }
      });

      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const valid = await bcrypt.compare(otp, record.otpHash);

    if (!valid) {
      await logSecurityEvent({
        type: "otp_failed",
        email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        details: { reason: "wrong_code" }
      });

      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    record.used = true;
    await record.save();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        username: createSafeUsername(email),
        displayName: email.split("@")[0],
        referralCode: crypto.randomUUID().slice(0, 8)
      });
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Account suspended" });
    }

    user.lastLoginIP = req.ip;
    user.lastLoginAt = new Date();
    user.loginHistory.push({
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    await user.save();

    const accessToken = await issueTokens({ user, req, res });

    await logSecurityEvent({
      type: "otp_verified",
      userId: user._id,
      email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: publicUser(user)
    });
  } catch (error) {
    next(error);
  }
}

export const googleAuthValidators = [
  body("idToken").isString().notEmpty().withMessage("Google ID token is required")
];

export async function googleAuth(req, res, next) {
  try {
    const { idToken } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.email_verified) {
      return res.status(401).json({ message: "Google email is not verified" });
    }

    const email = payload.email.toLowerCase();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        googleId: payload.sub,
        username: createSafeUsername(email),
        displayName: payload.name || email.split("@")[0],
        avatar: payload.picture,
        referralCode: crypto.randomUUID().slice(0, 8)
      });
    } else {
      user.googleId = user.googleId || payload.sub;
      user.displayName = user.displayName || payload.name;
      user.avatar = user.avatar || payload.picture;
    }

    if (user.isBanned) {
      return res.status(403).json({ message: "Account suspended" });
    }

    user.lastLoginIP = req.ip;
    user.lastLoginAt = new Date();
    user.loginHistory.push({
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    await user.save();

    const accessToken = await issueTokens({ user, req, res });

    await logSecurityEvent({
      type: "login",
      userId: user._id,
      email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      details: { provider: "google" }
    });

    res.status(200).json({
      message: "Login successful",
      accessToken,
      user: publicUser(user)
    });
  } catch (error) {
    await logSecurityEvent({
      type: "failed_login",
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
      details: { provider: "google" }
    });

    next(error);
  }
}

export async function refreshToken(req, res) {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: "Refresh token missing" });
    }

    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const tokenHash = hashToken(token);

    const storedToken = await RefreshToken.findOne({
      tokenHash,
      userId: payload.sub,
      revoked: false,
      expiresAt: { $gt: new Date() }
    });

    if (!storedToken) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const user = await User.findById(payload.sub);

    if (!user || user.isBanned) {
      clearRefreshCookie(res);
      return res.status(401).json({ message: "Unauthorized" });
    }

    storedToken.revoked = true;
    await storedToken.save();

    const accessToken = await issueTokens({ user, req, res });

    await logSecurityEvent({
      type: "refresh_token_rotated",
      userId: user._id,
      email: user.email,
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    res.status(200).json({
      accessToken,
      user: publicUser(user)
    });
  } catch {
    clearRefreshCookie(res);
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
}

export async function logout(req, res, next) {
  try {
    const token = req.cookies.refreshToken;

    if (token) {
      const tokenHash = hashToken(token);
      await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
    }

    clearRefreshCookie(res);

    await logSecurityEvent({
      type: "logout",
      ipAddress: req.ip,
      userAgent: req.get("user-agent")
    });

    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    next(error);
  }
}