import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { MarketingFooter, MarketingNav, PageHero } from "@/components/marketing/marketing-shell";
import { templates } from "@/lib/templates";

export default function ShowcasePage() {
  return (
    <div className="min-h-dvh bg-[#050508] text-[#f8fafc]">
      <MarketingNav />
      <main>
        <PageHero
          eyebrow="Inspiración / Sistemas vivos"
          title="Nueve puntos de partida. Ningún resultado obligatorio."
          text="Explora cómo cambia Vexora cuando la narrativa, el ritmo y la dirección visual responden a industrias diferentes."
        />
        <section className="px-5 pb-24 md:px-8 md:pb-36">
          <div className="mx-auto grid max-w-[1440px] gap-6 md:grid-cols-2">
            {templates.map((template, index) => (
              <article
                key={template.id}
                className={`group overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c0818] transition hover:border-purple-500/40 ${
                  index % 3 === 0 ? "md:col-span-2" : ""
                }`}
              >
                <Link
                  href={`/editor/demo?template=${template.id}`}
                  className={`relative block overflow-hidden p-7 md:p-10 ${index % 3 === 0 ? "aspect-[16/7]" : "aspect-[4/3]"}`}
                  style={{ background: template.palette[0], color: template.palette[1] }}
                >
                  <div
                    className="absolute inset-0 opacity-70"
                    style={{
                      background: `radial-gradient(circle at ${20 + (index * 13) % 70}% ${18 + (index * 17) % 65}%,${template.palette[2]},transparent 27%)`,
                    }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-[.22em] font-medium">
                      {template.category} / {template.premium ? "Signature" : "Essential"}
                    </span>
                    <span className="inline-flex items-center gap-2 text-[9px] uppercase tracking-[.16em]">
                      <Layers3 size={13} />
                      {template.schema.pages.length} páginas
                    </span>
                  </div>
                  <h2
                    className={`relative max-w-5xl font-semibold leading-[.86] tracking-[-.07em] ${
                      index % 3 === 0 ? "mt-[9%] text-[clamp(3rem,7vw,7rem)]" : "mt-[20%] text-[clamp(2.5rem,5vw,5rem)]"
                    }`}
                  >
                    {template.schema.pages[0].sections[0].content.title}
                  </h2>
                  <span className="absolute bottom-7 right-7 grid size-12 place-items-center rounded-full bg-white text-black transition group-hover:rotate-[-12deg] group-hover:scale-105 shadow-lg">
                    <ArrowRight />
                  </span>
                </Link>
                <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center bg-[#090614]">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{template.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">{template.description}</p>
                  </div>
                  <Link
                    href={`/dashboard/new?template=${template.id}`}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white transition hover:bg-gradient-to-r hover:from-[#8b5cf6] hover:to-[#c084fc] hover:border-transparent"
                  >
                    Usar plantilla
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

