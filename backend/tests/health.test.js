const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");

process.env.NODE_ENV = "test";
const { app, getAllowedOrigins } = require("../server");
const { configureDns } = require("../db");

describe("Health Check API Endpoints & Production Infrastructure", () => {
  let server;
  let baseUrl;

  before((_, done) => {
    // Start ephemeral server on dynamic port (port 0)
    server = app.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      done();
    });
  });

  after((_, done) => {
    if (server) {
      server.close(done);
    } else {
      done();
    }
  });

  describe("GET /health status evaluation", () => {
    test("returns HTTP 200 OK in test environment without live database", async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.strictEqual(res.status, 200);

      const body = await res.json();
      assert.strictEqual(body.status, "ok");
      assert.ok(body.timestamp, "Expected timestamp in health response");
      assert.ok(body.practical, "Expected practical title in health response");
    });

    test("GET /api/health alias returns HTTP 200 OK", async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      assert.strictEqual(res.status, 200);

      const body = await res.json();
      assert.strictEqual(body.status, "ok");
    });

    test("returns HTTP 200 when Mongoose is connected in production mode", async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevReadyState = mongoose.connection.readyState;
      try {
        process.env.NODE_ENV = "production";
        Object.defineProperty(mongoose.connection, "readyState", { value: 1, configurable: true });

        const res = await fetch(`${baseUrl}/health`);
        assert.strictEqual(res.status, 200);

        const body = await res.json();
        assert.strictEqual(body.status, "ok");
        assert.strictEqual(body.database, "connected");
        assert.strictEqual(body.readyState, 1);
      } finally {
        process.env.NODE_ENV = prevEnv;
        Object.defineProperty(mongoose.connection, "readyState", { value: prevReadyState, configurable: true });
      }
    });

    test("returns HTTP 503 when Mongoose is disconnected in production mode", async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevReadyState = mongoose.connection.readyState;
      try {
        process.env.NODE_ENV = "production";
        Object.defineProperty(mongoose.connection, "readyState", { value: 0, configurable: true });

        const res = await fetch(`${baseUrl}/health`);
        assert.strictEqual(res.status, 503);

        const body = await res.json();
        assert.strictEqual(body.status, "degraded");
        assert.strictEqual(body.database, "disconnected");
        assert.strictEqual(body.readyState, 0);

        // Ensures no credentials or secrets are leaked
        const rawJson = JSON.stringify(body);
        assert.ok(!rawJson.includes("mongodb+srv"));
        assert.ok(!rawJson.includes("password"));
      } finally {
        process.env.NODE_ENV = prevEnv;
        Object.defineProperty(mongoose.connection, "readyState", { value: prevReadyState, configurable: true });
      }
    });
  });

  describe("CORS multi-origin configuration", () => {
    test("getAllowedOrigins parses comma-separated origins and trims whitespace", () => {
      const prevClientUrl = process.env.CLIENT_URL;
      try {
        process.env.CLIENT_URL = " https://awdf-portfolio.vercel.app , http://localhost:5173 , https://preview.vercel.app ";
        const origins = getAllowedOrigins();
        assert.deepStrictEqual(origins, [
          "https://awdf-portfolio.vercel.app",
          "http://localhost:5173",
          "https://preview.vercel.app",
        ]);
      } finally {
        process.env.CLIENT_URL = prevClientUrl;
      }
    });

    test("allows request with no Origin header (health checks, server-to-server)", async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.strictEqual(res.status, 200);
    });

    test("allows preflight OPTIONS request for configured origin", async () => {
      const res = await fetch(`${baseUrl}/health`, {
        method: "OPTIONS",
        headers: {
          Origin: "http://localhost:5173",
          "Access-Control-Request-Method": "GET",
        },
      });
      assert.strictEqual(res.status, 204);
      assert.strictEqual(res.headers.get("access-control-allow-origin"), "http://localhost:5173");
    });

    test("rejects request from unapproved origin with HTTP 403 without leaking configuration", async () => {
      const res = await fetch(`${baseUrl}/health`, {
        headers: {
          Origin: "https://malicious-unapproved-site.com",
        },
      });
      assert.strictEqual(res.status, 403);
      assert.strictEqual(res.headers.get("access-control-allow-origin"), null);

      const body = await res.json();
      assert.strictEqual(body.error, "CORS origin not allowed");
    });
  });

  describe("DNS platform resolver configuration", () => {
    test("configureDns returns platform default resolvers when DNS_SERVERS is unset", () => {
      const prevDns = process.env.DNS_SERVERS;
      try {
        delete process.env.DNS_SERVERS;
        const servers = configureDns();
        assert.ok(Array.isArray(servers) && servers.length > 0);
      } finally {
        process.env.DNS_SERVERS = prevDns;
      }
    });

    test("configureDns returns platform default resolvers when DNS_SERVERS is whitespace", () => {
      const prevDns = process.env.DNS_SERVERS;
      try {
        process.env.DNS_SERVERS = "   ";
        const servers = configureDns();
        assert.ok(Array.isArray(servers) && servers.length > 0);
      } finally {
        process.env.DNS_SERVERS = prevDns;
      }
    });

    test("configureDns applies explicit DNS_SERVERS override when provided", () => {
      const prevDns = process.env.DNS_SERVERS;
      try {
        const custom = configureDns("8.8.8.8, 8.8.4.4");
        assert.deepStrictEqual(custom, ["8.8.8.8", "8.8.4.4"]);
      } finally {
        process.env.DNS_SERVERS = prevDns;
      }
    });

    test("configureDns throws safe configuration error when invalid DNS_SERVERS are supplied", () => {
      const prevDns = process.env.DNS_SERVERS;
      try {
        assert.throws(
          () => configureDns("invalid-dns-host, 999.999.999.999"),
          (err) => {
            assert.strictEqual(err.code, "INVALID_DNS_SERVERS");
            assert.match(err.message, /Invalid DNS_SERVERS configured/);
            return true;
          }
        );
      } finally {
        process.env.DNS_SERVERS = prevDns;
      }
    });
  });

  describe("Security: strict Authorization header verification on PDF export", () => {
    test("rejects GET /tasks/export-pdf?token=... with HTTP 401 when Authorization header is missing", async () => {
      const res = await fetch(`${baseUrl}/tasks/export-pdf?token=dummy-jwt-token-value`);
      assert.strictEqual(res.status, 401);

      const body = await res.json();
      assert.match(body.error, /Expected 'Authorization: Bearer <token>'/);
    });

    test("rejects GET /api/tasks/export-pdf?token=... alias with HTTP 401 when Authorization header is missing", async () => {
      const res = await fetch(`${baseUrl}/api/tasks/export-pdf?token=dummy-jwt-token-value`);
      assert.strictEqual(res.status, 401);
    });
  });
});
