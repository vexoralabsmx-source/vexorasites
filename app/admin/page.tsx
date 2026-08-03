import { AdminPanel } from "@/components/admin/admin-panel";
import { requireAdmin } from "@/lib/supabase/server";
export default async function AdminPage(){await requireAdmin();return <AdminPanel/>}
