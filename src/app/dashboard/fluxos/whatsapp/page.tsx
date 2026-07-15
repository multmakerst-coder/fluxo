"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hash, MoreVertical, Pencil, Copy, Trash2, Plus, Zap, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

import { getTriggersForChannel } from "@/lib/flow-blocks";
import { badgeEstadoFluxo, formatarData, type FluxoWhatsapp } from "./_data";
import { cn } from "@/lib/utils";

const TRIGGERS = getTriggersForChannel("whatsapp");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapFlowRow(row: any): FluxoWhatsapp {
  const trigger = TRIGGERS.find((t) => t.id === row.trigger_type);
  return {
    id: row.id,
    nome: row.name,
    estado: row.status,
    triggerId: row.trigger_type,
    triggerLabel: trigger?.label ?? row.trigger_type,
    dataCriacao: row.created_at,
    numeroAtivacoes: row.activations_count ?? 0,
  };
}

export default function FluxosWhatsappPage() {
  const router = useRouter();
  const [fluxos, setFluxos] = useState<FluxoWhatsapp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [criarOpen, setCriarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [nome, setNome] = useState("");
  const [triggerId, setTriggerId] = useState(TRIGGERS[0]?.id ?? "");
  const [deleteTarget, setDeleteTarget] = useState<FluxoWhatsapp | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/flows?channel=whatsapp");
        if (!response.ok) throw new Error("Erro ao carregar fluxos");
        const { flows } = await response.json();
        if (!cancelled) setFluxos((flows ?? []).map(mapFlowRow));
      } catch (error) {
        console.error(error);
        if (!cancelled) toast.error("Não foi possível carregar os fluxos");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleToggle(id: string, checked: boolean) {
    const previous = fluxos;
    setFluxos((prev) =>
      prev.map((f) => (f.id === id ? { ...f, estado: checked ? "active" : "inactive" } : f)),
    );
    try {
      const response = await fetch(`/api/flows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: checked ? "active" : "inactive" }),
      });
      if (!response.ok) throw new Error();
      toast(checked ? "Fluxo ativado" : "Fluxo desativado");
    } catch {
      setFluxos(previous);
      toast.error("Não foi possível atualizar o estado do fluxo");
    }
  }

  async function handleDuplicar(fluxo: FluxoWhatsapp) {
    try {
      const createResponse = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "whatsapp",
          name: `${fluxo.nome} (cópia)`,
          triggerId: fluxo.triggerId,
        }),
      });
      if (!createResponse.ok) throw new Error();
      const { flow: created } = await createResponse.json();

      const { flow: original } = await (await fetch(`/api/flows/${fluxo.id}`)).json();
      if (original) {
        await fetch(`/api/flows/${created.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nodes: original.nodes, edges: original.edges }),
        });
      }

      setFluxos((prev) => [mapFlowRow(created), ...prev]);
      toast.success("Fluxo duplicado.");
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível duplicar o fluxo");
    }
  }

  async function handleEliminar() {
    if (!deleteTarget) return;
    try {
      const response = await fetch(`/api/flows/${deleteTarget.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setFluxos((prev) => prev.filter((f) => f.id !== deleteTarget.id));
      toast.success("Fluxo eliminado.");
    } catch {
      toast.error("Não foi possível eliminar o fluxo");
    } finally {
      setDeleteTarget(null);
    }
  }

  async function handleCriar() {
    if (!nome.trim()) {
      toast.error("Dá um nome ao fluxo antes de continuar.");
      return;
    }
    setIsCreating(true);
    try {
      const response = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "whatsapp", name: nome.trim(), triggerId }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Erro ao criar fluxo");
      }
      const { flow } = await response.json();
      setCriarOpen(false);
      setNome("");
      setTriggerId(TRIGGERS[0]?.id ?? "");
      router.push(`/dashboard/fluxos/whatsapp/${flow.id}`);
    } catch (error) {
      toast.error("Não foi possível criar o fluxo", {
        description: error instanceof Error ? error.message : "Erro desconhecido",
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Fluxos de WhatsApp</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Automatiza conversas de WhatsApp com gatilhos, mensagens e ações.
          </p>
        </div>
        <Dialog open={criarOpen} onOpenChange={setCriarOpen}>
          <DialogTrigger render={<Button><Plus />Criar fluxo</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar fluxo de WhatsApp</DialogTitle>
              <DialogDescription>
                Dá um nome ao fluxo e escolhe o gatilho que o vai iniciar.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="nome-fluxo-wa">Nome do fluxo</Label>
                <Input
                  id="nome-fluxo-wa"
                  placeholder="Ex: Boas-vindas a novos contactos"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Gatilho inicial</Label>
                <Select value={triggerId} onValueChange={(v) => v && setTriggerId(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRIGGERS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setCriarOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCriar} disabled={isCreating}>
                {isCreating && <Loader2 className="animate-spin" />} Criar fluxo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> A carregar fluxos…
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Gatilho</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ativações</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {fluxos.map((fluxo) => {
                const estado = badgeEstadoFluxo(fluxo.estado);
                return (
                  <TableRow key={fluxo.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/fluxos/whatsapp/${fluxo.id}`} className="hover:text-primary">
                        {fluxo.nome}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          size="sm"
                          checked={fluxo.estado === "active"}
                          onCheckedChange={(checked) => handleToggle(fluxo.id, checked)}
                          disabled={fluxo.estado === "draft"}
                        />
                        <Badge variant="outline" className={cn(estado.className)}>
                          {estado.label}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Hash className="h-3.5 w-3.5" />
                        {fluxo.triggerLabel}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatarData(fluxo.dataCriacao)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <Zap className="h-3.5 w-3.5" />
                        {fluxo.numeroAtivacoes.toLocaleString("pt-PT")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon-sm">
                              <MoreVertical />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            render={
                              <Link href={`/dashboard/fluxos/whatsapp/${fluxo.id}`}>
                                <Pencil className="h-3.5 w-3.5" />
                                Editar
                              </Link>
                            }
                          />
                          <DropdownMenuItem onClick={() => handleDuplicar(fluxo)}>
                            <Copy className="h-3.5 w-3.5" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget(fluxo)}>
                            <Trash2 className="h-3.5 w-3.5" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && fluxos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Ainda não tens fluxos de WhatsApp. Cria o primeiro para começar a automatizar.
          </CardContent>
        </Card>
      )}

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar fluxo?</DialogTitle>
            <DialogDescription>
              Tens a certeza que queres eliminar &ldquo;{deleteTarget?.nome}&rdquo;? Esta ação não pode ser
              revertida.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleEliminar}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
