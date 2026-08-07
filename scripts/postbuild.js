import fs from "node:fs";
import path from "node:path";

// 1. Clean Cloudflare Wrangler Config for Cloudflare Pages validation
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

      // Find core bundle entrypoints in execution order
      const rolldown = allJs.find((f) => f.startsWith("rolldown-runtime-"));
      const framework = allJs.find((f) => f.startsWith("framework-"));
      const client = allJs.find((f) => f.startsWith("client-"));
      const router = allJs.find((f) => f.startsWith("router-"));
      const indexScript = allJs.find((f) => f.startsWith("index-"));
      const marketing = allJs.find((f) => f.startsWith("marketing-shell-"));
      const landing = allJs.find((f) => f.startsWith("landing-page-"));

      const ordered = [rolldown, framework, client, router, indexScript, marketing, landing].filter(Boolean);
      jsFiles = ordered.length > 0 ? ordered : allJs.slice(0, 4);
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
  <meta name="description" content="Plataforma de creación de sitios web cinematográficos con dirección visual y plantillas de diseño signature." />
  <link rel="icon" href="https://res.cloudinary.com/khxvbeau/image/upload/v1785467555/vexoralabslogo_hy554s.png" type="image/png" />
  ${cssLink}
</head>
<body class="bg-[#050508] text-white">
  <div id="root"></div>
  ${jsScripts}
</body>
</html>`;

    fs.writeFileSync(indexPath, htmlContent, "utf-8");
    console.log("Successfully created dist/client/index.html for Vercel deployment.");
  } catch (err) {
    console.warn("Could not create dist/client/index.html:", err);
  }
}
