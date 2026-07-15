"use client";

import { useState } from "react";
import { MessageCircle, Camera, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Status = "ligado" | "desligado";

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0", status === "ligado" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}
    >
      {status === "ligado" ? "Ligado" : "Desligado"}
    </Badge>
  );
}

function ConfirmRemoveDialog({ channelName, onConfirm }: { channelName: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive">Remover ligação</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover {channelName}?</DialogTitle>
          <DialogDescription>
            Isto vai desligar o canal e parar todos os fluxos associados. Podes voltar a ligar mais tarde.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function CanaisPage() {
  const [whatsappStatus, setWhatsappStatus] = useState<Status>("ligado");
  const [whatsappNumber, setWhatsappNumber] = useState("+351 912 345 678");

  const [instagramStatus, setInstagramStatus] = useState<Status>("desligado");
  const instagramPermissions = [
    "Ler mensagens diretas",
    "Enviar mensagens diretas",
    "Aceder a comentários de publicações",
    "Gerir metadados da conta business",
  ];

  const [emailStatus, setEmailStatus] = useState<Status>("ligado");
  const [emailDomain, setEmailDomain] = useState("envio.negocio.pt");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <CardTitle>WhatsApp</CardTitle>
              <CardDescription>Liga o número de WhatsApp Business para automatizar conversas.</CardDescription>
            </div>
          </div>
          <StatusBadge status={whatsappStatus} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {whatsappStatus === "ligado" ? (
            <>
              <div className="flex flex-col gap-1.5 sm:max-w-sm">
                <Label>Número de telefone ativo</Label>
                <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => toast.success("Número atualizado")}>Guardar número</Button>
                <ConfirmRemoveDialog channelName="WhatsApp" onConfirm={() => setWhatsappStatus("desligado")} />
              </div>
            </>
          ) : (
            <Button onClick={() => { setWhatsappStatus("ligado"); toast.success("WhatsApp ligado"); }}>
              Ligar WhatsApp
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Camera className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <CardTitle>Instagram</CardTitle>
              <CardDescription>Liga a tua conta Instagram Business para automatizar DMs e comentários.</CardDescription>
            </div>
          </div>
          <StatusBadge status={instagramStatus} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {instagramStatus === "ligado" ? (
            <>
              <div>
                <Label className="mb-2 block">Permissões concedidas</Label>
                <ul className="flex flex-col gap-1.5">
                  {instagramPermissions.map((p) => (
                    <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-success" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <ConfirmRemoveDialog channelName="Instagram" onConfirm={() => setInstagramStatus("desligado")} />
            </>
          ) : (
            <Button onClick={() => { setInstagramStatus("ligado"); toast.success("Instagram ligado"); }}>
              Ligar Instagram
            </Button>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
              <Mail className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <CardTitle>Email</CardTitle>
              <CardDescription>Configura o domínio de envio personalizado para os teus emails.</CardDescription>
            </div>
          </div>
          <StatusBadge status={emailStatus} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {emailStatus === "ligado" ? (
            <>
              <div className="flex flex-col gap-1.5 sm:max-w-sm">
                <Label>Domínio de envio personalizado</Label>
                <Input value={emailDomain} onChange={(e) => setEmailDomain(e.target.value)} />
              </div>

              <Accordion>
                <AccordionItem value="dns">
                  <AccordionTrigger>Guia de configuração DNS (SPF/DKIM)</AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                      <div>
                        <p className="font-medium text-foreground">1. Adiciona o registo SPF</p>
                        <p>
                          No painel de DNS do teu domínio, adiciona um registo TXT com o valor{" "}
                          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">v=spf1 include:mail.fluxo.pt ~all</code>.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">2. Adiciona o registo DKIM</p>
                        <p>
                          Cria um registo CNAME <code className="rounded bg-muted px-1.5 py-0.5 text-xs">fluxo._domainkey</code>{" "}
                          apontando para <code className="rounded bg-muted px-1.5 py-0.5 text-xs">dkim.fluxo.pt</code>.
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">3. Verifica a propagação</p>
                        <p>A propagação de DNS pode demorar até 48 horas. Verifica o estado abaixo depois de configurar.</p>
                      </div>
                      <Button variant="outline" size="sm" className="self-start" onClick={() => toast.success("Configuração DNS verificada com sucesso")}>
                        Verificar configuração DNS
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => toast.success("Domínio atualizado")}>Guardar domínio</Button>
                <ConfirmRemoveDialog channelName="Email" onConfirm={() => setEmailStatus("desligado")} />
              </div>
            </>
          ) : (
            <Button onClick={() => { setEmailStatus("ligado"); toast.success("Email ligado"); }}>
              Ligar Email
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
