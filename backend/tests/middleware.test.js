const { test, describe } = require("node:test");
const assert = require("node:assert");

process.env.NODE_ENV = "test";
const {
  validateTaskId,
  validateTaskInput,
  validateRegisterInput,
  validateLoginInput,
  requireJsonContent,
} = require("../server");

function createMockResponse() {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
  return res;
}

describe("REST API Validation Middlewares", () => {
  describe("validateTaskId", () => {
    test("accepts valid positive integer ID", () => {
      const req = { params: { id: "42" } };
      const res = createMockResponse();
      let nextCalled = false;

      validateTaskId(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.taskId, 42);
    });

    test("rejects negative integer ID with HTTP 400", () => {
      const req = { params: { id: "-5" } };
      const res = createMockResponse();
      let nextCalled = false;

      validateTaskId(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error, "Task ID must be a positive integer");
    });

    test("rejects non-numeric ID with HTTP 400", () => {
      const req = { params: { id: "invalid-id" } };
      const res = createMockResponse();
      let nextCalled = false;

      validateTaskId(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
    });
  });

  describe("validateTaskInput", () => {
    test("accepts valid non-empty title", () => {
      const req = { body: { title: "Complete CI/CD Practical" } };
      const res = createMockResponse();
      let nextCalled = false;

      validateTaskInput(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
    });

    test("rejects empty or whitespace-only title with HTTP 400", () => {
      const req = { body: { title: "   " } };
      const res = createMockResponse();
      let nextCalled = false;

      validateTaskInput(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error, "Task title is required");
    });
  });

  describe("requireJsonContent", () => {
    test("accepts POST request with application/json", () => {
      const req = { method: "POST", headers: { "content-type": "application/json" } };
      const res = createMockResponse();
      let nextCalled = false;

      requireJsonContent(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
    });

    test("rejects POST request with non-JSON content-type with HTTP 415", () => {
      const req = { method: "POST", headers: { "content-type": "text/plain" } };
      const res = createMockResponse();
      let nextCalled = false;

      requireJsonContent(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 415);
      assert.strictEqual(res.body.error, "Content-Type must be application/json");
    });
  });

  describe("validateRegisterInput", () => {
    test("rejects invalid email format", () => {
      const req = { body: { name: "Test User", email: "invalid-email", password: "password123" } };
      const res = createMockResponse();
      let nextCalled = false;

      validateRegisterInput(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error, "Please provide a valid email address format");
    });

    test("rejects password shorter than 6 characters", () => {
      const req = { body: { name: "Test User", email: "user@example.com", password: "123" } };
      const res = createMockResponse();
      let nextCalled = false;

      validateRegisterInput(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error, "Password must be at least 6 characters long");
    });
  });
});
