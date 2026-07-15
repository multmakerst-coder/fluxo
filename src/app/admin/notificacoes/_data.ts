export type CommunicationType = "email" | "in-app";
export type Audience = "todos" | "gratuito" | "pro" | "empresas";

export interface Communication {
  id: string;
  type: CommunicationType;
  audience: Audience;
  subject: string;
  content: string;
  sentAt: string;
  recipientsCount: number;
}

export const AUDIENCE_LABELS: Record<Audience, string> = {
  todos: "Todos os clientes",
  gratuito: "Plano Gratuito",
  pro: "Plano Pro",
  empresas: "Plano Empresas",
};

export const COMMUNICATIONS_HISTORY: Communication[] = [
  {
    id: "com-1",
    type: "email",
    audience: "todos",
    subject: "Novidades de julho: respostas com IA disponíveis",
    content: "Já podes experimentar as respostas automáticas com IA no teu plano.",
    sentAt: "2026-07-12T10:00:00",
    recipientsCount: 30,
  },
  {
    id: "com-2",
    type: "in-app",
    audience: "gratuito",
    subject: "Aproveita 20% de desconto no upgrade para Pro",
    content: "Faz upgrade este mês e poupa nos primeiros 3 meses.",
    sentAt: "2026-07-08T09:30:00",
    recipientsCount: 10,
  },
  {
    id: "com-3",
    type: "email",
    audience: "pro",
    subject: "Manutenção programada no dia 20 de julho",
    content: "A plataforma ficará indisponível por 15 minutos durante a manutenção.",
    sentAt: "2026-07-05T15:00:00",
    recipientsCount: 10,
  },
  {
    id: "com-4",
    type: "in-app",
    audience: "empresas",
    subject: "Novo painel de API disponível",
    content: "Já podes gerar as tuas chaves de API a partir das configurações.",
    sentAt: "2026-06-28T11:20:00",
    recipientsCount: 10,
  },
];
