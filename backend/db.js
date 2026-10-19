const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config({ path: process.env.DOTENV_CONFIG_PATH || undefined });

// User Schema for JWT authentication, bcrypt password hashing & Google OAuth
const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "Student User" },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    password: { type: String, required: false },
    googleId: { type: String, sparse: true },
    picture: { type: String, default: "" },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    resetOtp: { type: String, default: null },
    resetOtpExpires: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Task Schema supporting status, userId, and timestamps
const taskSchema = new mongoose.Schema(
  {
    id: { type: Number, unique: true, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["ongoing", "complete", "incomplete"],
      default: "ongoing",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// Activity Log Schema for tracking: what action was performed, at what time, and user
const logSchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // "CREATE", "UPDATE", "STATUS_CHANGE", "DELETE", "REGISTER", "LOGIN", "SEED"
    details: { type: String, required: true },
    user: { type: String, default: "Guest User" },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
const ActivityLog = mongoose.models.ActivityLog || mongoose.model("ActivityLog", logSchema);

// Automatically seed initial data if database is completely empty
async function seedInitialData() {
  try {
    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.create({ id: 1, title: "Learn React & Full Stack Integration", status: "complete" });
      await Task.create({ id: 2, title: "Configure MongoDB Atlas Cloud Database", status: "complete" });
      await Task.create({ id: 3, title: "Build Task Manager with Tabs & PDF Export", status: "ongoing" });
      await ActivityLog.create({
        action: "SEED",
        details: "Initial tasks seeded in MongoDB Atlas Cloud",
        user: "System Admin",
      });
      console.log("🌱 Database was empty. Auto-seeded initial tasks into MongoDB Atlas Cloud!");
    }
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
  }
}

// Connect to MongoDB Atlas (Cloud Only)
async function connectDB() {
  // Force Node.js to use Google DNS for SRV queries (prevents querySrv ECONNREFUSED in Docker Alpine)
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
  const cloudURI = (process.env.MONGODB_URI || process.env.CLOUD_DB_URI || "").trim();

  if (!cloudURI) {
    console.error("❌ FATAL CONFIGURATION ERROR: MONGODB_URI environment variable is missing or empty.");
    console.error("   The application is configured to run exclusively with MongoDB Atlas.");
    console.error("   Local MongoDB and fallback modes are permanently disabled.");
    console.error("💡 Tip: Provide your MongoDB Atlas connection string as MONGODB_URI in backend/.env.");
    process.exit(1);
  }

  try {
    await mongoose.connect(cloudURI);
    console.log("🚀 [CLOUD DB - PRIMARY] Successfully connected to Cloud MongoDB Atlas!");
    await seedInitialData();
  } catch (err) {
    console.error("❌ FATAL DATABASE ERROR: Failed to connect to MongoDB Atlas Cloud:", err.message);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test" && mongoose.connection.readyState === 0) {
  connectDB().catch((err) => {
    console.error("❌ Unhandled DB error during initialization:", err.message);
    process.exit(1);
  });
}

module.exports = {
  User,
  Task,
  ActivityLog,
  connectDB,
};
