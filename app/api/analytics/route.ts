import { NextResponse } from "next/server";
import { z } from "zod";
import { createOperationsClient } from "@/lib/operations";

const payloadSchema = z.object({
  siteSlug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  eventName: z.enum(["page_view", "link_click", "form_submit"]),
  path: z.string().min(1).max(500),
  referrerHost: z.string().max(255).optional(),
  sessionId: z.string().min(8).max(120),
  viewport: z.string().max(40).optional(),
});

export async function POST(request: Request) {
  try {
    const input = payloadSchema.parse(await request.json());
    const client = createOperationsClient();
    if (!client)
      return NextResponse.json(
        { accepted: false, reason: "not_configured" },
        { status: 202 },
      );
    const { error } = await client
      .from("analytics_events")
      .insert({
        site_slug: input.siteSlug,
        event_name: input.eventName,
        path: input.path,
        referrer_host: input.referrerHost,
        session_id: input.sessionId,
        viewport: input.viewport,
      });
    if (error) throw error;
    return NextResponse.json({ accepted: true });
  } catch {
    return NextResponse.json({ error: "Evento inválido." }, { status: 400 });
  }
}
