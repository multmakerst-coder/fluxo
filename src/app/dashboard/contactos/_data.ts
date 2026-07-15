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

const NAMES = [
  "Beatriz Fernandes",
  "João Pereira",
  "Rita Gonçalves",
  "Miguel Santos",
  "Ana Costa",
  "Tiago Oliveira",
  "Carolina Rodrigues",
  "Pedro Martins",
  "Sofia Almeida",
  "André Silva",
  "Mariana Lopes",
  "Ricardo Carvalho",
  "Inês Ferreira",
  "Francisco Marques",
  "Catarina Sousa",
  "Bruno Teixeira",
  "Leonor Pinto",
  "Diogo Ramos",
  "Matilde Nunes",
  "Gonçalo Correia",
  "Filipa Antunes",
  "Vasco Mendes",
  "Beatriz Cardoso",
  "Henrique Baptista",
  "Joana Vieira",
];

const CHANNELS: Channel[] = ["whatsapp", "instagram", "email"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function dateOffset(daysAgo: number) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

function slug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, ".");
}

const SAMPLE_MESSAGES: Record<Channel, { in: string[]; out: string[] }> = {
  whatsapp: {
    in: ["Olá, gostava de saber mais sobre os planos.", "Ainda têm o produto em stock?", "Podem confirmar a minha encomenda?"],
    out: ["Olá! Claro, temos 3 planos disponíveis. Queres que te envie os detalhes?", "Sim, temos disponível! Queres que reserve para ti?", "Confirmado! A tua encomenda chega em 2 a 3 dias úteis."],
  },
  instagram: {
    in: ["Adorei o vosso último post! Onde compro?", "Fazem envios para fora de Portugal?", "Qual é o preço deste produto?"],
    out: ["Obrigado! Podes comprar diretamente no site, deixo o link aqui.", "Sim, fazemos envios para toda a Europa.", "Este produto custa 39,90€, com portes grátis acima de 50€."],
  },
  email: {
    in: ["Preciso de ajuda com a minha encomenda #4521.", "Gostaria de um orçamento personalizado.", "Como funciona a política de devoluções?"],
    out: ["Já verificámos, a tua encomenda #4521 foi enviada esta manhã.", "Claro, vamos preparar um orçamento e enviamos até amanhã.", "Tens 30 dias para devolver qualquer produto sem custos."],
  },
};

function buildConversation(id: string, channel: Channel, count: number): ConversationMessage[] {
  const msgs: ConversationMessage[] = [];
  const pool = SAMPLE_MESSAGES[channel];
  for (let i = 0; i < count; i++) {
    const isIn = i % 2 === 0;
    msgs.push({
      id: `${id}-msg-${i}`,
      channel,
      direction: isIn ? "recebida" : "enviada",
      content: isIn ? pool.in[i % pool.in.length] : pool.out[i % pool.out.length],
      timestamp: dateOffset(count - i),
    });
  }
  return msgs;
}

export const CONTACTS: Contact[] = NAMES.map((name, i) => {
  const id = `c-${pad(i + 1)}`;
  const channel = CHANNELS[i % CHANNELS.length];
  const createdDaysAgo = 3 + i * 5;
  const lastContactDaysAgo = Math.max(0, (i % 7));
  const tags: string[] = [];
  if (i % 3 === 0) tags.push("lead-quente");
  if (i % 4 === 0) tags.push("cliente");
  if (i % 7 === 0) tags.push("vip");
  if (i % 5 === 0) tags.push("novo");
  if (i % 6 === 0) tags.push("suporte");
  if (tags.length === 0) tags.push("newsletter");

  return {
    id,
    name,
    email: `${slug(name)}@exemplo.pt`,
    phone: `+351 9${(10000000 + i * 7919) % 90000000}`.slice(0, 13),
    channel,
    createdAt: dateOffset(createdDaysAgo),
    lastContactAt: dateOffset(lastContactDaysAgo),
    tags,
    status: i % 9 === 0 ? "inativo" : "ativo",
    customFields:
      i % 4 === 0
        ? [{ id: `${id}-cf-1`, label: "Valor de compra", type: "numero", value: String(30 + i * 12) }]
        : [],
    notes:
      i % 5 === 0
        ? [
            {
              id: `${id}-note-1`,
              content: "Contacto interessado no plano Pro, fazer follow-up na próxima semana.",
              author: "Marta Silva",
              createdAt: dateOffset(lastContactDaysAgo + 1),
            },
          ]
        : [],
    conversation: buildConversation(id, channel, 3 + (i % 4)),
  };
});

export function getContactById(id: string) {
  return CONTACTS.find((c) => c.id === id);
}
