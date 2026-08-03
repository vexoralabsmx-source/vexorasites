import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function getServerUser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const cookieStore = await cookies();
  const client = createServerClient(url, key, { cookies: { getAll: () => cookieStore.getAll(), setAll: (values) => { try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {} } } });
  const { data } = await client.auth.getUser();
  return data.user;
}

export async function requireUser() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
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
