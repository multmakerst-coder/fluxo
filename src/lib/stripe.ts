import Stripe from "stripe";

let stripeClient: Stripe | null = null;

// Cliente Stripe partilhado (lazy, para não rebentar em build/import se a chave não
// estiver configurada em ambientes de desenvolvimento sem Stripe ligado).
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY não está configurada");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeClient;
}

// Mapeia plano + periodicidade para o respetivo Price ID da Stripe (configurado via env).
// Só o plano "pro" tem checkout self-service — "gratuito" não precisa de pagamento e
// "empresas" é vendido por contacto comercial (ver /contacto).
export function resolveStripePriceId(planSlug: string, interval: "monthly" | "yearly"): string | null {
  if (planSlug === "pro") {
    return interval === "yearly"
      ? (process.env.STRIPE_PRICE_PRO_YEARLY ?? null)
      : (process.env.STRIPE_PRICE_PRO_MONTHLY ?? null);
  }
  return null;
}
