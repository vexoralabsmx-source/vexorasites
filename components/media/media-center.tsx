"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, Check, Cloud, Copy, ExternalLink, ImageIcon, Link2, LoaderCircle, Plus, Trash2, Video, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Brand } from "@/components/brand";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";
import type { CreateMediaAsset, MediaAsset } from "@/types/media";

const localKey = "vexora-cloudinary-assets";

export function MediaCenter() {
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const [customFilename, setCustomFilename] = useState("");
  const [customResourceType, setCustomResourceType] = useState<"image" | "video">("image");

  const remoteMode = isSupabaseConfigured();
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (remoteMode) {
        const response = await fetch("/api/assets", { cache: "no-store" });
        if (response.ok) {
          const payload = (await response.json()) as { assets: MediaAsset[] };
          setAssets(payload.assets);
          setLoading(false);
          return;
        }
      }
      try {
        const stored = JSON.parse(localStorage.getItem(localKey) ?? "[]") as MediaAsset[];
        setAssets(stored);
      } catch {
        setAssets([]);
      }
      setLoading(false);
    };
    void load();
  }, [remoteMode]);

  const remember = async (input: CreateMediaAsset) => {
    let asset: MediaAsset = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    if (remoteMode) {
      const response = await fetch("/api/assets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const payload = (await response.json()) as { asset?: MediaAsset; error?: string };
      if (!response.ok || !payload.asset)
        throw new Error(payload.error ?? "No se pudo registrar el enlace en Vexora.");
      asset = payload.asset;
    } else {
      let stored: MediaAsset[] = [];
      try {
        stored = JSON.parse(localStorage.getItem(localKey) ?? "[]") as MediaAsset[];
      } catch {
        stored = [];
      }
      const next = [asset, ...stored.filter((item) => item.publicId !== asset.publicId)];
      localStorage.setItem(localKey, JSON.stringify(next));
    }
    setAssets((current) => [asset, ...current.filter((item) => item.publicId !== asset.publicId)]);
    toast.success("Enlace guardado en tu biblioteca", {
      description: "Puedes usar esta URL en cualquier sección de tus sitios Vexora.",
    });
  };

  const handleAddDirectUrl = async () => {
    if (!customUrl.trim()) {
      toast.error("Ingresa una URL válida de Cloudinary u otra imagen/video");
      return;
    }
    const url = customUrl.trim();
    const isVid = customResourceType === "video" || url.includes(".mp4") || url.includes(".webm") || url.includes(".mov");
    const filename = customFilename.trim() || url.split("/").pop()?.split("?")[0] || "Enlace Cloudinary";

    try {
      await remember({
        publicId: `link_${Date.now()}`,
        secureUrl: url,
        originalFilename: filename,
        resourceType: isVid ? "video" : "image",
        format: isVid ? "mp4" : "jpg",
        bytes: 1024 * 1024,
      });
      setCustomUrl("");
      setCustomFilename("");
      setShowUrlModal(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo registrar el enlace");
    }
  };

  const handleDeleteAsset = (id: string) => {
    const next = assets.filter((item) => item.id !== id);
    setAssets(next);
    localStorage.setItem(localKey, JSON.stringify(next));
    toast.success("Enlace eliminado de la biblioteca");
  };

  const copyUrl = async (url: string) => {
    await navigator.clipboard.writeText(url);
    toast.success("Enlace copiado al portapapeles", {
      description: "Listo para pegar en el editor de Vexora.",
    });
  };

  return (
    <main className="min-h-dvh bg-[#050508] text-[#f8fafc]">
      <Toaster theme="dark" position="bottom-center" />

      {/* HEADER */}
      <header className="border-b border-white/10 bg-[#07050e]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              aria-label="Volver al dashboard"
              className="grid size-11 place-items-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition"
            >
              <ArrowLeft size={18} />
            </Link>
            <Brand />
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://console.cloudinary.com/console/media_library"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
            >
              Abrir Cloudinary <ExternalLink size={15} />
            </a>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
        <section className="grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <div className="rounded-[2.2rem] border border-purple-500/30 bg-[radial-gradient(circle_at_15%_20%,rgba(167,139,250,0.2),transparent_40%),#0c0818] p-7 md:p-10 shadow-[0_0_60px_rgba(139,92,246,0.15)]">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-purple-500/20 text-[#c084fc] border border-purple-500/30">
              <Cloud size={24} />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[.2em] text-[#c084fc]">
              Centro de enlaces
            </p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-.055em] text-white md:text-6xl">
              Tus fotos y videos viven en Cloudinary.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
              Administra tus enlaces de Cloudinary y usa sus URL directas en cualquier sitio de Vexora.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row flex-wrap">
              <button
                onClick={() => setShowUrlModal(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-7 font-semibold text-white shadow-lg hover:brightness-110 transition"
              >
                <Link2 size={18} /> Añadir enlace URL directo
              </button>
              <a
                href="#tutorial"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/10 px-6 font-semibold text-slate-300 hover:bg-white/10 transition"
              >
                <BookOpen size={18} /> Ver tutorial
              </a>
            </div>
          </div>

          <aside className="rounded-[2.2rem] border border-white/10 bg-[#090614] p-7 flex flex-col justify-between">
            <div>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                <Check size={16} className="text-[#c084fc]" /> Uso por enlaces URL
              </p>
              <ol className="mt-6 space-y-4">
                {[
                  "Sube tu foto o video a Cloudinary o usa su enlace público.",
                  "Copia la URL del archivo.",
                  "Pégala aquí para organizarla en tu biblioteca Vexora.",
                  "Úsala en tus sitios con 1 solo clic.",
                ].map((step, index) => (
                  <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-300">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-purple-500/20 text-xs font-semibold text-[#c084fc] border border-purple-500/30">
                      {index + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="mt-7 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs leading-relaxed text-emerald-200">
              <Check size={15} className="mb-1 text-emerald-400" /> Sincronización instantánea mediante URL directa.
            </div>
          </aside>
        </section>

        {/* LIBRARY SECTION */}
        <section className="mt-14" aria-labelledby="library-title">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end border-b border-white/10 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#c084fc]">
                Biblioteca por Enlaces
              </p>
              <h2 id="library-title" className="mt-1 text-3xl font-semibold text-white">
                Enlaces guardados ({assets.length})
              </h2>
            </div>
            <button
              onClick={() => setShowUrlModal(true)}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-[#c084fc] hover:bg-purple-500/20 transition"
            >
              <Plus size={14} /> Nuevo enlace
            </button>
          </div>

          {loading ? (
            <div className="mt-8 grid min-h-48 place-items-center rounded-2xl border border-white/10 bg-[#090614]">
              <LoaderCircle className="animate-spin text-[#c084fc]" size={32} />
            </div>
          ) : assets.length === 0 ? (
            <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 bg-white/[0.01] px-6 py-16 text-center">
              <ImageIcon className="mx-auto text-[#c084fc]" size={36} />
              <h3 className="mt-4 text-xl font-semibold text-white">
                Aún no tienes enlaces guardados.
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                Pega la URL de una foto o video de Cloudinary para organizarla en tu estudio.
              </p>
              <button
                onClick={() => setShowUrlModal(true)}
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-6 text-xs font-semibold text-white shadow-lg hover:brightness-110 transition"
              >
                <Link2 size={16} /> Pegar primer enlace
              </button>
            </div>
          ) : (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {assets.map((asset) => (
                <article
                  key={asset.id}
                  className="group overflow-hidden rounded-2xl border border-white/10 bg-[#0c0818] transition hover:border-purple-500/40"
                >
                  <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                    {asset.resourceType === "video" ? (
                      <video
                        src={asset.secureUrl}
                        preload="metadata"
                        className="size-full object-cover"
                        aria-label={asset.originalFilename}
                      />
                    ) : (
                      <Image
                        src={optimizeCloudinaryImage(asset.secureUrl)}
                        alt={asset.originalFilename}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-300 group-hover:scale-105"
                      />
                    )}
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-semibold text-white uppercase tracking-wide border border-white/10">
                      {asset.resourceType === "video" ? (
                        <Video size={12} className="text-[#c084fc]" />
                      ) : (
                        <ImageIcon size={12} className="text-[#c084fc]" />
                      )}{" "}
                      {asset.format}
                    </span>
                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="absolute right-3 top-3 grid size-8 place-items-center rounded-full bg-rose-950/80 text-rose-300 border border-rose-500/30 opacity-0 transition group-hover:opacity-100 hover:bg-rose-600 hover:text-white"
                      title="Eliminar de biblioteca"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="p-4 bg-[#090614]">
                    <p className="truncate text-sm font-semibold text-white" title={asset.originalFilename}>
                      {asset.originalFilename}
                    </p>
                    <p className="mt-1 truncate font-mono text-[10px] text-slate-500" title={asset.secureUrl}>
                      {asset.secureUrl}
                    </p>
                    <button
                      onClick={() => void copyUrl(asset.secureUrl)}
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-600/20 text-xs font-semibold text-white border border-purple-500/30 hover:bg-gradient-to-r hover:from-[#8b5cf6] hover:to-[#c084fc] hover:border-transparent transition"
                    >
                      <Copy size={15} /> Copiar enlace directo
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* TUTORIAL */}
        <section id="tutorial" className="mt-16 scroll-mt-24 border-t border-white/10 pt-12">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#c084fc]">Guía rápida</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-[-.04em] text-white md:text-4xl">
              Cómo usar enlaces de Cloudinary
            </h2>
            <p className="mt-4 leading-relaxed text-slate-400">
              Puedes subir tus archivos a tu panel de Cloudinary y pegar aquí sus enlaces para administrarlos en todos tus sitios Vexora.
            </p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[
              ["1. Copia la URL de Cloudinary", "Entra a tu biblioteca de Cloudinary y copia el enlace seguro (secure_url) de la foto o video."],
              ["2. Agrégala a Vexora", "Haz clic en 'Añadir enlace URL directo' y pega la URL en la ventana emergente."],
              ["3. Organiza y copia", "Tu foto o video aparecerá en esta cuadrícula con vista previa y un botón para copiar su enlace directo."],
              ["4. Pégala en el editor", "Usa la URL copiada en cualquier bloque o imagen de tus páginas Vexora."],
            ].map(([title, body]) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-[#0c0818] p-6">
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{body}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      {/* DIRECT URL MODAL */}
      {showUrlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[2rem] border border-purple-500/30 bg-[#0c0818] p-7 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Link2 className="text-[#c084fc]" /> Añadir enlace de Cloudinary
              </h3>
              <button
                onClick={() => setShowUrlModal(false)}
                className="grid size-8 place-items-center rounded-full text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-300">URL del medio *</span>
                <input
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://res.cloudinary.com/.../imagen.png"
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 font-mono text-xs text-white outline-none focus:border-[#c084fc]"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-slate-300">Nombre / Título (Opcional)</span>
                <input
                  value={customFilename}
                  onChange={(e) => setCustomFilename(e.target.value)}
                  placeholder="Ej. Foto Principal Hero"
                  className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-[#c084fc]"
                />
              </label>
              <div>
                <span className="mb-1.5 block text-xs font-semibold text-slate-300">Tipo de archivo</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCustomResourceType("image")}
                    className={`min-h-11 rounded-xl border px-3 text-xs font-semibold transition ${
                      customResourceType === "image"
                        ? "border-[#c084fc] bg-purple-600/30 text-white"
                        : "border-white/10 text-slate-400"
                    }`}
                  >
                    Imagen
                  </button>
                  <button
                    onClick={() => setCustomResourceType("video")}
                    className={`min-h-11 rounded-xl border px-3 text-xs font-semibold transition ${
                      customResourceType === "video"
                        ? "border-[#c084fc] bg-purple-600/30 text-white"
                        : "border-white/10 text-slate-400"
                    }`}
                  >
                    Video
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-7 flex justify-end gap-3 border-t border-white/10 pt-4">
              <button
                onClick={() => setShowUrlModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddDirectUrl}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:brightness-110"
              >
                Guardar enlace
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
