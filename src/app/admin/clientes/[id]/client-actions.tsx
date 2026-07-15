"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle2, Tag, Trash2, Mail, ScanEye, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { PLANS, type PlanSlug } from "@/lib/plans";
import { PLAN_LABELS, type AdminClient, type ClientStatus } from "../_data";

const STATUS_BADGE: Record<ClientStatus, string> = {
  ativo: "bg-success/10 text-success",
  trial: "bg-info/10 text-info",
  suspenso: "bg-destructive/10 text-destructive",
  cancelado: "bg-muted text-muted-foreground",
};

export function ClientStatusBadge({ status }: { status: ClientStatus }) {
  return (
    <Badge variant="outline" className={cn("border-0", STATUS_BADGE[status])}>
      {status === "ativo" && "Ativo"}
      {status === "trial" && "Em teste"}
      {status === "suspenso" && "Suspenso"}
      {status === "cancelado" && "Cancelado"}
    </Badge>
  );
}

export function ClientAdminActions({ client }: { client: AdminClient }) {
  const router = useRouter();
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [plan, setPlan] = useState<PlanSlug>(client.plan);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<PlanSlug>(client.plan);

  function toggleSuspend() {
    if (status === "suspenso") {
      setStatus("ativo");
      toast.success(`Conta de ${client.name} reativada`);
    } else {
      setStatus("suspenso");
      toast.success(`Conta de ${client.name} suspensa`);
    }
  }

  function applyPlanChange() {
    setPlan(selectedPlan);
    setPlanDialogOpen(false);
    toast.success(`Plano de ${client.name} alterado para ${PLAN_LABELS[selectedPlan]}`);
  }

  function confirmDelete() {
    setDeleteDialogOpen(false);
    toast.success(`Conta de ${client.name} apagada em conformidade com o RGPD`);
    router.push("/admin/clientes");
  }

  function sendEmail() {
    setEmailDialogOpen(false);
    toast.success(`Email enviado para ${client.email}`);
    setEmailSubject("");
    setEmailBody("");
  }

  function impersonate() {
    toast.info(`A entrar na conta de ${client.name} (modo impersonação)`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <ClientStatusBadge status={status} />

      <Button variant={status === "suspenso" ? "default" : "outline"} onClick={toggleSuspend}>
        {status === "suspenso" ? (
          <>
            <CheckCircle2 className="h-4 w-4" /> Reativar conta
          </>
        ) : (
          <>
            <Ban className="h-4 w-4" /> Suspender conta
          </>
        )}
      </Button>

      <Dialog open={planDialogOpen} onOpenChange={(open) => {
        setPlanDialogOpen(open);
        if (open) setSelectedPlan(plan);
      }}>
        <DialogTrigger render={<Button variant="outline"><Tag className="h-4 w-4" /> Alterar plano</Button>} />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar plano de {client.name}</DialogTitle>
            <DialogDescription>Plano atual: {PLAN_LABELS[plan]}. Escolhe o novo plano abaixo.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            {PLANS.map((p) => (
              <button
                key={p.slug}
                type="button"
                onClick={() => setSelectedPlan(p.slug)}
                className={cn(
                  "flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                  selectedPlan === p.slug ? "border-primary bg-primary/5" : "border-border hover:bg-muted",
                )}
              >
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.tagline}</p>
                </div>
                <p className="text-sm font-semibold">
                  {p.isCustomPrice ? "Personalizado" : p.priceMonthly === 0 ? "Grátis" : `€${p.priceMonthly}/mês`}
                </p>
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlanDialogOpen(false)}>Cancelar</Button>
            <Button onClick={applyPlanChange}>Guardar alteração</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogTrigger render={<Button variant="outline"><Mail className="h-4 w-4" /> Enviar email</Button>} />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Enviar email a {client.name}</DialogTitle>
            <DialogDescription>O email será enviado para {client.email}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-subject">Assunto</Label>
              <Input id="email-subject" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} placeholder="Assunto do email" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-body">Mensagem</Label>
              <Textarea id="email-body" value={emailBody} onChange={(e) => setEmailBody(e.target.value)} placeholder="Escreve a mensagem..." rows={5} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancelar</Button>
            <Button onClick={sendEmail} disabled={!emailSubject.trim() || !emailBody.trim()}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" onClick={impersonate}><ScanEye className="h-4 w-4" /> Impersonar</Button>} />
        <TooltipContent>Entra na conta do cliente para ver a plataforma tal como ele a vê. Fica registado nos logs de auditoria.</TooltipContent>
      </Tooltip>

      <Dialog open={deleteDialogOpen} onOpenChange={(open) => {
        setDeleteDialogOpen(open);
        if (!open) setDeleteConfirmText("");
      }}>
        <DialogTrigger render={<Button variant="destructive"><Trash2 className="h-4 w-4" /> Apagar conta (RGPD)</Button>} />
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Apagar conta de {client.name}</DialogTitle>
            <DialogDescription>Esta ação está relacionada com um pedido de apagamento ao abrigo do RGPD.</DialogDescription>
          </DialogHeader>
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Esta ação é irreversível</AlertTitle>
            <AlertDescription>
              Todos os dados do cliente — contactos, conversas, fluxos e histórico de faturação — serão permanentemente
              apagados e não podem ser recuperados.
            </AlertDescription>
          </Alert>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="delete-confirm">Escreve <span className="font-semibold">APAGAR</span> para confirmar</Label>
            <Input id="delete-confirm" value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="APAGAR" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancelar</Button>
            <Button variant="destructive" disabled={deleteConfirmText !== "APAGAR"} onClick={confirmDelete}>
              Apagar definitivamente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
