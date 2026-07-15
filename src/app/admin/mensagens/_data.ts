import { ADMIN_CLIENTS, PLAN_LABELS, type Channel } from "@/app/admin/clientes/_data";

function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const TODAY = new Date("2026-07-15T12:00:00");

export interface DailyPoint {
  label: string;
  mensagens: number;
}

export const MESSAGES_DAILY: DailyPoint[] = Array.from({ length: 14 }).map((_, i) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - (13 - i));
  return {
    label: d.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
    mensagens: Math.round(2400 + seeded(i + 10) * 1600),
  };
});

export const MESSAGES_WEEKLY: DailyPoint[] = Array.from({ length: 12 }).map((_, i) => ({
  label: `Sem ${i + 1}`,
  mensagens: Math.round(14000 + seeded(i + 40) * 8000),
}));

const MONTH_LABELS = ["Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"];

export const MESSAGES_MONTHLY: DailyPoint[] = MONTH_LABELS.map((label, i) => ({
  label,
  mensagens: Math.round(45000 + i * 3200 + seeded(i + 70) * 12000),
}));

export interface ChannelBreakdown {
  channel: Channel;
  label: string;
  total: number;
}

const CHANNEL_LABELS: Record<Channel, string> = { whatsapp: "WhatsApp", instagram: "Instagram", email: "Email" };

export const CHANNEL_BREAKDOWN: ChannelBreakdown[] = (["whatsapp", "instagram", "email"] as Channel[]).map((channel) => {
  const total = ADMIN_CLIENTS.filter((c) => c.channels.includes(channel)).reduce(
    (sum, c) => sum + Math.round((c.messagesSent + c.messagesReceived) / c.channels.length),
    0,
  );
  return { channel, label: CHANNEL_LABELS[channel], total };
});

export const TOP_CLIENTS = [...ADMIN_CLIENTS]
  .sort((a, b) => b.messagesSent + b.messagesReceived - (a.messagesSent + a.messagesReceived))
  .slice(0, 10);

export const PLAN_MESSAGE_LIMIT: Record<string, number | null> = {
  gratuito: 1000,
  pro: null,
  empresas: null,
};

export interface LimitAlert {
  clientId: string;
  clientName: string;
  plan: string;
  used: number;
  limit: number;
  percentage: number;
}

export const NEAR_LIMIT_ALERTS: LimitAlert[] = ADMIN_CLIENTS.filter((c) => c.plan === "gratuito" && c.status !== "cancelado")
  .map((c) => {
    const limit = PLAN_MESSAGE_LIMIT.gratuito!;
    const used = c.messagesSent + c.messagesReceived;
    const percentage = Math.min(100, Math.round((used / limit) * 100));
    return { clientId: c.id, clientName: c.name, plan: PLAN_LABELS[c.plan], used, limit, percentage };
  })
  .filter((a) => a.percentage >= 60)
  .sort((a, b) => b.percentage - a.percentage);
