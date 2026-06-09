import mongoose from "mongoose";

const auditEntrySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "donation_received",
        "cause_allocation",
        "platform_allocation",
        "lottery_allocation",
        "cause_payout",
        "platform_expense",
        "lottery_payout",
        "refund",
        "chargeback"
      ],
      required: true,
      index: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    currency: {
      type: String,
      default: "USD",
      uppercase: true
    },

    recipient: {
      type: String,
      required: true
    },

    proofUrl: String,

    description: {
      type: String,
      required: true,
      maxlength: 1000
    },

    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { timestamps: true }
);

export default mongoose.model("AuditEntry", auditEntrySchema);