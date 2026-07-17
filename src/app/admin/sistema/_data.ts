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
  { id: "meta-whatsapp", name: "Meta WhatsApp Business API", status: "operacional", latencyMs: 0, uptime: 100, lastCheck: new Date().toISOString() },
  { id: "instagram", name: "Instagram Messaging API", status: "operacional", latencyMs: 0, uptime: 100, lastCheck: new Date().toISOString() },
  { id: "resend", name: "Resend (Email)", status: "operacional", latencyMs: 0, uptime: 100, lastCheck: new Date().toISOString() },
  { id: "stripe", name: "Stripe (Pagamentos)", status: "operacional", latencyMs: 0, uptime: 100, lastCheck: new Date().toISOString() },
];

export type LogSeverity = "erro" | "aviso";

export interface ErrorLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
  severity: LogSeverity;
}

export const ERROR_LOGS: ErrorLog[] = [];

export interface ResponseTimePoint {
  hour: string;
  whatsapp: number;
  instagram: number;
  email: number;
}

export const RESPONSE_TIME_DATA: ResponseTimePoint[] = [];

export const DB_USAGE = {
  usedGB: 0.01,
  totalGB: 50,
  get percentage() {
    return Math.round((this.usedGB / this.totalGB) * 100);
  },
  tables: [
    { name: "messages", sizeGB: 0.0 },
    { name: "contacts", sizeGB: 0.0 },
    { name: "flows", sizeGB: 0.0 },
    { name: "clients", sizeGB: 0.0 },
    { name: "outros", sizeGB: 0.01 },
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
  { id: "q-whatsapp-out", name: "WhatsApp — envio de mensagens", pending: 0, status: "em espera", lastProcessed: new Date().toISOString() },
  { id: "q-instagram-out", name: "Instagram — envio de mensagens", pending: 0, status: "em espera", lastProcessed: new Date().toISOString() },
  { id: "q-email-out", name: "Email — envio transacional", pending: 0, status: "em espera", lastProcessed: new Date().toISOString() },
  { id: "q-flows", name: "Execução de fluxos automatizados", pending: 0, status: "em espera", lastProcessed: new Date().toISOString() },
  { id: "q-broadcasts", name: "Broadcasts agendados", pending: 0, status: "em espera", lastProcessed: new Date().toISOString() },
];

export const totalPendingMessages = 0;
