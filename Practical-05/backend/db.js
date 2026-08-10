const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

const taskSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  title: { type: String, required: true, trim: true },
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// Automatically seed initial data if database is empty
async function seedInitialData() {
  try {
    const count = await Task.countDocuments();
    if (count === 0) {
      await Task.create({ id: 1, title: "Learn React" });
      console.log("🌱 Database was empty. Auto-seeded initial task!");
    }
  } catch (error) {
    console.error("❌ Error seeding data:", error.message);
  }
}

// Connect to either Local MongoDB or Cloud MongoDB Atlas based on DB_TYPE in .env
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
    // Force Node.js to use Google DNS for SRV queries
    dns.setServers(["8.8.8.8", "8.8.4.4"]);
    const cloudURI =
      process.env.CLOUD_DB_URI ||
      process.env.MONGODB_URI ||
      "mongodb+srv://my-portfolio:suman1portfolio@cluster0.g3jxa6m.mongodb.net/PracticeDB?retryWrites=true&w=majority";

    try {
      await mongoose.connect(cloudURI);
      console.log("🚀 [CLOUD DB] Successfully connected to Cloud MongoDB (Atlas)!");
      await seedInitialData();
    } catch (err) {
      console.error("❌ Cloud MongoDB connection error:", err.message);
    }
  }
}

if (mongoose.connection.readyState === 0) {
  connectDB();
}

module.exports = Task;
module.exports.connectDB = connectDB;
