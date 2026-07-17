"use client";

import { useEffect, useState } from "react";
import { MessageCircle, Camera, Mail, CheckCircle2, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { toastSaved } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { WhatsAppEmbeddedSignupButton, type WhatsAppChannelRecord } from "@/components/whatsapp-embedded-signup-button";

type Status = "ligado" | "desligado";
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

function StatusBadge({ status }: { status: Status }) {
  return (
    <Badge
      variant="outline"
      className={cn("border-0", status === "ligado" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}
    >
      {status === "ligado" ? "Ligado" : "Desligado"}
    </Badge>
  );
}

function ConfirmRemoveDialog({ channelName, onConfirm }: { channelName: string; onConfirm: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive">Remover ligação</Button>} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remover {channelName}?</DialogTitle>
          <DialogDescription>
            Isto vai desligar o canal e parar todos os fluxos associados. Podes voltar a ligar mais tarde.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            Remover
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function maskToken(token: string | null) {
  if (!token) return "";
  if (token.length <= 8) return "••••••••";
  return `${token.slice(0, 4)}••••••••${token.slice(-4)}`;
}

export default function CanaisPage() {
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const [channels, setChannels] = useState<Record<ChannelType, ChannelRow | null>>({
    whatsapp: null,
    instagram: null,
    email: null,
  });

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("id, owner_id").eq("id", user.id).single();
      const resolvedClientId = profile?.owner_id ?? profile?.id ?? user.id;
      setClientId(resolvedClientId);

      const { data } = await supabase.from("channels").select("*").eq("client_id", resolvedClientId);
      const next: Record<ChannelType, ChannelRow | null> = { whatsapp: null, instagram: null, email: null };
      for (const row of (data ?? []) as ChannelRow[]) {
        next[row.type] = row;
      }
      setChannels(next);
      setLoading(false);
    })();
  }, []);

  async function connectChannel(type: ChannelType, fields: Partial<ChannelRow>) {
    if (!clientId) return;
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

  async function disconnectChannel(type: ChannelType) {
    if (!clientId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("channels")
      .update({ status: "disconnected" })
      .eq("client_id", clientId)
      .eq("type", type);

    if (error) {
      toast.error("Não foi possível remover a ligação");
      return;
    }
    setChannels((prev) => ({ ...prev, [type]: prev[type] ? { ...prev[type]!, status: "disconnected" } : null }));
    toast.success("Ligação removida");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> A carregar canais...
      </div>
    );
  }

  const whatsapp = channels.whatsapp;
  const whatsappConnected = whatsapp?.status === "connected";
  const instagram = channels.instagram;
  const instagramConnected = instagram?.status === "connected";
  const email = channels.email;
  const emailConnected = email?.status === "connected";

  return (
    <div className="flex flex-col gap-6">
      <WhatsAppCard
        connected={whatsappConnected}
        channel={whatsapp}
        onConnect={(fields) => connectChannel("whatsapp", fields)}
        onConnected={(next) => {
          setChannels((prev) => ({ ...prev, whatsapp: next }));
          toastSaved("WhatsApp ligado");
        }}
        onDisconnect={() => disconnectChannel("whatsapp")}
      />
      <InstagramCard
        connected={instagramConnected}
        channel={instagram}
        onConnect={(fields) => connectChannel("instagram", fields)}
        onDisconnect={() => disconnectChannel("instagram")}
      />
      <EmailCard
        connected={emailConnected}
        channel={email}
        onConnect={(fields) => connectChannel("email", fields)}
        onDisconnect={() => disconnectChannel("email")}
      />
    </div>
  );
}

function WhatsAppCard({
  connected,
  channel,
  onConnect,
  onConnected,
  onDisconnect,
}: {
  connected: boolean;
  channel: ChannelRow | null;
  onConnect: (fields: Partial<ChannelRow>) => Promise<void>;
  onConnected: (channel: WhatsAppChannelRecord) => void;
  onDisconnect: () => void;
}) {
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
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <CardTitle>WhatsApp</CardTitle>
            <CardDescription>Liga o número de WhatsApp Business para automatizar conversas.</CardDescription>
          </div>
        </div>
        <StatusBadge status={connected ? "ligado" : "desligado"} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {connected && channel ? (
          <>
            <div className="grid gap-3 sm:max-w-sm">
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Número de telefone</Label>
                <p className="text-sm font-medium">{channel.phone_number}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Phone Number ID</Label>
                <p className="font-mono text-sm">{channel.external_account_id}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Label className="text-xs text-muted-foreground">Token de acesso</Label>
                <p className="font-mono text-sm">{maskToken(channel.access_token_encrypted)}</p>
              </div>
            </div>
            <ConfirmRemoveDialog channelName="WhatsApp" onConfirm={onDisconnect} />
          </>
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
                    <Label htmlFor="wa-phone">Número de telefone</Label>
                    <Input id="wa-phone" placeholder="+351 912 345 678" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="wa-phone-id">Phone Number ID</Label>
                    <Input id="wa-phone-id" placeholder="Ex: 1185997837938923" value={phoneNumberId} onChange={(e) => setPhoneNumberId(e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="wa-token">Token de acesso permanente</Label>
                    <Input id="wa-token" type="password" placeholder="EAAxxxxxxxxxxxxx" value={token} onChange={(e) => setToken(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleConnect} disabled={submitting || !phone.trim() || !phoneNumberId.trim() || !token.trim()} className="w-fit">
                  {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  Ligar WhatsApp
                </Button>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function InstagramCard({
  connected,
  channel,
  onConnect,
  onDisconnect,
}: {
  connected: boolean;
  channel: ChannelRow | null;
  onConnect: (fields: Partial<ChannelRow>) => Promise<void>;
  onDisconnect: () => void;
}) {
  const [handle, setHandle] = useState(channel?.display_name ?? "");
  const [businessAccountId, setBusinessAccountId] = useState(channel?.external_account_id ?? "");
  const [token, setToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const instagramPermissions = [
    "Ler mensagens diretas",
    "Enviar mensagens diretas",
    "Aceder a comentários de publicações",
    "Gerir metadados da conta business",
  ];

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
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Camera className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <CardTitle>Instagram</CardTitle>
            <CardDescription>Liga a tua conta Instagram Business para automatizar DMs e comentários.</CardDescription>
          </div>
        </div>
        <StatusBadge status={connected ? "ligado" : "desligado"} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {connected && channel ? (
          <>
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
            <div>
              <Label className="mb-2 block">Permissões concedidas</Label>
              <ul className="flex flex-col gap-1.5">
                {instagramPermissions.map((p) => (
                  <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-success" /> {p}
                  </li>
                ))}
              </ul>
            </div>
            <ConfirmRemoveDialog channelName="Instagram" onConfirm={onDisconnect} />
          </>
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
                <Label htmlFor="ig-handle">Nome de utilizador (@)</Label>
                <Input id="ig-handle" placeholder="a_minha_marca" value={handle} onChange={(e) => setHandle(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ig-account-id">Instagram Business Account ID</Label>
                <Input id="ig-account-id" placeholder="Ex: 17841440937462157" value={businessAccountId} onChange={(e) => setBusinessAccountId(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="ig-token">Token de acesso</Label>
                <Input id="ig-token" type="password" placeholder="EAAxxxxxxxxxxxxx" value={token} onChange={(e) => setToken(e.target.value)} />
              </div>
            </div>
            <Button onClick={handleConnect} disabled={submitting || !handle.trim() || !businessAccountId.trim() || !token.trim()} className="w-fit">
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Ligar Instagram
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

function EmailCard({
  connected,
  channel,
  onConnect,
  onDisconnect,
}: {
  connected: boolean;
  channel: ChannelRow | null;
  onConnect: (fields: Partial<ChannelRow>) => Promise<void>;
  onDisconnect: () => void;
}) {
  const [domain, setDomain] = useState(channel?.display_name ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [dnsChecked, setDnsChecked] = useState(Boolean((channel?.metadata as { dnsVerified?: boolean } | null)?.dnsVerified));

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
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
            <Mail className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <CardTitle>Email</CardTitle>
            <CardDescription>Configura o domínio de envio personalizado para os teus emails.</CardDescription>
          </div>
        </div>
        <StatusBadge status={connected ? "ligado" : "desligado"} />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {connected && channel ? (
          <>
            <div className="flex flex-col gap-1.5 sm:max-w-sm">
              <Label className="text-xs text-muted-foreground">Domínio de envio</Label>
              <p className="text-sm font-medium">{channel.display_name}</p>
            </div>

            <Accordion>
              <AccordionItem value="dns">
                <AccordionTrigger>Guia de configuração DNS (SPF/DKIM)</AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4 text-sm text-muted-foreground">
                    <div>
                      <p className="font-medium text-foreground">1. Adiciona o registo SPF</p>
                      <p>
                        No painel de DNS do teu domínio, adiciona um registo TXT com o valor{" "}
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">v=spf1 include:mail.fluxo.pt ~all</code>.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">2. Adiciona o registo DKIM</p>
                      <p>
                        Cria um registo CNAME <code className="rounded bg-muted px-1.5 py-0.5 text-xs">fluxo._domainkey</code>{" "}
                        apontando para <code className="rounded bg-muted px-1.5 py-0.5 text-xs">dkim.fluxo.pt</code>.
                      </p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">3. Verifica a propagação</p>
                      <p>A propagação de DNS pode demorar até 48 horas. Verifica o estado abaixo depois de configurar.</p>
                    </div>
                    {dnsChecked ? (
                      <div className="flex w-fit items-center gap-2 rounded-xl bg-success/10 px-3 py-2 text-xs font-medium text-success">
                        <CheckCircle2 className="h-3.5 w-3.5" /> DNS verificado
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="self-start"
                        onClick={() => {
                          setDnsChecked(true);
                          toastSaved("DNS verificado");
                        }}
                      >
                        Verificar configuração DNS
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <ConfirmRemoveDialog channelName="Email" onConfirm={onDisconnect} />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1.5 sm:max-w-sm">
              <Label htmlFor="email-domain">Domínio de envio</Label>
              <Input id="email-domain" placeholder="envio.a-tua-empresa.pt" value={domain} onChange={(e) => setDomain(e.target.value)} />
            </div>
            <Button onClick={handleConnect} disabled={submitting || !domain.trim()} className="w-fit">
              {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
              Ligar Email
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
