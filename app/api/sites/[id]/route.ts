import { NextResponse } from "next/server";
import { z } from "zod";
import { getSite, saveSite } from "@/lib/sites/repository";
import { siteErrorResponse } from "@/lib/sites/http";
import { siteSchema } from "@/types/site";

const idSchema = z.string().uuid();
const saveRequestSchema = z.object({ schema: siteSchema, createVersion: z.boolean().optional().default(false) });

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    return NextResponse.json({ schema: await getSite(idSchema.parse(id)), mode: "remote" });
  } catch (error) {
    return siteErrorResponse(error);
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const [{ id }, body] = await Promise.all([params, request.json()]);
    const input = saveRequestSchema.parse(body);
    return NextResponse.json(await saveSite(idSchema.parse(id), input.schema, input.createVersion));
  } catch (error) {
    return siteErrorResponse(error);
  }
}
