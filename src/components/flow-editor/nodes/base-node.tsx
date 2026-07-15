"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CATEGORY_META, type NodeKind } from "@/lib/flow-blocks";

export function NodeShell({
  kind,
  icon: Icon,
  title,
  subtitle,
  selected,
  children,
  className,
}: {
  kind: NodeKind;
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  selected?: boolean;
  children?: ReactNode;
  className?: string;
}) {
  const meta = CATEGORY_META[kind];
  return (
    <div
      className={cn(
        "glass w-56 rounded-2xl border p-3 text-xs shadow-sm transition-shadow",
        meta.border,
        selected && "ring-2",
        selected && meta.ring,
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-xl", meta.bg)}>
          <Icon className={cn("size-3.5", meta.text)} strokeWidth={2} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-foreground">{title}</p>
          <p className={cn("truncate text-[10px] font-medium uppercase tracking-wide", meta.text)}>
            {meta.label}
          </p>
        </div>
      </div>
      {subtitle && (
        <p className="mt-2 line-clamp-2 text-[11px] leading-snug text-muted-foreground">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

export function handleDotClass(kind: NodeKind) {
  return CATEGORY_META[kind].dot;
}
