"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Linha = {
  label: string;
  valor: number;
  total: number;
  corClasse: string;
};

export function BroadcastRelatorioDialog({
  open,
  onOpenChange,
  titulo,
  linhas,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titulo: string;
  linhas: Linha[];
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Relatório do broadcast</DialogTitle>
          <DialogDescription>{titulo}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-5">
          {linhas.map((linha) => {
            const percent = linha.total > 0 ? Math.round((linha.valor / linha.total) * 100) : 0;
            return (
              <div key={linha.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{linha.label}</span>
                  <span className="text-muted-foreground">
                    {linha.valor.toLocaleString("pt-PT")} · {percent}%
                  </span>
                </div>
                <div className="relative flex h-1.5 w-full items-center overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full transition-all", linha.corClasse)}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
