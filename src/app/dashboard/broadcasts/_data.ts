export type TemplateWhatsapp = {
  id: string;
  nome: string;
  categoria: "Marketing" | "Utilidade" | "Autenticação";
  corpo: string;
};

export const TEMPLATES_WHATSAPP: TemplateWhatsapp[] = [
  {
    id: "tpl-promo-verao",
    nome: "promo_verao_2026",
    categoria: "Marketing",
    corpo: "Olá {{1}}! ☀️ A nossa promoção de verão já começou — até 30% de desconto em toda a loja. Aproveita antes que acabe!",
  },
  {
    id: "tpl-carrinho",
    nome: "carrinho_abandonado",
    categoria: "Marketing",
    corpo: "Olá {{1}}, reparámos que deixaste artigos no teu carrinho. Ainda estão à tua espera — queres finalizar a compra?",
  },
  {
    id: "tpl-confirmacao",
    nome: "confirmacao_encomenda",
    categoria: "Utilidade",
    corpo: "Olá {{1}}, a tua encomenda foi confirmada e será entregue em breve. Obrigado pela preferência!",
  },
  {
    id: "tpl-lembrete",
    nome: "lembrete_marcacao",
    categoria: "Utilidade",
    corpo: "Olá {{1}}, este é um lembrete da tua marcação amanhã. Até já!",
  },
  {
    id: "tpl-boasvindas",
    nome: "boas_vindas_vip",
    categoria: "Marketing",
    corpo: "Bem-vindo(a) ao clube VIP, {{1}}! A partir de agora tens acesso a ofertas exclusivas em primeira mão.",
  },
  {
    id: "tpl-livre",
    nome: "mensagem_livre",
    categoria: "Utilidade",
    corpo: "",
  },
];

export function templateWhatsapp(id: string) {
  return TEMPLATES_WHATSAPP.find((t) => t.id === id);
}

// Estados tal como guardados na base de dados (enum `broadcast_status`).
export type BroadcastStatus = "scheduled" | "sending" | "sent" | "failed";

export function badgeEstadoBroadcast(status: BroadcastStatus) {
  switch (status) {
    case "sent":
      return { label: "Enviado", className: "border-success/30 text-success" };
    case "sending":
      return { label: "A enviar", className: "border-warning/30 text-warning" };
    case "failed":
      return { label: "Falhou", className: "border-destructive/30 text-destructive" };
    case "scheduled":
    default:
      return { label: "Agendado", className: "border-info/30 text-info" };
  }
}

export type BroadcastStats = {
  destinatarios: number;
  entregues: number;
  falhas: number;
  sentAt?: string;
};

// Forma tal como guardada na coluna `broadcasts` da base de dados.
export type BroadcastRow = {
  id: string;
  client_id: string;
  channel: "whatsapp" | "instagram" | "email";
  segment_id: string | null;
  name: string;
  content: Record<string, unknown>;
  scheduled_at: string | null;
  status: BroadcastStatus;
  stats: Partial<BroadcastStats>;
  created_at: string;
};
