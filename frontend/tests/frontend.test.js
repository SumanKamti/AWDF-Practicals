import { test, describe } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

describe("Frontend Architecture and Production Configuration", () => {
  test("package.json includes required React and Vite dependencies", () => {
    const pkgPath = path.join(rootDir, "package.json");
    assert.ok(fs.existsSync(pkgPath), "frontend/package.json must exist");

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    assert.ok(pkg.dependencies.react, "React dependency is required");
    assert.ok(pkg.dependencies["react-dom"], "React DOM dependency is required");
    assert.ok(pkg.dependencies["react-router-dom"], "React Router DOM is required");
    assert.ok(pkg.devDependencies.vite, "Vite devDependency is required");
    assert.ok(pkg.scripts.build, "build script is required");
  });

  test("index.html contains root container and viewport meta tag", () => {
    const indexPath = path.join(rootDir, "index.html");
    assert.ok(fs.existsSync(indexPath), "frontend/index.html must exist");

    const html = fs.readFileSync(indexPath, "utf8");
    assert.ok(html.includes('<div id="root"></div>'), "Missing #root container in index.html");
    assert.ok(html.includes('name="viewport"'), "Missing viewport meta tag");
  });

  test("nginx.conf contains SPA fallback routing and backend reverse proxy", () => {
    const nginxPath = path.join(rootDir, "nginx.conf");
    assert.ok(fs.existsSync(nginxPath), "frontend/nginx.conf must exist");

    const nginxConfig = fs.readFileSync(nginxPath, "utf8");
    assert.ok(
      nginxConfig.includes("try_files $uri $uri/ /index.html;"),
      "Nginx must configure try_files fallback to /index.html for React SPA"
    );
    assert.ok(
      nginxConfig.includes("proxy_pass http://backend:5000;"),
      "Nginx must configure reverse proxy pass to backend container"
    );
  });
});
