import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDatabase, faSpinner, faSync, faTasks } from "@fortawesome/free-solid-svg-icons";
import Todo from "../components/Todo";
import ActivityLogs from "../components/ActivityLogs";
import api, { getTasks, createTask, updateTask, deleteTask, getLogs } from "../services/api";
import { exportTasksToPDF } from "../utils/pdfExport";

function Task() {
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [taskStatus, setTaskStatus] = useState("ongoing");
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);
  const [error, setError] = useState("");

  // Activity Logs State
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const showToast = (title, icon = "success") => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
    });
  };

  const loadTasks = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err.message || "Failed to load tasks from MongoDB Atlas.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const loadLogsData = async () => {
    setLoadingLogs(true);
    try {
      const data = await getLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (showLogs) {
      loadLogsData();
    }
  }, [showLogs]);

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedText = taskText.trim();
    if (!trimmedText) return;

    setSubmitting(true);
    setError("");

    try {
      if (editingId !== null) {
        const updated = await updateTask(editingId, {
          title: trimmedText,
          status: taskStatus,
        });

        setTasks((prev) =>
          prev.map((t) =>
            t.id === editingId
              ? { ...t, title: updated.title, status: updated.status, updatedAt: updated.updatedAt }
              : t
          )
        );

        showToast("Task updated!", "success");
        setEditingId(null);
        setTaskText("");
        setTaskStatus("ongoing");
      } else {
        const created = await createTask(trimmedText, taskStatus);
        setTasks((prev) => [...prev, created]);

        showToast("Task created!", "success");
        setTaskText("");
        setTaskStatus("ongoing");
      }

      if (showLogs) {
        loadLogsData();
      }
    } catch (err) {
      const errorMsg = err.message || "Failed to save task";
      setError(errorMsg);
      Swal.fire({ icon: "error", title: "Error", text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  // Quick Status Update
  const handleStatusChange = async (id, newStatus) => {
    setUpdatingStatusId(id);
    try {
      const updated = await updateTask(id, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: updated.status, updatedAt: updated.updatedAt } : t))
      );

      showToast(`Status updated: ${newStatus.toUpperCase()}`, "success");

      if (showLogs) {
        loadLogsData();
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to update status" });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Edit Task
  const handleEdit = (task) => {
    setTaskText(task.title);
    setTaskStatus(task.status || "ongoing");
    setEditingId(task.id);
    setError("");
  };

  // Delete Task
  const handleDelete = async (id, taskTitle) => {
    const result = await Swal.fire({
      title: "Delete task?",
      text: `Delete #${id} "${taskTitle}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    setDeletingId(id);
    setError("");

    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
      showToast("Task deleted", "success");

      if (editingId === id) {
        setEditingId(null);
        setTaskText("");
        setTaskStatus("ongoing");
      }

      if (showLogs) {
        loadLogsData();
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message || "Failed to delete task" });
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelEdit = () => {
    setTaskText("");
    setTaskStatus("ongoing");
    setEditingId(null);
  };

  const handleExportPDF = () => {
    if (tasks.length === 0) {
      Swal.fire({ icon: "info", title: "No Tasks", text: "Add tasks before exporting to PDF." });
      return;
    }
    exportTasksToPDF(tasks, activeTab);
    showToast("PDF report downloaded", "success");
  };

  return (
    <section className="card task-page-card">
      <div className="task-page-header">
        <div>
          <h2 className="section-title">
            <FontAwesomeIcon icon={faTasks} /> Tasks
          </h2>
          <p className="section-subtitle">Full-stack CRUD with MongoDB Atlas.</p>
        </div>
        <div className="status-pill-badge">
          <FontAwesomeIcon icon={faDatabase} /> MongoDB Cloud
        </div>
      </div>

      <Todo
        taskText={taskText}
        setTaskText={setTaskText}
        taskStatus={taskStatus}
        setTaskStatus={setTaskStatus}
        onSubmit={handleSubmit}
        editing={editingId !== null}
        onCancel={handleCancelEdit}
        tasks={tasks}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        onExportPDF={handleExportPDF}
        onToggleLogs={() => setShowLogs(!showLogs)}
        showLogs={showLogs}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        submitting={submitting}
        deletingId={deletingId}
        updatingStatusId={updatingStatusId}
      />

      {loading && (
        <div className="loading-box">
          <FontAwesomeIcon icon={faSpinner} spin /> Loading tasks...
        </div>
      )}

      {error && !loading && (
        <div className="task-error-banner">
          <span>⚠️ {error}</span>
          <button type="button" className="retry-btn" onClick={loadTasks}>
            <FontAwesomeIcon icon={faSync} /> Retry
          </button>
        </div>
      )}

      {showLogs && (
        <ActivityLogs
          logs={logs}
          loading={loadingLogs}
          onRefresh={loadLogsData}
          onClose={() => setShowLogs(false)}
        />
      )}
    </section>
  );
}

export default Task;
