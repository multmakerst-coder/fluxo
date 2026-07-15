export type CanalSequencia = "whatsapp" | "instagram" | "email";
export type EstadoSequencia = "ativa" | "pausada" | "arquivada";
export type UnidadeDelay = "minutos" | "horas" | "dias";

export type PassoSequencia = {
  id: string;
  mensagem: string;
  delayValor: number;
  delayUnidade: UnidadeDelay;
  taxaResposta: number;
};

export type Sequencia = {
  id: string;
  nome: string;
  canal: CanalSequencia;
  estado: EstadoSequencia;
  contactosAtivos: number;
  taxaConclusao: number;
  removerSeRespondeu: boolean;
  passos: PassoSequencia[];
};

export const SEQUENCIAS: Sequencia[] = [
  {
    id: "seq-onboarding",
    nome: "Onboarding de novos clientes",
    canal: "whatsapp",
    estado: "ativa",
    contactosAtivos: 186,
    taxaConclusao: 74,
    removerSeRespondeu: false,
    passos: [
      { id: "p1", mensagem: "Olá! Bem-vindo(a) 👋 Estamos muito felizes por te ter connosco. Qualquer dúvida, é só responder aqui.", delayValor: 0, delayUnidade: "minutos", taxaResposta: 42 },
      { id: "p2", mensagem: "Já tiveste oportunidade de explorar a tua conta? Deixa-nos saber se precisares de ajuda.", delayValor: 1, delayUnidade: "dias", taxaResposta: 28 },
      { id: "p3", mensagem: "Aqui ficam algumas dicas rápidas para tirares o máximo proveito da plataforma.", delayValor: 3, delayUnidade: "dias", taxaResposta: 19 },
      { id: "p4", mensagem: "Como está a correr? Estamos aqui se precisares de alguma coisa.", delayValor: 7, delayUnidade: "dias", taxaResposta: 15 },
    ],
  },
  {
    id: "seq-carrinho",
    nome: "Recuperação de carrinho abandonado",
    canal: "whatsapp",
    estado: "ativa",
    contactosAtivos: 64,
    taxaConclusao: 51,
    removerSeRespondeu: true,
    passos: [
      { id: "p1", mensagem: "Reparámos que deixaste artigos no carrinho. Ainda estão à tua espera!", delayValor: 2, delayUnidade: "horas", taxaResposta: 22 },
      { id: "p2", mensagem: "Que tal finalizar a tua compra? Usa o código VOLTA10 para 10% de desconto.", delayValor: 1, delayUnidade: "dias", taxaResposta: 17 },
      { id: "p3", mensagem: "Última oportunidade — o teu desconto expira hoje!", delayValor: 3, delayUnidade: "dias", taxaResposta: 9 },
    ],
  },
  {
    id: "seq-nutricao-leads",
    nome: "Nutrição de leads — newsletter",
    canal: "email",
    estado: "pausada",
    contactosAtivos: 312,
    taxaConclusao: 38,
    removerSeRespondeu: false,
    passos: [
      { id: "p1", mensagem: "Obrigado por te inscreveres! Aqui está o teu guia de boas-vindas.", delayValor: 0, delayUnidade: "minutos", taxaResposta: 12 },
      { id: "p2", mensagem: "3 formas de tirar mais partido do teu plano.", delayValor: 2, delayUnidade: "dias", taxaResposta: 8 },
      { id: "p3", mensagem: "Casos de sucesso de outros clientes como tu.", delayValor: 5, delayUnidade: "dias", taxaResposta: 6 },
    ],
  },
  {
    id: "seq-reengajamento-ig",
    nome: "Reengajamento Instagram",
    canal: "instagram",
    estado: "pausada",
    contactosAtivos: 41,
    taxaConclusao: 29,
    removerSeRespondeu: true,
    passos: [
      { id: "p1", mensagem: "Há tempos que não falamos! Vimos que interagiste com o nosso último post 👀", delayValor: 0, delayUnidade: "minutos", taxaResposta: 18 },
      { id: "p2", mensagem: "Temos novidades que achamos que vais gostar. Queres saber mais?", delayValor: 2, delayUnidade: "dias", taxaResposta: 11 },
    ],
  },
  {
    id: "seq-pos-compra",
    nome: "Pós-compra e satisfação",
    canal: "whatsapp",
    estado: "arquivada",
    contactosAtivos: 0,
    taxaConclusao: 82,
    removerSeRespondeu: false,
    passos: [
      { id: "p1", mensagem: "A tua encomenda chegou? Esperamos que estejas satisfeito(a)!", delayValor: 3, delayUnidade: "dias", taxaResposta: 35 },
      { id: "p2", mensagem: "Adorávamos saber a tua opinião — deixas-nos uma avaliação?", delayValor: 6, delayUnidade: "dias", taxaResposta: 21 },
    ],
  },
];

export function getSequencia(id: string): Sequencia {
  const encontrada = SEQUENCIAS.find((s) => s.id === id);
  if (encontrada) return encontrada;
  return {
    id,
    nome: "Nova sequência",
    canal: "whatsapp",
    estado: "pausada",
    contactosAtivos: 0,
    taxaConclusao: 0,
    removerSeRespondeu: false,
    passos: [],
  };
}

export function badgeEstadoSequencia(estado: EstadoSequencia) {
  switch (estado) {
    case "ativa":
      return { label: "Ativa", className: "border-success/30 text-success" };
    case "pausada":
      return { label: "Pausada", className: "border-warning/30 text-warning" };
    case "arquivada":
    default:
      return { label: "Arquivada", className: "border-border text-muted-foreground" };
  }
}

export function labelCanal(canal: CanalSequencia) {
  switch (canal) {
    case "whatsapp":
      return "WhatsApp";
    case "instagram":
      return "Instagram";
    case "email":
      return "Email";
  }
}
