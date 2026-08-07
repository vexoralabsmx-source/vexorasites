"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, CreditCard, Sparkles } from "lucide-react";
import { MarketingFooter, MarketingNav, PageHero } from "@/components/marketing/marketing-shell";
import { ClipCheckoutModal } from "@/components/payments/clip-checkout-modal";
import { planNotice, plans } from "@/lib/marketing";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [clipModalOpen, setClipModalOpen] = useState(false);
  const [selectedPlanForClip, setSelectedPlanForClip] = useState("Studio");

  const openClip = (planName: string) => {
    if (planName === "Launch") {
      window.location.href = "/register?plan=launch";
      return;
    }
    setSelectedPlanForClip(planName);
    setClipModalOpen(true);
  };

  return (
    <div className="min-h-dvh bg-[#050508] text-[#f8fafc]">
      <MarketingNav />
      <ClipCheckoutModal
        isOpen={clipModalOpen}
        onClose={() => setClipModalOpen(false)}
        initialPlan={selectedPlanForClip}
      />
      <main>
        <PageHero
          eyebrow="Planes / Clip Pay Enabled"
          title="Empieza gratis. Paga con Clip cuando tu operación lo requiera."
          text="Planes transparentes integrados con pasarela Clip (México & LatAm). Suscríbete sin complicaciones y activa tu espacio inmediatamente."
        />

        {/* Billing toggle */}
        <div className="flex justify-center pb-12">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.03] p-1.5 backdrop-blur-xl">
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                !isAnnual ? "bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]" : "text-slate-400 hover:text-white"
              }`}
            >
              Pago Mensual
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition ${
                isAnnual ? "bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]" : "text-slate-400 hover:text-white"
              }`}
            >
              Pago Anual
              <span className="rounded-full bg-[#c084fc]/20 px-2 py-0.5 text-[10px] font-bold text-[#c084fc]">
                AHORRA 20%
              </span>
            </button>
          </div>
        </div>

        <section className="px-5 pb-24 md:px-8 md:pb-36">
          <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => {
              const displayPrice =
                isAnnual && plan.price.startsWith("$")
                  ? `$${Math.round(parseInt(plan.price.replace("$", "")) * 0.8)}`
                  : plan.price;

              return (
                <article
                  key={plan.name}
                  className={`relative flex min-h-[620px] flex-col rounded-[2rem] border p-7 transition-all ${
                    plan.featured
                      ? "border-purple-500/50 bg-gradient-to-b from-[#1c1236] to-[#0d071b] text-white shadow-[0_20px_60px_rgba(139,92,246,0.25)] scale-[1.02]"
                      : "border-white/10 bg-white/[0.025]"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md">
                      Mejor valor
                    </span>
                  )}
                  <p className={`text-xs font-semibold uppercase tracking-[.18em] ${plan.featured ? "text-[#c084fc]" : "text-slate-400"}`}>
                    {plan.eyebrow}
                  </p>
                  <h2 className="mt-5 text-2xl font-semibold">{plan.name}</h2>
                  <p className="mt-8 text-5xl font-semibold leading-none tracking-[-.06em] text-white">{displayPrice}</p>
                  <p className={`mt-2 text-xs ${plan.featured ? "text-slate-300" : "text-slate-400"}`}>
                    {isAnnual && plan.price.startsWith("$") ? "USD / mes (facturado anualmente)" : plan.period}
                  </p>
                  <p className={`mt-7 min-h-20 leading-relaxed text-sm ${plan.featured ? "text-slate-200" : "text-slate-400"}`}>
                    {plan.description}
                  </p>
                  <ul className="mt-8 space-y-4">
                    {plan.benefits.map((benefit) => (
                      <li key={benefit} className={`flex gap-3 text-sm leading-relaxed ${plan.featured ? "text-slate-200" : "text-slate-300"}`}>
                        <Check size={17} className={`shrink-0 ${plan.featured ? "text-[#c084fc]" : "text-[#a78bfa]"}`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => openClip(plan.name)}
                    className={`mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-full text-sm font-semibold transition ${
                      plan.featured
                        ? "bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white shadow-lg hover:brightness-110"
                        : "bg-white text-black hover:bg-slate-200"
                    }`}
                  >
                    {plan.name === "Launch" ? "Crear gratis" : `Pagar con Clip (${plan.name})`}
                    {plan.name !== "Launch" ? <CreditCard size={16} /> : <ArrowRight size={16} />}
                  </button>
                </article>
              );
            })}
          </div>
          <p className="mx-auto mt-8 max-w-4xl text-center text-xs leading-relaxed text-slate-500">{planNotice}</p>
        </section>

        <section className="border-y border-white/10 bg-[#080612] px-5 py-24 md:px-8">
          <div className="mx-auto grid max-w-[1100px] gap-12 lg:grid-cols-[.7fr_1.3fr]">
            <h2 className="text-4xl font-semibold tracking-[-.05em] text-white md:text-5xl">Preguntas sobre pagos con Clip.</h2>
            <div className="divide-y divide-white/10">
              {[
                ["¿Cómo funciona el pago con Clip?", "Aceptamos tarjetas de crédito/débito Visa, Mastercard, AMEX y transferencias SPEI en México a través de la API oficial de PayClip."],
                ["¿Puedo empezar sin tarjeta?", "Sí. El plan Launch es gratuito y no requiere método de pago."],
                ["¿Cómo activo mi plan suscrito?", "Una vez completado el checkout de Clip, tu cuenta se actualiza automáticamente en el dashboard de Vexora."],
                ["¿Mis fotos cuentan como almacenamiento?", "Los archivos viven en tu cuenta de Cloudinary; Vexora conserva únicamente el catálogo y los enlaces de integración."],
              ].map(([question, answer]) => (
                <article key={question} className="py-6">
                  <h3 className="font-semibold text-white">{question}</h3>
                  <p className="mt-2 leading-relaxed text-slate-400 text-sm">{answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
