const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
};

const requireJsonContent = (req, res, next) => {
  if ((req.method === "POST" || req.method === "PUT") && req.headers["content-type"] !== "application/json") {
    return res.status(415).json({
      error: "Content-Type must be application/json",
    });
  }
  next();
};

const validateTaskId = (req, res, next) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Task ID must be a positive integer",
    });
  }
  req.taskId = id;
  next();
};

app.use(cors());
app.use(requestLogger);
app.use(express.json());
app.use(requireJsonContent);

let tasks = [
  { id: 1, title: "Learn React" },
  { id: 2, title: "Complete Practical" },
];

app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

app.post("/tasks", (req, res) => {
  const title = String(req.body.title || "").trim();
  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const nextId = tasks.length ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
  const newTask = { id: nextId, title };
  tasks.push(newTask);

  res.status(201).json(newTask);
});

app.put("/tasks/:id", validateTaskId, (req, res) => {
  const task = tasks.find((item) => item.id === req.taskId);
  if (!task) {
    return res.status(404).json({ error: "Task not found" });
  }

  const title = String(req.body.title || "").trim();
  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  task.title = title;
  res.status(200).json(task);
});

app.delete("/tasks/:id", validateTaskId, (req, res) => {
  const index = tasks.findIndex((item) => item.id === req.taskId);
  if (index === -1) {
    return res.status(404).json({ error: "Task not found" });
  }

  tasks.splice(index, 1);
  res.status(200).json({ message: "Task deleted" });
});

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
  console.log(`Server running on port ${PORT}`);
});