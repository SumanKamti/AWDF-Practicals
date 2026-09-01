import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPen,
  faTrash,
  faFilePdf,
  faHistory,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";

function Todo({
  taskText,
  setTaskText,
  taskStatus,
  setTaskStatus,
  onSubmit,
  editing,
  onCancel,
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onExportPDF,
  onToggleLogs,
  showLogs,
  activeTab,
  setActiveTab,
  submitting = false,
  deletingId = null,
  updatingStatusId = null,
}) {
  const counts = {
    all: tasks.length,
    ongoing: tasks.filter((t) => (t.status || "ongoing") === "ongoing").length,
    complete: tasks.filter((t) => (t.status || "ongoing") === "complete").length,
    incomplete: tasks.filter((t) => (t.status || "ongoing") === "incomplete").length,
  };

  const filteredTasks = tasks.filter((t) => {
    if (activeTab === "all") return true;
    return (t.status || "ongoing") === activeTab;
  });

  return (
    <div className="todo-container">
      {/* Top Toolbar: Segmented Tabs + Action Buttons */}
      <div className="task-toolbar-row">
        <div className="segmented-tabs" role="tablist">
          <button
            type="button"
            className={`tab-segment ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All <span className="tab-badge">{counts.all}</span>
          </button>
          <button
            type="button"
            className={`tab-segment ${activeTab === "ongoing" ? "active" : ""}`}
            onClick={() => setActiveTab("ongoing")}
          >
            Ongoing <span className="tab-badge">{counts.ongoing}</span>
          </button>
          <button
            type="button"
            className={`tab-segment ${activeTab === "complete" ? "active" : ""}`}
            onClick={() => setActiveTab("complete")}
          >
            Complete <span className="tab-badge">{counts.complete}</span>
          </button>
          <button
            type="button"
            className={`tab-segment ${activeTab === "incomplete" ? "active" : ""}`}
            onClick={() => setActiveTab("incomplete")}
          >
            Incomplete <span className="tab-badge">{counts.incomplete}</span>
          </button>
        </div>

        <div className="toolbar-action-group">
          <button
            type="button"
            className="tool-btn pdf-btn"
            onClick={onExportPDF}
            title="Download Tasks PDF Report"
          >
            <FontAwesomeIcon icon={faFilePdf} /> PDF Report
          </button>
          <button
            type="button"
            className={`tool-btn logs-btn ${showLogs ? "active" : ""}`}
            onClick={onToggleLogs}
            title="Toggle Activity Audit Trail"
          >
            <FontAwesomeIcon icon={faHistory} /> {showLogs ? "Hide Logs" : "Activity Logs"}
          </button>
        </div>
      </div>

      {/* Modern Add / Edit Form Bar */}
      <form className="modern-task-form" onSubmit={onSubmit}>
        <div className="form-input-wrapper">
          <input
            type="text"
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Write a task (e.g. Implement React + Node + MongoDB)..."
            disabled={submitting}
          />
        </div>

        <div className="form-select-wrapper">
          <select
            value={taskStatus}
            onChange={(e) => setTaskStatus(e.target.value)}
            disabled={submitting}
            className="modern-status-select"
          >
            <option value="ongoing">🕒 Ongoing</option>
            <option value="complete">✅ Complete</option>
            <option value="incomplete">❌ Incomplete</option>
          </select>
        </div>

        <div className="form-buttons-wrapper">
          <button
            type="submit"
            className="modern-submit-btn"
            disabled={submitting || !taskText.trim()}
          >
            {submitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Saving...
              </>
            ) : editing ? (
              <>
                <FontAwesomeIcon icon={faPen} /> Update
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPlus} /> Add Task
              </>
            )}
          </button>

          {editing && (
            <button
              type="button"
              className="modern-cancel-btn"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Task Rows List */}
      <div className="modern-task-list">
        {filteredTasks.length === 0 ? (
          <div className="empty-tasks-placeholder">
            <p>No {activeTab !== "all" ? activeTab : ""} tasks found.</p>
            <span>Add a new task using the form above.</span>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDeleting = deletingId === task.id;
            const isUpdating = updatingStatusId === task.id;
            const status = task.status || "ongoing";

            return (
              <div key={task.id} className={`modern-task-card card-status-${status}`}>
                <div className="task-left-section">
                  <span className="modern-id-tag">#{task.id}</span>
                  <span className="modern-task-title">{task.title}</span>
                </div>

                <div className="task-right-section">
                  <div className="status-dropdown-container">
                    <select
                      className={`status-pill-select select-${status}`}
                      value={status}
                      onChange={(e) => onStatusChange(task.id, e.target.value)}
                      disabled={isUpdating || submitting || isDeleting}
                    >
                      <option value="ongoing">🕒 Ongoing</option>
                      <option value="complete">✅ Complete</option>
                      <option value="incomplete">❌ Incomplete</option>
                    </select>
                  </div>

                  <div className="task-btn-group">
                    <button
                      type="button"
                      className="task-icon-btn edit-btn"
                      onClick={() => onEdit(task)}
                      disabled={submitting || isDeleting}
                      title="Edit Title"
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>

                    <button
                      type="button"
                      className="task-icon-btn delete-btn"
                      onClick={() => onDelete(task.id, task.title)}
                      disabled={submitting || isDeleting}
                      title="Delete Task"
                    >
                      {isDeleting ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faTrash} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Todo;
