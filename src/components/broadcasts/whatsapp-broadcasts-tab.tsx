"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { BarChart3, Info, Loader2, Send } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import {
  badgeEstadoBroadcast,
  templateWhatsapp,
  type BroadcastRow,
} from "@/app/dashboard/broadcasts/_data";
import { NovoBroadcastWhatsappDialog } from "@/components/broadcasts/novo-broadcast-whatsapp-dialog";
import { BroadcastRelatorioDialog } from "@/components/broadcasts/broadcast-relatorio-dialog";
import { toast } from "sonner";

export function WhatsappBroadcastsTab() {
  const [broadcasts, setBroadcasts] = useState<BroadcastRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [relatorioAberto, setRelatorioAberto] = useState<BroadcastRow | null>(null);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/broadcasts?channel=whatsapp");
        if (!response.ok) throw new Error();
        const { broadcasts } = await response.json();
        if (!cancelled) setBroadcasts(broadcasts ?? []);
      } catch {
        if (!cancelled) toast.error("Não foi possível carregar os broadcasts");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleEnviarAgora(id: string) {
    setSendingId(id);
    try {
      const response = await fetch(`/api/broadcasts/${id}/send`, { method: "POST" });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error ?? "Erro ao enviar broadcast");
      setBroadcasts((prev) => prev.map((b) => (b.id === id ? body.broadcast : b)));
      toast.success("Broadcast enviado.");
    } catch (error) {
      toast.error("Não foi possível enviar o broadcast", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setSendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start gap-2 rounded-xl bg-info/10 px-3.5 py-2.5 text-xs text-info">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <p>
          Fora da janela de 24h desde a última mensagem do contacto, o WhatsApp exige o uso de templates
          aprovados pela Meta. Os broadcasts são enviados aos teus contactos reais com número de telefone.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{broadcasts.length} broadcasts</p>
        <NovoBroadcastWhatsappDialog onCriado={(novo) => setBroadcasts((prev) => [novo, ...prev])} />
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> A carregar broadcasts…
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl ring-1 ring-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Audiência</TableHead>
                <TableHead>Template</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {broadcasts.map((b) => {
                const estado = badgeEstadoBroadcast(b.status);
                const template = templateWhatsapp(String(b.content?.templateId ?? ""));
                const data = b.stats?.sentAt ?? b.scheduled_at ?? b.created_at;
                const podeEnviar = b.status === "scheduled" || b.status === "failed";
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {String(b.content?.audienceTagNome ?? "Todos os contactos")}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{template?.nome ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={estado.className}>{estado.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {data ? format(new Date(data), "d MMM yyyy, HH:mm", { locale: pt }) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {podeEnviar && (
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={sendingId === b.id}
                            onClick={() => handleEnviarAgora(b.id)}
                          >
                            {sendingId === b.id ? <Loader2 className="animate-spin" /> : <Send />}
                            Enviar agora
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={b.status !== "sent" && b.status !== "failed"}
                          onClick={() => setRelatorioAberto(b)}
                        >
                          <BarChart3 />
                          Relatório
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {!isLoading && broadcasts.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Ainda não tens broadcasts de WhatsApp. Cria o primeiro para começar.
          </CardContent>
        </Card>
      )}

      {relatorioAberto && (
        <BroadcastRelatorioDialog
          open={!!relatorioAberto}
          onOpenChange={(open) => !open && setRelatorioAberto(null)}
          titulo={relatorioAberto.name}
          linhas={[
            {
              label: "Entregues",
              valor: relatorioAberto.stats?.entregues ?? 0,
              total: relatorioAberto.stats?.destinatarios ?? 0,
              corClasse: "bg-primary",
            },
            {
              label: "Falhas",
              valor: relatorioAberto.stats?.falhas ?? 0,
              total: relatorioAberto.stats?.destinatarios ?? 0,
              corClasse: "bg-destructive",
            },
          ]}
        />
      )}
    </div>
  );
}
