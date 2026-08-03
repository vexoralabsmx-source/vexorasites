"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { SiteRenderer } from "@/components/renderer/site-renderer";
import { cloneTemplate, templates } from "@/lib/templates";
import type { SiteSchema } from "@/types/site";

export function PublicSite({slug}:{slug:string}){const [schema,setSchema]=useState<SiteSchema|null>(null);useEffect(()=>{const timer=window.setTimeout(()=>{try{const stored=localStorage.getItem(`vexora-published-${slug}`);if(stored){setSchema(JSON.parse(stored));return;}const template=templates.find(t=>t.schema.site.slug===slug||t.id===slug);setSchema(template?cloneTemplate(template.id):cloneTemplate("orbital-labs",slug.replaceAll("-"," ")));}catch{setSchema(cloneTemplate("orbital-labs"));}},0);return()=>window.clearTimeout(timer);},[slug]);if(!schema)return <div className="grid min-h-dvh place-items-center bg-black text-white"><LoaderCircle className="animate-spin text-violet-400"/></div>;return <main><SiteRenderer schema={schema}/><div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2"><Link href="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/15 bg-black/75 px-4 text-xs font-semibold text-white shadow-xl backdrop-blur-xl"><ArrowLeft size={14}/>Creado con Vexora Sites</Link></div></main>}
