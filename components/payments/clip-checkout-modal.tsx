"use client";

import { useState } from "react";
import { CreditCard, ShieldCheck, Sparkles, X, Check, ExternalLink, LoaderCircle } from "lucide-react";
import { toast } from "sonner";

export function ClipCheckoutModal({
  isOpen,
  onClose,
  initialPlan = "Studio",
}: {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}) {
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [email, setEmail] = useState("usuario@vexora.site");
  const [customApiKey, setCustomApiKey] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const planPrices: Record<string, { price: number; desc: string }> = {
    Studio: { price: 29, desc: "5 sitios activos, 20 páginas por sitio, plantillas signature" },
    Scale: { price: 79, desc: "20 sitios activos, páginas ilimitadas, analíticas avanzadas" },
    Enterprise: { price: 199, desc: "Infraestructura dedicada, SSO, SLA prioritario" },
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/clip/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan.toLowerCase(),
          price: planPrices[selectedPlan]?.price ?? 29,
          email,
          apiKey: customApiKey || undefined,
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        checkoutUrl?: string;
        error?: string;
        method?: string;
      };

      if (!response.ok || !data.success || !data.checkoutUrl) {
        throw new Error(data.error || "No se pudo generar el enlace de pago con Clip.");
      }

      toast.success("Redirigiendo a pasarela de pago Clip...", {
        description: `Plan ${selectedPlan} — $${planPrices[selectedPlan]?.price} USD / mes`,
      });

      setTimeout(() => {
        window.open(data.checkoutUrl, "_blank");
        onClose();
        setLoading(false);
      }, 800);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al procesar el pago con Clip");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl overflow-hidden rounded-[2.5rem] border border-purple-500/30 bg-[#0c0818] p-7 md:p-9 text-white shadow-[0_0_90px_rgba(139,92,246,0.3)] animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 grid size-9 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:bg-white/10 hover:text-white"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#c084fc] text-white shadow-lg">
            <CreditCard size={22} />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-semibold text-[#c084fc]">
              <Sparkles size={12} /> CLIP PAYMENTS (MÉXICO & LATAM)
            </span>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Suscripción con Clip
            </h2>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-300 leading-relaxed">
          Paga de forma segura con tarjeta de crédito, débito o transferencia SPEI a través de la API oficial de Clip.
        </p>

        {/* Plan Selector */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {["Studio", "Scale", "Enterprise"].map((plan) => (
            <button
              key={plan}
              onClick={() => setSelectedPlan(plan)}
              className={`rounded-2xl border p-4 text-left transition ${
                selectedPlan === plan
                  ? "border-[#c084fc] bg-purple-600/25 text-white shadow-[0_0_20px_rgba(192,132,252,0.2)]"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider">{plan}</span>
                {selectedPlan === plan && <Check size={14} className="text-[#c084fc]" />}
              </div>
              <p className="mt-2 text-2xl font-semibold text-white">${planPrices[plan]?.price}</p>
              <p className="text-[10px] text-slate-400">USD / mes</p>
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-300">
              Correo de la cuenta
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white outline-none focus:border-[#c084fc] focus:ring-2 focus:ring-[#c084fc]/20"
              placeholder="tu@correo.com"
            />
          </label>

          <label className="block">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold text-slate-300">
                Clip Secret API Token (Opcional)
              </span>
              <span className="text-[10px] text-slate-500">api-key / secret-key</span>
            </div>
            <input
              type="password"
              value={customApiKey}
              onChange={(e) => setCustomApiKey(e.target.value)}
              className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 font-mono text-sm text-white outline-none focus:border-[#c084fc] focus:ring-2 focus:ring-[#c084fc]/20"
              placeholder="Env de producción o ingresar token de Clip..."
            />
          </label>
        </div>

        <div className="mt-6 rounded-2xl border border-purple-500/20 bg-purple-500/10 p-4 text-xs text-slate-300 flex items-center gap-3">
          <ShieldCheck size={20} className="text-[#c084fc] shrink-0" />
          <span>
            Procesado con encriptación SSL de 256 bits mediante PayClip. Tu membresía activa inmediatamente.
          </span>
        </div>

        <div className="mt-7 flex items-center justify-between border-t border-white/10 pt-5">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#c084fc] px-7 font-semibold text-white shadow-lg transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle className="animate-spin" size={18} />
            ) : (
              <>
                Pagar con Clip (${planPrices[selectedPlan]?.price} USD)
                <ExternalLink size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
