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

function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const NAMES = [
  "Padaria Rosa Dourada",
  "Clínica Vitalis",
  "Estética Bela Pele",
  "Auto Peças Ribeiro",
  "Loja Verde Vivo",
  "Salão Charme & Cia",
  "Restaurante O Marisqueiro",
  "Studio Fit Lisboa",
  "Ótica Visão Clara",
  "Consultório Dr. Silva",
  "Boutique Elegância",
  "Café Central do Porto",
  "Imobiliária Chave Certa",
  "Farmácia São João",
  "Pet Shop Amigo Fiel",
  "Barbearia Navalha de Ouro",
  "Advocacia Costa & Neves",
  "Escola de Condução Rápida",
  "Agência Viaja Mais",
  "Móveis & Design Sereno",
  "Academia PowerFit",
  "Doceria Ponto Doce",
  "Clínica Dentária Sorriso",
  "Loja de Informática ByteUp",
  "Floricultura Jardim Encantado",
  "Oficina Mecânica Turbo",
  "Spa Serenidade",
  "Livraria Página Feliz",
  "Mercearia Sabor da Terra",
  "Fotografia Instante Mágico",
];

const DOMAIN_SUFFIXES = ["pt", "com", "pt", "com.pt", "pt"];

const PLAN_CYCLE: PlanSlug[] = ["gratuito", "pro", "empresas"];
const STATUS_CYCLE: ClientStatus[] = ["ativo", "ativo", "ativo", "ativo", "trial", "suspenso", "cancelado"];

const TODAY = new Date("2026-07-15T12:00:00");

function daysAgo(n: number) {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function planMrr(plan: PlanSlug) {
  if (plan === "gratuito") return 0;
  if (plan === "pro") return 29;
  return 149;
}

export const ADMIN_CLIENTS: AdminClient[] = NAMES.map((name, i) => {
  const plan = PLAN_CYCLE[i % PLAN_CYCLE.length];
  const status = STATUS_CYCLE[i % STATUS_CYCLE.length];
  const registeredDaysAgo = Math.round(20 + seeded(i + 1) * 540);
  const lastActivityDaysAgo = status === "cancelado" ? registeredDaysAgo - 5 : Math.round(seeded(i + 55) * 14);
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
  const channelsPool: Channel[] = ["whatsapp", "instagram", "email"];
  const channelCount = plan === "gratuito" ? 1 : 1 + Math.round(seeded(i + 80) * 2);
  const channels = channelsPool.slice(0, Math.max(1, Math.min(3, channelCount)));

  const contactsCount = plan === "gratuito" ? Math.round(50 + seeded(i + 3) * 450) : Math.round(300 + seeded(i + 3) * 6000);
  const messagesSent = Math.round(contactsCount * (2 + seeded(i + 10) * 6));
  const messagesReceived = Math.round(messagesSent * (0.6 + seeded(i + 15) * 0.3));
  const activeFlows = plan === "gratuito" ? Math.min(3, 1 + Math.round(seeded(i + 20) * 2)) : Math.round(2 + seeded(i + 20) * 10);

  const planHistory: PlanHistoryEntry[] = [
    { plan: "gratuito", date: daysAgo(registeredDaysAgo) },
  ];
  if (plan !== "gratuito") {
    planHistory.push({ plan, date: daysAgo(Math.round(registeredDaysAgo * 0.6)) });
  }

  return {
    id: `cli-${String(i + 1).padStart(3, "0")}`,
    name,
    contactName: ["Ana Ferreira", "João Santos", "Marta Oliveira", "Pedro Costa", "Sofia Rodrigues", "Miguel Alves", "Beatriz Marques", "Rui Pinto"][i % 8],
    email: `geral@${slug}.${DOMAIN_SUFFIXES[i % DOMAIN_SUFFIXES.length]}`,
    plan,
    status,
    registeredAt: daysAgo(registeredDaysAgo),
    channels,
    contactsCount,
    messagesSent,
    messagesReceived,
    activeFlows,
    lastActivity: daysAgo(lastActivityDaysAgo),
    mrr: status === "cancelado" || status === "suspenso" ? 0 : planMrr(plan),
    planHistory,
  };
});

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
