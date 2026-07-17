import type { PlanSlug } from "@/lib/plans";

export type ClientStatus = "ativo" | "suspenso" | "trial" | "cancelado";
export type Channel = "whatsapp" | "instagram" | "email";

export interface PlanHistoryEntry {
  plan: PlanSlug;
  date: string;
}

export interface AdminClient {
  id: string;
  name: string;
  contactName: string;
  email: string;
  plan: PlanSlug;
  status: ClientStatus;
  registeredAt: string;
  channels: Channel[];
  contactsCount: number;
  messagesSent: number;
  messagesReceived: number;
  activeFlows: number;
  lastActivity: string;
  mrr: number;
  planHistory: PlanHistoryEntry[];
}

export const ADMIN_CLIENTS: AdminClient[] = [];

export function getClientById(id: string) {
  return ADMIN_CLIENTS.find((c) => c.id === id);
}

export const STATUS_LABELS: Record<ClientStatus, string> = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  trial: "Em teste",
  cancelado: "Cancelado",
};

export const PLAN_LABELS: Record<PlanSlug, string> = {
  gratuito: "Gratuito",
  pro: "Pro",
  empresas: "Empresas",
};
