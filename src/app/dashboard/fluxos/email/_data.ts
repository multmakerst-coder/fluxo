export type EstadoFluxo = "ativo" | "inativo" | "rascunho";

export type FluxoEmail = {
  id: string;
  nome: string;
  estado: EstadoFluxo;
  triggerId: string;
  triggerLabel: string;
  dataCriacao: string;
  numeroAtivacoes: number;
};

export const FLUXOS_EMAIL: FluxoEmail[] = [
  {
    id: "em-1",
    nome: "Boas-vindas após inscrição na newsletter",
    estado: "ativo",
    triggerId: "formulario-submetido",
    triggerLabel: "Formulário submetido: Newsletter",
    dataCriacao: "2026-05-03",
    numeroAtivacoes: 2140,
  },
  {
    id: "em-2",
    nome: "Sequência para leads do webinar",
    estado: "ativo",
    triggerId: "formulario-submetido",
    triggerLabel: "Formulário submetido: Inscrição webinar",
    dataCriacao: "2026-05-12",
    numeroAtivacoes: 486,
  },
  {
    id: "em-3",
    nome: "Etiqueta 'cliente' aplicada",
    estado: "ativo",
    triggerId: "tag-aplicada",
    triggerLabel: "Etiqueta aplicada: Cliente",
    dataCriacao: "2026-05-20",
    numeroAtivacoes: 312,
  },
  {
    id: "em-4",
    nome: "Reenvio a quem não abriu",
    estado: "inativo",
    triggerId: "email-aberto",
    triggerLabel: "Email não aberto após 3 dias",
    dataCriacao: "2026-06-01",
    numeroAtivacoes: 158,
  },
  {
    id: "em-5",
    nome: "Segmento clientes ativos — resumo mensal",
    estado: "ativo",
    triggerId: "contacto-segmento",
    triggerLabel: "Contacto em segmento: Clientes ativos",
    dataCriacao: "2026-06-10",
    numeroAtivacoes: 674,
  },
  {
    id: "em-6",
    nome: "Clique em link de promoção",
    estado: "inativo",
    triggerId: "link-clicado",
    triggerLabel: "Link clicado: /promocoes",
    dataCriacao: "2026-06-17",
    numeroAtivacoes: 91,
  },
  {
    id: "em-7",
    nome: "Newsletter recorrente mensal",
    estado: "rascunho",
    triggerId: "data-intervalo",
    triggerLabel: "Data / intervalo: mensalmente",
    dataCriacao: "2026-06-27",
    numeroAtivacoes: 0,
  },
  {
    id: "em-8",
    nome: "Aniversário de subscrição",
    estado: "rascunho",
    triggerId: "data-intervalo",
    triggerLabel: "Data / intervalo: não repetir",
    dataCriacao: "2026-07-08",
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
