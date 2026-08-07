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
  <link rel="icon" href="https://res.cloudinary.com/khxvbeau/image/upload/v1785467555/vexoralabslogo_hy554s.png" type="image/png" />
  ${cssLink}
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #050508; color: #f8fafc; margin: 0; }
    .btn-gradient { background: linear-gradient(135deg, #8b5cf6, #a855f7, #c084fc); transition: transform 0.2s, box-shadow 0.2s; }
    .btn-gradient:hover { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(167, 139, 250, 0.4); }
  </style>
</head>
<body class="bg-[#050508] text-white antialiased">
  <div id="root">
    <!-- STATIC FULL LANDING PAGE SHELL -->
    <header style="border-bottom: 1px solid rgba(255,255,255,0.08); background-color: rgba(9,6,20,0.8); backdrop-filter: blur(12px); position: sticky; top: 0; z-index: 50;">
      <div style="max-width: 1280px; margin: 0 auto; padding: 0 1.5rem; height: 4.5rem; display: flex; align-items: center; justify-content: space-between;">
        <a href="/" style="display: inline-flex; align-items: center; gap: 0.65rem; text-decoration: none; font-weight: 700; font-size: 1.15rem; color: white;">
          <div style="width: 2.25rem; height: 2.25rem; border-radius: 0.75rem; border: 1px solid rgba(192,132,252,0.3); background-color: #120a24; padding: 0.25rem; display: grid; place-items: center;">
            <img src="https://res.cloudinary.com/khxvbeau/image/upload/v1785467555/vexoralabslogo_hy554s.png" alt="Vexora Logo" style="width: 100%; height: 100%; object-fit: contain;" />
          </div>
          Vexora <span style="color: #c084fc; font-weight: 400;">Sites</span>
        </a>
        <nav style="display: flex; align-items: center; gap: 1.5rem;">
          <a href="/templates" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; font-weight: 500;">Plantillas</a>
          <a href="/pricing" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; font-weight: 500;">Planes</a>
          <a href="/dashboard" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; font-weight: 500;">Dashboard</a>
          <a href="/admin" style="color: #94a3b8; text-decoration: none; font-size: 0.875rem; font-weight: 500;">Admin</a>
          <a href="/dashboard" class="btn-gradient" style="padding: 0.6rem 1.25rem; border-radius: 9999px; color: white; text-decoration: none; font-size: 0.85rem; font-weight: 600;">Ingresar al Editor</a>
        </nav>
      </div>
    </header>

    <main style="max-width: 1280px; margin: 0 auto; padding: 5rem 1.5rem 8rem; text-align: center;">
      <span style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.4rem 1rem; border-radius: 9999px; border: 1px solid rgba(192,132,252,0.3); background-color: rgba(139,92,246,0.1); color: #c084fc; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;">
        ✨ VEXORA SITES PLATFORM 2026
      </span>
      <h1 style="font-size: 3.5rem; font-weight: 800; letter-spacing: -0.04em; margin-top: 1.5rem; margin-bottom: 1.5rem; line-height: 1.1; background: linear-gradient(to right, #ffffff, #e2e8f0, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
        Diseña Experiencias Web<br/>Cinematográficas con IA
      </h1>
      <p style="max-width: 700px; margin: 0 auto 2.5rem; font-size: 1.15rem; color: #94a3b8; line-height: 1.7;">
        Construye sitios multipágina de nivel mundial con dirección de arte profesional, animación fluida y publicación instantánea. Sin código.
      </p>

      <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap;">
        <a href="/dashboard" class="btn-gradient" style="padding: 0.85rem 2rem; border-radius: 9999px; color: white; text-decoration: none; font-size: 0.95rem; font-weight: 700;">
          Comenzar Gratis Ahora →
        </a>
        <a href="/editor/demo" style="padding: 0.85rem 2rem; border-radius: 9999px; border: 1px solid rgba(255,255,255,0.15); background-color: rgba(255,255,255,0.03); color: white; text-decoration: none; font-size: 0.95rem; font-weight: 600;">
          Probar Editor Demo
        </a>
      </div>

      <div style="margin-top: 5rem; padding: 2.5rem; border-radius: 2rem; border: 1px solid rgba(192,132,252,0.2); background: radial-gradient(circle at 50% 0%, rgba(139,92,246,0.15), transparent 70%), #0c0818; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 2rem; text-align: left;">
        <div>
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🎨</div>
          <h3 style="font-size: 1.1rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">10+ Plantillas Signature</h3>
          <p style="font-size: 0.85rem; color: #94a3b8; margin: 0; line-height: 1.5;">Diseños cinemáticos listos para personalización completa en vivo.</p>
        </div>
        <div>
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">🔑</div>
          <h3 style="font-size: 1.1rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">Llaves & Cupones VIP</h3>
          <p style="font-size: 0.85rem; color: #94a3b8; margin: 0; line-height: 1.5;">Sistema de administración de licencias gratuitas y ofertas de descuento.</p>
        </div>
        <div>
          <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">💳</div>
          <h3 style="font-size: 1.1rem; font-weight: 700; color: white; margin-bottom: 0.5rem;">Pasarela PayClip</h3>
          <p style="font-size: 0.85rem; color: #94a3b8; margin: 0; line-height: 1.5;">Integración nativa de cobros recurrentes para México y Latinoamérica.</p>
        </div>
      </div>
    </main>

    <footer style="border-top: 1px solid rgba(255,255,255,0.08); padding: 3rem 1.5rem; text-align: center; color: #64748b; font-size: 0.85rem;">
      <p>© 2026 Vexora Sites. Todos los derechos reservados. vexorasites.shop</p>
    </footer>
  </div>
  ${jsScripts}
</body>
</html>`;

    fs.writeFileSync(indexPath, htmlContent, "utf-8");
    console.log("Successfully created dist/client/index.html with full static Landing Page shell.");
  } catch (err) {
    console.warn("Could not create dist/client/index.html:", err);
  }
}
