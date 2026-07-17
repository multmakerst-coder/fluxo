import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Wallet,
  MessagesSquare,
  ServerCog,
  FileText,
  Tag,
  Megaphone,
  Settings,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const ADMIN_NAV: AdminNavItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
  { label: "Receita", href: "/admin/receita", icon: Wallet },
  { label: "Mensagens", href: "/admin/mensagens", icon: MessagesSquare },
  { label: "Sistema", href: "/admin/sistema", icon: ServerCog },
  { label: "Conteúdo", href: "/admin/conteudo", icon: FileText },
  { label: "Planos", href: "/admin/planos", icon: Tag },
  { label: "Notificações", href: "/admin/notificacoes", icon: Megaphone },
  { label: "Configurações", href: "/admin/configuracoes", icon: Settings },
];
