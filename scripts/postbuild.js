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
      jsFiles = files.filter((f) => f.endsWith(".js"));
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
  <div id="root"></div>
  ${jsScripts}
</body>
</html>`;

    fs.writeFileSync(indexPath, htmlContent, "utf-8");
    console.log("Successfully created dist/client/index.html for Vercel 404 resolution.");
  } catch (err) {
    console.warn("Could not create dist/client/index.html:", err);
  }
}
