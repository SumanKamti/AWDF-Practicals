require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const PDFDocument = require("pdfkit");
const { User, Task, ActivityLog } = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "practical-07-super-secret-jwt-key-2026";

// Logging helper to record user/system actions in MongoDB Atlas
async function logActivity(action, details, user = "Guest User", userId = null) {
  try {
    await ActivityLog.create({
      action,
      details,
      user,
      userId,
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

// --- AUTHENTICATION MIDDLEWARE ---
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  let token = null;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      error: "Access denied. No authentication token provided. Expected 'Authorization: Bearer <token>'.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Authentication token has expired. Please log in again." });
    }
    return res.status(401).json({ error: "Invalid authentication token. Verification failed." });
  }
};

// --- INPUT VALIDATION MIDDLEWARES ---
const validateRegisterInput = (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const name = String(req.body.name || "").trim();

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }
  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Please provide a valid email address format" });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters long" });
  }

  req.sanitizedBody = { name, email, password };
  next();
};

const validateLoginInput = (req, res, next) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  req.sanitizedBody = { email, password };
  next();
};

const validateTaskInput = (req, res, next) => {
  const title = String(req.body.title || "").trim();
  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const validStatuses = ["ongoing", "complete", "incomplete"];
  const status = validStatuses.includes(req.body.status) ? req.body.status : "ongoing";

  req.taskInput = { title, status };
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
    practical: "Practical 7: Authentication and Middleware Pipeline",
    timestamp: new Date().toISOString(),
  });
});

// ==========================================
// 🔐 AUTHENTICATION ROUTES (Practical 7)
// ==========================================

// POST /register - Register a new user with bcrypt password hashing
app.post(["/register", "/api/register"], validateRegisterInput, async (req, res, next) => {
  try {
    const { name, email, password } = req.sanitizedBody;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    // Hash password using bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    });

    // Generate JWT token with 1 hour expiration
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await logActivity("REGISTER", `New user registered: ${newUser.email}`, newUser.name, newUser._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /login - Authenticate user, compare bcrypt hash, sign and return JWT
app.post(["/login", "/api/login"], validateLoginInput, async (req, res, next) => {
  try {
    const { email, password } = req.sanitizedBody;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token with 1 hour expiration
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    await logActivity("LOGIN", `User logged in: ${user.email}`, user.name, user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /me - Return currently logged-in user profile from decoded JWT
app.get(["/me", "/api/me"], authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (error) {
    next(error);
  }
});

// ==========================================
// 📋 PROTECTED TASK & LOG ROUTES (JWT Required)
// ==========================================

// GET /tasks/logs - Fetch activity logs from MongoDB Atlas
app.get(["/tasks/logs", "/api/tasks/logs"], authMiddleware, async (req, res, next) => {
  try {
    const logs = await ActivityLog.find({}, { _id: 0 }).sort({ timestamp: -1 }).limit(50);
    res.status(200).json(logs);
  } catch (error) {
    next(error);
  }
});

// GET /tasks/export-pdf - Server-side PDF generation for user tasks
app.get(["/tasks/export-pdf", "/api/tasks/export-pdf"], authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({
      $or: [{ userId }, { userId: { $exists: false } }, { userId: null }],
    }, { _id: 0 }).sort({ id: 1 });

    const doc = new PDFDocument({ margin: 40 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=MongoDB_Tasks_Report.pdf");

    doc.pipe(res);

    // Header Title
    doc.fillColor("#1e40af").fontSize(22).text("Task Management System - Report", { align: "center" });
    doc.moveDown(0.5);
    doc.fillColor("#64748b").fontSize(10).text(
      `Generated for: ${req.user.name} (${req.user.email}) | ${new Date().toLocaleString()}`,
      { align: "center" }
    );
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

// GET /tasks - Fetch tasks (Protected)
app.get(["/tasks", "/api/tasks"], authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const tasks = await Task.find({
      $or: [{ userId }, { userId: { $exists: false } }, { userId: null }],
    }, { _id: 0, __v: 0 }).sort({ id: 1 });

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create a new task (Protected + Input Validated)
app.post(["/tasks", "/api/tasks"], authMiddleware, validateTaskInput, async (req, res, next) => {
  try {
    const { title, status } = req.taskInput;
    const userId = req.user.id;
    const userName = req.user.name || req.user.email;

    const highestTask = await Task.findOne().sort({ id: -1 });
    const nextId = highestTask ? highestTask.id + 1 : 1;

    const newTask = new Task({
      id: nextId,
      title,
      status,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newTask.save();

    await logActivity(
      "CREATE",
      `Created task #${nextId}: "${newTask.title}" (Status: ${status})`,
      userName,
      userId
    );

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

// PUT /tasks/:id - Update task title/status (Protected + Task ID Validated)
app.put(["/tasks/:id", "/api/tasks/:id"], authMiddleware, validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findOne({ id: req.taskId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const userName = req.user.name || req.user.email;
    const userId = req.user.id;
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
    await logActivity("UPDATE", `Updated task #${task.id} (${changeDescription})`, userName, userId);

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

// DELETE /tasks/:id - Delete a task (Protected + Task ID Validated)
app.delete(["/tasks/:id", "/api/tasks/:id"], authMiddleware, validateTaskId, async (req, res, next) => {
  try {
    const task = await Task.findOne({ id: req.taskId });
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const userName = req.user.name || req.user.email;
    const userId = req.user.id;

    await Task.deleteOne({ id: req.taskId });
    await logActivity("DELETE", `Deleted task #${task.id}: "${task.title}"`, userName, userId);

    res.status(200).json({ message: "Task deleted successfully", id: req.taskId });
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
  console.log(`🚀 Practical 7 API Server running on http://localhost:${PORT}`);
  console.log(`📦 Active Database Mode: [${(process.env.DB_TYPE || "cloud").toUpperCase()}]`);
  console.log(`🔒 JWT Authentication & Middleware Pipeline active`);
});