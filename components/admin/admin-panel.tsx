"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Download,
  FolderKanban,
  LoaderCircle,
  RefreshCw,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Brand } from "@/components/brand";

type Overview = {
  configured: boolean;
  metrics: {
    users: number;
    sites: number;
    published: number;
    views: number;
    errors: number;
  };
  daily: Array<{ date: string; views: number }>;
  errors: Array<{
    id: number;
    message: string;
    path: string;
    severity: string;
    created_at: string;
    resolved_at: string | null;
  }>;
};
const empty: Overview = {
  configured: false,
  metrics: { users: 0, sites: 0, published: 0, views: 0, errors: 0 },
  daily: [],
  errors: [],
};

export function AdminPanel() {
  const [data, setData] = useState<Overview>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/overview", {
        cache: "no-store",
      });
      if (!response.ok) throw new Error("No fue posible leer las operaciones.");
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);
  const exportCsv = () => {
    const rows = [
      ["fecha", "vistas"],
      ...data.daily.map((item) => [item.date, String(item.views)]),
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], {
      type: "text/csv",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vexora-analytics-7-dias.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  const metrics = [
    [Users, "Usuarios", data.metrics.users],
    [FolderKanban, "Proyectos", data.metrics.sites],
    [CheckCircle2, "Publicados", data.metrics.published],
    [BarChart3, "Vistas · 7 días", data.metrics.views],
  ] as const;
  const max = Math.max(1, ...data.daily.map((item) => item.views));
  return (
    <main className="min-h-dvh bg-[#09090c] text-[#f7f4ef]">
      <header className="border-b border-white/[.07] bg-[#0d0d12]">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link
            href="/dashboard"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-white/45 hover:text-white"
          >
            <ArrowLeft size={17} />
            Dashboard
          </Link>
          <Brand />
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/[.07] px-3 py-2 text-xs text-emerald-300">
            <ShieldCheck size={14} />
            Acceso protegido
          </span>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-12 md:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm text-violet-300">Operación en tiempo real</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] md:text-5xl">
              Centro de control
            </h1>
            <p className="mt-3 text-white/42">
              Analíticas consentidas, salud del producto y errores capturados.
            </p>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-xs font-semibold hover:bg-white/5 disabled:opacity-50"
          >
            {loading ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <RefreshCw size={15} />
            )}
            Actualizar
          </button>
        </div>
        {!data.configured && !loading && (
          <div className="mt-8 rounded-2xl border border-amber-400/20 bg-amber-400/[.06] p-5">
            <p className="font-semibold text-amber-200">
              Conecta la base operativa
            </p>
            <p className="mt-2 text-sm leading-relaxed text-amber-100/60">
              El panel ya está listo para datos reales. Falta configurar
              Supabase y la clave privada de servidor en producción; no se
              muestran números inventados.
            </p>
          </div>
        )}
        {error && (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-rose-400/20 bg-rose-400/[.06] p-5 text-sm text-rose-200"
          >
            {error}
          </div>
        )}
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([Icon, label, value]) => (
            <article
              key={label}
              className="rounded-2xl border border-white/[.07] bg-white/[.025] p-5"
            >
              <Icon size={18} className="text-violet-300" />
              <p className="mt-8 text-sm text-white/40">{label}</p>
              <span className="mt-2 block text-3xl font-semibold tabular-nums">
                {new Intl.NumberFormat("es-MX").format(value)}
              </span>
            </article>
          ))}
        </section>
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-2xl border border-white/[.07] bg-[#101016] p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Tráfico reciente</h2>
                <p className="mt-1 text-xs text-white/35">
                  Páginas vistas con consentimiento · últimos 7 días
                </p>
              </div>
              <button
                onClick={exportCsv}
                disabled={!data.daily.length}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/5 px-3 text-xs disabled:opacity-30"
              >
                <Download size={14} />
                CSV
              </button>
            </div>
            <div
              className="mt-8 flex h-56 items-end gap-3"
              role="img"
              aria-label={`Gráfica de vistas: ${data.daily.map((d) => `${d.date}, ${d.views}`).join("; ")}`}
            >
              {data.daily.length ? (
                data.daily.map((item) => (
                  <div
                    key={item.date}
                    className="flex h-full flex-1 flex-col justify-end gap-2"
                  >
                    <span className="text-center text-xs tabular-nums text-white/45">
                      {item.views}
                    </span>
                    <div
                      className="min-h-1 rounded-t-lg bg-gradient-to-t from-violet-600 to-cyan-300"
                      style={{
                        height: `${Math.max(3, (item.views / max) * 100)}%`,
                      }}
                    />
                    <span className="text-center text-[10px] text-white/30">
                      {new Date(`${item.date}T12:00:00`).toLocaleDateString(
                        "es-MX",
                        { weekday: "short" },
                      )}
                    </span>
                  </div>
                ))
              ) : (
                <div className="grid size-full place-items-center text-sm text-white/30">
                  Sin eventos todavía
                </div>
              )}
            </div>
          </section>
          <section className="rounded-2xl border border-white/[.07] bg-[#101016] p-5">
            <div className="flex items-center gap-3">
              <Activity className="text-fuchsia-300" />
              <div>
                <h2 className="font-semibold">Monitoreo de errores</h2>
                <p className="mt-1 text-xs text-white/35">
                  {data.metrics.errors} sin resolver
                </p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {data.errors.length ? (
                data.errors.map((item) => (
                  <article
                    key={item.id}
                    className="rounded-xl border border-white/[.07] p-3"
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle
                        size={14}
                        className={
                          item.severity === "fatal"
                            ? "mt-0.5 text-rose-300"
                            : "mt-0.5 text-amber-300"
                        }
                      />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold">
                          {item.message}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-white/30">
                          {item.path} ·{" "}
                          {new Date(item.created_at).toLocaleString("es-MX")}
                        </p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/30">
                  Sin errores registrados
                </div>
              )}
            </div>
          </section>
        </div>
        <section className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[.04] p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-300" />
            <div>
              <h2 className="font-semibold">Controles operativos</h2>
              <p className="mt-1 text-sm text-white/45">
                RLS para datos, consentimiento analítico, reportes de errores
                con huella, backups por proyecto y acceso administrativo por
                lista segura.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
