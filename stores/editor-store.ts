"use client";

import { create } from "zustand";
import type { DeviceMode, SiteSchema, SiteSection } from "@/types/site";
import { cloneTemplate } from "@/lib/templates";
import { makeId } from "@/lib/utils";

interface EditorState {
  schema: SiteSchema;
  selectedId: string | null;
  device: DeviceMode;
  saving: "saved" | "saving" | "offline" | "error";
  past: SiteSchema[];
  future: SiteSchema[];
  setSchema: (schema: SiteSchema) => void;
  select: (id: string | null) => void;
  setDevice: (device: DeviceMode) => void;
  updateSection: (id: string, patch: Partial<SiteSection>) => void;
  reorder: (activeId: string, overId: string) => void;
  move: (id: string, direction: -1 | 1) => void;
  duplicate: (id: string) => void;
  remove: (id: string) => void;
  addBlock: (type: SiteSection["type"]) => void;
  undo: () => void;
  redo: () => void;
  markPublished: () => void;
}

const initial = cloneTemplate("orbital-labs", "Orbital Studio");
const snapshot = <T,>(value: T): T => structuredClone(value);

export const useEditorStore = create<EditorState>((set) => ({
  schema: initial, selectedId: initial.pages[0].sections[0].id, device: "desktop", saving: "saved", past: [], future: [],
  setSchema: (schema) => set({ schema: snapshot(schema), selectedId: schema.pages[0]?.sections[0]?.id ?? null, past: [], future: [], saving: "saved" }),
  select: (selectedId) => set({ selectedId }),
  setDevice: (device) => set({ device }),
  updateSection: (id, patch) => set((state) => { const next = snapshot(state.schema); const current = next.pages[0].sections.find((item) => item.id === id); if (current) Object.assign(current, patch); next.site.status = next.site.status === "published" ? "changes" : next.site.status; return { schema: next, past: [...state.past.slice(-29), snapshot(state.schema)], future: [], saving: "saving" }; }),
  reorder: (activeId, overId) => set((state) => { const next = snapshot(state.schema); const list = next.pages[0].sections; const from = list.findIndex((item) => item.id === activeId); const to = list.findIndex((item) => item.id === overId); if (from < 0 || to < 0 || from === to) return state; const [moved] = list.splice(from, 1); list.splice(to, 0, moved); return { schema: next, past: [...state.past.slice(-29), snapshot(state.schema)], future: [], saving: "saving" }; }),
  move: (id, direction) => set((state) => { const list = state.schema.pages[0].sections; const index = list.findIndex((item) => item.id === id); const target = index + direction; if (index < 0 || target < 0 || target >= list.length) return state; const next = snapshot(state.schema); [next.pages[0].sections[index], next.pages[0].sections[target]] = [next.pages[0].sections[target], next.pages[0].sections[index]]; return { schema: next, past: [...state.past.slice(-29), snapshot(state.schema)], future: [], saving: "saving" }; }),
  duplicate: (id) => set((state) => { const next = snapshot(state.schema); const list = next.pages[0].sections; const index = list.findIndex((item) => item.id === id); if (index < 0) return state; const copy = snapshot(list[index]); copy.id = makeId(copy.type); copy.content.title = `${copy.content.title} — copia`; list.splice(index + 1, 0, copy); return { schema: next, selectedId: copy.id, past: [...state.past.slice(-29), snapshot(state.schema)], future: [], saving: "saving" }; }),
  remove: (id) => set((state) => { if (state.schema.pages[0].sections.length <= 1) return state; const next = snapshot(state.schema); next.pages[0].sections = next.pages[0].sections.filter((item) => item.id !== id); return { schema: next, selectedId: next.pages[0].sections[0]?.id ?? null, past: [...state.past.slice(-29), snapshot(state.schema)], future: [], saving: "saving" }; }),
  addBlock: (type) => set((state) => { const next = snapshot(state.schema); const block: SiteSection = { id: makeId(type), type, variant: `${type}-01`, content: { title: type === "cta" ? "Convierte una idea en acción." : "Un nuevo capítulo", body: "Edita este contenido desde el panel de la derecha.", cta: type === "cta" ? "Comenzar" : undefined }, styles: { background: "#11111a", foreground: "#f5f2ff", accent: "#8b7cff", align: "left", padding: 88 }, responsive: { hideMobile: false, mobilePadding: 48 }, animation: { preset: "fade-up", intensity: 50, scrub: false }, locked: false }; next.pages[0].sections.push(block); return { schema: next, selectedId: block.id, past: [...state.past.slice(-29), snapshot(state.schema)], future: [], saving: "saving" }; }),
  undo: () => set((state) => { const previous = state.past.at(-1); if (!previous) return state; return { schema: snapshot(previous), past: state.past.slice(0, -1), future: [snapshot(state.schema), ...state.future].slice(0, 30), saving: "saving" }; }),
  redo: () => set((state) => { const next = state.future[0]; if (!next) return state; return { schema: snapshot(next), past: [...state.past, snapshot(state.schema)].slice(-30), future: state.future.slice(1), saving: "saving" }; }),
  markPublished: () => set((state) => ({ schema: { ...state.schema, site: { ...state.schema.site, status: "published" } }, saving: "saved" })),
}));
