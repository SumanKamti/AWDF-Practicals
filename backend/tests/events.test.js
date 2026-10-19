const { test, describe } = require("node:test");
const assert = require("node:assert");
const EventEmitter = require("events");

const taskEvents = require("../events");

describe("Practical 10: Event-Driven Architecture (EventEmitter)", () => {
  test("taskEvents is an instance of EventEmitter", () => {
    assert.ok(taskEvents instanceof EventEmitter);
  });

  test("emits and receives 'task-created' event with accurate payload", (t, done) => {
    const sampleTask = {
      id: 88,
      title: "CI Pipeline Task Notification",
      status: "incomplete",
      userId: "user_test_event_88",
    };

    taskEvents.once("task-created", (receivedTask) => {
      assert.strictEqual(receivedTask.id, sampleTask.id);
      assert.strictEqual(receivedTask.title, sampleTask.title);
      assert.strictEqual(receivedTask.userId, sampleTask.userId);
      done();
    });

    taskEvents.emit("task-created", sampleTask);
  });

  test("emits and receives 'task-deleted' event", (t, done) => {
    const deletedTask = {
      id: 88,
      title: "Deleted CI Task",
    };

    taskEvents.once("task-deleted", (receivedTask) => {
      assert.strictEqual(receivedTask.id, 88);
      assert.strictEqual(receivedTask.title, "Deleted CI Task");
      done();
    });

    taskEvents.emit("task-deleted", deletedTask);
  });
});
