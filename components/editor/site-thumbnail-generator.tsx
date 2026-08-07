"use client";

import { useState } from "react";
import { Camera, Check, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useEditorStore } from "@/stores/editor-store";

export function SiteThumbnailGenerator({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const schema = useEditorStore((s) => s.schema);
  const updateSite = useEditorStore((s) => s.updateSite);
  const [capturing, setCapturing] = useState(false);

  if (!isOpen) return null;

  const handleCaptureThumbnail = () => {
    setCapturing(true);
    setTimeout(() => {
      // Generate a dynamic high-res SVG canvas thumbnail representation of the site theme & palette
      const primaryColor = schema.site.theme.colors.background || "#050508";
      const accentColor = schema.site.theme.colors.accent || "#8b5cf6";
      const siteName = schema.site.name || "Vexora Site";

      // Encoded SVG thumbnail data URL
      const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"><rect width="800" height="500" fill="${primaryColor}"/><circle cx="700" cy="100" r="250" fill="${accentColor}" opacity="0.25" filter="blur(40px)"/><text x="60" y="220" font-family="system-ui, sans-serif" font-size="48" font-weight="bold" fill="#ffffff">${siteName}</text><text x="60" y="280" font-family="system-ui, sans-serif" font-size="20" fill="#a78bfa">Vista previa generada por Vexora</text><rect x="60" y="320" width="160" height="48" rx="24" fill="${accentColor}"/></svg>`;
      const thumbnailUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;

      updateSite({ thumbnail: thumbnailUrl });
      setCapturing(false);
      toast.success("Miniatura de sitio capturada y guardada", {
        description: "Se mostrará en la tarjeta de tu proyecto dentro del dashboard.",
      });
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] border border-purple-500/30 bg-[#0c0818] p-7 md:p-8 text-white shadow-[0_0_90px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in-95 duration-200 text-center">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 grid size-9 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#c084fc] text-white shadow-lg">
          <Camera size={24} />
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-[10px] font-semibold text-[#c084fc]">
          <Sparkles size={12} /> GENERADOR DE CAPTURAS DE SITIO
        </span>

        <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">
          Capturar Miniatura del Sitio
        </h2>
        <p className="mt-2 text-xs text-slate-300 leading-relaxed px-2">
          Genera una captura visual actualizada del diseño actual de <strong className="text-white">{schema.site.name}</strong> para la portada de tu proyecto.
        </p>

        {/* PREVIEW CANVAS BOX */}
        <div
          className="mt-6 mx-auto aspect-[16/10] w-full rounded-2xl border border-white/10 p-6 flex flex-col justify-between text-left overflow-hidden relative"
          style={{
            background: `radial-gradient(circle at 80% 20%, ${schema.site.theme.colors.accent || "#8b5cf6"}44, transparent 50%), ${schema.site.theme.colors.background || "#050508"}`,
          }}
        >
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#c084fc]">
            {schema.site.templateId || "Personalizado"}
          </span>
          <div>
            <p className="text-2xl font-bold text-white tracking-tight">{schema.site.name}</p>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2">{schema.site.description}</p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white">
            Cancelar
          </button>
          <button
            onClick={handleCaptureThumbnail}
            disabled={capturing}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-7 text-xs font-semibold text-white shadow-md hover:brightness-110 disabled:opacity-50"
          >
            {capturing ? <Check size={16} className="animate-spin" /> : <Camera size={16} />}
            {capturing ? "Capturando..." : "Generar y guardar miniatura"}
          </button>
        </div>
      </div>
    </div>
  );
}
