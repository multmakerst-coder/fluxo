"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Sparkles, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { ChannelCard } from "@/app/dashboard/_data";

interface OnboardingChecklistProps {
  channelStatus: ChannelCard[];
}

export function OnboardingChecklist({ channelStatus }: OnboardingChecklistProps) {
  const [dismissed, setDismissed] = useState(false);

  const whatsappLigado = channelStatus.some((c) => c.id === "whatsapp" && c.status === "ligado");
  const instagramLigado = channelStatus.some((c) => c.id === "instagram" && c.status === "ligado");
  const emailLigado = channelStatus.some((c) => c.id === "email" && c.status === "ligado");

  const itens = [
    { label: "Ligar WhatsApp", feito: whatsappLigado, href: "/dashboard/configuracoes/canais" },
    { label: "Ligar Instagram", feito: instagramLigado, href: "/dashboard/configuracoes/canais" },
    { label: "Configurar email de envio", feito: emailLigado, href: "/dashboard/configuracoes/canais" },
    { label: "Criar o primeiro fluxo", feito: true, href: "/dashboard/fluxos/whatsapp" },
  ];

  const concluidos = itens.filter((i) => i.feito).length;
  const progresso = Math.round((concluidos / itens.length) * 100);

  if (dismissed || concluidos === itens.length) return null;

  return (
    <Card className="glass border-0">
      <CardContent className="flex flex-col gap-4 px-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-4.5 w-4.5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-semibold">Primeiros passos no Fluxo</p>
              <p className="text-xs text-muted-foreground">
                {concluidos} de {itens.length} concluídos — completa a configuração inicial.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setDismissed(true)} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Progress value={progresso} />

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {itens.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-xl border border-border px-3 py-2.5 text-sm transition-colors hover:bg-muted/60",
                item.feito && "text-muted-foreground",
              )}
            >
              {item.feito ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
              ) : (
                <Circle className="h-4 w-4 shrink-0" />
              )}
              <span className={cn(item.feito && "line-through")}>{item.label}</span>
            </Link>
          ))}
        </div>

        <Link
          href="/onboarding"
          className="text-xs font-medium text-primary hover:underline"
        >
          Retomar o assistente de configuração →
        </Link>
      </CardContent>
    </Card>
  );
}
