import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Workflow,
  Megaphone,
  Repeat,
  Inbox,
  BarChart3,
  Plug,
  Settings,
  MessageCircle,
  Camera,
  Mail,
  User,
  Link2,
  CreditCard,
  UsersRound,
  Bell,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
}

export const DASHBOARD_NAV: NavItem[] = [
  { label: "Início", href: "/dashboard", icon: LayoutDashboard },
  { label: "Contactos", href: "/dashboard/contactos", icon: Users },
  {
    label: "Fluxos",
    href: "/dashboard/fluxos/whatsapp",
    icon: Workflow,
    children: [
      { label: "WhatsApp", href: "/dashboard/fluxos/whatsapp", icon: MessageCircle },
      { label: "Instagram", href: "/dashboard/fluxos/instagram", icon: Camera },
      { label: "Email", href: "/dashboard/fluxos/email", icon: Mail },
    ],
  },
  { label: "Broadcasts", href: "/dashboard/broadcasts", icon: Megaphone },
  { label: "Sequências", href: "/dashboard/sequencias", icon: Repeat },
  { label: "Inbox", href: "/dashboard/inbox", icon: Inbox },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Integrações", href: "/dashboard/integracoes", icon: Plug },
  {
    label: "Configurações",
    href: "/dashboard/configuracoes/perfil",
    icon: Settings,
    children: [
      { label: "Perfil", href: "/dashboard/configuracoes/perfil", icon: User },
      { label: "Canais ligados", href: "/dashboard/configuracoes/canais", icon: Link2 },
      { label: "Plano e faturação", href: "/dashboard/configuracoes/faturacao", icon: CreditCard },
      { label: "Equipa", href: "/dashboard/configuracoes/equipa", icon: UsersRound },
      { label: "Notificações", href: "/dashboard/configuracoes/notificacoes", icon: Bell },
    ],
  },
];
