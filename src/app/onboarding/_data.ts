import type { Channel } from "@/lib/flow-blocks";

export type OnboardingTemplate = {
  id: string;
  nome: string;
  descricao: string;
  canal: Channel;
};

export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  {
    id: "boas-vindas-whatsapp",
    nome: "Boas-vindas automáticas",
    descricao: "Responde de imediato a quem te escreve pela primeira vez no WhatsApp.",
    canal: "whatsapp",
  },
  {
    id: "qualificacao-leads",
    nome: "Qualificação de leads",
    descricao: "Pergunta nome, interesse e orçamento antes de encaminhar para a equipa.",
    canal: "whatsapp",
  },
  {
    id: "envio-precario",
    nome: "Envio de preçário",
    descricao: "Resposta automática com o preçário sempre que alguém escreve \"preços\".",
    canal: "whatsapp",
  },
  {
    id: "faq-automatico",
    nome: "FAQ automático",
    descricao: "Responde às 5 perguntas mais comuns dos teus clientes sem intervenção.",
    canal: "whatsapp",
  },
  {
    id: "comentario-dm",
    nome: "Comentário → DM com oferta",
    descricao: "Quem comentar numa publicação recebe uma DM automática com um link.",
    canal: "instagram",
  },
  {
    id: "sequencia-pos-lead",
    nome: "Sequência pós-lead",
    descricao: "3 emails ao longo de 7 dias para converter um novo lead em cliente.",
    canal: "email",
  },
];

export type OnboardingStepId = "whatsapp" | "instagram" | "email" | "fluxo";

export const ONBOARDING_STEPS: { id: OnboardingStepId; titulo: string; opcional: boolean }[] = [
  { id: "whatsapp", titulo: "Ligar WhatsApp", opcional: false },
  { id: "instagram", titulo: "Ligar Instagram", opcional: true },
  { id: "email", titulo: "Configurar email", opcional: true },
  { id: "fluxo", titulo: "Criar primeiro fluxo", opcional: false },
];
