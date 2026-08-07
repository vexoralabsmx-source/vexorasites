import { createBrowserClient } from "@supabase/ssr";

function getResolvedSupabaseUrl(envUrl?: string, key?: string): string {
  if (key) {
    try {
      const parts = key.split(".");
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
        const jsonStr = typeof window !== "undefined"
          ? atob(base64)
          : Buffer.from(base64, "base64").toString("utf-8");
        const payload = JSON.parse(jsonStr);
        if (payload?.ref) {
          return `https://${payload.ref}.supabase.co`;
        }
      }
    } catch {
      // Fallback to envUrl
    }
  }
  return envUrl || "";
}

export function isSupabaseConfigured() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = getResolvedSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, key);
  return Boolean(url && key);
}

export function createClient() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const url = getResolvedSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, key);
  if (!url || !key) return null;
  return createBrowserClient(url, key);
}
