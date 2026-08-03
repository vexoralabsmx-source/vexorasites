import { NextResponse } from "next/server";
import { z } from "zod";
import { createSite, listSites } from "@/lib/sites/repository";
import { siteErrorResponse } from "@/lib/sites/http";
import { siteSchema } from "@/types/site";

const createRequestSchema = z.object({ schema: siteSchema });

export async function GET() {
  try {
    return NextResponse.json({ projects: await listSites(), mode: "remote" });
  } catch (error) {
    return siteErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = createRequestSchema.parse(await request.json());
    const result = await createSite(body.schema);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return siteErrorResponse(error);
  }
}
