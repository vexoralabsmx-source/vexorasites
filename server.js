// ── Cloudflare-globals polyfills for Node.js ────────────────────────────
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

import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname  = fileURLToPath(new URL(".", import.meta.url));
const CLIENT_DIR = join(__dirname, "dist", "client");

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
};

// ── Load Worker eagerly ──────────────────────────────────────────────────
let _workerPromise = null;
function getWorker() {
  if (!_workerPromise) {
    _workerPromise = import(pathToFileURL(join(__dirname, "dist", "server", "index.js")).href)
      .then((m) => {
        const w = m.default;
        console.log("[vexora] Worker ready — fetch:", typeof w?.fetch);
        return w;
      })
      .catch((err) => {
        console.error("[vexora] Worker error:", err?.message);
        _workerPromise = null;
        throw err;
      });
  }
  return _workerPromise;
}

// Start loading immediately at boot time
console.log("[vexora] Loading worker...");
getWorker().catch(() => {});

function buildEnv() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v != null) env[k] = v;
  }
  if (!env.ADMIN_EMAILS) env.ADMIN_EMAILS = "vexoralabsmx@gmail.com";
  return env;
}

async function handleRequest(nodeReq, nodeRes) {
  const pathname = (nodeReq.url ?? "/").split("?")[0];
  console.log(`[vexora] ${nodeReq.method} ${pathname}`);

  // Static assets
  if (pathname !== "/" && !pathname.includes("..")) {
    const filePath = join(CLIENT_DIR, pathname);
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const content = readFileSync(filePath);
      const ext = extname(filePath);
      nodeRes.writeHead(200, {
        "Content-Type": MIME[ext] ?? "application/octet-stream",
        "Cache-Control": pathname.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600",
      });
      nodeRes.end(content);
      return;
    }
  }

  try {
    const worker = await getWorker();
    if (!worker?.fetch) {
      nodeRes.writeHead(503, { "Content-Type": "text/plain" });
      nodeRes.end("Worker not ready");
      return;
    }

    const proto   = "http";
    const host    = nodeReq.headers.host ?? "localhost";
    const fullUrl = `${proto}://${host}${nodeReq.url}`;

    const webHeaders = new Headers();
    for (const [k, v] of Object.entries(nodeReq.headers)) {
      if (v != null) webHeaders.set(k, Array.isArray(v) ? v.join(", ") : v);
    }

    let bodyBuffer = null;
    if (nodeReq.method !== "GET" && nodeReq.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of nodeReq) chunks.push(chunk);
      if (chunks.length) bodyBuffer = Buffer.concat(chunks);
    }

    const webReq = new Request(fullUrl, {
      method:  nodeReq.method,
      headers: webHeaders,
      body:    bodyBuffer ?? undefined,
      duplex:  bodyBuffer ? "half" : undefined,
    });

    const env = buildEnv();
    const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };

    console.log("[vexora] Calling worker.fetch...");
    const webRes = await worker.fetch(webReq, env, ctx);
    console.log("[vexora] Response:", webRes.status);

    const outHeaders = {};
    webRes.headers.forEach((v, k) => { outHeaders[k] = v; });
    nodeRes.writeHead(webRes.status, outHeaders);

    if (webRes.body) {
      const reader = webRes.body.getReader();
      const pump = async () => {
        const { done, value } = await reader.read();
        if (done) { nodeRes.end(); return; }
        nodeRes.write(value);
        return pump();
      };
      await pump();
    } else {
      nodeRes.end();
    }
  } catch (err) {
    console.error("[vexora] Error:", err?.message ?? err);
    console.error(err?.stack);
    if (!nodeRes.headersSent) {
      nodeRes.writeHead(500, { "Content-Type": "text/plain" });
      nodeRes.end("Error: " + (err?.message ?? String(err)));
    } else {
      nodeRes.end();
    }
  }
}

const PORT = parseInt(process.env.PORT ?? "3001", 10);
createServer(handleRequest).listen(PORT, () => {
  console.log(`✅ VexoraSites ready on http://localhost:${PORT}`);
});
