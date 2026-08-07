"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Check, Crown, Layers3, Search, Sparkles } from "lucide-react";
import { MarketingFooter, MarketingNav } from "@/components/marketing/marketing-shell";
import { templates } from "@/lib/templates";

export function TemplateLibrary() {
  const [filter, setFilter] = useState("Todas");
  const [query, setQuery] = useState("");
  const categories = ["Todas", ...Array.from(new Set(templates.map((template) => template.category)))];
  const shown = useMemo(
    () =>
      templates.filter(
        (template) =>
          (filter === "Todas" || template.category === filter) &&
          `${template.name} ${template.category} ${template.description}`.toLowerCase().includes(query.toLowerCase())
      ),
    [filter, query]
  );

  return (
    <div className="min-h-dvh bg-[#050508] text-[#f8fafc]">
      <MarketingNav />
      <main>
        <section className="relative overflow-hidden px-5 pb-16 pt-36 md:px-8 md:pb-24 md:pt-44">
          <div className="absolute inset-0 [background:radial-gradient(circle_at_70%_22%,rgba(167,139,250,0.22),transparent_35%),radial-gradient(circle_at_20%_75%,rgba(139,92,246,0.14),transparent_30%)]" />
          <div className="relative mx-auto max-w-[1440px]">
            <div className="grid gap-10 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#c084fc]">Vexora Signature Library</p>
                <h1 className="mt-6 max-w-6xl text-[clamp(3.8rem,8vw,8.5rem)] font-semibold leading-[.82] tracking-[-.078em]">
                  Empieza donde otros diseñadores terminan.
                </h1>
              </div>
              <div className="pb-3">
                <p className="max-w-xl text-lg leading-relaxed text-slate-300">
                  Nueve sistemas multipágina con identidad, narrativa, composición y movimiento propios. Cada decisión sigue siendo editable.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-slate-400">
                  <span className="rounded-full border border-white/10 px-3.5 py-2 bg-white/[0.02]">3 páginas incluidas</span>
                  <span className="rounded-full border border-white/10 px-3.5 py-2 bg-white/[0.02]">Responsive siempre</span>
                  <span className="rounded-full border border-white/10 px-3.5 py-2 bg-white/[0.02]">Motion presets integrados</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-20 z-30 border-y border-white/10 bg-[#050508]/92 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setFilter(category)}
                  className={`min-h-10 shrink-0 rounded-full px-5 text-sm transition ${
                    filter === category
                      ? "bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
                      : "border border-white/10 text-slate-400 hover:text-white hover:border-white/20"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <label className="relative block lg:w-72">
              <span className="sr-only">Buscar plantillas</span>
              <Search size={16} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Busca industria o estilo"
                className="min-h-10 w-full rounded-full border border-white/10 bg-white/[0.04] pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#c084fc] focus:ring-2 focus:ring-[#c084fc]/20"
              />
            </label>
          </div>
        </section>

        <section className="px-5 py-10 md:px-8 md:py-14">
          <div className="mx-auto max-w-[1440px]">
            {/* BLANK CANVAS FEATURED BANNER */}
            <div className="mb-10 rounded-[2.2rem] border border-purple-500/30 bg-[radial-gradient(circle_at_15%_20%,rgba(167,139,250,0.2),transparent_40%),#0c0818] p-7 md:p-9 text-white shadow-[0_0_60px_rgba(139,92,246,0.15)] flex flex-col justify-between md:flex-row md:items-center gap-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c084fc]">
                  <Sparkles size={12} /> Lienzo en Blanco
                </span>
                <h2 className="mt-3 text-2xl font-bold md:text-3xl text-white">¿Prefieres empezar sin plantilla?</h2>
                <p className="mt-2 max-w-xl text-sm text-slate-300">
                  Crea tu proyecto desde un lienzo en blanco totalmente limpio para añadir tus propios bloques, secciones e identidad de marca.
                </p>
              </div>
              <Link
                href="/dashboard/new?template=blank-canvas"
                className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-7 font-semibold text-white shadow-lg hover:brightness-110 transition"
              >
                Crear desde cero
                <ArrowRight size={16} />
              </Link>
            </div>
            {shown.length === 0 ? (
              <div className="rounded-[2rem] border border-dashed border-white/15 py-20 text-center bg-white/[0.01]">
                <Search className="mx-auto text-slate-500" size={32} />
                <h2 className="mt-4 text-xl font-semibold text-white">No encontramos esa dirección.</h2>
                <button
                  onClick={() => {
                    setQuery("");
                    setFilter("Todas");
                  }}
                  className="mt-4 text-sm font-semibold text-[#c084fc] hover:underline"
                >
                  Ver todas las plantillas
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {shown.map((template, index) => (
                  <article
                    key={template.id}
                    className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0a0715] transition duration-300 hover:-translate-y-1 hover:border-purple-500/40 shadow-lg"
                  >
                    <Link
                      href={`/editor/demo?template=${template.id}`}
                      className="relative block aspect-[4/3] overflow-hidden p-6"
                      style={{ background: template.palette[0], color: template.palette[1] }}
                    >
                      <div
                        className="absolute inset-0 opacity-70"
                        style={{
                          background: `radial-gradient(circle at ${22 + (index * 19) % 65}% ${18 + (index * 23) % 60}%,${template.palette[2]},transparent 28%)`,
                        }}
                      />
                      <div className="relative flex justify-between">
                        <span className="text-[9px] uppercase tracking-[.22em] font-semibold">{template.category}</span>
                        {template.premium ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-current/20 px-2.5 py-1 text-[8px] font-semibold">
                            <Crown size={10} /> SIGNATURE
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[8px] font-semibold">
                            <Sparkles size={10} /> ESSENTIAL
                          </span>
                        )}
                      </div>
                      <p className="relative mt-[22%] max-w-[92%] text-[clamp(2.1rem,3.8vw,4rem)] font-semibold leading-[.87] tracking-[-.065em]">
                        {template.schema.pages[0].sections[0].content.title}
                      </p>
                      <span className="absolute bottom-5 right-5 grid size-11 place-items-center rounded-full bg-white text-black opacity-0 transition group-hover:rotate-[-10deg] group-hover:opacity-100 shadow-md">
                        <ArrowRight />
                      </span>
                    </Link>
                    <div className="p-6 bg-[#080512]">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-semibold text-white">{template.name}</h2>
                          <p className="mt-2 text-sm leading-relaxed text-slate-400">{template.description}</p>
                        </div>
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-purple-500/30 bg-purple-500/10 text-[#c084fc]">
                          <Check size={14} />
                        </span>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {template.schema.pages.map((page) => (
                          <span key={page.id} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.04] px-3 py-1.5 text-[10px] text-slate-300">
                            <Layers3 size={10} className="text-[#a78bfa]" />
                            {page.name}
                          </span>
                        ))}
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <Link
                          href={`/editor/demo?template=${template.id}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 text-xs font-semibold text-white hover:bg-white/10 transition"
                        >
                          Vista editable
                        </Link>
                        <Link
                          href={`/dashboard/new?template=${template.id}`}
                          className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-xs font-semibold text-white shadow-md hover:brightness-110 transition"
                        >
                          Usar plantilla
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

