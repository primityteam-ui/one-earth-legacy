import mongoose from "mongoose";

const loginHistorySchema = new mongoose.Schema(
  {
    ipAddress: String,
    userAgent: String,
    loginAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const donorLocationSchema = new mongoose.Schema(
  {
    city: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    region: {
      type: String,
      trim: true,
      maxlength: 80,
      default: ""
    },
    country: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "Unknown"
    },
    countryCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 2,
      default: "UN"
    },
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    },
    precision: {
      type: String,
      enum: ["country", "city", "approximate"],
      default: "country"
    },
    source: {
      type: String,
      enum: ["manual", "browser", "default"],
      default: "manual"
    },
    updatedAt: Date
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    googleId: { type: String, index: true },
    username: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9_]+$/
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: 80
    },

    country: { type: String, default: "Unknown" },
    countryCode: { type: String, default: "UN" },

    donorLocation: {
      type: donorLocationSchema,
      default: () => ({
        city: "",
        region: "",
        country: "Unknown",
        countryCode: "UN",
        precision: "country",
        source: "manual"
      })
    },

    avatar: String,

    totalDonated: { type: Number, default: 0 },
    currentRank: { type: String, default: "Spark" },
    rankHistory: { type: Array, default: [] },

    referralCode: { type: String, unique: true, sparse: true },
    referredBy: String,
    streakCount: { type: Number, default: 0 },
    lastDonationDate: Date,
    birthdayDate: Date,
    squadId: mongoose.Schema.Types.ObjectId,

    isPioneer: { type: Boolean, default: false },
    pioneeredCountry: String,
    isAnonymous: { type: Boolean, default: false },
    isBanned: { type: Boolean, default: false },
    flagCount: { type: Number, default: 0 },

    role: {
      type: String,
      enum: ["user", "lord_plus", "emperor", "admin"],
      default: "user"
    },

    lastLoginIP: String,
    lastLoginAt: Date,
    loginHistory: { type: [loginHistorySchema], default: [] },

    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);