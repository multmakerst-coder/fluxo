export type CanalInbox = "whatsapp" | "instagram" | "email";

export type Mensagem = {
  id: string;
  direcao: "inbound" | "outbound";
  texto: string;
  hora: string;
  autor?: string;
};

export type NotaInterna = {
  id: string;
  texto: string;
  autor: string;
  hora: string;
};

export type CampoContacto = { label: string; valor: string };

export type Conversa = {
  id: string;
  contactoNome: string;
  canal: CanalInbox;
  avatarIniciais: string;
  naoLida: boolean;
  atribuidaAMim: boolean;
  arquivada: boolean;
  atribuidoA: string | null;
  tags: string[];
  camposContacto: CampoContacto[];
  notasInternas: NotaInterna[];
  mensagens: Mensagem[];
};

export const MEMBROS_EQUIPA = [
  { id: "u-marta", nome: "Marta Silva" },
  { id: "u-joao", nome: "João Pereira" },
  { id: "u-ines", nome: "Inês Costa" },
  { id: "u-ricardo", nome: "Ricardo Alves" },
];

export const CONVERSAS: Conversa[] = [];

export function getConversa(id: string): Conversa | undefined {
  return CONVERSAS.find((c) => c.id === id);
}

export function nomeMembro(id: string | null) {
  if (!id) return null;
  return MEMBROS_EQUIPA.find((m) => m.id === id)?.nome ?? null;
}

export function ultimaMensagem(conversa: Conversa): Mensagem | undefined {
  return conversa.mensagens[conversa.mensagens.length - 1];
}
