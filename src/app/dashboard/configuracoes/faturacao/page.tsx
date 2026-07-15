"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { PLANS } from "@/lib/plans";

interface SubscriptionRow {
  id: string;
  status: "trialing" | "active" | "past_due" | "canceled";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  plans: { slug: string; name: string; price_monthly: number | null; is_custom_price: boolean } | null;
}

function statusBadge(status: SubscriptionRow["status"]) {
  switch (status) {
    case "active":
      return { label: "Ativo", className: "border-0 bg-success/10 text-success" };
    case "trialing":
      return { label: "Período de teste", className: "border-0 bg-info/10 text-info" };
    case "past_due":
      return { label: "Pagamento em falta", className: "border-0 bg-warning/10 text-warning" };
    case "canceled":
    default:
      return { label: "Cancelado", className: "border-0 bg-destructive/10 text-destructive" };
  }
}

export default function FaturacaoPage() {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/subscriptions/me");
        if (!response.ok) throw new Error();
        const { subscription } = await response.json();
        if (!cancelled) setSubscription(subscription);
      } catch {
        if (!cancelled) toast.error("Não foi possível carregar a subscrição");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function abrirPortal() {
    setIsOpeningPortal(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const body = await response.json();
      if (!response.ok || !body.url) throw new Error(body?.error ?? "Erro ao abrir o portal de faturação");
      window.location.href = body.url;
    } catch (error) {
      toast.error("Não foi possível abrir o portal de faturação", {
        description: error instanceof Error ? error.message : undefined,
      });
      setIsOpeningPortal(false);
    }
  }

  const fallbackPlan = PLANS.find((p) => p.slug === "gratuito")!;
  const planName = subscription?.plans?.name ?? fallbackPlan.name;
  const priceMonthly = subscription?.plans ? subscription.plans.price_monthly : fallbackPlan.priceMonthly;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Plano atual</CardTitle>
          <CardDescription>Detalhes da tua subscrição e faturação, geridos de forma segura pela Stripe.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> A carregar…
            </div>
          ) : (
            <>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-semibold">{planName}</p>
                  {subscription ? (
                    <Badge className={statusBadge(subscription.status).className}>
                      {statusBadge(subscription.status).label}
                    </Badge>
                  ) : (
                    <Badge className="border-0 bg-muted text-muted-foreground">Sem subscrição paga</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {priceMonthly ? `${priceMonthly}€ / mês` : "Plano gratuito"}
                  {subscription?.current_period_end &&
                    ` · Renovação a ${new Date(subscription.current_period_end).toLocaleDateString("pt-PT")}`}
                  {subscription?.cancel_at_period_end && " · Cancela no fim do período atual"}
                </p>
              </div>
              <div className="flex gap-2">
                {subscription?.stripe_customer_id ? (
                  <Button variant="outline" disabled={isOpeningPortal} onClick={abrirPortal}>
                    {isOpeningPortal ? <Loader2 className="animate-spin" /> : <ExternalLink />}
                    Gerir subscrição
                  </Button>
                ) : (
                  <Button nativeButton={false} render={<Link href="/precos">Ver planos</Link>} />
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Método de pagamento e faturas</CardTitle>
          <CardDescription>
            O cartão guardado, o histórico de faturas e o cancelamento são geridos diretamente no portal seguro da
            Stripe — clica em &ldquo;Gerir subscrição&rdquo; acima para aceder.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
