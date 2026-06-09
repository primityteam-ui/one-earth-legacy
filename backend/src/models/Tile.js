import mongoose from "mongoose";

const tileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    donationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Donation",
      required: true,
      index: true
    },

    message: {
      type: String,
      maxlength: 280,
      default: ""
    },

    logoUrl: String,
    videoUrl: String,

    borderType: {
      type: String,
      default: "standard"
    },

    themeColor: {
      type: String,
      default: "Gold"
    },

    sizeScore: {
      type: Number,
      default: 1
    },

    viewCount: {
      type: Number,
      default: 0
    },

    viewsByCountry: {
      type: Object,
      default: {}
    },

    lastResurrectedAt: Date,

    isFeatured: {
      type: Boolean,
      default: false
    },

    isFlagged: {
      type: Boolean,
      default: false
    },

    flagReason: String
  },
  { timestamps: true }
);

export default mongoose.model("Tile", tileSchema);