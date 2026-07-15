import type { LucideIcon } from "lucide-react";
import {
  Sheet,
  NotebookText,
  CalendarClock,
  CreditCard,
  ShoppingBag,
  ShoppingBasket,
  Webhook,
  Code,
  Zap,
  Repeat,
  Wallet,
  Briefcase,
} from "lucide-react";

export type IntegrationStatus = "ligado" | "nao-ligado" | "brevemente";

export interface Integration {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: IntegrationStatus;
  configFieldLabel: string;
  configFieldPlaceholder: string;
}

export const INTEGRATIONS: Integration[] = [
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Sincroniza contactos e respostas de fluxos automaticamente numa folha de cálculo.",
    icon: Sheet,
    status: "ligado",
    configFieldLabel: "ID da folha de cálculo",
    configFieldPlaceholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  },
  {
    id: "notion",
    name: "Notion",
    description: "Cria e atualiza páginas na tua base de dados do Notion a partir de conversas.",
    icon: NotebookText,
    status: "nao-ligado",
    configFieldLabel: "Chave de integração",
    configFieldPlaceholder: "secret_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Permite agendar reuniões diretamente a partir de conversas de WhatsApp ou email.",
    icon: CalendarClock,
    status: "nao-ligado",
    configFieldLabel: "URL do Calendly",
    configFieldPlaceholder: "https://calendly.com/a-tua-empresa",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Recebe pagamentos e envia recibos automáticos através dos teus fluxos.",
    icon: CreditCard,
    status: "ligado",
    configFieldLabel: "Chave secreta da API",
    configFieldPlaceholder: "sk_live_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "shopify",
    name: "Shopify",
    description: "Sincroniza encomendas e clientes da tua loja Shopify com a plataforma.",
    icon: ShoppingBag,
    status: "nao-ligado",
    configFieldLabel: "Domínio da loja",
    configFieldPlaceholder: "a-tua-loja.myshopify.com",
  },
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Liga a tua loja WordPress para automatizar notificações de encomendas.",
    icon: ShoppingBasket,
    status: "nao-ligado",
    configFieldLabel: "URL da loja",
    configFieldPlaceholder: "https://a-tua-loja.pt",
  },
  {
    id: "webhook",
    name: "Webhook personalizado",
    description: "Envia eventos da plataforma para qualquer sistema externo em tempo real.",
    icon: Webhook,
    status: "ligado",
    configFieldLabel: "URL do webhook",
    configFieldPlaceholder: "https://api.a-tua-app.com/webhooks/fluxo",
  },
  {
    id: "api-propria",
    name: "API própria da plataforma",
    description: "Gera uma chave de API para integrar o Fluxo com os teus sistemas internos.",
    icon: Code,
    status: "ligado",
    configFieldLabel: "Nome da chave",
    configFieldPlaceholder: "Ex.: Integração interna CRM",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Conecta o Fluxo a mais de 6000 aplicações através de automações Zapier.",
    icon: Zap,
    status: "nao-ligado",
    configFieldLabel: "Chave de API Zapier",
    configFieldPlaceholder: "zap_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "make",
    name: "Make",
    description: "Cria cenários avançados de automação entre o Fluxo e outras ferramentas.",
    icon: Repeat,
    status: "nao-ligado",
    configFieldLabel: "URL do webhook Make",
    configFieldPlaceholder: "https://hook.eu1.make.com/xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "cardnexo",
    name: "CardNexo",
    description: "Gestão de cartões de fidelização e recompensas integrada com os teus fluxos.",
    icon: Wallet,
    status: "brevemente",
    configFieldLabel: "Chave da API CardNexo",
    configFieldPlaceholder: "cn_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
  {
    id: "gestorpro",
    name: "GestorPro",
    description: "Sincroniza dados de faturação e clientes com o software de gestão GestorPro.",
    icon: Briefcase,
    status: "brevemente",
    configFieldLabel: "Chave da API GestorPro",
    configFieldPlaceholder: "gp_xxxxxxxxxxxxxxxxxxxxxxxx",
  },
];
