import "server-only";
import { createClient } from "@supabase/supabase-js";

export function createOperationsClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getAdminOverview() {
  const client = createOperationsClient();
  if (!client)
    return {
      configured: false,
      metrics: { users: 0, sites: 0, published: 0, views: 0, errors: 0 },
      daily: [],
      errors: [],
    };
  const since = new Date(Date.now() - 7 * 86400000).toISOString();
  const [users, sites, published, events, errorCount, recentErrors] =
    await Promise.all([
      client.from("profiles").select("id", { count: "exact", head: true }),
      client.from("sites").select("id", { count: "exact", head: true }),
      client
        .from("sites")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      client
        .from("analytics_events")
        .select("created_at")
        .gte("created_at", since)
        .eq("event_name", "page_view"),
      client
        .from("error_events")
        .select("id", { count: "exact", head: true })
        .is("resolved_at", null),
      client
        .from("error_events")
        .select("id,message,path,severity,created_at,resolved_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);
  const days = new Map<string, number>();
  for (let offset = 6; offset >= 0; offset--) {
    const date = new Date(Date.now() - offset * 86400000);
    days.set(date.toISOString().slice(0, 10), 0);
  }
  for (const item of events.data ?? []) {
    const key = item.created_at.slice(0, 10);
    if (days.has(key)) days.set(key, (days.get(key) ?? 0) + 1);
  }
  return {
    configured: true,
    metrics: {
      users: users.count ?? 0,
      sites: sites.count ?? 0,
      published: published.count ?? 0,
      views: events.data?.length ?? 0,
      errors: errorCount.count ?? 0,
    },
    daily: [...days].map(([date, views]) => ({ date, views })),
    errors: recentErrors.data ?? [],
  };
}
