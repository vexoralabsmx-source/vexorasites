import { NextResponse } from "next/server";
import { SiteRepositoryError } from "@/lib/sites/repository";
import { ZodError } from "zod";

export function siteErrorResponse(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ error: "El esquema del sitio no es válido.", details: error.flatten() }, { status: 400 });
  if (error instanceof SiteRepositoryError) {
    const status = error.code === "UNCONFIGURED" ? 503 : error.code === "UNAUTHORIZED" ? 401 : error.code === "NOT_FOUND" ? 404 : 500;
    return NextResponse.json({ error: error.message, code: error.code }, { status });
  }
  return NextResponse.json({ error: "Ocurrió un error inesperado. Intenta nuevamente." }, { status: 500 });
}
