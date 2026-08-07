"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Blocks,
  Camera,
  Check,
  ChevronDown,
  CloudOff,
  Copy,
  ExternalLink,
  Eye,
  FileText,
  GripVertical,
  ImageIcon,
  Laptop,
  Layers3,
  LoaderCircle,
  Lock,
  Monitor,
  PanelLeftClose,
  PanelRightClose,
  Plus,
  Redo2,
  Rocket,
  Save,
  Search,
  Share2,
  Smartphone,
  Tablet,
  Type,
  Trash2,
  Undo2,
  X,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import { Brand } from "@/components/brand";
import {
  SiteRenderer,
  blockRegistry,
} from "@/components/renderer/site-renderer";
import { cloneTemplate } from "@/lib/templates";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import type { AnimationPreset, SiteSection } from "@/types/site";
import { AdvancedEditorTools } from "@/components/editor/advanced-editor-tools";
import { SeoModal } from "@/components/editor/seo-modal";
import { SiteThumbnailGenerator } from "@/components/editor/site-thumbnail-generator";

type SectionTypography = NonNullable<SiteSection["styles"]["typography"]>;
type FontChoice = NonNullable<SectionTypography["headingFont"]>;

const blockLabels: Record<SiteSection["type"], string> = {
  hero: "Hero cinematográfico",
  story: "Storytelling sticky",
  services: "Servicios",
  gallery: "Galería horizontal",
  testimonial: "Testimonio",
  stats: "Números animados",
  cta: "CTA inmersivo",
  contact: "Contacto",
  container: "Contenedor libre",
  columns: "Columnas flexibles",
};
const presets: { value: AnimationPreset; label: string }[] = [
  { value: "none", label: "Sin animación" },
  { value: "fade-up", label: "Fade up" },
  { value: "blur-reveal", label: "Blur reveal" },
  { value: "slide-left", label: "Slide left" },
  { value: "zoom-reveal", label: "Zoom reveal" },
  { value: "parallax", label: "Parallax slow" },
  { value: "scroll-driven", label: "Scroll driven" },
  { value: "sticky-story", label: "Storytelling fijado" },
  { value: "horizontal-journey", label: "Journey horizontal" },
];
const fontOptions = [
  ["geist", "Geist · neutral"],
  ["manrope", "Manrope · premium"],
  ["space-grotesk", "Space Grotesk · editorial"],
  ["cormorant", "Cormorant · lujo"],
  ["ibm-plex-mono", "IBM Plex Mono · técnica"],
] as const;
const fontPreviewStyles: Record<FontChoice, string> = {
  geist: "var(--font-geist-sans), sans-serif",
  manrope: "var(--font-manrope), sans-serif",
  "space-grotesk": "var(--font-space-grotesk), sans-serif",
  cormorant: "var(--font-cormorant), Georgia, serif",
  "ibm-plex-mono": "var(--font-ibm-plex-mono), monospace",
};

function SortableLayer({
  section,
  index,
  total,
}: {
  section: SiteSection;
  index: number;
  total: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id, disabled: section.locked });
  const select = useEditorStore((s) => s.select);
  const selected = useEditorStore((s) => s.selectedId);
  const move = useEditorStore((s) => s.move);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "group flex items-center gap-1 rounded-xl border p-1",
        selected === section.id
          ? "border-violet-400/40 bg-violet-400/10"
          : "border-transparent hover:bg-white/[.04]",
        isDragging && "z-50 opacity-50",
      )}
    >
      <button
        {...attributes}
        {...listeners}
        aria-label={`Arrastrar ${section.content.title}`}
        className="grid size-9 shrink-0 touch-none place-items-center text-white/25 hover:text-white"
      >
        <GripVertical size={16} />
      </button>
      <button
        onClick={() => select(section.id)}
        className="min-w-0 flex-1 py-2 text-left"
      >
        <span className="block truncate text-xs font-semibold">
          {section.content.title}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-white/30">
          {section.type}
        </span>
      </button>
      <div className="hidden group-hover:flex">
        <button
          disabled={index === 0}
          onClick={() => move(section.id, -1)}
          className="grid size-8 place-items-center disabled:opacity-20"
          aria-label="Mover arriba"
        >
          <ArrowUp size={13} />
        </button>
        <button
          disabled={index === total - 1}
          onClick={() => move(section.id, 1)}
          className="grid size-8 place-items-center disabled:opacity-20"
          aria-label="Mover abajo"
        >
          <ArrowDown size={13} />
        </button>
      </div>
    </div>
  );
}

export function EditorShell({ projectId }: { projectId: string }) {
  const search = useSearchParams();
  const schema = useEditorStore((s) => s.schema);
  const activePageId = useEditorStore((s) => s.activePageId);
  const selectedId = useEditorStore((s) => s.selectedId);
  const device = useEditorStore((s) => s.device);
  const saving = useEditorStore((s) => s.saving);
  const past = useEditorStore((s) => s.past);
  const future = useEditorStore((s) => s.future);
  const setSchema = useEditorStore((s) => s.setSchema);
  const select = useEditorStore((s) => s.select);
  const setDevice = useEditorStore((s) => s.setDevice);
  const update = useEditorStore((s) => s.updateSection);
  const updateSite = useEditorStore((s) => s.updateSite);
  const reorder = useEditorStore((s) => s.reorder);
  const move = useEditorStore((s) => s.move);
  const duplicate = useEditorStore((s) => s.duplicate);
  const remove = useEditorStore((s) => s.remove);
  const addBlock = useEditorStore((s) => s.addBlock);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const markPublished = useEditorStore((s) => s.markPublished);
  const copyBlock = useEditorStore((s) => s.copyBlock);
  const pasteBlock = useEditorStore((s) => s.pasteBlock);
  const [leftTab, setLeftTab] = useState<"sections" | "blocks">("sections");
  const [rightTab, setRightTab] = useState<
    "content" | "design" | "animation" | "responsive"
  >("content");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [preview, setPreview] = useState(false);
  const [seoModalOpen, setSeoModalOpen] = useState(false);
  const [thumbnailModalOpen, setThumbnailModalOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const remoteProject =
    isSupabaseConfigured() &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      projectId,
    );
  const persist = useCallback(
    async (createVersion = false) => {
      localStorage.setItem(`vexora-site-${projectId}`, JSON.stringify(schema));
      if (remoteProject) {
        const response = await fetch(`/api/sites/${projectId}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ schema, createVersion }),
        });
        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as {
            error?: string;
          };
          throw new Error(
            payload.error ?? "No fue posible sincronizar el proyecto.",
          );
        }
      }
      useEditorStore.setState({ saving: "saved" });
    },
    [projectId, remoteProject, schema],
  );

  const handleManualSave = useCallback(async () => {
    useEditorStore.setState({ saving: "saving" });
    try {
      await persist(true);
      toast.success("Cambios guardados correctamente", {
        description: "Se creó una versión guardada de tu sitio.",
      });
    } catch (error) {
      useEditorStore.setState({
        saving: navigator.onLine ? "error" : "offline",
      });
      toast.error(
        error instanceof Error ? error.message : "Error al guardar los cambios.",
      );
    }
  }, [persist]);
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const template = search.get("template");
      let loaded = null;
      try {
        if (remoteProject) {
          const response = await fetch(`/api/sites/${projectId}`, {
            cache: "no-store",
          });
          if (!response.ok)
            throw new Error("No se pudo cargar la copia remota.");
          const payload = (await response.json()) as { schema: typeof schema };
          loaded = payload.schema;
        } else {
          const stored = localStorage.getItem(`vexora-site-${projectId}`);
          loaded = stored
            ? JSON.parse(stored)
            : cloneTemplate(
                template ??
                  (projectId.startsWith("demo-")
                    ? projectId.slice(5)
                    : projectId),
              );
        }
        setSchema(loaded);
      } catch {
        try {
          const backup = localStorage.getItem(`vexora-site-${projectId}`);
          setSchema(
            backup ? JSON.parse(backup) : cloneTemplate("orbital-labs"),
          );
          useEditorStore.setState({
            saving: navigator.onLine ? "error" : "offline",
          });
          toast.warning("Trabajando con la copia local", {
            description: "La sincronización se reintentará al guardar.",
          });
        } catch {
          setSchema(cloneTemplate("orbital-labs"));
          useEditorStore.setState({ saving: "error" });
        }
      }
      if (window.innerWidth < 768) {
        setLeftOpen(false);
        setRightOpen(false);
        setDevice("mobile");
      }
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [projectId, remoteProject, search, setDevice, setSchema]);
  useEffect(() => {
    if (!hydrated || saving !== "saving") return;
    const timer = setTimeout(() => {
      void persist().catch(() =>
        useEditorStore.setState({
          saving: navigator.onLine ? "error" : "offline",
        }),
      );
    }, 650);
    return () => clearTimeout(timer);
  }, [saving, hydrated, persist]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const editing =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        useEditorStore.setState({ saving: "saving" });
        void persist(true)
          .then(() => toast.success("Versión guardada"))
          .catch((error) => {
            useEditorStore.setState({
              saving: navigator.onLine ? "error" : "offline",
            });
            toast.error(
              error instanceof Error
                ? error.message
                : "No fue posible guardar.",
              {
                action: {
                  label: "Reintentar",
                  onClick: () => void persist(true),
                },
              },
            );
          });
      }
      if (
        !editing &&
        (e.ctrlKey || e.metaKey) &&
        e.key.toLowerCase() === "c" &&
        selectedId
      ) {
        e.preventDefault();
        copyBlock(selectedId);
        toast.success("Bloque copiado");
      }
      if (!editing && (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        e.preventDefault();
        pasteBlock();
      }
      if (e.key === "Escape") setPreview(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo, persist, copyBlock, pasteBlock, selectedId]);
  const currentPage = useMemo(
    () =>
      schema.pages.find((page) => page.id === activePageId) ?? schema.pages[0],
    [schema, activePageId],
  );
  const selected = useMemo(
    () => currentPage?.sections.find((s) => s.id === selectedId) ?? null,
    [currentPage, selectedId],
  );
  const selectedTypography = selected?.styles.typography ?? {
    headingFont: undefined,
    bodyFont: undefined,
    headingScale: 1,
    bodyScale: 1,
    lineHeight: 1,
    letterSpacing: 0,
  };
  const globalTypography = schema.site.theme.typography ?? {
    headingFont: "geist" as const,
    bodyFont: "geist" as const,
    headingScale: 1,
    bodyScale: 1,
  };
  const width =
    device === "desktop" ? "100%" : device === "tablet" ? "768px" : "390px";
  const dragEnd = (event: DragEndEvent) => {
    if (event.over && event.active.id !== event.over.id)
      reorder(String(event.active.id), String(event.over.id));
  };
  const publish = async () => {
    if (publishing) return;
    setPublishing(true);
    try {
      let published: typeof schema = {
        ...schema,
        site: { ...schema.site, status: "published" },
      };
      if (remoteProject) {
        await persist();
        const response = await fetch(`/api/sites/${projectId}/publish`, {
          method: "POST",
        });
        const payload = (await response.json()) as {
          schema?: typeof schema;
          error?: string;
        };
        if (!response.ok || !payload.schema)
          throw new Error(payload.error ?? "No fue posible publicar.");
        published = payload.schema;
      }
      localStorage.setItem(
        `vexora-published-${schema.site.slug}`,
        JSON.stringify(published),
      );
      markPublished();
      toast.success("Sitio publicado", {
        description: `Disponible en /site/${schema.site.slug}`,
        action: {
          label: "Ver",
          onClick: () => window.open(`/site/${schema.site.slug}`, "_blank"),
        },
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No fue posible publicar.",
        {
          description: "Tus cambios siguen guardados como borrador.",
          action: { label: "Reintentar", onClick: () => void publish() },
        },
      );
    } finally {
      setPublishing(false);
    }
  };
  if (!hydrated)
    return (
      <div className="grid min-h-dvh place-items-center bg-[#0a0a0d] text-white">
        <LoaderCircle className="animate-spin text-violet-400" />
      </div>
    );
  return (
    <main className="vexora-editor editor-a11y flex h-dvh flex-col overflow-hidden bg-[#09090d] text-[#f7f4ef]">
      <Toaster theme="dark" position="bottom-center" />
      <header className="vexora-editor-header z-[130] flex h-[72px] shrink-0 items-center justify-between px-2 md:px-4">
        <div className="flex min-w-0 items-center gap-1 md:gap-3">
          <Link
            href="/dashboard"
            aria-label="Volver al dashboard"
            className="grid size-11 place-items-center rounded-xl text-white/45 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft size={18} />
          </Link>
          <Brand compact className="hidden sm:inline-flex" />
          <span className="hidden h-5 w-px bg-white/10 sm:block" />
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold md:text-sm">
              {schema.site.name}
            </p>
            <p
              role="status"
              className={cn(
                "flex items-center gap-1 text-[10px]",
                saving === "error"
                  ? "text-rose-300"
                  : saving === "offline"
                    ? "text-amber-200"
                    : "text-white/35",
              )}
            >
              {saving === "saving" ? (
                <>
                  <LoaderCircle size={10} className="animate-spin" />
                  Guardando...
                </>
              ) : saving === "error" ? (
                <>
                  <AlertCircle size={10} />
                  Error al sincronizar
                </>
              ) : saving === "offline" ? (
                <>
                  <CloudOff size={10} />
                  Guardado local
                </>
              ) : (
                <>
                  <Check size={10} className="text-emerald-300" />
                  {remoteProject ? "Sincronizado" : "Guardado"}
                </>
              )}
            </p>
          </div>
        </div>
        <div className="vexora-device-switcher absolute left-1/2 hidden -translate-x-1/2 items-center p-1 lg:flex">
          {[
            ["desktop", Monitor, "Escritorio"],
            ["tablet", Tablet, "Tablet"],
            ["mobile", Smartphone, "Móvil"],
          ].map(([value, Icon, label]) => (
            <button
              key={String(value)}
              onClick={() => setDevice(value as typeof device)}
              aria-label={String(label)}
              className={cn(
                "grid size-10 place-items-center rounded-xl text-white/40 transition hover:text-white",
                device === value && "bg-white text-[#111116] shadow-lg",
              )}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!past.length}
            className="grid size-10 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20"
            aria-label="Deshacer"
          >
            <Undo2 size={17} />
          </button>
          <button
            onClick={redo}
            disabled={!future.length}
            className="hidden size-10 place-items-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white disabled:opacity-20 sm:grid"
            aria-label="Rehacer"
          >
            <Redo2 size={17} />
          </button>
          <button
            onClick={() => setPreview(true)}
            className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white md:flex transition"
          >
            <Eye size={16} />
            Vista previa
          </button>
          <button
            onClick={() => setSeoModalOpen(true)}
            className="hidden min-h-10 items-center gap-2 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3 text-xs font-semibold text-[#c084fc] hover:bg-purple-500/20 md:flex transition"
            title="Optimizador SEO y Tarjetas OpenGraph"
          >
            <Search size={15} />
            SEO & Social
          </button>
          <button
            onClick={() => setThumbnailModalOpen(true)}
            className="hidden min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white lg:flex transition"
            title="Generar captura miniatura del sitio"
          >
            <Camera size={15} />
            Captura
          </button>
          <button
            onClick={() => void handleManualSave()}
            disabled={saving === "saving"}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-purple-500/40 bg-purple-600/20 px-3.5 text-xs font-semibold text-white hover:bg-purple-600/30 transition shadow-sm disabled:opacity-50"
          >
            {saving === "saving" ? (
              <LoaderCircle size={15} className="animate-spin text-[#c084fc]" />
            ) : (
              <Save size={15} className="text-[#c084fc]" />
            )}
            <span>{saving === "saving" ? "Guardando..." : "Guardar cambios"}</span>
          </button>
          <button
            onClick={() => void publish()}
            disabled={publishing}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] px-4 text-xs font-semibold text-white hover:brightness-110 disabled:cursor-wait disabled:opacity-60 transition shadow-md"
          >
            {publishing ? (
              <LoaderCircle size={15} className="animate-spin" />
            ) : (
              <Rocket size={15} />
            )}
            {publishing ? "Publicando..." : "Publicar"}
          </button>
          <AdvancedEditorTools
            projectId={projectId}
            remoteProject={remoteProject}
            onPreview={() => setPreview(true)}
          />
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside
          className={cn(
            "vexora-editor-sidebar z-30 shrink-0 transition-all",
            leftOpen ? "w-[312px]" : "w-12",
          )}
        >
          <div className="flex h-12 items-center justify-between border-b border-white/[.07] p-1">
            {leftOpen && (
              <div className="flex">
                <button
                  onClick={() => setLeftTab("sections")}
                  className={cn(
                    "min-h-9 rounded-lg px-3 text-xs font-semibold",
                    leftTab === "sections" ? "bg-white/[.08]" : "text-white/35",
                  )}
                >
                  Secciones
                </button>
                <button
                  onClick={() => setLeftTab("blocks")}
                  className={cn(
                    "min-h-9 rounded-lg px-3 text-xs font-semibold",
                    leftTab === "blocks" ? "bg-white/[.08]" : "text-white/35",
                  )}
                >
                  Bloques
                </button>
              </div>
            )}
            <button
              onClick={() => setLeftOpen(!leftOpen)}
              className="grid size-10 place-items-center text-white/35 hover:text-white"
              aria-label={
                leftOpen ? "Cerrar panel izquierdo" : "Abrir panel izquierdo"
              }
            >
              <PanelLeftClose size={17} />
            </button>
          </div>
          {leftOpen && (
            <div className="h-[calc(100%-48px)] overflow-y-auto">
              <PageControls />
              <div className="p-2">
                {leftTab === "sections" ? (
                  <>
                    <div className="mb-2 flex items-center justify-between px-2 py-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
                        {currentPage.name} · {currentPage.sections.length}{" "}
                        bloques
                      </span>
                      <button
                        onClick={() => setLeftTab("blocks")}
                        aria-label="Añadir sección"
                        className="grid size-8 place-items-center rounded-lg hover:bg-white/5"
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={dragEnd}
                    >
                      <SortableContext
                        items={currentPage.sections.map((s) => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-1">
                          {currentPage.sections.map((section, index) => (
                            <SortableLayer
                              key={section.id}
                              section={section}
                              index={index}
                              total={currentPage.sections.length}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>
                  </>
                ) : (
                  <div>
                    <p className="px-2 py-3 text-[10px] font-semibold uppercase tracking-wider text-white/30">
                      Biblioteca esencial
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {blockRegistry.map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            addBlock(type);
                            setLeftTab("sections");
                          }}
                          className="min-h-24 rounded-xl border border-white/[.07] bg-white/[.025] p-3 text-left transition hover:border-violet-400/35 hover:bg-violet-400/[.07]"
                        >
                          <Blocks size={17} className="text-violet-300" />
                          <span className="mt-4 block text-[11px] font-semibold leading-tight">
                            {blockLabels[type]}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </aside>
        <section className="vexora-workspace relative min-w-0 flex-1 overflow-auto p-4 md:p-8">
          <div className="vexora-workspace-grid pointer-events-none absolute inset-0" />
          <div
            className="vexora-canvas relative mx-auto min-h-full overflow-hidden bg-white transition-[width] duration-300"
            style={{ width, maxWidth: "100%" }}
          >
            <SiteRenderer
              schema={schema}
              pageSlug={currentPage.slug}
              editable
              selectedId={selectedId}
              onSelect={(id) => {
                select(id);
                setRightOpen(true);
                setRightTab("content");
              }}
              onContentChange={(id, patch) => {
                const section = currentPage.sections.find(
                  (item) => item.id === id,
                );
                if (!section) return;
                update(id, {
                  content: { ...section.content, ...patch },
                });
              }}
              onReorder={reorder}
              onMove={move}
              onDuplicate={duplicate}
              onRemove={remove}
              onSiteChange={updateSite}
            />
          </div>
          <div className="vexora-canvas-hint fixed bottom-5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 px-4 py-2.5 text-[11px] text-white/65">
            <span className="flex items-center gap-2 text-white">
              <Type size={14} className="text-violet-300" />
              Haz clic en cualquier texto para editarlo
            </span>
            <span className="h-4 w-px bg-white/10" />
            <span className="flex items-center gap-2">
              <Laptop size={13} />
              {device === "desktop" ? "Escritorio" : width}
            </span>
          </div>
        </section>
        <aside
          className={cn(
            "vexora-editor-sidebar z-30 shrink-0 transition-all",
            rightOpen ? "w-[344px]" : "w-12",
          )}
        >
          <div className="flex h-12 items-center border-b border-white/[.07] p-1">
            <button
              onClick={() => setRightOpen(!rightOpen)}
              className="grid size-10 shrink-0 place-items-center text-white/35 hover:text-white"
              aria-label={
                rightOpen ? "Cerrar panel derecho" : "Abrir panel derecho"
              }
            >
              <PanelRightClose size={17} />
            </button>
            {rightOpen && (
              <span className="ml-2 flex min-w-0 items-center gap-2 truncate text-xs font-semibold">
                <Layers3 size={14} className="shrink-0 text-violet-300" />
                {selected ? blockLabels[selected.type] : "Sin selección"}
              </span>
            )}
          </div>
          {rightOpen && selected && (
            <div className="h-[calc(100%-48px)] overflow-y-auto">
              <div className="flex border-b border-white/[.07] p-1">
                {(
                  ["content", "design", "animation", "responsive"] as const
                ).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRightTab(tab)}
                    className={cn(
                      "min-h-9 flex-1 rounded-lg px-1 text-[10px] font-semibold capitalize",
                      rightTab === tab
                        ? "bg-white/[.08] text-white"
                        : "text-white/30",
                    )}
                  >
                    {tab === "content"
                      ? "Contenido"
                      : tab === "design"
                        ? "Diseño"
                        : tab === "animation"
                          ? "Motion"
                          : "Responsive"}
                  </button>
                ))}
              </div>
              <div className="space-y-5 p-4">
                {rightTab === "content" && (
                  <>
                    <Field label="Título">
                      <textarea
                        value={selected.content.title}
                        onChange={(e) =>
                          update(selected.id, {
                            content: {
                              ...selected.content,
                              title: e.target.value,
                            },
                          })
                        }
                        rows={4}
                        className="editor-input"
                      />
                    </Field>
                    <Field label="Descripción">
                      <textarea
                        value={selected.content.body ?? ""}
                        onChange={(e) =>
                          update(selected.id, {
                            content: {
                              ...selected.content,
                              body: e.target.value,
                            },
                          })
                        }
                        rows={5}
                        className="editor-input"
                      />
                    </Field>
                    {selected.content.cta !== undefined && (
                      <>
                        <Field label="Texto del botón">
                          <input
                            value={selected.content.cta}
                            onChange={(e) =>
                              update(selected.id, {
                                content: {
                                  ...selected.content,
                                  cta: e.target.value,
                                },
                              })
                            }
                            className="editor-input"
                          />
                        </Field>
                        <Field label="Enlace del botón">
                          <input
                            value={selected.content.ctaHref ?? ""}
                            onChange={(e) =>
                              update(selected.id, {
                                content: {
                                  ...selected.content,
                                  ctaHref: e.target.value,
                                },
                              })
                            }
                            placeholder="/contacto o https://..."
                            className="editor-input"
                          />
                        </Field>
                      </>
                    )}
                    {selected.type === "gallery" && (
                      <MediaFields section={selected} update={update} />
                    )}
                  </>
                )}
                {rightTab === "design" && (
                  <>
                    <ColorField
                      label="Fondo"
                      value={selected.styles.background}
                      onChange={(value) =>
                        update(selected.id, {
                          styles: { ...selected.styles, background: value },
                        })
                      }
                    />
                    <ColorField
                      label="Texto"
                      value={selected.styles.foreground}
                      onChange={(value) =>
                        update(selected.id, {
                          styles: { ...selected.styles, foreground: value },
                        })
                      }
                    />
                    <ColorField
                      label="Acento"
                      value={selected.styles.accent}
                      onChange={(value) =>
                        update(selected.id, {
                          styles: { ...selected.styles, accent: value },
                        })
                      }
                    />
                    <Field
                      label={`Espaciado vertical · ${selected.styles.padding}px`}
                    >
                      <input
                        type="range"
                        min="40"
                        max="180"
                        value={selected.styles.padding}
                        onChange={(e) =>
                          update(selected.id, {
                            styles: {
                              ...selected.styles,
                              padding: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-violet-500"
                      />
                    </Field>
                    <Field label="Alineación">
                      <div className="grid grid-cols-2 gap-2">
                        {(["left", "center"] as const).map((a) => (
                          <button
                            key={a}
                            onClick={() =>
                              update(selected.id, {
                                styles: { ...selected.styles, align: a },
                              })
                            }
                            className={cn(
                              "min-h-10 rounded-lg border text-xs",
                              selected.styles.align === a
                                ? "border-violet-400 bg-violet-400/10"
                                : "border-white/10 text-white/40",
                            )}
                          >
                            {a === "left" ? "Izquierda" : "Centro"}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <div className="border-t border-white/10 pt-4">
                      <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                        Tipografía del bloque
                      </p>
                      <FontPicker
                        label="Fuente de títulos"
                        value={selectedTypography.headingFont}
                        allowGlobal
                        onChange={(headingFont) =>
                          update(selected.id, {
                            styles: {
                              ...selected.styles,
                              typography: {
                                ...selectedTypography,
                                headingFont,
                              },
                            },
                          })
                        }
                      />
                      <FontPicker
                        label="Fuente de textos"
                        value={selectedTypography.bodyFont}
                        allowGlobal
                        onChange={(bodyFont) =>
                          update(selected.id, {
                            styles: {
                              ...selected.styles,
                              typography: {
                                ...selectedTypography,
                                bodyFont,
                              },
                            },
                          })
                        }
                      />
                      <Field
                        label={`Escala de títulos · ${Math.round(selectedTypography.headingScale * 100)}%`}
                      >
                        <input
                          type="range"
                          min="0.65"
                          max="1.35"
                          step="0.05"
                          value={selectedTypography.headingScale}
                          onChange={(e) =>
                            update(selected.id, {
                              styles: {
                                ...selected.styles,
                                typography: {
                                  ...selectedTypography,
                                  headingScale: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full accent-violet-500"
                        />
                      </Field>
                      <Field
                        label={`Escala de textos · ${Math.round(selectedTypography.bodyScale * 100)}%`}
                      >
                        <input
                          type="range"
                          min="0.8"
                          max="1.25"
                          step="0.05"
                          value={selectedTypography.bodyScale}
                          onChange={(e) =>
                            update(selected.id, {
                              styles: {
                                ...selected.styles,
                                typography: {
                                  ...selectedTypography,
                                  bodyScale: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full accent-violet-500"
                        />
                      </Field>
                      <Field
                        label={`Altura de línea · ${selectedTypography.lineHeight.toFixed(2)}`}
                      >
                        <input
                          type="range"
                          min="0.8"
                          max="1.5"
                          step="0.05"
                          value={selectedTypography.lineHeight}
                          onChange={(e) =>
                            update(selected.id, {
                              styles: {
                                ...selected.styles,
                                typography: {
                                  ...selectedTypography,
                                  lineHeight: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full accent-violet-500"
                        />
                      </Field>
                      <Field
                        label={`Espaciado de letras · ${selectedTypography.letterSpacing.toFixed(2)}em`}
                      >
                        <input
                          type="range"
                          min="-0.08"
                          max="0.08"
                          step="0.01"
                          value={selectedTypography.letterSpacing}
                          onChange={(e) =>
                            update(selected.id, {
                              styles: {
                                ...selected.styles,
                                typography: {
                                  ...selectedTypography,
                                  letterSpacing: Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="w-full accent-violet-500"
                        />
                      </Field>
                      <details className="group mt-5 rounded-2xl border border-white/10 bg-white/[.025] p-3">
                        <summary className="cursor-pointer list-none text-xs font-semibold text-white/70">
                          Tipografía de todo el sitio
                          <span className="float-right text-white/30 transition group-open:rotate-180">
                            <ChevronDown size={14} />
                          </span>
                        </summary>
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <FontPicker
                            label="Títulos globales"
                            value={globalTypography.headingFont}
                            onChange={(headingFont) =>
                              updateSite({
                                theme: {
                                  ...schema.site.theme,
                                  typography: {
                                    ...globalTypography,
                                    headingFont:
                                      headingFont ??
                                      globalTypography.headingFont,
                                  },
                                },
                              })
                            }
                          />
                          <FontPicker
                            label="Textos globales"
                            value={globalTypography.bodyFont}
                            onChange={(bodyFont) =>
                              updateSite({
                                theme: {
                                  ...schema.site.theme,
                                  typography: {
                                    ...globalTypography,
                                    bodyFont:
                                      bodyFont ?? globalTypography.bodyFont,
                                  },
                                },
                              })
                            }
                          />
                        </div>
                      </details>
                    </div>
                  </>
                )}
                {rightTab === "animation" && (
                  <>
                    <Field label="Preset">
                      <select
                        value={selected.animation.preset}
                        onChange={(e) =>
                          update(selected.id, {
                            animation: {
                              ...selected.animation,
                              preset: e.target.value as AnimationPreset,
                            },
                          })
                        }
                        className="editor-input"
                      >
                        {presets.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field
                      label={`Intensidad · ${selected.animation.intensity}%`}
                    >
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={selected.animation.intensity}
                        onChange={(e) =>
                          update(selected.id, {
                            animation: {
                              ...selected.animation,
                              intensity: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-violet-500"
                      />
                    </Field>
                    <label className="flex min-h-12 items-center justify-between rounded-xl border border-white/[.08] px-3 text-xs">
                      <span>Vincular al scroll (scrub)</span>
                      <input
                        type="checkbox"
                        checked={selected.animation.scrub}
                        onChange={(e) =>
                          update(selected.id, {
                            animation: {
                              ...selected.animation,
                              scrub: e.target.checked,
                            },
                          })
                        }
                        className="size-4 accent-violet-500"
                      />
                    </label>
                    <div className="rounded-xl border border-violet-400/20 bg-violet-400/[.06] p-3 text-xs leading-relaxed text-white/50">
                      La animación se ejecuta en la vista previa y en el sitio
                      publicado. La reducción de movimiento siempre tiene
                      prioridad.
                    </div>
                  </>
                )}
                {rightTab === "responsive" && (
                  <>
                    <label className="flex min-h-12 items-center justify-between rounded-xl border border-white/[.08] px-3 text-xs">
                      <span>Ocultar en móvil</span>
                      <input
                        type="checkbox"
                        checked={selected.responsive.hideMobile}
                        onChange={(e) =>
                          update(selected.id, {
                            responsive: {
                              ...selected.responsive,
                              hideMobile: e.target.checked,
                            },
                          })
                        }
                        className="size-4 accent-violet-500"
                      />
                    </label>
                    <Field
                      label={`Padding móvil · ${selected.responsive.mobilePadding}px`}
                    >
                      <input
                        type="range"
                        min="20"
                        max="96"
                        value={selected.responsive.mobilePadding}
                        onChange={(e) =>
                          update(selected.id, {
                            responsive: {
                              ...selected.responsive,
                              mobilePadding: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full accent-violet-500"
                      />
                    </Field>
                    <p className="text-xs leading-relaxed text-white/35">
                      Usa los controles superiores para revisar escritorio,
                      tablet y móvil antes de publicar.
                    </p>
                  </>
                )}
                <div className="border-t border-white/10 pt-4 space-y-3">
                  <button
                    onClick={() => void handleManualSave()}
                    disabled={saving === "saving"}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#8b5cf6] to-[#c084fc] text-xs font-semibold text-white shadow-md hover:brightness-110 transition disabled:opacity-50"
                  >
                    {saving === "saving" ? (
                      <LoaderCircle size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    <span>{saving === "saving" ? "Guardando..." : "Guardar cambios"}</span>
                  </button>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => duplicate(selected.id)}
                      className="grid min-h-11 place-items-center rounded-xl border border-white/[.08] text-white/40 hover:text-white"
                      aria-label="Duplicar"
                    >
                      <Copy size={16} />
                    </button>
                    <button
                      onClick={() =>
                        update(selected.id, { locked: !selected.locked })
                      }
                      className={cn(
                        "grid min-h-11 place-items-center rounded-xl border border-white/[.08] text-white/40 hover:text-white",
                        selected.locked && "border-amber-400/30 text-amber-300",
                      )}
                      aria-label={selected.locked ? "Desbloquear" : "Bloquear"}
                    >
                      <Lock size={16} />
                    </button>
                    <button
                      onClick={() => remove(selected.id)}
                      className="grid min-h-11 place-items-center rounded-xl border border-rose-400/15 text-rose-300/60 hover:bg-rose-400/10 hover:text-rose-300"
                      aria-label="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>
      </div>
      {preview && (
        <div className="fixed inset-0 z-[100] overflow-y-auto bg-black">
          <div className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/10 bg-black/80 px-4 backdrop-blur">
            <span className="text-xs text-white/45">
              Vista previa · {schema.site.name} / {currentPage.name}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={publishing}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/10 px-3 text-xs disabled:opacity-50"
                onClick={() => void publish()}
              >
                {publishing ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <Rocket size={14} />
                )}
                Publicar
              </button>
              <button
                aria-label="Cerrar vista previa"
                onClick={() => setPreview(false)}
                className="grid size-10 place-items-center rounded-lg hover:bg-white/10"
              >
                <X />
              </button>
            </div>
          </div>
          <SiteRenderer schema={schema} pageSlug={currentPage.slug} />
        </div>
      )}
      <SeoModal isOpen={seoModalOpen} onClose={() => setSeoModalOpen(false)} />
      <SiteThumbnailGenerator isOpen={thumbnailModalOpen} onClose={() => setThumbnailModalOpen(false)} />
    </main>
  );
}
function FontPicker({
  label,
  value,
  allowGlobal = false,
  onChange,
}: {
  label: string;
  value?: FontChoice;
  allowGlobal?: boolean;
  onChange: (value: FontChoice | undefined) => void;
}) {
  return (
    <fieldset className="mb-5">
      <legend className="mb-2 text-[11px] font-medium text-white/55">
        {label}
      </legend>
      <div className="grid grid-cols-2 gap-2">
        {allowGlobal && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            aria-pressed={!value}
            className={cn(
              "font-choice col-span-2 min-h-11 text-left",
              !value && "font-choice-active",
            )}
          >
            <span className="text-xs font-semibold">Heredar fuente global</span>
            <span className="text-[10px] text-white/35">
              Mantiene consistencia en todo el sitio
            </span>
          </button>
        )}
        {fontOptions.map(([font, name]) => (
          <button
            type="button"
            key={font}
            onClick={() => onChange(font)}
            aria-pressed={value === font}
            className={cn(
              "font-choice min-h-[72px] text-left",
              value === font && "font-choice-active",
            )}
          >
            <span
              className="text-2xl leading-none"
              style={{ fontFamily: fontPreviewStyles[font] }}
            >
              Ag
            </span>
            <span className="mt-2 block truncate text-[10px] text-white/50">
              {name.split(" · ")[0]}
            </span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-medium text-white/45">
        {label}
      </span>
      {children}
    </label>
  );
}
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <span className="flex min-h-11 items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.025] px-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-7 rounded bg-transparent"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none"
        />
      </span>
    </Field>
  );
}

function PageControls() {
  const schema = useEditorStore((state) => state.schema);
  const activePageId = useEditorStore((state) => state.activePageId);
  const setActivePage = useEditorStore((state) => state.setActivePage);
  const addPage = useEditorStore((state) => state.addPage);
  const updatePage = useEditorStore((state) => state.updatePage);
  const duplicatePage = useEditorStore((state) => state.duplicatePage);
  const removePage = useEditorStore((state) => state.removePage);
  const page =
    schema.pages.find((item) => item.id === activePageId) ?? schema.pages[0];
  const isHome = schema.pages[0]?.id === page.id;
  return (
    <div className="border-b border-white/[.08] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-white/40">
          <FileText size={13} />
          Páginas · {schema.pages.length}
        </span>
        <button
          onClick={addPage}
          className="grid size-9 place-items-center rounded-lg bg-violet-400/10 text-violet-200 hover:bg-violet-400/20"
          aria-label="Añadir página"
        >
          <Plus size={15} />
        </button>
      </div>
      <select
        value={activePageId}
        onChange={(event) => setActivePage(event.target.value)}
        className="editor-input"
      >
        <option value="" disabled>
          Selecciona una página
        </option>
        {schema.pages.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <div className="mt-2 grid grid-cols-[1fr_auto_auto] gap-2">
        <label className="min-w-0">
          <span className="sr-only">Nombre de la página</span>
          <input
            value={page.name}
            onChange={(event) =>
              updatePage(page.id, { name: event.target.value })
            }
            className="editor-input"
          />
        </label>
        <button
          onClick={() => duplicatePage(page.id)}
          className="grid size-11 place-items-center rounded-xl border border-white/10 text-white/45 hover:text-white"
          aria-label="Duplicar página"
        >
          <Copy size={15} />
        </button>
        <button
          disabled={isHome || schema.pages.length === 1}
          onClick={() => removePage(page.id)}
          className="grid size-11 place-items-center rounded-xl border border-rose-400/15 text-rose-300/60 hover:bg-rose-400/10 disabled:cursor-not-allowed disabled:opacity-20"
          aria-label="Eliminar página"
        >
          <Trash2 size={15} />
        </button>
      </div>
      {!isHome && (
        <label className="mt-2 block text-[10px] text-white/35">
          Ruta pública
          <input
            value={page.slug}
            onChange={(event) =>
              updatePage(page.id, { slug: event.target.value })
            }
            className="editor-input mt-1"
          />
        </label>
      )}
    </div>
  );
}

function MediaFields({
  section,
  update,
}: {
  section: SiteSection;
  update: (id: string, patch: Partial<SiteSection>) => void;
}) {
  const media = section.content.media ?? [];
  const change = (index: number, key: "url" | "alt", value: string) => {
    const next = [...media];
    const current = next[index] ?? {
      url: "https://",
      publicId: `media-${index + 1}`,
      type: "image" as const,
      alt: "",
    };
    next[index] = {
      ...current,
      [key]: value,
      publicId:
        key === "url"
          ? value.split("/").pop()?.split(".")[0] || current.publicId
          : current.publicId,
    };
    update(section.id, { content: { ...section.content, media: next } });
  };
  const add = () =>
    update(section.id, {
      content: {
        ...section.content,
        media: [
          ...media,
          {
            url: "https://res.cloudinary.com/",
            publicId: `media-${media.length + 1}`,
            type: "image",
            alt: "",
          },
        ],
      },
    });
  const removeAt = (index: number) =>
    update(section.id, {
      content: {
        ...section.content,
        media: media.filter((_, position) => position !== index),
      },
    });
  return (
    <div className="space-y-3 border-t border-white/[.08] pt-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-medium text-white/55">
            Fotos de Cloudinary
          </p>
          <p className="mt-1 text-[10px] leading-relaxed text-white/30">
            Copia un enlace desde tu biblioteca.
          </p>
        </div>
        <Link
          href="/account/media"
          target="_blank"
          className="grid size-10 place-items-center rounded-lg border border-white/10 text-violet-300 hover:bg-white/5"
          aria-label="Abrir biblioteca de medios"
        >
          <ExternalLink size={15} />
        </Link>
      </div>
      {media.map((item, index) => (
        <div
          key={`${item.publicId}-${index}`}
          className="rounded-xl border border-white/[.08] bg-white/[.025] p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-2 text-[10px] font-semibold text-white/45">
              <ImageIcon size={13} />
              Imagen {index + 1}
            </span>
            <button
              onClick={() => removeAt(index)}
              className="grid size-8 place-items-center rounded-lg text-rose-300/70 hover:bg-rose-400/10"
              aria-label={`Quitar imagen ${index + 1}`}
            >
              <Trash2 size={13} />
            </button>
          </div>
          <label className="block text-[10px] text-white/35">
            Enlace
            <input
              type="url"
              value={item.url}
              onChange={(event) => change(index, "url", event.target.value)}
              className="editor-input mt-1"
            />
          </label>
          <label className="mt-2 block text-[10px] text-white/35">
            Texto alternativo
            <input
              value={item.alt}
              onChange={(event) => change(index, "alt", event.target.value)}
              className="editor-input mt-1"
            />
          </label>
        </div>
      ))}
      <button
        onClick={add}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-white/15 text-xs font-semibold text-white/55 hover:border-violet-400/40 hover:text-white"
      >
        <Plus size={15} />
        Añadir enlace
      </button>
    </div>
  );
}
