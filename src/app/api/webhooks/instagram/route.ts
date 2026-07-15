import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyMetaSignature } from "@/lib/api/verify-signature";
import { findActiveFlowForTrigger, runFlowForContact } from "@/lib/flow-engine";

// ---------------------------------------------------------------------------
// Tipos mínimos do payload do Instagram Graph API (Meta)
// Cobrem dois formatos de evento: mensagens diretas (messaging) e
// comentários/menções (changes, campo "comments" ou "mentions").
// ---------------------------------------------------------------------------
interface InstagramMessagingEvent {
  sender: { id: string };
  recipient: { id: string };
  timestamp: number;
  message?: { mid: string; text?: string };
}

interface InstagramCommentValue {
  id: string;
  text?: string;
  from?: { id: string; username?: string };
  media?: { id: string };
}

interface InstagramChange {
  field: "comments" | "mentions" | string;
  value: InstagramCommentValue;
}

interface InstagramEntry {
  id: string;
  time?: number;
  messaging?: InstagramMessagingEvent[];
  changes?: InstagramChange[];
}

interface InstagramWebhookPayload {
  object: string;
  entry: InstagramEntry[];
}

// ---------------------------------------------------------------------------
// GET — verificação do webhook (handshake inicial da Meta)
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.META_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// ---------------------------------------------------------------------------
// POST — receção de eventos (DMs, comentários, menções)
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");
  const appSecret = process.env.META_APP_SECRET;

  if (appSecret && !verifyMetaSignature(rawBody, signature, appSecret)) {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 401 });
  }

  let payload: InstagramWebhookPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Payload JSON inválido" }, { status: 400 });
  }

  try {
    await processInstagramPayload(payload);
  } catch (error) {
    console.error("Erro ao processar webhook do Instagram:", error);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}

async function processInstagramPayload(payload: InstagramWebhookPayload) {
  if (payload.object !== "instagram") return;

  let supabase;
  try {
    supabase = await createClient();
  } catch (error) {
    console.error("Supabase indisponível ao processar webhook do Instagram:", error);
    return;
  }

  for (const entry of payload.entry ?? []) {
    // DMs
    for (const event of entry.messaging ?? []) {
      if (!event.message?.text) continue;
      try {
        await handleInboundEvent(supabase, {
          externalContactId: event.sender.id,
          content: event.message.text,
          externalMessageId: event.message.mid,
          kind: "dm",
        });
      } catch (error) {
        console.error("Erro ao gravar DM do Instagram:", error);
      }
    }

    // Comentários / menções
    for (const change of entry.changes ?? []) {
      if (change.field !== "comments" && change.field !== "mentions") continue;
      const value = change.value;
      if (!value?.from?.id) continue;
      try {
        await handleInboundEvent(supabase, {
          externalContactId: value.from.id,
          content: value.text ?? `[${change.field}]`,
          externalMessageId: value.id,
          contactUsername: value.from.username,
          kind: "comment",
        });
      } catch (error) {
        console.error("Erro ao gravar comentário/menção do Instagram:", error);
      }
    }
  }
}

async function handleInboundEvent(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    externalContactId: string;
    content: string;
    externalMessageId: string;
    contactUsername?: string;
    kind: "dm" | "comment";
  },
) {
  const { externalContactId, content, contactUsername, kind } = params;

  // Instagram não fornece número de telefone; usa-se o ID externo do IG como
  // referência única do contacto (guardado em `notes` por falta de coluna dedicada
  // no schema atual — em produção adicionar `external_id` a `contacts`).
  const { data: existingContact } = await supabase
    .from("contacts")
    .select("id, client_id")
    .eq("notes", `instagram:${externalContactId}`)
    .maybeSingle();

  let contactId: string | undefined = existingContact?.id;
  let clientId: string | undefined = existingContact?.client_id;

  if (!contactId) {
    const { data: channel } = await supabase
      .from("channels")
      .select("client_id")
      .eq("type", "instagram")
      .maybeSingle();

    clientId = channel?.client_id;
    if (!clientId) return;

    const { data: newContact } = await supabase
      .from("contacts")
      .insert({
        client_id: clientId,
        name: contactUsername ?? externalContactId,
        source_channel: "instagram",
        notes: `instagram:${externalContactId}`,
        last_contact_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    contactId = newContact?.id;
  }

  if (!contactId || !clientId) return;

  const { data: existingConversation } = await supabase
    .from("conversations")
    .select("id")
    .eq("contact_id", contactId)
    .eq("channel", "instagram")
    .eq("status", "open")
    .maybeSingle();

  let conversationId: string | undefined = existingConversation?.id;

  if (!conversationId) {
    const { data: newConversation } = await supabase
      .from("conversations")
      .insert({
        client_id: clientId,
        contact_id: contactId,
        channel: "instagram",
        status: "open",
        last_message_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    conversationId = newConversation?.id;
  }

  if (!conversationId) return;

  // Idempotência best-effort — ver comentário equivalente no webhook do WhatsApp
  // sobre a ausência de `external_id` na tabela `messages`.
  const { data: duplicate } = await supabase
    .from("messages")
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("direction", "inbound")
    .eq("content", content)
    .gte("created_at", new Date(Date.now() - 60_000).toISOString())
    .maybeSingle();

  if (duplicate) return;

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    direction: "inbound",
    sender_type: "contact",
    content,
  });

  await supabase
    .from("conversations")
    .update({ last_message_at: new Date().toISOString() })
    .eq("id", conversationId);

  // Motor de automação: DMs despoletam fluxos "dm-palavra-chave"; comentários/menções
  // despoletam fluxos "comentario-publicacao".
  try {
    const triggerTypes = kind === "dm" ? ["dm-palavra-chave"] : ["comentario-publicacao"];
    const flow = await findActiveFlowForTrigger({
      supabase,
      clientId,
      channel: "instagram",
      triggerTypes,
      messageText: content,
    });

    if (flow) {
      const { data: contactRow } = await supabase.from("contacts").select("*").eq("id", contactId).single();
      if (contactRow) {
        await runFlowForContact({
          supabase,
          flow,
          contact: contactRow,
          nodes: Array.isArray(flow.nodes) ? flow.nodes : [],
          edges: Array.isArray(flow.edges) ? flow.edges : [],
          deliver: true,
        });
        await supabase
          .from("flows")
          .update({ activations_count: (flow.activations_count ?? 0) + 1 })
          .eq("id", flow.id);
      }
    }
  } catch (error) {
    console.error("Erro ao executar fluxo automático (Instagram):", error);
  }
}
