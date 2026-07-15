export interface KpiCard {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

export const KPIS: KpiCard[] = [
  { label: "Total de contactos", value: "3 248", change: 8.2, changeLabel: "vs. mês anterior" },
  { label: "Mensagens enviadas hoje", value: "612", change: 12.5, changeLabel: "vs. ontem" },
  { label: "Taxa de resposta", value: "68%", change: -2.1, changeLabel: "vs. semana anterior" },
  { label: "Novos leads hoje", value: "24", change: 15.4, changeLabel: "vs. ontem" },
];

export interface ActivityPoint {
  date: string;
  enviadas: number;
  recebidas: number;
  novosContactos: number;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export const ACTIVITY_DATA: ActivityPoint[] = Array.from({ length: 30 }).map((_, i) => {
  const dayOffset = 29 - i;
  const date = new Date();
  date.setDate(date.getDate() - dayOffset);
  const base = 300 + Math.round(seededRandom(i + 1) * 250);
  return {
    date: date.toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
    enviadas: base,
    recebidas: Math.round(base * (0.55 + seededRandom(i + 20) * 0.25)),
    novosContactos: Math.round(10 + seededRandom(i + 40) * 25),
  };
});

export type FeedType = "conversa" | "fluxo" | "erro" | "desconexao";

export interface FeedItem {
  id: string;
  type: FeedType;
  title: string;
  description: string;
  time: string;
}

export const ACTIVITY_FEED: FeedItem[] = [
  {
    id: "f1",
    type: "conversa",
    title: "Nova conversa com Beatriz Fernandes",
    description: "WhatsApp · \"Olá, gostava de saber mais sobre os planos...\"",
    time: "há 4 min",
  },
  {
    id: "f2",
    type: "fluxo",
    title: "Fluxo \"Boas-vindas Instagram\" ativado",
    description: "Disparado por 12 novos seguidores nas últimas 2 horas",
    time: "há 22 min",
  },
  {
    id: "f3",
    type: "erro",
    title: "Erro no fluxo \"Recuperação de carrinho\"",
    description: "Falha ao enviar template de WhatsApp — limite de mensagens excedido",
    time: "há 1 hora",
  },
  {
    id: "f4",
    type: "conversa",
    title: "Nova conversa com João Pereira",
    description: "Email · \"Preciso de ajuda com a minha encomenda #4521\"",
    time: "há 1 hora",
  },
  {
    id: "f5",
    type: "desconexao",
    title: "Instagram desligado",
    description: "O token de acesso expirou — reconecta a conta em Configurações",
    time: "há 3 horas",
  },
  {
    id: "f6",
    type: "fluxo",
    title: "Fluxo \"Sequência de onboarding\" concluído",
    description: "148 contactos completaram a sequência de 5 passos",
    time: "há 5 horas",
  },
  {
    id: "f7",
    type: "conversa",
    title: "Nova conversa com Rita Gonçalves",
    description: "WhatsApp · \"Ainda têm o produto em stock?\"",
    time: "há 6 horas",
  },
];

export type ChannelStatus = "ligado" | "desligado" | "erro";

export interface ChannelCard {
  id: string;
  name: string;
  status: ChannelStatus;
  detail: string;
}

export const CHANNEL_STATUS: ChannelCard[] = [
  { id: "whatsapp", name: "WhatsApp", status: "ligado", detail: "+351 912 345 678" },
  { id: "instagram", name: "Instagram", status: "erro", detail: "Token expirado — reconectar" },
  { id: "email", name: "Email", status: "ligado", detail: "envio@negocio.pt" },
];
