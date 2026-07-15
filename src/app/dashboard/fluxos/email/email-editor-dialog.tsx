"use client";

import { useState } from "react";
import {
  Mail,
  Type,
  Image as ImageIcon,
  MousePointerClick,
  SeparatorHorizontal,
  MoveVertical,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Monitor,
  Smartphone,
  Send,
} from "lucide-react";
import { toast } from "sonner";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type TipoBloco = "texto" | "imagem" | "botao" | "divisor" | "espaco";

type BlocoEmail = {
  id: string;
  tipo: TipoBloco;
  conteudo?: string;
};

const BLOCO_META: Record<TipoBloco, { label: string; icon: typeof Type }> = {
  texto: { label: "Texto", icon: Type },
  imagem: { label: "Imagem", icon: ImageIcon },
  botao: { label: "Botão", icon: MousePointerClick },
  divisor: { label: "Divisor", icon: SeparatorHorizontal },
  espaco: { label: "Espaço", icon: MoveVertical },
};

const CONTEUDO_INICIAL: Record<TipoBloco, string | undefined> = {
  texto: "Olá {{nome}}, obrigado por fazeres parte da nossa comunidade!",
  imagem: "https://picsum.photos/600/240",
  botao: "Ver novidades",
  divisor: undefined,
  espaco: undefined,
};

let contador = 0;
function novoId() {
  contador += 1;
  return `bloco-${Date.now()}-${contador}`;
}

const BLOCOS_INICIAIS: BlocoEmail[] = [
  { id: novoId(), tipo: "texto", conteudo: "Olá {{nome}}, bem-vindo(a) à nossa newsletter! 🎉" },
  { id: novoId(), tipo: "imagem", conteudo: "https://picsum.photos/600/240" },
  { id: novoId(), tipo: "botao", conteudo: "Ver novidades" },
  { id: novoId(), tipo: "divisor" },
  { id: novoId(), tipo: "espaco" },
];

export function EmailEditorDialog() {
  const [open, setOpen] = useState(false);
  const [assunto, setAssunto] = useState("As novidades chegaram 🌿");
  const [blocos, setBlocos] = useState<BlocoEmail[]>(BLOCOS_INICIAIS);

  function adicionarBloco(tipo: TipoBloco) {
    setBlocos((atual) => [...atual, { id: novoId(), tipo, conteudo: CONTEUDO_INICIAL[tipo] }]);
  }

  function moverBloco(id: string, direcao: "cima" | "baixo") {
    setBlocos((atual) => {
      const index = atual.findIndex((b) => b.id === id);
      const alvo = direcao === "cima" ? index - 1 : index + 1;
      if (index === -1 || alvo < 0 || alvo >= atual.length) return atual;
      const copia = [...atual];
      [copia[index], copia[alvo]] = [copia[alvo], copia[index]];
      return copia;
    });
  }

  function removerBloco(id: string) {
    setBlocos((atual) => atual.filter((b) => b.id !== id));
  }

  function atualizarConteudo(id: string, conteudo: string) {
    setBlocos((atual) => atual.map((b) => (b.id === id ? { ...b, conteudo } : b)));
  }

  function handleEnviarTeste() {
    toast.success("Email de teste enviado", {
      description: "Verifica a tua caixa de entrada dentro de alguns instantes.",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Mail />
            Editor de email
          </Button>
        }
      />
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Editor de email</DialogTitle>
          <DialogDescription>
            Compõe o email adicionando e ordenando blocos, e confirma a pré-visualização antes de guardar.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email-assunto">Assunto</Label>
          <Input id="email-assunto" value={assunto} onChange={(e) => setAssunto(e.target.value)} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(BLOCO_META) as TipoBloco[]).map((tipo) => {
                const Icon = BLOCO_META[tipo].icon;
                return (
                  <Button key={tipo} variant="outline" size="sm" onClick={() => adicionarBloco(tipo)}>
                    <Plus className="h-3.5 w-3.5" />
                    <Icon className="h-3.5 w-3.5" />
                    {BLOCO_META[tipo].label}
                  </Button>
                );
              })}
            </div>

            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto rounded-xl border border-border p-2">
              {blocos.map((bloco, index) => {
                const Icon = BLOCO_META[bloco.tipo].icon;
                return (
                  <div key={bloco.id} className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2">
                    <div className="flex items-center gap-2">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-primary" />
                      <span className="flex-1 text-xs font-medium text-muted-foreground">
                        {BLOCO_META[bloco.tipo].label}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => moverBloco(bloco.id, "cima")}
                        disabled={index === 0}
                      >
                        <ArrowUp />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => moverBloco(bloco.id, "baixo")}
                        disabled={index === blocos.length - 1}
                      >
                        <ArrowDown />
                      </Button>
                      <Button variant="ghost" size="icon-xs" onClick={() => removerBloco(bloco.id)}>
                        <Trash2 />
                      </Button>
                    </div>
                    {(bloco.tipo === "texto" || bloco.tipo === "botao" || bloco.tipo === "imagem") && (
                      <Input
                        value={bloco.conteudo ?? ""}
                        onChange={(e) => atualizarConteudo(bloco.id, e.target.value)}
                        placeholder={
                          bloco.tipo === "imagem" ? "URL da imagem" : bloco.tipo === "botao" ? "Texto do botão" : "Texto"
                        }
                        className="h-7 text-xs"
                      />
                    )}
                  </div>
                );
              })}
              {blocos.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">
                  Adiciona blocos para começar a compor o email.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Tabs defaultValue="desktop">
              <TabsList>
                <TabsTrigger value="desktop">
                  <Monitor />
                  Desktop
                </TabsTrigger>
                <TabsTrigger value="mobile">
                  <Smartphone />
                  Mobile
                </TabsTrigger>
              </TabsList>
              <TabsContent value="desktop">
                <EmailPreview assunto={assunto} blocos={blocos} className="max-w-md" />
              </TabsContent>
              <TabsContent value="mobile">
                <EmailPreview assunto={assunto} blocos={blocos} className="max-w-56" />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleEnviarTeste}>
            <Send />
            Enviar teste
          </Button>
          <Button
            onClick={() => {
              toast.success("Email guardado.");
              setOpen(false);
            }}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EmailPreview({
  assunto,
  blocos,
  className,
}: {
  assunto: string;
  blocos: BlocoEmail[];
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex w-full flex-col gap-3 rounded-xl border border-border bg-background p-3", className)}>
      <p className="truncate text-xs font-semibold text-foreground">{assunto || "(sem assunto)"}</p>
      <div className="flex flex-col gap-3">
        {blocos.map((bloco) => {
          switch (bloco.tipo) {
            case "texto":
              return (
                <p key={bloco.id} className="text-xs leading-relaxed text-foreground">
                  {bloco.conteudo}
                </p>
              );
            case "imagem":
              return (
                <div
                  key={bloco.id}
                  className="flex h-20 items-center justify-center rounded-lg bg-muted text-[10px] text-muted-foreground"
                >
                  {bloco.conteudo || "Imagem"}
                </div>
              );
            case "botao":
              return (
                <div
                  key={bloco.id}
                  className="w-fit rounded-lg bg-primary px-3 py-1.5 text-[10px] font-medium text-primary-foreground"
                >
                  {bloco.conteudo || "Botão"}
                </div>
              );
            case "divisor":
              return <hr key={bloco.id} className="border-border" />;
            case "espaco":
              return <div key={bloco.id} className="h-4" />;
            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}
