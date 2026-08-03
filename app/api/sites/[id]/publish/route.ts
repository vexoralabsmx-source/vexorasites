import { NextResponse } from "next/server";
import { z } from "zod";
import { publishSite } from "@/lib/sites/repository";
import { siteErrorResponse } from "@/lib/sites/http";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(await publishSite(z.string().uuid().parse(id)));
  } catch (error) {
    return siteErrorResponse(error);
  }
}
