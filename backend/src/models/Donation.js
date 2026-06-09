import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 1
    },

    currency: {
      type: String,
      required: true,
      uppercase: true,
      default: "USD"
    },

    amountUSD: {
      type: Number,
      required: true,
      min: 1
    },

    paymentMethod: {
      type: String,
      enum: ["stripe", "razorpay", "manual", "mock"],
      default: "mock"
    },

    paymentId: {
      type: String,
      index: true
    },

    paymentStatus: {
      type: String,
      enum: ["created", "paid", "failed", "refunded"],
      default: "created"
    },

    settlementStatus: {
      type: String,
      enum: ["pending", "settled", "disputed"],
      default: "pending"
    },

    chargebackFiled: {
      type: Boolean,
      default: false
    },

    chargebackResolvedAt: Date,

    tileMessage: {
      type: String,
      maxlength: 280,
      default: ""
    },

    tileLogo: String,

    tileBorder: {
      type: String,
      default: "standard"
    },

    tileTheme: {
      type: String,
      default: "Gold"
    },

    isVideoTile: {
      type: Boolean,
      default: false
    },

    isGift: {
      type: Boolean,
      default: false
    },

    giftRecipientName: String,

    rankAtTime: {
      type: String,
      default: "Spark"
    },

    isAnonymous: {
      type: Boolean,
      default: false
    },

    ipAddress: String,
    userAgent: String
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);