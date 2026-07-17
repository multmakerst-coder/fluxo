"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  MessageCircle,
  Camera,
  Mail,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  LoaderCircle,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toastSaved } from "@/lib/toast";
import { createClient } from "@/lib/supabase/client";
import { WhatsAppEmbeddedSignupButton, type WhatsAppChannelRecord } from "@/components/whatsapp-embedded-signup-button";
import { ONBOARDING_STEPS, ONBOARDING_TEMPLATES, type OnboardingStepId } from "./_data";

type ChannelType = "whatsapp" | "instagram" | "email";

interface ChannelRow {
  id: string;
  client_id: string;
  type: ChannelType;
  status: "connected" | "disconnected" | "error";
  display_name: string | null;
  phone_number: string | null;
  external_account_id: string | null;
  access_token_encrypted: string | null;
  metadata: Record<string, unknown>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [clientId, setClientId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Record<ChannelType, ChannelRow | null>>({
    whatsapp: null,
    instagram: null,
    email: null,
  });
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [criandoFluxo, setCriandoFluxo] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from("profiles").select("id, owner_id").eq("id", user.id).single();
      const resolvedClientId = profile?.owner_id ?? profile?.id ?? user.id;
      setClientId(resolvedClientId);

      const { data } = await supabase.from("channels").select("*").eq("client_id", resolvedClientId);
      const next: Record<ChannelType, ChannelRow | null> = { whatsapp: null, instagram: null, email: null };
      for (const row of (data ?? []) as ChannelRow[]) {
        next[row.type] = row;
      }
      setChannels(next);
    })();
  }, []);

  async function connectChannel(type: ChannelType, fields: Partial<ChannelRow>) {
    if (!clientId) {
      toast.error("Sessão expirada. Volta a iniciar sessão para ligar canais.");
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from("channels")
      .upsert(
        {
          client_id: clientId,
          type,
          status: "connected",
          connected_at: new Date().toISOString(),
          ...fields,
        },
        { onConflict: "client_id,type" },
      )
      .select("*")
      .single();

    if (error || !data) {
      toast.error("Não foi possível ligar o canal. Verifica os dados introduzidos.");
      return;
    }

    setChannels((prev) => ({ ...prev, [type]: data as ChannelRow }));
    toastSaved(`${type === "whatsapp" ? "WhatsApp" : type === "instagram" ? "Instagram" : "Email"} ligado`);
  }

  const step = ONBOARDING_STEPS[stepIndex];
  const progresso = Math.round(((stepIndex + 1) / ONBOARDING_STEPS.length) * 100);
  const whatsappConnected = channels.whatsapp?.status === "connected";

  function podeAvancar(id: OnboardingStepId) {
    if (id === "whatsapp") return whatsappConnected;
    if (id === "fluxo") return templateId !== null;
    return true;
  }

  function avancar() {
    if (stepIndex === ONBOARDING_STEPS.length - 1) {
      void concluir();
      return;
    }
    setStepIndex((i) => Math.min(i + 1, ONBOARDING_STEPS.length - 1));
  }

  function recuar() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function concluir() {
    const template = ONBOARDING_TEMPLATES.find((t) => t.id === templateId);
    if (!template) {
      router.push("/dashboard");
      return;
    }

    setCriandoFluxo(true);
    try {
      const createResponse = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: template.canal, name: template.nome, triggerId: template.triggerId }),
      });
      if (!createResponse.ok) {
        const body = await createResponse.json().catch(() => null);
        throw new Error(body?.error ?? "Erro ao criar fluxo");
      }
      const { flow } = await createResponse.json();

      // Personaliza a mensagem/gatilho de acordo com o template escolhido —
      // a criação inicial via POST usa sempre um texto genérico.
      const nodes = (flow.nodes as Array<Record<string, unknown>>).map((node) => {
        const data = node.data as Record<string, unknown>;
        if (data?.kind === "trigger" && template.triggerConfig) {
          return { ...node, data: { ...data, config: template.triggerConfig } };
        }
        if (data?.kind === "mensagem") {
          return { ...node, data: { ...data, config: { texto: template.mensagem } } };
        }
        return node;
      });

      await fetch(`/api/flows/${flow.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes }),
      });

      toastSaved("Configuração inicial concluída", "O teu primeiro fluxo está pronto a ser editado.");
      router.push(`/dashboard/fluxos/${template.canal}/${flow.id}`);
    } catch (error) {
      toast.error("Não foi possível criar o teu primeiro fluxo", {
        description: error instanceof Error ? error.message : "Tenta novamente a partir do dashboard.",
      });
      router.push("/dashboard");
    } finally {
      setCriandoFluxo(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">
            Passo {stepIndex + 1} de {ONBOARDING_STEPS.length}
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Sair e continuar mais tarde
          </button>
        </div>
        <Progress value={progresso} />
        <div className="flex flex-wrap gap-2">
          {ONBOARDING_STEPS.map((s, i) => (
            <Badge
              key={s.id}
              variant="outline"
              className={cn(
                "border-0",
                i === stepIndex
                  ? "bg-primary/10 text-primary"
                  : i < stepIndex
                    ? "bg-success/10 text-success"
                    : "bg-muted text-muted-foreground",
              )}
            >
              {i < stepIndex && <CheckCircle2 className="mr-1 h-3 w-3" />}
              {s.titulo}
              {s.opcional ? " (opcional)" : ""}
            </Badge>
          ))}
        </div>
      </div>

      <div className="glass rounded-3xl p-8 sm:p-10">
        {step.id === "whatsapp" && (
          <WhatsAppConnectStep
            channel={channels.whatsapp}
            onConnect={(fields) => connectChannel("whatsapp", fields)}
            onConnected={(next) => {
              setChannels((prev) => ({ ...prev, whatsapp: next }));
              toastSaved("WhatsApp ligado");
            }}
          />
        )}

        {step.id === "instagram" && (
          <InstagramConnectStep channel={channels.instagram} onConnect={(fields) => connectChannel("instagram", fields)} />
        )}

        {step.id === "email" && (
          <EmailConnectStep channel={channels.email} onConnect={(fields) => connectChannel("email", fields)} />
        )}

        {step.id === "fluxo" && (
          <div className="flex flex-col gap-5">
            <StepHeader
              icon={Sparkles}
              titulo="Cria o teu primeiro fluxo"
              descricao="Escolhe um template para começar — podes editar tudo depois no construtor de fluxos."
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ONBOARDING_TEMPLATES.map((template) => {
                const Icon = template.canal === "whatsapp" ? MessageCircle : template.canal === "instagram" ? Camera : Mail;
                const selecionado = templateId === template.id;
                return (
                  <Card
                    key={template.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setTemplateId(template.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") setTemplateId(template.id);
                    }}
                    className={cn(
                      "cursor-pointer border-0 ring-1 ring-border transition-colors",
                      selecionado && "ring-2 ring-primary",
                    )}
                  >
                    <CardContent className="flex flex-col gap-2 px-4">
                      <div className="flex items-center justify-between">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </span>
                        {selecionado && <CheckCircle2 className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="text-sm font-medium">{template.nome}</p>
                      <p className="text-xs text-muted-foreground">{template.descricao}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={recuar} disabled={stepIndex === 0 || criandoFluxo}>
          <ArrowLeft /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          {step.opcional && step.id !== "fluxo" && (
            <Button variant="ghost" onClick={avancar} disabled={criandoFluxo}>
              Saltar por agora
            </Button>
          )}
          <Button onClick={avancar} disabled={!podeAvancar(step.id) || criandoFluxo}>
            {criandoFluxo && <LoaderCircle className="h-4 w-4 animate-spin" />}
            {stepIndex === ONBOARDING_STEPS.length - 1 ? "Concluir configuração" : "Seguinte"}
            <ArrowRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

function StepHeader({
  icon: Icon,
  titulo,
  descricao,
}: {
  icon: typeof MessageCircle;
  titulo: string;
  descricao: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <h1 className="font-heading text-xl font-semibold">{titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{descricao}</p>
      </div>
    </div>
  );
}

function WhatsAppConnectStep({
  channel,
  onConnect,
  onConnected,
}: {
  channel: ChannelRow | null;
  onConnect: (fields: Partial<ChannelRow>) => Promise<void>;
  onConnected: (channel: WhatsAppChannelRecord) => void;
}) {
  const connected = channel?.status === "connected";
  const [phone, setPhone] = useState(channel?.phone_number ?? "");
  const [phoneNumberId, setPhoneNumberId] = useState(channel?.external_account_id ?? "");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [manual, setManual] = useState(false);

  async function handleConnect() {
    if (!phone.trim() || !phoneNumberId.trim() || !token.trim()) return;
    setSubmitting(true);
    try {
      await onConnect({
        phone_number: phone.trim(),
        external_account_id: phoneNumberId.trim(),
        access_token_encrypted: token.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StepHeader
        icon={MessageCircle}
        titulo="Liga o teu WhatsApp Business"
        descricao="Autoriza o Fluxo a enviar e receber mensagens em teu nome através da Meta WhatsApp Cloud API."
      />
      {connected && channel ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:max-w-sm">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Número de telefone</Label>
              <p className="text-sm font-medium">{channel.phone_number}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Phone Number ID</Label>
              <p className="font-mono text-sm">{channel.external_account_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Ligado com sucesso.
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Liga a tua conta com um clique — autorizas no Facebook e escolhes o número de WhatsApp Business, sem
            precisares de ir buscar nenhum ID ou token.
          </p>
          <WhatsAppEmbeddedSignupButton onConnected={onConnected} />
          <button
            type="button"
            onClick={() => setManual((m) => !m)}
            className="w-fit text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {manual ? "Ocultar ligação manual" : "Prefiro inserir os dados manualmente"}
          </button>
          {manual && (
            <>
              <p className="text-sm text-muted-foreground">
                Obtém estes dados no teu{" "}
                <a
                  href="https://business.facebook.com/wa/manage/phone-numbers/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  Meta Business Suite → WhatsApp Cloud API
                </a>
                .
              </p>
              <div className="grid gap-3 sm:max-w-sm">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ob-wa-phone">Número de telefone</Label>
                  <Input id="ob-wa-phone" placeholder="+351 912 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ob-wa-phone-id">Phone Number ID</Label>
                  <Input
                    id="ob-wa-phone-id"
                    placeholder="Ex: 1185997837938923"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="ob-wa-token">Token de acesso permanente</Label>
                  <Input id="ob-wa-token" type="password" placeholder="EAAxxxxxxxxxxxxx" value={token} onChange={(e) => setToken(e.target.value)} />
                </div>
              </div>
              <Button
                onClick={handleConnect}
                disabled={submitting || !phone.trim() || !phoneNumberId.trim() || !token.trim()}
                className="w-fit"
              >
                {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                Ligar WhatsApp Business
              </Button>
            </>
          )}
        </>
      )}
    </div>
  );
}

function InstagramConnectStep({
  channel,
  onConnect,
}: {
  channel: ChannelRow | null;
  onConnect: (fields: Partial<ChannelRow>) => Promise<void>;
}) {
  const connected = channel?.status === "connected";
  const [handle, setHandle] = useState(channel?.display_name ?? "");
  const [businessAccountId, setBusinessAccountId] = useState(channel?.external_account_id ?? "");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleConnect() {
    if (!handle.trim() || !businessAccountId.trim() || !token.trim()) return;
    setSubmitting(true);
    try {
      await onConnect({
        display_name: handle.trim(),
        external_account_id: businessAccountId.trim(),
        access_token_encrypted: token.trim(),
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StepHeader
        icon={Camera}
        titulo="Liga a tua conta de Instagram"
        descricao="Opcional — podes ligar mais tarde em Configurações → Canais. Precisas de uma conta Instagram Business ou Creator."
      />
      {connected && channel ? (
        <div className="flex flex-col gap-4">
          <div className="grid gap-3 sm:max-w-sm">
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Conta</Label>
              <p className="text-sm font-medium">@{channel.display_name}</p>
            </div>
            <div className="flex flex-col gap-1">
              <Label className="text-xs text-muted-foreground">Business Account ID</Label>
              <p className="font-mono text-sm">{channel.external_account_id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Ligado com sucesso.
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Precisa de uma conta Instagram Business/Creator ligada a uma Página do Facebook. Obtém o ID e o token na{" "}
            <a
              href="https://developers.facebook.com/apps"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline-offset-4 hover:underline"
            >
              Meta for Developers
            </a>
            .
          </p>
          <div className="grid gap-3 sm:max-w-sm">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ob-ig-handle">Nome de utilizador (@)</Label>
              <Input id="ob-ig-handle" placeholder="a_minha_marca" value={handle} onChange={(e) => setHandle(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ob-ig-account-id">Instagram Business Account ID</Label>
              <Input
                id="ob-ig-account-id"
                placeholder="Ex: 17841440937462157"
                value={businessAccountId}
                onChange={(e) => setBusinessAccountId(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="ob-ig-token">Token de acesso</Label>
              <Input id="ob-ig-token" type="password" placeholder="EAAxxxxxxxxxxxxx" value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
          </div>
          <Button
            onClick={handleConnect}
            disabled={submitting || !handle.trim() || !businessAccountId.trim() || !token.trim()}
            className="w-fit"
          >
            {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
            Ligar Instagram
          </Button>
          <p className="text-xs text-muted-foreground">
            Podes saltar este passo e ligar mais tarde em Configurações → Canais.
          </p>
        </>
      )}
    </div>
  );
}

function EmailConnectStep({
  channel,
  onConnect,
}: {
  channel: ChannelRow | null;
  onConnect: (fields: Partial<ChannelRow>) => Promise<void>;
}) {
  const connected = channel?.status === "connected";
  const [domain, setDomain] = useState(channel?.display_name ?? "");
  const [submitting, setSubmitting] = useState(false);

  async function handleConnect() {
    const trimmed = domain.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onConnect({ display_name: trimmed, metadata: { dnsVerified: false } });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <StepHeader
        icon={Mail}
        titulo="Configura o teu email de envio"
        descricao="Opcional — usa um domínio próprio para que os teus emails cheguem com boa reputação de entrega."
      />
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ob-dominio-email">Domínio de envio</Label>
        <Input
          id="ob-dominio-email"
          placeholder="envio.a-tua-empresa.pt"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={connected}
        />
      </div>
      {connected ? (
        <div className="flex items-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" />
          Domínio guardado. Configura os registos SPF/DKIM em Configurações → Canais.
        </div>
      ) : (
        <Button onClick={handleConnect} disabled={!domain.trim() || submitting} className="w-fit">
          {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
          Guardar domínio
        </Button>
      )}
      <p className="text-xs text-muted-foreground">
        Podes saltar este passo e configurar mais tarde em Configurações → Canais.
      </p>
    </div>
  );
}
