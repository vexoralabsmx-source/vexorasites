/**
 * postbuild.js — runs after vinext build
 * 1. Cleans dist/server/wrangler.json for Cloudflare Pages validation
 * 2. Creates a Vercel-compatible api/server bundle
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1"));
const ROOT = path.resolve(__dirname, "..");

// ── 1. Clean wrangler.json ─────────────────────────────────────────────────
const wranglerJson = path.join(ROOT, "dist", "server", "wrangler.json");
if (fs.existsSync(wranglerJson)) {
  try {
    const json = JSON.parse(fs.readFileSync(wranglerJson, "utf-8"));
    const invalidFields = [
      "main", "rules", "assets", "definedEnvironments",
      "ai_search_namespaces", "ai_search", "secrets_store_secrets",
      "artifacts", "unsafe_hello_world", "flagship", "worker_loaders",
      "ratelimits", "vpc_services", "vpc_networks", "python_modules",
    ];
    invalidFields.forEach((f) => delete json[f]);
    if (json.dev) {
      delete json.dev.enable_containers;
      delete json.dev.generate_types;
    }
    fs.writeFileSync(wranglerJson, JSON.stringify(json, null, 2));
    console.log("✓ Cleaned dist/server/wrangler.json");
  } catch (err) {
    console.warn("Could not clean wrangler.json:", err?.message);
  }
}

// ── 2. Bundle api/server.js with esbuild for Vercel ───────────────────────
const apiDir = path.join(ROOT, "api");
if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });

const serverSrc = path.join(ROOT, "api", "server.js");
const serverOut = path.join(ROOT, "api", "server.bundle.js");

if (fs.existsSync(serverSrc)) {
  try {
    console.log("Bundling api/server.js with esbuild...");
    execSync(
      `node_modules/.bin/esbuild "${serverSrc}" --bundle --platform=node --target=node22 --format=esm --external:node_modules --outfile="${serverOut}"`,
      { cwd: ROOT, stdio: "inherit" }
    );
    console.log("✓ Bundled api/server.js →", serverOut);
  } catch (err) {
    console.warn("esbuild bundling failed (non-fatal):", err?.message);
  }
}

console.log("✅ postbuild complete");
