"use client";

import { useState } from "react";
import { Check, Copy, Download, ExternalLink, QrCode, Share2, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

export function ShareQrModal({
  isOpen,
  onClose,
  siteName = "Orbital Studio",
  siteUrl = "http://localhost:3000/site/orbital-studio",
}: {
  isOpen: boolean;
  onClose: () => void;
  siteName?: string;
  siteUrl?: string;
}) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const copyLink = () => {
    void navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    toast.success("Enlace del sitio copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    // Generate QR download using QuickChart QR API
    const qrApiUrl = `https://quickchart.io/qr?text=${encodeURIComponent(siteUrl)}&size=400&dark=0c0818&light=ffffff&margin=2`;
    const a = document.createElement("a");
    a.href = qrApiUrl;
    a.download = `qr-${siteName.toLowerCase().replace(/\s+/g, "-")}.png`;
    a.target = "_blank";
    a.click();
    toast.success("Descargando Código QR", { description: "Listo para tarjetas, volantes o menús." });
  };

  const shareWhatsapp = () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(`¡Echa un vistazo a ${siteName}! ${siteUrl}`)}`;
    window.open(waUrl, "_blank");
  };

  const shareTwitter = () => {
    const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Publicado con @VexoraSites: ${siteName}`)}&url=${encodeURIComponent(siteUrl)}`;
    window.open(twUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-purple-500/30 bg-[#0c0818] p-7 md:p-8 text-white shadow-[0_0_90px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in-95 duration-200 text-center">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 grid size-9 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#c084fc] text-white shadow-lg">
          <QrCode size={24} />
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-[10px] font-semibold text-[#c084fc]">
          <Sparkles size={12} /> CÓDIGO QR & COMPARTIR
        </span>

        <h2 className="mt-2 text-2xl font-bold text-white tracking-tight">{siteName}</h2>
        <p className="mt-1 truncate font-mono text-xs text-slate-400 px-4" title={siteUrl}>
          {siteUrl}
        </p>

        {/* QR CODE PREVIEW */}
        <div className="mt-6 mx-auto w-48 h-48 rounded-2xl border-4 border-white bg-white p-2 shadow-2xl flex items-center justify-center">
          <img
            src={`https://quickchart.io/qr?text=${encodeURIComponent(siteUrl)}&size=300&margin=1`}
            alt={`Código QR de ${siteName}`}
            className="size-full object-contain"
          />
        </div>

        {/* BUTTON ACTIONS */}
        <div className="mt-6 flex flex-col gap-2.5">
          <button
            onClick={handleDownloadQr}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-6 text-xs font-semibold text-white shadow-md hover:brightness-110 transition"
          >
            <Download size={16} /> Descargar Código QR (PNG HD)
          </button>

          <button
            onClick={copyLink}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-6 text-xs font-semibold text-white hover:bg-white/10 transition"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            {copied ? "Enlace copiado" : "Copiar enlace del sitio"}
          </button>
        </div>

        {/* SOCIAL SHARE SHORTCUTS */}
        <div className="mt-6 border-t border-white/10 pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Compartir en redes
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={shareWhatsapp}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 transition"
            >
              <Share2 size={14} /> WhatsApp
            </button>
            <button
              onClick={shareTwitter}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 text-xs font-semibold text-sky-300 hover:bg-sky-500/20 transition"
            >
              <ExternalLink size={14} /> Twitter / X
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
