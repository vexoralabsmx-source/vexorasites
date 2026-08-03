import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Brand } from "@/components/brand";

export function MarketingNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[.07] bg-[#08090d]/80 backdrop-blur-xl">
      <nav
        className="mx-auto flex h-18 max-w-[1440px] items-center justify-between px-5 md:px-8"
        aria-label="Navegación principal"
      >
        <Link href="/" aria-label="Vexora Sites, inicio">
          <Brand />
        </Link>
        <div className="hidden items-center gap-1 rounded-full border border-white/[.07] bg-white/[.025] p-1 text-sm lg:flex">
          <Link
            href="/features"
            className="rounded-full px-4 py-2 text-white/58 transition hover:bg-white/[.06] hover:text-white"
          >
            Producto
          </Link>
          <Link
            href="/templates"
            className="rounded-full px-4 py-2 text-white/58 transition hover:bg-white/[.06] hover:text-white"
          >
            Plantillas
          </Link>
          <Link
            href="/showcase"
            className="rounded-full px-4 py-2 text-white/58 transition hover:bg-white/[.06] hover:text-white"
          >
            Inspiración
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-4 py-2 text-white/58 transition hover:bg-white/[.06] hover:text-white"
          >
            Planes
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden min-h-11 items-center px-4 text-sm font-medium text-white/65 hover:text-white sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#dfff65] px-4 text-sm font-semibold text-[#111407] transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfff65]"
          >
            Crear gratis
            <ArrowRight size={16} />
          </Link>
        </div>
      </nav>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/[.08] bg-[#08090d] px-5 py-12 md:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.2fr_repeat(3,.6fr)]">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/42">
            El estudio visual para crear sitios que combinan claridad,
            personalidad y movimiento.
          </p>
        </div>
        <FooterColumn
          title="Producto"
          links={[
            ["Funciones", "/features"],
            ["Plantillas", "/templates"],
            ["Planes", "/pricing"],
          ]}
        />
        <FooterColumn
          title="Explorar"
          links={[
            ["Inspiración", "/showcase"],
            ["Dashboard", "/dashboard"],
            ["Fotos y medios", "/account/media"],
          ]}
        />
        <FooterColumn
          title="Legal"
          links={[
            ["Términos", "/terms"],
            ["Privacidad", "/privacy"],
            ["Cookies", "/cookies"],
          ]}
        />
      </div>
      <div className="mx-auto mt-12 flex max-w-[1440px] flex-col gap-3 border-t border-white/[.07] pt-6 text-xs text-white/28 sm:flex-row sm:justify-between">
        <span>© 2026 Vexora Sites</span>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-[#dfff65]"
        >
          Comenzar ahora
          <ExternalLink size={13} />
        </Link>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string]>;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[.16em] text-white/35">
        {title}
      </p>
      <div className="mt-4 space-y-3">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="block text-sm text-white/55 hover:text-white"
          >
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  text,
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-36 md:px-8 md:pb-28 md:pt-44">
      <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(circle_at_75%_18%,rgba(162,122,255,.18),transparent_28%),radial-gradient(circle_at_18%_72%,rgba(223,255,101,.08),transparent_25%)]" />
      <div className="relative mx-auto max-w-[1440px]">
        <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#dfff65]">
          {eyebrow}
        </p>
        <h1 className="mt-7 max-w-6xl text-balance text-[clamp(3.5rem,8vw,8.5rem)] font-semibold leading-[.84] tracking-[-.075em]">
          {title}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/55 md:text-xl">
          {text}
        </p>
      </div>
    </section>
  );
}
