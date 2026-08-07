import { readFileSync, existsSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

// In Vercel, __dirname of api/server.js → /var/task/api  →  ROOT is one level up
const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR = join(__dirname, "..");
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

// Cache worker per container reuse
let _worker = null;
async function getWorker() {
  if (_worker) return _worker;
  const workerPath = join(ROOT_DIR, "dist", "server", "index.js");
  const mod = await import(workerPath);
  _worker = mod.default;
  console.log("[vexora] Worker loaded — fetch:", typeof _worker?.fetch);
  return _worker;
}

function buildEnv() {
  return {
    NEXT_PUBLIC_APP_URL:                   process.env.NEXT_PUBLIC_APP_URL ?? "",
    NEXT_PUBLIC_SUPABASE_URL:              process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:         process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    SUPABASE_SERVICE_ROLE_KEY:             process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME:     process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "",
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET:  process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "",
    CLOUDINARY_API_KEY:                    process.env.CLOUDINARY_API_KEY ?? "",
    CLOUDINARY_API_SECRET:                 process.env.CLOUDINARY_API_SECRET ?? "",
    CLIP_SECRET_KEY:                       process.env.CLIP_SECRET_KEY ?? "",
    CLIP_API_KEY:                          process.env.CLIP_API_KEY ?? "",
    ADMIN_EMAILS:                          process.env.ADMIN_EMAILS ?? "vexoralabsmx@gmail.com",
    NODE_ENV:                              process.env.NODE_ENV ?? "production",
  };
}

// ─── Vercel Serverless Handler ─────────────────────────────────────────────
export default async function handler(req, res) {
  const pathname = req.url?.split("?")[0] ?? "/";

  // ── Serve static files from dist/client ──────────────────────────────────
  if (pathname !== "/" && !pathname.includes("..") && !pathname.startsWith("/api/")) {
    const filePath = join(CLIENT_DIR, pathname);
    if (existsSync(filePath) && statSync(filePath).isFile()) {
      const content = readFileSync(filePath);
      const ext = extname(filePath);
      const mime = MIME[ext] ?? "application/octet-stream";
      res.setHeader("Content-Type", mime);
      if (pathname.startsWith("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      } else {
        res.setHeader("Cache-Control", "public, max-age=3600");
      }
      res.status(200).end(content);
      return;
    }
  }

  // ── Forward to Cloudflare Worker handler ─────────────────────────────────
  try {
    const worker = await getWorker();
    if (!worker?.fetch) {
      res.status(503).end("Worker not available");
      return;
    }

    // Build full URL
    const proto = req.headers["x-forwarded-proto"]?.split(",")[0].trim() ?? "https";
    const host  = req.headers.host ?? "vexorasites.shop";
    const fullUrl = `${proto}://${host}${req.url}`;

    // Build request headers
    const webHeaders = new Headers();
    for (const [k, v] of Object.entries(req.headers)) {
      if (v != null) webHeaders.set(k, Array.isArray(v) ? v.join(", ") : v);
    }

    // Collect body for non-GET requests
    let bodyBuffer = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      if (chunks.length) bodyBuffer = Buffer.concat(chunks);
    }

    const webRequest = new Request(fullUrl, {
      method:  req.method,
      headers: webHeaders,
      body:    bodyBuffer ?? undefined,
      duplex:  bodyBuffer ? "half" : undefined,
    });

    const env = buildEnv();
    const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };

    const webResponse = await worker.fetch(webRequest, env, ctx);

    // Write headers
    webResponse.headers.forEach((v, k) => res.setHeader(k, v));
    res.status(webResponse.status);

    // Stream body
    if (webResponse.body) {
      const reader = webResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err) {
    console.error("[vexora] Handler error:", err?.message ?? err);
    if (!res.headersSent) res.status(500).end("Internal Server Error");
  }
}
