export type Channel = "whatsapp" | "instagram" | "email";

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface CustomField {
  id: string;
  label: string;
  type: "texto" | "numero" | "data" | "lista";
  value: string;
}

export interface Note {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface ConversationMessage {
  id: string;
  channel: Channel;
  direction: "recebida" | "enviada";
  content: string;
  timestamp: string;
}

export type ContactStatus = "ativo" | "inativo";

export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  channel: Channel;
  createdAt: string;
  lastContactAt: string;
  tags: string[];
  status: ContactStatus;
  customFields: CustomField[];
  notes: Note[];
  conversation: ConversationMessage[];
}

export const TAG_COLORS = [
  { value: "#6C47FF", label: "Roxo" },
  { value: "#22C55E", label: "Verde" },
  { value: "#3B82F6", label: "Azul" },
  { value: "#F59E0B", label: "Âmbar" },
  { value: "#EF4444", label: "Vermelho" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#14B8A6", label: "Turquesa" },
];

export const INITIAL_TAGS: Tag[] = [
  { id: "lead-quente", name: "Lead quente", color: "#EF4444" },
  { id: "cliente", name: "Cliente", color: "#22C55E" },
  { id: "vip", name: "VIP", color: "#F59E0B" },
  { id: "novo", name: "Novo", color: "#3B82F6" },
  { id: "suporte", name: "Suporte", color: "#EC4899" },
  { id: "newsletter", name: "Newsletter", color: "#14B8A6" },
];

export const CONTACTS: Contact[] = [];

export function getContactById(id: string) {
  return CONTACTS.find((c) => c.id === id);
}
