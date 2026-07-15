import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getStripe, resolveStripePriceId } from "@/lib/stripe";

const checkoutSchema = z.object({
  planSlug: z.enum(["pro"]),
  interval: z.enum(["monthly", "yearly"]),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo do pedido inválido" }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }

  const { planSlug, interval } = parsed.data;

  const priceId = resolveStripePriceId(planSlug, interval);
  if (!priceId) {
    return NextResponse.json({ error: "Stripe não está configurado para este plano" }, { status: 503 });
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, owner_id, email, full_name")
    .eq("id", user.id)
    .single();

  const clientId = profile?.owner_id ?? profile?.id ?? user.id;

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("Stripe indisponível:", error);
    return NextResponse.json({ error: "Pagamentos indisponíveis de momento" }, { status: 503 });
  }

  // Reutiliza o customer da Stripe já associado a este workspace, se existir.
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("client_id", clientId)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let customerId = existingSubscription?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? user.email ?? undefined,
      name: profile?.full_name ?? undefined,
      metadata: { clientId },
    });
    customerId = customer.id;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/dashboard/configuracoes/faturacao?checkout=sucesso`,
      cancel_url: `${appUrl}/precos?checkout=cancelado`,
      metadata: { clientId, planSlug },
      subscription_data: { metadata: { clientId, planSlug } },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Erro ao criar sessão de checkout da Stripe:", error);
    return NextResponse.json({ error: "Erro ao iniciar o checkout" }, { status: 500 });
  }
}
