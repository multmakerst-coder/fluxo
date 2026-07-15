"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Camera,
  Mail,
  Plus,
  Send,
  X,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import type { Channel, Contact, ConversationMessage, CustomField, Note, Tag } from "../_data";

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

function initials(name: string) {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface ContactProfileClientProps {
  contact: Contact;
  availableTags: Tag[];
}

export function ContactProfileClient({ contact, availableTags }: ContactProfileClientProps) {
  const [tags, setTags] = useState<string[]>(contact.tags);
  const [customFields, setCustomFields] = useState<CustomField[]>(contact.customFields);
  const [notes, setNotes] = useState<Note[]>(contact.notes);
  const [conversation, setConversation] = useState<ConversationMessage[]>(contact.conversation);
  const [noteDraft, setNoteDraft] = useState("");

  const [fieldDialogOpen, setFieldDialogOpen] = useState(false);
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldType, setFieldType] = useState<CustomField["type"]>("texto");
  const [fieldValue, setFieldValue] = useState("");

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageChannel, setMessageChannel] = useState<Channel>(contact.channel);
  const [messageContent, setMessageContent] = useState("");

  const tagById = (id: string) => availableTags.find((t) => t.id === id);
  const untaggedOptions = availableTags.filter((t) => !tags.includes(t.id));

  function addTag(tagId: string) {
    setTags((prev) => [...prev, tagId]);
    toast.success("Tag aplicada");
  }

  function removeTag(tagId: string) {
    setTags((prev) => prev.filter((t) => t !== tagId));
  }

  function addCustomField() {
    if (!fieldLabel.trim()) return;
    setCustomFields((prev) => [
      ...prev,
      { id: `custom-${Date.now()}`, label: fieldLabel.trim(), type: fieldType, value: fieldValue.trim() },
    ]);
    setFieldLabel("");
    setFieldValue("");
    setFieldType("texto");
    setFieldDialogOpen(false);
    toast.success("Campo personalizado adicionado");
  }

  function addNote() {
    if (!noteDraft.trim()) return;
    setNotes((prev) => [
      { id: `note-${Date.now()}`, content: noteDraft.trim(), author: "Marta Silva", createdAt: new Date().toISOString() },
      ...prev,
    ]);
    setNoteDraft("");
    toast.success("Nota adicionada");
  }

  function sendMessage() {
    if (!messageContent.trim()) return;
    setConversation((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        channel: messageChannel,
        direction: "enviada",
        content: messageContent.trim(),
        timestamp: new Date().toISOString(),
      },
    ]);
    setMessageContent("");
    setMessageDialogOpen(false);
    toast.success(`Mensagem enviada via ${CHANNEL_LABEL[messageChannel]}`);
  }

  const HeaderIcon = CHANNEL_ICON[contact.channel];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link
          href="/dashboard/contactos"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar a contactos
        </Link>
      </div>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="bg-primary/10 text-lg text-primary">{initials(contact.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold">{contact.name}</h1>
              <Badge
                variant="outline"
                className={cn(
                  "border-0",
                  contact.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
                )}
              >
                {contact.status === "ativo" ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {contact.email}</span>
              <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {contact.phone}</span>
              <Badge variant="outline" className="gap-1">
                <HeaderIcon className="h-3 w-3" /> Origem: {CHANNEL_LABEL[contact.channel]}
              </Badge>
            </div>
          </div>
        </div>

        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogTrigger render={<Button><Send className="h-4 w-4" /> Enviar mensagem manual</Button>} />
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enviar mensagem manual</DialogTitle>
              <DialogDescription>Envia uma mensagem diretamente para {contact.name}.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Canal</Label>
                <Select value={messageChannel} onValueChange={(v) => setMessageChannel(v as Channel)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Mensagem</Label>
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Escreve a tua mensagem..."
                  className="min-h-28"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">Cancelar</Button>} />
              <Button onClick={sendMessage}>
                <Send className="h-4 w-4" /> Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de conversas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {conversation.length === 0 && (
                <p className="text-sm text-muted-foreground">Ainda não há mensagens trocadas com este contacto.</p>
              )}
              {conversation.map((msg) => {
                const Icon = CHANNEL_ICON[msg.channel];
                const isOut = msg.direction === "enviada";
                return (
                  <div key={msg.id} className={cn("flex items-end gap-2", isOut && "flex-row-reverse")}>
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm",
                        isOut ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                      )}
                    >
                      <p>{msg.content}</p>
                      <p className={cn("mt-1 text-[11px]", isOut ? "text-primary-foreground/70" : "text-muted-foreground")}>
                        {CHANNEL_LABEL[msg.channel]} · {formatDateTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas internas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Escreve uma nota interna sobre este contacto..."
                />
                <Button size="sm" className="self-end" onClick={addNote}>
                  <Plus className="h-3.5 w-3.5" /> Adicionar nota
                </Button>
              </div>
              <div className="flex flex-col gap-3">
                {notes.length === 0 && <p className="text-sm text-muted-foreground">Sem notas internas.</p>}
                {notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-border p-3">
                    <p className="text-sm">{note.content}</p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {note.author} · {formatDateTime(note.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-1.5">
                {tags.length === 0 && <p className="text-sm text-muted-foreground">Sem tags aplicadas.</p>}
                {tags.map((tagId) => {
                  const tag = tagById(tagId);
                  if (!tag) return null;
                  return (
                    <Badge
                      key={tagId}
                      className="gap-1 border-0 pr-1"
                      style={{ backgroundColor: `${tag.color}1a`, color: tag.color }}
                    >
                      {tag.name}
                      <button onClick={() => removeTag(tagId)} aria-label={`Remover tag ${tag.name}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
              {untaggedOptions.length > 0 && (
                <Select onValueChange={(v) => addTag(v as string)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Adicionar tag..." /></SelectTrigger>
                  <SelectContent>
                    {untaggedOptions.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campos personalizados</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {customFields.length === 0 && <p className="text-sm text-muted-foreground">Sem campos personalizados.</p>}
              {customFields.map((field) => (
                <div key={field.id} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    <p className="text-sm font-medium">
                      {field.type === "data" ? formatDate(field.value || new Date().toISOString()) : field.value || "—"}
                    </p>
                  </div>
                  <Badge variant="outline" className="capitalize">{field.type}</Badge>
                </div>
              ))}

              <Dialog open={fieldDialogOpen} onOpenChange={setFieldDialogOpen}>
                <DialogTrigger
                  render={
                    <Button variant="outline" size="sm">
                      <Plus className="h-3.5 w-3.5" /> Adicionar campo
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Novo campo personalizado</DialogTitle>
                    <DialogDescription>Adiciona um campo à ficha deste contacto.</DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label>Nome do campo</Label>
                      <Input value={fieldLabel} onChange={(e) => setFieldLabel(e.target.value)} placeholder="Ex.: Aniversário" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Tipo</Label>
                      <Select value={fieldType} onValueChange={(v) => setFieldType(v as CustomField["type"])}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="texto">Texto</SelectItem>
                          <SelectItem value="numero">Número</SelectItem>
                          <SelectItem value="data">Data</SelectItem>
                          <SelectItem value="lista">Lista</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Valor</Label>
                      <Input
                        type={fieldType === "numero" ? "number" : fieldType === "data" ? "date" : "text"}
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        placeholder={fieldType === "lista" ? "Opção 1, Opção 2..." : ""}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose render={<Button variant="outline">Cancelar</Button>} />
                    <Button onClick={addCustomField}>Adicionar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
