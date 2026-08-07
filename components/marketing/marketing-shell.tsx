"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, ExternalLink, Menu, X } from "lucide-react";
import { Brand } from "@/components/brand";

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#050508]/85 backdrop-blur-xl transition-all">
      <nav
        className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-5 md:px-8"
        aria-label="Navegación principal"
      >
        <Link href="/" aria-label="Vexora Sites, inicio">
          <Brand />
        </Link>
        <div className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1.5 text-sm lg:flex backdrop-blur-md">
          <Link
            href="/features"
            className="rounded-full px-5 py-2 text-slate-300 transition hover:bg-purple-500/10 hover:text-white"
          >
            Producto
          </Link>
          <Link
            href="/templates"
            className="rounded-full px-5 py-2 text-slate-300 transition hover:bg-purple-500/10 hover:text-white"
          >
            Plantillas
          </Link>
          <Link
            href="/showcase"
            className="rounded-full px-5 py-2 text-slate-300 transition hover:bg-purple-500/10 hover:text-white"
          >
            Inspiración
          </Link>
          <Link
            href="/pricing"
            className="rounded-full px-5 py-2 text-slate-300 transition hover:bg-purple-500/10 hover:text-white"
          >
            Planes
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden min-h-11 items-center px-4 text-sm font-medium text-slate-300 transition hover:text-white sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#c084fc] px-5 text-sm font-semibold text-white transition hover:brightness-110 shadow-[0_0_25px_rgba(139,92,246,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c084fc]"
          >
            Crear gratis
            <ArrowRight size={16} />
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden hover:bg-white/10"
            aria-label="Abrir menú de navegación"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="border-b border-white/10 bg-[#08080f]/95 px-6 py-6 backdrop-blur-2xl lg:hidden">
          <div className="flex flex-col space-y-4">
            <Link
              href="/features"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-200 hover:text-[#c084fc]"
            >
              Producto
            </Link>
            <Link
              href="/templates"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-200 hover:text-[#c084fc]"
            >
              Plantillas
            </Link>
            <Link
              href="/showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-200 hover:text-[#c084fc]"
            >
              Inspiración
            </Link>
            <Link
              href="/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg font-medium text-slate-200 hover:text-[#c084fc]"
            >
              Planes
            </Link>
            <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-white/15 text-sm font-semibold text-white"
              >
                Entrar a mi cuenta
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-sm font-semibold text-white shadow-lg"
              >
                Crear sitio gratis
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#050508] px-5 py-16 md:px-8">
      <div className="mx-auto grid max-w-[1440px] gap-12 md:grid-cols-[1.2fr_repeat(3,.6fr)]">
        <div>
          <Brand />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
            El estudio visual para crear sitios que combinan claridad,
            personalidad, movimiento y estética premium en morado, negro y blanco.
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
      <div className="mx-auto mt-16 flex max-w-[1440px] flex-col gap-4 border-t border-white/10 pt-8 text-xs text-slate-500 sm:flex-row sm:justify-between">
        <span>© 2026 Vexora Sites · Todos los derechos reservados.</span>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 text-[#c084fc] hover:text-[#a78bfa] transition"
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
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a78bfa]">
        {title}
      </p>
      <div className="mt-5 space-y-3">
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="block text-sm text-slate-400 transition hover:text-white"
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
      <div className="pointer-events-none absolute inset-0 opacity-80 [background:radial-gradient(circle_at_75%_18%,rgba(167,139,250,0.22),transparent_35%),radial-gradient(circle_at_18%_72%,rgba(139,92,246,0.15),transparent_30%)]" />
      <div className="relative mx-auto max-w-[1440px]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#c084fc]">
          {eyebrow}
        </p>
        <h1 className="mt-7 max-w-6xl text-balance text-[clamp(3.5rem,8vw,8.5rem)] font-semibold leading-[0.84] tracking-[-0.075em] text-white">
          {title}
        </h1>
        <p className="mt-8 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
          {text}
        </p>
      </div>
    </section>
  );
}

