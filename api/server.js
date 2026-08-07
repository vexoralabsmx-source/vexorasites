// ── Cloudflare-globals polyfills for Node.js ──────────────────────────────
if (typeof globalThis.caches === "undefined") {
  globalThis.caches = {
    open: async () => ({
      match: async () => undefined,
      put: async () => {},
      delete: async () => false,
    }),
    default: {
      match: async () => undefined,
      put: async () => {},
      delete: async () => false,
    },
  };
}
if (typeof globalThis.navigator === "undefined") {
  globalThis.navigator = { userAgent: "Cloudflare-Workers" };
}

import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR  = join(__dirname, "..");
const CLIENT_DIR = join(ROOT_DIR, "dist", "client");

const MIME = {
  ".js":    "text/javascript",
  ".mjs":   "text/javascript",
  ".css":   "text/css",
  ".html":  "text/html; charset=utf-8",
  ".svg":   "image/svg+xml",
  ".png":   "image/png",
  ".jpg":   "image/jpeg",
  ".jpeg":  "image/jpeg",
  ".webp":  "image/webp",
  ".ico":   "image/x-icon",
  ".woff":  "font/woff",
  ".woff2": "font/woff2",
  ".json":  "application/json",
  ".txt":   "text/plain",
};

// ── Load Worker eagerly at module load time ──────────────────────────────
console.log("[vexora] Loading worker...");
let _workerPromise = null;
function getWorker() {
  if (!_workerPromise) {
    _workerPromise = import(pathToFileURL(join(ROOT_DIR, "dist", "server", "index.js")).href)
      .then((m) => {
        const w = m.default;
        console.log("[vexora] Worker ready — fetch:", typeof w?.fetch);
        return w;
      })
      .catch((err) => {
        console.error("[vexora] Worker load error:", err?.message);
        _workerPromise = null; // reset so it retries
        throw err;
      });
  }
  return _workerPromise;
}

// Start loading immediately
getWorker().catch(() => {});

function buildEnv() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v != null) env[k] = v;
  }
  if (!env.ADMIN_EMAILS) env.ADMIN_EMAILS = "vexoralabsmx@gmail.com";
  return env;
}

// ── Vercel Serverless Handler ────────────────────────────────────────────
export default async function handler(req, res) {
  const pathname = (req.url ?? "/").split("?")[0];
  console.log(`[vexora] ${req.method} ${pathname}`);

  // ── Static files from dist/client ──────────────────────────────────────
  if (pathname !== "/" && !pathname.includes("..") && !pathname.startsWith("/api/")) {
    const filePath = join(CLIENT_DIR, pathname);
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const content = readFileSync(filePath);
      const ext = extname(filePath);
      const mime = MIME[ext] ?? "application/octet-stream";
      res.setHeader("Content-Type", mime);
      res.setHeader(
        "Cache-Control",
        pathname.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600"
      );
      return res.status(200).end(content);
    }
  }

  // ── Worker SSR ─────────────────────────────────────────────────────────
  try {
    const worker = await getWorker();

    if (!worker?.fetch) {
      console.error("[vexora] Worker has no fetch handler");
      return res.status(503).end("Worker not ready");
    }

    const proto  = (req.headers["x-forwarded-proto"] ?? "https").split(",")[0].trim();
    const host   = req.headers.host ?? "vexorasites.shop";
    const fullUrl = `${proto}://${host}${req.url}`;

    const webHeaders = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v != null) webHeaders.set(k, Array.isArray(v) ? v.join(", ") : v);
    }

    let bodyBuffer = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) bodyBuffer = Buffer.concat(chunks);
    }

    const webReq = new Request(fullUrl, {
      method:  req.method,
      headers: webHeaders,
      body:    bodyBuffer ?? undefined,
      duplex:  bodyBuffer ? "half" : undefined,
    });

    const env = buildEnv();
    const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };

    console.log("[vexora] Calling worker.fetch...");
    const webRes = await worker.fetch(webReq, env, ctx);
    console.log("[vexora] Worker responded:", webRes.status);

    webRes.headers.forEach((v, k) => res.setHeader(k, v));
    res.status(webRes.status);

    if (webRes.body) {
      const reader = webRes.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) { res.end(); return; }
        res.write(value);
        return pump();
      };
      await pump();
    } else {
      res.end();
    }
  } catch (err) {
    console.error("[vexora] Error:", err?.message ?? err, err?.stack);
    if (!res.headersSent) res.status(500).end("Internal Server Error");
    else res.end();
  }
}
