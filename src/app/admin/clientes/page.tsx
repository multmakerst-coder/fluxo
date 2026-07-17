"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MessageCircle, Camera, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { STATUS_LABELS, PLAN_LABELS, type Channel, type ClientStatus, type AdminClient } from "./_data";
import type { PlanSlug } from "@/lib/plans";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const CHANNEL_ICON: Record<Channel, typeof MessageCircle> = {
  whatsapp: MessageCircle,
  instagram: Camera,
  email: Mail,
};

const STATUS_BADGE: Record<ClientStatus, string> = {
  ativo: "bg-success/10 text-success",
  trial: "bg-info/10 text-info",
  suspenso: "bg-destructive/10 text-destructive",
  cancelado: "bg-muted text-muted-foreground",
};

const PLAN_BADGE: Record<PlanSlug, string> = {
  gratuito: "bg-muted text-muted-foreground",
  pro: "bg-primary/10 text-primary",
  empresas: "bg-brand-accent/15 text-brand-accent",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function AdminClientesPage() {
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [channelFilter, setChannelFilter] = useState("todos");

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("*")
      .eq("role", "client")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (data) {
          const mapped = data.map((profile) => ({
            id: profile.id,
            name: profile.full_name || "Cliente Sem Nome",
            contactName: profile.full_name || "Cliente Sem Nome",
            email: profile.email || "",
            plan: "gratuito" as PlanSlug,
            status: "ativo" as ClientStatus,
            registeredAt: profile.created_at,
            channels: [] as Channel[],
            contactsCount: 0,
            messagesSent: 0,
            messagesReceived: 0,
            activeFlows: 0,
            lastActivity: profile.created_at,
            mrr: 0,
            planHistory: [],
          }));
          setClients(mapped);
        }
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    return clients.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
      }
      if (planFilter !== "todos" && c.plan !== planFilter) return false;
      if (statusFilter !== "todos" && c.status !== statusFilter) return false;
      if (channelFilter !== "todos" && !c.channels.includes(channelFilter as Channel)) return false;
      return true;
    });
  }, [clients, search, planFilter, statusFilter, channelFilter]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Clientes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {filtered.length} de {clients.length} clientes registados na plataforma
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar por nome ou email..."
            className="pl-8"
          />
        </div>
        <Select value={planFilter} onValueChange={(v) => setPlanFilter(v ?? "todos")}>
          <SelectTrigger><SelectValue placeholder="Plano" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os planos</SelectItem>
            <SelectItem value="gratuito">Gratuito</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="empresas">Empresas</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "todos")}>
          <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="trial">Em teste</SelectItem>
            <SelectItem value="suspenso">Suspenso</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={channelFilter} onValueChange={(v) => setChannelFilter(v ?? "todos")}>
          <SelectTrigger><SelectValue placeholder="Canal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os canais</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Data de registo</TableHead>
              <TableHead>Canais</TableHead>
              <TableHead>MRR</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  A carregar clientes...
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/admin/clientes/${c.id}`} className="flex items-center gap-2.5 hover:underline">
                      <Avatar size="sm">
                        <AvatarFallback className="bg-primary/10 text-primary">{initials(c.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border-0", PLAN_BADGE[c.plan])}>
                      {PLAN_LABELS[c.plan]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("border-0", STATUS_BADGE[c.status])}>
                      {STATUS_LABELS[c.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(c.registeredAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      {c.channels.map((channel) => {
                        const Icon = CHANNEL_ICON[channel];
                        return (
                          <span key={channel} className="flex h-6 w-6 items-center justify-center rounded-md bg-muted text-foreground">
                            <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                          </span>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(c.mrr)}
                  </TableCell>
                </TableRow>
              ))
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum cliente encontrado com estes filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
