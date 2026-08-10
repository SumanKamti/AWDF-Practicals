function Todo({
  taskText,
  setTaskText,
  onSubmit,
  editing,
  onCancel,
  tasks,
  onEdit,
  onDelete,
}) {
  return (
    <div className="todo-container">
      <form className="task-form" onSubmit={onSubmit}>
        <input
          type="text"
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          placeholder="Write a task..."
        />

        <button type="submit">
          {editing ? "✏ Update Task" : "➕ Add Task"}
        </button>

        {editing && (
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </form>

      <div className="task-list">
        {tasks.length === 0 ? (
          <p className="empty-state">No tasks yet. Add one above.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="task-item">
              <span>{task.title}</span>

              <div className="task-actions">
                <button type="button" onClick={() => onEdit(task)}>
                  Update
                </button>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => onDelete(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Todo;
