import Link from "next/link";
import { ArrowRight, Check, Layers3, MousePointer2, WandSparkles } from "lucide-react";
import { MarketingFooter, MarketingNav, PageHero } from "@/components/marketing/marketing-shell";
import { productFeatures } from "@/lib/marketing";

export default function FeaturesPage() {
  return (
    <div className="min-h-dvh bg-[#050508] text-[#f8fafc]">
      <MarketingNav />
      <main>
        <PageHero
          eyebrow="Producto / Sistema visual"
          title="Más poder creativo. Menos decisiones que estorban."
          text="Vexora concentra estructura, diseño, movimiento, responsive y publicación en un flujo que mantiene tu atención en el resultado."
        />

        <section className="border-y border-white/10 bg-[#090710] px-5 py-24 md:px-8">
          <div className="mx-auto grid max-w-[1440px] gap-4 md:grid-cols-2 lg:grid-cols-4">
            {productFeatures.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="min-h-72 rounded-[1.7rem] border border-white/10 bg-white/[0.025] p-6 transition hover:border-purple-500/30 hover:bg-purple-950/15">
                <div className="flex justify-between">
                  <Icon className="text-[#c084fc]" />
                  <span className="text-xs text-slate-500">0{index + 1}</span>
                </div>
                <h2 className="mt-20 text-xl font-semibold tracking-[-.035em] text-white">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="px-5 py-24 md:px-8 md:py-36">
          <div className="mx-auto max-w-[1440px]">
            <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#c084fc]">Un flujo de tres movimientos</p>
                <h2 className="mt-5 text-5xl font-semibold leading-[.9] tracking-[-.06em] md:text-7xl">La complejidad se queda detrás.</h2>
              </div>
              <div className="space-y-4">
                {[
                  [MousePointer2, "Elige una dirección", "Empieza con una plantilla multipágina que ya resuelve jerarquía y narrativa."],
                  [Layers3, "Construye por capas", "Cambia páginas, secciones y contenido con controles que conservan el responsive."],
                  [WandSparkles, "Añade presencia", "Aplica movimiento, conecta medios y publica cuando el sistema esté listo."],
                ].map(([Icon, title, text], index) => (
                  <article key={String(title)} className="grid gap-5 rounded-2xl border border-white/10 p-6 sm:grid-cols-[64px_1fr] sm:items-start bg-white/[0.02] hover:border-purple-500/30">
                    <span className="grid size-14 place-items-center rounded-2xl bg-purple-500/10 text-[#c084fc] border border-purple-500/20">
                      <Icon />
                    </span>
                    <div>
                      <p className="text-[10px] uppercase tracking-[.18em] text-slate-400">Paso 0{index + 1}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{String(title)}</h3>
                      <p className="mt-2 leading-relaxed text-slate-400">{String(text)}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 pb-24 md:px-8 md:pb-36">
          <div className="mx-auto max-w-[1440px] rounded-[2.5rem] bg-gradient-to-r from-[#2e1065] via-[#1e1b4b] to-[#0f0728] border border-purple-500/30 p-8 text-white shadow-[0_0_70px_rgba(139,92,246,0.2)] md:p-14">
            <div className="grid gap-10 lg:grid-cols-[1fr_.7fr] lg:items-end">
              <h2 className="text-[clamp(3rem,7vw,7rem)] font-semibold leading-[.84] tracking-[-.07em]">
                Haz más sin aprender una herramienta imposible.
              </h2>
              <div>
                <ul className="space-y-3 text-sm text-slate-300">
                  {["Sin código generado por cliente", "Deshacer y versiones por 30 días", "Responsive siempre visible", "Publicación separada del borrador"].map((item) => (
                    <li key={item} className="flex gap-3">
                      <Check size={17} className="text-[#c084fc]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-7 font-semibold text-black transition hover:bg-slate-200"
                >
                  Crear gratis
                  <ArrowRight size={17} />
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

