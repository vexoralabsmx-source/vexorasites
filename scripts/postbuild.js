import fs from "node:fs";
import path from "node:path";

// 1. Clean Cloudflare Wrangler Config
const targetPath = path.join(process.cwd(), "dist", "server", "wrangler.json");
if (fs.existsSync(targetPath)) {
  try {
    const json = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
    delete json.main;
    delete json.rules;
    delete json.assets;
    delete json.definedEnvironments;
    delete json.ai_search_namespaces;
    delete json.ai_search;
    delete json.secrets_store_secrets;
    delete json.artifacts;
    delete json.unsafe_hello_world;
    delete json.flagship;
    delete json.worker_loaders;
    delete json.ratelimits;
    delete json.vpc_services;
    delete json.vpc_networks;
    delete json.python_modules;

    fs.writeFileSync(targetPath, JSON.stringify(json, null, 2));
    console.log("Successfully cleaned dist/server/wrangler.json for Cloudflare Pages validation.");
  } catch (err) {
    console.warn("Could not clean wrangler.json:", err);
  }
}

// 2. Generate dist/client/index.html for Vercel / Static Hosting
const clientDir = path.join(process.cwd(), "dist", "client");
const assetsDir = path.join(clientDir, "assets");
const indexPath = path.join(clientDir, "index.html");

if (fs.existsSync(clientDir)) {
  try {
    let cssFile = "";
    let jsFiles = [];

    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      cssFile = files.find((f) => f.endsWith(".css")) || "";
      const allJs = files.filter((f) => f.endsWith(".js"));
      // Only include main entry bundles to prevent module race conditions
      const entryPrefixes = ["framework-", "client-", "router-", "index-", "landing-page-", "main-"];
      jsFiles = allJs.filter((f) => entryPrefixes.some((p) => f.startsWith(p)));
      if (jsFiles.length === 0) jsFiles = allJs.slice(0, 3);
    }

    const cssLink = cssFile ? `<link rel="stylesheet" href="/assets/${cssFile}">` : "";
    const jsScripts = jsFiles
      .map((f) => `<script type="module" src="/assets/${f}"></script>`)
      .join("\n    ");

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vexora Sites — Creador de Sitios Web de Ultra-Lujo</title>
  <meta name="description" content="Plataforma de creación de sitios web cinematográficos con IA y plantillas de diseño signature." />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  ${cssLink}
</head>
<body class="bg-[#050508] text-white">
  <div id="root">
    <div style="min-height: 100vh; background-color: #050508; color: #f8fafc; display: flex; flex-direction: column; align-items: center; justify-center; text-align: center; padding: 2rem; font-family: system-ui, -apple-system, sans-serif;">
      <div style="margin-top: 10vh; max-width: 600px;">
        <span style="display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; border: 1px solid rgba(192,132,252,0.3); background-color: rgba(139,92,246,0.1); color: #c084fc; font-size: 0.75rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem;">
          VEXORA SITES
        </span>
        <h1 style="font-size: 2.25rem; font-weight: 700; letter-spacing: -0.03em; margin-bottom: 0.75rem; color: #ffffff;">
          Creador de Sitios Web de Ultra-Lujo
        </h1>
        <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem;">
          Cargando entorno cinematográfico y motor visual...
        </p>
        <div style="display: inline-block; width: 28px; height: 28px; border: 3px solid rgba(192,132,252,0.2); border-top-color: #c084fc; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      </div>
    </div>
    <style>
      @keyframes spin { to { transform: rotate(360deg); } }
    </style>
  </div>
  ${jsScripts}
</body>
</html>`;

    fs.writeFileSync(indexPath, htmlContent, "utf-8");
    console.log("Successfully created dist/client/index.html with entry bundles.");
  } catch (err) {
    console.warn("Could not create dist/client/index.html:", err);
  }
}
