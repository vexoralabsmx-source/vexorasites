"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, Check, ChevronRight, Layers3, MousePointer2, Play, Sparkles } from "lucide-react";
import { MarketingFooter, MarketingNav } from "@/components/marketing/marketing-shell";
import { capabilityStats, plans, productFeatures, valuePillars } from "@/lib/marketing";
import { templates } from "@/lib/templates";

export function LandingPage() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.from("[data-hero-line]", { yPercent: 110, opacity: 0, stagger: 0.09, duration: 1, ease: "power4.out" });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) =>
        gsap.from(element, { y: 30, opacity: 0, duration: 0.75, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%" } })
      );
    }, root);
    return () => context.revert();
  }, []);

  return (
    <div ref={root} className="min-h-dvh overflow-hidden bg-[#050508] text-[#f8fafc]">
      <a href="#contenido" className="sr-only z-[100] rounded bg-white p-3 text-black focus:not-sr-only focus:fixed focus:left-3 focus:top-3">
        Saltar al contenido
      </a>
      <MarketingNav />
      <main id="contenido">
        {/* HERO SECTION */}
        <section className="relative min-h-[100svh] overflow-hidden px-5 pb-16 pt-32 md:px-8 md:pt-40">
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_73%_25%,rgba(167,139,250,0.22),transparent_35%),radial-gradient(circle_at_20%_75%,rgba(139,92,246,0.14),transparent_30%)]" />
          <div className="pointer-events-none absolute inset-0 opacity-[0.04] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:80px_80px]" />
          <div className="relative mx-auto max-w-[1440px]">
            <div className="grid gap-12 lg:grid-cols-[1.08fr_.92fr] lg:items-end">
              <div>
                <h1 className="mt-8 max-w-5xl text-[clamp(4rem,9.3vw,9.5rem)] font-semibold leading-[.8] tracking-[-.082em]">
                  <span className="block overflow-hidden">
                    <span data-hero-line className="block text-white">Haz que tu</span>
                  </span>
                  <span className="block overflow-hidden">
                    <span data-hero-line className="block text-white/40">empresa se vea</span>
                  </span>
                  <span className="block overflow-hidden">
                    <span data-hero-line className="block bg-gradient-to-r from-white via-[#e9d5ff] to-[#c084fc] bg-clip-text pb-4 text-transparent">
                      inevitable.
                    </span>
                  </span>
                </h1>
              </div>
              <div className="pb-4 lg:pb-6">
                <p className="max-w-xl text-lg leading-relaxed text-slate-300 md:text-xl">
                  Crea sitios multipágina con dirección visual, narrativa y movimiento de marcas globales. Vexora convierte decisiones complejas en un flujo que cualquiera puede operar.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/register"
                    className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#c084fc] px-7 font-semibold text-white shadow-[0_12px_40px_rgba(139,92,246,0.35)] transition hover:brightness-110"
                  >
                    Crear mi sitio
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    href="/showcase"
                    className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full border border-white/15 bg-white/[0.04] px-6 font-semibold transition hover:bg-purple-950/40 hover:border-purple-400/40"
                  >
                    <Play size={17} /> Ver resultados
                  </Link>
                </div>
                <p className="mt-5 text-xs text-slate-400">Empieza gratis · Sin tarjeta · Edita todo cuando quieras</p>
              </div>
            </div>
            <ProductStage />
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="border-y border-white/10 bg-[#090710]">
          <div className="mx-auto grid max-w-[1440px] grid-cols-2 md:grid-cols-4">
            {capabilityStats.map(([number, label], index) => (
              <div
                key={label}
                className={`p-6 md:p-8 ${index % 2 ? "border-l border-white/10" : ""} ${index > 1 ? "border-t border-white/10 md:border-t-0" : ""} md:border-l md:first:border-l-0`}
              >
                <p className="text-3xl font-semibold tracking-[-.05em] text-[#c084fc] md:text-4xl">{number}</p>
                <p className="mt-2 max-w-[170px] text-xs leading-relaxed text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VALUE PILLARS SECTION */}
        <section className="px-5 py-24 md:px-8 md:py-36">
          <div className="mx-auto max-w-[1440px]">
            <div data-reveal className="grid gap-6 lg:grid-cols-[.7fr_1.3fr]">
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#c084fc]">La diferencia Vexora</p>
              <h2 className="max-w-5xl text-balance text-[clamp(3rem,7vw,7rem)] font-semibold leading-[.86] tracking-[-.07em]">
                Resultados extraordinarios. Un proceso sorprendentemente claro.
              </h2>
            </div>
            <div className="mt-16 grid gap-4 lg:grid-cols-3">
              {valuePillars.map(({ icon: Icon, title, text }, index) => (
                <article
                  data-reveal
                  key={title}
                  className="group min-h-[340px] rounded-[2rem] border border-white/10 bg-white/[0.025] p-7 transition duration-300 hover:border-[#a78bfa]/40 hover:bg-purple-950/20 md:p-9"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl border border-purple-500/30 bg-purple-500/10 text-[#c084fc]">
                      <Icon />
                    </span>
                    <span className="text-xs text-slate-500">0{index + 1}</span>
                  </div>
                  <h3 className="mt-24 text-3xl font-semibold tracking-[-.045em] text-white">{title}</h3>
                  <p className="mt-4 max-w-sm leading-relaxed text-slate-400">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MULTI-PAGE SECTION */}
        <section className="border-y border-white/10 bg-[#0a0714] px-5 py-24 text-white md:px-8 md:py-36">
          <div className="mx-auto max-w-[1440px]">
            <div data-reveal className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#c084fc]">Multipágina desde el inicio</p>
                <h2 className="mt-5 max-w-5xl text-[clamp(3.2rem,7vw,7rem)] font-semibold leading-[.84] tracking-[-.075em]">
                  Tu negocio no cabe en una sola pantalla.
                </h2>
              </div>
              <p className="max-w-md text-lg leading-relaxed text-slate-300">
                Añade páginas, duplica estructuras y publica rutas completas sin salir del editor.
              </p>
            </div>
            <div className="mt-16 grid overflow-hidden rounded-[2rem] border border-purple-500/20 bg-[#0f0b21] text-white shadow-[0_35px_90px_rgba(139,92,246,0.15)] lg:grid-cols-[300px_1fr]">
              <div className="border-b border-white/10 p-5 lg:border-b-0 lg:border-r">
                <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-slate-400">Páginas · 4</p>
                <div className="mt-4 space-y-2">
                  {["Inicio", "Servicios", "Nosotros", "Contacto"].map((page, index) => (
                    <div
                      key={page}
                      className={`flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium transition ${
                        index === 0 ? "bg-[#8b5cf6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]" : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Layers3 size={15} />
                      {page}
                    </div>
                  ))}
                </div>
                <button className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-dashed border-white/15 text-xs text-slate-300 hover:border-purple-400 hover:text-white">
                  + Nueva página
                </button>
              </div>
              <div className="relative min-h-[430px] overflow-hidden p-5 md:p-8">
                <div className="absolute right-[8%] top-[4%] size-60 rounded-full bg-purple-600/30 blur-[80px]" />
                <div className="relative rounded-2xl border border-white/10 bg-[#07050e] p-7 md:p-12">
                  <p className="text-[10px] uppercase tracking-[.22em] text-[#c084fc]">Apex / Global systems</p>
                  <h3 className="mt-20 max-w-3xl text-[clamp(2.8rem,6vw,6rem)] font-semibold leading-[.86] tracking-[-.07em]">
                    Una presencia completa. Un solo sistema.
                  </h3>
                  <div className="mt-14 grid gap-3 sm:grid-cols-3">
                    {["Estrategia", "Experiencia", "Crecimiento"].map((item) => (
                      <div key={item} className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-4 text-xs text-slate-300">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TEMPLATES SECTION */}
        <section className="px-5 py-24 md:px-8 md:py-36">
          <div className="mx-auto max-w-[1440px]">
            <div data-reveal className="flex flex-col justify-between gap-7 md:flex-row md:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#c084fc]">No empiezas desde cero</p>
                <h2 className="mt-5 max-w-4xl text-[clamp(3rem,6vw,6rem)] font-semibold leading-[.88] tracking-[-.065em]">
                  Direcciones creativas, no plantillas genéricas.
                </h2>
              </div>
              <Link
                href="/templates"
                className="inline-flex min-h-12 items-center gap-2 self-start rounded-full border border-white/15 px-6 text-sm font-semibold hover:bg-white hover:text-black md:self-auto transition"
              >
                Explorar las 9 <ArrowRight size={16} />
              </Link>
            </div>
            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {templates.slice(-3).map((template, index) => (
                <Link
                  data-reveal
                  key={template.id}
                  href={`/editor/demo?template=${template.id}`}
                  className="group overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#0d091a] transition hover:border-purple-500/40"
                >
                  <div className="relative aspect-[4/5] overflow-hidden p-6" style={{ background: template.palette[0], color: template.palette[1] }}>
                    <div
                      className="absolute inset-0 opacity-70"
                      style={{ background: `radial-gradient(circle at ${72 - index * 18}% ${18 + index * 22}%,${template.palette[2]},transparent 28%)` }}
                    />
                    <span className="relative text-[9px] uppercase tracking-[.22em]">{template.category} · Multipágina</span>
                    <p className="relative mt-[55%] max-w-[90%] text-[clamp(2.2rem,4vw,4.2rem)] font-semibold leading-[.88] tracking-[-.065em]">
                      {template.schema.pages[0].sections[0].content.title}
                    </p>
                    <span className="absolute bottom-5 right-5 grid size-12 place-items-center rounded-full bg-white text-black transition group-hover:rotate-[-12deg] group-hover:scale-105">
                      <ArrowRight />
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-[#0b0816]">
                    <div>
                      <p className="font-semibold text-white">{template.name}</p>
                      <p className="mt-1 text-xs text-slate-400">3 páginas · Premium</p>
                    </div>
                    <ChevronRight className="text-slate-500" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CONNECTED TOOLS SECTION */}
        <section className="border-y border-white/10 bg-[#080612] px-5 py-24 md:px-8 md:py-36">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-12 lg:grid-cols-[.7fr_1.3fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#c084fc]">Todo conectado</p>
                <h2 className="mt-5 text-4xl font-semibold tracking-[-.055em] md:text-5xl">Menos herramientas. Más avance.</h2>
                <p className="mt-5 max-w-md leading-relaxed text-slate-400">
                  Estructura, contenido, movimiento, responsive, medios y publicación dentro de un flujo continuo.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {productFeatures.slice(0, 6).map(({ icon: Icon, title, text }) => (
                  <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.025] p-6 transition hover:border-purple-500/30 hover:bg-purple-950/15">
                    <Icon size={20} className="text-[#c084fc]" />
                    <h3 className="mt-8 font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section className="px-5 py-24 md:px-8 md:py-36">
          <div className="mx-auto max-w-[1440px]">
            <div data-reveal className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#c084fc]">Empieza pequeño. Crece sin rehacer.</p>
              <h2 className="mx-auto mt-5 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-semibold leading-[.86] tracking-[-.07em]">
                Un plan para cada nivel de ambición.
              </h2>
            </div>
            <div className="mt-14 grid gap-4 lg:grid-cols-3">
              {plans.slice(0, 3).map((plan) => (
                <article
                  key={plan.name}
                  className={`relative rounded-[2rem] border p-7 md:p-8 transition ${
                    plan.featured
                      ? "border-purple-500/50 bg-gradient-to-b from-[#1c1236] to-[#0d071b] text-white shadow-[0_20px_60px_rgba(139,92,246,0.25)]"
                      : "border-white/10 bg-white/[0.025]"
                  }`}
                >
                  {plan.featured && (
                    <span className="absolute right-6 top-6 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-md">
                      Recomendado
                    </span>
                  )}
                  <p className={`text-xs font-semibold uppercase tracking-[.18em] ${plan.featured ? "text-[#c084fc]" : "text-slate-400"}`}>
                    {plan.eyebrow}
                  </p>
                  <h3 className="mt-5 text-2xl font-semibold">{plan.name}</h3>
                  <p className="mt-7 text-5xl font-semibold tracking-[-.06em]">{plan.price}</p>
                  <p className={`mt-1 text-xs ${plan.featured ? "text-slate-300" : "text-slate-400"}`}>{plan.period}</p>
                  <ul className="mt-8 space-y-3">
                    {plan.benefits.slice(0, 5).map((item) => (
                      <li key={item} className={`flex gap-3 text-sm ${plan.featured ? "text-slate-200" : "text-slate-300"}`}>
                        <Check size={16} className={`shrink-0 ${plan.featured ? "text-[#c084fc]" : "text-slate-400"}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/pricing"
                    className={`mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full text-sm font-semibold transition ${
                      plan.featured
                        ? "bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-white shadow-lg hover:brightness-110"
                        : "bg-white text-black hover:bg-slate-200"
                    }`}
                  >
                    Ver plan
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA BANNER */}
        <section className="px-5 pb-20 md:px-8 md:pb-28">
          <div className="mx-auto max-w-[1440px] overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-[#2e1065] via-[#1e1b4b] to-[#0f0728] border border-purple-500/30 px-6 py-16 text-white shadow-[0_0_80px_rgba(139,92,246,0.25)] md:px-14 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[1.3fr_.7fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#c084fc]">Tu siguiente versión empieza aquí</p>
                <h2 className="mt-5 max-w-5xl text-[clamp(3.4rem,8vw,8rem)] font-semibold leading-[.82] tracking-[-.078em]">
                  Haz que se vea tan grande como quieres llegar.
                </h2>
              </div>
              <div>
                <p className="text-lg leading-relaxed text-slate-300">
                  Elige una dirección, cambia el contenido y publica una presencia completa en menos tiempo del que toma explicar el brief.
                </p>
                <Link
                  href="/register"
                  className="mt-8 inline-flex min-h-13 items-center gap-3 rounded-full bg-white px-7 font-semibold text-black transition hover:bg-slate-200"
                >
                  Crear con Vexora
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

function ProductStage() {
  const [activeTab, setActiveTab] = useState("Inicio");

  return (
    <div className="relative mx-auto mt-16 max-w-6xl">
      <div className="absolute -inset-16 -z-10 bg-[radial-gradient(circle,rgba(167,139,250,0.25),transparent_62%)] blur-2xl" />
      <div className="overflow-hidden rounded-[1.7rem] border border-purple-500/30 bg-[#0d091a] shadow-[0_45px_120px_rgba(0,0,0,.7)]">
        <div className="flex h-13 items-center justify-between border-b border-white/10 px-4 bg-[#0a0715]">
          <div className="flex items-center gap-2">
            <i className="size-2 rounded-full bg-[#c084fc] shadow-[0_0_10px_#c084fc]" />
            <span className="text-[10px] font-semibold text-slate-400">VEXORA ENGINE / MULTI-PAGE STUDIO</span>
          </div>
          <span className="rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-3 py-1.5 text-[10px] font-semibold text-white shadow-md">
            Publicar sitio
          </span>
        </div>
        <div className="grid min-h-[500px] grid-cols-[220px_1fr_56px] max-md:grid-cols-[1fr]">
          <aside className="border-r border-white/10 p-4 max-md:hidden bg-[#090614]">
            <p className="text-[9px] uppercase tracking-[.16em] text-slate-400">Páginas · 3</p>
            <div className="mt-3 space-y-1">
              {["Inicio", "Servicios", "Nosotros"].map((item) => (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`flex w-full min-h-10 items-center gap-2 rounded-lg px-3 text-[11px] font-medium transition ${
                    activeTab === item ? "bg-purple-600/30 text-white border border-purple-400/30" : "text-slate-400 hover:text-white"
                  }`}
                >
                  <Layers3 size={13} />
                  {item}
                </button>
              ))}
            </div>
            <p className="mt-6 text-[9px] uppercase tracking-[.16em] text-slate-400">Secciones</p>
            <div className="mt-3 space-y-1">
              {["Hero principal", "Capacidades", "Resultados", "CTA"].map((item) => (
                <div key={item} className="flex min-h-10 items-center gap-2 rounded-lg px-3 text-[11px] text-slate-400">
                  <MousePointer2 size={12} />
                  {item}
                </div>
              ))}
            </div>
          </aside>
          <div className="relative m-3 overflow-hidden rounded-xl bg-[#06040d] p-7 md:m-5 md:p-11 border border-white/5">
            <div className="absolute right-[5%] top-[2%] size-72 rounded-full bg-purple-600/20 blur-[90px]" />
            <p className="relative text-[9px] uppercase tracking-[.25em] text-[#c084fc]">PROYECTO: {activeTab.toUpperCase()}</p>
            <h2 className="relative mt-20 max-w-4xl text-[clamp(2.5rem,6vw,6.5rem)] font-semibold leading-[.84] tracking-[-.075em] text-white">
              {activeTab === "Inicio"
                ? "Intelligence, made operational."
                : activeTab === "Servicios"
                ? "Estrategia, experiencia y crecimiento."
                : "Un equipo obsesionado con el detalle."}
            </h2>
            <div className="relative mt-14 grid gap-3 sm:grid-cols-3">
              {["Observe", "Reason", "Act"].map((item) => (
                <div key={item} className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-xs text-slate-300">
                  {item}
                </div>
              ))}
            </div>
          </div>
          <aside className="border-l border-white/10 p-3 max-md:hidden bg-[#090614]">
            <div className="grid gap-2">
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={`grid aspect-square place-items-center rounded-lg ${
                    index === 0 ? "bg-gradient-to-br from-[#8b5cf6] to-[#c084fc] text-white" : "text-slate-500"
                  }`}
                >
                  <MousePointer2 size={14} />
                </span>
              ))}
            </div>
          </aside>
        </div>
      </div>
      <div className="absolute -bottom-6 left-[8%] rounded-2xl border border-purple-500/30 bg-[#120b29]/95 p-4 shadow-2xl backdrop-blur-xl">
        <p className="flex items-center gap-2 text-[10px] text-slate-300">
          <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          Todos los cambios guardados
        </p>
        <p className="mt-1 text-sm font-semibold text-white">3 páginas listas para publicar</p>
      </div>
    </div>
  );
}

