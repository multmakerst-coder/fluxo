"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { CalendarIcon, Plus, Send, Info, Loader2 } from "lucide-react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TEMPLATES_WHATSAPP, type BroadcastRow } from "@/app/dashboard/broadcasts/_data";
import { WhatsAppBubblePreview } from "@/components/broadcasts/whatsapp-bubble-preview";
import { toast } from "sonner";

type Tag = { id: string; name: string; color: string };

export function NovoBroadcastWhatsappDialog({
  onCriado,
}: {
  onCriado: (broadcast: BroadcastRow) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nome, setNome] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [tagId, setTagId] = useState<string>("todos");
  const [templateId, setTemplateId] = useState(TEMPLATES_WHATSAPP[0].id);
  const [momento, setMomento] = useState<"imediato" | "agendado">("imediato");
  const [data, setData] = useState<Date | undefined>(undefined);
  const [hora, setHora] = useState("09:00");

  const template = TEMPLATES_WHATSAPP.find((t) => t.id === templateId)!;

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
    setTemplateId(TEMPLATES_WHATSAPP[0].id);
    setMomento("imediato");
    setData(undefined);
    setHora("09:00");
  }

  async function criar() {
    if (!nome.trim()) {
      toast.error("Dá um nome ao broadcast antes de continuar.");
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
          channel: "whatsapp",
          name: nome.trim(),
          content: {
            templateId,
            templateNome: template.nome,
            corpo: template.corpo,
            audienceTagId: tag?.id ?? null,
            audienceTagNome: tag?.name ?? "Todos os contactos",
          },
          scheduledAt,
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? "Erro ao criar broadcast");

      onCriado(body.broadcast);
      toast.success(momento === "imediato" ? "Broadcast enviado." : "Broadcast agendado com sucesso.");
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
          <DialogTitle>Novo broadcast de WhatsApp</DialogTitle>
          <DialogDescription>
            Envia uma mensagem em massa aos teus contactos reais com número de telefone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-2 rounded-xl bg-info/10 px-3 py-2.5 text-xs text-info">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <p>
            Fora da janela de 24h de conversa, o WhatsApp só permite o envio de mensagens usando templates
            previamente aprovados pela Meta. Escolhe um template abaixo — mensagens livres não são permitidas em broadcasts.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="nome-broadcast-wa">Nome do broadcast</Label>
            <Input id="nome-broadcast-wa" placeholder="Ex: Promoção de verão" value={nome} onChange={(e) => setNome(e.target.value)} />
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
            <Label>Template aprovado</Label>
            <Select value={templateId} onValueChange={(value) => setTemplateId(value ?? "")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEMPLATES_WHATSAPP.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome} · {t.categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>Envio</Label>
            <Tabs value={momento} onValueChange={(v) => setMomento(v as "imediato" | "agendado")}>
              <TabsList>
                <TabsTrigger value="imediato">Enviar imediatamente</TabsTrigger>
                <TabsTrigger value="agendado">Agendar</TabsTrigger>
              </TabsList>
            </Tabs>
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
                <Label htmlFor="hora-broadcast-wa">Hora</Label>
                <Input id="hora-broadcast-wa" type="time" className="w-28" value={hora} onChange={(e) => setHora(e.target.value)} />
              </div>
            </div>
          )}
        </div>

        <WhatsAppBubblePreview texto={template.corpo.replace("{{1}}", "Marta")} />

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
