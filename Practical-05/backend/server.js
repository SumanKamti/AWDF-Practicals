require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Task = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const EDIT_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const taskEditState = new Map();

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

// --- ROUTES ---

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

    const highestTask = await Task.findOne().sort({ id: -1 });
    const nextId = highestTask ? highestTask.id + 1 : 1;

    const newTask = new Task({ id: nextId, title });
    await newTask.save();

    res.status(201).json({ id: newTask.id, title: newTask.title });
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

    const currentEditState = taskEditState.get(req.taskId);
    if (currentEditState && currentEditState.blockedUntil && Date.now() < currentEditState.blockedUntil) {
      return res.status(403).json({
        error: `Task editing limit reached. You can edit again after ${new Date(currentEditState.blockedUntil).toISOString()}.`,
      });
    }

    if (currentEditState && currentEditState.blockedUntil && Date.now() >= currentEditState.blockedUntil) {
      taskEditState.delete(req.taskId);
    }

    const title = String(req.body.title || "").trim();
    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    task.title = title;
    await task.save();

    const nextEditState = taskEditState.get(req.taskId) || { count: 0 };
    nextEditState.count += 1;
    if (nextEditState.count >= 3) {
      nextEditState.blockedUntil = Date.now() + EDIT_LIMIT_WINDOW_MS;
    }
    taskEditState.set(req.taskId, nextEditState);

    res.status(200).json({ id: task.id, title: task.title });
  } catch (error) {
    next(error);
  }
});

// DELETE: Remove a task
app.delete("/tasks/:id", validateTaskId, async (req, res, next) => {
  try {
    const result = await Task.deleteOne({ id: req.taskId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    taskEditState.delete(req.taskId);
    res.status(200).json({ message: "Task deleted" });
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
