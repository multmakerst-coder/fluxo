"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { toastSaved } from "@/lib/toast";

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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type UnidadeDelay = "minutos" | "horas" | "dias";

const VARIAVEIS = ["{{nome}}"];

export function DmEditorDialog() {
  const [open, setOpen] = useState(false);
  const [mensagem, setMensagem] = useState(
    "Olá {{nome}}! Obrigado pelo teu interesse 💜 Em breve entramos em contacto contigo.",
  );
  const [delayValor, setDelayValor] = useState(5);
  const [delayUnidade, setDelayUnidade] = useState<UnidadeDelay>("minutos");
  const [limite, setLimite] = useState("1-semana");
  const [palavraChave, setPalavraChave] = useState("info, promo");
  const [sensivelMaiusculas, setSensivelMaiusculas] = useState(false);
  const [incluirEmojis, setIncluirEmojis] = useState(true);

  function inserirVariavel(variavel: string) {
    setMensagem((atual) => `${atual}${variavel}`);
  }

  function handleGuardar() {
    toastSaved("Configuração de DM automática guardada.");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <MessageSquareText />
            Editor de DM automática
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editor de DM automática</DialogTitle>
          <DialogDescription>
            Configura a mensagem direta enviada automaticamente quando o gatilho é acionado.
          </DialogDescription>
        </DialogHeader>

        <div className="flex max-h-[65vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="dm-mensagem">Mensagem</Label>
            <Textarea
              id="dm-mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              rows={4}
            />
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Variáveis:</span>
              {VARIAVEIS.map((variavel) => (
                <Badge
                  key={variavel}
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => inserirVariavel(variavel)}
                >
                  {variavel}
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dm-delay">Atraso de envio</Label>
              <Input
                id="dm-delay"
                type="number"
                min={0}
                value={delayValor}
                onChange={(e) => setDelayValor(Number(e.target.value))}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Unidade</Label>
              <Select value={delayUnidade} onValueChange={(v) => v && setDelayUnidade(v as UnidadeDelay)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minutos">Minutos</SelectItem>
                  <SelectItem value="horas">Horas</SelectItem>
                  <SelectItem value="dias">Dias</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Limite por utilizador</Label>
            <Select value={limite} onValueChange={(v) => v && setLimite(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sem-limite">Sem limite</SelectItem>
                <SelectItem value="1-dia">1 vez por dia</SelectItem>
                <SelectItem value="1-semana">1 vez por semana</SelectItem>
                <SelectItem value="1-mes">1 vez por mês</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dm-palavra">Palavra-chave de ativação</Label>
              <Input
                id="dm-palavra"
                value={palavraChave}
                onChange={(e) => setPalavraChave(e.target.value)}
                placeholder="info, promo"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dm-sensivel" className="font-normal text-muted-foreground">
                Sensível a maiúsculas
              </Label>
              <Switch
                id="dm-sensivel"
                checked={sensivelMaiusculas}
                onCheckedChange={setSensivelMaiusculas}
                size="sm"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="dm-emojis" className="font-normal text-muted-foreground">
                Incluir emojis na deteção
              </Label>
              <Switch id="dm-emojis" checked={incluirEmojis} onCheckedChange={setIncluirEmojis} size="sm" />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleGuardar}>Guardar configuração</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
