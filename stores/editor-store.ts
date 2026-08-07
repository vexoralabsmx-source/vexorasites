"use client";

import { create } from "zustand";
import type {
  DeviceMode,
  SitePage,
  SiteSchema,
  SiteSection,
} from "@/types/site";
import { cloneTemplate } from "@/lib/templates";
import { makeId } from "@/lib/utils";

interface EditorState {
  schema: SiteSchema;
  activePageId: string;
  selectedId: string | null;
  device: DeviceMode;
  saving: "saved" | "saving" | "offline" | "error";
  past: SiteSchema[];
  future: SiteSchema[];
  clipboard: SiteSection | null;
  setSchema: (schema: SiteSchema) => void;
  setActivePage: (id: string) => void;
  addPage: () => void;
  updatePage: (
    id: string,
    patch: Partial<Pick<SitePage, "name" | "slug">>,
  ) => void;
  duplicatePage: (id: string) => void;
  removePage: (id: string) => void;
  select: (id: string | null) => void;
  setDevice: (device: DeviceMode) => void;
  updateSection: (id: string, patch: Partial<SiteSection>) => void;
  reorder: (activeId: string, overId: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  addBlock: (type: SiteSection["type"]) => void;
  copyBlock: (id: string) => void;
  pasteBlock: () => void;
  restoreSnapshot: (schema: SiteSchema) => void;
  updateSite: (patch: Partial<SiteSchema["site"]>) => void;
  undo: () => void;
  redo: () => void;
  markPublished: () => void;
}

const initial = cloneTemplate("orbital-labs", "Orbital Studio");
const snapshot = <T>(value: T): T => structuredClone(value);
const pageFor = (schema: SiteSchema, id: string) =>
  schema.pages.find((page) => page.id === id) ?? schema.pages[0];
const history = (state: EditorState) => ({
  past: [...state.past.slice(-29), snapshot(state.schema)],
  future: [] as SiteSchema[],
  saving: "saving" as const,
});
const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "") || "pagina";

function starterSection(): SiteSection {
  return {
    id: makeId("hero"),
    type: "hero",
    variant: "hero-01",
    content: {
      eyebrow: "Nueva página",
      title: "Una página con una idea clara.",
      body: "Define su contenido desde el panel derecho.",
      cta: "Comenzar",
    },
    styles: {
      background: "#0b0b11",
      foreground: "#f7f4ef",
      accent: "#8b5cf6",
      align: "left",
      padding: 104,
    },
    responsive: { hideMobile: false, mobilePadding: 48 },
    animation: { preset: "fade-up", intensity: 50, scrub: false },
    locked: false,
  };
}

export const useEditorStore = create<EditorState>((set) => ({
  schema: initial,
  activePageId: initial.pages[0].id,
  selectedId: initial.pages[0].sections[0].id,
  device: "desktop",
  saving: "saved",
  past: [],
  future: [],
  clipboard: null,
  setSchema: (schema) =>
    set({
      schema: snapshot(schema),
      activePageId: schema.pages[0]?.id ?? "home",
      selectedId: schema.pages[0]?.sections[0]?.id ?? null,
      past: [],
      future: [],
      saving: "saved",
    }),
  setActivePage: (activePageId) =>
    set((state) => ({
      activePageId,
      selectedId: pageFor(state.schema, activePageId)?.sections[0]?.id ?? null,
    })),
  addPage: () =>
    set((state) => {
      const next = snapshot(state.schema);
      const index = next.pages.length + 1;
      const name = `Página ${index}`;
      const page = {
        id: makeId("page"),
        name,
        slug: `${slugify(name)}-${index}`,
        sections: [starterSection()],
      };
      next.pages.push(page);
      return {
        schema: next,
        activePageId: page.id,
        selectedId: page.sections[0].id,
        ...history(state),
      };
    }),
  updatePage: (id, patch) =>
    set((state) => {
      const next = snapshot(state.schema);
      const page = pageFor(next, id);
      if (!page) return state;
      if (patch.name !== undefined) page.name = patch.name;
      if (patch.slug !== undefined && page !== next.pages[0])
        page.slug = slugify(patch.slug);
      return { schema: next, ...history(state) };
    }),
  duplicatePage: (id) =>
    set((state) => {
      const next = snapshot(state.schema);
      const source = pageFor(next, id);
      if (!source) return state;
      const copy = snapshot(source);
      copy.id = makeId("page");
      copy.name = `${source.name} copia`;
      copy.slug = `${slugify(source.slug || source.name)}-copia`;
      copy.sections = copy.sections.map((section) => ({
        ...section,
        id: makeId(section.type),
      }));
      next.pages.push(copy);
      return {
        schema: next,
        activePageId: copy.id,
        selectedId: copy.sections[0]?.id ?? null,
        ...history(state),
      };
    }),
  removePage: (id) =>
    set((state) => {
      if (state.schema.pages.length === 1 || state.schema.pages[0].id === id)
        return state;
      const next = snapshot(state.schema);
      next.pages = next.pages.filter((page) => page.id !== id);
      const active = next.pages[0];
      return {
        schema: next,
        activePageId: active.id,
        selectedId: active.sections[0]?.id ?? null,
        ...history(state),
      };
    }),
  select: (selectedId) => set({ selectedId }),
  setDevice: (device) => set({ device }),
  updateSection: (id, patch) =>
    set((state) => {
      const next = snapshot(state.schema);
      const current = pageFor(next, state.activePageId)?.sections.find(
        (item) => item.id === id,
      );
      if (current) Object.assign(current, patch);
      next.site.status =
        next.site.status === "published" ? "changes" : next.site.status;
      return { schema: next, ...history(state) };
    }),
  reorder: (activeId, overId) =>
    set((state) => {
      const next = snapshot(state.schema);
      const list = pageFor(next, state.activePageId).sections;
      const from = list.findIndex((item) => item.id === activeId);
      const to = list.findIndex((item) => item.id === overId);
      if (from < 0 || to < 0 || from === to) return state;
      const [moved] = list.splice(from, 1);
      list.splice(to, 0, moved);
      return { schema: next, ...history(state) };
    }),
  move: (id, direction) =>
    set((state) => {
      const list = pageFor(state.schema, state.activePageId).sections;
      const index = list.findIndex((item) => item.id === id);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= list.length) return state;
      const next = snapshot(state.schema);
      const nextList = pageFor(next, state.activePageId).sections;
      [nextList[index], nextList[target]] = [nextList[target], nextList[index]];
      return { schema: next, ...history(state) };
    }),
  duplicate: (id) =>
    set((state) => {
      const next = snapshot(state.schema);
      const list = pageFor(next, state.activePageId).sections;
      const index = list.findIndex((item) => item.id === id);
      if (index < 0) return state;
      const copy = snapshot(list[index]);
      copy.id = makeId(copy.type);
      copy.content.title = `${copy.content.title} — copia`;
      list.splice(index + 1, 0, copy);
      return { schema: next, selectedId: copy.id, ...history(state) };
    }),
  remove: (id) =>
    set((state) => {
      const current = pageFor(state.schema, state.activePageId);
      if (current.sections.length <= 1) return state;
      const next = snapshot(state.schema);
      const page = pageFor(next, state.activePageId);
      page.sections = page.sections.filter((item) => item.id !== id);
      return {
        schema: next,
        selectedId: page.sections[0]?.id ?? null,
        ...history(state),
      };
    }),
  addBlock: (type) =>
    set((state) => {
      const next = snapshot(state.schema);
      const block: SiteSection = {
        id: makeId(type),
        type,
        variant: `${type}-01`,
        content: {
          title:
            type === "cta"
              ? "Convierte una idea en acción."
              : "Un nuevo capítulo",
          body: "Edita este contenido desde el panel de la derecha.",
          cta: type === "cta" ? "Comenzar" : undefined,
        },
        styles: {
          background: "#11111a",
          foreground: "#f5f2ff",
          accent: "#8b5cf6",
          align: "left",
          padding: 88,
        },
        responsive: { hideMobile: false, mobilePadding: 48 },
        animation: { preset: "fade-up", intensity: 50, scrub: false },
        locked: false,
      };
      pageFor(next, state.activePageId).sections.push(block);
      return { schema: next, selectedId: block.id, ...history(state) };
    }),
  copyBlock: (id) =>
    set((state) => {
      const section = pageFor(state.schema, state.activePageId)?.sections.find(
        (item) => item.id === id,
      );
      return section ? { clipboard: snapshot(section) } : state;
    }),
  pasteBlock: () =>
    set((state) => {
      if (!state.clipboard) return state;
      const next = snapshot(state.schema);
      const copy = snapshot(state.clipboard);
      copy.id = makeId(copy.type);
      pageFor(next, state.activePageId).sections.push(copy);
      return { schema: next, selectedId: copy.id, ...history(state) };
    }),
  restoreSnapshot: (schema) =>
    set((state) => ({
      schema: snapshot(schema),
      activePageId: schema.pages[0]?.id ?? state.activePageId,
      selectedId: schema.pages[0]?.sections[0]?.id ?? null,
      ...history(state),
    })),
  updateSite: (patch) =>
    set((state) => ({
      schema: {
        ...snapshot(state.schema),
        site: {
          ...state.schema.site,
          ...patch,
          status:
            state.schema.site.status === "published"
              ? "changes"
              : state.schema.site.status,
        },
      },
      ...history(state),
    })),
  undo: () =>
    set((state) => {
      const previous = state.past.at(-1);
      if (!previous) return state;
      const activePageId = previous.pages.some(
        (page) => page.id === state.activePageId,
      )
        ? state.activePageId
        : previous.pages[0].id;
      return {
        schema: snapshot(previous),
        activePageId,
        selectedId: pageFor(previous, activePageId).sections[0]?.id ?? null,
        past: state.past.slice(0, -1),
        future: [snapshot(state.schema), ...state.future].slice(0, 30),
        saving: "saving",
      };
    }),
  redo: () =>
    set((state) => {
      const next = state.future[0];
      if (!next) return state;
      const activePageId = next.pages.some(
        (page) => page.id === state.activePageId,
      )
        ? state.activePageId
        : next.pages[0].id;
      return {
        schema: snapshot(next),
        activePageId,
        selectedId: pageFor(next, activePageId).sections[0]?.id ?? null,
        past: [...state.past, snapshot(state.schema)].slice(-30),
        future: state.future.slice(1),
        saving: "saving",
      };
    }),
  markPublished: () =>
    set((state) => ({
      schema: {
        ...state.schema,
        site: { ...state.schema.site, status: "published" },
      },
      saving: "saved",
    })),
}));
