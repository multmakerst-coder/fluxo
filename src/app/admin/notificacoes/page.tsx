"use client";

import { useState } from "react";
import { Mail, Megaphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ADMIN_CLIENTS } from "@/app/admin/clientes/_data";
import {
  COMMUNICATIONS_HISTORY,
  AUDIENCE_LABELS,
  type Communication,
  type CommunicationType,
  type Audience,
} from "./_data";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function audienceCount(audience: Audience) {
  if (audience === "todos") return ADMIN_CLIENTS.length;
  return ADMIN_CLIENTS.filter((c) => c.plan === audience).length;
}

const TYPE_CONFIG: Record<CommunicationType, { label: string; className: string; icon: typeof Mail }> = {
  email: { label: "Email", className: "bg-info/10 text-info", icon: Mail },
  "in-app": { label: "Notificação in-app", className: "bg-primary/10 text-primary", icon: Megaphone },
};

const emptyEmailForm = { audience: "todos" as Audience, subject: "", content: "" };
const emptyInAppForm = { audience: "todos" as Audience, subject: "", content: "" };

export default function AdminNotificacoesPage() {
  const [history, setHistory] = useState<Communication[]>(COMMUNICATIONS_HISTORY);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [inAppDialogOpen, setInAppDialogOpen] = useState(false);
  const [emailForm, setEmailForm] = useState(emptyEmailForm);
  const [inAppForm, setInAppForm] = useState(emptyInAppForm);

  function sendEmail() {
    if (!emailForm.subject.trim() || !emailForm.content.trim()) return;
    const communication: Communication = {
      id: `com-${Date.now()}`,
      type: "email",
      audience: emailForm.audience,
      subject: emailForm.subject,
      content: emailForm.content,
      sentAt: new Date().toISOString(),
      recipientsCount: audienceCount(emailForm.audience),
    };
    setHistory((prev) => [communication, ...prev]);
    toast.success(`Email enviado para ${communication.recipientsCount} clientes`);
    setEmailForm(emptyEmailForm);
    setEmailDialogOpen(false);
  }

  function createInApp() {
    if (!inAppForm.subject.trim() || !inAppForm.content.trim()) return;
    const communication: Communication = {
      id: `com-${Date.now()}`,
      type: "in-app",
      audience: inAppForm.audience,
      subject: inAppForm.subject,
      content: inAppForm.content,
      sentAt: new Date().toISOString(),
      recipientsCount: audienceCount(inAppForm.audience),
    };
    setHistory((prev) => [communication, ...prev]);
    toast.success(`Notificação in-app criada para ${communication.recipientsCount} clientes`);
    setInAppForm(emptyInAppForm);
    setInAppDialogOpen(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Notificações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Envia comunicações em massa por email ou notificações in-app.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Email em massa</CardTitle>
            <CardDescription>Envia um email para todos os clientes ou para um plano específico.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
              <DialogTrigger render={<Button><Mail className="h-4 w-4" /> Enviar email em massa</Button>} />
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Enviar email em massa</DialogTitle>
                  <DialogDescription>Escolhe os destinatários e escreve a mensagem a enviar.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label>Destinatários</Label>
                    <Select value={emailForm.audience} onValueChange={(v) => setEmailForm({ ...emailForm, audience: (v ?? "todos") as Audience })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os clientes ({audienceCount("todos")})</SelectItem>
                        <SelectItem value="gratuito">Plano Gratuito ({audienceCount("gratuito")})</SelectItem>
                        <SelectItem value="pro">Plano Pro ({audienceCount("pro")})</SelectItem>
                        <SelectItem value="empresas">Plano Empresas ({audienceCount("empresas")})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email-subject">Assunto</Label>
                    <Input id="email-subject" value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email-content">Conteúdo</Label>
                    <Textarea id="email-content" rows={5} value={emailForm.content} onChange={(e) => setEmailForm({ ...emailForm, content: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEmailDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={sendEmail} disabled={!emailForm.subject.trim() || !emailForm.content.trim()}>Enviar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificação in-app</CardTitle>
            <CardDescription>Cria uma notificação que aparece dentro da plataforma para os clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={inAppDialogOpen} onOpenChange={setInAppDialogOpen}>
              <DialogTrigger render={<Button variant="outline"><Megaphone className="h-4 w-4" /> Criar notificação in-app</Button>} />
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar notificação in-app</DialogTitle>
                  <DialogDescription>A notificação aparece no sino de notificações da plataforma dos clientes.</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label>Destinatários</Label>
                    <Select value={inAppForm.audience} onValueChange={(v) => setInAppForm({ ...inAppForm, audience: (v ?? "todos") as Audience })}>
                      <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos os clientes ({audienceCount("todos")})</SelectItem>
                        <SelectItem value="gratuito">Plano Gratuito ({audienceCount("gratuito")})</SelectItem>
                        <SelectItem value="pro">Plano Pro ({audienceCount("pro")})</SelectItem>
                        <SelectItem value="empresas">Plano Empresas ({audienceCount("empresas")})</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="inapp-subject">Título</Label>
                    <Input id="inapp-subject" value={inAppForm.subject} onChange={(e) => setInAppForm({ ...inAppForm, subject: e.target.value })} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="inapp-content">Mensagem</Label>
                    <Textarea id="inapp-content" rows={5} value={inAppForm.content} onChange={(e) => setInAppForm({ ...inAppForm, content: e.target.value })} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setInAppDialogOpen(false)}>Cancelar</Button>
                  <Button onClick={createInApp} disabled={!inAppForm.subject.trim() || !inAppForm.content.trim()}>Criar notificação</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de comunicações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead>Destinatários</TableHead>
                  <TableHead>Nº de clientes</TableHead>
                  <TableHead>Enviado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((c) => {
                  const config = TYPE_CONFIG[c.type];
                  return (
                    <TableRow key={c.id}>
                      <TableCell>
                        <Badge variant="outline" className={cn("gap-1 border-0", config.className)}>
                          <config.icon className="h-3 w-3" /> {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{c.subject}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{AUDIENCE_LABELS[c.audience]}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.recipientsCount}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDateTime(c.sentAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
