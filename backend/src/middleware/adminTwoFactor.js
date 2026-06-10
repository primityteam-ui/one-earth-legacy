import { logSecurityEvent } from "../utils/securityLog.js";

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
}

export async function requireAdminTwoFactor(req, res, next) {
  const enabled = process.env.ADMIN_2FA_REQUIRED === "true";

  if (!enabled) {
    return next();
  }

  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "Authentication required."
    });
  }

  if (user.role !== "admin") {
    return next();
  }

  if (!user.twoFactorEnabled) {
    await logSecurityEvent({
      type: "admin_action",
      userId: user._id,
      email: user.email,
      ipAddress: getClientIp(req),
      userAgent: req.get("user-agent"),
      details: {
        action: "admin_2fa_required_but_not_enabled",
        path: req.originalUrl,
        method: req.method
      }
    });

    return res.status(403).json({
      message: "Admin two-factor authentication is required but not enabled."
    });
  }

  if (!user.twoFactorVerifiedAt) {
    await logSecurityEvent({
      type: "admin_action",
      userId: user._id,
      email: user.email,
      ipAddress: getClientIp(req),
      userAgent: req.get("user-agent"),
      details: {
        action: "admin_2fa_not_verified",
        path: req.originalUrl,
        method: req.method
      }
    });

    return res.status(403).json({
      message: "Admin two-factor verification is required."
    });
  }

  return next();
}
