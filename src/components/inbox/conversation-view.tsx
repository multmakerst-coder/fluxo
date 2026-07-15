"use client";

import { useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import {
  MessageCircle,
  Camera,
  Mail,
  Send,
  Paperclip,
  Image as ImageIcon,
  Mic,
  Archive,
  CheckCircle2,
  StickyNote,
  Plus,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  MEMBROS_EQUIPA,
  type Conversa,
  type Mensagem,
  type NotaInterna,
} from "@/app/dashboard/inbox/_data";

const ICONE_CANAL = {
  whatsapp: MessageCircle,
  instagram: Camera,
  email: Mail,
} as const;

const LABEL_CANAL = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  email: "Email",
} as const;

export function ConversationView({ conversaInicial }: { conversaInicial: Conversa }) {
  const [conversa, setConversa] = useState<Conversa>(conversaInicial);
  const [rascunho, setRascunho] = useState("");
  const [nota, setNota] = useState("");
  const Icone = ICONE_CANAL[conversa.canal];

  function enviarMensagem() {
    if (!rascunho.trim()) return;
    const nova: Mensagem = {
      id: `m-${Date.now()}`,
      direcao: "outbound",
      texto: rascunho.trim(),
      hora: new Date().toISOString(),
      autor: "Marta Silva",
    };
    setConversa((c) => ({ ...c, mensagens: [...c.mensagens, nova] }));
    setRascunho("");
  }

  function adicionarNota() {
    if (!nota.trim()) return;
    const novaNota: NotaInterna = {
      id: `n-${Date.now()}`,
      texto: nota.trim(),
      autor: "Marta Silva",
      hora: new Date().toISOString(),
    };
    setConversa((c) => ({ ...c, notasInternas: [...c.notasInternas, novaNota] }));
    setNota("");
    toast.success("Nota interna adicionada.");
  }

  function atribuir(membroId: string) {
    setConversa((c) => ({ ...c, atribuidoA: membroId }));
    const membro = MEMBROS_EQUIPA.find((m) => m.id === membroId);
    toast.success(`Conversa atribuída a ${membro?.nome}.`);
  }

  function fecharConversa() {
    setConversa((c) => ({ ...c, naoLida: false }));
    toast.success("Conversa fechada.");
  }

  function arquivarConversa() {
    setConversa((c) => ({ ...c, arquivada: !c.arquivada }));
    toast.success(conversa.arquivada ? "Conversa reposta no inbox." : "Conversa arquivada.");
  }

  function anexarMock(tipo: string) {
    toast.info(`Anexar ${tipo} — funcionalidade de demonstração.`);
  }

  return (
    <div className="flex h-full min-h-0 flex-1">
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{conversa.avatarIniciais}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">{conversa.contactoNome}</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icone className="h-3 w-3" />
                {LABEL_CANAL[conversa.canal]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger render={<Button variant="outline" size="sm" onClick={fecharConversa}><CheckCircle2 />Fechar</Button>} />
              <TooltipContent>Marcar conversa como fechada</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button variant="outline" size="sm" onClick={arquivarConversa}>
                    <Archive />
                    {conversa.arquivada ? "Repor" : "Arquivar"}
                  </Button>
                }
              />
              <TooltipContent>{conversa.arquivada ? "Repor no inbox" : "Arquivar conversa"}</TooltipContent>
            </Tooltip>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="flex flex-col gap-3 px-4 py-4">
            {conversa.mensagens.map((msg) => (
              <div
                key={msg.id}
                className={cn("flex flex-col gap-1", msg.direcao === "outbound" ? "items-end" : "items-start")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                    msg.direcao === "outbound"
                      ? "rounded-tr-none bg-primary text-primary-foreground"
                      : "rounded-tl-none bg-muted text-foreground",
                  )}
                >
                  {msg.texto}
                </div>
                <span className="px-1 text-[11px] text-muted-foreground">
                  {msg.direcao === "outbound" && msg.autor ? `${msg.autor} · ` : ""}
                  {format(new Date(msg.hora), "d MMM, HH:mm", { locale: pt })}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t border-border p-3">
          <div className="flex items-end gap-2">
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => anexarMock("ficheiro")}><Paperclip /></Button>} />
                <TooltipContent>Anexar ficheiro</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => anexarMock("imagem")}><ImageIcon /></Button>} />
                <TooltipContent>Anexar imagem</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => anexarMock("áudio")}><Mic /></Button>} />
                <TooltipContent>Gravar áudio</TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              placeholder="Escreve uma resposta..."
              className="min-h-10"
              value={rascunho}
              onChange={(e) => setRascunho(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  enviarMensagem();
                }
              }}
            />
            <Button onClick={enviarMensagem} disabled={!rascunho.trim()}>
              <Send />
              Enviar
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden w-80 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border p-4 lg:flex">
        <div>
          <div className="flex flex-col items-center gap-2 text-center">
            <Avatar size="lg">
              <AvatarFallback>{conversa.avatarIniciais}</AvatarFallback>
            </Avatar>
            <p className="font-heading text-base font-semibold">{conversa.contactoNome}</p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {conversa.tags.length > 0
                ? conversa.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)
                : <span className="text-xs text-muted-foreground">Sem tags</span>}
            </div>
          </div>
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Dados do contacto</p>
          {conversa.camposContacto.map((campo) => (
            <div key={campo.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{campo.label}</span>
              <span className="font-medium">{campo.valor}</span>
            </div>
          ))}
        </div>

        <Separator />

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Atribuir a</p>
          <Select value={conversa.atribuidoA ?? "nenhum"} onValueChange={(v) => (!v || v === "nenhum" ? undefined : atribuir(v))}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="nenhum">Ninguém</SelectItem>
              {MEMBROS_EQUIPA.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <Card size="sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <StickyNote className="h-3.5 w-3.5" />
              Notas internas
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {conversa.notasInternas.map((n) => (
              <div key={n.id} className="rounded-lg bg-muted/60 p-2 text-xs">
                <p>{n.texto}</p>
                <p className="mt-1 text-muted-foreground">
                  {n.autor} · {format(new Date(n.hora), "d MMM, HH:mm", { locale: pt })}
                </p>
              </div>
            ))}
            {conversa.notasInternas.length === 0 && (
              <p className="text-xs text-muted-foreground">Ainda sem notas.</p>
            )}
            <div className="flex gap-1.5">
              <Textarea
                placeholder="Adicionar nota interna..."
                className="min-h-8 text-xs"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
              <Button size="icon-sm" variant="outline" onClick={adicionarNota} disabled={!nota.trim()}>
                <Plus />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
