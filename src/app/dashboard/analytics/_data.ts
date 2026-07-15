function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export interface ChannelMessagePoint {
  date: string;
  whatsapp: number;
  instagram: number;
  email: number;
}

export const MESSAGES_BY_CHANNEL: ChannelMessagePoint[] = Array.from({ length: 30 }).map((_, i) => {
  const dayOffset = 29 - i;
  const date = new Date();
  date.setDate(date.getDate() - dayOffset);
  return {
    date: date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
    whatsapp: Math.round(180 + seededRandom(i + 1) * 140),
    instagram: Math.round(60 + seededRandom(i + 50) * 80),
    email: Math.round(90 + seededRandom(i + 100) * 60),
  };
});

export interface RateMetric {
  label: string;
  value: number;
  change: number;
  changeLabel: string;
}

export const RATE_METRICS: RateMetric[] = [
  { label: "Taxa de entrega", value: 97.4, change: 0.6, changeLabel: "vs. mês anterior" },
  { label: "Taxa de abertura", value: 61.8, change: 3.2, changeLabel: "vs. mês anterior" },
  { label: "Taxa de resposta", value: 34.5, change: -1.4, changeLabel: "vs. mês anterior" },
];

export interface ContactSourcePoint {
  source: string;
  contactos: number;
}

export const CONTACTS_BY_SOURCE: ContactSourcePoint[] = [
  { source: "WhatsApp", contactos: 412 },
  { source: "Instagram", contactos: 268 },
  { source: "Formulário site", contactos: 194 },
  { source: "Importação CSV", contactos: 121 },
  { source: "Email", contactos: 87 },
  { source: "API", contactos: 43 },
];

export interface WhatsappChannelMetrics {
  enviadas: number;
  entregues: number;
  lidas: number;
  respondidas: number;
}

export interface InstagramChannelMetrics {
  comentariosProcessados: number;
  dmsEnviadas: number;
  taxaConversao: number;
}

export interface EmailChannelMetrics {
  enviados: number;
  taxaAbertura: number;
  cliques: number;
  bounces: number;
}

export const WHATSAPP_METRICS: WhatsappChannelMetrics = {
  enviadas: 18420,
  entregues: 17936,
  lidas: 14212,
  respondidas: 6348,
};

export const INSTAGRAM_METRICS: InstagramChannelMetrics = {
  comentariosProcessados: 5240,
  dmsEnviadas: 3187,
  taxaConversao: 12.6,
};

export const EMAIL_METRICS: EmailChannelMetrics = {
  enviados: 9860,
  taxaAbertura: 58.3,
  cliques: 2140,
  bounces: 187,
};

export interface FlowAnalytics {
  id: string;
  nome: string;
  ativacoes: number;
  dropOff: number;
  taxaConclusao: number;
}

export const FLOWS_ANALYTICS: FlowAnalytics[] = [
  { id: "flow-boas-vindas", nome: "Boas-vindas WhatsApp", ativacoes: 1840, dropOff: 18, taxaConclusao: 82 },
  { id: "flow-qualificacao", nome: "Qualificação de leads", ativacoes: 1024, dropOff: 34, taxaConclusao: 66 },
  { id: "flow-carrinho", nome: "Recuperação de carrinho", ativacoes: 612, dropOff: 47, taxaConclusao: 53 },
  { id: "flow-agendamento", nome: "Agendamento de consulta", ativacoes: 458, dropOff: 22, taxaConclusao: 78 },
  { id: "flow-suporte", nome: "Triagem de suporte", ativacoes: 926, dropOff: 12, taxaConclusao: 88 },
  { id: "flow-instagram-dm", nome: "Resposta automática Instagram DM", ativacoes: 738, dropOff: 39, taxaConclusao: 61 },
];
