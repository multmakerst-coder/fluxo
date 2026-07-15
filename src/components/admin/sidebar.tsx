"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { ADMIN_NAV } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

export function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-xl">
      <div className="flex items-center gap-2 px-6 py-6 font-heading text-lg font-bold">
        <ShieldCheck className="h-5 w-5 text-primary" />
        Fluxo <span className="text-sm font-medium text-muted-foreground">Admin</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 pb-6">
        {ADMIN_NAV.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60",
              )}
            >
              {active && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" />}
              <item.icon className="h-5 w-5" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
