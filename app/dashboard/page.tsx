import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/supabase/server";
export default async function DashboardPage(){ await requireUser(); return <DashboardShell/>; }
