import fs from "node:fs";
import path from "node:path";

// Clean dist/server/wrangler.json for Cloudflare Pages validation
const targetPath = path.join(process.cwd(), "dist", "server", "wrangler.json");
if (fs.existsSync(targetPath)) {
  try {
    const json = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
    // Remove Worker-only fields that break Pages validation
    const invalidFields = [
      "main", "rules", "assets", "definedEnvironments",
      "ai_search_namespaces", "ai_search", "secrets_store_secrets",
      "artifacts", "unsafe_hello_world", "flagship", "worker_loaders",
      "ratelimits", "vpc_services", "vpc_networks", "python_modules"
    ];
    invalidFields.forEach((f) => delete json[f]);
    // Remove dev fields that cause warnings
    if (json.dev) {
      delete json.dev.enable_containers;
      delete json.dev.generate_types;
    }
    fs.writeFileSync(targetPath, JSON.stringify(json, null, 2));
    console.log("Successfully cleaned dist/server/wrangler.json for Cloudflare Pages validation.");
  } catch (err) {
    console.warn("Could not clean wrangler.json:", err);
  }
}
