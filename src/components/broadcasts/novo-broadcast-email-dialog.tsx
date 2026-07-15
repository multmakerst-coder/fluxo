"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, Plus, Send, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type BroadcastRow } from "@/app/dashboard/broadcasts/_data";
import { toast } from "sonner";

type Tag = { id: string; name: string; color: string };

export function NovoBroadcastEmailDialog({
  onCriado,
}: {
  onCriado: (broadcast: BroadcastRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nome, setNome] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagId, setTagId] = useState<string>("todos");
  const [assunto, setAssunto] = useState("");
  const [corpo, setCorpo] = useState("");
  const [momento, setMomento] = useState<"imediato" | "agendado">("imediato");
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState("09:00");

  useEffect(() => {
    if (!open) return;
    fetch("/api/tags")
      .then((r) => (r.ok ? r.json() : { tags: [] }))
      .then(({ tags }) => setTags(tags ?? []))
      .catch(() => setTags([]));
  }, [open]);

  function limpar() {
    setNome("");
    setTagId("todos");
    setAssunto("");
    setCorpo("");
    setMomento("imediato");
    setData(undefined);
    setHora("09:00");
  }

  async function criar() {
    if (!nome.trim() || !assunto.trim()) {
      toast.error("Preenche o nome e o assunto do email.");
      return;
    }
    if (momento === "agendado" && !data) {
      toast.error("Escolhe uma data para agendar o envio.");
      return;
    }

    let scheduledAt: string | null = null;
    if (momento === "agendado" && data) {
      const [h, m] = hora.split(":").map(Number);
      const d = new Date(data);
      d.setHours(h, m, 0, 0);
      scheduledAt = d.toISOString();
    }

    const tag = tags.find((t) => t.id === tagId);

    setIsSaving(true);
    try {
      const response = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "email",
          name: nome.trim(),
          content: {
            assunto: assunto.trim(),
            corpo: corpo.trim() || "Sem conteúdo adicional.",
            audienceTagId: tag?.id ?? null,
            audienceTagNome: tag?.name ?? "Todos os contactos",
          },
          scheduledAt,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? "Erro ao criar broadcast");

      onCriado(body.broadcast);
      toast.success(momento === "imediato" ? "Email enviado." : "Email agendado com sucesso.");
      setOpen(false);
      limpar();
    } catch (error) {
      toast.error("Não foi possível criar o broadcast", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button><Plus />Novo broadcast</Button>} />
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo broadcast de email</DialogTitle>
          <DialogDescription>Envia um email em massa aos teus contactos reais com endereço de email.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nome-broadcast-email">Nome do broadcast</Label>
            <Input id="nome-broadcast-email" placeholder="Ex: Newsletter de julho" value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Audiência</Label>
            <Select value={tagId} onValueChange={(value) => setTagId(value ?? "todos")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os contactos</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    Com a tag &ldquo;{t.name}&rdquo;
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Envio</Label>
            <Tabs value={momento} onValueChange={(v) => setMomento(v as "imediato" | "agendado")}>
              <TabsList>
                <TabsTrigger value="imediato">Imediato</TabsTrigger>
                <TabsTrigger value="agendado">Agendar</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="assunto-broadcast-email">Assunto</Label>
            <Input id="assunto-broadcast-email" placeholder="Assunto do email" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="corpo-broadcast-email">Conteúdo</Label>
            <Textarea
              id="corpo-broadcast-email"
              placeholder="Escreve o conteúdo do email..."
              className="min-h-32"
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
            />
          </div>

          {momento === "agendado" && (
            <div className="flex flex-wrap items-end gap-3 sm:col-span-2">
              <div className="flex flex-col gap-1.5">
                <Label>Data</Label>
                <Popover>
                  <PopoverTrigger
                    render={
                      <Button variant="outline" className="w-44 justify-start font-normal">
                        <CalendarIcon />
                        {data ? format(data, "d 'de' MMMM", { locale: pt }) : "Escolher data"}
                      </Button>
                    }
                  />
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={data} onSelect={setData} locale={pt} />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hora-broadcast-email">Hora</Label>
                <Input id="hora-broadcast-email" type="time" className="w-28" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-border bg-muted/40 p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Mail className="h-3.5 w-3.5" />
            Pré-visualização
          </div>
          <p className="text-sm font-medium">{assunto || "Assunto do email"}</p>
          <p className="mt-1 text-sm whitespace-pre-wrap text-muted-foreground">{corpo || "O conteúdo do email vai aparecer aqui..."}</p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={criar} disabled={isSaving}>
            {isSaving ? <Loader2 className="animate-spin" /> : <Send />}
            {momento === "imediato" ? "Enviar agora" : "Agendar broadcast"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
