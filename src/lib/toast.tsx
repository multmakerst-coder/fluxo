"use client";

import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

// Indicador de "Salvo" com a identidade visual da marca (roxo/--primary), em vez
// do toast verde genérico do Sonner. Usar sempre que uma ação guarda/persiste um
// valor (definições, perfil, planos, etc.) — para ações transitórias que não são
// "guardar algo" (ex.: "mensagem enviada", "cupão removido") o toast.success
// normal continua adequado.
export function toastSaved(message = "Salvo", description?: string) {
  toast.custom(
    () => (
      <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-popover px-4 py-3 text-sm shadow-lg">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2.25} />
        </span>
        <div className="min-w-0">
          <p className="font-medium text-foreground">{message}</p>
          {description && <p className="truncate text-xs text-muted-foreground">{description}</p>}
        </div>
      </div>
    ),
    { duration: 2200 },
  );
}
