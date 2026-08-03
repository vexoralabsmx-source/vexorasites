import { NextResponse } from "next/server";
import { createServerSupabaseClient, getServerUser, isServerSupabaseConfigured } from "@/lib/supabase/server";
import { createMediaAssetSchema } from "@/types/media";

async function session() {
  if (!isServerSupabaseConfigured()) return null;
  const [client, user] = await Promise.all([createServerSupabaseClient(), getServerUser()]);
  return client && user ? { client, user } : null;
}

export async function GET() {
  const current = await session();
  if (!current) return NextResponse.json({ error: "Inicia sesión para ver tus medios." }, { status: 401 });
  const { data, error } = await current.client.from("assets").select("id,storage_path,file_name,mime_type,size_bytes,created_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ assets: (data ?? []).map((asset) => {
    const [resourceType = "image", format = "jpg"] = asset.mime_type.split("/");
    return { id: asset.id, publicId: asset.file_name, secureUrl: asset.storage_path, originalFilename: asset.file_name, resourceType, format, bytes: Number(asset.size_bytes), createdAt: asset.created_at };
  }) });
}

export async function POST(request: Request) {
  try {
    const current = await session();
    if (!current) return NextResponse.json({ error: "Inicia sesión para guardar el medio." }, { status: 401 });
    const asset = createMediaAssetSchema.parse(await request.json());
    const { data, error } = await current.client.from("assets").insert({
      owner_id: current.user.id,
      storage_path: asset.secureUrl,
      file_name: asset.publicId,
      mime_type: `${asset.resourceType}/${asset.format}`,
      size_bytes: asset.bytes,
    }).select("id,created_at").single();
    if (error || !data) return NextResponse.json({ error: error?.message ?? "No se pudo registrar el medio." }, { status: 500 });
    return NextResponse.json({ asset: { ...asset, id: data.id, createdAt: data.created_at } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Cloudinary devolvió un archivo no válido o mayor de 10 MB." }, { status: 400 });
  }
}
