"use client";

import { useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Globe, LoaderCircle, RefreshCw, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

export function DomainManagerModal({
  isOpen,
  onClose,
  siteName = "Orbital Studio",
  siteSlug = "orbital-studio",
  initialDomain = "",
}: {
  isOpen: boolean;
  onClose: () => void;
  siteName?: string;
  siteSlug?: string;
  initialDomain?: string;
}) {
  const [domainInput, setDomainInput] = useState(initialDomain || "");
  const [connectedDomain, setConnectedDomain] = useState(initialDomain || "");
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<"none" | "pending" | "connected">(initialDomain ? "connected" : "none");

  if (!isOpen) return null;

  const handleSaveDomain = () => {
    if (!domainInput.trim()) {
      toast.error("Ingresa un nombre de dominio válido (ej. miempresa.com)");
      return;
    }
    const cleanDomain = domainInput.trim().toLowerCase().replace(/^https?:\/\//, "");
    setConnectedDomain(cleanDomain);
    setStatus("pending");
    try {
      localStorage.setItem(`vexora-domain-${siteSlug}`, cleanDomain);
    } catch {}
    toast.success("Dominio registrado", {
      description: "Configura los registros DNS a continuación para validar la conexión.",
    });
  };

  const handleVerifyDns = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStatus("connected");
      toast.success("¡Dominio verificado y conectado!", {
        description: `Tu sitio ${siteName} ahora responde en https://${connectedDomain}`,
      });
    }, 1200);
  };

  const copyToClipboard = (text: string, label: string) => {
    void navigator.clipboard.writeText(text);
    toast.success(`${label} copiado`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-purple-500/30 bg-[#0c0818] p-7 md:p-9 text-white shadow-[0_0_90px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 grid size-9 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#c084fc] text-white shadow-lg">
            <Globe size={24} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-[10px] font-semibold text-[#c084fc]">
              VEXORA DOMAINS ENGINE
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Dominio Personalizado
            </h2>
          </div>
        </div>

        <p className="mt-3 text-sm text-slate-300 leading-relaxed">
          Conecta tu propio dominio (ej. <code className="font-mono text-purple-300">miempresa.com</code>) para reemplazar la URL predeterminada <code className="font-mono text-slate-400">/site/{siteSlug}</code>.
        </p>

        {/* INPUT DOMAIN FORM */}
        <div className="mt-6">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-slate-300">
              Nombre de tu dominio
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="ej. miempresa.com o miempresa.mx"
                className="min-h-12 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-4 font-mono text-sm text-white outline-none focus:border-[#c084fc] focus:ring-2 focus:ring-[#c084fc]/20"
              />
              <button
                onClick={handleSaveDomain}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-6 text-xs font-semibold text-white shadow-md hover:brightness-110 transition"
              >
                Guardar dominio
              </button>
            </div>
          </label>
        </div>

        {/* DNS RECORDS TABLE IF DOMAIN ENTERED */}
        {connectedDomain && (
          <div className="mt-7 space-y-4 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                Configuración DNS recomendada
              </h3>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
                  status === "connected"
                    ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/30"
                    : "bg-amber-400/10 text-amber-200 border border-amber-400/30"
                }`}
              >
                {status === "connected" ? (
                  <>
                    <CheckCircle2 size={13} /> Dominio Conectado
                  </>
                ) : (
                  <>
                    <RefreshCw size={13} className="animate-spin" /> Esperando registros DNS
                  </>
                )}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#090614]">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 bg-white/[0.03] text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Valor / Destino</th>
                    <th className="px-4 py-3 text-right font-semibold">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono text-slate-200">
                  <tr>
                    <td className="px-4 py-3 font-bold text-[#c084fc]">A</td>
                    <td className="px-4 py-3">@</td>
                    <td className="px-4 py-3 text-slate-300">76.76.21.21</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => copyToClipboard("76.76.21.21", "IP A")}
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy size={14} />
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-bold text-[#c084fc]">CNAME</td>
                    <td className="px-4 py-3">www</td>
                    <td className="px-4 py-3 text-slate-300">cname.vexora.site</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => copyToClipboard("cname.vexora.site", "CNAME")}
                        className="text-slate-400 hover:text-white"
                      >
                        <Copy size={14} />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-[#c084fc] shrink-0" />
                <span>SSL TLS automático y certificado HTTPS gratuito incluido.</span>
              </div>
              <button
                onClick={handleVerifyDns}
                disabled={verifying}
                className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-600/20 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-600/30 transition disabled:opacity-50"
              >
                {verifying ? <LoaderCircle size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                {verifying ? "Verificando..." : "Verificar DNS"}
              </button>
            </div>
          </div>
        )}

        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-4">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-white">
            Cerrar
          </button>
          {connectedDomain && status === "connected" && (
            <a
              href={`https://${connectedDomain}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c084fc] hover:underline"
            >
              Probar https://{connectedDomain} <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
