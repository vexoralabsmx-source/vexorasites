import "server-only";

import { createClient } from "@supabase/supabase-js";
import {
  createServerSupabaseClient,
  getServerUser,
  isServerSupabaseConfigured,
} from "@/lib/supabase/server";
import { siteSchema, type ProjectSummary, type SiteSchema } from "@/types/site";

export class SiteRepositoryError extends Error {
  constructor(
    public code: "UNCONFIGURED" | "UNAUTHORIZED" | "NOT_FOUND" | "DATABASE",
    message: string,
  ) {
    super(message);
  }
}

function requireConfigured() {
  if (!isServerSupabaseConfigured())
    throw new SiteRepositoryError(
      "UNCONFIGURED",
      "Supabase no está configurado.",
    );
}

async function authenticatedClient() {
  requireConfigured();
  const [client, user] = await Promise.all([
    createServerSupabaseClient(),
    getServerUser(),
  ]);
  if (!client || !user)
    throw new SiteRepositoryError(
      "UNAUTHORIZED",
      "Inicia sesión para continuar.",
    );
  return { client, user };
}

export async function listSites(): Promise<ProjectSummary[]> {
  const { client } = await authenticatedClient();
  const { data, error } = await client
    .from("sites")
    .select("id,name,slug,status,site_schema,updated_at")
    .order("updated_at", { ascending: false });
  if (error) throw new SiteRepositoryError("DATABASE", error.message);
  return (data ?? []).map((row) => {
    const parsed = siteSchema.safeParse(row.site_schema);
    const schema = parsed.success ? parsed.data : null;
    const accent = schema?.site.theme.colors.accent ?? "#8b7cff";
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      template: schema?.site.templateId ?? "Personalizada",
      status:
        row.status === "published"
          ? "published"
          : schema?.site.status === "changes"
            ? "changes"
            : "draft",
      updatedAt: new Intl.DateTimeFormat("es-MX", {
        dateStyle: "medium",
      }).format(new Date(row.updated_at)),
      palette: [schema?.site.theme.colors.background ?? "#0b0b11", accent],
    };
  });
}

export async function getSite(id: string): Promise<SiteSchema> {
  const { client } = await authenticatedClient();
  const { data, error } = await client
    .from("sites")
    .select("site_schema")
    .eq("id", id)
    .single();
  if (error || !data)
    throw new SiteRepositoryError(
      error?.code === "PGRST116" ? "NOT_FOUND" : "DATABASE",
      error?.message ?? "Proyecto no encontrado.",
    );
  const parsed = siteSchema.safeParse(data.site_schema);
  if (!parsed.success)
    throw new SiteRepositoryError(
      "DATABASE",
      "El proyecto guardado tiene un formato inválido.",
    );
  return parsed.data;
}

export async function createSite(
  schema: SiteSchema,
): Promise<{ id: string; schema: SiteSchema }> {
  const { client, user } = await authenticatedClient();
  const clean = siteSchema.parse(schema);
  const { data, error } = await client
    .from("sites")
    .insert({
      owner_id: user.id,
      name: clean.site.name,
      slug: clean.site.slug,
      description: clean.site.description,
      status: "draft",
      site_schema: clean,
    })
    .select("id")
    .single();
  if (error || !data)
    throw new SiteRepositoryError(
      "DATABASE",
      error?.message ?? "No fue posible crear el proyecto.",
    );
  const persisted = { ...clean, site: { ...clean.site, id: data.id } };
  const { error: syncError } = await client
    .from("sites")
    .update({ site_schema: persisted })
    .eq("id", data.id);
  if (syncError) throw new SiteRepositoryError("DATABASE", syncError.message);
  return { id: data.id, schema: persisted };
}

export async function saveSite(
  id: string,
  schema: SiteSchema,
  createVersion = false,
) {
  const { client, user } = await authenticatedClient();
  const clean = siteSchema.parse(schema);
  const { data, error } = await client
    .from("sites")
    .update({
      name: clean.site.name,
      slug: clean.site.slug,
      description: clean.site.description,
      site_schema: clean,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("id")
    .single();
  if (error || !data)
    throw new SiteRepositoryError(
      error?.code === "PGRST116" ? "NOT_FOUND" : "DATABASE",
      error?.message ?? "No fue posible guardar.",
    );
  if (createVersion) {
    const { error: versionError } = await client
      .from("site_versions")
      .insert({
        site_id: id,
        created_by: user.id,
        schema: clean,
        label: "Guardado manual",
      });
    if (versionError)
      throw new SiteRepositoryError("DATABASE", versionError.message);
  }
  return { id, updatedAt: new Date().toISOString() };
}

export type SiteVersionSummary = {
  id: string;
  label: string;
  createdAt: string;
  schema: SiteSchema;
};

export async function listSiteVersions(
  id: string,
): Promise<SiteVersionSummary[]> {
  const { client } = await authenticatedClient();
  const { data, error } = await client
    .from("site_versions")
    .select("id,label,created_at,schema")
    .eq("site_id", id)
    .order("created_at", { ascending: false })
    .limit(30);
  if (error) throw new SiteRepositoryError("DATABASE", error.message);
  return (data ?? []).flatMap((row) => {
    const parsed = siteSchema.safeParse(row.schema);
    return parsed.success
      ? [
          {
            id: row.id,
            label: row.label || "Versión guardada",
            createdAt: row.created_at,
            schema: parsed.data,
          },
        ]
      : [];
  });
}

export async function restoreSiteVersion(
  siteId: string,
  versionId: string,
): Promise<SiteSchema> {
  const { client } = await authenticatedClient();
  const { data, error } = await client
    .from("site_versions")
    .select("schema")
    .eq("id", versionId)
    .eq("site_id", siteId)
    .single();
  if (error || !data)
    throw new SiteRepositoryError(
      "NOT_FOUND",
      "La versión ya no está disponible.",
    );
  const clean = siteSchema.parse(data.schema);
  await saveSite(siteId, clean, true);
  return clean;
}

export async function publishSite(
  id: string,
): Promise<{ slug: string; schema: SiteSchema }> {
  const { client } = await authenticatedClient();
  const { error } = await client.rpc("publish_site", { p_site_id: id });
  if (error) throw new SiteRepositoryError("DATABASE", error.message);
  const { data, error: readError } = await client
    .from("sites")
    .select("slug,published_schema")
    .eq("id", id)
    .single();
  if (readError || !data)
    throw new SiteRepositoryError(
      "DATABASE",
      readError?.message ?? "No fue posible leer la publicación.",
    );
  const parsed = siteSchema.safeParse(data.published_schema);
  if (!parsed.success)
    throw new SiteRepositoryError(
      "DATABASE",
      "La publicación generada no es válida.",
    );
  return { slug: data.slug, schema: parsed.data };
}

export async function getPublishedSite(
  slug: string,
): Promise<SiteSchema | null> {
  if (!isServerSupabaseConfigured()) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await client
    .from("sites")
    .select("published_schema")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error || !data?.published_schema) return null;
  const parsed = siteSchema.safeParse(data.published_schema);
  return parsed.success ? parsed.data : null;
}
