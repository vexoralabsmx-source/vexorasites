import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { requireUser } from "@/lib/supabase/server";
import { listSites } from "@/lib/sites/repository";

export default async function DashboardPage(){
  const user = await requireUser();
  if (!user) return <DashboardShell persistenceMode="local"/>;

  let projects;
  try {
    projects = await listSites();
  } catch {
    return <DashboardShell persistenceMode="local"/>;
  }

  return <DashboardShell initialProjects={projects} persistenceMode="remote"/>;
}
