import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDatabase,
  faSpinner,
  faSync,
  faTasks,
  faLock,
  faSignInAlt,
  faUserPlus,
  faShieldAlt,
} from "@fortawesome/free-solid-svg-icons";
import Todo from "../components/Todo";
import ActivityLogs from "../components/ActivityLogs";
import { useAuth } from "../context/AuthContext";
import { getTasks, createTask, updateTask, deleteTask, getLogs } from "../services/api";
import { exportTasksToPDF } from "../utils/pdfExport";

function Task() {
  const { user, isAuthenticated, openLoginModal, openRegisterModal } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [taskStatus, setTaskStatus] = useState("incomplete");
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
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

  const loadTasks = useCallback(async () => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated]);

  const loadLogsData = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingLogs(true);
    try {
      const data = await getLogs();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load activity logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTasks();
    } else {
      setTasks([]);
      setLogs([]);
      setShowLogs(false);
    }
  }, [isAuthenticated, loadTasks]);

  useEffect(() => {
    if (showLogs && isAuthenticated) {
      loadLogsData();
    }
  }, [showLogs, isAuthenticated, loadLogsData]);

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
        setTaskStatus("incomplete");
      } else {
        // All new tasks automatically start as "incomplete"
        const created = await createTask(trimmedText, "incomplete");
        setTasks((prev) => [...prev, created]);

        showToast("Task created!", "success");
        setTaskText("");
        setTaskStatus("incomplete");
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
    const currentTask = tasks.find((t) => t.id === id);
    if (currentTask && currentTask.status === "complete") {
      Swal.fire({
        icon: "warning",
        title: "Task is Finalized",
        text: "Completed tasks are final and cannot be changed back to ongoing or incomplete.",
      });
      return;
    }

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
    if (task.status === "complete") {
      Swal.fire({
        icon: "info",
        title: "Task is Finalized",
        text: "Completed tasks are final and cannot be edited.",
      });
      return;
    }
    setTaskText(task.title);
    setTaskStatus(task.status || "incomplete");
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
        setTaskStatus("incomplete");
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
    setTaskStatus("incomplete");
    setEditingId(null);
  };

  const handleExportPDF = async () => {
    if (tasks.length === 0) {
      Swal.fire({ icon: "info", title: "No Tasks", text: "Add tasks before exporting to PDF." });
      return;
    }

    // Default dates: past 30 days to today
    const today = new Date().toISOString().split("T")[0];
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 30);
    const defaultStartDate = pastDate.toISOString().split("T")[0];

    const { value: formValues } = await Swal.fire({
      title: "Download Tasks PDF by Date Range",
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.5; color: #334155;">
          <p style="margin: 0 0 14px; color: #64748b;">
            Select a timeline date range to download only the tasks created within that period:
          </p>

          <div class="pdf-modal-container">
            <div class="pdf-modal-field">
              <label class="pdf-modal-label">From Date (Start):</label>
              <input
                type="date"
                id="pdf-start-date"
                class="pdf-modal-input"
                value="${defaultStartDate}"
              />
            </div>

            <div class="pdf-modal-field">
              <label class="pdf-modal-label">To Date (End):</label>
              <input
                type="date"
                id="pdf-end-date"
                class="pdf-modal-input"
                value="${today}"
              />
            </div>

            <div class="pdf-modal-field">
              <label class="pdf-modal-label">Status Filter:</label>
              <select
                id="pdf-status-filter"
                class="pdf-modal-select"
              >
                <option value="all" ${activeTab === "all" ? "selected" : ""}>All Statuses</option>
                <option value="incomplete" ${activeTab === "incomplete" ? "selected" : ""}>Incomplete Only</option>
                <option value="ongoing" ${activeTab === "ongoing" ? "selected" : ""}>Ongoing Only</option>
                <option value="complete" ${activeTab === "complete" ? "selected" : ""}>Complete Only</option>
              </select>
            </div>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Download PDF",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      focusConfirm: false,
      preConfirm: () => {
        const start = document.getElementById("pdf-start-date").value;
        const end = document.getElementById("pdf-end-date").value;
        const status = document.getElementById("pdf-status-filter").value;

        if (start && end && start > end) {
          Swal.showValidationMessage("Start date cannot be later than End date.");
          return false;
        }

        return { startDate: start, endDate: end, statusFilter: status };
      },
    });

    if (!formValues) return;

    const { startDate, endDate, statusFilter } = formValues;

    // Filter tasks matching status and date range
    const filtered = tasks.filter((task) => {
      if (statusFilter !== "all" && (task.status || "incomplete") !== statusFilter) {
        return false;
      }

      const taskDateStr = task.createdAt || task.updatedAt;
      if (taskDateStr) {
        const taskDate = new Date(taskDateStr);
        if (startDate) {
          const start = new Date(startDate + "T00:00:00.000");
          if (taskDate < start) return false;
        }
        if (endDate) {
          const end = new Date(endDate + "T23:59:59.999");
          if (taskDate > end) return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Matching Tasks",
        text: `No tasks found within the selected timeline (${startDate || "Beginning"} to ${endDate || "Today"}).`,
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    exportTasksToPDF(filtered, {
      filterTab: statusFilter,
      startDate,
      endDate,
    });

    showToast(`PDF downloaded (${filtered.length} tasks in range)!`, "success");
  };

  return (
    <section className="card task-page-card">
      <div className="task-page-header">
        <div>
          <h2 className="section-title">
            <FontAwesomeIcon icon={faTasks} /> Tasks Manager
          </h2>
          <p className="section-subtitle">
            {isAuthenticated
              ? `Personal workspace for ${user?.name || user?.email} · JWT Protected`
              : "Practical 7: JWT-Authenticated Task Pipeline"}
          </p>
        </div>
        <div className="status-pill-badge">
          <FontAwesomeIcon icon={isAuthenticated ? faShieldAlt : faDatabase} />{" "}
          {isAuthenticated ? "JWT Authenticated" : "MongoDB Cloud"}
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="auth-locked-container">
          <div className="auth-locked-card">
            <div className="locked-icon-halo">
              <FontAwesomeIcon icon={faLock} />
            </div>
            <h3>Protected Task Route</h3>
            <p>
              Authentication is required to view, create, and manage your private tasks. Passwords are securely hashed with <strong>bcrypt</strong> and routes are guarded by Express JWT middleware.
            </p>
            <div className="locked-action-group">
              <button
                type="button"
                className="locked-btn primary-locked-btn"
                onClick={openLoginModal}
              >
                <FontAwesomeIcon icon={faSignInAlt} /> Log In
              </button>
              <button
                type="button"
                className="locked-btn secondary-locked-btn"
                onClick={openRegisterModal}
              >
                <FontAwesomeIcon icon={faUserPlus} /> Register New Account
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
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
              <FontAwesomeIcon icon={faSpinner} spin /> Loading your tasks...
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
        </>
      )}
    </section>
  );
}

export default Task;
