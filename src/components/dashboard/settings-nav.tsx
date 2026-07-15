"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Link2, CreditCard, UsersRound, Bell, KeyRound } from "lucide-react";
import { cn } from "@/lib/utils";

const SETTINGS_LINKS = [
  { label: "Perfil", href: "/dashboard/configuracoes/perfil", icon: User },
  { label: "Canais ligados", href: "/dashboard/configuracoes/canais", icon: Link2 },
  { label: "Plano e faturação", href: "/dashboard/configuracoes/faturacao", icon: CreditCard },
  { label: "Equipa", href: "/dashboard/configuracoes/equipa", icon: UsersRound },
  { label: "Notificações", href: "/dashboard/configuracoes/notificacoes", icon: Bell },
  { label: "API e webhooks", href: "/dashboard/configuracoes/api", icon: KeyRound },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 lg:w-56 lg:shrink-0 lg:flex-col lg:overflow-visible lg:pb-0">
      {SETTINGS_LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <link.icon className="h-4 w-4" strokeWidth={1.75} />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
