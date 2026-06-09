import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    otpHash: { type: String, required: true },
    used: { type: Boolean, default: false },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }
    },
    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

export default mongoose.model("Otp", otpSchema);