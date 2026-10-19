const { test, describe, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");

process.env.NODE_ENV = "test";
const { app } = require("../server");

describe("Health Check API Endpoints", () => {
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

  test("GET /health returns HTTP 200 OK with expected JSON structure", async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 500);

    const body = await res.json();
    assert.strictEqual(body.status, "ok");
    assert.strictEqual(body.database, "cloud (MongoDB Atlas)");
    assert.ok(body.timestamp, "Expected timestamp in health response");
    assert.ok(body.practical, "Expected practical title in health response");
  });

  test("GET /api/health alias returns HTTP 200 OK", async () => {
    const res = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(res.status, 500);

    const body = await res.json();
    assert.strictEqual(body.status, "ok");
    assert.strictEqual(body.database, "cloud (MongoDB Atlas)");
  });
});
