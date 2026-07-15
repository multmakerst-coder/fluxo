import Link from "next/link";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-2 font-heading text-xl font-bold", className)}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#6C47FF] to-[#A78BFA] text-white shadow-[0_4px_16px_rgba(108,71,255,0.4)]">
        <Zap className="h-4.5 w-4.5" fill="currentColor" strokeWidth={0} />
      </span>
      <span>Fluxo</span>
    </Link>
  );
}
