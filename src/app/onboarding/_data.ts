import type { Channel } from "@/lib/flow-blocks";

export type OnboardingTemplate = {
  id: string;
  nome: string;
  descricao: string;
  canal: Channel;
  /** Gatilho real (ver TRIGGERS_BY_CHANNEL em lib/flow-blocks.ts) usado ao criar o fluxo. */
  triggerId: string;
  /** Configuração inicial do gatilho (ex.: palavras-chave). */
  triggerConfig?: Record<string, unknown>;
  /** Texto da primeira mensagem automática gerada para este template. */
  mensagem: string;
};

export const ONBOARDING_TEMPLATES: OnboardingTemplate[] = [
  {
    id: "boas-vindas-whatsapp",
    nome: "Boas-vindas automáticas",
    descricao: "Responde de imediato a quem te escreve pela primeira vez no WhatsApp.",
    canal: "whatsapp",
    triggerId: "primeira-mensagem",
    mensagem: "Olá {{nome}}! Obrigado por nos contactares 👋 Em que podemos ajudar-te hoje?",
  },
  {
    id: "qualificacao-leads",
    nome: "Qualificação de leads",
    descricao: "Pergunta nome, interesse e orçamento antes de encaminhar para a equipa.",
    canal: "whatsapp",
    triggerId: "primeira-mensagem",
    mensagem: "Olá {{nome}}! Para te ajudarmos melhor, qual é o teu principal interesse hoje?",
  },
  {
    id: "envio-precario",
    nome: "Envio de preçário",
    descricao: "Resposta automática com o preçário sempre que alguém escreve \"preços\".",
    canal: "whatsapp",
    triggerId: "palavra-chave",
    triggerConfig: { palavras: "preço, preços, valores, tabela" },
    mensagem: "Olá {{nome}}! Aqui está o nosso preçário atualizado. Qualquer dúvida, estamos à disposição 📋",
  },
  {
    id: "faq-automatico",
    nome: "FAQ automático",
    descricao: "Responde às 5 perguntas mais comuns dos teus clientes sem intervenção.",
    canal: "whatsapp",
    triggerId: "palavra-chave",
    triggerConfig: { palavras: "ajuda, dúvida, faq, info" },
    mensagem: "Olá {{nome}}! Aqui tens as respostas às perguntas mais frequentes 💬 Escreve o número da tua dúvida.",
  },
  {
    id: "comentario-dm",
    nome: "Comentário → DM com oferta",
    descricao: "Quem comentar numa publicação recebe uma DM automática com um link.",
    canal: "instagram",
    triggerId: "comentario-publicacao",
    mensagem: "Olá {{nome}}! Vimos o teu comentário 💜 Aqui está a oferta especial que prometemos: [link]",
  },
  {
    id: "sequencia-pos-lead",
    nome: "Sequência pós-lead",
    descricao: "3 emails ao longo de 7 dias para converter um novo lead em cliente.",
    canal: "email",
    triggerId: "contacto-segmento",
    triggerConfig: { segmento: "novos-contactos" },
    mensagem: "Olá {{nome}}, bem-vindo(a)! Nos próximos dias vamos partilhar mais sobre como podemos ajudar-te.",
  },
];

export type OnboardingStepId = "whatsapp" | "instagram" | "email" | "fluxo";

export const ONBOARDING_STEPS: { id: OnboardingStepId; titulo: string; opcional: boolean }[] = [
  { id: "whatsapp", titulo: "Ligar WhatsApp", opcional: false },
  { id: "instagram", titulo: "Ligar Instagram", opcional: true },
  { id: "email", titulo: "Configurar email", opcional: true },
  { id: "fluxo", titulo: "Criar primeiro fluxo", opcional: false },
];
