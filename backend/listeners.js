const taskEvents = require("./events");

let listenersRegistered = false;

/**
 * Register event listeners for task-related events.
 * Idempotent: ensures listeners are registered exactly once.
 */
function registerTaskListeners() {
  if (listenersRegistered) {
    return;
  }
  listenersRegistered = true;

  // 1. Error Listener: Handle custom notification error events first
  taskEvents.on("notification-error", (errData) => {
    const timestamp = new Date().toISOString();
    console.error(`[Notification Error] [${timestamp}] Notification processing failed:`, errData.message || errData);
  });

  // Catch standard 'error' events to prevent unhandled EventEmitter error crashes
  taskEvents.on("error", (err) => {
    const timestamp = new Date().toISOString();
    console.error(`[Notification Error] [${timestamp}] Unhandled EventEmitter error:`, err.message || err);
  });

  // 2. 'task-created' listener
  taskEvents.on("task-created", (task) => {
    try {
      const startTime = new Date().toISOString();
      const taskId = task.id !== undefined ? task.id : task._id;
      console.log(`[Notification] [${startTime}] Handler started for task-created event | Task #${taskId}: "${task.title}"`);

      // Simulate 2 seconds (2000 ms) background notification processing (e.g., email dispatch, webhook, push notification)
      setTimeout(() => {
        try {
          const completionTime = new Date().toISOString();
          // Use actual field from existing schema: userId
          const assignedUser = task.userId !== undefined && task.userId !== null
            ? task.userId.toString()
            : "Unassigned";

          console.log(`[Notification] [${completionTime}] Background notification completed:`);
          console.log(`               - Task Title: "${task.title}"`);
          console.log(`               - Assigned User (userId): ${assignedUser}`);
          console.log(`               - Completed At: ${completionTime}`);
        } catch (asyncErr) {
          taskEvents.emit("notification-error", {
            context: "task-created:async-callback",
            taskId: task.id || task._id,
            message: asyncErr.message,
            stack: asyncErr.stack,
          });
        }
      }, 2000);
    } catch (syncErr) {
      taskEvents.emit("notification-error", {
        context: "task-created:sync-handler",
        taskId: task && (task.id || task._id),
        message: syncErr.message,
        stack: syncErr.stack,
      });
    }
  });

  // 3. 'task-deleted' listener
  taskEvents.on("task-deleted", (task) => {
    try {
      const timestamp = new Date().toISOString();
      const taskId = task.id !== undefined ? task.id : task._id;
      console.log(`[Notification] [${timestamp}] Task deletion notification: Task #${taskId} ("${task.title}") was successfully deleted.`);
    } catch (err) {
      taskEvents.emit("notification-error", {
        context: "task-deleted:handler",
        taskId: task && (task.id || task._id),
        message: err.message,
        stack: err.stack,
      });
    }
  });
}

// Auto-register upon import
registerTaskListeners();

module.exports = {
  registerTaskListeners,
};
