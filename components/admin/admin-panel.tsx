"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Check,
  CheckCircle2,
  Copy,
  Download,
  FolderKanban,
  KeyRound,
  LoaderCircle,
  Lock,
  Plus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Brand } from "@/components/brand";
import {
  getStoredKeys,
  saveStoredKeys,
  type LicenseKey,
} from "@/lib/licenses";

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

const REQUIRED_ADMIN_EMAIL = "vexoralabsmx@gmail.com";

export function AdminPanel() {
  const [data, setData] = useState<Overview>(empty);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginInput, setLoginInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [registeredPassword, setRegisteredPassword] = useState<string | null>(null);

  // License & Coupon State
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"free_pass" | "coupon">("free_pass");
  const [newDiscount, setNewDiscount] = useState(100);
  const [newPlan, setNewPlan] = useState<"studio" | "scale" | "enterprise">("studio");
  const [newDesc, setNewDesc] = useState("");

  // Change Password state
  const [changePassOpen, setChangePassOpen] = useState(false);
  const [newPassInput, setNewPassInput] = useState("");

  useEffect(() => {
    // Check local session
    const storedAuth = localStorage.getItem("vexora-admin-authed");
    const savedPass = localStorage.getItem("vexora-admin-password");
    setRegisteredPassword(savedPass);
    if (storedAuth === REQUIRED_ADMIN_EMAIL) {
      setIsAuthenticated(true);
      setAdminEmail(REQUIRED_ADMIN_EMAIL);
    }
    setKeys(getStoredKeys());
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginInput.trim().toLowerCase() !== REQUIRED_ADMIN_EMAIL.toLowerCase()) {
      toast.error("Acceso Denegado", {
        description: `Únicamente la cuenta ${REQUIRED_ADMIN_EMAIL} tiene privilegios de administración.`,
      });
      return;
    }

    if (!registeredPassword) {
      // First time password registration!
      if (!passwordInput || passwordInput.length < 4) {
        toast.error("Elige una contraseña de al menos 4 caracteres.");
        return;
      }
      localStorage.setItem("vexora-admin-password", passwordInput);
      setRegisteredPassword(passwordInput);
      setIsAuthenticated(true);
      setAdminEmail(REQUIRED_ADMIN_EMAIL);
      localStorage.setItem("vexora-admin-authed", REQUIRED_ADMIN_EMAIL);
      toast.success("¡Contraseña de Administrador registrada y acceso concedido!");
      return;
    }

    if (passwordInput !== registeredPassword) {
      toast.error("Contraseña Incorrecta", {
        description: "Ingresa la contraseña que definiste al registrarte.",
      });
      return;
    }

    setIsAuthenticated(true);
    setAdminEmail(REQUIRED_ADMIN_EMAIL);
    localStorage.setItem("vexora-admin-authed", REQUIRED_ADMIN_EMAIL);
    toast.success("Acceso concedido al Centro de Control Vexora");
  };

  const handleAdminLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("vexora-admin-authed");
    toast.info("Sesión cerrada correctamente");
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/overview", { cache: "no-store" });
      if (!response.ok) throw new Error("No fue posible leer las operaciones.");
      setData(await response.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = window.setTimeout(() => void load(), 0);
      return () => window.clearTimeout(timer);
    }
  }, [load, isAuthenticated]);

  const handleCreateKey = () => {
    const code = (newCode.trim() || `VEXORA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`).toUpperCase();
    const newKeyItem: LicenseKey = {
      code,
      plan: newPlan,
      type: newType,
      discountPercent: newDiscount,
      description: newDesc || (newType === "free_pass" ? "Pase de Acceso Gratuito VIP" : `Cupón ${newDiscount}% OFF`),
      createdAt: new Date().toISOString(),
      usesCount: 0,
      maxUses: 100,
      active: true,
    };
    const updated = [newKeyItem, ...keys];
    setKeys(updated);
    saveStoredKeys(updated);
    setNewCode("");
    setNewDesc("");
    toast.success(`Llave/Cupón ${code} creado exitosamente`);
  };

  const handleDeleteKey = (code: string) => {
    const updated = keys.filter((k) => k.code !== code);
    setKeys(updated);
    saveStoredKeys(updated);
    toast.success(`Llave ${code} eliminada`);
  };

  const handleToggleKeyActive = (code: string) => {
    const updated = keys.map((k) => (k.code === code ? { ...k, active: !k.active } : k));
    setKeys(updated);
    saveStoredKeys(updated);
    toast.success("Estado actualizado");
  };

  const copyCode = (code: string) => {
    void navigator.clipboard.writeText(code);
    toast.success(`Código ${code} copiado al portapapeles`);
  };

  const exportCsv = () => {
    const rows = [
      ["fecha", "vistas"],
      ...data.daily.map((item) => [item.date, String(item.views)]),
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "vexora-analytics-7-dias.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ADMIN LOGIN GATE SCREEN
  if (!isAuthenticated) {
    return (
      <main className="min-h-dvh bg-[#050508] text-[#f8fafc] flex items-center justify-center p-5">
        <div className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-purple-500/30 bg-[#0c0818] p-8 md:p-10 text-center shadow-[0_0_90px_rgba(139,92,246,0.3)]">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#c084fc] text-white shadow-xl">
            <Lock size={26} />
          </div>
          <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#c084fc]">
            <ShieldCheck size={12} /> PANEL DE ADMINISTRACIÓN RESTRINGIDO
          </span>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Acceso Administrador</h1>
          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            Este módulo requiere autorización de la cuenta oficial <strong className="text-white font-mono">{REQUIRED_ADMIN_EMAIL}</strong>.
          </p>

          <form onSubmit={handleAdminLogin} className="mt-6 space-y-4 text-left">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-300">Correo de Administrador</span>
              <input
                type="email"
                required
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="vexoralabsmx@gmail.com"
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white font-mono outline-none focus:border-[#c084fc] focus:ring-2 focus:ring-[#c084fc]/20"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold text-slate-300">
                {registeredPassword ? "Contraseña de Administrador" : "Crea tu Contraseña de Administrador"}
              </span>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={registeredPassword ? "••••••••" : "Define una contraseña segura"}
                className="min-h-12 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm text-white font-mono outline-none focus:border-[#c084fc] focus:ring-2 focus:ring-[#c084fc]/20"
              />
            </label>

            <button
              type="submit"
              className="min-h-12 w-full rounded-full bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#c084fc] font-semibold text-xs text-white shadow-lg transition hover:brightness-110"
            >
              {registeredPassword ? "Autenticar e Ingresar al Centro de Control" : "Registrar Contraseña e Ingresar"}
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4">
            <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1">
              <ArrowLeft size={14} /> Volver al Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const metrics = [
    [Users, "Usuarios", data.metrics.users],
    [FolderKanban, "Proyectos", data.metrics.sites],
    [CheckCircle2, "Publicados", data.metrics.published],
    [BarChart3, "Vistas · 7 días", data.metrics.views],
  ] as const;
  const max = Math.max(1, ...data.daily.map((item) => item.views));

  return (
    <main className="min-h-dvh bg-[#050508] text-[#f8fafc]">
      <header className="border-b border-white/10 bg-[#090614]">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 text-sm text-slate-400 hover:text-white">
            <ArrowLeft size={17} /> Dashboard
          </Link>
          <Brand />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3.5 py-1.5 text-xs text-[#c084fc] font-mono">
              <ShieldCheck size={14} /> {adminEmail}
            </span>
            <button onClick={handleAdminLogout} className="text-xs text-slate-400 hover:text-white">
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 md:px-8">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-0.5 text-[10px] font-bold text-[#c084fc]">
              <Sparkles size={12} /> CENTRO DE CONTROL EXCLUSIVO
            </span>
            <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-5xl text-white">
              Gestor de Llaves, Cupones & Operación
            </h1>
            <p className="mt-2 text-sm text-slate-300">
              Genera llaves de membresía gratuita, cupones de 1 mes gratis o descuentos para Clip.
            </p>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-xs font-semibold hover:bg-white/10 transition disabled:opacity-50"
          >
            {loading ? <LoaderCircle size={15} className="animate-spin text-[#c084fc]" /> : <RefreshCw size={15} />}
            Actualizar datos
          </button>
        </div>

        {/* LICENSE KEY & COUPON GENERATOR MODULE */}
        <section className="mt-10 rounded-[2rem] border border-purple-500/30 bg-[radial-gradient(circle_at_15%_20%,rgba(167,139,250,0.15),transparent_40%),#0c0818] p-7 md:p-9 shadow-[0_0_60px_rgba(139,92,246,0.15)]">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-2xl bg-gradient-to-tr from-[#8b5cf6] to-[#c084fc] text-white shadow-lg">
              <KeyRound size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Generador de Llaves VIP & Cupones de Descuento</h2>
              <p className="text-xs text-slate-300">Crea códigos para regalar membresías gratis o aplicar descuentos en la pasarela Clip.</p>
            </div>
          </div>

          {/* CREATE KEY FORM */}
          <div className="mt-6 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:grid-cols-5 items-end">
            <label className="block md:col-span-1">
              <span className="mb-1.5 block text-xs font-semibold text-slate-300">Tipo</span>
              <select
                value={newType}
                onChange={(e) => {
                  const val = e.target.value as "free_pass" | "coupon";
                  setNewType(val);
                  if (val === "free_pass") setNewDiscount(100);
                }}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-[#090614] px-3 text-xs text-white outline-none focus:border-[#c084fc]"
              >
                <option value="free_pass">🔑 Llave Plan Gratis (100% OFF)</option>
                <option value="coupon">🎟️ Cupón de Descuento / Promo</option>
              </select>
            </label>

            <label className="block md:col-span-1">
              <span className="mb-1.5 block text-xs font-semibold text-slate-300">Descuento (%)</span>
              <select
                value={newDiscount}
                onChange={(e) => setNewDiscount(Number(e.target.value))}
                className="min-h-11 w-full rounded-xl border border-white/10 bg-[#090614] px-3 text-xs text-white outline-none focus:border-[#c084fc]"
              >
                <option value={100}>100% OFF (1 Mes / Gratis de por Vida)</option>
                <option value={50}>50% OFF</option>
                <option value={30}>30% OFF</option>
                <option value={20}>20% OFF</option>
              </select>
            </label>

            <label className="block md:col-span-1">
              <span className="mb-1.5 block text-xs font-semibold text-slate-300">Código Personalizado</span>
              <input
                type="text"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="ej. VEXORAGRATIS"
                className="min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 font-mono text-xs text-white outline-none focus:border-[#c084fc]"
              />
            </label>

            <label className="block md:col-span-1">
              <span className="mb-1.5 block text-xs font-semibold text-slate-300">Descripción</span>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="ej. Regalo para cliente especial"
                className="min-h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs text-white outline-none focus:border-[#c084fc]"
              />
            </label>

            <button
              onClick={handleCreateKey}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-5 text-xs font-semibold text-white shadow-md hover:brightness-110 transition"
            >
              <Plus size={16} /> Crear Llave
            </button>
          </div>

          {/* ACTIVE KEYS TABLE */}
          <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#080512]">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 bg-white/[0.03] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">Código</th>
                  <th className="px-4 py-3 font-semibold">Tipo</th>
                  <th className="px-4 py-3 font-semibold">Descuento</th>
                  <th className="px-4 py-3 font-semibold">Descripción</th>
                  <th className="px-4 py-3 font-semibold">Canjes</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-slate-200">
                {keys.map((k) => (
                  <tr key={k.code} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-bold text-[#c084fc]">
                      <button onClick={() => copyCode(k.code)} className="inline-flex items-center gap-1.5 hover:underline">
                        {k.code} <Copy size={13} className="text-slate-400" />
                      </button>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      {k.type === "free_pass" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                          <KeyRound size={12} /> Llave Gratis
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-purple-300 font-semibold">
                          <Ticket size={12} /> Cupón Promo
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">{k.discountPercent}% OFF</td>
                    <td className="px-4 py-3 font-sans text-slate-300 truncate max-w-xs">{k.description}</td>
                    <td className="px-4 py-3">{k.usesCount} / {k.maxUses}</td>
                    <td className="px-4 py-3 font-sans">
                      <button
                        onClick={() => handleToggleKeyActive(k.code)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          k.active ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/30" : "bg-rose-400/10 text-rose-300 border border-rose-400/30"
                        }`}
                      >
                        {k.active ? "Activo" : "Inactivo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDeleteKey(k.code)}
                        className="text-slate-400 hover:text-rose-400 p-1"
                        title="Eliminar llave"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* METRICS & OVERVIEW */}
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map(([Icon, label, value]) => (
            <article key={label} className="rounded-2xl border border-white/10 bg-[#0c0818] p-5">
              <Icon size={18} className="text-[#c084fc]" />
              <p className="mt-8 text-xs text-slate-400 font-medium">{label}</p>
              <span className="mt-1 block text-3xl font-bold tabular-nums text-white">
                {new Intl.NumberFormat("es-MX").format(value)}
              </span>
            </article>
          ))}
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_.75fr]">
          <section className="rounded-2xl border border-white/10 bg-[#0c0818] p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-white text-base">Tráfico reciente</h2>
                <p className="mt-1 text-xs text-slate-400">Páginas vistas con consentimiento · últimos 7 días</p>
              </div>
              <button
                onClick={exportCsv}
                disabled={!data.daily.length}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/5 px-3 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-30"
              >
                <Download size={14} /> CSV
              </button>
            </div>
            <div className="mt-8 flex h-56 items-end gap-3">
              {data.daily.length ? (
                data.daily.map((item) => (
                  <div key={item.date} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <span className="text-center text-xs tabular-nums text-slate-400">{item.views}</span>
                    <div
                      className="min-h-1 rounded-t-lg bg-gradient-to-t from-[#8b5cf6] to-[#c084fc]"
                      style={{ height: `${Math.max(3, (item.views / max) * 100)}%` }}
                    />
                    <span className="text-center text-[10px] text-slate-400">
                      {new Date(`${item.date}T12:00:00`).toLocaleDateString("es-MX", { weekday: "short" })}
                    </span>
                  </div>
                ))
              ) : (
                <div className="grid size-full place-items-center text-xs text-slate-500">Sin eventos de tráfico registrados</div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#0c0818] p-6">
            <div className="flex items-center gap-3">
              <Activity className="text-[#c084fc]" />
              <div>
                <h2 className="font-bold text-white text-base">Monitoreo de Errores</h2>
                <p className="mt-1 text-xs text-slate-400">{data.metrics.errors} sin resolver</p>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {data.errors.length ? (
                data.errors.map((item) => (
                  <article key={item.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={14} className={item.severity === "fatal" ? "mt-0.5 text-rose-400" : "mt-0.5 text-amber-300"} />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-white">{item.message}</p>
                        <p className="mt-1 truncate text-[10px] text-slate-400">{item.path} · {new Date(item.created_at).toLocaleString("es-MX")}</p>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-xs text-slate-500">Sin errores registrados en el sistema</div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
