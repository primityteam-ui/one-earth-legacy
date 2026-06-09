import mongoose from "mongoose";

const securityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "login",
        "failed_login",
        "otp_requested",
        "otp_verified",
        "otp_failed",
        "logout",
        "refresh_token_rotated",
        "rate_limit_hit",
        "suspicious_payment",
        "ban",
        "chargeback",
        "admin_action",
        "emperor_action"
      ],
      required: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    email: String,
    ipAddress: String,
    userAgent: String,
    details: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

export default mongoose.model("SecurityLog", securityLogSchema);