"use client";

import { Download, FileText, TrendingUp, TrendingDown, MessageCircle, Camera, Mail, Workflow } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MessagesByChannelChart } from "@/components/analytics/messages-by-channel-chart";
import { ContactsBySourceChart } from "@/components/analytics/contacts-by-source-chart";
import {
  MESSAGES_BY_CHANNEL,
  RATE_METRICS,
  CONTACTS_BY_SOURCE,
  WHATSAPP_METRICS,
  INSTAGRAM_METRICS,
  EMAIL_METRICS,
  FLOWS_ANALYTICS,
} from "./_data";
import { cn } from "@/lib/utils";

function exportCsv() {
  const header = ["Data", "WhatsApp", "Instagram", "Email"];
  const lines = MESSAGES_BY_CHANNEL.map((point) =>
    [point.date, point.whatsapp, point.instagram, point.email]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "analytics.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success("Ficheiro CSV exportado com sucesso");
}

function exportPdf() {
  toast.info("A gerar PDF...");
}

function formatNumber(value: number) {
  return value.toLocaleString("pt-PT");
}

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Métricas de desempenho dos teus canais, contactos e fluxos de automação.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <FileText className="h-4 w-4" /> Exportar PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {RATE_METRICS.map((metric) => {
          const positive = metric.change >= 0;
          return (
            <Card key={metric.label} className="glass border-0">
              <CardContent className="flex flex-col gap-2 px-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      positive ? "text-success" : "text-destructive",
                    )}
                  >
                    {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {Math.abs(metric.change)}%
                  </span>
                </div>
                <p className="text-2xl font-semibold">{metric.value}%</p>
                <p className="text-xs text-muted-foreground">{metric.changeLabel}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="glass border-0 lg:col-span-2">
          <CardHeader>
            <CardTitle>Mensagens por canal</CardTitle>
            <CardDescription>Volume diário de mensagens enviadas nos últimos 30 dias.</CardDescription>
          </CardHeader>
          <CardContent>
            <MessagesByChannelChart data={MESSAGES_BY_CHANNEL} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Novos contactos por fonte</CardTitle>
            <CardDescription>Origem dos contactos adicionados este mês.</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactsBySourceChart data={CONTACTS_BY_SOURCE} />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Por canal</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageCircle className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <CardTitle>WhatsApp</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              <div className="flex items-center justify-between py-2 first:pt-0">
                <span className="text-sm text-muted-foreground">Enviadas</span>
                <span className="text-sm font-medium">{formatNumber(WHATSAPP_METRICS.enviadas)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Entregues</span>
                <span className="text-sm font-medium">{formatNumber(WHATSAPP_METRICS.entregues)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Lidas</span>
                <span className="text-sm font-medium">{formatNumber(WHATSAPP_METRICS.lidas)}</span>
              </div>
              <div className="flex items-center justify-between py-2 last:pb-0">
                <span className="text-sm text-muted-foreground">Respondidas</span>
                <span className="text-sm font-medium">{formatNumber(WHATSAPP_METRICS.respondidas)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Camera className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <CardTitle>Instagram</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              <div className="flex items-center justify-between py-2 first:pt-0">
                <span className="text-sm text-muted-foreground">Comentários processados</span>
                <span className="text-sm font-medium">{formatNumber(INSTAGRAM_METRICS.comentariosProcessados)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">DMs enviadas</span>
                <span className="text-sm font-medium">{formatNumber(INSTAGRAM_METRICS.dmsEnviadas)}</span>
              </div>
              <div className="flex items-center justify-between py-2 last:pb-0">
                <span className="text-sm text-muted-foreground">Taxa de conversão</span>
                <span className="text-sm font-medium">{INSTAGRAM_METRICS.taxaConversao}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Mail className="h-4.5 w-4.5" strokeWidth={1.75} />
                </span>
                <CardTitle>Email</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border">
              <div className="flex items-center justify-between py-2 first:pt-0">
                <span className="text-sm text-muted-foreground">Enviados</span>
                <span className="text-sm font-medium">{formatNumber(EMAIL_METRICS.enviados)}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Taxa de abertura</span>
                <span className="text-sm font-medium">{EMAIL_METRICS.taxaAbertura}%</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Cliques</span>
                <span className="text-sm font-medium">{formatNumber(EMAIL_METRICS.cliques)}</span>
              </div>
              <div className="flex items-center justify-between py-2 last:pb-0">
                <span className="text-sm text-muted-foreground">Bounces</span>
                <span className="text-sm font-medium">{formatNumber(EMAIL_METRICS.bounces)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Por fluxo</h2>
        <Card>
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Fluxo</TableHead>
                  <TableHead>Ativações</TableHead>
                  <TableHead>Drop-off por bloco</TableHead>
                  <TableHead className="pr-4">Taxa de conclusão</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {FLOWS_ANALYTICS.map((flow) => (
                  <TableRow key={flow.id}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Workflow className="h-4 w-4" strokeWidth={1.75} />
                        </span>
                        <span className="font-medium">{flow.nome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{formatNumber(flow.ativacoes)}</TableCell>
                    <TableCell>
                      <div className="flex w-40 items-center gap-2">
                        <span className="relative flex h-1 flex-1 items-center overflow-hidden rounded-full bg-muted">
                          <span
                            className="h-full rounded-full bg-destructive transition-all"
                            style={{ width: `${flow.dropOff}%` }}
                          />
                        </span>
                        <span className="w-9 shrink-0 text-xs text-muted-foreground">{flow.dropOff}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="pr-4">
                      <div className="flex w-40 items-center gap-2">
                        <span className="relative flex h-1 flex-1 items-center overflow-hidden rounded-full bg-muted">
                          <span
                            className="h-full rounded-full bg-success transition-all"
                            style={{ width: `${flow.taxaConclusao}%` }}
                          />
                        </span>
                        <span className="w-9 shrink-0 text-xs text-muted-foreground">{flow.taxaConclusao}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
