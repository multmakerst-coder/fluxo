"use client";

import { useState } from "react";
import { Plus, Trash2, Eye, EyeOff, RefreshCw, ShieldAlert, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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

interface Webhook {
  id: string;
  url: string;
  events: string[];
}

const AVAILABLE_EVENTS = [
  { id: "contact.created", label: "Novo contacto criado" },
  { id: "message.received", label: "Mensagem recebida" },
  { id: "message.sent", label: "Mensagem enviada" },
  { id: "flow.error", label: "Erro num fluxo" },
  { id: "conversation.tagged", label: "Conversa marcada com tag" },
];

const INITIAL_WEBHOOKS: Webhook[] = [
  { id: "wh1", url: "https://hooks.negocio.pt/fluxo/leads", events: ["contact.created", "message.received"] },
  { id: "wh2", url: "https://api.negocio.pt/webhooks/erros", events: ["flow.error"] },
];

function maskKey(key: string) {
  return `${key.slice(0, 8)}${"•".repeat(20)}${key.slice(-4)}`;
}

export default function ApiPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>(INITIAL_WEBHOOKS);
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newEvents, setNewEvents] = useState<string[]>([]);

  const [apiKey, setApiKey] = useState("fxa_live_8f3ndk29fh38fh938fhskd83hf9");
  const [keyVisible, setKeyVisible] = useState(false);
  const [regenerateOpen, setRegenerateOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);

  function toggleEvent(id: string) {
    setNewEvents((prev) => (prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]));
  }

  function createWebhook() {
    if (!newUrl.trim() || newEvents.length === 0) {
      toast.error("Indica um URL e pelo menos um evento");
      return;
    }
    setWebhooks((prev) => [...prev, { id: `wh-${Date.now()}`, url: newUrl.trim(), events: newEvents }]);
    toast.success("Webhook criado");
    setNewUrl("");
    setNewEvents([]);
    setWebhookDialogOpen(false);
  }

  function removeWebhook(id: string) {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast.success("Webhook removido");
  }

  function regenerateKey() {
    const random = Math.random().toString(36).slice(2, 30);
    setApiKey(`fxa_live_${random}`);
    setRegenerateOpen(false);
    setKeyVisible(true);
    toast.success("Nova chave de API gerada");
  }

  function revokeKey() {
    setApiKey("");
    setRevokeOpen(false);
    toast.success("Chave de API revogada");
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Chave de API</CardTitle>
          <CardDescription>
            Usa esta chave para autenticar pedidos à API do Fluxo.{" "}
            <a href="#" className="text-primary underline underline-offset-2">
              Consultar documentação da API <ExternalLink className="inline h-3 w-3" />
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {apiKey ? (
            <div className="flex flex-wrap items-center gap-2">
              <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-sm">
                {keyVisible ? apiKey : maskKey(apiKey)}
              </code>
              <Button variant="ghost" size="icon" onClick={() => setKeyVisible((v) => !v)} aria-label="Mostrar/ocultar chave">
                {keyVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Não tens nenhuma chave de API ativa.</p>
          )}

          <div className="flex flex-wrap gap-2">
            <Dialog open={regenerateOpen} onOpenChange={setRegenerateOpen}>
              <DialogTrigger render={<Button variant="outline"><RefreshCw className="h-4 w-4" /> Gerar nova chave</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gerar nova chave de API?</DialogTitle>
                  <DialogDescription>
                    A chave atual deixará de funcionar imediatamente. Todas as integrações que a usam terão de ser
                    atualizadas.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancelar</Button>} />
                  <Button onClick={regenerateKey}>Gerar nova chave</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={revokeOpen} onOpenChange={setRevokeOpen}>
              <DialogTrigger render={<Button variant="destructive"><ShieldAlert className="h-4 w-4" /> Revogar chave</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Revogar chave de API?</DialogTitle>
                  <DialogDescription>
                    Todas as integrações que usam esta chave vão parar de funcionar imediatamente. Esta ação não pode ser
                    revertida.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline">Cancelar</Button>} />
                  <Button variant="destructive" onClick={revokeKey}>Revogar chave</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <CardTitle>Webhooks</CardTitle>
            <CardDescription>Recebe eventos em tempo real num endpoint à tua escolha.</CardDescription>
          </div>
          <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
            <DialogTrigger render={<Button><Plus className="h-4 w-4" /> Novo webhook</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar novo webhook</DialogTitle>
                <DialogDescription>Escolhe o URL de destino e os eventos que queres receber.</DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="webhook-url">URL de destino</Label>
                  <Input
                    id="webhook-url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    placeholder="https://o-teu-servidor.pt/webhook"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Eventos</Label>
                  {AVAILABLE_EVENTS.map((event) => (
                    <label key={event.id} className="flex items-center gap-2.5 text-sm">
                      <Checkbox
                        checked={newEvents.includes(event.id)}
                        onCheckedChange={() => toggleEvent(event.id)}
                      />
                      {event.label}
                    </label>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <DialogClose render={<Button variant="outline">Cancelar</Button>} />
                <Button onClick={createWebhook}>Criar webhook</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Eventos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {webhooks.map((wh) => (
                <TableRow key={wh.id}>
                  <TableCell className="font-mono text-xs">{wh.url}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {wh.events.map((eventId) => (
                        <Badge key={eventId} variant="outline">
                          {AVAILABLE_EVENTS.find((e) => e.id === eventId)?.label ?? eventId}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon-sm" aria-label="Remover webhook" onClick={() => removeWebhook(wh.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {webhooks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-sm text-muted-foreground">
                    Ainda não tens webhooks configurados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
