"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  ExternalLink,
  FolderKanban,
  Globe,
  ImageIcon,
  LayoutTemplate,
  Menu,
  MoreHorizontal,
  Plus,
  QrCode,
  Settings,
  Sparkles,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/brand";
import { ClipCheckoutModal } from "@/components/payments/clip-checkout-modal";
import { DomainManagerModal } from "@/components/dashboard/domain-manager-modal";
import { ShareQrModal } from "@/components/dashboard/share-qr-modal";
import { templates } from "@/lib/templates";
import type { ProjectSummary } from "@/types/site";

const demoProjects: ProjectSummary[] = [
  { id: "orbital-labs", name: "Orbital Studio", slug: "orbital-studio", template: "Orbital Labs", status: "published", updatedAt: "Hace 18 min", palette: ["#080d20", "#7667ff"] },
  { id: "mesa-nueve", name: "Mesa Nueve", slug: "mesa-nueve", template: "Mesa Nueve", status: "changes", updatedAt: "Ayer", palette: ["#efe5d3", "#b6442a"] },
  { id: "noir-atelier", name: "Atelier Nómada", slug: "atelier-nomada", template: "Noir Atelier", status: "draft", updatedAt: "Hace 4 días", palette: ["#171215", "#d4a993"] },
];

export function DashboardShell({
  initialProjects = demoProjects,
  persistenceMode = "local",
}: {
  initialProjects?: ProjectSummary[];
  persistenceMode?: "local" | "remote";
}) {
  const [mobileNav, setMobileNav] = useState(false);
  const [activeTab, setActiveTab] = useState<"projects" | "stats" | "activity">("projects");
  const [projects, setProjects] = useState(initialProjects);
  const [showClipModal, setShowClipModal] = useState(false);
  const [domainModalProject, setDomainModalProject] = useState<ProjectSummary | null>(null);
  const [qrModalProject, setQrModalProject] = useState<ProjectSummary | null>(null);

  useEffect(() => {
    if (persistenceMode === "remote") return;
    const timer = window.setTimeout(() => {
      try {
        const stored = JSON.parse(localStorage.getItem("vexora-projects") ?? "[]") as ProjectSummary[];
        if (stored.length) {
          setProjects([...stored, ...demoProjects.filter((d) => !stored.some((s) => s.slug === d.slug))]);
        }
      } catch {}
    }, 0);
    return () => window.clearTimeout(timer);
  }, [persistenceMode]);

  const publishedCount = projects.filter((p) => p.status === "published").length;
  const draftCount = projects.filter((p) => p.status === "draft").length;
  const changesCount = projects.filter((p) => p.status === "changes").length;

  const activityLog = [
    { time: "Hace 12 min", action: "Publicación de sitio", detail: "Versión v1.4 de Orbital Studio en producción", type: "publish" },
    { time: "Hace 2 horas", action: "Guardado de sección", detail: "Actualizada sección Hero principal en Mesa Nueve", type: "edit" },
    { time: "Ayer", action: "Nuevo medio de Cloudinary", detail: "Subida imagen 'hero_bg_compressed.webp'", type: "media" },
    { time: "Hace 3 días", action: "Nuevo sitio creado", detail: "Proyecto inicializado con plantilla Noir Atelier", type: "create" },
  ];

  return (
    <div className="min-h-dvh bg-[#050508] text-[#f8fafc]">
      <ClipCheckoutModal isOpen={showClipModal} onClose={() => setShowClipModal(false)} initialPlan="Studio" />
      <DomainManagerModal
        isOpen={Boolean(domainModalProject)}
        onClose={() => setDomainModalProject(null)}
        siteName={domainModalProject?.name}
        siteSlug={domainModalProject?.slug}
      />
      <ShareQrModal
        isOpen={Boolean(qrModalProject)}
        onClose={() => setQrModalProject(null)}
        siteName={qrModalProject?.name}
        siteUrl={typeof window !== "undefined" ? `${window.location.origin}/site/${qrModalProject?.slug}` : `http://localhost:3000/site/${qrModalProject?.slug}`}
      />

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#090614] p-4 transition-transform lg:translate-x-0 ${
          mobileNav ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-2">
          <Brand />
          <button
            aria-label="Cerrar menú"
            className="grid size-10 place-items-center text-slate-400 lg:hidden hover:text-white"
            onClick={() => setMobileNav(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="mt-8 space-y-1.5" aria-label="Dashboard">
          <button
            onClick={() => {
              setActiveTab("projects");
              setMobileNav(false);
            }}
            className={`flex w-full min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition ${
              activeTab === "projects" ? "bg-purple-600/30 text-white border border-purple-500/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <FolderKanban size={18} className={activeTab === "projects" ? "text-[#c084fc]" : ""} />
            Proyectos
          </button>

          <Link
            href="/templates"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <LayoutTemplate size={18} />
            Plantillas
          </Link>

          <Link
            href="/account/media"
            className="flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <ImageIcon size={18} />
            Fotos y medios
          </Link>

          <button
            onClick={() => {
              setActiveTab("stats");
              setMobileNav(false);
            }}
            className={`flex w-full min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition ${
              activeTab === "stats" ? "bg-purple-600/30 text-white border border-purple-500/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <BarChart3 size={18} className={activeTab === "stats" ? "text-[#c084fc]" : ""} />
            Estadísticas
          </button>

          <button
            onClick={() => {
              setActiveTab("activity");
              setMobileNav(false);
            }}
            className={`flex w-full min-h-11 items-center gap-3 rounded-xl px-3.5 text-sm font-medium transition ${
              activeTab === "activity" ? "bg-purple-600/30 text-white border border-purple-500/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Activity size={18} className={activeTab === "activity" ? "text-[#c084fc]" : ""} />
            Actividad
          </button>
        </nav>

        {/* CLIP PAYMENTS CARD */}
        <div className="absolute bottom-4 left-4 right-4 space-y-3">
          <div className="rounded-2xl border border-purple-500/30 bg-purple-500/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#c084fc]">
              <Sparkles size={14} /> Plan Emprendedor
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <i className="block h-full w-[60%] rounded-full bg-[#c084fc]" />
            </div>
            <p className="mt-2 text-[11px] text-slate-400">{Math.min(projects.length, 5)} de 5 proyectos</p>
            <button
              onClick={() => setShowClipModal(true)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-white hover:text-[#c084fc] transition"
            >
              <CreditCard size={14} className="text-[#c084fc]" /> Mejorar con Clip →
            </button>
          </div>
          <Link href="/" className="flex min-h-10 items-center gap-3 rounded-xl px-3 text-xs text-slate-400 hover:text-white transition">
            <Settings size={16} /> Configuración
          </Link>
        </div>
      </aside>

      {/* HEADER & MAIN CONTENT */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#050508]/85 px-5 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Abrir menú"
              className="grid size-11 place-items-center rounded-xl border border-white/10 lg:hidden text-slate-300"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <p className="text-xs text-slate-400">Espacio de trabajo</p>
              <p className="text-sm font-semibold text-white">Miguel / Vexora</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`hidden rounded-full border px-3 py-1.5 text-[10px] font-semibold sm:inline-flex ${
                persistenceMode === "remote"
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-purple-400/30 bg-purple-400/10 text-purple-200"
              }`}
            >
              {persistenceMode === "remote" ? "SUPABASE CONECTADO" : "MODO LOCAL / OFFLINE"}
            </span>
            <button
              onClick={() => setShowClipModal(true)}
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-purple-500/20 border border-purple-500/30 px-3.5 py-1.5 text-xs font-semibold text-[#c084fc] hover:bg-purple-500/30 transition"
            >
              <CreditCard size={14} /> Pagar con Clip
            </button>
            <Link href="/admin" className="hidden min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-slate-400 hover:text-white sm:flex">
              <Users size={17} /> Admin
            </Link>
            <div className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-[#8b5cf6] to-[#c084fc] text-sm font-semibold text-white shadow-md">
              MV
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1500px] p-5 md:p-8">
          {/* TAB 1: PROYECTOS */}
          {activeTab === "projects" && (
            <div>
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                <div>
                  <p className="text-sm text-[#c084fc]">Tu estudio digital</p>
                  <h1 className="mt-2 text-4xl font-semibold tracking-[-.05em] text-white md:text-5xl">Proyectos en Vexora</h1>
                  <p className="mt-3 text-slate-400 text-sm">
                    {persistenceMode === "remote"
                      ? "Tus proyectos están sincronizados con la base de datos Supabase."
                      : "Tus ideas se guardan en tiempo real en tu navegador."}
                  </p>
                </div>
                <Link
                  href="/dashboard/new"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-6 font-semibold text-white shadow-lg hover:brightness-110 transition"
                >
                  <Plus size={18} /> Crear nuevo sitio
                </Link>
              </div>

              {/* STAT CARDS (OPERATIONAL) */}
              <section className="mt-10 grid gap-4 md:grid-cols-3">
                <article className="rounded-2xl border border-white/10 bg-[#0c0818] p-5">
                  <p className="text-sm text-slate-400">Proyectos activos</p>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-4xl font-semibold tabular-nums text-white">{projects.length}</span>
                    <FolderKanban className="text-[#c084fc]" size={28} />
                  </div>
                </article>

                <article className="rounded-2xl border border-white/10 bg-[#0c0818] p-5">
                  <p className="text-sm text-slate-400">Sitios en producción</p>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-4xl font-semibold tabular-nums text-white">{publishedCount}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full border border-emerald-400/20">
                      <CheckCircle2 size={12} /> {publishedCount > 0 ? "Activo" : "Sin publicar"}
                    </span>
                  </div>
                </article>

                <article className="rounded-2xl border border-white/10 bg-[#0c0818] p-5">
                  <p className="text-sm text-slate-400">Borradores & Cambios</p>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="text-4xl font-semibold tabular-nums text-white">{draftCount + changesCount}</span>
                    <Clock className="text-amber-400" size={28} />
                  </div>
                </article>
              </section>

              {/* PROJECTS GRID */}
              <section className="mt-12">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-semibold tracking-[-.03em] text-white">Todos tus sitios ({projects.length})</h2>
                  <button className="grid size-10 place-items-center rounded-xl text-slate-400 hover:bg-white/5 hover:text-white" aria-label="Más opciones">
                    <MoreHorizontal />
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="mt-6 rounded-[2rem] border border-dashed border-white/15 bg-white/[0.01] px-6 py-16 text-center">
                    <FolderKanban className="mx-auto text-[#c084fc]" size={36} />
                    <h3 className="mt-5 text-xl font-semibold text-white">Tu primer proyecto empieza aquí.</h3>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                      Elige una plantilla, personaliza el contenido y publícala cuando esté lista.
                    </p>
                    <Link href="/dashboard/new" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-slate-200">
                      <Plus size={16} /> Crear sitio
                    </Link>
                  </div>
                ) : (
                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {projects.map((project) => (
                      <article key={`${project.slug}-${project.id}`} className="group overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#0a0715] transition hover:-translate-y-1 hover:border-purple-500/40">
                        <Link href={`/editor/${project.id}`} className="block">
                          <div
                            className="relative aspect-[16/10] overflow-hidden p-6"
                            style={{ background: `linear-gradient(140deg,${project.palette[0]},${project.palette[0]} 60%,${project.palette[1]})` }}
                          >
                            <div className="absolute right-[-8%] top-[-12%] size-44 rounded-full opacity-45 blur-3xl" style={{ background: project.palette[1] }} />
                            <span className="text-[9px] uppercase tracking-[.2em] text-white/70 font-semibold">{project.template}</span>
                            <p className="relative mt-16 max-w-[75%] text-3xl font-semibold leading-[.95] tracking-[-.05em] text-white">{project.name}</p>
                            <span className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-white text-black opacity-0 transition group-hover:opacity-100 shadow-md">
                              <ArrowUpRight size={18} />
                            </span>
                          </div>
                        </Link>
                        <div className="p-5 bg-[#080512]">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-white">{project.name}</h3>
                              <p className="mt-1 text-xs text-slate-400">Editado {project.updatedAt}</p>
                            </div>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                project.status === "published"
                                  ? "bg-emerald-400/10 text-emerald-300 border border-emerald-400/20"
                                  : project.status === "changes"
                                  ? "bg-amber-400/10 text-amber-200 border border-amber-400/20"
                                  : "bg-white/[0.06] text-slate-400 border border-white/10"
                              }`}
                            >
                              {project.status === "published" ? "Publicado" : project.status === "changes" ? "Cambios sin publicar" : "Borrador"}
                            </span>
                          </div>
                          <div className="mt-5 flex items-center gap-2">
                            <Link href={`/editor/${project.id}`} className="flex min-h-10 flex-1 items-center justify-center rounded-xl bg-white/10 text-xs font-semibold text-white hover:bg-gradient-to-r hover:from-[#8b5cf6] hover:to-[#c084fc] transition">
                              Editar en estudio
                            </Link>
                            <button
                              onClick={() => setDomainModalProject(project)}
                              aria-label={`Dominio para ${project.name}`}
                              className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-[#c084fc] hover:border-purple-500/40 transition"
                              title="Configurar dominio personalizado (ej. miempresa.com)"
                            >
                              <Globe size={16} />
                            </button>
                            <button
                              onClick={() => setQrModalProject(project)}
                              aria-label={`Código QR para ${project.name}`}
                              className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-[#c084fc] hover:border-purple-500/40 transition"
                              title="Ver Código QR y compartir"
                            >
                              <QrCode size={16} />
                            </button>
                            <Link aria-label={`Ver ${project.name}`} href={`/site/${project.slug}`} className="grid size-10 place-items-center rounded-xl border border-white/10 text-slate-400 hover:text-white hover:border-white/20 transition">
                              <ExternalLink size={16} />
                            </Link>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {/* RECOMMENDED TEMPLATES */}
              <section className="mt-14 pb-12">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <h2 className="text-xl font-semibold tracking-[-.03em] text-white">Plantillas recomendadas</h2>
                  <Link href="/templates" className="text-xs font-semibold text-[#c084fc] hover:underline">
                    Ver todas
                  </Link>
                </div>
                <div className="mt-5 flex gap-4 overflow-x-auto pb-4">
                  {templates.slice(0, 4).map((t) => (
                    <Link href={`/dashboard/new?template=${t.id}`} key={t.id} className="min-w-[270px] rounded-2xl border border-white/10 bg-[#0c0818] p-4 transition hover:border-purple-500/40">
                      <div className="h-28 rounded-xl" style={{ background: `radial-gradient(circle at 70% 20%,${t.palette[2]},transparent 35%),${t.palette[0]}` }} />
                      <p className="mt-4 font-semibold text-white">{t.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{t.category} · {t.premium ? "Signature" : "Essential"}</p>
                    </Link>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: ESTADÍSTICAS */}
          {activeTab === "stats" && (
            <div>
              <div className="flex justify-between items-end border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-[#c084fc]">Panel de Métricas</p>
                  <h1 className="mt-1 text-4xl font-semibold tracking-[-.05em] text-white">Estadísticas Operacionales</h1>
                  <p className="mt-2 text-slate-400 text-sm">Resumen en tiempo real de tus proyectos y rendimiento.</p>
                </div>
                <button
                  onClick={() => setActiveTab("projects")}
                  className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Volver a Proyectos
                </button>
              </div>

              <div className="mt-8 grid gap-6 md:grid-cols-4">
                <article className="rounded-2xl border border-purple-500/30 bg-[#0c0818] p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sitios Totales</p>
                  <p className="mt-3 text-5xl font-bold text-white">{projects.length}</p>
                  <p className="mt-2 text-xs text-[#c084fc]">Gestionados en Vexora</p>
                </article>

                <article className="rounded-2xl border border-purple-500/30 bg-[#0c0818] p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Publicados</p>
                  <p className="mt-3 text-5xl font-bold text-emerald-400">{publishedCount}</p>
                  <p className="mt-2 text-xs text-emerald-300/70">Dominios activos en producción</p>
                </article>

                <article className="rounded-2xl border border-purple-500/30 bg-[#0c0818] p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Páginas Totales</p>
                  <p className="mt-3 text-5xl font-bold text-purple-300">{projects.length * 3}</p>
                  <p className="mt-2 text-xs text-purple-200/70">Estructuras multipágina</p>
                </article>

                <article className="rounded-2xl border border-purple-500/30 bg-[#0c0818] p-6">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estado de Almacenamiento</p>
                  <p className="mt-3 text-5xl font-bold text-white">0%</p>
                  <p className="mt-2 text-xs text-slate-400">Medios en Cloudinary CDN</p>
                </article>
              </div>

              <div className="mt-8 rounded-[2rem] border border-white/10 bg-[#090614] p-8">
                <h3 className="text-xl font-bold text-white mb-4">Rendimiento y Tráfico Global</h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                    <span className="text-xs text-slate-400">Disponibilidad del CDN</span>
                    <p className="mt-2 text-3xl font-bold text-emerald-400">99.98%</p>
                    <p className="mt-1 text-xs text-slate-500">Red global sin interrupciones</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                    <span className="text-xs text-slate-400">Puntaje Lighthouse Promedio</span>
                    <p className="mt-2 text-3xl font-bold text-[#c084fc]">98/100</p>
                    <p className="mt-1 text-xs text-slate-500">Optimización de carga ultrarrápida</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                    <span className="text-xs text-slate-400">Pasarela de Pago</span>
                    <p className="mt-2 text-3xl font-bold text-white">Clip API Connected</p>
                    <p className="mt-1 text-xs text-slate-500">Suscripciones México & LatAm</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVIDAD */}
          {activeTab === "activity" && (
            <div>
              <div className="flex justify-between items-end border-b border-white/10 pb-5">
                <div>
                  <p className="text-sm text-[#c084fc]">Registro del Sistema</p>
                  <h1 className="mt-1 text-4xl font-semibold tracking-[-.05em] text-white">Historial de Actividad</h1>
                  <p className="mt-2 text-slate-400 text-sm">Registro de cambios, publicaciones y eventos en tu estudio.</p>
                </div>
                <button
                  onClick={() => setActiveTab("projects")}
                  className="rounded-full border border-white/15 px-5 py-2 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Volver a Proyectos
                </button>
              </div>

              <div className="mt-8 rounded-[2rem] border border-white/10 bg-[#090614] p-8">
                <div className="divide-y divide-white/10">
                  {activityLog.map((log, idx) => (
                    <div key={idx} className="py-5 flex items-start gap-4">
                      <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-purple-500/20 text-[#c084fc] border border-purple-500/30">
                        {log.type === "publish" ? <Globe size={18} /> : log.type === "media" ? <ImageIcon size={18} /> : <FolderKanban size={18} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-white text-base">{log.action}</h4>
                          <span className="text-xs text-slate-500">{log.time}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{log.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
