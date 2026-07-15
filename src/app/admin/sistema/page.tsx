"use client";

import { CheckCircle2, TriangleAlert, XCircle, RefreshCw, Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ResponseTimeChart } from "@/components/admin/response-time-chart";
import { toast } from "sonner";
import {
  API_STATUSES,
  ERROR_LOGS,
  RESPONSE_TIME_DATA,
  DB_USAGE,
  MESSAGE_QUEUES,
  totalPendingMessages,
  type ApiStatus,
  type LogSeverity,
  type QueueStatus,
} from "./_data";
import { cn } from "@/lib/utils";

const API_STATUS_CONFIG: Record<ApiStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  operacional: { label: "Operacional", className: "bg-success/10 text-success", icon: CheckCircle2 },
  degradado: { label: "Degradado", className: "bg-warning/10 text-warning", icon: TriangleAlert },
  "em baixo": { label: "Em baixo", className: "bg-destructive/10 text-destructive", icon: XCircle },
};

const LOG_SEVERITY_CONFIG: Record<LogSeverity, string> = {
  erro: "bg-destructive/10 text-destructive",
  aviso: "bg-warning/10 text-warning",
};

const QUEUE_STATUS_CONFIG: Record<QueueStatus, string> = {
  "a processar": "bg-success/10 text-success",
  "em espera": "bg-muted text-muted-foreground",
  "com falhas": "bg-destructive/10 text-destructive",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminSistemaPage() {
  function retryQueue(name: string) {
    toast.success(`Nova tentativa forçada para "${name}"`);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Sistema</h1>
        <p className="mt-1 text-sm text-muted-foreground">Estado das integrações, desempenho e filas de mensagens da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {API_STATUSES.map((api) => {
          const config = API_STATUS_CONFIG[api.status];
          return (
            <Card key={api.id} className="glass border-0">
              <CardContent className="flex flex-col gap-3 px-5">
                <div className="flex items-center justify-between">
                  <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", config.className)}>
                    <config.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </span>
                  <Badge variant="outline" className={cn("border-0", config.className)}>
                    {config.label}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">{api.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Latência {api.latencyMs}ms &middot; Uptime {api.uptime}%
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Última verificação: {formatDateTime(api.lastCheck)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Tempo de resposta por canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponseTimeChart data={RESPONSE_TIME_DATA} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uso da base de dados</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Database className="h-4.5 w-4.5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-lg font-semibold">
                  {DB_USAGE.usedGB} GB <span className="text-sm font-normal text-muted-foreground">de {DB_USAGE.totalGB} GB</span>
                </p>
                <p className="text-xs text-muted-foreground">Supabase Postgres</p>
              </div>
            </div>
            <div className="relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  DB_USAGE.percentage >= 90 ? "bg-destructive" : DB_USAGE.percentage >= 70 ? "bg-warning" : "bg-primary",
                )}
                style={{ width: `${DB_USAGE.percentage}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{DB_USAGE.percentage}% utilizado</p>
            <div className="flex flex-col gap-1.5 border-t border-border pt-3">
              {DB_USAGE.tables.map((t) => (
                <div key={t.name} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{t.name}</span>
                  <span className="font-medium">{t.sizeGB} GB</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filas de mensagens pendentes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            <span className="text-lg font-semibold text-foreground">{totalPendingMessages}</span> mensagens pendentes em todas as filas
          </p>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fila</TableHead>
                  <TableHead>Pendentes</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Último processamento</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MESSAGE_QUEUES.map((q) => (
                  <TableRow key={q.id}>
                    <TableCell className="text-sm font-medium">{q.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{q.pending}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0", QUEUE_STATUS_CONFIG[q.status])}>
                        {q.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(q.lastProcessed)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => retryQueue(q.name)}>
                        <RefreshCw className="h-3.5 w-3.5" /> Forçar nova tentativa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Logs de erros recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Mensagem</TableHead>
                  <TableHead>Severidade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ERROR_LOGS.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(log.timestamp)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.type}</TableCell>
                    <TableCell className="text-sm">{log.message}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0", LOG_SEVERITY_CONFIG[log.severity])}>
                        {log.severity === "erro" ? "Erro" : "Aviso"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
