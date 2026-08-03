import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }), { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } }, { waitUntil() {}, passThroughOnException() {} });
}

test("renderiza la landing de Vexora con contenido y metadatos propios", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<html lang="es">/i);
  assert.match(html, /<title>Vexora Sites — Diseña experiencias web cinematográficas<\/title>/i);
  assert.match(html, /Diseña/);
  assert.match(html, /experiencias web/);
  assert.match(html, /cinematográficas/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("incluye las superficies y contratos principales del MVP", async () => {
  const [types, templates, editor, migration, env, packageJson] = await Promise.all([
    readFile(new URL("../types/site.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/templates.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/editor/editor-shell.tsx", import.meta.url), "utf8"),
    readFile(new URL("../supabase/migrations/202608020001_initial_schema.sql", import.meta.url), "utf8"),
    readFile(new URL("../.env.example", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);
  assert.match(types, /siteSchema = z\.object/);
  assert.match(templates, /noir-atelier/);
  assert.match(templates, /ritual-barber/);
  assert.match(templates, /mesa-nueve/);
  assert.match(templates, /orbital-labs/);
  assert.match(templates, /forge-athletic/);
  assert.match(templates, /mara-visual/);
  assert.match(editor, /DndContext/);
  assert.match(editor, /vexora-published-/);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /published_schema/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_URL=/);
  assert.doesNotMatch(env, /eyJ|service_role\s*=\s*\S+/i);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
});
