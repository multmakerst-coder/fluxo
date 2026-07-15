import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

// Abre o portal de faturação da Stripe (gestão de método de pagamento, faturas e
// cancelamento) para o workspace autenticado.
export async function POST(request: NextRequest) {
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

  const { data: profile } = await supabase.from("profiles").select("id, owner_id").eq("id", user.id).single();
  const clientId = profile?.owner_id ?? profile?.id ?? user.id;

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("client_id", clientId)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json({ error: "Ainda não tens uma subscrição paga associada" }, { status: 404 });
  }

  let stripe;
  try {
    stripe = getStripe();
  } catch (error) {
    console.error("Stripe indisponível:", error);
    return NextResponse.json({ error: "Pagamentos indisponíveis de momento" }, { status: 503 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin;

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${appUrl}/dashboard/configuracoes/faturacao`,
    });
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.error("Erro ao criar sessão do portal da Stripe:", error);
    return NextResponse.json({ error: "Erro ao abrir o portal de faturação" }, { status: 500 });
  }
}
