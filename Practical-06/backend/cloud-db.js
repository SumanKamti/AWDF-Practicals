const { Task, ActivityLog, connectDB } = require("./db");

module.exports = {
  Task,
  ActivityLog,
  connectCloudDB: connectDB,
};