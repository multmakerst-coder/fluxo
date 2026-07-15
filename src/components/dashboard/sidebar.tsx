"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Logo } from "@/components/logo";
import { DASHBOARD_NAV } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

export function DashboardSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    DASHBOARD_NAV.forEach((item) => {
      if (item.children) {
        initial[item.label] = item.children.some((c) => isActive(pathname, c.href));
      }
    });
    return initial;
  });

  return (
    <div className="sidebar flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar backdrop-blur-xl">
      <div className="px-6 py-6">
        <Logo href="/dashboard" />
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-6">
        {DASHBOARD_NAV.map((item) => {
          const active = isActive(pathname, item.href);
          if (item.children) {
            const open = openGroups[item.label];
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpenGroups((s) => ({ ...s, [item.label]: !s[item.label] }))}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" strokeWidth={1.75} />
                    {item.label}
                  </span>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
                </button>
                {open && (
                  <div className="mt-1 ml-4 space-y-1 border-l border-sidebar-border pl-3">
                    {item.children.map((child) => {
                      const childActive = isActive(pathname, child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                            childActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-muted-foreground hover:bg-sidebar-accent/60",
                          )}
                        >
                          <child.icon className="h-4 w-4" strokeWidth={1.75} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

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
