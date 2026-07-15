export type EstadoFluxo = "active" | "inactive" | "draft";

export type FluxoWhatsapp = {
  id: string;
  nome: string;
  estado: EstadoFluxo;
  triggerId: string;
  triggerLabel: string;
  dataCriacao: string;
  numeroAtivacoes: number;
};

export function badgeEstadoFluxo(estado: EstadoFluxo) {
  switch (estado) {
    case "active":
      return { label: "Ativo", className: "border-success/30 text-success" };
    case "draft":
      return { label: "Rascunho", className: "border-border text-muted-foreground" };
    case "inactive":
    default:
      return { label: "Inativo", className: "border-warning/30 text-warning" };
  }
}

export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}
