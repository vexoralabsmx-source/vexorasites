"use client";

import { useState } from "react";
import { CheckCircle2, Globe, ImageIcon, Search, Share2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/editor-store";

export function SeoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const schema = useEditorStore((s) => s.schema);
  const updateSite = useEditorStore((s) => s.updateSite);

  const meta = schema.site.meta ?? {
    title: schema.site.name,
    description: schema.site.description ?? "Experiencia web cinematográfica creada con Vexora Sites.",
    ogImage: "https://res.cloudinary.com/khxvbeau/image/upload/v1785467555/vexoralabslogo_hy554s.png",
  };

  const [title, setTitle] = useState(meta.title || schema.site.name);
  const [description, setDescription] = useState(
    meta.description || schema.site.description || "Experiencia web cinematográfica creada con Vexora Sites."
  );
  const [ogImage, setOgImage] = useState(meta.ogImage || "");

  if (!isOpen) return null;

  // Compute SEO Health Score (0-100%)
  const titleScore = title.length >= 30 && title.length <= 60 ? 35 : title.length > 0 ? 15 : 0;
  const descScore = description.length >= 100 && description.length <= 160 ? 45 : description.length > 0 ? 20 : 0;
  const imageScore = ogImage ? 20 : 0;
  const totalScore = titleScore + descScore + imageScore;

  const handleSave = () => {
    updateSite({
      meta: {
        title,
        description,
        ogImage,
      },
    });
    toast.success("Configuración SEO guardada", {
      description: "Los metadatos OpenGraph se incluirán al publicar.",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-[2.5rem] border border-purple-500/30 bg-[#0c0818] p-7 md:p-9 text-white shadow-[0_0_90px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 grid size-9 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#c084fc] text-white shadow-lg">
            <Search size={22} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-[10px] font-semibold text-[#c084fc]">
              <Sparkles size={12} /> SEO & OPENGRAPH OPTIMIZER
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Posicionamiento & Redes Sociales
            </h2>
          </div>
        </div>

        {/* SEO SCORE METER */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-xl bg-purple-600/30 font-bold text-xl text-[#c084fc]">
              {totalScore}%
            </div>
            <div>
              <p className="text-xs font-semibold text-white">Puntaje SEO Estimado</p>
              <p className="text-[11px] text-slate-300">
                {totalScore >= 80 ? "¡Excelente! Optimizado para Google y redes." : "Completa la descripción e imagen para llegar al 100%."}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-[#c084fc]">
            {totalScore >= 80 ? "SEO ÓPTIMO" : "MEJORABLE"}
          </span>
        </div>

        {/* FORM & PREVIEWS GRID */}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* INPUT FORM */}
          <div className="space-y-4">
            <label className="block">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-300">Título SEO (meta title)</span>
                <span className="text-[10px] text-slate-500 font-mono">{title.length}/60</span>
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={70}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs text-white outline-none focus:border-[#c084fc]"
                placeholder="Ej. Orbital Studio — Diseño Digital"
              />
            </label>

            <label className="block">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-300">Descripción Meta</span>
                <span className="text-[10px] text-slate-500 font-mono">{description.length}/160</span>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-3 text-xs text-white outline-none focus:border-[#c084fc] resize-none"
                placeholder="Resumen atractivo para los resultados de búsqueda..."
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold text-slate-300">
                Imagen OpenGraph (og:image) URL
              </span>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 font-mono text-xs text-white outline-none focus:border-[#c084fc]"
                placeholder="https://res.cloudinary.com/.../banner.png"
              />
            </label>
          </div>

          {/* LIVE PREVIEWS */}
          <div className="space-y-4">
            {/* GOOGLE PREVIEW */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Globe size={13} /> Vista previa en Google
              </p>
              <div className="rounded-xl border border-white/10 bg-[#07050e] p-4 font-sans text-xs">
                <p className="text-[11px] text-[#8ab4f8] font-medium truncate">https://vexora.site/site/{schema.site.slug}</p>
                <p className="mt-1 text-sm font-semibold text-[#8ab4f8] hover:underline cursor-pointer truncate">
                  {title || schema.site.name}
                </p>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>

            {/* SOCIAL CARD PREVIEW */}
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Share2 size={13} /> Tarjeta de Redes Sociales (og:card)
              </p>
              <div className="overflow-hidden rounded-xl border border-white/10 bg-[#090614]">
                <div className="relative aspect-[1.91/1] bg-black/40 flex items-center justify-center">
                  {ogImage ? (
                    <img src={ogImage} alt="Previsualización OG" className="size-full object-cover" />
                  ) : (
                    <ImageIcon className="text-slate-600" size={32} />
                  )}
                </div>
                <div className="p-3 bg-[#0c0818]">
                  <p className="text-[10px] font-bold text-[#c084fc] uppercase tracking-wider">vexora.site</p>
                  <p className="font-semibold text-white text-xs truncate mt-0.5">{title}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{description}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-7 text-xs font-semibold text-white shadow-md hover:brightness-110"
          >
            <CheckCircle2 size={16} /> Guardar metadatos SEO
          </button>
        </div>
      </div>
    </div>
  );
}
