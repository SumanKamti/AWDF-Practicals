import { useEffect, useState } from "react";
import Todo from "../components/Todo";

const API_BASE = "http://localhost:5000";

function Task() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/tasks`);
      if (!response.ok) {
        throw new Error(`Failed to load tasks: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedText = taskText.trim();
    if (!trimmedText) return;

    const payload = { title: trimmedText };

    try {
      const response = editingId
        ? await fetch(`${API_BASE}/tasks/${editingId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch(`${API_BASE}/tasks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Request failed");
      }

      const result = await response.json();
      setTasks((prevTasks) => {
        if (editingId) {
          return prevTasks.map((task) => (task.id === editingId ? result : task));
        }
        return [...prevTasks, result];
      });

      setTaskText("");
      setEditingId(null);
    } catch (err) {
      setError(err.message || "Unable to save task.");
    }
  };

  const handleEdit = (task) => {
    setTaskText(task.title);
    setEditingId(task.id);
    setError("");
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Delete failed");
      }

      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== id));

      if (editingId === id) {
        setEditingId(null);
        setTaskText("");
      }
    } catch (err) {
      setError(err.message || "Unable to delete task.");
    }
  };

  const handleCancelEdit = () => {
    setTaskText("");
    setEditingId(null);
    setError("");
  };

  return (
    <section className="task-page card">
      <h2>Task Manager</h2>
      <p>Add your daily tasks and manage them with the backend API.</p>

      <Todo
        taskText={taskText}
        setTaskText={setTaskText}
        onSubmit={handleSubmit}
        editing={Boolean(editingId)}
        onCancel={handleCancelEdit}
        tasks={tasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {error && <div className="task-error">{error}</div>}

      {loading && <p>Loading tasks...</p>}
    </section>
  );
}

export default Task;
