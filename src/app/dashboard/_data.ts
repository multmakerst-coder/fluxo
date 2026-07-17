export interface KpiCard {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

export const KPIS: KpiCard[] = [
  { label: "Total de contactos", value: "0", change: 0, changeLabel: "vs. mês anterior" },
  { label: "Mensagens enviadas hoje", value: "0", change: 0, changeLabel: "vs. ontem" },
  { label: "Taxa de resposta", value: "0%", change: 0, changeLabel: "vs. semana anterior" },
  { label: "Novos leads hoje", value: "0", change: 0, changeLabel: "vs. ontem" },
];

export interface ActivityPoint {
  date: string;
  enviadas: number;
  recebidas: number;
  novosContactos: number;
}

export const ACTIVITY_DATA: ActivityPoint[] = [];

export type FeedType = "conversa" | "fluxo" | "erro" | "desconexao";

export interface FeedItem {
  id: string;
  type: FeedType;
  title: string;
  description: string;
  time: string;
}

export const ACTIVITY_FEED: FeedItem[] = [];

export type ChannelStatus = "ligado" | "desligado" | "erro";

export interface ChannelCard {
  id: string;
  name: string;
  status: ChannelStatus;
  detail: string;
}

export const CHANNEL_STATUS: ChannelCard[] = [
  { id: "whatsapp", name: "WhatsApp", status: "desligado", detail: "Sem número associado" },
  { id: "instagram", name: "Instagram", status: "desligado", detail: "Sem conta associada" },
  { id: "email", name: "Email", status: "desligado", detail: "Sem servidor SMTP associado" },
];
