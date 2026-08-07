import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getResolvedSupabaseUrl(envUrl?: string, key?: string): string {
  if (key) {
    try {
      const parts = key.split(".");
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = Buffer.from(base64, "base64").toString("utf-8");
        const payload = JSON.parse(jsonStr);
        if (payload?.ref) {
          return `https://${payload.ref}.supabase.co`;
        }
      }
    } catch {
      // Fallback
    }
  }
  return envUrl || "";
}

export function isServerSupabaseConfigured() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = getResolvedSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, key);
  return Boolean(url && key);
}

export async function createServerSupabaseClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = getResolvedSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, key);
  if (!url || !key) return null;
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        try {
          values.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Los Server Components no siempre pueden escribir cookies.
        }
      },
    },
  });
}

export async function getServerUser() {
  const client = await createServerSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
}

export async function requireUser() {
  const configured = isServerSupabaseConfigured();
  if (!configured) return null;
  const user = await getServerUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user) return null;
  const admins = (process.env.ADMIN_EMAILS ?? "").split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (!user.email || !admins.includes(user.email.toLowerCase())) redirect("/dashboard");
  return user;
}
