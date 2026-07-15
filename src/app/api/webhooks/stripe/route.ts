import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

// Webhook da Stripe — mantém a tabela `subscriptions` sincronizada com o estado real
// da subscrição (criação via Checkout, renovações, alterações de plano, cancelamentos).
// A verificação de assinatura usa o SDK oficial da Stripe (`stripe.webhooks.constructEvent`).
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("Stripe indisponível ao processar webhook:", error);
    return NextResponse.json({ error: "Stripe indisponível" }, { status: 503 });
  }

  let event: Stripe.Event;
  if (webhookSecret && signature) {
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (error) {
      console.error("Assinatura de webhook da Stripe inválida:", error);
      return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
    }
  } else {
    // Sem secret configurado (ex: desenvolvimento local sem `stripe listen`) — aceita o
    // payload tal como está, para não bloquear testes locais.
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Payload JSON inválido" }, { status: 400 });
    }
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível ao processar webhook da Stripe:", error);
    return NextResponse.json({ received: true }, { status: 200 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const clientId = session.metadata?.clientId;
        const planSlug = session.metadata?.planSlug;
        if (clientId && session.subscription && typeof session.subscription === "string") {
          const subscription = await stripe.subscriptions.retrieve(session.subscription);
          await upsertSubscription(supabase, clientId, planSlug, subscription, String(session.customer));
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;
        const clientId = subscription.metadata?.clientId;
        const planSlug = subscription.metadata?.planSlug;
        if (clientId) {
          await upsertSubscription(supabase, clientId, planSlug, subscription, String(subscription.customer));
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId =
          typeof invoice.parent?.subscription_details?.subscription === "string"
            ? invoice.parent.subscription_details.subscription
            : undefined;
        if (subscriptionId) {
          await supabase.from("subscriptions").update({ status: "active" }).eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }

      default:
        break;
    }
  } catch (error) {
    console.error("Erro ao processar evento de webhook da Stripe:", error);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

const STRIPE_TO_DB_STATUS: Record<string, string> = {
  trialing: "trialing",
  active: "active",
  past_due: "past_due",
  unpaid: "past_due",
  canceled: "canceled",
  incomplete: "trialing",
  incomplete_expired: "canceled",
  paused: "canceled",
};

async function upsertSubscription(
  supabase: Awaited<ReturnType<typeof createClient>>,
  clientId: string,
  planSlug: string | undefined,
  subscription: Stripe.Subscription,
  customerId: string,
) {
  let planId: string | undefined;
  if (planSlug) {
    const { data: plan } = await supabase.from("plans").select("id").eq("slug", planSlug).maybeSingle();
    planId = plan?.id;
  }

  const status = STRIPE_TO_DB_STATUS[subscription.status] ?? "active";
  const currentPeriodEnd = subscription.items.data[0]?.current_period_end;

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, plan_id")
    .eq("client_id", clientId)
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    client_id: clientId,
    status,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    current_period_end: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : null,
    cancel_at_period_end: subscription.cancel_at_period_end,
  };
  if (planId) payload.plan_id = planId;

  if (existing) {
    await supabase.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    if (!payload.plan_id) {
      // sem plano resolvido não é possível inserir (coluna not-null) — só atualiza se já existir
      return;
    }
    await supabase.from("subscriptions").insert(payload);
  }
}
