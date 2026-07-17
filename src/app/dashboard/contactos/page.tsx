"use client";

import { useMemo, useState, useEffect } from "react";
import { Search, Download, MessageCircle, Camera, Mail } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { INITIAL_TAGS, type Channel, type Tag, type Contact } from "./_data";
import { TagManager } from "./tag-manager";
import { CreateSegmentDialog } from "./create-segment-dialog";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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

function daysSince(iso: string) {
  return (Date.now() - new Date(iso).getTime()) / (1000 * 60 * 60 * 24);
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function exportCsv(rows: Contact[], tags: Tag[]) {
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
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState("todos");
  const [tagFilter, setTagFilter] = useState("todas");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [dateFilter, setDateFilter] = useState("todos");

  const fetchContacts = async () => {
    try {
      const supabase = createClient();
      
      const { data: dbTags } = await supabase.from("tags").select("*");
      if (dbTags && dbTags.length > 0) {
        setTags(dbTags.map(t => ({ id: t.id, name: t.name, color: t.color })));
      }

      const { data: dbContacts } = await supabase
        .from("contacts")
        .select(`
          id,
          name,
          email,
          phone,
          source_channel,
          created_at,
          last_contact_at,
          contact_tags (
            tag_id
          )
        `);
      
      if (dbContacts) {
        const formatted: Contact[] = dbContacts.map((c) => ({
          id: c.id,
          name: c.name,
          email: c.email || "",
          phone: c.phone || "",
          channel: (c.source_channel || "whatsapp") as Channel,
          createdAt: c.created_at,
          lastContactAt: c.last_contact_at || c.created_at,
          tags: c.contact_tags?.map((ct) => ct.tag_id) || [],
          status: "ativo",
          customFields: [],
          notes: [],
          conversation: []
        }));
        setContacts(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      await fetchContacts();
    })();
  }, []);

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/contacts/import", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(`Importados com sucesso ${result.success} contactos!`);
        fetchContacts();
      } else {
        toast.error(result.error || "Erro ao importar ficheiro");
      }
    } catch {
      toast.error("Erro na ligação ao servidor");
    } finally {
      setImporting(false);
    }
  };

  const filtered = useMemo(() => {
    return contacts.filter((c) => {
      if (search) {
        const q = search.toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
      }
      if (channelFilter !== "todos" && c.channel !== channelFilter) return false;
      if (tagFilter !== "todas" && !c.tags.includes(tagFilter)) return false;
      if (statusFilter !== "todos" && c.status !== statusFilter) return false;
      if (dateFilter !== "todos") {
        const days = daysSince(c.createdAt);
        if (dateFilter === "7d" && days > 7) return false;
        if (dateFilter === "30d" && days > 30) return false;
        if (dateFilter === "90d" && days > 90) return false;
      }
      return true;
    });
  }, [contacts, search, channelFilter, tagFilter, statusFilter, dateFilter]);

  const tagById = (id: string) => tags.find((t) => t.id === id);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Contactos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {filtered.length} de {contacts.length} contactos
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TagManager tags={tags} onChange={setTags} />
          <CreateSegmentDialog contacts={contacts} tags={tags} />
          <label className={cn(
            "flex h-9 items-center justify-center gap-2 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
            importing && "opacity-50 pointer-events-none"
          )}>
            <Download className="h-4 w-4 rotate-180" />
            {importing ? "A importar..." : "Importar CSV"}
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
          </label>
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
            {loading && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  A carregar contactos...
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.map((c) => {
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
            {!loading && filtered.length === 0 && (
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
