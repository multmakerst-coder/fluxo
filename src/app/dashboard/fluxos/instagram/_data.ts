export type EstadoFluxo = "ativo" | "inativo" | "rascunho";

export type FluxoInstagram = {
  id: string;
  nome: string;
  estado: EstadoFluxo;
  triggerId: string;
  triggerLabel: string;
  dataCriacao: string;
  numeroAtivacoes: number;
};

export const FLUXOS_INSTAGRAM: FluxoInstagram[] = [
  {
    id: "ig-1",
    nome: "Comentário 'quero' no post de lançamento",
    estado: "ativo",
    triggerId: "comentario-publicacao",
    triggerLabel: "Comentário em publicação: quero, preço",
    dataCriacao: "2026-05-04",
    numeroAtivacoes: 956,
  },
  {
    id: "ig-2",
    nome: "Agradecimento por menção em story",
    estado: "ativo",
    triggerId: "mencao-story",
    triggerLabel: "Menção em story",
    dataCriacao: "2026-05-14",
    numeroAtivacoes: 214,
  },
  {
    id: "ig-3",
    nome: "Boas-vindas a novos seguidores",
    estado: "ativo",
    triggerId: "novo-seguidor",
    triggerLabel: "Novo seguidor",
    dataCriacao: "2026-05-22",
    numeroAtivacoes: 1802,
  },
  {
    id: "ig-4",
    nome: "Resposta a enquete em story",
    estado: "inativo",
    triggerId: "resposta-story",
    triggerLabel: "Resposta a story",
    dataCriacao: "2026-06-02",
    numeroAtivacoes: 88,
  },
  {
    id: "ig-5",
    nome: "DM automática com código promo",
    estado: "ativo",
    triggerId: "dm-palavra-chave",
    triggerLabel: "DM com palavra-chave: promo, desconto",
    dataCriacao: "2026-06-11",
    numeroAtivacoes: 431,
  },
  {
    id: "ig-6",
    nome: "Obrigado por partilhares o nosso post",
    estado: "inativo",
    triggerId: "partilha-story",
    triggerLabel: "Partilha para story",
    dataCriacao: "2026-06-19",
    numeroAtivacoes: 63,
  },
  {
    id: "ig-7",
    nome: "Concurso de comentários — sorteio",
    estado: "rascunho",
    triggerId: "comentario-publicacao",
    triggerLabel: "Comentário em publicação: participo, eu quero",
    dataCriacao: "2026-06-30",
    numeroAtivacoes: 0,
  },
  {
    id: "ig-8",
    nome: "DM de boas-vindas a novos seguidores",
    estado: "rascunho",
    triggerId: "novo-seguidor",
    triggerLabel: "Novo seguidor",
    dataCriacao: "2026-07-06",
    numeroAtivacoes: 0,
  },
];

export function badgeEstadoFluxo(estado: EstadoFluxo) {
  switch (estado) {
    case "ativo":
      return { label: "Ativo", className: "border-success/30 text-success" };
    case "rascunho":
      return { label: "Rascunho", className: "border-border text-muted-foreground" };
    case "inativo":
    default:
      return { label: "Inativo", className: "border-warning/30 text-warning" };
  }
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}
