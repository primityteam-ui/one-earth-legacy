import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { logSecurityEvent } from "../utils/securityLog.js";

const isDevelopment = process.env.NODE_ENV === "development";

function devBypassLimiter(req, res, next) {
  return next();
}

function createLimiter({ windowMs, max, message, type = "rate_limit_hit", keyGenerator }) {
  if (isDevelopment) {
    return devBypassLimiter;
  }

  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator || ((req) => ipKeyGenerator(req.ip)),
    handler: async (req, res) => {
      await logSecurityEvent({
        type,
        email: req.body?.email,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
        details: {
          path: req.originalUrl,
          method: req.method
        }
      });

      return res.status(429).json({
        message,
        retryAfter: res.getHeader("Retry-After")
      });
    }
  });
}

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Please try again later."
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many auth attempts. Please try again later."
});

export const otpLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: "Too many OTP requests. Please try again after one hour.",
  keyGenerator: (req) => {
    if (req.body?.email) {
      return req.body.email.toLowerCase();
    }

    return ipKeyGenerator(req.ip);
  }
});