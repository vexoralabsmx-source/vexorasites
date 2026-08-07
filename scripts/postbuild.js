import fs from "node:fs";
import path from "node:path";

// Clean Cloudflare Wrangler Config for Cloudflare Pages validation
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
