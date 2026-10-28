const { test, describe } = require("node:test");
const assert = require("node:assert");

process.env.NODE_ENV = "test";
const jwt = require("jsonwebtoken");
const {
  validateTaskId,
  validateTaskInput,
  validateRegisterInput,
  validateLoginInput,
  requireJsonContent,
  authMiddleware,
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

  describe("authMiddleware", () => {
    const testSecret = process.env.JWT_SECRET || "fallback_task_secret_key_jwt_2026";

    test("rejects request when no Authorization header is provided with HTTP 401", () => {
      const req = { headers: {} };
      const res = createMockResponse();
      let nextCalled = false;

      authMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
      assert.match(res.body.error, /Expected 'Authorization: Bearer <token>'/);
    });

    test("rejects request when token is passed exclusively via query parameter ?token=...", () => {
      const validToken = jwt.sign({ id: "user123" }, testSecret);
      const req = { headers: {}, query: { token: validToken } };
      const res = createMockResponse();
      let nextCalled = false;

      authMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
      assert.match(res.body.error, /Expected 'Authorization: Bearer <token>'/);
    });

    test("rejects invalid Bearer token with HTTP 401", () => {
      const req = { headers: { authorization: "Bearer invalid.token.value" } };
      const res = createMockResponse();
      let nextCalled = false;

      authMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 401);
      assert.match(res.body.error, /Invalid authentication token/);
    });

    test("accepts valid Bearer token and attaches user payload", () => {
      const validToken = jwt.sign({ id: "user123", email: "test@example.com" }, testSecret);
      const req = { headers: { authorization: `Bearer ${validToken}` } };
      const res = createMockResponse();
      let nextCalled = false;

      authMiddleware(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user.id, "user123");
      assert.strictEqual(req.user.email, "test@example.com");
    });
  });
});
