const EventEmitter = require("events");

/**
 * TaskEvents - Custom EventEmitter for Task Management lifecycle events
 * AWDF Practical 10: Asynchronous Processing with Event-Driven Architecture
 */
class TaskEvents extends EventEmitter {}

// Export a single shared instance (Singleton pattern) to be reused across the application
const taskEvents = new TaskEvents();

module.exports = taskEvents;
