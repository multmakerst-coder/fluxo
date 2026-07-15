import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Moldura de telemóvel reutilizável para mockups ilustrativos (não são capturas de ecrã
 * reais de nenhuma app — são recriações estilizadas para comunicar visualmente o produto).
 */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative mx-auto flex h-[560px] w-[280px] flex-col overflow-hidden rounded-[2.75rem] border-[8px] border-neutral-900 bg-neutral-900 shadow-2xl",
        className,
      )}
    >
      <div className="absolute top-0 left-1/2 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-neutral-900" />
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[2.25rem] bg-background">
        {children}
      </div>
    </div>
  );
}
