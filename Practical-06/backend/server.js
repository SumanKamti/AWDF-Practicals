require("dotenv").config();
const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const { Task, ActivityLog } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;

// Logging helper to record user/system actions in MongoDB Atlas
async function logActivity(action, details, user = "Guest User") {
  try {
    await ActivityLog.create({
      action,
      details,
      user,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("⚠️ Failed to record activity log:", err.message);
  }
}

// Middlewares
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

const requireJsonContent = (req, res, next) => {
  if (
    (req.method === "POST" || req.method === "PUT") &&
    req.headers["content-type"] &&
    !req.headers["content-type"].includes("application/json")
  ) {
    return res.status(415).json({ error: "Content-Type must be application/json" });
  }
  next();
};

const validateTaskId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: "Task ID must be a positive integer" });
  }
  req.taskId = id;
  next();
};

const corsOptions = {
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(requestLogger);
app.use(express.json());
app.use(requireJsonContent);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: process.env.DB_TYPE || "cloud",
    timestamp: new Date().toISOString(),
  });
});

// --- ACTIVITY LOGS ROUTE ---
app.get("/tasks/logs", async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({}, { _id: 0 }).sort({ timestamp: -1 }).limit(50);
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
});

// --- PDF EXPORT ROUTE (SERVER-SIDE STREAMING) ---
app.get(["/tasks/export-pdf", "/api/tasks/export-pdf"], async (req, res) => {
  try {
    const tasks = await Task.find({}, { _id: 0 }).sort({ id: 1 });
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=MongoDB_Tasks_Report.pdf");

    doc.pipe(res);

    // Header Title
    doc.fillColor("#1e40af").fontSize(22).text("Task Management System - Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fillColor("#64748b").fontSize(10).text(`Generated on: ${new Date().toLocaleString()} | Source: MongoDB Atlas Cloud`, { align: "center" });
    doc.moveDown(1.5);

    // Summary Statistics Box
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "complete").length;
    const ongoing = tasks.filter((t) => t.status === "ongoing").length;
    const incomplete = tasks.filter((t) => t.status === "incomplete").length;

    doc.rect(40, doc.y, 530, 45).fillAndStroke("#f1f5f9", "#cbd5e1");
    doc.fillColor("#0f172a").fontSize(11).text(
      `Total Tasks: ${total}   |   Completed: ${completed}   |   Ongoing: ${ongoing}   |   Incomplete: ${incomplete}`,
      50,
      doc.y - 32,
      { align: "center" }
    );
    doc.moveDown(2);

    // Tasks List Table
    doc.fillColor("#1e293b").fontSize(14).text("Task List Details:", 40);
    doc.moveDown(0.5);

    if (tasks.length === 0) {
      doc.fontSize(11).fillColor("#94a3b8").text("No tasks found in the database.");
    } else {
      tasks.forEach((task, index) => {
        const statusColor =
          task.status === "complete" ? "#16a34a" : task.status === "ongoing" ? "#2563eb" : "#dc2626";

        doc.fillColor("#0f172a").fontSize(11).text(`${index + 1}. [ID: #${task.id}] ${task.title}`, 40);
        doc.fillColor(statusColor).fontSize(10).text(`    Status: ${(task.status || "ongoing").toUpperCase()}`, 40);
        doc.fillColor("#64748b").fontSize(9).text(
          `    Created: ${new Date(task.createdAt || Date.now()).toLocaleDateString()} | Updated: ${new Date(task.updatedAt || Date.now()).toLocaleDateString()}`,
          40
        );
        doc.moveDown(0.8);
      });
    }

    doc.end();
  } catch (error) {
    console.error("PDF Export Error:", error);
    res.status(500).json({ error: "Failed to generate PDF document" });
  }
});

// --- CRUD ROUTES ---

// GET: Fetch all tasks
app.get("/tasks", async (req, res, next) => {
  try {
    const tasks = await Task.find({}, { _id: 0, __v: 0 }).sort({ id: 1 });
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// POST: Add a new task
app.post("/tasks", async (req, res, next) => {
  try {
    const title = String(req.body.title || "").trim();
    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const validStatuses = ["ongoing", "complete", "incomplete"];
    const status = validStatuses.includes(req.body.status) ? req.body.status : "ongoing";

    const highestTask = await Task.findOne().sort({ id: -1 });
    const nextId = highestTask ? highestTask.id + 1 : 1;

    const newTask = new Task({
      id: nextId,
      title,
      status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newTask.save();

    await logActivity("CREATE", `Created task #${nextId}: "${newTask.title}" (Status: ${status})`);

    res.status(201).json({
      id: newTask.id,
      title: newTask.title,
      status: newTask.status,
      createdAt: newTask.createdAt,
      updatedAt: newTask.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

// PUT: Update a task
app.put("/tasks/:id", validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findOne({ id: req.taskId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const changes = [];

    if (req.body.title !== undefined) {
      const title = String(req.body.title || "").trim();
      if (!title) {
        return res.status(400).json({ error: "Task title cannot be empty" });
      }
      if (task.title !== title) {
        changes.push(`title: "${task.title}" -> "${title}"`);
        task.title = title;
      }
    }

    if (req.body.status !== undefined) {
      const validStatuses = ["ongoing", "complete", "incomplete"];
      if (validStatuses.includes(req.body.status) && task.status !== req.body.status) {
        changes.push(`status: "${task.status}" -> "${req.body.status}"`);
        task.status = req.body.status;
      }
    }

    task.updatedAt = new Date();
    await task.save();

    const changeDescription = changes.length > 0 ? changes.join(", ") : "details saved";
    await logActivity("UPDATE", `Updated task #${task.id} (${changeDescription})`);

    res.status(200).json({
      id: task.id,
      title: task.title,
      status: task.status,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    });
  } catch (error) {
    next(error);
  }
});

// DELETE: Remove a task
app.delete("/tasks/:id", validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findOne({ id: req.taskId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    await Task.deleteOne({ id: req.taskId });
    await logActivity("DELETE", `Deleted task #${task.id}: "${task.title}"`);

    res.status(200).json({ message: "Task deleted", id: req.taskId });
  } catch (error) {
    next(error);
  }
});

// Global Error Handlers
app.use((req, res, next) => {
  const error = new Error("Route not found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${err.message}`);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📦 Active Database Mode: [${(process.env.DB_TYPE || "cloud").toUpperCase()}]`);
});