"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { PLANS } from "@/lib/plans";
import { toast } from "sonner";

function formatMonthly(value: number | null, yearly: boolean) {
  if (value === null) return "Sob consulta";
  if (value === 0) return "0€";
  if (!yearly) return `${value}€`;
  return `${Math.round((value * 10) / 12)}€`;
}

export function PricingCards() {
  const router = useRouter();
  const [yearly, setYearly] = useState(false);
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  async function handleAssinar(planSlug: string) {
    if (planSlug === "gratuito") {
      router.push("/registar");
      return;
    }

    setLoadingSlug(planSlug);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planSlug, interval: yearly ? "yearly" : "monthly" }),
      });

      if (response.status === 401) {
        router.push(`/registar?plano=${planSlug}`);
        return;
      }

      const body = await response.json();
      if (!response.ok || !body.url) throw new Error(body?.error ?? "Erro ao iniciar o checkout");
      window.location.assign(body.url);
    } catch (error) {
      toast.error("Não foi possível iniciar o checkout", {
        description: error instanceof Error ? error.message : undefined,
      });
      setLoadingSlug(null);
    }
  }

  return (
    <div className="flex flex-col items-center gap-12">
      <div className="glass-subtle flex items-center gap-4 rounded-full px-5 py-2.5">
        <span className={!yearly ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"}>
          Mensal
        </span>
        <Switch checked={yearly} onCheckedChange={setYearly} aria-label="Alternar entre preço mensal e anual" />
        <span className={yearly ? "text-sm font-medium text-foreground" : "text-sm text-muted-foreground"}>
          Anual
        </span>
        <Badge variant="secondary" className="ml-1">
          Poupa 2 meses
        </Badge>
      </div>

      <div className="grid w-full gap-6 md:grid-cols-3">
        {PLANS.map((plan) => (
          <Card
            key={plan.slug}
            className={
              plan.highlighted
                ? "glass relative rounded-3xl border-0 ring-2 ring-primary md:scale-105"
                : "rounded-3xl border-border"
            }
          >
            <CardContent className="flex h-full flex-col gap-6 px-6 py-8">
              {plan.highlighted && <Badge className="w-fit">Mais popular</Badge>}
              <div>
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="font-heading text-4xl font-bold">
                  {formatMonthly(plan.priceMonthly, yearly)}
                </span>
                {!plan.isCustomPrice && (
                  <span className="text-sm text-muted-foreground">/mês</span>
                )}
              </div>
              {yearly && !plan.isCustomPrice && plan.priceYearly ? (
                <p className="-mt-4 text-xs text-muted-foreground">
                  Faturado anualmente ({plan.priceYearly}€/ano)
                </p>
              ) : null}

              <ul className="flex flex-1 flex-col gap-2.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2} />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.isCustomPrice ? (
                <Button
                  nativeButton={false}
                  variant="outline"
                  className="mt-2 h-11 rounded-xl"
                  render={<Link href="/contacto">Falar com vendas</Link>}
                />
              ) : (
                <Button
                  variant={plan.highlighted ? "default" : "outline"}
                  className="mt-2 h-11 rounded-xl"
                  disabled={loadingSlug === plan.slug}
                  onClick={() => handleAssinar(plan.slug)}
                >
                  {loadingSlug === plan.slug && <Loader2 className="animate-spin" />}
                  {plan.slug === "gratuito" ? "Começar agora" : "Assinar Pro"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
