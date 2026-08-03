import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return <span className={cn("inline-flex items-center gap-2 font-semibold tracking-[-0.03em]", className)}><span className="grid size-8 place-items-center rounded-[10px] bg-[linear-gradient(135deg,#a78bfa,#5b5bf7_55%,#d946ef)] text-white shadow-[0_0_24px_rgba(124,92,255,.35)]"><Sparkles size={16} aria-hidden /></span>{compact ? null : <span>Vexora <span className="text-white/55">Sites</span></span>}</span>;
}
