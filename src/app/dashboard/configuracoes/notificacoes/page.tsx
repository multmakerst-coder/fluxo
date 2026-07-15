"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificacoesPage() {
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: "novo-lead",
      title: "Notificação de novo lead por email",
      description: "Recebe um email sempre que um novo contacto entrar através de qualquer canal.",
      enabled: true,
    },
    {
      id: "erro-fluxo",
      title: "Notificação de erro em fluxo",
      description: "Sê avisado imediatamente quando um fluxo automático falhar a enviar uma mensagem.",
      enabled: true,
    },
    {
      id: "limite-plano",
      title: "Notificação de limite de plano próximo",
      description: "Recebe um alerta quando estiveres perto de atingir os limites do teu plano atual.",
      enabled: false,
    },
  ]);

  function toggle(id: string) {
    setSettings((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const next = !s.enabled;
        toast.success(next ? `"${s.title}" ativada` : `"${s.title}" desativada`);
        return { ...s, enabled: next };
      }),
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notificações</CardTitle>
        <CardDescription>Escolhe que alertas queres receber por email.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-border">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="max-w-lg">
              <p className="text-sm font-medium">{setting.title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{setting.description}</p>
            </div>
            <Switch checked={setting.enabled} onCheckedChange={() => toggle(setting.id)} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
