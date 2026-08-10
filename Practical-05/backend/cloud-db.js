const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Force Node.js to use Google DNS for resolving SRV records (fixes querySrv ECONNREFUSED)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const dbURI =
  process.env.CLOUD_DB_URI ||
  process.env.MONGODB_URI ||
  "mongodb+srv://my-portfolio:suman1portfolio@cluster0.g3jxa6m.mongodb.net/PracticeDB?retryWrites=true&w=majority";

const taskSchema = new mongoose.Schema({
  id: { type: Number, unique: true, required: true },
  title: { type: String, required: true, trim: true },
});

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

// Automatically inserts a seed task if the collection is empty
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

// Connect to Cloud MongoDB Atlas
const connectCloudDB = async () => {
  try {
    await mongoose.connect(dbURI);
    console.log("🚀 Successfully connected to Cloud MongoDB (Atlas) via Mongoose!");
    await seedInitialData();
  } catch (err) {
    console.error("❌ Cloud MongoDB connection error:", err.message);
  }
};

if (mongoose.connection.readyState === 0) {
  connectCloudDB();
}

module.exports = Task;
module.exports.connectCloudDB = connectCloudDB;