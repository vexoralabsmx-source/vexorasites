import {
  MarketingFooter,
  MarketingNav,
} from "@/components/marketing/marketing-shell";

export function LegalPage({
  eyebrow,
  title,
  updated,
  sections,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  sections: Array<{ title: string; body: string }>;
}) {
  return (
    <main className="min-h-dvh bg-[#050508] text-[#f8fafc]">
      <MarketingNav />
      <article className="mx-auto max-w-4xl px-5 pb-24 pt-36 md:px-8 md:pt-44">
        <p className="text-xs font-semibold uppercase tracking-[.2em] text-[#c084fc]">
          {eyebrow}
        </p>
        <h1 className="mt-6 text-5xl font-semibold tracking-[-.06em] text-white md:text-7xl">
          {title}
        </h1>
        <p className="mt-5 text-sm text-slate-400">
          Última actualización: {updated}
        </p>
        <div className="mt-14 space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold tracking-[-.035em] text-white">
                {section.title}
              </h2>
              <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-8 text-slate-300">
                {section.body}
              </p>
            </section>
          ))}
        </div>
        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[.03] p-6 text-sm text-slate-400">
          Estos textos ofrecen una base clara para la beta. Antes de una
          operación comercial internacional, deben revisarse con asesoría legal
          según los países donde opere Vexora Sites.
        </div>
      </article>
      <MarketingFooter />
    </main>
  );
}
