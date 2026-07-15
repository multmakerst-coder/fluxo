"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { INTEGRATIONS, type Integration, type IntegrationStatus } from "./_data";

const STATUS_BADGE: Record<IntegrationStatus, { label: string; className: string }> = {
  ligado: { label: "Ligado", className: "bg-success/10 text-success" },
  "nao-ligado": { label: "Não ligado", className: "bg-muted text-muted-foreground" },
  brevemente: { label: "Brevemente", className: "bg-brand-accent/15 text-brand-accent" },
};

export default function IntegracoesPage() {
  const [statuses, setStatuses] = useState<Record<string, IntegrationStatus>>(() =>
    Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.status])),
  );
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);
  const [fieldValue, setFieldValue] = useState("");

  function openDialog(integration: Integration) {
    setActiveIntegration(integration);
    setFieldValue("");
  }

  function closeDialog() {
    setActiveIntegration(null);
    setFieldValue("");
  }

  function handleSave() {
    if (!activeIntegration) return;
    setStatuses((prev) => ({ ...prev, [activeIntegration.id]: "ligado" }));
    toast.success(`${activeIntegration.name} configurado com sucesso`);
    closeDialog();
  }

  function handleDisconnect(integration: Integration) {
    setStatuses((prev) => ({ ...prev, [integration.id]: "nao-ligado" }));
    toast.success(`${integration.name} foi desligado`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Integrações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Liga o Fluxo às ferramentas que já usas para automatizar todo o teu fluxo de trabalho.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((integration) => {
          const Icon = integration.icon;
          const status = statuses[integration.id];
          const badge = STATUS_BADGE[status];
          const disabled = status === "brevemente";

          return (
            <Card key={integration.id} className={cn(disabled && "opacity-70")}>
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <Badge variant="outline" className={cn("border-0", badge.className)}>
                    {badge.label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="font-medium">{integration.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{integration.description}</p>
                </div>

                {status === "ligado" ? (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => openDialog(integration)}>
                      Configurar
                    </Button>
                    <Button variant="ghost" className="text-destructive" onClick={() => handleDisconnect(integration)}>
                      Desligar
                    </Button>
                  </div>
                ) : status === "nao-ligado" ? (
                  <Button className="w-full" onClick={() => openDialog(integration)}>
                    Ligar
                  </Button>
                ) : (
                  <Button className="w-full" disabled>
                    Brevemente
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={activeIntegration !== null} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          {activeIntegration && (
            <>
              <DialogHeader>
                <DialogTitle>Configurar {activeIntegration.name}</DialogTitle>
                <DialogDescription>{activeIntegration.description}</DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="integration-field">{activeIntegration.configFieldLabel}</Label>
                <Input
                  id="integration-field"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder={activeIntegration.configFieldPlaceholder}
                />
              </div>

              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancelar</Button>} />
                <Button onClick={handleSave}>Guardar</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
