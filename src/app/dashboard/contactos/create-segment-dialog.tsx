"use client";

import { useMemo, useState } from "react";
import { Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import type { Contact, Tag } from "./_data";

interface CreateSegmentDialogProps {
  contacts: Contact[];
  tags: Tag[];
}

export function CreateSegmentDialog({ contacts, tags }: CreateSegmentDialogProps) {
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("todos");
  const [tag, setTag] = useState("todas");
  const [status, setStatus] = useState("todos");
  const [open, setOpen] = useState(false);

  const matchCount = useMemo(() => {
    return contacts.filter((c) => {
      if (channel !== "todos" && c.channel !== channel) return false;
      if (tag !== "todas" && !c.tags.includes(tag)) return false;
      if (status !== "todos" && c.status !== status) return false;
      return true;
    }).length;
  }, [contacts, channel, tag, status]);

  function handleCreate() {
    toast.success(`Segmento "${name || "Sem nome"}" criado com ${matchCount} contactos`);
    setOpen(false);
    setName("");
    setChannel("todos");
    setTag("todas");
    setStatus("todos");
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <Layers className="h-4 w-4" /> Criar segmento
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar segmento de contactos</DialogTitle>
          <DialogDescription>Combina filtros para criar uma lista dinâmica de contactos.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="segment-name">Nome do segmento</Label>
            <Input
              id="segment-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex.: Leads quentes WhatsApp"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Canal</Label>
            <Select value={channel} onValueChange={(value) => setChannel(value ?? "")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os canais</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tag</Label>
            <Select value={tag} onValueChange={(value) => setTag(value ?? "")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as tags</SelectItem>
                {tags.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Estado</Label>
            <Select value={status} onValueChange={(value) => setStatus(value ?? "")}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os estados</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <p className="rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{matchCount}</span> contactos correspondem a estes filtros.
          </p>
        </div>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancelar</Button>} />
          <Button onClick={handleCreate}>Criar segmento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
