import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Camera, Mail, Users, Send, Workflow, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getClientById, PLAN_LABELS, type Channel } from "../_data";
import { ClientAdminActions, ClientStatusBadge } from "./client-actions";

const CHANNEL_ICON: Record<Channel, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  instagram: Camera,
  email: Mail,
};

const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  instagram: "Instagram",
  email: "Email",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function AdminClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = getClientById(id);

  if (!client) {
    notFound();
  }

  const stats = [
    { label: "Contactos", value: new Intl.NumberFormat("pt-PT").format(client.contactsCount), icon: Users },
    {
      label: "Mensagens (env. / receb.)",
      value: `${new Intl.NumberFormat("pt-PT").format(client.messagesSent)} / ${new Intl.NumberFormat("pt-PT").format(client.messagesReceived)}`,
      icon: Send,
    },
    { label: "Fluxos ativos", value: String(client.activeFlows), icon: Workflow },
    { label: "Última atividade", value: formatDateTime(client.lastActivity), icon: Clock },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/clientes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar a clientes
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-primary/10 text-primary text-base">{initials(client.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold">{client.name}</h1>
              <ClientStatusBadge status={client.status} />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {client.contactName} &middot; {client.email}
            </p>
          </div>
        </div>
      </div>

      <ClientAdminActions client={client} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label} className="glass border-0">
            <CardContent className="flex flex-col gap-3 px-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-4.5 w-4.5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-lg font-semibold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Dados da conta</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Nome da empresa</span>
              <span className="font-medium">{client.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Pessoa de contacto</span>
              <span className="font-medium">{client.contactName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{client.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Data de registo</span>
              <span className="font-medium">{formatDate(client.registeredAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">MRR atual</span>
              <span className="font-medium">
                {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(client.mrr)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Canais ligados</span>
              <div className="flex items-center gap-1.5">
                {client.channels.map((channel) => {
                  const Icon = CHANNEL_ICON[channel];
                  return (
                    <Badge key={channel} variant="outline" className="gap-1">
                      <Icon className="h-3 w-3" /> {CHANNEL_LABEL[channel]}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de plano</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col divide-y divide-border">
            {[...client.planHistory].reverse().map((entry, i) => (
              <div key={`${entry.plan}-${entry.date}`} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-2">
                  <Badge className="border-0 bg-primary/10 text-primary">{PLAN_LABELS[entry.plan]}</Badge>
                  {i === 0 && <span className="text-xs text-muted-foreground">(atual)</span>}
                </div>
                <span className="text-sm text-muted-foreground">{formatDate(entry.date)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
