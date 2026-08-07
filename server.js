import { createServer } from "node:http";
import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const CLIENT_DIR = join(__dirname, "dist", "client");

const MIME = {
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".html": "text/html; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".json": "application/json",
  ".txt": "text/plain",
};

let worker = null;
async function getWorker() {
  if (worker) return worker;
  const workerPath = join(__dirname, "dist", "server", "index.js");
  const mod = await import(workerPath);
  worker = mod.default;
  console.log("[server] Worker loaded. fetch:", typeof worker?.fetch);
  return worker;
}

function buildEnv() {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (v != null) env[k] = v;
  }
  // Ensure defaults
  if (!env.ADMIN_EMAILS) env.ADMIN_EMAILS = "vexoralabsmx@gmail.com";
  return env;
}

async function handleRequest(nodeReq, nodeRes) {
  const host = nodeReq.headers.host || "vexorasites.shop";
  const protocol = (nodeReq.headers["x-forwarded-proto"] || "https").split(",")[0].trim();
  const fullUrl = `${protocol}://${host}${nodeReq.url}`;
  const url = new URL(fullUrl);
  const pathname = url.pathname;

  // Serve static assets from dist/client
  if (pathname !== "/" && !pathname.includes("..")) {
    const assetPath = join(CLIENT_DIR, pathname);
    if (existsSync(assetPath) && statSync(assetPath).isFile()) {
      const content = readFileSync(assetPath);
      const ext = extname(assetPath);
      const mime = MIME[ext] || "application/octet-stream";
      nodeRes.writeHead(200, {
        "Content-Type": mime,
        "Cache-Control": pathname.startsWith("/assets/")
          ? "public, max-age=31536000, immutable"
          : "public, max-age=3600",
      });
      nodeRes.end(content);
      return;
    }
  }

  // Forward to Worker
  try {
    const w = await getWorker();
    if (!w?.fetch) {
      nodeRes.writeHead(503, { "Content-Type": "text/plain" });
      nodeRes.end("Worker not available");
      return;
    }

    const chunks = [];
    for await (const chunk of nodeReq) chunks.push(chunk);
    const bodyBuffer = chunks.length ? Buffer.concat(chunks) : null;

    const reqHeaders = new Headers();
    for (const [k, v] of Object.entries(nodeReq.headers)) {
      if (v != null) reqHeaders.set(k, Array.isArray(v) ? v.join(", ") : v);
    }

    const hasBody =
      bodyBuffer && bodyBuffer.length > 0 && nodeReq.method !== "GET" && nodeReq.method !== "HEAD";

    const webRequest = new Request(fullUrl, {
      method: nodeReq.method,
      headers: reqHeaders,
      body: hasBody ? bodyBuffer : undefined,
      duplex: hasBody ? "half" : undefined,
    });

    const env = buildEnv();
    const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };
    const webResponse = await w.fetch(webRequest, env, ctx);

    const outHeaders = {};
    webResponse.headers.forEach((v, k) => {
      outHeaders[k] = v;
    });
    nodeRes.writeHead(webResponse.status, outHeaders);

    if (webResponse.body) {
      const reader = webResponse.body.getReader();
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
    console.error("[server]", err?.message ?? err);
    if (!nodeRes.headersSent) {
      nodeRes.writeHead(500, { "Content-Type": "text/plain" });
      nodeRes.end("Internal Server Error");
    } else {
      nodeRes.end();
    }
  }
}

const PORT = parseInt(process.env.PORT || "3000", 10);
createServer(handleRequest).listen(PORT, () => {
  console.log(`✅ VexoraSites ready on http://localhost:${PORT}`);
});
