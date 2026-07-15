export type PlanSlug = "gratuito" | "pro" | "empresas";

export interface Plan {
  slug: PlanSlug;
  name: string;
  priceMonthly: number | null;
  priceYearly: number | null;
  isCustomPrice: boolean;
  tagline: string;
  features: string[];
  limits: {
    contacts: string;
    channels: string;
    flows: string;
  };
  highlighted?: boolean;
}

export const PLANS: Plan[] = [
  {
    slug: "gratuito",
    name: "Gratuito",
    priceMonthly: 0,
    priceYearly: 0,
    isCustomPrice: false,
    tagline: "Para começar a automatizar sem custos.",
    features: ["Até 500 contactos", "1 canal (WhatsApp ou Instagram)", "3 fluxos activos", "Analytics básico", "Sem broadcasts"],
    limits: { contacts: "500 contactos", channels: "1 canal", flows: "3 fluxos" },
  },
  {
    slug: "pro",
    name: "Pro",
    priceMonthly: 29,
    priceYearly: 290,
    isCustomPrice: false,
    tagline: "Para negócios que querem escalar a automação.",
    features: [
      "Contactos ilimitados",
      "WhatsApp + Instagram + Email",
      "Fluxos ilimitados",
      "Broadcasts e sequências",
      "Analytics completo",
      "Suporte prioritário",
      "Respostas com IA",
    ],
    limits: { contacts: "Ilimitados", channels: "WhatsApp + Instagram + Email", flows: "Ilimitados" },
    highlighted: true,
  },
  {
    slug: "empresas",
    name: "Empresas",
    priceMonthly: null,
    priceYearly: null,
    isCustomPrice: true,
    tagline: "Para equipas com necessidades à medida.",
    features: ["Tudo do Pro", "Multi-utilizador (equipa)", "API própria", "Onboarding dedicado", "SLA garantido"],
    limits: { contacts: "Ilimitados", channels: "Todos + API", flows: "Ilimitados" },
  },
];
