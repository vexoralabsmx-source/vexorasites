import { NextResponse } from "next/server";
import { z } from "zod";
import { listSiteVersions, restoreSiteVersion } from "@/lib/sites/repository";
import { siteErrorResponse } from "@/lib/sites/http";

const uuid = z.string().uuid();

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json({
      versions: await listSiteVersions(uuid.parse(id)),
    });
  } catch (error) {
    return siteErrorResponse(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const [{ id }, body] = await Promise.all([params, request.json()]);
    const versionId = uuid.parse((body as { versionId?: string }).versionId);
    return NextResponse.json({
      schema: await restoreSiteVersion(uuid.parse(id), versionId),
    });
  } catch (error) {
    return siteErrorResponse(error);
  }
}
