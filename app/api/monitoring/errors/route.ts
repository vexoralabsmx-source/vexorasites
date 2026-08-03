import { NextResponse } from "next/server";
import { z } from "zod";
import { createHash } from "node:crypto";
import { createOperationsClient } from "@/lib/operations";

const errorSchema = z.object({
  message: z.string().min(1).max(2000),
  source: z.string().max(500).optional(),
  path: z.string().min(1).max(500),
  severity: z.enum(["warning", "error", "fatal"]).default("error"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export async function POST(request: Request) {
  try {
    const input = errorSchema.parse(await request.json());
    const client = createOperationsClient();
    if (!client) return NextResponse.json({ accepted: false }, { status: 202 });
    const fingerprint = createHash("sha256")
      .update(`${input.message}|${input.source ?? ""}`)
      .digest("hex")
      .slice(0, 24);
    await client.from("error_events").insert({ ...input, fingerprint });
    return NextResponse.json({ accepted: true });
  } catch {
    return NextResponse.json({ error: "Reporte inválido." }, { status: 400 });
  }
}
