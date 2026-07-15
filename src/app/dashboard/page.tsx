import {
  Users,
  Send,
  MessagesSquare,
  UserPlus,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Camera,
  Mail,
  Workflow,
  AlertTriangle,
  WifiOff,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OverviewActivityChart } from "@/components/dashboard/overview-activity-chart";
import { OnboardingChecklist } from "@/components/dashboard/onboarding-checklist";
import { KPIS, ACTIVITY_DATA, ACTIVITY_FEED, CHANNEL_STATUS, type FeedType } from "@/app/dashboard/_data";
import { cn } from "@/lib/utils";

const KPI_ICONS = [Users, Send, MessagesSquare, UserPlus];

const FEED_ICON: Record<FeedType, typeof Workflow> = {
  conversa: MessagesSquare,
  fluxo: Workflow,
  erro: AlertTriangle,
  desconexao: WifiOff,
};

const FEED_BADGE: Record<FeedType, { label: string; className: string }> = {
  conversa: { label: "Conversa", className: "bg-info/10 text-info" },
  fluxo: { label: "Fluxo", className: "bg-primary/10 text-primary" },
  erro: { label: "Erro", className: "bg-destructive/10 text-destructive" },
  desconexao: { label: "Desconexão", className: "bg-warning/10 text-warning" },
};

const CHANNEL_ICON = { whatsapp: MessageCircle, instagram: Camera, email: Mail } as const;

export default function DashboardOverviewPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Vista geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanha a atividade dos teus canais e contactos em tempo real.
        </p>
      </div>

      <OnboardingChecklist channelStatus={CHANNEL_STATUS} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi, i) => {
          const Icon = KPI_ICONS[i];
          const positive = kpi.change >= 0;
          return (
            <Card key={kpi.label} className="glass border-0">
              <CardContent className="flex flex-col gap-3 px-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 text-xs font-medium",
                      positive ? "text-success" : "text-destructive",
                    )}
                  >
                    {positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {Math.abs(kpi.change)}%
                  </span>
                </div>
                <div>
                  <p className="text-2xl font-semibold">{kpi.value}</p>
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                </div>
                <p className="text-xs text-muted-foreground">{kpi.changeLabel}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Atividade dos últimos 30 dias</CardTitle>
          </CardHeader>
          <CardContent>
            <OverviewActivityChart data={ACTIVITY_DATA} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado dos canais</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {CHANNEL_STATUS.map((channel) => {
              const Icon = CHANNEL_ICON[channel.id as keyof typeof CHANNEL_ICON];
              return (
                <div
                  key={channel.id}
                  className="flex items-center gap-3 rounded-xl border border-border p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground">
                    <Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{channel.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{channel.detail}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "border-0",
                      channel.status === "ligado" && "bg-success/10 text-success",
                      channel.status === "desligado" && "bg-muted text-muted-foreground",
                      channel.status === "erro" && "bg-destructive/10 text-destructive",
                    )}
                  >
                    {channel.status === "ligado" ? "Ligado" : channel.status === "erro" ? "Erro" : "Desligado"}
                  </Badge>
                </div>
              );
            })}
            <Link
              href="/dashboard/configuracoes/canais"
              className="mt-1 flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Gerir canais <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade recente</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {ACTIVITY_FEED.map((item) => {
            const Icon = FEED_ICON[item.type];
            const badge = FEED_BADGE[item.type];
            return (
              <div key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{item.title}</p>
                    <Badge variant="outline" className={cn("border-0", badge.className)}>
                      {badge.label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
