import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 font-semibold tracking-[-0.03em]", className)}>
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-xl bg-[#120a24] p-1 border border-purple-500/30 shadow-[0_0_20px_rgba(167,139,250,0.35)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://res.cloudinary.com/khxvbeau/image/upload/v1785467555/vexoralabslogo_hy554s.png"
          alt="Vexora Logo"
          className="size-full object-contain"
        />
      </span>
      {compact ? null : (
        <span className="text-white text-lg font-bold">
          Vexora <span className="text-[#c084fc] font-normal">Sites</span>
        </span>
      )}
    </span>
  );
}

