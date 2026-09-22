import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHistory, faSync, faTimes, faUser, faClock } from "@fortawesome/free-solid-svg-icons";

function ActivityLogs({ logs, loading, onRefresh, onClose }) {
  const getActionBadgeClass = (action) => {
    switch (action) {
      case "CREATE":
        return "badge-action-create";
      case "UPDATE":
        return "badge-action-update";
      case "STATUS_CHANGE":
        return "badge-action-status";
      case "DELETE":
        return "badge-action-delete";
      default:
        return "badge-action-default";
    }
  };

  return (
    <div className="activity-audit-card">
      <div className="audit-header-row">
        <div className="audit-title-block">
          <div className="audit-icon-badge">
            <FontAwesomeIcon icon={faHistory} />
          </div>
          <div>
            <h3>Activity Audit Trail</h3>
            <p>Real-time database operations logged in MongoDB Atlas.</p>
          </div>
        </div>

        <div className="audit-header-actions">
          <button
            type="button"
            className="audit-refresh-btn"
            onClick={onRefresh}
            disabled={loading}
            title="Refresh MongoDB Logs"
          >
            <FontAwesomeIcon icon={faSync} spin={loading} /> {loading ? "Syncing..." : "Refresh"}
          </button>
          {onClose && (
            <button
              type="button"
              className="audit-close-btn"
              onClick={onClose}
              title="Close Audit Trail"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="audit-loading-box">
          <FontAwesomeIcon icon={faSync} spin />
          <span>Fetching activity logs from MongoDB Atlas...</span>
        </div>
      ) : logs.length === 0 ? (
        <p className="audit-empty-message">No activity recorded yet in MongoDB.</p>
      ) : (
        <div className="audit-log-stream">
          {logs.map((log, idx) => (
            <div key={idx} className="audit-log-entry">
              <div className="log-action-col">
                <span className={`log-tag ${getActionBadgeClass(log.action)}`}>
                  {log.action}
                </span>
                <span className="log-detail-text">{log.details}</span>
              </div>

              <div className="log-meta-col">
                <span className="log-user-pill">
                  <FontAwesomeIcon icon={faUser} /> {log.user || "Guest User"}
                </span>
                <span className="log-timestamp">
                  <FontAwesomeIcon icon={faClock} />{" "}
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {new Date(log.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ActivityLogs;
