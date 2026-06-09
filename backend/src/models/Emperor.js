import mongoose from "mongoose";

const emperorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    totalDonated: {
      type: Number,
      required: true,
      min: 1000000
    },

    chosenCause: {
      type: String,
      enum: [
        "Clean drinking water",
        "Hunger relief",
        "Global education",
        "Climate action"
      ],
      required: true
    },

    causeStartDate: {
      type: Date,
      default: Date.now
    },

    globalMessage: {
      type: String,
      maxlength: 500,
      default: ""
    },

    coronationDate: Date,

    isActive: {
      type: Boolean,
      default: true
    },

    isPendingConfirmation: {
      type: Boolean,
      default: true
    },

    confirmationDate: Date,

    dethroned: {
      type: Boolean,
      default: false
    },

    dethronedAt: Date
  },
  { timestamps: true }
);

export default mongoose.model("Emperor", emperorSchema);