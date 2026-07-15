import { Users, Wallet, UserPlus, MessagesSquare, TriangleAlert, Info, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GrowthChart } from "@/components/admin/growth-chart";
import { PlanDistributionChart } from "@/components/admin/plan-distribution-chart";
import {
  totalActiveClients,
  mrrTotal,
  newToday,
  newThisWeek,
  newThisMonth,
  totalMessagesProcessed,
  GROWTH_DATA,
  PLAN_DISTRIBUTION,
  SYSTEM_ALERTS,
  type AlertSeverity,
} from "./_data";
import { cn } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-PT").format(value);
}

const KPIS = [
  { label: "Clientes ativos", value: formatNumber(totalActiveClients), icon: Users },
  { label: "MRR", value: formatCurrency(mrrTotal), icon: Wallet },
  { label: "Novos (hoje / semana / mês)", value: `${newToday} / ${newThisWeek} / ${newThisMonth}`, icon: UserPlus },
  { label: "Mensagens processadas", value: formatNumber(totalMessagesProcessed), icon: MessagesSquare },
];

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; className: string; icon: typeof TriangleAlert }> = {
  critico: { label: "Crítico", className: "bg-destructive/10 text-destructive", icon: ShieldAlert },
  aviso: { label: "Aviso", className: "bg-warning/10 text-warning", icon: TriangleAlert },
  info: { label: "Info", className: "bg-info/10 text-info", icon: Info },
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Dashboard geral</h1>
        <p className="mt-1 text-sm text-muted-foreground">Vista geral da plataforma Fluxo — clientes, receita e atividade.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((kpi) => (
          <Card key={kpi.label} className="glass border-0">
            <CardContent className="flex flex-col gap-3 px-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <kpi.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-2xl font-semibold">{kpi.value}</p>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Crescimento de utilizadores</CardTitle>
          </CardHeader>
          <CardContent>
            <GrowthChart data={GROWTH_DATA} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes por plano</CardTitle>
          </CardHeader>
          <CardContent>
            <PlanDistributionChart data={PLAN_DISTRIBUTION} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alertas de sistema</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {SYSTEM_ALERTS.map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity];
            return (
              <div key={alert.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                <span className={cn("mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", config.className)}>
                  <config.icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <Badge variant="outline" className={cn("border-0", config.className)}>
                      {config.label}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{alert.description}</p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{formatDateTime(alert.timestamp)}</span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
