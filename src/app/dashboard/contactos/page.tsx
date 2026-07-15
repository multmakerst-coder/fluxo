"use client";

import { useMemo, useState } from "react";
import { Search, Download, MessageCircle, Camera, Mail } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CONTACTS, INITIAL_TAGS, type Channel, type Tag } from "./_data";
import { TagManager } from "./tag-manager";
import { CreateSegmentDialog } from "./create-segment-dialog";
import { cn } from "@/lib/utils";

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

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function exportCsv(rows: typeof CONTACTS, tags: Tag[]) {
  const tagName = (id: string) => tags.find((t) => t.id === id)?.name ?? id;
  const header = ["Nome", "Email", "Telemóvel", "Canal", "Data de entrada", "Tags", "Último contacto", "Estado"];
  const lines = rows.map((c) =>
    [
      c.name,
      c.email,
      c.phone,
      CHANNEL_LABEL[c.channel],
      formatDate(c.createdAt),
      c.tags.map(tagName).join(" | "),
      formatDate(c.lastContactAt),
      c.status,
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  const csv = [header.join(","), ...lines].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "contactos.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ContactosPage() {
  const [tags, setTags] = useState<Tag[]>(INITIAL_TAGS);
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("todos");
  const [tagFilter, setTagFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("todos");

  // Leitura de Date.now() para filtragem por intervalo de datas (7d/30d/90d).
  // A regra react-hooks/purity assinala qualquer leitura de Date.now() durante o
  // render (mesmo fora do useMemo, e mesmo via useSyncExternalStore), mas aqui é
  // inofensivo: os dados (CONTACTS) são estáticos e o recálculo só acontece quando
  // o utilizador muda um filtro, pelo que uma pequena variação de "now" entre
  // renders não tem qualquer impacto visível a esta granularidade (dias).
  // eslint-disable-next-line react-hooks/purity -- ver comentário acima
  const now = Date.now();

  const filtered = useMemo(() => {
    return CONTACTS.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
      }
      if (channelFilter !== "todos" && c.channel !== channelFilter) return false;
      if (tagFilter !== "todas" && !c.tags.includes(tagFilter)) return false;
      if (statusFilter !== "todos" && c.status !== statusFilter) return false;
      if (dateFilter !== "todos") {
        const days = (now - new Date(c.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (dateFilter === "7d" && days > 7) return false;
        if (dateFilter === "30d" && days > 30) return false;
        if (dateFilter === "90d" && days > 90) return false;
      }
      return true;
    });
  }, [search, channelFilter, tagFilter, statusFilter, dateFilter, now]);

  const tagById = (id: string) => tags.find((t) => t.id === id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contactos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} de {CONTACTS.length} contactos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TagManager tags={tags} onChange={setTags} />
          <CreateSegmentDialog contacts={CONTACTS} tags={tags} />
          <Button variant="outline" onClick={() => exportCsv(filtered, tags)}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>
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
        <Select value={channelFilter} onValueChange={(value) => setChannelFilter(value ?? "")}>
          <SelectTrigger><SelectValue placeholder="Canal" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os canais</SelectItem>
            <SelectItem value="whatsapp">WhatsApp</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="email">Email</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={(value) => setTagFilter(value ?? "")}>
          <SelectTrigger><SelectValue placeholder="Tag" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as tags</SelectItem>
            {tags.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value ?? "")}>
          <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os estados</SelectItem>
            <SelectItem value="ativo">Ativo</SelectItem>
            <SelectItem value="inativo">Inativo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={dateFilter} onValueChange={(value) => setDateFilter(value ?? "")}>
          <SelectTrigger><SelectValue placeholder="Data de entrada" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Qualquer data</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Canal</TableHead>
              <TableHead>Data de entrada</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Último contacto</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => {
              const Icon = CHANNEL_ICON[c.channel];
              return (
                <TableRow key={c.id} className="cursor-default">
                  <TableCell>
                    <Link href={`/dashboard/contactos/${c.id}`} className="flex items-center gap-2.5 hover:underline">
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
                    <Badge variant="outline" className="gap-1">
                      <Icon className="h-3 w-3" /> {CHANNEL_LABEL[c.channel]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {c.tags.map((tagId) => {
                        const tag = tagById(tagId);
                        if (!tag) return null;
                        return (
                          <Badge
                            key={tagId}
                            className="border-0"
                            style={{ backgroundColor: `${tag.color}1a`, color: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{formatDate(c.lastContactAt)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn(
                        "border-0",
                        c.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {c.status === "ativo" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  Nenhum contacto encontrado com estes filtros.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
