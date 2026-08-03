import { Suspense } from "react";
import { EditorShell } from "@/components/editor/editor-shell";
import { requireUser } from "@/lib/supabase/server";
export default async function EditorPage({params}:{params:Promise<{id:string}>}){await requireUser();const {id}=await params;return <Suspense><EditorShell projectId={id}/></Suspense>}
