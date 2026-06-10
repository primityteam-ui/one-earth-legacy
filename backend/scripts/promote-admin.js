import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../src/models/User.js";

dotenv.config({ path: ".env" });

const email = process.argv[2];

if (!email) {
  console.error("Usage: node scripts/promote-admin.js your-email@example.com");
  process.exit(1);
}

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!mongoUri) {
  console.error("MongoDB connection string is missing.");
  console.error("Expected one of these in backend/.env:");
  console.error("MONGO_URI=...");
  console.error("MONGODB_URI=...");
  console.error("DATABASE_URL=...");
  process.exit(1);
}

try {
  await mongoose.connect(mongoUri);

  const user = await User.findOne({
    email: email.toLowerCase().trim()
  });

  if (!user) {
    console.error(`No user found with email: ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  user.role = "admin";
  await user.save();

  console.log(`Success: ${user.email} is now admin.`);
  console.log(`Username: ${user.username}`);
  console.log(`Role: ${user.role}`);

  await mongoose.disconnect();
  process.exit(0);
} catch (error) {
  console.error("Failed to promote admin:", error.message);
  await mongoose.disconnect();
  process.exit(1);
}
