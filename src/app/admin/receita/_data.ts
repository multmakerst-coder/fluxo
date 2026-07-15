import { ADMIN_CLIENTS, PLAN_LABELS } from "@/app/admin/clientes/_data";
import { mrrTotal, arrTotal, PLAN_DISTRIBUTION } from "@/app/admin/_data";
import type { PlanSlug } from "@/lib/plans";

export { mrrTotal, arrTotal };

function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const MONTH_LABELS = ["Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];

export interface RevenuePoint {
  month: string;
  mrr: number;
  arr: number;
}

export const REVENUE_GROWTH: RevenuePoint[] = MONTH_LABELS.map((month, i) => {
  const progress = (i + 1) / MONTH_LABELS.length;
  const mrr = Math.round(mrrTotal * (0.35 + 0.65 * progress) * (0.94 + seeded(i + 200) * 0.12));
  return { month, mrr, arr: mrr * 12 };
});

export interface ChurnPoint {
  month: string;
  novos: number;
  cancelamentos: number;
}

export const NEW_VS_CANCELLED: ChurnPoint[] = MONTH_LABELS.map((month, i) => {
  const novos = Math.round(3 + seeded(i + 300) * 6);
  const cancelamentos = Math.round(seeded(i + 400) * 3);
  return { month, novos, cancelamentos };
});

const totalCancelled = NEW_VS_CANCELLED.reduce((sum, p) => sum + p.cancelamentos, 0);
const totalNew = NEW_VS_CANCELLED.reduce((sum, p) => sum + p.novos, 0);
export const churnRate = Number(((totalCancelled / (totalNew + ADMIN_CLIENTS.length)) * 100).toFixed(1));

function planMrr(plan: PlanSlug) {
  if (plan === "gratuito") return 0;
  if (plan === "pro") return 29;
  return 149;
}

export interface RevenueByPlan {
  plan: PlanSlug;
  label: string;
  total: number;
}

export const REVENUE_BY_PLAN: RevenueByPlan[] = PLAN_DISTRIBUTION.map((p) => ({
  plan: p.plan,
  label: p.label,
  total: p.total * planMrr(p.plan),
}));

export type TransactionStatus = "pago" | "falhou" | "reembolsado" | "pendente";

export interface Transaction {
  id: string;
  clientName: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  plan: PlanSlug;
}

const TODAY = new Date("2026-07-15T12:00:00");
function daysAgo(n: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

const payingClients = ADMIN_CLIENTS.filter((c) => c.plan !== "gratuito");

export const TRANSACTIONS: Transaction[] = payingClients.slice(0, 24).map((c, i) => {
  const statusPool: TransactionStatus[] = ["pago", "pago", "pago", "pago", "pendente", "falhou", "reembolsado"];
  return {
    id: `txn_${(1000 + i).toString(36)}`,
    clientName: c.name,
    amount: c.plan === "pro" ? 29 : 149,
    status: statusPool[i % statusPool.length],
    date: daysAgo(Math.round(seeded(i + 500) * 60)),
    plan: c.plan,
  };
});

export type DisputeStatus = "pendente" | "aprovado" | "rejeitado";

export interface Refund {
  id: string;
  clientName: string;
  amount: number;
  reason: string;
  status: DisputeStatus;
  date: string;
}

const REFUND_REASONS = [
  "Cliente cancelou pouco depois da renovação",
  "Duplicação de cobrança",
  "Insatisfação com o serviço",
  "Erro no upgrade de plano",
  "Pedido de reembolso por não utilização",
];

export const REFUNDS: Refund[] = payingClients.slice(0, 8).map((c, i) => ({
  id: `dp_${(2000 + i).toString(36)}`,
  clientName: c.name,
  amount: c.plan === "pro" ? 29 : 149,
  reason: REFUND_REASONS[i % REFUND_REASONS.length],
  status: (["pendente", "aprovado", "rejeitado"] as DisputeStatus[])[i % 3],
  date: daysAgo(Math.round(seeded(i + 600) * 45)),
}));

export { PLAN_LABELS };
