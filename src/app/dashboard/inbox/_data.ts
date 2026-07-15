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

function h(offsetMinutos: number) {
  const d = new Date("2026-07-15T16:40:00");
  d.setMinutes(d.getMinutes() - offsetMinutos);
  return d.toISOString();
}

export const CONVERSAS: Conversa[] = [
  {
    id: "c1",
    contactoNome: "Rita Fernandes",
    canal: "whatsapp",
    avatarIniciais: "RF",
    naoLida: true,
    atribuidaAMim: true,
    arquivada: false,
    atribuidoA: "u-marta",
    tags: ["Cliente", "VIP"],
    camposContacto: [
      { label: "Telefone", valor: "+351 912 345 678" },
      { label: "Email", valor: "rita.fernandes@email.pt" },
      { label: "Cidade", valor: "Lisboa" },
    ],
    notasInternas: [
      { id: "n1", texto: "Cliente interessada em upgrade de plano.", autor: "Marta Silva", hora: h(1440) },
    ],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Olá! Gostava de saber mais sobre o plano premium.", hora: h(120) },
      { id: "m2", direcao: "outbound", texto: "Olá Rita! Claro, o plano premium inclui broadcasts ilimitados e analytics avançado. Queres que te envie os detalhes?", hora: h(115), autor: "Marta Silva" },
      { id: "m3", direcao: "inbound", texto: "Sim, por favor!", hora: h(10) },
    ],
  },
  {
    id: "c2",
    contactoNome: "Tiago Almeida",
    canal: "instagram",
    avatarIniciais: "TA",
    naoLida: true,
    atribuidaAMim: false,
    arquivada: false,
    atribuidoA: null,
    tags: ["Lead"],
    camposContacto: [{ label: "Utilizador", valor: "@tiagoalmeida" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Vi o vosso post sobre a promoção, ainda está disponível?", hora: h(35) },
    ],
  },
  {
    id: "c3",
    contactoNome: "Sofia Marques",
    canal: "email",
    avatarIniciais: "SM",
    naoLida: false,
    atribuidaAMim: true,
    arquivada: false,
    atribuidoA: "u-marta",
    tags: ["Cliente"],
    camposContacto: [{ label: "Email", valor: "sofia.marques@email.pt" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Bom dia, preciso de alterar os dados de faturação da minha conta.", hora: h(600) },
      { id: "m2", direcao: "outbound", texto: "Bom dia Sofia, envie-me os novos dados por favor e eu atualizo já.", hora: h(590), autor: "Marta Silva" },
    ],
  },
  {
    id: "c4",
    contactoNome: "Diogo Costa",
    canal: "whatsapp",
    avatarIniciais: "DC",
    naoLida: false,
    atribuidaAMim: false,
    arquivada: false,
    atribuidoA: "u-joao",
    tags: [],
    camposContacto: [{ label: "Telefone", valor: "+351 934 112 233" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Obrigado pela ajuda de ontem!", hora: h(900) },
      { id: "m2", direcao: "outbound", texto: "De nada, Diogo! Qualquer coisa estamos por aqui.", hora: h(895), autor: "João Pereira" },
    ],
  },
  {
    id: "c5",
    contactoNome: "Beatriz Nunes",
    canal: "whatsapp",
    avatarIniciais: "BN",
    naoLida: true,
    atribuidaAMim: true,
    arquivada: false,
    atribuidoA: "u-marta",
    tags: ["Carrinho abandonado"],
    camposContacto: [{ label: "Telefone", valor: "+351 961 223 344" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "O desconto do carrinho ainda é válido?", hora: h(20) },
    ],
  },
  {
    id: "c6",
    contactoNome: "Pedro Santos",
    canal: "instagram",
    avatarIniciais: "PS",
    naoLida: false,
    atribuidaAMim: false,
    arquivada: false,
    atribuidoA: null,
    tags: ["Lead"],
    camposContacto: [{ label: "Utilizador", valor: "@pedrosantos" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Fazem entregas para o Porto?", hora: h(1200) },
      { id: "m2", direcao: "outbound", texto: "Sim, fazemos entregas em todo o país!", hora: h(1180), autor: "Inês Costa" },
    ],
  },
  {
    id: "c7",
    contactoNome: "Catarina Lopes",
    canal: "email",
    avatarIniciais: "CL",
    naoLida: false,
    atribuidaAMim: false,
    arquivada: false,
    atribuidoA: "u-ines",
    tags: ["Cliente VIP"],
    camposContacto: [{ label: "Email", valor: "catarina.lopes@email.pt" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Gostaria de agendar uma chamada com a equipa comercial.", hora: h(2200) },
    ],
  },
  {
    id: "c8",
    contactoNome: "Miguel Ferreira",
    canal: "whatsapp",
    avatarIniciais: "MF",
    naoLida: false,
    atribuidaAMim: false,
    arquivada: false,
    atribuidoA: null,
    tags: [],
    camposContacto: [{ label: "Telefone", valor: "+351 967 889 001" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Como cancelo a minha subscrição?", hora: h(3000) },
      { id: "m2", direcao: "outbound", texto: "Podes cancelar diretamente nas definições da conta, em Plano e faturação.", hora: h(2990), autor: "Ricardo Alves" },
    ],
  },
  {
    id: "c9",
    contactoNome: "Ana Rodrigues",
    canal: "whatsapp",
    avatarIniciais: "AR",
    naoLida: true,
    atribuidaAMim: false,
    arquivada: false,
    atribuidoA: null,
    tags: ["Lead"],
    camposContacto: [{ label: "Telefone", valor: "+351 918 776 554" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Boa tarde, qual é o preço do plano básico?", hora: h(5) },
    ],
  },
  {
    id: "c10",
    contactoNome: "Bruno Teixeira",
    canal: "email",
    avatarIniciais: "BT",
    naoLida: false,
    atribuidaAMim: true,
    arquivada: false,
    atribuidoA: "u-marta",
    tags: [],
    camposContacto: [{ label: "Email", valor: "bruno.teixeira@email.pt" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Recebi o email da newsletter, muito interessante!", hora: h(4000) },
    ],
  },
  {
    id: "c11",
    contactoNome: "Joana Pinto",
    canal: "instagram",
    avatarIniciais: "JP",
    naoLida: false,
    atribuidaAMim: false,
    arquivada: true,
    atribuidoA: "u-joao",
    tags: ["Resolvido"],
    camposContacto: [{ label: "Utilizador", valor: "@joanapinto" }],
    notasInternas: [{ id: "n1", texto: "Questão resolvida, cliente satisfeita.", autor: "João Pereira", hora: h(9000) }],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Obrigada pela resposta rápida!", hora: h(9010) },
      { id: "m2", direcao: "outbound", texto: "Sempre às ordens, Joana!", hora: h(9005), autor: "João Pereira" },
    ],
  },
  {
    id: "c12",
    contactoNome: "Hugo Martins",
    canal: "whatsapp",
    avatarIniciais: "HM",
    naoLida: false,
    atribuidaAMim: false,
    arquivada: true,
    atribuidoA: null,
    tags: [],
    camposContacto: [{ label: "Telefone", valor: "+351 925 443 221" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Consegui resolver, obrigado.", hora: h(12000) },
    ],
  },
  {
    id: "c13",
    contactoNome: "Filipa Correia",
    canal: "email",
    avatarIniciais: "FC",
    naoLida: false,
    atribuidaAMim: false,
    arquivada: false,
    atribuidoA: "u-ricardo",
    tags: ["Cliente"],
    camposContacto: [{ label: "Email", valor: "filipa.correia@email.pt" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "A fatura de junho ainda não chegou.", hora: h(6000) },
      { id: "m2", direcao: "outbound", texto: "Peço desculpa pelo incómodo, vou reenviar já.", hora: h(5990), autor: "Ricardo Alves" },
    ],
  },
  {
    id: "c14",
    contactoNome: "André Sousa",
    canal: "whatsapp",
    avatarIniciais: "AS",
    naoLida: true,
    atribuidaAMim: false,
    arquivada: false,
    atribuidoA: null,
    tags: ["Lead"],
    camposContacto: [{ label: "Telefone", valor: "+351 939 556 778" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Boa noite, ainda estão disponíveis para novas encomendas?", hora: h(2) },
    ],
  },
  {
    id: "c15",
    contactoNome: "Carla Gomes",
    canal: "instagram",
    avatarIniciais: "CG",
    naoLida: false,
    atribuidaAMim: true,
    arquivada: false,
    atribuidoA: "u-marta",
    tags: ["VIP"],
    camposContacto: [{ label: "Utilizador", valor: "@carlagomes" }],
    notasInternas: [],
    mensagens: [
      { id: "m1", direcao: "inbound", texto: "Adorei a última coleção!", hora: h(7000) },
      { id: "m2", direcao: "outbound", texto: "Que bom saber, Carla! Obrigada pelo carinho 💜", hora: h(6990), autor: "Marta Silva" },
    ],
  },
];

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
