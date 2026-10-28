const { test, describe } = require("node:test");
const assert = require("node:assert");

process.env.NODE_ENV = "test";
const {
  sendWelcomeEmail,
  sendOtpEmail,
  sendContactFormEmails,
} = require("../mailer");

function restoreEnv(key, prevValue) {
  if (prevValue === undefined) {
    delete process.env[key];
  } else {
    process.env[key] = prevValue;
  }
}

describe("Email Delivery & Fallback Security", () => {
  describe("Non-production simulation mode", () => {
    test("sendContactFormEmails simulates delivery without hardcoded fallbacks", async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevUser = process.env.EMAIL_USER;
      const prevPass = process.env.EMAIL_PASS;
      try {
        process.env.NODE_ENV = "development";
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;

        const result = await sendContactFormEmails({
          name: "Alice",
          email: "alice@example.com",
          message: "Hello from test",
        });

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.simulated, true);
      } finally {
        restoreEnv("NODE_ENV", prevEnv);
        restoreEnv("EMAIL_USER", prevUser);
        restoreEnv("EMAIL_PASS", prevPass);
      }
    });

    test("sendOtpEmail simulates delivery with otp payload in non-production", async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevUser = process.env.EMAIL_USER;
      const prevPass = process.env.EMAIL_PASS;
      try {
        process.env.NODE_ENV = "development";
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;

        const result = await sendOtpEmail("test@example.com", "Tester", "123456");

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.simulated, true);
        assert.strictEqual(result.otp, "123456");
      } finally {
        restoreEnv("NODE_ENV", prevEnv);
        restoreEnv("EMAIL_USER", prevUser);
        restoreEnv("EMAIL_PASS", prevPass);
      }
    });

    test("sendWelcomeEmail simulates delivery in non-production", async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevUser = process.env.EMAIL_USER;
      const prevPass = process.env.EMAIL_PASS;
      try {
        process.env.NODE_ENV = "development";
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;

        const result = await sendWelcomeEmail("test@example.com", "Tester", "Email");

        assert.strictEqual(result.success, true);
        assert.strictEqual(result.simulated, true);
      } finally {
        restoreEnv("NODE_ENV", prevEnv);
        restoreEnv("EMAIL_USER", prevUser);
        restoreEnv("EMAIL_PASS", prevPass);
      }
    });
  });

  describe("Production unconfigured safety checks", () => {
    test("sendContactFormEmails fails safely in production when SMTP is unconfigured", async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevUser = process.env.EMAIL_USER;
      const prevPass = process.env.EMAIL_PASS;
      try {
        process.env.NODE_ENV = "production";
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;

        const result = await sendContactFormEmails({
          name: "Visitor",
          email: "visitor@example.com",
          message: "Production message",
        });

        assert.strictEqual(result.success, false);
        assert.strictEqual(result.simulated, undefined);
        assert.strictEqual(result.error, "Email delivery service is currently not configured.");
      } finally {
        restoreEnv("NODE_ENV", prevEnv);
        restoreEnv("EMAIL_USER", prevUser);
        restoreEnv("EMAIL_PASS", prevPass);
      }
    });

    test("sendOtpEmail fails safely in production when SMTP is unconfigured", async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevUser = process.env.EMAIL_USER;
      const prevPass = process.env.EMAIL_PASS;
      try {
        process.env.NODE_ENV = "production";
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;

        const result = await sendOtpEmail("visitor@example.com", "Visitor", "654321");

        assert.strictEqual(result.success, false);
        assert.strictEqual(result.simulated, undefined);
        assert.strictEqual(result.error, "Email delivery service is not configured.");
      } finally {
        restoreEnv("NODE_ENV", prevEnv);
        restoreEnv("EMAIL_USER", prevUser);
        restoreEnv("EMAIL_PASS", prevPass);
      }
    });

    test("sendWelcomeEmail fails safely in production when SMTP is unconfigured", async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevUser = process.env.EMAIL_USER;
      const prevPass = process.env.EMAIL_PASS;
      try {
        process.env.NODE_ENV = "production";
        delete process.env.EMAIL_USER;
        delete process.env.EMAIL_PASS;

        const result = await sendWelcomeEmail("visitor@example.com", "Visitor", "Email");

        assert.strictEqual(result.success, false);
        assert.strictEqual(result.simulated, undefined);
        assert.strictEqual(result.error, "Email delivery service is not configured.");
      } finally {
        restoreEnv("NODE_ENV", prevEnv);
        restoreEnv("EMAIL_USER", prevUser);
        restoreEnv("EMAIL_PASS", prevPass);
      }
    });
  });
});
