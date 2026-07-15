import { MessageCircle, Camera, Mail, TriangleAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MessagesVolumeChart, ChannelBreakdownChart } from "@/components/admin/messages-charts";
import { MESSAGES_DAILY, MESSAGES_WEEKLY, MESSAGES_MONTHLY, CHANNEL_BREAKDOWN, TOP_CLIENTS, NEAR_LIMIT_ALERTS } from "./_data";
import type { Channel } from "@/app/admin/clientes/_data";
import { cn } from "@/lib/utils";

const CHANNEL_ICON: Record<Channel, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  instagram: Camera,
  email: Mail,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-PT").format(value);
}

export default function AdminMensagensPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Mensagens</h1>
        <p className="mt-1 text-sm text-muted-foreground">Volume de mensagens processadas pela plataforma, por canal e por cliente.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Volume de mensagens</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="dia">
              <TabsList>
                <TabsTrigger value="dia">Diário</TabsTrigger>
                <TabsTrigger value="semana">Semanal</TabsTrigger>
                <TabsTrigger value="mes">Mensal</TabsTrigger>
              </TabsList>
              <TabsContent value="dia" className="pt-4">
                <MessagesVolumeChart data={MESSAGES_DAILY} />
              </TabsContent>
              <TabsContent value="semana" className="pt-4">
                <MessagesVolumeChart data={MESSAGES_WEEKLY} />
              </TabsContent>
              <TabsContent value="mes" className="pt-4">
                <MessagesVolumeChart data={MESSAGES_MONTHLY} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Divisão por canal</CardTitle>
          </CardHeader>
          <CardContent>
            <ChannelBreakdownChart data={CHANNEL_BREAKDOWN} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Clientes com maior volume de mensagens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Canais</TableHead>
                  <TableHead>Enviadas</TableHead>
                  <TableHead>Recebidas</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TOP_CLIENTS.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-sm font-medium">{c.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {c.channels.map((channel) => {
                          const Icon = CHANNEL_ICON[channel];
                          return (
                            <span key={channel} className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-foreground">
                              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                            </span>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatNumber(c.messagesSent)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatNumber(c.messagesReceived)}</TableCell>
                    <TableCell className="text-sm font-semibold">{formatNumber(c.messagesSent + c.messagesReceived)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clientes perto do limite de mensagens</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {NEAR_LIMIT_ALERTS.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum cliente está perto do limite do plano gratuito.</p>
          )}
          {NEAR_LIMIT_ALERTS.map((alert) => (
            <div key={alert.clientId} className="flex flex-col gap-2 rounded-xl border border-border p-3.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {alert.percentage >= 90 && <TriangleAlert className="h-4 w-4 text-warning" />}
                  <span className="text-sm font-medium">{alert.clientName}</span>
                  <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
                    {alert.plan}
                  </Badge>
                </div>
                <span
                  className={cn(
                    "text-sm font-semibold",
                    alert.percentage >= 90 ? "text-destructive" : alert.percentage >= 75 ? "text-warning" : "text-muted-foreground",
                  )}
                >
                  {alert.percentage}%
                </span>
              </div>
              <div className="relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    alert.percentage >= 90 ? "bg-destructive" : alert.percentage >= 75 ? "bg-warning" : "bg-primary",
                  )}
                  style={{ width: `${alert.percentage}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {formatNumber(alert.used)} de {formatNumber(alert.limit)} mensagens utilizadas este mês
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
