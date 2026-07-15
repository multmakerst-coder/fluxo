import { Wallet, TrendingUp, TrendingDown, PiggyBank } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevenueGrowthChart, NewVsCancelledChart, RevenueByPlanChart } from "@/components/admin/revenue-charts";
import {
  mrrTotal,
  arrTotal,
  churnRate,
  REVENUE_GROWTH,
  NEW_VS_CANCELLED,
  REVENUE_BY_PLAN,
  TRANSACTIONS,
  REFUNDS,
  PLAN_LABELS,
  type TransactionStatus,
  type DisputeStatus,
} from "./_data";
import { cn } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const TX_STATUS_LABEL: Record<TransactionStatus, string> = {
  pago: "Pago",
  falhou: "Falhou",
  reembolsado: "Reembolsado",
  pendente: "Pendente",
};

const TX_STATUS_BADGE: Record<TransactionStatus, string> = {
  pago: "bg-success/10 text-success",
  falhou: "bg-destructive/10 text-destructive",
  reembolsado: "bg-muted text-muted-foreground",
  pendente: "bg-warning/10 text-warning",
};

const DISPUTE_STATUS_LABEL: Record<DisputeStatus, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  rejeitado: "Rejeitado",
};

const DISPUTE_STATUS_BADGE: Record<DisputeStatus, string> = {
  pendente: "bg-warning/10 text-warning",
  aprovado: "bg-success/10 text-success",
  rejeitado: "bg-destructive/10 text-destructive",
};

export default function AdminReceitaPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Receita</h1>
        <p className="mt-1 text-sm text-muted-foreground">MRR, ARR, churn e transações da plataforma.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass border-0">
          <CardContent className="flex flex-col gap-3 px-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Wallet className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-2xl font-semibold">{formatCurrency(mrrTotal)}</p>
              <p className="text-sm text-muted-foreground">MRR (receita mensal recorrente)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardContent className="flex flex-col gap-3 px-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PiggyBank className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-2xl font-semibold">{formatCurrency(arrTotal)}</p>
              <p className="text-sm text-muted-foreground">ARR (receita anual recorrente)</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardContent className="flex flex-col gap-3 px-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <TrendingDown className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-2xl font-semibold">{churnRate}%</p>
              <p className="text-sm text-muted-foreground">Taxa de churn mensal</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass border-0">
          <CardContent className="flex flex-col gap-3 px-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10 text-success">
              <TrendingUp className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-2xl font-semibold">{formatCurrency(mrrTotal / Math.max(1, TRANSACTIONS.length))}</p>
              <p className="text-sm text-muted-foreground">Receita média por cliente</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Crescimento de receita (MRR)</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueGrowthChart data={REVENUE_GROWTH} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Receita por plano</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueByPlanChart data={REVENUE_BY_PLAN} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Novas subscrições vs. cancelamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <NewVsCancelledChart data={NEW_VS_CANCELLED} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {TRANSACTIONS.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{tx.id}</TableCell>
                    <TableCell className="text-sm font-medium">{tx.clientName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{PLAN_LABELS[tx.plan]}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(tx.amount)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0", TX_STATUS_BADGE[tx.status])}>
                        {TX_STATUS_LABEL[tx.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(tx.date)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Reembolsos e disputas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden rounded-2xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REFUNDS.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{r.id}</TableCell>
                    <TableCell className="text-sm font-medium">{r.clientName}</TableCell>
                    <TableCell className="text-sm">{formatCurrency(r.amount)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.reason}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("border-0", DISPUTE_STATUS_BADGE[r.status])}>
                        {DISPUTE_STATUS_LABEL[r.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(r.date)}</TableCell>
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
