import { ADMIN_CLIENTS } from "@/app/admin/clientes/_data";
import type { PlanSlug } from "@/lib/plans";

const TODAY = new Date();

function daysBetween(iso: string) {
  const then = new Date(iso);
  return Math.floor((TODAY.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

export const activeClients = ADMIN_CLIENTS.filter((c) => c.status === "ativo" || c.status === "trial");

export const totalActiveClients = activeClients.length;

export const mrrTotal = ADMIN_CLIENTS.reduce((sum, c) => sum + c.mrr, 0);
export const arrTotal = mrrTotal * 12;

export const newToday = ADMIN_CLIENTS.filter((c) => daysBetween(c.registeredAt) < 1).length;
export const newThisWeek = ADMIN_CLIENTS.filter((c) => daysBetween(c.registeredAt) < 7).length;
export const newThisMonth = ADMIN_CLIENTS.filter((c) => daysBetween(c.registeredAt) < 30).length;

export const totalMessagesProcessed = ADMIN_CLIENTS.reduce((sum, c) => sum + c.messagesSent + c.messagesReceived, 0);

export interface GrowthPoint {
  month: string;
  clientes: number;
  novos: number;
}

const MONTH_LABELS = ["Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];

export const GROWTH_DATA: GrowthPoint[] = MONTH_LABELS.map((month, i) => {
  const monthsAgo = 11 - i;
  const cutoffEnd = monthsAgo * 30; // idade (dias) no fim deste mês
  const cutoffStart = (monthsAgo + 1) * 30; // idade (dias) no início deste mês
  const clientesAteAoMes = ADMIN_CLIENTS.filter((c) => daysBetween(c.registeredAt) >= cutoffEnd).length;
  const novosNoMes = ADMIN_CLIENTS.filter((c) => {
    const d = daysBetween(c.registeredAt);
    return d >= cutoffEnd && d < cutoffStart;
  }).length;
  return {
    month,
    clientes: clientesAteAoMes,
    novos: novosNoMes,
  };
});

export interface PlanDistribution {
  plan: PlanSlug;
  label: string;
  total: number;
}

export const PLAN_DISTRIBUTION: PlanDistribution[] = [
  { plan: "gratuito", label: "Gratuito", total: ADMIN_CLIENTS.filter((c) => c.plan === "gratuito").length },
  { plan: "pro", label: "Pro", total: ADMIN_CLIENTS.filter((c) => c.plan === "pro").length },
  { plan: "empresas", label: "Empresas", total: ADMIN_CLIENTS.filter((c) => c.plan === "empresas").length },
];

export type AlertSeverity = "critico" | "aviso" | "info";

export interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  timestamp: string;
}

export const SYSTEM_ALERTS: SystemAlert[] = [];
