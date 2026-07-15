function seeded(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export type ApiStatus = "operacional" | "degradado" | "em baixo";

export interface ApiHealth {
  id: string;
  name: string;
  status: ApiStatus;
  latencyMs: number;
  uptime: number;
  lastCheck: string;
}

export const API_STATUSES: ApiHealth[] = [
  { id: "meta-whatsapp", name: "Meta WhatsApp Business API", status: "operacional", latencyMs: 320, uptime: 99.95, lastCheck: "2026-07-15T11:58:00" },
  { id: "instagram", name: "Instagram Messaging API", status: "degradado", latencyMs: 1840, uptime: 98.2, lastCheck: "2026-07-15T11:57:00" },
  { id: "resend", name: "Resend (Email)", status: "operacional", latencyMs: 180, uptime: 99.99, lastCheck: "2026-07-15T11:58:30" },
  { id: "stripe", name: "Stripe (Pagamentos)", status: "operacional", latencyMs: 210, uptime: 100, lastCheck: "2026-07-15T11:59:00" },
];

export type LogSeverity = "erro" | "aviso";

export interface ErrorLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  severity: LogSeverity;
}

export const ERROR_LOGS: ErrorLog[] = [
  { id: "log-1", timestamp: "2026-07-15T09:12:04", type: "meta_rate_limit", message: "Limite de taxa atingido para o webhook do WhatsApp (cliente cli-005).", severity: "erro" },
  { id: "log-2", timestamp: "2026-07-15T07:40:11", type: "email_delivery_failed", message: "Falha na entrega de 12 emails transacionais via Resend.", severity: "erro" },
  { id: "log-3", timestamp: "2026-07-14T22:05:47", type: "instagram_latency", message: "Latência elevada (8.2s) na receção de mensagens do Instagram.", severity: "aviso" },
  { id: "log-4", timestamp: "2026-07-14T18:22:03", type: "stripe_webhook_retry", message: "Webhook do Stripe reenviado após timeout (invoice.payment_succeeded).", severity: "aviso" },
  { id: "log-5", timestamp: "2026-07-14T15:03:19", type: "flow_execution_error", message: "Erro na execução do fluxo \"Recuperação de carrinho\" (cliente cli-012).", severity: "erro" },
  { id: "log-6", timestamp: "2026-07-14T11:47:52", type: "db_connection_pool", message: "Pool de ligações à base de dados perto do limite (92%).", severity: "aviso" },
  { id: "log-7", timestamp: "2026-07-13T20:15:38", type: "meta_webhook_signature", message: "Assinatura de webhook inválida recebida da Meta — pedido ignorado.", severity: "erro" },
];

export interface ResponseTimePoint {
  hour: string;
  whatsapp: number;
  instagram: number;
  email: number;
}

export const RESPONSE_TIME_DATA: ResponseTimePoint[] = Array.from({ length: 12 }).map((_, i) => ({
  hour: `${String(i * 2).padStart(2, "0")}:00`,
  whatsapp: Math.round(250 + seeded(i + 1) * 200),
  instagram: Math.round(900 + seeded(i + 20) * 1200),
  email: Math.round(120 + seeded(i + 40) * 150),
}));

export const DB_USAGE = {
  usedGB: 34.6,
  totalGB: 50,
  get percentage() {
    return Math.round((this.usedGB / this.totalGB) * 100);
  },
  tables: [
    { name: "messages", sizeGB: 18.2 },
    { name: "contacts", sizeGB: 8.1 },
    { name: "flows", sizeGB: 3.4 },
    { name: "clients", sizeGB: 2.9 },
    { name: "outros", sizeGB: 2.0 },
  ],
};

export type QueueStatus = "a processar" | "em espera" | "com falhas";

export interface MessageQueue {
  id: string;
  name: string;
  pending: number;
  status: QueueStatus;
  lastProcessed: string;
}

export const MESSAGE_QUEUES: MessageQueue[] = [
  { id: "q-whatsapp-out", name: "WhatsApp — envio de mensagens", pending: 42, status: "a processar", lastProcessed: "2026-07-15T11:59:10" },
  { id: "q-instagram-out", name: "Instagram — envio de mensagens", pending: 187, status: "com falhas", lastProcessed: "2026-07-15T11:51:22" },
  { id: "q-email-out", name: "Email — envio transacional", pending: 6, status: "a processar", lastProcessed: "2026-07-15T11:59:40" },
  { id: "q-flows", name: "Execução de fluxos automatizados", pending: 23, status: "em espera", lastProcessed: "2026-07-15T11:58:02" },
  { id: "q-broadcasts", name: "Broadcasts agendados", pending: 3, status: "em espera", lastProcessed: "2026-07-15T11:40:00" },
];

export const totalPendingMessages = MESSAGE_QUEUES.reduce((sum, q) => sum + q.pending, 0);
