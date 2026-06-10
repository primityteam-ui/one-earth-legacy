import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import publicRoutes from "./routes/public.routes.js";
import donationRoutes from "./routes/donation.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import adminRoutes from "./routes/admin.routes.js";

import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { adminLimiter, globalLimiter } from "./middleware/rateLimits.js";
import { adminIpAllowlist } from "./middleware/adminIpAllowlist.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:"],
        "connect-src": [
          "'self'",
          process.env.FRONTEND_URL || "http://localhost:5173",
          "https://api.stripe.com"
        ],
        "frame-src": ["'self'", "https://js.stripe.com", "https://checkout.stripe.com"]
      }
    }
  })
);

const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:5173",
  "https://onearthlegacy.com",
  "https://www.onearthlegacy.com"
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Stripe-Signature"]
  })
);

/*
  Stripe routes are mounted before global express.json().
  The checkout route parses JSON inside payment.routes.js.
  The webhook route needs raw body for Stripe signature verification.
*/
app.use("/api/payments", paymentRoutes);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

/*
  Global limiter:
  - Bypassed automatically in development.
  - Active automatically in production.
*/
app.use(globalLimiter);

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "one-earth-legacy-api"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/donate", donationRoutes);
app.use("/api/admin", adminLimiter, adminIpAllowlist, adminRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;