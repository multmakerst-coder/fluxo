"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Play,
  Pause,
  Archive,
  MessageCircle,
  Camera,
  Mail,
  Users,
  CheckCircle2,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  badgeEstadoSequencia,
  labelCanal,
  type Sequencia,
  type PassoSequencia,
  type UnidadeDelay,
} from "@/app/dashboard/sequencias/_data";

const ICONE_CANAL = {
  whatsapp: MessageCircle,
  instagram: Camera,
  email: Mail,
} as const;

function novoPasso(): PassoSequencia {
  return {
    id: `p-${Date.now()}`,
    mensagem: "",
    delayValor: 1,
    delayUnidade: "dias",
    taxaResposta: 0,
  };
}

export function SequenceEditor({ sequenciaInicial }: { sequenciaInicial: Sequencia }) {
  const [sequencia, setSequencia] = useState<Sequencia>(sequenciaInicial);
  const Icone = ICONE_CANAL[sequencia.canal];
  const estado = badgeEstadoSequencia(sequencia.estado);

  function atualizarPasso(id: string, alteracoes: Partial<PassoSequencia>) {
    setSequencia((s) => ({
      ...s,
      passos: s.passos.map((p) => (p.id === id ? { ...p, ...alteracoes } : p)),
    }));
  }

  function moverPasso(id: string, direcao: -1 | 1) {
    setSequencia((s) => {
      const index = s.passos.findIndex((p) => p.id === id);
      const novoIndex = index + direcao;
      if (novoIndex < 0 || novoIndex >= s.passos.length) return s;
      const passos = [...s.passos];
      [passos[index], passos[novoIndex]] = [passos[novoIndex], passos[index]];
      return { ...s, passos };
    });
  }

  function removerPasso(id: string) {
    setSequencia((s) => ({ ...s, passos: s.passos.filter((p) => p.id !== id) }));
  }

  function adicionarPasso() {
    setSequencia((s) => ({ ...s, passos: [...s.passos, novoPasso()] }));
  }

  function mudarEstado(novoEstado: Sequencia["estado"]) {
    setSequencia((s) => ({ ...s, estado: novoEstado }));
    const mensagens: Record<Sequencia["estado"], string> = {
      ativa: "Sequência ativada.",
      pausada: "Sequência pausada.",
      arquivada: "Sequência arquivada.",
    };
    toast.success(mensagens[novoEstado]);
  }

  const dadosGrafico = sequencia.passos.map((p, i) => ({
    passo: `Passo ${i + 1}`,
    taxaResposta: p.taxaResposta,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/dashboard/sequencias" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar às sequências
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl font-semibold">{sequencia.nome}</h1>
            <Badge variant="outline" className={estado.className}>{estado.label}</Badge>
          </div>
          <span className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Icone className="h-3.5 w-3.5" />
            {labelCanal(sequencia.canal)}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {sequencia.estado !== "ativa" && sequencia.estado !== "arquivada" && (
            <Button onClick={() => mudarEstado("ativa")}><Play />Ativar</Button>
          )}
          {sequencia.estado === "ativa" && (
            <Button variant="outline" onClick={() => mudarEstado("pausada")}><Pause />Pausar</Button>
          )}
          {sequencia.estado !== "arquivada" && (
            <Button variant="outline" onClick={() => mudarEstado("arquivada")}><Archive />Arquivar</Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contactos ativos</p>
              <p className="font-heading text-xl font-semibold">{sequencia.contactosAtivos.toLocaleString("pt-PT")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taxa de conclusão</p>
              <p className="font-heading text-xl font-semibold">{sequencia.taxaConclusao}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="flex items-center gap-3 py-2">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand-accent/15 text-brand-accent">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Passos</p>
              <p className="font-heading text-xl font-semibold">{sequencia.passos.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Passos da sequência</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {sequencia.passos.length === 0 && (
            <p className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
              Ainda não há passos. Adiciona o primeiro para começar a construir a sequência.
            </p>
          )}
          {sequencia.passos.map((passo, index) => (
            <div key={passo.id} className="flex flex-col gap-3 rounded-2xl border border-border p-4">
              <div className="flex items-center justify-between">
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === 0}
                    onClick={() => moverPasso(passo.id, -1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    disabled={index === sequencia.passos.length - 1}
                    onClick={() => moverPasso(passo.id, 1)}
                  >
                    <ArrowDown />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => removerPasso(passo.id)}>
                    <Trash2 className="text-destructive" />
                  </Button>
                </div>
              </div>

              <Textarea
                placeholder="Escreve a mensagem deste passo..."
                value={passo.mensagem}
                onChange={(e) => atualizarPasso(passo.id, { mensagem: e.target.value })}
              />

              <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`delay-valor-${passo.id}`}>Enviar após</Label>
                  <Input
                    id={`delay-valor-${passo.id}`}
                    type="number"
                    min={0}
                    className="w-24"
                    value={passo.delayValor}
                    onChange={(e) => atualizarPasso(passo.id, { delayValor: Number(e.target.value) })}
                  />
                </div>
                <Select
                  value={passo.delayUnidade}
                  onValueChange={(v) => atualizarPasso(passo.id, { delayUnidade: v as UnidadeDelay })}
                >
                  <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutos">Minutos</SelectItem>
                    <SelectItem value="horas">Horas</SelectItem>
                    <SelectItem value="dias">Dias</SelectItem>
                  </SelectContent>
                </Select>
                <span className="pb-1.5 text-xs text-muted-foreground">
                  Taxa de resposta: {passo.taxaResposta}%
                </span>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={adicionarPasso} className="self-start">
            <Plus />
            Adicionar passo
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Condições de saída</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-xl border border-border p-4">
            <div>
              <p className="text-sm font-medium">Remover contacto se respondeu</p>
              <p className="text-sm text-muted-foreground">
                O contacto sai automaticamente da sequência assim que responder a alguma mensagem.
              </p>
            </div>
            <Switch
              checked={sequencia.removerSeRespondeu}
              onCheckedChange={(checked) => setSequencia((s) => ({ ...s, removerSeRespondeu: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {sequencia.passos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Taxa de resposta por passo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGrafico}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="passo" fontSize={12} stroke="var(--muted-foreground)" />
                  <YAxis fontSize={12} stroke="var(--muted-foreground)" unit="%" />
                  <RechartsTooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="taxaResposta" name="Taxa de resposta" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
