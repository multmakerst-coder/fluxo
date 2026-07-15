import type { LucideIcon } from "lucide-react";
import {
  Type,
  Image,
  Video,
  Mic,
  FileText,
  MapPin,
  MousePointerClick,
  ListChecks,
  MessageCircleQuestion,
  Clock,
  GitBranch,
  Tag,
  Shuffle,
  TagPlus,
  TagX,
  UserCog,
  Users,
  Headset,
  Bell,
  Webhook,
  Repeat,
  Mail,
  Sparkles,
  BrainCircuit,
  Hash,
  MessageSquare,
  MousePointer,
  CalendarClock,
  UserPlus,
  AtSign,
  Share2,
  MessageSquareText,
  FormInput,
  Link2,
  MailOpen,
  MessageCircle,
  Camera,
} from "lucide-react";

export type Channel = "whatsapp" | "instagram" | "email";

export type BlockCategory = "mensagem" | "interacao" | "logica" | "acao" | "ia";

export type NodeKind = "trigger" | BlockCategory;

export type ConfigFieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "list";

export interface ConfigFieldOption {
  value: string;
  label: string;
}

export interface ConfigField {
  key: string;
  label: string;
  type: ConfigFieldType;
  placeholder?: string;
  options?: ConfigFieldOption[];
  defaultValue?: string | number | boolean | string[];
  helperText?: string;
  maxItems?: number;
}

export interface FlowBlockDef {
  id: string;
  category: BlockCategory;
  label: string;
  description: string;
  icon: LucideIcon;
  channels: Channel[];
  fields: ConfigField[];
}

export interface FlowTriggerDef {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  fields: ConfigField[];
}

export interface CategoryMeta {
  label: string;
  text: string;
  bg: string;
  border: string;
  dot: string;
  ring: string;
}

export const CATEGORY_META: Record<NodeKind, CategoryMeta> = {
  trigger: {
    label: "Gatilho",
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/40",
    dot: "bg-primary",
    ring: "ring-primary/20",
  },
  mensagem: {
    label: "Mensagens",
    text: "text-primary",
    bg: "bg-primary/10",
    border: "border-primary/30",
    dot: "bg-primary",
    ring: "ring-primary/15",
  },
  interacao: {
    label: "Interação",
    text: "text-info",
    bg: "bg-info/10",
    border: "border-info/30",
    dot: "bg-info",
    ring: "ring-info/15",
  },
  logica: {
    label: "Lógica",
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    dot: "bg-warning",
    ring: "ring-warning/15",
  },
  acao: {
    label: "Ações",
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/30",
    dot: "bg-success",
    ring: "ring-success/15",
  },
  ia: {
    label: "IA",
    text: "text-brand-accent",
    bg: "bg-gradient-to-br from-primary/10 to-brand-accent/15",
    border: "border-brand-accent/40",
    dot: "bg-brand-accent",
    ring: "ring-brand-accent/20",
  },
};

export const CHANNEL_META: Record<Channel, { label: string; icon: LucideIcon }> = {
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  instagram: { label: "Instagram", icon: Camera },
  email: { label: "Email", icon: Mail },
};

// ---------------------------------------------------------------------------
// Mock reference data used inside the config forms (tags, segmentos, etc.)
// ---------------------------------------------------------------------------

export const MOCK_TAGS: ConfigFieldOption[] = [
  { value: "lead-quente", label: "Lead quente" },
  { value: "cliente", label: "Cliente" },
  { value: "interessado", label: "Interessado" },
  { value: "vip", label: "VIP" },
  { value: "carrinho-abandonado", label: "Carrinho abandonado" },
];

export const MOCK_SEGMENTS: ConfigFieldOption[] = [
  { value: "novos-contactos", label: "Novos contactos" },
  { value: "clientes-ativos", label: "Clientes ativos" },
  { value: "leads-frios", label: "Leads frios" },
  { value: "compradores-recorrentes", label: "Compradores recorrentes" },
];

export const MOCK_SEQUENCES: ConfigFieldOption[] = [
  { value: "boas-vindas", label: "Sequência de boas-vindas" },
  { value: "nutricao-leads", label: "Nutrição de leads" },
  { value: "pos-compra", label: "Pós-compra" },
];

export const MOCK_FIELDS: ConfigFieldOption[] = [
  { value: "nome", label: "Nome" },
  { value: "email", label: "Email" },
  { value: "telefone", label: "Telefone" },
  { value: "cidade", label: "Cidade" },
  { value: "empresa", label: "Empresa" },
];

export const MOCK_FORMS: ConfigFieldOption[] = [
  { value: "form-contacto", label: "Formulário de contacto" },
  { value: "form-newsletter", label: "Newsletter" },
  { value: "form-webinar", label: "Inscrição webinar" },
];

// ---------------------------------------------------------------------------
// Blocos de fluxo
// ---------------------------------------------------------------------------

export const FLOW_BLOCKS: FlowBlockDef[] = [
  // Mensagens
  {
    id: "texto",
    category: "mensagem",
    label: "Mensagem de texto",
    description: "Envia uma mensagem de texto simples",
    icon: Type,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      {
        key: "texto",
        label: "Texto da mensagem",
        type: "textarea",
        placeholder: "Olá {{nome}}, obrigado por contactares!",
        helperText: "Podes usar variáveis como {{nome}}, {{email}}.",
      },
    ],
  },
  {
    id: "imagem",
    category: "mensagem",
    label: "Imagem",
    description: "Envia uma imagem com legenda opcional",
    icon: Image,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      { key: "url", label: "URL da imagem", type: "text", placeholder: "https://..." },
      { key: "legenda", label: "Legenda", type: "textarea", placeholder: "Legenda opcional" },
    ],
  },
  {
    id: "video",
    category: "mensagem",
    label: "Vídeo",
    description: "Envia um vídeo curto",
    icon: Video,
    channels: ["whatsapp", "instagram"],
    fields: [
      { key: "url", label: "URL do vídeo", type: "text", placeholder: "https://..." },
      { key: "legenda", label: "Legenda", type: "textarea" },
    ],
  },
  {
    id: "audio",
    category: "mensagem",
    label: "Áudio",
    description: "Envia uma nota de voz ou áudio",
    icon: Mic,
    channels: ["whatsapp"],
    fields: [{ key: "url", label: "URL do áudio", type: "text", placeholder: "https://..." }],
  },
  {
    id: "documento",
    category: "mensagem",
    label: "Documento (PDF)",
    description: "Envia um ficheiro PDF",
    icon: FileText,
    channels: ["whatsapp", "email"],
    fields: [
      { key: "url", label: "URL do documento", type: "text", placeholder: "https://..." },
      { key: "nomeFicheiro", label: "Nome do ficheiro", type: "text", placeholder: "catalogo.pdf" },
    ],
  },
  {
    id: "localizacao",
    category: "mensagem",
    label: "Localização",
    description: "Envia uma localização (morada ou coordenadas)",
    icon: MapPin,
    channels: ["whatsapp"],
    fields: [
      { key: "morada", label: "Morada", type: "text", placeholder: "Rua Exemplo, 123, Lisboa" },
    ],
  },
  // Interação
  {
    id: "botoes",
    category: "interacao",
    label: "Botões (até 3)",
    description: "Mostra até 3 botões de resposta rápida",
    icon: MousePointerClick,
    channels: ["whatsapp", "instagram"],
    fields: [
      { key: "texto", label: "Texto da mensagem", type: "textarea", placeholder: "Escolhe uma opção:" },
      {
        key: "botoes",
        label: "Botões",
        type: "list",
        maxItems: 3,
        defaultValue: ["Opção 1", "Opção 2"],
        helperText: "Máximo de 3 botões.",
      },
    ],
  },
  {
    id: "lista",
    category: "interacao",
    label: "Lista / menu",
    description: "Apresenta um menu de opções em lista",
    icon: ListChecks,
    channels: ["whatsapp"],
    fields: [
      { key: "titulo", label: "Título da lista", type: "text", placeholder: "Escolhe um serviço" },
      { key: "opcoes", label: "Opções", type: "list", defaultValue: ["Opção 1", "Opção 2", "Opção 3"] },
    ],
  },
  {
    id: "pergunta",
    category: "interacao",
    label: "Pergunta (aguarda resposta)",
    description: "Faz uma pergunta e guarda a resposta numa variável",
    icon: MessageCircleQuestion,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      { key: "pergunta", label: "Pergunta", type: "textarea", placeholder: "Qual é o teu email?" },
      { key: "variavel", label: "Guardar resposta em", type: "text", placeholder: "resposta_email" },
    ],
  },
  {
    id: "aguardar",
    category: "interacao",
    label: "Aguardar X tempo",
    description: "Pausa o fluxo durante um período de tempo",
    icon: Clock,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      { key: "duracao", label: "Duração", type: "number", defaultValue: 1 },
      {
        key: "unidade",
        label: "Unidade",
        type: "select",
        defaultValue: "horas",
        options: [
          { value: "minutos", label: "Minutos" },
          { value: "horas", label: "Horas" },
          { value: "dias", label: "Dias" },
        ],
      },
    ],
  },
  // Lógica
  {
    id: "condicao",
    category: "logica",
    label: "Condição (SE / senão)",
    description: "Ramifica o fluxo consoante uma condição",
    icon: GitBranch,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      { key: "campo", label: "Campo", type: "select", options: MOCK_FIELDS, defaultValue: "nome" },
      {
        key: "operador",
        label: "Operador",
        type: "select",
        defaultValue: "igual",
        options: [
          { value: "igual", label: "É igual a" },
          { value: "contem", label: "Contém" },
          { value: "existe", label: "Está preenchido" },
        ],
      },
      { key: "valor", label: "Valor", type: "text", placeholder: "Valor a comparar" },
    ],
  },
  {
    id: "verificar-tag",
    category: "logica",
    label: "Verificação de tag",
    description: "Verifica se o contacto tem uma etiqueta",
    icon: Tag,
    channels: ["whatsapp", "instagram", "email"],
    fields: [{ key: "tag", label: "Etiqueta", type: "select", options: MOCK_TAGS }],
  },
  {
    id: "ramificacao-aleatoria",
    category: "logica",
    label: "Ramificação aleatória (A/B)",
    description: "Divide o tráfego aleatoriamente entre dois caminhos",
    icon: Shuffle,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      { key: "percentagemA", label: "% para o caminho A", type: "number", defaultValue: 50 },
    ],
  },
  // Ações
  {
    id: "adicionar-tag",
    category: "acao",
    label: "Adicionar etiqueta",
    description: "Adiciona uma etiqueta ao contacto",
    icon: TagPlus,
    channels: ["whatsapp", "instagram", "email"],
    fields: [{ key: "tag", label: "Etiqueta", type: "select", options: MOCK_TAGS }],
  },
  {
    id: "remover-tag",
    category: "acao",
    label: "Remover etiqueta",
    description: "Remove uma etiqueta do contacto",
    icon: TagX,
    channels: ["whatsapp", "instagram", "email"],
    fields: [{ key: "tag", label: "Etiqueta", type: "select", options: MOCK_TAGS }],
  },
  {
    id: "atualizar-campo",
    category: "acao",
    label: "Atualizar campo",
    description: "Atualiza um campo personalizado do contacto",
    icon: UserCog,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      { key: "campo", label: "Campo", type: "select", options: MOCK_FIELDS },
      { key: "valor", label: "Novo valor", type: "text" },
    ],
  },
  {
    id: "adicionar-segmento",
    category: "acao",
    label: "Adicionar a segmento",
    description: "Adiciona o contacto a um segmento",
    icon: Users,
    channels: ["whatsapp", "instagram", "email"],
    fields: [{ key: "segmento", label: "Segmento", type: "select", options: MOCK_SEGMENTS }],
  },
  {
    id: "transferir-live-chat",
    category: "acao",
    label: "Transferir para live chat",
    description: "Encaminha a conversa para um agente humano",
    icon: Headset,
    channels: ["whatsapp", "instagram"],
    fields: [{ key: "motivo", label: "Motivo (opcional)", type: "text", placeholder: "Pedido complexo" }],
  },
  {
    id: "notificacao-interna",
    category: "acao",
    label: "Notificação interna",
    description: "Notifica a equipa internamente",
    icon: Bell,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      { key: "destinatario", label: "Notificar", type: "text", placeholder: "equipa@negocio.pt" },
      { key: "mensagem", label: "Mensagem", type: "textarea" },
    ],
  },
  {
    id: "webhook",
    category: "acao",
    label: "Webhook",
    description: "Envia os dados para um URL externo",
    icon: Webhook,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      { key: "url", label: "URL do webhook", type: "text", placeholder: "https://api.exemplo.com/hook" },
      {
        key: "metodo",
        label: "Método",
        type: "select",
        defaultValue: "POST",
        options: [
          { value: "POST", label: "POST" },
          { value: "GET", label: "GET" },
        ],
      },
    ],
  },
  {
    id: "subscrever-sequencia",
    category: "acao",
    label: "Subscrever sequência",
    description: "Inscreve o contacto numa sequência de mensagens",
    icon: Repeat,
    channels: ["whatsapp", "instagram", "email"],
    fields: [{ key: "sequencia", label: "Sequência", type: "select", options: MOCK_SEQUENCES }],
  },
  {
    id: "enviar-email",
    category: "acao",
    label: "Enviar email",
    description: "Dispara um email para o contacto",
    icon: Mail,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      { key: "assunto", label: "Assunto", type: "text", placeholder: "Obrigado pelo teu interesse" },
      { key: "corpo", label: "Corpo do email", type: "textarea" },
    ],
  },
  // IA
  {
    id: "resposta-ia",
    category: "ia",
    label: "Resposta com IA",
    description: "Gera uma resposta automática com inteligência artificial",
    icon: Sparkles,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      {
        key: "instrucoes",
        label: "Instruções para a IA",
        type: "textarea",
        placeholder: "Responde de forma simpática e profissional sobre...",
      },
      {
        key: "tom",
        label: "Tom",
        type: "select",
        defaultValue: "profissional",
        options: [
          { value: "profissional", label: "Profissional" },
          { value: "amigavel", label: "Amigável" },
          { value: "casual", label: "Casual" },
        ],
      },
    ],
  },
  {
    id: "reconhecimento-intencao",
    category: "ia",
    label: "Reconhecimento de intenção",
    description: "Classifica a mensagem do contacto por intenção",
    icon: BrainCircuit,
    channels: ["whatsapp", "instagram", "email"],
    fields: [
      {
        key: "intencoes",
        label: "Intenções possíveis",
        type: "list",
        defaultValue: ["Dúvida", "Reclamação", "Compra"],
      },
    ],
  },
];

export function getBlocksForChannel(channel: Channel): FlowBlockDef[] {
  return FLOW_BLOCKS.filter((block) => block.channels.includes(channel));
}

export function getBlockDef(id: string): FlowBlockDef | undefined {
  return FLOW_BLOCKS.find((block) => block.id === id);
}

// ---------------------------------------------------------------------------
// Triggers por canal
// ---------------------------------------------------------------------------

export const TRIGGERS_BY_CHANNEL: Record<Channel, FlowTriggerDef[]> = {
  whatsapp: [
    {
      id: "palavra-chave",
      label: "Palavra-chave",
      description: "Inicia quando o contacto envia uma palavra-chave",
      icon: Hash,
      fields: [
        { key: "palavras", label: "Palavras-chave (separadas por vírgula)", type: "text", placeholder: "olá, preço, info" },
      ],
    },
    {
      id: "primeira-mensagem",
      label: "Primeira mensagem",
      description: "Inicia na primeira mensagem de um novo contacto",
      icon: MessageSquare,
      fields: [],
    },
    {
      id: "botao-clicado",
      label: "Botão clicado",
      description: "Inicia quando um botão específico é clicado",
      icon: MousePointer,
      fields: [{ key: "textoBotao", label: "Texto do botão", type: "text", placeholder: "Quero saber mais" }],
    },
    {
      id: "webhook-externo",
      label: "Webhook externo",
      description: "Inicia via chamada de um sistema externo",
      icon: Webhook,
      fields: [{ key: "url", label: "URL do webhook", type: "text", placeholder: "Gerado automaticamente" }],
    },
    {
      id: "hora-especifica",
      label: "Hora específica",
      description: "Inicia a uma hora agendada",
      icon: CalendarClock,
      fields: [{ key: "hora", label: "Hora", type: "text", placeholder: "09:00" }],
    },
    {
      id: "contacto-segmento",
      label: "Contacto em segmento",
      description: "Inicia quando o contacto entra num segmento",
      icon: Users,
      fields: [{ key: "segmento", label: "Segmento", type: "select", options: MOCK_SEGMENTS }],
    },
  ],
  instagram: [
    {
      id: "comentario-publicacao",
      label: "Comentário em publicação / palavra-chave",
      description: "Inicia quando alguém comenta numa publicação com uma palavra-chave",
      icon: MessageSquareText,
      fields: [
        { key: "publicacao", label: "Publicação", type: "text", placeholder: "URL ou nome da publicação" },
        { key: "palavras", label: "Palavra-chave", type: "text", placeholder: "quero, preço" },
      ],
    },
    {
      id: "mencao-story",
      label: "Menção em story",
      description: "Inicia quando a conta é mencionada num story",
      icon: AtSign,
      fields: [],
    },
    {
      id: "novo-seguidor",
      label: "Novo seguidor",
      description: "Inicia quando alguém começa a seguir a conta",
      icon: UserPlus,
      fields: [],
    },
    {
      id: "resposta-story",
      label: "Resposta a story",
      description: "Inicia quando alguém responde a um story",
      icon: MessageCircleQuestion,
      fields: [],
    },
    {
      id: "dm-palavra-chave",
      label: "DM com palavra-chave",
      description: "Inicia quando chega uma DM com uma palavra-chave",
      icon: Hash,
      fields: [
        { key: "palavras", label: "Palavra-chave", type: "text", placeholder: "info, promo" },
        { key: "sensivelMaiusculas", label: "Sensível a maiúsculas", type: "switch", defaultValue: false },
      ],
    },
    {
      id: "partilha-story",
      label: "Partilha para story",
      description: "Inicia quando alguém partilha a publicação para o story",
      icon: Share2,
      fields: [],
    },
  ],
  email: [
    {
      id: "contacto-segmento",
      label: "Contacto em segmento",
      description: "Inicia quando o contacto entra num segmento",
      icon: Users,
      fields: [{ key: "segmento", label: "Segmento", type: "select", options: MOCK_SEGMENTS }],
    },
    {
      id: "tag-aplicada",
      label: "Etiqueta aplicada",
      description: "Inicia quando uma etiqueta é aplicada ao contacto",
      icon: Tag,
      fields: [{ key: "tag", label: "Etiqueta", type: "select", options: MOCK_TAGS }],
    },
    {
      id: "formulario-submetido",
      label: "Formulário submetido",
      description: "Inicia quando um formulário é submetido",
      icon: FormInput,
      fields: [{ key: "formulario", label: "Formulário", type: "select", options: MOCK_FORMS }],
    },
    {
      id: "data-intervalo",
      label: "Data / intervalo",
      description: "Inicia numa data específica ou em intervalos recorrentes",
      icon: CalendarClock,
      fields: [
        { key: "data", label: "Data", type: "text", placeholder: "AAAA-MM-DD" },
        {
          key: "intervalo",
          label: "Repetir",
          type: "select",
          defaultValue: "nunca",
          options: [
            { value: "nunca", label: "Não repetir" },
            { value: "semanal", label: "Semanalmente" },
            { value: "mensal", label: "Mensalmente" },
          ],
        },
      ],
    },
    {
      id: "link-clicado",
      label: "Link clicado",
      description: "Inicia quando o contacto clica num link do email",
      icon: Link2,
      fields: [{ key: "url", label: "URL do link", type: "text", placeholder: "https://..." }],
    },
    {
      id: "email-aberto",
      label: "Email aberto / não aberto",
      description: "Inicia consoante a abertura (ou não) de um email anterior",
      icon: MailOpen,
      fields: [
        {
          key: "condicao",
          label: "Condição",
          type: "select",
          defaultValue: "aberto",
          options: [
            { value: "aberto", label: "Email aberto" },
            { value: "nao-aberto", label: "Email não aberto" },
          ],
        },
        { key: "dias", label: "Dias de espera", type: "number", defaultValue: 3 },
      ],
    },
  ],
};

export function getTriggersForChannel(channel: Channel): FlowTriggerDef[] {
  return TRIGGERS_BY_CHANNEL[channel];
}

export function getTriggerDef(channel: Channel, id: string): FlowTriggerDef | undefined {
  return TRIGGERS_BY_CHANNEL[channel].find((trigger) => trigger.id === id);
}
