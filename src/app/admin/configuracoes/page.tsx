"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LockedField } from "@/components/ui/locked-field";
import { createClient } from "@/lib/supabase/client";
import { ADMIN_EMAIL } from "@/lib/admin";
import { DEFAULT_TRIAL_DAYS, DEFAULT_SUPPORT_EMAIL, getPlatformSetting, setPlatformSetting } from "@/lib/admin/platform-settings";

export default function AdminConfiguracoesPage() {
  const [trialDays, setTrialDays] = useState(String(DEFAULT_TRIAL_DAYS));
  const [supportEmail, setSupportEmail] = useState(DEFAULT_SUPPORT_EMAIL);
  const [loading, setLoading] = useState(true);
  const [migrationMissing, setMigrationMissing] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [trial, support] = await Promise.all([
        getPlatformSetting(supabase, "trial_days", DEFAULT_TRIAL_DAYS),
        getPlatformSetting(supabase, "support_email", DEFAULT_SUPPORT_EMAIL),
      ]);
      setTrialDays(String(trial.value));
      setSupportEmail(support.value);
      setMigrationMissing(!trial.persisted && !support.persisted);
      setLoading(false);
    })();
  }, []);

  async function saveTrialDays(newValue: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const days = Math.max(0, Number(newValue) || 0);
    const { ok } = await setPlatformSetting(supabase, "trial_days", days, user?.id);
    if (!ok) setMigrationMissing(true);
  }

  async function saveSupportEmail(newValue: string) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { ok } = await setPlatformSetting(supabase, "support_email", newValue, user?.id);
    if (!ok) setMigrationMissing(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">Definições globais da plataforma e do painel de administração.</p>
      </div>

      {migrationMissing && !loading && (
        <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            A tabela <code className="font-mono">platform_settings</code> ainda não existe na base de dados — as
            alterações aqui não vão persistir até a migração em <code className="font-mono">supabase/schema.sql</code>{" "}
            ser aplicada no editor SQL do Supabase.
          </p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Administração da conta</CardTitle>
          <CardDescription>Quem tem acesso ao painel de administração.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm">
            <p className="text-muted-foreground">
              Apenas a conta <span className="font-medium text-foreground">{ADMIN_EMAIL}</span> tem o papel de
              administrador por omissão (definido em <code className="font-mono text-xs">src/lib/admin.ts</code>).
              Para dar acesso de admin a outra conta, define <code className="font-mono text-xs">role = &apos;admin&apos;</code>{" "}
              no perfil dessa pessoa na base de dados — não existem outros emails &ldquo;bootstrap&rdquo;.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Período de teste gratuito</CardTitle>
          <CardDescription>Número de dias de acesso Pro grátis oferecidos a novos clientes no registo.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : (
            <LockedField
              label="Dias de teste"
              type="number"
              value={trialDays}
              onSave={(v) => {
                setTrialDays(v);
                return saveTrialDays(v);
              }}
              savedMessage="Período de teste guardado"
            />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contacto de suporte</CardTitle>
          <CardDescription>Email apresentado aos clientes para pedidos de suporte.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">A carregar...</p>
          ) : (
            <LockedField
              label="Email de suporte"
              type="email"
              value={supportEmail}
              onSave={(v) => {
                setSupportEmail(v);
                return saveSupportEmail(v);
              }}
              savedMessage="Email de suporte guardado"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
