import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
    },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renderiza la landing de Vexora con contenido y metadatos propios", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<html lang="es">/i);
  assert.match(
    html,
    /<title>Vexora Sites — Diseña experiencias web cinematográficas<\/title>/i,
  );
  assert.match(html, /Diseña/);
  assert.match(html, /experiencias web/);
  assert.match(html, /cinematográficas/);
  assert.match(html, /og\.png/);
  assert.doesNotMatch(
    html,
    /codex-preview|Your site is taking shape|react-loading-skeleton/i,
  );
});

test("incluye las superficies y contratos principales del MVP", async () => {
  const [
    types,
    templates,
    editor,
    renderer,
    styles,
    migration,
    publishMigration,
    repository,
    sitesApi,
    publishApi,
    assetsApi,
    mediaCenter,
    env,
    packageJson,
  ] = await Promise.all([
    readFile(new URL("../types/site.ts", import.meta.url), "utf8"),
    readFile(new URL("../lib/templates.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../components/editor/editor-shell.tsx", import.meta.url),
      "utf8",
    ),
    readFile(
      new URL("../components/renderer/site-renderer.tsx", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../supabase/migrations/202608020001_initial_schema.sql",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../supabase/migrations/202608030002_publish_site_function.sql",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../lib/sites/repository.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/api/sites/route.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../app/api/sites/[id]/publish/route.ts", import.meta.url),
      "utf8",
    ),
    readFile(new URL("../app/api/assets/route.ts", import.meta.url), "utf8"),
    readFile(
      new URL("../components/media/media-center.tsx", import.meta.url),
      "utf8",
    ),
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
  assert.match(templates, /apex-capital/);
  assert.match(templates, /serein-residences/);
  assert.match(templates, /monolith-ai/);
  assert.match(templates, /slug: "servicios"/);
  assert.match(editor, /DndContext/);
  assert.match(editor, /FontPicker/);
  assert.match(editor, /Haz clic en cualquier texto para editarlo/);
  assert.match(renderer, /contentEditable=\{editing\.editable\}/);
  assert.match(renderer, /vexora-section-toolbar/);
  assert.match(renderer, /onReorder\?\.\(draggingId, section\.id\)/);
  assert.match(styles, /\.font-choice-active/);
  assert.match(styles, /\.vexora-inline-edit:focus/);
  assert.match(editor, /vexora-published-/);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /published_schema/);
  assert.match(
    publishMigration,
    /create or replace function public\.publish_site/i,
  );
  assert.match(publishMigration, /insert into public\.site_versions/i);
  assert.match(publishMigration, /insert into public\.publications/i);
  assert.match(repository, /siteSchema\.parse/);
  assert.match(repository, /getPublishedSite/);
  assert.match(sitesApi, /export async function POST/);
  assert.match(publishApi, /publishSite/);
  assert.match(assetsApi, /createMediaAssetSchema/);
  assert.match(mediaCenter, /createUploadWidget/);
  assert.match(mediaCenter, /Tutorial rápido de Cloudinary/);
  assert.match(types, /media:\s*z\s*\.array/);
  assert.match(types, /"container"/);
  assert.match(types, /navigation:/);
  assert.match(env, /NEXT_PUBLIC_SUPABASE_URL=/);
  assert.match(env, /NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=/);
  assert.doesNotMatch(env, /CLOUDINARY_API_SECRET\s*=\s*\S+/i);
  assert.doesNotMatch(env, /eyJ|service_role\s*=\s*\S+/i);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  await access(new URL("../public/og.png", import.meta.url));
  await access(new URL("../app/features/page.tsx", import.meta.url));
  await access(new URL("../app/pricing/page.tsx", import.meta.url));
  await access(new URL("../app/showcase/page.tsx", import.meta.url));
  await access(new URL("../app/site/[slug]/[page]/page.tsx", import.meta.url));
  await access(
    new URL("../components/editor/advanced-editor-tools.tsx", import.meta.url),
  );
  await access(new URL("../app/api/analytics/route.ts", import.meta.url));
  await access(
    new URL("../app/api/monitoring/errors/route.ts", import.meta.url),
  );
  await access(new URL("../app/privacy/page.tsx", import.meta.url));
  await access(new URL("../app/terms/page.tsx", import.meta.url));
  await access(new URL("../app/cookies/page.tsx", import.meta.url));
  await access(
    new URL(
      "../supabase/migrations/202608030003_operations.sql",
      import.meta.url,
    ),
  );
});
