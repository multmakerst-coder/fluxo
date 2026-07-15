"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Hash, MoreVertical, Pencil, Copy, Trash2, Plus, Zap } from "lucide-react";

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
import { FLUXOS_EMAIL, badgeEstadoFluxo, formatarData, type FluxoEmail } from "./_data";
import { EmailEditorDialog } from "./email-editor-dialog";
import { cn } from "@/lib/utils";

const TRIGGERS = getTriggersForChannel("email");

export default function FluxosEmailPage() {
  const router = useRouter();
  const [fluxos, setFluxos] = useState<FluxoEmail[]>(FLUXOS_EMAIL);
  const [criarOpen, setCriarOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [triggerId, setTriggerId] = useState(TRIGGERS[0]?.id ?? "");
  const [deleteTarget, setDeleteTarget] = useState<FluxoEmail | null>(null);

  function handleToggle(id: string, checked: boolean) {
    setFluxos((prev) =>
      prev.map((f) => (f.id === id ? { ...f, estado: checked ? "ativo" : "inativo" } : f)),
    );
    toast(checked ? "Fluxo ativado" : "Fluxo desativado");
  }

  function handleDuplicar(fluxo: FluxoEmail) {
    const copia: FluxoEmail = {
      ...fluxo,
      id: `em-${Date.now()}`,
      nome: `${fluxo.nome} (cópia)`,
      estado: "rascunho",
      numeroAtivacoes: 0,
      dataCriacao: new Date().toISOString().slice(0, 10),
    };
    setFluxos((prev) => [copia, ...prev]);
    toast.success("Fluxo duplicado.");
  }

  function handleEliminar() {
    if (!deleteTarget) return;
    setFluxos((prev) => prev.filter((f) => f.id !== deleteTarget.id));
    toast.success("Fluxo eliminado.");
    setDeleteTarget(null);
  }

  function handleCriar() {
    if (!nome.trim()) {
      toast.error("Dá um nome ao fluxo antes de continuar.");
      return;
    }
    const trigger = TRIGGERS.find((t) => t.id === triggerId);
    const novo: FluxoEmail = {
      id: `em-${Date.now()}`,
      nome: nome.trim(),
      estado: "rascunho",
      triggerId,
      triggerLabel: trigger?.label ?? "",
      dataCriacao: new Date().toISOString().slice(0, 10),
      numeroAtivacoes: 0,
    };
    setFluxos((prev) => [novo, ...prev]);
    setCriarOpen(false);
    setNome("");
    setTriggerId(TRIGGERS[0]?.id ?? "");
    router.push(`/dashboard/fluxos/email/${novo.id}`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Fluxos de Email</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Automatiza sequências e respostas de email consoante o comportamento dos contactos.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <EmailEditorDialog />
          <Dialog open={criarOpen} onOpenChange={setCriarOpen}>
            <DialogTrigger render={<Button><Plus />Criar fluxo</Button>} />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar fluxo de email</DialogTitle>
                <DialogDescription>
                  Dá um nome ao fluxo e escolhe o gatilho que o vai iniciar.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="nome-fluxo-em">Nome do fluxo</Label>
                  <Input
                    id="nome-fluxo-em"
                    placeholder="Ex: Boas-vindas após inscrição"
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
                <Button onClick={handleCriar}>Criar fluxo</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

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
                    <Link href={`/dashboard/fluxos/email/${fluxo.id}`} className="hover:text-primary">
                      {fluxo.nome}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        size="sm"
                        checked={fluxo.estado === "ativo"}
                        onCheckedChange={(checked) => handleToggle(fluxo.id, checked)}
                        disabled={fluxo.estado === "rascunho"}
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
                            <Link href={`/dashboard/fluxos/email/${fluxo.id}`}>
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

      {fluxos.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Ainda não tens fluxos de email. Cria o primeiro para começar a automatizar.
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
