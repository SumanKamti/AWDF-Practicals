const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

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
      console.log("🌱 Database was empty. Auto-seeded initial tasks into MongoDB Atlas!");
    }
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
  }
}

// Connect to MongoDB Atlas (Primary) or Local MongoDB fallback
async function connectDB() {
  const dbType = (process.env.DB_TYPE || "cloud").trim().toLowerCase();

  if (dbType === "local") {
    const localURI = process.env.LOCAL_DB_URI || "mongodb://127.0.0.1:27017/MyPortfolioToDo";
    try {
      await mongoose.connect(localURI);
      console.log(`🚀 [LOCAL DB] Successfully connected to Local MongoDB: ${localURI}`);
      await seedInitialData();
    } catch (err) {
      console.error("❌ Local MongoDB connection error:", err.message);
      console.error("💡 Tip: Make sure MongoDB service is running locally on port 27017.");
    }
  } else {
    // Force Node.js to use Google DNS for SRV queries (prevents querySrv ECONNREFUSED)
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    const cloudURI =
      process.env.CLOUD_DB_URI ||
      process.env.MONGODB_URI ||
      "mongodb+srv://my-portfolio:suman1portfolio@cluster0.g3jxa6m.mongodb.net/PracticeDB?retryWrites=true&w=majority";

    try {
      await mongoose.connect(cloudURI);
      console.log("🚀 [CLOUD DB - PRIMARY] Successfully connected to Cloud MongoDB Atlas!");
      await seedInitialData();
    } catch (err) {
      console.error("❌ Cloud MongoDB connection error:", err.message);
    }
  }
}

if (mongoose.connection.readyState === 0) {
  connectDB();
}

module.exports = {
  User,
  Task,
  ActivityLog,
  connectDB,
};
