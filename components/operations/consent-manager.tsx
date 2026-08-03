"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";

export const CONSENT_KEY = "vexora-cookie-consent";
export function ConsentManager() {
  const [choice, setChoice] = useState<string | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(
      () => setChoice(localStorage.getItem(CONSENT_KEY)),
      0,
    );
    return () => window.clearTimeout(timer);
  }, []);
  const choose = (value: "all" | "essential") => {
    localStorage.setItem(CONSENT_KEY, value);
    setChoice(value);
    window.dispatchEvent(new CustomEvent("vexora-consent", { detail: value }));
  };
  useEffect(() => {
    const report = (event: ErrorEvent) => {
      void fetch("/api/monitoring/errors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          message: event.message || "Error de JavaScript",
          source: event.filename,
          path: location.pathname,
          severity: "error",
          metadata: { line: event.lineno, column: event.colno },
        }),
        keepalive: true,
      });
    };
    window.addEventListener("error", report);
    return () => window.removeEventListener("error", report);
  }, []);
  if (choice) return null;
  return (
    <aside
      className="fixed bottom-4 left-4 right-4 z-[200] mx-auto max-w-3xl rounded-2xl border border-white/15 bg-[#111117]/95 p-4 text-white shadow-2xl backdrop-blur-xl md:flex md:items-center md:gap-5"
      aria-label="Preferencias de cookies"
    >
      <Cookie className="hidden shrink-0 text-violet-300 md:block" />
      <div className="flex-1">
        <p className="text-sm font-semibold">Tu privacidad, primero</p>
        <p className="mt-1 text-xs leading-relaxed text-white/55">
          Usamos almacenamiento esencial para guardar preferencias. Las
          analíticas anónimas solo se activan si aceptas.{" "}
          <Link href="/cookies" className="underline hover:text-white">
            Ver política
          </Link>
          .
        </p>
      </div>
      <div className="mt-4 flex gap-2 md:mt-0">
        <button
          onClick={() => choose("essential")}
          className="min-h-11 flex-1 rounded-xl border border-white/10 px-3 text-xs font-semibold hover:bg-white/5"
        >
          Solo esenciales
        </button>
        <button
          onClick={() => choose("all")}
          className="min-h-11 flex-1 rounded-xl bg-violet-500 px-3 text-xs font-semibold hover:bg-violet-400"
        >
          Aceptar
        </button>
      </div>
      <button
        onClick={() => choose("essential")}
        className="absolute right-1 top-1 grid size-11 place-items-center rounded-lg text-white/30 hover:text-white md:hidden"
        aria-label="Cerrar y usar solo cookies esenciales"
      >
        <X size={15} />
      </button>
    </aside>
  );
}
