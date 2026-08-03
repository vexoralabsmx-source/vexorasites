import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/server";
import { getAdminOverview } from "@/lib/operations";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "La administración remota aún no está configurada." },
      { status: 503 },
    );
  }
  return NextResponse.json(await getAdminOverview());
}
