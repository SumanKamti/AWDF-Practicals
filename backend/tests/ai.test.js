const { test, describe, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");

process.env.NODE_ENV = "test";
const {
  generateTaskDescription,
  getResolvedModel,
  checkRateLimit,
  recordRateLimit,
  clearRateLimit,
  resetRateLimits,
  getRateLimitKey,
} = require("../ai");
const { validateTaskInput } = require("../server");

describe("Practical 13: Google Gemini AI Integration & Rate Limiting", () => {
  beforeEach(() => {
    resetRateLimits();
  });

  describe("generateTaskDescription core service", () => {
    test("successfully generates description with a mocked Gemini response", async () => {
      const mockDescription = "Design and implement responsive layout components using modern CSS.";
      const result = await generateTaskDescription("Build Portfolio Layout", {
        apiKey: "dummy-test-key-for-mocking",
        mockGenerator: async (title) => {
          assert.strictEqual(title, "Build Portfolio Layout");
          return {
            description: mockDescription,
            disclaimer: "AI-generated suggestion. Please review and edit before saving.",
          };
        },
      });

      assert.strictEqual(result.description, mockDescription);
      assert.ok(result.disclaimer.includes("AI-generated suggestion"));
    });

    test("rejects empty or whitespace-only task title with HTTP 400", async () => {
      await assert.rejects(
        async () => {
          await generateTaskDescription("   ");
        },
        (err) => {
          assert.strictEqual(err.status, 400);
          assert.strictEqual(err.code, "INVALID_TITLE");
          assert.ok(err.message.includes("Task title is required"));
          return true;
        }
      );
    });

    test("fails safely with HTTP 503 when GEMINI_API_KEY is missing or placeholder", async () => {
      await assert.rejects(
        async () => {
          await generateTaskDescription("Valid Title", { apiKey: "" });
        },
        (err) => {
          assert.strictEqual(err.status, 503);
          assert.strictEqual(err.code, "AI_KEY_MISSING");
          assert.ok(err.message.includes("GEMINI_API_KEY"));
          return true;
        }
      );

      await assert.rejects(
        async () => {
          await generateTaskDescription("Valid Title", { apiKey: "your_gemini_api_key_here" });
        },
        (err) => {
          assert.strictEqual(err.status, 503);
          assert.strictEqual(err.code, "AI_KEY_MISSING");
          return true;
        }
      );
    });

    test("handles API timeout gracefully with HTTP 504", async () => {
      await assert.rejects(
        async () => {
          await generateTaskDescription("Complex Architecture Task", {
            apiKey: "dummy-test-key",
            timeoutMs: 50, // 50ms timeout
            mockGenerator: async () => {
              // Simulate hanging API call
              await new Promise((resolve) => setTimeout(resolve, 200));
              return { description: "Late response" };
            },
          });
        },
        (err) => {
          assert.strictEqual(err.status, 504);
          assert.strictEqual(err.code, "AI_TIMEOUT");
          assert.ok(err.message.includes("timed out"));
          return true;
        }
      );
    });
  });

  describe("Model resolution and configuration", () => {
    const originalEnvModel = process.env.GEMINI_MODEL;

    afterEach(() => {
      if (originalEnvModel !== undefined) {
        process.env.GEMINI_MODEL = originalEnvModel;
      } else {
        delete process.env.GEMINI_MODEL;
      }
    });

    test("defaults to gemini-3.8-flash when neither option nor env is set", () => {
      delete process.env.GEMINI_MODEL;
      assert.strictEqual(getResolvedModel(), "gemini-3.8-flash");
    });

    test("prioritizes process.env.GEMINI_MODEL over default fallback", () => {
      process.env.GEMINI_MODEL = "gemini-2.5-flash";
      assert.strictEqual(getResolvedModel(), "gemini-2.5-flash");
    });

    test("prioritizes options.modelName over process.env.GEMINI_MODEL", () => {
      process.env.GEMINI_MODEL = "gemini-3.8-flash";
      assert.strictEqual(
        getResolvedModel({ modelName: "custom-gemini-model" }),
        "custom-gemini-model"
      );
    });

    test("generateTaskDescription passes resolved model to generator", async () => {
      let passedModel = null;
      await generateTaskDescription("Test Model Passing", {
        apiKey: "dummy-key",
        modelName: "test-model-identifier",
        mockGenerator: async (title, model) => {
          passedModel = model;
          return { description: "Test description" };
        },
      });

      assert.strictEqual(passedModel, "test-model-identifier");
    });
  });

  describe("AI Rate Limiting (1 request per task per minute)", () => {
    const userId = "test_user_ai_001";

    test("generates normalized rate limit keys for new and existing tasks", () => {
      const newKey = getRateLimitKey(userId, "  Configure  MongoDB  Atlas  ");
      const existingKey = getRateLimitKey(userId, "Any Title", 42);

      assert.strictEqual(newKey, "ai:rate:test_user_ai_001:title:configure mongodb atlas");
      assert.strictEqual(existingKey, "ai:rate:test_user_ai_001:task:42");
    });

    test("enforces maximum of 1 AI request per minute per task", () => {
      const title = "Implement Caching";

      // 1st request: not limited
      const check1 = checkRateLimit(userId, title);
      assert.strictEqual(check1.limited, false);
      recordRateLimit(check1.key);

      // 2nd request immediately after: rate limited
      const check2 = checkRateLimit(userId, title);
      assert.strictEqual(check2.limited, true);
      assert.ok(check2.secondsRemaining > 0 && check2.secondsRemaining <= 60);

      // Different task / title: not limited
      const checkDifferent = checkRateLimit(userId, "Different Task");
      assert.strictEqual(checkDifferent.limited, false);
    });

    test("clears rate limit when clearRateLimit is called", () => {
      const title = "Retry After Error Task";
      const { key } = checkRateLimit(userId, title);
      recordRateLimit(key);

      assert.strictEqual(checkRateLimit(userId, title).limited, true);
      clearRateLimit(key);
      assert.strictEqual(checkRateLimit(userId, title).limited, false);
    });
  });

  describe("Normal Task Creation without AI", () => {
    test("validateTaskInput accepts title without description (defaults to empty string)", () => {
      const req = { body: { title: "Manual Task Without AI" } };
      const res = { status: () => res, json: () => res };
      let nextCalled = false;

      validateTaskInput(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.taskInput.title, "Manual Task Without AI");
      assert.strictEqual(req.taskInput.description, "");
      assert.strictEqual(req.taskInput.status, "incomplete");
    });

    test("validateTaskInput preserves manually written description", () => {
      const req = {
        body: {
          title: "Manual Task",
          description: "Written entirely by user without AI assistance.",
        },
      };
      const res = { status: () => res, json: () => res };
      let nextCalled = false;

      validateTaskInput(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.taskInput.title, "Manual Task");
      assert.strictEqual(
        req.taskInput.description,
        "Written entirely by user without AI assistance."
      );
    });
  });
});
