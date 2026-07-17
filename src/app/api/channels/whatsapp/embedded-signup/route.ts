import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Endpoint que conclui o WhatsApp Embedded Signup da Meta: recebe o código de
// autorização devolvido pelo popup "Continuar com Facebook" e troca-o por um
// token de acesso, sem que o cliente precise de ir ao Meta Business Suite
// copiar manualmente o Phone Number ID / token.
//
// Requer que a app Meta (developers.facebook.com) tenha o produto WhatsApp
// ativado com "Embedded Signup" configurado (Configuration ID), e as variáveis
// de ambiente NEXT_PUBLIC_META_APP_ID, NEXT_PUBLIC_META_WHATSAPP_CONFIG_ID e
// META_APP_SECRET definidas. Sem isso, o endpoint devolve 503 e a UI mantém a
// ligação manual (inserir Phone Number ID + token) como alternativa.

const GRAPH_VERSION = "v21.0";

const bodySchema = z.object({
  code: z.string().min(1, "Código de autorização em falta"),
  wabaId: z.string().min(1, "WABA ID em falta"),
  phoneNumberId: z.string().min(1, "Phone Number ID em falta"),
});

async function resolveClientId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("id, owner_id").eq("id", user.id).single();
  return profile?.owner_id ?? profile?.id ?? user.id;
}

export async function POST(request: NextRequest) {
  const appId = process.env.NEXT_PUBLIC_META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    return NextResponse.json(
      {
        error:
          "A ligação por Facebook ainda não está configurada neste ambiente (faltam META_APP_ID/META_APP_SECRET). Usa a ligação manual por agora.",
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo do pedido inválido" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.issues }, { status: 400 });
  }
  const { code, wabaId, phoneNumberId } = parsed.data;

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível:", error);
    return NextResponse.json({ error: "Serviço indisponível" }, { status: 503 });
  }

  const clientId = await resolveClientId(supabase);
  if (!clientId) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    // 1) Troca o código de autorização (devolvido pelo popup FB.login) por um
    //    token de acesso. Este fluxo específico do Embedded Signup não usa
    //    redirect_uri (o código já foi gerado dentro do popup JS SDK).
    const tokenUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
    tokenUrl.searchParams.set("client_id", appId);
    tokenUrl.searchParams.set("client_secret", appSecret);
    tokenUrl.searchParams.set("code", code);

    const tokenResponse = await fetch(tokenUrl.toString());
    const tokenBody = await tokenResponse.json();
    if (!tokenResponse.ok || !tokenBody?.access_token) {
      console.error("Erro ao trocar código por token (WhatsApp Embedded Signup):", tokenBody);
      throw new Error("Não foi possível validar a autorização com a Meta.");
    }
    let accessToken = tokenBody.access_token as string;

    // 2) Troca por um token de longa duração (~60 dias). Para validade
    //    permanente em produção, recomenda-se migrar depois para um token de
    //    System User gerado no Meta Business Manager.
    try {
      const longLivedUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`);
      longLivedUrl.searchParams.set("grant_type", "fb_exchange_token");
      longLivedUrl.searchParams.set("client_id", appId);
      longLivedUrl.searchParams.set("client_secret", appSecret);
      longLivedUrl.searchParams.set("fb_exchange_token", accessToken);
      const longLivedResponse = await fetch(longLivedUrl.toString());
      const longLivedBody = await longLivedResponse.json();
      if (longLivedResponse.ok && longLivedBody?.access_token) {
        accessToken = longLivedBody.access_token as string;
      }
    } catch (error) {
      console.error("Erro ao trocar por token de longa duração (não bloqueante):", error);
    }

    // 3) Subscreve a app aos webhooks da WABA ligada, para receber mensagens/estados.
    await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${wabaId}/subscribed_apps`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    }).catch((error) => console.error("Erro ao subscrever webhooks da WABA (não bloqueante):", error));

    // 4) Obtém o nome verificado e o número visível para mostrar na UI.
    const detailsUrl = new URL(`https://graph.facebook.com/${GRAPH_VERSION}/${phoneNumberId}`);
    detailsUrl.searchParams.set("fields", "display_phone_number,verified_name");
    detailsUrl.searchParams.set("access_token", accessToken);
    const detailsResponse = await fetch(detailsUrl.toString());
    const details = await detailsResponse.json().catch(() => ({}) as Record<string, unknown>);

    // 5) Persiste o canal ligado — os mesmos campos usados pela ligação manual,
    //    para que o resto da app (envio de mensagens, editor de fluxos) funcione
    //    exatamente da mesma forma, seja qual for o método de ligação usado.
    const { data: channel, error } = await supabase
      .from("channels")
      .upsert(
        {
          client_id: clientId,
          type: "whatsapp",
          status: "connected",
          display_name: (details as { verified_name?: string }).verified_name ?? null,
          phone_number: (details as { display_phone_number?: string }).display_phone_number ?? null,
          external_account_id: phoneNumberId,
          access_token_encrypted: accessToken,
          metadata: { waba_id: wabaId, connected_via: "embedded_signup" },
          connected_at: new Date().toISOString(),
        },
        { onConflict: "client_id,type" },
      )
      .select("*")
      .single();

    if (error || !channel) {
      console.error("Erro ao gravar canal WhatsApp:", error);
      throw new Error("Não foi possível guardar a ligação.");
    }

    return NextResponse.json({ channel }, { status: 200 });
  } catch (error) {
    console.error("Erro no Embedded Signup do WhatsApp:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao ligar WhatsApp via Facebook." },
      { status: 500 },
    );
  }
}
