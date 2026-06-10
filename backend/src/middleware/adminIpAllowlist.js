import { logSecurityEvent } from "../utils/securityLog.js";

function getClientIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }

  return req.ip || req.socket?.remoteAddress || "unknown";
}

function normalizeIp(ip) {
  return String(ip || "")
    .replace("::ffff:", "")
    .trim();
}

function getAllowedIps() {
  return String(process.env.ADMIN_ALLOWED_IPS || "")
    .split(",")
    .map((ip) => normalizeIp(ip))
    .filter(Boolean);
}

export async function adminIpAllowlist(req, res, next) {
  const enabled = process.env.ADMIN_IP_ALLOWLIST_ENABLED === "true";

  if (!enabled) {
    return next();
  }

  const allowedIps = getAllowedIps();
  const clientIp = normalizeIp(getClientIp(req));

  if (allowedIps.length === 0) {
    await logSecurityEvent({
      type: "admin_action",
      userId: req.user?._id,
      email: req.user?.email,
      ipAddress: clientIp,
      userAgent: req.get("user-agent"),
      details: {
        action: "admin_ip_allowlist_blocked_empty_config",
        path: req.originalUrl,
        method: req.method
      }
    });

    return res.status(403).json({
      message: "Admin IP allowlist is enabled but no allowed IPs are configured."
    });
  }

  if (!allowedIps.includes(clientIp)) {
    await logSecurityEvent({
      type: "admin_action",
      userId: req.user?._id,
      email: req.user?.email,
      ipAddress: clientIp,
      userAgent: req.get("user-agent"),
      details: {
        action: "admin_ip_allowlist_denied",
        path: req.originalUrl,
        method: req.method,
        allowedIpsCount: allowedIps.length
      }
    });

    return res.status(403).json({
      message: "This IP address is not allowed to access admin routes."
    });
  }

  return next();
}
