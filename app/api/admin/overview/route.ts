import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";
import { getAdminOverview } from "@/lib/operations";

export async function GET() {
  await requireAdmin();
  return NextResponse.json(await getAdminOverview());
}
