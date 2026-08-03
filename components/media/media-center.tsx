"use client";

import Link from "next/link";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, BookOpen, Check, Cloud, Copy, ExternalLink, ImageIcon, LoaderCircle, Upload, Video } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Brand } from "@/components/brand";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";
import type { CreateMediaAsset, MediaAsset } from "@/types/media";

type WidgetResult = { event?: string; info?: { public_id?: string; secure_url?: string; original_filename?: string; resource_type?: string; format?: string; bytes?: number; width?: number; height?: number } };
type UploadWidget = { open: () => void };

declare global {
  interface Window {
    cloudinary?: { createUploadWidget: (options: Record<string, unknown>, callback: (error: unknown, result: WidgetResult) => void) => UploadWidget };
  }
}

const localKey = "vexora-cloudinary-assets";

export function MediaCenter({ cloudName, uploadPreset }: { cloudName: string; uploadPreset: string }) {
  const configured = Boolean(cloudName && uploadPreset);
  const remoteMode = isSupabaseConfigured();
  const widget = useRef<UploadWidget | null>(null);
  const [widgetReady, setWidgetReady] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (remoteMode) {
        const response = await fetch("/api/assets", { cache: "no-store" });
        if (response.ok) {
          const payload = await response.json() as { assets: MediaAsset[] };
          setAssets(payload.assets);
          setLoading(false);
          return;
        }
      }
      try { setAssets(JSON.parse(localStorage.getItem(localKey) ?? "[]") as MediaAsset[]); } catch { setAssets([]); }
      setLoading(false);
    };
    void load();
  }, [remoteMode]);

  const remember = async (input: CreateMediaAsset) => {
    let asset: MediaAsset = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    if (remoteMode) {
      const response = await fetch("/api/assets", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(input) });
      const payload = await response.json() as { asset?: MediaAsset; error?: string };
      if (!response.ok || !payload.asset) throw new Error(payload.error ?? "El archivo subió, pero no se pudo registrar en Vexora.");
      asset = payload.asset;
    } else {
      let stored: MediaAsset[] = [];
      try { stored = JSON.parse(localStorage.getItem(localKey) ?? "[]") as MediaAsset[]; } catch { stored = []; }
      const next = [asset, ...stored.filter((item) => item.publicId !== asset.publicId)];
      localStorage.setItem(localKey, JSON.stringify(next));
    }
    setAssets((current) => [asset, ...current.filter((item) => item.publicId !== asset.publicId)]);
    toast.success("Medio listo para usar", { description: "Copia su enlace y pégalo en el editor." });
  };

  const openUpload = () => {
    if (!configured || !widgetReady || !window.cloudinary) return;
    if (!widget.current) {
      widget.current = window.cloudinary.createUploadWidget({
        cloudName,
        uploadPreset,
        folder: "vexora-sites",
        sources: ["local", "url", "camera", "google_drive", "dropbox"],
        resourceType: "auto",
        clientAllowedFormats: ["jpg", "jpeg", "png", "webp", "avif", "gif", "mp4", "webm", "mov"],
        maxFileSize: 10 * 1024 * 1024,
        maxFiles: 10,
        multiple: true,
        cropping: false,
      }, (error, result) => {
        if (error) { toast.error("Cloudinary no pudo completar la carga", { description: "Revisa el formato, el tamaño y vuelve a intentarlo." }); return; }
        if (result.event !== "success" || !result.info?.secure_url || !result.info.public_id) return;
        const info = result.info;
        const publicId = info.public_id!;
        const secureUrl = info.secure_url!;
        void remember({
          publicId,
          secureUrl,
          originalFilename: info.original_filename || publicId,
          resourceType: info.resource_type === "video" ? "video" : "image",
          format: info.format || (info.resource_type === "video" ? "mp4" : "jpg"),
          bytes: info.bytes ?? 0,
          width: info.width,
          height: info.height,
        }).catch((cause) => toast.error(cause instanceof Error ? cause.message : "No se pudo registrar el medio."));
      });
    }
    widget.current.open();
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Enlace copiado", { description: "Vuelve al editor y pégalo en Fotos de Cloudinary." });
  };

  return <main className="min-h-dvh bg-[#09090c] text-[#f7f4ef]">
    <Script src="https://upload-widget.cloudinary.com/latest/global/all.js" strategy="afterInteractive" onLoad={() => setWidgetReady(true)}/>
    <Toaster theme="dark" position="bottom-center"/>
    <header className="border-b border-white/[.08] bg-[#0d0d12]/90 backdrop-blur-xl"><div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-8"><div className="flex items-center gap-3"><Link href="/dashboard" aria-label="Volver al dashboard" className="grid size-11 place-items-center rounded-xl text-white/50 hover:bg-white/[.06] hover:text-white"><ArrowLeft size={18}/></Link><Brand/></div><a href="https://console.cloudinary.com/console/media_library" target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-white/70 hover:bg-white/[.06] hover:text-white">Abrir Cloudinary<ExternalLink size={16}/></a></div></header>
    <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
        <div className="rounded-[2rem] border border-violet-400/20 bg-[radial-gradient(circle_at_15%_20%,rgba(139,124,255,.22),transparent_35%),#111118] p-7 md:p-10"><div className="flex size-12 items-center justify-center rounded-2xl bg-violet-400/15 text-violet-200"><Cloud/></div><p className="mt-8 text-xs font-semibold uppercase tracking-[.2em] text-violet-300">Centro de medios</p><h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-.055em] md:text-6xl">Tus fotos y videos viven en Cloudinary.</h1><p className="mt-5 max-w-2xl text-base leading-relaxed text-white/55 md:text-lg">Súbelos aquí, adminístralos en Cloudinary y usa sus enlaces en cualquier sitio de Vexora.</p><div className="mt-8 flex flex-col gap-3 sm:flex-row">{configured?<button onClick={openUpload} disabled={!widgetReady} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-black hover:bg-violet-100 disabled:cursor-wait disabled:opacity-50">{widgetReady?<Upload size={18}/>:<LoaderCircle size={18} className="animate-spin"/>}{widgetReady?"Subir fotos o videos":"Preparando Cloudinary..."}</button>:<a href="https://cloudinary.com/users/register_free" target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-semibold text-black hover:bg-violet-100">Crear cuenta en Cloudinary<ArrowUpRight size={18}/></a>}<a href="#tutorial" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/12 px-6 font-semibold hover:bg-white/[.06]"><BookOpen size={18}/>Ver tutorial</a></div>{!configured&&<p role="status" className="mt-5 rounded-xl border border-amber-300/20 bg-amber-300/[.07] p-4 text-sm leading-relaxed text-amber-100">Cloudinary todavía no está conectado. Crea tu cuenta y configura el nombre de nube y el preset de carga siguiendo la guía de abajo.</p>}</div>
        <aside className="rounded-[2rem] border border-white/[.08] bg-white/[.025] p-7"><p className="text-sm font-semibold">Flujo recomendado</p><ol className="mt-6 space-y-5">{["Sube el archivo desde Vexora.","Cloudinary lo almacena y optimiza.","Copia el enlace del medio.","Pégalo en la sección de tu sitio."].map((step,index)=><li key={step} className="flex gap-3 text-sm leading-relaxed text-white/55"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-violet-400/12 text-xs font-semibold text-violet-200">{index+1}</span>{step}</li>)}</ol><div className="mt-7 rounded-xl border border-emerald-400/15 bg-emerald-400/[.06] p-4 text-xs leading-relaxed text-emerald-100"><Check size={15} className="mb-2"/>Los archivos no ocupan espacio en Vexora: permanecen en tu biblioteca de Cloudinary.</div></aside>
      </section>

      <section className="mt-12" aria-labelledby="library-title"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm text-violet-300">Biblioteca rápida</p><h2 id="library-title" className="mt-1 text-2xl font-semibold">Medios recientes</h2></div><p className="text-xs text-white/35">Máximo 10 MB por archivo · JPG, PNG, WebP, AVIF, GIF, MP4, WebM o MOV</p></div>{loading?<div className="mt-6 grid min-h-48 place-items-center rounded-2xl border border-white/[.08]"><LoaderCircle className="animate-spin text-violet-300"/></div>:assets.length===0?<div className="mt-6 rounded-[1.5rem] border border-dashed border-white/15 px-6 py-14 text-center"><ImageIcon className="mx-auto text-violet-300"/><h3 className="mt-4 text-lg font-semibold">Aún no tienes medios en Vexora.</h3><p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-white/40">Cuando subas un archivo con Cloudinary aparecerá aquí con un botón para copiar su enlace.</p></div>:<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{assets.map((asset)=><article key={asset.id} className="overflow-hidden rounded-2xl border border-white/[.08] bg-[#101016]"><div className="relative aspect-[4/3] bg-black/20">{asset.resourceType==="video"?<video src={asset.secureUrl} preload="metadata" className="size-full object-cover" aria-label={asset.originalFilename}/>:<Image src={optimizeCloudinaryImage(asset.secureUrl)} alt={asset.originalFilename} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover"/>}<span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[10px] uppercase tracking-wide">{asset.resourceType==="video"?<Video size={12}/>:<ImageIcon size={12}/>} {asset.format}</span></div><div className="p-4"><p className="truncate text-sm font-semibold" title={asset.originalFilename}>{asset.originalFilename}</p><p className="mt-1 text-xs text-white/35">{(asset.bytes/1024/1024).toFixed(1)} MB</p><button onClick={() => void copyUrl(asset.secureUrl)} className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white/[.07] text-xs font-semibold hover:bg-white/[.12]"><Copy size={15}/>Copiar enlace</button></div></article>)}</div>}</section>

      <section id="tutorial" className="mt-16 scroll-mt-24 border-t border-white/[.08] pt-12"><div className="max-w-3xl"><p className="text-sm text-violet-300">Disponible siempre en tu cuenta</p><h2 className="mt-2 text-3xl font-semibold tracking-[-.04em] md:text-4xl">Tutorial rápido de Cloudinary</h2><p className="mt-4 leading-relaxed text-white/50">Puedes volver a esta página desde “Fotos y medios” en el menú del dashboard.</p></div><div className="mt-8 grid gap-4 md:grid-cols-2">{[
        ["1. Crea tu cuenta", "Pulsa “Abrir Cloudinary” o “Crear cuenta”. Completa el registro gratuito y entra al panel."],
        ["2. Crea un preset", "En Cloudinary abre Settings → Upload → Upload presets. Crea un preset Unsigned y limita formatos y tamaño."],
        ["3. Conecta Vexora", "Copia el Cloud name y el nombre del preset a NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME y NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."],
        ["4. Usa tus fotos", "Vuelve aquí, pulsa Subir, copia el enlace resultante y pégalo en Fotos de Cloudinary dentro del editor."],
      ].map(([title,body])=><article key={title} className="rounded-2xl border border-white/[.08] bg-white/[.025] p-6"><h3 className="font-semibold">{title}</h3><p className="mt-3 text-sm leading-relaxed text-white/48">{body}</p></article>)}</div><a href="https://cloudinary.com/documentation/upload_widget" target="_blank" rel="noreferrer" className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-violet-300 hover:text-violet-200">Documentación oficial de Cloudinary<ExternalLink size={15}/></a></section>
    </div>
  </main>;
}
