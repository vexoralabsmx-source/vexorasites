"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardCopy,
  ClipboardPaste,
  Columns3,
  Download,
  History,
  LayoutPanelTop,
  Link2,
  LoaderCircle,
  Play,
  Plus,
  RotateCcw,
  Settings2,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { siteSchema, type SiteSchema, type SiteSection } from "@/types/site";
import { useEditorStore } from "@/stores/editor-store";
import { makeId } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "history" | "structure" | "shell" | "motion" | "backup";
const fontOptions = [
  ["geist", "Geist · limpia"],
  ["manrope", "Manrope · editorial"],
  ["space-grotesk", "Space Grotesk · tecnológica"],
  ["cormorant", "Cormorant · lujo"],
  ["ibm-plex-mono", "IBM Plex Mono · técnica"],
] as const;
type RemoteVersion = {
  id: string;
  label: string;
  createdAt: string;
  schema: SiteSchema;
};

export function AdvancedEditorTools({
  projectId,
  remoteProject,
  onPreview,
}: {
  projectId: string;
  remoteProject: boolean;
  onPreview: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("history");
  const [versions, setVersions] = useState<RemoteVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const schema = useEditorStore((s) => s.schema);
  const activePageId = useEditorStore((s) => s.activePageId);
  const selectedId = useEditorStore((s) => s.selectedId);
  const past = useEditorStore((s) => s.past);
  const clipboard = useEditorStore((s) => s.clipboard);
  const update = useEditorStore((s) => s.updateSection);
  const updateSite = useEditorStore((s) => s.updateSite);
  const copyBlock = useEditorStore((s) => s.copyBlock);
  const pasteBlock = useEditorStore((s) => s.pasteBlock);
  const restoreSnapshot = useEditorStore((s) => s.restoreSnapshot);
  const selected = useMemo(
    () =>
      schema.pages
        .find((p) => p.id === activePageId)
        ?.sections.find((s) => s.id === selectedId) ?? null,
    [schema, activePageId, selectedId],
  );
  useEffect(() => {
    if (!open || tab !== "history" || !remoteProject) return;
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/sites/${projectId}/versions`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("No disponible");
          return (await response.json()) as { versions: RemoteVersion[] };
        })
        .then((data) => setVersions(data.versions))
        .catch(() => toast.error("No se pudo cargar el historial remoto."))
        .finally(() => setLoading(false));
    }, 0);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [open, tab, projectId, remoteProject]);
  const restoreRemote = async (versionId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sites/${projectId}/versions`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ versionId }),
      });
      const data = (await response.json()) as {
        schema?: SiteSchema;
        error?: string;
      };
      if (!response.ok || !data.schema) throw new Error(data.error);
      restoreSnapshot(data.schema);
      toast.success("Versión restaurada");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "No fue posible restaurar.",
      );
    } finally {
      setLoading(false);
    }
  };
  const exportBackup = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          { exportedAt: new Date().toISOString(), schema },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${schema.site.slug}-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success("Backup descargado");
  };
  const importBackup = async (file: File) => {
    try {
      const raw = JSON.parse(await file.text()) as { schema?: unknown };
      const parsed = siteSchema.parse(raw.schema ?? raw);
      restoreSnapshot(parsed);
      toast.success("Backup restaurado", {
        description: "Revisa los cambios y guarda una nueva versión.",
      });
    } catch {
      toast.error("El archivo no es un backup válido de Vexora.");
    }
  };
  const patchElement = (
    id: string,
    patch: Partial<NonNullable<SiteSection["elements"]>[number]>,
  ) => {
    if (!selected) return;
    update(selected.id, {
      elements: (selected.elements ?? []).map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    });
  };
  const nav = schema.site.navigation ?? {
    enabled: true,
    logoText: schema.site.name,
    ctaLabel: "Contacto",
    ctaHref: "#contacto",
  };
  const footer = schema.site.footer ?? {
    enabled: true,
    headline: "Construyamos algo extraordinario.",
    copyright: "Todos los derechos reservados.",
    showLinks: true,
    layout: "split" as const,
    background: "#09090c",
    foreground: "#ffffff",
  };
  const siteTypography = schema.site.theme.typography ?? {
    headingFont: "geist" as const,
    bodyFont: "geist" as const,
    headingScale: 1,
    bodyScale: 1,
  };
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Abrir herramientas avanzadas"
        className="grid size-10 place-items-center rounded-lg text-white/45 hover:bg-white/5 hover:text-white"
      >
        <Settings2 size={17} />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[120] flex justify-end bg-black/65 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Herramientas avanzadas"
        >
          <button
            className="absolute inset-0 cursor-default"
            aria-label="Cerrar"
            onClick={() => setOpen(false)}
          />
          <aside className="relative z-10 h-full w-full max-w-[560px] overflow-y-auto border-l border-white/10 bg-[#0f0f15] shadow-2xl">
            <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-white/10 bg-[#0f0f15]/95 px-5 backdrop-blur">
              <div>
                <p className="text-sm font-semibold">Estudio avanzado</p>
                <p className="text-[11px] text-white/40">
                  Estructura, historial y movimiento
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="grid size-11 place-items-center rounded-xl hover:bg-white/5"
                aria-label="Cerrar herramientas"
              >
                <X size={18} />
              </button>
            </header>
            <nav
              className="grid grid-cols-5 gap-1 border-b border-white/10 p-2"
              aria-label="Herramientas avanzadas"
            >
              {(
                [
                  ["history", History, "Versiones"],
                  ["structure", Columns3, "Estructura"],
                  ["shell", LayoutPanelTop, "Sitio"],
                  ["motion", Play, "Motion"],
                  ["backup", Download, "Backups"],
                ] as const
              ).map(([value, Icon, label]) => (
                <button
                  key={value}
                  onClick={() => setTab(value)}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[10px] font-semibold",
                    tab === value
                      ? "bg-violet-500/15 text-violet-200"
                      : "text-white/35 hover:bg-white/5 hover:text-white",
                  )}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>
            <div className="p-5">
              {tab === "history" && (
                <section>
                  <PanelTitle
                    title="Historial visible"
                    text="Restaura cualquier versión guardada. La versión actual se conserva antes de restaurar."
                  />
                  {loading && (
                    <LoaderCircle className="mx-auto mt-10 animate-spin text-violet-300" />
                  )}
                  {!loading &&
                    remoteProject &&
                    versions.map((version) => (
                      <VersionRow
                        key={version.id}
                        title={version.label}
                        date={new Date(version.createdAt).toLocaleString(
                          "es-MX",
                        )}
                        onRestore={() => void restoreRemote(version.id)}
                      />
                    ))}
                  {!loading &&
                    !remoteProject &&
                    past
                      .slice()
                      .reverse()
                      .map((item, index) => (
                        <VersionRow
                          key={index}
                          title={`Cambio local ${past.length - index}`}
                          date={`${item.pages.length} páginas · ${item.pages.reduce((n, p) => n + p.sections.length, 0)} bloques`}
                          onRestore={() => {
                            restoreSnapshot(item);
                            toast.success("Estado local restaurado");
                          }}
                        />
                      ))}
                  {!loading && !versions.length && remoteProject && (
                    <Empty text="Aún no hay versiones manuales. Usa Ctrl/Cmd + S para crear la primera." />
                  )}
                  {!remoteProject && !past.length && (
                    <Empty text="Los cambios recientes aparecerán aquí en cuanto edites el sitio." />
                  )}
                </section>
              )}
              {tab === "structure" && (
                <section>
                  <PanelTitle
                    title="Bloques y elementos internos"
                    text="Copia un bloque, cambia de página y pégalo. Los contenedores aceptan elementos y columnas."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <ToolButton
                      icon={ClipboardCopy}
                      label="Copiar bloque"
                      disabled={!selected}
                      onClick={() => selected && copyBlock(selected.id)}
                    />
                    <ToolButton
                      icon={ClipboardPaste}
                      label={clipboard ? "Pegar bloque" : "Portapapeles vacío"}
                      disabled={!clipboard}
                      onClick={pasteBlock}
                    />
                  </div>
                  {selected && (
                    <div className="mt-7 space-y-5">
                      <Range
                        label={`Columnas · ${selected.layout?.columns ?? 1}`}
                        min={1}
                        max={4}
                        value={selected.layout?.columns ?? 1}
                        onChange={(columns) =>
                          update(selected.id, {
                            layout: {
                              columns,
                              gap: selected.layout?.gap ?? 24,
                              maxWidth: selected.layout?.maxWidth ?? 1280,
                            },
                          })
                        }
                      />
                      <Range
                        label={`Separación · ${selected.layout?.gap ?? 24}px`}
                        min={8}
                        max={64}
                        value={selected.layout?.gap ?? 24}
                        onChange={(gap) =>
                          update(selected.id, {
                            layout: {
                              columns: selected.layout?.columns ?? 1,
                              gap,
                              maxWidth: selected.layout?.maxWidth ?? 1280,
                            },
                          })
                        }
                      />
                      <Range
                        label={`Ancho del contenedor · ${selected.layout?.maxWidth ?? 1280}px`}
                        min={640}
                        max={1600}
                        step={40}
                        value={selected.layout?.maxWidth ?? 1280}
                        onChange={(maxWidth) =>
                          update(selected.id, {
                            layout: {
                              columns: selected.layout?.columns ?? 1,
                              gap: selected.layout?.gap ?? 24,
                              maxWidth,
                            },
                          })
                        }
                      />
                      <div className="border-t border-white/10 pt-5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold">
                            Elementos internos
                          </p>
                          <button
                            onClick={() =>
                              update(selected.id, {
                                elements: [
                                  ...(selected.elements ?? []),
                                  {
                                    id: makeId("element"),
                                    type: "text",
                                    text: "Nuevo elemento",
                                    href: "",
                                    imageUrl: "",
                                  },
                                ],
                              })
                            }
                            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/5 px-3 text-xs"
                          >
                            <Plus size={14} />
                            Añadir
                          </button>
                        </div>
                        <div className="mt-3 space-y-3">
                          {(selected.elements ?? []).map((element) => (
                            <div
                              key={element.id}
                              className="rounded-xl border border-white/10 p-3"
                            >
                              <div className="flex gap-2">
                                <select
                                  className="editor-input"
                                  value={element.type}
                                  onChange={(e) =>
                                    patchElement(element.id, {
                                      type: e.target
                                        .value as typeof element.type,
                                    })
                                  }
                                >
                                  <option value="heading">Título</option>
                                  <option value="text">Texto</option>
                                  <option value="button">Botón</option>
                                  <option value="image">Imagen</option>
                                </select>
                                <button
                                  aria-label="Eliminar elemento"
                                  onClick={() =>
                                    update(selected.id, {
                                      elements: selected.elements?.filter(
                                        (item) => item.id !== element.id,
                                      ),
                                    })
                                  }
                                  className="grid size-11 shrink-0 place-items-center rounded-xl text-rose-300 hover:bg-rose-400/10"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                              <input
                                className="editor-input mt-2"
                                aria-label="Contenido del elemento"
                                value={element.text}
                                onChange={(e) =>
                                  patchElement(element.id, {
                                    text: e.target.value,
                                  })
                                }
                              />
                              {element.type === "button" && (
                                <input
                                  className="editor-input mt-2"
                                  aria-label="Enlace del botón"
                                  value={element.href}
                                  onChange={(e) =>
                                    patchElement(element.id, {
                                      href: e.target.value,
                                    })
                                  }
                                  placeholder="/contacto o https://..."
                                />
                              )}
                              {element.type === "image" && (
                                <input
                                  className="editor-input mt-2"
                                  aria-label="URL de la imagen"
                                  value={element.imageUrl}
                                  onChange={(e) =>
                                    patchElement(element.id, {
                                      imageUrl: e.target.value,
                                    })
                                  }
                                  placeholder="URL de Cloudinary"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              )}
              {tab === "shell" && (
                <section>
                  <PanelTitle
                    title="Identidad, navegación y footer"
                    text="Configura tipografía, encabezado y pie de página para todo el sitio."
                  />
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                    Tipografía global
                  </p>
                  <FieldSelect
                    label="Fuente de títulos"
                    value={siteTypography.headingFont}
                    options={[...fontOptions]}
                    onChange={(headingFont) =>
                      updateSite({
                        theme: {
                          ...schema.site.theme,
                          typography: {
                            ...siteTypography,
                            headingFont:
                              headingFont as typeof siteTypography.headingFont,
                          },
                        },
                      })
                    }
                  />
                  <FieldSelect
                    label="Fuente de textos"
                    value={siteTypography.bodyFont}
                    options={[...fontOptions]}
                    onChange={(bodyFont) =>
                      updateSite({
                        theme: {
                          ...schema.site.theme,
                          typography: {
                            ...siteTypography,
                            bodyFont:
                              bodyFont as typeof siteTypography.bodyFont,
                          },
                        },
                      })
                    }
                  />
                  <Range
                    label={`Escala de títulos · ${Math.round(siteTypography.headingScale * 100)}%`}
                    min={0.75}
                    max={1.25}
                    step={0.05}
                    value={siteTypography.headingScale}
                    onChange={(headingScale) =>
                      updateSite({
                        theme: {
                          ...schema.site.theme,
                          typography: { ...siteTypography, headingScale },
                        },
                      })
                    }
                  />
                  <Range
                    label={`Escala de textos · ${Math.round(siteTypography.bodyScale * 100)}%`}
                    min={0.85}
                    max={1.2}
                    step={0.05}
                    value={siteTypography.bodyScale}
                    onChange={(bodyScale) =>
                      updateSite({
                        theme: {
                          ...schema.site.theme,
                          typography: { ...siteTypography, bodyScale },
                        },
                      })
                    }
                  />
                  <div className="my-6 border-t border-white/10" />
                  <p className="mb-4 text-[10px] font-semibold uppercase tracking-wider text-white/35">
                    Encabezado
                  </p>
                  <Toggle
                    label="Mostrar encabezado"
                    checked={nav.enabled}
                    onChange={(enabled) =>
                      updateSite({ navigation: { ...nav, enabled } })
                    }
                  />
                  <Field
                    label="Nombre o logo de texto"
                    value={nav.logoText}
                    onChange={(logoText) =>
                      updateSite({ navigation: { ...nav, logoText } })
                    }
                  />
                  <Field
                    label="CTA del encabezado"
                    value={nav.ctaLabel}
                    onChange={(ctaLabel) =>
                      updateSite({ navigation: { ...nav, ctaLabel } })
                    }
                  />
                  <Field
                    label="Enlace del CTA"
                    value={nav.ctaHref}
                    onChange={(ctaHref) =>
                      updateSite({ navigation: { ...nav, ctaHref } })
                    }
                  />
                  <div className="my-6 border-t border-white/10" />
                  <Toggle
                    label="Mostrar footer"
                    checked={footer.enabled}
                    onChange={(enabled) =>
                      updateSite({ footer: { ...footer, enabled } })
                    }
                  />
                  <Toggle
                    label="Mostrar enlaces de navegación"
                    checked={footer.showLinks}
                    onChange={(showLinks) =>
                      updateSite({ footer: { ...footer, showLinks } })
                    }
                  />
                  <FieldSelect
                    label="Composición del footer"
                    value={footer.layout}
                    options={[
                      ["split", "Dos columnas"],
                      ["stacked", "Apilado"],
                      ["centered", "Centrado"],
                    ]}
                    onChange={(layout) =>
                      updateSite({
                        footer: {
                          ...footer,
                          layout: layout as typeof footer.layout,
                        },
                      })
                    }
                  />
                  <Field
                    label="Frase del footer"
                    value={footer.headline}
                    onChange={(headline) =>
                      updateSite({ footer: { ...footer, headline } })
                    }
                  />
                  <Field
                    label="Copyright"
                    value={footer.copyright}
                    onChange={(copyright) =>
                      updateSite({ footer: { ...footer, copyright } })
                    }
                  />
                  <Field
                    label="Color de fondo"
                    value={footer.background}
                    onChange={(background) =>
                      updateSite({ footer: { ...footer, background } })
                    }
                  />
                  <Field
                    label="Color de texto"
                    value={footer.foreground}
                    onChange={(foreground) =>
                      updateSite({ footer: { ...footer, foreground } })
                    }
                  />
                </section>
              )}
              {tab === "motion" && (
                <section>
                  <PanelTitle
                    title="Motion Composer"
                    text="Crea parallax, storytelling fijado y secuencias controladas por el scroll con ScrollTrigger."
                  />
                  {selected ? (
                    <div className="space-y-5">
                      <FieldSelect
                        label="Movimiento"
                        value={selected.animation.preset}
                        options={[
                          ["none", "Sin movimiento"],
                          ["fade-up", "Entrada vertical"],
                          ["blur-reveal", "Desenfoque"],
                          ["slide-left", "Desde la izquierda"],
                          ["zoom-reveal", "Zoom sutil"],
                          ["parallax", "Parallax"],
                          ["scroll-driven", "Scroll driven"],
                          ["sticky-story", "Storytelling fijado"],
                          ["horizontal-journey", "Journey horizontal"],
                        ]}
                        onChange={(preset) =>
                          update(selected.id, {
                            animation: {
                              ...selected.animation,
                              preset:
                                preset as SiteSection["animation"]["preset"],
                            },
                          })
                        }
                      />
                      <Range
                        label={`Intensidad · ${selected.animation.intensity}%`}
                        min={0}
                        max={100}
                        value={selected.animation.intensity}
                        onChange={(intensity) =>
                          update(selected.id, {
                            animation: { ...selected.animation, intensity },
                          })
                        }
                      />
                      <Range
                        label={`Secuencia · ${Math.round((selected.animation.stagger ?? 0.08) * 100) / 100}s`}
                        min={0}
                        max={0.3}
                        step={0.01}
                        value={selected.animation.stagger ?? 0.08}
                        onChange={(stagger) =>
                          update(selected.id, {
                            animation: { ...selected.animation, stagger },
                          })
                        }
                      />
                      <FieldSelect
                        label="Inicio del efecto"
                        value={selected.animation.start ?? "top 75%"}
                        options={[
                          ["top 90%", "Al entrar en pantalla"],
                          ["top 75%", "Entrada natural"],
                          ["top 60%", "Entrada tardía"],
                          ["top top", "Al tocar el borde superior"],
                        ]}
                        onChange={(start) =>
                          update(selected.id, {
                            animation: {
                              ...selected.animation,
                              start: start as NonNullable<
                                SiteSection["animation"]["start"]
                              >,
                            },
                          })
                        }
                      />
                      <FieldSelect
                        label="Final del efecto"
                        value={selected.animation.end ?? "bottom top"}
                        options={[
                          ["bottom 20%", "Antes de salir"],
                          ["bottom top", "Al salir"],
                          ["+=100%", "Una pantalla"],
                          ["+=180%", "Storytelling largo"],
                        ]}
                        onChange={(end) =>
                          update(selected.id, {
                            animation: {
                              ...selected.animation,
                              end: end as NonNullable<
                                SiteSection["animation"]["end"]
                              >,
                            },
                          })
                        }
                      />
                      <Toggle
                        label="Controlar progreso con scroll"
                        checked={selected.animation.scrub}
                        onChange={(scrub) =>
                          update(selected.id, {
                            animation: { ...selected.animation, scrub },
                          })
                        }
                      />
                      <Toggle
                        label="Fijar bloque durante el efecto"
                        checked={selected.animation.pin ?? false}
                        onChange={(pin) =>
                          update(selected.id, {
                            animation: { ...selected.animation, pin },
                          })
                        }
                      />
                      <Range
                        label={`Duración · ${(selected.animation.duration ?? 1).toFixed(2)}s`}
                        min={0.15}
                        max={3}
                        step={0.05}
                        value={selected.animation.duration ?? 1}
                        onChange={(duration) =>
                          update(selected.id, {
                            animation: { ...selected.animation, duration },
                          })
                        }
                      />
                      <Range
                        label={`Espera · ${(selected.animation.delay ?? 0).toFixed(2)}s`}
                        min={0}
                        max={2}
                        step={0.05}
                        value={selected.animation.delay ?? 0}
                        onChange={(delay) =>
                          update(selected.id, {
                            animation: { ...selected.animation, delay },
                          })
                        }
                      />
                      <FieldSelect
                        label="Curva"
                        value={selected.animation.easing ?? "power3.out"}
                        options={[
                          ["power2.out", "Suave"],
                          ["power3.out", "Premium"],
                          ["back.out", "Elástica"],
                          ["expo.out", "Cinemática"],
                        ]}
                        onChange={(easing) =>
                          update(selected.id, {
                            animation: {
                              ...selected.animation,
                              easing: easing as NonNullable<
                                SiteSection["animation"]["easing"]
                              >,
                            },
                          })
                        }
                      />
                      <button
                        onClick={() => {
                          setOpen(false);
                          onPreview();
                        }}
                        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-500 font-semibold hover:bg-violet-400"
                      >
                        <Play size={16} />
                        Probar movimiento y enlaces
                      </button>
                    </div>
                  ) : (
                    <Empty text="Selecciona un bloque para componer su movimiento." />
                  )}
                </section>
              )}
              {tab === "backup" && (
                <section>
                  <PanelTitle
                    title="Backups portátiles"
                    text="Descarga una copia completa y restáurala en cualquier momento. No incluye contraseñas ni credenciales."
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ToolButton
                      icon={Download}
                      label="Descargar backup"
                      onClick={exportBackup}
                    />
                    <ToolButton
                      icon={Upload}
                      label="Restaurar archivo"
                      onClick={() => inputRef.current?.click()}
                    />
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="application/json"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void importBackup(file);
                      e.target.value = "";
                    }}
                  />
                  <div className="mt-6 rounded-2xl border border-emerald-400/15 bg-emerald-400/[.05] p-4 text-sm text-emerald-100">
                    <p className="font-semibold">Protección activa</p>
                    <p className="mt-2 leading-relaxed text-emerald-100/60">
                      El autoguardado conserva el borrador. Los backups
                      descargables agregan una copia independiente para
                      recuperación ante errores.
                    </p>
                  </div>
                </section>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}

function PanelTitle({ title, text }: { title: string; text: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold tracking-[-.03em]">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-white/45">{text}</p>
    </div>
  );
}
function VersionRow({
  title,
  date,
  onRestore,
}: {
  title: string;
  date: string;
  onRestore: () => void;
}) {
  return (
    <div className="mb-2 flex items-center justify-between gap-4 rounded-xl border border-white/10 p-3">
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-[11px] text-white/35">{date}</p>
      </div>
      <button
        onClick={onRestore}
        className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-white/5 px-3 text-xs hover:bg-white/10"
      >
        <RotateCcw size={14} />
        Restaurar
      </button>
    </div>
  );
}
function Empty({ text }: { text: string }) {
  return (
    <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
      {text}
    </div>
  );
}
function ToolButton({
  icon: Icon,
  label,
  onClick,
  disabled = false,
}: {
  icon: typeof Link2;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="inline-flex min-h-14 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[.03] text-sm font-semibold hover:bg-white/[.07] disabled:cursor-not-allowed disabled:opacity-35"
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
function Range({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-white/50">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-500"
      />
    </label>
  );
}
function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-xs text-white/50">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="editor-input"
      />
    </label>
  );
}
function FieldSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-white/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="editor-input"
      >
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="mt-4 flex min-h-12 items-center justify-between rounded-xl border border-white/10 px-3 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 accent-violet-500"
      />
    </label>
  );
}
