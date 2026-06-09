import SecurityLog from "../models/SecurityLog.js";

export async function logSecurityEvent({ type, userId, email, ipAddress, userAgent, details = {} }) {
  try {
    await SecurityLog.create({
      type,
      userId,
      email,
      ipAddress,
      userAgent,
      details
    });
  } catch (error) {
    console.error("Security log failed:", error.message);
  }
}